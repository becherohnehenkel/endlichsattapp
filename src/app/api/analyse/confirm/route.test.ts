import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockMealSingle = vi.fn()
const mockInsertSingle = vi.fn()
const mockMealsUpdate = vi.fn()
const mockConvUpdate = vi.fn()
const mockStorageRemove = vi.fn()
const mockAnthropicCreate = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'meals') {
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockMealSingle }) }) }),
          update: vi.fn().mockReturnValue({ eq: mockMealsUpdate }),
        }
      }
      if (table === 'meal_analyses') {
        return {
          insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockInsertSingle }) }),
        }
      }
      if (table === 'meal_conversations') {
        return {
          update: vi.fn().mockReturnValue({ eq: mockConvUpdate }),
        }
      }
      return {}
    }),
    storage: {
      from: vi.fn().mockReturnValue({ remove: mockStorageRemove }),
    },
  }),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(function() {
    return { messages: { create: mockAnthropicCreate } }
  }),
}))

// Silence external fetch calls
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

const validIngredients = [{ name: 'Hähnchenbrust', amount: '200g' }]
const validAnalysis = {
  zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g', source: 'usda', sourceName: 'Chicken, raw' }],
  annahmen: [],
  vorher: {
    bausteine: { geschmack: 'mittel', biss: 'gut', ballaststoffe: 'schwach', proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet' },
    gesamtbewertung: 'maessig_saettigend',
    erklaerung: 'Gutes Protein, aber wenig Ballaststoffe.',
    naehrwerte: { kcal: 240, protein_g: 44, kohlenhydrate_g: 0, zucker_g: 0, fett_g: 5, ballaststoffe_g: 0 },
  },
  vorschlaege: [{ aktion: 'Gurken dazugeben', begruendung: 'Mehr Volumen', baustein: 'volumen' }],
  nachher: {
    bausteine: { geschmack: 'mittel', biss: 'gut', ballaststoffe: 'mittel', proteine: 'gut', volumen: 'gut', art_of_eating: 'nicht_bewertet' },
    gesamtbewertung: 'sehr_saettigend',
    naehrwerte: { kcal: 256, protein_g: 44, kohlenhydrate_g: 4, zucker_g: 2, fett_g: 5, ballaststoffe_g: 1 },
    deltas: [{ wert: 'volumen', vorher: 0, nachher: 1, veraenderung: 1 }],
  },
  art_of_eating_tipp: 'Probier mal ohne Handy zu essen.',
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/analyse/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analyse/confirm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing ingredients', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for empty ingredients array', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: [] }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when meal not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))
    expect(res.status).toBe(404)
  })

  it('returns 503 when Claude API is overloaded (529)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Test', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockRejectedValue(Object.assign(new Error('overloaded'), { status: 529 }))

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toContain('überlastet')
  })

  it('returns 500 when Claude returns non-JSON', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Test', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Hier ist deine Analyse: ...' }],
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))
    expect(res.status).toBe(500)
  })

  it('saves analysis and returns result on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Hähnchen', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(validAnalysis) }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-123' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.analysisId).toBe('analysis-123')
    expect(body.result.vorher.gesamtbewertung).toBe('maessig_saettigend')
  })

  it('deletes fullsize photo after analysis', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Test', photo_fullsize_path: 'user-1/abc.jpg' }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(validAnalysis) }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-123' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })
    mockStorageRemove.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))
    expect(mockStorageRemove).toHaveBeenCalledWith(['user-1/abc.jpg'])
  })
})
