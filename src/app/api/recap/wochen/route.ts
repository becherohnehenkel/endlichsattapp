import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Types ────────────────────────────────────────────────────

type PillarScore = 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'
type GesamtBewertung = 'sehr_saettigend' | 'maessig_saettigend' | 'wenig_saettigend'

interface WochenRecap {
  startDatum: string
  endDatum: string
  label: string
  istAktuelleWoche: boolean
  anzahlGesamt: number
  anzahlBeilagen: number
  anzahlStandard: number
  gesamtbewertungAvg: GesamtBewertung | null
  schwächsterBaustein: string | null
  bausteine: Record<string, PillarScore> | null
  makrosAvg: {
    kcal: number
    protein_g: number
    kohlenhydrate_g: number
    fett_g: number
    ballaststoffe_g: number
  } | null
  topZutaten: string[]
}

interface RawAnalysis {
  analysis_typ: string
  satiety_scores_before: {
    overall?: string
    pillars?: Record<string, string>
  } | null
  macros_before: {
    kcal?: number
    protein_g?: number
    kohlenhydrate_g?: number
    fett_g?: number
    ballaststoffe_g?: number
  } | null
  refined_ingredients: {
    ingredients?: { name?: string }[]
  } | null
}

interface RawMeal {
  id: string
  created_at: string
  meal_analyses: RawAnalysis[] | null
}

// ─── Week helpers ──────────────────────────────────────────────

export function getWeekStartIso(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay() // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - day)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function getWeekEndIso(weekStart: string): string {
  const d = new Date(weekStart + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 6)
  return d.toISOString().split('T')[0]
}

