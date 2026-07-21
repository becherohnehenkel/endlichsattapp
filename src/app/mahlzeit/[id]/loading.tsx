import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'

export default function MahlzeitDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </div>
        <Skeleton className="h-4 w-24" />
        <div className="w-16" />
      </header>

      <main className="px-4 py-6 max-w-sm mx-auto space-y-6">
        {/* Annahmen-Collapsible */}
        <Skeleton className="h-10 w-full rounded-lg" />

        {/* Gesamtbewertung */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </div>

        {/* 6 Bausteine */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-5 w-14 rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Verbesserungsvorschläge */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-44" />
          {[1, 2].map(i => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>

        {/* Nährwerte */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <Skeleton className="h-11 w-full rounded-xl" />
      </main>
    </div>
  )
}
