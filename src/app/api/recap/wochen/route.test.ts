import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures these are available before both vi.mock factories AND static imports run
const { mockGetUser, mockMealsOrder } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockMealsOrder: vi.fn(),
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (userId: string) => unknown) => fn,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockMealsOrder,
          }),
        }),
      }),
    }),
  }),
}))

import {
  getWeekStartIso,
  pillarMajority,
  bewertungMajority,
  getSchwächsterBaustein,
  getTopZutaten,
  getMakrosAvg,
} from './route'

// ─── Fixtures ─────────────────────────────────────────────────

function makeStandardMeal(createdAt: string, override: Partial<{
  overall: string
  pillars: Record<string, string>
  kcal: number
  ingredients: { name: string }[]
}> = {}) {
  return {
    id: `meal-${Math.random()}`,
    created_at: createdAt,
    meal_analyses: [
      {
        analysis_typ: 'standard',
        satiety_scores_before: {
          overall: override.overall ?? 'maessig_saettigend',
          pillars: override.pillars ?? {
            geschmack: 'gut', biss: 'schwach', ballaststoffe: 'mittel',
            proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet',
          },
        },
        macros_before: {
          kcal: override.kcal ?? 500,
          protein_g: 30, kohlenhydrate_g: 60, fett_g: 15, ballaststoffe_g: 5,
        },
        refined_ingredients: {
          ingredients: override.ingredients ?? [{ name: 'Hähnchenbrust' }, { name: 'Pasta' }],
        },
      },
    ],
  }
}

function makeBeilageMeal(createdAt: string) {
  return {
    id: `beilage-${Math.random()}`,
    created_at: createdAt,
    meal_analyses: [
      {
        analysis_typ: 'beilage',
        satiety_scores_before: null,
        macros_before: null,
        refined_ingredients: { ingredients: [{ name: 'Reis' }] },
      },
    ],
  }
}

function getCurrentWeekSunday(): string {
  const now = new Date()
  const day = now.getUTCDay()
  const sunday = new Date(now)
  sunday.setUTCDate(now.getUTCDate() - day)
  sunday.setUTCHours(12, 0, 0, 0)
  return sunday.toISOString()
}

// ─── Unit tests: week helpers ──────────────────────────────────

describe('getWeekStartIso', () => {
  it('returns Sunday as week start for a Wednesday', () => {
    // 2026-07-01 is a Wednesday
    expect(getWeekStartIso(new Date('2026-07-01T12:00:00Z'))).toBe('2026-06-28')
  })

  it('Sunday itself is the week start', () => {
    expect(getWeekStartIso(new Date('2026-06-28T00:01:00Z'))).toBe('2026-06-28')
  })

  it('Saturday is still in the same week', () => {
    expect(getWeekStartIso(new Date('2026-07-04T23:59:00Z'))).toBe('2026-06-28')
  })
})

// ─── Unit tests: pillar helpers ────────────────────────────────

describe('pillarMajority', () => {
  it('returns majority winner', () => {
    expect(pillarMajority(['gut', 'gut', 'schwach'])).toBe('gut')
  })

  it('tie-breaks in favor of schwach over gut', () => {
    expect(pillarMajority(['gut', 'schwach'])).toBe('schwach')
  })

  it('tie-breaks: schwach beats mittel', () => {
    expect(pillarMajority(['mittel', 'schwach'])).toBe('schwach')
  })

  it('returns single value correctly', () => {
    expect(pillarMajority(['gut'])).toBe('gut')
  })
})

describe('bewertungMajority', () => {
  it('returns majority winner', () => {
    expect(bewertungMajority(['sehr_saettigend', 'sehr_saettigend', 'wenig_saettigend'])).toBe('sehr_saettigend')
  })

  it('tie-breaks in favor of wenig_saettigend', () => {
    expect(bewertungMajority(['sehr_saettigend', 'wenig_saettigend'])).toBe('wenig_saettigend')
  })

  it('returns null for empty array', () => {
    expect(bewertungMajority([])).toBeNull()
  })
})

