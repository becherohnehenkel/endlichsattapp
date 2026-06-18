import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { Client } from 'node-mailjet'

const ACTIVE_STATUSES = ['active', 'trialing']

export async function POST() {
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

  try {
    const subs = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      limit: 1,
    })
    const sub = subs.data[0]

    if (!sub || !ACTIVE_STATUSES.includes(sub.status)) {
      return NextResponse.json({ error: 'Kein aktives Abo vorhanden.' }, { status: 404 })
    }

    await stripe.subscriptions.cancel(sub.id)

    const zeitstempel = new Date().toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const mailjet = new Client({
      apiKey: process.env.MAILJET_API_KEY!,
      apiSecret: process.env.MAILJET_SECRET_KEY!,
    })

    const bcc = process.env.ADMIN_EMAIL ? [{ Email: process.env.ADMIN_EMAIL }] : undefined

    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL ?? 'hallo@mehralsabnehmen.de',
            Name: 'endlichsatt',
          },
          To: [{ Email: user.email! }],
          ...(bcc ? { Bcc: bcc } : {}),
          Subject: 'Bestätigung deines Widerrufs — endlichsatt',
          TextPart: [
            'Bestätigung des Widerrufs',
            '',
            `Wir bestätigen, dass du dein Widerrufsrecht (§ 356a BGB) am ${zeitstempel} Uhr ausgeübt hast.`,
            '',
            `Konto: ${user.email}`,
            `Vertrag: ${sub.id}`,
            '',
            'Dein Abonnement wurde sofort beendet. Eine Rückerstattung anteiliger Beträge wird innerhalb von 14 Tagen bearbeitet.',
            '',
            'Bei Fragen antworte auf diese E-Mail.',
            '',
            'endlichsatt — hallo@mehralsabnehmen.de',
          ].join('\n'),
          HTMLPart: `<p><strong>Bestätigung des Widerrufs</strong></p>
<p>Wir bestätigen, dass du dein Widerrufsrecht (§ 356a BGB) am <strong>${zeitstempel} Uhr</strong> ausgeübt hast.</p>
<p><strong>Konto:</strong> ${user.email}<br><strong>Vertrag:</strong> ${sub.id}</p>
<p>Dein Abonnement wurde sofort beendet. Eine Rückerstattung anteiliger Beträge wird innerhalb von 14 Tagen bearbeitet.</p>
<p>Bei Fragen antworte auf diese E-Mail.</p>
<p>endlichsatt<br>hallo@mehralsabnehmen.de</p>`,
        },
      ],
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/stripe/widerruf]', err)
    return NextResponse.json(
      { error: 'Widerruf konnte nicht verarbeitet werden. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
