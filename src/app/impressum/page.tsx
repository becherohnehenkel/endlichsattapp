import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </Link>
        <span className="font-semibold text-foreground tracking-tight">Impressum</span>
      </header>

      <main className="max-w-prose mx-auto px-4 py-8 space-y-8 text-sm text-foreground">

        <section className="space-y-1">
          <h1 className="text-xl font-semibold">Impressum</h1>
          <p className="text-muted-foreground text-xs">Angaben gemäß § 5 TMG</p>
        </section>

        <section className="space-y-1">
          <h2 className="font-semibold">Anbieter</h2>
          <p>Lukas Beck</p>
          <p>Schulterblatt 122</p>
          <p>20357 Hamburg</p>
        </section>

        <section className="space-y-1">
          <h2 className="font-semibold">Kontakt</h2>
          <p>Telefon: +49 (0) 173 347 0405</p>
          <p>
            E-Mail:{' '}
            <a
              href="mailto:lukas@onlineernaehrungsberater.de"
              className="text-[#2E9E6B] hover:underline"
            >
              lukas@onlineernaehrungsberater.de
            </a>
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="font-semibold">Umsatzsteuer-Identifikationsnummer</h2>
          <p>
            Gemäß § 27 a Umsatzsteuergesetz: DE 428402078
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="font-semibold">Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)</h2>
          <p>Lukas Beck</p>
          <p>Schulterblatt 122</p>
          <p>20357 Hamburg</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">EU-Streitschlichtung</h2>
          <p className="text-muted-foreground leading-relaxed">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2E9E6B] hover:underline"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <div className="pt-4 border-t border-border">
          <Link href="/datenschutz" className="text-[#2E9E6B] hover:underline text-xs">
            → Datenschutzerklärung
          </Link>
        </div>

      </main>
    </div>
  )
}
