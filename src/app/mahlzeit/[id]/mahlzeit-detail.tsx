'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import SaettigungsErgebnis, { type AnalysisResult } from '@/components/saettigungs-ergebnis'

interface MahlzeitDetailProps {
  result: AnalysisResult
  assumptions: string[]
}

export default function MahlzeitDetail({ result, assumptions }: MahlzeitDetailProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </button>
        <span className="font-semibold text-foreground tracking-tight">endlichsatt</span>
        <div className="w-16" />
      </header>
      <SaettigungsErgebnis
        result={result}
        assumptions={assumptions}
        onReset={() => router.push('/analyse')}
      />
    </div>
  )
}
