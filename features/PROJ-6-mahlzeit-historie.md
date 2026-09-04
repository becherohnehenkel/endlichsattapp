# PROJ-6: Mahlzeit-Historie

## Status: Deployed (Refinement: Sortierung & Pagination "Deployed")
**Created:** 2026-06-10
**Last Updated:** 2026-09-04

**Refinement (2026-09-04, Sortierung & Pagination):** Timeline-Reihenfolge umgedreht — neueste Mahlzeit jetzt oben statt unten (löst die ursprüngliche AC unten explizit ab). Initial werden nur die letzten 5 Mahlzeiten geladen (vorher 20); "Ältere Einträge laden" (jetzt unten in der Liste statt oben) holt danach in 10er-Schritten nach. Reiner Frontend-Change, keine DB-/API-Änderung nötig — die API sortierte bereits `created_at DESC` und wurde bislang im Frontend umgekehrt, das Umkehren fällt jetzt weg.

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure) — Mahlzeiten und Analysen werden aus `meals` + `meal_analyses` geladen
- Requires: PROJ-2 (User Authentication) — nur eingeloggte Nutzer sehen ihre eigene Historie
- Requires: PROJ-4 (KI-Analyse-Agent) — jeder Eintrag in der Timeline ist das Ergebnis einer Analyse
- Requires: PROJ-5 (Sättigungs-Einschätzung) — Antippen eines Eintrags öffnet die vollständige PROJ-5-Ergebnisseite

## User Stories
- Als Nutzer möchte ich meine vergangenen Mahlzeiten in einer scrollbaren Timeline sehen, damit ich einen Überblick bekomme was ich wann gegessen habe.
- Als Nutzer möchte ich eine vergangene Analyse antippen und die vollständigen Ergebnisse nochmal lesen können, damit ich frühere Verbesserungsvorschläge nachschlagen kann.
- Als Nutzer möchte ich als Neuer ohne Einträge eine klare Einladung zur ersten Analyse sehen, damit ich sofort verstehe was zu tun ist.
- Als Nutzer möchte ich eine neue Analyse direkt aus der Timeline starten können, ohne eine separate Seite aufrufen zu müssen.
- Als Nutzer möchte ich vergangene Einträge löschen können, damit ich die Kontrolle über meine gespeicherten Daten behalte.

## Out of Scope
- Kalenderansicht — deferred to PROJ-7 (Tagebuch & Inspiration)
- Filter- und Suchfunktion — deferred to PROJ-7
- Muster-Analyse und Insights über Zeit (z.B. "Diese Woche durchschnittlich mäßig sättigend") — deferred to PROJ-7
- Mahlzeiten teilen oder exportieren — Post-MVP
- Einträge nachträglich bearbeiten — Post-MVP (Analyse ist abgeschlossen und unveränderlich)

## Acceptance Criteria

### Timeline-Ansicht
- [x] ~~Angenommen der Nutzer ist eingeloggt und hat mindestens eine Analyse abgeschlossen, wenn er die App öffnet, dann sieht er eine scrollbare Timeline seiner Mahlzeiten — älteste oben, neueste unten.~~ → **Refinement 2026-09-04:** umgedreht — neueste Mahlzeit oben, älteste unten (Nutzerwunsch: die zuletzt analysierte Mahlzeit soll an erster Stelle stehen)
- [ ] Angenommen die Timeline angezeigt wird, dann zeigt jede Karte: Thumbnail (wenn Foto vorhanden, sonst ein neutrales Platzhalter-Icon), Datum und Uhrzeit, Gerichtsname oder Kurzbeschreibung, Gesamt-Sättigungsbewertung (sehr sättigend / mäßig sättigend / wenig sättigend) als farbiges Badge.
- [x] ~~Angenommen der Nutzer scrollt in der Timeline nach oben, dann werden ältere Einträge geladen (Infinite Scroll oder Pagination — Details in `/architecture`).~~ → bei `/frontend` als expliziter "Ältere Einträge laden"-Button umgesetzt statt automatischem Scroll-Trigger (siehe Decision Log); **Refinement 2026-09-04:** Button sitzt jetzt unten (war oben, passend zur alten Sortierung), initial 5 statt 20 Einträge, Nachladen in 10er- statt 20er-Schritten

### Eintrag öffnen
- [ ] Angenommen der Nutzer tippt auf eine Karte in der Timeline, wenn der Eintrag geöffnet wird, dann sieht er die vollständige PROJ-5-Ergebnisseite dieser Mahlzeit (6 Bausteine, Erklärung, Verbesserungsvorschläge, Rezept-Delta).
- [ ] Angenommen der Nutzer ist in der Detailansicht einer vergangenen Analyse, wenn er zurücknavigiert, dann landet er wieder an derselben Scroll-Position in der Timeline.

