# PROJ-40: Kalorien

## Status: Planned
**Created:** 2026-09-01
**Last Updated:** 2026-09-01

## Dependencies
- Requires: PROJ-36 (Ernährung-Hub) — Einstiegspunkt
- Requires: PROJ-37 (So geht abnehmen) — "Was sind Kalorien" verlinkt auf den dortigen Kcal-Rechner statt eine eigene Berechnung anzubieten

## User Stories
- Als Nutzer:in möchte ich verstehen, was Kalorien eigentlich sind, damit ich das Konzept nicht mehr als "gut oder böse" bewerte
- Als Nutzer:in möchte ich die Makronährstoffe (Proteine, Kohlenhydrate, Fette, Ballaststoffe) und ihre jeweilige Rolle verstehen, damit ich meine Ernährung bewusster zusammenstellen kann
- Als Nutzer:in möchte ich konkrete Lebensmittel-Beispiele pro Makronährstoff sehen, damit ich das Gelernte direkt im Alltag anwenden kann
- Als Nutzer:in möchte ich verstehen, wie Alkohol kalorisch eingeordnet wird, damit ich informierte Entscheidungen treffen kann

## Out of Scope
- Eigene Kalorienrechner-Logik — existiert bereits unter "So geht abnehmen" (PROJ-37), hier nur Verlinkung
- Tracking/Logging der eigenen Makronährstoff-Zufuhr — reiner Aufklärungs-Content, kein Ernährungstagebuch (das wäre PROJ-7, noch nicht gebaut)
- Bewertung von Lebensmitteln als "gesund"/"ungesund" — bewusst neutral gehalten (Produkt-Grundsatz: keine Gesundheitsurteile)
- Exakte visuelle Umsetzung der Protein-Quellen-Übersicht (3 Kategorien × 3 Prozent-Stufen) — Inhalt & Daten sind hier festgelegt, konkrete Grafik-Gestaltung wird bei /frontend entschieden

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur
- [ ] Angenommen ein Nutzer öffnet /ernaehrung/kalorien, wenn die Seite lädt, dann sieht er 2 Bereiche: "Was sind Kalorien" (1 Punkt) und "Die Makronährstoffe" (5 Punkte: Proteine, Kohlenhydrate, Fette, Ballaststoffe, Alkohol)
- [ ] Angenommen die Seite ist geöffnet, wenn noch nichts angeklickt wurde, dann sind alle Punkte eingeklappt
- [ ] Angenommen ein Punkt ist aufgeklappt, wenn der Nutzer auf "Verstanden" klickt, dann wird der Fortschritt aktualisiert und lokal gespeichert

### Was sind Kalorien
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer liest, dann sieht er die 5 nummerierten Kernaussagen zu Kalorien
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer auf den Link zu "So geht abnehmen" klickt, dann wird er zu /ernaehrung/so-geht-abnehmen weitergeleitet

### Proteine
- [ ] Angenommen der Punkt "Proteine" ist aufgeklappt, wenn der Nutzer liest, dann sieht er kcal/g, die Rolle im Körper und die Aminosäuren-Erklärung
- [ ] Angenommen der Punkt ist aufgeklappt, wenn der Nutzer die Quellen-Übersicht liest, dann sieht er 3 Prozent-Stufen (40 %/30 %/20 % Proteinanteil) mit je Beispielen für Tierisch/Vegetarisch/Vegan

### Kohlenhydrate, Fette, Ballaststoffe, Alkohol
- [ ] Angenommen einer dieser Punkte ist aufgeklappt, wenn der Nutzer liest, dann sieht er kcal/g (wo zutreffend), die Rolle im Körper und mindestens ein konkretes Beispiel/eine praktische Anwendung

### Gast-Zugriff
- [ ] Angenommen ein Gast (kein Login), wenn er /ernaehrung/kalorien öffnet, dann kann er die komplette Seite lesen

## Edge Cases
- Was passiert, wenn der Nutzer den Link zu "So geht abnehmen" anklickt, ohne dort schon seine Werte eingegeben zu haben? → Kein Problem, der Kcal-Rechner zeigt einfach ein leeres Formular (bestehendes Verhalten aus PROJ-37)
- Was passiert bei einem Gast-Zugriff? → Voller Lesezugriff, Fortschritt nur lokal im Browser gespeichert (kein Konto-Bezug), wie bei allen anderen Ernährungs-Guides
- Was passiert, wenn alle 6 Punkte als "Verstanden" markiert wurden und die Seite erneut geöffnet wird? → Fortschritt bleibt erhalten, "Alles durch"-Hinweis erscheint

