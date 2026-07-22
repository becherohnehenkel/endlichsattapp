import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const admin = createAdminClient()

  // Offene Einträge zuerst, jeweils neueste zuerst — siehe Acceptance Criteria.
  const { data: feedback, error: dbError } = await admin
    .from('feedback')
    .select('id, message, page_type, reference_id, snapshot, resolved, created_at')
    .order('resolved', { ascending: true })
    .order('created_at', { ascending: false })

  if (dbError) return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })

  return NextResponse.json({ feedback: feedback ?? [] })
}
