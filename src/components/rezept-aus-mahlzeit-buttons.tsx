import Link from 'next/link'
import { ChefHat, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RezeptAusMahlzeitButtonsProps {
  mealId: string
  /** Nur bei vollständigen Mahlzeiten mit vorhandenen Verbesserungsvorschlägen sinnvoll —
   *  ohne Vorschläge würde der Button sich identisch zu "Wie gescannt" verhalten. */
  showMehrSaettigung?: boolean
}

// PROJ-32: Einstiegspunkt "Rezept aus dieser Mahlzeit anlegen" — sowohl im frischen
// Analyse-Ergebnis als auch beim Ansehen einer vergangenen Mahlzeit in der Historie genutzt
// (siehe SaettigungsErgebnis + BeilagenErgebnis). Öffnet immer nur das vorausgefüllte
// Anlege-Formular aus PROJ-31 — speichert nie selbst.
export default function RezeptAusMahlzeitButtons({ mealId, showMehrSaettigung = false }: RezeptAusMahlzeitButtonsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">Als Rezept speichern</p>
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href={`/rezept/neu?mealId=${mealId}&variante=wie-gescannt`}>
            <ChefHat className="h-4 w-4 mr-2" />
            Wie gescannt
          </Link>
        </Button>
        {showMehrSaettigung && (
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href={`/rezept/neu?mealId=${mealId}&variante=mehr-saettigung`}>
              <Sparkles className="h-4 w-4 mr-2" />
              Mit mehr Sättigung
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
