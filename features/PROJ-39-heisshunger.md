# PROJ-39: Heißhunger

## Status: Deployed (Refinement: Icon-Feinschliff "Approved")
**Created:** 2026-09-01
**Last Updated:** 2026-09-04

**Refinement (2026-09-04, Icon-Feinschliff):** Neuer Intro-Text (erwähnt Stresslevel/Umfeld/Social Media explizit als verstärkende Faktoren). "Konstante Energie": Blutzucker-Kurven strecken jetzt über die volle Box-Breite (Bugfix, vorher durch SVG-Default-Seitenverhältnis "letterboxed") + neues Eyebrow-Label "Beispielhafter Blutzuckerverlauf". "Stress": neues Icon (gestresstes Gesicht + Blitz-Badge). "Screentime und Content": neue Zwischenüberschrift "Hinterfrage die folgenden Punkte:". "Sehen, riechen, schmecken & hören": die 4 Beobachtungspunkte jetzt als Icon-Infoboxen statt reiner nummerierter Liste — löst damit auch die bereits offene Frage aus dem ursprünglichen Refinement-Wunsch. Vorab per Artifact-Mockup abgestimmt (2 Korrekturrunden).

## Dependencies
- Requires: PROJ-36 (Ernährung-Hub) — Einstiegspunkt
- Requires: PROJ-38 (Emotionales Essen) — Arbeitspunkte "Stress" und "Screentime und Content" verlinken direkt auf die entsprechenden Themen dort statt sie zu duplizieren

## User Stories
- Als Nutzer:in, der/die abnimmt, möchte ich verstehen, warum Heißhunger entsteht, damit ich ihn nicht als persönliches Versagen werte
- Als Nutzer:in möchte ich konkrete Ursachen für Heißhunger erkennen (Blutzucker-Schwankungen, Stress, Screentime/Content, Alltags-Trigger), damit ich gezielt gegensteuern kann
- Als Nutzer:in möchte ich sehen, wie sich meine Mahlzeitenstruktur auf meinen Blutzucker auswirkt, damit ich verstehe, warum feste Mahlzeiten helfen
- Als Nutzer:in möchte ich eine konkrete Anleitung bekommen, wie ich meinen Social-Media-Feed anpasse, damit ich weniger unbewusst Lust auf Essen bekomme
- Als Nutzer:in möchte ich für einen Tag bewusst auf Alltags-Trigger (Werbung, Gerüche, Content) achten, damit mir die Menge an unbewussten Reizen bewusst wird

## Out of Scope
- Eigene, ausführliche Stress-Bewältigungs- und Screentime-Inhalte — bereits bei PROJ-38 (Emotionales Essen) behandelt, hier nur Verlinkung + kurzer Kontext-Satz, keine Duplizierung
- Interaktives Tracking/Logging der Beobachtungs-Aufgaben (z. B. Ankreuzen einzelner Trigger über den Tag) — bleibt wie bei den anderen Ernährungs-Guides reiner Lese-Inhalt + Standard-"Verstanden"-Toggle, kein Backend
- Personalisierte Berechnung des eigenen Kaloriendefizits an dieser Stelle — das leistet bereits der Kcal-Rechner (PROJ-37), hier nur die inhaltliche Erklärung, warum ein zu großes Defizit Heißhunger auslöst
- Exakte visuelle Umsetzung der Blutzucker-Vergleichsgrafiken und der Schritt-für-Schritt-Anleitung für Screentime/Content — Inhalt & Aussage sind hier festgelegt, die konkrete Visualisierung wird bei /architecture bzw. /frontend entschieden

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur
- [ ] Angenommen ein Nutzer öffnet /ernaehrung/heisshunger, wenn die Seite lädt, dann sieht er den Intro-Text und 4 Arbeitspunkte in der Reihenfolge: Konstante Energie, Stress, Screentime und Content, Sehen/riechen/schmecken & hören
- [ ] Angenommen die Seite ist geöffnet, wenn noch nichts angeklickt wurde, dann sind alle Arbeitspunkte eingeklappt (Accordion-Muster wie bei den anderen Ernährung-Guides)
- [ ] Angenommen ein Arbeitspunkt ist aufgeklappt, wenn der Nutzer auf "Verstanden" klickt, dann wird der Fortschritt aktualisiert und lokal gespeichert (wie bei PROJ-38)

