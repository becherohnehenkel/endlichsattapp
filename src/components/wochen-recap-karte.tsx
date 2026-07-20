'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'

export type PillarScore = 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'
export type GesamtBewertung = 'sehr_saettigend' | 'maessig_saettigend' | 'wenig_saettigend'

export interface WochenRecap {
  startDatum: string
  endDatum: string
  label: string
  istAktuelleWoche: boolean
  anzahlGesamt: number
  anzahlBeilagen: number
  anzahlStandard: number
  gesamtbewertungAvg: GesamtBewertung | null
  schwächsterBaustein: string | null
  bausteine: Record<string, PillarScore> | null
  makrosAvg: {
    kcal: number
    protein_g: number
    kohlenhydrate_g: number
    fett_g: number
    ballaststoffe_g: number
  } | null
  topZutaten: string[]
}

const PILLAR_LABELS: Record<string, string> = {
  geschmack: 'Geschmack',
  biss: 'Biss',
  ballaststoffe: 'Ballaststoffe',
  proteine: 'Proteine',
  volumen: 'Volumen',
  art_of_eating: 'Art of Eating',
}

const PILLAR_ORDER = ['geschmack', 'biss', 'ballaststoffe', 'proteine', 'volumen', 'art_of_eating'] as const

const SCORE_DOT: Record<PillarScore, string> = {
  gut: 'bg-emerald-600',
  mittel: 'bg-[#EAB308]',
  schwach: 'bg-red-600',
  nicht_bewertet: 'bg-gray-200',
}

const BEWERTUNG_BADGE: Record<GesamtBewertung, { label: string; className: string }> = {
  sehr_saettigend: { label: 'Sehr sättigend', className: 'bg-emerald-100 text-emerald-600 border-0 hover:bg-emerald-100' },
  maessig_saettigend: { label: 'Mäßig sättigend', className: 'bg-amber-100 text-[#EAB308] border-0 hover:bg-amber-100' },
  wenig_saettigend: { label: 'Wenig sättigend', className: 'bg-red-100 text-red-600 border-0 hover:bg-red-100' },
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d: Date) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
  return `${fmt(s)} – ${fmt(e)}`
}

interface Props {
  woche: WochenRecap
  defaultOpen: boolean
}

export default function WochenRecapKarte({ woche, defaultOpen }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const fehlendeAnalysen = Math.max(0, 3 - woche.anzahlGesamt)
  const istVollständig = woche.anzahlGesamt >= 3 && woche.anzahlStandard >= 2
  const istNurBeilagen = woche.anzahlGesamt >= 3 && woche.anzahlStandard < 2
  const bewertung = woche.gesamtbewertungAvg ? BEWERTUNG_BADGE[woche.gesamtbewertungAvg] : null
  const dateRange = formatDateRange(woche.startDatum, woche.endDatum)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full text-left">
        <div className="flex items-start justify-between px-4 py-3 bg-card hover:bg-accent/30 active:bg-accent/50 transition-colors">
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{woche.label}</span>
              {bewertung && (
                <Badge className={`text-xs h-5 px-1.5 ${bewertung.className}`}>
                  Ø {bewertung.label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange}
              {woche.anzahlGesamt > 0 && (
                <> · {woche.anzahlGesamt} {woche.anzahlGesamt === 1 ? 'Mahlzeit' : 'Mahlzeiten'}</>
              )}
            </p>
            {woche.anzahlGesamt < 3 && (
              <p className="text-xs text-[#2E9E6B] font-medium">
                Noch {fehlendeAnalysen} {fehlendeAnalysen === 1 ? 'Mahlzeit' : 'Mahlzeiten'} bis zu deinem Wochenrückblick
              </p>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 mt-0.5 ml-2 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="bg-[#F2F9FA] border-t border-border px-4 py-4">

          {/* < 3 Analysen: Fortschritt */}
          {woche.anzahlGesamt < 3 && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${i < woche.anzahlGesamt ? 'bg-[#2E9E6B]' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {woche.anzahlGesamt} / 3 Mahlzeiten analysiert
              </p>
            </div>
          )}

          {/* >= 3 aber < 2 Standard: Beilagen-Hinweis */}
          {istNurBeilagen && (
            <div>
              <p className="text-sm text-foreground">
                {woche.anzahlGesamt} {woche.anzahlGesamt === 1 ? 'Mahlzeit' : 'Mahlzeiten'} analysiert
                {woche.anzahlBeilagen > 0 && `, davon ${woche.anzahlBeilagen} ${woche.anzahlBeilagen === 1 ? 'Beilage' : 'Beilagen'}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Für Pillar- und Makro-Auswertung brauchen wir mindestens 2 vollständige Analysen.
              </p>
            </div>
          )}

          {/* Vollständiger Recap */}
          {istVollständig && (
            <div className="space-y-4">

              {/* Anzahl */}
              <p className="text-xs text-muted-foreground -mb-1">
                {woche.anzahlGesamt} {woche.anzahlGesamt === 1 ? 'Mahlzeit' : 'Mahlzeiten'} analysiert
                {woche.anzahlBeilagen > 0 && `, davon ${woche.anzahlBeilagen} ${woche.anzahlBeilagen === 1 ? 'Beilage' : 'Beilagen'}`}
              </p>

              {/* 6 Bausteine */}
              {woche.bausteine && (
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    6 Bausteine
                  </p>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    {PILLAR_ORDER.map((key) => {
                      const score = (woche.bausteine![key] ?? 'nicht_bewertet') as PillarScore
                      const isSchwächster = key === woche.schwächsterBaustein
                      return (
                        <div key={key} className="flex items-center gap-1.5">
                          <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${SCORE_DOT[score]}`} />
                          <span className={`text-xs ${isSchwächster ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {PILLAR_LABELS[key]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {woche.schwächsterBaustein && woche.schwächsterBaustein !== 'art_of_eating' && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2 mt-3">
                      Dein blinder Fleck diese Woche: <strong>{PILLAR_LABELS[woche.schwächsterBaustein]}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Makros */}
              {woche.makrosAvg && (
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Ø pro Mahlzeit
                  </p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { label: 'kcal', value: String(woche.makrosAvg.kcal) },
                      { label: 'Prot.', value: `${woche.makrosAvg.protein_g}g` },
                      { label: 'KH', value: `${woche.makrosAvg.kohlenhydrate_g}g` },
                      { label: 'Fett', value: `${woche.makrosAvg.fett_g}g` },
                      { label: 'BS', value: `${woche.makrosAvg.ballaststoffe_g}g` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-lg p-2 text-center">
                        <p className="text-xs font-semibold text-foreground leading-none">{value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Zutaten */}
              {woche.topZutaten.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Häufigste Zutaten
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {woche.topZutaten.map((zutat) => (
                      <span
                        key={zutat}
                        className="text-xs bg-[#DFF0F2] text-[#2E9E6B] px-2.5 py-1 rounded-full font-medium"
                      >
                        {zutat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
