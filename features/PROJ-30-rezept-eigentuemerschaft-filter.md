# PROJ-30: Rezept-Eigentümerschaft & Filter

## Status: Approved
**Created:** 2026-08-04
**Last Updated:** 2026-08-04

## Dependencies
- PROJ-8 (Rezeptbibliothek) — Rezepte-Seite und Datenmodell existieren bereits
- PROJ-11 (Paywall) — bestehender Zugriffsstatus (`hasFullAccess`) wird für das spätere Eigene-Rezepte-Limit wiederverwendet
- PROJ-19 (Gast-Modus) — bestehende Gast-/Restricted-Sichtbarkeitslogik (`is_guest_visible`) bleibt unverändert bestehen und wirkt mit dieser Spec zusammen

## User Stories
- Als Nutzer möchte ich auf der Rezepte-Seite zwischen "Alle Rezepte", "Lukas' Rezepte" und "Eigenen Rezepten" filtern können, damit ich gezielt die kuratierten Rezepte oder meine eigenen finden kann.
- Als Product Owner (Lukas) möchte ich, dass meine kuratierten Rezepte klar als solche erkennbar bleiben, auch wenn später viele Nutzer-Rezepte dazukommen.
- Als Nutzer möchte ich, dass meine eigenen Rezepte privat bleiben — andere Nutzer sollen sie nicht sehen können.

## Out of Scope
- Die eigentliche UI zum Anlegen eigener Rezepte — das ist PROJ-31
- Rezept-aus-Mahlzeit-Anlage — das ist PROJ-32
- Durchsetzung des 5-Rezepte-Limits beim Anlegen — die Regel wird hier festgelegt (siehe Product Decisions), die tatsächliche Prüfung beim Anlegen gehört zu PROJ-31/PROJ-32, da es vorher keine Anlage-Möglichkeit gibt
- Admin-Moderationswerkzeug für Nutzer-Rezepte (z.B. unangemessene Inhalte melden/entfernen) — aktuell nicht angefragt, ggf. spätere eigene Spec falls nötig
- Teilen/Veröffentlichen eigener Rezepte für andere Nutzer (Community-Bibliothek) — bewusst ausgeschlossen, Rezepte bleiben privat (siehe Product Decisions)
- Änderungen an der bestehenden Gast-/Trial-Sichtbarkeitslogik (`is_guest_visible`) für offizielle Rezepte — bleibt exakt wie heute

## Acceptance Criteria

**Datenmodell**
- [ ] Angenommen ein bestehendes (admin-angelegtes) Rezept, wenn die Migration läuft, dann bleibt es ohne Eigentümer (= offizielles Rezept) und ist weiterhin für alle wie bisher sichtbar
- [ ] Angenommen ein Rezept wird über den bestehenden Admin-Editor angelegt, wenn es gespeichert wird, dann hat es keinen Eigentümer (gilt als offizielles/"Lukas' Rezept")

**Sichtbarkeit & Datenschutz**
- [ ] Angenommen Nutzer A hat ein eigenes Rezept angelegt, wenn Nutzer B die Rezepte-Seite öffnet, dann sieht Nutzer B dieses Rezept nirgends (weder in "Alle Rezepte" noch direkt über die URL)
- [ ] Angenommen ein Nutzer öffnet ein eigenes Rezept direkt über dessen URL, wenn ein ANDERER Nutzer dieselbe URL aufruft, dann bekommt er eine Fehlermeldung/404, kein Zugriff auf fremde Rezeptdaten
- [ ] Angenommen ein Gast (nicht eingeloggt) öffnet die Rezepte-Seite, wenn die Filter angezeigt werden, dann ist "Eigene Rezepte" nicht sichtbar (Gäste können keine eigenen Rezepte haben)

