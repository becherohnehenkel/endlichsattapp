import Link from 'next/link'
import { Drumstick, Wheat, Droplet, Sprout, Wine, Beef, Egg, Leaf } from 'lucide-react'
import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'
import { MakroIconIntro, MakroStatBoxen, MakroQuellenListe, MakroTippBox } from './makro-bausteine'

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
            <MakroIconIntro
              icon={<Drumstick className="h-6 w-6 text-[#0E7C86]" strokeWidth={1.8} />}
              intro="Dein Baustein für Muskulatur, Haut, Haare, Hormone und Immunsystem."
            />
            <MakroStatBoxen kcalWert="4" wichtigText="Muskeln · Haut & Haare · Hormone · Immunsystem" />
            <MakroQuellenListe
              label="Magere Proteinquellen"
              quellen={[
                {
                  icon: <Beef className="h-[13px] w-[13px] text-[#0E7C86]" strokeWidth={2} />,
                  kategorie: 'Tierisch',
                  liste: 'Hähnchenbrust, Putenbrust, Kabeljau, Thunfisch (Natur), Rinderfilet',
                },
                {
                  icon: <Egg className="h-[13px] w-[13px] text-[#0E7C86]" strokeWidth={2} />,
                  kategorie: 'Vegetarisch',
                  liste: 'Magerquark, Skyr, Harzer Käse, Eier, Hüttenkäse',
                },
                {
                  icon: <Leaf className="h-[13px] w-[13px] text-[#0E7C86]" strokeWidth={2} />,
                  kategorie: 'Vegan',
                  liste: 'Tofu, Tempeh, Linsen, Kichererbsen, Edamame',
                },
              ]}
            />
            <MakroTippBox
              variant="wissen"
              text="Hülsenfrüchte wie Linsen, Bohnen und Kichererbsen liefern nie nur Protein — sie bringen fast immer auch wertvolle Ballaststoffe und Kohlenhydrate mit. Kein Nachteil, nur gut zu wissen, wenn du deine Makros einordnest."
            />
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
            <MakroIconIntro
              icon={<Wheat className="h-6 w-6 text-[#0E7C86]" strokeWidth={1.8} />}
              intro="Dein schnellster Energielieferant — wird am zügigsten zu Glucose."
            />
            <MakroStatBoxen kcalWert="4" wichtigText="Schnelle Energie · Gehirn · Sportleistung" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              Es gibt kurze Kohlenhydratketten (Zucker, Honig, Sirup, Datteln) und lange Ketten (Brot, Nudeln, Gebäck). Ganz lange Ketten sind Ballaststoffe — wichtig für den Darm und für eine langsame Energieabgabe (→ länger satt, mehr dazu bei &quot;Ballaststoffe&quot;).
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Quellen: Reis, Kartoffeln, Haferflocken, Vollkornbrot, Nudeln, Obst.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Isst du (fast) nur Kohlenhydrate, steigt dein Blutzucker schnell — das ist normal, dein Körper schüttet Insulin aus, um die Glucose zu verteilen. Je länger die Kette, desto langsamer läuft dieser Prozess ab.
            </p>
            <MakroTippBox
              variant="lukas"
              text="Im (Ausdauer-)Sport sind Kohlenhydrate Pflicht: Iss vorher eine kleine, schnell verdauliche Portion (Banane, Dattel, Marmeladenbrot) — wie Tanken vor dem Rennen."
            />
          </>
        ),
      },
      {
        id: 4,
        titel: 'Fette',
        inhalt: (
          <>
            <MakroIconIntro
              icon={<Droplet className="h-6 w-6 text-[#0E7C86]" strokeWidth={1.8} />}
              intro="Dein dichtester Energiespeicher — doppelt so viele Kalorien wie Protein oder Kohlenhydrate."
            />
            <MakroStatBoxen kcalWert="9" wichtigText="Vitamine A · D · E · K · Hormone · Sättigung" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              Gesättigte Fette sind bei Raumtemperatur meist fest (Fleisch, Butter, Käse, Kokosöl) — dein Körper kann sie selbst herstellen, sie sind nicht lebensnotwendig. Einfach oder mehrfach ungesättigte Fette sind bei Raumtemperatur flüssig: Olivenöl, Leinöl, Rapsöl, Avocado, fetter Fisch, Nüsse und Saaten. Kaltgepresste (&quot;native&quot;) Pflanzenöle sind die Quelle deiner Wahl.
            </p>
            <MakroQuellenListe
              label="Fettquellen"
              quellen={[
                {
                  icon: <Beef className="h-[13px] w-[13px] text-[#0E7C86]" strokeWidth={2} />,
                  kategorie: 'Tierisch',
                  liste: 'Fetter Fisch (Lachs, Makrele, Hering), Speck, Talg',
                },
                {
                  icon: <Egg className="h-[13px] w-[13px] text-[#0E7C86]" strokeWidth={2} />,
                  kategorie: 'Vegetarisch',
                  liste: 'Butter, Käse, Eigelb, Sahne',
                },
                {
                  icon: <Leaf className="h-[13px] w-[13px] text-[#0E7C86]" strokeWidth={2} />,
                  kategorie: 'Vegan',
                  liste: 'Olivenöl, Rapsöl, Avocado, Nüsse, Chiasamen',
                },
              ]}
            />
            <MakroTippBox
              variant="lukas"
              text={
                'Wichtiger als "wie viel Fett" ist "welches Fett": Achte eher auf Omega-3 als auf Omega-6 — davon isst du ohnehin meist genug. Mit Lein-, Raps- oder Walnussöl, Chiasamen und fettem Fisch (Lachs, Makrele) machst du dir Omega-3 einfach.'
              }
            />
          </>
        ),
      },
      {
        id: 5,
        titel: 'Ballaststoffe',
        inhalt: (
          <>
            <MakroIconIntro
              icon={<Sprout className="h-6 w-6 text-[#0E7C86]" strokeWidth={1.8} />}
              intro="Unverdauliche, sehr lange Kohlenhydratketten — dein Darm braucht sie dringend."
            />
            <MakroStatBoxen kcalWert="1–2" wichtigText="Darmflora · Verdauung · Stabiler Blutzucker" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              Sie füttern deine Darmbakterien, halten die Verdauung in Schwung und verlangsamen, wie schnell andere Nährstoffe ins Blut gelangen — das hält dich länger satt und deinen Blutzucker stabiler.
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Quellen: Vollkornprodukte, Hülsenfrüchte, Gemüse, Obst mit Schale, Nüsse und Samen.
            </p>
            <MakroTippBox
              variant="wissen"
              text="Die meisten essen zu wenig Ballaststoffe. Faustregel: mindestens 30 g pro Tag — am einfachsten über Vollkornprodukte, Hülsenfrüchte und Gemüse mit Schale, nicht über Nahrungsergänzung."
            />
          </>
        ),
      },
      {
        id: 6,
        titel: 'Alkohol',
        inhalt: (
          <>
            <MakroIconIntro
              icon={<Wine className="h-6 w-6 text-[#0E7C86]" strokeWidth={1.8} />}
              intro="Ein kulturell schwieriges Thema in Deutschland — aber wichtig für die Einordnung."
            />
            <MakroStatBoxen kcalWert="7" wichtigLabel="Fakt" wichtigText="Energie, Nervengift, keine Nährstoffe · wird zuerst abgebaut" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              Alkohol ist ein Nervengift — eine unbedenkliche Menge gibt es nicht. Sobald Alkohol in deinen Körper gelangt, kümmert sich dein Körper zuerst um dessen Abbau. Gleichzeitig ist Alkohol auch eine Energiequelle: Kalorien, die währenddessen zusätzlich aufgenommen werden, werden erstmal geparkt — meist direkt als Körperfett. Wo genau, entscheidet deine DNA, nicht du.
            </p>
            <MakroTippBox
              variant="lukas"
              text="Willst du trinken und trotzdem schlank bleiben: Iss vorher etwas Sättigendes — das bremst, wie schnell der Alkohol wirkt, und meist isst du am Ende auch weniger dazu."
            />
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
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kalorien und Makronährstoffe</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Alle Informationen, die für deine Ernährung wichtig sind, findest du hier. Außerdem gibt es eine Menge Beispiele, woher du was bekommst … außer beim Alkohol. Ich glaube, das weißt du schon, woher der kommt ;-)
        </p>
      </div>

      <ArbeitspunkteListe
        storageKey="kal_completed"
        sektionen={SEKTIONEN}
        ersterPunktOnboarding={{ autoOpenNachMs: 700 }}
      />
    </div>
  )
}
