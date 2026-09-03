# PROJ-48: Startseite: Ultimatives Ziel

## Status: Deployed
**Created:** 2026-09-03
**Last Updated:** 2026-09-03

## Dependencies
- PROJ-47 (Startseite Neu) — diese Sektion wird auf derselben Startseite (`/`) ergänzt, zwischen dem Video-Platzhalter und der "So legst du los"-Sektion

## User Stories
- Als Nutzer möchte ich auf der Startseite verstehen, was das übergeordnete Ziel meiner Reise in der App ist, damit ich die einzelnen Funktionen im richtigen Kontext einordnen kann.
- Als Nutzer möchte ich eine ehrliche, persönliche Einordnung bekommen, warum Veränderung schwerfällt und wie diese App damit umgeht, damit ich motiviert bin dranzubleiben statt mich zu überfordern.
- Als Nutzer (Gast oder eingeloggt) möchte ich diesen Kontext unabhängig von meinem Account-Status sehen, weil er für alle gleichermaßen gilt.

## Out of Scope
- Klickbare/verlinkte Ziel-Punkte — bewusst rein informativ (siehe Decision Log)
- Personalisierung des Textes oder der Punkte je nach Nutzer — identischer Inhalt für alle
- Fortschritts-Tracking gegen diese 6 Punkte (z. B. Häkchen, Prozentanzeige) — reiner Kontext-Text, kein interaktives Feature
- Verlinkung auf einzelne App-Features aus dieser Sektion heraus — das leisten bereits die "So legst du los"-Karten direkt darunter (PROJ-47)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur
- [ ] Angenommen die Startseite lädt, wenn sie angezeigt wird, dann erscheint die "Ultimatives Ziel"-Sektion unterhalb des Video-Platzhalters und oberhalb von "So legst du los"
- [ ] Angenommen die Sektion wird angezeigt, dann zeigt sie die Überschrift "Ein Ziel für uns alle", den zweiabsätzigen Intro-Text und die 6 Ziel-Punkte in der vorgegebenen Reihenfolge

### Inhalt
- [ ] Angenommen die 6 Ziel-Punkte werden angezeigt, dann erscheinen sie als Liste in genau dieser Reihenfolge: "80–90 % der Zeit vollwertig und bewusst essen", "Ausreichend Wasser trinken", "Alltagsbewegung hoch halten (Schritte, Haushalt, etc.)", "Sport: 3× die Woche (Kraft- und Ausdauertraining gemischt)", "Schlaf priorisieren", "Körpergefühl schärfen"
- [ ] Angenommen die Sektion wird angezeigt, dann sind weder die Überschrift, der Intro-Text noch die 6 Punkte klickbar oder verlinkt

### Gast- & Nutzer-Verhalten
- [ ] Angenommen ein Gast oder ein eingeloggter Nutzer besucht die Startseite, wenn die Sektion lädt, dann ist der Inhalt für beide identisch — keine Personalisierung

## Edge Cases
- Sehr kleine Bildschirme (< 360px): Intro-Text (zwei Absätze) und die 6 Listenpunkte müssen ohne horizontales Scrollen lesbar bleiben, auch wenn die Sektion dadurch länger wird.
- Gast ohne jede Session: Sektion muss identisch zu einem eingeloggten Nutzer erscheinen (konsistent mit dem restlichen PROJ-47-Verhalten, siehe PROJ-47 Nav-Fix vom 2026-09-02).
- Eingeloggter Nutzer mit sehr langem Namen (Begrüßung direkt darüber, PROJ-47): diese Sektion ist davon unabhängig, keine Wechselwirkung.

## Technical Requirements (optional)
- Keine — statischer Text-/Listen-Block, kein Backend, keine Interaktivität, analog zum Video-Platzhalter aus PROJ-47.

## Content: Finaler Wortlaut

**Überschrift:** "Ein Ziel für uns alle"

**Intro-Text (zwei Absätze):**

"Wir alle haben das gleiche Ziel — die Frage ist nur, wie wir da hinkommen. Der Weg dahin ist so individuell wie dein Fingerabdruck. Das Problem: Niemand von uns mag Veränderung."

"Deswegen geht diese App einen anderen Weg — kleine Anpassungen, die deinen Alltag verändern, ohne dass es sich nach viel anfühlt. Ich möchte, dass du nach 6 Monaten sagen kannst: Auf deinen Körper zu achten ist für dich einfach normal geworden. Nimm dir die Zeit, die du brauchst — dein aktuelles Gewicht ist auch nicht über Nacht entstanden. Geh Schritt für Schritt durch die App, schau, was dir gerade hilft, und verändere deinen Alltag langsam. Viel Spaß dabei!"

