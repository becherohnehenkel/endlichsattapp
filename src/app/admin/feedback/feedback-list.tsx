'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export interface FeedbackEntry {
  id: string
  message: string
  page_type: string
  reference_id: string | null
  snapshot: unknown
  resolved: boolean
  created_at: string
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  mahlzeit_analyse: 'Mahlzeit-Analyse',
  mahlzeit_historie: 'Mahlzeit-Historie',
  rezept: 'Rezept',
}

const PILLAR_LABELS: Record<string, string> = {
  geschmack: 'Geschmack',
  biss: 'Biss',
  ballaststoffe: 'Ballaststoffe',
  proteine: 'Proteine',
  volumen: 'Volumen',
  art_of_eating: 'Art of Eating',
}

function referenceHref(pageType: string, referenceId: string | null): string | null {
  if (!referenceId) return null
  if (pageType === 'rezept') return `/rezept/${referenceId}`
  if (pageType === 'mahlzeit_analyse' || pageType === 'mahlzeit_historie') return `/mahlzeit/${referenceId}`
  return null
}

function formatZeitpunkt(iso: string): string {
  return new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })
}

function Bausteine({ bausteine }: { bausteine: Record<string, unknown> }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
      {Object.entries(bausteine).map(([key, value]) => {
        const rating = typeof value === 'string' ? value : (value as { rating?: string } | null)?.rating
        return (
          <div key={key} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{PILLAR_LABELS[key] ?? key}</span>
            <span className="font-medium text-foreground">{rating ?? '–'}</span>
          </div>
        )
      })}
    </div>
  )
}

function Naehrwerte({ naehrwerte }: { naehrwerte: Record<string, number> }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Object.entries(naehrwerte).map(([key, value]) => (
        <div key={key} className="rounded-md border border-border bg-muted/40 px-2 py-1 text-center">
          <p className="text-muted-foreground leading-tight">{key}</p>
          <p className="font-medium text-foreground">{String(value)}</p>
        </div>
      ))}
    </div>
  )
}

