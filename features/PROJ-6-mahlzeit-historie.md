# PROJ-6: Mahlzeit-Historie

## Status: In Progress
**Created:** 2026-06-10
**Last Updated:** 2026-06-12

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
- [ ] Angenommen der Nutzer ist eingeloggt und hat mindestens eine Analyse abgeschlossen, wenn er die App öffnet, dann sieht er eine scrollbare Timeline seiner Mahlzeiten — älteste oben, neueste unten.
- [ ] Angenommen die Timeline angezeigt wird, dann zeigt jede Karte: Thumbnail (wenn Foto vorhanden, sonst ein neutrales Platzhalter-Icon), Datum und Uhrzeit, Gerichtsname oder Kurzbeschreibung, Gesamt-Sättigungsbewertung (sehr sättigend / mäßig sättigend / wenig sättigend) als farbiges Badge.
- [ ] Angenommen der Nutzer scrollt in der Timeline nach oben, dann werden ältere Einträge geladen (Infinite Scroll oder Pagination — Details in `/architecture`).

### Eintrag öffnen
- [ ] Angenommen der Nutzer tippt auf eine Karte in der Timeline, wenn der Eintrag geöffnet wird, dann sieht er die vollständige PROJ-5-Ergebnisseite dieser Mahlzeit (6 Bausteine, Erklärung, Verbesserungsvorschläge, Rezept-Delta).
- [ ] Angenommen der Nutzer ist in der Detailansicht einer vergangenen Analyse, wenn er zurücknavigiert, dann landet er wieder an derselben Scroll-Position in der Timeline.

### Neue Analyse starten
- [ ] Angenommen der Nutzer ist in der Timeline, dann ist am unteren Rand immer ein kompakter "+ Neue Mahlzeit"-Button sichtbar.
- [ ] Angenommen der Nutzer tippt auf "+ Neue Mahlzeit", wenn der Button betätigt wird, dann öffnet sich der vollständige Analyse-Flow (PROJ-3 Eingabe-Screen).
- [ ] Angenommen eine neue Analyse abgeschlossen wurde, wenn der Nutzer zurück zur Timeline navigiert, dann erscheint die neue Mahlzeit als unterster (neuester) Eintrag.

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
- **Ladeperformance:** Thumbnails lazy-geladen; erste 20 Einträge sofort, weitere on scroll
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

---

## Tech Design (Solution Architect)
_Inline mit /frontend implementiert — kein separater Architecture-Pass nötig (keine neue DB-Schema-Änderung)._

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
