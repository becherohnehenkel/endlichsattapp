# PROJ-46: Gewohnheiten

## Status: Approved
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
- [x] Exakte Wiederverwendung von `ArbeitspunkteListe` vs. neue, angepasste Komponente → neue, eigene Komponente (siehe Technical Decisions) — Interaktionsmuster unterscheidet sich zu weit für sinnvolle Wiederverwendung (2026-09-02)

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
|----------|-----------|------|
| Kein Backend, kein API-Aufruf — reine Frontend-Komponente | Setzt die Product Decision "stateless" technisch um; keine Ladezustände oder Netzwerk-Fehlerbehandlung nötig, anders als bei PROJ-45 | 2026-09-02 |
| Neue, eigene Komponente statt Wiederverwendung von `ArbeitspunkteListe` | Interaktionsmuster unterscheidet sich: dort ist der "Verstanden"-Button erst nach dem Aufklappen sichtbar, hier soll die Checkbox permanent sichtbar sein, unabhängig vom Auf-/Zuklappen. Grundprinzip (lokal gespeicherte Häkchen, manueller Reset) bleibt dasselbe wie bei den bestehenden Guides | 2026-09-02 |
| Keine neuen Pakete nötig | Checkbox und Collapsible/Accordion sind bereits im Projekt installiert (`src/components/ui/checkbox.tsx`, `accordion.tsx`, `collapsible.tsx`) | 2026-09-02 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

```
/check-in Seite (PROJ-45 baut bereits die erste Sektion)
├── Wochen-Check-In-Sektion (PROJ-45)
└── Gewohnheiten-Sektion (NEU)
    ├── Überschrift "Gewohnheiten" + Intro-Text
    ├── Merksatz (umrahmte Infobox)
    ├── Fortschrittsanzeige ("X von 8 erledigt")
    ├── 8 Gewohnheiten-Karten, je mit:
    │   ├── Checkbox (Abhaken, sofort wirksam)
    │   ├── Titel
    │   └── unabhängig auf-/zuklappbarer Hinweistext
    └── "Fortschritt zurücksetzen"-Link (nur sichtbar, wenn mind. 1 Häkchen gesetzt)
```

### B) Datenmodell (in Worten)

Kein Server-Datenmodell — keine Tabelle, keine API-Route. Gespeichert wird ausschließlich im Browser (`localStorage`) des jeweiligen Geräts:
- Welche der 8 Gewohnheiten aktuell abgehakt sind (einfache Liste von IDs)
- Kein Datum, kein Nutzer-Bezug, keine Historie

Gilt identisch für Gäste und eingeloggte Nutzer — es gibt keinen Unterschied im Verhalten.

### C) Tech-Entscheidungen (Begründung)

1. **Kein Backend** — reine Frontend-Komponente, `localStorage` statt Datenbank, setzt die Product Decision "stateless" um.
2. **Neue, eigene Komponente statt Wiederverwendung von `ArbeitspunkteListe`** — das Interaktionsmuster passt nicht 1:1 (Checkbox permanent sichtbar vs. Button erst nach Aufklappen), das Grundprinzip (lokal gespeicherte Häkchen, manueller Reset) bleibt aber dasselbe für ein vertrautes Verhalten.
3. **Kein API-Aufruf, keine Ladezustände** — alles passiert synchron im Browser.

### D) Abhängigkeiten (Pakete)
Keine neuen Pakete nötig.

## Implementation Notes (Frontend)

**Gebaut:**
- `src/components/gewohnheiten-liste.tsx`: neue Komponente, exakter Wortlaut aus der Content-Sektion übernommen.
  - Fortschrittsanzeige ("X von 8 erledigt" + Balken), analog zum bestehenden Guide-Muster
  - 8 Karten mit Checkbox (sofortiges Abhaken/Entfernen) links, Titel + Chevron als eigener Klickbereich zum unabhängigen Auf-/Zuklappen des Hinweistexts rechts
  - Persistenz über `localStorage` (Key `gewohnheiten_completed`, gleiche Namenskonvention wie `aoe_completed`/`hh_completed` etc.), SSR-sicher via `useSyncExternalStore`-Hydration-Guard (gleiches Muster wie in `arbeitspunkte-liste.tsx`, verhindert einen Hydration-Mismatch, da `localStorage` serverseitig nicht existiert)
  - "Fortschritt zurücksetzen"-Link, nur sichtbar wenn mindestens ein Häkchen gesetzt ist
  - Kein Unterschied zwischen Gast und eingeloggtem Nutzer (keine Session-Abfrage nötig)
- `src/app/check-in/page.tsx`: `GewohnheitenListe` als zweite Sektion unterhalb des Wochen-Check-Ins ergänzt, durch eine dünne Trennlinie abgesetzt (gleiches Muster wie auf der Analyse-Übersichtsseite).

**Kein Backend nötig** — vollständig frontend-only umgesetzt, wie in der Architektur festgelegt. Damit ist dieses Feature nach dem Frontend bereits vollständig.

