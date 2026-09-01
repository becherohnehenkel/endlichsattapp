import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'
import { GruendeListe } from './gruende-liste'
import { JetztZukunftVergleich } from './jetzt-zukunft-vergleich'

const SEKTIONEN: ArbeitspunkteSektion[] = [
  {
    punkte: [
      {
        id: 1,
        titel: 'Warum zählen wir Kalorien?',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Drei Gründe, warum sich Kalorienzählen lohnt:
            </p>
            <GruendeListe />
          </>
        ),
      },
      {
        id: 2,
        titel: 'Das Wichtigste beim Kalorienzählen: das Aufhören',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Kalorienzählen ist wie Fahrradfahren mit Stützrädern — irgendwann dürfen die auch wieder ab.
            </p>
            <JetztZukunftVergleich />
            <p className="text-xs text-foreground/80 leading-relaxed">
              Es geht darum, zu lernen, wie sich dein Zukunfts-Ich ernährt. Dein Zukunfts-Ich hat ein Zielgewicht — dein Wohlfühlgewicht. Lerne, was dein Körper mit den Kalorien macht, statt sie nur zu zählen.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Nach 2–3 Monaten aufmerksamem Zählen: Nimm dir erste freie Tage. Du hast längst Gerichte im Alltag, die einer Routine folgen — mach einfach damit weiter und reduziere Schritt für Schritt.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Fühlst du dich an einem Tag überfordert oder gestresst? Zähl an diesem einen Tag wieder — das gibt dir Sicherheit. Am nächsten Tag geht&apos;s zurück in deinen neuen normalen Alltag.
            </p>
          </>
        ),
      },
    ],
  },
]

export function KalorienZaehlenGuide() {
  return (
    <div className="space-y-6">
      <p className="text-foreground leading-relaxed">
        Kalorienzählen ist ein Werkzeug auf Zeit — kein Dauerzustand.
      </p>

      <ArbeitspunkteListe
        storageKey="kalz_completed"
        sektionen={SEKTIONEN}
        ersterPunktOnboarding={{ autoOpenNachMs: 700 }}
      />
    </div>
  )
}
