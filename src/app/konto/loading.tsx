import { Skeleton } from '@/components/ui/skeleton'

export default function KontoLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-sm mx-auto px-4 py-8 space-y-4">
        {/* Konto-Karte */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
          {/* E-Mail */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-48" />
          </div>

          <Skeleton className="h-px w-full" />

          {/* Status */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>

          <Skeleton className="h-px w-full" />

          {/* Buttons */}
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </main>
    </div>
  )
}
