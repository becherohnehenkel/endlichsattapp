import { createClient } from '@/lib/supabase/server'
import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'
import { SoGehtAbnehmenGuide } from '@/components/so-geht-abnehmen-guide'
import type { KcalRechnerGespeicherteWerte } from '@/components/kcal-rechner'
import type { Geschlecht, Aktivitaetslevel, Ziel } from '@/lib/kcal-rechner'

// PROJ-37: Liest die zuletzt gespeicherten Kcal-Rechner-Werte aus `profiles`. Die Spalten
// (kcal_gewicht_kg, kcal_groesse_cm, kcal_alter_jahre, kcal_geschlecht, kcal_aktivitaetslevel,
// kcal_ziel) existieren erst nach /backend — bis dahin liefert die Query fehlerfrei "kein
// Ergebnis" zurück (PostgREST-Fehler bei unbekannter Spalte wird hier bewusst als "keine
// gespeicherten Werte" behandelt, kein Absturz der Seite). Der Type-Cast ist bewusst, weil
// die generierten Supabase-Typen die neuen Spalten vor der /backend-Migration noch nicht kennen.
interface KcalProfileRow {
  kcal_gewicht_kg: number | null
  kcal_groesse_cm: number | null
  kcal_alter_jahre: number | null
  kcal_geschlecht: string | null
  kcal_aktivitaetslevel: string | null
  kcal_ziel: string | null
}

async function ladeGespeicherteWerte(userId: string): Promise<KcalRechnerGespeicherteWerte | null> {
  const supabase = await createClient()
  const result = await supabase
    .from('profiles')
    .select('kcal_gewicht_kg, kcal_groesse_cm, kcal_alter_jahre, kcal_geschlecht, kcal_aktivitaetslevel, kcal_ziel')
    .eq('id', userId)
    .maybeSingle()
  const data = result.data as unknown as KcalProfileRow | null

  if (
    !data ||
    data.kcal_gewicht_kg == null ||
    data.kcal_groesse_cm == null ||
    data.kcal_alter_jahre == null ||
    !data.kcal_geschlecht ||
    !data.kcal_aktivitaetslevel ||
    !data.kcal_ziel
  ) {
    return null
  }

  return {
    gewichtKg: data.kcal_gewicht_kg,
    groesseCm: data.kcal_groesse_cm,
    alterJahre: data.kcal_alter_jahre,
    geschlecht: data.kcal_geschlecht as Geschlecht,
    aktivitaetslevel: data.kcal_aktivitaetslevel as Aktivitaetslevel,
    ziel: data.kcal_ziel as Ziel,
  }
}

export default async function SoGehtAbnehmenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAnonymous = user?.is_anonymous === true
  const kannSpeichern = !!user && !isAnonymous

  const gespeicherteWerte = kannSpeichern ? await ladeGespeicherteWerte(user.id) : null

  return (
    <div className="min-h-screen bg-background">
      <ErnaehrungSubHeader title="So geht abnehmen" />

      <main className="max-w-sm mx-auto px-4 py-6">
        <SoGehtAbnehmenGuide kannSpeichern={kannSpeichern} gespeicherteWerte={gespeicherteWerte} />
      </main>
    </div>
  )
}
