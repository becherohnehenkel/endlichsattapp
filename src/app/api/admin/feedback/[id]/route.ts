import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const admin = createAdminClient()

  const { data, error: dbError } = await admin
    .from('feedback')
    .update({ resolved: true })
    .eq('id', id)
    .select('id')
    .single()

  if (dbError || !data) {
    return NextResponse.json({ error: 'Feedback nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
