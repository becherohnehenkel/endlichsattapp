import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeOFFResponse(products: object[]) {
  return {
    ok: true,
    json: async () => ({ products }),
  }
}

const VALID_PRODUCT = {
  product_name: 'Ehrmann High Protein Pudding',
  nutriments: {
    'energy-kcal_100g': 91,
    'proteins_100g': 11,
    'carbohydrates_100g': 8,
    'sugars_100g': 6,
    'fat_100g': 2,
    'fiber_100g': 0,
  },
}

// PROJ-32 (Bugfix): nicht-admin-exklusives Gegenstück zu /api/admin/off-search — Kern-Suchlogik
// (DE→World-Fallback, Filterung) ist dort bereits getestet, hier liegt der Fokus auf der
// abweichenden Auth-Grenze plus einem Happy-Path-Sanity-Check.
describe('GET /api/rezepte/off-search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/off-search?q=quark'))
    expect(res.status).toBe(401)
  })

  it('returns 403 for an anonymous (guest) user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'guest-1', is_anonymous: true } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/off-search?q=quark'))
    expect(res.status).toBe(403)
  })

  it('allows a regular, non-admin registered user (unlike /api/admin/off-search)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false, email: 'nicht-admin@example.com' } } })
    mockFetch.mockResolvedValue(makeOFFResponse([VALID_PRODUCT]))

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/off-search?q=protein'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results[0].product_name).toBe('Ehrmann High Protein Pudding')
  })

  it('returns empty results for a query shorter than 2 chars', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/off-search?q=a'))
    const data = await res.json()
    expect(data.results).toEqual([])
  })
})
