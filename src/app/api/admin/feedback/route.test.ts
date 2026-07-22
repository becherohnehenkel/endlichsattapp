import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockOrder2 = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: mockOrder2,
        }),
      }),
    }),
  }),
}))

describe('GET /api/admin/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_EMAIL = 'admin@test.com'
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'other@example.com' } } })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('returns feedback list for admin, open entries first', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockOrder2.mockResolvedValue({
      data: [{ id: 'fb-1', message: 'Fehler in der Bewertung', page_type: 'rezept', reference_id: 'r1', snapshot: {}, resolved: false, created_at: '2026-07-21' }],
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.feedback).toHaveLength(1)
    expect(data.feedback[0].id).toBe('fb-1')
  })

  it('returns 500 on DB error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'admin@test.com' } } })
    mockOrder2.mockResolvedValue({ data: null, error: { message: 'db error' } })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(500)
  })
})
