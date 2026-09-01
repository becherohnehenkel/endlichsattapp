// PROJ-34: geteilte Quelle für die sechs Art-of-Eating-Prinzipien — sowohl der vollständige
// Guide (art-of-eating-guide.tsx) als auch der kompakte, zufällig rotierende Hinweis auf den
// Ergebnisseiten (art-of-eating-hinweis.tsx) lesen von hier, damit dieselben sechs Texte nicht
// zweimal gepflegt werden müssen. Inhalt von Lukas geschrieben, unverändert übernommen.

export interface ArtOfEatingPrinzip {
  number: number
  title: string
  body: string
  funFact: string | null
}

export const ART_OF_EATING_PRINZIPIEN: readonly ArtOfEatingPrinzip[] = [
  {
    number: 1,
    title: 'Schaffe den richtigen Rahmen',
    body: 'Setz dich hin. Immer. Wer im Gehen isst, verliert den Bezug zur Mahlzeit und damit auch das Sättigungsgefühl. Essen ist kein Anhängsel deines Tages, sondern ein fester Teil davon. Nimm dir die Zeit bewusst — nicht weil du sie hast, sondern weil du sie dir nimmst.',
    funFact: 'In Japan sieht man niemanden im Gehen essen — kein Zufall, dass die Japaner zu den langlebigsten Menschen der Welt zählen.',
  },
  {
    number: 2,
    title: 'Schalte Ablenkungen aus',
    body: 'Kein Smartphone, kein Fernseher, keine Musik, kein Podcast. Selbst das Essen bei einem Event im Stehen kann dich von deiner Sättigung ablenken. Voller Fokus auf den Teller. Ablenkung macht nicht nur unaufmerksam — sie macht dich buchstäblich weniger satt, weil dein Gehirn die Signale deines Körpers nicht verarbeiten kann. Es ist... abgelenkt.',
    funFact: null,
  },
  {
    number: 3,
    title: 'Riech, bevor du isst',
    body: 'Bevor der erste Bissen im Mund ist: nimm dir einen Moment und riech bewusst an deiner Mahlzeit. Bis zu 80 % dessen, was wir als Geschmack erleben, entsteht tatsächlich über den Geruch.',
    funFact: 'Das kennst du aus Fernsehsendungen: Bei verschlossener Nase schmecken Erdbeer- und Himbeermarmelade identisch. Wer das Riechen überspringt, verpasst den größten Teil des Genusses, bevor er überhaupt angefangen hat.',
  },
  {
    number: 4,
    title: 'Kau gründlich',
    body: 'Dein Magen hat keine Zähne. Verdauung beginnt im Mund: durch mechanisches Zerkleinern und Speichel, der bereits erste Nährstoffe aufschließt. Kaue jeden Bissen so lange, bis er fast flüssig ist.',
    funFact: 'Experiment: Kaue ein Stück Brot sehr lange. Es wird mit jedem Kauschritt süßer — weil die langen Kohlenhydratketten zu Zuckermolekülen aufgeschlossen werden. Aromen entfalten sich, die du vorher nie bewusst wahrgenommen hast.',
  },
  {
    number: 5,
    title: 'Schmecke die Details',
    body: 'Wie intensiv sind die Kartoffeln? Wie frisch die Petersilie? Wie komplex das Fleisch? Wer langsam kaut, schmeckt mehr und isst automatisch bewusster. Essen ist etwas Großartiges. Behandle es entsprechend.',
    funFact: null,
  },
  {
    number: 6,
    title: 'Hör auf deinen Körper',
    body: 'Dein Körper weiß, wann er satt ist — er braucht nur Zeit, um es dir zu sagen. Wer langsam und ohne Ablenkung isst, spürt das Signal nach etwa 20 Minuten ganz von alleine. Schau beim Essen auch mal auf die Uhr, nicht nur auf den Teller.',
    funFact: 'Hara Hachi Bu ist eine japanische Lebensweisheit: Hör auf zu essen, wenn der Magen zu 80 % gefüllt ist — angenehm satt statt unangenehm überfüllt. Das fasst eigentlich alles zusammen. 🙂',
  },
] as const

export function randomArtOfEatingPrinzip(): ArtOfEatingPrinzip {
  return ART_OF_EATING_PRINZIPIEN[Math.floor(Math.random() * ART_OF_EATING_PRINZIPIEN.length)]
}