function getWeekLabel(weekStartIso: string, weekIndex: number): string {
  if (weekIndex === 0) return 'Diese Woche'
  if (weekIndex === 1) return 'Letzte Woche'
  const s = new Date(weekStartIso + 'T00:00:00Z')
  const e = new Date(weekStartIso + 'T00:00:00Z')
  e.setUTCDate(e.getUTCDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return `${fmt(s)} – ${fmt(e)}`
}

// ─── Computation helpers ───────────────────────────────────────

const PILLAR_KEYS = ['geschmack', 'biss', 'ballaststoffe', 'proteine', 'volumen', 'art_of_eating'] as const

// Priority for tie-breaking: lower = wins (schwach=0 beats mittel=1 beats gut=2)
const SCORE_PRIORITY: Record<string, number> = { schwach: 0, mittel: 1, gut: 2, nicht_bewertet: 3 }
const BEWERTUNG_PRIORITY: Record<string, number> = { wenig_saettigend: 0, maessig_saettigend: 1, sehr_saettigend: 2 }

// Pillar priority for "schwächster Baustein" — most impactful first
const SCHWACH_PRIORITY = ['biss', 'ballaststoffe', 'volumen', 'geschmack', 'proteine'] as const

export function pillarMajority(scores: string[]): PillarScore {
  const counts: Record<string, number> = { gut: 0, mittel: 0, schwach: 0, nicht_bewertet: 0 }
  for (const s of scores) {
    if (s in counts) counts[s]++
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || (SCORE_PRIORITY[a[0]] ?? 3) - (SCORE_PRIORITY[b[0]] ?? 3))[0][0] as PillarScore
}

export function bewertungMajority(scores: string[]): GesamtBewertung | null {
  if (scores.length === 0) return null
  const counts: Record<string, number> = { sehr_saettigend: 0, maessig_saettigend: 0, wenig_saettigend: 0 }
  for (const s of scores) {
    if (s in counts) counts[s]++
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || (BEWERTUNG_PRIORITY[a[0]] ?? 1) - (BEWERTUNG_PRIORITY[b[0]] ?? 1))[0][0] as GesamtBewertung
}

export function getSchwächsterBaustein(bausteine: Record<string, PillarScore>): string | null {
  for (const key of SCHWACH_PRIORITY) {
    if (bausteine[key] === 'schwach') return key
  }
  for (const key of SCHWACH_PRIORITY) {
    if (bausteine[key] === 'mittel') return key
  }
  return null
}

export function getTopZutaten(analyses: RawAnalysis[], limit = 5): string[] {
  const zutatenMap = new Map<string, { displayName: string; count: number }>()
  for (const analysis of analyses) {
    const ingredients = analysis.refined_ingredients?.ingredients ?? []
    const seenInThisAnalysis = new Set<string>()
    for (const ing of ingredients) {
      const name = typeof ing.name === 'string' ? ing.name.trim() : null
      if (!name) continue
      const key = name.toLowerCase()
      if (seenInThisAnalysis.has(key)) continue
      seenInThisAnalysis.add(key)
      const existing = zutatenMap.get(key)
      if (existing) {
        existing.count++
      } else {
        zutatenMap.set(key, { displayName: name, count: 1 })
      }
    }
  }
  return Array.from(zutatenMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(e => e.displayName)
}

export function getMakrosAvg(analyses: RawAnalysis[]) {
  const valid = analyses.map(a => a.macros_before).filter(Boolean) as NonNullable<RawAnalysis['macros_before']>[]
  if (valid.length === 0) return null
  const n = valid.length
  return {
    kcal: Math.round(valid.reduce((s, m) => s + (m.kcal ?? 0), 0) / n),
    protein_g: Math.round(valid.reduce((s, m) => s + (m.protein_g ?? 0), 0) / n),
    kohlenhydrate_g: Math.round(valid.reduce((s, m) => s + (m.kohlenhydrate_g ?? 0), 0) / n),
    fett_g: Math.round(valid.reduce((s, m) => s + (m.fett_g ?? 0), 0) / n),
    ballaststoffe_g: Math.round(valid.reduce((s, m) => s + (m.ballaststoffe_g ?? 0), 0) / n),
  }
}

// ─── Core computation (exported for testing) ──────────────────

export async function buildWochenRecaps(userId: string): Promise<WochenRecap[]> {
  const supabase = createAdminClient()

  const { data: meals, error } = await supabase
    .from('meals')
    .select(`
      id,
      created_at,
      meal_analyses (
        analysis_typ,
        satiety_scores_before,
        macros_before,
        refined_ingredients
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false }) as unknown as { data: RawMeal[] | null; error: unknown }

  if (error || !meals) return []

  // Group meals by calendar week (Sun–Sat, UTC-based)
  const weekMap = new Map<string, RawMeal[]>()
  for (const meal of meals) {
    const weekStart = getWeekStartIso(new Date(meal.created_at))
    if (!weekMap.has(weekStart)) weekMap.set(weekStart, [])
    weekMap.get(weekStart)!.push(meal)
  }

  // Current week always appears even with 0 meals
  const currentWeekStart = getWeekStartIso(new Date())
  if (!weekMap.has(currentWeekStart)) weekMap.set(currentWeekStart, [])

  // Sort newest first
  const sortedWeeks = Array.from(weekMap.entries()).sort((a, b) => b[0].localeCompare(a[0]))

  const result: WochenRecap[] = []
  let displayIndex = 0

  for (const [weekStartIso, weekMeals] of sortedWeeks) {
    const istAktuelleWoche = weekStartIso === currentWeekStart

    // Past weeks with < 3 total analyses: skip
    if (!istAktuelleWoche && weekMeals.length < 3) continue

    // Max 4 weeks displayed
    if (displayIndex >= 4) break

    // Classify analyses for this week
    const standardAnalyses: RawAnalysis[] = []
    const beilageAnalyses: RawAnalysis[] = []

    for (const meal of weekMeals) {
      const analysis = meal.meal_analyses?.[0]
      if (!analysis) continue
      if (analysis.analysis_typ === 'standard') standardAnalyses.push(analysis)
      else if (analysis.analysis_typ === 'beilage') beilageAnalyses.push(analysis)
    }

    const anzahlGesamt = weekMeals.length
    const anzahlBeilagen = beilageAnalyses.length
    const anzahlStandard = standardAnalyses.length

    let gesamtbewertungAvg: GesamtBewertung | null = null
    let schwächsterBaustein: string | null = null
    let bausteine: Record<string, PillarScore> | null = null
    let makrosAvg = null

    if (anzahlStandard >= 2) {
      const pillarScores: Record<string, string[]> = {}
      for (const key of PILLAR_KEYS) pillarScores[key] = []
      const bewertungen: string[] = []

      for (const analysis of standardAnalyses) {
        const scores = analysis.satiety_scores_before
        if (!scores) continue
        if (scores.overall) bewertungen.push(scores.overall)
        const pillars = scores.pillars ?? {}
        for (const key of PILLAR_KEYS) {
          if (pillars[key]) pillarScores[key].push(pillars[key])
        }
      }

      bausteine = Object.fromEntries(
        PILLAR_KEYS.map(k => [
          k,
          pillarScores[k].length > 0 ? pillarMajority(pillarScores[k]) : 'nicht_bewertet',
        ])
      ) as Record<string, PillarScore>

      gesamtbewertungAvg = bewertungMajority(bewertungen)
      schwächsterBaustein = getSchwächsterBaustein(bausteine)
      makrosAvg = getMakrosAvg(standardAnalyses)
    }

    const topZutaten = anzahlStandard >= 1 ? getTopZutaten(standardAnalyses) : []

    result.push({
      startDatum: weekStartIso,
      endDatum: getWeekEndIso(weekStartIso),
      label: getWeekLabel(weekStartIso, displayIndex),
      istAktuelleWoche,
      anzahlGesamt,
      anzahlBeilagen,
      anzahlStandard,
      gesamtbewertungAvg,
      schwächsterBaustein,
      bausteine,
      makrosAvg,
      topZutaten,
    })

    displayIndex++
  }

  return result
}

// ─── Cached wrapper (1h TTL, keyed by userId) ─────────────────

const getRecapCached = unstable_cache(
  (userId: string) => buildWochenRecaps(userId),
  ['wochen-recap'],
  { revalidate: 3600 }
)

// ─── Route handler ─────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  try {
    const wochen = await getRecapCached(user.id)
    return NextResponse.json({ wochen })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Laden des Wochenrückblicks' }, { status: 500 })
  }
}