describe('getSchwächsterBaustein', () => {
  it('returns biss as first priority when schwach', () => {
    const b = { geschmack: 'gut', biss: 'schwach', ballaststoffe: 'gut', proteine: 'gut', volumen: 'gut', art_of_eating: 'gut' } as Record<string, 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'>
    expect(getSchwächsterBaustein(b)).toBe('biss')
  })

  it('returns ballaststoffe before volumen when both schwach', () => {
    const b = { geschmack: 'gut', biss: 'gut', ballaststoffe: 'schwach', proteine: 'gut', volumen: 'schwach', art_of_eating: 'gut' } as Record<string, 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'>
    expect(getSchwächsterBaustein(b)).toBe('ballaststoffe')
  })

  it('falls back to mittel if no schwach', () => {
    const b = { geschmack: 'gut', biss: 'mittel', ballaststoffe: 'gut', proteine: 'gut', volumen: 'gut', art_of_eating: 'gut' } as Record<string, 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'>
    expect(getSchwächsterBaustein(b)).toBe('biss')
  })

  it('excludes art_of_eating from blind spot detection', () => {
    const b = { geschmack: 'gut', biss: 'gut', ballaststoffe: 'gut', proteine: 'gut', volumen: 'gut', art_of_eating: 'schwach' } as Record<string, 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'>
    expect(getSchwächsterBaustein(b)).toBeNull()
  })

  it('returns null when everything is gut', () => {
    const b = { geschmack: 'gut', biss: 'gut', ballaststoffe: 'gut', proteine: 'gut', volumen: 'gut', art_of_eating: 'gut' } as Record<string, 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'>
    expect(getSchwächsterBaustein(b)).toBeNull()
  })
})

describe('getTopZutaten', () => {
  it('returns ingredients sorted by frequency', () => {
    const analyses = [
      { analysis_typ: 'standard', satiety_scores_before: null, macros_before: null, refined_ingredients: { ingredients: [{ name: 'Pasta' }, { name: 'Tomate' }] } },
      { analysis_typ: 'standard', satiety_scores_before: null, macros_before: null, refined_ingredients: { ingredients: [{ name: 'Pasta' }, { name: 'Käse' }] } },
      { analysis_typ: 'standard', satiety_scores_before: null, macros_before: null, refined_ingredients: { ingredients: [{ name: 'Pasta' }] } },
    ]
    const result = getTopZutaten(analyses)
    expect(result[0]).toBe('Pasta')
    expect(result).toHaveLength(3)
  })

  it('deduplicates within one analysis', () => {
    const analyses = [
      { analysis_typ: 'standard', satiety_scores_before: null, macros_before: null, refined_ingredients: { ingredients: [{ name: 'Ei' }, { name: 'Ei' }] } },
    ]
    const result = getTopZutaten(analyses)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('Ei')
  })

  it('is case-insensitive for counting but preserves display name', () => {
    const analyses = [
      { analysis_typ: 'standard', satiety_scores_before: null, macros_before: null, refined_ingredients: { ingredients: [{ name: 'Hähnchenbrust' }] } },
      { analysis_typ: 'standard', satiety_scores_before: null, macros_before: null, refined_ingredients: { ingredients: [{ name: 'hähnchenbrust' }] } },
    ]
    const result = getTopZutaten(analyses)
    expect(result).toHaveLength(1)
  })

  it('limits to 5 ingredients', () => {
    const analyses = [
      { analysis_typ: 'standard', satiety_scores_before: null, macros_before: null, refined_ingredients: { ingredients: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }, { name: 'E' }, { name: 'F' }] } },
    ]
    expect(getTopZutaten(analyses)).toHaveLength(5)
  })
})

describe('getMakrosAvg', () => {
  it('averages macros across analyses', () => {
    const analyses = [
      { analysis_typ: 'standard', satiety_scores_before: null, refined_ingredients: null, macros_before: { kcal: 400, protein_g: 20, kohlenhydrate_g: 60, fett_g: 10, ballaststoffe_g: 4 } },
      { analysis_typ: 'standard', satiety_scores_before: null, refined_ingredients: null, macros_before: { kcal: 600, protein_g: 40, kohlenhydrate_g: 80, fett_g: 20, ballaststoffe_g: 6 } },
    ]
    const result = getMakrosAvg(analyses)
    expect(result?.kcal).toBe(500)
    expect(result?.protein_g).toBe(30)
  })

  it('returns null when no macro data available', () => {
    const analyses = [
      { analysis_typ: 'standard', satiety_scores_before: null, refined_ingredients: null, macros_before: null },
    ]
    expect(getMakrosAvg(analyses)).toBeNull()
  })
})

// ─── Integration tests: GET /api/recap/wochen ─────────────────