**Die 6 Ziel-Punkte (in dieser Reihenfolge):**
1. 80–90 % der Zeit vollwertig und bewusst essen
2. Ausreichend Wasser trinken
3. Alltagsbewegung hoch halten (Schritte, Haushalt, etc.)
4. Sport: 3× die Woche (Kraft- und Ausdauertraining gemischt)
5. Schlaf priorisieren
6. Körpergefühl schärfen

## Open Questions
- [x] Exakte visuelle Gestaltung der 6 Punkte → kompakte Liste, bewusst ohne Rahmen-Boxen/Hover-Effekt wie bei den 4 Funktions-Karten, damit sofort klar ist: lesen statt klicken (siehe Tech Design, 2026-09-03)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Sektion ist rein informativ, keine klickbaren Ziel-Punkte | Klare Trennung zwischen "das ist das Ziel" (diese Sektion) und "so kommst du dahin" (die 4 Karten direkt darunter, die bereits verlinken) — vermeidet Redundanz und uneindeutige Punkt→Bereich-Zuordnung | 2026-09-03 |
| Platzierung zwischen Video-Platzhalter und "So legst du los" | Baut die Erzählung auf: Vorstellung (Video) → das große Ziel (diese Sektion) → konkrete erste Schritte (Karten) | 2026-09-03 |
| 6 statt ursprünglich 5 Punkte — "Entspannung, Schlaf, Körpergefühl" in "Schlaf priorisieren" und "Körpergefühl schärfen" aufgeteilt | Nutzer-Entscheidung bei der Text-Überarbeitung — jeder Aspekt bekommt einen eigenen, prägnanten Punkt statt einen zusammengefassten | 2026-09-03 |
| Intro-Text in zwei Absätzen mit persönlicher "Ich"-Stimme und konkretem 6-Monats-Versprechen | Nutzerwunsch: ehrlicher, motivierender Rahmen statt reiner Fakten-Liste — Kernbotschaft "kleine Anpassungen statt große Veränderung" soll Überforderung vorbeugen | 2026-09-03 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Rein statischer Text-/Listen-Block, keine neue interaktive Komponente | Kein Client-State nötig — Inhalt ist fest im Code hinterlegt, identisch für alle Nutzer | 2026-09-03 |
| Visuell bewusst anders gestaltet als die 4 Funktions-Karten aus PROJ-47 (keine Rahmen-Box, kein Hover-Effekt) | Löst die offene Frage aus der Spec: sofort erkennbar, dass diese Sektion zum Lesen ist, nicht zum Klicken wie die Karten darunter | 2026-09-03 |
| 6 Punkte als kompakte Liste statt einzelne Karten | Passt zum informativen, nicht-aktionsorientierten Charakter der Sektion | 2026-09-03 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

```
Startseite (/) — PROJ-47 Bestand
├── Begrüßung (PROJ-47)
├── Video-Platzhalter (PROJ-47)
├── Ultimatives-Ziel-Sektion (NEU)
│   ├── Überschrift "Ein Ziel für uns alle"
│   ├── Intro-Text (2 Absätze)
│   └── Liste der 6 Ziel-Punkte
├── "So legst du los"-Sektion (PROJ-47, 4 Karten)
└── Coach-Banner (PROJ-47)
```

### B) Datenmodell (in Worten)

Keins — reiner, fest im Code hinterlegter Text, kein Datenbankbezug, keine API.

### C) Tech-Entscheidungen (Begründung)

1. **Rein statischer Text-/Listen-Block** — keine neue interaktive Komponente nötig, kein Client-State.
2. **Visuell bewusst anders als die 4 Funktions-Karten darunter** (keine Rahmen-Boxen, kein Hover-Effekt) — auf den ersten Blick klar: lesen statt klicken.
3. **6 Punkte als kompakte Liste statt einzelne Karten** — passt zum informativen Charakter.

### D) Abhängigkeiten (Pakete)
Keine neuen Pakete.

## Implementation Notes (Frontend)

**Gebaut:**
- `src/app/page.tsx` erweitert: neue Sektion zwischen Video-Platzhalter und "So legst du los", exakter Wortlaut aus der Content-Sektion übernommen (Überschrift, zwei Absätze, 6 Ziel-Punkte als `ZIELE`-Array).
  - Liste in einer weichen, ungefärbten Hintergrund-Box (`bg-[#DFF0F2]/60`, kein Rahmen), jeder Punkt mit kleinem grünen Check-Icon — bewusst kein `<Link>`, kein Hover-Effekt, damit sich die Sektion klar von den klickbaren Funktions-Karten darunter abhebt
  - Reiner Bestandteil der bestehenden Server-Component, kein `'use client'`, kein neuer State

