import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAccessStatus } from '@/lib/paywall'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-foreground tracking-tight hover:text-[#4A7C59] transition-colors">
          endlichsatt
        </Link>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground text-sm h-8">
            Abmelden
          </Button>
        </form>
      </header>
      <MahlzeitInput
        userId={user.id}
        photoScansRemaining={photoScansRemaining}
        trialDaysRemaining={access.trialDaysRemaining}
      />
    </div>
  )
}
