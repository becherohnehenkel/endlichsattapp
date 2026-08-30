# PROJ-36: Ernährung-Hub (Übersichtsseite)

## Status: Approved
**Created:** 2026-08-30
**Last Updated:** 2026-08-30

## Dependencies
- Requires: PROJ-35 (Bottom-Navigation & Kontobereich-Neuordnung) — der "Ernährung"-Tab existiert bereits, `/ernaehrung` ist aktuell noch ein Alias auf `/rezepte`
- Requires: PROJ-8 (Rezeptbibliothek) — Zielseite für den "Rezepte"-Eintrag, Route wird in diesem Feature verschoben
- Requires: PROJ-19 (Gast-Modus) — Zugriffsregeln für Gäste bleiben unverändert bestehen
- Betroffen (nicht blockierend): PROJ-25 (KI-Hinweis auf Ergebnisseiten), PROJ-33/PROJ-34 (Geschmacks-Score / Art of Eating) — deren interne Links auf `/wie-esse-ich-richtig` werden auf den neuen Pfad aktualisiert
- Vorbereitend für: PROJ-37 (So geht abnehmen), PROJ-38 (Emotionales Essen), PROJ-39 (Heißhunger), PROJ-40 (Kalorien), PROJ-41 (Kalorien zählen) — diese füllen die hier angelegten Platzhalter-Routen mit echtem Inhalt

## User Stories
- Als Nutzer möchte ich über den "Ernährung"-Tab eine Übersicht aller ernährungsbezogenen Bereiche sehen, damit ich schnell zum gewünschten Thema navigieren kann.
- Als Nutzer möchte ich auf jeder Unterseite erkennen, dass ich mich innerhalb von "Ernährung" befinde, und mit einem Tap dorthin zurückkommen, damit ich mich nicht verirre.
- Als Nutzer mit einem alten Link/Bookmark zu `/rezepte`, `/saettigungsmatrix` oder `/wie-esse-ich-richtig` möchte ich automatisch auf die neue Seite weitergeleitet werden, damit nichts kaputtgeht.
- Als Nutzer möchte ich, wenn ich auf "So geht abnehmen", "Emotionales Essen", "Heißhunger", "Kalorien" oder "Kalorien zählen" tippe, eine erkennbare (wenn auch inhaltlich noch leere) Seite sehen statt eines Fehlers.
- Als Gast (PROJ-19) möchte ich den Ernährung-Hub und die bereits heute öffentlichen Unterseiten weiterhin ohne Login nutzen können.

## Out of Scope
- Inhaltliche Ausgestaltung (Arbeitspunkte/Text) von "So geht abnehmen", "Emotionales Essen", "Heißhunger", "Kalorien", "Kalorien zählen" — deferred to PROJ-37 bis PROJ-41, Copy wird gemeinsam mit dem Nutzer erarbeitet, sobald sein Konzept geschärft ist
- Kcal-Rechner-Logik (Mifflin-St.-Jeor-Formel, PAL-Wert, Ziel-Anpassung) — Teil von PROJ-37
- Umzug von `/rezept/[id]`, `/rezept/neu`, `/rezept/[id]/bearbeiten` unter `/ernaehrung/*` — bewusst nicht Teil dieser Spec (siehe Product Decisions)
- Anpassung der Start-Seite (Rezept-Vorschau-Grid, bestehende Teaser-Cards) — deferred to "Start neu gliedern" (letzter Punkt der Gesamt-Restrukturierung, spätere PROJ-ID)
- Erweiterung der Bottom-/Top-Nav-Aktiv-Logik um eine manuelle "gehört zu Ernährung"-Zuordnung — verworfen zugunsten der URL-Verschachtelung (Option a), dadurch hinfällig

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Ernährung-Hub
- [ ] Angenommen ein Nutzer öffnet `/ernaehrung`, dann sieht er eine Liste von 8 Einträgen in dieser Reihenfolge: Rezepte, Richtig essen, Sättigungsmatrix, So geht abnehmen, Emotionales Essen, Heißhunger, Kalorien, Kalorien zählen.
- [ ] Angenommen ein Nutzer tippt auf einen Eintrag, dann navigiert er zur jeweiligen Unterseite unter `/ernaehrung/...`.
- [ ] Angenommen der Hub wird angezeigt, dann hat er weder Zurück-Pfeil noch Breadcrumb (Tab-Root-Seite wie Start/Analyse/Training/Check-In aus PROJ-35).

