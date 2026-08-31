import Link from 'next/link'
import { KcalRechner, type KcalRechnerGespeicherteWerte } from './kcal-rechner'
import { WochenBalkenDiagramm } from './wochen-balken-diagramm'
import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'

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
          titel: 'Wöchentlich vs. Täglich',
          inhalt: (
            <>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Dein Körper rechnet nicht in Tagen, sondern in Wochen. Ein Tag über deinem Ziel bedeutet nicht, dass du „versagt“ hast — er wird einfach von den anderen sechs Tagen ausgeglichen. Schau auf den Wochendurchschnitt, nicht auf jeden einzelnen Tag.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <WochenBalkenDiagramm
                  titel="Wie ein starrer Plan aussieht"
                  caption="Jeden Tag exakt gleich."
                  balkenHoehen={[70, 70, 70, 70, 70, 70, 70]}
                />
                <WochenBalkenDiagramm
                  titel="Wie es wirklich aussieht"
                  caption="Mal mehr, mal weniger — im Schnitt im Ziel."
                  balkenHoehen={[55, 55, 85, 55, 55, 35, 55]}
                  akzentIndex={2}
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
          titel: 'Krafttraining',
          inhalt: (
            <>
              <div className="space-y-2.5 text-xs text-foreground/80 leading-relaxed">
                <p><strong>1. Muskeln erhalten</strong> — Im Kaloriendefizit denkt dein Körper sonst: „Das brauche ich nicht, kostet nur Energie.“ Krafttraining signalisiert ihm: Diese Muskulatur wird gebraucht — die bleibt.</p>
                <p><strong>2. Grundumsatz</strong> — Mehr Muskelmasse erhöht deinen Grundumsatz (nicht überbewerten, aber ein netter Nebeneffekt).</p>
                <p><strong>3. Gesund altern</strong> — Jede Bewegung bleibt mit steigendem Alter leichter. Eine halbe Kniebeuge ist ein Toilettengang, den du mit 80 noch selbstständig schaffen willst.</p>
                <p><strong>4. Körper formen</strong> — Kleidung sitzt leichter, du fühlst dich wohler in deiner Haut.</p>
              </div>
              <Link href="/training" className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Trainingspläne findest du im Training-Bereich →
              </Link>
            </>
          ),
        },
        {
          id: 5,
          titel: 'Schlaf / Erholung',
          inhalt: (
            <>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Ein übermüdeter Körper hat mehr Hunger — Schlafmangel bringt deine Sättigungshormone durcheinander (mehr Ghrelin, weniger Leptin). Das Ergebnis: mehr Appetit, und unbewusst greifst du eher zu schnellen Kalorien wie Süßigkeiten und Snacks statt zu einer sättigenden Mahlzeit.
              </p>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Genauso wichtig: Schlaf ist die Zeit, in der dein Körper insgesamt zur Ruhe kommt — das System fährt herunter und erholt sich. Nur so kannst du jeden Tag die Leistung abrufen, die du abrufen möchtest.
              </p>
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
    <ArbeitspunkteListe
      storageKey="sga_completed"
      sektionen={sektionen}
      defaultOffenIds={gespeicherteWerte ? [1] : []}
    />
  )
}