**Verifiziert:** `npm run build`, `npm run lint` (0 Fehler/Warnungen in den geänderten Dateien — ein Lint-Fehler in `.claude/worktrees/.../sidebar.tsx` stammt aus einem parallel laufenden, unabhängigen Task in einem separaten Git-Worktree), `npm test` (443/443 grün, unverändert). Per Playwright verifiziert: Checkbox und Aufklappen sind unabhängig voneinander, Fortschrittsanzeige aktualisiert sich live, Zustand übersteht einen Reload (localStorage), Reset setzt zuverlässig zurück. Mobile (375px): kein horizontales Scrollen, alle 8 Karten korrekt lesbar.

## QA Test Results

**Tested:** 2026-09-02
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Seitenstruktur
- [x] Erscheint unterhalb der Wochen-Check-In-Sektion mit Überschrift "Gewohnheiten", Intro-Text und Merksatz in umrahmter Infobox
- [x] Alle 8 Gewohnheiten erscheinen als Checkbox-Infoboxen in der vorgegebenen Reihenfolge

#### Interaktion
- [x] Checkbox anklicken markiert sofort als erledigt, kein Speichern-Button
- [x] Erneutes Anklicken entfernt die Markierung wieder
- [x] Aufklappen zeigt den Hinweistext, erneutes Klicken klappt ihn wieder zu
- [x] Auf-/Zuklappen ist unabhängig vom Abhak-Status (in beide Richtungen geprüft)
- [x] "Fortschritt zurücksetzen" entfernt alle Häkchen (Link verschwindet danach wieder, bis erneut abgehakt wird)

#### Persistenz
- [x] Häkchen bleiben nach Reload im selben Browser erhalten
- [x] Ohne je abgehakte Gewohnheit sind beim Laden alle Checkboxen leer

#### Gast-Verhalten
- [x] Funktioniert für Gäste identisch zu eingeloggten Nutzern, kein Hinweistext zu fehlender Speicherung (anders als bei der Wochen-Check-In-Sektion, dort korrekt weiterhin vorhanden)

### Edge Cases Status

- [x] `localStorage` nicht verfügbar (simuliert: Zugriff wirft einen Fehler): Checkbox bleibt bedienbar, kein Absturz/keine Konsolenfehler, Zustand geht beim Reload erwartungsgemäß verloren
- [x] Nutzung auf zwei Geräten: kein Sync (durch Design — reine `localStorage`-Speicherung, nichts zu testen außer der Abwesenheit von Sync-Code)
- [x] Browser-Daten löschen: identisch zu manuellem Reset (durch Design, `localStorage.removeItem` ist der einzige Lösch-Pfad)
- [x] Aufklappen ohne Abhaken bzw. Abhaken ohne Aufklappen: beide Zustände unabhängig geprüft
- [x] Alle 8 Gewohnheiten abgehakt: zeigt "Alles erledigt ✓"

### Security Audit Results
- [x] Kein Backend, keine API-Route, keine Netzwerkaufrufe — kein Endpunkt zum Angreifen (`fetch` kommt im neuen Code nicht vor)
- [x] Kein `dangerouslySetInnerHTML`/`innerHTML` — alle Inhalte sind statischer, hart codierter Text, kein Injection-Vektor
- [x] Keine sensiblen Daten im `localStorage` — nur eine Liste von Item-IDs (1–8), kein Nutzer- oder Datums-Bezug
- [x] Kein Auth-Bypass relevant — Feature ist für Gäste und eingeloggte Nutzer bewusst identisch zugänglich, keine privilegierte Aktion vorhanden
- [x] Rate Limiting: nicht anwendbar (keine Server-Requests)

### Regression Testing
- [x] Vitest-Gesamtsuite: 443/443 grün, unverändert
- [x] PROJ-45 (Wochen-Check-In, dieselbe `/check-in`-Seite): alle 23 Tests weiterhin grün — die neue Sektion darunter stört das bestehende Formular nicht
- [x] PROJ-35 (Bottom-Navigation): 11/12 grün — einziger Fehlschlag ist der bereits bei der PROJ-45-QA dokumentierte, vorbestehende `/ernaehrung`-Test (unabhängig, mittlerweile in einem separaten Branch/Worktree bereits behoben, siehe `ef315d4`, nur noch nicht in `main` gemerged)
- [x] Mobile (375px) und Desktop: alle 12 PROJ-46-Tests auf beiden Projekten grün

### Bugs Found

Keine Bugs im PROJ-46-Scope gefunden. Beim Schreiben der E2E-Tests wurde ein Test-Timing-Fehler (zu frühes `innerText()`-Lesen vor vollständigem Rendern) in den eigenen neuen Tests gefunden und behoben — kein Produktbug.

### E2E-Testsuite

Neu: `tests/PROJ-46-gewohnheiten.spec.ts` — 12 Tests, je einer pro Akzeptanzkriterium/Edge-Case. Kein QA-Testkonto nötig (kein Backend) — jeder Test läuft in einer frischen, isolierten Browser-Context. Grün auf Chromium und Mobile Chrome (375px).

### Summary
- **Acceptance Criteria:** 8/8 passed
- **Edge Cases:** 5/5 passed
- **Bugs Found:** 0 (0 critical, 0 high, 0 medium, 0 low)
- **Security:** Pass (minimaler Angriffsfläche durch Backend-freies Design)
- **Production Ready:** YES
- **Recommendation:** Deploy

## Deployment
_To be added by /deploy_
