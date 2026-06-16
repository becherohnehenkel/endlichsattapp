import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'Kein Abo vorhanden.' }, { status: 404 })
  }

  const origin = new URL(request.url).origin

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/upgrade`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[POST /api/stripe/portal]', err)
    return NextResponse.json({ error: 'Portal-Link konnte nicht erstellt werden.' }, { status: 500 })
  }
}
