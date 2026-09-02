# PROJ-46: Gewohnheiten

## Status: Planned
**Created:** 2026-09-02
**Last Updated:** 2026-09-02

## Dependencies
- PROJ-45 (Wochen-Check-In) — Gewohnheiten ist die zweite Sektion derselben `/check-in`-Seite
- PROJ-35 (Bottom-Navigation & Kontobereich-Neuordnung) — `/check-in` existiert bereits als Nav-Tab

## User Stories
- Als Nutzer möchte ich einfache Alltags-Gewohnheiten sehen, die mir helfen, mich Schritt für Schritt zu verbessern, ohne mich zu überfordern.
- Als Nutzer möchte ich eine Gewohnheit abhaken können, wenn ich sie heute umgesetzt habe, um meinen Fortschritt sichtbar zu machen.
- Als Nutzer möchte ich zu jeder Gewohnheit eine kurze Erklärung aufklappen können, damit ich weiß, was genau gemeint ist.
- Als Nutzer möchte ich meinen Fortschritt bei Bedarf zurücksetzen können, um neu zu starten.
- Als Gast möchte ich die Checkliste genauso nutzen können wie ein eingeloggter Nutzer, ohne mich anmelden zu müssen.

## Out of Scope
- Server-/Account-basierte Speicherung — rein `localStorage`, kein Backend, keine Synchronisation zwischen Geräten (bewusste Vereinfachung für MVP, analog zum bestehenden "Verstanden"-Muster in den Ernährungs-Guides)
- Automatischer täglicher Reset der Häkchen — sie bleiben dauerhaft gesetzt bis zum manuellen Zurücksetzen, kein Datums-Tracking in dieser Version
- Streak-/Konsistenz-Anzeige ("X Tage am Stück") — reine Text-Empfehlung in der Copy, wird nicht technisch ausgewertet; mögliches späteres Refinement
- Historie/Rückblick über vergangene Tage — es gibt in dieser Version keinen Verlauf, nur den aktuellen Stand
- Reihenfolge der Gewohnheiten anpassen oder eigene Gewohnheiten hinzufügen — feste, vorgegebene Liste von 8 Items
- Die "Wochen-Check-In"-Sektion derselben `/check-in`-Seite — eigenes, bereits deployed Feature PROJ-45

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur
- [ ] Angenommen die Gewohnheiten-Sektion lädt, wenn sie auf `/check-in` angezeigt wird, dann erscheint sie unterhalb der Wochen-Check-In-Sektion mit der Überschrift "Gewohnheiten", dem vorgegebenen Intro-Text und dem Merksatz in einer umrahmten Infobox
- [ ] Angenommen die Sektion lädt, wenn die 8 Gewohnheiten angezeigt werden, dann erscheinen sie als Infoboxen mit Checkbox in der vorgegebenen Reihenfolge

### Interaktion
- [ ] Angenommen eine Gewohnheit ist noch nicht abgehakt, wenn der Nutzer die Checkbox anklickt, dann wird sie sofort als erledigt markiert — ohne Speichern-Button
- [ ] Angenommen eine Gewohnheit ist bereits abgehakt, wenn der Nutzer die Checkbox erneut anklickt, dann wird die Markierung wieder entfernt
- [ ] Angenommen eine Gewohnheit ist eingeklappt, wenn der Nutzer darauf klickt, dann klappt der zugehörige Hinweistext auf; erneutes Klicken klappt ihn wieder zu
- [ ] Angenommen das Auf-/Zuklappen einer Gewohnheit ist unabhängig vom Abhak-Status, wenn der Nutzer eine Gewohnheit aufklappt ohne sie abzuhaken, dann bleibt sie unmarkiert
- [ ] Angenommen der Nutzer hat mindestens eine Gewohnheit abgehakt, wenn er auf "Fortschritt zurücksetzen" klickt, dann werden alle Häkchen entfernt

### Persistenz
- [ ] Angenommen der Nutzer hat Gewohnheiten abgehakt, wenn er die Seite im selben Browser neu lädt, dann sind die Häkchen weiterhin gesetzt
- [ ] Angenommen der Nutzer hat noch nie Gewohnheiten abgehakt, wenn die Seite lädt, dann sind alle Checkboxen leer

### Gast-Verhalten
- [ ] Angenommen ein Gast (kein Login) besucht die Sektion, wenn er Gewohnheiten abhakt, dann funktioniert das identisch zu einem eingeloggten Nutzer — kein Unterschied im Verhalten, keine Hinweistexte zu fehlender Speicherung nötig

