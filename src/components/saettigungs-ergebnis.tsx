'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import RezeptVorschlaege from '@/components/rezept-vorschlaege'
import RezeptAusMahlzeitButtons from '@/components/rezept-aus-mahlzeit-buttons'
import KomponentenErgebnis from '@/components/komponenten-ergebnis'
import SnackBestaetigung from '@/components/snack-bestaetigung'
import RatingRing from '@/components/rating-ring'
import KIHinweis from '@/components/ki-hinweis'
import FeedbackDialog from '@/components/feedback-dialog'
import ZutatenBereich from '@/components/zutaten-bereich'
import GeschmackErgebnis from '@/components/geschmack-ergebnis'
import ArtOfEatingHinweis from '@/components/art-of-eating-hinweis'

// Refinement 2026-08-11 ("Complete"-Umstrukturierung): 6 Bausteine → 3 Säulen. Ältere,
// vor diesem Refinement gespeicherte Mahlzeit-Analysen bleiben für immer im alten Format
// gespeichert (keine Migration, siehe PROJ-4/5 Decision Log) — die Anzeige unterscheidet
// beide Formate über das Feld `format` ('legacy' = 6 Bausteine/3 Stufen, 'neu' = 3 Säulen/
// 4 Stufen) und rendert jeweils passend.

export type LegacyBausteinRating = 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'
export type SaeuleRating = 'gut' | 'mittel' | 'gering' | 'ungenuegend'

export interface LegacyBausteine {
  geschmack: LegacyBausteinRating
  biss: LegacyBausteinRating
  ballaststoffe: LegacyBausteinRating
  proteine: LegacyBausteinRating
  volumen: LegacyBausteinRating
  art_of_eating: LegacyBausteinRating
}

export interface Saeulen {
  proteine: SaeuleRating
  ballaststoffe: SaeuleRating
  volumen: SaeuleRating
}

export type PillarSet =
  | { format: 'legacy'; bausteine: LegacyBausteine }
  | { format: 'neu'; saeulen: Saeulen }

interface Naehrwerte {
  kcal: number
  protein_g: number
  kohlenhydrate_g: number
  zucker_g: number
  fett_g: number
  ballaststoffe_g: number
}

/** PROJ-4/PROJ-28: Datenquelle pro Zutat — 'bls'/'off' = Datenbank-Treffer (keine Kennzeichnung
 *  nötig), 'schaetzung' = plausible KI-Schätzung, 'nicht_schaetzbar' = weder Datenbank noch
 *  plausible Schätzung. Positionsgenau zu `zutatenliste` ausgerichtet (siehe BUG-7-Fix unten). */
export type ZutatenQuelle = 'bls' | 'off' | 'schaetzung' | 'nicht_schaetzbar'

// PROJ-33: Geschmacks-Score — eigene, gleichwertig prominente Sektion neben der Sättigung
// (siehe docs/geschmacks-score-prompt.md). Läuft für Mahlzeit + Komponente, nie für Snack.
// `geschmack` ist auf beiden Result-Typen optional: `undefined` heißt "kein Score vorhanden"
// (Analyse von vor Einführung des Features ODER — bei Rezepten — noch nicht berechnet) und
// blendet die Sektion komplett aus; `status: 'error'` heißt "Berechnung ist fehlgeschlagen,
// Rest der Analyse aber gespeichert" und zeigt den "Nochmal prüfen"-Button.
export type GeschmackLabel = 'fad' | 'okay' | 'lecker' | 'richtig_gut'

export interface GeschmackResult {
  score: number
  label: GeschmackLabel
  /** Max. 2, additiv formuliert. Leer, wenn score >= 85 (nur Bestätigung, keine Vorschläge). */
  verbesserungen: string[]
  /** Kurzer Hinweis, falls eine Basis-Komponente als "unklar" markiert wurde — kein Blocker. */
  unklarHinweis?: string | null
}

export type GeschmackState =
  | ({ status: 'ok' } & GeschmackResult)
  | { status: 'error' }