### Konstante Energie
- [ ] Angenommen der Arbeitspunkt "Konstante Energie" ist aufgeklappt, wenn der Nutzer ihn liest, dann sieht er die Erklärung zum Blutzucker-Zusammenhang sowie die 2 Vergleichs-Grafiken (6 Mahlzeiten vs. 3 Mahlzeiten)
- [ ] Angenommen der Arbeitspunkt ist aufgeklappt, wenn der Nutzer weiterliest, dann sieht er den Bonus-Tipp zu zucker-/kohlenhydratreichen Snacks

### Stress & Screentime (Verlinkung)
- [ ] Angenommen der Arbeitspunkt "Stress" ist aufgeklappt, wenn der Nutzer auf den Link klickt, dann wird er zu /ernaehrung/emotionales-essen weitergeleitet
- [ ] Angenommen der Arbeitspunkt "Screentime und Content" ist aufgeklappt, wenn der Nutzer liest, dann sieht er die 4 Reflexionsfragen und die Handlungsempfehlung (entfolgen/wegwischen)

### Sehen, riechen, schmecken & hören
- [ ] Angenommen der Arbeitspunkt ist aufgeklappt, wenn der Nutzer liest, dann sieht er die 4 nummerierten Beobachtungs-Punkte für einen Tag (Werbung, Podcast/Radio, Gerüche, TV/Film/YouTube)

### Gast-Zugriff
- [ ] Angenommen ein Gast (kein Login), wenn er /ernaehrung/heisshunger öffnet, dann kann er die komplette Seite lesen (reiner statischer Inhalt, keine Anmeldung nötig)

## Edge Cases
- Was passiert, wenn der Nutzer den Stress-Link anklickt, ohne vorher "Emotionales Essen" gelesen zu haben? → Kein Problem, die Seite ist eigenständig verständlich, der Link ist ein Zusatzangebot, keine Voraussetzung
- Was passiert, wenn ein Gast (PROJ-19) die Seite öffnet? → Voller Lesezugriff, kein Feature dahinter erfordert Login (Fortschritt wird bei Gästen nur lokal im Browser gespeichert, nicht mit einem Konto verknüpft — wie bei den anderen Guides)
- Was passiert, wenn der Nutzer schon alle 4 Punkte als "Verstanden" markiert hat und die Seite erneut öffnet? → Fortschritt bleibt erhalten (localStorage), "Alles durch"-Hinweis wird angezeigt (bestehendes Muster)

## Technical Requirements (optional)
- Kein Backend nötig — rein statischer Content + lokal gespeicherter Fortschritt (gleiches Muster wie PROJ-38)
- Mobile-first, wie alle Screens

## Content: Intro & alle 4 Arbeitspunkte (finaler Wortlaut)

### Intro
> Heißhunger fühlt sich plötzlich an — ist er aber selten. Bekommt dein Körper deutlich weniger Energie als sonst, meldet er sich lauter: Hunger. Heißhunger entsteht meist, wenn das Kaloriendefizit zu groß ist. Deshalb arbeiten wir mit einem kleinen Defizit und tasten uns langsam an dein Ziel heran.

### 1. Konstante Energie
> Achte auf ein konstantes Energielevel — am besten mit 2–4 festen Mahlzeiten statt ständigem Snacken (mehr dazu bei "Emotionales Essen"). Warum? Jede Kalorie lässt deinen Blutzucker reagieren. Je schneller er steigt, desto tiefer fällt er danach — und genau das fühlt sich wie Heißhunger an.
>
> Zwei Vergleichs-Grafiken zeigen einen beispielhaften Blutzuckerverlauf über den Tag: **6 Mahlzeiten/Snacks** (Achterbahn-Muster, 6 Wellen, kein Ruhepunkt) vs. **3 Mahlzeiten** (3 Peaks, jeweils ein langsamer, sanfter Abstieg bis zur nächsten Mahlzeit).
>
> Bonus: Zucker- und kohlenhydratreiche Snacks (Banane, Brot, Reiswaffel, Gummibärchen) lassen die Kurve besonders steil steigen und fallen. Iss Süßes lieber direkt nach einer Mahlzeit oder kombiniert mit Protein und Fett.

