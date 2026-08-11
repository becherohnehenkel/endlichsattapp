'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { randomArtOfEatingPrinzip } from '@/lib/art-of-eating-principles'

// PROJ-34: dezenter, zufällig rotierender Hinweis auf den Ergebnisseiten (Mahlzeit, Komponente,
// Snack) — bewusst kein eigener großer Bereich wie Sättigung/Geschmack, sondern dieselbe
// unauffällige Kartenoptik wie der bisherige Legacy-`art_of_eating_tipp`-Block. Kein Backend,
// keine Persistenz — reiner Lern-Nudge, der bei jedem Aufruf neu zufällig gewählt wird
// (siehe PROJ-34 Decision Log).
//
// Die Zufallsauswahl passiert bewusst erst nach dem ersten Rendern im Browser (derselbe
// useSyncExternalStore-Kniff wie in art-of-eating-guide.tsx), sonst würde die serverseitig
// vorgerenderte Seite nicht zum client-seitig berechneten Ergebnis passen (Hydration-Fehler).
function subscribe() { return () => {} }
function getSnapshot() { return true }
function getServerSnapshot() { return false }

export default function ArtOfEatingHinweis() {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [prinzip] = useState(randomArtOfEatingPrinzip)

  if (!isMounted) return null

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground">🧘 Art of Eating · {prinzip.title}</p>
      <p className="text-sm text-foreground">{prinzip.body}</p>
      <Link
        href="/wie-esse-ich-richtig"
        className="inline-block text-xs font-medium text-[#2E9E6B] hover:underline"
      >
        Wie esse ich richtig? →
      </Link>
    </div>
  )
}
