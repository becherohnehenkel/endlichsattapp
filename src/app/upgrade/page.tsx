import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAccessStatus } from '@/lib/paywall'
import UpgradeView from '@/components/upgrade-view'

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; showCode?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=%2Fupgrade')

  const { session_id, showCode } = await searchParams
  const access = await getAccessStatus(supabase, user.id)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-foreground tracking-tight hover:text-[#2E9E6B] transition-colors">
          endlichsatt
        </Link>
        <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
          <UserRound className="h-4 w-4" />
        </Link>
      </header>
      <UpgradeView
        subscriptionStatus={access.subscriptionStatus}
        hasInviteAccess={access.hasInviteAccess}
        sessionId={session_id ?? null}
        defaultShowCode={showCode === '1'}
      />
    </div>
  )
}
