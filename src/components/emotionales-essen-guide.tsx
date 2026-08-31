import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'

const SEKTIONEN: ArbeitspunkteSektion[] = [
  {
    label: 'Direkt an der Emotion ansetzen',
    punkte: [
      {
        id: 1,
        titel: 'Traurig?',
        inhalt: (
          <p className="text-sm text-foreground/80 leading-relaxed">
            Dir fehlt Nähe. Simon Sinek sagt: 8 Minuten reichen, um sich verstanden zu fühlen. Frag eine Freundin oder einen Freund, ob sie 8 Minuten für dich haben. Ruf an. Tausch dich aus. Lass alles raus. Bist du nicht allein daheim: Frag nach einer Umarmung. Das schüttet Oxytocin, Dopamin und Serotonin aus. Essen löst das zwar auch aus — ist aber mit dem Runterschlucken vorbei. Deswegen die Endlosschleife.
          </p>
        ),
      },
      {
        id: 2,
        titel: 'Wütend?',
        inhalt: (
          <p className="text-sm text-foreground/80 leading-relaxed">
            Bewegung. Die Wut muss einmal raus. Mach eine Minute Kniebeugen, Liegestütze, Planks — oder geh 10 Minuten um den Block. Wut ist meist ein Kommunikationsproblem bei Meinungsverschiedenheiten, oft von außen angestoßen. Der Körper reagiert mit einem der drei Fs: Fight, Flight oder Freeze. Bei Fight muss die Energie woanders hin — in deinen Körper, mit Bewegung. Flight entgeht der Wut, die kommt wieder. Freeze verlagert sie auf später. Essen ist keine Lösung davon.
          </p>
        ),
      },
      {
        id: 3,
        titel: 'Überfordert / Gestresst?',
        inhalt: (
          <p className="text-sm text-foreground/80 leading-relaxed">
            Das kennen wir alle. Postfach voll, To-do-Liste quillt über. Nimm dir 5 Minuten und schreib auf, was du alles zu tun hast. Priorisiere von 1–3 (keine 4, keine 0 — nur diese drei). Schreib dahinter, was du alleine machen kannst und bis wann es fertig sein MUSS — nicht sollte. Und dann die Lieblingsspalte: Delegieren. Vielleicht kann dir jemand bei einer Aufgabe helfen oder sie ganz übernehmen. Du musst nicht alles allein machen. Jetzt die Liste sinnvoll abarbeiten — mit einem Snack wird sie nicht kürzer.
          </p>
        ),
      },
    ],
  },
  {
    label: 'Allgemeine Praxis-Übungen',
    punkte: [
      {
        id: 4,
        titel: 'Journaling',
        inhalt: (
          <>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Nimm dir jeden Morgen oder Abend 5 Minuten Zeit für dich. Stell dir einen Timer. Mach eine Tabelle: Spalte 1 mit einem &quot;+&quot;, Spalte 2 mit einem &quot;−&quot;. Unter &quot;+&quot; schreibst du auf, was du gemacht hast, das dir gefallen hat und du wieder tun möchtest. Unter &quot;−&quot; kommen die Dinge, die du nicht nochmal machen willst.
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Es geht darum, sichtbar zu machen, was du alles getan hast. Allein durchs Aufschreiben beschäftigst du dich damit. Beim nächsten Mal, wenn du tust, was dir nicht gefallen hat, flüstert eine leise Stimme: &quot;Moment — das hab ich doch aufgeschrieben.&quot; Mit jedem Mal Aufschreiben kannst du diesen Situationen Schritt für Schritt entkommen.
            </p>
          </>
        ),
      },
      {
        id: 5,
        titel: 'Fragebogen: Hast du wirklich Hunger?',
        inhalt: (
          <>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Du stehst vor der Snackschublade oder dem Kühlschrank? Okay. Beantworte dir erst diese Fragen — dann geht&apos;s weiter.
            </p>
            <ol className="space-y-2 text-sm text-foreground/80 leading-relaxed list-decimal pl-5">
              <li>Ich WILL essen — warum? Was hatte ich gerade eigentlich vor?</li>
              <li>Würde ich jetzt auch eine trockene Scheibe Brot essen?</li>
              <li>Habe ich genug getrunken — bin ich vielleicht nur durstig?</li>
              <li>Wie habe ich geschlafen, wie viel Sport hatte ich zuletzt? Wenig von beidem heißt: mein Körper braucht evtl. mehr Energie — das ist okay.</li>
              <li>Wann war meine letzte Mahlzeit, wann ist die nächste geplant? Hat mich die letzte nicht wirklich gesättigt? <em>(Falls ja: nochmal zu Frage 1.)</em></li>
              <li>Wurde ich gerade getriggert — Geruch, Werbung, Kuchen im Büro?</li>
              <li>Okay, ich habe wirklich Hunger. Aber: Was ist eigentlich mein Ziel — und wie weit wirft mich das jetzt zurück?</li>
            </ol>
          </>
        ),
      },
      {
        id: 6,
        titel: 'Atemübung (4-6-8-Technik)',
        inhalt: (
          <div className="space-y-1.5 text-sm text-foreground/80 leading-relaxed">
            <p><strong>Einatmen</strong> — 4 Sekunden lang tief durch die Nase in den Bauch einatmen.</p>
            <p><strong>Halten</strong> — Den Atem 6 Sekunden lang anhalten.</p>
            <p><strong>Ausatmen</strong> — 8 Sekunden lang langsam und vollständig durch den Mund ausatmen.</p>
            <p><strong>Wiederholen</strong> — 5 bis 10 Minuten lang, bis der Drang nach Essen nachlässt.</p>
          </div>
        ),
      },
      {
        id: 7,
        titel: 'Einkauf planen',
        inhalt: (
          <>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Was du immer zu Hause haben solltest, damit du unfallfrei und schnell kochen kannst. Das ist nur ein Vorschlag — mach ihn zu deinem!
            </p>
            <div className="grid grid-cols-1 gap-3 text-sm text-foreground/80 leading-relaxed">
              <div className="rounded-xl bg-muted/40 p-3 space-y-1.5">
                <p className="font-semibold text-foreground">Frisches</p>
                <p>Gemüse (saisonal, z. B. Frühling: Rhabarber, Radieschen, Spargel, Brokkoli … / Sommer: Paprika, Zucchini, Tomate … / Herbst: Kürbis, Mais … / Winter: Wurzelgemüse, Rotkohl, Grünkohl …), plus Pilze, Zitrone/Limette, Karotte, Knollensellerie, Kartoffel, Zwiebel, Knoblauch</p>
                <p>Obst (saisonal — Beeren, Kirschen, Äpfel, Trauben, Birnen, Zitrusfrüchte je nach Jahreszeit)</p>
                <p>Kräuter (Petersilie, Schnittlauch, Basilikum, Rosmarin, Ingwer …)</p>
                <p>Milchprodukte (Quark, Harzer Käse, Käse, Joghurt, Butter)</p>
                <p>Weitere Proteinquellen (Tofu, Tempeh, Eier)</p>
                <p>Gekühltes Haltbares (Sauerkraut, Kimchi, Misopaste, Senf, Currypaste)</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 space-y-1.5">
                <p className="font-semibold text-foreground">Haltbares</p>
                <p>Konserven (Kichererbsen, Bohnen, Mais, Tomatensoße, Tomatenmark)</p>
                <p>Eingekochtes (Marmelade, Apfelmark)</p>
                <p>Glasware (Honig, Mandelmus)</p>
                <p>Getrocknet (Kräutermischungen, Chillies, Zimt)</p>
                <p>Flaschen (natives Öl, raffiniertes Öl/Schmalz, Essige, Sojasauce)</p>
                <p>Alles Korn (Hafer-/Dinkel-/Weizenflocken, Müslimix, Vollkornmehl, Brot/Tortillas, Nudeln, Reis)</p>
                <p>Süßes in Maßen (dunkle Schokolade, Studentenfutter, zuckerfreie Getränke, Proteinriegel)</p>
                <p>Tiefkühlware (Beeren, Fisch und Fleisch, Erbsen, TK-Gemüsemischung)</p>
              </div>
            </div>
          </>
        ),
      },
      {
        id: 8,
        titel: 'Feste Mahlzeiten planen (ohne Ablenkung)',
        inhalt: (
          <p className="text-sm text-foreground/80 leading-relaxed">
            Wenn du &quot;immer&quot; isst, hat dein Körper keinen Rhythmus — und der liebt Rhythmus. Deshalb reden wir oft von 3 Mahlzeiten am Tag; ein Snack kann eingebaut werden, aber eigentlich reicht das. Teile deine Kalorien nach der Formel 20/40/40 auf. Beispiel bei 2000 Tageskalorien: Frühstück 400 kcal, Mittag- und Abendessen je 800 kcal.
          </p>
        ),
      },
      {
        id: 9,
        titel: 'Screentime planen',
        inhalt: (
          <p className="text-sm text-foreground/80 leading-relaxed">
            Das Smartphone hat vieles einfacher und schneller gemacht — das ist verständlich. Aber schau in deinen Einstellungen nach, wie lange du in welcher App verbringst. Meist ist es Social Media. Limitiere diese App auf eine &quot;Tagesdosis&quot; — nicht sofort auf 20 Minuten, sondern einfach weniger als gestern. Reduziere weiter, sobald es sich leicht anfühlt. Viele fremde Gedanken, die im Sekundentakt auf dich einprasseln, beeinflussen nicht nur deine Gedanken, sondern auch dein Verhältnis zum Essen.
          </p>
        ),
      },
    ],
  },
]

export function EmotionalesEssenGuide() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-foreground leading-relaxed">
          Trauer, Wut, Überforderung, Stress — das sind menschliche Emotionen, die auch zu einem &quot;gesunden&quot; Leben dazugehören können. Aber keine davon lässt sich mit etwas zu essen lösen. Wie du stattdessen damit umgehen kannst, zeige ich dir hier.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Langeweile gibt es eigentlich nicht wirklich — meistens ist es ein Zeichen für Dauerstimulation. Klebst du ständig am Screen? Kopfhörer immer drin? Deine Sinne (Hören, Sehen, Riechen, Fühlen) sind permanent gereizt. Und was passt da super dazu? Genau: Geschmack, Kauen, ein tolles Mundgefühl. Die vermeintliche Langeweile ist oft nur ein fehlender Reiz, den du mit Essen oder Trinken füllen willst.
        </p>
      </div>

      <ArbeitspunkteListe storageKey="ee_completed" sektionen={SEKTIONEN} />
    </div>
  )
}
