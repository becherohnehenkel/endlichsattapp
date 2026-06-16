# PROJ-11: Paywall

## Status: Planned
**Created:** 2026-06-16
**Last Updated:** 2026-06-16

## Dependencies
- PROJ-1 (Supabase Infrastructure) — Subscription-Status auf dem Profil
- PROJ-2 (User Authentication) — Paywall ist an den eingeloggten Nutzer gebunden
- PROJ-10 (Foto-Scan-Limit) — der Foto-Scan-Counter ist der Auslöser für das Übergangsfenster; diese Spec **revidiert** PROJ-10s Entscheidung "Freitext-Analyse ist für immer unbegrenzt"
- PROJ-8 (Rezeptbibliothek) — Zugriff auf die Rezeptbibliothek wird nach Ablauf des Übergangsfensters ebenfalls gesperrt

## User Stories
- Als Nutzer, der seine 3 kostenlosen Foto-Scans aufgebraucht hat, möchte ich noch 7 Tage lang Freitext-Analyse und Rezepte nutzen können, damit ich die App in Ruhe weiter ausprobieren kann, bevor ich mich entscheiden muss.
- Als Nutzer möchte ich während dieser 7 Tage sehen, wie viel Zeit mir noch bleibt, damit ich nicht überrascht werde.
- Als Nutzer möchte ich nach Ablauf der 7 Tage über ein günstiges Monats-Abo (4,99€) weiterhin vollen Zugriff bekommen können.
- Als Nutzer möchte ich meine bereits erstellten Analysen (Mahlzeit-Historie) jederzeit einsehen können, auch wenn mein Zugriff sonst gesperrt ist.
- Als Nutzer möchte ich mein Abo jederzeit selbst über eine vertraute, sichere Oberfläche verwalten oder kündigen können, ohne dafür eine E-Mail schreiben zu müssen.
- Als Product Owner möchte ich, dass Stripe-Schlüssel niemals im Code oder in Git landen, damit kein Dritter Zugriff auf die Zahlungsintegration bekommen kann.

## Out of Scope
- Invite-Codes als Bypass-Mechanismus — _eigene Spec, PROJ-12_
- Admin-Oberfläche zur Code-Generierung — _eigene Spec, PROJ-13_
- Mehrere Preisstufen oder ein Jahresabo — spätere Erweiterung; die Architektur lässt das zu (Stripe Price ID ist konfigurierbar, nicht hartcodiert), wird aber jetzt nicht gebaut
- Granulares Pro-Feature-Berechtigungssystem (z.B. unterschiedliche Tiers mit unterschiedlichen Feature-Sets) — bewusst nicht vorgebaut, ein einfaches `subscription_status`-Flag reicht für den aktuellen Bedarf
- Sperrung der Mahlzeit-Historie — bewusst ausgeschlossen, Historie bleibt immer zugänglich
- Eigenes Zahlungsformular (Stripe Elements/Custom Checkout) — Stripe Checkout (gehostet) gewählt
- Eigene Abo-Verwaltungsoberfläche (Kündigen, Zahlungsmethode ändern) — Stripe Customer Portal (gehostet) gewählt
- Stripes natives `trial_period_days`-Feature auf der Subscription — das 7-Tage-Übergangsfenster ist eine eigene, anwendungsseitige Phase (Timestamp auf dem Profil), keine Stripe-Subscription-Trial, da sie erst nach Verbrauch der Foto-Scans beginnt und nicht bei Registrierung

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ein Nutzer verbraucht seinen letzten Foto-Scan (Counter erreicht 0), wenn das zum ersten Mal passiert, dann wird ein 7-tägiges Übergangsfenster ab diesem Zeitpunkt gestartet und auf dem Profil gespeichert
- [ ] Angenommen ein Nutzer befindet sich innerhalb des 7-Tage-Fensters, wenn er die Mahlzeit-Eingabeseite oder die Rezeptbibliothek aufruft, dann sieht er einen dezenten Hinweis wie viele Tage ihm noch verbleiben
- [ ] Angenommen das 7-Tage-Fenster ist abgelaufen und der Nutzer hat kein aktives Abo und keinen eingelösten Code, wenn er eine Freitext-Analyse starten oder die Rezeptbibliothek öffnen möchte, dann wird er auf eine eigene Paywall-Seite weitergeleitet
- [ ] Angenommen ein Nutzer befindet sich auf der Paywall-Seite, wenn er auf "Jetzt freischalten" klickt, dann wird er zu einer von Stripe gehosteten Checkout-Seite weitergeleitet
- [ ] Angenommen ein Nutzer schließt die Zahlung über Stripe Checkout erfolgreich ab, wenn er zur App zurückkehrt, dann hat er sofort wieder vollen Zugriff auf Freitext-Analyse und Rezeptbibliothek
- [ ] Angenommen ein Nutzer hat ein aktives Abo, wenn er auf "Abo verwalten" klickt, dann wird er zum Stripe Customer Portal weitergeleitet
- [ ] Angenommen ein Nutzer kündigt sein Abo im Customer Portal, wenn die aktuelle Abrechnungsperiode endet, dann verliert er den Zugriff auf Freitext-Analyse und Rezeptbibliothek (kein neues 7-Tage-Fenster wird gestartet)
- [ ] Angenommen eine Zahlung schlägt nach Stripes automatischen Wiederholungsversuchen endgültig fehl, wenn der Stripe-Subscription-Status dadurch nicht mehr "active"/"trialing" ist, dann wird der Zugriff gesperrt
- [ ] Angenommen ein Nutzer hat bereits Mahlzeiten analysiert, wenn sein Zugriff gesperrt wird, dann kann er trotzdem weiterhin alle bisherigen Analysen in der Mahlzeit-Historie einsehen
- [ ] Angenommen der Code wird committet/gepusht, wenn das passiert, dann landen die Stripe-Secrets (Secret Key, Webhook-Signing-Secret) nie im Git-Repository — nur als Server-seitige Env-Variablen, dokumentiert in `.env.local.example` mit Dummy-Werten

