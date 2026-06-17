import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const adminFrom = vi.fn()
const mockCreateClient = vi.fn()
const mockCreateAdminClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient,
}))

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/invite/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ─── Mock chain builders ───────────────────────────────────────────────────

function attemptsCountChain(count: number) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        gte: vi.fn().mockResolvedValue({ count, error: null }),
      }),
    }),
  }
}

function attemptsInsertChain() {
  const insertFn = vi.fn().mockResolvedValue({ error: null })
  return { _insertFn: insertFn, chain: { insert: insertFn } }
}

function profileSelectChain(profile: object | null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: profile, error: null }),
      }),
    }),
  }
}

function codeUpdateChain(returnedCode: { code: string } | null) {
  const updateFn = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      is: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: returnedCode,
            error: returnedCode ? null : { code: 'PGRST116' },
          }),
        }),
      }),
    }),
  })
  return { _updateFn: updateFn, chain: { update: updateFn } }
}

function profileUpdateChain() {
  const updateFn = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  })
  return { _updateFn: updateFn, chain: { update: updateFn } }
}

// ─── Profiles ──────────────────────────────────────────────────────────────

const PROFILE_NONE = { invite_code_redeemed_at: null, subscription_status: null }
const PROFILE_HAS_INVITE = { invite_code_redeemed_at: '2026-06-17T10:00:00Z', subscription_status: null }
const PROFILE_HAS_SUB = { invite_code_redeemed_at: null, subscription_status: 'active' }

// ─── Setup ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks()
  mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser } })
  mockCreateAdminClient.mockReturnValue({ from: adminFrom })
})

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/invite/redeem', () => {

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ code: 'TESTCODE' }))
    expect(res.status).toBe(401)
  })

  it('returns 422 for missing code (schema validation — no DB call needed)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // No adminFrom setup needed: schema check happens before any DB call
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(422)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 422 (same message) when rate limit exceeded — no DB call beyond attempts count', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    adminFrom.mockReturnValueOnce(attemptsCountChain(10))
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ code: 'ANYCODE' }))
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.error).toContain('ungültig')
    // Only one from() call (attempts count) — no profile read
    expect(adminFrom).toHaveBeenCalledTimes(1)
  })

  it('returns alreadyHasAccess when user already has invite access — code not consumed', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { _updateFn, chain } = codeUpdateChain({ code: 'VALID' })
    adminFrom
      .mockReturnValueOnce(attemptsCountChain(0))  // rate limit: 0 attempts
      .mockReturnValueOnce(profileSelectChain(PROFILE_HAS_INVITE))  // already has invite
    // codeUpdateChain not queued — should never be called
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ code: 'VALID' }))
    expect(res.status).toBe(200)
    expect((await res.json()).alreadyHasAccess).toBe(true)
    expect(_updateFn).not.toHaveBeenCalled()
    void chain // suppress unused warning
  })

  it('returns alreadyHasAccess when user has active subscription — code not consumed', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { _updateFn, chain } = codeUpdateChain({ code: 'VALID' })
    adminFrom
      .mockReturnValueOnce(attemptsCountChain(0))
      .mockReturnValueOnce(profileSelectChain(PROFILE_HAS_SUB))
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ code: 'VALID' }))
    expect(res.status).toBe(200)
    expect((await res.json()).alreadyHasAccess).toBe(true)
    expect(_updateFn).not.toHaveBeenCalled()
    void chain
  })

  it('returns 422 and logs attempt when code does not exist or is already redeemed', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { _insertFn, chain: attemptsInsert } = attemptsInsertChain()
    adminFrom
      .mockReturnValueOnce(attemptsCountChain(0))
      .mockReturnValueOnce(profileSelectChain(PROFILE_NONE))
      .mockReturnValueOnce(codeUpdateChain(null).chain)   // code not found
      .mockReturnValueOnce(attemptsInsert)                 // log failed attempt
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ code: 'BADCODE' }))
    expect(res.status).toBe(422)
    expect(_insertFn).toHaveBeenCalledWith({ user_id: 'user-1' })
  })

  it('grants access and returns success on valid code', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { _updateFn: profileUpdate, chain: profileUpdateC } = profileUpdateChain()
    adminFrom
      .mockReturnValueOnce(attemptsCountChain(0))
      .mockReturnValueOnce(profileSelectChain(PROFILE_NONE))
      .mockReturnValueOnce(codeUpdateChain({ code: 'aB3kR7mX' }).chain)
      .mockReturnValueOnce(profileUpdateC)
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ code: 'aB3kR7mX' }))
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(profileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ invite_code_redeemed_at: expect.any(String) })
    )
  })

  it('trims whitespace from code before DB lookup (case preserved)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { _updateFn: codeUpdate, chain: codeChain } = codeUpdateChain({ code: 'aB3kR7mX' })
    adminFrom
      .mockReturnValueOnce(attemptsCountChain(0))
      .mockReturnValueOnce(profileSelectChain(PROFILE_NONE))
      .mockReturnValueOnce(codeChain)
      .mockReturnValueOnce(profileUpdateChain().chain)
    const { POST } = await import('./route')
    await POST(makeRequest({ code: '  aB3kR7mX  ' }))
    // Whitespace trimmed, case preserved
    const eqCall = codeUpdate.mock.results[0].value.eq
    expect(eqCall).toHaveBeenCalledWith('code', 'aB3kR7mX')
  })

  it('allows exactly 9 attempts (not yet rate-limited) but still rejects invalid code', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    adminFrom
      .mockReturnValueOnce(attemptsCountChain(9))
      .mockReturnValueOnce(profileSelectChain(PROFILE_NONE))
      .mockReturnValueOnce(codeUpdateChain(null).chain)
      .mockReturnValueOnce(attemptsInsertChain().chain)
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ code: 'BADCODE' }))
    expect(res.status).toBe(422)
  })
})
