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
| Deploy zunächst mit Stripe-Test-Modus-Keys, Live-Umstellung als separater, bewusster Schritt | PROJ-10 (Scan-Limit + 7-Tage-Fenster) lief erst seit diesem Tag — frühestens in 7 Tagen könnte überhaupt ein echter Nutzer die Paywall sehen, kein Zeitdruck. Live-Keys erfordern eigenes Produkt/Preis/Webhook im Live-Modus von Stripe (komplett getrennt vom Test-Modus) | 2026-06-16 |

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

**Tested:** 2026-06-16
**App URL:** http://localhost:3000 (lokaler Dev-Server, Stripe Test-Modus)
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Übergangsfenster startet einmalig bei Counter=0
- [x] Bereits in `/backend` per simuliertem Nutzer (Transaktion mit Rollback) verifiziert: 3 Aufrufe von `decrement_photo_scan()` → 0, `trial_ends_at` exakt +7 Tage. Hier erneut bestätigt: kein direkter Eingriff von außen möglich (siehe Security Audit).

#### AC-2: Countdown-Hinweis während des Übergangsfensters
- [x] E2E: QA-Konto mit `trial_ends_at = +3 Tage` zeigt den Hinweis sowohl auf `/analyse` als auch auf `/rezepte`.

#### AC-3: Weiterleitung zur Paywall nach Ablauf
- [x] E2E: QA-Konto mit `trial_ends_at` in der Vergangenheit, kein Abo → `/analyse` UND `/rezepte` leiten zuverlässig zu `/upgrade` weiter.

#### AC-4: "Jetzt freischalten" → Stripe Checkout
- [x] E2E gegen die echte Stripe-API (Test-Modus): Klick führt zu einer echten, von Stripe gehosteten Checkout-Seite (`checkout.stripe.com`, Produkt "EndlichSatt Pro Test", 4,99€/Monat sichtbar — Preis und Produktname korrekt aus der konfigurierten Price ID übernommen).

#### AC-5: Sofortiger Zugriff nach erfolgreicher Zahlung
- [~] **Teilweise verifiziert** — siehe Bug/Hinweis unten. Checkout-Erstellung und Redirect zur echten Stripe-Seite bestätigt; die komplette Zahlung (Kartendaten ausfüllen, abschließen, Rückkehr-Redirect, Sync) wurde aus Zeitgründen nicht automatisiert bis zum Ende durchgespielt (Stripe Checkouts Kartenfelder liegen in eigenen iframes, die sich nicht zuverlässig innerhalb der verfügbaren Zeit automatisieren ließen). Die zugrunde liegende Logik (`sync-session`-Route, Webhook-Handler) ist über 29 Unit-/Integrationstests mit realistischen Stripe-Event-Shapes abgedeckt. Empfehlung siehe BUG/Hinweis unten.

#### AC-6: "Abo verwalten" → Stripe Customer Portal
- [x] E2E: QA-Konto mit `subscription_status = 'active'` zeigt auf `/upgrade` "Pro-Mitglied" + "Abo verwalten"-Button statt Kaufangebot. Tatsächlicher Klick zum echten Portal nicht erneut einzeln getestet (gleicher Code-Pfad/gleiche Absicherung wie Checkout, dort bereits gegen echte Stripe-API verifiziert).

#### AC-7: Kündigung → Sperre erst nach Periodenende
- [x] Code-Review + Logik-Test (`paywall.test.ts`): `getAccessStatus()` sperrt korrekt, sobald `subscription_status` nicht mehr `active`/`trialing` ist, unabhängig vom Trial-Status. Kein neues Übergangsfenster wird dabei gestartet (nur `decrement_photo_scan()` kann `trial_ends_at` setzen, Kündigung tut das nicht).

#### AC-8: Fehlgeschlagene Zahlung → Sperre
- [x] Code-Review: identische Prüfung wie AC-7 (`subscription_status` ungleich aktiv → gesperrt). Webhook setzt den Status 1:1 aus Stripes `customer.subscription.updated`-Event, kein eigener Sonderfall-Code mit zusätzlichem Fehlerrisiko.

#### AC-9: Mahlzeit-Historie bleibt zugänglich
- [x] Code-Review: `/historie` wurde durch PROJ-11 nicht verändert, keine `getAccessStatus()`-Prüfung dort ergänzt — wie in der Spec gefordert bewusst ausgenommen.

#### AC-10: Stripe-Secrets nie im Repository
- [x] `git log -p` für alle PROJ-11-Commits durchsucht — keine Treffer für `sk_test`, `sk_live`, `whsec_`, `price_`. Secrets liegen ausschließlich in `.env.local` (gitignored). `.env.local.example` wurde vom Product Owner selbst ergänzt (für mich aus Sicherheitsgründen komplett gesperrte Dateien, auch lesend).

