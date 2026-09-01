import Link from 'next/link'
import { Target, Utensils, Star, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Grund {
  icon: LucideIcon
  titel: string
  text: string
  link?: { href: string; label: string }
  zusatz?: ReactNode
}

// PROJ-41, Arbeitspunkt "Warum zählen wir Kalorien?": 3 hervorgehobene Gründe als
// visuelle Liste statt Fließtext — expliziter Nutzerwunsch ("Zeige die Liste").
const GRUENDE: Grund[] = [
  {
    icon: Target,
    titel: 'Abnehmen mit Plan',
    text: 'Du weißt, wie viel dein Körper braucht, und gibst ihm bewusst weniger.',
    link: { href: '/ernaehrung/so-geht-abnehmen', label: 'Zum Kcal-Rechner' },
  },
  {
    icon: Utensils,
    titel: 'Nährstoffe verstehen',
    text: 'Du lernst, wo welche Energie und Makronährstoffe stecken. Wichtig, wenn du dich umfangreich und ausgewogen ernähren möchtest.',
    link: { href: '/ernaehrung/kalorien', label: 'Zu den Makronährstoffen' },
  },
  {
    icon: Star,
    titel: 'Deinen Körper kennenlernen',
    text: 'Der wohl wichtigste Punkt! Du lernst, mit welcher Energie dein Körper auskommt. Du lernst:',
    zusatz: (
      <ul className="space-y-1 pl-1 text-xs text-foreground/80 leading-relaxed">
        <li>• Wie lange bin ich mit welcher Mahlzeit satt?</li>
        <li>• Was tut mir gut?</li>
        <li>• Woher bekommt mein Körper die Energie, die ich brauche, um das zu tun, was ich mir vornehme?</li>
      </ul>
    ),
  },
]

export function GruendeListe() {
  return (
    <div className="space-y-3">
      {GRUENDE.map(g => {
        const Icon = g.icon
        return (
          <div key={g.titel} className="rounded-xl bg-muted/40 p-3 space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#DFF0F2] text-[#0E7C86]">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-xs font-semibold text-foreground">{g.titel}</p>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{g.text}</p>
            {g.zusatz}
            {g.link && (
              <Link href={g.link.href} className="inline-block text-xs font-medium text-[#2E9E6B] hover:underline">
                {g.link.label} →
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}
