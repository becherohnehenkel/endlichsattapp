import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import RezeptFormular from '@/components/rezept-formular'

export default async function NeuesRezeptPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email !== process.env.ADMIN_EMAIL) redirect('/admin/403')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Link
          href="/admin/rezepte"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </Link>
        <h1 className="font-semibold text-foreground">Neues Rezept</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <RezeptFormular mode="create" />
      </main>
    </div>
  )
}
