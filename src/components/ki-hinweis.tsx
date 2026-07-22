import { Sparkles } from 'lucide-react'

type KIHinweisVariante = 'allgemein' | 'rezept-echtheit'

const TEXT: Record<KIHinweisVariante, string> = {
  allgemein: 'KI-gestützte Einschätzung — kann Fehler enthalten',
  'rezept-echtheit': 'Rezept ist echt — nur die Analyse und Zuordnung zu deiner Mahlzeit sind KI-gestützt',
}

export default function KIHinweis({ variante }: { variante: KIHinweisVariante }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Sparkles aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{TEXT[variante]}</span>
    </p>
  )
}
