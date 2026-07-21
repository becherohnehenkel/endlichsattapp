import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function DatenschutzPage() {
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
        <span className="font-semibold text-foreground tracking-tight">Datenschutzerklärung</span>
      </header>

      <main className="max-w-prose mx-auto px-4 py-8 space-y-8 text-sm text-foreground">

        <section className="space-y-2">
          <h1 className="text-xl font-semibold">Datenschutzerklärung</h1>
          <p className="text-muted-foreground leading-relaxed">
            Der Schutz deiner personenbezogenen Daten ist uns wichtig. Diese Erklärung informiert dich darüber, welche Daten wir erheben, wie wir sie nutzen und welche Rechte du hast.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">1. Verantwortlicher</h2>
          <p className="text-muted-foreground leading-relaxed">
            Verantwortlich im Sinne der DSGVO:
          </p>
          <div className="text-muted-foreground space-y-0.5">
            <p>Lukas Beck</p>
            <p>Schulterblatt 122, 20357 Hamburg</p>
            <p>E-Mail: lukas@onlineernaehrungsberater.de</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">2. Welche Daten wir verarbeiten</h2>

          <div className="space-y-1">
            <h3 className="font-medium">Account-Daten</h3>
            <p className="text-muted-foreground leading-relaxed">
              Bei der Registrierung speichern wir deine E-Mail-Adresse, deinen Namen (optional) und dein verschlüsseltes Passwort. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Mahlzeit-Analysen</h3>
            <p className="text-muted-foreground leading-relaxed">
              Für die Kernfunktion der App verarbeitest du Beschreibungen deiner Mahlzeiten (Freitext) und optional Fotos. Diese Daten werden an die KI-Schnittstelle von Anthropic übermittelt, um dir eine Sättigungs-Einschätzung zu geben. Texte und Analyseergebnisse werden dauerhaft gespeichert, solange dein Account besteht. Fotos werden in unserem Dateispeicher abgelegt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Gast-Modus (ohne Account)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Wenn du die App ohne Registrierung nutzt, wird eine anonyme Session-ID erstellt und in deinem Browser gespeichert. Deine Analysen werden dieser anonymen ID zugeordnet. Es werden keine personenbezogenen Daten wie E-Mail oder Name erhoben. Die Daten sind nur auf deinem Gerät zugänglich und gehen verloren, wenn du Cookies und Browser-Daten löschst. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Zahlungsdaten</h3>
            <p className="text-muted-foreground leading-relaxed">
              Zahlungsabwicklung erfolgt über Stripe. Kartendaten werden ausschließlich von Stripe verarbeitet und niemals auf unseren Servern gespeichert. Wir speichern lediglich eine Stripe-Kunden-ID und deinen Abo-Status. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Server-Logs</h3>
            <p className="text-muted-foreground leading-relaxed">
              Unser Hosting-Anbieter Vercel erfasst technische Zugriffsdaten (IP-Adresse, Zeitstempel, aufgerufene URL). Diese Daten werden für maximal 7 Tage gespeichert und dienen der technischen Betriebssicherheit. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">3. Dienstleister und Drittanbieter</h2>
          <p className="text-muted-foreground leading-relaxed">
            Wir nutzen folgende Auftragsverarbeiter. Mit allen haben wir Auftragsverarbeitungsverträge (AVV) abgeschlossen. Soweit Daten in die USA übermittelt werden, erfolgt dies auf Grundlage der EU-Standardvertragsklauseln (SCC).
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border border-border p-3 space-y-1">
              <p className="font-medium">Supabase Inc.</p>
              <p className="text-muted-foreground text-xs">970 Titus Ave Suite 151, Rochester NY 14623, USA</p>
              <p className="text-muted-foreground">Datenbank, Authentifizierung, Datei-Speicher. Deine Account-Daten, Analysen und Fotos werden bei Supabase gespeichert.</p>
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#2E9E6B] hover:underline text-xs">Datenschutz Supabase →</a>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-1">
              <p className="font-medium">Anthropic PBC</p>
              <p className="text-muted-foreground text-xs">548 Market St PMB 90375, San Francisco CA 94104, USA</p>
              <p className="text-muted-foreground">KI-gestützte Analyse deiner Mahlzeiten. Deine Mahlzeit-Beschreibungen und Fotos werden zur Verarbeitung an Anthropic übertragen. Anthropic nutzt diese Daten nicht zum Trainieren von Modellen (API-Nutzungsbedingungen).</p>
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#2E9E6B] hover:underline text-xs">Datenschutz Anthropic →</a>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-1">
              <p className="font-medium">Stripe Inc.</p>
              <p className="text-muted-foreground text-xs">354 Oyster Point Blvd, South San Francisco CA 94080, USA</p>
              <p className="text-muted-foreground">Zahlungsabwicklung für kostenpflichtige Abonnements.</p>
              <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-[#2E9E6B] hover:underline text-xs">Datenschutz Stripe →</a>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-1">
              <p className="font-medium">Vercel Inc.</p>
              <p className="text-muted-foreground text-xs">440 N Barranca Ave #4133, Covina CA 91723, USA</p>
              <p className="text-muted-foreground">Hosting und Auslieferung der Web-App.</p>
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#2E9E6B] hover:underline text-xs">Datenschutz Vercel →</a>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">4. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Wir setzen ausschließlich technisch notwendige Session-Cookies ein, die für die Funktion der App erforderlich sind (Anmeldung, Authentifizierung). Es werden keine Tracking- oder Werbe-Cookies verwendet.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">5. Speicherdauer</h2>
          <p className="text-muted-foreground leading-relaxed">
            Deine Daten werden gespeichert, solange dein Account aktiv ist. Du kannst deinen Account und alle zugehörigen Daten jederzeit unter <strong>Konto → Account löschen</strong> unwiderruflich löschen. Ausgenommen sind gesetzliche Aufbewahrungspflichten (z. B. 10 Jahre für Rechnungsbelege gemäß § 257 HGB).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">6. Deine Rechte</h2>
          <p className="text-muted-foreground leading-relaxed">
            Du hast jederzeit das Recht auf:
          </p>
          <ul className="text-muted-foreground space-y-1 list-disc list-inside">
            <li><strong className="text-foreground">Auskunft</strong> über deine gespeicherten Daten (Art. 15 DSGVO)</li>
            <li><strong className="text-foreground">Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
            <li><strong className="text-foreground">Löschung</strong> deiner Daten (Art. 17 DSGVO)</li>
            <li><strong className="text-foreground">Einschränkung</strong> der Verarbeitung (Art. 18 DSGVO)</li>
            <li><strong className="text-foreground">Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
            <li><strong className="text-foreground">Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Zur Ausübung deiner Rechte wende dich an: lukas@onlineernaehrungsberater.de
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">7. Beschwerderecht</h2>
          <p className="text-muted-foreground leading-relaxed">
            Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Die zuständige Behörde für Hamburg ist der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit (HmbBfDI), Ludwig-Erhard-Str. 22, 20459 Hamburg,{' '}
            <a href="https://www.datenschutz.hamburg.de" target="_blank" rel="noopener noreferrer" className="text-[#2E9E6B] hover:underline">
              www.datenschutz.hamburg.de
            </a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">8. Aktualität</h2>
          <p className="text-muted-foreground leading-relaxed">
            Diese Datenschutzerklärung ist aktuell gültig und wurde zuletzt im Juli 2026 aktualisiert. Bei wesentlichen Änderungen informieren wir registrierte Nutzer per E-Mail.
          </p>
        </section>

        <div className="pt-4 border-t border-border">
          <Link href="/impressum" className="text-[#2E9E6B] hover:underline text-xs">
            → Impressum
          </Link>
        </div>

      </main>
    </div>
  )
}