## Technical Requirements (optional)
- Kein Backend nötig — rein statischer Content + lokal gespeicherter Fortschritt (gleiches Muster wie PROJ-38/39)
- Mobile-first

## Content: Alle Arbeitspunkte (finaler Wortlaut)

### 1. Was sind Kalorien
> Kalorien sind die Einheit für die Energie, die dein Körper zum Funktionieren braucht — so wie ein Auto Benzin zum Fahren braucht.
>
> 1. Wir sagen "Kalorien", meinen aber eigentlich Kilokalorien — der Einfachheit halber bleiben wir bei Kalorien.
> 2. Eine Kalorie ist die Energie, um 1 Liter Wasser (auf Meereshöhe) von 14,5 °C auf 15,5 °C zu erwärmen.
> 3. Kalorien sind nicht böse — dein Körper braucht sie, um zu funktionieren.
> 4. Kalorien sind erstmal alle gleich, egal woher sie kommen — nur ihre Eigenschaften unterscheiden sich. Mehr dazu bei den Makronährstoffen.
> 5. Wie viele Kalorien du ungefähr brauchst, kannst du unter "So geht abnehmen" berechnen. → *(Link zu /ernaehrung/so-geht-abnehmen)*

### Sektion: Die Makronährstoffe
> Unsere Kalorien werden zum Großteil aus den Makronährstoffen berechnet. Alle haben ihre Daseinsberechtigung, ihre Aufgabe — und sind gleichermaßen wichtig.

### 2. Proteine
> 1g Protein = ca. 4 kcal. Dein Körper nutzt Protein primär als Baustein — für Muskulatur, Haut, Haare, Hormone und dein Immunsystem. Zu viele isst man eher nicht aus Versehen.
>
> **Proteinquellen nach Anteil:**
>
> **40 % Proteinanteil**
> - 🥩 Tierisch: Thunfisch, magerer Fisch (Kabeljau), (Wild-/Rinder-/Hühner-)Filet
> - 🧀 Vegetarisch: Harzer Käse, Eiklar, Magerquark, Skyr
> - 🌱 Vegan: Seitan, Sojagranulat, Lupinen-Geschnetzeltes
>
> **30 % Proteinanteil**
> - 🥩 Tierisch: Lachs, Rinderhack, Schweinefilet, Rehrücken
> - 🧀 Vegetarisch: Hüttenkäse, Parmesan, Vollei, Mozzarella, Handkäse
> - 🌱 Vegan: Tofu, Tempeh, Edamame, rote Linsen
>
> **20 % Proteinanteil**
> - 🥩 Tierisch: Hering, Entenbrust, Lammkotelett, Ochsenschwanz
> - 🧀 Vegetarisch: Gouda (40 % Fett i. Tr.), Mozzarella, Feta, Vollmilch
> - 🌱 Vegan: Kichererbsen, Kürbiskerne, Nüsse, Quinoa
>
> Protein besteht aus Aminosäuren — einige davon (essentiell) muss dein Körper über die Nahrung bekommen, da er sie nicht selbst herstellen kann. Tierische Quellen liefern meist alle auf einmal. Bei pflanzlicher Ernährung lohnt sich die Kombination: Weizen-Eiweiß hat z. B. wenig Lysin — erst zusammen mit Hülsenfrüchten (Linsen, Erbsen, Bohnen) wird das Aminosäure-Profil vollständig.

### 3. Kohlenhydrate
> 1g Kohlenhydrate = ca. 4 kcal. Kohlenhydrate sind dein schnellster Energielieferant — sie werden am zügigsten zu Glucose.
>
> Es gibt kurze Kohlenhydratketten (Zucker, Honig, Sirup, Datteln) und lange Ketten (Brot, Nudeln, Gebäck). Ganz lange Ketten sind Ballaststoffe — wichtig für den Darm und für eine langsame Energieabgabe (→ länger satt, mehr dazu bei "Ballaststoffe").
>
> Isst du (fast) nur Kohlenhydrate, steigt dein Blutzucker schnell — das ist normal, dein Körper schüttet Insulin aus, um die Glucose zu verteilen. Je länger die Kette, desto langsamer läuft dieser Prozess ab.
>
> Im (Ausdauer-)Sport sind Kohlenhydrate Pflicht: Iss vorher eine kleine, schnell verdauliche Portion (Banane, Dattel, Marmeladenbrot) — wie Tanken vor dem Rennen.

