import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { findTrainingsplan, type Trainingsplan } from '@/lib/trainingsplaene'

// PROJ-44 (Refinement 2026-09-07): Wiederholungen/Gewicht sind nur bei Plan 3 (Fitnessstudio)
// echte Zahlen — bei Plan 1/2 bleibt es beim ursprünglichen, unvalidierten Freitext (siehe
// Spec-Entscheidung). Das Schema wird deshalb pro Plan gebaut statt statisch definiert, anhand
// derselben `wiederholungenNumerisch`/`zusatzfeld`-Angaben, die auch das Frontend steuern —
// kein hartcodierter Plan-Slug hier, bleibt korrekt, falls später weitere Pläne dazukommen.
function buildBodySchema(plan: Trainingsplan) {
  const satzSchema = z.object({
    wiederholungen: plan.wiederholungenNumerisch
      ? z.number().int().nonnegative().nullable()
      : z.string().max(50),
    gewicht: plan.zusatzfeld.art === 'numerisch'
      ? z.number().nonnegative().multipleOf(plan.zusatzfeld.schritt).nullable()
      : z.string().max(50),
  })

  const uebungSchema = z.object({
    pause: z.string().max(50),
    saetze: z.array(satzSchema).max(20),
  })

  return z.object({
    uebungen: z.record(z.string(), uebungSchema),
  })
}

// PROJ-44: Speichert eine abgeschlossene Trainingseinheit für eingeloggte, nicht-anonyme
// Nutzer. Gäste (kein User oder anonyme Session) dürfen laut Spec nichts speichern —
// selbes Muster wie /api/kcal-rechner und /api/mahlzeiten-ziel.
export async function POST(request: Request, { params }: { params: Promise<{ plan: string }> }) {
  const { plan: slug } = await params
  const plan = findTrainingsplan(slug)
  if (!plan) {
    return NextResponse.json({ error: 'Unbekannter Trainingsplan' }, { status: 404 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  if (user.is_anonymous) return NextResponse.json({ error: 'Gäste können keine Trainings speichern' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = buildBodySchema(plan).safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
  }

  // Nur bekannte Übungs-IDs dieses Plans akzeptieren — verhindert beliebige Keys im JSON-Blob.
  const bekannteUebungsIds = new Set(plan.uebungen.map(u => u.id))
  const eingereichteIds = Object.keys(parsed.data.uebungen)
  if (eingereichteIds.some(id => !bekannteUebungsIds.has(id))) {
    return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('training_sessions')
    .insert({
      user_id: user.id,
      plan_slug: plan.slug,
      uebungen: parsed.data.uebungen,
    })

  if (error) {
    console.error('[POST /api/training/[plan]]', error)
    return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
