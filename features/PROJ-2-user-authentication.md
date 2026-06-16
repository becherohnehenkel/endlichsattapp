# PROJ-2: User Authentication

## Status: Deployed
**Created:** 2026-06-10
**Last Updated:** 2026-06-12
**Deployed:** 2026-06-12 — https://endlichsattapp.vercel.app

## Implementation Notes
- `src/app/login/page.tsx` — Login-Formular (E-Mail + Passwort, redirectTo-Support)
- `src/app/registrieren/page.tsx` — Registrierung (Name, E-Mail, Passwort min. 8 Zeichen)
- `src/app/auth/callback/route.ts` — Supabase verifyOtp-Handler (signup & recovery)
- `src/app/auth/bestaetigen/page.tsx` — "Schau ins Postfach" + Link erneut senden
- `src/app/auth/passwort-vergessen/page.tsx` — Reset-Link anfordern
- `src/app/auth/passwort-neu/page.tsx` — Neues Passwort setzen nach Reset-Link
- `src/app/analyse/page.tsx` — Geschützte Placeholder-Seite mit Abmelden
- Design-System-Farben in `globals.css` übernommen (#4A7C59 Primary, #FAF7F2 Background)
- Inter-Font und `lang="de"` in `layout.tsx` gesetzt

### Bugfix 2026-06-16 — Inkonsistenz zwischen zwei Redirect-Pfaden behoben
QA-Fund während PROJ-10: PROJ-6 änderte den client-seitigen Post-Login-Redirect (`src/app/login/page.tsx`) von `/analyse` auf `/` (Startseite als "natürlicher App-Einstieg", siehe PROJ-6 Decision Log), aktualisierte aber nicht den zweiten, separaten Redirect-Pfad in `middleware.ts` (bereits eingeloggter Nutzer ruft `/login`/`/registrieren` direkt auf — hatte weiterhin `/analyse` hartcodiert) noch diese Spec oder die zugehörigen E2E-Tests. Die beiden Pfade widersprachen sich dadurch.
Fix: `middleware.ts` auf `/` vereinheitlicht. Diese Spec (Acceptance Criteria + User Story) und `tests/PROJ-2-user-authentication.spec.ts` auf das jetzt konsistente Verhalten aktualisiert. `redirectTo`-Verhalten (explizites Linkziel) bleibt unverändert auf `/analyse` o.ä.
`tests/PROJ-3/4/5-*.spec.ts`: `loginAs()` fordert jetzt explizit `redirectTo=%2Fanalyse` an, da diese Tests auf der Analyse-Seite laufen müssen (PROJ-8 brauchte keinen Fix — navigiert dort bereits explizit selbst hin).

**BUG-4 (neu gefunden, separat von BUG-1):** Beim ersten erfolgreichen Durchlauf dieser zuvor blockierten Tests kam ans Licht: `newPage.goto('/login')`/`/registrieren` in einem neuen Tab derselben Browser-Context erkennt die bestehende Session in der Middleware nicht (`getSession()` liefert dort keinen Nutzer) — deterministisch reproduziert über 3 Versuche, unabhängig vom Redirect-Ziel. Die zwei betroffenen Tests sind mit `test.fixme()` markiert statt grün zu lügen. Noch nicht behoben — eigener Untersuchungs-Durchgang empfohlen.

**Weiterer Fund (gehört zu PROJ-3/4/5, nicht hier gefixt):** Mit dem BUG-1-Fix laufen PROJ-3s Rückfragen-Flow-Tests jetzt erstmals durch — und decken auf, dass `mockApis()`s `/api/analyse/complete`-Mock nicht die von `runCompleteAnalysis()` erwartete `{ ingredients: [...] }`-Form liefert (gleiches Muster wie der BUG-2-Fund in PROJ-10). 5 Tests in `PROJ-3-mahlzeit-input.spec.ts` schlagen dadurch fehl. War vorher unsichtbar, weil der Login-Redirect-Bug diese Tests nie so weit kommen ließ. Nicht im Rahmen dieses Fixes behoben — eigener Durchgang über die Mock-Shapes in PROJ-3/4/5 empfohlen.

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure Setup) — Auth läuft über Supabase Auth, Profil-Eintrag wird bei Registrierung angelegt

## User Stories
- Als neuer Nutzer möchte ich mich mit E-Mail und Passwort registrieren, damit ich meine Mahlzeiten und Analysen persönlich gespeichert habe.
- Als registrierter Nutzer möchte ich mich einloggen, damit ich auf meine gespeicherten Daten zugreifen kann.
- Als Nutzer möchte ich nach dem Login auf der Startseite landen, damit ich einen Überblick bekomme und direkt loslegen kann (seit PROJ-6: Startseite statt Analyse-Seite als Landingpage).
- Als Nutzer möchte ich mein Passwort zurücksetzen können, damit ich bei einem vergessenen Passwort nicht dauerhaft ausgesperrt bin.
- Als Nutzer möchte ich meine E-Mail-Adresse bestätigen müssen, damit mein Konto gesichert ist.
- Als Nutzer möchte ich mich ausloggen können, damit meine Daten auf geteilten Geräten geschützt sind.

## Out of Scope
- Google / Apple / OAuth Login — deferred to Post-MVP, Supabase-seitig später einfach nachrüstbar
- Zwei-Faktor-Authentifizierung (2FA) — Post-MVP
- Account-Löschung durch den Nutzer — Post-MVP
- Admin-Zugang oder Nutzer-Verwaltung — kein Admin-Feature geplant
- "Remember me"-Checkbox — Supabase-Sessions sind standardmäßig persistent, kein manueller Toggle nötig

## Acceptance Criteria

