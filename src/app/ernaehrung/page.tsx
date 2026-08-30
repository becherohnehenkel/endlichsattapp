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
  ChevronRight,
} from 'lucide-react'

interface HubEntry {
  href: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

// PROJ-36: Untertitel sind vorläufige Platzhalter-Formulierungen — finale Copy
// wird gemeinsam mit dem Nutzer erarbeitet (siehe Open Questions in der Spec).
const HUB_ENTRIES: HubEntry[] = [
  { href: '/ernaehrung/rezepte', title: 'Rezepte', subtitle: 'Die Rezeptbibliothek durchstöbern', icon: ChefHat },
  { href: '/ernaehrung/wie-esse-ich-richtig', title: 'Richtig essen', subtitle: 'Bewusst und achtsam essen lernen', icon: Utensils },
  { href: '/ernaehrung/saettigungsmatrix', title: 'Sättigungsmatrix', subtitle: 'Was eine Mahlzeit wirklich sättigt', icon: LayoutGrid },
  { href: '/ernaehrung/so-geht-abnehmen', title: 'So geht abnehmen', subtitle: 'Kalorienbedarf, Training, Schlaf & Co.', icon: Calculator },
  { href: '/ernaehrung/emotionales-essen', title: 'Emotionales Essen', subtitle: 'Gefühle nicht ins Essen packen', icon: HeartHandshake },
  { href: '/ernaehrung/heisshunger', title: 'Heißhunger', subtitle: 'Warum er kommt — und wie er wieder geht', icon: Flame },
  { href: '/ernaehrung/kalorien', title: 'Kalorien', subtitle: 'Die Bausteine deiner Ernährung verstehen', icon: Apple },
  { href: '/ernaehrung/kalorien-zaehlen', title: 'Kalorien zählen', subtitle: 'Sinn, Grenzen und der Ausstieg', icon: ListChecks },
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

      <main className="max-w-sm mx-auto px-4 py-6 space-y-2.5">
        {HUB_ENTRIES.map(({ href, title, subtitle, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-[#2E9E6B]/40 hover:bg-secondary/30 transition-colors"
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-[#DFF0F2] flex items-center justify-center">
              <Icon className="h-5 w-5 text-[#2E9E6B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </main>
    </div>
  )
}