### 2. Stress
> Stress fühlt sich oft wie Heißhunger an — ist aber meist unbewusstes Essen als Ausgleich. Was wirklich hilft, findest du unter "Emotionales Essen" → *(Link zu /ernaehrung/emotionales-essen)*

### 3. Screentime und Content
> Screentime allein haben wir schon bei "Emotionales Essen" behandelt — hier geht's um die Inhalte. Dein Algorithmus weiß genau, worauf du anspringst: Rezeptvideos, Genuss-Content, "So lecker"-Reels. Das Ergebnis: Lust, obwohl du keinen echten Hunger hast.
>
> Achte bewusst auf:
> - Wem folge ich?
> - Was sehe ich in meinem Feed?
> - Was wird mir von Influencern, denen ich vertraue, verkauft (nicht nur gezeigt)?
> - Worauf habe ich gerade ständig Lust?
>
> Lösung: Entfolgen oder schneller wegwischen — so lernt dein Algorithmus, dir weniger davon zu zeigen.
>
> *(Nutzerwunsch: grafische Schritt-für-Schritt-Aufbereitung dieser Anleitung — Details bei /frontend)*

### 4. Sehen, riechen, schmecken & hören
> Dein Alltag steckt voller Trigger, die Appetit wecken sollen — wir leben in einer satten Gesellschaft, die trotzdem hungrig gemacht werden soll. Achte einen Tag lang bewusst auf:
>
> 1. Auf dem Weg zur Arbeit: Welche Werbeplakate wollen mir Essen verkaufen?
> 2. In Podcasts/Radio: Welche Snacks werden mir schmackhaft gemacht?
> 3. Unterwegs: Welche Gerüche nehme ich wahr (Bäckerei, Dönerbude, Crêpes-Stand)?
> 4. TV/Film/YouTube: Welcher Deal oder welches Trendprodukt wird mir gerade verkauft?

