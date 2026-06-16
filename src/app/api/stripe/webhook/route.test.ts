import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockConstructEvent = vi.fn()
const mockEq = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
const adminFrom = vi.fn().mockReturnValue({ update: mockUpdate })

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: mockConstructEvent },
  },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({ from: adminFrom }),
}))

function makeRequest(body: string, signature: string | null = 'sig_test') {
  const headers: Record<string, string> = {}
  if (signature) headers['stripe-signature'] = signature
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers,
    body,
  })
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    adminFrom.mockReturnValue({ update: mockUpdate })
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  })

  it('returns 400 when the stripe-signature header is missing', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}', null))
    expect(res.status).toBe(400)
    expect(mockConstructEvent).not.toHaveBeenCalled()
  })

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('bad signature') })
    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(400)
  })

  it('updates the profile on checkout.session.completed', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { client_reference_id: 'user-1', customer: 'cus_new' } },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(adminFrom).toHaveBeenCalledWith('profiles')
    expect(mockUpdate).toHaveBeenCalledWith({ stripe_customer_id: 'cus_new', subscription_status: 'active' })
    expect(mockEq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('updates the profile by stripe_customer_id on customer.subscription.updated', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: { object: { customer: 'cus_existing', status: 'past_due' } },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({ subscription_status: 'past_due' })
    expect(mockEq).toHaveBeenCalledWith('stripe_customer_id', 'cus_existing')
  })

  it('updates the profile to canceled on customer.subscription.deleted', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { customer: 'cus_existing', status: 'canceled' } },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({ subscription_status: 'canceled' })
  })

  it('ignores unhandled event types without erroring', async () => {
    mockConstructEvent.mockReturnValue({ type: 'invoice.created', data: { object: {} } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 500 when DB handling throws', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { client_reference_id: 'user-1', customer: 'cus_new' } },
    })
    mockEq.mockRejectedValue(new Error('DB error'))
    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(500)
  })
})