**Filter**
- [ ] Angenommen ein eingeloggter Nutzer öffnet die Rezepte-Seite, wenn sie lädt, dann ist "Alle Rezepte" standardmäßig ausgewählt und zeigt offizielle Rezepte + eigene Rezepte kombiniert
- [ ] Angenommen ein Nutzer wählt "Lukas' Rezepte", wenn der Filter angewendet wird, dann werden ausschließlich offizielle (eigentümerlose) Rezepte angezeigt
- [ ] Angenommen ein Nutzer wählt "Eigene Rezepte", wenn der Filter angewendet wird, dann werden ausschließlich die eigenen Rezepte dieses Nutzers angezeigt
- [ ] Angenommen ein Nutzer hat noch keine eigenen Rezepte, wenn er "Eigene Rezepte" auswählt, dann sieht er einen Leerzustand mit Hinweis, wie man eigene Rezepte anlegt (Verweis auf PROJ-31/32, sobald verfügbar)
- [ ] Angenommen ein restricted-Nutzer (Gast oder Trial abgelaufen, siehe PROJ-11/19), wenn er "Lukas' Rezepte" oder "Alle Rezepte" auswählt, dann sieht er innerhalb dieser Filter weiterhin nur die bestehende eingeschränkte Teilmenge (`is_guest_visible`), nicht alle offiziellen Rezepte — die bestehende Zugriffsbeschränkung bleibt unverändert bestehen und wirkt zusätzlich zum neuen Filter

## Edge Cases
- Nutzer löscht seinen Account → seine eigenen Rezepte werden mitgelöscht (kein verwaistes/übernommenes Rezept)
- Rezept-Vorschläge nach einer Mahlzeit-Analyse (`/api/rezepte/vorschlaege`, PROJ-8) → dürfen nur offizielle Rezepte + die eigenen Rezepte des anfragenden Nutzers berücksichtigen, nie fremde private Rezepte
- Admin (Lukas) ruft die Rezepte-Seite selbst auf → sieht dieselben drei Filter wie jeder andere Nutzer; "Lukas' Rezepte" und "Eigene Rezepte" wären für ihn inhaltlich identisch, da er die offiziellen Rezepte selbst anlegt (kein Sonderfall nötig)
- Zwei Nutzer legen ein Rezept mit demselben Titel an → kein Konflikt, Eigentümerschaft ist rein über die ID getrennt, keine Eindeutigkeits-Anforderung an Titel

## Technical Requirements (optional)
- Sichtbarkeit sollte auf Datenbankebene (Row Level Security) durchgesetzt werden, nicht nur in der Anwendungslogik — bestehende Endpunkte wie `/api/rezepte/vorschlaege`, die mit dem nutzer-eigenen Supabase-Client (nicht Admin-Client) arbeiten, profitieren dann automatisch von korrekter Filterung ohne Codeänderung. Genaue Policy-Gestaltung obliegt /architecture.
- Bestehende `is_guest_visible`-Logik für offizielle Rezepte bleibt als zusätzliche, unabhängige Einschränkung bestehen (wirkt orthogonal zum neuen Eigentümer-Filter)

