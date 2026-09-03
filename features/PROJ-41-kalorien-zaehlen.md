# PROJ-41: Kalorien zählen

## Status: Deployed
**Created:** 2026-09-01
**Last Updated:** 2026-09-01

## Dependencies
- Requires: PROJ-36 (Ernährung-Hub) — Einstiegspunkt
- Requires: PROJ-37 (So geht abnehmen) — Arbeitspunkt "Warum zählen wir Kalorien?" verlinkt auf den dortigen Kcal-Rechner
- Requires: PROJ-40 (Kalorien) — Arbeitspunkt "Warum zählen wir Kalorien?" verlinkt auf den Makronährstoff-Guide

## User Stories
- Als Nutzer:in möchte ich verstehen, warum Kalorienzählen überhaupt sinnvoll ist, damit ich es nicht als reine Zahlen-Buchhaltung empfinde
- Als Nutzer:in möchte ich verstehen, dass Kalorienzählen ein Werkzeug auf Zeit ist, damit ich nicht das Gefühl habe, es für immer tun zu müssen
- Als Nutzer:in möchte ich einen konkreten Ausstiegs-Fahrplan (2–3 Monate, dann schrittweise reduzieren) sehen, damit ich weiß, wann und wie ich aufhören kann
- Als Nutzer:in möchte ich wissen, was ich an stressigen/überfordernden Tagen tun kann, damit ein Rückfall ins Zählen sich nicht wie Scheitern anfühlt

## Out of Scope
- Eigene Kalorienrechner- oder Tracking-Logik — existiert bereits unter "So geht abnehmen" (PROJ-37); dieses Feature ist reiner Aufklärungs-Content zum "Warum" und "Wie lange", kein Ernährungstagebuch (das wäre PROJ-7, noch nicht gebaut)
- Detaillierte Erklärung der Makronährstoffe — bereits bei PROJ-40 (Kalorien) behandelt, hier nur Verlinkung
- Exakte visuelle Umsetzung der "Jetzt vs. Zukunft"-Grafik (2 Personen-Icons) und der 3er-Liste bei "Warum zählen wir Kalorien?" — Inhalt & Konzept sind hier festgelegt, konkrete Gestaltung wird bei /frontend entschieden

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur
- [ ] Angenommen ein Nutzer öffnet /ernaehrung/kalorien-zaehlen, wenn die Seite lädt, dann sieht er 2 Arbeitspunkte in der Reihenfolge: "Warum zählen wir Kalorien?" und "Das Wichtigste beim Kalorienzählen: das Aufhören"
- [ ] Angenommen die Seite ist geöffnet, wenn noch nichts angeklickt wurde, dann sind beide Punkte eingeklappt
- [ ] Angenommen ein Punkt ist aufgeklappt, wenn der Nutzer auf "Verstanden" klickt, dann wird der Fortschritt aktualisiert und lokal gespeichert

### Warum zählen wir Kalorien?
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer liest, dann sieht er alle 3 Gründe als visuell hervorgehobene Liste (nicht als Fließtext)
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer beim 3. Grund weiterliest, dann sieht er die 3 konkreten Erkenntnis-Fragen (Wie lange satt? Was tut mir gut? Woher die Energie?)
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer auf den Link zum Kcal-Rechner klickt, dann wird er zu /ernaehrung/so-geht-abnehmen weitergeleitet
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer auf den Link zu den Makronährstoffen klickt, dann wird er zu /ernaehrung/kalorien weitergeleitet

### Das Aufhören
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer liest, dann sieht er die Stützräder-Analogie und die "Jetzt vs. Zukunft"-Grafik (graues Personen-Icon mit neutralem Mundwinkel "So isst du jetzt" vs. grünes Personen-Icon mit lachendem Mundwinkel "So wirst du in Zukunft essen")
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer weiterliest, dann sieht er den konkreten Ausstiegs-Fahrplan (2–3 Monate zählen, dann erste freie Tage, schrittweise Reduktion)
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer weiterliest, dann sieht er den Hinweis für stressige Tage (an diesem einen Tag wieder zählen, danach zurück zum normalen Alltag)

### Gast-Zugriff
- [ ] Angenommen ein Gast (kein Login), wenn er /ernaehrung/kalorien-zaehlen öffnet, dann kann er die komplette Seite lesen

