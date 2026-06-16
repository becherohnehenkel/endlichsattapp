import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

const schema = z.object({ sessionId: z.string().min(1) })

// PROJ-11: Fallback für den Fall, dass der Stripe-Webhook verzögert ankommt. Wird vom
// Rückkehr-Redirect der Checkout-Seite aufgerufen (?session_id=...) — fragt die Session
// direkt bei Stripe nach, statt der Browser-URL blind zu vertrauen.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId)

    // Sicherheitscheck: die Session muss tatsächlich diesem Nutzer gehören — verhindert,
    // dass jemand eine fremde session_id errät/abfängt und sich selbst freischaltet.
    if (session.client_reference_id !== user.id) {
      return NextResponse.json({ error: 'Session gehört nicht zu diesem Nutzer.' }, { status: 403 })
    }

    if (session.status !== 'complete') {
      return NextResponse.json({ subscriptionStatus: null })
    }

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
    if (!customerId) {
      return NextResponse.json({ subscriptionStatus: null })
    }

    const admin = createAdminClient()
    await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId, subscription_status: 'active' })
      .eq('id', user.id)

    return NextResponse.json({ subscriptionStatus: 'active' })
  } catch (err) {
    console.error('[POST /api/stripe/sync-session]', err)
    return NextResponse.json({ error: 'Synchronisierung fehlgeschlagen' }, { status: 500 })
  }
}
