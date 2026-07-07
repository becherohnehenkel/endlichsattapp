import { createClient } from '@/lib/supabase/server'
import { getAccessStatus } from '@/lib/paywall'
import { stripe } from '@/lib/stripe'
import GastKontoView from '@/components/gast-konto-view'
import KontoView, { type StripeDetails } from '@/components/konto-view'

interface KontoPageProps {
  searchParams: Promise<{ reason?: string }>
}

export default async function KontoPage({ searchParams }: KontoPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { reason } = await searchParams

  // PROJ-19: Gäste (kein User oder anonymer User) sehen den Conversion-Screen
  if (!user || user.is_anonymous) {
    return <GastKontoView reason={reason} />
  }

  const [access, profileResult] = await Promise.all([
    getAccessStatus(supabase, user.id),
    supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single(),
  ])

  const stripeCustomerId = profileResult.data?.stripe_customer_id ?? null
  const isAdmin = user.email === process.env.ADMIN_EMAIL
  const isSubscribed = access.subscriptionStatus != null &&
    ['active', 'trialing'].includes(access.subscriptionStatus)

  let stripeDetails: StripeDetails | null = null
  if (isSubscribed && stripeCustomerId) {
    try {
      const subs = await stripe.subscriptions.list({ customer: stripeCustomerId, limit: 1 })
      const sub = subs.data[0]
      if (sub) {
        const anchor = new Date(sub.billing_cycle_anchor * 1000)
        const nextPayment = new Date(anchor)
        const now = new Date()
        while (nextPayment <= now) {
          nextPayment.setMonth(nextPayment.getMonth() + 1)
        }
        stripeDetails = {
          nextPaymentDate: nextPayment.toISOString(),
          subscriptionStart: new Date(sub.start_date * 1000).toISOString(),
          subscriptionId: sub.id,
        }
      }
    } catch {
      // Stripe-Fehler nicht crashen lassen
    }
  }

  return (
    <KontoView
      email={user.email ?? ''}
      subscriptionStatus={access.subscriptionStatus}
      hasInviteAccess={access.hasInviteAccess}
      trialDaysRemaining={access.trialDaysRemaining}
      isAdmin={isAdmin}
      stripeDetails={stripeDetails}
    />
  )
}
