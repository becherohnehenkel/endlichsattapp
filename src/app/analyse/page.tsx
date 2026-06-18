import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAccessStatus } from '@/lib/paywall'
import Link from 'next/link'
import { UserRound, ChevronLeft } from 'lucide-react'
import MahlzeitInput from '@/components/mahlzeit-input'

export default async function AnalysePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user) {
    redirect('/login?redirectTo=%2Fanalyse')
  }

  // PROJ-10: verbleibende Foto-Scans laden. Fällt defensiv auf 0 zurück (blockiert
  // Foto-Upload statt fälschlich unbegrenzt zu erlauben), falls das Profil aus
  // irgendeinem Grund nicht gelesen werden kann.
  const { data: profile } = await supabase
    .from('profiles')
    .select('photo_scans_remaining')
    .eq('id', user.id)
    .single()
  const photoScansRemaining = profile?.photo_scans_remaining ?? 0

  // PROJ-11: Freitext-Analyse ist nach Ablauf des 7-Tage-Übergangsfensters ebenfalls
  // gesperrt, wenn kein Abo aktiv ist (revidiert PROJ-10s "für immer unbegrenzt").
  const access = await getAccessStatus(supabase, user.id)
  if (!access.hasAccess) {
    redirect('/upgrade')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Startseite
        </Link>
        <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
          <UserRound className="h-4 w-4" />
        </Link>
      </header>
      <MahlzeitInput
        userId={user.id}
        photoScansRemaining={photoScansRemaining}
        trialDaysRemaining={access.trialDaysRemaining}
      />
    </div>
  )
}
