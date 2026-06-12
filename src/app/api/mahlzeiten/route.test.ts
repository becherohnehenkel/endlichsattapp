import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockMealsRange = vi.fn()
const mockCreateSignedUrl = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: mockMealsRange,
            }),
          }),
        }),
      }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUrl: mockCreateSignedUrl,
      }),
    },
  }),
}))

function makeRequest(url = 'http://localhost/api/mahlzeiten') {
  return new Request(url)
}

describe('GET /api/mahlzeiten', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns meals for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealsRange.mockResolvedValue({
      data: [
        {
          id: 'meal-1',
          free_text: 'Spaghetti Bolognese',
          photo_thumbnail_path: null,
          created_at: '2026-06-10T12:00:00Z',
          meal_analyses: [{ satiety_scores_before: { overall: 'sehr_saettigend' } }],
        },
      ],
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.meals).toHaveLength(1)
    expect(data.meals[0].freeText).toBe('Spaghetti Bolognese')
    expect(data.meals[0].gesamtbewertung).toBe('sehr_saettigend')
    expect(data.meals[0].thumbnailUrl).toBeNull()
    expect(data.hasMore).toBe(false)
  })

  it('generates signed URL when thumbnail path exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealsRange.mockResolvedValue({
      data: [
        {
          id: 'meal-1',
          free_text: null,
          photo_thumbnail_path: 'user-1/thumbs/photo.jpg',
          created_at: '2026-06-10T12:00:00Z',
          meal_analyses: [],
        },
      ],
      error: null,
    })
    mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.url/photo.jpg' } })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.meals[0].thumbnailUrl).toBe('https://signed.url/photo.jpg')
  })

  it('sets hasMore true when limit meals returned', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const twentyMeals = Array.from({ length: 20 }, (_, i) => ({
      id: `meal-${i}`,
      free_text: `Meal ${i}`,
      photo_thumbnail_path: null,
      created_at: '2026-06-10T12:00:00Z',
      meal_analyses: [],
    }))
    mockMealsRange.mockResolvedValue({ data: twentyMeals, error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.hasMore).toBe(true)
    expect(data.meals).toHaveLength(20)
  })

  it('returns null gesamtbewertung when no analysis exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealsRange.mockResolvedValue({
      data: [{ id: 'meal-1', free_text: 'Test', photo_thumbnail_path: null, created_at: '2026-06-10T12:00:00Z', meal_analyses: [] }],
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.meals[0].gesamtbewertung).toBeNull()
  })

  it('returns 500 on DB error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealsRange.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(500)
  })

  it('respects offset query parameter', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealsRange.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    await GET(makeRequest('http://localhost/api/mahlzeiten?limit=5&offset=10'))
    expect(mockMealsRange).toHaveBeenCalledWith(10, 14)
  })

  it('caps limit at 50', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealsRange.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    await GET(makeRequest('http://localhost/api/mahlzeiten?limit=100'))
    expect(mockMealsRange).toHaveBeenCalledWith(0, 49)
  })
})
