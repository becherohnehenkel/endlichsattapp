# PROJ-34: Art of Eating

## Status: Deployed (Refinement: Icon-Feinschliff "Deployed")
**Created:** 2026-08-11
**Last Updated:** 2026-09-04

**Refinement (2026-09-04, Icon-Feinschliff):** Jedes der 6 Prinzipien bekommt ein zentriertes Lucide-Icon über dem Text (Armchair/PhoneOff/Wind/Timer/Utensils/Ear), Text bleibt darunter linksbündig. Die Fun-Fact-Hinweisbox wechselt von Amber auf Grün/Blau (`#DFF0F2`/`#0E7C86`, etablierter Info-Stil aus den anderen Guides — Amber wirkte alarmierend). Vorab per Artifact-Mockup abgestimmt. Reine Frontend-Änderung.

**(Hinweis: Der Status-Header dieser Spec war zuvor fälschlich noch auf "Planned" stehen geblieben, obwohl QA- und Deployment-Abschnitte bereits vollständige, abgeschlossene Runden dokumentieren — hiermit korrigiert.)**

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
| **Refinement 2026-09-04:** Icons pro Prinzip nur im vollständigen Guide (`art-of-eating-guide.tsx`), nicht im kompakten rotierenden Hinweis auf Ergebnisseiten (`art-of-eating-hinweis.tsx`) | Der kompakte Hinweis ist bewusst dezent gehalten (festes 🧘-Emoji, siehe Decision Log oben "Karte bleibt dezent") — 6 wechselnde Icons dort hätten dem widersprochen; der Nutzerwunsch bezog sich explizit auf die Guide-Seite | 2026-09-04 |
| **Refinement 2026-09-04:** Icon-Zuordnung: Armchair (Rahmen), PhoneOff (Ablenkungen), Wind (Riechen), Timer (Kau gründlich), Utensils (Details schmecken), Ear (auf Körper hören) | Wind/Ear bewusst identisch zu den gleichnamigen Konzepten bei PROJ-39 (Heißhunger) für konsistente Bildsprache über beide Guides; für "Kau gründlich" gibt es kein literales Kau-Icon in Lucide — Timer steht stellvertretend fürs bewusste Langsam-Kauen | 2026-09-04 |
| **Anpassung 2026-09-04:** Icon für "Riech, bevor du isst" von `Wind` auf `WavesVertical` geändert, Icon für "Schmecke die Details" von `Utensils` auf `Gem` geändert | Explizite Nutzeranpassung nach dem ersten Mockup — `WavesVertical` gab es nicht im installierten lucide-react 0.562.0, daher gezielt auf 1.40.0 aktualisiert (siehe Technical Decisions); `Gem` steht bildhafter für "die feinen Details schmecken/wertschätzen" als das generische Utensils-Icon | 2026-09-04 |
| **Anpassung 2026-09-04:** Icon-Position von "über dem Text, zentriert" auf "links neben dem Text, vertikal zentriert" geändert | Explizite Nutzerkorrektur — abweichend vom ursprünglich gezeigten und abgenickten Mockup; direkt in derselben Session korrigiert, kein neues Mockup nötig, da die Änderung eindeutig beschrieben war (`flex items-center` statt `flex-col items-center`) | 2026-09-04 |
| **Refinement 2026-09-04:** Fun-Fact-Box von Amber (`bg-amber-50`) auf Grün/Blau (`bg-[#DFF0F2]`/`text-[#0E7C86]`) umgefärbt | Nutzerfeedback: Amber/Gelb wirkt alarmierend für einen reinen Lern-Hinweis ohne Warncharakter — Grün/Blau ist im Projekt bereits die etablierte "Info"-Farbe (z. B. Protein-/Ballaststoffe-Richtwerte bei PROJ-37) | 2026-09-04 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Die sechs Prinzipien-Texte werden aus einer einzigen, gemeinsamen Quelle gelesen — sowohl vom bestehenden vollständigen Guide als auch von der neuen kompakten Karte | Verhindert, dass dieselben sechs Texte an zwei Stellen gepflegt werden und im Lauf der Zeit auseinanderlaufen | 2026-08-11 |
| Zufallsauswahl passiert ausschließlich nach dem ersten Rendern im Browser (nicht während des Server-Renderings) | Verhindert einen React-Hydration-Fehler — Server und Browser müssten sonst zufällig denselben Wert treffen, was nicht garantiert werden kann. Derselbe Kniff wird im bestehenden Guide bereits für ein ähnliches Problem verwendet | 2026-08-11 |
| Kein neuer Backend-/Datenbank-Bedarf | Reiner Frontend-Zufallsmechanismus auf bereits im Code vorhandenem, statischem Text — bestätigt die Einschätzung aus der Spec | 2026-08-11 |
| **Refinement 2026-08-31 (im Zuge von PROJ-38):** `art-of-eating-guide.tsx` doch angefasst — auf die neue, gemeinsame `ArbeitspunkteListe`-Komponente umgestellt (Ein-/Ausklappen statt alles auf einmal sichtbar) | Löst die ursprüngliche Entscheidung "bleibt unverändert" (Zeile oben) ab — Nutzerwunsch nach konsistentem Ein-/Ausklapp-Verhalten über alle drei "Arbeitspunkte"-Guides hinweg. `art-of-eating-hinweis.tsx` (die kompakte Karte, das eigentliche PROJ-34-Feature) bleibt unangetastet. Details siehe PROJ-38 Decision Log. | 2026-08-31 |
| **Refinement 2026-09-01:** `art-of-eating-guide.tsx` (`/wie-esse-ich-richtig`) bekommt Überschrift "Richtig Essen" + Intro-Text sowie `ersterPunktOnboarding={{ autoOpenNachMs: 700 }}` (erster Arbeitspunkt klappt beim Laden automatisch auf) — analog zu "So geht abnehmen" und "Emotionales Essen". Neue Tests (Überschrift/Intro sichtbar, Auto-Open) in `PROJ-34-art-of-eating.spec.ts` ergänzt, da die Guide-Seite zuvor keine eigene Struktur-Abdeckung hatte. | Nutzerwunsch: konsistentes Erstbesucher-Verhalten über alle Ernährung-Guides hinweg. `pulseNachMs` in `ArbeitspunkteListe` dafür optional gemacht (nur Emotionales Essen nutzt weiterhin Pulse+Dialog). | 2026-09-01 |
| **Refinement 2026-09-01:** Fun-Fact zu "Schaffe den richtigen Rahmen" (`art-of-eating-principles.ts`) umformuliert — "gesündesten Völker der Welt" → "langlebigsten Menschen der Welt" | Verstieß gegen die projektweite "kein gesund/ungesund/Gesundheit"-Regel (Sättigung ist kein Gesundheitsurteil); bei der visuellen Verifikation dieser Runde aufgefallen, war bereits deployter Bestandsinhalt | 2026-09-01 |
| **Refinement 2026-09-04:** `lucide-react` von `^0.562.0` auf `^1.40.0` aktualisiert (projektweite Abhängigkeit, nicht nur PROJ-34) | Nutzerwunsch nach dem `WavesVertical`-Icon, das in der alten Version nicht existierte; vor dem Upgrade alle ~65 im Projekt bereits verwendeten Icon-Namen per `tsc --noEmit` gegen die neue Version geprüft (kompilierte fehlerfrei — keine Umbenennungen betroffen), zusätzlich Build + volle Suite + visuelle Stichprobe auf allen icon-lastigen Seiten (PROJ-34/37/39 + Navigation) vor jeder Code-Änderung, um Versions-Risiko von der eigentlichen Anpassung zu trennen | 2026-09-04 |

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

