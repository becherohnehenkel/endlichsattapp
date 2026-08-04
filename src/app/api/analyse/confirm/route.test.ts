import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockMealSingle = vi.fn()
const mockConvSingle = vi.fn()
const mockInsertSingle = vi.fn()
const mockMealAnalysesInsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockInsertSingle }) })
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
        return { insert: mockMealAnalysesInsert }
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

  // PROJ-28: Beilagen-Zweig berechnete die Zutaten-Kennzeichnung bisher nicht
  it('computes zutatenQuellen for beilage results too', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Blattsalat mit Yuzu-Paste', photo_fullsize_path: null }, error: null })
    mockConvSingle.mockResolvedValue({
      data: { assumptions: ['BEILAGE_KONTEXT: Blattsalat wird als vollständige Mahlzeit gegessen.'] },
      error: null,
    })
    mockAnthropicCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          ...validBeilageAnalysis,
          zutatenliste: [
            { name: 'Blattsalat', amount: '100g', grams: 100 },
            { name: 'Yuzu-Paste', amount: '20g', grams: 20, naehrwert_geschaetzt: { kcal: 250, protein_g: 1, carbs_g: 60, sugar_g: 55, fat_g: 0, fiber_g: 1 } },
            { name: 'Unbekannte Zutat', amount: '10g', grams: 10 },
          ],
        }),
      }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'beilage-analysis-2' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({
      mealId: '550e8400-e29b-41d4-a716-446655440000',
      ingredients: [{ name: 'Blattsalat', amount: '100g' }, { name: 'Yuzu-Paste', amount: '20g' }, { name: 'Unbekannte Zutat', amount: '10g' }],
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    // Hinweis: BLS/OFF sind in dieser Testumgebung nicht erreichbar (siehe Datei-Kommentar
    // "Silence external fetch calls"), daher landet auch "Blattsalat" ohne eigene Schätzung
    // als 'nicht_schaetzbar' — das spiegelt korrekt wider, dass BLS/OFF hier keinen Treffer
    // liefern können, nicht ein Fehler in der Produktionslogik.
    // Reihenfolge entspricht zutatenliste: [Blattsalat, Yuzu-Paste, Unbekannte Zutat]
    expect(body.result.zutatenQuellen).toEqual(['nicht_schaetzbar', 'schaetzung', 'nicht_schaetzbar'])
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

  // Bugfix 2026-08-04: Rückfragen-Annahmen aus früheren Runden wurden bisher als "WICHTIG —
  // maßgeblich" markiert und standen vor der vom Nutzer zuletzt bestätigten/korrigierten
  // Zutatenliste. Wenn der Nutzer eine Zutat auf dem Bestätigungs-Screen änderte (z.B.
  // Süßkartoffelnudeln → Spaghetti), widersprach die ältere Annahme der Korrektur — Claude
  // übernahm dann die veraltete Annahme statt die Korrektur des Nutzers. Der Prompt muss die
  // zuletzt bestätigte Liste eindeutig als Vorrang-habend markieren.
  it('marks the confirmed ingredient list as authoritative over conflicting QA assumptions', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: null, photo_fullsize_path: null }, error: null })
    mockConvSingle.mockResolvedValue({
      data: { assumptions: ['Süßkartoffel-Spiralnudeln: ca. 275g roh angenommen'] },
      error: null,
    })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(validAnalysis) }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-6' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    await POST(makeRequest({
      mealId: '550e8400-e29b-41d4-a716-446655440000',
      ingredients: [{ name: 'Spaghetti', amount: '275g' }],
    }))

    const createCall = mockAnthropicCreate.mock.calls[0][0]
    const userMessage = createCall.messages[0].content as string
    expect(userMessage.indexOf('Süßkartoffel-Spiralnudeln')).toBeGreaterThan(-1)
    expect(userMessage.indexOf('Spaghetti')).toBeGreaterThan(-1)
    expect(userMessage).toContain('hat sie IMMER Vorrang')
  })

  // Bugfix 2026-08-04 (Folgefix): Der Prompt-Hinweis allein reichte nicht — Claude hat trotz
  // expliziter "hat Vorrang"-Anweisung die vom Nutzer korrigierte Zutat wieder durch die in
  // den Rückfragen-Annahmen beschriebene Zutat ersetzt. Der Name wird jetzt serverseitig
  // erzwungen (positionsgenau mit der bestätigten Liste), unabhängig davon was Claude liefert.
  it('overwrites Claude-returned ingredient names with the user-confirmed names (positional)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: null, photo_fullsize_path: null }, error: null })
    mockConvSingle.mockResolvedValue({
      data: { assumptions: ['Süßkartoffel-Spiralnudeln: ca. 200g gegart angenommen'] },
      error: null,
    })
    mockAnthropicCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          ...validAnalysis,
          // Claude "korrigiert" die vom Nutzer bestätigte Zutat zurück — genau der Bug
          zutatenliste: [{ name: 'Süßkartoffel-Spiralnudeln (gekocht)', amount: 'ca. 200g', grams: 200, naehrwert_geschaetzt: { kcal: 86, protein_g: 1.6, carbs_g: 20, sugar_g: 4.2, fat_g: 0.1, fiber_g: 3 } }],
        }),
      }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-7' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({
      mealId: '550e8400-e29b-41d4-a716-446655440000',
      ingredients: [{ name: 'Spaghetti', amount: '200g' }],
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.result.zutatenliste[0].name).toBe('Spaghetti')

    const insertedPayload = mockMealAnalysesInsert.mock.calls[0][0] as { refined_ingredients: { ingredients: { name: string }[] } }
    expect(insertedPayload.refined_ingredients.ingredients[0].name).toBe('Spaghetti')
  })

  it('keeps Claude-returned names when the ingredient count does not match the confirmed list', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: null, photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          ...validAnalysis,
          zutatenliste: [
            { name: 'Spaghetti', amount: '200g', grams: 200 },
            { name: 'Parmesan', amount: '20g', grams: 20 },
          ],
        }),
      }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-8' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    // Nutzer hat nur 1 Zutat bestätigt, Claude liefert 2 zurück — Längen weichen ab
    const res = await POST(makeRequest({
      mealId: '550e8400-e29b-41d4-a716-446655440000',
      ingredients: [{ name: 'Spaghetti', amount: '200g' }],
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.result.zutatenliste).toHaveLength(2)
    expect(body.result.zutatenliste[1].name).toBe('Parmesan')
  })

  // PROJ-4 (Refinement 2026-08-03): KI-Schätzung für Zutaten ohne BLS/OFF-Treffer
  it('uses a plausible AI-estimated nutrition value for an unmatched ingredient', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Yuzu-Paste', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          ...validAnalysis,
          zutatenliste: [{
            name: 'Yuzu-Paste',
            amount: '20g',
            grams: 20,
            naehrwert_geschaetzt: { kcal: 250, protein_g: 1, carbs_g: 60, sugar_g: 55, fat_g: 0, fiber_g: 1 },
          }],
        }),
      }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-1' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: [{ name: 'Yuzu-Paste', amount: '20g' }] }))
    expect(res.status).toBe(200)
    const body = await res.json()
    // 20g of 250 kcal/100g = 50 kcal
    expect(body.result.vorher.naehrwerte.kcal).toBe(50)
    // BUG-4-Fix: successful AI estimates are surfaced so the UI can label them
    expect(body.result.zutatenQuellen).toEqual(['schaetzung'])
  })

  it('discards an implausible AI estimate and lists the ingredient as not estimable', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Mysteriöse Zutat', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          ...validAnalysis,
          zutatenliste: [{
            name: 'Mysteriöse Zutat',
            amount: '50g',
            grams: 50,
            naehrwert_geschaetzt: { kcal: 5000, protein_g: 1, carbs_g: 1, sugar_g: 1, fat_g: 1, fiber_g: 1 },
          }],
        }),
      }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-2' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: [{ name: 'Mysteriöse Zutat', amount: '50g' }] }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.result.vorher.naehrwerte.kcal).toBe(0)
    expect(body.result.zutatenQuellen).toEqual(['nicht_schaetzbar'])
  })

  it('lists an ingredient with no AI estimate at all as not estimable', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Test', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(validAnalysis) }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-3' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000', ingredients: validIngredients }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.result.zutatenQuellen).toEqual(['nicht_schaetzbar'])
  })

  // PROJ-28 (BUG-7-Fix, 2026-08-04): zwei Zutaten mit identischem Namen, aber unterschiedlicher
  // Quelle, dürfen nicht dieselbe Kennzeichnung bekommen — Zuordnung muss positionsgenau sein
  it('correctly distinguishes two ingredients with the same name but different resolution outcomes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Zwiebel zweimal', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          ...validAnalysis,
          zutatenliste: [
            { name: 'Zwiebel', amount: '1 Stück', grams: 80, naehrwert_geschaetzt: { kcal: 40, protein_g: 1, carbs_g: 9, sugar_g: 4, fat_g: 0, fiber_g: 2 } },
            { name: 'Zwiebel', amount: '1 EL geröstet', grams: 15 },
          ],
        }),
      }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-5' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({
      mealId: '550e8400-e29b-41d4-a716-446655440000',
      ingredients: [{ name: 'Zwiebel', amount: '1 Stück' }, { name: 'Zwiebel', amount: '1 EL geröstet' }],
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    // Erste "Zwiebel" hat eine plausible Schätzung, zweite nicht — trotz identischem Namen
    // müssen beide Zeilen ihre eigene, korrekte Kennzeichnung behalten
    expect(body.result.zutatenQuellen).toEqual(['schaetzung', 'nicht_schaetzbar'])
  })

  it('marks a resolved AI estimate with source "schaetzung" and a rejected one as "nicht_schaetzbar" in data_sources', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Test', photo_fullsize_path: null }, error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          ...validAnalysis,
          zutatenliste: [
            { name: 'Gute Schätzung', amount: '20g', grams: 20, naehrwert_geschaetzt: { kcal: 200, protein_g: 1, carbs_g: 1, sugar_g: 1, fat_g: 1, fiber_g: 1 } },
            { name: 'Keine Schätzung', amount: '20g', grams: 20 },
          ],
        }),
      }],
    })
    mockInsertSingle.mockResolvedValue({ data: { id: 'analysis-4' }, error: null })
    mockMealsUpdate.mockResolvedValue({ error: null })
    mockConvUpdate.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({
      mealId: '550e8400-e29b-41d4-a716-446655440000',
      ingredients: [{ name: 'Gute Schätzung', amount: '20g' }, { name: 'Keine Schätzung', amount: '20g' }],
    }))
    expect(res.status).toBe(200)

    const insertedPayload = mockMealAnalysesInsert.mock.calls[0][0] as { data_sources: { ingredient: string; source: string }[] }
    const sources = insertedPayload.data_sources
    expect(sources.find(s => s.ingredient === 'Gute Schätzung')?.source).toBe('schaetzung')
    expect(sources.find(s => s.ingredient === 'Keine Schätzung')?.source).toBe('nicht_schaetzbar')
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
