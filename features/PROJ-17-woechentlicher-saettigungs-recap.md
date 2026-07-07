# PROJ-17: Wöchentlicher Sättigungs-Recap

## Status: Planned
**Created:** 2026-07-07
**Last Updated:** 2026-07-07

## Dependencies
- Requires: PROJ-4 (KI-Analyse-Agent) — Analysedaten mit Pillar-Scores und Makros
- Requires: PROJ-5 (Sättigungs-Einschätzung) — `gesamtbewertung` und Baustein-Scores
- Requires: PROJ-6 (Mahlzeit-Historie) — Historien-Seite als Einstiegspunkt

## User Stories
- Als gesundheitsbewusster Nutzer möchte ich jeden Sonntag sehen, wie sättigend meine Woche war, damit ich Muster in meinem Essverhalten über Zeit erkennen kann.
- Als Nutzer möchte ich wissen, welche Sättigungs-Bausteine diese Woche im Schnitt schwach waren, damit ich gezielt eine Sache verbessern kann.
- Als Nutzer möchte ich meine aktuellen Wochen-Recap mit vergangenen Wochen vergleichen, damit ich Fortschritt erkennen kann.
- Als Nutzer möchte ich sehen, wie viele Analysen mir noch fehlen um einen Recap zu erhalten, damit ich motiviert bleibe mehr zu analysieren.
- Als Nutzer möchte ich sehen, welche Zutaten ich diese Woche am häufigsten gegessen habe, damit ich meine Ernährungsgewohnheiten besser einschätzen kann.

## Out of Scope
- **KI-generierte Textzusammenfassung** — kein extra Claude-API-Call; Insights werden aus strukturierten Daten berechnet. Kann in einer späteren Iteration hinzugefügt werden.
- **Push-Benachrichtigungen / E-Mail** — "Dein Wochenrückblick ist fertig" Benachrichtigung ist ein separates Feature.
- **Mehr als 4 Wochen in der UI** — alle Wochen werden in der DB gespeichert, die UI zeigt nur die letzten 4.
- **Ziele setzen / Vergleich mit Zielwerten** — kein Soll-Ist-Vergleich, nur Ist-Zustand.
- **Export als PDF oder Bild** — nicht in dieser Version.
- **Paywall** — der Recap ist für alle Nutzer (Free + Premium) zugänglich.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Wochenstruktur & Zeitfenster
- [ ] Angenommen der Nutzer öffnet die Historien-Seite, wenn die aktuelle Kalenderwoche (Sonntag–Samstag) noch läuft, dann wird die aktuelle Woche immer als oberster Bereich angezeigt.
- [ ] Angenommen eine vergangene Woche hat weniger als 3 Analysen, wenn die Historien-Seite geladen wird, dann wird diese Woche in der Recap-Liste nicht angezeigt.
- [ ] Angenommen der Nutzer hat mehr als 4 Wochen mit ≥3 Analysen, wenn die Historien-Seite geladen wird, dann werden nur die letzten 4 Wochen (inkl. aktueller Woche) angezeigt.

### Fortschritts-Zustand (< 3 Analysen)
- [ ] Angenommen die aktuelle Woche hat weniger als 3 Analysen, wenn die Historien-Seite angezeigt wird, dann erscheint ein Fortschrittshinweis "Noch X Mahlzeit(en) bis zu deinem Wochenrückblick".
- [ ] Angenommen die aktuelle Woche hat 0 Analysen, wenn die Historien-Seite angezeigt wird, dann lautet der Hinweis "Noch 3 Mahlzeiten bis zu deinem Wochenrückblick".

### Recap-Inhalt (≥ 3 Analysen)
- [ ] Angenommen eine Woche hat ≥3 Analysen, wenn der Nutzer den Recap öffnet, dann wird die durchschnittliche Gesamtbewertung der Woche als Headline-Kennzahl angezeigt (z.B. "gut sättigend").
- [ ] Angenommen eine Woche hat ≥3 Analysen, wenn der Nutzer den Recap öffnet, dann werden alle 6 Sättigungs-Bausteine mit ihrer Durchschnittsfarbe (grün/gelb/rot) angezeigt.
- [ ] Angenommen eine Woche hat ≥3 Analysen, wenn der Nutzer den Recap öffnet, dann wird der schwächste Baustein mit einem Texthinweis hervorgehoben (z.B. "Dein blinder Fleck diese Woche: Biss").
- [ ] Angenommen eine Woche hat ≥3 Analysen, wenn der Nutzer den Recap öffnet, dann werden die Durchschnitts-Makros pro Mahlzeit angezeigt (kcal, Protein, Kohlenhydrate, Fett, Ballaststoffe).
- [ ] Angenommen eine Woche hat ≥3 Analysen, wenn der Nutzer den Recap öffnet, dann werden die Top-5-Zutaten der Woche (nach Häufigkeit) angezeigt.
- [ ] Angenommen eine Woche hat ≥3 Analysen, wenn der Nutzer den Recap öffnet, dann wird die Anzahl aller analysierten Mahlzeiten angezeigt — mit gesondertem Hinweis auf Beilagen ("5 Mahlzeiten, davon 1 Beilage").

