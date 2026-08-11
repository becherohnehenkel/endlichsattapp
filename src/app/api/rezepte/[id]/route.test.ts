import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockGetAccessStatus = vi.fn()

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

vi.mock('@/lib/paywall', () => ({
  getAccessStatus: mockGetAccessStatus,
}))

// PROJ-33: kein echter Claude-Aufruf in Unit-Tests
const mockComputeGeschmack = vi.fn().mockResolvedValue({ status: 'error' })
vi.mock('@/lib/geschmack', () => ({
  computeGeschmack: mockComputeGeschmack,
}))

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

function singleFrom(data: unknown, error: unknown = null) {
  return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data, error }) }) }) }
}

const MOCK_RECIPE = {
  id: 'recipe-1',
  title: 'Hähnchen mit Reis',
  image_path: null,
  servings: 2,
  cook_time_minutes: 20,
  total_time_minutes: 30,
  instructions: 'Reis kochen...',
  ingredient_tags: ['hähnchen', 'reis'],
  cuisine_tags: ['asiatisch'],
  is_guest_visible: false,
  recipe_ingredients: [
    { id: 'ing-1', name: 'Hähnchenbrust', amount: 200, unit: 'g', sort_order: 0 },
    { id: 'ing-2', name: 'Reis', amount: 150, unit: 'g', sort_order: 1 },
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
  ingredients: [{ item_type: 'zutat', name: 'Hähnchen', amount: 300, unit: 'g' }],
}

describe('GET /api/rezepte/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: registrierter Nutzer mit vollem Zugriff (Trial aktiv/Abo) — die meisten
    // Tests unten prüfen andere Aspekte und sollen davon nicht betroffen sein.
    mockGetAccessStatus.mockResolvedValue({ hasAccess: true })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(401)
  })

  it('returns 404 when recipe not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom.mockReturnValue(singleFrom(null, { message: 'not found' }))
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('unknown'))
    expect(res.status).toBe(404)
  })

  it('returns recipe with sorted ingredients for a user with full access', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom.mockReturnValue(singleFrom(MOCK_RECIPE))
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('Hähnchen mit Reis')
    expect(data.ingredients).toHaveLength(2)
    expect(data.ingredients[0].name).toBe('Hähnchenbrust')
    expect(data.imageUrl).toBeNull()
  })

  it('constructs image URL when image_path exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom.mockReturnValue(singleFrom({ ...MOCK_RECIPE, image_path: 'abc123.jpg' }))
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    const data = await res.json()
    expect(data.imageUrl).toContain('abc123.jpg')
    expect(data.imageUrl).toContain('recipe-images')
  })

  it('returns 403 for an anonymous (guest) user when the recipe is not guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'guest-1', is_anonymous: true } } })
    serverFrom.mockReturnValue(singleFrom(MOCK_RECIPE))
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(403)
    expect(mockGetAccessStatus).not.toHaveBeenCalled()
  })

  it('returns 200 for an anonymous (guest) user when the recipe IS guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'guest-1', is_anonymous: true } } })
    serverFrom.mockReturnValue(singleFrom({ ...MOCK_RECIPE, is_guest_visible: true }))
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(200)
  })

  it('returns 403 for a registered user with an expired trial when the recipe is not guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockGetAccessStatus.mockResolvedValue({ hasAccess: false })
    serverFrom.mockReturnValue(singleFrom(MOCK_RECIPE))
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(403)
  })

  it('returns 200 for a registered user with an expired trial when the recipe IS guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockGetAccessStatus.mockResolvedValue({ hasAccess: false })
    serverFrom.mockReturnValue(singleFrom({ ...MOCK_RECIPE, is_guest_visible: true }))
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(200)
  })

  it('returns 200 for a registered user with an expired trial when the recipe is their OWN, even if not guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockGetAccessStatus.mockResolvedValue({ hasAccess: false })
    serverFrom.mockReturnValue(singleFrom({ ...MOCK_RECIPE, is_guest_visible: false, owner_id: 'user-1' }))
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(200)
  })

  it('returns 403 for a registered user with an expired trial when the recipe belongs to ANOTHER user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockGetAccessStatus.mockResolvedValue({ hasAccess: false })
    serverFrom.mockReturnValue(singleFrom({ ...MOCK_RECIPE, is_guest_visible: false, owner_id: 'user-2' }))
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(403)
  })
})