## Edge Cases
- Nutzer kehrt erst am Tag 10 zurück (nach Ablauf der 7 Tage) — sieht direkt die Paywall-Seite, kein nachträgliches Gewähren von Restzeit
- Nutzer abonniert mitten im Übergangsfenster (z.B. Tag 3) — bekommt sofort vollen Zugriff, das restliche Übergangsfenster wird irrelevant
- Stripe-Webhook trifft verzögert oder gar nicht ein, nachdem der Nutzer erfolgreich bei Stripe Checkout bezahlt hat — Nutzer darf nicht dauerhaft auf der Paywall-Seite hängen bleiben, nur weil der Webhook noch nicht verarbeitet wurde
- Nutzer hat bereits ein aktives Abo, ruft aber trotzdem die Paywall-Seite auf — sollte nicht versehentlich eine zweite Checkout-Session/Zahlung auslösen können
- Stripe-API ist kurzzeitig nicht erreichbar, während eine Checkout-Session erstellt werden soll — generische Fehlermeldung, kein App-Absturz
- Nutzer löst während des Übergangsfensters einen Invite-Code ein (PROJ-12) — Paywall-Sperre greift danach gar nicht mehr, unabhängig vom Ablaufdatum des Fensters

## Technical Requirements (optional)
- Sicherheit: `STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET` ausschließlich als serverseitige Env-Variablen (kein `NEXT_PUBLIC_`-Präfix), niemals im Code hartcodiert, niemals committet
- Webhook-Endpunkt muss die Stripe-Signatur verifizieren, bevor ein Event verarbeitet wird
- Preis (4,99€) ist über eine Stripe Price ID konfigurierbar, nicht im Code hartcodiert — spätere Preisänderungen erfordern keinen Code-Deploy

