import { Check, Timer } from 'lucide-react'
import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'
import { FesteMahlzeitenPlaner } from './feste-mahlzeiten-planer'

interface UeberfordertBeispiel {
  aufgabe: string
  prioritaet: number
  bisWann: string
  delegieren: string
}

const UEBERFORDERT_BEISPIELE: UeberfordertBeispiel[] = [
  { aufgabe: 'Präsentation für Montag vorbereiten', prioritaet: 1, bisWann: 'Sonntag, 20 Uhr', delegieren: 'Nein — nur ich' },
  { aufgabe: 'Wäsche waschen', prioritaet: 3, bisWann: 'Diese Woche', delegieren: 'Ja — Partner:in' },
  { aufgabe: 'E-Mails beantworten', prioritaet: 2, bisWann: 'Heute, 18 Uhr', delegieren: 'Teilweise — Kolleg:in' },
  { aufgabe: 'Geburtstagsgeschenk besorgen', prioritaet: 2, bisWann: 'Freitag', delegieren: 'Ja — Geschwister fragen' },
]

interface Sinn {
  emoji: string
  label: string
  beschreibung: string
  // Sinne, die das Smartphone permanent bedient (Hören/Sehen/Fühlen) sind "angetickt".
  // Riechen & Schmecken bleiben offen — genau die Lücke, die unbewusstes Essen füllt.
  vomSmartphoneBedient: boolean
}

const SINNE: Sinn[] = [
  { emoji: '👂', label: 'Hören', beschreibung: 'Kopfhörer immer drin?', vomSmartphoneBedient: true },
  { emoji: '👀', label: 'Sehen', beschreibung: 'Ständig am Screen?', vomSmartphoneBedient: true },
  { emoji: '✋', label: 'Fühlen', beschreibung: 'Handy ständig in der Hand?', vomSmartphoneBedient: true },
  { emoji: '👃', label: 'Riechen', beschreibung: 'Frisches Brot, Kaffeeduft, Gebäck', vomSmartphoneBedient: false },
  { emoji: '👅', label: 'Schmecken', beschreibung: 'Essen, kauen, leckeres Mundgefühl', vomSmartphoneBedient: false },
]

interface EmotionalesEssenGuideProps {
  tagesKcal: number | null
}

