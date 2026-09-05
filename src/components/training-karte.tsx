import { Dumbbell } from 'lucide-react'
import { findTrainingsplan } from '@/lib/trainingsplaene'

export interface TrainingEntry {
  id: string
  planSlug: string
  createdAt: string
  /** Bewegtes Gewicht (Wiederholungen × Gewicht, aufsummiert) — nur bei Plan "fitnessstudio" berechnet, sonst null. */
  volumenKg: number | null
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

export default function TrainingKarte({ planSlug, createdAt, volumenKg }: TrainingEntry) {
  const titel = findTrainingsplan(planSlug)?.titel ?? planSlug

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card">
      <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Dumbbell className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{titel}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(createdAt)}</p>
      </div>

      {volumenKg !== null && (
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-foreground">{Math.round(volumenKg).toLocaleString('de-DE')} kg</p>
          <p className="text-[11px] text-muted-foreground">bewegt</p>
        </div>
      )}
    </div>
  )
}
