import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'

export default function HistorieLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground w-16">
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </div>
        <span className="font-semibold text-foreground tracking-tight flex-1 text-center">Meine Analysen</span>
        <div className="w-16" />
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full flex-shrink-0" />
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