### Verschachtelte URLs & Redirects
- [ ] Angenommen ein Nutzer ruft `/rezepte` auf, dann wird er dauerhaft (308) zu `/ernaehrung/rezepte` weitergeleitet.
- [ ] Angenommen ein Nutzer ruft `/saettigungsmatrix` auf, dann wird er dauerhaft zu `/ernaehrung/saettigungsmatrix` weitergeleitet.
- [ ] Angenommen ein Nutzer ruft `/wie-esse-ich-richtig` auf, dann wird er dauerhaft zu `/ernaehrung/wie-esse-ich-richtig` weitergeleitet.
- [ ] Angenommen ein Nutzer befindet sich auf `/ernaehrung/rezepte` (oder einer der beiden anderen umgezogenen Seiten), dann funktioniert die komplette bisherige Funktionalität dieser Seite unverändert (keine inhaltliche Regression durch den Umzug).

### Breadcrumb & Zurück
- [ ] Angenommen ein Nutzer ist auf einer der 8 Unterseiten, dann zeigt der Header statt eines reinen Titels einen Breadcrumb "Ernährung / [Seitentitel]", wobei "Ernährung" antippbar ist und zu `/ernaehrung` führt.
- [ ] Angenommen ein Nutzer kam über den Ernährung-Hub auf eine Unterseite, wenn er auf "Zurück" tippt, dann landet er wieder auf `/ernaehrung`.
- [ ] Angenommen ein Nutzer kam über einen anderen Weg (z. B. Start-Seite-Teaser oder KI-Hinweis in einem Analyse-Ergebnis) auf `/ernaehrung/rezepte` oder `/ernaehrung/wie-esse-ich-richtig`, wenn er auf "Zurück" tippt, dann landet er wieder dort, wo er herkam (Browser-History via `router.back()`), unabhängig vom Breadcrumb.

### Platzhalter-Unterseiten
- [ ] Angenommen ein Nutzer tippt auf "So geht abnehmen", "Emotionales Essen", "Heißhunger", "Kalorien" oder "Kalorien zählen", dann landet er auf der jeweiligen neuen Route mit Breadcrumb-Header und dem Hinweis "Bald verfügbar" statt einem Fehler.

### Bestehende interne Links
- [ ] Angenommen Start-Seite, `rezept-vorschlaege.tsx`, `saettigungs-ergebnis.tsx`, `komponenten-ergebnis.tsx` und `art-of-eating-hinweis.tsx` verlinken auf Rezepte/Sättigungsmatrix/Richtig-essen, dann zeigen diese Links direkt auf die neuen `/ernaehrung/...`-Pfade (nicht auf die alten, redirecteten Pfade).

### Gast-Modus
- [ ] Angenommen ein Gast (keine Session oder anonym) ruft `/ernaehrung` oder eine der bereits heute öffentlichen Unterseiten auf, dann bleibt der Zugriff wie bisher ohne Login möglich.

## Edge Cases
- Alter, extern verlinkter Deep-Link zu `/rezepte` (z. B. Social-Media-Post, Suchmaschinen-Index) → 308-Redirect statt 404.
- Nutzer ruft eine der 5 neuen Platzhalter-Seiten direkt per URL auf, ohne eingeloggt zu sein → funktioniert ohne Login (siehe Gast-Modus-Kriterium).
- Tippfehler / nicht existierende Unterseite unter `/ernaehrung/...` → normales Next.js-404, kein Sonderfall nötig.
- Doppelte Redirects vermeiden: alte Pfade dürfen nirgends mehr intern referenziert werden (siehe "Bestehende interne Links"), sonst zusätzlicher Redirect-Hop bei jedem Klick.

## Technical Requirements (optional)
- Breadcrumb-UI nutzt die bereits installierte shadcn/ui-Komponente (`src/components/ui/breadcrumb.tsx`), aktuell ungenutzt im Projekt.
- Redirects alter → neuer Pfade über die deklarative `redirects()`-Funktion in `next.config.ts` (dauerhaft/308), analog zur bereits dort vorhandenen `headers()`-Funktion.

