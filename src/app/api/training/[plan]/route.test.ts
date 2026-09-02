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
  return new Request('http://localhost/api/training/zuhause-ohne-equipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeParams(plan: string) {
  return { params: Promise.resolve({ plan }) }
}

const VALID_BODY = {
  uebungen: {
    kniebeuge: {
      pause: '60 Sek.',
      saetze: [
        { wiederholungen: '12', gewicht: '' },
        { wiederholungen: '12', gewicht: '' },
        { wiederholungen: '10', gewicht: '' },
      ],
    },
  },
}

function insertChain(error: object | null = null) {
  const insertFn = vi.fn().mockResolvedValue({ error })
  return { _insertFn: insertFn, chain: { insert: insertFn } }
}

beforeEach(() => {
  vi.resetAllMocks()
  mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser } })
  mockCreateAdminClient.mockReturnValue({ from: adminFrom })
})

describe('POST /api/training/[plan]', () => {
  it('returns 404 for an unknown plan slug', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_BODY), makeParams('does-not-exist'))
    expect(res.status).toBe(404)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_BODY), makeParams('zuhause-ohne-equipment'))
    expect(res.status).toBe(401)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 403 for anonymous (guest) sessions — guests must not persist data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: true } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_BODY), makeParams('zuhause-ohne-equipment'))
    expect(res.status).toBe(403)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 400 for a malformed body (missing saetze)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ uebungen: { kniebeuge: { pause: '60 Sek.' } } }), makeParams('zuhause-ohne-equipment'))
    expect(res.status).toBe(400)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 400 when a submitted exercise id does not belong to the plan', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const body = { uebungen: { 'nicht-existente-uebung': VALID_BODY.uebungen.kniebeuge } }
    const res = await POST(makeRequest(body), makeParams('zuhause-ohne-equipment'))
    expect(res.status).toBe(400)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('saves a valid session scoped to the authenticated user and returns success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { _insertFn, chain } = insertChain()
    adminFrom.mockReturnValueOnce(chain)
    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_BODY), makeParams('zuhause-ohne-equipment'))
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(_insertFn).toHaveBeenCalledWith({
      user_id: 'user-1',
      plan_slug: 'zuhause-ohne-equipment',
      uebungen: VALID_BODY.uebungen,
    })
  })

  it('returns 500 when the database insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { chain } = insertChain({ message: 'db error' })
    adminFrom.mockReturnValueOnce(chain)
    const { POST } = await import('./route')
    const res = await POST(makeRequest(VALID_BODY), makeParams('zuhause-ohne-equipment'))
    expect(res.status).toBe(500)
  })
})