## Open Questions
- [x] Konkrete Visualisierung der 2 Blutzucker-Vergleichsgrafiken → bei /frontend umgesetzt: 2 illustrative SVG-Kurven (Achterbahn-Zickzack für 6 Mahlzeiten vs. sanfte 3-Peaks-Kurve für 3 Mahlzeiten), siehe `blutzucker-vergleichs-grafik.tsx` (2026-09-01)
- [x] Konkrete Visualisierung der Schritt-für-Schritt-Anleitung bei "Screentime und Content" — aktuell als einfache Fließtext-Liste umgesetzt (konsistent mit den Reflexionsfragen bei "Emotionales Essen"); Nutzer wünschte sich ursprünglich eine grafischere Aufbereitung → im Refinement 2026-09-04 stattdessen bei "Sehen, riechen, schmecken & hören" umgesetzt (Icon-Infoboxen); "Screentime und Content" selbst bekam nur eine neue Zwischenüberschrift, bleibt sonst Fließtext (Nutzerwunsch war hier nur die Überschrift, keine grafische Umgestaltung)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Stress & Screentime verlinken auf PROJ-38 (Emotionales Essen) statt Inhalte zu duplizieren | Nutzer verweist im Rohtext selbst explizit auf die entsprechenden Punkte bei Emotionales Essen ("Geh mal zur Seite mit emotionalem Essen") | 2026-09-01 |
| 4 flache Arbeitspunkte, keine Sektions-Gruppierung wie bei PROJ-38 | Alle 4 Themen sind gleichrangig, keine natürliche Unterteilung wie bei "emotionsspezifisch vs. allgemein" nötig | 2026-09-01 |
| Rohtext deutlich gekürzt/verdichtet für die App-Copy | Nutzer bevorzugt beim Schreiben Ausführlichkeit, hat aber selbst erkannt, dass das für schnelle Infos in der App hinderlich ist — verdichtete Fassung wurde vom Nutzer explizit bestätigt ("Passt so") | 2026-09-01 |
| Keine Interaktivität bei "Sehen/riechen/schmecken & hören" über den Standard-"Verstanden"-Toggle hinaus | Konsistent mit allen anderen reinen Reflexions-/Lese-Arbeitspunkten in PROJ-34/37/38 | 2026-09-01 |
| **Refinement 2026-09-04:** Icon-Zuordnung bei "Sehen, riechen, schmecken & hören" nach Inhalt statt starr nach den 4 Sinnen im Titel (Eye→Werbeplakate, Ear→Podcast/Radio, Wind→Gerüche, Tv→TV/Film/YouTube) | Die 4 bestehenden Beobachtungspunkte decken inhaltlich nicht exakt die 4 Sinne "Sehen/riechen/schmecken/hören" ab (kein Punkt ist rein übers Schmecken) — erzwungene 1:1-Zuordnung hätte ein Icon falsch benannt; Nutzer hat die inhaltsbasierte Zuordnung im Mockup kommentarlos akzeptiert | 2026-09-04 |
| **Refinement 2026-09-04:** Stress-Icon aus Lucide (`Angry` + `Zap`-Badge) statt Freihand-SVG | Konsistent mit der PROJ-37-Entscheidung, fertige Lucide-Icons Freihand-Entwürfen vorzuziehen, wenn ein passendes Icon existiert | 2026-09-04 |
| **Bugfix 2026-09-04:** Blitz-Badge-Positionierung von `-top-1.5 -right-2` auf `top-0 -right-2` geändert (kein negativer Y-Offset mehr) | Nutzer meldete den Smiley "ab dem Zap oben abgeschnitten" — Radix Accordion Content rendert mit `overflow-hidden` und `pt-0` (keinerlei oberer Innenabstand); ein negativer `top`-Offset auf dem Badge kann dadurch über den oberen Rand des Akkordeon-Panels hinausragen und abgeschnitten werden. Horizontaler Overshoot (`-right-2`) bleibt bewusst erhalten (klassischer "Ecke-Badge"-Look, dort kein Clipping beobachtet, da der Text daneben genug Breite lässt) | 2026-09-04 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Bestehende `ArbeitspunkteListe`-Komponente wiederverwenden statt neu bauen | Einheitliches Verhalten über alle 4 Ernährungs-Guides, kein zusätzlicher Entwicklungsaufwand | 2026-09-01 |
| Neue kleine Grafik-Komponente für den Blutzucker-Vergleich statt Wiederverwendung von `WochenBalkenDiagramm` | Anderer Darstellungsbedarf — durchgehender Kurvenverlauf statt 7 einzelne Tages-Balken; bleibt aber im selben rein illustrativen, CSS-basierten Stil ohne Chart-Bibliothek | 2026-09-01 |
| Kein Erstbesucher-Onboarding (Auto-Öffnen/Pulse/Dialog) wie bei PROJ-38 | War eine gezielte Einführung ins Akkordeon-Konzept selbst — Nutzer kennen das Muster inzwischen aus 3 anderen Guides, spart Aufwand | 2026-09-01 |
| Kein Backend / keine neue API-Route | Reiner Lese-Inhalt, identisch zum Muster von PROJ-38 und Teilen von PROJ-37 | 2026-09-01 |
| **Refinement 2026-09-01:** `ersterPunktOnboarding={{ autoOpenNachMs: 700 }}` doch ergänzt (erster Arbeitspunkt klappt beim Laden automatisch auf) | Löst die Entscheidung "Kein Erstbesucher-Onboarding" (Zeile oben) teilweise ab — Nutzerwunsch nach konsistentem Auto-Open-Verhalten über alle Ernährung-Guides hinweg (ohne Pulse/Dialog, die bleiben PROJ-38-exklusiv). `pulseNachMs` in `ArbeitspunkteListe` dafür optional gemacht. | 2026-09-01 |
| **Refinement 2026-09-01:** Neue Überschrift "Plötzlich Hunger?" oberhalb des bestehenden Intro-Texts ergänzt (Text selbst unverändert) | War der letzte Ernährungs-Guide ohne eigene H1 — Nutzerwunsch nach konsistenter Überschrift wie bei allen anderen Guides | 2026-09-01 |
| **Refinement 2026-09-04:** Neue Icons in der bestehenden, projektweit geteilten `arbeitspunkt-icons.tsx` ergänzt statt einer neuen, PROJ-39-exklusiven Datei | Datei ist bereits generisch benannt (nicht "so-geht-abnehmen-icons") und wird schon für Arbeitspunkte-Icons über Guides hinweg genutzt — vermeidet Datei-Wildwuchs | 2026-09-04 |
| **Refinement 2026-09-04:** `SinnesBox`-Wrapper-Komponente lokal (nicht exportiert) direkt in `heisshunger-guide.tsx` definiert statt in einer eigenen Datei | Nur 4 Verwendungen an einer einzigen Stelle, kein Wiederverwendungsbedarf über die Datei hinaus — folgt demselben Muster wie `Kurve` in `blutzucker-vergleichs-grafik.tsx` | 2026-09-04 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur

