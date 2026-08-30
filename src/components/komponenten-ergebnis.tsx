'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { KomponenteAnalysisResult } from '@/components/saettigungs-ergebnis'
import ZutatenBereich from '@/components/zutaten-bereich'
import RezeptAusMahlzeitButtons from '@/components/rezept-aus-mahlzeit-buttons'
import GeschmackErgebnis from '@/components/geschmack-ergebnis'
import ArtOfEatingHinweis from '@/components/art-of-eating-hinweis'

// Refinement 2026-08-11 ("Complete"-Umstrukturierung): löst BeilagenErgebnis ab. Rendert
// sowohl neue Komponente-Analysen (format: 'neu' — bilanz + kombinationsvorschlag) als auch
// historische Beilagen-Analysen (format: 'legacy' — als_beilage_top/als_hauptgericht/pairing[])
// unverändert weiter, da diese für immer im alten Format gespeichert bleiben.

interface KomponentenErgebnisProps {
  result: KomponenteAnalysisResult
  assumptions: string[]
  onReset: () => void
  analysisId?: string
  photoUrl?: string | null
  /** meals.id — PROJ-32: Einstiegspunkt "Wie gescannt" (kein "Mit mehr Sättigung" bei Komponenten) */
  mealId?: string
  /** PROJ-28: Mahlzeit wurde vor dem 3. August 2026 analysiert */
  tooOld?: boolean
}

export default function KomponentenErgebnis({ result, assumptions, onReset, photoUrl, mealId, analysisId, tooOld }: KomponentenErgebnisProps) {
  const [assumptionsOpen, setAssumptionsOpen] = useState(false)
  const allAssumptions = [...new Set([...assumptions, ...result.annahmen])]
  const k = result.komponente

  return (
    <main className="px-4 py-6 max-w-sm mx-auto space-y-6">

      {/* Annahmen + optionales Foto */}
      {(allAssumptions.length > 0 || photoUrl) && (
        <Collapsible open={assumptionsOpen} onOpenChange={setAssumptionsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
            <div className="flex items-center gap-2">
              {photoUrl && (
                <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0 border border-border/50">
                  <Image src={photoUrl} alt="Mahlzeit" fill className="object-cover" unoptimized />
                </div>
              )}
              <span className="font-medium">ℹ️ Basierend auf Annahmen</span>
            </div>
            {assumptionsOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pt-2 pb-1">
            {photoUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border mb-3">
                <Image src={photoUrl} alt="Mahlzeit" fill className="object-cover" unoptimized />
              </div>
            )}
            {allAssumptions.length > 0 && (
              <ul className="space-y-1">
                {allAssumptions.map((a, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* PROJ-28: Zutatenliste mit Gramm-Schätzungen */}
      <ZutatenBereich
        zutatenliste={result.zutatenliste}
        zutatenQuellen={result.zutatenQuellen ?? []}
        tooOld={tooOld}
      />

      {/* Badge */}
      <div className="text-center">
        <span className="inline-block px-5 py-2 rounded-full border border-amber-200 bg-amber-50 text-base font-semibold text-amber-700">
          Als Beilage gedacht
        </span>
      </div>

      {k.format === 'neu' ? (
        <>
          {/* Quantitative Bilanz */}
          <p className="text-foreground leading-relaxed">{k.bilanz}</p>

          <Separator />

          {/* Kombinationsvorschlag (genau einer) */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Damit wird daraus eine komplette Mahlzeit</p>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-sm text-foreground">{k.kombinationsvorschlag}</p>
            </div>
          </div>

          <Separator />

          {/* Art of Eating (PROJ-34) — dezenter, zufällig rotierender Hinweis */}
          <ArtOfEatingHinweis />
        </>
      ) : (
        <>
          {/* Legacy: was die Beilage gut macht */}
          <p className="text-foreground leading-relaxed">{k.als_beilage_top}</p>

          <Separator />

          {/* Legacy: warum allein nicht sättigend */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1.5">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Allein noch keine vollständige Mahlzeit</p>
            <p className="text-sm text-amber-700/90 leading-relaxed">{k.als_hauptgericht}</p>
          </div>

          {/* Legacy: Beilage-Upgrade (optional) */}
          {k.beilage_upgrade && (
            <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">💡 Kleiner Tipp für die Beilage selbst</p>
              <p className="text-sm text-foreground">{k.beilage_upgrade}</p>
            </div>
          )}

          <Separator />

          {/* Legacy: Pairing-Empfehlungen (2-3, bei neuen Analysen durch den einen Kombinationsvorschlag ersetzt) */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Was gut dazu passt</p>
            <div className="space-y-2">
              {k.pairing.map((p, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-1">
                  <p className="text-sm font-medium text-foreground">{p.empfehlung}</p>
                  <p className="text-xs text-muted-foreground">{p.warum}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legacy: Art of Eating Tipp (bei neuen Analysen entfällt dieses Feld) */}
          {k.art_of_eating_tipp && (
            <>
              <Separator />
              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground">🧘 Art of Eating</p>
                <p className="text-sm text-foreground">{k.art_of_eating_tipp}</p>
                <Link
                  href="/ernaehrung/wie-esse-ich-richtig"
                  className="inline-block text-xs font-medium text-[#2E9E6B] hover:underline"
                >
                  Wie esse ich richtig? →
                </Link>
              </div>
            </>
          )}
        </>
      )}

      {/* Geschmack (PROJ-33) — eigenständig, gleichwertig prominent, nur bei neuen Analysen möglich */}
      {result.geschmack && (
        <>
          <Separator />
          <GeschmackErgebnis
            geschmack={result.geschmack}
            retryEndpoint="/api/analyse/geschmack-retry"
            retryBody={{ analysisId }}
          />
        </>
      )}

      {/* Rezept aus dieser Mahlzeit anlegen (PROJ-32) — bei Komponenten nur "Wie gescannt" */}
      {mealId && (
        <>
          <Separator />
          <RezeptAusMahlzeitButtons mealId={mealId} />
        </>
      )}

      {/* Reset */}
      <Button variant="outline" size="lg" className="w-full" onClick={onReset}>
        Neue Mahlzeit analysieren
      </Button>
    </main>
  )
}
