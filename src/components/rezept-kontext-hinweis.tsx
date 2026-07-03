import { Info } from 'lucide-react'

type RecipeTyp = 'beilage' | 'grundlage'

const CONFIG: Record<RecipeTyp, { badge: string; text: string }> = {
  beilage: {
    badge: 'Als Beilage gedacht',
    text: 'Als Beilage top — allein noch keine vollständige Mahlzeit. Kombiniere es mit einer Proteinquelle (Quark, Ei, Fleisch) und ggf. Brot oder Stärke.',
  },
  grundlage: {
    badge: 'Grundlagen-Rezept',
    text: 'Baustein für andere Gerichte — als alleinige Mahlzeit nicht vollständig. Dieses Rezept entfaltet seinen Wert in Kombination mit weiteren Komponenten.',
  },
}

export default function RezeptKontextHinweis({ typ }: { typ: RecipeTyp }) {
  const cfg = CONFIG[typ]
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
