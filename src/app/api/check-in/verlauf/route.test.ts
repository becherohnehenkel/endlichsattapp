import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockRange = vi.fn()
const mockGte = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({ range: mockRange }),
          gte: mockGte,
        }),
      }),
    }),
  }),
}))

function makeRequest(url = 'http://localhost/api/check-in/verlauf') {
  return new Request(url)
}

function antworten(overrides: Partial<Record<string, number>> = {}) {
  return {
    highlights: '', lowlights: '', lowlightsUrsache: '', naechsteWocheAnders: '',
    schlaf: 7, screentime: 120, energielevel: 6, achtsamkeit: 7, bewusstEssen: 8, sicherheitOhneTracking: 5,
    training: null, trainingGrund: '', sonstiges: '',
    ...overrides,
  }
}

describe('GET /api/check-in/verlauf', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns checkIns + kennzahlen at offset 0', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const eintrag = { id: 'c1', woche_start: '2026-08-30', antworten: antworten() }
    mockRange.mockResolvedValue({ data: [eintrag], error: null })
    mockGte.mockResolvedValue({ data: [eintrag], error: null })

    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.checkIns).toHaveLength(1)
    expect(data.checkIns[0]).toEqual({ id: 'c1', wocheStart: '2026-08-30' })
    expect(data.kennzahlen).toHaveLength(6)
    const schlaf = data.kennzahlen.find((m: { key: string }) => m.key === 'schlaf')
    expect(schlaf.aktuellerWert).toBe(7)
    // Nur 1 Eintrag in den letzten 30 Tagen -> Datenschwelle nicht erreicht
    expect(schlaf.differenz).toBeNull()
  })

  it('does not query or include kennzahlen when offset > 0', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockRange.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/check-in/verlauf?offset=5'))
    const data = await res.json()
    expect(data.kennzahlen).toBeUndefined()
    expect(mockGte).not.toHaveBeenCalled()
  })

  it('berechnet die Differenz korrekt und interpretiert die Richtung je Metrik (Screentime invertiert)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const neuester = { id: 'c1', woche_start: '2026-09-06', antworten: antworten({ schlaf: 8, screentime: 60 }) }
    mockRange.mockResolvedValue({ data: [neuester], error: null })
    mockGte.mockResolvedValue({
      data: [
        { woche_start: '2026-09-06', antworten: antworten({ schlaf: 8, screentime: 60 }) },
        { woche_start: '2026-08-30', antworten: antworten({ schlaf: 6, screentime: 120 }) },
      ],
      error: null,
    })

    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()

    const schlaf = data.kennzahlen.find((m: { key: string }) => m.key === 'schlaf')
    expect(schlaf.aktuellerWert).toBe(8)
    expect(schlaf.differenz).toBe(1) // 8 - avg(8,6)=7 -> +1

    const screentime = data.kennzahlen.find((m: { key: string }) => m.key === 'screentime')
    expect(screentime.aktuellerWert).toBe(60)
    expect(screentime.differenz).toBe(-30) // 60 - avg(60,120)=90 -> -30 (Verbesserung, da weniger besser)
  })

  it('rundet Punkte-Differenzen auf 1 Nachkommastelle', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const neuester = { id: 'c1', woche_start: '2026-09-06', antworten: antworten({ energielevel: 8 }) }
    mockRange.mockResolvedValue({ data: [neuester], error: null })
    mockGte.mockResolvedValue({
      data: [
        { woche_start: '2026-09-06', antworten: antworten({ energielevel: 8 }) },
        { woche_start: '2026-08-30', antworten: antworten({ energielevel: 6 }) },
        { woche_start: '2026-08-23', antworten: antworten({ energielevel: 7 }) },
      ],
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    const energielevel = data.kennzahlen.find((m: { key: string }) => m.key === 'energielevel')
    // avg(8,6,7) = 7, differenz = 8-7 = 1
    expect(energielevel.differenz).toBe(1)
  })

  it('liefert leere Liste ohne Fehler, wenn der Nutzer noch nie eingecheckt hat', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockRange.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.checkIns).toEqual([])
    expect(data.kennzahlen).toBeUndefined()
    expect(mockGte).not.toHaveBeenCalled()
  })

  it('returns 500 on DB error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockRange.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(500)
  })

  it('caps limit at 50 and respects offset', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockRange.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    await GET(makeRequest('http://localhost/api/check-in/verlauf?limit=100&offset=10'))
    expect(mockRange).toHaveBeenCalledWith(10, 59)
  })

  it('sets hasMore true when exactly `limit` items returned', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const items = Array.from({ length: 5 }, (_, i) => ({
      id: `c${i}`, woche_start: `2026-08-0${i + 1}`, antworten: antworten(),
    }))
    mockRange.mockResolvedValue({ data: items, error: null })
    mockGte.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/check-in/verlauf?limit=5'))
    const data = await res.json()
    expect(data.hasMore).toBe(true)
  })
})
