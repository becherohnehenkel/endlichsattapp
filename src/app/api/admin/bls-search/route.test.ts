import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockLimit = vi.fn()
const mockIlike = vi.fn(() => ({ limit: mockLimit }))
const mockSelect = vi.fn(() => ({ ilike: mockIlike }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}))

function makeRow(name_de: string, overrides: Partial<Record<string, number>> = {}) {
  return {
    bls_code: name_de.replace(/\s+/g, '-').toLowerCase(),
    name_de,
    kcal_100g: overrides.kcal_100g ?? 100,
    protein_g_100g: overrides.protein_g_100g ?? 10,
    fat_g_100g: overrides.fat_g_100g ?? 5,
    carbs_g_100g: overrides.carbs_g_100g ?? 20,
    fiber_g_100g: overrides.fiber_g_100g ?? 2,
    sugar_g_100g: overrides.sugar_g_100g ?? 3,
  }
}

describe('GET /api/admin/bls-search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIlike.mockReturnValue({ limit: mockLimit })
    mockSelect.mockReturnValue({ ilike: mockIlike })
    mockFrom.mockReturnValue({ select: mockSelect })
    process.env.ADMIN_EMAIL = 'admin@test.com'
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=milch'))
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'other@example.com' } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=milch'))
    expect(res.status).toBe(403)
  })

  it('returns empty results for missing query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search'))
    const data = await res.json()
    expect(data.results).toEqual([])
    expect(data.total).toBe(0)
  })

  it('returns empty results for query shorter than 2 chars', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=a'))
    const data = await res.json()
    expect(data.results).toEqual([])
    expect(data.total).toBe(0)
  })

  // PROJ-29: bisher fix limit(8), jetzt Seiten zu 20 mit Gesamtzahl für den "X von Y"-Hinweis
  it('returns the first 20 results and the total count on the first page', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const rows = Array.from({ length: 35 }, (_, i) => makeRow(`Testlebensmittel ${String(i).padStart(2, '0')}`))
    mockLimit.mockResolvedValue({ data: rows, count: 35, error: null })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=test'))
    const data = await res.json()
    expect(data.results).toHaveLength(20)
    expect(data.total).toBe(35)
  })

  it('returns the next page when offset is provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const rows = Array.from({ length: 35 }, (_, i) => makeRow(`Testlebensmittel ${String(i).padStart(2, '0')}`))
    mockLimit.mockResolvedValue({ data: rows, count: 35, error: null })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=test&offset=20'))
    const data = await res.json()
    expect(data.results).toHaveLength(15)
    expect(data.total).toBe(35)
    // Erste Zeile der zweiten Seite muss direkt an die letzte Zeile der ersten Seite anschließen
    expect(data.results[0].name_de).toBe('Testlebensmittel 20')
  })

  it('sorts prefix matches first, consistently across pages', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const rows = [
      makeRow('Vollmilch frisch'),
      makeRow('Kakao mit Milch'),
      makeRow('Milchreis'),
      makeRow('Buttermilch'),
    ]
    mockLimit.mockResolvedValue({ data: rows, count: rows.length, error: null })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=milch'))
    const data = await res.json()
    // Präfix-Treffer ("Milch...") zuerst, dann alphabetisch die Nicht-Präfix-Treffer
    expect(data.results.map((r: { name_de: string }) => r.name_de)).toEqual([
      'Milchreis',
      'Buttermilch',
      'Kakao mit Milch',
      'Vollmilch frisch',
    ])
  })

  it('caps the reported total at the candidate pool limit even if the DB count is higher', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockLimit.mockResolvedValue({ data: [makeRow('Irgendwas')], count: 5000, error: null })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=irgend'))
    const data = await res.json()
    expect(data.total).toBe(300)
  })

  it('returns empty results on a database error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockLimit.mockResolvedValue({ data: null, count: null, error: { message: 'db error' } })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=test'))
    const data = await res.json()
    expect(data.results).toEqual([])
    expect(data.total).toBe(0)
  })

  it('includes fiber in the returned per100g data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockLimit.mockResolvedValue({ data: [makeRow('Testlebensmittel', { fiber_g_100g: 4.2 })], count: 1, error: null })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=test'))
    const data = await res.json()
    expect(data.results[0].per100g.fiber_g).toBe(4.2)
  })

  // QA (PROJ-29): Absicherung gegen manipulierte offset-Werte — auth blockt unauthentifizierte
  // Requests bereits (siehe Security-Audit), aber die interne Behandlung muss trotzdem robust
  // sein, falls jemals ein authentifizierter, aber böswilliger Request reinkommt.
  it('clamps a negative offset to 0', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const rows = Array.from({ length: 5 }, (_, i) => makeRow(`Testlebensmittel ${i}`))
    mockLimit.mockResolvedValue({ data: rows, count: 5, error: null })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=test&offset=-100'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results).toHaveLength(5)
  })

  it('treats a non-numeric offset as 0 instead of crashing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const rows = Array.from({ length: 5 }, (_, i) => makeRow(`Testlebensmittel ${i}`))
    mockLimit.mockResolvedValue({ data: rows, count: 5, error: null })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=test&offset=abc'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results).toHaveLength(5)
  })

  it('returns an empty page for an offset far beyond the candidate pool, without crashing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const rows = Array.from({ length: 5 }, (_, i) => makeRow(`Testlebensmittel ${i}`))
    mockLimit.mockResolvedValue({ data: rows, count: 5, error: null })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/bls-search?q=test&offset=999999999'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results).toEqual([])
    expect(data.total).toBe(5)
  })
})
