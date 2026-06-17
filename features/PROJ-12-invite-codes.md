# PROJ-12: Invite-Codes

## Status: In Progress
**Created:** 2026-06-17
**Last Updated:** 2026-06-17

## Dependencies
- PROJ-1 (Supabase Infrastructure) — Codes-Tabelle in der Datenbank
- PROJ-2 (User Authentication) — Einlösen ist an den eingeloggten Nutzer gebunden
- PROJ-11 (Paywall) — Code-Einlösung bypassed die Paywall; `/upgrade`-Seite und Countdown-Hinweis sind der Einstiegspunkt

---

## Kontext

Die Paywall (PROJ-11) sperrt Freitext-Analyse und Rezeptbibliothek nach Ablauf des 7-Tage-Übergangsfensters. Invite-Codes ermöglichen es dem Product Owner, ausgewählten Personen (Freunde, Familie, Beta-Tester) dauerhaften Zugriff zu schenken — ohne dass diese ein Abo abschließen müssen. Die Code-*Generierung* ist Aufgabe von PROJ-13 (Admin-Dashboard); PROJ-12 deckt ausschließlich die Nutzer-seitige Einlösung ab.

---

## User Stories

**US-1:** Als Nutzer mit einem Invite-Code möchte ich den Code auf der `/upgrade`-Seite eingeben können, damit ich die App dauerhaft ohne Abo nutzen kann.

**US-2:** Als Nutzer der noch im 7-Tage-Übergangsfenster ist möchte ich den Code schon jetzt einlösen können, damit ich nicht auf die Sperre warten muss.

**US-3:** Als Nutzer möchte ich nach dem Einlösen sofort Zugriff auf Freitext-Analyse und Rezeptbibliothek haben, ohne die Seite neu laden oder neu einloggen zu müssen.

**US-4:** Als Nutzer möchte ich eine klare Rückmeldung erhalten wenn mein Code ungültig ist, damit ich weiß dass ich etwas falsch eingegeben habe — ohne zu wissen ob der Code existiert oder bereits verwendet wurde.

**US-5:** Als Product Owner möchte ich, dass jeder Code nur einmal eingelöst werden kann, damit ich gezielt einzelnen Personen Zugang geben kann und Codes nicht weitergegeben werden.

---

## Acceptance Criteria

- [ ] Angenommen ein Nutzer befindet sich auf `/upgrade` (Paywall oder Übergangsfenster), wenn er auf "Ich habe einen Code" klickt, dann erscheint ein Texteingabefeld für den Code auf derselben Seite (kein Seitenwechsel)
- [ ] Angenommen ein Nutzer gibt einen gültigen, noch nicht eingelösten Code ein und klickt auf "Einlösen", dann wird der Code als eingelöst markiert, sein Account erhält dauerhaften Paywall-Bypass, er sieht eine kurze Erfolgsmeldung und wird anschließend zu `/analyse` weitergeleitet
- [ ] Angenommen ein Nutzer löst einen Code erfolgreich ein, wenn er danach `/analyse` oder `/rezepte` aufruft, dann hat er vollen Zugriff — unabhängig davon ob das Übergangsfenster abgelaufen ist oder ob er ein aktives Abo hat
- [ ] Angenommen ein Nutzer gibt einen ungültigen Code ein (existiert nicht oder bereits eingelöst), dann sieht er die Meldung "Dieser Code ist ungültig oder wurde bereits verwendet." — keine Unterscheidung zwischen den beiden Fällen
- [ ] Angenommen ein Nutzer hat bereits aktiven Zugriff (aktives Abo oder Code bereits eingelöst), wenn er trotzdem einen Code eingibt, dann wird der Code **nicht verbraucht** und er sieht den Hinweis "Du hast bereits vollen Zugriff."
- [ ] Angenommen ein Nutzer versucht binnen einer Stunde mehr als 10 Codes einzugeben, dann werden weitere Versuche serverseitig abgewiesen — die Fehlermeldung ist identisch mit der normalen Fehlermeldung (kein Hinweis auf das Rate-Limit)
- [ ] Angenommen der Countdown-Hinweis während des Übergangsfensters (PROJ-11) wird angezeigt, dann enthält er einen "Code einlösen"-Link der direkt zur Code-Eingabe auf `/upgrade` führt
- [ ] Angenommen ein Code wurde eingelöst, dann ist er dauerhaft als "eingelöst" markiert und kann von keinem anderen Nutzer mehr verwendet werden

