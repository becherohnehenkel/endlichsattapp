import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockAnalysisSingle = vi.fn()
const mockRecipesSelect = vi.fn()

const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

const MOCK_ANALYSIS = {
  refined_ingredients: {
    ingredients: [
      { name: 'Hähnchenbrust' },
      { name: 'Reis' },
      { name: 'Sojasauce' },
    ],
  },
  meals: { user_id: 'user-1' },
}

const MOCK_RECIPES = [
  { id: 'recipe-1', title: 'Hähnchen Reis Bowl', image_path: null, total_time_minutes: 30, ingredient_tags: ['hähnchen', 'reis', 'sojasauce'] },
  { id: 'recipe-2', title: 'Pasta Bolognese', image_path: null, total_time_minutes: 40, ingredient_tags: ['pasta', 'hackfleisch'] },
  { id: 'recipe-3', title: 'Reis Salat', image_path: null, total_time_minutes: 20, ingredient_tags: ['reis', 'gurke', 'hähnchen'] },
]

describe('GET /api/rezepte/vorschlaege', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'meal_analyses') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: mockAnalysisSingle,
              }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockImplementation(mockRecipesSelect),
      }
    })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/vorschlaege?analysisId=abc'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when analysisId missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/vorschlaege'))
    expect(res.status).toBe(400)
  })

  it('returns empty array when analysis not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockAnalysisSingle.mockResolvedValue({ data: null })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/vorschlaege?analysisId=abc'))
    const data = await res.json()
    expect(data.recipes).toHaveLength(0)
  })

  it('returns the best-matched recipe with ≥2 tag overlap', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockAnalysisSingle.mockResolvedValue({ data: MOCK_ANALYSIS })
    mockRecipesSelect.mockResolvedValue({ data: MOCK_RECIPES })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/vorschlaege?analysisId=abc'))
    const data = await res.json()
    // recipe-1 (3 matches) beats recipe-3 (2 matches); recipe-2 (0 matches) does not qualify
    expect(data.recipes).toHaveLength(1)
    expect(data.recipes[0].id).toBe('recipe-1')
  })

  it('returns max 1 recipe even if more match (PROJ-24)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockAnalysisSingle.mockResolvedValue({ data: MOCK_ANALYSIS })
    const manyRecipes = Array.from({ length: 5 }, (_, i) => ({
      id: `recipe-${i}`,
      title: `Rezept ${i}`,
      image_path: null,
      total_time_minutes: 30,
      ingredient_tags: ['hähnchen', 'reis'],
    }))
    mockRecipesSelect.mockResolvedValue({ data: manyRecipes })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/vorschlaege?analysisId=abc'))
    const data = await res.json()
    expect(data.recipes).toHaveLength(1)
  })

  it('returns empty array when no recipe has ≥2 matching tags', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockAnalysisSingle.mockResolvedValue({ data: MOCK_ANALYSIS })
    mockRecipesSelect.mockResolvedValue({ data: [
      { id: 'r1', title: 'Pasta', image_path: null, total_time_minutes: 20, ingredient_tags: ['pasta'] },
    ] })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/rezepte/vorschlaege?analysisId=abc'))
    const data = await res.json()
    expect(data.recipes).toHaveLength(0)
  })
})
