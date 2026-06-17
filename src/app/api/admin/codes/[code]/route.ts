import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (user.email !== process.env.ADMIN_EMAIL) return null
  return user
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
  }

  const { code } = await params
  const admin = createAdminClient()

  // Only delete if not yet redeemed
  const { data, error } = await admin
    .from('invite_codes')
    .delete()
    .eq('code', code)
    .is('redeemed_by', null)
    .select('code')
    .single()

  if (error || !data) {
    // Check if it exists but is already redeemed
    const { data: existing } = await admin
      .from('invite_codes')
      .select('redeemed_by')
      .eq('code', code)
      .single()

    if (existing?.redeemed_by) {
      return NextResponse.json(
        { error: 'Code wurde bereits eingelöst und kann nicht mehr gelöscht werden.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Code nicht gefunden.' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
