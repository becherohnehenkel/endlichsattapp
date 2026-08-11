import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockRecipeSingle = vi.fn()
const mockUpdateEq = vi.fn()
const mockAdminUpdateEq = vi.fn()
const mockComputeGeschmack = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockRecipeSingle }) }),
      update: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
    })),
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn(() => ({
      update: vi.fn().mockReturnValue({ eq: mockAdminUpdateEq }),
    })),
  }),
}))

vi.mock('@/lib/geschmack', () => ({
  computeGeschmack: mockComputeGeschmack,
}))

function makeRequest() {
  return new Request('http://localhost/api/rezepte/rezept-1/geschmack-retry', { method: 'POST' })
}

describe('POST /api/rezepte/[id]/geschmack-retry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ADMIN_EMAIL
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(), { params: Promise.resolve({ id: 'rezept-1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 404 when the recipe does not exist or is not visible (RLS-filtered)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@test.com' } } })
    mockRecipeSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(), { params: Promise.resolve({ id: 'rezept-1' }) })
    expect(res.status).toBe(404)
  })

  it('returns 403 for a private recipe belonging to another user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@test.com' } } })
    mockRecipeSingle.mockResolvedValue({
      data: { id: 'rezept-1', owner_id: 'other-user', instructions: 'x', recipe_ingredients: [] },
      error: null,
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(), { params: Promise.resolve({ id: 'rezept-1' }) })
    expect(res.status).toBe(403)
  })

  it('returns 403 for an official recipe when the user is not admin', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@test.com' } } })
    mockRecipeSingle.mockResolvedValue({
      data: { id: 'rezept-1', owner_id: null, instructions: 'x', recipe_ingredients: [] },
      error: null,
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(), { params: Promise.resolve({ id: 'rezept-1' }) })
    expect(res.status).toBe(403)
  })

  it('recomputes and updates via the regular client for an own recipe', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@test.com' } } })
    mockRecipeSingle.mockResolvedValue({
      data: {
        id: 'rezept-1',
        owner_id: 'user-1',
        instructions: 'Alles vermischen.',
        recipe_ingredients: [
          { item_type: 'zutat', name: 'Hähnchenbrust', amount: 200, unit: 'g' },
          { item_type: 'gruppe', name: null, amount: null, unit: null },
        ],
      },
      error: null,
    })
    const geschmackResult = { status: 'ok', score: 65, label: 'okay', verbesserungen: [], unklarHinweis: null }
    mockComputeGeschmack.mockResolvedValue(geschmackResult)
    mockUpdateEq.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest(), { params: Promise.resolve({ id: 'rezept-1' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.geschmack).toEqual(geschmackResult)
    expect(mockComputeGeschmack).toHaveBeenCalledWith({
      zutatenliste: [{ name: 'Hähnchenbrust', amount: '200 g' }],
      anleitung: 'Alles vermischen.',
    })
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'rezept-1')
    expect(mockAdminUpdateEq).not.toHaveBeenCalled()
  })

  it('recomputes and updates via the admin client for an official recipe when the user is admin', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@test.com' } } })
    mockRecipeSingle.mockResolvedValue({
      data: { id: 'rezept-1', owner_id: null, instructions: 'x', recipe_ingredients: [] },
      error: null,
    })
    mockComputeGeschmack.mockResolvedValue({ status: 'error' })
    mockAdminUpdateEq.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest(), { params: Promise.resolve({ id: 'rezept-1' }) })
    expect(res.status).toBe(200)
    expect(mockAdminUpdateEq).toHaveBeenCalledWith('id', 'rezept-1')
    expect(mockUpdateEq).not.toHaveBeenCalled()
  })

  it('returns 500 when the DB update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@test.com' } } })
    mockRecipeSingle.mockResolvedValue({
      data: { id: 'rezept-1', owner_id: 'user-1', instructions: 'x', recipe_ingredients: [] },
      error: null,
    })
    mockComputeGeschmack.mockResolvedValue({ status: 'error' })
    mockUpdateEq.mockResolvedValue({ error: { message: 'db error' } })

    const { POST } = await import('./route')
    const res = await POST(makeRequest(), { params: Promise.resolve({ id: 'rezept-1' }) })
    expect(res.status).toBe(500)
  })
})