### Neue Analyse starten
- [ ] Angenommen der Nutzer ist in der Timeline, dann ist am unteren Rand immer ein kompakter "+ Neue Mahlzeit"-Button sichtbar.
- [ ] Angenommen der Nutzer tippt auf "+ Neue Mahlzeit", wenn der Button betätigt wird, dann öffnet sich der vollständige Analyse-Flow (PROJ-3 Eingabe-Screen).
- [ ] Angenommen eine neue Analyse abgeschlossen wurde, wenn der Nutzer zurück zur Timeline navigiert, dann erscheint die neue Mahlzeit als oberster Eintrag. *(Refinement 2026-09-04: ursprünglich "unterster" — überholt durch die umgedrehte Sortierung, siehe oben)*

### Eintrag löschen
- [ ] Angenommen der Nutzer möchte einen Eintrag löschen (z.B. via Swipe oder Long-Press), wenn die Löschaktion ausgelöst wird, dann erscheint ein Bestätigungsdialog ("Mahlzeit unwiderruflich löschen?").
- [ ] Angenommen der Nutzer bestätigt die Löschung, dann wird der Eintrag aus der Timeline entfernt und Foto/Thumbnail aus dem Storage gelöscht.

### Leerer Zustand
- [ ] Angenommen der Nutzer hat noch keine Mahlzeit analysiert, wenn er die App öffnet, dann sieht er keine leere Liste sondern eine freundliche Einladung (z.B. "Deine erste Analyse wartet. Was hast du heute gegessen?") mit dem "+ Neue Mahlzeit"-Button prominent in der Mitte.

## Edge Cases
- **Mahlzeit ohne Foto:** Karte zeigt ein neutrales Platzhalter-Icon statt Thumbnail — kein Fehler, kein leerer Bereich.
- **Sehr viele Einträge (100+):** Einträge werden paginiert oder per Infinite Scroll geladen — nicht alle auf einmal im DOM.
- **Netzwerkfehler beim Laden:** Fehlermeldung mit "Erneut versuchen"-Button; bereits geladene Einträge bleiben sichtbar.
- **Gleichzeitig neue Analyse laufend:** Wenn der Nutzer eine Analyse startet und zur Timeline zurückwechselt bevor sie fertig ist, erscheint noch kein Eintrag — kein Phantom-Eintrag.
- **Löschen schlägt fehl (Netzwerkfehler):** Eintrag bleibt erhalten, Fehlermeldung wird angezeigt.
- **Analyse-Ergebnis fehlt** (seltener Datenfehler): Karte zeigt "Analyse nicht verfügbar" statt leerem Inhalt.

## Technical Requirements
- **Mobile-first:** Timeline auf 320px+ vollständig nutzbar; Touch-Targets min. 44px; "+ Neue Mahlzeit"-Button immer im Thumb-Reach-Bereich (unten)
- **Scroll-Position:** Nach Rückkehr aus Detailansicht wird die exakte Scroll-Position der Timeline wiederhergestellt
- **Ladeperformance:** Thumbnails lazy-geladen; erste 5 Einträge sofort *(Refinement 2026-09-04: vorher 20)*, weitere per Klick auf "Ältere Einträge laden" in 10er-Schritten *(vorher 20er-Schritten, automatisch bei Scroll geplant — bei `/frontend` als expliziter Button umgesetzt)*
- **Datenquelle:** Nur Daten des eingeloggten Nutzers (RLS via Supabase — PROJ-1)

