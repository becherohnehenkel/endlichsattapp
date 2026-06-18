'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface StripeDetails {
  nextPaymentDate: string
  subscriptionStart: string
  subscriptionId: string
}

interface KontoViewProps {
  email: string
  subscriptionStatus: string | null
  hasInviteAccess: boolean
  trialDaysRemaining: number | null
  isAdmin: boolean
  stripeDetails: StripeDetails | null
}

const ACTIVE_STATUSES = ['active', 'trialing']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function KontoView({
  email,
  subscriptionStatus,
  hasInviteAccess,
  trialDaysRemaining,
  isAdmin,
  stripeDetails,
}: KontoViewProps) {
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)
  const [widerrufOpen, setWiderrufOpen] = useState(false)
  const [widerrufLoading, setWiderrufLoading] = useState(false)
  const [widerrufError, setWiderrufError] = useState<string | null>(null)
  const [widerrufSuccess, setWiderrufSuccess] = useState(false)

  const isSubscribed = subscriptionStatus != null && ACTIVE_STATUSES.includes(subscriptionStatus)

  async function handlePortal() {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error()
      window.location.href = data.url
    } catch {
      setPortalError('Abo-Verwaltung konnte nicht geöffnet werden. Bitte versuche es erneut.')
      setPortalLoading(false)
    }
  }

  async function handleWiderruf() {
    setWiderrufLoading(true)
    setWiderrufError(null)
    try {
      const res = await fetch('/api/stripe/widerruf', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fehler beim Widerruf')
      setWiderrufOpen(false)
      setWiderrufSuccess(true)
    } catch (err) {
      setWiderrufError(err instanceof Error ? err.message : 'Widerruf konnte nicht verarbeitet werden.')
      setWiderrufLoading(false)
    }
  }

  function StatusBadge() {
    if (widerrufSuccess) {
      return <Badge variant="outline" className="text-muted-foreground">Kein aktiver Zugang</Badge>
    }
    if (isSubscribed) {
      return <Badge className="bg-[#4A7C59] text-white hover:bg-[#4A7C59]">Aktives Abo</Badge>
    }
    if (hasInviteAccess) {
      return <Badge variant="secondary">Einladungszugang</Badge>
    }
    if (trialDaysRemaining !== null) {
      return (
        <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50">
          Testzeitraum — noch {trialDaysRemaining} {trialDaysRemaining === 1 ? 'Tag' : 'Tage'}
        </Badge>
      )
    }
    return <Badge variant="outline" className="text-muted-foreground">Kein aktiver Zugang</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <Link href="/analyse" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-foreground">Mein Konto</h1>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 space-y-4">

        {/* Konto-Info */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Konto</p>
          <div className="space-y-1">
            <p className="text-sm text-foreground font-medium">{email}</p>
            <StatusBadge />
          </div>
        </div>

        {/* Abo-Details */}
        {isSubscribed && !widerrufSuccess && stripeDetails && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Abonnement</p>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">4,99 € / Monat</p>
              <p className="text-sm text-muted-foreground">
                Nächste Zahlung: {formatDate(stripeDetails.nextPaymentDate)}
              </p>
            </div>
            <div className="space-y-2 pt-1">
              {portalError && (
                <p className="text-xs text-destructive">{portalError}</p>
              )}
              <Button
                className="w-full"
                variant="outline"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? 'Wird geöffnet…' : 'Abo verwalten'}
              </Button>
              <Button
                className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                variant="outline"
                onClick={() => { setWiderrufError(null); setWiderrufOpen(true) }}
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Vertrag widerrufen
              </Button>
            </div>
          </div>
        )}

        {/* Abo-Details ohne Stripe-Daten (Stripe nicht erreichbar) */}
        {isSubscribed && !widerrufSuccess && !stripeDetails && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Abonnement</p>
            <p className="text-sm text-foreground">4,99 € / Monat</p>
            <div className="space-y-2 pt-1">
              {portalError && (
                <p className="text-xs text-destructive">{portalError}</p>
              )}
              <Button className="w-full" variant="outline" onClick={handlePortal} disabled={portalLoading}>
                {portalLoading ? 'Wird geöffnet…' : 'Abo verwalten'}
              </Button>
              <Button
                className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                variant="outline"
                onClick={() => { setWiderrufError(null); setWiderrufOpen(true) }}
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Vertrag widerrufen
              </Button>
            </div>
          </div>
        )}

        {/* Widerruf-Erfolgsmeldung */}
        {widerrufSuccess && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 space-y-1">
            <p className="text-sm font-semibold text-green-800">Widerruf bestätigt</p>
            <p className="text-sm text-green-700">
              Dein Vertrag wurde widerrufen. Eine Bestätigung mit Datum und Uhrzeit wurde an {email} geschickt.
              Rückerstattungen werden innerhalb von 14 Tagen bearbeitet.
            </p>
          </div>
        )}

        {/* Invite-Zugang */}
        {hasInviteAccess && !isSubscribed && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Zugang</p>
            <p className="text-sm text-foreground">Du hast vollen Zugang über einen Einladungscode.</p>
          </div>
        )}

        {/* Trial / Kein Zugang */}
        {!isSubscribed && !hasInviteAccess && !widerrufSuccess && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {trialDaysRemaining !== null
                ? `Dein Testzeitraum läuft noch ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'Tag' : 'Tage'}.`
                : 'Dein Testzeitraum ist abgelaufen.'}
            </p>
            <Link href="/upgrade">
              <Button className="w-full bg-[#4A7C59] hover:bg-[#3d6849] text-white">
                Jetzt freischalten
              </Button>
            </Link>
          </div>
        )}

        {/* Admin-Link */}
        {isAdmin && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <Link
              href="/admin"
              className="flex items-center justify-between text-sm text-[#4A7C59] font-medium hover:text-[#3d6849] transition-colors"
            >
              Admin-Bereich
              <span className="text-muted-foreground">→</span>
            </Link>
          </div>
        )}

      </main>

      {/* Widerruf-Dialog */}
      <AlertDialog open={widerrufOpen} onOpenChange={setWiderrufOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vertrag widerrufen</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Du übst dein gesetzliches Widerrufsrecht (§ 356a BGB) aus.
                  Dein Abo wird <strong className="text-foreground">sofort beendet</strong>.
                </p>
                <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-xs">
                  <p><span className="font-medium text-foreground">Konto:</span> {email}</p>
                  {stripeDetails && (
                    <p><span className="font-medium text-foreground">Vertrag seit:</span> {formatDate(stripeDetails.subscriptionStart)}</p>
                  )}
                </div>
                <p>Rückerstattungen werden innerhalb von 14 Tagen bearbeitet. Eine Bestätigung mit Zeitstempel erhältst du per E-Mail.</p>
                {widerrufError && (
                  <p className="text-destructive font-medium">{widerrufError}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={widerrufLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleWiderruf() }}
              disabled={widerrufLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {widerrufLoading ? 'Wird verarbeitet…' : 'Jetzt widerrufen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
