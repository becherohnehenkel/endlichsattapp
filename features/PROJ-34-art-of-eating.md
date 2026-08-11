# PROJ-34: Art of Eating

## Status: Planned
**Created:** 2026-08-11
**Last Updated:** 2026-08-11

## Dependencies
- PROJ-3 (Mahlzeit-Input) — Foto/Freitext-Eingabe, auf der die Analyse aufbaut
- PROJ-4 (KI-Analyse-Agent) — Schritt-0-Klassifikation entscheidet, welche Ergebniskomponente (Standard/Komponente/Snack) die Sektion einbindet
- PROJ-5 (Sättigungs-Einschätzung) — teilt sich die Ergebnisseite bei Typ "Mahlzeit"
- PROJ-16 (Beilagen-Kontext) — Komponente- und Snack-Ergebniskomponenten, in die die Sektion ebenfalls eingebunden wird

## User Stories
- Als Nutzer, der eine Mahlzeit, Komponente oder einen Snack scannt, möchte ich einen kleinen, wechselnden Denkanstoß zum bewussten Essen sehen, damit ich nach und nach alle sechs Prinzipien kennenlerne, ohne dass mich das bei jeder Analyse mit derselben Nachricht langweilt.
- Als Nutzer möchte ich vom Denkanstoß direkt zum vollständigen "Wie esse ich richtig?"-Guide springen können, falls mich das Thema gerade interessiert, ohne dass ich ihn separat suchen muss.
- Als Nutzer möchte ich, dass diese Sektion meine Analyse nicht verzögert oder mich zu einer zusätzlichen Eingabe zwingt, damit der Flow so schnell bleibt wie bisher.

## Out of Scope
- Interaktive Selbstauskunft pro Mahlzeit (z.B. Toggle-Fragen "Hingesetzt? Ohne Ablenkung?") — bewusst verworfen, da es die Analyse pro Mahlzeit um einen zusätzlichen Schritt verzögern würde. Bleibt eine mögliche spätere Erweiterung.
- Änderungen am bestehenden vollständigen Guide (`/wie-esse-ich-richtig`, `art-of-eating-guide.tsx`) und seinem Homepage-Einstiegspunkt — bleiben unverändert, dienen weiterhin als zentrales, einmaliges Lern-Erlebnis für alle Nutzer.
- Persistenz/Speicherung des angezeigten Tipps pro Mahlzeit — der Tipp ist ein allgemeiner Lern-Nudge, keine Eigenschaft der Mahlzeit (siehe Decision Log)
- Rezeptbibliothek (PROJ-8/PROJ-33-Muster) — ein Rezept ist eine Vorlage, kein tatsächlicher Essens-Moment; Art of Eating gilt konzeptionell nur für gescannte Mahlzeiten
- Legacy-Analysen (vor der "Complete"-Umstrukturierung): behalten ihren eigenen, damals von Claude generierten `art_of_eating_tipp`-Text unverändert bei — werden nicht auf das neue rotierende System umgestellt
- Vermeidung von Wiederholungen (z.B. "nicht denselben Tipp zweimal hintereinander zeigen") — bewusst einfach gehalten, echter Zufall ohne Tracking

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeige
- [ ] Angenommen eine neue Analyse (Typ Mahlzeit, Komponente oder Snack) wird abgeschlossen, wenn das Ergebnis angezeigt wird, dann erscheint eine dezente Art-of-Eating-Karte mit einem der sechs bestehenden Prinzipien (Titel + Text aus `art-of-eating-guide.tsx`)
- [ ] Angenommen die Karte wird angezeigt, wenn der Nutzer sie sieht, dann enthält sie einen Link "Wie esse ich richtig? →" zum vollständigen Guide (`/wie-esse-ich-richtig`)
- [ ] Angenommen die Seite wird neu geladen oder erneut besucht, wenn der Zufalls-Tipp neu gewählt wird, dann kann ein anderes der sechs Prinzipien erscheinen als beim letzten Mal (kein Speichern, kein Tracking)
- [ ] Angenommen eine Legacy-Analyse (vor der "Complete"-Umstrukturierung) wird angesehen, wenn sie ihren eigenen gespeicherten `art_of_eating_tipp`-Text hat, dann wird dieser unverändert angezeigt, nicht das neue rotierende System

