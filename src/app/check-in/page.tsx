import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWeekStartIso } from '@/lib/wochen-grenzen'
import { WochenCheckInForm, type WochenCheckInAntworten, type WochenCheckInEintrag } from '@/components/wochen-check-in-form'

export default async function CheckInPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  const isGuest = !user || user.is_anonymous === true

  const aktuelleWoche = getWeekStartIso(new Date())
  let historie: WochenCheckInEintrag[] = []

  if (!isGuest && user) {
    // Fehler (z. B. Tabelle existiert noch nicht) werden bewusst ignoriert — die Seite
    // fällt dann einfach auf ein leeres Formular zurück statt zu crashen (gleiches Muster
    // wie beim zuletzt gespeicherten Trainingsstand aus PROJ-44).
    const { data } = await supabase
      .from('wochen_check_ins')
      .select('woche_start, antworten, updated_at')
      .eq('user_id', user.id)
      .order('woche_start', { ascending: false })
      .limit(5)

    const eintraege = (data ?? []) as unknown as { woche_start: string; antworten: WochenCheckInAntworten; updated_at: string }[]
    historie = eintraege.map(e => ({ wocheStart: e.woche_start, antworten: e.antworten, updatedAt: e.updated_at }))
  }

  const aktuellerEintrag = historie.find(e => e.wocheStart === aktuelleWoche) ?? null

  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">Check-In</span>
        <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
          <UserRound className="h-4 w-4" />
        </Link>
      </header>

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6">
        <WochenCheckInForm
          isGuest={isGuest}
          aktuelleWoche={aktuelleWoche}
          initialEintrag={aktuellerEintrag}
          historie={historie}
        />
      </main>
    </div>
  )
}
