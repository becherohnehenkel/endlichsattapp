import { Calculator } from 'lucide-react'
import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'

export default function SoGehtAbnehmenPage() {
  return (
    <div className="min-h-screen bg-background">
      <ErnaehrungSubHeader title="So geht abnehmen" />

      <main className="max-w-sm mx-auto px-4 py-16 flex flex-col items-center text-center gap-3">
        <Calculator className="h-8 w-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">So geht abnehmen</p>
        <p className="text-sm text-muted-foreground">Bald verfügbar.</p>
      </main>
    </div>
  )
}