### Registrierung
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er die Registrierungsseite aufruft und Name, E-Mail und Passwort eingibt und abschickt, dann erhält er eine Bestätigungsmail und wird auf eine Hinweisseite ("Bitte E-Mail bestätigen") weitergeleitet.
- [ ] Angenommen der Nutzer versucht sich zu registrieren, wenn er eine bereits verwendete E-Mail-Adresse eingibt, dann wird eine klare Fehlermeldung angezeigt ("E-Mail bereits registriert").
- [ ] Angenommen der Nutzer füllt das Registrierungsformular aus, wenn das Passwort kürzer als 8 Zeichen ist, dann wird eine Validierungsfehlermeldung angezeigt bevor der Request abgeschickt wird.
- [ ] Angenommen der Nutzer klickt den Bestätigungslink in der E-Mail, wenn der Link gültig ist, dann wird er eingeloggt und landet auf der Startseite (`/`).

### Login
- [ ] Angenommen der Nutzer ist registriert und hat seine E-Mail bestätigt, wenn er sich mit korrekten Zugangsdaten einloggt, dann landet er auf der Startseite (`/`) — außer ein `redirectTo`-Parameter war gesetzt, dann landet er dort.
- [ ] Angenommen der Nutzer versucht sich einzuloggen, wenn er falsche Zugangsdaten eingibt, dann wird eine generische Fehlermeldung angezeigt ("E-Mail oder Passwort falsch") ohne preiszugeben welches der beiden falsch ist.
- [ ] Angenommen der Nutzer hat seine E-Mail noch nicht bestätigt, wenn er sich einloggen möchte, dann wird er darauf hingewiesen und kann die Bestätigungsmail erneut anfordern.

### Passwort vergessen
- [ ] Angenommen der Nutzer hat sein Passwort vergessen, wenn er auf "Passwort vergessen" klickt und seine E-Mail eingibt, dann erhält er eine E-Mail mit einem Reset-Link.
- [ ] Angenommen der Nutzer klickt den Reset-Link, wenn er ein neues Passwort setzt, dann ist das alte Passwort ungültig und er wird mit dem neuen Passwort eingeloggt.
- [ ] Angenommen ein Reset-Link wurde angefordert, wenn derselbe Link nach 1 Stunde nochmals aufgerufen wird, dann ist er abgelaufen und der Nutzer wird aufgefordert einen neuen anzufordern.

### Zugangsschutz
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er eine geschützte Seite (z.B. Analyse, Historie) aufruft, dann wird er zur Login-Seite weitergeleitet.
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die Login- oder Registrierungsseite direkt aufruft, dann wird er zur Startseite (`/`) weitergeleitet.

### Logout
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er auf "Abmelden" klickt, dann wird die Session beendet und er landet auf der Login-Seite.

## Edge Cases
- **Abgelaufener Bestätigungslink:** Nutzer klickt den Verifizierungslink nach zu langer Zeit — klare Fehlermeldung mit Option, einen neuen Link anzufordern.
- **Netzwerkfehler beim Login:** Formular bleibt ausgefüllt, Fehlermeldung wird angezeigt, kein Datenverlust.
- **Direktlink nach Login:** Wenn ein nicht eingeloggter Nutzer auf `/analyse` verlinkt wird, soll er nach dem Login automatisch dorthin weitergeleitet werden (nicht zur Standard-Startseite `/`).
- **Session abgelaufen:** Wenn eine Session im Hintergrund abläuft, soll der Nutzer beim nächsten Interaktionsversuch sanft zur Login-Seite geleitet werden (kein harter Absturz).
- **Mehrfach-Registrierung:** Nutzer versucht sich mit derselben E-Mail zweimal zu registrieren — eindeutige Fehlermeldung ohne technische Details.

## Technical Requirements
- **Mobile-first:** Alle Auth-Screens vollständig auf Mobilgeräten nutzbar (kein horizontales Scrollen, ausreichend große Touch-Targets)
- **Session-Persistenz:** Supabase-Standard (JWT in localStorage), kein manueller Toggle nötig
- **Passwort-Mindestlänge:** 8 Zeichen, client- und serverseitig validiert
- **E-Mail-Bestätigung:** Pflicht vor erstem Login — kein Zugang ohne bestätigte E-Mail
- **Reset-Link-Ablauf:** 1 Stunde (Supabase-Standard)

## Open Questions
- [x] Absender der Auth-E-Mails: `endlichsatt <hello@satt.mehralsabnehmen.de>` — Domain `satt.mehralsabnehmen.de` wird bei `/deploy` eingerichtet

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Nur E-Mail + Passwort im MVP | Schnellste Umsetzung; OAuth per Supabase-Toggle später nachrüstbar ohne Architektur-Änderung | 2026-06-10 |
| E-Mail-Verifizierung Pflicht | Schutz vor Fake-Accounts; sinnvoll bei persönlichen Gesundheitsdaten | 2026-06-10 |
| Nach Login direkt zur Analyse-Seite | App hat eine Kernfunktion — kein Umweg über Dashboard bis PROJ-6 existiert | 2026-06-10 |
| Keine "Remember me"-Checkbox | Supabase-Sessions sind standardmäßig persistent; Checkbox wäre UI-Rauschen ohne Mehrwert | 2026-06-10 |
| Obige Entscheidung ersetzt: Nach Login zur Startseite (`/`) statt zur Analyse-Seite | Wie damals schon vorgesehen ("...bis PROJ-6 existiert") — PROJ-6 hat die Startseite gebaut, hier jetzt konsistent nachgezogen (middleware.ts + login/page.tsx) | 2026-06-16 |

### Technical Decisions
<!-- Added by /architecture -->

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
