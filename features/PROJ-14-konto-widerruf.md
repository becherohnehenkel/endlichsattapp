# PROJ-14: Kontoübersicht & Widerrufsbutton

## Status: In Progress
**Created:** 2026-06-18
**Last Updated:** 2026-06-18

## Implementation Notes

### Frontend (Done)
- `src/app/konto/page.tsx` — Server Page: lädt Auth-User, `getAccessStatus()`, Stripe-Subscription parallel; leitet zu `/login` weiter wenn nicht eingeloggt
- `src/components/konto-view.tsx` — Client Component: Status-Badge, Abo-Details (Preis + nächstes Zahlungsdatum), Widerrufsbutton, WiderrufDialog (shadcn AlertDialog), Abo-verwalten-Button (→ Stripe Portal), Abmelden, Admin-Link
- `src/app/analyse/page.tsx`, `src/app/rezepte/page.tsx`, `src/app/upgrade/page.tsx`, `src/app/page.tsx` — Abmelden-Button in allen Hauptheadern durch `UserRound`-Icon (Lucide) → `/konto` ersetzt
- Stripe SDK v22: `current_period_end` nicht mehr typisiert — nächster Zahlungstermin wird aus `billing_cycle_anchor` + Monats-Inkrement berechnet

### Backend (Done)
- `src/app/api/stripe/widerruf/route.ts` — `POST /api/stripe/widerruf`:
  1. Auth-Check (401 wenn nicht eingeloggt)
  2. `stripe_customer_id` aus `profiles` laden (404 wenn nicht vorhanden)
  3. Aktive Subscription suchen via `stripe.subscriptions.list()` (404 wenn keine aktive Sub)
  4. Subscription sofort stornieren via `stripe.subscriptions.cancel(sub.id)`
  5. Bestätigungs-E-Mail via Mailjet senden: An Nutzer-E-Mail + BCC an `ADMIN_EMAIL`, Absender `MAILJET_FROM_EMAIL`
  6. Zeitstempel im E-Mail-Text (Pflicht nach § 356a BGB): `de-DE` Locale, Europe/Berlin Timezone
- 10 Vitest Unit Tests — alle grün

## Dependencies
- PROJ-2 (User Authentication) — Nutzer muss eingeloggt sein; E-Mail-Adresse kommt vom Auth-User
- PROJ-11 (Paywall) — Abo-Status, Stripe-Subscription-ID, nächster Zahlungstermin kommen von Stripe; `getAccessStatus()` aus `lib/paywall.ts` liefert den aktuellen Zugangsstatus
- PROJ-12 (Invite-Codes) — Invite-Zugang ist ein eigener Status auf dem Profil (`invite_code_redeemed_at`)

---

## Kontext

Ab dem **19. Juni 2026** verpflichtet § 356a BGB Anbieter von Online-Verträgen dazu, einen klar sichtbaren und leicht auffindbaren **Widerrufsbutton** bereitzustellen. Der Widerruf ist das gesetzliche 14-Tage-Rücktrittsrecht bei einem Vertragsabschluss — er unterscheidet sich von der regulären Kündigung (Kündigung = Ende der laufenden Abo-Periode; Widerruf = sofortige Vertragsauflösung innerhalb von 14 Tagen).

endlichsatt hat aktuell keine `/konto`-Seite. Die Kündigung läuft nur über das Stripe Customer Portal, das nicht prominent verlinkt ist. Beides wird mit PROJ-14 adressiert.

---

## User Stories

**US-1:** Als eingeloggter Nutzer möchte ich auf einer Seite meinen Abo-Status, meine E-Mail und den nächsten Zahlungstermin sehen, damit ich jederzeit weiß, was aktiv ist.

**US-2:** Als Abo-Nutzer möchte ich innerhalb von 14 Tagen nach Vertragsschluss meinen Vertrag widerrufen können, ohne eine E-Mail schreiben zu müssen — und eine sofortige Bestätigungs-E-Mail erhalten, die den Zeitpunkt dokumentiert.

**US-3:** Als Abo-Nutzer möchte ich mein Abo verwalten oder kündigen können (Stripe Customer Portal), ohne danach suchen zu müssen.

**US-4:** Als Nutzer mit Invite-Zugang oder laufendem Trial möchte ich meinen Status auf `/konto` sehen, damit ich weiß warum ich Zugriff habe.

**US-5:** Als Admin möchte ich von `/konto` aus direkt zum Admin-Bereich navigieren können.