---

## Out of Scope

- Code-Generierung durch den Admin — _PROJ-13_
- Zeitlich begrenzte Codes (z.B. 30 Tage) — bewusst nicht für diese Version; dauerhafter Zugriff reicht für Beta-Phase
- Codes die zusätzliche Foto-Scans gewähren — Foto-Scan-Counter bleibt von Invite-Codes unberührt; ein eingelöster Code entspricht exakt einem aktiven Abo (Freitext + Rezepte), nicht mehr
- Codes für verschiedene Zugangsstufen (z.B. "Nur Rezepte", "Nur Analyse") — ein Code = voller Paywall-Bypass, keine Granularität
- Codes per E-Mail direkt aus der App verschicken — Admin verschickt Codes manuell außerhalb der App
- Code-Einlösung für nicht-eingeloggte Nutzer — Auth ist Voraussetzung
- Deep-Links mit Code in der URL (z.B. `/einlösen?code=XYZ`) — Einlösung nur über das Formular auf `/upgrade`
- Rückgabe oder Deaktivierung eingelöster Codes durch Nutzer — nur Admin kann Codes verwalten (PROJ-13)

---

## Edge Cases

- Nutzer hat Scans noch nicht verbraucht (kein Trial gestartet) → kein Code-Eingabefeld sichtbar, Paywall noch nicht relevant
- Nutzer gibt denselben Code zweimal ein (Doppelklick auf "Einlösen") → serverseitig idempotent: zweiter Request erkennt dass der Code bereits vom selben Nutzer eingelöst wurde → zeigt "Du hast bereits vollen Zugriff."
- Nutzer gibt Code ein während das Übergangsfenster in genau dieser Sekunde abläuft → Code-Einlösung gewinnt, Zugriff bleibt erhalten
- Nutzer öffnet `/upgrade` in zwei Tabs gleichzeitig und löst denselben Code in beiden ein → nur der erste Request verbraucht den Code (atomare DB-Operation), zweiter Request erhält "Du hast bereits vollen Zugriff." (weil der erste Request bereits den Bypass gesetzt hat)
- Netzwerkfehler während der Code-Einlösung → Fehlermeldung "Etwas ist schiefgelaufen — bitte versuche es erneut.", Code bleibt unverbraucht
- Code enthält Leerzeichen oder unterschiedliche Groß-/Kleinschreibung → serverseitig trimmen und case-insensitiv prüfen, damit Tippfehler keine frustrierende Ablehnung erzeugen

---

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Dauerhafter Zugriff (kein Ablaufdatum) | Beta-Phase braucht keine zeitliche Verwaltung; dauerhafte Codes sind einfacher zu generieren und zu erklären | 2026-06-17 |
| Einmalige Nutzung pro Code | Jede eingeladene Person bekommt einen eigenen Code — kontrollierte Vergabe, keine unkontrollierte Weitergabe | 2026-06-17 |
| Code-Eingabe nur auf `/upgrade`, kein Deep-Link | Einfachste Implementierung; Nutzer mit einem Code kommen ohnehin über die Paywall oder den Countdown-Hinweis auf `/upgrade` | 2026-06-17 |
| Gleiche Fehlermeldung für "ungültig" und "bereits eingelöst" | Verhindert, dass jemand systematisch herausfindet ob ein Code existiert (Security by Obscurity für einen niedrig-stakes Kontext) | 2026-06-17 |
| Code nicht verbrauchen wenn Nutzer bereits Zugriff hat | Verhindert irrtümliches Verbrennen eines Codes bei einem Nutzer der ihn gar nicht braucht | 2026-06-17 |
| Rate-Limit ohne sichtbaren Lockout | Schutz gegen Brute-Force ohne ehrliche Nutzer (die sich vielleicht vertippt haben) zu bestrafen | 2026-06-17 |
| Kein extra Foto-Scan-Aufladen durch Codes | Code = Paywall-Bypass = Abo-Äquivalent; Foto-Scans sind ein separates, unabhängiges Limit | 2026-06-17 |
| Case-insensitive Prüfung + automatisches Trimmen | Nutzer tippen Codes oft ab (z.B. aus einer Nachricht), Groß-/Kleinschreibung und führende Leerzeichen sollen keine frustrierende Ablehnung erzeugen | 2026-06-17 |

