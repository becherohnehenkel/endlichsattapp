import { createClient } from '@/lib/supabase/server'
import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'
import { EmotionalesEssenGuide } from '@/components/emotionales-essen-guide'
import { berechneKcal, type Geschlecht, type Aktivitaetslevel, type Ziel } from '@/lib/kcal-rechner'

// Liest den zuletzt berechneten Tages-Kcal-Bedarf aus den PROJ-37-Kcal-Rechner-Feldern in
// `profiles`, für die Mahlzeiten-Verteilung in "Feste Mahlzeiten planen" (Arbeitspunkt 8).
async function ladeTagesKcal(userId: string): Promise<number | null> {
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

  const { zielKcal } = berechneKcal({
    gewichtKg: data.kcal_gewicht_kg,
    groesseCm: data.kcal_groesse_cm,
    alterJahre: data.kcal_alter_jahre,
    geschlecht: data.kcal_geschlecht as Geschlecht,
    aktivitaetslevel: data.kcal_aktivitaetslevel as Aktivitaetslevel,
    ziel: data.kcal_ziel as Ziel,
  })
  return zielKcal
}

export default async function EmotionalesEssenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAnonymous = user?.is_anonymous === true

  const tagesKcal = (user && !isAnonymous) ? await ladeTagesKcal(user.id) : null

  return (
    <div className="min-h-screen bg-background">
      <ErnaehrungSubHeader title="Emotionales Essen" />

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6">
        <EmotionalesEssenGuide tagesKcal={tagesKcal} />
      </main>
    </div>
  )
}
