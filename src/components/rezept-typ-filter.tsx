'use client'

import { RECIPE_TYP_FILTER_OPTIONEN, type RecipeTypFilterValue } from '@/lib/recipe-typ'

/**
 * PROJ-16 (Refinement 2026-09-03, Teil 6): geteilte Filter-Leiste für die
 * öffentliche Rezeptbibliothek und die Admin-Rezeptliste — bewusst klein und
 * ohne eigenen State, damit beide Seiten ihre Filterung unabhängig steuern.
 */
export default function RezeptTypFilter({
  value,
  onChange,
}: {
  value: RecipeTypFilterValue
  onChange: (value: RecipeTypFilterValue) => void
}) {
  return (
    <div className="flex gap-1 md:gap-2">
      {RECIPE_TYP_FILTER_OPTIONEN.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 whitespace-nowrap text-[10px] md:text-xs px-1 md:px-2 py-1.5 rounded-lg border transition-colors ${
            value === opt.value
              ? 'bg-[#2E9E6B] text-white border-[#2E9E6B]'
              : 'bg-background text-muted-foreground border-border hover:border-[#2E9E6B]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
