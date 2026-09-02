import { createClient } from '@/lib/supabase/server'
import { getAccessStatus } from '@/lib/paywall'
import MahlzeitInput from '@/components/mahlzeit-input'
import AnonSignInInit from '@/components/anon-sign-in-init'
import { AnalyseSubHeader } from '@/components/analyse-sub-header'

// PROJ-42: umgezogen von /analyse (Hub-Seite liegt jetzt dort). Logik unverändert.
export default async function AnalyseStartPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // PROJ-19: No session yet — render skeleton that silently creates anonymous session.
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <AnalyseSubHeader title="Ernährungsanalyse starten" />
        <AnonSignInInit />
      </div>
    )
  }

  const isAnonymous = user.is_anonymous === true

  // PROJ-22: Anon → eine Query (nur photo_scans_remaining).
  // Registriert → getAccessStatus (enthält bereits photo_scans_remaining, spart zweite Query).
  // PROJ-11 (Refinement): kein Redirect mehr bei fehlender voller Ausstattung — Freitext-
  // Analyse ist immer erlaubt, nur das Foto-Kontingent fällt auf ein Lifetime-Kontingent
  // zurück (siehe hasFullAccess unten).
  let photoScansRemaining = 5
  let trialDaysRemaining: number | null = null
  let hasFullAccess = true

  if (isAnonymous) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('photo_scans_remaining')
      .eq('id', user.id)
      .single()
    photoScansRemaining = profile?.photo_scans_remaining ?? 5
  } else {
    const access = await getAccessStatus(supabase, user.id)
    hasFullAccess = access.hasAccess
    trialDaysRemaining = access.trialDaysRemaining
    photoScansRemaining = access.photoScansRemaining
  }

  return (
    <div className="min-h-screen bg-background">
      <AnalyseSubHeader title="Ernährungsanalyse starten" />
      <MahlzeitInput
        userId={user.id}
        photoScansRemaining={photoScansRemaining}
        trialDaysRemaining={trialDaysRemaining}
        isAnonymous={isAnonymous}
        hasFullAccess={hasFullAccess}
      />
    </div>
  )
}
