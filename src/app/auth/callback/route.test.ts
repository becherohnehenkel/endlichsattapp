import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockExchangeCodeForSession = vi.fn()
const adminFrom = vi.fn()
const mockCreateClient = vi.fn()
const mockCreateAdminClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient,
}))

function makeRequest(params: string = 'code=abc123') {
  return new Request(`http://localhost/auth/callback?${params}`)
}

function profilesUpdateChain() {
  const eqFn = vi.fn().mockReturnValue({ is: vi.fn().mockResolvedValue({ error: null }) })
  const updateFn = vi.fn().mockReturnValue({ eq: eqFn })
  return { _updateFn: updateFn, _eqFn: eqFn, chain: { update: updateFn } }
}

beforeEach(() => {
  vi.resetAllMocks()
  mockCreateClient.mockResolvedValue({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  })
  mockCreateAdminClient.mockReturnValue({ from: adminFrom })
})

describe('GET /auth/callback', () => {
  it('redirects to the error page when exchangeCodeForSession fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ data: { user: null }, error: { message: 'invalid code' } })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth/bestaetigen?fehler=1')
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('redirects to /analyse by default and does not touch profiles when no consent metadata is set', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: { id: 'user-1', user_metadata: {} } },
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.headers.get('location')).toContain('/analyse')
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('backfills the consent timestamp when signup metadata carries gesundheitsdaten_einwilligung: true', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: { id: 'user-1', user_metadata: { gesundheitsdaten_einwilligung: true } } },
      error: null,
    })
    const { _updateFn, _eqFn, chain } = profilesUpdateChain()
    adminFrom.mockReturnValueOnce(chain)
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(adminFrom).toHaveBeenCalledWith('profiles')
    expect(_updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ gesundheitsdaten_einwilligung_at: expect.any(String) })
    )
    expect(_eqFn).toHaveBeenCalledWith('id', 'user-1')
    // PROJ-52: idempotent backfill — only fires when no timestamp is set yet.
    const isFn = _eqFn.mock.results[0].value.is
    expect(isFn).toHaveBeenCalledWith('gesundheitsdaten_einwilligung_at', null)
    expect(res.headers.get('location')).toContain('/analyse')
  })

  it('does not backfill when consent metadata is explicitly false', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: { id: 'user-1', user_metadata: { gesundheitsdaten_einwilligung: false } } },
      error: null,
    })
    const { GET } = await import('./route')
    await GET(makeRequest())
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('honors a safe relative "next" redirect target', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: { id: 'user-1', user_metadata: {} } },
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET(makeRequest('code=abc123&next=/konto'))
    expect(res.headers.get('location')).toContain('/konto')
  })

  it('falls back to /analyse for an absolute or protocol-relative "next" (open-redirect guard)', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: { id: 'user-1', user_metadata: {} } },
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET(makeRequest('code=abc123&next=%2F%2Fevil.example.com'))
    expect(res.headers.get('location')).toContain('/analyse')
    expect(res.headers.get('location')).not.toContain('evil.example.com')
  })

  it('redirects to the error page when no code is present', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest(''))
    expect(res.headers.get('location')).toContain('/auth/bestaetigen?fehler=1')
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
  })
})