## Open Questions
- [ ] Genauer Formulierungstext für den Countdown-Hinweis — Detail für `/frontend`

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Paywall greift erst nach Verbrauch der 3 kostenlosen Foto-Scans, nicht direkt nach Registrierung | Nutzer soll die App erst kennenlernen können, bevor eine Kaufentscheidung gefordert wird | 2026-06-16 |
| 7-tägiges Übergangsfenster nach Scan-Limit, danach Sperre von Freitext-Analyse + Rezeptbibliothek | Revidiert PROJ-10s "Freitext immer unbegrenzt" bewusst — gibt dem Nutzer eine faire Übergangsphase statt einer harten Sperre direkt bei 0 Scans | 2026-06-16 |
| Mahlzeit-Historie bleibt von der Sperre ausgenommen | Eigene, bereits erstellte Daten einzusehen fühlt sich nicht wie eine zusätzliche Leistung an, sondern wie Besitz — Sperre dort wäre Datenverlust-Gefühl statt Kaufanreiz | 2026-06-16 |
| Einfaches `subscription_status`-Flag statt granularem Pro-Feature-Berechtigungssystem | Aktuell gibt es nur einen gegateten Bereich (Freitext + Rezepte); ein Tier-System wäre spekulative Architektur ohne aktuellen Bedarf, lässt sich aber ohne Umbau später ergänzen | 2026-06-16 |
| Preis: 4,99€/Monat, Stripe Checkout (gehostet) statt eigenem Formular | Niedrige Einstiegshürde; Stripe übernimmt PCI-Compliance komplett, deutlich weniger Code und Sicherheitsverantwortung für eine Solo-Entwickler-App | 2026-06-16 |
| Abo-Verwaltung über Stripe Customer Portal statt eigener UI | Kündigung, Zahlungsmethode, Rechnungen — alles von Stripe gehostet, kein eigener Code nötig | 2026-06-16 |
| Kündigung: Zugriff bis Ende der Abrechnungsperiode, danach Sperre ohne neuen Trial | Entspricht Stripes Standardverhalten, kein Sonderfall-Code nötig — einfach prüfen ob Subscription-Status aktiv ist | 2026-06-16 |
| Kein Stripe-natives Trial — eigenes Übergangsfenster-Feld auf dem Profil | Stripe-Trials sind an die Subscription-Erstellung gekoppelt; unser Fenster beginnt aber beim Scan-Verbrauch, lange bevor überhaupt eine Subscription existiert | 2026-06-16 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Zugriffsprüfung direkt in den Server Components (`AnalysePage`, `RezeptePage`) über eine gemeinsame Prüf-Funktion, statt dupliziert | Etabliertes Muster (wie `requireAdmin()` aus PROJ-9); eine Stelle für die Zugriffslogik statt zwei | 2026-06-16 |
| `subscription_status` wird ausschließlich über den Stripe-Webhook aktualisiert, nie direkt nach dem Checkout-Redirect | Der Webhook ist signiert und kommt direkt von Stripe — ein Client-Redirect ließe sich fälschen oder wiederholen | 2026-06-16 |
| Zusätzliche direkte Session-Prüfung beim Rückkehr-Redirect von Checkout (ergänzend zum Webhook) | Löst die Webhook-Verzögerung (offene Frage aus der Spec), ohne der Browser-Antwort blind zu vertrauen — Session-ID wird live bei Stripe nachgefragt | 2026-06-16 |
| Stripe Node-SDK (`stripe`-Paket) nur serverseitig, kein `@stripe/stripe-js` im Browser | Checkout läuft komplett über Redirect zu einer von Stripe gehosteten URL — kleinere Angriffsfläche, weniger Code | 2026-06-16 |
| `trial_ends_at` wird einmalig gesetzt, nie zurückgesetzt | Verhindert mehrfache Übergangsfenster durch wiederholtes Verbrauchen des Foto-Scan-Counters | 2026-06-16 |
| Seitenpfad `/upgrade` für die Paywall-Seite | Klar, kurz, eindeutig | 2026-06-16 |
| `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_PRICE_ID` ausschließlich als Server-Env-Variablen, kein `NEXT_PUBLIC_`-Präfix | Secrets dürfen nie im Browser sichtbar oder im Git-Repository landen — lokal in `.env.local` (gitignored), produktiv im Vercel-Dashboard | 2026-06-16 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponentenstruktur

```
AnalysePage (Server Component) — bereits PROJ-10-gated
+-- NEU: zusätzliche Zugriffsprüfung (Trial aktiv? Abo aktiv? Code eingelöst?)
+-- Gesperrt -> Weiterleitung zu /upgrade
+-- Im Übergangsfenster -> Countdown-Hinweis zusätzlich zum Foto-Scan-Hinweis

RezeptePage (Server Component) — bisher offen für alle eingeloggten Nutzer
+-- NEU: gleiche Zugriffsprüfung wie AnalysePage
+-- Gesperrt -> Weiterleitung zu /upgrade
+-- Im Übergangsfenster -> Countdown-Hinweis oben auf der Seite

/upgrade (NEU — Paywall-Seite)
+-- Erklärtext + Preis + "Jetzt freischalten" -> Stripe Checkout
+-- Hat der Nutzer bereits ein Abo: "Abo verwalten" -> Stripe Customer Portal
+-- Platz für "Ich habe einen Code"-Link (Funktion kommt mit PROJ-12)

Webhook-Endpunkt (NEU, API-Route)
+-- Empfängt Stripe-Events direkt von Stripe, aktualisiert den Abo-Status
```

### Datenmodell (in Worten)

