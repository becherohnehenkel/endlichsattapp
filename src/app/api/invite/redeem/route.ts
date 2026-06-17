import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const schema = z.object({
  code: z.string().min(1).max(100),
})

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing']

const INVALID_RESPONSE = NextResponse.json(
  { error: 'Dieser Code ist ungültig oder wurde bereits verwendet.' },
  { status: 422 }
)

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return INVALID_RESPONSE

  const normalizedCode = parsed.data.code.trim()
  const admin = createAdminClient()

  // Rate-limit: count failed attempts in the last hour
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  const { count: attemptCount } = await admin
    .from('invite_redemption_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('attempted_at', windowStart)

  if ((attemptCount ?? 0) >= RATE_LIMIT_MAX) {
    return INVALID_RESPONSE
  }

  // Already has access — don't consume the code
  const { data: profile } = await admin
    .from('profiles')
    .select('invite_code_redeemed_at, subscription_status')
    .eq('id', user.id)
    .single()

  const hasInviteAccess = profile?.invite_code_redeemed_at != null
  const hasActiveSubscription = ACTIVE_SUBSCRIPTION_STATUSES.includes(profile?.subscription_status ?? '')

  if (hasInviteAccess || hasActiveSubscription) {
    return NextResponse.json({ alreadyHasAccess: true })
  }

  // Atomic redemption: UPDATE ... WHERE redeemed_by IS NULL prevents race conditions
  const { data: redeemed, error: redeemError } = await admin
    .from('invite_codes')
    .update({ redeemed_by: user.id, redeemed_at: new Date().toISOString() })
    .eq('code', normalizedCode)
    .is('redeemed_by', null)
    .select('code')
    .single()

  if (redeemError || !redeemed) {
    await admin.from('invite_redemption_attempts').insert({ user_id: user.id })
    return INVALID_RESPONSE
  }

  // Grant permanent access on the profile
  await admin
    .from('profiles')
    .update({ invite_code_redeemed_at: new Date().toISOString() })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
