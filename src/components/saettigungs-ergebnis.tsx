'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import RezeptVorschlaege from '@/components/rezept-vorschlaege'

type BausteinRating = 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'

interface BausteineBewertung {
  geschmack: BausteinRating
  biss: BausteinRating
  ballaststoffe: BausteinRating
  proteine: BausteinRating
  volumen: BausteinRating
  art_of_eating: BausteinRating
}

interface Naehrwerte {
  kcal: number
  protein_g: number
  kohlenhydrate_g: number
  zucker_g: number
  fett_g: number
  ballaststoffe_g: number
}

export interface AnalysisResult {
  zutatenliste: { name: string; amount: string; source: string; sourceName: string }[]
  annahmen: string[]
  vorher: {
    bausteine: BausteineBewertung
    gesamtbewertung: 'sehr_saettigend' | 'maessig_saettigend' | 'wenig_saettigend'
    erklaerung: string
    naehrwerte: Naehrwerte
  }
  rezeptbibliothek_hinweis?: boolean
  vorschlaege: { aktion: string; begruendung: string; baustein: string }[]
  nachher: {
    bausteine: BausteineBewertung
    gesamtbewertung: 'sehr_saettigend' | 'maessig_saettigend' | 'wenig_saettigend'
    naehrwerte: Naehrwerte
    deltas: { wert: string; vorher: number; nachher: number; veraenderung: number }[]
  }
  art_of_eating_tipp: string | null
}

interface SaettigungsErgebnisProps {
  result: AnalysisResult
  assumptions: string[]
  onReset: () => void
  analysisId?: string
}

const PILLAR_ORDER: (keyof BausteineBewertung)[] = [
  'geschmack', 'biss', 'ballaststoffe',
  'proteine', 'volumen', 'art_of_eating',
]

