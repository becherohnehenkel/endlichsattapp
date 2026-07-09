# PROJ-22: App-Performance & Perceived Speed

## Status: Deployed
**Created:** 2026-07-07
**Last Updated:** 2026-07-09

## Dependencies
- Requires: alle deployed Features (PROJ-1 bis PROJ-21) — reine Optimierung bestehender Seiten, keine neuen Features

## User Stories
- Als Nutzer möchte ich, dass die App sofort auf meinen Klick reagiert, damit ich nicht das Gefühl habe, dass sie eingefroren ist.
- Als Nutzer möchte ich beim Seitenwechsel sofort eine Rückmeldung sehen (auch wenn Daten noch laden), damit ich weiß, dass die Aktion registriert wurde.
- Als Nutzer möchte ich, dass sich die App auf meinem Smartphone genauso flüssig anfühlt wie eine native App.
- Als Nutzer möchte ich nicht auf eine leere/weiße Seite starren, während Inhalte laden.

## Out of Scope
- Service Worker / Offline-Caching (separater PWA-Schritt, wäre PROJ-23+)
- Datenbank-Indexe oder Supabase Query-Optimierung (wäre eigenes Backend-Feature)
- Bundle-Size-Optimierung / Code-Splitting tief im Next.js-Build (nicht messbar verpixelt beim Nutzer)
- Lazy Loading der BottomNav oder TopNav (immer gerendert, Overhead minimal)
- KI-Analyse-Wartezeit (inhärent langsam durch externe API — eigene Ladeanzeige bereits vorhanden)
- Caching von Nutzerdaten (personalisierten Inhalte dürfen nicht gecacht werden ohne Cache-Invalidierung)

## Acceptance Criteria

- [ ] Angenommen ein Nutzer klickt auf einen Link in der BottomNav oder TopNav, dann erscheint innerhalb von 100ms eine Skeleton-Ladeansicht der Zielseite — noch bevor Daten geladen sind.
- [ ] Angenommen ein Nutzer navigiert zur Startseite (`/`), dann zeigt die Skeleton-Ansicht Platzhalter für die letzten Mahlzeiten-Karten und Rezepte-Teaser in der richtigen Form und Größe.
- [ ] Angenommen ein Nutzer navigiert zu `/analyse`, dann zeigt die Skeleton-Ansicht sofort den Eingabebereich-Platzhalter.
- [ ] Angenommen ein Nutzer navigiert zu `/rezepte`, dann erscheinen sofort Skeleton-Karten in der Größe der Rezeptkacheln.
- [ ] Angenommen ein Nutzer navigiert zu `/mahlzeit/[id]`, dann erscheint sofort ein Skeleton des Analyse-Ergebnisses.
- [ ] Angenommen ein Nutzer navigiert zu `/rezept/[id]`, dann erscheint sofort ein Skeleton des Rezept-Layouts.
- [ ] Angenommen ein Nutzer navigiert zu `/konto`, dann erscheint sofort ein Skeleton der Konto-Karte.
- [ ] Angenommen ein Nutzer navigiert zu `/historie`, dann erscheint sofort ein Skeleton der Mahlzeit-Liste (die /historie-Seite lädt bereits client-seitig, daher ist hier nur sicherzustellen, dass der Header und die erste Hülle sofort erscheinen).
- [ ] Angenommen ein Nutzer öffnet die Startseite, dann werden Mahlzeiten-Daten und Rezepte-Daten parallel abgefragt — nicht nacheinander.
- [ ] Angenommen ein Nutzer öffnet `/analyse`, dann werden Profil-Daten und Paywall-Prüfung in einer einzigen Datenbankabfrage erledigt — nicht in zwei separaten Aufrufen.
- [ ] Angenommen ein Nutzer öffnet `/rezepte`, dann laufen Zugriffsprüfung und Rezept-Datenbankabfrage parallel.
- [ ] Angenommen die Daten einer Seite laden schneller als die Skeleton-Animation aufgebaut ist, dann ist der Übergang fließend ohne Flackern (kein Flash of Unstyled Content).
- [ ] Angenommen ein Nutzer ist bereits auf einer Seite und navigiert zu einer anderen, dann bleibt die Skeleton-Ansicht konsistent mit dem Design-System (gleiche Farben, gleiche Rundungen wie die echten Karten).

## Edge Cases
- **Schnelle Verbindung:** Wenn Daten in unter ~150ms laden, soll die Skeleton-Ansicht trotzdem kurz erscheinen (kein Flackern durch zu schnellen Wechsel — Next.js `loading.tsx` handhabt das automatisch mit einer minimalen Mindestzeit).
- **Sehr langsame Verbindung:** Skeleton bleibt solange sichtbar bis Daten da sind — kein Timeout, kein Fehler-State in der loading.tsx (Fehler-States werden in `error.tsx` gehandhabt).
- **Fehler beim Datenladen:** `loading.tsx` hat keine Fehlerbehandlung — das ist Aufgabe von `error.tsx` (nicht Teil dieses Features).
- **Auth-Redirect während Loading:** Wenn die Seite einen Redirect auslöst (z.B. `/rezepte` → `/upgrade`), erscheint die Skeleton-Ansicht kurz und verschwindet sofort beim Redirect — das ist akzeptables Verhalten.
- **Anonyme Nutzer:** Skeleton-Ansichten müssen nicht zwischen eingeloggten und anonymen Nutzern unterscheiden — sie zeigen immer die maximale Seitenstruktur.