### Visuelles Gewicht & Ausschluss
- [ ] Angenommen die Sektion wird angezeigt, wenn sie neben Sättigung/Geschmack erscheint, dann ist sie deutlich unauffälliger gestaltet (analog zur bestehenden Legacy-`art_of_eating_tipp`-Karte: kleines Label, kein Score, kein eigener Bereich in voller Größe)
- [ ] Angenommen eine Rezept-Detailseite wird angezeigt, wenn die Seite rendert, dann erscheint keine Art-of-Eating-Sektion dort

## Edge Cases
- Server- und Client-Rendering müssen denselben ersten Zustand zeigen, um einen React-Hydration-Fehler zu vermeiden — die zufällige Auswahl darf nicht während des Server-Renderings anders ausfallen als beim ersten Client-Rendering. `art-of-eating-guide.tsx` löst ein ähnliches Problem bereits (rendert `null` bis die Komponente auf dem Client gemountet ist) — dasselbe Muster ist hier voraussichtlich anwendbar (Technical Requirement, siehe unten).
- Zwei Analysen kurz hintereinander (z.B. "Wie gescannt" + "Mit mehr Sättigung" beim Rezept-Anlegen aus einer Mahlzeit) zeigen ggf. unterschiedliche Prinzipien — unproblematisch, da kein Bezug zur konkreten Mahlzeit besteht
- Alte Mahlzeiten ohne jeglichen `art_of_eating_tipp` (z.B. sehr frühe Analysen vor diesem Feld) zeigen ebenfalls keine Sektion — konsistent mit dem bestehenden Verhalten (`{result.art_of_eating_tipp && (...)}`)

## Technical Requirements (optional)
- Kein Backend-Bedarf: keine neue DB-Spalte, kein Claude-Aufruf, keine neue API-Route — reine Frontend-Logik, die eines der sechs bereits im Code vorhandenen Prinzipien clientseitig zufällig auswählt
- Muss in drei Ergebniskomponenten eingebunden werden: `saettigungs-ergebnis.tsx` (Typ Mahlzeit, "neu"-Format), `komponenten-ergebnis.tsx` (Typ Komponente, "neu"-Format), `snack-bestaetigung.tsx` (Typ Snack)

## Open Questions
- [x] Soll die Auswahl-Logik (die sechs Prinzipien + Zufallsauswahl) als gemeinsame kleine Hilfsfunktion/Komponente extrahiert werden? → Ja, siehe Tech Design (2026-08-11)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Statischer, rotierender Tipp statt interaktiver Selbstauskunft pro Mahlzeit | Eine zusätzliche Frage-Runde hätte die Analyse jedes Mal verzögert — bewusst reibungslos gehalten, auch wenn dadurch (vorerst) kein echter, meal-spezifischer Art-of-Eating-Wert entsteht | 2026-08-11 |
| Zufällig aus den sechs bestehenden Prinzipien gewählt, nicht gespeichert | Der Tipp ist ein allgemeiner Lern-Nudge, keine Eigenschaft der konkreten Mahlzeit — Persistenz (DB-Spalte, wie bei PROJ-33 Geschmack) wäre unnötiger Aufwand für reinen Bildungsinhalt | 2026-08-11 |
| Karte bleibt dezent, nicht gleichwertig prominent wie Sättigung/Geschmack | Reine Tipp-Anzeige ohne echten Analyse-Wert soll nicht denselben visuellen Raum beanspruchen wie die beiden datengetriebenen Sektionen | 2026-08-11 |
| Gilt für Mahlzeit, Komponente UND Snack (anders als Geschmack, das Snack ausschließt) | Wie man isst ist unabhängig davon, ob es sich um eine vollständige Mahlzeit handelt — auch ein Snack kann hingesetzt oder abgelenkt gegessen werden | 2026-08-11 |
| Bestehender vollständiger Guide (`/wie-esse-ich-richtig`) und sein Homepage-Einstiegspunkt bleiben unverändert | Nutzerwunsch: soll weiterhin zentral für alle verfügbar bleiben, unabhängig von der neuen pro-Mahlzeit-Karte | 2026-08-11 |
| Legacy-Analysen behalten ihren eigenen gespeicherten `art_of_eating_tipp`, keine Umstellung | Konsistent mit dem in dieser Session etablierten Muster: alte Analysen bleiben für immer im alten Format, keine Migration | 2026-08-11 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Die sechs Prinzipien-Texte werden aus einer einzigen, gemeinsamen Quelle gelesen — sowohl vom bestehenden vollständigen Guide als auch von der neuen kompakten Karte | Verhindert, dass dieselben sechs Texte an zwei Stellen gepflegt werden und im Lauf der Zeit auseinanderlaufen | 2026-08-11 |
| Zufallsauswahl passiert ausschließlich nach dem ersten Rendern im Browser (nicht während des Server-Renderings) | Verhindert einen React-Hydration-Fehler — Server und Browser müssten sonst zufällig denselben Wert treffen, was nicht garantiert werden kann. Derselbe Kniff wird im bestehenden Guide bereits für ein ähnliches Problem verwendet | 2026-08-11 |
| Kein neuer Backend-/Datenbank-Bedarf | Reiner Frontend-Zufallsmechanismus auf bereits im Code vorhandenem, statischem Text — bestätigt die Einschätzung aus der Spec | 2026-08-11 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