## Edge Cases
- `localStorage` ist nicht verfügbar (z. B. eingeschränktes Private Browsing, deaktiviert): Checkboxen lassen sich weiterhin anklicken, der Zustand geht aber beim Reload verloren — kein Absturz/Fehler (konsistent mit dem bestehenden try/catch-Muster in `ArbeitspunkteListe`).
- Nutzer nutzt die App auf zwei Geräten: kein Sync, jedes Gerät hat seinen eigenen Fortschritt — bewusste Konsequenz der lokalen Speicherung.
- Nutzer löscht Browser-Daten: Fortschritt geht verloren, identisch zu einem manuellen Reset.
- Nutzer klappt eine Gewohnheit auf, hakt sie aber nicht ab: Aufklapp-Zustand und Abhak-Zustand sind unabhängig voneinander, beide werden separat gehandhabt.
- Nutzer hakt alle 8 Gewohnheiten ab: kein spezielles Feier-Element in dieser Version vorgesehen (anders als bei `ArbeitspunkteListe`s optionalem `celebration`) — kann bei Bedarf in `/frontend` als kleine, konsistente Geste ergänzt werden.

## Technical Requirements (optional)
- Kein Backend/keine Datenbank-Tabelle nötig für diese Version
- Persistenz über `localStorage`, analog zum bestehenden Muster in `src/components/arbeitspunkte-liste.tsx`

## Content: Finaler Wortlaut

**Überschrift:** "Gewohnheiten"

**Intro-Text:**
"Hier sind ein paar Gewohnheiten die du als Inspiration nutzen kannst dich jeden Tag etwas zu verbessern. Mach nicht alles auf einmal. 1 Veränderung pro Tag für 7 Tage am Stück sind ein Tempo, dass dir hilft diese Gewohnheit langsam in deinen Alltag zu integrieren."

**Merksatz (umrahmte Infobox):**
"Sobald du eine Gewohnheit lange machst und sie einmal vergisst und dabei merkst, dass sie dir fehlt, bist du bereit die nächste Gewohnheit in deinen Alltag zu integrieren. Gib dir die Zeit."

**Die 8 Gewohnheiten (in dieser Reihenfolge):**
1. **Weniger Snacks** — "Wenn du heute wieder vor einem Snack stehst: Überlege nochmal kurz warum du deine Gefühle in Essen wickeln möchtest und entscheide dich bewusst gegen Essen."
2. **Mehr Schritte** — "Nimm dir heute 10 Minuten Zeit - in 10 Minuten schaffst du 1000 Schritte mehr als gestern. Das ist Fortschritt."
3. **Wasser trinken** — "Trinke nach dem Aufstehen mindestens 1 großes Glas Wasser. Stell dazu ein Glas oder die Flasche neben dein Bett als Erinnerung."
4. **Social Media** — "Entfolge 1 Influencer der immer wieder in deinem Feed aufkommt, der dich dir Essen verkaufen möchte oder vor der Kamera isst."
5. **Rezepte** — "Ich teste diese 1 neues Rezept, dass viel Proteine, Ballaststoffe und Volumen hat. Am besten noch etwas zu kauen und lecker schmecken darf es auch. Schau gerne mal die Rezepte dafür an."
6. **Dehnen** — "Ich dehne mich nach dem Aufstehen für 5 Minuten. Ohne Bildschirm, Radio, Podcast oder Musik."
7. **Handy** — "Ich fasse meine Handy erst an, nachdem ich das Haus verlassen hab."
8. **Richtig essen** — "Ich esse heute bewusst 1 Mahlzeit in Ruhe. Ohne Bildschirm, Musik, Podcast oder andere Ablenkungen."

## Open Questions
- [ ] Exakte Wiederverwendung von `ArbeitspunkteListe` vs. neue, angepasste Komponente (Checkbox statt "Verstanden"-Button, Trennung von Auf-/Zuklappen und Abhaken) — wird bei `/architecture` entschieden

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Rein lokale Speicherung (`localStorage`), kein Backend | Nutzerwunsch: "stateless", analog zum bestehenden Ernährungs-Guide-Muster — deutlich weniger Aufwand als die ursprünglich für PROJ-45 diskutierte DB-Persistenz "pro Nutzer pro Tag" | 2026-09-02 |
| Häkchen werden nicht automatisch täglich zurückgesetzt, nur manuell über "Fortschritt zurücksetzen" | Konsistent mit dem bestehenden Guide-Muster, kein Datums-Tracking nötig | 2026-09-02 |
| Sofortiges automatisches Speichern pro Klick, kein Speichern-Button | Einfache Checkliste, ein Button wäre unnötige Reibung (anders als beim mehrfeldrigen Wochen-Check-In aus PROJ-45) | 2026-09-02 |
| Zweite Sektion auf `/check-in` statt eigener Seite | Entspricht der ursprünglichen Content-Struktur (durch "Umbruch:" getrennt) und der bereits in PROJ-45 getroffenen Entscheidung | 2026-09-02 |
| Kein Unterschied zwischen Gast und eingeloggtem Nutzer | Logische Konsequenz der rein lokalen Speicherung — es gibt nichts, das einen Account bräuchte | 2026-09-02 |
| Streak-/Verlaufs-Anzeige bewusst nicht Teil dieser Spec | Würde Datums-Tracking und Auswertung über mehrere Tage erfordern, widerspricht der "stateless"-Entscheidung — mögliches späteres Refinement | 2026-09-02 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
