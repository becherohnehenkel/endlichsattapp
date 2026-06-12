import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import MahlzeitHistorie from '@/components/mahlzeit-historie'

export default async function HistoriePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/login?redirectTo=/')

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">endlichsatt</span>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground text-sm h-8">
            Abmelden
          </Button>
        </form>
      </header>
      <MahlzeitHistorie />
    </div>
  )
}
