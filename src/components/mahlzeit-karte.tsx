'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, UtensilsCrossed } from 'lucide-react'

export interface MealEntry {
  id: string
  freeText: string | null
  thumbnailUrl: string | null
  createdAt: string
  gesamtbewertung: string | null
}

interface MahlzeitKarteProps extends MealEntry {
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()
  const time = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Heute, ${time}`
  if (isYesterday) return `Gestern, ${time}`
  return `${date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`
}

const BEWERTUNG: Record<string, { label: string; className: string }> = {
  sehr_saettigend: {
    label: 'Sehr sättigend',
    className: 'bg-emerald-100 text-emerald-800 border-0 hover:bg-emerald-100',
  },
  maessig_saettigend: {
    label: 'Mäßig sättigend',
    className: 'bg-amber-100 text-amber-700 border-0 hover:bg-amber-100',
  },
  wenig_saettigend: {
    label: 'Wenig sättigend',
    className: 'bg-red-100 text-red-700 border-0 hover:bg-red-100',
  },
}

export default function MahlzeitKarte({
  id,
  freeText,
  thumbnailUrl,
  createdAt,
  gesamtbewertung,
  onDelete,
}: MahlzeitKarteProps) {
  const bewertung = gesamtbewertung ? BEWERTUNG[gesamtbewertung] : null
  const label = freeText ?? 'Foto-Mahlzeit'

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-accent/30 active:bg-accent/50 transition-colors">
      <Link href={`/mahlzeit/${id}`} className="flex-shrink-0">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={label}
            width={64}
            height={64}
            className="w-16 h-16 rounded-lg object-cover"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </Link>

      <Link href={`/mahlzeit/${id}`} className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(createdAt)}</p>
        {bewertung ? (
          <Badge className={`mt-1.5 text-xs ${bewertung.className}`}>{bewertung.label}</Badge>
        ) : (
          <Badge variant="outline" className="mt-1.5 text-xs text-muted-foreground border-muted">
            Analyse nicht verfügbar
          </Badge>
        )}
      </Link>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Mahlzeit löschen"
        className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.preventDefault()
          onDelete(id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
