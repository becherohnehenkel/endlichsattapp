import Link from 'next/link'
import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'
import { BlutzuckerVergleichsGrafik } from './blutzucker-vergleichs-grafik'

const SEKTIONEN: ArbeitspunkteSektion[] = [
  {
    punkte: [
      {
        id: 1,
        titel: 'Konstante Energie',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Achte auf ein konstantes Energielevel — am besten mit 2–4 festen Mahlzeiten statt ständigem Snacken (mehr dazu bei &quot;Emotionales Essen&quot;). Warum? Jede Kalorie lässt deinen Blutzucker reagieren. Je schneller er steigt, desto tiefer fällt er danach — und genau das fühlt sich wie Heißhunger an.
            </p>
            <BlutzuckerVergleichsGrafik />
            <div className="rounded-xl bg-muted/40 p-3 space-y-1">
              <p className="text-xs font-semibold text-foreground">💡 Bonus-Tipp</p>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Zucker- und kohlenhydratreiche Snacks (Banane, Brot, Reiswaffel, Gummibärchen) lassen die Kurve besonders steil steigen und fallen. Iss Süßes lieber direkt nach einer Mahlzeit oder kombiniert mit Protein und Fett.
              </p>
            </div>
          </>
        ),
      },
      {
        id: 2,
        titel: 'Stress',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Stress fühlt sich oft wie Heißhunger an — ist aber meist unbewusstes Essen als Ausgleich. Was wirklich hilft, findest du unter &quot;Emotionales Essen&quot;.
            </p>
            <Link
              href="/ernaehrung/emotionales-essen"
              className="inline-block text-xs font-medium text-[#2E9E6B] hover:underline"
            >
              Zu Emotionales Essen →
            </Link>
          </>
        ),
      },
      {
        id: 3,
        titel: 'Screentime und Content',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Screentime allein haben wir schon bei &quot;Emotionales Essen&quot; behandelt — hier geht&apos;s um die Inhalte. Dein Algorithmus weiß genau, worauf du anspringst: Rezeptvideos, Genuss-Content, &quot;So lecker&quot;-Reels. Das Ergebnis: Lust, obwohl du keinen echten Hunger hast.
            </p>
            <div className="space-y-1 text-xs text-foreground/80 leading-relaxed">
              <p>👥 Wem folge ich?</p>
              <p>📱 Was sehe ich in meinem Feed?</p>
              <p>🛍️ Was wird mir von Influencern, denen ich vertraue, verkauft (nicht nur gezeigt)?</p>
              <p>🤤 Worauf habe ich gerade ständig Lust?</p>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Lösung: Entfolgen oder schneller wegwischen — so lernt dein Algorithmus, dir weniger davon zu zeigen.
            </p>
          </>
        ),
      },
      {
        id: 4,
        titel: 'Sehen, riechen, schmecken & hören',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Dein Alltag steckt voller Trigger, die Appetit wecken sollen — wir leben in einer satten Gesellschaft, die trotzdem hungrig gemacht werden soll. Achte einen Tag lang bewusst auf:
            </p>
            <ol className="space-y-2 text-xs text-foreground/80 leading-relaxed list-decimal pl-5">
              <li>Auf dem Weg zur Arbeit: Welche Werbeplakate wollen mir Essen verkaufen?</li>
              <li>In Podcasts/Radio: Welche Snacks werden mir schmackhaft gemacht?</li>
              <li>Unterwegs: Welche Gerüche nehme ich wahr (Bäckerei, Dönerbude, Crêpes-Stand)?</li>
              <li>TV/Film/YouTube: Welcher Deal oder welches Trendprodukt wird mir gerade verkauft?</li>
            </ol>
          </>
        ),
      },
    ],
  },
]

export function HeisshungerGuide() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Plötzlich Hunger?</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Heißhunger fühlt sich plötzlich an — ist er aber selten. Bekommt dein Körper deutlich weniger Energie als sonst, meldet er sich lauter: Hunger. Heißhunger entsteht meist, wenn das Kaloriendefizit zu groß ist. Deshalb arbeiten wir mit einem kleinen Defizit und tasten uns langsam an dein Ziel heran.
        </p>
      </div>

      <ArbeitspunkteListe
        storageKey="hh_completed"
        sektionen={SEKTIONEN}
        ersterPunktOnboarding={{ autoOpenNachMs: 700 }}
      />
    </div>
  )
}
