import Link from 'next/link'
import { ArrowRight, Plus, UserRound, UtensilsCrossed, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { berechneKcal, type Geschlecht, type Aktivitaetslevel, type Ziel } from '@/lib/kcal-rechner'
import { AnalyseTagesuebersicht } from '@/components/analyse-tagesuebersicht'
import { AnalyseHistorieTabs } from '@/components/analyse-historie-tabs'
import { AnalyseLoginHinweis } from '@/components/analyse-login-hinweis'

// PROJ-42: Standard-Tagesziel, solange das individuelle Profil-Feld noch nicht existiert
// (siehe Spec Open Questions / Decision Log — Persistenz ist Aufgabe von /backend).
const MAHLZEITEN_ZIEL_DEFAULT = 3

interface RawAnalyse {
  analysis_typ: string | null
  macros_before: { kcal?: number } | null
}
interface RawMeal {
  id: string
  meal_analyses: RawAnalyse[] | null
}

export default async function AnalyseHubPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  const isGuest = !user || user.is_anonymous === true

  let mahlzeitenHeute = 0
  let kcalRest: number | null = null
  const mahlzeitenZiel = MAHLZEITEN_ZIEL_DEFAULT

  if (!isGuest && user) {
    // Vereinfachung: Kalendertag in UTC, analog zum bestehenden Scan-Limit-Reset
    // (profiles.photo_scans_today_date) statt echter Nutzer-Zeitzone.
    const todayStart = `${new Date().toISOString().split('T')[0]}T00:00:00.000Z`

    const [{ data: heutigeMeals }, { data: profile }] = await Promise.all([
      supabase
        .from('meals')
        .select('id, meal_analyses ( analysis_typ, macros_before )')
        .eq('user_id', user.id)
        .gte('created_at', todayStart),
      supabase
        .from('profiles')
        .select('kcal_gewicht_kg, kcal_groesse_cm, kcal_alter_jahre, kcal_geschlecht, kcal_aktivitaetslevel, kcal_ziel')
        .eq('id', user.id)
        .single(),
    ])

    // Nur Typ "Mahlzeit" zählt zum Tagesfortschritt (siehe Spec Decision Log) —
    // "standard" ist der ältere Name desselben Typs (siehe /api/recap/wochen).
    const heutigeMahlzeitAnalysen = ((heutigeMeals ?? []) as unknown as RawMeal[])
      .map(m => (m.meal_analyses ?? []).find(a => a.analysis_typ === 'mahlzeit' || a.analysis_typ === 'standard'))
      .filter((a): a is RawAnalyse => a != null)

    mahlzeitenHeute = heutigeMahlzeitAnalysen.length
    const kcalHeute = heutigeMahlzeitAnalysen.reduce((sum, a) => sum + (a.macros_before?.kcal ?? 0), 0)

    if (
      profile?.kcal_gewicht_kg != null &&
      profile?.kcal_groesse_cm != null &&
      profile?.kcal_alter_jahre != null &&
      profile?.kcal_geschlecht != null &&
      profile?.kcal_aktivitaetslevel != null &&
      profile?.kcal_ziel != null
    ) {
      const { zielKcal } = berechneKcal({
        gewichtKg: profile.kcal_gewicht_kg,
        groesseCm: profile.kcal_groesse_cm,
        alterJahre: profile.kcal_alter_jahre,
        geschlecht: profile.kcal_geschlecht as Geschlecht,
        aktivitaetslevel: profile.kcal_aktivitaetslevel as Aktivitaetslevel,
        ziel: profile.kcal_ziel as Ziel,
      })
      kcalRest = Math.max(zielKcal - kcalHeute, 0)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">Analyse</span>
        <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
          <UserRound className="h-4 w-4" />
        </Link>
      </header>

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lerne deine Ernährung kennen</h1>

        {/* Sektion 1 — Ernährungsanalyse starten */}
        <Link
          href="/analyse/start"
          className="block rounded-2xl border border-[#2E9E6B]/30 bg-[#DFF0F2] p-5 space-y-3 hover:border-[#2E9E6B] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
              <Plus className="h-5 w-5 text-[#2E9E6B]" />
            </div>
            <p className="font-semibold text-[#0E7C86]">Ernährungsanalyse starten</p>
          </div>
          <p className="text-sm text-[#2E9E6B]/90 leading-relaxed">
            Springe direkt ins Tool, das deinen Teller analysiert und dir zeigt, wie sättigend deine Mahlzeit wirklich ist — inklusive konkreter Tipps, wie du sie verbessern kannst. Passend zu den erkannten Hauptzutaten bekommst du außerdem ein echtes Rezept zum Ausprobieren vorgeschlagen.
          </p>
          <span className="text-sm font-medium text-[#2E9E6B] inline-flex items-center gap-1">
            Jetzt starten <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <div className="h-px bg-border" />

        {/* Sektion 2 — Tagesübersicht */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Das hast du bereits gegessen</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hier siehst du, was du heute schon gegessen hast und was noch vor dir liegt — ganz ohne Kalorien-Gerede, denn vollwertige Mahlzeiten bringen dich ans Ziel. Willst du die Zahlen trotzdem sehen, kannst du sie unten ein- und ausblenden.
            </p>
          </div>
          {isGuest ? (
            <AnalyseLoginHinweis
              icon={UtensilsCrossed}
              text="Melde dich an, um deinen Tagesfortschritt zu sehen."
              reason="tagesuebersicht"
            />
          ) : (
            <AnalyseTagesuebersicht
              mahlzeitenHeute={mahlzeitenHeute}
              mahlzeitenZiel={mahlzeitenZiel}
              kcalRest={kcalRest}
            />
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Sektion 3 — Historie der letzten Tage */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Die letzten Tage auf deinem Teller</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Eine kurze Analyse der letzten Tage: was du gegessen hast, was deine Favoriten sind und wo noch Luft nach oben ist.
            </p>
          </div>
          {isGuest ? (
            <AnalyseLoginHinweis
              icon={Clock}
              text="Melde dich an, um deine Analyse-Historie zu sehen."
              reason="historie"
            />
          ) : (
            <AnalyseHistorieTabs />
          )}
        </div>
      </main>
    </div>
  )
}
