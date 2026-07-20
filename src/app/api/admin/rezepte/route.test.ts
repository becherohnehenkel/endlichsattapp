import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockInsertRecipe = vi.fn()
const mockInsertIngredients = vi.fn()
const mockDeleteRecipe = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockImplementation(mockSelect),
      }),
    }),
  }),
}))

const adminFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({ from: adminFrom }),
}))

const VALID_RECIPE = {
  title: 'Hähnchen mit Reis',
  servings: 2,
  cook_time_minutes: 20,
  total_time_minutes: 30,
  instructions: 'Reis kochen, Hähnchen braten.',
  ingredient_tags: ['hähnchen', 'reis'],
  cuisine_tags: ['asiatisch'],
  ingredients: [
    { item_type: 'zutat', name: 'Hähnchenbrust', amount: 200, unit: 'g' },
    { item_type: 'zutat', name: 'Reis', amount: 150, unit: 'g' },
  ],
}

describe('GET /api/admin/rezepte', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'other@example.com' } } })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('returns recipe list for admin', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockSelect.mockResolvedValue({
      data: [{ id: 'r1', title: 'Test', image_path: null, cook_time_minutes: 20, total_time_minutes: 30, created_at: '2026-06-12' }],
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.recipes).toHaveLength(1)
  })
})

describe('POST /api/admin/rezepte', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify(VALID_RECIPE) }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing required fields', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ title: '' }),
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when ingredient_tags is empty', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ ...VALID_RECIPE, ingredient_tags: [] }),
    }))
    expect(res.status).toBe(400)
  })

  it('creates recipe and returns id on success', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })

    // POST makes 5 adminFrom calls: recipes.insert, recipe_ingredients.insert,
    // bls lookup x2 (one per ingredient), recipes.update (macros)
    const blsMock = { select: vi.fn().mockReturnValue({ ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null }) }) }) }) }
    adminFrom
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'new-recipe-id' }, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      })
      .mockReturnValueOnce(blsMock)
      .mockReturnValueOnce(blsMock)
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      })

    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(VALID_RECIPE),
    }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.id).toBe('new-recipe-id')
  })

  it('accepts recipe_typ beilage on create', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'beilage-recipe-id' }, error: null }),
      }),
    })
    const blsMock = { select: vi.fn().mockReturnValue({ ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null }) }) }) }) }
    adminFrom
      .mockReturnValueOnce({ insert: insertMock })
      .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) })
      .mockReturnValueOnce(blsMock)
      .mockReturnValueOnce(blsMock)
      .mockReturnValueOnce({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })

    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ ...VALID_RECIPE, recipe_typ: 'beilage' }),
    }))
    expect(res.status).toBe(201)
    const insertCall = insertMock.mock.calls[0][0]
    expect(insertCall.recipe_typ).toBe('beilage')
  })

  it('stores recipe_typ null when no type selected', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'recipe-id' }, error: null }),
      }),
    })
    const blsMock = { select: vi.fn().mockReturnValue({ ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null }) }) }) }) }
    adminFrom
      .mockReturnValueOnce({ insert: insertMock })
      .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) })
      .mockReturnValueOnce(blsMock)
      .mockReturnValueOnce(blsMock)
      .mockReturnValueOnce({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })

    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(VALID_RECIPE),
    }))
    expect(res.status).toBe(201)
    const insertCall = insertMock.mock.calls[0][0]
    expect(insertCall.recipe_typ).toBeNull()
  })

  it('creates recipe with a group header and persists item_type/label (PROJ-24)', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })

    const ingredientsInsertMock = vi.fn().mockResolvedValue({ error: null })
    const blsMock = { select: vi.fn().mockReturnValue({ ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null }) }) }) }) }
    adminFrom
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'recipe-with-group' }, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({ insert: ingredientsInsertMock })
      .mockReturnValueOnce(blsMock)
      .mockReturnValueOnce({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })

    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        ...VALID_RECIPE,
        ingredients: [
          { item_type: 'gruppe', label: 'Für das Dressing', sort_order: 0 },
          { item_type: 'zutat', name: 'Olivenöl', amount: 30, unit: 'g', sort_order: 1 },
        ],
      }),
    }))
    expect(res.status).toBe(201)
    const insertedIngredients = ingredientsInsertMock.mock.calls[0][0]
    expect(insertedIngredients).toEqual([
      { recipe_id: 'recipe-with-group', item_type: 'gruppe', label: 'Für das Dressing', name: null, amount: null, unit: null, sort_order: 0, macros_per_100g: null },
      { recipe_id: 'recipe-with-group', item_type: 'zutat', name: 'Olivenöl', amount: 30, unit: 'g', sort_order: 1, macros_per_100g: null },
    ])
  })

  it('returns 400 when a group header has no following ingredient (PROJ-24)', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        ...VALID_RECIPE,
        ingredients: [
          { item_type: 'zutat', name: 'Reis', amount: 150, unit: 'g' },
          { item_type: 'gruppe', label: 'Leere Gruppe' },
        ],
      }),
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when ingredients contain only group headers (PROJ-24)', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ ...VALID_RECIPE, ingredients: [{ item_type: 'gruppe', label: 'Nur Überschrift' }] }),
    }))
    expect(res.status).toBe(400)
  })
})