## Implementation Notes (Frontend, Refinement 2026-09-04): Icon-Feinschliff
Reine Frontend-/Darstellungs-Änderung, kein Backend-Bezug. Vorab per Artifact-Mockup mit dem Nutzer abgestimmt.

- `src/components/art-of-eating-guide.tsx`: neue Konstante `PRINZIP_ICONS` (Record, Prinzip-Nummer → Lucide-Icon-Element) — bewusst hier im Guide statt in `art-of-eating-principles.ts` definiert, da Icons ein reines Darstellungsanliegen sind und die Prinzipien-Datei laut ihrem eigenen Kommentar unverändert bleiben soll ("Inhalt von Lukas geschrieben, unverändert übernommen"). Jeder Punkt-Inhalt beginnt jetzt mit einem zentrierten Icon-Tile (`h-11 w-11 rounded-xl bg-[#DFF0F2] text-[#0E7C86]`) oberhalb des Textes; Text bleibt darunter linksbündig (kein zusätzliches CSS nötig, da Icon-Tile und Text als eigenständige Geschwister-Elemente im ohnehin vorhandenen `space-y-2.5`-Wrapper der `ArbeitspunkteListe` liegen). Fun-Fact-Box von `bg-amber-50 border-amber-200 text-amber-800` auf `bg-[#DFF0F2] border-[#2E9E6B]/20 text-[#0E7C86]` umgestellt.
- `art-of-eating-hinweis.tsx` (kompakter rotierender Hinweis) bewusst unverändert gelassen — Nutzerwunsch bezog sich auf die Guide-Seite, siehe Decision Log.
- `tests/PROJ-34-art-of-eating.spec.ts`: 2 neue Tests — alle 6 Icon-Tiles vorhanden (je genau 1 SVG), Fun-Fact-Box hat die neue `#DFF0F2`-Hintergrundfarbe (per `getComputedStyle` geprüft, nicht nur Klassenname). Suite: 7 → 9 Tests, 9/9 grün.
- `npm run build`, `npm run lint`, `npm test` (464/464) fehlerfrei. Einzige verbleibenden Lint-Fehler: die bekannten, unabhängigen `sidebar.tsx`-Fehler (separater Task).
- Regression: PROJ-36 (Ernährung-Hub) 19/19 grün.
- Manuell per Playwright verifiziert (Desktop 1280px + Mobile 375px, alle 6 Prinzipien aufgeklappt): alle 6 Icons rendern korrekt und passend zum jeweiligen Prinzip, Fun-Fact-Boxen durchgehend grün/blau, kein horizontales Overflow auf 375px.

