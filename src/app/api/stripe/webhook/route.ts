import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

// PROJ-11: Empfängt Events direkt von Stripe (nicht vom Browser — kein Nutzer-Session-Kontext
// hier, daher Admin-Client). Jede Anfrage MUSS mit STRIPE_WEBHOOK_SECRET verifiziert werden,
// sonst könnte jeder gefälschte "Abo aktiv"-Events schicken.
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Fehlende Signatur' }, { status: 400 })
  }

  // Rohen Body verwenden — Stripes Signatur wird über die unveränderte Byte-Sequenz
  // berechnet, ein bereits per request.json() geparster/neu serialisierter Body würde
  // nicht mehr passen.
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[POST /api/stripe/webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Ungültige Signatur' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        if (userId && customerId) {
          // Optimistisch "active" — falls der echte Status abweicht (z.B. "incomplete"),
          // korrigiert das fast augenblicklich folgende customer.subscription.updated-Event.
          await admin
            .from('profiles')
            .update({ stripe_customer_id: customerId, subscription_status: 'active' })
            .eq('id', userId)
        }
        break
      }
      // subscription.deleted liefert ebenfalls status: 'canceled' im Objekt — dieselbe
      // Behandlung wie ein normales Update reicht, kein Sonderfall nötig.
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id
        await admin
          .from('profiles')
          .update({ subscription_status: subscription.status })
          .eq('stripe_customer_id', customerId)
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('[POST /api/stripe/webhook] handling error', err)
    return NextResponse.json({ error: 'Verarbeitung fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
