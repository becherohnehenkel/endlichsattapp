'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type Status = 'laedt' | 'eingewilligt' | 'nicht-eingewilligt'

interface GesundheitsdatenConsentGateProps {
  /** Gate ist inaktiv für Gäste (deren Eingaben ohnehin nie den Server erreichen) — dann werden `children` immer direkt gerendert. */
  aktiv: boolean
  children: React.ReactNode
}

// PROJ-52: Zeigt Kalorien-Rechner, Wochen-Check-In und den Check-In-Tab (PROJ-51) erst,
// nachdem der Nutzer der Verarbeitung dieser Art.-9-Daten ausdrücklich zugestimmt hat.
// Fail-closed: jeder unklare Zustand (noch ladend, Netzwerkfehler) zeigt den
// Zustimmungs-Bildschirm statt der eigentlichen Funktion.
export function GesundheitsdatenConsentGate({ aktiv, children }: GesundheitsdatenConsentGateProps) {
  const [status, setStatus] = useState<Status>(aktiv ? 'laedt' : 'eingewilligt')
  const [aktionLaeuft, setAktionLaeuft] = useState(false)
  const [fehler, setFehler] = useState(false)

  useEffect(() => {
    if (!aktiv) return
    let abgebrochen = false
    fetch('/api/einwilligung/gesundheitsdaten')
      .then(res => (res.ok ? res.json() : { eingewilligt: false }))
      .then(data => { if (!abgebrochen) setStatus(data.eingewilligt ? 'eingewilligt' : 'nicht-eingewilligt') })
      .catch(() => { if (!abgebrochen) setStatus('nicht-eingewilligt') })
    return () => { abgebrochen = true }
  }, [aktiv])

  async function entscheiden(zustimmen: boolean) {
    setAktionLaeuft(true)
    setFehler(false)
    try {
      const res = await fetch('/api/einwilligung/gesundheitsdaten', { method: zustimmen ? 'POST' : 'DELETE' })
      if (!res.ok) throw new Error()
      setStatus(zustimmen ? 'eingewilligt' : 'nicht-eingewilligt')
    } catch {
      setFehler(true)
    } finally {
      setAktionLaeuft(false)
    }
  }

  if (!aktiv || status === 'eingewilligt') return <>{children}</>

  if (status === 'laedt') {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-[#2E9E6B]" />
        <h3 className="font-semibold text-foreground">Einwilligung erforderlich</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Diese Funktion verarbeitet Angaben wie Gewicht, Alter oder Schlaf — besondere Kategorien
        personenbezogener Daten nach Art. 9 DSGVO. Wir benötigen dafür deine ausdrückliche
        Einwilligung. Mehr dazu in unserer{' '}
        <Link href="/datenschutz" className="text-[#2E9E6B] hover:underline">Datenschutzerklärung</Link>.
      </p>
      {fehler && (
        <p className="text-sm text-destructive">Deine Entscheidung konnte nicht gespeichert werden. Bitte versuche es erneut.</p>
      )}
      <div className="flex gap-2">
        <Button onClick={() => entscheiden(true)} disabled={aktionLaeuft} className="flex-1">
          {aktionLaeuft ? 'Wird gespeichert…' : 'Zustimmen'}
        </Button>
        <Button onClick={() => entscheiden(false)} disabled={aktionLaeuft} variant="outline" className="flex-1">
          Ablehnen
        </Button>
      </div>
    </div>
  )
}
