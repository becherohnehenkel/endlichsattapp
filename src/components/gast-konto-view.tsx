import Link from 'next/link'
import { Bookmark, Clock, BarChart3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface GastKontoViewProps {
  reason?: string
}

const VORTEILE = [
  {
    icon: Bookmark,
    title: 'Analysen dauerhaft sichern',
    sub: 'Deine Erkenntnisse gehen nie verloren',
  },
  {
    icon: Clock,
    title: 'Deine Analyse-Historie',
    sub: 'Alle vergangenen Mahlzeiten auf einen Blick',
  },
  {
    icon: BarChart3,
    title: 'Wöchentlicher Sättigungs-Recap',
    sub: 'Muster erkennen, nachhaltig verbessern',
  },
]

export default function GastKontoView({ reason }: GastKontoViewProps) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">endlichsatt</h1>
          <p className="text-sm text-muted-foreground mt-1">Was nach dem Kalorienzählen kommt.</p>
        </div>

        {reason === 'historie' && (
          <div className="rounded-xl bg-[#E8F0EB] px-4 py-3 text-center">
            <p className="text-sm text-[#4A7C59] font-medium">
              Erstelle einen kostenlosen Account um deine Analyse-Historie zu sehen.
            </p>
          </div>
        )}

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <p className="font-semibold">Mit einem Account bekommst du:</p>
              <div className="space-y-4">
                {VORTEILE.map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E8F0EB] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-[#4A7C59]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/registrieren">Kostenlos registrieren</Link>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Bereits einen Account?{' '}
                <Link href="/login" className="text-[#4A7C59] hover:underline font-medium">
                  Einloggen
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground space-x-3">
          <Link href="/impressum" className="hover:underline">Impressum</Link>
          <span>·</span>
          <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
        </p>
      </div>
    </main>
  )
}