## Open Questions
- [ ] Soll der "+ Neue Mahlzeit"-Button als Fixed-Button über der Timeline schweben (immer sichtbar, auch mitten im Scroll) oder nur am Ende der Liste? — Details in `/architecture` / `/frontend`

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Chat-Timeline statt Kalender oder Grid | Natürlichster Mobile-Flow; kein Nav-Wechsel nötig; älteste oben, neueste unten wie in Messaging-Apps | 2026-06-10 |
| Kompakter Button statt eingebettetes Formular | Analyse-Flow ist zu komplex für Timeline-Einbettung; braucht eigenen Screen | 2026-06-10 |
| Einladung statt leerer Screen | Erster Eindruck entscheidet; Nutzer soll sofort wissen was er tun soll | 2026-06-10 |
| Löschen mit Bestätigungsdialog | Unwiderrufliche Aktion; Schutz vor versehentlichem Löschen | 2026-06-10 |
| Kein Bearbeiten von Einträgen | Analyse ist abgeschlossen und unveränderlich; Korrekturen erfordern neue Analyse | 2026-06-10 |
| Kalender/Filter/Insights deferred zu PROJ-7 | PROJ-6 = reiner Zugriff auf Verlauf; PROJ-7 = Arbeit mit dem Verlauf | 2026-06-10 |
| **Refinement 2026-09-04:** Sortierung umgedreht — neueste Mahlzeit oben statt unten | Löst die ursprüngliche Chat-Timeline-Analogie ("wie in Messaging-Apps") explizit ab — Nutzer wollte die zuletzt analysierte Mahlzeit direkt an erster Stelle sehen, nicht ans Ende scrollen müssen | 2026-09-04 |
| **Refinement 2026-09-04:** Initial nur 5 statt 20 Einträge, Nachladen in 10er- statt 20er-Schritten | Nutzerwunsch — kürzere initiale Ladezeit/Liste, "Ältere Einträge laden" für alles darüber hinaus | 2026-09-04 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `/` als History-Landingpage statt separater Route | Natürlicher App-Einstieg; Analyse-Flow bleibt unter `/analyse` | 2026-06-12 |
| API GET `/api/mahlzeiten` für Client-Side-Pagination | Server Component liefert erste 20; weitere per Fetch im Client | 2026-06-12 |
| `ORDER BY created_at DESC`, client-seitig reversed | Neueste zuerst aus DB, älteste oben in der Timeline | 2026-06-12 |
| `/mahlzeit/[id]` als eigene Route | Browser-Back stellt Scroll-Position nativ wieder her | 2026-06-12 |
| AnalysisResult aus separaten DB-Spalten rekonstruiert | Schema hat `macros_before`, `satiety_scores_before` etc. statt single `result`-Spalte | 2026-06-12 |
| Floating "Neue Mahlzeit"-Button (fixed bottom-right) | Immer im Thumb-Reach-Bereich auf Mobile; App-Chrome bleibt minimal | 2026-06-12 |
| Backend inline mit Frontend implementiert | Keine neuen DB-Migrationen nötig; nur API-Routen für Paginierung und Delete | 2026-06-12 |
| **Refinement 2026-09-04:** client-seitiges Reversal entfernt — Liste wird jetzt 1:1 in der API-Reihenfolge (`created_at DESC`) angezeigt und beim Nachladen einfach ans Ende angehängt (`[...prev, ...neue]` statt vorher `[...neue, ...prev]` mit Reverse) | Vereinfacht den Code spürbar — die API sortierte schon immer newest-first, das bisherige Reversal war nur nötig, um die (jetzt nicht mehr gewünschte) oldest-first-Anzeige zu erzeugen. `limit`/`offset`-Parameter der bestehenden API-Route decken 5- bzw. 10er-Schritte bereits ab (Cap bei 50), keine Backend-Änderung nötig | 2026-09-04 |
| **Refinement 2026-09-04:** "Ältere Einträge laden"-Button von oberhalb auf unterhalb der Liste verschoben, Pfeil-Icon von ↑ auf ↓ gedreht | Folgt zwingend aus der umgedrehten Sortierung — ältere Einträge liegen jetzt am Ende der Liste, nicht mehr am Anfang | 2026-09-04 |

---

## Tech Design (Solution Architect)
_Inline mit /frontend implementiert — kein separater Architecture-Pass nötig (keine neue DB-Schema-Änderung)._

## Implementation Notes (Frontend, Refinement 2026-09-04): Sortierung & Pagination
Reine Frontend-Änderung, kein Backend-/DB-Bezug — die API (`GET /api/mahlzeiten`) sortierte bereits `created_at DESC` und unterstützte beliebige `limit`/`offset`-Werte (Cap bei 50).

