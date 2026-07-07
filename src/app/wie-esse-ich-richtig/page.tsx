import ArtOfEatingGuide from '@/components/art-of-eating-guide'
import BackButton from './back-button'

// PROJ-19: Fully static content — no auth required, guests can read this page.
export default async function WieEsseIchRichtigPage() {

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <BackButton />
        <span className="font-semibold text-foreground tracking-tight">Wie esse ich richtig?</span>
        <div className="w-16" />
      </header>

      <main className="max-w-sm mx-auto px-4 py-6">
        <ArtOfEatingGuide />
      </main>
    </div>
  )
}
