import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockMealSingle = vi.fn()
const mockConvInsert = vi.fn().mockResolvedValue({ error: null })
const mockMealsUpdate = vi.fn().mockResolvedValue({ error: null })
const mockStorageDownload = vi.fn()
const mockAnthropicCreate = vi.fn()

const mockSharpInstance = {
  resize: vi.fn().mockReturnThis(),
  jpeg: vi.fn().mockReturnThis(),
  toBuffer: vi.fn().mockResolvedValue(Buffer.from('resized')),
}
const mockSharp = vi.fn().mockReturnValue(mockSharpInstance)

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'meals') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({ single: mockMealSingle }),
            }),
          }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        }
      }
      if (table === 'meal_conversations') {
        return { insert: mockConvInsert }
      }
      return {}
    }),
    storage: {
      from: vi.fn().mockReturnValue({ download: mockStorageDownload }),
    },
  }),
}))

vi.mock('sharp', () => ({ default: mockSharp }))

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(function () {
    return { messages: { create: mockAnthropicCreate } }
  }),
}))

const MEAL_ID = '550e8400-e29b-41d4-a716-446655440000'
const CLAUDE_READY = JSON.stringify({ needs_clarification: false, meal_description: 'Test', questions: [] })
const CLAUDE_QUESTIONS = JSON.stringify({ needs_clarification: true, meal_description: 'Test', questions: [{ id: 'q1', text: 'Frage?' }] })

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/analyse/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analyse/start', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSharp.mockReturnValue(mockSharpInstance)
    mockSharpInstance.resize.mockReturnThis()
    mockSharpInstance.jpeg.mockReturnThis()
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('resized'))
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid mealId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: 'not-a-uuid' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when meal not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID }))
    expect(res.status).toBe(404)
  })

  it('returns { ready: true } for text-only meal with no questions', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, free_text: 'Pasta', photo_fullsize_path: null, user_id: 'u1' }, error: null })
    mockAnthropicCreate.mockResolvedValue({ content: [{ type: 'text', text: CLAUDE_READY }] })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ready).toBe(true)
  })

  it('returns questions when Claude needs clarification', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, free_text: 'Salat', photo_fullsize_path: null, user_id: 'u1' }, error: null })
    mockAnthropicCreate.mockResolvedValue({ content: [{ type: 'text', text: CLAUDE_QUESTIONS }] })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.questions).toHaveLength(1)
    expect(body.questions[0].id).toBe('q1')
  })

  // PROJ-18 FIX-1: stored history must never contain base64 image data
  it('FIX-1: claude_messages stored without base64 image data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({
      data: { id: MEAL_ID, free_text: null, photo_fullsize_path: 'u1/photo.jpg', user_id: 'u1' },
      error: null,
    })
    mockStorageDownload.mockResolvedValue({
      data: new Blob([Buffer.from('fake-jpeg-data')], { type: 'image/jpeg' }),
      error: null,
    })
    mockAnthropicCreate.mockResolvedValue({ content: [{ type: 'text', text: CLAUDE_READY }] })

    const { POST } = await import('./route')
    await POST(makeRequest({ mealId: MEAL_ID }))

    const insertCall = mockConvInsert.mock.calls[0][0]
    const messages = insertCall.claude_messages as { role: string; content: string }[]
    const userMessage = messages.find(m => m.role === 'user')
    expect(userMessage).toBeDefined()
    // content must be plain text, not a JSON array with base64 data
    expect(typeof userMessage!.content).toBe('string')
    expect(userMessage!.content).not.toContain('base64')
    expect(userMessage!.content).not.toContain('"type":"image"')
  })

  it('FIX-1: text-only meal stores free_text as user message', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({
      data: { id: MEAL_ID, free_text: 'Haferbrei mit Beeren', photo_fullsize_path: null, user_id: 'u1' },
      error: null,
    })
    mockAnthropicCreate.mockResolvedValue({ content: [{ type: 'text', text: CLAUDE_READY }] })

    const { POST } = await import('./route')
    await POST(makeRequest({ mealId: MEAL_ID }))

    const insertCall = mockConvInsert.mock.calls[0][0]
    const messages = insertCall.claude_messages as { role: string; content: string }[]
    const userMessage = messages.find(m => m.role === 'user')
    expect(userMessage!.content).toBe('Mahlzeit: Haferbrei mit Beeren')
  })

  // PROJ-18 FIX-2: sharp resize is called for photo meals
  it('FIX-2: sharp resizes photo before sending to Claude', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({
      data: { id: MEAL_ID, free_text: null, photo_fullsize_path: 'u1/photo.jpg', user_id: 'u1' },
      error: null,
    })
    mockStorageDownload.mockResolvedValue({
      data: new Blob([Buffer.from('fake-jpeg')], { type: 'image/jpeg' }),
      error: null,
    })
    mockAnthropicCreate.mockResolvedValue({ content: [{ type: 'text', text: CLAUDE_READY }] })

    const { POST } = await import('./route')
    await POST(makeRequest({ mealId: MEAL_ID }))

    expect(mockSharp).toHaveBeenCalledOnce()
    expect(mockSharpInstance.resize).toHaveBeenCalledWith(768, 768, { fit: 'inside', withoutEnlargement: true })
    expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 85 })
  })

  it('FIX-2: sharp is not called for text-only meals', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({
      data: { id: MEAL_ID, free_text: 'Pasta', photo_fullsize_path: null, user_id: 'u1' },
      error: null,
    })
    mockAnthropicCreate.mockResolvedValue({ content: [{ type: 'text', text: CLAUDE_READY }] })

    const { POST } = await import('./route')
    await POST(makeRequest({ mealId: MEAL_ID }))

    expect(mockSharp).not.toHaveBeenCalled()
  })

  it('FIX-2: falls back to original image if sharp throws', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({
      data: { id: MEAL_ID, free_text: null, photo_fullsize_path: 'u1/corrupt.jpg', user_id: 'u1' },
      error: null,
    })
    mockStorageDownload.mockResolvedValue({
      data: new Blob([Buffer.from('corrupt')], { type: 'image/jpeg' }),
      error: null,
    })
    mockSharpInstance.toBuffer.mockRejectedValueOnce(new Error('unsupported format'))
    mockAnthropicCreate.mockResolvedValue({ content: [{ type: 'text', text: CLAUDE_READY }] })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID }))
    // Analysis must not abort — falls back to original
    expect(res.status).toBe(200)
    expect(mockAnthropicCreate).toHaveBeenCalledOnce()
  })

  it('returns 503 when Claude is overloaded', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, free_text: 'Test', photo_fullsize_path: null, user_id: 'u1' }, error: null })
    mockAnthropicCreate.mockRejectedValue(Object.assign(new Error('overloaded'), { status: 529 }))
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID }))
    expect(res.status).toBe(503)
  })

  // Refinement 2026-08-11 (Schritt-0-Klassifikation, "Complete"-Umstrukturierung)
  describe('Schritt-0-Klassifikation', () => {
    it('sets MAHLZEIT_TYP: komponente as an assumption when classified immediately, no rückfrage', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, free_text: 'Blattsalat', photo_fullsize_path: null, user_id: 'u1' }, error: null })
      mockAnthropicCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ needs_clarification: false, meal_description: 'Blattsalat', mahlzeit_typ: 'komponente', questions: [] }) }],
      })
      const { POST } = await import('./route')
      const res = await POST(makeRequest({ mealId: MEAL_ID }))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.ready).toBe(true)
      const insertCall = mockConvInsert.mock.calls[0][0]
      expect(insertCall.assumptions).toEqual(['MAHLZEIT_TYP: komponente'])
      expect(insertCall.status).toBe('ready')
    })

    it('sets MAHLZEIT_TYP: snack as an assumption when classified immediately', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, free_text: 'Ein Apfel', photo_fullsize_path: null, user_id: 'u1' }, error: null })
      mockAnthropicCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ needs_clarification: false, meal_description: 'Ein Apfel', mahlzeit_typ: 'snack', questions: [] }) }],
      })
      const { POST } = await import('./route')
      await POST(makeRequest({ mealId: MEAL_ID }))
      const insertCall = mockConvInsert.mock.calls[0][0]
      expect(insertCall.assumptions).toEqual(['MAHLZEIT_TYP: snack'])
    })

    it('sets no assumption flag for mahlzeit_typ: mahlzeit (default, no flag needed)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, free_text: 'Spaghetti Bolognese', photo_fullsize_path: null, user_id: 'u1' }, error: null })
      mockAnthropicCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ needs_clarification: false, meal_description: 'Spaghetti Bolognese', mahlzeit_typ: 'mahlzeit', questions: [] }) }],
      })
      const { POST } = await import('./route')
      await POST(makeRequest({ mealId: MEAL_ID }))
      const insertCall = mockConvInsert.mock.calls[0][0]
      expect(insertCall.assumptions).toBeNull()
    })

    it('forces a rückfrage when mahlzeit_typ is "unklar", even if needs_clarification is false', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, free_text: 'Avocado-Toast', photo_fullsize_path: null, user_id: 'u1' }, error: null })
      mockAnthropicCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ needs_clarification: false, meal_description: 'Avocado-Toast', mahlzeit_typ: 'unklar', questions: [] }) }],
      })
      const { POST } = await import('./route')
      const res = await POST(makeRequest({ mealId: MEAL_ID }))
      const body = await res.json()
      // Sicherheitsnetz: obwohl Claude questions=[] und needs_clarification=false zurückgab,
      // wird die Klassifikations-Frage erzwungen, statt fälschlich "ready" zurückzugeben.
      expect(body.ready).toBeUndefined()
      expect(body.questions).toEqual([{ id: 'mahlzeit_typ', text: 'Ist das eine Mahlzeit, ein Teil davon oder ein Snack?' }])
      const insertCall = mockConvInsert.mock.calls[0][0]
      expect(insertCall.status).toBe('questioning')
      expect(insertCall.assumptions).toBeNull()
    })

    it('respects a real classification question Claude already asked for "unklar"', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, free_text: 'Poke Bowl klein', photo_fullsize_path: null, user_id: 'u1' }, error: null })
      mockAnthropicCreate.mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            needs_clarification: true,
            meal_description: 'Poke Bowl klein',
            mahlzeit_typ: 'unklar',
            questions: [{ id: 'q1', text: 'Ist das eine Mahlzeit, ein Teil davon oder ein Snack?' }],
          }),
        }],
      })
      const { POST } = await import('./route')
      const res = await POST(makeRequest({ mealId: MEAL_ID }))
      const body = await res.json()
      expect(body.questions).toHaveLength(1)
      expect(body.questions[0].id).toBe('q1')
    })
  })
})