## Open Questions
- [ ] Exakte Formulierung des Leerzustands bei "Eigene Rezepte" ohne Inhalte — final durch /frontend, sobald klar ist ob PROJ-31 zu diesem Zeitpunkt schon live ist

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigentümerschaft über eine einzelne nullable Spalte (kein Eigentümer = offiziell) statt zweier separater Markierungen | Einfacheres Datenmodell — "offiziell" und "nicht offiziell" sind exakt komplementär, kein Fall wo beides oder keins zutrifft | 2026-08-04 |
| Nutzer-Rezepte sind privat (nur für den Ersteller sichtbar), keine Community-Bibliothek | Nutzer-Vorgabe — vermeidet Moderationsbedarf und passt zum Charakter "eigene Notiz/eigenes Rezept aus meiner Mahlzeit" statt öffentlichem Teilen | 2026-08-04 |
| 5-Rezepte-Limit für Nutzer ohne vollen Zugriffsstatus, unbegrenzt für Nutzer mit vollem Zugriff (Trial aktiv/Abo/Invite) | Nutzer-Vorgabe — koppelt an bestehendes Zugriffsstufen-System (wie beim Foto-Scan-Limit aus PROJ-10), keine neue separate Bezahllogik nötig | 2026-08-04 |
| Limit ist ein "Slot-Zähler" (aktuelle Anzahl eigener Rezepte), kein abnehmendes Lifetime-Kontingent — Löschen gibt einen Platz zurück | Nutzer-Vorgabe — anders als beim Foto-Scan-Limit besteht bei Rezepten kein API-Kosten-Risiko, das einen strikten Lifetime-Zähler rechtfertigen würde | 2026-08-04 |
| "Eigene Rezepte"-Filter für Gäste ausgeblendet | Gäste können mangels Login ohnehin keine eigenen Rezepte haben — ein leerer Filter-Tab wäre nur verwirrend | 2026-08-04 |
| Admin-Moderation von Nutzer-Rezepten explizit außerhalb des Scopes | Nicht angefragt; bei Bedarf eigene Spec später | 2026-08-04 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Sichtbarkeit über Row Level Security statt nur Anwendungslogik | Bestehende Endpunkte (Detailseite, Rezept-Vorschläge) nutzen bereits den normalen Nutzerzugriff — RLS-Regeln schützen automatisch mit, ohne jede Stelle einzeln anzupassen | 2026-08-04 |
| Ein nullable `owner_id`-Feld statt zweier Flags | Zustände sind komplementär, ein Feld kann nicht widersprüchlich werden | 2026-08-04 |
| Admin-Editor bleibt unverändert (Service-Role-Client, setzt kein Eigentümer-Feld) | Legt automatisch offizielle Rezepte an, kein neuer Sonderfall nötig | 2026-08-04 |
| Eigentümer-Filter läuft clientseitig über bereits geladene Daten | Konsistent mit bestehender Küchen-Tag-Filterung, kein zusätzlicher Server-Aufruf pro Filterwechsel nötig bei aktueller Datenmenge | 2026-08-04 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur

```
Rezepte-Seite (öffentlich, /rezepte)
├── Filter-Leiste (NEU)
│   ├── "Alle Rezepte" (Standard, ausgewählt beim Laden)
│   ├── "Lukas' Rezepte"
│   └── "Eigene Rezepte" (nur sichtbar, wenn eingeloggt)
├── Suche + Küchen-Tag-Filter (bestehend, unverändert) — wirkt zusätzlich zum neuen Filter
└── Rezept-Grid (bestehend)
    └── Leerzustand bei "Eigene Rezepte" ohne Inhalte (NEU) — Hinweistext, noch ohne Aktions-Button (der kommt erst mit PROJ-31)

Rezept-Detailseite (/rezept/[id])
└── unverändert in der Darstellung — durch die neue Zugriffsregel automatisch geschützt (fremdes privates Rezept → nicht gefunden)

Admin-Rezept-Editor (/admin/rezepte/*)
└── unverändert — legt weiterhin ausschließlich offizielle Rezepte an
```

### B) Datenmodell (einfache Sprache)

Jedes Rezept bekommt ein neues, optionales Feld: **Eigentümer**.
- Kein Eigentümer eingetragen → offizielles Rezept (wie bisher, von Lukas kuratiert) — alle bestehenden Rezepte bleiben ohne Änderung in diesem Zustand
- Eigentümer eingetragen → privates Rezept genau dieses einen Nutzers

**Sichtbarkeitsregel, direkt in der Datenbank hinterlegt (nicht nur in der App-Logik geprüft):**
- Offizielle Rezepte: für alle sichtbar, wie bisher
- Private Rezepte: ausschließlich für den eingetragenen Eigentümer sichtbar — für alle anderen unsichtbar, auch bei direktem Aufruf des Links

Löscht ein Nutzer seinen Account, werden seine eigenen Rezepte automatisch mitgelöscht.

### C) Tech-Entscheidungen (Begründung)

