'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

interface FesteMahlzeitenPlanerProps {
  tagesKcal: number
  istEigenerWert: boolean
}

interface MahlzeitBlock {
  emoji: string
  label: string
  anteil: number
  farbe: string
}

const OHNE_SNACK: MahlzeitBlock[] = [
  { emoji: '🌅', label: 'Frühstück', anteil: 0.2, farbe: 'bg-[#2E9E6B]' },
  { emoji: '🍽️', label: 'Mittagessen', anteil: 0.4, farbe: 'bg-[#0E7C86]' },
  { emoji: '🌙', label: 'Abendessen', anteil: 0.4, farbe: 'bg-[#3B6FA8]' },
]

const MIT_SNACK: MahlzeitBlock[] = [
  { emoji: '🌅', label: 'Frühstück', anteil: 0.2, farbe: 'bg-[#2E9E6B]' },
  { emoji: '🍽️', label: 'Mittagessen', anteil: 0.3, farbe: 'bg-[#0E7C86]' },
  { emoji: '🍎', label: 'Snack', anteil: 0.2, farbe: 'bg-amber-400' },
  { emoji: '🌙', label: 'Abendessen', anteil: 0.3, farbe: 'bg-[#3B6FA8]' },
]

export function FesteMahlzeitenPlaner({ tagesKcal, istEigenerWert }: FesteMahlzeitenPlanerProps) {
  const [mitSnack, setMitSnack] = useState(false)
  const bloecke = mitSnack ? MIT_SNACK : OHNE_SNACK

  return (
    <div className="space-y-3">
      <p className="text-xs text-foreground/80 leading-relaxed">
        Wenn du &quot;immer&quot; isst, hat dein Körper keinen Rhythmus — und der liebt Rhythmus. Deshalb reden wir von 3 festen Mahlzeiten am Tag, aufgeteilt nach der Formel 20/40/40.
      </p>

      <div className="flex h-3 w-full rounded-full overflow-hidden">
        {bloecke.map(b => (
          <div key={b.label} className={b.farbe} style={{ width: `${b.anteil * 100}%` }} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {bloecke.map(b => (
          <div key={b.label} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <span className="text-base">{b.emoji}</span>
              <span className="text-xs font-semibold text-foreground">{b.label}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground">{Math.round(tagesKcal * b.anteil)} kcal</p>
              <p className="text-[10px] text-muted-foreground">{Math.round(b.anteil * 100)}%</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
        <label htmlFor="feste-mahlzeiten-snack-toggle" className="text-xs font-medium text-foreground pr-3">
          Snack zwischen Mittag- und Abendessen einbauen?
        </label>
        <Switch id="feste-mahlzeiten-snack-toggle" checked={mitSnack} onCheckedChange={setMitSnack} />
      </div>

      {istEigenerWert ? (
        <p className="text-[10px] text-muted-foreground">
          Basierend auf deinem berechneten Tagesbedarf von {tagesKcal} kcal.
        </p>
      ) : (
        <p className="text-[10px] text-muted-foreground">
          Referenzwert: {tagesKcal} kcal (noch kein eigener Wert berechnet —{' '}
          <a href="/ernaehrung/so-geht-abnehmen" className="text-[#2E9E6B] hover:underline font-medium">
            jetzt berechnen
          </a>
          )
        </p>
      )}
    </div>
  )
}
