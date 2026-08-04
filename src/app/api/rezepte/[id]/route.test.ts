import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSelectSingle = vi.fn()
const mockGetAccessStatus = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(mockSelectSingle),
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/paywall', () => ({
  getAccessStatus: mockGetAccessStatus,
}))

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
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 404 when recipe not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelectSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'unknown' }) })
    expect(res.status).toBe(404)
  })

  it('returns recipe with sorted ingredients for a user with full access', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelectSingle.mockResolvedValue({ data: MOCK_RECIPE, error: null })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('Hähnchen mit Reis')
    expect(data.ingredients).toHaveLength(2)
    expect(data.ingredients[0].name).toBe('Hähnchenbrust')
    expect(data.imageUrl).toBeNull()
  })

  it('constructs image URL when image_path exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelectSingle.mockResolvedValue({
      data: { ...MOCK_RECIPE, image_path: 'abc123.jpg' },
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    const data = await res.json()
    expect(data.imageUrl).toContain('abc123.jpg')
    expect(data.imageUrl).toContain('recipe-images')
  })

  // PROJ-11 (Refinement, QA-Fix): BUG-2 — ohne diese Prüfung konnte jede authentifizierte
  // Session (Gast oder abgelaufener Trial) den vollen Rezeptinhalt per direktem API-Aufruf
  // abrufen und damit den Sperrbildschirm von /rezept/[id] umgehen.
  it('returns 403 for an anonymous (guest) user when the recipe is not guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'guest-1', is_anonymous: true } } })
    mockSelectSingle.mockResolvedValue({ data: MOCK_RECIPE, error: null })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(403)
    expect(mockGetAccessStatus).not.toHaveBeenCalled()
  })

  it('returns 200 for an anonymous (guest) user when the recipe IS guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'guest-1', is_anonymous: true } } })
    mockSelectSingle.mockResolvedValue({ data: { ...MOCK_RECIPE, is_guest_visible: true }, error: null })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(200)
  })

  it('returns 403 for a registered user with an expired trial (no subscription, no invite) when the recipe is not guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockGetAccessStatus.mockResolvedValue({ hasAccess: false })
    mockSelectSingle.mockResolvedValue({ data: MOCK_RECIPE, error: null })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(403)
  })

  it('returns 200 for a registered user with an expired trial when the recipe IS guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockGetAccessStatus.mockResolvedValue({ hasAccess: false })
    mockSelectSingle.mockResolvedValue({ data: { ...MOCK_RECIPE, is_guest_visible: true }, error: null })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(200)
  })

  // PROJ-30: ein eigenes Rezept darf nie hinter der Paywall-Sperre landen, auch wenn es
  // (wie jedes Nutzer-Rezept) nicht als is_guest_visible markiert ist.
  it('returns 200 for a registered user with an expired trial when the recipe is their OWN, even if not guest-visible', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockGetAccessStatus.mockResolvedValue({ hasAccess: false })
    mockSelectSingle.mockResolvedValue({ data: { ...MOCK_RECIPE, is_guest_visible: false, owner_id: 'user-1' }, error: null })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(200)
  })

  it('returns 403 for a registered user with an expired trial when the recipe belongs to ANOTHER user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    mockGetAccessStatus.mockResolvedValue({ hasAccess: false })
    mockSelectSingle.mockResolvedValue({ data: { ...MOCK_RECIPE, is_guest_visible: false, owner_id: 'user-2' }, error: null })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'recipe-1' }) })
    expect(res.status).toBe(403)
  })
})
