import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSelectSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(mockSelectSingle),
        }),
      }),
    }),
  }),
}))

const MOCK_RECIPE = {
  id: 'recipe-1',
  title: 'Hähnchen mit Reis',
  image_path: null,
  servings: 2,
  cook_time_minutes: 20,
  total_time_minutes: 30,
  instructions: 'Reis kochen...',
  ingredient_tags: ['hähnchen', 'reis'],
  cuisine_tags: ['asiatisch'],
  recipe_ingredients: [
    { id: 'ing-1', name: 'Hähnchenbrust', amount: 200, unit: 'g', sort_order: 0 },
    { id: 'ing-2', name: 'Reis', amount: 150, unit: 'g', sort_order: 1 },
  ],
}

describe('GET /api/rezepte/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 404 when recipe not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelectSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'unknown' }) })
    expect(res.status).toBe(404)
  })

  it('returns recipe with sorted ingredients', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelectSingle.mockResolvedValue({ data: MOCK_RECIPE, error: null })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('Hähnchen mit Reis')
    expect(data.ingredients).toHaveLength(2)
    expect(data.ingredients[0].name).toBe('Hähnchenbrust')
    expect(data.imageUrl).toBeNull()
  })

  it('constructs image URL when image_path exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelectSingle.mockResolvedValue({
      data: { ...MOCK_RECIPE, image_path: 'abc123.jpg' },
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    const data = await res.json()
    expect(data.imageUrl).toContain('abc123.jpg')
    expect(data.imageUrl).toContain('recipe-images')
  })
})
