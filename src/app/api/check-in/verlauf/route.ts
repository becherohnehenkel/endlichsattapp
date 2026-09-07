import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PROJ-51: Reine Lese-Route für den "Check-Ins"-Tab der Analyse-Seite. Liest ausschließlich
// die bestehende `wochen_check_ins`-Tabelle aus PROJ-45 — kein neues Schema, kein Schreiben.

interface Metrik {
  key: keyof CheckInAntworten
  label: string
  einheit: 'punkte' | 'zeit'
  richtung: 'mehr' | 'weniger'
}

interface CheckInAntworten {
  schlaf: number
  screentime: number
  energielevel: number
  achtsamkeit: number
  bewusstEssen: number
  sicherheitOhneTracking: number
}

const METRIKEN: Metrik[] = [
  { key: 'schlaf', label: 'Schlaf', einheit: 'punkte', richtung: 'mehr' },
  { key: 'screentime', label: 'Screentime', einheit: 'zeit', richtung: 'weniger' },
  { key: 'energielevel', label: 'Energielevel', einheit: 'punkte', richtung: 'mehr' },
  { key: 'achtsamkeit', label: 'Ernährung', einheit: 'punkte', richtung: 'mehr' },
  { key: 'bewusstEssen', label: 'Bewusstes Essen', einheit: 'punkte', richtung: 'mehr' },
  { key: 'sicherheitOhneTracking', label: 'Tracking-Bereitschaft', einheit: 'punkte', richtung: 'mehr' },
]

function extractNumber(antworten: unknown, key: string): number | null {
  if (typeof antworten !== 'object' || antworten === null) return null
  const wert = (antworten as Record<string, unknown>)[key]
  return typeof wert === 'number' ? wert : null
}

function runde(wert: number, einheit: Metrik['einheit']): number {
  return einheit === 'zeit' ? Math.round(wert) : Math.round(wert * 10) / 10
}

// Berechnet für jede Metrik den Wert des neuesten Check-Ins (unabhängig vom 30-Tage-Fenster)
// sowie die Differenz zum 30-Tage-Schnitt — null, wenn weniger als 2 Check-Ins in den
// letzten 30 Tagen vorliegen (siehe Spec-Entscheidung "Datenschwelle").
function berechneKennzahlen(neuesteAntworten: unknown, checkInsLetzte30Tage: { antworten: unknown }[]) {
  return METRIKEN.map((m) => {
    const aktuellerWert = extractNumber(neuesteAntworten, m.key) ?? 0
    const werte = checkInsLetzte30Tage
      .map(c => extractNumber(c.antworten, m.key))
      .filter((n): n is number => n !== null)

    let differenz: number | null = null
    if (werte.length >= 2) {
      const durchschnitt = werte.reduce((summe, w) => summe + w, 0) / werte.length
      differenz = runde(aktuellerWert - durchschnitt, m.einheit)
    }

    return {
      key: m.key,
      label: m.label,
      einheit: m.einheit,
      richtung: m.richtung,
      aktuellerWert: runde(aktuellerWert, m.einheit),
      differenz,
    }
  })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const { data: eintraege, error } = await supabase
    .from('wochen_check_ins')
    .select('id, woche_start, antworten')
    .eq('user_id', user.id)
    .order('woche_start', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })

  const checkIns = (eintraege ?? []).map(e => ({ id: e.id, wocheStart: e.woche_start }))

  const response: { checkIns: typeof checkIns; hasMore: boolean; kennzahlen?: ReturnType<typeof berechneKennzahlen> } = {
    checkIns,
    hasMore: eintraege?.length === limit,
  }

  // "Aktueller Wert" = der neueste Check-In insgesamt, unabhängig vom 30-Tage-Fenster — das
  // ist bei offset=0 immer der erste Eintrag der gerade geladenen Liste (bereits neueste-zuerst
  // sortiert), daher keine zusätzliche Abfrage nötig.
  if (offset === 0 && eintraege && eintraege.length > 0) {
    const seitDatum = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data: letzte30Tage, error: kennzahlenError } = await supabase
      .from('wochen_check_ins')
      .select('woche_start, antworten')
      .eq('user_id', user.id)
      .gte('woche_start', seitDatum)

    if (!kennzahlenError) {
      response.kennzahlen = berechneKennzahlen(eintraege[0].antworten, letzte30Tage ?? [])
    }
  }

  return NextResponse.json(response)
}