```
profiles (bestehende Tabelle)
+ trial_ends_at — Zeitstempel, wird EINMALIG gesetzt wenn der Foto-Scan-Counter
  zum ersten Mal 0 erreicht ("jetzt + 7 Tage"), danach nie mehr verändert
+ stripe_customer_id — Referenz auf den Kunden in Stripe, leer bis zur ersten Zahlung
+ subscription_status — z.B. "active"/"canceled"/"past_due", leer = kein Abo.
  Wird AUSSCHLIESSLICH über den Stripe-Webhook aktualisiert, nie direkt vom Client

Zugriff auf Freitext-Analyse + Rezeptbibliothek ist erlaubt, wenn EINES zutrifft:
  - photo_scans_remaining > 0, ODER
  - trial_ends_at ist leer oder liegt noch in der Zukunft, ODER
  - subscription_status ist "active"/"trialing", ODER
  - ein gültiger Invite-Code wurde eingelöst (Datenmodell folgt mit PROJ-12)
Sonst: Weiterleitung zur Paywall-Seite
```

### API-Verhalten

- **`POST /api/stripe/checkout`** — erstellt eine Checkout-Session für den eingeloggten Nutzer, gibt die Stripe-URL zurück
- **`POST /api/stripe/portal`** — erstellt einen Customer-Portal-Link (nur wenn bereits `stripe_customer_id` existiert)
- **`POST /api/stripe/webhook`** — empfängt Events direkt von Stripe (nicht vom Browser), verifiziert die Signatur, aktualisiert `subscription_status`
- **Webhook-Fallback:** Beim Rückkehr-Redirect von Checkout wird die Session zusätzlich direkt bei Stripe nachgefragt, damit der Nutzer nicht auf einen verzögerten Webhook warten muss