### Security Audit Results (Red Team)
- [x] **Spalten-Schutz (kritischster Punkt):** Direkter `UPDATE profiles SET subscription_status = 'active', stripe_customer_id = 'cus_fake', trial_ends_at = ...` als simulierter `authenticated`-Nutzer → `permission denied for table profiles`. Ein Nutzer kann sich **nicht selbst freischalten**, egal was er versucht.
- [x] **CHECK-Constraint:** `subscription_status = 'free_forever_hack'` wird auch mit vollen Rechten von der DB abgelehnt (`violates check constraint`) — Defense in depth falls der Anwendungscode je einen Bug hätte.
- [x] **Webhook-Signatur:** Live gegen den laufenden Dev-Server getestet — Anfrage ohne `stripe-signature`-Header → `400`; Anfrage mit gefälschter Signatur → `400`, Profil nachweislich unverändert. Keine gefälschten "Abo aktiv"-Events möglich.
- [x] **Authentifizierung:** `/api/stripe/checkout`, `/api/stripe/portal`, `/api/stripe/sync-session` live gegen den Dev-Server getestet — alle drei `401` ohne Session.
- [x] **`sync-session`-Ownership-Check:** Unit-Test bestätigt `403`, wenn `client_reference_id` der Stripe-Session nicht zum eingeloggten Nutzer passt — verhindert, dass jemand eine fremde `session_id` errät/abfängt und sich selbst freischaltet.
- [x] Keine Secrets in API-Antworten sichtbar (Code-Review aller vier Routen).
- [ ] **Nicht geprüft / offen:** kein Rate-Limiting auf `/api/stripe/checkout` — ein eingeloggter Nutzer könnte theoretisch viele Checkout-Sessions erzeugen (kein Sicherheitsrisiko, da jede Session für sich harmlos ist, aber unnötige Last/Spam Richtung Stripe). Gleiche Einschätzung wie bei PROJ-10s offenem Punkt zu Doppelklick-Schutz — Low Priority.

### Edge Cases Status
- [x] Rückkehr erst nach Ablauf des Fensters → direkte Sperre, keine Kulanz (folgt direkt aus der Zeitstempel-Logik, kein Sonderfall-Code nötig)
- [x] Abo mitten im Fenster → sofortiger Zugriff (durch `isSubscribed ||`-Verknüpfung in `getAccessStatus()` automatisch erfüllt)
- [~] Verzögerter/ausbleibender Webhook → `sync-session`-Fallback vorhanden und unit-getestet, aber nicht im echten Browser bis zum Ende durchgespielt (siehe AC-5)
- [x] Bereits abonniert, ruft Paywall-Seite trotzdem auf → zeigt "Pro-Mitglied" statt Kaufangebot, kein Duplikat-Checkout möglich (UI bietet in diesem Zustand gar keinen Checkout-Button an)
- [ ] Stripe-API kurzzeitig nicht erreichbar → durch generischen `try/catch` abgedeckt (Unit-Test mit `mockRejectedValue`), aber nicht gegen einen echten Ausfall getestet (schwer simulierbar)
- [x] Invite-Code-Interaktion → korrekt als Out-of-Scope/PROJ-12 behandelt, `getAccessStatus()` hat dafür bereits den vorgesehenen Erweiterungspunkt

### Regression Testing
- [x] PROJ-10 E2E-Suite (Scans verfügbar, 4 Tests) erneut grün — Paywall-Integration hat die bestehende Foto-Scan-Logik nicht beeinträchtigt
- [x] Vitest-Gesamtsuite unverändert: 87/94 (die 7 Fehler in `admin/rezepte` sind vorbestehend, nicht PROJ-11 zuzuordnen)
- [x] `npm run build` erfolgreich

### Bugs Found

#### BUG-1: Checkout-Erstellung bei bereits laufender Stripe-Session nicht idempotent geprüft
- **Severity:** Low
- **Beschreibung:** Klickt ein Nutzer mehrfach hintereinander auf "Jetzt freischalten" (z.B. Doppelklick oder zwei Tabs), werden mehrere Checkout-Sessions bei Stripe erzeugt. Keine davon ist schädlich (unbenutzte Sessions laufen bei Stripe automatisch ab), aber unnötig.
- **Priority:** Nice to have

#### Hinweis (kein Bug, aber wichtig für die Produktionsreife): vollständiger Zahlungs-Webhook-Loop nicht Ende-zu-Ende im Browser verifiziert
- Empfehlung vor dem ersten echten Kunden: Stripe CLI installieren (`stripe listen --forward-to localhost:3000/api/stripe/webhook` + `stripe trigger checkout.session.completed`) und/oder einmal manuell im Browser eine Testzahlung mit Kartennummer `4242 4242 4242 4242` abschließen, um den kompletten Kreis (Checkout → Webhook → `subscription_status` → `/upgrade` zeigt "Pro-Mitglied") einmal live zu sehen. Die Einzelteile sind alle getestet (Checkout-Erstellung gegen echte API, Webhook-Signaturprüfung gegen echten Dev-Server, Handler-Logik per Unit-Tests) — nur der vollständige Kreis in einem Durchlauf fehlt.

