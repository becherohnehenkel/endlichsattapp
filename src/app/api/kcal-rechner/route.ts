import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  GEWICHT_MIN_KG,
  GEWICHT_MAX_KG,
  GROESSE_MIN_CM,
  GROESSE_MAX_CM,
  ALTER_MIN_JAHRE,
  ALTER_MAX_JAHRE,
} from '@/lib/kcal-rechner'

const schema = z.object({
  gewichtKg: z.number().min(GEWICHT_MIN_KG).max(GEWICHT_MAX_KG),
  groesseCm: z.number().min(GROESSE_MIN_CM).max(GROESSE_MAX_CM),
  alterJahre: z.number().int().min(ALTER_MIN_JAHRE).max(ALTER_MAX_JAHRE),
  geschlecht: z.enum(['maennlich', 'weiblich']),
  aktivitaetslevel: z.enum(['sitzend', 'leicht_aktiv', 'moderat_aktiv', 'sehr_aktiv', 'extrem_aktiv']),
  ziel: z.enum(['fett_verlieren', 'gewicht_halten', 'muskeln_aufbauen']),
})

// PROJ-37: Speichert die Kcal-Rechner-Eingaben für eingeloggte, nicht-anonyme Nutzer.
// Gäste (kein User oder anonyme Session) dürfen laut Spec nichts speichern.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  if (user.is_anonymous) return NextResponse.json({ error: 'Gäste können keine Werte speichern' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({
      kcal_gewicht_kg: parsed.data.gewichtKg,
      kcal_groesse_cm: parsed.data.groesseCm,
      kcal_alter_jahre: parsed.data.alterJahre,
      kcal_geschlecht: parsed.data.geschlecht,
      kcal_aktivitaetslevel: parsed.data.aktivitaetslevel,
      kcal_ziel: parsed.data.ziel,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[POST /api/kcal-rechner]', error)
    return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