## Open Questions
- [ ] Genaue Untertitel-Texte je Hub-Zeile (kurzer Beschreibungstext pro der 8 Einträge) — folgt, sobald der Nutzer sein Content-Konzept geschärft hat.
- [ ] Exakte Reihenfolge/Copy der Arbeitspunkte in den 5 neuen Seiten — folgt gemeinsam in PROJ-37–41.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Rezepte bleibt eigene Unterseite statt direkt im Hub angezeigt zu werden | Rezeptbibliothek ist zu umfangreich für eine Hub-Zeile; alle 8 Themen bleiben gleichrangige, getrennte Einträge (Option a aus der Diskussion um Sammel-Card vs. Einzeleinträge) | 2026-08-30 |
| Die 5 neuen Seiten folgen später dem "Arbeitspunkte"-Muster von `art-of-eating-guide.tsx` (nummerierte Schritte, Fortschritt, „Verstanden"-Buttons) statt reiner Akkordeon-Texte | Nutzerwunsch nach mehr Engagement/Aktion statt reinem Lesen; im Detail Teil von PROJ-37–41 | 2026-08-30 |
| URLs werden unter `/ernaehrung/*` verschachtelt (Option a) statt die Nav-Aktiv-Logik um eine Sonderfall-Liste zu erweitern (Option b) | Sauberere URL-Struktur, native Aktiv-Markierung der Nav ohne Sonderfall-Logik — bewusste Nutzerentscheidung nach Abwägung beider Optionen | 2026-08-30 |
| Nur die 3 Hub-Zielseiten (Rezepte, Sättigungsmatrix, Richtig-essen) ziehen um, nicht `/rezept/[id]` & Co. | Rezept-Detailseiten werden aus vielen anderen Kontexten verlinkt (Historie, Mahlzeit-Details, Admin) und sind nicht Teil des Hub-Menüs selbst — Umzug dort wäre unverhältnismäßig größerer Blast-Radius ohne klaren Navigations-Nutzen | 2026-08-30 |
| Alte Pfade bekommen dauerhafte 308-Redirects statt gelöscht zu werden | Bestehende Bookmarks, geteilte Links und Suchmaschinen-Indexierung dürfen nicht brechen | 2026-08-30 |
| Breadcrumb ersetzt den bisherigen reinen Seitentitel im Header (keine zusätzliche Zeile) | Spart Platz auf Mobile, macht "Ernährung" als übergeordneten Kontext direkt antippbar | 2026-08-30 |
| Fünf neue Content-Seiten als Platzhalter ("Bald verfügbar") statt inaktiver Icons | Konsistent mit PROJ-35-Vorgehen bei Training/Check-In — keine toten Links, Struktur schon sichtbar | 2026-08-30 |
| Copy/Inhalte der 5 neuen Seiten bewusst offen gelassen | Nutzer arbeitet eigenes Konzept noch aus, gemeinsame Erarbeitung folgt in PROJ-37–41 | 2026-08-30 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Gemeinsame Header-Komponente (Zurück + Breadcrumb + Konto) für alle 8 Unterseiten statt 8x Copy-Paste | Anders als bei PROJ-35 brauchen hier alle 8 Seiten ab sofort exakt denselben neuen Header — Duplizierung würde sofort 8 identische Stellen für spätere Änderungen erzeugen | 2026-08-30 |
| Redirects zentral über `redirects()` in `next.config.ts` statt einzelner Redirect-Seiten | Standard-Next.js-Ansatz, kein zusätzlicher Seiten-Ladevorgang, dauerhaft (308) für Suchmaschinen/Bookmarks, gleiche Datei wie die bestehenden Security-Header | 2026-08-30 |
| Keine Änderung an bottom-nav.tsx/top-nav.tsx nötig | Aktiv-Markierung prüft bereits per URL-Präfix (`pathname.startsWith('/ernaehrung')`) — matched automatisch auch alle neuen verschachtelten Unterseiten | 2026-08-30 |
| Kein Backend/API-Bedarf für dieses Feature | Reine Oberflächen- und Routing-Änderung, keine neuen Daten | 2026-08-30 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component-Struktur
```
Ernährung-Hub (/ernaehrung) — Server Component, Tab-Root
├── Header (Titel "Ernährung" + Konto-Icon — kein Zurück, kein Breadcrumb)
└── Liste mit 8 Zeilen (Titel + Untertitel + Pfeil), je ein Link zu:
    ├── Rezepte              → /ernaehrung/rezepte
    ├── Richtig essen        → /ernaehrung/wie-esse-ich-richtig
    ├── Sättigungsmatrix     → /ernaehrung/saettigungsmatrix
    ├── So geht abnehmen     → /ernaehrung/so-geht-abnehmen      (Platzhalter)
    ├── Emotionales Essen    → /ernaehrung/emotionales-essen     (Platzhalter)
    ├── Heißhunger           → /ernaehrung/heisshunger           (Platzhalter)
    ├── Kalorien             → /ernaehrung/kalorien              (Platzhalter)
    └── Kalorien zählen      → /ernaehrung/kalorien-zaehlen      (Platzhalter)

NEU: Gemeinsame Header-Komponente für alle 8 Unterseiten
├── Zurück-Button (Browser-History, router.back())
├── Breadcrumb "Ernährung / [Seitentitel]" ("Ernährung" antippbar → /ernaehrung)
└── Konto-Icon
→ verwendet von: Rezepte, Sättigungsmatrix, Richtig-essen (alle drei umgezogen) + den 5 neuen Platzhalterseiten
```

### Datenmodell
Keine neuen Datenbank-Tabellen oder -Felder. Reine Struktur-/Routing-Änderung.

### Backend-Bedarf
Keiner — reines Frontend-/Routing-Feature.

## Implementation Notes (Frontend)
- Neu: `src/app/ernaehrung/page.tsx` — echter Hub mit 8 Zeilen (ersetzt den PROJ-35-Alias auf `/rezepte`).
- Neu: `src/components/ernaehrung-sub-header.tsx` — gemeinsamer Zurück+Breadcrumb+Konto-Header (shadcn `Breadcrumb`), genutzt von allen 8 Unterseiten.
- Verschoben (per `git mv`, Historie erhalten): `src/app/rezepte/*` → `src/app/ernaehrung/rezepte/*`, `src/app/saettigungsmatrix/page.tsx` → `src/app/ernaehrung/saettigungsmatrix/page.tsx`, `src/app/wie-esse-ich-richtig/page.tsx` → `src/app/ernaehrung/wie-esse-ich-richtig/page.tsx`. Alte `back-button.tsx`-Dateien entfernt (Funktionalität jetzt im gemeinsamen Header).
- Neu: 5 Platzhalterseiten unter `src/app/ernaehrung/{so-geht-abnehmen,emotionales-essen,heisshunger,kalorien,kalorien-zaehlen}/page.tsx`.
- `next.config.ts`: `redirects()` für die 3 alten Pfade (308, dauerhaft) ergänzt.
- Interne Links aktualisiert: `src/app/page.tsx`, `src/app/rezept/neu/page.tsx`, `src/app/rezept/[id]/own-recipe-actions.tsx`, `src/components/{rezept-vorschlaege,saettigungs-ergebnis,art-of-eating-hinweis,komponenten-ergebnis}.tsx`.
- Bottom-/Top-Nav unverändert — Aktiv-Markierung für "Ernährung" funktioniert automatisch auch auf den neuen verschachtelten Pfaden (per URL-Präfix bestätigt).
- Hub-Zeilen-Untertitel sind bewusst vorläufige Platzhalter-Texte (siehe Open Questions) — Icons: `ChefHat`, `Utensils`, `LayoutGrid`, `Calculator`, `HeartHandshake`, `Flame`, `Apple`, `ListChecks` (alle `lucide-react`).
- `npm run build`, `npm run lint`, `npm test` (390/390) fehlerfrei. Manuell verifiziert: Hub-Liste, Breadcrumb+Zurück auf Unterseite, migrierte Rezepte-Seite (Filter/Gast-Banner/Suche intakt), alle 3 Redirects (308) und alle 8 neuen/verschobenen Routen (200) per curl.

## QA Test Results

**Tested:** 2026-08-30
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Ernährung-Hub
- [x] Zeigt alle 8 Einträge in korrekter Reihenfolge mit korrekten Ziel-URLs
- [x] Kein Zurück-Pfeil, kein Breadcrumb auf dem Hub selbst (Tab-Root)

#### Verschachtelte URLs & Redirects
- [x] `/rezepte`, `/saettigungsmatrix`, `/wie-esse-ich-richtig` redirecten dauerhaft (308) auf die neuen `/ernaehrung/...`-Pfade
- [x] `/ernaehrung/rezepte` liefert unveränderte volle Funktionalität (Suche, Filter, Gast-Banner) — keine Regression durch den Umzug
- [x] Query-Parameter bleiben beim Redirect erhalten (`?foo=bar` → `/ernaehrung/rezepte?foo=bar`), kein doppelter Redirect-Hop

#### Breadcrumb & Zurück
- [x] Alle 8 Unterseiten zeigen den Breadcrumb "Ernährung / [Titel]" + Konto-Icon
- [x] "Ernährung" im Breadcrumb verlinkt korrekt auf `/ernaehrung`
- [x] "Zurück" von einer Unterseite, die vom Hub aus geöffnet wurde, führt zurück zum Hub

#### Platzhalter-Unterseiten
- [x] Alle 5 neuen Seiten laden ohne Login (Status < 400) und zeigen "Bald verfügbar"

#### Bestehende interne Links
- [x] Start-Seite, `rezept-vorschlaege.tsx`, `saettigungs-ergebnis.tsx`, `komponenten-ergebnis.tsx`, `art-of-eating-hinweis.tsx` verlinken direkt auf die neuen Pfade (keine unnötigen Redirect-Hops)

#### Gast-Modus
- [x] Gast kann Hub und alle bereits öffentlichen Unterseiten ohne Login öffnen

#### Regression (Nav aus PROJ-35)
- [x] "Ernährung"-Tab in Bottom-Nav bleibt auf allen 8 Unterseiten aktiv markiert (automatisch durch URL-Präfix, keine Code-Änderung an bottom-nav.tsx/top-nav.tsx nötig)

### Edge Cases Status

#### EC-1: Alter Deep-Link zu `/rezepte`
- [x] 308-Redirect statt 404, per curl bestätigt

#### EC-2: Tippfehler unter `/ernaehrung/...`
- [x] Normales Next.js-404, kein Sonderfall nötig

#### EC-3: Redirect-Kette / doppelte Redirects
- [x] Einfacher Redirect-Hop bestätigt (`/ernaehrung/rezepte` selbst liefert direkt 200, kein zweiter Redirect)

### Security Audit Results
- [x] Keine Secrets/Env-Variablen im HTML-Response der neuen Seiten (per `curl` geprüft)
- [x] Kein neuer Auth-Bypass: Zugriffsregeln (Gast/eingeloggt) unverändert übernommen, Middleware nicht angetastet
- [x] Redirects sind rein pfadbasiert (keine offene Redirect-Schwachstelle — Ziel ist statisch in `next.config.ts` definiert, kein nutzergesteuerter Parameter)

### Bugs Found
Keine.

### Beobachtung (kein Bug, zur Kenntnisnahme)
Auf **Desktop** ist der neue Breadcrumb-Header (`ErnaehrungSubHeader`) — wie alle bestehenden Seiten-Header im Projekt — `md:hidden`. Auf Desktop gibt es daher keinen sichtbaren Breadcrumb auf den 8 Unterseiten; die Orientierung läuft dort ausschließlich über die aktive Markierung des "Ernährung"-Tabs in der Top-Nav. Das entspricht 1:1 dem bestehenden App-weiten Muster (noch nie gab es Desktop-spezifische Sub-Header) und wurde in der Architektur-Diskussion nicht explizit als Desktop-Anforderung besprochen — daher kein Bug, aber bewusst dokumentiert, falls das für den Nutzer relevant ist.

### Regressionstest

- **Vitest:** 390/390 grün, keine Regression.
- **E2E — neue Datei `tests/PROJ-36-ernaehrung-hub.spec.ts`:** 22/22 grün.
- **E2E — PROJ-34 (Art of Eating):** 1 Test hatte einen exakten `href`-Match auf den alten Pfad (`/wie-esse-ich-richtig`) — durch die URL-Verschachtelung erwartungsgemäß obsolet. Aktualisiert auf `/ernaehrung/wie-esse-ich-richtig`, jetzt 5/5 grün.
- **E2E — 7 weitere potenziell betroffene Dateien geprüft** (PROJ-11, PROJ-19, PROJ-22, PROJ-30, PROJ-31, PROJ-32, zusätzlich zu PROJ-34): 8 Fehlschläge insgesamt, davon 7 **nicht** durch PROJ-36 verursacht — betreffen Foto-Scan-Kontingente, Trial-Countdown, Subscription-Status (PROJ-11) und Testdaten-Reste (PROJ-30/31/32/22), reproduzieren identisch in Isolation ohne jede Beteiligung der von PROJ-36 geänderten Dateien. Diese decken sich mit dem bereits nach PROJ-35 separat geflaggten Test-Infrastruktur-Thema (gemeinsamer Test-Account) — nicht erneut gemeldet, um Duplikate zu vermeiden.

### Summary
- **Acceptance Criteria:** 14/14 passed
- **Bugs Found:** 0
- **Security:** Pass — keine neue Angriffsfläche, keine offene Redirect-Schwachstelle
- **Production Ready:** YES
- **Recommendation:** Deploy. Die vorbestehende Test-Account-Flakiness (separat geflaggt) blockiert PROJ-36 nicht.

## Deployment
_To be added by /deploy_
