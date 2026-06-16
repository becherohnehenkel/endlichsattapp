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

  const origin = new URL(request.url).origin

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      // client_reference_id verbindet die Session zweifelsfrei mit unserem Nutzer —
      // der Webhook (und der Sync-Fallback) lesen das wieder aus.
      client_reference_id: user.id,
      // Bereits bekannten Stripe-Kunden wiederverwenden statt einen Duplikat-Kunden
      // anzulegen (z.B. bei Re-Subscribe nach einer Kündigung).
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      success_url: `${origin}/upgrade?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade`,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Checkout-Session konnte nicht erstellt werden.' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[POST /api/stripe/checkout]', err)
    return NextResponse.json({ error: 'Checkout-Session konnte nicht erstellt werden.' }, { status: 500 })
  }
}
