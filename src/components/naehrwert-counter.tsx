'use client'

import type { NutritionPer100g } from '@/lib/nutrition'
import { toGrams } from '@/lib/units'
import type { SchaetzResult } from '@/hooks/use-live-naehrwert-schaetzung'

interface ZutatRow {
  id: string
  name: string
  amount: string
  unit: string
  linkedMacros: NutritionPer100g | null
}

interface NaehrwertCounterProps {
  rows: ZutatRow[]
  servings: number
  /** Refinement 2026-08-05: wird jetzt vom aufrufenden Formular übergeben (ein gemeinsamer
   *  `useLiveNaehrwertSchaetzung`-Aufruf statt eines pro Komponente), damit derselbe Status
   *  auch für die Zutaten-Zeilen-Hervorhebung genutzt werden kann, ohne doppelte Suchanfragen. */
  estimates: Record<string, SchaetzResult>
}

interface Totals {
  kcal: number
  protein_g: number
  fat_g: number
  carbs_g: number
  fiber_g: number
}

/** PROJ-29: Live-Nährwert-Counter — summiert alle erfassten Zutaten (verknüpft oder per
 *  Hintergrund-Schätzung) und teilt durch die Portionsanzahl. Reine Editor-Vorschau, wird
 *  nirgends gespeichert — maßgeblich bleibt die Berechnung beim Speichern des Rezepts. */
export default function NaehrwertCounter({ rows, servings, estimates }: NaehrwertCounterProps) {
  const effectiveServings = servings > 0 ? servings : 1

  let loadingCount = 0
  let notFoundCount = 0
  const totals: Totals = { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 }

  for (const row of rows) {
    const name = row.name.trim()
    if (!name) continue

    let per100g: NutritionPer100g | null = row.linkedMacros
    if (!per100g) {
      const est = estimates[row.id]
      if (est?.status === 'loading') loadingCount++
      else if (est?.status === 'not_found') notFoundCount++
      else if (est?.status === 'found') per100g = est.per100g
    }
    if (!per100g) continue

    const amountNum = parseFloat(row.amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) continue
    const grams = toGrams(amountNum, row.unit, name)
    if (grams === null || grams <= 0) continue

    const factor = grams / 100
    totals.kcal      += per100g.kcal * factor
    totals.protein_g += per100g.protein_g * factor
    totals.fat_g     += per100g.fat_g * factor
    totals.carbs_g   += per100g.carbs_g * factor
    totals.fiber_g   += per100g.fiber_g * factor
  }

  const round = (n: number) => Math.round(n / effectiveServings)

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Pro Portion (live)</span>
        {loadingCount > 0 && (
          <span className="text-[10px] text-muted-foreground animate-pulse">Schätze Nährwerte…</span>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2 text-center">
        <div>
          <p className="text-sm font-semibold text-foreground tabular-nums">{round(totals.kcal)}</p>
          <p className="text-[10px] text-muted-foreground">kcal</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground tabular-nums">{round(totals.protein_g)}g</p>
          <p className="text-[10px] text-muted-foreground">Protein</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground tabular-nums">{round(totals.fat_g)}g</p>
          <p className="text-[10px] text-muted-foreground">Fett</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground tabular-nums">{round(totals.carbs_g)}g</p>
          <p className="text-[10px] text-muted-foreground">Kohlenhydrate</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground tabular-nums">{round(totals.fiber_g)}g</p>
          <p className="text-[10px] text-muted-foreground">Ballaststoffe</p>
        </div>
      </div>
      {notFoundCount > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {notFoundCount} {notFoundCount === 1 ? 'Zutat' : 'Zutaten'} ohne Nährwert-Treffer
        </p>
      )}
    </div>
  )
}
