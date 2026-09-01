import { KalorienZaehlenGuide } from '@/components/kalorien-zaehlen-guide'
import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'

// PROJ-19: Fully static content — no auth required, guests can read this page.
export default function KalorienZaehlenPage() {
  return (
    <div className="min-h-screen bg-background">
      <ErnaehrungSubHeader title="Kalorien zählen" />

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6">
        <KalorienZaehlenGuide />
      </main>
    </div>
  )
}