---

## Acceptance Criteria

**Seite & Navigation**
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er `/konto` aufruft, dann sieht er seine Kontoübersicht (E-Mail, Status, ggf. Abo-Details)
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er `/konto` aufruft, dann wird er zu `/login` weitergeleitet
- [ ] Angenommen der Nutzer befindet sich auf einer der Hauptseiten (`/analyse`, `/rezepte`, `/upgrade`), dann sieht er in der Kopfzeile einen Link/Icon zu `/konto`

**Status-Anzeige je Nutzertyp**
- [ ] Angenommen der Nutzer hat ein aktives Stripe-Abo, dann sieht er: Status „Aktives Abo", Preis (4,99 €/Monat), nächstes Zahlungsdatum, Button „Abo verwalten" (→ Stripe Portal), Widerrufsbutton
- [ ] Angenommen der Nutzer hat einen Invite-Zugang, dann sieht er: Status „Einladungszugang", keinen Preis/Zahlungstermin, keinen Widerrufsbutton (kein Vertrag)
- [ ] Angenommen der Nutzer befindet sich im Trial-Zeitraum (7-Tage-Fenster aus PROJ-11), dann sieht er: Status „Testzeitraum — noch X Tage", Link zu `/upgrade`, keinen Widerrufsbutton
- [ ] Angenommen der Nutzer hat keinen Zugang mehr (Trial abgelaufen, kein Abo), dann sieht er: Status „Kein aktiver Zugang", Link zu `/upgrade`, keinen Widerrufsbutton
- [ ] Angenommen der eingeloggte Nutzer ist Admin (`ADMIN_EMAIL`), dann sieht er zusätzlich einen Link „Admin-Bereich → /admin"

**Widerruf-Flow**
- [ ] Angenommen der Nutzer klickt auf den Widerrufsbutton, dann öffnet sich ein Bestätigungsdialog mit: E-Mail und Vertragsinformation (Stripe Subscription ID oder Buchungsdatum), und einer Bestätigungs-Schaltfläche „Jetzt widerrufen"
- [ ] Angenommen der Nutzer bestätigt den Widerruf, dann wird seine Stripe-Subscription sofort storniert (`cancel_at_period_end: false`)
- [ ] Angenommen der Widerruf erfolgreich war, dann erhält der Nutzer eine Bestätigungs-E-Mail mit Datum und Uhrzeit des Widerrufs (Pflicht per § 356a BGB)
- [ ] Angenommen der Widerruf erfolgreich war, dann sieht der Nutzer auf der Seite eine Erfolgsmeldung und den aktualisierten Status (kein Abo mehr)
- [ ] Angenommen der Nutzer klickt auf den Widerrufsbutton, aber bricht den Dialog ab, dann passiert nichts (kein Widerruf, kein Datenverlust)
- [ ] Angenommen die Stripe-API ist während des Widerrufs nicht erreichbar, dann sieht der Nutzer eine Fehlermeldung — kein stiller Fehler

**Beschriftung & Sichtbarkeit (gesetzliche Anforderungen)**
- [ ] Angenommen der Widerrufsbutton ist sichtbar, dann ist er beschriftet mit „Vertrag widerrufen" (nicht mehrdeutig wie „Kontakt" oder „Kündigen")
- [ ] Angenommen der Widerrufsbutton ist sichtbar, dann ist er durch Farbe oder Kontrast klar erkennbar (nicht versteckt oder grau)
- [ ] Angenommen ein Nutzer ohne aktives Stripe-Abo ruft `/konto` auf, dann ist der Widerrufsbutton nicht sichtbar (kein Vertrag = kein Widerrufsrecht)

---

## Out of Scope

- Automatische Rückerstattung nach Widerruf — wird manuell im Stripe-Dashboard abgewickelt (zu komplex, zu selten)
- Widerruf ohne Login — gesetzlich nicht gefordert, da der Nutzer bereits Vertragspartner ist; die Identifikation erfolgt über den eingeloggten Account
- Anzeige von Rechnungen/Zahlungshistorie auf `/konto` — das läuft über das Stripe Customer Portal
- Änderung von E-Mail oder Passwort auf `/konto` — separates Feature, nicht in Scope
- Mehrere Abos oder Abo-Wechsel — es gibt nur ein Preismodell (4,99€/Monat)
- Push-Benachrichtigungen oder Erinnerungen vor Ablauf des Widerrufsfensters
- Widerruf für Invite-Nutzer — kein entgeltlicher Vertrag, daher kein gesetzliches Widerrufsrecht

