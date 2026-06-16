'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UpgradeViewProps {
  subscriptionStatus: string | null
  /** Aus dem Rückkehr-Redirect von Stripe Checkout (?session_id=...) — Webhook-Fallback */
  sessionId: string | null
}

const ACTIVE_STATUSES = ['active', 'trialing']

export default function UpgradeView({ subscriptionStatus, sessionId }: UpgradeViewProps) {
  const [subStatus, setSubStatus] = useState(subscriptionStatus)
  // Bei Rückkehr von Checkout mit session_id: kurz auf die Sync-Antwort warten, statt
  // sich auf den (möglicherweise verzögerten) Webhook zu verlassen.
  const [syncing, setSyncing] = useState(Boolean(sessionId))
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    fetch('/api/stripe/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.subscriptionStatus) setSubStatus(data.subscriptionStatus)
      })
      .catch(() => { /* stiller Fallback — der Webhook holt es in der Regel kurz danach nach */ })
      .finally(() => setSyncing(false))
  }, [sessionId])

  async function handleCheckout() {
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error()
      window.location.href = data.url
    } catch {
      setError('Zahlung konnte nicht gestartet werden. Bitte versuch es gleich erneut.')
      setActionLoading(false)
    }
  }

  async function handlePortal() {
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error()
      window.location.href = data.url
    } catch {
      setError('Abo-Verwaltung konnte nicht geöffnet werden.')
      setActionLoading(false)
    }
  }

  if (syncing) {
    return (
      <main className="px-4 py-12 max-w-sm mx-auto text-center">
        <p className="text-sm text-muted-foreground">Zahlung wird bestätigt…</p>
      </main>
    )
  }

  const isSubscribed = subStatus != null && ACTIVE_STATUSES.includes(subStatus)

  return (
    <main className="px-4 py-8 max-w-sm mx-auto space-y-6">
      {isSubscribed ? (
        <div className="space-y-4 text-center">
          <p className="text-3xl">🎉</p>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">Du bist Pro-Mitglied</h1>
            <p className="text-sm text-muted-foreground">
              Freitext-Analyse und Rezeptbibliothek sind freigeschaltet.
            </p>
          </div>
          <Button className="w-full" size="lg" onClick={handlePortal} disabled={actionLoading}>
            {actionLoading ? 'Wird geöffnet…' : 'Abo verwalten'}
          </Button>
          <Link href="/analyse" className="text-sm text-[#4A7C59] hover:underline block">
            Zur Mahlzeit-Eingabe →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Bleib dabei</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deine kostenlosen Foto-Scans und dein Übergangsfenster sind aufgebraucht. Schalte Freitext-Analyse und die Rezeptbibliothek wieder frei.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
            <p className="text-2xl font-semibold text-foreground">
              4,99 € <span className="text-sm text-muted-foreground font-normal">/ Monat</span>
            </p>
            <p className="text-xs text-muted-foreground">Jederzeit kündbar</p>
          </div>
          <Button className="w-full" size="lg" onClick={handleCheckout} disabled={actionLoading}>
            {actionLoading ? 'Wird vorbereitet…' : 'Jetzt freischalten'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Hast du einen Einladungscode? Diese Funktion folgt in Kürze.
          </p>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </main>
  )
}
