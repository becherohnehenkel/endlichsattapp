import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'

// Refinement 2026-08-11 ("Complete"-Umstrukturierung): 6 Bausteine → 3 Säulen. Geschmack,
// Biss und Art of Eating sind jetzt eigenständige Ebenen (siehe docs/saettigungsmatrix.md
// Abschnitt 7), nicht mehr Teil der Sättigungs-Bewertung — diese Seite erklärt nur noch die
// Sättigungs-Ebene selbst (Protein, Ballaststoffe, Volumen).

const POWER_OATS_ID = 'a0942760-262c-420b-87f5-5d10decb1f28'

type Rating = 'gut' | 'mittel' | 'gering' | 'ungenuegend'

interface Saeule {
  key: string
  emoji: string
  name: string
  warum: string
  was: string
  beispiel: {
    rating: Rating
    erklaerung: string
  }
}

const SAEULEN: Saeule[] = [
  {
    key: 'proteine',
    emoji: '💪',
    name: 'Proteine',
    warum: 'Langsamere Verdauung als Fett und Kohlenhydrate. Lösen Sättigungshormone (GLP-1, PYY) aus und verringern Heißhunger.',
    was: 'Hoch (>40%): Skyr, Magerquark, Eiklar, Thunfisch, mageres Fleisch. Mittel (30%): Tofu, Tempeh, Vollei, Hüttenkäse. Solide (20%): Kichererbsen, Kürbiskerne, Nüsse, Quinoa.',
    beispiel: {
      rating: 'gut',
      erklaerung: '32g Protein pro Portion (ab 30g = gut) — starkes Sättigungssignal über GLP-1 und PYY.',
    },
  },
  {
    key: 'ballaststoffe',
    emoji: '🌾',
    name: 'Ballaststoffe',
    warum: 'Verlangsamen die Verdauung und mindern Heißhunger.',
    was: 'Vollkornprodukte & Pseudogetreide (Hafer, Quinoa, Amaranth), Hülsenfrüchte (Linsen, Kichererbsen), Obst (Beeren, Apfel, Banane), Gemüse (Brokkoli, Spinat, Karotte), Nüsse & Samen (Leinsamen, Chiasamen, Mandeln).',
    beispiel: {
      rating: 'gut',
      erklaerung: '13g Ballaststoffe pro Portion (ab 10g = gut) — verlangsamen die Verdauung und strecken das Sättigungsfenster deutlich.',
    },
  },
  {
    key: 'volumen',
    emoji: '🥗',
    name: 'Volumen',
    warum: 'Magenrezeptoren registrieren mechanische Dehnung — und sagen "satt", lange bevor Nährstoffe es tun.',
    was: 'Zwei Dinge zählen: niedrige Energiedichte (kcal pro Gramm) UND genug Gemüse absolut (Gurke, Blattsalate, Zucchini, Blumenkohl, Sauerkraut, Spinat, Beeren, Wassermelone — ab 200g richtig gut). Die schlechtere der beiden entscheidet.',
    beispiel: {
      rating: 'gut',
      erklaerung: 'Niedrige Energiedichte plus reichlich Beeren und Gemüse — füllt den Magen ohne viele Kalorien zu liefern.',
    },
  },
]

function ratingConfig(rating: Rating) {
  switch (rating) {
    case 'gut':         return { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Gut' }
    case 'mittel':       return { bg: 'bg-amber-100',   text: 'text-[#EAB308]',   label: 'Mittel' }
    case 'gering':       return { bg: 'bg-orange-100',  text: 'text-orange-600',  label: 'Gering' }
    case 'ungenuegend':  return { bg: 'bg-red-100',     text: 'text-red-600',     label: 'Ungenügend' }
  }
}

export default function SaettigungsmatrixPage() {
  return (
    <div className="min-h-screen bg-background">
      <ErnaehrungSubHeader title="Sättigungs-Matrix" />

      <main className="max-w-sm mx-auto px-4 py-6 space-y-6">

        {/* Intro */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Was macht eine Mahlzeit wirklich satt?</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sättigung entsteht nicht durch Kalorien — sondern durch 3 Säulen, die zusammenwirken:
            Protein, Ballaststoffe und Volumen. Wer sie kennt, baut jede Mahlzeit gezielt sättigend auf.
          </p>
        </div>

        <Separator />

        {/* Säulen */}
        <div className="space-y-4">
          {SAEULEN.map((saeule) => {
            const cfg = ratingConfig(saeule.beispiel.rating)
            return (
              <div key={saeule.key} className="rounded-2xl border border-border bg-card overflow-hidden">

                {/* Säulen-Header */}
                <div className="px-4 py-3.5 bg-[#DFF0F2] border-b border-[#2E9E6B]/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{saeule.emoji}</span>
                    <h2 className="text-base font-bold text-[#0E7C86]">{saeule.name}</h2>
                  </div>
                  <p className="mt-1.5 text-sm text-[#2E9E6B] leading-relaxed">{saeule.warum}</p>
                </div>

                {/* Was gehört dazu */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Was gehört dazu
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{saeule.was}</p>
                </div>

                {/* Im Beispiel */}
                <div className="px-4 py-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-muted-foreground">🥣 Lukas&apos; Power Oats</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{saeule.beispiel.erklaerung}</p>
                </div>

              </div>
            )
          })}
        </div>

        <Separator />

        {/* CTA: Link to the full recipe */}
        <Link href={`/rezept/${POWER_OATS_ID}`}>
          <div className="rounded-2xl border border-[#2E9E6B]/30 bg-[#DFF0F2] p-4 space-y-1 hover:border-[#2E9E6B] transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0E7C86]">Das Vollrezept ansehen</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                Sehr sättigend
              </span>
            </div>
            <p className="text-xs text-[#2E9E6B]/80 leading-snug">
              Lukas&apos; Power Oats — alle 3 Säulen auf einen Blick
            </p>
          </div>
        </Link>

      </main>
    </div>
  )
}
