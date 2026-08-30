# PROJ-36: Ernährung-Hub (Übersichtsseite)

## Status: Planned
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
