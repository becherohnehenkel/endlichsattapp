import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getWeekStartIso } from '@/lib/wochen-grenzen'
import { SCREENTIME_MINUTEN_SCHRITTE } from '@/lib/screentime-schritte'

const antwortenSchema = z.object({
  highlights: z.string().max(2000),
  lowlights: z.string().max(2000),
  lowlightsUrsache: z.string().max(2000),
  naechsteWocheAnders: z.string().max(2000),
  schlaf: z.number().int().min(1).max(10),
  // PROJ-45 (Refinement 2026-09-03): Screentime ist keine lineare 0–10-Skala mehr, sondern
  // eine der 23 vorgegebenen Minuten-Stufen (15-Min-Schritte bis 60, danach 30-Min-Schritte
  // bis 600) — exakte Werte-Prüfung statt nur min/max, da min/max auch Zwischenwerte
  // zulassen würde, die die UI nie erzeugen kann (z. B. 37).
  screentime: z.number().int().refine(v => SCREENTIME_MINUTEN_SCHRITTE.includes(v), {
    message: 'Ungültiger Screentime-Wert',
  }),
  energielevel: z.number().int().min(0).max(10),
  achtsamkeit: z.number().int().min(0).max(10),
  bewusstEssen: z.number().int().min(0).max(10),
  sicherheitOhneTracking: z.number().int().min(0).max(10),
  training: z.number().int().min(0).max(3).nullable(),
  trainingGrund: z.string().max(2000),
  sonstiges: z.string().max(2000),
})

const bodySchema = z.object({
  wocheStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  antworten: antwortenSchema,
})

// PROJ-45: Speichert einen Wochen-Check-In für eingeloggte, nicht-anonyme Nutzer. Genau
// ein Eintrag pro Nutzer pro Kalenderwoche — Speichern und Bearbeiten sind derselbe
// Upsert-Vorgang, der Client schickt dafür immer den Wochenstart mit (aktuelle Woche oder
// eine aus der Mini-Historie geladene). Der Wochenstart muss ein Sonntag sein (dieselbe
// Berechnung wie beim Wochen-Recap aus PROJ-17) und darf nicht in der Zukunft liegen —
// verhindert Datenmüll durch beliebige Fantasiedaten (siehe LLM & Dateintegrität: kritische
// Nutzereingaben serverseitig erzwingen statt nur anweisen).
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  if (user.is_anonymous) return NextResponse.json({ error: 'Gäste können keine Check-Ins speichern' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
  }

  const { wocheStart, antworten } = parsed.data
  const aktuelleWoche = getWeekStartIso(new Date())
  const normalisierterWochenStart = getWeekStartIso(new Date(`${wocheStart}T00:00:00Z`))
  if (wocheStart !== normalisierterWochenStart || wocheStart > aktuelleWoche) {
    return NextResponse.json({ error: 'Ungültige Woche' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('wochen_check_ins')
    .upsert(
      {
        user_id: user.id,
        woche_start: wocheStart,
        antworten,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,woche_start' }
    )

  if (error) {
    console.error('[POST /api/check-in/wochen]', error)
    return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
