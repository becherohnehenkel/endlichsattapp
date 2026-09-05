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

function makeRequest(url = 'http://localhost/api/training/verlauf') {
  return new Request(url)
}

function tageVorJetzt(tage: number): string {
  return new Date(Date.now() - tage * 24 * 60 * 60 * 1000).toISOString()
}

describe('GET /api/training/verlauf', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns trainings + kennzahlen at offset 0', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const session = {
      id: 't1',
      plan_slug: 'fitnessstudio',
      uebungen: { kniebeuge: { pause: '90', saetze: [{ wiederholungen: '10', gewicht: '50' }, { wiederholungen: '8', gewicht: '55' }] } },
      created_at: tageVorJetzt(1),
    }
    mockRange.mockResolvedValue({ data: [session], error: null })
    mockGte.mockResolvedValue({ data: [session], error: null })

    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.trainings).toHaveLength(1)
    expect(data.trainings[0].planSlug).toBe('fitnessstudio')
    expect(data.trainings[0].volumenKg).toBe(10 * 50 + 8 * 55)
    expect(data.kennzahlen.einheitenLetzte7Tage).toBe(1)
    expect(data.kennzahlen.durchschnittsgewichtKg).toBe(940)
  })

  it('does not query or include kennzahlen when offset > 0', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockRange.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/training/verlauf?offset=5'))
    const data = await res.json()
    expect(data.kennzahlen).toBeUndefined()
    expect(mockGte).not.toHaveBeenCalled()
  })

  it('sets volumenKg to null for non-Fitnessstudio-Pläne', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockRange.mockResolvedValue({
      data: [{ id: 't1', plan_slug: 'zuhause-ohne-equipment', uebungen: {}, created_at: tageVorJetzt(0) }],
      error: null,
    })
    mockGte.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.trainings[0].volumenKg).toBeNull()
  })

  it('parst führende Zahl aus Freitext, nicht-numerische Werte zählen als 0', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockRange.mockResolvedValue({
      data: [{
        id: 't1',
        plan_slug: 'fitnessstudio',
        uebungen: {
          bankdruecken: {
            pause: '90',
            saetze: [
              { wiederholungen: '10-12', gewicht: '20kg' },
              { wiederholungen: 'bis Muskelversagen', gewicht: '' },
            ],
          },
        },
        created_at: tageVorJetzt(0),
      }],
      error: null,
    })
    mockGte.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.trainings[0].volumenKg).toBe(200)
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
    await GET(makeRequest('http://localhost/api/training/verlauf?limit=100&offset=10'))
    expect(mockRange).toHaveBeenCalledWith(10, 59)
  })

  it('sets hasMore true when exactly `limit` items returned', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const items = Array.from({ length: 5 }, (_, i) => ({
      id: `t${i}`, plan_slug: 'fitnessstudio', uebungen: {}, created_at: tageVorJetzt(0),
    }))
    mockRange.mockResolvedValue({ data: items, error: null })
    mockGte.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest('http://localhost/api/training/verlauf?limit=5'))
    const data = await res.json()
    expect(data.hasMore).toBe(true)
  })

  it('"Steigerung" bleibt null, wenn die Datenschwelle nicht erreicht ist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const einzigeEinheit = [{ id: 't1', plan_slug: 'fitnessstudio', uebungen: { a: { pause: '60', saetze: [{ wiederholungen: '10', gewicht: '10' }] } }, created_at: tageVorJetzt(1) }]
    mockRange.mockResolvedValue({ data: einzigeEinheit, error: null })
    mockGte.mockResolvedValue({ data: einzigeEinheit, error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.kennzahlen.steigerungProzent).toBeNull()
  })

  it('"Aktuelle Serie" zählt fortlaufende Wochen, bricht bei einer Lücke ab', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Diese Woche + vor 14 Tagen (vor 2 Wochen), aber NICHT vor 7 Tagen (vor 1 Woche) — Lücke.
    const sessions = [
      { id: 't1', plan_slug: 'zuhause-ohne-equipment', uebungen: {}, created_at: tageVorJetzt(0) },
      { id: 't2', plan_slug: 'zuhause-ohne-equipment', uebungen: {}, created_at: tageVorJetzt(14) },
    ]
    mockRange.mockResolvedValue({ data: [], error: null })
    mockGte.mockResolvedValue({ data: sessions, error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.kennzahlen.aktuelleSerieWochen).toBe(1)
  })

  it('"Aktuelle Serie" bricht nicht ab, wenn nur die laufende Woche noch leer ist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Vor 7 und vor 14 Tagen Training, aber diese Woche (noch) nicht.
    const sessions = [
      { id: 't1', plan_slug: 'zuhause-ohne-equipment', uebungen: {}, created_at: tageVorJetzt(7) },
      { id: 't2', plan_slug: 'zuhause-ohne-equipment', uebungen: {}, created_at: tageVorJetzt(14) },
    ]
    mockRange.mockResolvedValue({ data: [], error: null })
    mockGte.mockResolvedValue({ data: sessions, error: null })
    const { GET } = await import('./route')
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.kennzahlen.aktuelleSerieWochen).toBe(2)
  })
})
