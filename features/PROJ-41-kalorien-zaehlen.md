# PROJ-41: Kalorien zählen

## Status: Planned
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
