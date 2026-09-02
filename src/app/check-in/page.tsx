import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { WochenCheckInForm } from '@/components/wochen-check-in-form'

export default function CheckInPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">Check-In</span>
        <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
          <UserRound className="h-4 w-4" />
        </Link>
      </header>

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6">
        <WochenCheckInForm />
      </main>
    </div>
  )
}
