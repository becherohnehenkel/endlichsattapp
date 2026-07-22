import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ChevronLeft } from 'lucide-react'
import FeedbackList, { type FeedbackEntry } from './feedback-list'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email !== process.env.ADMIN_EMAIL) redirect('/admin/403')
}

export default async function AdminFeedbackPage() {
  await requireAdmin()

  const admin = createAdminClient()
  const { data: feedback } = await admin
    .from('feedback')
    .select('id, message, page_type, reference_id, snapshot, resolved, created_at')
    .order('resolved', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-semibold text-foreground">Feedback</h1>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6">
        {!feedback || feedback.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">Noch kein Feedback eingegangen.</p>
        ) : (
          <FeedbackList entries={feedback as FeedbackEntry[]} />
        )}
      </main>
    </div>
  )
}
