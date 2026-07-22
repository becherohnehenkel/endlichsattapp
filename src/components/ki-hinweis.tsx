import { Sparkles, Settings2 } from 'lucide-react'

type KIHinweisVariante = 'allgemein' | 'automatisch' | 'rezept-echtheit'

const CONFIG: Record<KIHinweisVariante, { text: string; Icon: typeof Sparkles }> = {
  allgemein: {
    text: 'KI-gestützte Einschätzung — kann Fehler enthalten',
    Icon: Sparkles,
  },
  automatisch: {
    text: 'Automatisch berechnete Einschätzung — kann Fehler enthalten',
    Icon: Settings2,
  },
  'rezept-echtheit': {
    text: 'Rezept ist echt — nicht KI-generiert',
    Icon: Sparkles,
  },
}

export default function KIHinweis({ variante }: { variante: KIHinweisVariante }) {
  const { text, Icon } = CONFIG[variante]
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{text}</span>
    </p>
  )
}