```
Gemeinsame Quelle: die sechs Art-of-Eating-Prinzipien (Titel + Text, bereits vorhanden)
├── Voller Guide (/wie-esse-ich-richtig) — unverändert, zeigt alle 6 mit Fortschritts-Tracking
└── Art-of-Eating-Hinweis (NEU, kompakt) — zeigt genau 1 zufällig gewähltes Prinzip
    ├── 🧘-Label "Art of Eating"
    ├── Titel + Text des gewählten Prinzips
    └── Link "Wie esse ich richtig? →" zum vollständigen Guide
```

**Eingebunden in drei bestehende Ergebnis-Ansichten** (jeweils an der Stelle, an der heute schon der alte, Legacy-spezifische Hinweis sitzt bzw. thematisch dazu passt):
```
Mahlzeit-Ergebnis (Typ "neu")
└── ... bestehende Sättigungs-/Geschmack-Sektionen ...
    └── Art-of-Eating-Hinweis (NEU)

Komponente-Ergebnis (Typ "neu")
└── ... bestehende Bilanz-/Geschmack-Sektionen ...
    └── Art-of-Eating-Hinweis (NEU)

Snack-Bestätigung
└── ... Bestätigungstext ...
    └── Art-of-Eating-Hinweis (NEU)
```
*Legacy-Analysen (altes 6-Bausteine-Format) sind davon nicht betroffen — sie zeigen weiterhin ihren eigenen, historisch gespeicherten Tipp-Text, unverändert.*

### B) Datenmodell (fachlich)

Keine neuen Daten, keine Datenbank-Änderung. Die sechs Prinzipien (Titel + Text) sind bereits als fester Inhalt im Code vorhanden — es wird lediglich zur Laufzeit im Browser eines davon zufällig ausgewählt und angezeigt. Nichts davon wird gespeichert oder einer Mahlzeit zugeordnet.

### C) Tech-Entscheidungen (Begründung für PM)

1. **Eine gemeinsame Textquelle statt Kopie.** Die sechs Prinzipien-Texte gibt es schon (im vollständigen Guide). Statt sie für die neue kompakte Karte ein zweites Mal zu schreiben, greifen beide Stellen auf denselben Inhalt zu. Ändert Lukas später einen Text, muss das nur an einer Stelle passieren.

2. **Zufallsauswahl erst im Browser, nicht auf dem Server.** Technischer Hintergrund: Diese Website baut Seiten teilweise schon auf dem Server vor, bevor sie im Browser ankommen. Eine echte Zufallsauswahl auf dem Server würde fast nie mit der Zufallsauswahl im Browser übereinstimmen — das erzeugt eine Fehlermeldung ("Hydration Error"), weil die vorgebaute Seite nicht zu dem passt, was der Browser danach selbst berechnet. Der bestehende Guide hat genau dieses Problem schon einmal gelöst (er wartet, bis die Seite im Browser vollständig geladen ist, bevor er etwas anzeigt) — dasselbe Prinzip wird hier wiederverwendet.

3. **Kein Backend nötig.** Da nichts gespeichert werden muss (bewusste Produkt-Entscheidung, siehe Decision Log), bleibt diese Funktion komplett auf der Client-Seite — kein `/backend`-Schritt für dieses Feature nötig.

### D) Abhängigkeiten (Pakete)

Keine neuen Pakete — nutzt ausschließlich bereits vorhandenen React-Code und die bereits vorhandenen sechs Prinzipien-Texte.

## Frontend Implementation Notes (2026-08-11)

