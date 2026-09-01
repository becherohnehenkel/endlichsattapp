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
> 1g Alkohol = 7 kcal. Alkohol ist ein Nervengift — eine "gesunde Menge" gibt es nicht.
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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
