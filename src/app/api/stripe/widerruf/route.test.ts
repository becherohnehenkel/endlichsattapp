import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockProfileSingle = vi.fn()
const mockSubsList = vi.fn()
const mockSubsCancel = vi.fn()
const mockMailjetRequest = vi.fn()
const mockMailjetPost = vi.fn(() => ({ request: mockMailjetRequest }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockProfileSingle,
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: {
      list: mockSubsList,
      cancel: mockSubsCancel,
    },
  },
}))

vi.mock('node-mailjet', () => ({
  Client: vi.fn(function () {
    return { post: mockMailjetPost }
  }),
}))

function makeRequest() {
  return new Request('http://localhost/api/stripe/widerruf', { method: 'POST' })
}

const ACTIVE_SUB = { id: 'sub_abc123', status: 'active' }

describe('POST /api/stripe/widerruf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('MAILJET_API_KEY', 'test-key')
    vi.stubEnv('MAILJET_SECRET_KEY', 'test-secret')
    vi.stubEnv('MAILJET_FROM_EMAIL', 'hallo@mehralsabnehmen.de')
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com')
    mockMailjetRequest.mockResolvedValue({ body: { Messages: [{ Status: 'success' }] } })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(401)
  })

  it('returns 404 when user has no stripe_customer_id', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: null } })
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(404)
  })

  it('returns 404 when no active subscription is found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' } })
    mockSubsList.mockResolvedValue({ data: [] })
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(404)
  })

  it('returns 404 when found subscription is not active', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' } })
    mockSubsList.mockResolvedValue({ data: [{ id: 'sub_123', status: 'past_due' }] })
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(404)
  })

  it('cancels the subscription and sends confirmation email on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' } })
    mockSubsList.mockResolvedValue({ data: [ACTIVE_SUB] })
    mockSubsCancel.mockResolvedValue({ id: ACTIVE_SUB.id, status: 'canceled' })

    const { POST } = await import('./route')
    const res = await POST()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(mockSubsCancel).toHaveBeenCalledWith(ACTIVE_SUB.id)
    expect(mockMailjetPost).toHaveBeenCalledWith('send', { version: 'v3.1' })
    expect(mockMailjetRequest).toHaveBeenCalledOnce()
  })

  it('includes BCC to ADMIN_EMAIL in the confirmation email', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' } })
    mockSubsList.mockResolvedValue({ data: [ACTIVE_SUB] })
    mockSubsCancel.mockResolvedValue({ id: ACTIVE_SUB.id, status: 'canceled' })

    const { POST } = await import('./route')
    await POST()

    const callArg = mockMailjetRequest.mock.calls[0][0] as { Messages: { Bcc?: { Email: string }[] }[] }
    expect(callArg.Messages[0].Bcc).toEqual([{ Email: 'admin@example.com' }])
  })

  it('sends to the user email', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' } })
    mockSubsList.mockResolvedValue({ data: [ACTIVE_SUB] })
    mockSubsCancel.mockResolvedValue({ id: ACTIVE_SUB.id, status: 'canceled' })

    const { POST } = await import('./route')
    await POST()

    const callArg = mockMailjetRequest.mock.calls[0][0] as { Messages: { To: { Email: string }[] }[] }
    expect(callArg.Messages[0].To).toEqual([{ Email: 'user@example.com' }])
  })

  it('also handles trialing subscriptions', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' } })
    mockSubsList.mockResolvedValue({ data: [{ id: 'sub_trial', status: 'trialing' }] })
    mockSubsCancel.mockResolvedValue({ id: 'sub_trial', status: 'canceled' })

    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(200)
    expect(mockSubsCancel).toHaveBeenCalledWith('sub_trial')
  })

  it('returns 500 when Stripe cancel throws', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' } })
    mockSubsList.mockResolvedValue({ data: [ACTIVE_SUB] })
    mockSubsCancel.mockRejectedValue(new Error('Stripe down'))

    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(500)
    expect(mockMailjetRequest).not.toHaveBeenCalled()
  })

  it('returns 500 when Mailjet throws', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_123' } })
    mockSubsList.mockResolvedValue({ data: [ACTIVE_SUB] })
    mockSubsCancel.mockResolvedValue({ id: ACTIVE_SUB.id, status: 'canceled' })
    mockMailjetRequest.mockRejectedValue(new Error('Mail service unavailable'))

    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(500)
  })
})
