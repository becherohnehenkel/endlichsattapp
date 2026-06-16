import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockProfileSingle = vi.fn()
const mockPortalCreate = vi.fn()

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
    billingPortal: { sessions: { create: mockPortalCreate } },
  },
}))

function makeRequest() {
  return new Request('http://localhost/api/stripe/portal', { method: 'POST' })
}

describe('POST /api/stripe/portal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 404 when the user has no stripe_customer_id', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(404)
  })

  it('returns the portal url for an existing customer', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_existing' } })
    mockPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/portal-1' })

    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ url: 'https://billing.stripe.com/portal-1' })
    expect(mockPortalCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existing' })
    )
  })

  it('returns 500 when Stripe throws', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockProfileSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_existing' } })
    mockPortalCreate.mockRejectedValue(new Error('Stripe down'))

    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })
})