### 4. Fette
> 1g Fett = ca. 9 kcal — doppelt so viel wie Protein oder Kohlenhydrate. Deshalb isst man sich damit am schnellsten über sein Kalorienziel.
>
> Trotzdem lebensnotwendig: für fettlösliche Vitamine (E, D, K, A) und deine Hormonproduktion. Fett gibt Energie langsam ab (→ länger satt) und ist Geschmacksträger.
>
> Gesättigte Fette sind bei Raumtemperatur meist fest (Fleisch, Butter, Käse, Kokosöl) — dein Körper kann sie selbst herstellen, sie sind nicht lebensnotwendig. Einfach oder mehrfach ungesättigte Fette sind bei Raumtemperatur flüssig: Olivenöl, Leinöl, Rapsöl, Avocado, fetter Fisch, Nüsse und Saaten. Kaltgepresste ("native") Pflanzenöle sind die Quelle deiner Wahl.
>
> Omega-3-zu-Omega-6-Verhältnis: Unsere Ernährung enthält meist zu viel Omega-6 und zu wenig Omega-3. Das Verhältnis sollte maximal 5 (Omega-6) : 1 (Omega-3) sein, ist aber meist höher. Omega-6 steckt in Sonnenblumen-, Maiskeim- und Sojaöl sowie in Fleisch, Wurst, Eiern und Milchprodukten. Omega-3 findest du in Lein-, Raps- und Walnussöl, Chia- und Leinsamen sowie in fettreichem Fisch. Praxistipp: Bevorzuge bewusst deine Omega-3-Quellen im Alltag.

### 5. Ballaststoffe
> Ballaststoffe sind unverdauliche, sehr lange Kohlenhydratketten — dein Körper wandelt sie nicht in Energie um, aber dein Darm braucht sie dringend.
>
> Aufgabe: Sie füttern deine Darmbakterien, halten die Verdauung in Schwung und verlangsamen, wie schnell andere Nährstoffe ins Blut gelangen — das hält dich länger satt und deinen Blutzucker stabiler.
>
> Quellen: Vollkornprodukte, Hülsenfrüchte, Gemüse, Obst mit Schale, Nüsse und Samen.

### 6. Alkohol
> Ein kulturell schwieriges Thema in Deutschland — aber wichtig für die Einordnung.
>
> 1g Alkohol = 7 kcal. Alkohol ist ein Nervengift — eine unbedenkliche Menge gibt es nicht.
>
> Sobald Alkohol in deinen Körper gelangt, kümmert sich dein Körper zuerst um dessen Abbau. Gleichzeitig ist Alkohol auch eine Energiequelle: Kalorien, die währenddessen zusätzlich aufgenommen werden, werden erstmal geparkt — meist direkt als Körperfett. Wo genau, entscheidet deine DNA, nicht du.
>
> Prost 🍻

