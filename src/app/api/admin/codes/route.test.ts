import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const adminFrom = vi.fn()
const mockCreateClient = vi.fn()
const mockCreateAdminClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({ createClient: mockCreateClient }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: mockCreateAdminClient }))

const ADMIN_EMAIL = 'admin@endlichsatt.dev'

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubEnv('ADMIN_EMAIL', ADMIN_EMAIL)
  mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser } })
  mockCreateAdminClient.mockReturnValue({ from: adminFrom })
})

function insertChain(error: object | null = null) {
  const insertFn = vi.fn().mockResolvedValue({ error })
  return { insert: insertFn }
}

describe('POST /api/admin/codes', () => {
  it('returns 403 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(403)
  })

  it('returns 403 when user is not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'user@example.com' } } })
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(403)
  })

  it('generates a code and returns 200 on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: ADMIN_EMAIL } } })
    adminFrom.mockReturnValueOnce(insertChain(null))
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.code).toHaveLength(8)
    expect(data.code).toMatch(/^[A-Za-z0-9]{8}$/)
  })

  it('retries on unique-constraint collision and returns new code', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: ADMIN_EMAIL } } })
    // First attempt: unique violation, second: success
    adminFrom
      .mockReturnValueOnce(insertChain({ code: '23505' }))
      .mockReturnValueOnce(insertChain(null))
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.code).toHaveLength(8)
    expect(adminFrom).toHaveBeenCalledTimes(2)
  })

  it('returns 500 after exhausting all retry attempts', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: ADMIN_EMAIL } } })
    const collision = insertChain({ code: '23505' })
    adminFrom
      .mockReturnValueOnce(collision)
      .mockReturnValueOnce(collision)
      .mockReturnValueOnce(collision)
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(500)
  })

  it('returns 500 on non-collision DB error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: ADMIN_EMAIL } } })
    adminFrom.mockReturnValueOnce(insertChain({ code: '42000', message: 'DB error' }))
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(500)
  })
})
