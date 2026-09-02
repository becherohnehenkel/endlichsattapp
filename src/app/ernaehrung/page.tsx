import Link from 'next/link'
import {
  ChefHat,
  Utensils,
  LayoutGrid,
  Calculator,
  HeartHandshake,
  Flame,
  Apple,
  ListChecks,
  UserRound,
} from 'lucide-react'
import { HubCard, type HubEntry } from '@/components/hub-card'

// PROJ-36 (Refinement 2026-09-01): Hub in 4 Bereiche gegliedert — die ersten 4 "Grundpfeiler"
// nummeriert als Einstiegspfad, danach 3 thematisch gruppierte Abschnitte (Praxis/Rezepte,
// Sättigung/richtig essen, reine Kalorien-Infos), jeweils per Trennlinie visuell abgesetzt.
const SCHRITTE: (HubEntry & { nummer: number })[] = [
  { nummer: 1, href: '/ernaehrung/so-geht-abnehmen', title: 'So geht abnehmen', subtitle: 'Kalorienbedarf, Training, Schlaf & Co.', icon: Calculator },
  { nummer: 2, href: '/ernaehrung/emotionales-essen', title: 'Emotionales Essen verstehen', subtitle: 'Gefühle nicht ins Essen packen', icon: HeartHandshake },
  { nummer: 3, href: '/ernaehrung/heisshunger', title: 'Alles über Heißhunger', subtitle: 'Warum er kommt — und wie er wieder geht', icon: Flame },
  { nummer: 4, href: '/ernaehrung/kalorien-zaehlen', title: 'Kalorien zählen & damit aufhören', subtitle: 'Sinn, Grenzen und der Ausstieg', icon: ListChecks },
]

interface Abschnitt {
  titel: string
  text: string
  eintraege: HubEntry[]
}

const ABSCHNITTE: Abschnitt[] = [
  {
    titel: 'So geht es in der Praxis.',
    text: 'Hier gibt es Rezepte, damit du direkt in die Umsetzung gehen kannst. Du findest hier ganze Mahlzeiten, Snacks und Grundrezepte. Die Mahlzeiten decken in der Regel alle Sättigungsfaktoren ab. Snacks und Grundrezepte erweitern deine Kochskills. Wenn du möchtest, kannst du auch eigene Rezepte anlegen.',
    eintraege: [
      { href: '/ernaehrung/rezepte', title: 'Rezepte', subtitle: 'Die Rezeptbibliothek durchstöbern', icon: ChefHat },
    ],
  },
  {
    titel: 'Satt werden ist kein Zufall',
    text: 'In den folgenden Abschnitten erkläre ich dir, wie sättigende Mahlzeiten entstehen. Außerdem gehen wir einmal durch die Basics, wie man richtig isst. Isst du schon richtig? Finde es hier heraus :-)',
    eintraege: [
      { href: '/ernaehrung/saettigungsmatrix', title: 'Sättigungsmatrix', subtitle: 'Was eine Mahlzeit wirklich sättigt', icon: LayoutGrid },
      { href: '/ernaehrung/wie-esse-ich-richtig', title: 'Richtig essen', subtitle: 'Bewusst und achtsam essen lernen', icon: Utensils },
    ],
  },
  {
    titel: 'Die nackten Informationen',
    text: 'Auch wenn du es schon 100 Mal gehört hast: Hier findest du in aller Kürze nochmal die wichtigsten Informationen, was Kalorien, Makronährstoffe etc. sind.',
    eintraege: [
      { href: '/ernaehrung/kalorien', title: 'Kalorien', subtitle: 'Die Bausteine deiner Ernährung verstehen', icon: Apple },
    ],
  },
]

export default function ErnaehrungHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">Ernährung</span>
        <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
          <UserRound className="h-4 w-4" />
        </Link>
      </header>

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ernährung</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ernährung ist mehr als Abnehmen. Dennoch gibt es ein paar Grundpfeiler, die wir berücksichtigen müssen. Nimm dir die Zeit, einmal alles durchzulesen. Hake das ab, was du verstanden hast, damit du weißt, was du schon alles weißt. Viel Spaß.
          </p>
        </div>

        <div className="space-y-2.5">
          {SCHRITTE.map(schritt => (
            <HubCard key={schritt.href} {...schritt} />
          ))}
        </div>

        {ABSCHNITTE.map(abschnitt => (
          <div key={abschnitt.titel} className="space-y-4">
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{abschnitt.titel}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{abschnitt.text}</p>
            </div>
            <div className="space-y-2.5">
              {abschnitt.eintraege.map(eintrag => (
                <HubCard key={eintrag.href} {...eintrag} />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
