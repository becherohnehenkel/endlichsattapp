import { Home, Zap, Dumbbell } from 'lucide-react'
import { ArbeitspunkteListe, type ArbeitspunkteSektion } from './arbeitspunkte-liste'
import { HubCard, type HubEntry } from './hub-card'

const SEKTIONEN: ArbeitspunkteSektion[] = [
  {
    punkte: [
      {
        id: 1,
        titel: 'Warum Krafttraining?',
        inhalt: (
          <p className="text-xs text-foreground/80 leading-relaxed">
            Muskeln sind dein Stoffwechsel-Booster: Mehr Muskelmasse verbrennt mehr Energie – auch im Sitzen. Beim Abnehmen sorgt Krafttraining dafür, dass du Fett verlierst statt Muskeln. Dazu: stabilere Gelenke, aufrechte Haltung, mehr Kraft im Alltag (Einkäufe, Kinder, Umzugskartons). Und es funktioniert in jedem Alter.
          </p>
        ),
      },
      {
        id: 2,
        titel: 'Was bedeutet was?',
        inhalt: (
          <ul className="space-y-2.5 text-xs text-foreground/80 leading-relaxed list-disc pl-5">
            <li><strong className="text-foreground">Wiederholung (Wdh):</strong> Eine komplette Ausführung der Übung. Einmal Gewicht hoch und runter = 1 Wdh.</li>
            <li><strong className="text-foreground">Satz:</strong> Mehrere Wiederholungen am Stück. „3 Sätze à 10 Wdh&quot; = 10 Wiederholungen, Pause, nochmal, Pause, nochmal.</li>
            <li><strong className="text-foreground">Kg:</strong> Das Zusatzgewicht, das du bewegst.</li>
            <li><strong className="text-foreground">Pause:</strong> Erholung zwischen den Sätzen, meist 1–3 Minuten. Ja, rumstehen gehört dazu.</li>
            <li><strong className="text-foreground">Stange/Gerät:</strong> Eine Langhantel wiegt meist 20 kg (kleinere 15 oder 10 kg) – steht oft drauf, sonst Personal fragen. Bei Geräten steht das Steckgewicht auf den Platten; das Eigengewicht des Geräts zählt da nicht mit, du orientierst dich einfach an den Zahlen am Gerät.</li>
          </ul>
        ),
      },
      {
        id: 3,
        titel: 'Warm-Up',
        inhalt: (
          <p className="text-xs text-foreground/80 leading-relaxed">
            5–10 Minuten locker bewegen (Radergometer, Rudern, zügig gehen), dann die erste Übung mit sehr leichtem Gewicht 1–2 Sätze „üben&quot;. Warum: Der Körper kommt auf Betriebstemperatur, Gelenke und Sehnen werden vorbereitet, du verletzt dich seltener – und die Bewegung sitzt, bevor Gewicht draufkommt.
          </p>
        ),
      },
      {
        id: 4,
        titel: 'Das richtige Gewicht',
        inhalt: (
          <p className="text-xs text-foreground/80 leading-relaxed">
            Faustregel: Die letzten 2–3 Wiederholungen eines Satzes sollen anstrengend sein, aber sauber machbar. Wenn du bei Wdh 10 noch plaudern könntest → zu leicht. Wenn die Technik zusammenbricht oder du bei Wdh 6 stecken bleibst → zu schwer. Am Anfang lieber zu leicht starten und Technik lernen – das Ego bleibt in der Umkleide.
          </p>
        ),
      },
      {
        id: 5,
        titel: 'Richtig steigern',
        inhalt: (
          <p className="text-xs text-foreground/80 leading-relaxed">
            Steigere erst, wenn du alle geplanten Wiederholungen in allen Sätzen sauber schaffst – idealerweise zweimal hintereinander. Dann in kleinen Schritten: 2,5 kg bei großen Übungen (Beine, Rücken), 1–2,5 kg oder eine Wiederholung mehr bei kleinen (Arme, Schultern). Geht das Gewicht nicht rauf, steigere Wiederholungen. Fortschritt ist nicht linear – Wochen ohne Steigerung sind normal, kein Grund zur Panik.
          </p>
        ),
      },
    ],
  },
]

// PROJ-44: Zielrouten existieren noch nicht (Trainingsplan-Detailseiten folgen als
// nächstes Feature) — Karten sind bereits verlinkt, ein 404 bis dahin ist akzeptiert
// (siehe Spec Decision Log).
const PLAENE: HubEntry[] = [
  { href: '/training/zuhause-ohne-equipment', title: 'Zu Hause ohne Equipment', subtitle: 'Bodyweight, ganz ohne Geräte', icon: Home },
  { href: '/training/zuhause-mit-baendern', title: 'Zu Hause mit Widerstandsbändern', subtitle: 'Mehr Widerstand, bleibt flexibel', icon: Zap },
  { href: '/training/fitnessstudio', title: 'Fitnessstudio', subtitle: 'Mit Hanteln und Kabelzug', icon: Dumbbell },
]

export function TrainingGuide() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Krafttraining: Die Basics für deinen Start</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Du musst kein Gym-Profi werden, um von Krafttraining zu profitieren. Aber ein paar Basics solltest du kennen, bevor du dich das erste Mal an eine Hantel stellst – damit du weißt, was du tust, warum du es tust und dich im Studio nicht verloren fühlst.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hier findest du alles Wichtige kompakt erklärt: von den Begriffen über das Aufwärmen bis zur Frage, wann du mehr Gewicht auflegen solltest. Kein Fachchinesisch, keine Überforderung – nur das, was du wirklich brauchst.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ganz unten findest du drei fertige Trainingspläne, mit denen du direkt loslegen kannst.
        </p>
      </div>

      <ArbeitspunkteListe
        storageKey="training_basics_completed"
        sektionen={SEKTIONEN}
        ersterPunktOnboarding={{ autoOpenNachMs: 700 }}
      />

      <div className="h-px bg-border" />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Deine Trainingspläne</h2>
        <div className="space-y-2.5">
          {PLAENE.map(plan => (
            <HubCard key={plan.href} {...plan} />
          ))}
        </div>
      </div>
    </div>
  )
}