export interface StandardAnalysisResult {
  typ?: 'mahlzeit' | 'standard' | undefined
  /** PROJ-28: name/amount/grams stammen direkt aus Claudes Analyse-Antwort */
  zutatenliste: { name: string; amount: string; grams: number }[]
  annahmen: string[]
  /** PROJ-28 (BUG-7-Fix, 2026-08-04): ein Eintrag pro Zutat, exakt positionsgleich zu
   *  `zutatenliste` — ersetzt die ursprünglichen namensbasierten Listen `nichtSchaetzbareZutaten`/
   *  `kiGeschaetzteZutaten` (PROJ-4), die bei zwei gleichnamigen Zutaten mit unterschiedlicher
   *  Quelle beide fälschlich gleich kennzeichneten. */
  zutatenQuellen?: ZutatenQuelle[]
  vorher: PillarSet & {
    gesamtbewertung: 'sehr_saettigend' | 'maessig_saettigend' | 'wenig_saettigend'
    erklaerung: string
    naehrwerte: Naehrwerte
  }
  /** `saeule` = neues Feld (2026-08-11+), `baustein` = Legacy-Feld — beide möglich, nie beide gleichzeitig gemeint */
  vorschlaege: { aktion: string; begruendung: string; baustein?: string; saeule?: string }[]
  nachher: PillarSet & {
    gesamtbewertung: 'sehr_saettigend' | 'maessig_saettigend' | 'wenig_saettigend'
    naehrwerte: Naehrwerte
    deltas: { wert: string; vorher: number; nachher: number; veraenderung: number }[]
  }
  /** Nur bei Legacy-Analysen vorhanden — Art of Eating ist jetzt eine eigene, künftige Sektion */
  art_of_eating_tipp?: string | null
  /** PROJ-33: fehlt bei alten Analysen (vor Einführung des Features) — Sektion wird dann ausgeblendet */
  geschmack?: GeschmackState
}

export interface KomponenteAnalysisResult {
  typ: 'komponente' | 'beilage'
  zutatenliste: { name: string; amount: string; grams: number }[]
  annahmen: string[]
  zutatenQuellen?: ZutatenQuelle[]
  komponente:
    | { format: 'neu'; bilanz: string; kombinationsvorschlag: string }
    | {
        format: 'legacy'
        als_beilage_top: string
        als_hauptgericht: string
        beilage_upgrade: string | null
        pairing: { empfehlung: string; warum: string }[]
        art_of_eating_tipp: string | null
      }
  /** PROJ-33: nur bei `komponente.format === 'neu'` möglich — Legacy-Beilagen-Analysen kannten das Feature nicht */
  geschmack?: GeschmackState
}

export interface SnackAnalysisResult {
  typ: 'snack'
  zutatenliste: { name: string; amount: string; grams: number }[]
  annahmen: string[]
  snackBestaetigung: string
}

export type AnalysisResult = StandardAnalysisResult | KomponenteAnalysisResult | SnackAnalysisResult

interface SaettigungsErgebnisProps {
  result: AnalysisResult
  assumptions: string[]
  onReset: () => void
  analysisId?: string
  photoUrl?: string | null
  /** meals.id — Ziel-Referenz für das PROJ-26-Feedback (nicht dasselbe wie analysisId/meal_analyses.id) */
  mealId?: string
  /** Direkt nach der Analyse oder aus der Historie geöffnet — für den PROJ-26-Feedback-Snapshot */
  pageType?: 'mahlzeit_analyse' | 'mahlzeit_historie'
  /** PROJ-28: Mahlzeit wurde vor dem 3. August 2026 analysiert — Zutatenliste durch Hinweis ersetzen */
  tooOld?: boolean
}

const LEGACY_PILLAR_ORDER: (keyof LegacyBausteine)[] = [
  'geschmack', 'biss', 'ballaststoffe',
  'proteine', 'volumen', 'art_of_eating',
]
const LEGACY_PILLAR_META: Record<keyof LegacyBausteine, { label: string; emoji: string }> = {
  geschmack:     { label: 'Geschmack',     emoji: '✨' },
  biss:          { label: 'Biss',          emoji: '🥕' },
  ballaststoffe: { label: 'Ballaststoffe', emoji: '🌾' },
  proteine:      { label: 'Proteine',      emoji: '💪' },
  volumen:       { label: 'Volumen',       emoji: '🥗' },
  art_of_eating: { label: 'Art of Eating', emoji: '🧘' },
}

const NEUE_PILLAR_ORDER: (keyof Saeulen)[] = ['proteine', 'ballaststoffe', 'volumen']
const NEUE_PILLAR_META: Record<keyof Saeulen, { label: string; emoji: string }> = {
  proteine:      { label: 'Proteine',      emoji: '💪' },
  ballaststoffe: { label: 'Ballaststoffe', emoji: '🌾' },
  volumen:       { label: 'Volumen',       emoji: '🥗' },
}