## Edge Cases
- Was passiert, wenn der Nutzer noch nie den Kcal-Rechner benutzt hat und auf den Link klickt? → Kein Problem, der Rechner zeigt einfach ein leeres Formular (bestehendes PROJ-37-Verhalten)
- Was passiert bei einem Gast-Zugriff? → Voller Lesezugriff, Fortschritt nur lokal im Browser gespeichert, wie bei allen anderen Ernährungs-Guides
- Was passiert, wenn beide Punkte als "Verstanden" markiert wurden und die Seite erneut geöffnet wird? → Fortschritt bleibt erhalten, "Alles durch"-Hinweis erscheint

## Technical Requirements (optional)
- Kein Backend nötig — rein statischer Content + lokal gespeicherter Fortschritt (gleiches Muster wie PROJ-38/39/40)
- Mobile-first

## Content: Alle Arbeitspunkte (finaler Wortlaut)

### 1. Warum zählen wir Kalorien?
> Drei Gründe, warum sich Kalorienzählen lohnt:
>
> 1. 🎯 **Abnehmen mit Plan** — Du weißt, wie viel dein Körper braucht, und gibst ihm bewusst weniger. → *(Link zum Kcal-Rechner, /ernaehrung/so-geht-abnehmen)*
> 2. 🍽️ **Nährstoffe verstehen** — Du lernst, wo welche Energie und Makronährstoffe stecken. Wichtig, wenn du dich umfangreich und ausgewogen ernähren möchtest. → *(Link zu "Kalorien", /ernaehrung/kalorien)*
> 3. ⭐ **Deinen Körper kennenlernen** (der wohl wichtigste Punkt!) — Du lernst, mit welcher Energie dein Körper auskommt. Du lernst:
>    - Wie lange bin ich mit welcher Mahlzeit satt?
>    - Was tut mir gut?
>    - Woher bekommt mein Körper die Energie, die ich brauche, um das zu tun, was ich mir vornehme?

### 2. Das Wichtigste beim Kalorienzählen: das Aufhören
> Kalorienzählen ist wie Fahrradfahren mit Stützrädern — irgendwann dürfen die auch wieder ab.
>
> **Grafik "Jetzt vs. Zukunft":** zwei Personen-Icons nebeneinander. Links: graues Personen-Icon mit geradem Mundwinkel, Beschriftung "So isst du jetzt". Rechts: grünes Personen-Icon mit nach oben zeigendem (lächelndem) Mundwinkel, Beschriftung "So wirst du in Zukunft essen".
>
> Es geht darum, zu lernen, wie sich dein Zukunfts-Ich ernährt. Dein Zukunfts-Ich hat ein Zielgewicht — dein Wohlfühlgewicht. Lerne, was dein Körper mit den Kalorien macht, statt sie nur zu zählen.
>
> Nach 2–3 Monaten aufmerksamem Zählen: Nimm dir erste freie Tage. Du hast längst Gerichte im Alltag, die einer Routine folgen — mach einfach damit weiter und reduziere Schritt für Schritt.
>
> Fühlst du dich an einem Tag überfordert oder gestresst? Zähl an diesem einen Tag wieder — das gibt dir Sicherheit. Am nächsten Tag geht's zurück in deinen neuen normalen Alltag.