### Open Questions
- [ ] Wie viele Zeichen soll ein Code haben, und welches Format (z.B. `XXXX-XXXX` oder 8 zufällige alphanumerische Zeichen)? → Entscheidung bei PROJ-13 (Code-Generierung), hier nur als Hinweis: Format muss für beide Specs konsistent sein

---

## Tech Design (Solution Architect)

### Komponentenstruktur

```
/upgrade (UpgradeView — bestehende Client Component, src/components/upgrade-view.tsx)
+-- [unverändert] "Jetzt freischalten" → Stripe Checkout
+-- [unverändert] "Abo verwalten" → Stripe Customer Portal
+-- "Ich habe einen Einladungscode" [NEU — ersetzt Platzhaltertext]
    +-- Eingeklappt: Link-Text "Ich habe einen Einladungscode →"
    +-- Ausgeklappt (nach Klick):
        +-- Input: Code-Eingabefeld
        +-- Button: "Einlösen" (mit Ladezustand)
        +-- Fehlermeldung bei ungültigem/bereits eingelöstem Code

POST /api/invite/redeem [NEUE API-Route]
+-- Auth-Guard (401 ohne Session)
+-- Rate-Limit-Prüfung (max 10 Fehlversuche / Stunde / Nutzer)
+-- Prüft ob Nutzer bereits Zugriff hat → früher Rückgabewert, kein Code verbraucht
+-- Atomares UPDATE: Code suchen + als eingelöst markieren in einem Schritt
+-- Bei Erfolg: invite_code_redeemed_at auf dem Profil setzen

src/lib/paywall.ts — getAccessStatus() [ERWEITERUNG]
+-- Liest invite_code_redeemed_at aus profiles (gleiche Query, kein neuer Join)
+-- hasAccess = true wenn invite_code_redeemed_at gesetzt
```

### Datenmodell

**Neue Tabelle: `invite_codes`**
```
Jeder Code hat:
- code                → der eigentliche Code-String (Primärschlüssel, unique)
- redeemed_by         → User-ID des Nutzers der ihn eingelöst hat (NULL bis eingelöst)
- redeemed_at         → Zeitstempel der Einlösung (NULL bis eingelöst)
- created_at          → wann der Code angelegt wurde (von PROJ-13 befüllt)

Kein direkter Browser-Zugriff — nur über die API-Route mit Admin-Rechten.
```

**Erweiterung `profiles` (bestehend):**
```
Neue Spalte:
- invite_code_redeemed_at → Zeitstempel wann ein Code eingelöst wurde, sonst NULL

Diese Spalte ist der Access-Gate-Schalter:
  NULL    → kein Code-Zugang
  Timestamp → dauerhafter Paywall-Bypass, unabhängig von subscription_status
```

Warum ein eigenes Feld statt `subscription_status = 'invite'`? Wenn ein Nutzer nach einer Code-Einlösung später ein Abo abschließt und kündigt, würde der Stripe-Webhook `subscription_status` auf `canceled` setzen — und damit den Code-Zugang versehentlich entziehen. Das separate Feld vermeidet diesen Konflikt.

### API-Route

| Route | Methode | Auth | Zweck |
|---|---|---|---|
| `POST /api/invite/redeem` | NEU | eingeloggt | Code einlösen |

**Serverseitiger Ablauf:**
1. Auth prüfen → 401 wenn keine Session
2. Rate-Limit zählen: Fehlversuche des Nutzers in der letzten Stunde ≥ 10 → 429 (gleiche Meldung wie bei ungültigem Code)
3. Bereits-Zugriff-Prüfung: `invite_code_redeemed_at != null` oder aktives Abo → 200 `{ alreadyHasAccess: true }`
4. **Atomares DB-Update:** `UPDATE invite_codes SET redeemed_by = ?, redeemed_at = NOW() WHERE code = ? AND redeemed_by IS NULL RETURNING code` — verhindert Race Condition (zwei Tabs gleichzeitig)
5. Kein RETURNING-Ergebnis → Code existiert nicht oder bereits eingelöst → 422, Fehlversuch zählen
6. Erfolg → `profiles.invite_code_redeemed_at` setzen → 200 `{ success: true }`

### Rate-Limiting

Fehlversuche werden als Zeitstempel in einer leichtgewichtigen Spalte oder Mini-Tabelle in Supabase festgehalten. Die API-Route zählt Einträge der letzten Stunde für den aktuellen Nutzer vor jedem Versuch. Kein externer Service nötig — Supabase reicht für diesen Anwendungsfall vollständig aus.