## Open Questions
Keine — Inhalt final, inklusive der vom Nutzer bereitgestellten Protein-Quellen-Tabelle (3 Prozent-Stufen × 3 Kategorien).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| 2 Bereiche: "Was sind Kalorien" (1 Punkt) + "Die Makronährstoffe" (5 Punkte) | Natürliche inhaltliche Gruppierung, passend zur vom Nutzer vorgegebenen Struktur | 2026-09-01 |
| Proteine, Kohlenhydrate, Fette und Ballaststoffe folgen derselben Struktur: kcal/g → Rolle im Körper → praktischer Hinweis/Beispiele | Nutzerwunsch nach konsistenter Struktur über alle Makronährstoffe hinweg | 2026-09-01 |
| Alkohol als 6. Punkt in derselben Sektion statt eigener Sektion | Hat dieselbe "kcal/g"-Kennzahl wie die echten Makros und wird vom Nutzer im selben Kontext behandelt | 2026-09-01 |
| Ballaststoffe-Inhalt eigenständig verfasst (was sie sind, wo man sie findet, welche Aufgabe sie haben) | Nutzer hat das explizit an Claude delegiert | 2026-09-01 |
| Protein-Quellen exakt aus der vom Nutzer bereitgestellten Grafik übernommen (3 Prozent-Stufen × 3 Kategorien) | Reale, vom Nutzer kuratierte Daten statt eigener Schätzung — Nutzer hat die Grafik auf Nachfrage nachgereicht | 2026-09-01 |
| Verlinkung auf "So geht abnehmen" für die Kalorienbedarfs-Berechnung statt eigener Berechnung | Vermeidet Duplizierung des bestehenden Kcal-Rechners (PROJ-37) | 2026-09-01 |
| Rohtext deutlich verdichtet für die App-Copy | Nutzer bevorzugt beim Schreiben Ausführlichkeit, hat aber selbst erkannt, dass das für schnelle Infos in der App hinderlich ist — Muster aus PROJ-38/39 fortgeführt | 2026-09-01 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Bestehende `ArbeitspunkteListe`-Komponente wiederverwenden statt neu bauen | Einheitliches Verhalten über alle Ernährungs-Guides, kein zusätzlicher Entwicklungsaufwand | 2026-09-01 |
| Protein-Quellen als 3 gestapelte Karten (eine pro Prozent-Stufe) statt einer Tabelle | Kommagetrennte Lebensmittel-Listen passen besser in breite Zeilen als in schmale Tabellenspalten (anders als bei PROJ-39s kurzen Einzelwerten) | 2026-09-01 |
| Kein Erstbesucher-Onboarding wie bei PROJ-38 | War eine einmalige, gezielte Einführung ins Akkordeon-Konzept selbst — nicht pro Guide nötig | 2026-09-01 |
| Kein Backend / keine neue API-Route | Reiner Lese-Inhalt, identisch zum Muster von PROJ-38/39 | 2026-09-01 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur

```
/ernaehrung/kalorien (Seite, ersetzt den bestehenden Platzhalter aus PROJ-36)
+-- ErnaehrungSubHeader ("Kalorien") — bestehende Komponente, unverändert
+-- KalorienGuide (neu, analog zu HeisshungerGuide/EmotionalesEssenGuide)
    +-- ArbeitspunkteListe (bestehende Komponente)
        +-- Sektion ohne Label
        |     +-- 1. Was sind Kalorien (+ Link auf /ernaehrung/so-geht-abnehmen)
        +-- Sektion "Die Makronährstoffe"
              +-- 2. Proteine
              |     +-- Erklärtext + Aminosäuren-Absatz
              |     +-- ProteinQuellenUebersicht (neu) — 3 gestapelte Karten
              |           (40 % / 30 % / 20 % Proteinanteil), je 3 Zeilen
              |           (Tierisch/Vegetarisch/Vegan)
              +-- 3. Kohlenhydrate
              +-- 4. Fette
              +-- 5. Ballaststoffe
              +-- 6. Alkohol
```

### B) Datenmodell (einfache Sprache)

Kein neues Datenmodell nötig. Genutzt wird exakt dasselbe Muster wie bei "Heißhunger" und "Emotionales Essen": Welche der 6 Punkte als "Verstanden" markiert wurden, wird im Browser gespeichert (eigener Speicher-Schlüssel). Kein Server, kein Nutzerkonto nötig.

### C) Tech-Entscheidungen (Begründung für PM)

- **Kein Backend, keine neue API-Route.** Reiner Lese-Inhalt wie alle bisherigen Ernährungs-Guides.
- **Bestehende Arbeitspunkte-Komponente wiederverwenden.** Einheitliches Verhalten über alle 5 Ernährungs-Guides hinweg.
- **Eine neue, kleine Komponente für die Protein-Quellen-Übersicht.** Die Daten (3 Prozent-Stufen × 3 Kategorien) passen am besten als 3 gestapelte Karten — eine pro Prozent-Stufe, mit je einer Zeile pro Kategorie. Bewusst keine klassische Tabelle wie bei "Heißhunger"s Priorisierungs-Beispiel: dort waren es kurze Einzelwerte pro Zelle, hier sind es längere, kommagetrennte Lebensmittel-Listen — die passen besser in breite Zeilen als in schmale Tabellenspalten.
- **Kein Erstbesucher-Onboarding** (Auto-Öffnen/Pulse/Dialog wie bei "Emotionales Essen"). War eine einmalige Einführung ins Akkordeon-Konzept, nicht nötig für jeden neuen Guide.