```
/ernaehrung/heisshunger (Seite, ersetzt den bestehenden Platzhalter aus PROJ-36)
+-- ErnaehrungSubHeader ("Heißhunger") — bestehende Komponente, unverändert
+-- HeisshungerGuide (neu, analog zu EmotionalesEssenGuide)
    +-- Intro-Text
    +-- ArbeitspunkteListe (bestehende Komponente) — 4 flache Punkte, keine Sektions-Gruppierung
        +-- 1. Konstante Energie
        |     +-- Erklärtext (Blutzucker-Zusammenhang)
        |     +-- BlutzuckerVergleichsGrafik (neu) — 2 illustrative Kurven nebeneinander
        |     +-- Bonus-Tipp-Kasten
        +-- 2. Stress
        |     +-- Kurztext + Link auf /ernaehrung/emotionales-essen
        +-- 3. Screentime und Content
        |     +-- Erklärtext
        |     +-- 4 Reflexionsfragen
        |     +-- Handlungsempfehlung
        +-- 4. Sehen, riechen, schmecken & hören
              +-- Erklärtext
              +-- 4 nummerierte Beobachtungspunkte
```

### B) Datenmodell (einfache Sprache)

Kein neues Datenmodell nötig. Genutzt wird exakt dasselbe Muster wie bei "Emotionales Essen": Welche der 4 Punkte als "Verstanden" markiert wurden, wird im Browser gespeichert (eigener Speicher-Schlüssel, damit sich der Fortschritt nicht mit anderen Guides überschneidet). Kein Server, kein Nutzerkonto nötig — funktioniert identisch für eingeloggte Nutzer und Gäste.

### C) Tech-Entscheidungen (Begründung für PM)

- **Kein Backend, keine neue API-Route.** Die Seite ist reiner Lese-Inhalt, genau wie "Emotionales Essen" und große Teile von "So geht abnehmen". Das hält die Umsetzung schnell und wartungsarm.
- **Bestehende Arbeitspunkte-Komponente wiederverwenden statt neu bauen.** Sorgt automatisch für ein einheitliches Verhalten (Auf-/Zuklappen, Fortschrittsbalken, "Verstanden"-Button) über alle 4 Ernährungs-Guides hinweg — Nutzer müssen sich nicht an eine neue Bedienung gewöhnen.
- **Eine neue, kleine Grafik-Komponente für den Blutzucker-Vergleich.** Die bestehende Balkendiagramm-Komponente (genutzt bei "So geht abnehmen" für Wöchentlich-vs-Täglich) passt vom Baustil her nicht — dort geht es um 7 einzelne Tage als Balken, hier um einen durchgehenden Kurvenverlauf mit Auf und Ab. Deshalb eine neue, ebenso einfache, rein illustrative Komponente (keine echten Messwerte, keine Chart-Bibliothek) im selben visuellen Stil.
- **Kein Erstbesucher-Onboarding (Auto-Öffnen/Pulsieren/Erklär-Overlay) wie bei "Emotionales Essen".** Das war dort eine gezielte Einführung in das neue Akkordeon-Konzept selbst. Nutzer kennen dieses Konzept inzwischen aus 3 anderen Guides — für Heißhunger nicht nötig, spart Entwicklungsaufwand. Kann bei Bedarf später ergänzt werden.

### D) Abhängigkeiten (zu installierende Pakete)

Keine neuen Pakete nötig — vollständig mit den bereits installierten shadcn/ui-Komponenten und Tailwind CSS umsetzbar.

