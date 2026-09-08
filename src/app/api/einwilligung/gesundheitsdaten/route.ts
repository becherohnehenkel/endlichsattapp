import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hatGesundheitsdatenEinwilligung } from '@/lib/gesundheitsdaten-einwilligung'

// PROJ-52: Einwilligung für gesundheitsnahe Daten (Kalorien-Rechner + Wochen-Check-In,
// Art. 9 DSGVO). Deckt beide Funktionen mit einer gemeinsamen Einwilligung ab (siehe
// Spec Decision Log). Gäste rufen diese Route nie auf (Gate ist für sie inaktiv, siehe
// GesundheitsdatenConsentGate) — Auth-Checks unten greifen trotzdem als zweite Sicherung.

// GET: aktueller Einwilligungsstatus des eingeloggten Nutzers.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const eingewilligt = await hatGesundheitsdatenEinwilligung(supabase, user.id)
  return NextResponse.json({ eingewilligt })
}

// POST: Einwilligung erteilen (Registrierungs-Checkbox oder Zustimmungs-Bildschirm).
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  if (user.is_anonymous) return NextResponse.json({ error: 'Gäste benötigen keine Einwilligung' }, { status: 403 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ gesundheitsdaten_einwilligung_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error('[POST /api/einwilligung/gesundheitsdaten]', error)
    return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE: Einwilligung widerrufen bzw. beim Nachtrag ablehnen — löscht die betroffenen
// Daten (Art. 7 Abs. 3 DSGVO entzieht der weiteren Speicherung die Rechtsgrundlage, siehe
// Spec Decision Log), sperrt danach beide Funktionen erneut.
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  if (user.is_anonymous) return NextResponse.json({ error: 'Gäste haben keine Einwilligung zu widerrufen' }, { status: 403 })

  const admin = createAdminClient()

  const { error: checkInError } = await admin
    .from('wochen_check_ins')
    .delete()
    .eq('user_id', user.id)

  if (checkInError) {
    console.error('[DELETE /api/einwilligung/gesundheitsdaten] wochen_check_ins', checkInError)
    return NextResponse.json({ error: 'Löschen fehlgeschlagen' }, { status: 500 })
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      gesundheitsdaten_einwilligung_at: null,
      kcal_gewicht_kg: null,
      kcal_groesse_cm: null,
      kcal_alter_jahre: null,
      kcal_geschlecht: null,
      kcal_aktivitaetslevel: null,
      kcal_ziel: null,
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('[DELETE /api/einwilligung/gesundheitsdaten] profiles', profileError)
    return NextResponse.json({ error: 'Löschen fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
