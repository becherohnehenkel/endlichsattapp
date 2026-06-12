import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSelectSingle = vi.fn()

const serverFrom = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: serverFrom,
  }),
}))

const adminFrom = vi.fn()
const adminStorageFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: adminFrom,
    storage: { from: adminStorageFrom },
  }),
}))

const MOCK_RECIPE = {
  id: 'recipe-1',
  title: 'Hähnchen mit Reis',
  image_path: null,
  servings: 2,
  cook_time_minutes: 20,
  total_time_minutes: 30,
  instructions: 'Kochen.',
  ingredient_tags: ['hähnchen', 'reis'],
  cuisine_tags: [],
  recipe_ingredients: [
    { id: 'ing-1', name: 'Hähnchen', amount: 200, unit: 'g', sort_order: 0 },
  ],
}

const VALID_UPDATE = {
  title: 'Updated Rezept',
  servings: 4,
  cook_time_minutes: 25,
  total_time_minutes: 35,
  instructions: 'Neue Anleitung.',
  ingredient_tags: ['hähnchen'],
  cuisine_tags: [],
  ingredients: [{ name: 'Hähnchen', amount: 300, unit: 'g' }],
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('GET /api/admin/rezepte/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('r1'))
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'other@test.com' } } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('r1'))
    expect(res.status).toBe(403)
  })

  it('returns recipe for admin', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    serverFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: MOCK_RECIPE, error: null }) }),
      }),
    })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('Hähnchen mit Reis')
  })
})

describe('PUT /api/admin/rezepte/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 for invalid data', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const { PUT } = await import('./route')
    const res = await PUT(
      new Request('http://localhost', { method: 'PUT', body: JSON.stringify({ title: '' }) }),
      makeParams('recipe-1')
    )
    expect(res.status).toBe(400)
  })

  it('updates recipe successfully', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    adminFrom
      .mockReturnValueOnce({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })
      .mockReturnValueOnce({ delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })
      .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) })

    const { PUT } = await import('./route')
    const res = await PUT(
      new Request('http://localhost', { method: 'PUT', body: JSON.stringify(VALID_UPDATE) }),
      makeParams('recipe-1')
    )
    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/admin/rezepte/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 404 when recipe not found', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    serverFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null }) }),
      }),
    })
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('unknown'))
    expect(res.status).toBe(404)
  })

  it('deletes recipe without image', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    serverFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { image_path: null } }),
        }),
      }),
    })
    adminFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    })
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(200)
    expect(adminStorageFrom).not.toHaveBeenCalled()
  })

  it('removes image from storage before deleting recipe', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    serverFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { image_path: 'abc123.jpg' } }),
        }),
      }),
    })
    const mockRemove = vi.fn().mockResolvedValue({ error: null })
    adminStorageFrom.mockReturnValue({ remove: mockRemove })
    adminFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    })
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(200)
    expect(mockRemove).toHaveBeenCalledWith(['abc123.jpg'])
  })
})
