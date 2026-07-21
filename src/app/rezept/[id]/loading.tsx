import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'

export default function RezeptDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
        </div>
        <span className="font-semibold text-foreground tracking-tight">Rezept</span>
        <div className="w-16" />
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* Bild */}
        <Skeleton className="w-full aspect-square rounded-xl" />

        {/* Titel + Meta */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        <Skeleton className="h-px w-full" />

        {/* Zutaten */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        <Skeleton className="h-px w-full" />

        {/* Zubereitung */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>

        <Skeleton className="h-px w-full" />

        {/* Nährwerte */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