function ratingConfig(rating: string) {
  switch (rating) {
    case 'gut':         return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', label: 'Gut' }
    case 'mittel':       return { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-[#EAB308]',   label: 'Mittel' }
    case 'gering':       return { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-600',  label: 'Gering' }
    case 'schwach':
    case 'ungenuegend':  return { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-600',     label: rating === 'schwach' ? 'Schwach' : 'Ungenügend' }
    default:             return { bg: 'bg-muted',      border: 'border-border',      text: 'text-muted-foreground', label: '–' }
  }
}

function gesamtConfig(g: string) {
  if (g === 'sehr_saettigend')    return { label: 'Sehr sättigend',  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  if (g === 'maessig_saettigend') return { label: 'Mäßig sättigend', color: 'text-[#EAB308]',   bg: 'bg-amber-50',   border: 'border-amber-200'   }
  return                                 { label: 'Wenig sättigend', color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200'     }
}

function PillarChip({
  label,
  emoji,
  rating,
  improved = false,
}: {
  label: string
  emoji: string
  rating: string
  improved?: boolean
}) {
  const cfg = ratingConfig(rating)
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs ${cfg.bg} ${cfg.border} ${
        improved ? 'ring-1 ring-emerald-400' : ''
      }`}
    >
      <span>{emoji}</span>
      <span className={`font-medium ${cfg.text}`}>{label}</span>
      <span className={`ml-auto ${cfg.text}`}>{cfg.label}</span>
    </div>
  )
}

/** Rendert das 6er- oder 3er-Grid, je nach `pillarSet.format`. */
function PillarGrid({ pillarSet }: { pillarSet: PillarSet }) {
  const order = pillarSet.format === 'legacy' ? LEGACY_PILLAR_ORDER : NEUE_PILLAR_ORDER
  const meta = pillarSet.format === 'legacy' ? LEGACY_PILLAR_META : NEUE_PILLAR_META
  const segments = pillarSet.format === 'legacy' ? 3 : 4
  const values = (pillarSet.format === 'legacy' ? pillarSet.bausteine : pillarSet.saeulen) as unknown as Record<string, string>

  return (
    <div className="grid grid-cols-3 gap-2">
      {order.map(pillar => {
        const m = meta[pillar as keyof typeof meta]
        const rating = values[pillar]
        const cfg = ratingConfig(rating)
        return (
          <div
            key={pillar}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center ${cfg.bg} ${cfg.border}`}
          >
            <div className={`relative w-11 h-11 flex items-center justify-center ${cfg.text}`}>
              <RatingRing rating={rating} size={44} segments={segments} />
              <span className="text-xl">{m.emoji}</span>
            </div>
            <span className="text-xs font-medium text-foreground leading-tight">{m.label}</span>
            <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function PillarChipList({ pillarSet, improved }: { pillarSet: PillarSet; improved: Set<string> }) {
  const order = pillarSet.format === 'legacy' ? LEGACY_PILLAR_ORDER : NEUE_PILLAR_ORDER
  const meta = pillarSet.format === 'legacy' ? LEGACY_PILLAR_META : NEUE_PILLAR_META
  const values = (pillarSet.format === 'legacy' ? pillarSet.bausteine : pillarSet.saeulen) as unknown as Record<string, string>

  return (
    <div className="space-y-1">
      {order.map(pillar => {
        const m = meta[pillar as keyof typeof meta]
        return (
          <PillarChip
            key={pillar}
            label={m.label}
            emoji={m.emoji}
            rating={values[pillar]}
            improved={improved.has(pillar)}
          />
        )
      })}
    </div>
  )
}

export default function SaettigungsErgebnis({ result, assumptions, onReset, analysisId, photoUrl, mealId, pageType, tooOld }: SaettigungsErgebnisProps) {
  const [assumptionsOpen, setAssumptionsOpen] = useState(false)

  // 'in'-Checks statt Discriminant-Vergleich auf `typ`: `StandardAnalysisResult.typ` ist
  // optional (`'mahlzeit' | 'standard' | undefined`), was TS' Discriminated-Union-Narrowing
  // bei einem reinen `result.typ === '...'`-Vergleich zuverlässig verhindert.
  if ('komponente' in result) {
    return <KomponentenErgebnis result={result} assumptions={assumptions} onReset={onReset} analysisId={analysisId} photoUrl={photoUrl} mealId={mealId} tooOld={tooOld} />
  }

  if ('snackBestaetigung' in result) {
    return <SnackBestaetigung result={result} assumptions={assumptions} onReset={onReset} photoUrl={photoUrl} />
  }

  const allAssumptions = [...new Set([...assumptions, ...result.annahmen])]
  const zutatenQuellen = result.zutatenQuellen ?? []
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

  const pillarLabel = result.vorher.format === 'legacy' ? 'Die 6 Sättigungs-Bausteine' : 'Die 3 Sättigungs-Säulen'

  return (
    <main className="px-4 py-6 max-w-sm mx-auto space-y-6">

      {/* Annahmen + optionales Foto — ausklappbar */}
      {(allAssumptions.length > 0 || photoUrl) && (
        <Collapsible open={assumptionsOpen} onOpenChange={setAssumptionsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
            <div className="flex items-center gap-2">
              {photoUrl && (
                <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0 border border-border/50">
                  <Image src={photoUrl} alt="Mahlzeit" fill className="object-cover" unoptimized />
                </div>
              )}
              <span className="font-medium">ℹ️ Basierend auf Annahmen</span>
            </div>
            {assumptionsOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pt-2 pb-1">
            {photoUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border mb-3">
                <Image src={photoUrl} alt="Mahlzeit" fill className="object-cover" unoptimized />
              </div>
            )}
            {allAssumptions.length > 0 && (
              <ul className="space-y-1">
                {allAssumptions.map((a, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* PROJ-28: Zutatenliste mit Gramm-Schätzungen */}
      <ZutatenBereich
        zutatenliste={result.zutatenliste}
        zutatenQuellen={zutatenQuellen}
        tooOld={tooOld}
      />

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

      {/* ── 2. Bausteine/Säulen ── */}
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{pillarLabel}</p>
          <KIHinweis variante="allgemein" />
          {mealId && pageType && (
            <FeedbackDialog
              pageType={pageType}
              referenceId={mealId}
              snapshot={{
                zutatenliste: result.zutatenliste,
                annahmen: result.annahmen,
                vorher: result.vorher,
                vorschlaege: result.vorschlaege,
                nachher: result.nachher,
              }}
            />
          )}
        </div>
        <PillarGrid pillarSet={result.vorher} />
      </div>

      {/* ── 2b. Geschmack (PROJ-33) — eigenständig, gleichwertig prominent, nie vermischt ── */}
      {result.geschmack && (
        <>
          <Separator />
          <GeschmackErgebnis
            geschmack={result.geschmack}
            retryEndpoint="/api/analyse/geschmack-retry"
            retryBody={{ analysisId }}
          />
        </>
      )}

      {/* ── 3. Sehr sättigend: positive Bestätigung ── */}
      {isSehrSaettigend && (
        <>
          <Separator />
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-1">
            <p className="text-2xl">🎉</p>
            <p className="text-sm font-semibold text-emerald-600">Das machst du bereits richtig gut!</p>
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
                const pillarKey = v.saeule ?? v.baustein ?? ''
                const meta = result.vorher.format === 'legacy'
                  ? LEGACY_PILLAR_META[pillarKey as keyof LegacyBausteine]
                  : NEUE_PILLAR_META[pillarKey as keyof Saeulen]
                return (
                  <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-1">
                    <p className="text-sm font-medium text-foreground">{v.aktion}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta ? `${meta.emoji} ${meta.label}` : pillarKey}
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
                <PillarChipList pillarSet={result.vorher} improved={new Set()} />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nach Verbesserung</p>
                <PillarChipList pillarSet={result.nachher} improved={improvedPillars} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 6. Art of Eating (Legacy-Tipp ODER PROJ-34-Hinweis, nie beide) ── */}
      {result.vorher.format === 'legacy' ? (
        result.art_of_eating_tipp && (
          <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">🧘 Art of Eating</p>
            <p className="text-sm text-foreground">{result.art_of_eating_tipp}</p>
            <Link
              href="/ernaehrung/wie-esse-ich-richtig"
              className="inline-block text-xs font-medium text-[#2E9E6B] hover:underline"
            >
              Wie esse ich richtig? →
            </Link>
          </div>
        )
      ) : (
        <ArtOfEatingHinweis />
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

      {/* ── 10. Rezept aus dieser Mahlzeit anlegen (PROJ-32) ── */}
      {mealId && (
        <>
          <Separator />
          <RezeptAusMahlzeitButtons mealId={mealId} showMehrSaettigung={hasVorschlaege} />
        </>
      )}

      {/* ── 11. Reset ── */}
      <Button variant="outline" size="lg" className="w-full" onClick={onReset}>
        Neue Mahlzeit analysieren
      </Button>
    </main>
  )
}