- `src/components/mahlzeit-historie.tsx`: beide `.reverse()`-Aufrufe entfernt (Initial-Fetch und `loadMore`) — die Liste übernimmt jetzt direkt die API-Reihenfolge. Initial-Fetch von `limit=20` auf `limit=5` reduziert, `loadMore` von `limit=20` auf `limit=10`. Beim Nachladen werden neue Einträge jetzt ans Ende angehängt (`[...prev, ...neue]`) statt an den Anfang vorangestellt. Der "Ältere Einträge laden"-Button wurde von oberhalb der Liste (Pfeil ↑) nach unterhalb der Liste (Pfeil ↓) verschoben.
- `tests/PROJ-6-mahlzeit-historie.spec.ts`: bestehenden Test "lädt ältere Einträge und fügt sie oben ein" umbenannt und auf die neue Anhänge-Reihenfolge umgestellt (prüft jetzt per `main.innerText()`-Positionsvergleich, dass die neuere Mahlzeit vor der nachgeladenen älteren steht). Neuer Test verifiziert die exakten Request-URLs (`limit=5&offset=0` initial, `limit=10` beim Nachladen).
- Ein vorbestehender, von dieser Änderung unabhängiger Flake im Test "Laden-Skelett erscheint während Daten geladen werden" wurde bei der Verifikation entdeckt (reproduziert auch auf dem Stand VOR diesem Refinement, `--repeat-each=5` bestätigt) — als separater Task ausgelagert, nicht Teil dieses Refinements.
- `npm run build`, `npm run lint`, `npm test` (464/464) fehlerfrei. Einzige verbleibenden Lint-Fehler: die bekannten, unabhängigen `sidebar.tsx`-Fehler (separater Task).
- Manuell mit echtem QA-Test-Account gegen den laufenden Dev-Server verifiziert (`/analyse`): Seite lädt fehlerfrei, Mahlzeiten-Karten rendern korrekt — der Account hatte nur 2 Einträge, weshalb das "5 initial / 10 nachladen"-Verhalten primär über die E2E-Suite (gemockte Antworten) abgesichert wurde statt visuell mit echten Daten.

## QA Test Results

**QA Date:** 2026-06-12
**QA Status:** APPROVED — bereit für `/deploy`

### Testergebnisse

| Suite | Tests | Ergebnis |
|-------|-------|---------|
| Vitest Unit-Tests (gesamt) | 38/38 | ✅ alle grün |
| PROJ-6 E2E Chromium | 18/18 | ✅ alle grün |
| PROJ-5 Regression Chromium | 31/31 | ✅ keine Regression |

### Acceptance Criteria

| AC | Beschreibung | Status |
|----|-------------|--------|
| AC1 | Timeline zeigt Mahlzeiten älteste oben, neueste unten | ✅ |
| AC2 | Karte zeigt Thumbnail/Icon, Datum, Name, Sättigungs-Badge | ✅ |
| AC3 | Ältere Einträge laden bei hasMore (Pagination) | ✅ |
| AC4 | Tippen auf Karte öffnet vollständige PROJ-5-Ergebnisseite | ✅ |
| AC5 | Zurück-Navigation landet in Timeline | ✅ (Browser-Back nativ) |
| AC6 | "+ Neue Mahlzeit"-FAB immer sichtbar wenn Einträge vorhanden | ✅ |
| AC7 | FAB navigiert zu Analyse-Flow | ✅ |
| AC8 | Löschen zeigt Bestätigungsdialog | ✅ |
| AC9 | Bestätigtes Löschen entfernt Eintrag + Foto aus Storage | ✅ |
| AC10 | Leerer Zustand mit freundlicher Einladung + CTA in der Mitte | ✅ |

### Security Audit

- **IDOR (GET):** `eq('user_id', user.id)` — User kann nur eigene Mahlzeiten sehen ✅
- **IDOR (DELETE):** `eq('user_id', user.id)` im SELECT vor dem DELETE — verhindert Löschen fremder Mahlzeiten ✅
- **Auth:** `getUser()` (PKCE-sicher) statt `getSession()` in beiden Routes ✅
- **XSS:** Kein `dangerouslySetInnerHTML` oder `eval()` ✅
- **Signed URLs:** Thumbnails ablaufen nach 1h — kein dauerhafter öffentlicher Zugriff ✅
- **Data Leakage:** API gibt nur minimal nötige Felder zurück ✅
- **Storage:** Lösch-Route entfernt nur Dateipfade der verifizierten eigenen Mahlzeit ✅
- **Findings:** Keine

### Bugs

Keine Critical/High Bugs gefunden.

**Produktionsbereit: JA**

### QA Test Results (Refinement 2026-09-04): Sortierung & Pagination

**Tested:** 2026-09-04
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

#### Acceptance Criteria Status
Diese Runde hat keine formalen Angenommen/Wenn/Dann-ACs in der Spec (direkte Nutzeranfrage) — die betroffenen ursprünglichen ACs wurden im AC-Abschnitt oben direkt durchgestrichen/aktualisiert. Geprüft:

