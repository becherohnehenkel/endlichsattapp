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

describe('GET /api/admin/off-search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_EMAIL = 'admin@test.com'
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=quark'))
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'other@example.com' } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=quark'))
    expect(res.status).toBe(403)
  })

  it('returns empty array for missing query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results).toEqual([])
  })

  it('returns empty array for query shorter than 2 chars', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=a'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results).toEqual([])
  })

  it('calls DE OFF first and returns results', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockFetch.mockResolvedValueOnce(makeOFFResponse([VALID_PRODUCT]))

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=protein'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results).toHaveLength(1)
    expect(data.results[0].product_name).toBe('Ehrmann High Protein Pudding')
    expect(data.results[0].per100g.kcal).toBe(91)
    expect(data.results[0].per100g.protein_g).toBe(11)
    // Should only call DE endpoint
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch.mock.calls[0][0]).toContain('de.openfoodfacts.org')
  })

  it('falls back to world.openfoodfacts.org when DE returns no results', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    // DE: empty
    mockFetch.mockResolvedValueOnce(makeOFFResponse([]))
    // World: has result
    mockFetch.mockResolvedValueOnce(makeOFFResponse([VALID_PRODUCT]))

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=protein'))
    const data = await res.json()
    expect(data.results).toHaveLength(1)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch.mock.calls[1][0]).toContain('world.openfoodfacts.org')
  })

  it('filters out products without nutriments', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockFetch.mockResolvedValueOnce(makeOFFResponse([
      { product_name: 'Ohne Nährwerte' },
      VALID_PRODUCT,
    ]))

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=test'))
    const data = await res.json()
    expect(data.results).toHaveLength(1)
    expect(data.results[0].product_name).toBe('Ehrmann High Protein Pudding')
  })

  it('filters out products where kcal and protein are both 0', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockFetch.mockResolvedValueOnce(makeOFFResponse([
      {
        product_name: 'Leeres Produkt',
        nutriments: { 'energy-kcal_100g': 0, 'proteins_100g': 0 },
      },
      VALID_PRODUCT,
    ]))

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=test'))
    const data = await res.json()
    expect(data.results).toHaveLength(1)
    expect(data.results[0].product_name).toBe('Ehrmann High Protein Pudding')
  })

  it('returns at most 5 results', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const manyProducts = Array.from({ length: 8 }, (_, i) => ({
      product_name: `Produkt ${i + 1}`,
      nutriments: { 'energy-kcal_100g': 100, 'proteins_100g': 5 },
    }))
    mockFetch.mockResolvedValueOnce(makeOFFResponse(manyProducts))

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=produkt'))
    const data = await res.json()
    expect(data.results).toHaveLength(5)
  })

  it('returns empty array on fetch failure', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=test'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results).toEqual([])
  })

  it('uses product_name fallback when product has no name', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockFetch.mockResolvedValueOnce(makeOFFResponse([{
      product_name: '',
      nutriments: { 'energy-kcal_100g': 50, 'proteins_100g': 3 },
    }]))

    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/admin/off-search?q=test'))
    const data = await res.json()
    expect(data.results[0].product_name).toBe('test')
  })
})
