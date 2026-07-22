import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockRpc = vi.fn()
const mockInsert = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve({
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
    from: vi.fn().mockReturnValue({
      insert: mockInsert,
    }),
  })),
}))

const VALID_BODY = {
  message: 'Der Baustein Biss wurde falsch bewertet.',
  pageType: 'mahlzeit_analyse',
  referenceId: '11111111-1111-4111-8111-111111111111',
  snapshot: { bausteine: { biss: 'gut' } },
}

function request(body: unknown) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/feedback', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(request(VALID_BODY))
    expect(res.status).toBe(401)
  })

  it('returns 400 on empty message', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const { POST } = await import('./route')
    const res = await POST(request({ ...VALID_BODY, message: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 on invalid pageType', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const { POST } = await import('./route')
    const res = await POST(request({ ...VALID_BODY, pageType: 'irgendwas' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 on message longer than 500 characters', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const { POST } = await import('./route')
    const res = await POST(request({ ...VALID_BODY, message: 'x'.repeat(501) }))
    expect(res.status).toBe(400)
  })

  it('returns 429 when daily rate limit is reached', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockRpc.mockResolvedValue({ data: null, error: null })
    const { POST } = await import('./route')
    const res = await POST(request(VALID_BODY))
    expect(res.status).toBe(429)
  })

  it('creates feedback and returns 201 on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockRpc.mockResolvedValue({ data: 4, error: null })
    mockInsert.mockResolvedValue({ error: null })
    const { POST } = await import('./route')
    const res = await POST(request(VALID_BODY))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('returns 500 when the insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockRpc.mockResolvedValue({ data: 4, error: null })
    mockInsert.mockResolvedValue({ error: { message: 'db error' } })
    const { POST } = await import('./route')
    const res = await POST(request(VALID_BODY))
    expect(res.status).toBe(500)
  })
})