### Beilagen-Behandlung
- [ ] Angenommen eine Woche enthält Beilagen-Analysen (PROJ-16), wenn der Recap berechnet wird, dann zählen Beilagen zur Gesamtanzahl, werden aber aus den Pillar- und Makro-Durchschnitten herausgerechnet.

### Collapse / Expand
- [ ] Angenommen mehrere Wochen vorhanden sind, wenn die Historien-Seite geladen wird, dann ist die aktuelle Woche standardmäßig aufgeklappt, vergangene Wochen sind eingeklappt.
- [ ] Angenommen eine vergangene Woche ist eingeklappt, wenn der Nutzer darauf tippt, dann klappt sie auf und zeigt den vollständigen Recap.
- [ ] Angenommen zwei Wochen sind gleichzeitig aufgeklappt, wenn der Nutzer eine dritte öffnet, dann bleiben alle geöffneten offen (kein Auto-Close).

## Edge Cases
- **Erster Sonntag ever:** Nutzer hat erst eine Analyse — Fortschrittsanzeige "Noch 2 Mahlzeiten" erscheint.
- **Genau 3 Analysen, alle Beilagen:** Alle 3 zählen zur Anzahl, aber Pillar/Makro-Schnitte können nicht berechnet werden → Hinweis "Nicht genug Standard-Analysen für Pillar-Auswertung, zeige nur Anzahl".
- **Woche hat z.B. 5 Analysen, 4 davon Beilagen:** Nur 1 Standard-Analyse für Makro/Pillar-Durchschnitt — Recap mit entsprechendem Hinweis anzeigen oder Pillar/Makros ausblenden?  → Pillar/Makros erst ab 2 Standard-Analysen anzeigen.
- **Nutzer analysiert am Samstag 3 Gerichte:** Recap ist sofort verfügbar — kein Warten auf Wochenende.
- **Nutzer hat erst in dieser Woche angefangen:** Keine vergangenen Wochen sichtbar, nur aktuelle Woche mit Fortschrittsanzeige.
- **Zwei identische Zutaten in einer Analyse:** Beide zählen einmal zur Häufigkeit (dedupliziert per Analyse, nicht global).

## Technical Requirements
- Performance: Recap-Berechnung server-seitig, gecacht pro Woche und Nutzer — kein Neuberechnen bei jedem Seitenaufruf
- Security: Nutzer sieht nur eigene Recap-Daten (RLS)
- Mobile-first: Collapsible-Karten vollständig auf 375px nutzbar

## Open Questions
- [ ] Soll die Wochenüberschrift das Datum zeigen ("Woche 28. Juni – 4. Juli") oder nur "Diese Woche" / "Letzte Woche" / "Vor 2 Wochen"?
- [ ] Was gilt als Datumsbasis für Wochenzuordnung: `created_at` der Mahlzeit oder `created_at` der Analyse?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| In-App statt Push/E-Mail | Keine Push-Infrastruktur nötig, einfacher zu bauen, kein separater Kanal | 2026-07-07 |
| Kein KI-API-Call | Strukturierte Daten reichen für alle Insights; keine Zusatzkosten, kein Latenz-Overhead | 2026-07-07 |
| Mindestens 3 Analysen | Weniger als 3 ist statistisch nicht aussagekräftig; motivierender Counter als Alternative | 2026-07-07 |
| Feste Kalenderwoche ab Sonntag | Nutzer haben sonntags am meisten Zeit; auch teilweise Wochen zählen (Samstag mit 3 Analysen = Recap möglich) | 2026-07-07 |
| Nur letzte 4 Wochen in UI | Ausreichend für Trend-Vergleich; DB behält alle Daten für spätere Features | 2026-07-07 |
| Beilagen aus Pillar/Makro-Schnitt herausrechnen | Beilagen haben keine Gesamtbewertung oder vollständige Pillar-Scores (PROJ-16) | 2026-07-07 |
| Vergangene Wochen mit < 3 Analysen ausblenden | Kein Clutter durch leere/unvollständige Einträge; nur vollständige Recaps erscheinen | 2026-07-07 |
| Kostenlos für alle Nutzer | Engagement-Hook: motiviert Free-Nutzer zum Wiederkommen, steigert Conversion-Chance | 2026-07-07 |

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
