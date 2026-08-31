import { createClient } from '@/lib/supabase/server'
import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'
import { SoGehtAbnehmenGuide } from '@/components/so-geht-abnehmen-guide'
import type { KcalRechnerGespeicherteWerte } from '@/components/kcal-rechner'
import type { Geschlecht, Aktivitaetslevel, Ziel } from '@/lib/kcal-rechner'

// PROJ-37: Liest die zuletzt gespeicherten Kcal-Rechner-Werte aus `profiles`.
async function ladeGespeicherteWerte(userId: string): Promise<KcalRechnerGespeicherteWerte | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('kcal_gewicht_kg, kcal_groesse_cm, kcal_alter_jahre, kcal_geschlecht, kcal_aktivitaetslevel, kcal_ziel')
    .eq('id', userId)
    .maybeSingle()

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

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6">
        <SoGehtAbnehmenGuide kannSpeichern={kannSpeichern} gespeicherteWerte={gespeicherteWerte} />
      </main>
    </div>
  )
}