describe('GET /api/recap/wochen', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns current week with 0 meals when user has no analyses', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealsOrder.mockResolvedValue({ data: [], error: null })

    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.wochen).toHaveLength(1)
    expect(data.wochen[0].istAktuelleWoche).toBe(true)
    expect(data.wochen[0].anzahlGesamt).toBe(0)
    expect(data.wochen[0].label).toBe('Diese Woche')
  })

  it('returns full recap when current week has >= 2 standard analyses', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const now = getCurrentWeekSunday()
    mockMealsOrder.mockResolvedValue({
      data: [
        makeStandardMeal(now, { overall: 'sehr_saettigend', pillars: { geschmack: 'gut', biss: 'gut', ballaststoffe: 'gut', proteine: 'gut', volumen: 'gut', art_of_eating: 'nicht_bewertet' } }),
        makeStandardMeal(now, { overall: 'maessig_saettigend', pillars: { geschmack: 'gut', biss: 'schwach', ballaststoffe: 'mittel', proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet' } }),
        makeStandardMeal(now, { overall: 'maessig_saettigend', pillars: { geschmack: 'gut', biss: 'schwach', ballaststoffe: 'mittel', proteine: 'gut', volumen: 'mittel', art_of_eating: 'nicht_bewertet' } }),
      ],
      error: null,
    })

    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()

    expect(data.wochen[0].anzahlGesamt).toBe(3)
    expect(data.wochen[0].bausteine).not.toBeNull()
    expect(data.wochen[0].makrosAvg).not.toBeNull()
    expect(data.wochen[0].gesamtbewertungAvg).toBe('maessig_saettigend')
    expect(data.wochen[0].schwächsterBaustein).toBe('biss')
  })

  it('does not include pillar/macro data when < 2 standard analyses', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const now = getCurrentWeekSunday()
    mockMealsOrder.mockResolvedValue({
      data: [makeStandardMeal(now)],
      error: null,
    })

    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()

    expect(data.wochen[0].anzahlStandard).toBe(1)
    expect(data.wochen[0].bausteine).toBeNull()
    expect(data.wochen[0].makrosAvg).toBeNull()
  })

  it('excludes beilage from pillar and macro averages, counts in total', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const now = getCurrentWeekSunday()
    mockMealsOrder.mockResolvedValue({
      data: [
        makeStandardMeal(now),
        makeStandardMeal(now),
        makeBeilageMeal(now),
      ],
      error: null,
    })

    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()

    expect(data.wochen[0].anzahlGesamt).toBe(3)
    expect(data.wochen[0].anzahlBeilagen).toBe(1)
    expect(data.wochen[0].anzahlStandard).toBe(2)
    expect(data.wochen[0].bausteine).not.toBeNull()
  })

  it('hides past weeks with < 3 analyses', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const now = getCurrentWeekSunday()
    // Past week (2 weeks ago) with only 2 meals → should not appear
    mockMealsOrder.mockResolvedValue({
      data: [
        makeStandardMeal(now),
        makeStandardMeal('2026-06-15T12:00:00Z'),
        makeStandardMeal('2026-06-15T13:00:00Z'),
      ],
      error: null,
    })

    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()

    expect(data.wochen).toHaveLength(1)
    expect(data.wochen[0].istAktuelleWoche).toBe(true)
  })

  it('shows past week with >= 3 analyses', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const now = getCurrentWeekSunday()
    mockMealsOrder.mockResolvedValue({
      data: [
        makeStandardMeal(now),
        makeStandardMeal('2026-06-15T10:00:00Z'),
        makeStandardMeal('2026-06-15T11:00:00Z'),
        makeStandardMeal('2026-06-15T12:00:00Z'),
      ],
      error: null,
    })

    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()

    expect(data.wochen).toHaveLength(2)
    expect(data.wochen[0].istAktuelleWoche).toBe(true)
    expect(data.wochen[1].istAktuelleWoche).toBe(false)
    expect(data.wochen[1].anzahlGesamt).toBe(3)
  })

  it('limits displayed weeks to max 4', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // 5 past weeks with 3 meals each
    const pastWeeks = ['2026-05-04', '2026-05-11', '2026-05-18', '2026-05-25', '2026-06-01']
    const pastMeals = pastWeeks.flatMap(w =>
      [0, 1, 2].map(d => makeStandardMeal(`${w}T${String(d + 10).padStart(2, '0')}:00:00Z`))
    )
    const now = getCurrentWeekSunday()
    mockMealsOrder.mockResolvedValue({
      data: [makeStandardMeal(now), ...pastMeals],
      error: null,
    })

    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()

    expect(data.wochen.length).toBeLessThanOrEqual(4)
  })

  it('returns 200 with current week on DB error (empty array fallback)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockMealsOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.wochen)).toBe(true)
  })

  it('includes top ingredients in full recap', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const now = getCurrentWeekSunday()
    mockMealsOrder.mockResolvedValue({
      data: [
        makeStandardMeal(now, { ingredients: [{ name: 'Hähnchenbrust' }, { name: 'Reis' }] }),
        makeStandardMeal(now, { ingredients: [{ name: 'Hähnchenbrust' }, { name: 'Brokkoli' }] }),
        makeStandardMeal(now, { ingredients: [{ name: 'Hähnchenbrust' }] }),
      ],
      error: null,
    })

    const { GET } = await import('./route')
    const res = await GET()
    const data = await res.json()

    expect(data.wochen[0].topZutaten[0]).toBe('Hähnchenbrust')
    expect(data.wochen[0].topZutaten.length).toBeGreaterThan(0)
  })
})
