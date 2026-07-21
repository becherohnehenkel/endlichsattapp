import { Skeleton } from '@/components/ui/skeleton'
import { UserRound } from 'lucide-react'

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">endlichsatt</span>
        <div className="text-muted-foreground p-1.5">
          <UserRound className="h-4 w-4" />
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 pb-10 space-y-8">

        {/* Hero */}
        <section className="pt-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </section>

        {/* Letzte Analysen */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* Sättigungs-Matrix Teaser */}
        <Skeleton className="h-20 w-full rounded-2xl" />

        {/* Rezeptbibliothek */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-2.5 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </section>

      </main>
    </div>
  )
}