## Open Questions
Keine — Inhalt final, inklusive der vom Nutzer präzisierten Grafik-Idee für "Das Aufhören" (Jetzt-vs.-Zukunft-Personen-Icons).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Nur 2 Arbeitspunkte statt einer größeren Liste | Passt zum bestehenden Hub-Untertitel "Sinn, Grenzen und der Ausstieg" — beide Punkte decken das gemeinsam ab, kein künstliches Aufblähen nötig | 2026-09-01 |
| Grund 1 und 2 verlinken auf bestehende Guides (Kcal-Rechner, Makronährstoffe) statt Inhalte zu duplizieren | Vermeidet Redundanz, konsistent mit dem Verlinkungs-Muster aus PROJ-39/40 | 2026-09-01 |
| "Warum zählen wir Kalorien?" als visuell hervorgehobene Liste statt Fließtext | Expliziter Nutzerwunsch ("Zeige die Liste") | 2026-09-01 |
| "Jetzt vs. Zukunft"-Grafik (graues neutrales vs. grünes lächelndes Personen-Icon) als zentrales visuelles Element bei "Das Aufhören" | Vom Nutzer explizit vorgegebenes Konzept, verbindet die Stützräder-Analogie mit einem konkreten Vorher-Nachher-Bild | 2026-09-01 |
| Rohtext deutlich verdichtet für die App-Copy | Nutzer bevorzugt beim Schreiben Ausführlichkeit, hat aber selbst erkannt, dass das für schnelle Infos in der App hinderlich ist — Muster aus PROJ-38/39/40 fortgeführt | 2026-09-01 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Bestehende `ArbeitspunkteListe`-Komponente wiederverwenden statt neu bauen | Einheitliches Verhalten über alle Ernährungs-Guides, kein zusätzlicher Entwicklungsaufwand | 2026-09-01 |
| "Jetzt vs. Zukunft"-Vergleich mit vorhandenen Gesichts-Icons (neutral/grau vs. lächelnd/grün) aus der bereits installierten Icon-Bibliothek statt einer Custom-Illustration | Kein neues Paket, kein Custom-SVG nötig, gleiche visuelle Aussage schneller umsetzbar | 2026-09-01 |
| Kein Erstbesucher-Onboarding wie bei PROJ-38 | War eine einmalige, gezielte Einführung ins Akkordeon-Konzept selbst — nicht pro Guide nötig | 2026-09-01 |
| Kein Backend / keine neue API-Route | Reiner Lese-Inhalt, identisch zum Muster von PROJ-38/39/40 | 2026-09-01 |
| **Refinement 2026-09-01:** `ersterPunktOnboarding={{ autoOpenNachMs: 700 }}` doch ergänzt (erster Arbeitspunkt klappt beim Laden automatisch auf) | Löst die Entscheidung "Kein Erstbesucher-Onboarding" (Zeile oben) teilweise ab — Nutzerwunsch nach konsistentem Auto-Open-Verhalten über alle Ernährung-Guides hinweg (ohne Pulse/Dialog, die bleiben PROJ-38-exklusiv). `pulseNachMs` in `ArbeitspunkteListe` dafür optional gemacht. | 2026-09-01 |
| **Refinement 2026-09-01:** Neue Überschrift "Warum das Alles?" + neuer, kürzerer Intro-Text ("Kalorien zählen ist ein Werkzeug auf Zeit, damit du wieder lernst was deinen Körper nährt...") ersetzt den bisherigen Intro-Satz | War der letzte Ernährungs-Guide ohne eigene H1 — Nutzerwunsch nach konsistenter Überschrift wie bei allen anderen Guides. Betroffene E2E-Tests (Intro-Text-Regex in Seitenstruktur + Gast-Zugriff) auf den neuen Wortlaut aktualisiert. | 2026-09-01 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur

```
/ernaehrung/kalorien-zaehlen (Seite, ersetzt den bestehenden Platzhalter aus PROJ-36)
+-- ErnaehrungSubHeader ("Kalorien zählen") — bestehende Komponente, unverändert
+-- KalorienZaehlenGuide (neu, analog zu KalorienGuide/HeisshungerGuide)
    +-- ArbeitspunkteListe (bestehende Komponente) — 2 flache Punkte
        +-- 1. Warum zählen wir Kalorien?
        |     +-- GruendeListe (neu) — 3 hervorgehobene Karten (Icon + Titel + Text);
        |           die 3. Karte zeigt zusätzlich die 3 Erkenntnis-Fragen
        +-- 2. Das Wichtigste beim Kalorienzählen: das Aufhören
              +-- Stützräder-Analogie (Text)
              +-- JetztZukunftVergleich (neu) — 2 Icons nebeneinander: graues,
              |     neutrales Gesichts-Icon ("So isst du jetzt") vs. grünes,
              |     lächelndes Gesichts-Icon ("So wirst du in Zukunft essen")
              +-- Ausstiegs-Fahrplan + Stress-Tag-Hinweis (Text)
```

### B) Datenmodell (einfache Sprache)

Kein neues Datenmodell nötig. Genutzt wird exakt dasselbe Muster wie bei den anderen Ernährungs-Guides: Welcher der 2 Punkte als "Verstanden" markiert wurde, wird im Browser gespeichert (eigener Speicher-Schlüssel). Kein Server, kein Nutzerkonto nötig.

### C) Tech-Entscheidungen (Begründung für PM)

- **Kein Backend, keine neue API-Route.** Reiner Lese-Inhalt wie alle bisherigen Ernährungs-Guides.
- **Bestehende Arbeitspunkte-Komponente wiederverwenden.** Einheitliches Verhalten über alle Ernährungs-Guides hinweg.
- **"Jetzt vs. Zukunft"-Vergleich mit vorhandenen Gesichts-Icons statt neuer Illustration.** Die bereits installierte Icon-Bibliothek bringt passende Symbole für "neutraler Mundwinkel" und "lächelnder Mundwinkel" direkt mit — kein Custom-Zeichnen, kein neues Paket, schnell umsetzbar und trotzdem klar erkennbar.
- **Kein Erstbesucher-Onboarding** (Auto-Öffnen/Pulse/Dialog wie bei "Emotionales Essen"). War eine einmalige Einführung ins Akkordeon-Konzept, nicht pro Guide nötig.

