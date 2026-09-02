import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const adminFrom = vi.fn()
const mockCreateClient = vi.fn()
const mockCreateAdminClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient,
}))

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/mahlzeiten-ziel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function profileUpdateChain(error: object | null = null) {
  const updateFn = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error }),
  })
  return { _updateFn: updateFn, chain: { update: updateFn } }
}

beforeEach(() => {
  vi.resetAllMocks()
  mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser } })
  mockCreateAdminClient.mockReturnValue({ from: adminFrom })
})

describe('POST /api/mahlzeiten-ziel', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mahlzeitenProTag: 3 }))
    expect(res.status).toBe(401)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 403 for anonymous (guest) sessions — guests must not persist data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: true } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mahlzeitenProTag: 3 }))
    expect(res.status).toBe(403)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it.each([0, 7, -1])('returns 400 when mahlzeitenProTag is out of range (%d)', async (value) => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mahlzeitenProTag: value }))
    expect(res.status).toBe(400)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 400 for a non-integer value', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mahlzeitenProTag: 3.5 }))
    expect(res.status).toBe(400)
  })

  it('saves a valid value scoped to the authenticated user and returns success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { _updateFn, chain } = profileUpdateChain()
    adminFrom.mockReturnValueOnce(chain)
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mahlzeitenProTag: 4 }))
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(_updateFn).toHaveBeenCalledWith({ mahlzeiten_pro_tag: 4 })
    const eqCall = _updateFn.mock.results[0].value.eq
    expect(eqCall).toHaveBeenCalledWith('id', 'user-1')
  })

  it('returns 500 when the database update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { chain } = profileUpdateChain({ message: 'db error' })
    adminFrom.mockReturnValueOnce(chain)
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ mahlzeitenProTag: 3 }))
    expect(res.status).toBe(500)
  })
})
