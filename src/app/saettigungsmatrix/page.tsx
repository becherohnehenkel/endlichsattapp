import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import BackButton from './back-button'

const POWER_OATS_ID = 'a0942760-262c-420b-87f5-5d10decb1f28'

type Rating = 'gut' | 'mittel' | 'schwach' | 'nicht_bewertet'

interface Pillar {
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

const PILLARS: Pillar[] = [
  {
    key: 'geschmack',
    emoji: '✨',
    name: 'Geschmack',
    warum: 'Wenn es dir nicht schmeckt, macht es nicht zufrieden.',
    was: 'Temperatur, Schärfe, Umami, Süße, Säure, Bitterkeit, Salzigkeit, Geruch, Textur, Fett — alles, was den Mund auf Sättigung vorbereitet.',
    beispiel: {
      rating: 'gut',
      erklaerung: 'Gute Geschmackstiefe durch Süßrahmbutter, Mandelmus und Zimt. Fett, Würze und Aromen machen das Gericht wirklich befriedigend.',
    },
  },
  {
    key: 'biss',
    emoji: '🥕',
    name: 'Biss',
    warum: 'Langsamer Essen und sensorisches Highlight. Verdauung beginnt im Mund.',
    was: 'Rohes Gemüse (Gurke, Karotte, Blumenkohl), Nüsse, Samen und Kerne, kross Gebackenes (Granola, Knäckebrot, Brot), Angebratenes (Fleisch, Fisch, Tofu).',
    beispiel: {
      rating: 'gut',
      erklaerung: 'Kürbiskerne, Sonnenblumenkerne und Apfelstücke sorgen für echten Kauaufwand — das aktiviert Sättigungssignale deutlich früher als weiches Essen.',
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
      erklaerung: '13g Ballaststoffe pro Portion — verlangsamen die Verdauung und strecken das Sättigungsfenster deutlich.',
    },
  },
  {
    key: 'proteine',
    emoji: '💪',
    name: 'Proteine',
    warum: 'Langsamere Verdauung als Fett und Kohlenhydrate. Lösen Sättigungshormone (GLP-1, PYY) aus und verringern Heißhunger.',
    was: 'Hoch (>40%): Skyr, Magerquark, Eiklar, Thunfisch, mageres Fleisch. Mittel (30%): Tofu, Tempeh, Vollei, Hüttenkäse. Solide (20%): Kichererbsen, Kürbiskerne, Nüsse, Quinoa.',
    beispiel: {
      rating: 'gut',
      erklaerung: '32g Protein pro Portion — starkes Sättigungssignal über GLP-1 und PYY.',
    },
  },
  {
    key: 'volumen',
    emoji: '🥗',
    name: 'Volumen',
    warum: 'Magenrezeptoren registrieren mechanische Dehnung — und sagen "satt", lange bevor Nährstoffe es tun.',
    was: 'Gurke, Blattsalate, Zucchini, Radieschen, Blumenkohl, Sauerkraut, frischer Spinat, Beeren, Wassermelone, Grapefruit — das meiste Volumen auf die wenigsten Kalorien (meist durch Wasseranteil).',
    beispiel: {
      rating: 'gut',
      erklaerung: 'Heidelbeeren und Magerquark sind volumenreich — füllen den Magen ohne viele Kalorien zu liefern. Haferflocken quellen auf das Dreifache ihres Volumens.',
    },
  },
  {
    key: 'art_of_eating',
    emoji: '🧘',
    name: 'Art of Eating',
    warum: 'Bewusstes Essen lässt dich Sättigung besser wahrnehmen. Ablenkung unterdrückt körperliche Signale buchstäblich.',
    was: 'Sitz hin. Schalte den Bildschirm aus. Riech bewusst bevor du isst. Kau gründlich bis fast flüssig. Schmeck die Details. Hör auf deinen Körper — er weiß, wann er satt ist.',
    beispiel: {
      rating: 'nicht_bewertet',
      erklaerung: 'Wie du isst, lässt sich nicht aus Zutaten ablesen. Langsames Kauen ohne Ablenkung verstärkt das Sättigungsgefühl bei jeder Mahlzeit.',
    },
  },
]

function ratingConfig(rating: Rating) {
  switch (rating) {
    case 'gut':     return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Gut' }
    case 'mittel':  return { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Mittel' }
    case 'schwach': return { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Schwach' }
    default:        return { bg: 'bg-muted',        text: 'text-muted-foreground', label: 'Nicht bewertet' }
  }
}

export default function SaettigungsmatrixPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <BackButton />
        <span className="font-semibold text-foreground tracking-tight">Sättigungs-Matrix</span>
        <div className="w-16" />
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 space-y-6">

        {/* Intro */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Was macht eine Mahlzeit wirklich satt?</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sättigung entsteht nicht durch Kalorien — sondern durch 6 Bausteine, die zusammenwirken.
            Wer sie kennt, baut jede Mahlzeit gezielt sättigend auf.
          </p>
        </div>

        <Separator />

        {/* Pillars */}
        <div className="space-y-4">
          {PILLARS.map((pillar) => {
            const cfg = ratingConfig(pillar.beispiel.rating)
            return (
              <div key={pillar.key} className="rounded-2xl border border-border bg-card overflow-hidden">

                {/* Pillar header */}
                <div className="px-4 py-3.5 bg-[#E8F0EB] border-b border-[#4A7C59]/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{pillar.emoji}</span>
                    <h2 className="text-base font-bold text-[#2D5016]">{pillar.name}</h2>
                  </div>
                  <p className="mt-1.5 text-sm text-[#4A7C59] leading-relaxed">{pillar.warum}</p>
                </div>

                {/* Was gehört dazu */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Was gehört dazu
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{pillar.was}</p>
                </div>

                {/* Im Beispiel */}
                <div className="px-4 py-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-muted-foreground">🥣 Lukas&apos; Power Oats</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{pillar.beispiel.erklaerung}</p>
                  {pillar.key === 'art_of_eating' && (
                    <Link
                      href="/wie-esse-ich-richtig"
                      className="inline-block mt-2 text-xs font-medium text-[#4A7C59] hover:underline"
                    >
                      Wie esse ich richtig? →
                    </Link>
                  )}
                </div>

              </div>
            )
          })}
        </div>

        <Separator />

        {/* CTA: Link to the full recipe */}
        <Link href={`/rezept/${POWER_OATS_ID}`}>
          <div className="rounded-2xl border border-[#4A7C59]/30 bg-[#E8F0EB] p-4 space-y-1 hover:border-[#4A7C59] transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#2D5016]">Das Vollrezept ansehen</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Sehr sättigend
              </span>
            </div>
            <p className="text-xs text-[#4A7C59]/80 leading-snug">
              Lukas&apos; Power Oats — alle 6 Bausteine auf einen Blick
            </p>
          </div>
        </Link>

      </main>
    </div>
  )
}