### D) Abhängigkeiten (zu installierende Pakete)

Keine neuen Pakete nötig — vollständig mit den bereits installierten shadcn/ui-Komponenten und Tailwind CSS umsetzbar.

## Implementation Notes (Frontend)
- Neu: `src/components/kalorien-guide.tsx` — Intro-Text + 2 Bereiche (1 Punkt "Was sind Kalorien" ohne Sektions-Label, 5 Punkte unter "Die Makronährstoffe"), nutzt `ArbeitspunkteListe` mit eigenem `localStorage`-Key (`kal_completed`).
- Neu: `src/components/protein-quellen-uebersicht.tsx` — 3 gestapelte Karten (40 %/30 %/20 % Proteinanteil), je 3 Zeilen (🥩 Tierisch/🧀 Vegetarisch/🌱 Vegan), Daten 1:1 aus der vom Nutzer bereitgestellten Grafik übernommen.
- `src/app/ernaehrung/kalorien/page.tsx`: Platzhalter aus PROJ-36 durch `KalorienGuide` ersetzt.
- Die Satzeinleitung "Unsere Kalorien werden zum Großteil aus den Makronährstoffen berechnet…" aus dem Spec-Entwurf wurde als Lead-in des ersten Punkts im Bereich "Die Makronährstoffe" (Proteine) platziert statt als eigener Sektions-Absatz, da `ArbeitspunkteListe` pro Sektion nur ein kurzes Label, keinen Fließtext unterstützt. Die äußere Seiten-Einleitung wurde stattdessen neu formuliert ("Kalorien und Makronährstoffe — die Bausteine deiner Ernährung, einfach erklärt."), angelehnt an den bestehenden Hub-Untertitel für diese Seite.
- `npm run build`, `npm run lint`, `npm test` (415/415) fehlerfrei. Verifiziert per Playwright-Skript (Text-Check + Screenshot nach Animations-Settle): Intro, alle 6 Arbeitspunkte in korrekter Reihenfolge inkl. Sektions-Divider "DIE MAKRONÄHRSTOFFE", Link zu "So geht abnehmen" korrekt, alle 3 Proteinquellen-Karten mit korrekten Daten sichtbar.

## QA Test Results

**Tested:** 2026-09-01
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Seitenstruktur
- [x] 2 Bereiche ("Was sind Kalorien" + "Die Makronährstoffe") mit 6 Punkten in korrekter Reihenfolge
- [x] Alle Punkte starten eingeklappt
- [x] "Verstanden" aktualisiert Fortschritt und speichert lokal (bleibt nach Reload erhalten)

#### Was sind Kalorien
- [x] Alle 5 nummerierten Kernaussagen sichtbar
- [x] Link zu "So geht abnehmen" zeigt korrekt auf `/ernaehrung/so-geht-abnehmen`

#### Proteine
- [x] kcal/g, Rolle im Körper und Aminosäuren-Erklärung sichtbar
- [x] Alle 3 Prozent-Stufen (40 %/30 %/20 %) mit korrekten Tierisch-/Vegetarisch-/Vegan-Beispielen sichtbar

#### Kohlenhydrate, Fette, Ballaststoffe, Alkohol
- [x] Jeder Punkt einzeln geprüft: kcal/g (wo zutreffend), Rolle im Körper und mindestens ein konkretes Beispiel sichtbar

#### Gast-Zugriff
- [x] Gast (keine Session, Cookies gelöscht) kann die Seite vollständig lesen, Status < 400

### Edge Cases Status

#### EC-1: Link zu "So geht abnehmen" ohne vorherige Kcal-Rechner-Nutzung
- [x] Kein Problem — Kcal-Rechner zeigt einfach ein leeres Formular (bestehendes PROJ-37-Verhalten, keine erneute Prüfung nötig)

#### EC-2: Gast-Zugriff
- [x] Voller Lesezugriff bestätigt, kein Login-Zwang, kein 404/500

