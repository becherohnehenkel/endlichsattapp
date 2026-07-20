import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChefHat, Ticket, Home } from 'lucide-react'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email !== process.env.ADMIN_EMAIL) redirect('/admin/403')
}

export default async function AdminPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <h1 className="font-semibold text-foreground">Admin</h1>
        <p className="text-xs text-muted-foreground">endlichsatt</p>
      </header>

      <main className="max-w-sm mx-auto px-4 py-8 space-y-3">
        <Link
          href="/admin/rezepte"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-[#DFF0F2] transition-colors"
        >
          <ChefHat className="h-5 w-5 text-[#2E9E6B] flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-foreground">Rezepte verwalten</p>
            <p className="text-xs text-muted-foreground">Rezepte anlegen und bearbeiten</p>
          </div>
        </Link>

        <Link
          href="/admin/codes"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-[#DFF0F2] transition-colors"
        >
          <Ticket className="h-5 w-5 text-[#2E9E6B] flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-foreground">Invite-Codes</p>
            <p className="text-xs text-muted-foreground">Codes generieren und Zugang verwalten</p>
          </div>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
        >
          <Home className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-foreground">Zur Startseite</p>
            <p className="text-xs text-muted-foreground">Zurück zur App</p>
          </div>
        </Link>
      </main>
    </div>
  )
}
