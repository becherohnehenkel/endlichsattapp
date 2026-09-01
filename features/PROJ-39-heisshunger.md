# PROJ-39: Heißhunger

## Status: Planned
**Created:** 2026-09-01
**Last Updated:** 2026-09-01

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
- [ ] Konkrete Visualisierung der 2 Blutzucker-Vergleichsgrafiken (Kurvenform, Achsen, Beschriftung) — wird bei /architecture bzw. /frontend entschieden
- [ ] Konkrete Visualisierung der Schritt-für-Schritt-Anleitung bei "Screentime und Content" — Nutzer wünscht sich hier explizit eine grafische Aufbereitung, Details offen

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Stress & Screentime verlinken auf PROJ-38 (Emotionales Essen) statt Inhalte zu duplizieren | Nutzer verweist im Rohtext selbst explizit auf die entsprechenden Punkte bei Emotionales Essen ("Geh mal zur Seite mit emotionalem Essen") | 2026-09-01 |
| 4 flache Arbeitspunkte, keine Sektions-Gruppierung wie bei PROJ-38 | Alle 4 Themen sind gleichrangig, keine natürliche Unterteilung wie bei "emotionsspezifisch vs. allgemein" nötig | 2026-09-01 |
| Rohtext deutlich gekürzt/verdichtet für die App-Copy | Nutzer bevorzugt beim Schreiben Ausführlichkeit, hat aber selbst erkannt, dass das für schnelle Infos in der App hinderlich ist — verdichtete Fassung wurde vom Nutzer explizit bestätigt ("Passt so") | 2026-09-01 |
| Keine Interaktivität bei "Sehen/riechen/schmecken & hören" über den Standard-"Verstanden"-Toggle hinaus | Konsistent mit allen anderen reinen Reflexions-/Lese-Arbeitspunkten in PROJ-34/37/38 | 2026-09-01 |

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