1. **Sichtbarkeit wird auf Datenbankebene erzwungen (Row Level Security), nicht nur durch Filterung in der App.** Mehrere bestehende Stellen (Rezept-Detailseite, Rezept-Vorschläge nach einer Mahlzeit-Analyse) fragen Rezepte bereits mit dem normalen Nutzerzugriff ab, nicht mit erweiterten Rechten. Wird die Regel auf Datenbankebene hinterlegt, greift sie an all diesen Stellen automatisch mit, ohne dass jede Stelle einzeln angepasst werden muss — und eine an einer Stelle vergessene Prüfung kann keine privaten Rezepte versehentlich offenlegen.
2. **Ein einzelnes optionales Eigentümer-Feld statt zweier getrennter Markierungen.** "Offiziell" und "gehört einem Nutzer" schließen sich gegenseitig aus — ein Feld reicht und kann nicht in einen widersprüchlichen Zustand geraten.
3. **Der bestehende Admin-Rezept-Editor bleibt technisch unverändert.** Er arbeitet bereits mit erweiterten Rechten (umgeht die normale Sichtbarkeitsprüfung bewusst, wie schon heute) und muss beim Speichern schlicht weiterhin kein Eigentümer-Feld setzen, damit ein Rezept automatisch als offiziell gilt.
4. **Der Filter "Alle/Lukas'/Eigene" läuft clientseitig über bereits geladene Daten**, wie die bestehende Küchen-Tag-Filterung, nicht über einen erneuten Server-Aufruf pro Filterwechsel. Konsistent mit dem bestehenden Verhalten der Seite, spürbar schneller beim Umschalten, und die aktuelle Datenmenge rechtfertigt keinen serverseitigen Umweg.
5. **Die bestehende Gast-/Trial-Einschränkung (`is_guest_visible`) bleibt als separate, zusätzliche Prüfung bestehen** und wirkt unabhängig vom neuen Eigentümer-Filter weiter — ein restricted Nutzer sieht innerhalb von "Lukas' Rezepte" weiterhin nur die freigegebene Teilmenge.

### D) Abhängigkeiten (Pakete)

Keine neuen Pakete. Eine Datenbank-Migration (neues Feld + aktualisierte Zugriffsregeln) ist nötig, aber keine neue Bibliothek.

## Implementation Notes (Backend)