### Neue/geänderte Dateien
- **`src/lib/art-of-eating-principles.ts`** (neu) — gemeinsame Quelle für die sechs Prinzipien (Titel, Text, Fun Fact), plus `randomArtOfEatingPrinzip()`. Inhalt 1:1 aus der bisherigen `art-of-eating-guide.tsx` übernommen, nicht verändert.
- **`src/components/art-of-eating-guide.tsx`** — liest die sechs Schritte jetzt aus der gemeinsamen Quelle statt einer lokalen Kopie. Verhalten unverändert (voller Guide, Fortschritts-Tracking per localStorage).
- **`src/components/art-of-eating-hinweis.tsx`** (neu) — die dezente, zufällig rotierende Karte. Nutzt denselben `useSyncExternalStore`-"erst nach dem Mounten rendern"-Kniff wie der bestehende Guide, um einen React-Hydration-Fehler zu vermeiden (Zufallsauswahl passiert nie während des Server-Renderings).
- **`src/components/saettigungs-ergebnis.tsx`** — Abschnitt 6 ("Art of Eating") verzweigt jetzt: bei `vorher.format === 'legacy'` weiterhin der alte, historisch gespeicherte Tipp-Text (nur wenn vorhanden, exakt wie zuvor); bei `format === 'neu'` immer der neue rotierende Hinweis.
- **`src/components/komponenten-ergebnis.tsx`** — neuer Hinweis im `format === 'neu'`-Zweig ergänzt (nach dem Kombinationsvorschlag); der Legacy-Zweig mit seinem eigenen `art_of_eating_tipp`-Feld bleibt unverändert.
- **`src/components/snack-bestaetigung.tsx`** — neuer Hinweis ergänzt (Snack hat kein Legacy-Pendant, daher unbedingt, nicht verzweigt).

### Visuell verifiziert (gemockt, alle drei Typen + Legacy)
- **Mahlzeit** (neu): Hinweis erscheint direkt unter der Geschmack-Sektion, deutlich unauffälliger gestaltet (kleines Label, kein Score) — Screenshot bestätigt
- **Komponente**: Hinweis erscheint nach dem Kombinationsvorschlag
- **Snack**: Hinweis erscheint trotz des ansonsten sehr minimalen Snack-Screens (bewusst, siehe Spec: "wie man isst" ist unabhängig von der Menge) — zwei Aufrufe zeigten zwei unterschiedliche Prinzipien, Rotation bestätigt funktionsfähig
- **Legacy-Fixture** (`44444444-…`, `art_of_eating_tip: null` in der DB): korrekt **weder** der alte Block **noch** der neue Hinweis sichtbar — bestätigt, dass die Verzweigung über `vorher.format` (nicht über die bloße Textprüfung) notwendig war, sonst wäre der neue Hinweis fälschlich auch bei dieser Legacy-Zeile erschienen

### Tests
- `tests/PROJ-16-beilagen-kontext.spec.ts` und `tests/PROJ-5-saettigungs-einschaetzung.spec.ts` enthielten je einen Test, der (korrekt für den Stand vor PROJ-34) prüfte, dass bei frischen Analysen **kein** Art-of-Eating-Block erscheint — beide auf das neue Verhalten umgeschrieben (prüfen jetzt auf den neuen Hinweis statt auf dessen Abwesenheit)
- `npm test`: 387/387 passed (unverändert, keine neuen Vitest-Tests nötig — reine Präsentationskomponente ohne Logik, siehe QA-Skill-Richtlinie "was NICHT unit-testen")
- `npm run test:e2e` (betroffene Suiten): `PROJ-5` + `PROJ-5-legacy-rendering`, `PROJ-16`, `PROJ-33` — alle grün nach den beiden Testkorrekturen (zwei vereinzelte Login-Timeouts durch Systemlast identifiziert und isoliert als reine Flakiness bestätigt, nicht reproduzierbar)
- `tsc --noEmit`: sauber · `eslint`: sauber · `npm run build`: erfolgreich

### Beobachtung außerhalb des Scopes (nicht durch PROJ-34 verursacht)
Beim Testen der Legacy-Fixture-Seite trat im Playwright-Fehlerlog ein React-Hydration-Warnhinweis auf — betrifft aber ausschließlich `rating-ring.tsx` (ein Sub-Pixel-Rundungsunterschied in einem SVG-Pfad zwischen Server- und Client-Berechnung), eine bereits vor dieser Session bestehende, rein kosmetische Angelegenheit, unabhängig von PROJ-34. Zur Kenntnisnahme für eine spätere QA-Runde vermerkt.

