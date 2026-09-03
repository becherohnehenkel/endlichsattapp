import { Info } from 'lucide-react'
import { RECIPE_TYP_KONTEXT_HINWEIS, type RecipeTypDb } from '@/lib/recipe-typ'

export default function RezeptKontextHinweis({ typ }: { typ: RecipeTypDb }) {
  const cfg = RECIPE_TYP_KONTEXT_HINWEIS[typ]
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <span className="text-sm font-semibold text-amber-700">{cfg.badge}</span>
      </div>
      <p className="text-sm text-amber-700/80 leading-relaxed">{cfg.text}</p>
    </div>
  )
}
