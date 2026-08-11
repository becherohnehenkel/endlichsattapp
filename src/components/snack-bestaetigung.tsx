'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { SnackAnalysisResult } from '@/components/saettigungs-ergebnis'
import ArtOfEatingHinweis from '@/components/art-of-eating-hinweis'

// Refinement 2026-08-11 ("Complete"-Umstrukturierung): komplett neu. Bewusst die kleinste
// aller Ergebnis-Komponenten — ein Snack bekommt laut Spec explizit KEINE Analyse, KEINEN
// Sättigungs-Score, KEINEN Kalorien-Kommentar und KEINE Vorschläge. Deshalb eigene Komponente
// statt Wiederverwendung von KomponentenErgebnis, die strukturell viel mehr zeigen will.

interface SnackBestaetigungProps {
  result: SnackAnalysisResult
  assumptions: string[]
  onReset: () => void
  photoUrl?: string | null
}

export default function SnackBestaetigung({ result, onReset, photoUrl }: SnackBestaetigungProps) {
  const zutatenNamen = result.zutatenliste.map(z => z.name).join(', ')

  return (
    <main className="px-4 py-6 max-w-sm mx-auto space-y-6">
      {photoUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
          <Image src={photoUrl} alt="Snack" fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 text-center space-y-2">
        <p className="text-3xl">🍎</p>
        <p className="text-sm font-semibold text-foreground">{result.snackBestaetigung}</p>
        {zutatenNamen && (
          <p className="text-xs text-muted-foreground">{zutatenNamen}</p>
        )}
      </div>

      {/* Art of Eating (PROJ-34) — dezenter, zufällig rotierender Hinweis, gilt anders als
          Geschmack (PROJ-33) auch für Snacks: wie man isst ist unabhängig von der Menge */}
      <ArtOfEatingHinweis />

      <Button variant="outline" size="lg" className="w-full" onClick={onReset}>
        Neue Mahlzeit analysieren
      </Button>
    </main>
  )
}