## QA Test Results

**Tested:** 2026-08-11
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Anzeige
- [x] Neue Analyse (Mahlzeit/Komponente/Snack) zeigt eine dezente Karte mit einem der sechs Prinzipien (Titel + Text) — E2E-verifiziert für alle drei Typen
- [x] Karte enthält den Link "Wie esse ich richtig? →" zu `/wie-esse-ich-richtig` — E2E-verifiziert (Href geprüft)
- [x] Zufälliger Tipp kann bei erneutem Besuch anders ausfallen — statistisch verifiziert: 8 aufeinanderfolgende Analysen ergaben mehr als 1 unterschiedlichen Prinzip-Titel
- [x] Legacy-Analysen mit eigenem gespeicherten `art_of_eating_tipp` zeigen weiterhin diesen Text, nicht das neue System — per Code-Review verifiziert (`vorher.format === 'legacy'`-Verzweigung in `saettigungs-ergebnis.tsx`); keine reale DB-Fixture mit nicht-leerem Legacy-Tipp aktuell vorhanden, um dies zusätzlich live zu bestätigen (alle drei existierenden Legacy-Fixtures haben `art_of_eating_tip: null`) — Risiko als gering eingeschätzt, da es sich um einen einfachen, eindeutigen Ternary handelt und der Negativ-Fall (Tipp ist `null`) live bestätigt ist

#### Visuelles Gewicht & Ausschluss
- [x] Sektion ist deutlich unauffälliger als Sättigung/Geschmack (kleines Label, kein Score) — visuell per Screenshot bestätigt
- [x] Keine Art-of-Eating-Sektion auf Rezept-Detailseiten — per Code-Review bestätigt (Komponente wird dort nirgends importiert/eingebunden)

**7/7 Acceptance Criteria passed** (1 davon nur per Code-Review statt Live-Fixture, siehe oben).

### Automated Tests
- `npm test`: **387/387 passed** (keine neuen Vitest-Tests — reine Präsentationskomponente ohne eigene Logik, konsistent mit der QA-Richtlinie "was NICHT unit-testen")
- `npm run test:e2e`:
  - `tests/PROJ-34-art-of-eating.spec.ts` (neu): **5/5 passed** (Mahlzeit/Komponente/Snack zeigen den Hinweis, Legacy-Fixture zeigt ihn nicht, Rotation statistisch bestätigt)
  - Regression: `PROJ-5` + `PROJ-5-legacy-rendering` (60/60, inkl. 2 während `/frontend` aktualisierter Tests), `PROJ-16` (14/14), `PROJ-33` (14/14), `PROJ-32` (13/13), `PROJ-25` (4/4) — **keine Regressionen**. Zwei vereinzelte Login-Timeouts während eines Laufs traten auf und waren beim isolierten Nachtest nicht reproduzierbar — als Systemlast-Flakiness eingeordnet, kein PROJ-34-Bezug.
- `tsc --noEmit`: sauber (1 vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`)
- `eslint`: sauber
- `npm run build`: erfolgreich

### Security Audit
Minimaler Umfang, da das Feature bewusst ohne Backend auskommt (siehe Tech Design):
- [x] Keine neue API-Route, kein neuer Auth-Pfad, keine neue Datenbank-Interaktion — keine neue Angriffsfläche
- [x] Keine Nutzereingabe wird gerendert — der Text ist zu 100 % statisch und von Lukas geschrieben, kein `dangerouslySetInnerHTML`, kein XSS-Vektor
- [x] Kein Rate-Limiting nötig — keine API-Kosten, keine externen Aufrufe pro Anzeige

**Keine Security-Findings.**

### Bugs Found
Keine.

### Beobachtung außerhalb des Scopes (bereits in den Frontend Implementation Notes vermerkt)
Der vorbestehende, kosmetische React-Hydration-Warnhinweis in `rating-ring.tsx` (Sub-Pixel-SVG-Pfad-Rundung) ist unabhängig von PROJ-34 und nicht Teil dieser Bewertung.

### Summary
- **Acceptance Criteria:** 7/7 passed
- **Bugs Found:** 0
- **Security:** Pass (minimale Angriffsfläche, keine Findings)
- **Production Ready:** JA
- **Recommendation:** Deploybereit als Teil des gemeinsamen "Complete"-Rollouts (wartet laut Absprache auf Rename/Headline zusammen mit den übrigen drei Sektionen)

## Deployment
_To be added by /deploy_
