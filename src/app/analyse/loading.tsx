import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, UserRound } from 'lucide-react'

export default function AnalyseLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground w-24">
          <ChevronLeft className="h-4 w-4" />
          Startseite
        </div>
        <div className="text-muted-foreground p-1.5">
          <UserRound className="h-4 w-4" />
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* Foto-Upload Bereich */}
        <Skeleton className="w-full aspect-video rounded-2xl" />

        {/* Textarea */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>

        {/* Beilagen Kontext */}
        <Skeleton className="h-12 w-full rounded-xl" />

        {/* Submit Button */}
        <Skeleton className="h-12 w-full rounded-xl" />

        {/* Scan-Info */}
        <div className="flex justify-center">
          <Skeleton className="h-3 w-40" />
        </div>
      </main>
    </div>
  )
}
