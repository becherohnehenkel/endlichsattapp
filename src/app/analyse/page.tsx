import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAccessStatus } from '@/lib/paywall'
import Link from 'next/link'
import { UserRound, ChevronLeft } from 'lucide-react'
import MahlzeitInput from '@/components/mahlzeit-input'
import AnonSignInInit from '@/components/anon-sign-in-init'

export default async function AnalysePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // PROJ-19: No session yet — render skeleton that silently creates anonymous session.
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Startseite
          </Link>
          <div className="w-6 h-6" />
        </header>
        <AnonSignInInit />
      </div>
    )
  }

  const isAnonymous = user.is_anonymous === true

  const { data: profile } = await supabase
    .from('profiles')
    .select('photo_scans_remaining')
    .eq('id', user.id)
    .single()
  const photoScansRemaining = profile?.photo_scans_remaining ?? 5

  // PROJ-19: Anonymous users bypass the paywall entirely.
  // Registered users go through the existing gate.
  let trialDaysRemaining: number | null = null
  if (!isAnonymous) {
    const access = await getAccessStatus(supabase, user.id)
    if (!access.hasAccess) redirect('/upgrade')
    trialDaysRemaining = access.trialDaysRemaining
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
        trialDaysRemaining={trialDaysRemaining}
        isAnonymous={isAnonymous}
      />
    </div>
  )
}
