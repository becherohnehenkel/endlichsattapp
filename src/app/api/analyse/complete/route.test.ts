import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockMealSingle = vi.fn()
const mockConvSingle = vi.fn()
const mockConvUpdate = vi.fn()
const mockAnthropicCreate = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'meals') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockMealSingle }) }) }) }
      }
      if (table === 'meal_conversations') {
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockConvSingle }) }),
          update: vi.fn().mockReturnValue({ eq: mockConvUpdate }),
        }
      }
      return {}
    }),
  }),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(function() {
    return { messages: { create: mockAnthropicCreate } }
  }),
}))

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/analyse/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analyse/complete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid uuid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: 'not-a-uuid' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when meal not found or not owned', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(404)
  })

  it('returns 404 when conversation not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Salat' }, error: null })
    mockConvSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(404)
  })

  it('returns ingredients and assumptions on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Hähnchen mit Reis' }, error: null })
    mockConvSingle.mockResolvedValue({
      data: {
        id: 'conv-1',
        claude_messages: [{ role: 'user', content: 'Hähnchen' }, { role: 'assistant', content: '{"needs_clarification":false,"questions":[],"assumptions":[]}' }],
        assumptions: ['Magerquark angenommen'],
      },
      error: null,
    })
    mockConvUpdate.mockResolvedValue({ error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({
        ingredients: [{ name: 'Hähnchenbrust', amount: '200g', isAssumption: false }],
        assumptions: [],
      }) }],
    })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ingredients).toHaveLength(1)
    expect(body.ingredients[0].name).toBe('Hähnchenbrust')
    expect(body.assumptions).toContain('Magerquark angenommen')
  })

  it('returns 503 when Claude API is overloaded (529)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Pasta' }, error: null })
    mockConvSingle.mockResolvedValue({
      data: { id: 'conv-1', claude_messages: [], assumptions: null },
      error: null,
    })
    mockAnthropicCreate.mockRejectedValue(Object.assign(new Error('overloaded'), { status: 529 }))

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toContain('überlastet')
  })

  it('parses Claude JSON wrapped in markdown code fences', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Pasta' }, error: null })
    mockConvSingle.mockResolvedValue({
      data: { id: 'conv-1', claude_messages: [], assumptions: null },
      error: null,
    })
    mockConvUpdate.mockResolvedValue({ error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n' + JSON.stringify({
        ingredients: [{ name: 'Pasta', amount: '200g', isAssumption: false }],
        assumptions: [],
      }) + '\n```' }],
    })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ingredients[0].name).toBe('Pasta')
  })

  it('falls back gracefully when Claude returns non-JSON', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealSingle.mockResolvedValue({ data: { id: 'meal-1', user_id: 'user-1', free_text: 'Pasta' }, error: null })
    mockConvSingle.mockResolvedValue({
      data: { id: 'conv-1', claude_messages: [], assumptions: null },
      error: null,
    })
    mockConvUpdate.mockResolvedValue({ error: null })
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Das konnte ich nicht verarbeiten' }],
    })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mealId: '550e8400-e29b-41d4-a716-446655440000' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ingredients).toHaveLength(1)
    expect(body.ingredients[0].isAssumption).toBe(true)
  })
})