- **Migration `proj30_recipe_ownership`** (live angewendet): `recipes.owner_id uuid null references auth.users(id) on delete cascade` + Index. Ersetzt die beiden bisherigen "jeder sieht alles"-SELECT-Policies auf `recipes` durch `owner_id IS NULL` (anon) bzw. `owner_id IS NULL OR auth.uid() = owner_id` (authenticated).
- **Wichtiger Fund während der Umsetzung:** `recipe_ingredients` hatte eine eigene, bisher unconditional-`true`-Policy für authentifizierte Nutzer — ohne Anpassung hätten private Rezepte zwar in der Listing-Query verborgen, ihre Zutaten aber trotzdem für jeden lesbar geblieben (Detail-Leck). Policy entsprechend auf dieselbe Sichtbarkeitsregel umgestellt (Zutat sichtbar, wenn übergeordnetes Rezept sichtbar ist).
- `src/types/database.ts` neu generiert (`generate_typescript_types`) — ohne das schlug `tsc` mit `SelectQueryError` an jeder Stelle fehl, die `recipes` abfragt (28 neue Fehler durch die stale Typen, jetzt wieder 0).
- `src/app/rezepte/page.tsx`: `owner_id` mitgeladen, `isOwn` pro Rezept berechnet, neuer `showEigeneFilter`-Prop (= eingeloggt, nicht anonym) an `RezeptBibliothek` durchgereicht.
- `src/components/rezept-bibliothek.tsx`: neue Filter-Leiste (Alle/Lukas'/Eigene), Leerzustand für "Eigene Rezepte" ohne Inhalte.
- **Zwei Bugs am bestehenden Paywall-Sperrbildschirm gefunden und mitbehoben** (nicht Teil der ursprünglichen Spec, aber direkte Konsequenz der neuen Eigentümerschaft): sowohl `src/app/rezept/[id]/page.tsx` als auch `src/app/api/rezepte/[id]/route.ts` sperrten bisher jedes nicht-`is_guest_visible`-Rezept für restricted-Nutzer — das hätte ohne Fix auch die EIGENEN Rezepte eines Nutzers mit abgelaufenem Trial gesperrt, obwohl er sie selbst angelegt hat. Beide Stellen prüfen jetzt zusätzlich `!isOwn`.
- `src/app/api/rezepte/vorschlaege/route.ts`: bewusst NICHT geändert — verlässt sich auf die neue RLS-Policy (nutzt den nutzer-eigenen Client), Kommentar ergänzt zur Nachvollziehbarkeit.
- Admin-Editor (`/api/admin/rezepte`) unverändert — Insert setzt weiterhin kein `owner_id`, Rezepte bleiben automatisch offiziell.

**Verifiziert:** `next build` erfolgreich, 277/277 Vitest-Tests grün (4 neu: eigene-Rezepte-Bypass + fremdes-Rezept-Ablehnung am Paywall-Check), ESLint sauber, `tsc` ohne neue Fehler, Supabase Security Advisor geprüft (keine neuen Probleme — die neuen "anonymous access" Hinweise für `recipes`/`recipe_ingredients` sind derselbe erwartete Musterfall wie bei anderen Tabellen mit PROJ-19-Gast-Sessions). Live-Smoke-Test gegen den Dev-Server: `/rezepte` und `/rezept/[id]` laden weiterhin fehlerfrei, "Eigene Rezepte"-Filter bleibt für einen unauthentifizierten Request korrekt unsichtbar.

**Update aus /qa:** Das Zwei-Identitäten-Szenario (privates Rezept vs. fremder Zugriff) wurde nachträglich doch verifiziert — per SQL wurde für den echten E2E-Testnutzer ein privates Test-Rezept angelegt (da PROJ-31 noch keine Anlage-UI liefert) und per Playwright gegen einen echten Gast-Kontext getestet. Ergebnis und ein dabei gefundener Bug: siehe QA Test Results unten.

## QA Test Results

**Tested:** 2026-08-04
**App URL:** http://localhost:3000/rezepte
**Tester:** QA Engineer (AI)

### Testmethode

Anders als der Admin-Rezept-Editor (PROJ-24/PROJ-29) sind `/rezepte` und `/rezept/[id]` öffentliche bzw. nutzerseitige Routen — der reguläre E2E-Testnutzer (`qa-test@endlichsatt.dev`, kein Admin nötig) reicht hier aus. Da PROJ-31 (Anlage-UI für eigene Rezepte) noch nicht existiert, wurde für einen echten Zwei-Identitäten-Test ein privates Test-Rezept direkt per SQL für den Testnutzer angelegt (`owner_id` = Testnutzer-ID, Titel `"QA-Test: Privates Rezept PROJ-30"`, id `c5e87274-db3a-427d-bc69-175a96371b8e`). Bewusst NICHT wieder gelöscht — folgt demselben Muster wie das bestehende PROJ-24-Referenzrezept ("echtes Rezept statt Wegwerf-Fixture", siehe `tests/PROJ-24-rezept-zutaten-gruppierung.spec.ts`) und dient als dauerhafte Regressionsbasis für `tests/PROJ-30-rezept-eigentuemerschaft-filter.spec.ts`.

### Acceptance Criteria Status

#### Datenmodell
- [x] Bestehende Rezepte bleiben ohne Eigentümer (offiziell) — per SQL-Abfrage direkt verifiziert, alle Bestandsrezepte haben `owner_id = null`
- [x] Admin-Editor legt weiterhin eigentümerlose Rezepte an — Code-Review: Insert-Statement setzt `owner_id` nicht, Spalte defaultet auf `null`

#### Sichtbarkeit & Datenschutz
- [x] Nutzer B sieht Nutzer A's privates Rezept nirgends in der Bibliothek — E2E-Test grün ("kann ein fremdes privates Rezept nicht über die Bibliothek finden")
- [x] **BUG-1 behoben** — direkter URL-Aufruf eines fremden privaten Rezepts liefert jetzt korrekt HTTP 404 (Daten selbst leakten nie — siehe Bug-Details)
- [x] "Eigene Rezepte"-Filter für Gäste nicht sichtbar — E2E-Test grün

#### Filter
- [x] "Alle Rezepte" ist Standard und zeigt offizielle + eigene kombiniert — E2E-Test grün
- [x] "Lukas' Rezepte" zeigt nur offizielle Rezepte, blendet eigene aus — E2E-Test grün
- [x] "Eigene Rezepte" zeigt nur eigene Rezepte — E2E-Test grün
- [x] Leerzustand bei "Eigene Rezepte" ohne Inhalte — Code-Review (Text vorhanden), nicht separat per E2E geprüft, da der Testnutzer aktuell ein eigenes Rezept hat (Leerzustand würde dessen Sichtbarkeits-Test widersprechen)
- [x] Restricted-Nutzer sehen innerhalb "Lukas' Rezepte" weiterhin nur die `is_guest_visible`-Teilmenge — Code-Review, bestehende Logik unverändert, durch bestehende PROJ-11-Tests indirekt abgedeckt

### Edge Cases Status
- [x] Account-Löschung löscht eigene Rezepte mit — Code-Review: `ON DELETE CASCADE` auf der Foreign Key, in der DB direkt verifiziert
- [x] Rezept-Vorschläge nach Mahlzeit-Analyse berücksichtigen keine fremden privaten Rezepte — durch RLS auf Datenbankebene sichergestellt (Route nutzt den nutzer-eigenen Client), Policy direkt inspiziert
- [x] Eigenes Rezept wird nie durch die Paywall gesperrt (weder Anzeige als "locked" noch Zugriffsverweigerung) — E2E-Test grün ("kann das eigene private Rezept direkt über die URL öffnen"), zusätzlich 2 neue Vitest-Tests für die API-Route

### Security Audit Results
- [x] Autorisierung: fremde private Rezepte sind für andere Nutzer inhaltlich nicht einsehbar — E2E- und Vitest-verifiziert (siehe oben); einzige Abweichung ist der falsche HTTP-Status, nicht die Daten selbst (siehe BUG-1)
- [x] RLS direkt in der Datenbank inspiziert (nicht nur über die App-Logik angenommen) — Policy-Text für `recipes` und `recipe_ingredients` per SQL abgefragt und exakt wie beabsichtigt vorgefunden
- [x] Supabase Security Advisor: keine neuen Probleme, nur der erwartete "anonymous access via authenticated policy"-Hinweis (PROJ-19-Musterfall, betrifft bereits mehrere andere Tabellen)
- [x] Admin-Bereich unverändert und weiterhin korrekt abgesichert — PROJ-9-Regressionssuite (9/9) erneut grün

### Regression Testing
- [x] Vitest-Gesamtsuite: 277/277 grün
- [x] `tsc`: keine neuen Fehler (7 vorbestehende, unabhängige Fehler unverändert)
- [x] ESLint: sauber
- [x] `next build`: erfolgreich
- [x] PROJ-9-E2E-Suite (Admin-Rezept-Security, direkt angrenzend): 9/9 grün
- [x] **Behoben zusammen mit BUG-1:** `tests/PROJ-8-rezeptbibliothek.spec.ts` — "Nicht-existierendes Rezept zeigt 404" war vorbestehend rot (200 statt 404, per `git stash` als Nicht-PROJ-30-Regression verifiziert), läuft nach dem Fix wieder grün.

### Bugs Found

#### BUG-1 (behoben): `notFound()` lieferte HTTP 200 statt 404 — betraf fremde private Rezepte UND generell alle nicht-existierenden Rezepte
- **Severity:** Medium (nicht High/Critical — siehe Begründung)
- **Steps to Reproduce:**
  1. Als Gast (kein Login) `/rezept/<id-eines-fremden-privaten-rezepts>` aufrufen
  2. Erwartet: HTTP 404
  3. Tatsächlich (vor Fix): HTTP 200, Seite zeigte aber schon vorher korrekt den "nicht gefunden"-Zustand — kein Titel, keine Zutaten, keine Zubereitung des fremden Rezepts waren im Seiteninhalt enthalten (per `curl` verifiziert: `<title>` blieb generisch "endlichsatt", 0 Treffer für den fremden Rezepttitel im HTML)
  4. Reproduzierbar auch mit einer komplett erfundenen UUID (kein Zusammenhang mit Eigentümerschaft) — betraf also die generelle `notFound()`-Mechanik in `/rezept/[id]`, nicht speziell PROJ-30
- **Warum nicht High/Critical:** Die eigentliche Schutzfunktion (keine fremden Rezeptdaten sichtbar) funktionierte schon vor dem Fix korrekt — bestätigt durch Seiteninhalt-Prüfung, nicht nur Status-Code. Es war ein falscher HTTP-Status auf einer inhaltlich bereits korrekten "nicht gefunden"-Seite, kein Datenleck.
- **Root Cause:** Next.js' eigene Dokumentation bestätigt dies als bekanntes Verhalten: `/rezept/[id]` liegt hinter `loading.tsx` (Suspense-Streaming) — sobald der Response-Body zu streamen beginnt, sind die Header inkl. Status-Code bereits verschickt (Status 200), bevor `notFound()` innerhalb der Suspense-Boundary greift. Next.js dokumentiert dies explizit unter [loading.js — Status Codes](https://nextjs.org/docs/app/api-reference/file-conventions/loading#status-codes) und empfiehlt als Lösung, die Existenzprüfung in `proxy` (ehem. `middleware.ts`) vorzuziehen, bevor überhaupt gestreamt wird.
- **Fix:** `middleware.ts` prüft jetzt für `/rezept/[id]`-Pfade vorab per leichtgewichtiger Existenzabfrage (`select('id')`, respektiert RLS), ob das Rezept für den anfragenden Nutzer sichtbar ist. Falls nicht: `NextResponse.rewrite(request.url, { status: 404 })` — erzwingt den korrekten Status, bevor die Seite überhaupt zu rendern beginnt. Die Seite selbst lädt weiterhin die vollen Daten unverändert; der Fix betrifft ausschließlich den Status-Code.
- **Verifiziert:** Ursprünglich in lokaler `next dev` reproduziert, aber `next dev`/Turbopack führt `middleware.ts` in diesem Projekt aktuell überhaupt nicht aus (separater, hier entdeckter Dev-Only-Befund — siehe Hinweis unten). Fix daher gegen einen echten Produktions-Build verifiziert (`next build` + `next start`): alle 4 Fälle (fremdes privates Rezept, nicht-existierende ID, ungültiges UUID-Format, eigenes/offizielles Rezept) liefern jetzt den korrekten Status. Zusätzlich die volle PROJ-30-E2E-Suite (8/8) gegen den Produktions-Build grün, inkl. des zuvor roten BUG-1-Tests.
- **Wichtiger Nebenfund:** `npm run dev` (Turbopack) führt `middleware.ts` in dieser lokalen Umgebung nicht aus — selbst der etablierte, produktiv funktionierende `/historie`-Redirect (PROJ-6/19) greift lokal im Dev-Modus nicht, in Produktion (`app.mehralsabnehmen.de/historie` → 307 zu `/konto`) aber einwandfrei. Das ist unabhängig von diesem Fix und betrifft jede Middleware-Funktionalität lokal — für zuverlässiges manuelles/E2E-Testen von Middleware-Verhalten lokal `next build && next start` statt `next dev` verwenden.

### Summary
- **Acceptance Criteria:** 12/12 bestanden (nach BUG-1-Fix)
- **Bugs Found:** 1 total (1 Medium) — gefunden und behoben, verifiziert gegen Produktions-Build
- **Security:** Pass — Autorisierung hielt durchgehend, kein Datenleck zu keinem Zeitpunkt
- **Production Ready:** YES
- **Recommendation:** Deploy. Separater Hinweis (kein Blocker): lokales `next dev` führt `middleware.ts` nicht aus — bei künftigen Middleware-Änderungen lokal gegen `next build && next start` statt `next dev` verifizieren.

## Deployment
_To be added by /deploy_
