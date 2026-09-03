import Link from 'next/link'
import { KcalRechner, type KcalRechnerGespeicherteWerte } from './kcal-rechner'
import { WochenBalkenDiagramm } from './wochen-balken-diagramm'
import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'
import {
  MuskelnErhaltenIcons,
  GrundumsatzIcons,
  GesundAlternIcons,
  KoerperFormenIcons,
  SchlafIcon,
  SchlafTippsIconLeiste,
} from './arbeitspunkt-icons'

// PROJ-37 (Refinement): auf die gemeinsame ArbeitspunkteListe umgestellt (Ein-/Ausklappen
// statt alles auf einmal sichtbar). Arbeitspunkt 1 (Kcal-Rechner) bleibt als einziger
// interaktiv statt reiner Text — funktioniert unverändert innerhalb des Akkordeon-Inhalts.

interface SoGehtAbnehmenGuideProps {
  kannSpeichern: boolean
  gespeicherteWerte: KcalRechnerGespeicherteWerte | null
}

export function SoGehtAbnehmenGuide({ kannSpeichern, gespeicherteWerte }: SoGehtAbnehmenGuideProps) {
  const sektionen: ArbeitspunkteSektion[] = [
    {
      punkte: [
        {
          id: 1,
          titel: 'Kcal-Rechner',
          inhalt: <KcalRechner kannSpeichern={kannSpeichern} gespeicherteWerte={gespeicherteWerte} />,
        },
        {
          id: 2,
          titel: 'Wöchentlich vs. tägliches Kaloriendefizit',
          inhalt: (
            <>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Dein Körper rechnet nicht in Tagen, sondern in Wochen. Ein Tag über deinem Ziel bedeutet nicht, dass du „versagt“ hast — er wird einfach von den anderen sechs Tagen ausgeglichen. Schau auf den Wochendurchschnitt, nicht auf jeden einzelnen Tag.
              </p>
              {/* PROJ-37 (Refinement 2026-09-03): gestapelt statt nebeneinander, auch auf Desktop */}
              <div className="flex flex-col gap-3 pt-1">
                <WochenBalkenDiagramm
                  titel="Wie ein starrer Plan aussieht"
                  caption="Jeden Tag exakt gleich viele Kalorien"
                  balkenHoehen={[70, 70, 70, 70, 70, 70, 70]}
                  variante="neutral"
                />
                <WochenBalkenDiagramm
                  titel="Wie es wirklich aussieht"
                  caption="Mal mehr Kalorien, mal weniger — im Schnitt trotzdem im Defizit"
                  balkenHoehen={[55, 55, 85, 55, 55, 35, 55]}
                  akzentIndex={2}
                  variante="hervorgehoben"
                />
              </div>
            </>
          ),
        },
        {
          id: 3,
          titel: 'Warum auf Proteine achten',
          inhalt: (
            <>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Protein hält dich länger satt als Kohlenhydrate oder Fett — und schützt beim Abnehmen deine Muskeln. Ohne genug Protein verlierst du beim Abnehmen nicht nur Fett, sondern auch Muskelmasse.
              </p>
              <div className="rounded-xl bg-[#DFF0F2] border border-[#2E9E6B]/20 px-3 py-2.5">
                <p className="text-xs font-semibold text-[#0E7C86]">Richtwert: mindestens 30g Protein pro Mahlzeit</p>
              </div>
              <div className="space-y-1.5 text-xs text-foreground/80">
                <p>🥩 <strong>Tierisch:</strong> mageres Fleisch, Fisch</p>
                <p>🧀 <strong>Vegetarisch:</strong> magerer Käse, Milchprodukte</p>
                <p>
                  🌱 <strong>Vegan:</strong> Tofu, Erbsen, Linsen, Bohnen, Sojagranulat{' '}
                  <span className="text-xs text-muted-foreground">(enthalten zusätzlich Kohlenhydrate &amp; Ballaststoffe)</span>
                </p>
              </div>
            </>
          ),
        },
        {
          id: 4,
          titel: 'Warum auf Ballaststoffe achten',
          inhalt: (
            <>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Ballaststoffe sind kein Ballast für den Körper sondern wichtig für deine Verdauung und Sättigung. Mehr Ballaststoffe heißt dein Körper nimmt die Nahrungsenergie langsamer auf, beugt damit Heißhunger und sättigt dich damit länger.
              </p>
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                <p className="text-xs text-amber-800 leading-relaxed">
                  Achtung: Bitte maximal 5g Ballaststoffe mehr pro 4 Wochen in deine Nahrung integrieren. Ansonsten kämpfst du mit deiner Verdauung 💩
                </p>
              </div>
              <div className="rounded-xl bg-[#DFF0F2] border border-[#2E9E6B]/20 px-3 py-2.5">
                <p className="text-xs font-semibold text-[#0E7C86]">Ziel-Richtwert: Mindestens 30 Ballaststoffe pro Tag. Heißt ca. 10g pro Mahlzeit.</p>
              </div>
              <div className="space-y-1.5 text-xs text-foreground/80">
                <p>🌾 <strong>Vollkornprodukte &amp; Pseudogetreide:</strong> Brot, Wraps, Haferflocken, Quinoa, Amaranth</p>
                <p>🫘 <strong>Hülsenfrüchte:</strong> Linsen, Bohnen, (Kicher-)Erbsen</p>
                <p>🥦 <strong>Gemüse und Obst:</strong> Brokkoli, Karotten, Fenchel, Beeren <span className="text-muted-foreground">(Obst gerne mit Schale)</span></p>
                <p>
                  🌰 <strong>Nüsse, Saaten und Kerne:</strong> insbesondere Lein-, Chia- und Flohsamen{' '}
                  <span className="text-xs text-muted-foreground">(höhere Kaloriendichte)</span>
                </p>
              </div>
            </>
          ),
        },
        {
          id: 5,
          titel: 'Krafttraining',
          inhalt: (
            <>
              {/* PROJ-37 (Refinement 2026-09-03, Icon-Layout-Feinschliff): Icon-Spalte + Text-Spalte
                  als ein gemeinsames Grid (nicht 4 unabhängige Reihen) — dadurch bleiben die Icons
                  über alle 4 Punkte hinweg exakt spaltenbündig. Jeder Punkt-Wrapper wird ab `sm:`
                  zu `contents` (verschwindet aus dem Box-Modell), wodurch Icon + Text direkt zu
                  Grid-Kindern werden und sich vertikal zum Text zentrieren. Unterhalb `sm:` bleibt
                  der Wrapper eine normale Spalte: Icon mittig über dem Text, Text linksbündig über
                  die volle Breite. */}
              <div className="grid grid-cols-1 gap-y-[22px] text-xs text-foreground/80 leading-relaxed sm:grid-cols-[110px_1fr] sm:items-center sm:gap-x-4 sm:gap-y-[18px]">
                <div className="flex flex-col items-center gap-2 sm:contents">
                  <MuskelnErhaltenIcons />
                  <p className="self-stretch text-left"><strong>1. Muskeln erhalten</strong> — Im Kaloriendefizit denkt dein Körper sonst: „Das brauche ich nicht, kostet nur Energie.“ Krafttraining signalisiert ihm: Diese Muskulatur wird gebraucht — die bleibt.</p>
                </div>
                <div className="flex flex-col items-center gap-2 sm:contents">
                  <GrundumsatzIcons />
                  <p className="self-stretch text-left"><strong>2. Grundumsatz</strong> — Mehr Muskelmasse erhöht deinen Grundumsatz (nicht überbewerten, aber ein netter Nebeneffekt).</p>
                </div>
                <div className="flex flex-col items-center gap-2 sm:contents">
                  <GesundAlternIcons />
                  <p className="self-stretch text-left"><strong>3. Gesund altern</strong> — Jede Bewegung bleibt mit steigendem Alter leichter. Eine halbe Kniebeuge ist ein Toilettengang, den du mit 80 noch selbstständig schaffen willst.</p>
                </div>
                <div className="flex flex-col items-center gap-2 sm:contents">
                  <KoerperFormenIcons />
                  <p className="self-stretch text-left"><strong>4. Körper formen</strong> — Kleidung sitzt leichter, du fühlst dich wohler in deiner Haut.</p>
                </div>
              </div>
              <Link href="/training" className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Trainingspläne findest du im Training-Bereich →
              </Link>
            </>
          ),
        },
        {
          id: 6,
          titel: 'Schlaf / Erholung',
          inhalt: (
            <>
              {/* PROJ-37 (Refinement 2026-09-03, Icon-Layout-Feinschliff): Icon größer, mittig über
                  dem Text (Mobile) bzw. vertikal zum Text zentriert daneben (Desktop/Tablet). */}
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                <SchlafIcon />
                <div className="w-full space-y-2 text-left sm:flex-1">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Ein übermüdeter Körper hat mehr Hunger — Schlafmangel bringt deine Sättigungshormone durcheinander (mehr Ghrelin, weniger Leptin). Das Ergebnis: mehr Appetit, und unbewusst greifst du eher zu schnellen Kalorien wie Süßigkeiten und Snacks statt zu einer sättigenden Mahlzeit.
                  </p>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Genauso wichtig: Schlaf ist die Zeit, in der dein Körper insgesamt zur Ruhe kommt — das System fährt herunter und erholt sich. Nur so kannst du jeden Tag die Leistung abrufen, die du abrufen möchtest.
                  </p>
                </div>
              </div>
              {/* PROJ-37 (Refinement 2026-09-03, Icon-Layout-Feinschliff): kombinierte Übersicht der
                  4 Tipps, alle Icons aus lucide-react (wie "Muskeln erhalten") für ein einheitliches Bild. */}
              <SchlafTippsIconLeiste />
              <div className="space-y-2.5 text-xs text-foreground/80 leading-relaxed pt-1">
                <p><strong>1. 3-2-1-Regel</strong> — 3h vorher nichts Schweres mehr essen, 2h vorher keine Arbeit/Aufregung/laute Musik mehr, 1h vorher keine Bildschirme mehr (blaues Licht vermeiden).</p>
                <p><strong>2. Kühle Umgebung</strong> — hilft deinem Körper, besser zu entspannen.</p>
                <p><strong>3. Dunkelheit</strong> — Rollladen, blickdichter Vorhang oder Schlafmaske.</p>
                <p><strong>4. Kreisende Gedanken?</strong> — Langsam ein-, noch langsamer ausatmen, bis du einschläfst. Oder von 21 aufwärts endlos weiterzählen. Im Notfall: Gedanken mit Stift und Papier festhalten statt im Kopf zu wälzen.</p>
              </div>
            </>
          ),
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">So geht abnehmen</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          An den folgenden 6 Punkten kommen wir nicht dran vorbei. Allen voran das Kaloriendefizit. Trage deine Daten hier und lass dir deine Kalorien für dein Defizit errechnen. Das ist dein Fundament zum Abnehmen. Die restlichen Punkte bauen Schritt für Schritt darauf auf.
        </p>
      </div>

      <ArbeitspunkteListe
        storageKey="sga_completed"
        sektionen={sektionen}
        defaultOffenIds={gespeicherteWerte ? [1] : []}
      />
    </div>
  )
}
