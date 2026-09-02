import { redirect } from 'next/navigation'

// PROJ-42: /historie ist in Sektion 3 der Analyse-Übersicht aufgegangen.
// Weiterleitung statt Löschen, damit alte Lesezeichen/Links nicht ins Leere laufen.
export default function HistoriePage() {
  redirect('/analyse')
}
