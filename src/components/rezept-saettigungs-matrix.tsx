'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import RatingRing from '@/components/rating-ring'
import type { RezeptSaettigungsMatrix, BausteinRating } from '@/lib/saettigungs-matrix-rezept'

const PILLAR_ORDER = ['geschmack', 'biss', 'ballaststoffe', 'proteine', 'volumen', 'art_of_eating'] as const

const PILLAR_META: Record<string, { label: string; emoji: string }> = {
  geschmack:     { label: 'Geschmack',     emoji: '✨' },
  biss:          { label: 'Biss',          emoji: '🥕' },
  ballaststoffe: { label: 'Ballaststoffe', emoji: '🌾' },
  proteine:      { label: 'Proteine',      emoji: '💪' },
  volumen:       { label: 'Volumen',       emoji: '🥗' },
  art_of_eating: { label: 'Art of Eating', emoji: '🧘' },
}

function ratingConfig(rating: BausteinRating) {
  switch (rating) {
    case 'gut':    return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Gut' }
    case 'mittel': return { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   label: 'Mittel' }
    case 'schwach':return { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     label: 'Schwach' }
    default:       return { bg: 'bg-muted',      border: 'border-border',      text: 'text-muted-foreground', label: '–' }
  }
}

export default function RezeptSaettigungsMatrix({ matrix }: { matrix: RezeptSaettigungsMatrix }) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="space-y-1.5">
      {PILLAR_ORDER.map(pillar => {
        const meta = PILLAR_META[pillar]
        const bewertung = matrix.bausteine[pillar]
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
                <RatingRing rating={bewertung.rating} size={32} />
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
                {pillar === 'art_of_eating' && (
                  <Link
                    href="/wie-esse-ich-richtig"
                    className="inline-block text-xs font-medium text-[#4A7C59] hover:underline"
                  >
                    Wie esse ich richtig? →
                  </Link>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
