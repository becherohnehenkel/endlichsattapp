import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getWeekStartIso } from '@/lib/wochen-grenzen'

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
  return new Request('http://localhost/api/check-in/wochen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const NOW = new Date('2026-09-02T10:00:00Z')
const AKTUELLE_WOCHE = getWeekStartIso(NOW)

const VALID_ANTWORTEN = {
  highlights: 'Viel geschafft',
  lowlights: 'Zu wenig geschlafen',
  lowlightsUrsache: 'Zu spät ins Bett',
  naechsteWocheAnders: 'Früher schlafen',
  schlaf: 6,
  screentime: 4,
  energielevel: 7,
  achtsamkeit: 8,
  bewusstEssen: 5,
  sicherheitOhneTracking: 3,
  training: 2,
  trainingGrund: '',
  sonstiges: '',
}

function upsertChain(error: object | null = null) {
  const upsertFn = vi.fn().mockResolvedValue({ error })
  return { _upsertFn: upsertFn, chain: { upsert: upsertFn } }
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser } })
  mockCreateAdminClient.mockReturnValue({ from: adminFrom })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('POST /api/check-in/wochen', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ wocheStart: AKTUELLE_WOCHE, antworten: VALID_ANTWORTEN }))
    expect(res.status).toBe(401)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 403 for anonymous (guest) sessions — guests must not persist data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: true } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ wocheStart: AKTUELLE_WOCHE, antworten: VALID_ANTWORTEN }))
    expect(res.status).toBe(403)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 400 for a malformed body (missing fields)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ wocheStart: AKTUELLE_WOCHE, antworten: { highlights: 'x' } }))
    expect(res.status).toBe(400)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 400 when wocheStart is not Sunday-aligned', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const montag = new Date(`${AKTUELLE_WOCHE}T00:00:00Z`)
    montag.setUTCDate(montag.getUTCDate() + 1)
    const res = await POST(makeRequest({ wocheStart: montag.toISOString().split('T')[0], antworten: VALID_ANTWORTEN }))
    expect(res.status).toBe(400)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('returns 400 when wocheStart is in the future', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { POST } = await import('./route')
    const naechsteWoche = new Date(`${AKTUELLE_WOCHE}T00:00:00Z`)
    naechsteWoche.setUTCDate(naechsteWoche.getUTCDate() + 7)
    const res = await POST(makeRequest({ wocheStart: naechsteWoche.toISOString().split('T')[0], antworten: VALID_ANTWORTEN }))
    expect(res.status).toBe(400)
    expect(adminFrom).not.toHaveBeenCalled()
  })

  it('upserts a valid check-in scoped to the authenticated user and returns success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { _upsertFn, chain } = upsertChain()
    adminFrom.mockReturnValueOnce(chain)
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ wocheStart: AKTUELLE_WOCHE, antworten: VALID_ANTWORTEN }))
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(adminFrom).toHaveBeenCalledWith('wochen_check_ins')
    expect(_upsertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        woche_start: AKTUELLE_WOCHE,
        antworten: VALID_ANTWORTEN,
      }),
      { onConflict: 'user_id,woche_start' }
    )
  })

  it('allows saving a past week loaded from the mini-history', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { _upsertFn, chain } = upsertChain()
    adminFrom.mockReturnValueOnce(chain)
    const { POST } = await import('./route')
    const vorherigeWoche = new Date(`${AKTUELLE_WOCHE}T00:00:00Z`)
    vorherigeWoche.setUTCDate(vorherigeWoche.getUTCDate() - 7)
    const wocheStart = vorherigeWoche.toISOString().split('T')[0]
    const res = await POST(makeRequest({ wocheStart, antworten: VALID_ANTWORTEN }))
    expect(res.status).toBe(200)
    expect(_upsertFn).toHaveBeenCalledWith(
      expect.objectContaining({ woche_start: wocheStart }),
      { onConflict: 'user_id,woche_start' }
    )
  })

  it('returns 500 when the database upsert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', is_anonymous: false } } })
    const { chain } = upsertChain({ message: 'db error' })
    adminFrom.mockReturnValueOnce(chain)
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ wocheStart: AKTUELLE_WOCHE, antworten: VALID_ANTWORTEN }))
    expect(res.status).toBe(500)
  })
})
