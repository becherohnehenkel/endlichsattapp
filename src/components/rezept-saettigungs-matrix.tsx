'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import RatingRing from '@/components/rating-ring'
import type { RezeptSaettigungsMatrix, SaeulenRating } from '@/lib/saettigungs-matrix-rezept'

// Refinement 2026-08-11 ("Complete"-Umstrukturierung): 6 Bausteine → 3 Säulen. Rezepte
// wurden vollständig gebackfillt (siehe scripts/backfill-rezept-saettigungsmatrix.mjs) —
// anders als bei Mahlzeit-Analysen gibt es hier kein Alt-Format, das erkannt werden müsste.
const PILLAR_ORDER = ['proteine', 'ballaststoffe', 'volumen'] as const

const PILLAR_META: Record<string, { label: string; emoji: string }> = {
  ballaststoffe: { label: 'Ballaststoffe', emoji: '🌾' },
  proteine:      { label: 'Proteine',      emoji: '💪' },
  volumen:       { label: 'Volumen',       emoji: '🥗' },
}

function ratingConfig(rating: SaeulenRating) {
  switch (rating) {
    case 'gut':         return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', label: 'Gut' }
    case 'mittel':       return { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-[#EAB308]',   label: 'Mittel' }
    case 'gering':       return { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-600',  label: 'Gering' }
    case 'ungenuegend':  return { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-600',     label: 'Ungenügend' }
    default:             return { bg: 'bg-muted',      border: 'border-border',      text: 'text-muted-foreground', label: '–' }
  }
}

export default function RezeptSaettigungsMatrix({ matrix }: { matrix: RezeptSaettigungsMatrix }) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="space-y-1.5">
      {PILLAR_ORDER.map(pillar => {
        const meta = PILLAR_META[pillar]
        const bewertung = matrix.saeulen[pillar]
        const cfg = ratingConfig(bewertung.rating)
        const isOpen = open === pillar

        return (
          <div key={pillar} className={`rounded-xl border ${cfg.border} overflow-hidden`}>
            <button
              type="button"
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left ${cfg.bg} transition-colors`}
              onClick={() => setOpen(isOpen ? null : pillar)}
            >
              <div className={`relative w-8 h-8 flex-shrink-0 flex items-center justify-center ${cfg.text}`}>
                <RatingRing rating={bewertung.rating} size={32} segments={4} />
                <span className="text-sm leading-none">{meta.emoji}</span>
              </div>
              <span className="text-sm font-medium text-foreground flex-1">{meta.label}</span>
              <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
              {isOpen
                ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              }
            </button>
            {isOpen && (
              <div className="px-3 py-2.5 bg-card border-t border-border space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">{bewertung.erklaerung}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