### Sicherer Workflow für die Stripe-Keys

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` — ausschließlich Server-Env-Variablen, niemals `NEXT_PUBLIC_`-Präfix
- Lokal in `.env.local` (bereits gitignored, vom Product Owner bereits mit Test-Mode-Werten befüllt), in Produktion direkt im Vercel-Dashboard eintragen
- `.env.local.example` bekommt die drei Variablennamen mit Dummy-Werten dokumentiert
- Der Webhook verifiziert jede Anfrage mit `STRIPE_WEBHOOK_SECRET` — gefälschte "Abo aktiv"-Events sind dadurch nicht möglich
- Webhook-Secret und Live-Mode-Keys folgen erst kurz vor dem Deployment (Webhook-Endpunkt muss erst existieren, bevor er in Stripe registriert werden kann)

### Dependencies (Pakete)
- `stripe` — offizielles Node-SDK (serverseitig)

## Implementation Notes (Backend)

**Migration (Supabase, angewendet):**
- `add_paywall_fields_to_profiles` — neue Spalten `trial_ends_at`, `stripe_customer_id` (UNIQUE), `subscription_status` (CHECK auf gültige Stripe-Statuswerte) auf `profiles`. Tabellen-weites `UPDATE` für `authenticated`/`anon` war bereits in PROJ-10 entzogen — neue Spalten sind dadurch automatisch ohne weiteres `REVOKE` vor Client-Manipulation geschützt (per `information_schema.column_privileges` verifiziert: nur `SELECT`/`INSERT`/`REFERENCES`, kein `UPDATE`).
- `decrement_photo_scan()` (PROJ-10) erweitert: setzt `trial_ends_at` einmalig auf "jetzt + 7 Tage", wenn der Counter durch dasselbe atomare Update auf 0 fällt und noch kein Fenster existiert — bleibt eine einzige Operation, kein Race-Condition-Risiko. Per simuliertem Nutzer (Transaktion mit Rollback) verifiziert: 3 Aufrufe → 0, `trial_ends_at` exakt +7 Tage gesetzt.

**Code:**
- `src/lib/stripe.ts` — server-only Stripe-Client (`STRIPE_SECRET_KEY`)
- `src/lib/paywall.ts` — `getAccessStatus(supabase, userId)`: zentrale Zugriffsprüfung (aktives Abo ODER noch Foto-Scans übrig ODER Übergangsfenster läuft), liefert auch `trialDaysRemaining` für den Countdown-Hinweis. PROJ-12 ergänzt hier später die Invite-Code-Bedingung.
- `src/app/api/stripe/checkout/route.ts` — erstellt Checkout-Session (Subscription-Modus), nutzt vorhandene `stripe_customer_id` falls vorhanden statt einen Duplikat-Kunden anzulegen
- `src/app/api/stripe/portal/route.ts` — erstellt Customer-Portal-Link, `404` falls kein Abo vorhanden
- `src/app/api/stripe/webhook/route.ts` — verifiziert Signatur mit `STRIPE_WEBHOOK_SECRET`, verarbeitet `checkout.session.completed`, `customer.subscription.updated`/`.deleted` (Admin-Client, da kein Nutzer-Session-Kontext bei einem Webhook)
- `src/app/api/stripe/sync-session/route.ts` — Webhook-Fallback: fragt die Checkout-Session beim Rückkehr-Redirect direkt bei Stripe nach (nicht der Browser-URL vertrauen), Sicherheitscheck dass `client_reference_id` zum eingeloggten Nutzer passt (403 sonst)
- `src/types/database.ts` — `profiles`-Typen ergänzt
- `src/lib/env.ts` — `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_PRICE_ID` zu `serverOnly` ergänzt

**Tests:** 29 neue Tests (4 Routen + `paywall.ts`-Unit-Tests), alle grün. Bestehende Suite unverändert (87/94 — die 7 Fehler in `admin/rezepte` sind vorbestehend, nicht PROJ-11). `npm run build` erfolgreich.

**Sicherheits-Hinweis:** Konnte `.env.local.example` nicht selbst aktualisieren — `.env*`-Dateien sind für mich aus Sicherheitsgründen komplett gesperrt (auch lesend). Der Product Owner hat die drei Variablennamen bereits selbst in `.env.local`/`.env.local.example` ergänzt.

**Bewusst nicht umgesetzt (gehört zu `/frontend`):**
- `/upgrade`-Seite (Paywall-UI, Checkout-Button, Customer-Portal-Link, "Ich habe einen Code"-Platzhalter für PROJ-12)
- Einbindung von `getAccessStatus()` in `AnalysePage`/`RezeptePage` inkl. Redirect bei fehlendem Zugriff
- Countdown-Hinweis-UI während des Übergangsfensters

## Implementation Notes (Frontend)

- `src/app/upgrade/page.tsx` (NEU) — liest `getAccessStatus()`, übergibt `subscriptionStatus` und den `?session_id`-Query-Parameter (Rückkehr von Checkout) an `UpgradeView`
- `src/components/upgrade-view.tsx` (NEU, Client Component):
  - bei vorhandener `session_id`: ruft `POST /api/stripe/sync-session` auf (Webhook-Fallback), zeigt währenddessen "Zahlung wird bestätigt…"
  - Abo aktiv (`active`/`trialing`) → "Du bist Pro-Mitglied" + "Abo verwalten" (`POST /api/stripe/portal`) + Link zurück zu `/analyse`
  - kein Abo → Preis (4,99€/Monat), "Jetzt freischalten" (`POST /api/stripe/checkout`), dezenter Hinweis dass Einladungscodes noch folgen (PROJ-12, bewusst kein nicht-funktionales Eingabefeld)
- `src/app/analyse/page.tsx` — ruft zusätzlich `getAccessStatus()` auf, `redirect('/upgrade')` wenn `!hasAccess`; reicht `trialDaysRemaining` an `MahlzeitInput` weiter
- `src/app/rezepte/page.tsx` — gleiche Zugriffsprüfung + Redirect; zeigt den Countdown-Hinweis direkt im Server Component oberhalb von `RezeptBibliothek` (kein neuer Prop nötig, da statischer Server-berechneter Wert); `redirect('/login')` um `redirectTo=/rezepte` ergänzt (war vorher ohne, kleine konsistente Verbesserung)
- `src/components/mahlzeit-input.tsx` — neue Prop `trialDaysRemaining`; der bestehende "Foto-Scans aufgebraucht"-Hinweis (PROJ-10) wurde korrigiert (behauptete vorher fälschlich "Freitext bleibt unbegrenzt verfügbar" — das gilt seit PROJ-11 nicht mehr) und zeigt jetzt den Countdown, wenn ein Übergangsfenster läuft
- Verifiziert: `npm run build` erfolgreich, Vitest unverändert (87/94, vorbestehende Fehler unberührt), PROJ-10-E2E-Suite (beide Test-Gruppen, inkl. erneutem Seed auf 0 Scans) weiterhin grün — keine Regression durch die Paywall-Integration

**Bewusst nicht umgesetzt (gehört zu `/qa` bzw. PROJ-12):**
- E2E-Tests für PROJ-11 selbst (neue `/upgrade`-Seite, Redirect-Verhalten von `/analyse`/`/rezepte`)
- Tatsächliche Einladungscode-Eingabe (PROJ-12)
- Aufruf von `/api/stripe/sync-session` beim Rückkehr-Redirect (`?session_id=...`) von der `/upgrade`-Seite

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
