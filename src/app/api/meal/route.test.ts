import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSingle = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    }),
  }),
}))

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/meal', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Re-import to pick up fresh mocks
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ freeText: 'Salat' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when neither photo nor text provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('returns 400 when freeText only whitespace', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ freeText: '   ' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when freeText exceeds 1000 chars', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ freeText: 'a'.repeat(1001) }))
    expect(res.status).toBe(400)
  })

  it('creates meal with freeText and returns id', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: { id: 'meal-123' }, error: null })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ freeText: 'Hähnchen mit Reis' }))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ id: 'meal-123' })
  })

  it('creates meal with photoPath only', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: { id: 'meal-456' }, error: null })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ photoPath: 'user-1/abc.jpg' }))
    expect(res.status).toBe(201)
  })

  it('returns 500 when database insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ freeText: 'Test' }))
    expect(res.status).toBe(500)
  })
})