### D) Abhängigkeiten (zu installierende Pakete)

Keine neuen Pakete nötig — die verwendeten Icons sind Teil der bereits installierten Icon-Bibliothek, alles Weitere mit shadcn/ui und Tailwind CSS umsetzbar.

## Implementation Notes (Frontend)
- Neu: `src/components/kalorien-zaehlen-guide.tsx` — Intro-Text + 2 flache Punkte, nutzt `ArbeitspunkteListe` mit eigenem `localStorage`-Key (`kalz_completed`).
- Neu: `src/components/gruende-liste.tsx` — 3 hervorgehobene Karten (Target/Utensils/Star-Icon aus `lucide-react`), die 3. Karte mit den 3 Erkenntnis-Fragen als Zusatzliste; Karte 1 und 2 verlinken auf `/ernaehrung/so-geht-abnehmen` bzw. `/ernaehrung/kalorien`.
- Neu: `src/components/jetzt-zukunft-vergleich.tsx` — 2-Spalten-Vergleich mit `Meh` (grau/neutral, "So isst du jetzt") und `Smile` (grün, "So wirst du in Zukunft essen") aus `lucide-react`, wie im Architecture-Schritt festgelegt.
- `src/app/ernaehrung/kalorien-zaehlen/page.tsx`: Platzhalter aus PROJ-36 durch `KalorienZaehlenGuide` ersetzt.
- `npm run build`, `npm run lint`, `npm test` (415/415) fehlerfrei. Verifiziert per Playwright-Skript (Text-Check + Screenshots nach Animations-Settle): beide Arbeitspunkte, alle 3 Gründe-Karten samt Links und Erkenntnis-Fragen, sowie der Jetzt-vs-Zukunft-Vergleich rendern korrekt.

## QA Test Results

**Tested:** 2026-09-01
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Seitenstruktur
- [x] 2 Punkte ("Warum zählen wir Kalorien?" / "Das Wichtigste beim Kalorienzählen: das Aufhören") in korrekter Reihenfolge
- [x] Beide Punkte starten eingeklappt
- [x] "Verstanden" aktualisiert Fortschritt und speichert lokal (bleibt nach Reload erhalten)

#### Warum zählen wir Kalorien?
- [x] Alle 3 Gründe als visuell hervorgehobene Liste sichtbar (Karten mit Icon, nicht Fließtext)
- [x] Die 3 Erkenntnis-Fragen beim 3. Grund sichtbar
- [x] Link zum Kcal-Rechner zeigt korrekt auf `/ernaehrung/so-geht-abnehmen`
- [x] Link zu den Makronährstoffen zeigt korrekt auf `/ernaehrung/kalorien`

#### Das Aufhören
- [x] Stützräder-Analogie und Jetzt-vs-Zukunft-Grafik (graues neutrales / grünes lächelndes Gesicht) sichtbar
- [x] Ausstiegs-Fahrplan (2–3 Monate, Wohlfühlgewicht) sichtbar
- [x] Stress-Tag-Hinweis sichtbar

#### Gast-Zugriff
- [x] Gast (keine Session, Cookies gelöscht) kann die Seite vollständig lesen, Status < 400

### Edge Cases Status

#### EC-1: Link zum Kcal-Rechner ohne vorherige Nutzung
- [x] Kein Problem — Kcal-Rechner zeigt einfach ein leeres Formular (bestehendes PROJ-37-Verhalten, keine erneute Prüfung nötig)

#### EC-2: Gast-Zugriff
- [x] Voller Lesezugriff bestätigt, kein Login-Zwang, kein 404/500

#### EC-3: Fortschritt bleibt nach Reload erhalten, "Alles durch"-Hinweis bei 2/2
- [x] Bestätigt — Fortschritt persistiert über Reload, "Alles durch ✓"-Hinweis erscheint korrekt bei beiden abgeschlossenen Punkten