**Verifiziert:** `npm run build`, `npm run lint`, `npm test` (443/443, unverändert). Per Playwright verifiziert: Sektion erscheint in der richtigen Reihenfolge (Video → Ziel → So legst du los), alle 6 Punkte sichtbar, keine Links innerhalb der Liste (`ul li a` Count 0), kein horizontales Scrollen auf Mobile (375px). Identisch für Gast (getestet) und eingeloggte Nutzer (kein bedingter Code-Pfad, der das unterscheiden würde).

## QA Test Results

**Tested:** 2026-09-03
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Seitenstruktur
- [x] Sektion erscheint unterhalb des Video-Platzhalters und oberhalb von "So legst du los"
- [x] Zeigt Überschrift "Ein Ziel für uns alle", zweiabsätzigen Intro-Text und die 6 Ziel-Punkte

#### Inhalt
- [x] Die 6 Ziel-Punkte erscheinen in genau der vorgegebenen Reihenfolge
- [x] Weder Überschrift, Intro-Text noch die 6 Punkte sind klickbar oder verlinkt (per DOM-Traversal geprüft: kein `<a>`/`<button>` im Elternpfad)

#### Gast- & Nutzer-Verhalten
- [x] Inhalt ist für Gast und eingeloggten Nutzer identisch (Ziel-Sektion unverändert bei beiden, nur die Begrüßung darüber unterscheidet sich erwartungsgemäß per Namen)

### Edge Cases Status
- [x] Sehr kleine Bildschirme (320px, unter der spezifizierten 360px-Grenze getestet): kein horizontales Scrollen
- [x] Gast ohne jede Session: Sektion identisch zu einem eingeloggten Nutzer
- [x] Eingeloggter Nutzer mit langem Namen in der Begrüßung (QA-Konto "Lukas Testerson"): keine Wechselwirkung mit der Ziel-Sektion, weiterhin vollständig und unverlinkt

### Security Audit Results
- [x] Kein `dangerouslySetInnerHTML`/`innerHTML`, kein `fetch` — rein statischer, hart codierter Text ohne jeden Nutzereingabe- oder Netzwerkbezug, kein Angriffsvektor
- [x] Keine Auth-/Berechtigungslogik betroffen — Sektion ist für jeden identisch sichtbar
- [x] Rate Limiting: nicht anwendbar (keine Server-Requests)

### Regression Testing
- [x] Vitest-Gesamtsuite: 443/443 grün, unverändert
- [x] PROJ-47 (Startseite Neu, dieselbe Seite): alle 23 Tests weiterhin grün — die neue Sektion stört Begrüßung, Video, Funktions-Karten und Coach-Banner nicht
- [x] PROJ-22 (App-Performance) und PROJ-42 (Analyse-Übersichtsseite), beide mit Homepage-Bezug: 20/20 grün

### Bugs Found

Keine Bugs im PROJ-48-Scope gefunden. Beim Schreiben der Tests wurde einmal zu früh (vor vollständigem Rendern) `main.innerText()` gelesen — derselbe Timing-Fallstrick wie bei früheren QA-Runden dieser Session, in den eigenen Tests behoben, kein Produktbug.

### E2E-Testsuite

Neu: `tests/PROJ-48-startseite-ultimatives-ziel.spec.ts` — 8 Tests, decken alle 5 Acceptance Criteria und alle 3 Edge Cases ab. Kein Backend nötig, Login nur für den Gast-vs-eingeloggt-Vergleich. Grün auf Chromium und Mobile Chrome.

### Summary
- **Acceptance Criteria:** 5/5 passed
- **Edge Cases:** 3/3 passed
- **Bugs Found:** 0 (0 critical, 0 high, 0 medium, 0 low)
- **Security:** Pass (kein Angriffsvektor, statischer Inhalt)
- **Production Ready:** YES
- **Recommendation:** Deploy

## Deployment
- **Production URL:** https://app.mehralsabnehmen.de/
- **Deployed:** 2026-09-03 (Vercel auto-deploy via Push zu `main`, commits `b326660`..`15083d5`)
- **Verified in Produktion:** Nutzer hat die Live-Seite geprüft, alles grün ("alles grün").
- **Umfang dieses Deploys:** vollständige PROJ-48-Implementierung — neue "Ein Ziel für uns alle"-Sektion auf der Startseite (`/`) zwischen Video-Platzhalter und "So legst du los": Überschrift, zweiabsätziger Intro-Text und 6 Ernährungs-/Lifestyle-Ziel-Punkte als nicht-klickbare Checkliste. Rein statisch, kein Backend, identisch für Gast und eingeloggten Nutzer.