- [x] Neueste Mahlzeit erscheint oben, älteste unten (umgedreht von vorher)
- [x] Initial werden nur 5 Mahlzeiten geladen
- [x] "Ältere Einträge laden" erscheint unten in der Liste (nicht mehr oben) und lädt in 10er-Schritten nach
- [x] Neu geladene, ältere Einträge werden ans Ende angehängt, nicht an den Anfang gestellt
- [x] Bestehende Funktionen (Löschen, Detail-Navigation, leerer Zustand, Fehlerfall) unverändert funktionsfähig

#### Security Audit
Pass (trivial) — reine Sortierungs-/Pagination-Änderung auf einem bereits bestehenden, authentifizierten Endpoint. Keine neuen Eingabefelder, keine neue Route, `user_id`-Filterung (IDOR-Schutz) und Auth-Check der API unverändert. `limit`/`offset`-Werte (5/10) liegen deutlich unter dem bestehenden Cap von 50 — keine neue Möglichkeit für übermäßig große Anfragen.

#### Regressionstest
- **Vitest (Gesamtsuite):** 464/464 grün (44 Testdateien) — keine neuen Unit-Tests nötig, Änderung betrifft nur Fetch-Parameter und Anzeige-Reihenfolge einer bereits über E2E abgedeckten Komponente.
- **E2E — `tests/PROJ-6-mahlzeit-historie.spec.ts` (eigene Suite):** von 17 auf 19 Tests erweitert (1 Test umbenannt/auf neue Reihenfolge umgestellt, 1 neuer Test für die exakten Request-Parameter). 36/38 grün über 2 Wiederholungen (2 Fehlschläge = derselbe vorbestehende, unabhängige Flake im Test "Laden-Skelett erscheint..." — bereits vor diesem Refinement reproduzierbar, siehe unten).
- **E2E — PROJ-17 (Wochenrückblick, rendert auf derselben Seite):** 26/26 grün. Ein erster Durchlauf zeigte 2 Fehlschläge unter starker Systemlast (paralleler Hintergrund-Task mit eigenem Dev-Server) — bei isolierter Wiederholung (9/9) und einem zweiten vollständigen Durchlauf ohne Nebenlast (26/26 in 19s statt 6+ Minuten) nicht reproduzierbar. Eindeutig Ressourcen-/Lastproblem der lokalen Umgebung, keine echte Regression.
- `npm run build` fehlerfrei. `npm run lint` (ungescoped `eslint .`) zeigte kurzzeitig zusätzliche Fehler aus `.next`-Build-Artefakten eines parallel laufenden Hintergrund-Worktrees (`.claude/worktrees/.../\.next/...`) — kein Problem im eigentlichen Projektcode; gezielter Lint auf die geänderten Dateien (`mahlzeit-historie.tsx`, `PROJ-6-mahlzeit-historie.spec.ts`) war fehlerfrei. `npm test` 464/464.

#### Bugs Found
Keine neuen Bugs. Ein vorbestehender, unabhängiger Test-Flake ("Laden-Skelett erscheint während Daten geladen werden") wurde bereits während `/frontend` gefunden und als separater Task ausgelagert (nicht Teil dieses Refinements, reproduziert auch auf dem Stand vor der Änderung).

#### Summary
- **Acceptance Criteria:** 5/5 passed
- **Bugs Found:** 0 (1 vorbestehender, unabhängiger Test-Flake bereits separat ausgelagert)
- **Security:** Pass (trivial, keine neue Angriffsfläche)
- **Production Ready:** YES
- **Recommendation:** Deploy. Reine Frontend-Änderung, keine DB-Migration, kein zusätzlicher Backend-Schritt nötig.

## Deployment

**Deployed:** 2026-06-12
**Tag:** v1.6.0-PROJ-6
**Vercel:** Auto-deploy via push to `main`
- **Refinement-Deploy 2026-09-04** (Vercel auto-deploy via Push zu `main`, commits `5d63d3b`..`207c9ed`, Tag `v3.14.0-PROJ-6-refinement`): Sortierung & Pagination — neueste Mahlzeit oben, initial 5 statt 20 Einträge, "Ältere Einträge laden" unten in 10er-Schritten. Reine Frontend-Änderung, keine DB-Migration nötig. Mit echtem QA-Test-Account gegen Produktion verifiziert: Netzwerk-Request bestätigt `limit=5&offset=0` beim initialen Laden, keine neuen Console-Fehler (ein bekannter, seitenunabhängiger 404-Rest bereits aus früheren QA-Runden als Dev-Rauschen eingestuft). Nutzer hat auf Produktion visuell bestätigt ("alles grün, schau mal").
