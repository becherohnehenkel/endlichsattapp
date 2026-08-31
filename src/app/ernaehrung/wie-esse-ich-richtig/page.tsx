import ArtOfEatingGuide from '@/components/art-of-eating-guide'
import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'

// PROJ-19: Fully static content — no auth required, guests can read this page.
export default async function WieEsseIchRichtigPage() {

  return (
    <div className="min-h-screen bg-background">
      <ErnaehrungSubHeader title="Wie esse ich richtig?" />

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6">
        <ArtOfEatingGuide />
      </main>
    </div>
  )
}
