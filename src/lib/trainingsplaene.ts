// PROJ-44: Statischer Plan-/Übungs-Content für die 3 Trainingspläne aus PROJ-43.
// Sätze/Wiederholungen/Pause/Gewicht selbst werden NICHT hier gespeichert — das sind
// clientseitig editierbare Freitextfelder, hier stehen nur die Plan-Schema-Startwerte.

export interface TrainingsUebung {
  id: string
  name: string
  ausfuehrung: string
}

export interface Trainingsplan {
  slug: string
  titel: string
  intro: string
  warmup: string
  schemaSaetze: string
  schemaWiederholungen: string
  schemaPause: string
  zeigtGewichtsfeld: boolean
  uebungen: TrainingsUebung[]
}

export const TRAININGSPLAENE: Trainingsplan[] = [
  {
    slug: 'zuhause-ohne-equipment',
    titel: 'Zu Hause ohne Equipment',
    intro: 'Bodyweight-Training für zu Hause — sechs Übungen, die du ohne jegliches Equipment machen kannst.',
    warmup: '5–10 Minuten: Hampelmann, Highknees oder eine Runde um den Block gehen.',
    schemaSaetze: '3',
    schemaWiederholungen: '12',
    schemaPause: '60 Sek.',
    zeigtGewichtsfeld: false,
    uebungen: [
      { id: 'kniebeuge', name: 'Kniebeuge', ausfuehrung: 'Füße schulterbreit, Zehen leicht nach außen. Gesäß nach hinten schieben, als würdest du dich auf einen Stuhl setzen. Knie zeigen in Zehenrichtung, Rücken bleibt gerade. Runter bis Oberschenkel etwa parallel zum Boden, dann hochdrücken.' },
      { id: 'glute-bridge', name: 'Glute Bridge', ausfuehrung: 'Rückenlage, Knie angewinkelt, Füße hüftbreit aufgestellt. Po anspannen und Becken nach oben heben, bis Schultern-Knie eine Linie bilden. Kurz halten, dann kontrolliert absenken.' },
      { id: 'ausfallschritte', name: 'Ausfallschritte abwechselnd', ausfuehrung: 'Großer Schritt nach vorne, hinteres Knie sinkt Richtung Boden ab, vorderes Knie bleibt über dem Fuß. Oberkörper aufrecht. Zurück in den Stand drücken, Seite wechseln.' },
      { id: 'liegestuetz', name: 'Liegestütz (ggf. kniend)', ausfuehrung: 'Hände etwas breiter als schulterbreit, Körper bildet eine gerade Linie von Kopf bis Fersen (oder Knien bei der erleichterten Variante). Brust Richtung Boden senken, Ellbogen nah am Körper, dann hochdrücken.' },
      { id: 'superman', name: 'Superman Pose', ausfuehrung: 'Bauchlage, Arme nach vorne gestreckt. Arme und Beine gleichzeitig leicht vom Boden abheben, Rücken anspannen. Kurz halten, dann sanft ablegen.' },
      { id: 'beinheben', name: 'Beinheben', ausfuehrung: 'Rückenlage, Beine gestreckt. Unteren Rücken in den Boden drücken, Beine gemeinsam kontrolliert nach oben heben, dann langsam wieder absenken, ohne den Boden zu berühren.' },
    ],
  },
  {
    slug: 'zuhause-mit-baendern',
    titel: 'Zu Hause mit Widerstandsbändern',
    intro: 'Trainiere zu Hause mit einem einfachen Widerstandsband — mehr Spannung als bei reinem Bodyweight, ohne großes Equipment.',
    warmup: '5–10 Minuten: Hampelmann, Highknees oder eine Runde um den Block gehen.',
    schemaSaetze: '3',
    schemaWiederholungen: '12',
    schemaPause: '60 Sek.',
    zeigtGewichtsfeld: true,
    uebungen: [
      { id: 'kreuzheben-band', name: 'Kreuzheben', ausfuehrung: 'Auf die Mitte des Bandes stellen, Enden mit beiden Händen greifen. Hüfte nach hinten schieben, Rücken gerade, Band an den Beinen entlang nach unten führen, dann Hüfte nach vorne strecken und aufrichten.' },
      { id: 'rudern-band', name: 'Rudern vorgebeugt', ausfuehrung: 'Band unter den Füßen fixieren, leicht in der Hüfte vorbeugen, Rücken gerade. Ellbogen nah am Körper nach hinten ziehen, Schulterblätter zusammenziehen, dann kontrolliert zurückführen.' },
      { id: 'kniebeugen-band', name: 'Kniebeugen', ausfuehrung: 'Band unter den Füßen fixieren, Enden auf Schulterhöhe halten. Wie eine normale Kniebeuge absenken — der Widerstand des Bandes nimmt beim Hochdrücken zu.' },
      { id: 'schulterdruecken-band', name: 'Schulterdrücken', ausfuehrung: 'Band unter den Füßen fixieren, Enden auf Schulterhöhe. Arme nach oben strecken, bis sie fast durchgestreckt sind, dann kontrolliert zurückführen.' },
      { id: 'seitenheben-band', name: 'Seitenheben', ausfuehrung: 'Auf das Band stellen, Enden in beiden Händen. Arme seitlich bis auf Schulterhöhe anheben, Ellbogen leicht gebeugt, dann langsam absenken.' },
      { id: 'bizeps-band', name: 'Bizeps Curls', ausfuehrung: 'Auf das Band stellen, Handflächen zeigen nach vorne. Unterarme beugen, Ellbogen bleiben am Körper, dann kontrolliert wieder strecken.' },
      { id: 'trizeps-band', name: 'Trizeps drücken', ausfuehrung: 'Band über einen erhöhten Punkt hängen oder mit einer Hand über der Schulter fixieren. Arm nach unten/hinten strecken, dann kontrolliert zurückführen.' },
      { id: 'armkreisen', name: 'Armkreisen', ausfuehrung: 'Arme seitlich auf Schulterhöhe ausstrecken, kleine, kontrollierte Kreise vorwärts und rückwärts — reine Mobilisationsübung, kein Widerstand nötig.' },
    ],
  },
  {
    slug: 'fitnessstudio',
    titel: 'Fitnessstudio',
    intro: 'Der klassische Fitnessstudio-Plan mit Lang- und Kurzhanteln sowie Kabelzug.',
    warmup: '5–10 Minuten am Rad-/Ruderergometer, Fahrrad oder Laufband.',
    schemaSaetze: '3',
    schemaWiederholungen: '10',
    schemaPause: '60 Sek.',
    zeigtGewichtsfeld: true,
    uebungen: [
      { id: 'kniebeuge-lh', name: 'Kniebeuge mit Langhantel', ausfuehrung: 'Stange auf dem oberen Rücken (nicht im Nacken), Füße schulterbreit. Wie eine normale Kniebeuge absenken, Rücken bleibt gerade, Knie in Zehenrichtung, dann hochdrücken.' },
      { id: 'rudern-lh', name: 'Vorgebeugtes Rudern mit Langhantel', ausfuehrung: 'Hüfte nach hinten schieben, Oberkörper etwa 45° vorgebeugt, Rücken gerade. Stange zum unteren Bauch ziehen, Ellbogen nah am Körper, dann kontrolliert absenken.' },
      { id: 'schulterdruecken-lh', name: 'Schulterdrücken mit Langhantel', ausfuehrung: 'Stange auf Schulterhöhe, Griff etwas breiter als schulterbreit. Nach oben drücken, bis Arme fast durchgestreckt sind, dann kontrolliert zur Schulter zurückführen.' },
      { id: 'bankdruecken-kh', name: 'Bankdrücken mit Kurzhantel', ausfuehrung: 'Rückenlage auf der Bank, Hanteln auf Brusthöhe. Nach oben drücken, bis Arme fast durchgestreckt sind, dann kontrolliert wieder absenken.' },
      { id: 'latziehen', name: 'Latziehen am Kabelzug', ausfuehrung: 'Griff etwas breiter als schulterbreit fassen, aufrecht sitzen. Stange Richtung obere Brust ziehen, Schulterblätter zusammenziehen, dann kontrolliert nach oben zurückführen.' },
      { id: 'trizeps-kabel', name: 'Trizepsdrücken am Kabelzug', ausfuehrung: 'Griff am oberen Kabelzug fassen, Ellbogen bleiben am Körper. Nach unten drücken, bis Arme durchgestreckt sind, dann kontrolliert zurückführen.' },
      { id: 'bizeps-kabel', name: 'Bizeps Curls am Kabelzug', ausfuehrung: 'Griff am unteren Kabelzug fassen, Ellbogen bleiben am Körper. Unterarme nach oben beugen, dann kontrolliert wieder strecken.' },
    ],
  },
]

export function findTrainingsplan(slug: string): Trainingsplan | undefined {
  return TRAININGSPLAENE.find(plan => plan.slug === slug)
}
