import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockLimit = vi.fn()
const mockIlike = vi.fn(() => ({ limit: mockLimit }))
const mockSelect = vi.fn(() => ({ ilike: mockIlike }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

function makeRow(name_de: string) {
  return {
    bls_code: name_de.replace(/\s+/g, '-').toLowerCase(),
    name_de,
    kcal_100g: 100,
    protein_g_100g: 10,
    fat_g_100g: 5,
    carbs_g_100g: 20,
    fiber_g_100g: 2,
    sugar_g_100g: 3,
  }
}

// PROJ-32 (Bugfix): nicht-admin-exklusives Gegenstück zu /api/admin/bls-search — reguläre
// Kern-Suchlogik ist dort bereits ausführlich getestet (Sortierung, Paginierung, Offset-
// Robustheit), hier liegt der Fokus auf der abweichenden Auth-Grenze (jeder registrierte
// Nutzer statt nur Admin) plus einem Happy-Path-Sanity-Check.
describe('GET /api/rezepte/bls-search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIlike.mockReturnValue({ limit: mockLimit })
    mockSelect.mockReturnValue({ ilike: mockIlike })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/bls-search?q=milch'))
    expect(res.status).toBe(401)
  })

  it('returns 403 for an anonymous (guest) user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'guest-1', is_anonymous: true } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/bls-search?q=milch'))
    expect(res.status).toBe(403)
  })

  it('allows a regular, non-admin registered user (unlike /api/admin/bls-search)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false, email: 'nicht-admin@example.com' } } })
    mockLimit.mockResolvedValue({ data: [makeRow('Hähnchenbrust')], count: 1, error: null })

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/bls-search?q=huhn'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results[0].name_de).toBe('Hähnchenbrust')
  })

  it('returns empty results for a query shorter than 2 chars', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/bls-search?q=a'))
    const data = await res.json()
    expect(data.results).toEqual([])
    expect(data.total).toBe(0)
  })
})
