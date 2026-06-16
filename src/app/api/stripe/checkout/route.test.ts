import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockProfileSingle = vi.fn()
const mockCheckoutCreate = vi.fn()

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
    checkout: { sessions: { create: mockCheckoutCreate } },
  },
}))

function makeRequest() {
  return new Request('http://localhost/api/stripe/checkout', { method: 'POST' })
}

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_PRICE_ID = 'price_test123'
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
  })

  it('creates a session with customer_email when no stripe_customer_id exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@b.de' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: null } })
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session-1' })

    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/session-1' })

    const callArgs = mockCheckoutCreate.mock.calls[0][0]
    expect(callArgs.customer_email).toBe('a@b.de')
    expect(callArgs.customer).toBeUndefined()
    expect(callArgs.client_reference_id).toBe('user-1')
    expect(callArgs.mode).toBe('subscription')
  })

  it('reuses the existing stripe_customer_id instead of customer_email', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@b.de' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_existing' } })
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session-2' })

    const { POST } = await import('./route')
    await POST(makeRequest())

    const callArgs = mockCheckoutCreate.mock.calls[0][0]
    expect(callArgs.customer).toBe('cus_existing')
    expect(callArgs.customer_email).toBeUndefined()
  })

  it('returns 500 when Stripe does not return a url', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@b.de' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: null } })
    mockCheckoutCreate.mockResolvedValue({ url: null })

    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })

  it('returns 500 when Stripe throws', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@b.de' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: null } })
    mockCheckoutCreate.mockRejectedValue(new Error('Stripe down'))

    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })
})