## Implementation Notes (Frontend)
- Neu: `src/components/heisshunger-guide.tsx` — Intro-Text + 4 flache Arbeitspunkte (keine Sektions-Gruppierung), nutzt `ArbeitspunkteListe` mit eigenem `localStorage`-Key (`hh_completed`).
- Neu: `src/components/blutzucker-vergleichs-grafik.tsx` — 2 rein illustrative SVG-Kurven (kein echtes Chart, keine Achsen/Werte) im selben Stil wie `WochenBalkenDiagramm` (PROJ-37): Achterbahn-Kurve (6 Mahlzeiten, amber) vs. sanftere 3-Peaks-Kurve (grün).
- `src/app/ernaehrung/heisshunger/page.tsx`: Platzhalter aus PROJ-36 durch `HeisshungerGuide` ersetzt.
- `npm run build`, `npm run lint`, `npm test` (415/415) fehlerfrei. Verifiziert per Playwright-Skript (Text- und Screenshot-Check nach Animations-Settle) statt Browser-Tool-Screenshot, da Letzteres bei diesem Feature zwischenzeitlich Navigations-Probleme zeigte — Playwright bestätigt: Intro sichtbar, alle 4 Arbeitspunkte in korrekter Reihenfolge, beide Blutzucker-Kurven rendern korrekt (Achterbahn-Zickzack vs. sanfte 3-Peaks-Kurve), Stress-Link zeigt auf `/ernaehrung/emotionales-essen`, Screentime-Reflexionsfragen sichtbar, genau 4 nummerierte Beobachtungspunkte bei "Sehen, riechen, schmecken & hören".

### Implementation Notes (Frontend, Refinement 2026-09-04): Icon-Feinschliff
Reine Frontend-/Darstellungs-Änderung, kein Backend-Bezug. Vorab per Artifact-Mockup mit dem Nutzer abgestimmt (2 Korrekturrunden: Kurven-Stretch-Bug gefunden + Icon-Zentrierung bei den 4 Sinn-Boxen).

- `src/components/heisshunger-guide.tsx`: neuer Intro-Text; `StressIcon` neben dem Stress-Text eingebaut (`flex items-center gap-3`); neue Zwischenüberschrift "Hinterfrage die folgenden Punkte:" zwischen Screentime-Intro und Reflexionsfragen; die 4 Beobachtungspunkte bei "Sehen, riechen, schmecken & hören" von `<ol>/<li>` auf ein `grid grid-cols-1 sm:grid-cols-2`-Layout mit neuer lokaler `SinnesBox`-Komponente (Icon + Text in einer `#DFF0F2`-Box) umgestellt — Icons `Eye`/`Ear`/`Wind`/`Tv` aus `lucide-react`, nach Inhalt zugeordnet (siehe Decision Log).
- `src/components/arbeitspunkt-icons.tsx`: neuer Export `StressIcon` — Lucide `Angry` (gestresstes Gesicht) mit kleinem `Zap`-Blitz-Badge (amber, weißes Icon) oben rechts, `position:absolute` analog zum bereits bestehenden Icon-Kompositions-Muster in dieser Datei.
- `src/components/blutzucker-vergleichs-grafik.tsx`: **Bugfix** — `preserveAspectRatio="none"` + `vectorEffect="non-scaling-stroke"` auf beiden Kurven-SVGs ergänzt. Vorher hat das SVG-Default-Seitenverhältnis (`xMidYMid meet`) die Kurve mittig "letterboxed" statt über die volle Box-Breite zu strecken — ein vorbestehender Bug, der erst durch den Nutzer-Vergleich mit dem Artifact-Mockup auffiel. `non-scaling-stroke` verhindert, dass die nicht-uniforme Skalierung die Strichbreite verzerrt. Zusätzlich neues Eyebrow-Label "Beispielhafter Blutzuckerverlauf" (Activity-Icon + Text) oberhalb beider Kurven.
- `tests/PROJ-39-heisshunger.spec.ts`: 2 bestehende Tests angepasst — "4 Arbeitspunkte in der richtigen Reihenfolge" nutzt jetzt Button-Y-Positionen statt `indexOf()`-Textsuche (der neue Intro-Text enthält "Stresslevel", was eine naive Suche nach "Stress" fälschlicherweise vor dem eigentlichen Trigger-Button gefunden hätte); "4 nummerierte Beobachtungspunkte" auf die neue Icon-Infobox-Struktur umgestellt. 5 neue Tests: Intro-Text-Inhalt, Kurven-Stretch (Bounding-Box ≥ 85 % der Kartenbreite), Stress-Icon (2 SVGs: Gesicht + Blitz), neue Zwischenüberschrift, Icon-Infoboxen (je 1 SVG pro Box). Suite: 13 → 18 Tests, 18/18 grün (chromium + Mobile Chrome).
- `npm run build`, `npm run lint`, `npm test` (464/464) fehlerfrei. Einzige verbleibende Lint-Fehler: die bekannten, unabhängigen `sidebar.tsx`-Fehler (separater Task).
- Regression: PROJ-36 (Ernährung-Hub) 19/19, PROJ-37 (teilt sich `arbeitspunkt-icons.tsx`) 36/36 — keine Auswirkung durch die neuen Exporte.
- Manuell per Playwright verifiziert (Desktop 1280px + Mobile 375px): alle 4 Änderungen rendern wie im approved Mockup, kein horizontales Overflow auf 375px, 2-spaltiges Icon-Grid bei "Sehen, riechen..." kollabiert korrekt auf 1 Spalte unterhalb `sm:`.