export function EmotionalesEssenGuide({ tagesKcal }: EmotionalesEssenGuideProps) {
  const sektionen: ArbeitspunkteSektion[] = [
  {
    label: 'Direkt an der Emotion ansetzen',
    punkte: [
      {
        id: 1,
        titel: 'Traurig? Dir fehlt Nähe.',
        inhalt: (
          <p className="text-xs text-foreground/80 leading-relaxed">
            Simon Sinek sagt: 8 Minuten reichen, um sich verstanden zu fühlen. Frag eine Freundin oder einen Freund, ob sie 8 Minuten für dich haben. Ruf an. Tausch dich aus. Lass alles raus. Bist du nicht allein daheim: Frag nach einer Umarmung. Das schüttet Oxytocin, Dopamin und Serotonin aus. Essen löst das zwar auch aus — ist aber mit dem Runterschlucken vorbei. Deswegen die Endlosschleife.
          </p>
        ),
      },
      {
        id: 2,
        titel: 'Wütend? Dir fehlt Bewegung.',
        inhalt: (
          <p className="text-xs text-foreground/80 leading-relaxed">
            Die Wut muss einmal raus. Mach eine Minute Kniebeugen, Liegestütze, Planks — oder geh 10 Minuten um den Block. Wut ist meist ein Kommunikationsproblem bei Meinungsverschiedenheiten, oft von außen angestoßen. Der Körper reagiert mit einem der drei Fs: Fight, Flight oder Freeze. Bei Fight muss die Energie woanders hin — in deinen Körper, mit Bewegung. Flight entgeht der Wut, die kommt wieder. Freeze verlagert sie auf später. Essen ist keine Lösung davon.
          </p>
        ),
      },
      {
        id: 3,
        titel: 'Überfordert / Gestresst? Mach das:',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Postfach voll, To-do-Liste quillt über? Nimm dir 5 Minuten und schreib deine Aufgaben so auf:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {UEBERFORDERT_BEISPIELE.map(b => (
                <div key={b.aufgabe} className="rounded-xl bg-muted/40 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">{b.aufgabe}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span>🔢 Priorität {b.prioritaet}</span>
                    <span>⏰ {b.bisWann}</span>
                    <span>🤝 {b.delegieren}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-xs text-foreground/80 leading-relaxed pt-1">
              <p>📝 <strong>Aufgabe</strong> — schreib auf, was du alles zu tun hast</p>
              <p>🔢 <strong>Priorität</strong> — vergib 1–3 (keine 4, keine 0)</p>
              <p>⏰ <strong>Bis wann</strong> — wann es fertig sein MUSS, nicht sollte</p>
              <p>🤝 <strong>Delegieren</strong> — wer kann dir helfen oder es übernehmen?</p>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Du musst nicht alles allein machen. Jetzt die Liste sinnvoll abarbeiten — mit einem Snack wird sie nicht kürzer.
            </p>
          </>
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
            <p className="text-xs text-foreground/80 leading-relaxed">
              Nimm dir jeden Morgen oder Abend Zeit für dich. Schreib auf, was gut lief (&quot;+&quot;) und was nicht (&quot;−&quot;):
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              5 Minuten
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-emerald-700">+ Was lief gut</p>
              <div className="space-y-1 text-xs text-emerald-800/90 leading-relaxed">
                <p>😌 Entspannt aufgewacht</p>
                <p>🍽️ Bewusst Mittag gegessen</p>
                <p>✅ Alle ToDos abgearbeitet</p>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-amber-700">− Was lief nicht so gut</p>
              <div className="space-y-1 text-xs text-amber-800/90 leading-relaxed">
                <p>🏃 Sport übersprungen, weil die Arbeit Vorrang hatte <span className="text-amber-800/60">(ich möchte doch eigentlich zum Sport)</span></p>
                <p>🍰 Ja zum Kuchen der Kollegin gesagt <span className="text-amber-800/60">(ich möchte doch eigentlich nein sagen)</span></p>
                <p>🛋️ Auf der Couch versackt <span className="text-amber-800/60">(ich möchte doch eigentlich einen Spaziergang machen)</span></p>
                <p>📱 Zu lange am Handy verweilt <span className="text-amber-800/60">(ich möchte das reduzieren und stattdessen meinem Hobby nachgehen)</span></p>
              </div>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Allein durchs Aufschreiben beschäftigst du dich damit. Beim nächsten Mal flüstert eine leise Stimme: &quot;Moment — das hab ich doch aufgeschrieben.&quot; So kannst du dich Schritt für Schritt aus solchen Situationen befreien.
            </p>
          </>
        ),
      },
      {
        id: 5,
        titel: 'Fragebogen: Hast du wirklich Hunger?',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Du stehst vor der Snackschublade oder dem Kühlschrank? Okay. Beantworte dir erst diese Fragen — dann geht&apos;s weiter.
            </p>
            <ol className="space-y-2 text-xs text-foreground/80 leading-relaxed list-decimal pl-5">
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
          <div className="space-y-1.5 text-xs text-foreground/80 leading-relaxed">
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
            <p className="text-xs text-foreground/80 leading-relaxed">
              Was du immer zu Hause haben solltest, damit du unfallfrei und schnell kochen kannst. Das ist nur ein Vorschlag — mach ihn zu deinem!
            </p>
            <div className="grid grid-cols-1 gap-3 text-xs text-foreground/80 leading-relaxed">
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
          <FesteMahlzeitenPlaner
            tagesKcal={tagesKcal ?? 2000}
            istEigenerWert={tagesKcal != null}
          />
        ),
      },
      {
        id: 9,
        titel: 'Screentime planen',
        inhalt: (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Deine Sinne sind oft permanent gereizt — das erzeugt den Drang nach <strong>mehr</strong> Reiz und kann zu mehr unbewusstem Essen führen.
            </p>
            <div className="space-y-1.5">
              {SINNE.map(s => (
                <div
                  key={s.label}
                  className={
                    s.vomSmartphoneBedient
                      ? 'flex items-center gap-2.5 rounded-xl bg-muted/40 p-2.5'
                      : 'flex items-center gap-2.5 rounded-xl border border-dashed border-border p-2.5'
                  }
                >
                  <span className="text-base flex-shrink-0">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${s.vomSmartphoneBedient ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{s.beschreibung}</p>
                  </div>
                  {s.vomSmartphoneBedient ? (
                    <span className="flex-shrink-0 h-4 w-4 rounded-full bg-[#2E9E6B] flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="flex-shrink-0 h-4 w-4 rounded-full border-2 border-dashed border-muted-foreground/40" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Limitiere deine Hauptablenkungs-App auf eine &quot;Tagesdosis&quot; von 45 Minuten pro Tag. Glaub mir — du wirst über den Effekt staunen!
            </p>
          </>
        ),
      },
    ],
  },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-foreground leading-relaxed">
          Trauer, Wut, Überforderung, Stress — das sind menschliche Emotionen, die auch zu einem &quot;gesunden&quot; Leben dazugehören können. Aber keine davon lässt sich mit etwas zu essen lösen. Wie du stattdessen damit umgehen kannst, zeige ich dir hier.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Langeweile gibt es eigentlich nicht wirklich — meistens ist es ein Zeichen für Dauerstimulation. Klebst du ständig am Screen? Kopfhörer immer drin? Deine Sinne (Hören, Sehen, Riechen, Fühlen) sind permanent gereizt. Und was passt da super dazu? Genau: Geschmack, Kauen, ein tolles Mundgefühl. Die vermeintliche Langeweile ist oft nur ein fehlender Reiz, den du mit Essen oder Trinken füllen willst.
        </p>
      </div>

      <ArbeitspunkteListe storageKey="ee_completed" sektionen={sektionen} />
    </div>
  )
}
