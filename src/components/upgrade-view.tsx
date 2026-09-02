'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UpgradeViewProps {
  subscriptionStatus: string | null
  hasInviteAccess: boolean
  /** PROJ-11 (Refinement): true = Trial läuft noch (oder Abo/Invite) — steuert, ob die
   *  Vergleichs-Tabelle als "was passiert nach dem Trial" oder "das hast du gerade" gerahmt wird */
  hasFullAccess: boolean
  /** Verbleibende Tage im 7-Tage-Trial, oder null wenn kein Trial läuft */
  trialDaysRemaining: number | null
  /** Aus dem Rückkehr-Redirect von Stripe Checkout (?session_id=...) — Webhook-Fallback */
  sessionId: string | null
  /** Aus ?showCode=1 — öffnet das Code-Formular direkt */
  defaultShowCode?: boolean
}

function FeatureComparison({ withoutProLabel }: { withoutProLabel: string }) {
  const rows = [
    { label: 'Foto-Analyse', ohnePro: '5 einmalig', mitPro: '5 pro Tag' },
    { label: 'Rezeptbibliothek', ohnePro: 'Nur Gast-Auswahl', mitPro: 'Alle Rezepte' },
    { label: 'Freitext-Analyse', ohnePro: 'Unbegrenzt', mitPro: 'Unbegrenzt' },
  ]
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
        <span />
        <span className="text-right">{withoutProLabel}</span>
        <span className="text-right text-[#2E9E6B]">Mit Pro</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 py-2.5 text-xs ${i > 0 ? 'border-t border-border' : ''}`}
        >
          <span className="text-foreground font-medium">{row.label}</span>
          <span className="text-right text-muted-foreground">{row.ohnePro}</span>
          <span className="text-right text-[#2E9E6B] font-medium">{row.mitPro}</span>
        </div>
      ))}
    </div>
  )
}

const ACTIVE_STATUSES = ['active', 'trialing']

export default function UpgradeView({ subscriptionStatus, hasInviteAccess, hasFullAccess, trialDaysRemaining, sessionId, defaultShowCode }: UpgradeViewProps) {
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
      window.location.href = '/analyse/start'
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
          <Link href="/analyse/start" className="block w-full">
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
          <Link href="/analyse/start" className="text-sm text-[#2E9E6B] hover:underline block">
            Zur Mahlzeit-Eingabe →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              {hasFullAccess && trialDaysRemaining !== null
                ? `Noch ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'Tag' : 'Tage'} voller Zugriff`
                : 'Bleib dabei'}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {hasFullAccess && trialDaysRemaining !== null
                ? 'Danach reduziert sich dein Zugriff. Werde jetzt schon Pro, damit sich nichts ändert.'
                : 'Dein Trial ist abgelaufen. Freitext-Analyse bleibt wie gehabt unbegrenzt — mit Pro bekommst du zusätzlich tägliche Foto-Analysen und die volle Rezeptbibliothek zurück.'}
            </p>
          </div>

          <FeatureComparison
            withoutProLabel={hasFullAccess && trialDaysRemaining !== null ? 'Nach Trial-Ende' : 'Aktuell'}
          />

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
                className="w-full text-sm text-muted-foreground hover:text-[#2E9E6B] transition-colors text-center"
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
                  className="text-center tracking-widest font-mono"
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