#### EC-3: Fortschritt bleibt nach Reload erhalten, "Alles durch"-Hinweis bei 6/6
- [x] Bestätigt — Fortschritt persistiert über Reload, "Alles durch ✓"-Hinweis erscheint korrekt bei allen 6 abgeschlossenen Punkten

### Security Audit Results
- [x] Kein Backend/keine API-Route — keine Angriffsfläche für Auth-Bypass, Injection oder Rate-Limiting-Probleme (0 `/api/`-Requests bei voller Interaktion gemessen)
- [x] Kein Nutzer-Input auf der Seite (nur Lese-Interaktion) — kein XSS-Vektor vorhanden
- [x] Gast-Zugriff funktioniert wie spezifiziert, keine versteckten Auth-Anforderungen
- [x] Keine sensiblen Daten im Client (`localStorage` enthält nur eine ID-Liste abgeschlossener Punkte)
- [ ] Transienter Konsolenfehler ("Failed to load resource: 404") einmalig beobachtet — identisches Muster wie bereits bei PROJ-39s QA dokumentiert, dort als nicht reproduzierbares Next.js-Dev-Server-Rauschen eingestuft; `npm run build` läuft fehlerfrei durch. Keine Bug-Einstufung.

### Regression Testing
- `PROJ-36-ernaehrung-hub.spec.ts`: Platzhalter-Test hätte für `/ernaehrung/kalorien` fehlschlagen müssen (zeigt jetzt echten Inhalt statt "Bald verfügbar") — als Teil dieser QA-Runde behoben: aus der Platzhalter-Liste entfernt, eigene Abdeckung jetzt in `PROJ-40-kalorien.spec.ts`. Volle PROJ-36-Suite danach grün (18/18 pro Browser).
- Keine Änderungen an gemeinsam genutzten Komponenten (`ArbeitspunkteListe`, `ErnaehrungSubHeader`) — kein weiteres Regressionsrisiko für andere Guides.
- `npm run build`, `npm run lint` (0 Fehler, 1 vorbestehende, nicht mit PROJ-40 zusammenhängende Warnung), `npm test` (415/415) grün.
- Responsive geprüft bei 375px, 768px, 1440px — kein horizontales Scrollen in main content.

### Bugs Found

#### BUG-1: Verbotenes Wort "gesund" im Alkohol-Text
- **Severity:** Low
- **Steps to Reproduce:**
  1. Gehe zu `/ernaehrung/kalorien`
  2. Klappe "Alkohol" auf
  3. Erwartet: Kein Vorkommen von "gesund"/"ungesund"/"Gesundheit" (Projekt-Grundsatz: keine Gesundheitsurteile)
  4. Tatsächlich: Der Satz lautet "Alkohol ist ein Nervengift — eine &quot;gesunde Menge&quot; gibt es nicht." — enthält "gesunde"
- **Einordnung:** Anders als beim ursprünglichen Zweck der Regel (keine Gesundheitsurteile über Mahlzeiten) ist das hier eine sachliche toxikologische Aussage, kein Urteil über eine Mahlzeit — trotzdem eine wörtliche Regelverletzung nach der bestehenden Projekt-Konvention.
- **Vorschlag:** z. B. "eine unbedenkliche Menge gibt es nicht" oder "eine sichere Menge gibt es nicht"
- **Priority:** Fix before deployment (Nutzer hat dieses Wortverbot in der Vergangenheit explizit als wichtig markiert)
- **Status:** ✅ Fixed (2026-09-01) — Nutzer hat den vorgeschlagenen Text übernommen: "eine unbedenkliche Menge gibt es nicht"

### Summary
- **Acceptance Criteria:** 9/9 passed
- **Bugs Found:** 1 total (0 critical, 0 high, 0 medium, 1 low) — behoben vor Deploy
- **Security:** Pass (kein Backend, keine Nutzereingaben, minimale Angriffsfläche; ein nicht reproduzierbarer, dev-server-typischer Konsolenfehler dokumentiert, keine funktionale Auswirkung)
- **Production Ready:** YES (kein Critical/High-Bug; der eine Low-Bug ist eine schnelle Textkorrektur)
- **Recommendation:** Deploy — Bug-1 wurde vor dem Deploy behoben

## Deployment
_To be added by /deploy_
