import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChefHat, Ticket } from 'lucide-react'

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
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-[#E8F0EB] transition-colors"
        >
          <ChefHat className="h-5 w-5 text-[#4A7C59] flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-foreground">Rezepte verwalten</p>
            <p className="text-xs text-muted-foreground">Rezepte anlegen und bearbeiten</p>
          </div>
        </Link>

        <Link
          href="/admin/codes"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-[#E8F0EB] transition-colors"
        >
          <Ticket className="h-5 w-5 text-[#4A7C59] flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-foreground">Invite-Codes</p>
            <p className="text-xs text-muted-foreground">Codes generieren und Zugang verwalten</p>
          </div>
        </Link>
      </main>
    </div>
  )
}