---

## Edge Cases

- Nutzer versucht Widerruf nach Ablauf der 14-Tage-Frist → Button ist weiterhin sichtbar (wir prüfen nicht clientseitig), aber der Server gibt Fehlermeldung zurück mit Hinweis auf das Stripe Portal für reguläre Kündigung
- Nutzer hat Abo bereits über Stripe Portal gekündigt (`cancel_at_period_end: true`) aber ist noch aktiv → Widerrufsbutton ist trotzdem sichtbar (Abo ist noch aktiv); nach erfolgreichem Widerruf wird es sofort beendet
- Stripe-Webhook aktualisiert den Status nicht sofort nach Widerruf → Seite zeigt nach Widerruf die Erfolgsmeldung; beim nächsten Laden wird der Status frisch von Stripe abgefragt
- Nutzer klickt Widerrufsbutton mehrfach schnell hintereinander → Server-seitiger Guard: wenn Subscription bereits cancelled, gibt 409 zurück, kein Doppel-Aufruf
- Nächster Zahlungstermin nicht verfügbar (z.B. Abo endet bereits) → Feld wird weggelassen, kein Fehler
- Admin-User ist gleichzeitig Abo-Nutzer → sieht beides: Abo-Details + Widerrufsbutton + Admin-Link

---

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Widerruf und Kündigung auf derselben `/konto`-Seite | Nutzer unterscheidet die beiden Begriffe nicht — beide an einem Ort reduziert Verwirrung | 2026-06-18 |
| Stripe-Subscription beim Widerruf sofort stornieren (`cancel_at_period_end: false`) | Widerruf = sofortige Vertragsauflösung per Gesetz, nicht Kündigung zum Periodenende | 2026-06-18 |
| Rückerstattung manuell über Stripe-Dashboard | Widerrufe sind selten (Beta-Phase); automatische Rückerstattungslogik erhöht Komplexität unverhältnismäßig | 2026-06-18 |
| Widerrufsbutton immer sichtbar für Abo-Nutzer, 14-Tage-Check serverseitig | Clientseitiges Ausblenden nach 14 Tagen wäre manipulierbar; Server entscheidet und gibt ggf. Fehlermeldung zurück | 2026-06-18 |
| Kein eigenes E-Mail-System — Transaktions-E-Mail-Lösung wird in Architecture entschieden | Aktuell keine Transaktions-E-Mail-Infrastruktur in der App; welches Tool (Resend, Supabase SMTP etc.) entscheidet /architecture | 2026-06-18 |
| Admin-Link auf `/konto` für Admin-Nutzer | Ergibt sich aus dem Kontext: Admin ist eingeloggter Nutzer, `/konto` ist der logische Ort für Account-Navigation | 2026-06-18 |

### Open Questions
- [x] Welche E-Mail-Infrastruktur? → **Mailjet** (DSGVO-konform, DE-Anbieter, 6.000 E-Mails/Monat kostenlos). Absender: `hallo@mehralsabnehmen.de` (verifiziert). Entschieden 2026-06-18.
- [x] BCC an Admin? → **Ja**, Widerruf-Bestätigung geht auch als BCC an `ADMIN_EMAIL`. Entschieden 2026-06-18.

---

## Tech Design (Solution Architect)

### Komponentenstruktur

```
/konto  (Server Page — NEU)
+-- Auth-Check → /login wenn nicht eingeloggt
+-- Parallel laden: user.email + getAccessStatus() + Stripe-Subscription-Details
+-- KontoView  (Client Component — NEU)
    +-- E-Mail-Anzeige
    +-- Status-Badge (Aktives Abo / Einladungszugang / Testzeitraum / Kein Zugang)
    |
    +-- [nur bei aktivem Stripe-Abo]
    |   +-- Preis: 4,99 €/Monat
    |   +-- Nächstes Zahlungsdatum (aus Stripe)
    |   +-- Button "Abo verwalten"  →  POST /api/stripe/portal → Redirect
    |   +-- Button "Vertrag widerrufen"  →  öffnet WiderrufDialog
    |
    +-- [Trial-Nutzer]  →  Link "Jetzt freischalten" → /upgrade
    +-- [Kein Zugang]   →  Link "Jetzt freischalten" → /upgrade
    +-- [Admin-Nutzer]  →  Link "Admin-Bereich" → /admin

    WiderrufDialog  (shadcn AlertDialog, innerhalb KontoView)
    +-- Vertragsinfo: E-Mail + Abschluss-Datum der Subscription
    +-- Hinweis: "Rückerstattungen werden innerhalb von 14 Tagen bearbeitet"
    +-- Button "Abbrechen"
    +-- Button "Jetzt widerrufen"  →  POST /api/stripe/widerruf
    +-- Erfolgsmeldung nach Abschluss (Status aktualisiert sich)

Konto-Icon in bestehenden Headers  (kleine Ergänzung, keine neue Komponente)
+-- /analyse/page.tsx   →  User-Icon (Lucide) rechts im Header, Link zu /konto
+-- /rezepte/page.tsx   →  User-Icon rechts im Header, Link zu /konto
+-- /upgrade/page.tsx   →  User-Icon rechts im Header, Link zu /konto
```