### Bugfix (2026-09-04): Stress-Icon oben abgeschnitten
Nutzer meldete nach der lokalen Implementierung, noch vor dem Deploy: Smiley "ab dem Zap oben abgeschnitten". Root Cause: Radix Accordion Content rendert mit `overflow-hidden` + `pt-0` (kein oberer Innenabstand) — der Blitz-Badge hatte einen negativen `top`-Offset (`-top-1.5`), der über den oberen Rand des Akkordeon-Panels hinausragen und dadurch abgeschnitten werden konnte. Fix: `top-0` statt `-top-1.5` in `src/components/arbeitspunkt-icons.tsx` (`StressIcon`) — horizontaler Overshoot (`-right-2`, klassischer Ecke-Badge-Look) bleibt erhalten, dort kein Clipping-Risiko. Per Playwright verifiziert (Desktop + Mobile, generöse Bounding-Box-Crops zur Sichtprüfung): Icon und Badge rendern vollständig. Neuer permanenter Regressionstest prüft, dass die Badge-Y-Position nie oberhalb der Gesichts-Icon-Y-Position liegt. `npm run build`, `npm run lint`, `npm test` (464/464) weiterhin grün, Suite 18 → 19 Tests.

## QA Test Results

**Tested:** 2026-09-01
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Seitenstruktur
- [x] Intro-Text sichtbar
- [x] 4 Arbeitspunkte in korrekter Reihenfolge (Konstante Energie → Stress → Screentime und Content → Sehen/riechen/schmecken & hören)
- [x] "Verstanden" aktualisiert Fortschritt und speichert lokal (bleibt nach Reload erhalten)

#### Konstante Energie
- [x] Blutzucker-Erklärung + beide Vergleichs-Grafiken sichtbar (beide SVGs rendern mit korrekter Beschriftung/ARIA-Label)
- [x] Bonus-Tipp zu zucker-/kohlenhydratreichen Snacks sichtbar

#### Stress & Screentime (Verlinkung)
- [x] "Stress"-Link zeigt korrekt auf `/ernaehrung/emotionales-essen`
- [x] "Screentime und Content" zeigt alle 4 Reflexionsfragen + Handlungsempfehlung

#### Sehen, riechen, schmecken & hören
- [x] Genau 4 nummerierte Beobachtungspunkte in korrekter Reihenfolge

#### Gast-Zugriff
- [x] Gast (keine Session, Cookies gelöscht) kann die Seite vollständig lesen, Status < 400

### Edge Cases Status

#### EC-1: Stress-Link ohne vorheriges Lesen von "Emotionales Essen"
- [x] Kein Problem — Seite ist eigenständig verständlich, Link ist reines Zusatzangebot

#### EC-2: Gast-Zugriff
- [x] Voller Lesezugriff bestätigt, kein Login-Zwang, kein 404/500

#### EC-3: Fortschritt bleibt nach Reload erhalten, "Alles durch"-Hinweis bei 4/4
- [x] Bestätigt — Fortschritt persistiert über Reload, "Alles durch ✓"-Hinweis erscheint korrekt bei allen 4 abgeschlossenen Punkten

