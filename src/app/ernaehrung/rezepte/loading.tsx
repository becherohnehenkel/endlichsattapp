import { Skeleton } from '@/components/ui/skeleton'

// PROJ-36 (Fix): Kein Header mehr hier — die Seite (page.tsx) rendert den Header
// jetzt synchron außerhalb der Suspense-Grenze, damit er nie doppelt im DOM
// landen kann. Dieser Fallback deckt nur noch die kurze Route-Transition ab,
// die eigentliche Lade-Grenze ist der <Suspense> in page.tsx.
export default function RezepteLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6 space-y-4">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Rezept-Grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-2.5 space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
