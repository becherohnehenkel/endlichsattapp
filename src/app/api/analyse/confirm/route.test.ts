import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockMealSingle = vi.fn()
const mockConvSingle = vi.fn()
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
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockConvSingle }) }),
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
  typ: 'standard',
  zutatenliste: [{ name: 'Hähnchenbrust', amount: '200g', grams: 200 }],
  annahmen: [],
  vorher: {
    bausteine: { geschmack: 'mittel', biss: 'gut', ballaststoffe: 'schwach', proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet' },
    gesamtbewertung: 'maessig_saettigend',
    erklaerung: 'Gutes Protein, aber wenig Ballaststoffe.',
  },
  vorschlaege: [{ aktion: 'Gurken dazugeben', begruendung: 'Mehr Volumen', baustein: 'volumen' }],
  nachher: {
    bausteine: { geschmack: 'mittel', biss: 'gut', ballaststoffe: 'mittel', proteine: 'gut', volumen: 'gut', art_of_eating: 'nicht_bewertet' },
    gesamtbewertung: 'sehr_saettigend',
  },
  art_of_eating_tipp: 'Probier mal ohne Handy zu essen.',
}

const validBeilageAnalysis = {
  typ: 'beilage',
  zutatenliste: [{ name: 'Blattsalat', amount: '100g', grams: 100 }],
  annahmen: ['BEILAGE_KONTEXT: Blattsalat wird als vollständige Mahlzeit gegessen.'],
  beilage: {
    als_beilage_top: 'Als Beilage bringt der Salat Frische und Volumen.',
    als_hauptgericht: 'Allein macht er noch keine sättigende Mahlzeit — es fehlt eine Proteinquelle und Energie.',
    beilage_upgrade: 'Eine Handvoll Sonnenblumenkerne drüber: mehr Biss und sättigende Fette.',
    pairing: [
      { empfehlung: '150g Skyr mit Honig', warum: 'Liefert Protein und hält lange satt.' },
      { empfehlung: '2 weichgekochte Eier', warum: 'Einfach, proteinreich und perfekt zur Frische des Salats.' },
    ],
    art_of_eating_tipp: 'Sitz hin und iss ohne Ablenkung — dann merkst du besser wann du satt bist.',
  },
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/analyse/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analyse/confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConvSingle.mockResolvedValue({ data: { assumptions: [] }, error: null })
  })

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

  it('parses Claude JSON wrapped in markdown code fences', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Test', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n' + JSON.stringify(validAnalysis) + '\n```' }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-123' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))
    expect(res.status).toBe(200)
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

  it('keeps fullsize photo after analysis (PROJ-21: photo retained for display)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Test', photo_fullsize_path: 'user-1/abc.jpg' }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(validAnalysis) }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-123' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))
    expect(mockStorageRemove).not.toHaveBeenCalled()
  })

  // PROJ-16: Beilagen-Kontext tests
  it('returns beilage result when BEILAGE_KONTEXT is in assumptions', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Blattsalat', photo_fullsize_path: null }, error: null })
    mockConvSingle.mockResolvedValue({
      data: { assumptions: ['BEILAGE_KONTEXT: Blattsalat wird als vollständige Mahlzeit gegessen.'] },
      error: null,
    })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(validBeilageAnalysis) }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'beilage-analysis-1' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: [{ name: 'Blattsalat', amount: '100g' }] }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.result.typ).toBe('beilage')
    expect(body.result.beilage.als_beilage_top).toBeTruthy()
    expect(body.result.beilage.pairing).toHaveLength(2)
    expect(body.result).not.toHaveProperty('vorher')
    expect(body.result).not.toHaveProperty('vorschlaege')
  })

  // PROJ-18 FIX-3: system prompt must use prompt caching
  it('FIX-3: Claude is called with cache_control on system prompt', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Test', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(validAnalysis) }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-1' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))

    const createCall = mockAnthropicCreate.mock.calls[0][0]
    expect(Array.isArray(createCall.system)).toBe(true)
    expect(createCall.system[0]).toMatchObject({
      type: 'text',
      cache_control: { type: 'ephemeral' },
    })
  })

  it('skips macro computation for beilage analyses', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Blattsalat', photo_fullsize_path: null }, error: null })
    mockConvSingle.mockResolvedValue({
      data: { assumptions: ['BEILAGE_KONTEXT: Blattsalat wird als vollständige Mahlzeit gegessen.'] },
      error: null,
    })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(validBeilageAnalysis) }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'beilage-analysis-1' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: [{ name: 'Blattsalat', amount: '100g' }] }))
    expect(res.status).toBe(200)
    // Beilage result has no macros
    const body = await res.json()
    expect(body.result).not.toHaveProperty('nachher')
  })
})