function SnapshotDetails({ snapshot }: { snapshot: unknown }) {
  if (!snapshot || typeof snapshot !== 'object') return null
  const s = snapshot as {
    zutatenliste?: { name?: string | null; amount?: unknown; unit?: string | null }[]
    vorher?: { bausteine?: Record<string, unknown>; gesamtbewertung?: string; erklaerung?: string; naehrwerte?: Record<string, number> }
    nachher?: { bausteine?: Record<string, unknown>; gesamtbewertung?: string; naehrwerte?: Record<string, number> }
    vorschlaege?: { aktion?: string; begruendung?: string; baustein?: string }[]
    art_of_eating_tipp?: string | null
    matrix?: { bausteine?: Record<string, unknown>; gesamtbewertung?: string }
    naehrwerte?: Record<string, number>
    annahmen?: string[]
  }

  return (
    <div className="space-y-3 text-xs">
      {s.zutatenliste && s.zutatenliste.length > 0 && (
        <div>
          <p className="font-semibold text-foreground mb-1">Zutaten</p>
          <ul className="space-y-0.5">
            {s.zutatenliste.map((z, i) => (
              <li key={i} className="flex justify-between text-muted-foreground">
                <span>{z.name ?? '–'}</span>
                <span>{z.amount != null ? `${z.amount} ${z.unit ?? ''}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.annahmen && s.annahmen.length > 0 && (
        <div>
          <p className="font-semibold text-foreground mb-1">Annahmen der KI</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
            {s.annahmen.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {s.vorher?.bausteine && (
        <div>
          <p className="font-semibold text-foreground mb-1">
            Vorher {s.vorher.gesamtbewertung ? `(${s.vorher.gesamtbewertung})` : ''}
          </p>
          <Bausteine bausteine={s.vorher.bausteine} />
          {s.vorher.erklaerung && <p className="text-muted-foreground mt-1">{s.vorher.erklaerung}</p>}
          {s.vorher.naehrwerte && <div className="mt-1"><Naehrwerte naehrwerte={s.vorher.naehrwerte} /></div>}
        </div>
      )}

      {s.matrix?.bausteine && (
        <div>
          <p className="font-semibold text-foreground mb-1">
            Sättigungs-Matrix {s.matrix.gesamtbewertung ? `(${s.matrix.gesamtbewertung})` : ''}
          </p>
          <Bausteine bausteine={s.matrix.bausteine} />
        </div>
      )}

      {s.naehrwerte && (
        <div>
          <p className="font-semibold text-foreground mb-1">Nährwerte</p>
          <Naehrwerte naehrwerte={s.naehrwerte} />
        </div>
      )}

      {s.vorschlaege && s.vorschlaege.length > 0 && (
        <div>
          <p className="font-semibold text-foreground mb-1">Verbesserungsvorschläge</p>
          <ul className="space-y-1">
            {s.vorschlaege.map((v, i) => (
              <li key={i} className="text-muted-foreground">
                <span className="font-medium text-foreground">{v.baustein}:</span> {v.aktion} — {v.begruendung}
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.art_of_eating_tipp && (
        <div>
          <p className="font-semibold text-foreground mb-1">Art-of-Eating-Tipp</p>
          <p className="text-muted-foreground">{s.art_of_eating_tipp}</p>
        </div>
      )}

      {s.nachher?.bausteine && (
        <div>
          <p className="font-semibold text-foreground mb-1">
            Nachher {s.nachher.gesamtbewertung ? `(${s.nachher.gesamtbewertung})` : ''}
          </p>
          <Bausteine bausteine={s.nachher.bausteine} />
          {s.nachher.naehrwerte && <div className="mt-1"><Naehrwerte naehrwerte={s.nachher.naehrwerte} /></div>}
        </div>
      )}
    </div>
  )
}

function FeedbackItem({ entry, onResolve }: { entry: FeedbackEntry; onResolve: (id: string) => void }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [resolving, setResolving] = useState(false)
  const href = referenceHref(entry.page_type, entry.reference_id)

  async function handleResolve() {
    setResolving(true)
    try {
      const res = await fetch(`/api/admin/feedback/${entry.id}`, { method: 'PATCH' })
      if (res.ok) onResolve(entry.id)
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className={`rounded-xl border border-border bg-card p-3 space-y-2 ${entry.resolved ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {PAGE_TYPE_LABELS[entry.page_type] ?? entry.page_type} · {formatZeitpunkt(entry.created_at)}
          </p>
          <p className="text-sm text-foreground mt-0.5">{entry.message}</p>
        </div>
        {!entry.resolved && (
          <Button size="sm" variant="outline" className="flex-shrink-0 h-7 px-2" onClick={handleResolve} disabled={resolving}>
            <Check className="h-3.5 w-3.5 mr-1" />
            {resolving ? '…' : 'Erledigt'}
          </Button>
        )}
      </div>

      {href && (
        <Link href={href} className="text-xs text-[#2E9E6B] underline underline-offset-2">
          Zur betroffenen Seite
        </Link>
      )}
      {!href && entry.reference_id && (
        <p className="text-xs text-muted-foreground italic">Original nicht mehr vorhanden</p>
      )}

      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {detailsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          Analyse-Daten zum Meldezeitpunkt
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <SnapshotDetails snapshot={entry.snapshot} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default function FeedbackList({ entries: initialEntries }: { entries: FeedbackEntry[] }) {
  const [entries, setEntries] = useState(initialEntries)

  function handleResolve(id: string) {
    setEntries(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, resolved: true } : e)
      // Offene zuerst, erledigte ans Ende — konsistent mit der initialen Server-Sortierung.
      return [...updated].sort((a, b) => Number(a.resolved) - Number(b.resolved))
    })
  }

  return (
    <div className="space-y-3">
      {entries.map(entry => (
        <FeedbackItem key={entry.id} entry={entry} onResolve={handleResolve} />
      ))}
    </div>
  )
}