### Anpassung (2026-09-04): Icon-Positionen korrigiert + Icons getauscht
Direkt im Anschluss an die erste Umsetzung, noch vor QA/Deploy: Nutzer wollte "Riech, bevor du isst" → `WavesVertical` statt `Wind`, "Schmecke die Details" → `Gem` statt `Utensils`, sowie die Icon-Position von "über dem Text" auf "links neben dem Text, vertikal zentriert".

- `lucide-react` projektweit von `^0.562.0` auf `^1.40.0` aktualisiert, da `WavesVertical` in der alten Version fehlte (siehe Technical Decisions für das Verifikations-Vorgehen). Alle ~65 bereits genutzten Icons kompilieren weiterhin fehlerfrei, keine visuellen Abweichungen bei einer Stichprobe über PROJ-34/37/39 + Navigation festgestellt.
- `src/components/art-of-eating-guide.tsx`: Icon-Zuordnung aktualisiert (`WavesVertical` statt `Wind`, `Gem` statt `Utensils`); Layout von `flex flex-col items-center gap-2` (Icon-Block über dem Text, als eigenständiges Geschwister-Element) auf ein gemeinsames `flex items-center gap-3` (Icon-Tile + `<p>` als Geschwister in EINER Zeile) umgestellt — kein `self-stretch`/`display:contents`-Breakpoint-Wechsel wie beim PROJ-37-Bugfix nötig, da hier nur EIN Layout für alle Breakpoints gilt (kein responsiver Wechsel).
- `tests/PROJ-34-art-of-eating.spec.ts`: bestehenden Test umbenannt (Name bezog sich noch auf "über dem Text"), neuer Test verifiziert per Bounding-Box, dass das Icon links vom Text liegt UND vertikal zum (mehrzeiligen) Text zentriert ist (Toleranz 4px). Suite: 9 → 10 Tests.
- `npm run build`, `npm run lint`, `npm test` (464/464) fehlerfrei. Regression: PROJ-37 (36/36) und PROJ-39 (19/19) — beide nutzen ebenfalls Lucide-Icons und liefen nach dem Versions-Upgrade unverändert grün.

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

