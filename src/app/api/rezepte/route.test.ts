import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockGetOwnRecipeLimitStatus = vi.fn()

const serverFrom = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: serverFrom,
  }),
}))

const adminFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({ from: adminFrom }),
}))

vi.mock('@/lib/paywall', async () => {
  const actual = await vi.importActual<typeof import('@/lib/paywall')>('@/lib/paywall')
  return {
    ...actual,
    getOwnRecipeLimitStatus: mockGetOwnRecipeLimitStatus,
  }
})

const VALID_RECIPE = {
  title: 'Mein Rezept',
  servings: 2,
  cook_time_minutes: 20,
  total_time_minutes: 30,
  instructions: 'Kochen.',
  ingredient_tags: ['hähnchen'],
  cuisine_tags: [],
  ingredients: [{ item_type: 'zutat', name: 'Hähnchen', amount: 200, unit: 'g' }],
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/rezepte', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/rezepte', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOwnRecipeLimitStatus.mockResolvedValue({ allowed: true, ownRecipeCount: 0, limit: null })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_RECIPE))
    expect(res.status).toBe(401)
  })

  it('returns 403 for an anonymous (guest) user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'guest-1', is_anonymous: true } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_RECIPE))
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ title: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 403 with limitReached when the 5-recipe limit is hit', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockGetOwnRecipeLimitStatus.mockResolvedValue({ allowed: false, ownRecipeCount: 5, limit: 5 })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_RECIPE))
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.limitReached).toBe(true)
  })

  it('creates a recipe with owner_id set to the current user when under the limit', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const insertMock = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'new-recipe-1' }, error: null }) }) })
    const blsMock = { select: vi.fn().mockReturnValue({ ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null }) }) }) }) }
    serverFrom
      .mockReturnValueOnce({ insert: insertMock }) // recipes.insert
      .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) }) // recipe_ingredients.insert
      .mockReturnValueOnce({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) }) // recipes.update (matrix)
    adminFrom.mockReturnValueOnce(blsMock)

    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_RECIPE))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.id).toBe('new-recipe-1')
    expect(insertMock.mock.calls[0][0].owner_id).toBe('user-1')
  })

  it('does not accept an is_guest_visible field even if sent by the client', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const insertMock = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'new-recipe-1' }, error: null }) }) })
    const blsMock = { select: vi.fn().mockReturnValue({ ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null }) }) }) }) }
    serverFrom
      .mockReturnValueOnce({ insert: insertMock })
      .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) })
      .mockReturnValueOnce({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })
    adminFrom.mockReturnValueOnce(blsMock)

    const { POST } = await import('./route')
    await POST(makeRequest({ ...VALID_RECIPE, is_guest_visible: true }))
    expect(insertMock.mock.calls[0][0].is_guest_visible).toBeUndefined()
  })

  it('cleans up the recipe if saving ingredients fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const deleteMock = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    serverFrom
      .mockReturnValueOnce({ insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'new-recipe-1' }, error: null }) }) }) })
      .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: { message: 'db error' } }) })
      .mockReturnValueOnce({ delete: deleteMock })

    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_RECIPE))
    expect(res.status).toBe(500)
    expect(deleteMock).toHaveBeenCalled()
  })
})
