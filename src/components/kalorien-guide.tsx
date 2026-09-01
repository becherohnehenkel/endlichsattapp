import Link from 'next/link'
import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'
import { ProteinQuellenUebersicht } from './protein-quellen-uebersicht'

const SEKTIONEN: ArbeitspunkteSektion[] = [
  {
    punkte: [
      {
        id: 1,
        titel: 'Was sind Kalorien',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Kalorien sind die Einheit für die Energie, die dein Körper zum Funktionieren braucht — so wie ein Auto Benzin zum Fahren braucht.
            </p>
            <ol className="space-y-2 text-xs text-foreground/80 leading-relaxed list-decimal pl-5">
              <li>Wir sagen &quot;Kalorien&quot;, meinen aber eigentlich Kilokalorien — der Einfachheit halber bleiben wir bei Kalorien.</li>
              <li>Eine Kalorie ist die Energie, um 1 Liter Wasser (auf Meereshöhe) von 14,5 °C auf 15,5 °C zu erwärmen.</li>
              <li>Kalorien sind nicht böse — dein Körper braucht sie, um zu funktionieren.</li>
              <li>Kalorien sind erstmal alle gleich, egal woher sie kommen — nur ihre Eigenschaften unterscheiden sich. Mehr dazu bei den Makronährstoffen.</li>
              <li>
                Wie viele Kalorien du ungefähr brauchst, kannst du unter &quot;So geht abnehmen&quot; berechnen.{' '}
                <Link href="/ernaehrung/so-geht-abnehmen" className="text-[#2E9E6B] hover:underline font-medium">
                  Zum Kcal-Rechner →
                </Link>
              </li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    label: 'Die Makronährstoffe',
    punkte: [
      {
        id: 2,
        titel: 'Proteine',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Unsere Kalorien werden zum Großteil aus den Makronährstoffen berechnet. Alle haben ihre Daseinsberechtigung, ihre Aufgabe — und sind gleichermaßen wichtig.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              1g Protein = ca. 4 kcal. Dein Körper nutzt Protein primär als Baustein — für Muskulatur, Haut, Haare, Hormone und dein Immunsystem. Zu viele isst man eher nicht aus Versehen.
            </p>
            <p className="text-xs font-semibold text-foreground">Proteinquellen nach Anteil</p>
            <ProteinQuellenUebersicht />
            <p className="text-xs text-foreground/80 leading-relaxed">
              Protein besteht aus Aminosäuren — einige davon (essentiell) muss dein Körper über die Nahrung bekommen, da er sie nicht selbst herstellen kann. Tierische Quellen liefern meist alle auf einmal. Bei pflanzlicher Ernährung lohnt sich die Kombination: Weizen-Eiweiß hat z. B. wenig Lysin — erst zusammen mit Hülsenfrüchten (Linsen, Erbsen, Bohnen) wird das Aminosäure-Profil vollständig.
            </p>
          </>
        ),
      },
      {
        id: 3,
        titel: 'Kohlenhydrate',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              1g Kohlenhydrate = ca. 4 kcal. Kohlenhydrate sind dein schnellster Energielieferant — sie werden am zügigsten zu Glucose.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Es gibt kurze Kohlenhydratketten (Zucker, Honig, Sirup, Datteln) und lange Ketten (Brot, Nudeln, Gebäck). Ganz lange Ketten sind Ballaststoffe — wichtig für den Darm und für eine langsame Energieabgabe (→ länger satt, mehr dazu bei &quot;Ballaststoffe&quot;).
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Isst du (fast) nur Kohlenhydrate, steigt dein Blutzucker schnell — das ist normal, dein Körper schüttet Insulin aus, um die Glucose zu verteilen. Je länger die Kette, desto langsamer läuft dieser Prozess ab.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Im (Ausdauer-)Sport sind Kohlenhydrate Pflicht: Iss vorher eine kleine, schnell verdauliche Portion (Banane, Dattel, Marmeladenbrot) — wie Tanken vor dem Rennen.
            </p>
          </>
        ),
      },
      {
        id: 4,
        titel: 'Fette',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              1g Fett = ca. 9 kcal — doppelt so viel wie Protein oder Kohlenhydrate. Deshalb isst man sich damit am schnellsten über sein Kalorienziel.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Trotzdem lebensnotwendig: für fettlösliche Vitamine (E, D, K, A) und deine Hormonproduktion. Fett gibt Energie langsam ab (→ länger satt) und ist Geschmacksträger.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Gesättigte Fette sind bei Raumtemperatur meist fest (Fleisch, Butter, Käse, Kokosöl) — dein Körper kann sie selbst herstellen, sie sind nicht lebensnotwendig. Einfach oder mehrfach ungesättigte Fette sind bei Raumtemperatur flüssig: Olivenöl, Leinöl, Rapsöl, Avocado, fetter Fisch, Nüsse und Saaten. Kaltgepresste (&quot;native&quot;) Pflanzenöle sind die Quelle deiner Wahl.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Omega-3-zu-Omega-6-Verhältnis: Unsere Ernährung enthält meist zu viel Omega-6 und zu wenig Omega-3. Das Verhältnis sollte maximal 5 (Omega-6) : 1 (Omega-3) sein, ist aber meist höher. Omega-6 steckt in Sonnenblumen-, Maiskeim- und Sojaöl sowie in Fleisch, Wurst, Eiern und Milchprodukten. Omega-3 findest du in Lein-, Raps- und Walnussöl, Chia- und Leinsamen sowie in fettreichem Fisch. Praxistipp: Bevorzuge bewusst deine Omega-3-Quellen im Alltag.
            </p>
          </>
        ),
      },
      {
        id: 5,
        titel: 'Ballaststoffe',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Ballaststoffe sind unverdauliche, sehr lange Kohlenhydratketten — dein Körper wandelt sie nicht in Energie um, aber dein Darm braucht sie dringend.
            </p>
            <div className="rounded-xl bg-muted/40 p-3 space-y-1">
              <p className="text-xs font-semibold text-foreground">🎯 Aufgabe</p>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Sie füttern deine Darmbakterien, halten die Verdauung in Schwung und verlangsamen, wie schnell andere Nährstoffe ins Blut gelangen — das hält dich länger satt und deinen Blutzucker stabiler.
              </p>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">
              🌾 Quellen: Vollkornprodukte, Hülsenfrüchte, Gemüse, Obst mit Schale, Nüsse und Samen.
            </p>
          </>
        ),
      },
      {
        id: 6,
        titel: 'Alkohol',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Ein kulturell schwieriges Thema in Deutschland — aber wichtig für die Einordnung.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              1g Alkohol = 7 kcal. Alkohol ist ein Nervengift — eine &quot;gesunde Menge&quot; gibt es nicht.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Sobald Alkohol in deinen Körper gelangt, kümmert sich dein Körper zuerst um dessen Abbau. Gleichzeitig ist Alkohol auch eine Energiequelle: Kalorien, die währenddessen zusätzlich aufgenommen werden, werden erstmal geparkt — meist direkt als Körperfett. Wo genau, entscheidet deine DNA, nicht du.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">Prost 🍻</p>
          </>
        ),
      },
    ],
  },
]

export function KalorienGuide() {
  return (
    <div className="space-y-6">
      <p className="text-foreground leading-relaxed">
        Kalorien und Makronährstoffe — die Bausteine deiner Ernährung, einfach erklärt.
      </p>

      <ArbeitspunkteListe storageKey="kal_completed" sektionen={SEKTIONEN} />
    </div>
  )
}