### QA Test Results (Refinement 2026-09-04): Icon-Feinschliff

**Tested:** 2026-09-04
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

#### Acceptance Criteria Status
Diese Runde hat keine formalen Angenommen/Wenn/Dann-ACs in der Spec (direkte Nutzeranfrage, vorab per Artifact-Mockup abgestimmt statt über `/refine`) — geprüft gegen die im Decision Log festgehaltenen, vom Nutzer bestätigten Anforderungen:

- [x] Alle 6 Prinzipien zeigen genau ein Icon (Armchair, PhoneOff, WavesVertical, Timer, Gem, Ear)
- [x] Icon sitzt links neben dem Text (nicht darüber), vertikal zum (ggf. mehrzeiligen) Text zentriert — per Bounding-Box-Test verifiziert (Toleranz 4px)
- [x] Fun-Fact-Hinweisbox ist grün/blau (`#DFF0F2`/`#0E7C86`) statt amber — per `getComputedStyle` geprüft, nicht nur Klassenname
- [x] Kompakter rotierender Hinweis auf Ergebnisseiten (`art-of-eating-hinweis.tsx`) bewusst unverändert (kein Icon-Bezug, siehe Decision Log)

#### `lucide-react`-Upgrade (^0.562.0 → ^1.40.0) — Risikoprüfung
Dies ist eine projektweite Abhängigkeitsänderung, nicht auf PROJ-34 beschränkt — daher mit eigener, breiterer Prüfung:
- Alle ~65 im Projekt bereits verwendeten Icon-Namen kompilieren nach dem Upgrade fehlerfrei (`tsc --noEmit`) — keine Umbenennungen/Entfernungen betroffen.
- Visuelle Stichprobe (Playwright-Screenshots vor jeder Code-Änderung, nur Dependency-Bump): Navigation, PROJ-37 (Krafttraining/Schlaf-Icons), PROJ-39 (Stress-/Sinn-Icons) — alle Icons rendern pixelidentisch zur Vorversion.
- **Erweiterte Regressionstests über den engeren PROJ-34-Scope hinaus** (da projektweite Dependency): PROJ-15 (Bottom-/Top-Nav-Icons) 22/22, PROJ-38 (Emotionales Essen, u. a. Smile/Meh-Icons) 23/23, PROJ-43 (Training, Dumbbell-Icon) + PROJ-8 (Rezeptbibliothek, ChefHat/Search/Lock-Icons) 32/32 — alle grün.

#### Security Audit
Pass (trivial) — reine Frontend-/Darstellungsänderung: keine neuen Eingabefelder, keine neue API-Route, keine neuen Berechtigungs- oder Auth-Pfade. Icons rendern ausschließlich fertige Lucide-Komponenten, keine Interpolation von Nutzer- oder Server-Daten — kein XSS-Vektor. Das Dependency-Upgrade selbst wurde nicht separat auf CVEs geprüft (`npm audit` zeigt vorbestehende Findings in Drittabhängigkeiten, keine davon durch dieses Upgrade neu eingeführt oder mit `lucide-react` in Zusammenhang).