const PILLAR_META: Record<keyof BausteineBewertung, { label: string; emoji: string }> = {
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

function gesamtConfig(g: string) {
  if (g === 'sehr_saettigend')    return { label: 'Sehr sättigend',  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  if (g === 'maessig_saettigend') return { label: 'Mäßig sättigend', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200'   }
  return                                 { label: 'Wenig sättigend', color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200'     }
}

function PillarChip({
  pillar,
  rating,
  improved = false,
}: {
  pillar: keyof BausteineBewertung
  rating: BausteinRating
  improved?: boolean
}) {
  const meta = PILLAR_META[pillar]
  const cfg = ratingConfig(rating)
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs ${cfg.bg} ${cfg.border} ${
        improved ? 'ring-1 ring-emerald-400' : ''
      }`}
    >
      <span>{meta.emoji}</span>
      <span className={`font-medium ${cfg.text}`}>{meta.label}</span>
      <span className={`ml-auto ${cfg.text}`}>{cfg.label}</span>
    </div>
  )
}

export default function SaettigungsErgebnis({ result, assumptions, onReset, analysisId }: SaettigungsErgebnisProps) {
  const allAssumptions = [...new Set([...assumptions, ...result.annahmen])]
  const [assumptionsOpen, setAssumptionsOpen] = useState(false)
  const gesamt = gesamtConfig(result.vorher.gesamtbewertung)
  const isSehrSaettigend = result.vorher.gesamtbewertung === 'sehr_saettigend'
  const hasVorschlaege = result.vorschlaege.length > 0
  // Bei sehr_saettigend wird der optionale Feinschliff-Vorschlag nicht angezeigt (siehe ── 3.) —
  // dann dürfen auch die davon abhängigen Vorher/Nachher-Vergleiche nicht auftauchen, sonst
  // wirken geänderte Nährwerte/Bausteine unbegründet (Nutzer sieht nie, was sich geändert hätte).
  const showVorschlaege = hasVorschlaege && !isSehrSaettigend

  const improvedPillars = new Set(
    result.nachher.deltas.filter(d => d.veraenderung > 0).map(d => d.wert)
  )

  return (
    <main className="px-4 py-6 max-w-sm mx-auto space-y-6">

      {/* Annahmen — ausklappbar */}
      {allAssumptions.length > 0 && (
        <Collapsible open={assumptionsOpen} onOpenChange={setAssumptionsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
            <span className="font-medium">ℹ️ Basierend auf Annahmen</span>
            {assumptionsOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pt-2 pb-1">
            <ul className="space-y-1">
              {allAssumptions.map((a, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ── 1. Gesamtbewertung ── */}
      <div className="space-y-3 text-center">
        <span
          className={`inline-block px-5 py-2 rounded-full border text-base font-semibold ${gesamt.color} ${gesamt.bg} ${gesamt.border}`}
        >
          {gesamt.label}
        </span>
        <p className="text-foreground leading-relaxed">{result.vorher.erklaerung}</p>
      </div>

      <Separator />

      {/* ── 2. Die 6 Bausteine ── */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Die 6 Sättigungs-Bausteine</p>
        <div className="grid grid-cols-3 gap-2">
          {PILLAR_ORDER.map(pillar => {
            const meta = PILLAR_META[pillar]
            const rating = result.vorher.bausteine[pillar]
            const cfg = ratingConfig(rating)
            return (
              <div
                key={pillar}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center ${cfg.bg} ${cfg.border}`}
              >
                <span className="text-xl">{meta.emoji}</span>
                <span className="text-xs font-medium text-foreground leading-tight">{meta.label}</span>
                <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 3. Sehr sättigend: positive Bestätigung ── */}
      {isSehrSaettigend && (
        <>
          <Separator />
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-1">
            <p className="text-2xl">🎉</p>
            <p className="text-sm font-semibold text-emerald-700">Das machst du bereits richtig gut!</p>
            <p className="text-sm text-emerald-600/80">Diese Mahlzeit ist schon sehr gut aufgestellt — kein konstruierter Verbesserungsvorschlag nötig.</p>
          </div>
        </>
      )}

      {/* ── 4. Verbesserungsvorschläge ── */}
      {showVorschlaege && (
        <>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">So wird&apos;s noch sättigender</p>
            <div className="space-y-2">
              {result.vorschlaege.map((v, i) => {
                const pillarMeta = PILLAR_META[v.baustein as keyof BausteineBewertung]
                return (
                  <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-1">
                    <p className="text-sm font-medium text-foreground">{v.aktion}</p>
                    <p className="text-xs text-muted-foreground">
                      {pillarMeta ? `${pillarMeta.emoji} ${pillarMeta.label}` : v.baustein}
                      {v.begruendung ? ` · ${v.begruendung}` : ''}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── 5. Vorher / Nachher Vergleich ── */}
      {showVorschlaege && (
        <>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Vorher → Nachher</p>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Jetzt</p>
                <div className="space-y-1">
                  {PILLAR_ORDER.map(p => (
                    <PillarChip key={p} pillar={p} rating={result.vorher.bausteine[p]} />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nach Verbesserung</p>
                <div className="space-y-1">
                  {PILLAR_ORDER.map(p => (
                    <PillarChip
                      key={p}
                      pillar={p}
                      rating={result.nachher.bausteine[p]}
                      improved={improvedPillars.has(p)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 6. Art of Eating Tipp ── */}
      {result.art_of_eating_tipp && (
        <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">🧘 Art of Eating</p>
          <p className="text-sm text-foreground">{result.art_of_eating_tipp}</p>
          <Link
            href="/wie-esse-ich-richtig"
            className="inline-block text-xs font-medium text-[#4A7C59] hover:underline"
          >
            Wie esse ich richtig? →
          </Link>
        </div>
      )}

      {/* ── 7. Rezeptbibliothek CTA (bei sehr sättigenden Mahlzeiten) ── */}
      {result.rezeptbibliothek_hinweis && (
        <Link href="/rezepte">
          <div className="rounded-xl border border-[#4A7C59]/30 bg-[#E8F0EB] p-4 flex items-center gap-3 hover:border-[#4A7C59] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-[#4A7C59]/15 flex items-center justify-center shrink-0">
              <ChefHat className="h-4 w-4 text-[#4A7C59]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#4A7C59]">Zur Rezeptbibliothek</p>
              <p className="text-xs text-[#4A7C59]/80 leading-snug">Ähnlich gut strukturierte Mahlzeiten entdecken</p>
            </div>
          </div>
        </Link>
      )}

      {/* ── 8. Nährwerte ── */}
      {(() => {
        const n = result.vorher.naehrwerte
        const hasData = n.kcal > 0 || n.protein_g > 0 || n.fett_g > 0
        return (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Nährwerte</p>
            {!hasData ? (
              <p className="text-xs text-muted-foreground">
                Für dieses Produkt konnten keine Nährwertdaten gefunden werden (nicht im BLS oder Open Food Facts).
              </p>
            ) : (
              <div className={`grid gap-3 ${showVorschlaege ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div className="space-y-1">
                  {showVorschlaege && (
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Jetzt</p>
                  )}
                  <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span>{n.kcal} kcal</span>
                    <span>{n.protein_g}g Protein</span>
                    <span>{n.kohlenhydrate_g}g Kohlenhydrate</span>
                    <span className="pl-2 text-muted-foreground/60">davon {n.zucker_g}g Zucker</span>
                    <span>{n.fett_g}g Fett</span>
                    <span>{n.ballaststoffe_g}g Ballaststoffe</span>
                  </div>
                </div>
                {showVorschlaege && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nach Verbesserung</p>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span>{result.nachher.naehrwerte.kcal} kcal</span>
                      <span>{result.nachher.naehrwerte.protein_g}g Protein</span>
                      <span>{result.nachher.naehrwerte.kohlenhydrate_g}g Kohlenhydrate</span>
                      <span className="pl-2 text-muted-foreground/60">davon {result.nachher.naehrwerte.zucker_g}g Zucker</span>
                      <span>{result.nachher.naehrwerte.fett_g}g Fett</span>
                      <span>{result.nachher.naehrwerte.ballaststoffe_g}g Ballaststoffe</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {/* ── 9. Rezeptvorschläge ── */}
      {analysisId && (
        <>
          <Separator />
          <RezeptVorschlaege analysisId={analysisId} />
        </>
      )}

      {/* ── 10. Reset ── */}
      <Button variant="outline" size="lg" className="w-full" onClick={onReset}>
        Neue Mahlzeit analysieren
      </Button>
    </main>
  )
}
