import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSessionRetrieve = vi.fn()
const mockEq = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
const adminFrom = vi.fn().mockReturnValue({ update: mockUpdate })

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({ from: adminFrom }),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { retrieve: mockSessionRetrieve } },
  },
}))

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/stripe/sync-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/stripe/sync-session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    adminFrom.mockReturnValue({ update: mockUpdate })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ sessionId: 'cs_test_1' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when sessionId is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 403 when the session belongs to a different user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSessionRetrieve.mockResolvedValue({ client_reference_id: 'someone-else', status: 'complete' })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ sessionId: 'cs_test_1' }))
    expect(res.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns null subscriptionStatus when the session is not complete yet', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSessionRetrieve.mockResolvedValue({ client_reference_id: 'user-1', status: 'open' })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ sessionId: 'cs_test_1' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ subscriptionStatus: null })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('updates the profile and returns active when the session is complete', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSessionRetrieve.mockResolvedValue({
      client_reference_id: 'user-1',
      status: 'complete',
      customer: 'cus_new',
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ sessionId: 'cs_test_1' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ subscriptionStatus: 'active' })
    expect(mockUpdate).toHaveBeenCalledWith({ stripe_customer_id: 'cus_new', subscription_status: 'active' })
    expect(mockEq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('returns 500 when Stripe throws', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSessionRetrieve.mockRejectedValue(new Error('Stripe down'))
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ sessionId: 'cs_test_1' }))
    expect(res.status).toBe(500)
  })
})
