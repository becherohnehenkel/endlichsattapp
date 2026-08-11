import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockMealSingle = vi.fn()
const mockConvSingle = vi.fn()
const mockConvUpdateEq = vi.fn().mockResolvedValue({ error: null })
const mockConvUpdate = vi.fn().mockReturnValue({ eq: mockConvUpdateEq })
const mockAnthropicCreate = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'meals') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockMealSingle }) }),
          }),
        }
      }
      if (table === 'meal_conversations') {
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockConvSingle }) }),
          update: mockConvUpdate,
        }
      }
      return {}
    }),
  }),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(function () {
    return { messages: { create: mockAnthropicCreate } }
  }),
}))

const MEAL_ID = '550e8400-e29b-41d4-a716-446655440000'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/analyse/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function claudeResponse(payload: object) {
  mockAnthropicCreate.mockResolvedValue({ content: [{ type: 'text', text: JSON.stringify(payload) }] })
}

describe('POST /api/analyse/answer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConvUpdateEq.mockResolvedValue({ error: null })
    mockConvUpdate.mockReturnValue({ eq: mockConvUpdateEq })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID, round: 1, answers: [], skipped: false }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid round', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID, round: 0, answers: [], skipped: false }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when meal not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID, round: 1, answers: [], skipped: false }))
    expect(res.status).toBe(404)
  })

  it('returns 404 when conversation not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, user_id: 'u1' }, error: null })
    mockConvSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID, round: 1, answers: [], skipped: false }))
    expect(res.status).toBe(404)
  })

  it('returns 400 for round > 3 (schema caps at 3)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: MEAL_ID, round: 4, answers: [], skipped: false }))
    expect(res.status).toBe(400)
  })

  // Refinement 2026-08-11 (Schritt-0-Klassifikation, "Complete"-Umstrukturierung)
  describe('Schritt-0-Klassifikation', () => {
    it('sets MAHLZEIT_TYP: komponente when the user answers the classification question with "Beilage"', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, user_id: 'u1' }, error: null })
      mockConvSingle.mockResolvedValue({
        data: { id: 'conv-1', claude_messages: [], current_round: 1, assumptions: null },
        error: null,
      })
      claudeResponse({ needs_clarification: false, questions: [], assumptions: ['MAHLZEIT_TYP: komponente'] })

      const { POST } = await import('./route')
      const res = await POST(makeRequest({
        mealId: MEAL_ID, round: 1,
        answers: [{ questionId: 'mahlzeit_typ', text: 'Das ist eine Beilage zu Hähnchen' }],
        skipped: false,
      }))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.assumptions).toEqual(['MAHLZEIT_TYP: komponente'])
      expect(mockConvUpdate.mock.calls[0][0].assumptions).toEqual(['MAHLZEIT_TYP: komponente'])
    })

    it('sets no flag (standard) when the user confirms a complete meal', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, user_id: 'u1' }, error: null })
      mockConvSingle.mockResolvedValue({
        data: { id: 'conv-1', claude_messages: [], current_round: 1, assumptions: null },
        error: null,
      })
      claudeResponse({ needs_clarification: false, questions: [], assumptions: [] })

      const { POST } = await import('./route')
      await POST(makeRequest({
        mealId: MEAL_ID, round: 1,
        answers: [{ questionId: 'mahlzeit_typ', text: 'Ja, das ist meine ganze Mahlzeit' }],
        skipped: false,
      }))
      expect(mockConvUpdate.mock.calls[0][0].assumptions).toBeNull()
    })

    it('preserves a MAHLZEIT_TYP flag set in an earlier round even if this round\'s assumptions omit it', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, user_id: 'u1' }, error: null })
      // Round 1 already set MAHLZEIT_TYP: snack; round 2 answers an unrelated question
      // (Kochfett) and Claude's fresh assumptions list for THIS round doesn't repeat the flag.
      mockConvSingle.mockResolvedValue({
        data: { id: 'conv-1', claude_messages: [], current_round: 1, assumptions: ['MAHLZEIT_TYP: snack'] },
        error: null,
      })
      claudeResponse({ needs_clarification: false, questions: [], assumptions: ['Rapsöl verwendet, ca. 1 EL'] })

      const { POST } = await import('./route')
      await POST(makeRequest({
        mealId: MEAL_ID, round: 2,
        answers: [{ questionId: 'q_fett', text: 'Rapsöl, ein Schuss' }],
        skipped: false,
      }))
      const updatedAssumptions = mockConvUpdate.mock.calls[0][0].assumptions as string[]
      expect(updatedAssumptions).toContain('MAHLZEIT_TYP: snack')
      expect(updatedAssumptions).toContain('Rapsöl verwendet, ca. 1 EL')
    })

    it('does not duplicate the flag if the new round already restates it', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, user_id: 'u1' }, error: null })
      mockConvSingle.mockResolvedValue({
        data: { id: 'conv-1', claude_messages: [], current_round: 1, assumptions: ['MAHLZEIT_TYP: komponente'] },
        error: null,
      })
      claudeResponse({ needs_clarification: false, questions: [], assumptions: ['MAHLZEIT_TYP: komponente'] })

      const { POST } = await import('./route')
      await POST(makeRequest({ mealId: MEAL_ID, round: 2, answers: [], skipped: false }))
      const updatedAssumptions = mockConvUpdate.mock.calls[0][0].assumptions as string[]
      expect(updatedAssumptions.filter(a => a.startsWith('MAHLZEIT_TYP:'))).toHaveLength(1)
    })

    it('skip still preserves a prior MAHLZEIT_TYP flag', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
      mockMealSingle.mockResolvedValue({ data: { id: MEAL_ID, user_id: 'u1' }, error: null })
      mockConvSingle.mockResolvedValue({
        data: { id: 'conv-1', claude_messages: [], current_round: 1, assumptions: ['MAHLZEIT_TYP: snack'] },
        error: null,
      })
      claudeResponse({ needs_clarification: false, questions: [], assumptions: [] })

      const { POST } = await import('./route')
      await POST(makeRequest({ mealId: MEAL_ID, round: 2, answers: [], skipped: true }))
      const updatedAssumptions = mockConvUpdate.mock.calls[0][0].assumptions as string[]
      expect(updatedAssumptions).toEqual(['MAHLZEIT_TYP: snack'])
    })
  })
})