### Dependencies

Keine neuen Pakete — läuft komplett mit dem bestehenden Supabase/Next.js-Stack.

## Implementierungsnotizen (Backend)

**Implementiert 2026-06-17:**

### DB-Migrationen (3 Stück — in Supabase anwenden)
1. `add_invite_code_redeemed_at_to_profiles` — Spalte `invite_code_redeemed_at TIMESTAMPTZ DEFAULT NULL` auf `profiles` (geschützt durch bestehende column-level GRANTs aus PROJ-10)
2. `create_invite_codes_table` — Tabelle `invite_codes` (`code TEXT PK`, `redeemed_by UUID REFERENCES auth.users`, `redeemed_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ`); RLS aktiviert, keine Policies (nur Admin-Client)
3. `create_invite_redemption_attempts_table` — Tabelle `invite_redemption_attempts` (`id UUID PK`, `user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE`, `attempted_at TIMESTAMPTZ`); Index auf `(user_id, attempted_at DESC)`

### Implementierte Dateien
- `src/app/api/invite/redeem/route.ts` — POST-Handler (Auth, Rate-Limit, Bereits-Zugriff-Check, atomares Redeem, Zugang setzen)
- `src/app/api/invite/redeem/route.test.ts` — 9 Vitest-Tests, alle grün
- `src/lib/paywall.ts` — `hasInviteAccess` zu `AccessStatus` und `getAccessStatus()` hinzugefügt
- `src/types/database.ts` — Typen für `invite_codes`, `invite_redemption_attempts` und `invite_code_redeemed_at` auf `profiles` ergänzt
- `src/lib/paywall.test.ts` — Test um `hasInviteAccess: false` ergänzt

### Ausstehend (E2E-Tests)
- Playwright-Suite für den gesamten Einlöse-Flow

## Implementierungsnotizen (Frontend)

**Implementiert 2026-06-17:**

### Geänderte Dateien
- `src/components/upgrade-view.tsx`
  - Neue Props: `hasInviteAccess: boolean`, `defaultShowCode?: boolean`
  - Eigene Erfolgsansicht wenn `hasInviteAccess && !isSubscribed`: "Einladungscode eingelöst"
  - Invite-Code-Abschnitt ersetzt Platzhaltertext: kollabierbar, Link → aufgeklapptes Formular
  - Formular: `<Input>` (uppercase, tracking-widest) + "Einlösen"-Button + Error-State
  - Erfolg → `window.location.href = '/analyse'` (Hard-Redirect, damit `getAccessStatus()` neu geladen wird)
  - Auto-Focus auf Input wenn `defaultShowCode = true`
- `src/app/upgrade/page.tsx`
  - `searchParams` um `showCode?: string` erweitert
  - `hasInviteAccess` und `defaultShowCode={showCode === '1'}` an UpgradeView übergeben
- `src/components/mahlzeit-input.tsx`
  - Countdown-Hinweis um Link "Code einlösen →" ergänzt → `/upgrade?showCode=1`

---

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Separates `invite_code_redeemed_at`-Feld auf `profiles` statt `subscription_status = 'invite'` | Verhindert Konflikt mit Stripe-Webhook: wenn ein Nutzer nach Code-Einlösung später ein Abo kündigt, überschreibt Stripe `subscription_status` auf `canceled` — das eigene Feld bleibt unberührt | 2026-06-17 |
| Atomares `UPDATE ... WHERE redeemed_by IS NULL` für die Code-Einlösung | Verhindert Race Condition bei zwei gleichzeitigen Tabs: nur die erste Anfrage findet die Bedingung erfüllt und erhält einen Rückgabewert — die zweite bekommt "bereits eingelöst" | 2026-06-17 |
| Rate-Limit über Supabase (kein Redis/Upstash) | Anwendungsfall ist niedrig-traffic; kein weiterer externer Service für ein simples Fehlversuch-Counter nötig | 2026-06-17 |
| Code-Einlösung nur über API-Route (Admin-Client), kein direkter Browser-Zugriff auf `invite_codes` | Verhindert Manipulation (z.B. Codes auslesen oder als eingelöst markieren) durch einen angemeldeten Nutzer über die Browser-Konsole | 2026-06-17 |
| `getAccessStatus()` liest `invite_code_redeemed_at` in derselben bestehenden Query | Kein zusätzlicher DB-Request; `profiles` wird ohnehin für jeden Seiten-Aufruf gelesen | 2026-06-17 |
