import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekStartIso } from '@/lib/wochen-grenzen'

// PROJ-50: Reine Lese-Route für den "Training"-Tab der Analyse-Seite. Liest ausschließlich
// die bestehende `training_sessions`-Tabelle aus PROJ-44 — kein neues Schema, kein Schreiben.

const SERIE_MAX_WOCHEN = 26

interface Satz {
  wiederholungen: string
  gewicht: string
}

interface UebungEintrag {
  pause: string
  saetze: Satz[]
}

// Extrahiert die erste in einem Freitext-Feld enthaltene Zahl (z. B. "10-12" → 10,
// "20kg" → 20). Enthält der Text keine Zahl (z. B. "bis Muskelversagen"), wird 0
// zurückgegeben — siehe Spec-Entscheidung "Fokussiere dich auf Zahlen".
function parseLeadingNumber(value: unknown): number {
  if (typeof value !== 'string') return 0
  const match = value.match(/\d+(\.\d+)?/)
  return match ? parseFloat(match[0]) : 0
}

// `uebungen` ist in der DB ein JSONB-Blob ohne serverseitig erzwungene Struktur (siehe
// PROJ-44) — defensiv lesen, statt bei unerwarteter Form abzustürzen.
function berechneVolumenKg(uebungen: unknown): number {
  if (typeof uebungen !== 'object' || uebungen === null) return 0
  let summe = 0
  for (const eintrag of Object.values(uebungen as Record<string, UebungEintrag>)) {
    const saetze = Array.isArray(eintrag?.saetze) ? eintrag.saetze : []
    for (const satz of saetze) {
      summe += parseLeadingNumber(satz?.wiederholungen) * parseLeadingNumber(satz?.gewicht)
    }
  }
  return summe
}

interface SessionRow {
  id: string
  plan_slug: string
  uebungen: unknown
  created_at: string
}

function berechneKennzahlen(sessions: SessionRow[]) {
  const jetzt = new Date()
  const vor7Tagen = new Date(jetzt.getTime() - 7 * 24 * 60 * 60 * 1000)
  const vor30Tagen = new Date(jetzt.getTime() - 30 * 24 * 60 * 60 * 1000)

  const einheitenLetzte7Tage = sessions.filter(s => new Date(s.created_at) >= vor7Tagen).length

  const fitnessstudio = sessions
    .filter(s => s.plan_slug === 'fitnessstudio')
    .map(s => ({ createdAt: new Date(s.created_at), volumenKg: berechneVolumenKg(s.uebungen) }))

  const fitnessstudio7Tage = fitnessstudio.filter(s => s.createdAt >= vor7Tagen)
  const fitnessstudio30Tage = fitnessstudio.filter(s => s.createdAt >= vor30Tagen)

  const avg = (liste: { volumenKg: number }[]) => liste.reduce((sum, s) => sum + s.volumenKg, 0) / liste.length

  const durchschnittsgewichtKg = fitnessstudio7Tage.length > 0 ? avg(fitnessstudio7Tage) : null

  let steigerungProzent: number | null = null
  if (fitnessstudio7Tage.length >= 1 && fitnessstudio30Tage.length >= 2) {
    const avg7 = avg(fitnessstudio7Tage)
    const avg30 = avg(fitnessstudio30Tage)
    if (avg30 > 0) steigerungProzent = ((avg7 - avg30) / avg30) * 100
  }

  // "Aktuelle Serie": aufeinanderfolgende Wochen mit mind. 1 Training (beliebiger Plan) bis
  // zur aktuellen Woche zurück. Die laufende Woche zählt erst mit, sobald sie selbst ein
  // Training hat — ist sie noch leer, bricht das die Serie nicht ab (sie ist noch nicht vorbei).
  const wochenMitTraining = new Set(sessions.map(s => getWeekStartIso(new Date(s.created_at))))
  const aktuelleWoche = getWeekStartIso(jetzt)
  let cursor = new Date(jetzt)
  if (!wochenMitTraining.has(aktuelleWoche)) {
    cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
  let aktuelleSerieWochen = 0
  for (let i = 0; i < SERIE_MAX_WOCHEN; i++) {
    const wocheStart = getWeekStartIso(cursor)
    if (!wochenMitTraining.has(wocheStart)) break
    aktuelleSerieWochen++
    cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  return { einheitenLetzte7Tage, durchschnittsgewichtKg, steigerungProzent, aktuelleSerieWochen }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const { data: sessions, error } = await supabase
    .from('training_sessions')
    .select('id, plan_slug, uebungen, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })

  const trainings = ((sessions ?? []) as SessionRow[]).map(s => ({
    id: s.id,
    planSlug: s.plan_slug,
    createdAt: s.created_at,
    volumenKg: s.plan_slug === 'fitnessstudio' ? berechneVolumenKg(s.uebungen) : null,
  }))

  const response: { trainings: typeof trainings; hasMore: boolean; kennzahlen?: ReturnType<typeof berechneKennzahlen> } = {
    trainings,
    hasMore: sessions?.length === limit,
  }

  if (offset === 0) {
    const seitDatum = new Date(Date.now() - SERIE_MAX_WOCHEN * 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: verlaufFuerKennzahlen, error: kennzahlenError } = await supabase
      .from('training_sessions')
      .select('id, plan_slug, uebungen, created_at')
      .eq('user_id', user.id)
      .gte('created_at', seitDatum)

    if (!kennzahlenError) {
      response.kennzahlen = berechneKennzahlen((verlaufFuerKennzahlen ?? []) as SessionRow[])
    }
  }

  return NextResponse.json(response)
}
