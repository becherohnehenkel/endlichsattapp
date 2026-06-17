import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ChevronLeft } from 'lucide-react'
import InviteCodesTable from './invite-codes-table'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email !== process.env.ADMIN_EMAIL) redirect('/admin/403')
}

export default async function AdminCodesPage() {
  await requireAdmin()

  const admin = createAdminClient()

  // Load all codes with redeemer email via join
  const { data: rows } = await admin
    .from('invite_codes')
    .select('code, redeemed_by, redeemed_at, profiles(email)')
    .order('created_at', { ascending: false })

  const codes = (rows ?? []).map((r) => ({
    code: r.code,
    redeemed_by: r.redeemed_by,
    redeemed_at: r.redeemed_at,
    redeemer_email: Array.isArray(r.profiles)
      ? (r.profiles[0]?.email ?? null)
      : ((r.profiles as { email?: string } | null)?.email ?? null),
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-semibold text-foreground">Invite-Codes</h1>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <InviteCodesTable codes={codes} />
      </main>
    </div>
  )
}
