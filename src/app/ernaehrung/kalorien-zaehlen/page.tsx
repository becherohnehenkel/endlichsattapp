import { ListChecks } from 'lucide-react'
import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'

export default function KalorienZaehlenPage() {
  return (
    <div className="min-h-screen bg-background">
      <ErnaehrungSubHeader title="Kalorien zählen" />

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-16 flex flex-col items-center text-center gap-3">
        <ListChecks className="h-8 w-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">Kalorien zählen</p>
        <p className="text-sm text-muted-foreground">Bald verfügbar.</p>
      </main>
    </div>
  )
}