// PROJ-31: Nutzer dürfen ausschließlich eigene Rezepte bearbeiten
describe('PUT /api/rezepte/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { PUT } = await import('./route')
    const res = await PUT(new Request('http://localhost', { method: 'PUT', body: JSON.stringify(VALID_UPDATE) }), makeParams('recipe-1'))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { PUT } = await import('./route')
    const res = await PUT(new Request('http://localhost', { method: 'PUT', body: JSON.stringify({ title: '' }) }), makeParams('recipe-1'))
    expect(res.status).toBe(400)
  })

  it('returns 404 when the recipe does not exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom.mockReturnValue(singleFrom(null))
    const { PUT } = await import('./route')
    const res = await PUT(new Request('http://localhost', { method: 'PUT', body: JSON.stringify(VALID_UPDATE) }), makeParams('unknown'))
    expect(res.status).toBe(404)
  })

  it('returns 403 when the recipe belongs to another user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom.mockReturnValue(singleFrom({ owner_id: 'user-2' }))
    const { PUT } = await import('./route')
    const res = await PUT(new Request('http://localhost', { method: 'PUT', body: JSON.stringify(VALID_UPDATE) }), makeParams('recipe-1'))
    expect(res.status).toBe(403)
  })

  it('returns 403 when the recipe is official (owner_id null)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom.mockReturnValue(singleFrom({ owner_id: null }))
    const { PUT } = await import('./route')
    const res = await PUT(new Request('http://localhost', { method: 'PUT', body: JSON.stringify(VALID_UPDATE) }), makeParams('recipe-1'))
    expect(res.status).toBe(403)
  })

  it('updates an own recipe successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const blsMock = { select: vi.fn().mockReturnValue({ ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null }) }) }) }) }
    const finalUpdateMock = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    mockComputeGeschmack.mockResolvedValue({ status: 'ok', score: 88, label: 'richtig_gut', verbesserungen: [], unklarHinweis: null })
    serverFrom
      .mockReturnValueOnce(singleFrom({ owner_id: 'user-1' })) // Eigentümer-Check
      .mockReturnValueOnce({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) }) // recipes.update
      .mockReturnValueOnce({ delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) }) // ingredients.delete
      .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) }) // ingredients.insert
      .mockReturnValueOnce({ update: finalUpdateMock }) // recipes.update (matrix + geschmack)
    adminFrom.mockReturnValueOnce(blsMock) // interner BLS-Lookup aus calculateMacrosPerServing

    const { PUT } = await import('./route')
    const res = await PUT(new Request('http://localhost', { method: 'PUT', body: JSON.stringify(VALID_UPDATE) }), makeParams('recipe-1'))
    expect(res.status).toBe(200)
    // PROJ-33
    expect(finalUpdateMock.mock.calls[0][0].geschmack_score).toEqual({ status: 'ok', score: 88, label: 'richtig_gut', verbesserungen: [], unklarHinweis: null })
  })

  it('does not accept an is_guest_visible field even if sent by the client', async () => {
    // Zod-Schema kennt das Feld gar nicht — es wird stillschweigend ignoriert, kein Fehler
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const updateMock = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    const blsMock = { select: vi.fn().mockReturnValue({ ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null }) }) }) }) }
    serverFrom
      .mockReturnValueOnce(singleFrom({ owner_id: 'user-1' }))
      .mockReturnValueOnce({ update: updateMock })
      .mockReturnValueOnce({ delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })
      .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) })
      .mockReturnValueOnce({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })
    adminFrom.mockReturnValueOnce(blsMock)

    const { PUT } = await import('./route')
    await PUT(new Request('http://localhost', { method: 'PUT', body: JSON.stringify({ ...VALID_UPDATE, is_guest_visible: true }) }), makeParams('recipe-1'))
    const updatePayload = updateMock.mock.calls[0][0]
    expect(updatePayload.is_guest_visible).toBeUndefined()
  })
})

// PROJ-31: Nutzer dürfen ausschließlich eigene Rezepte löschen
describe('DELETE /api/rezepte/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(401)
  })

  it('returns 404 when recipe not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom.mockReturnValue(singleFrom(null))
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('unknown'))
    expect(res.status).toBe(404)
  })

  it('returns 403 when the recipe belongs to another user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom.mockReturnValue(singleFrom({ owner_id: 'user-2', image_path: null }))
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(403)
  })

  it('returns 403 when the recipe is official (owner_id null)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom.mockReturnValue(singleFrom({ owner_id: null, image_path: null }))
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(403)
  })

  it('deletes an own recipe without image', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom
      .mockReturnValueOnce(singleFrom({ owner_id: 'user-1', image_path: null }))
      .mockReturnValueOnce({ delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(200)
    expect(adminStorageFrom).not.toHaveBeenCalled()
  })

  it('removes the image from storage via the admin client before deleting an own recipe', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    serverFrom
      .mockReturnValueOnce(singleFrom({ owner_id: 'user-1', image_path: 'abc123.jpg' }))
      .mockReturnValueOnce({ delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })
    const mockRemove = vi.fn().mockResolvedValue({ error: null })
    adminStorageFrom.mockReturnValue({ remove: mockRemove })

    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('recipe-1'))
    expect(res.status).toBe(200)
    expect(mockRemove).toHaveBeenCalledWith(['abc123.jpg'])
  })
})
