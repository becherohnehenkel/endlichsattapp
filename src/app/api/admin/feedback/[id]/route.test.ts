import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      }),
    }),
  }),
}))

function params(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('PATCH /api/admin/feedback/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_EMAIL = 'admin@test.com'
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { PATCH } = await import('./route')
    const res = await PATCH(new Request('http://localhost'), params('fb-1'))
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'other@example.com' } } })
    const { PATCH } = await import('./route')
    const res = await PATCH(new Request('http://localhost'), params('fb-1'))
    expect(res.status).toBe(403)
  })

  it('marks feedback as resolved for admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockSingle.mockResolvedValue({ data: { id: 'fb-1' }, error: null })
    const { PATCH } = await import('./route')
    const res = await PATCH(new Request('http://localhost'), params('fb-1'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('returns 404 when feedback does not exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { PATCH } = await import('./route')
    const res = await PATCH(new Request('http://localhost'), params('does-not-exist'))
    expect(res.status).toBe(404)
  })
})
