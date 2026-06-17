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

function makeParams(code: string) {
  return { params: Promise.resolve({ code }) }
}

function deleteChain(returnedCode: string | null) {
  return {
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: returnedCode ? { code: returnedCode } : null,
              error: returnedCode ? null : { code: 'PGRST116' },
            }),
          }),
        }),
      }),
    }),
  }
}

function selectChain(profile: { redeemed_by: string | null } | null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: profile, error: null }),
      }),
    }),
  }
}

describe('DELETE /api/admin/codes/[code]', () => {
  it('returns 403 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('TEST1234'))
    expect(res.status).toBe(403)
  })

  it('returns 403 when user is not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'user@example.com' } } })
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('TEST1234'))
    expect(res.status).toBe(403)
  })

  it('deletes unredeemed code and returns 200', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: ADMIN_EMAIL } } })
    adminFrom.mockReturnValueOnce(deleteChain('aB3kR7mX'))
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('aB3kR7mX'))
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
  })

  it('returns 409 when code is already redeemed', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: ADMIN_EMAIL } } })
    // DELETE finds nothing (code redeemed), then SELECT confirms it has redeemed_by
    adminFrom
      .mockReturnValueOnce(deleteChain(null))
      .mockReturnValueOnce(selectChain({ redeemed_by: 'some-user-id' }))
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('REDEEMED'))
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toContain('eingelöst')
  })

  it('returns 404 when code does not exist at all', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: ADMIN_EMAIL } } })
    adminFrom
      .mockReturnValueOnce(deleteChain(null))
      .mockReturnValueOnce(selectChain(null))
    const { DELETE } = await import('./route')
    const res = await DELETE(new Request('http://localhost'), makeParams('NOTFOUND'))
    expect(res.status).toBe(404)
  })
})
