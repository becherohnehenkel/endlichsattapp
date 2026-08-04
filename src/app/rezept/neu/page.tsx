import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOwnRecipeLimitStatus, OWN_RECIPE_LIMIT } from '@/lib/paywall'
import { Button } from '@/components/ui/button'
import RezeptFormular from '@/components/rezept-formular'

export default async function NeuesEigenesRezeptPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // PROJ-31: eigene Rezepte setzen einen vollwertigen (nicht-anonymen) Account voraus
  if (!user || user.is_anonymous) {
    redirect('/konto?reason=eigenes-rezept')
  }

  const limitStatus = await getOwnRecipeLimitStatus(supabase, user.id)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Link
          href="/rezepte"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </Link>
        <h1 className="font-semibold text-foreground">Eigenes Rezept anlegen</h1>
      </header>

      {limitStatus.allowed ? (
        <main className="max-w-lg mx-auto px-4 py-6">
          <RezeptFormular mode="create" variant="user" />
        </main>
      ) : (
        <main className="max-w-sm mx-auto px-4 py-12 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-semibold tracking-tight">Limit erreicht</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Du hast bereits {OWN_RECIPE_LIMIT} eigene Rezepte angelegt — das Maximum ohne volle Ausstattung.
              Werde Pro für unbegrenzt eigene Rezepte.
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/upgrade">Jetzt Pro werden</Link>
          </Button>
        </main>
      )}
    </div>
  )
}