### Security Audit Results
- [x] Kein Backend/keine API-Route — keine Angriffsfläche für Auth-Bypass, Injection oder Rate-Limiting-Probleme (0 `/api/`-Requests bei voller Interaktion gemessen)
- [x] Kein Nutzer-Input auf der Seite (nur Lese-Interaktion: Auf-/Zuklappen, "Verstanden") — kein XSS-Vektor vorhanden
- [x] Gast-Zugriff funktioniert wie spezifiziert, keine versteckten Auth-Anforderungen
- [x] Keine sensiblen Daten im Client (rein statischer Content, `localStorage` enthält nur eine ID-Liste abgeschlossener Punkte, keine personenbezogenen Daten)
- [ ] Transienter Konsolenfehler ("Failed to load resource: 404") einmalig bei einem Testlauf beobachtet, bei Wiederholung mit identischer Interaktionsfolge nicht reproduzierbar; `npm run build` läuft fehlerfrei durch. Sehr wahrscheinlich Next.js-Dev-Server-Rauschen (z. B. HMR/Chunk-Reload durch parallele Änderungen in dieser Session), keine Bug-Einstufung, da nicht reproduzierbar und ohne funktionale Auswirkung — bei erneutem Auftreten in Produktion bitte melden

### Regression Testing
- `PROJ-36-ernaehrung-hub.spec.ts`: Platzhalter-Test hätte für `/ernaehrung/heisshunger` fehlschlagen müssen (zeigt jetzt echten Inhalt statt "Bald verfügbar") — als Teil dieser QA-Runde behoben: aus der Platzhalter-Liste entfernt, eigene Abdeckung jetzt in `PROJ-39-heisshunger.spec.ts`. Volle PROJ-36-Suite danach grün (19/19 pro Browser).
- Keine Änderungen an gemeinsam genutzten Komponenten (`ArbeitspunkteListe`, `ErnaehrungSubHeader`) — kein weiteres Regressionsrisiko für andere Guides.
- `npm run build`, `npm run lint` (0 Fehler, 1 vorbestehende, nicht mit PROJ-39 zusammenhängende Warnung), `npm test` (415/415) grün.
- Responsive geprüft bei 375px, 768px, 1440px — kein horizontales Scrollen in main content.

### Bugs Found
Keine.

### Summary
- **Acceptance Criteria:** 9/9 passed
- **Bugs Found:** 0
- **Security:** Pass (kein Backend, keine Nutzereingaben, minimale Angriffsfläche; ein nicht reproduzierbarer, dev-server-typischer Konsolenfehler dokumentiert, keine funktionale Auswirkung)
- **Production Ready:** YES
- **Recommendation:** Deploy

### QA Summary (Refinement 2026-09-04): Icon-Feinschliff + Bugfix
Reine Frontend-Änderung, kein Backend-Bezug. Vorab per Artifact-Mockup abgestimmt (2 Korrekturrunden), während der Umsetzung 1 zusätzlicher Bug gefunden und noch vor Deploy behoben (Blitz-Badge-Clipping im Accordion, siehe Implementation Notes/Decision Log).

- **E2E-Suite:** von 13 auf 19 Tests erweitert, 19/19 grün (chromium + Mobile Chrome).
- **Regression:** PROJ-36 (Ernährung-Hub) 19/19, PROJ-37 (teilt sich `arbeitspunkt-icons.tsx`) 36/36.
- **Build/Lint/Vitest:** `npm run build`, `npm run lint`, `npm test` (464/464) fehlerfrei — einzige verbleibenden Lint-Fehler sind die bekannten, unabhängigen `sidebar.tsx`-Fehler (separater Task).
- **Security:** Pass (trivial) — reine Darstellungsänderung, keine neue Angriffsfläche.
- **Bugs Found:** 1 (Medium, Blitz-Badge-Clipping — gefunden und gefixt vor Deploy).
- **Production Ready:** YES
- **Recommendation:** Deploy.

## Deployment
- **Production URL:** https://app.mehralsabnehmen.de/ernaehrung/heisshunger
- **Deployed:** 2026-09-01 (Vercel auto-deploy via Push zu `main`, commits `37a3411`..`f0c02b0`)
- **Verified in Produktion:** Nutzer hat die Live-Seite geprüft, alles grün ("Alles auf Grün").
- **Refinement-Deploy 2026-09-01** (Vercel auto-deploy via Push zu `main`, commits `3e0fb64`..`2e7aae4`, Tag `v2.8.0-ernaehrung-guides`): Teil eines gebündelten Deploys über PROJ-34/37/38/39/40/41 — Erstbesucher-Auto-Open (erster Punkt öffnet automatisch) + neue Überschrift "Plötzlich Hunger?". Nutzer hat auf Produktion visuell bestätigt ("Alles auf Grün").