### Neue API-Route

| Route | Methode | Zweck |
|---|---|---|
| `POST /api/stripe/widerruf` | NEU | Subscription sofort stornieren + Bestätigungs-E-Mail via Mailjet senden |

Bestehende Routen bleiben unverändert (`/api/stripe/portal`, `/api/stripe/webhook` etc.).

### Datenfluss: `/konto` Server Page

Die Seite macht beim Laden drei Abfragen parallel:

1. **User-E-Mail** — aus dem eingeloggten Auth-Kontext (kein Extra-Call)
2. **Zugangsstatus** — `getAccessStatus()` aus `lib/paywall.ts` (bereits vorhanden, liest `profiles`-Tabelle)
3. **Stripe-Details** — falls `stripe_customer_id` im Profil vorhanden: aktive Subscriptions via Stripe SDK abfragen → liefert `Preis` und `current_period_end` (nächstes Zahlungsdatum)

Kein neues Datenbankschema nötig — alle Infos kommen aus dem vorhandenen `profiles`-Datensatz und direkt von Stripe.

### Datenfluss: Widerruf (`POST /api/stripe/widerruf`)

1. Auth-Check → 401 wenn nicht eingeloggt
2. `stripe_customer_id` aus Profil laden
3. Aktive Subscription bei Stripe suchen
4. Subscription sofort stornieren (`cancel_at_period_end: false`)
5. Bestätigungs-E-Mail via Mailjet senden:
   - **An:** Nutzer-E-Mail
   - **BCC:** `ADMIN_EMAIL` (Product Owner wird informiert)
   - **Inhalt:** Bestätigung des Widerrufs mit Datum + Uhrzeit (gesetzliche Pflicht)
6. Erfolg zurückgeben → Client zeigt Erfolgsmeldung

### Neue Umgebungsvariablen

| Variable | Zweck | Sichtbarkeit |
|---|---|---|
| `MAILJET_API_KEY` | Mailjet-Authentifizierung | Nur Server |
| `MAILJET_SECRET_KEY` | Mailjet-Authentifizierung | Nur Server |
| `MAILJET_FROM_EMAIL` | Absender (`hallo@mehralsabnehmen.de`) | Nur Server |

`ADMIN_EMAIL` ist bereits vorhanden (aus PROJ-13).

### Neue Abhängigkeiten

| Paket | Zweck |
|---|---|
| `node-mailjet` | Mailjet SDK für Transaktions-E-Mails |

### Technische Entscheidungen

| Entscheidung | Begründung | Datum |
|---|---|---|
| Mailjet statt Resend/Nodemailer | DSGVO-konform (DE-Anbieter), 6.000 E-Mails/Monat kostenlos, offizielles Node.js-SDK | 2026-06-18 |
| Stripe-Details live von Stripe abfragen statt in DB speichern | Kein DB-Schema nötig; `current_period_end` ändert sich sowieso bei jeder Zahlung automatisch | 2026-06-18 |
| User-Icon (Lucide) statt Text-Link im Header | Platzsparend auf Mobile, gängiges UX-Pattern für Account-Navigation | 2026-06-18 |
| Widerruf-BCC an Admin-E-Mail | Product Owner wird automatisch über jeden Widerruf informiert ohne eigenes Monitoring-Dashboard | 2026-06-18 |
| Server Page für `/konto`, Client Component nur für interaktive Teile | Daten kommen von Supabase + Stripe (serverseitig sicherer); nur Dialog und Portal-Redirect brauchen Client-Code | 2026-06-18 |