### Security Audit Results
- [x] Kein Backend/keine API-Route — keine Angriffsfläche für Auth-Bypass, Injection oder Rate-Limiting-Probleme (0 `/api/`-Requests bei voller Interaktion gemessen)
- [x] Kein Nutzer-Input auf der Seite (nur Lese-Interaktion) — kein XSS-Vektor vorhanden
- [x] Gast-Zugriff funktioniert wie spezifiziert, keine versteckten Auth-Anforderungen
- [x] Keine sensiblen Daten im Client (`localStorage` enthält nur eine ID-Liste abgeschlossener Punkte)
- [ ] Transienter Konsolenfehler ("Failed to load resource: 404") einmalig beobachtet — identisches Muster wie bereits bei PROJ-39/40s QA dokumentiert, dort als nicht reproduzierbares Next.js-Dev-Server-Rauschen eingestuft; `npm run build` läuft fehlerfrei durch. Keine Bug-Einstufung.
- [x] Verbotenes Wort "gesund"/"ungesund"/"Gesundheit" geprüft — keine Vorkommen (Lektion aus PROJ-40s BUG-1 direkt beim Schreiben beachtet)

### Regression Testing
- `PROJ-36-ernaehrung-hub.spec.ts`: Letzter verbliebener Platzhalter-Test (`/ernaehrung/kalorien-zaehlen`) hätte fehlschlagen müssen (zeigt jetzt echten Inhalt statt "Bald verfügbar") — als Teil dieser QA-Runde behoben: den mittlerweile leeren Platzhalter-Block komplett entfernt, eigene Abdeckung jetzt in `PROJ-41-kalorien-zaehlen.spec.ts`. Damit haben alle 8 Ernährung-Unterseiten echten Inhalt, keine Platzhalter mehr übrig. Volle PROJ-36-Suite danach grün (17/17 pro Browser).
- Keine Änderungen an gemeinsam genutzten Komponenten (`ArbeitspunkteListe`, `ErnaehrungSubHeader`) — kein weiteres Regressionsrisiko für andere Guides.
- `npm run build`, `npm run lint` (0 Fehler, 1 vorbestehende, nicht mit PROJ-41 zusammenhängende Warnung), `npm test` (415/415) grün.
- Responsive geprüft bei 375px, 768px, 1440px — kein horizontales Scrollen in main content.

### Bugs Found
Keine.

### Summary
- **Acceptance Criteria:** 11/11 passed
- **Bugs Found:** 0
- **Security:** Pass (kein Backend, keine Nutzereingaben, minimale Angriffsfläche; ein nicht reproduzierbarer, dev-server-typischer Konsolenfehler dokumentiert, keine funktionale Auswirkung)
- **Production Ready:** YES
- **Recommendation:** Deploy

## Post-Deployment Fixes

### E2E-Test-Timing-Bug (2026-09-03)
- `tests/PROJ-41-kalorien-zaehlen.spec.ts` — Test "AC: zeigt 2 Punkte in der richtigen Reihenfolge" schlug konsistent fehl: `main.innerText()` wurde direkt nach `page.goto()` gelesen, bevor `ArbeitspunkteListe` nach dem Client-Mount (Hydration) fertig gerendert war. Reiner Test-Bug, kein Produkt-Bug — die Titel waren korrekt vorhanden.
- Fix: Vor dem `innerText()`-Lesevorgang auf den letzten Arbeitspunkt-Trigger-Button warten (`await expect(page.getByRole('button', { name: '...' })).toBeVisible()`), analog zum bereits bestehenden Muster in `PROJ-37-so-geht-abnehmen.spec.ts` und `PROJ-43-training-uebersicht.spec.ts`.
- Gleiches Timing-Muster (ohne Wait vor `innerText()`) auch in `PROJ-36-ernaehrung-hub.spec.ts`, `PROJ-39-heisshunger.spec.ts` und `PROJ-45-wochen-check-in.spec.ts` gefunden und identisch behoben.
- Verifiziert: alle vier Tests bestehen 3/3 Wiederholungen (`--repeat-each=3`).
- PR: [#2](https://github.com/becherohnehenkel/endlichsattapp/pull/2)

## Deployment
- **Production URL:** https://app.mehralsabnehmen.de/ernaehrung/kalorien-zaehlen
- **Deployed:** 2026-09-01 (Vercel auto-deploy via Push zu `main`, commits `d9fc95d`..`1159dca`)
- **Verified in Produktion:** Nutzer hat die Live-Seite geprüft, alles grün ("Alles auf Grün").
- **Refinement-Deploy 2026-09-01** (Vercel auto-deploy via Push zu `main`, commits `3e0fb64`..`2e7aae4`, Tag `v2.8.0-ernaehrung-guides`): Teil eines gebündelten Deploys über PROJ-34/37/38/39/40/41 — Erstbesucher-Auto-Open (erster Punkt öffnet automatisch) + neue Überschrift/Intro "Warum das Alles?". Nutzer hat auf Produktion visuell bestätigt ("Alles auf Grün").