#### Regressionstest
- **Vitest (Gesamtsuite):** 464/464 grün (44 Testdateien).
- **E2E — `tests/PROJ-34-art-of-eating.spec.ts` (eigene Suite):** von 7 auf 10 Tests erweitert (1 bestehender Test umbenannt, da sein Name noch "über dem Text" sagte; 2 neue Tests: Icon-Anzahl, Icon-Position links + vertikal zentriert). 10/10 grün.
- **E2E — PROJ-36 (Ernährung-Hub):** 19/19. **PROJ-37 (So geht abnehmen):** 36/36. **PROJ-39 (Heißhunger):** 19/19. **PROJ-15 (Navigation):** 22/22. **PROJ-38 (Emotionales Essen):** 23/23. **PROJ-43+PROJ-8 (Training/Rezepte):** 32/32. Alle grün — keine Regression durch das `lucide-react`-Upgrade oder die Layout-Änderung.
- `npm run build`, `npm run lint`, `npm test` fehlerfrei. Einzige verbleibenden Lint-Fehler: die bekannten, unabhängigen `sidebar.tsx`-Fehler (separater Task, nicht Teil dieser Änderung).

#### Bugs Found
Keine.

#### Summary
- **Acceptance Criteria:** 4/4 passed (Icon-Feinschliff-Runde)
- **Bugs Found:** 0
- **Security:** Pass (trivial, keine neue Angriffsfläche)
- **Dependency-Risiko (`lucide-react`-Major-Upgrade):** geprüft und für unbedenklich befunden (Type-Check + Build + 6 Test-Suiten über icon-lastige Bereiche hinweg, alle grün)
- **Production Ready:** YES
- **Recommendation:** Deploy. Reine Frontend-Änderung, keine DB-Migration, kein zusätzlicher Backend-Schritt nötig.

## Deployment

**Deployed:** 2026-08-11
**Production URL:** https://app.mehralsabnehmen.de/
**Git Tag:** v2.0.0-complete-umstrukturierung (gemeinsamer Release mit PROJ-4/5/16/8/33 + Rebranding)
**Neue Env-Variablen:** keine (rein clientseitig, kein Backend)
**DB-Migrationen:** keine
- **Refinement-Deploy 2026-09-01** (Vercel auto-deploy via Push zu `main`, commits `3e0fb64`..`2e7aae4`, Tag `v2.8.0-ernaehrung-guides`): Teil eines gebündelten Deploys über PROJ-34/37/38/39/40/41 — bei `wie-esse-ich-richtig` neue Überschrift "Richtig Essen" + Intro-Text, Erstbesucher-Auto-Open, sowie "gesund"-Wort-Fix im Fun-Fact zu "Schaffe den richtigen Rahmen". Nutzer hat auf Produktion visuell bestätigt ("Alles auf Grün").
- **Refinement-Deploy 2026-09-04** (Vercel auto-deploy via Push zu `main`, commits `ef356ad`..`65408f7`, Tag `v3.13.0-PROJ-34-refinement`): Icon-Feinschliff — Icon je Prinzip links neben dem Text (vertikal zentriert), WavesVertical/Gem für Riechen/Schmecken, Fun-Fact-Box grün/blau statt amber. Enthält außerdem das projektweite `lucide-react`-Upgrade (^0.562.0 → ^1.40.0). Reine Frontend-Änderung, keine DB-Migration nötig. Direkt gegen die Produktions-URL per Playwright verifiziert: beide neuen Icons vorhanden, Icon-Position exakt links + vertikal zentriert (0px Abweichung), keine neuen Console-Fehler (ein bekannter, seitenunabhängiger 404-Rest bereits aus früheren QA-Runden als Dev-Rauschen eingestuft). Nutzer hat auf Produktion visuell bestätigt ("alles grün, sieht gut aus").

### Post-Deployment Verification
- [x] `/wie-esse-ich-richtig` lädt fehlerfrei, enthält weiterhin alle sechs Prinzipien (Guide unverändert)
- [x] Production-URL insgesamt fehlerfrei erreichbar
