import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const userMaybeSingle = vi.fn()
const adminFrom = vi.fn()
const mockCreateClient = vi.fn()
const mockCreateAdminClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient,
}))

function makeRequest() {
  return new Request('http://localhost/api/einwilligung/gesundheitsdaten')
}

function profilesUpdateChain(error: object | null = null) {
  const updateFn = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error }),
  })
  return { _updateFn: updateFn, chain: { update: updateFn } }
}

function checkInDeleteChain(error: object | null = null) {
  const eqFn = vi.fn().mockResolvedValue({ error })
  return { _eqFn: eqFn, chain: { delete: vi.fn().mockReturnValue({ eq: eqFn }) } }
}

beforeEach(() => {
  vi.resetAllMocks()
  mockCreateClient.mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle: userMaybeSingle }),
      }),
    }),
  })
  mockCreateAdminClient.mockReturnValue({ from: adminFrom })
})

describe('GET /api/einwilligung/gesundheitsdaten', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns eingewilligt: true when a consent timestamp is set', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    userMaybeSingle.mockResolvedValue({ data: { gesundheitsdaten_einwilligung_at: '2026-09-08T00:00:00Z' } })
    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()
    expect(data.eingewilligt).toBe(true)
  })

  it('returns eingewilligt: false when no consent timestamp is set', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    userMaybeSingle.mockResolvedValue({ data: { gesundheitsdaten_einwilligung_at: null } })
    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()
    expect(data.eingewilligt).toBe(false)
  })

  it('returns eingewilligt: false when no profile row exists yet', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    userMaybeSingle.mockResolvedValue({ data: null })
    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()
    expect(data.eingewilligt).toBe(false)
  })
})

describe('POST /api/einwilligung/gesundheitsdaten', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(401)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 403 for anonymous (guest) sessions', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: true } } })
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(403)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('sets the consent timestamp for a logged-in, non-anonymous user and returns success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { _updateFn, chain } = profilesUpdateChain()
    adminFrom.mockReturnValueOnce(chain)
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(_updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ gesundheitsdaten_einwilligung_at: expect.any(String) })
    )
    const eqCall = _updateFn.mock.results[0].value.eq
    expect(eqCall).toHaveBeenCalledWith('id', 'user-1')
  })

  it('returns 500 when the database update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { chain } = profilesUpdateChain({ message: 'db error' })
    adminFrom.mockReturnValueOnce(chain)
    const { POST } = await import('./route')
    const res = await POST()
    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/einwilligung/gesundheitsdaten', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { DELETE } = await import('./route')
    const res = await DELETE()
    expect(res.status).toBe(401)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 403 for anonymous (guest) sessions', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: true } } })
    const { DELETE } = await import('./route')
    const res = await DELETE()
    expect(res.status).toBe(403)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('deletes all wochen_check_ins rows and nulls the profile fields, in that order', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { chain: checkInChain, _eqFn } = checkInDeleteChain()
    const { _updateFn, chain: profileChain } = profilesUpdateChain()
    adminFrom.mockReturnValueOnce(checkInChain).mockReturnValueOnce(profileChain)

    const { DELETE } = await import('./route')
    const res = await DELETE()

    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(adminFrom).toHaveBeenNthCalledWith(1, 'wochen_check_ins')
    expect(_eqFn).toHaveBeenCalledWith('user_id', 'user-1')
    expect(adminFrom).toHaveBeenNthCalledWith(2, 'profiles')
    expect(_updateFn).toHaveBeenCalledWith({
      gesundheitsdaten_einwilligung_at: null,
      kcal_gewicht_kg: null,
      kcal_groesse_cm: null,
      kcal_alter_jahre: null,
      kcal_geschlecht: null,
      kcal_aktivitaetslevel: null,
      kcal_ziel: null,
    })
  })

  it('returns 500 and does not touch profiles when deleting wochen_check_ins fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { chain: checkInChain } = checkInDeleteChain({ message: 'db error' })
    adminFrom.mockReturnValueOnce(checkInChain)
    const { DELETE } = await import('./route')
    const res = await DELETE()
    expect(res.status).toBe(500)
    expect(adminFrom).toHaveBeenCalledTimes(1)
  })

  it('returns 500 when nulling the profile fields fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { chain: checkInChain } = checkInDeleteChain()
    const { chain: profileChain } = profilesUpdateChain({ message: 'db error' })
    adminFrom.mockReturnValueOnce(checkInChain).mockReturnValueOnce(profileChain)
    const { DELETE } = await import('./route')
    const res = await DELETE()
    expect(res.status).toBe(500)
  })
})
