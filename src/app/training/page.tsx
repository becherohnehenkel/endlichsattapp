import Link from 'next/link'
import { UserRound, Dumbbell } from 'lucide-react'

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">Training</span>
        <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
          <UserRound className="h-4 w-4" />
        </Link>
      </header>

      <main className="max-w-sm mx-auto px-4 py-16 flex flex-col items-center text-center gap-3">
        <Dumbbell className="h-8 w-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">Training</p>
        <p className="text-sm text-muted-foreground">Bald verfügbar.</p>
      </main>
    </div>
  )
}
