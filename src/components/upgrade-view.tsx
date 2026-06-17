'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UpgradeViewProps {
  subscriptionStatus: string | null
  hasInviteAccess: boolean
  /** Aus dem Rückkehr-Redirect von Stripe Checkout (?session_id=...) — Webhook-Fallback */
  sessionId: string | null
  /** Aus ?showCode=1 — öffnet das Code-Formular direkt */
  defaultShowCode?: boolean
}

const ACTIVE_STATUSES = ['active', 'trialing']

export default function UpgradeView({ subscriptionStatus, hasInviteAccess, sessionId, defaultShowCode }: UpgradeViewProps) {
  const [subStatus, setSubStatus] = useState(subscriptionStatus)
  const [syncing, setSyncing] = useState(Boolean(sessionId))
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Invite-Code-Form State
  const [showCodeForm, setShowCodeForm] = useState(defaultShowCode ?? false)
  const [code, setCode] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (showCodeForm) {
      codeInputRef.current?.focus()
    }
  }, [showCodeForm])

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

  async function handleRedeemCode(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setCodeLoading(true)
    setCodeError(null)
    try {
      const res = await fetch('/api/invite/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.alreadyHasAccess) {
        setCodeError('Du hast bereits vollen Zugriff.')
        return
      }
      if (!res.ok) {
        setCodeError(data.error ?? 'Etwas ist schiefgelaufen — bitte versuche es erneut.')
        return
      }
      // Erfolg: kurz bestätigen, dann weiterleiten
      window.location.href = '/analyse'
    } catch {
      setCodeError('Etwas ist schiefgelaufen — bitte versuche es erneut.')
    } finally {
      setCodeLoading(false)
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

  // Invite-Access-Erfolgsansicht
  if (hasInviteAccess && !isSubscribed) {
    return (
      <main className="px-4 py-8 max-w-sm mx-auto space-y-6">
        <div className="space-y-4 text-center">
          <p className="text-3xl">🎉</p>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">Einladungscode eingelöst</h1>
            <p className="text-sm text-muted-foreground">
              Du hast dauerhaften Zugriff auf Freitext-Analyse und Rezeptbibliothek.
            </p>
          </div>
          <Link href="/analyse" className="block w-full">
            <Button className="w-full" size="lg">Zur Mahlzeit-Eingabe →</Button>
          </Link>
        </div>
      </main>
    )
  }

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

          {/* Invite-Code-Abschnitt */}
          <div className="space-y-3">
            {!showCodeForm ? (
              <button
                type="button"
                onClick={() => setShowCodeForm(true)}
                className="w-full text-sm text-muted-foreground hover:text-[#4A7C59] transition-colors text-center"
              >
                Ich habe einen Einladungscode →
              </button>
            ) : (
              <form onSubmit={handleRedeemCode} className="space-y-2">
                <Input
                  ref={codeInputRef}
                  value={code}
                  onChange={e => { setCode(e.target.value); setCodeError(null) }}
                  placeholder="Einladungscode eingeben"
                  disabled={codeLoading}
                  autoCapitalize="characters"
                  className="text-center tracking-widest uppercase"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  disabled={codeLoading || !code.trim()}
                >
                  {codeLoading ? 'Wird eingelöst…' : 'Einlösen'}
                </Button>
                {codeError && (
                  <p className="text-sm text-destructive text-center">{codeError}</p>
                )}
                <button
                  type="button"
                  onClick={() => { setShowCodeForm(false); setCode(''); setCodeError(null) }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
                >
                  Abbrechen
                </button>
              </form>
            )}
          </div>
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