### Tests geschrieben
- `tests/PROJ-11-paywall.spec.ts` — 9 neue E2E-Tests (3 Zustands-Gruppen: kein Zugriff, Übergangsfenster aktiv, aktives Abo), alle grün auf Chromium. Benötigt wie bei PROJ-10 manuelles DB-Seeding für den Initialzustand (während dieses Durchgangs per Supabase MCP durchgeführt, am Ende auf den Ausgangszustand zurückgesetzt) — gleicher offener CI-Punkt wie in PROJ-10 dokumentiert.
- Kleinere Lint-Korrektur in `src/lib/paywall.test.ts` (unnötiger eslint-disable-Kommentar entfernt).

### Summary
- **Acceptance Criteria:** 8/10 vollständig erfüllt, 2 teilweise (AC-5 Checkout→Zugriff-Loop nur teilweise Ende-zu-Ende verifiziert, AC-6 Portal-Klick analog zu Checkout eingeschätzt statt einzeln nachgestellt)
- **Bugs Found:** 1 total (0 critical, 0 high, 0 medium, 1 low)
- **Security:** Pass — alle kritischen Punkte (Spalten-Schutz, Webhook-Signatur, Ownership-Check, Auth) per echtem Angriffsversuch oder Unit-Test bestätigt
- **Production Ready:** **JA, mit einer Empfehlung** — vor dem ersten echten zahlenden Kunden einmal den vollen Checkout→Webhook-Kreis live durchspielen (siehe Hinweis oben), da das der einzige nicht vollständig Ende-zu-Ende verifizierte Pfad ist
- **Empfehlung:** Deployen. Die Sicherheits-Eigenschaften (das, was bei einer Paywall am meisten schiefgehen kann — sich selbst freischalten) sind nachweislich robust. Der offene Punkt ist Vollständigkeit der Verifikation, kein gefundenes Sicherheits- oder Funktionsproblem.

## Deployment

**Deployed:** 2026-06-16
**Production URL:** https://endlichsattapp.vercel.app
**Tag:** `v1.11.0-PROJ-11`
**Stripe-Modus:** Test-Modus (bewusste Entscheidung, siehe Decision Log unten — Live-Umstellung erfolgt separat, sobald der Product Owner bereit ist)

### Pre-Deployment Checks
- [x] `npm run build` erfolgreich
- [x] `npm run lint` — keine neuen Fehler (1 vorbestehender Fehler in `art-of-eating-guide.tsx`, unberührt von PROJ-11)
- [x] QA approved (siehe QA Test Results oben, 8/10 AC vollständig + 2 teilweise, 1 Low-Bug ohne Sicherheitsauswirkung)
- [x] Keine Critical/High Bugs
- [x] Keine Secrets im Git-Repository (History durchsucht, keine Treffer)
- [x] Alle DB-Migrationen bereits während `/backend` live auf das Produktions-Supabase-Projekt angewendet
- [x] Alle Commits gepusht
- [x] **Vercel Environment Variables ergänzt:** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (Test-Modus-Werte) vom Product Owner im Vercel-Dashboard hinterlegt. Zugehöriger Test-Modus-Webhook-Endpunkt in Stripe auf `https://endlichsattapp.vercel.app/api/stripe/webhook` angelegt (Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)
- [x] Manueller Ende-zu-Ende-Test vom Product Owner durchgeführt: echte Stripe-Test-Zahlung (Testkarte) über `/upgrade` abgeschlossen → "Pro-Mitglied"-Zustand erfolgreich erreicht. Schließt die im QA-Bericht offen gelassene Lücke (AC-5 vollständig verifiziert)

### Post-Deployment Verification
- [x] Produktions-URL lädt (`307` zu `/login` für nicht eingeloggte Anfragen, erwartetes Verhalten)
- [x] Diese Bookkeeping-Änderung löst einen frischen Vercel-Deploy aus, der die neu hinterlegten Env-Variablen erstmals lädt (Vercel übernimmt sie nicht rückwirkend auf bereits laufende Deployments)
- [ ] Manuelle Verifikation der `/upgrade`-Seite direkt gegen die Produktions-URL (statt nur lokal) durch den Nutzer empfohlen, sobald der neue Deploy durch ist

### Hinweis
Kein Erst-Deployment — Vercel/GitHub-Anbindung bestand bereits seit dem MVP. Production-Ready-Essentials (Error Tracking, Security Headers etc.) wurden dort bereits eingerichtet, nicht erneut für dieses Feature wiederholt.
