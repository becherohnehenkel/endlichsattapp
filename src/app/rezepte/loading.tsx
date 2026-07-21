import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, UserRound } from 'lucide-react'

export default function RezepteLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground w-16">
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </div>
        <span className="font-semibold text-foreground tracking-tight flex-1 text-center">Rezepte</span>
        <div className="w-16 flex justify-end text-muted-foreground p-1.5">
          <UserRound className="h-4 w-4" />
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 space-y-4">
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