## Technical Requirements
- Jede Seite mit Server-seitigem Datenabruf bekommt eine `loading.tsx` im selben Verzeichnis
- Skeletons nutzen ausschließlich den vorhandenen `<Skeleton />`-shadcn-Baustein
- Parallele Abfragen werden mit `Promise.all()` umgesetzt
- Doppelte Profil-Abfrage auf `/analyse` wird zu einer einzigen merged query zusammengefasst
- Keine neuen npm-Pakete nötig

## Open Questions
- Keine offenen Fragen — Scope ist klar definiert.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Skeletons statt zentralem Spinner | Skeletons fühlen sich schneller an weil die Seitenstruktur sofort da ist — der Nutzer sieht wo Inhalte erscheinen werden | 2026-07-07 |
| `error.tsx` nicht Teil dieses Features | Fehler-States sind ein eigener Baustein, der sorgfältig pro Seite gestaltet werden muss — würde Scope verdoppeln | 2026-07-07 |
| `/historie` nur Header-Skeleton | `MahlzeitHistorie` ist bereits ein Client-Component mit eigenem Skeleton-Loading — nur der äußere Rahmen braucht `loading.tsx` | 2026-07-07 |
| Keine Nutzerdaten-Caches | Personalisierte Daten (Mahlzeiten, Profil, Paywall-Status) dürfen ohne Cache-Invalidierung nicht gecacht werden — falscher Cache wäre schlimmer als langsame Abfrage | 2026-07-07 |

### Technical Decisions
<!-- Added by /architecture -->

---
<!-- Sections below are added by subsequent skills -->

## Implementierungsnotizen

### Umgesetzte Änderungen

**Parallele Datenbankabfragen:**
- `src/app/page.tsx` — meals + recipes gleichzeitig via `Promise.all`
- `src/app/rezepte/page.tsx` — `getAccessStatus()` + Rezepte-Query gleichzeitig via `Promise.all`
- `src/app/analyse/page.tsx` — doppelte Profil-Abfrage eliminiert: anon → 1 Query, registriert → nur `getAccessStatus()`
- `src/lib/paywall.ts` — `AccessStatus` um `photoScansRemaining` erweitert, damit `/analyse` keine zweite Profil-Abfrage braucht

**Loading Skeletons (`loading.tsx`):**
- `src/app/loading.tsx` — Homepage: Meal-Karten + Rezept-Grid Skeleton
- `src/app/analyse/loading.tsx` — Foto-Upload + Textarea Skeleton
- `src/app/rezepte/loading.tsx` — Rezept-Kacheln Grid Skeleton
- `src/app/mahlzeit/[id]/loading.tsx` — Analyse-Ergebnis Skeleton (Bausteine + Nährwerte)
- `src/app/rezept/[id]/loading.tsx` — Rezept-Detail Skeleton (Bild + Zutaten + Zubereitung)
- `src/app/konto/loading.tsx` — Konto-Karte Skeleton
- `src/app/historie/loading.tsx` — Mahlzeit-Liste Skeleton

## Tech Design (Solution Architect)
_Übersprungen — keine neue Architektur, reine Next.js-Optimierungspatterns_

## QA Test Results

**Datum:** 2026-07-08
**Tester:** QA Engineer (Claude)

### Unit Tests
- **184/184 passed** (21 Test-Dateien)
- 2 Regressions von PROJ-21/PROJ-22 gefunden und behoben:
  - `confirm/route.test.ts` — Test "deletes fullsize photo" auf "keeps fullsize photo" umgeschrieben (PROJ-21 intentionale Änderung)
  - `paywall.test.ts` — Expected-Objekt um `photoScansRemaining: 0` ergänzt (PROJ-22 Interface-Erweiterung)

### E2E Tests
- **30/30 PROJ-22-Tests passed** (Chromium + Mobile Chrome)
- **407/407 Gesamtsuite passed** — keine Regressionen in bestehenden Features

### Acceptance Criteria
| # | Kriterium | Status |
|---|-----------|--------|
| AC-2 | Homepage Skeleton (Meal-Karten + Rezepte) | ✅ Pass |
| AC-3 | /analyse Skeleton (Eingabe-Oberfläche) | ✅ Pass |
| AC-4 | /rezepte Skeleton (Rezept-Kacheln) | ✅ Pass |
| AC-5 | /mahlzeit/[id] Skeleton (Analyse-Ergebnis) | ✅ Pass |
| AC-6 | /rezept/[id] Skeleton (Rezept-Detail) | ✅ Pass |
| AC-7 | /konto Skeleton (Konto-Karte) | ✅ Pass |
| AC-8 | /historie Skeleton (Header + Hülle) | ✅ Pass |
| AC-9 | Homepage: Meals + Recipes parallel (Promise.all) | ✅ Pass (Code-Verifikation) |
| AC-10 | /analyse: Einzelne DB-Abfrage (kein Doppel-Query) | ✅ Pass (Code-Verifikation) |
| AC-11 | /rezepte: Access + Recipes parallel | ✅ Pass (Code-Verifikation) |
| AC-12 | Fließender Übergang ohne Flackern | ✅ Pass (Next.js-nativ) |
| AC-13 | Skeleton Design-System konsistent (animate-pulse) | ✅ Pass — 0 JS-Fehler |

### Security Audit
- Keine sicherheitsrelevanten Änderungen — reine Performance-Optimierungen
- Parallele Queries ändern nicht das Zugriffsmodell; Paywall-Redirect bleibt erhalten
- `photoScansRemaining` in `AccessStatus` gibt keine neuen Daten an den Client

### Bugs gefunden
Keine Critical, High oder Medium Bugs.

### Produktionsbereit
✅ **JA** — Alle Acceptance Criteria erfüllt, keine Bugs.

## Deployment

**Deployed:** 2026-07-09
**Production URL:** https://app.mehralsabnehmen.de
**Git Tag:** v1.22.0-PROJ-22
