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
          <p className="text-muted-foreground leading-relaxed">
            Mehralsabnehmen ist eine Ernährungs- und Gewichts-Begleitung. Die App ersetzt keine medizinische Beratung, Diagnose oder Behandlung. Bei gesundheitlichen Beschwerden wende dich an eine Ärztin, einen Arzt oder eine andere qualifizierte Fachperson.
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
              Für die Kernfunktion der App verarbeitest du Beschreibungen deiner Mahlzeiten (Freitext) und optional Fotos, sowie deine Antworten auf eventuelle Rückfragen der KI zur genaueren Einschätzung. Diese Daten werden an die KI-Schnittstelle von Anthropic übermittelt, um dir eine Sättigungs-Einschätzung zu geben. Texte, Rückfrage-Antworten und Analyseergebnisse werden dauerhaft gespeichert, solange dein Account besteht. Fotos werden in unserem Dateispeicher abgelegt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Eigene Rezepte</h3>
            <p className="text-muted-foreground leading-relaxed">
              Rezepte, die du selbst anlegst oder aus einer analysierten Mahlzeit erstellst (inklusive Zutaten und Zubereitungsschritten), werden deinem Account zugeordnet gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Trainingseinheiten</h3>
            <p className="text-muted-foreground leading-relaxed">
              Wenn du Trainingseinheiten protokollierst (z. B. Gewicht, Wiederholungen oder Widerstand pro Übung), speichern wir diese Einträge deinem Account zugeordnet, damit du deinen Verlauf einsehen kannst. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Gewichts- und Ernährungsziel-Daten (Kalorien-Rechner)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Wenn du den Kalorien-Rechner nutzt, gibst du freiwillig dein Gewicht, deine Größe, dein Alter, dein Geschlecht, dein Aktivitätslevel und dein Kalorienziel an. Diese Angaben werden verwendet, um dir eine persönliche Kalorien-Empfehlung zu berechnen. Wir behandeln diese Angaben als besondere Kategorie personenbezogener Daten (Art. 9 DSGVO) und verarbeiten sie nur, nachdem du dazu ausdrücklich und gesondert eingewilligt hast (Art. 9 Abs. 2 lit. a DSGVO). Ohne diese Einwilligung ist der Kalorien-Rechner nicht nutzbar. Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen (siehe Abschnitt 7).
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Wochen-Check-In</h3>
            <p className="text-muted-foreground leading-relaxed">
              Im wöchentlichen Check-In machst du freiwillige Angaben zu Schlaf, Screentime, Energielevel, wie sehr du auf deine Ernährung geachtet hast, wie leicht dir bewusstes Essen fiel, deiner Bereitschaft ohne Kalorien-Tracking auszukommen, deiner Trainingshäufigkeit sowie optionalen Freitext-Reflexionen. Wie beim Kalorien-Rechner behandeln wir diese Angaben als besondere Kategorie personenbezogener Daten (Art. 9 DSGVO) und verarbeiten sie nur nach deiner ausdrücklichen, gesonderten Einwilligung (Art. 9 Abs. 2 lit. a DSGVO). Ohne diese Einwilligung ist der Wochen-Check-In nicht nutzbar.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Fehler-Feedback zu KI-Ergebnissen</h3>
            <p className="text-muted-foreground leading-relaxed">
              Wenn du eine Analyse als fehlerhaft meldest, speichern wir deine Rückmeldung zusammen mit der betroffenen Analyse, um unsere KI-Auswertung zu verbessern. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Qualitätsverbesserung).
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Einladungscodes</h3>
            <p className="text-muted-foreground leading-relaxed">
              Wenn du einen Einladungscode einlöst, speichern wir dies deinem Account zugeordnet, inklusive erfolgloser Versuche zur Missbrauchsprävention (z. B. gegen automatisiertes Durchprobieren). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Missbrauchsschutz).
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

        <section className="space-y-2">
          <h2 className="font-semibold">3. Besondere Kategorien personenbezogener Daten</h2>
          <p className="text-muted-foreground leading-relaxed">
            Gewicht, Größe, Alter, Geschlecht, Kalorienziel sowie deine Angaben im Wochen-Check-In (u. a. Schlaf, Energielevel) behandeln wir als besondere Kategorie personenbezogener Daten im Sinne von Art. 9 DSGVO. Wir verarbeiten diese Daten ausschließlich auf Grundlage deiner ausdrücklichen, gesonderten Einwilligung (Art. 9 Abs. 2 lit. a DSGVO), die du separat von dieser Datenschutzerklärung abgibst — entweder bei der Registrierung oder beim ersten Aufruf des Kalorien-Rechners bzw. Wochen-Check-Ins. Ohne diese Einwilligung sind die betroffenen Funktionen nicht nutzbar. Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO); bereits gespeicherte Daten werden dadurch nicht automatisch gelöscht, du kannst sie aber jederzeit selbst über die Konto-Löschung entfernen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">4. Dienstleister und Drittanbieter</h2>
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

            <div className="rounded-lg border border-border p-3 space-y-1">
              <p className="font-medium">Open Food Facts</p>
              <p className="text-muted-foreground text-xs">Open Food Facts Association, Frankreich</p>
              <p className="text-muted-foreground">Bei der Zutatensuche im Rezept-Editor wird ausschließlich dein eingegebener Suchbegriff (z. B. ein Lebensmittelname) an die öffentliche, gemeinnützige Datenbank Open Food Facts übermittelt. Es werden keine personenbezogenen Daten übertragen.</p>
              <a href="https://world.openfoodfacts.org/privacy" target="_blank" rel="noopener noreferrer" className="text-[#2E9E6B] hover:underline text-xs">Datenschutz Open Food Facts →</a>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Schriftarten:</strong> Wir verwenden die Schriftart &bdquo;Inter&ldquo; von Google Fonts. Sie wird beim Erstellen der App automatisch selbst auf unseren eigenen Servern eingebunden (Self-Hosting) — beim Aufruf der App wird zu keinem Zeitpunkt eine Verbindung zu Google-Servern hergestellt.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">5. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Wir setzen ausschließlich technisch notwendige Session-Cookies ein, die für die Funktion der App erforderlich sind (Anmeldung, Authentifizierung). Es werden keine Tracking- oder Werbe-Cookies verwendet.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">6. Speicherdauer</h2>
          <p className="text-muted-foreground leading-relaxed">
            Deine Daten werden gespeichert, solange dein Account aktiv ist. Du kannst deinen Account und alle zugehörigen Daten jederzeit unter <strong>Konto → Account löschen</strong> unwiderruflich löschen. Ausgenommen sind gesetzliche Aufbewahrungspflichten (z. B. 10 Jahre für Rechnungsbelege gemäß § 257 HGB).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">7. Deine Rechte</h2>
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
            <li><strong className="text-foreground">Widerruf deiner Einwilligung</strong> für Gewichts-/Ernährungsziel- und Check-In-Daten mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Zur Ausübung deiner Rechte wende dich an: lukas@onlineernaehrungsberater.de
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">8. Beschwerderecht</h2>
          <p className="text-muted-foreground leading-relaxed">
            Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Die zuständige Behörde für Hamburg ist der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit (HmbBfDI), Ludwig-Erhard-Str. 22, 20459 Hamburg,{' '}
            <a href="https://www.datenschutz.hamburg.de" target="_blank" rel="noopener noreferrer" className="text-[#2E9E6B] hover:underline">
              www.datenschutz.hamburg.de
            </a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">9. Aktualität</h2>
          <p className="text-muted-foreground leading-relaxed">
            Diese Datenschutzerklärung ist aktuell gültig und wurde zuletzt im September 2026 aktualisiert. Bei wesentlichen Änderungen informieren wir registrierte Nutzer per E-Mail.
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
