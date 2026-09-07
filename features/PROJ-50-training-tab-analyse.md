# PROJ-50: Training-Tab (Analyse-Seite)

## Status: Planned
**Created:** 2026-09-05
**Last Updated:** 2026-09-05

## Dependencies
- Requires: PROJ-44 (Trainingspläne) — Datenquelle `training_sessions`, in der jede abgeschlossene Trainingseinheit gespeichert ist
- Requires: PROJ-42 (Analyse-Übersichtsseite) — Host-Seite; ersetzt den bestehenden "Bald verfügbar"-Platzhalter im "Training"-Tab
- Requires: PROJ-19 (Gast-Modus) — bestimmt das Verhalten für Gäste (kein Login)

## User Stories
- Als eingeloggter Nutzer möchte ich auf der Analyse-Seite alle meine vergangenen Trainingseinheiten chronologisch (neueste zuerst) sehen, damit ich meinen Trainingsverlauf nachvollziehen kann.
- Als eingeloggter Nutzer möchte ich auf einen Blick sehen, wie oft ich in der letzten Woche trainiert habe, damit ich meine Konsistenz einschätzen kann.
- Als Nutzer, der im Fitnessstudio trainiert, möchte ich sehen, wie viel Gewicht ich im Schnitt pro Einheit bewege, damit ich meinen Trainingsfortschritt objektiv verfolgen kann.
- Als Nutzer mit ausreichend Trainingshistorie möchte ich sehen, ob sich mein bewegtes Gewicht im Vergleich zum längerfristigen Trend gesteigert hat, damit ich weiß, ob ich Fortschritte mache.
- Als Nutzer möchte ich meine aktuelle Wochen-Serie sehen, damit ich motiviert bleibe, dranzubleiben.
- Als Gast (kein Login) möchte ich verstehen, dass ich mich anmelden muss, um meine Trainingshistorie zu sehen.

## Out of Scope
- Speichern/Bearbeiten von Trainingseinheiten — bereits über PROJ-44 (`/training/[plan]`) abgedeckt; dieser Tab ist reine Anzeige/Analyse.
- Klick auf eine Trainingseinheit öffnet eine Detailansicht mit allen Übungen/Sätzen — bewusst nicht für diese Version, nur Datum/Plan/Gewicht in der Liste (kann später ergänzt werden).
- Diagramme/Verlaufskurven (z. B. Gewichtsentwicklung über Zeit als Chart) — für den MVP reichen die 4 textuellen Kennzahlen; visuelle Graphen sind ein mögliches späteres Refinement.
- Umstellung der `wiederholungen`/`gewicht`-Felder in PROJ-44 von Freitext auf Zahlen-Inputs — betrifft das Trainingsplan-Formular, nicht diesen Tab. Als zukünftiges Refinement vorgemerkt (siehe Decision Log).
- Berücksichtigung von "Zuhause ohne Equipment" und "Zuhause mit Bändern" in der Gewichts-/Volumen-Berechnung — nur Fitnessstudio-Einheiten fließen ein.
- Eigene Zeitraum-Auswahl durch den Nutzer (z. B. "letzte 90 Tage" wählen) — feste Zeiträume (7/30 Tage) für den MVP.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Trainingsliste
- [ ] Angenommen ein eingeloggter Nutzer öffnet den "Training"-Tab auf `/analyse`, wenn der Tab lädt, dann sieht er seine Trainingseinheiten absteigend sortiert (neueste zuerst), maximal 5 initial
- [ ] Angenommen mehr als 5 Trainingseinheiten existieren, wenn die ersten 5 angezeigt werden, dann erscheint darunter ein "Ältere Einträge laden"-Button
- [ ] Angenommen der Nutzer klickt "Ältere Einträge laden", wenn der Klick erfolgt, dann werden die nächsten 10 Einträge nachgeladen und ans Ende der bestehenden Liste angehängt (nicht ersetzt)
- [ ] Angenommen alle Einträge sind geladen, wenn keine weiteren existieren, dann verschwindet der "Ältere Einträge laden"-Button
- [ ] Angenommen eine Trainingseinheit gehört zum Plan "Fitnessstudio", wenn sie in der Liste angezeigt wird, dann zeigt sie zusätzlich das bewegte Gewicht dieser Einheit; bei den anderen beiden Plänen wird kein Gewicht angezeigt
- [ ] Angenommen ein Nutzer hat noch nie trainiert, wenn er den Tab öffnet, dann sieht er einen Leer-Zustand statt einer leeren Liste

### Analyse-Kennzahlen (vor der Liste)
- [ ] Angenommen der Tab lädt, wenn die Analyse-Sektion angezeigt wird, dann erscheint sie oberhalb der Trainingsliste mit 4 Kennzahlen: "Trainingseinheiten der letzten 7 Tage", "Durchschnittsgewicht", "Steigerung" und "Aktuelle Serie"
- [ ] Angenommen ein Nutzer hat in den letzten 7 Tagen 3 Trainings (beliebiger Plan) absolviert, wenn "Trainingseinheiten der letzten 7 Tage" angezeigt wird, dann zeigt sie "3"
- [ ] Angenommen ein Nutzer hat in den letzten 7 Tagen keine Trainings absolviert, wenn die Kennzahl angezeigt wird, dann zeigt sie "0"
- [ ] Angenommen ein Nutzer hat mindestens 1 Fitnessstudio-Einheit in den letzten 7 Tagen, wenn "Durchschnittsgewicht" angezeigt wird, dann zeigt sie den Durchschnitt des bewegten Gewichts (Wiederholungen × Gewicht, aufsummiert über alle Sätze/Übungen einer Einheit) über alle Fitnessstudio-Einheiten der letzten 7 Tage
- [ ] Angenommen ein Nutzer hat 0 Fitnessstudio-Einheiten in den letzten 7 Tagen, wenn "Durchschnittsgewicht" angezeigt wird, dann erscheint statt einer Zahl ein neutraler Hinweis (kein Fehler, keine irreführende "0")
- [ ] Angenommen ein Nutzer hat mindestens 1 Fitnessstudio-Einheit in den letzten 7 Tagen UND mindestens 2 in den letzten 30 Tagen, wenn "Steigerung" angezeigt wird, dann zeigt sie die prozentuale Differenz zwischen dem 7-Tage-Durchschnitt und dem 30-Tage-Durchschnitt des bewegten Gewichts
- [ ] Angenommen die Datenschwelle für "Steigerung" ist nicht erreicht, wenn die Kennzahl angezeigt wird, dann erscheint ein Hinweis, dass noch nicht genug Daten vorhanden sind, statt einer Prozentzahl
- [ ] Angenommen ein Nutzer hat in mehreren aufeinanderfolgenden Wochen bis zur aktuellen Woche je mindestens 1 Training absolviert, wenn "Aktuelle Serie" angezeigt wird, dann zeigt sie die Anzahl dieser Wochen
- [ ] Angenommen die aktuelle Woche hat noch kein Training, wenn "Aktuelle Serie" berechnet wird, dann bricht das die Serie nicht sofort ab — es zählen die bereits abgeschlossenen, unmittelbar vorangehenden Wochen mit mindestens 1 Training

### Gast-Zugriff
- [ ] Angenommen ein Gast (kein Login) öffnet den "Training"-Tab, wenn der Tab lädt, dann erscheint eine Login-Hinweis-Karte statt Inhalt (analog zum "Mahlzeiten"-Tab)

## Edge Cases
- Trainingseinheit mit nicht-numerischen Werten in `wiederholungen`/`gewicht` (z. B. "bis Muskelversagen", "10-12"): der jeweilige Wert wird per führender Zahl geparst (z. B. "10-12" → 10); ist gar keine Zahl enthalten, trägt dieser Satz 0 zum Volumen dieser Einheit bei — die Einheit selbst zählt trotzdem für "Trainingseinheiten der letzten 7 Tage".
- Nutzer mit langjähriger Historie (>100 Trainingseinheiten): Pagination verhindert, dass alles auf einmal geladen wird — Performance bleibt unabhängig von der Gesamtzahl, analog zu PROJ-6 (Mahlzeiten-Historie).
- Nutzer trainiert mehrfach am selben Tag: jede Einheit erscheint als eigener Eintrag (kein Zusammenfassen).
- Zeitzonen-/Wochengrenzfall (z. B. Training kurz vor Mitternacht Sonntag/Montag): nutzt dieselbe bestehende Wochengrenzen-Logik wie der Wochen-Recap (PROJ-17) — keine gesonderte Behandlung, konsistent mit dem Rest der App.
- Anonyme Gast-Session (`user.is_anonymous === true`): verhält sich identisch zu einem Gast ohne Session — Login-Hinweis, kein Inhalt (Gäste können laut PROJ-44 ohnehin keine Trainings speichern).

## Technical Requirements (optional)
- Kein neues Backend-Feature nötig außer einer Lese-Route mit Pagination (analog zu `/api/mahlzeiten`) — reine Lese-Operation auf der bestehenden `training_sessions`-Tabelle, kein neues Schema.
- Mobile-first, wie alle anderen Bereiche der App.

## Open Questions
Keine — alle offenen Punkte wurden im Interview geklärt.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| "Durchschnittsgewicht" = Trainingsvolumen (Wiederholungen × Gewicht, aufsummiert über alle Sätze/Übungen einer Einheit), gemittelt über die Fitnessstudio-Einheiten der letzten 7 Tage | Nutzer-Klarstellung im Interview — die ursprüngliche Formulierung war widersprüchlich ("Durchschnitt" vs. "aufsummiert") | 2026-09-05 |
| Nur Fitnessstudio-Einheiten fließen in "Durchschnittsgewicht" und "Steigerung" ein | Nutzervorgabe — "Zuhause ohne Equipment" hat kein Gewichtsfeld, "Zuhause mit Bändern" nutzt keine echten kg-Werte, beides würde die Kennzahl verfälschen | 2026-09-05 |
| "Steigerung" vergleicht den 7-Tage-Durchschnitt gegen den 30-Tage-Durchschnitt (30 Tage als Referenzwert, schließt die letzten 7 Tage mit ein) | Nutzer hat sich explizit für diese Variante entschieden (statt eines echten Monat-zu-Monat-Vergleichs) | 2026-09-05 |
| Datenschwelle für "Steigerung": mind. 1 Fitnessstudio-Einheit in den letzten 7 Tagen UND mind. 2 in den letzten 30 Tagen | Verhindert eine irreführende Prozentzahl auf Basis einer einzelnen Einheit | 2026-09-05 |
| 4. Analysepunkt "Aktuelle Serie" (Wochen in Folge mit mind. 1 Training) ergänzt | Vorschlag von Claude, vom Nutzer angenommen — ergänzt den Volumen-Fokus um eine Konsistenz-/Motivations-Perspektive, passend zum PRD-Erfolgsmaß "Wiederkehrrate" | 2026-09-05 |
| "Aktuelle Serie" nutzt die bestehende Wochengrenze (`getWeekStartIso`, Sonntag-basiert) statt einer neuen Definition | Konsistenz mit dem bereits etablierten Wochen-Recap (PROJ-17) — kein neues Wochenkonzept in der App | 2026-09-05 |
| Eine laufende, noch nicht abgeschlossene Woche bricht die Serie nicht sofort ab, solange sie noch kein Training hat | Fairer und intuitiver für den Nutzer, als die Serie vorzeitig auf 0 zu setzen, bevor die Woche vorbei ist | 2026-09-05 |
| Nicht-numerische `wiederholungen`/`gewicht`-Werte werden per führender Zahl geparst; nicht-parsebare Werte zählen als 0 zum Volumen | Nutzervorgabe ("Fokussiere dich auf Zahlen") — pragmatische Lösung für Bestandsdaten, ohne die Eingabefelder in PROJ-44 jetzt zu ändern | 2026-09-05 |
| Freitext-Felder in PROJ-44 (Wiederholungen/Gewicht beim Fitnessstudio-Plan) auf Integer-Inputs umstellen — als separates zukünftiges Refinement vorgemerkt, nicht Teil dieser Spec | Nutzerwunsch, sich das für "das nächste Refinement" zu merken (siehe Projekt-Memory) | 2026-09-05 |
| Kein Klick auf eine Trainingseinheit → Detailansicht in dieser Version | Nutzerbestätigung ("Reicht das erstmal") — Liste mit Datum/Plan/Gewicht ist für den MVP ausreichend | 2026-09-05 |
| Liste zeigt Datum, Plan-Name und (nur bei Fitnessstudio) das bewegte Gewicht der Einheit | Nutzervorgabe, minimal aber ausreichend informativ | 2026-09-05 |
| Pagination identisch zu PROJ-6 (Mahlzeiten-Historie): erste 5, danach 10er-Schritte über "Ältere Einträge laden" | Explizite Nutzervorgabe ("wie bei den analysierten Mahlzeiten") | 2026-09-05 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Bestehende Tabelle "Trainingseinheiten" (aus PROJ-44) wiederverwenden, kein neues Datenbank-Schema | Die Daten existieren bereits — dieser Tab ist reine Anzeige/Auswertung vorhandener Trainingseinheiten | 2026-09-05 |
| Eine einzelne, neue Lese-Route mit Pagination (analog `/api/mahlzeiten`) statt getrennter Endpunkte für Liste und Kennzahlen | Beim ersten Laden (Offset 0) liefert dieselbe Anfrage sowohl die ersten 5 Einträge als auch die 4 Kennzahlen — ein Roundtrip statt zwei, "Ältere Einträge laden" ruft danach nur noch weitere Listen-Einträge ab | 2026-09-05 |
| Kennzahlen-Berechnung (7-Tage-Zähler, Durchschnittsgewicht, Steigerung, Serie) passiert serverseitig in dieser Route, nicht im Browser | Vermeidet doppelte Berechnungslogik und hält die Zahlen konsistent, unabhängig vom Gerät; das Parsen der Freitext-Werte (führende Zahl) passiert an einer einzigen Stelle | 2026-09-05 |
| "Aktuelle Serie"-Berechnung auf die letzten 26 Wochen (~6 Monate) begrenzt | Verhindert eine unbegrenzt wachsende Datenbankabfrage für sehr alte Nutzerkonten; eine reale Serie über ein halbes Jahr hinaus ist ein in der Praxis vernachlässigbarer Fall — der Wert wird bei diesem Maximum gedeckelt angezeigt | 2026-09-05 |
| Neue Client-Komponente `TrainingHistorie` (analog zu `MahlzeitHistorie` aus PROJ-6) ersetzt den bisherigen "Bald verfügbar"-Platzhalter im "Training"-Tab | Gleiches, bereits bewährtes Lade-/Pagination-Verhalten wie bei den Mahlzeiten — konsistente Nutzererfahrung über beide Tabs hinweg | 2026-09-05 |
| Gast-Zugriff nutzt die bereits bestehende Login-Hinweis-Komponente, kein neuer Code | Identisches Muster zum "Mahlzeiten"-Tab in derselben `AnalyseHistorieTabs`-Komponente | 2026-09-05 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

```
/analyse (Analyse-Übersichtsseite, PROJ-42)
└── AnalyseHistorieTabs (bestehend)
    └── Tab "Training" (ersetzt den bisherigen "Bald verfügbar"-Platzhalter)
        ├── Gast (kein Login): Login-Hinweis-Karte (bestehende Komponente,
        │     identisches Muster zum "Mahlzeiten"-Tab)
        └── Eingeloggter Nutzer: TrainingHistorie (neu, analog zu MahlzeitHistorie)
            ├── Analyse-Kennzahlen-Sektion (neu, oberhalb der Liste)
            │   ├── "Trainingseinheiten der letzten 7 Tage"
            │   ├── "Durchschnittsgewicht" (oder Hinweis bei zu wenig Daten)
            │   ├── "Steigerung" (oder Hinweis bei zu wenig Daten)
            │   └── "Aktuelle Serie"
            ├── Trainingsliste (neueste zuerst, erste 5)
            │   └── Trainingseinheit-Karte (neu, analog zu MahlzeitKarte)
            │       ├── Datum
            │       ├── Plan-Name (Zuhause ohne Equipment / Zuhause mit Bändern / Fitnessstudio)
            │       └── Bewegtes Gewicht (nur bei Fitnessstudio-Einheiten)
            ├── "Ältere Einträge laden"-Button (lädt in 10er-Schritten nach)
            └── Leer-Zustand ("Noch keine Trainingseinheit")
```

### B) Datenmodell (in Worten)

Kein neues Datenbank-Schema — es wird ausschließlich die bereits bestehende Tabelle "Trainingseinheiten" aus PROJ-44 gelesen (nie geschrieben). Jede Zeile darin ist ein abgeschlossenes Training mit: Nutzer, Plan, Zeitstempel und den eingetragenen Werten aller Übungen (Wiederholungen/Gewicht als Freitext, siehe Edge Case in der Spec).

Für die Anzeige werden zwei Sichten auf dieselben Daten gebraucht:
- **Liste:** die rohen Trainingseinheiten, Seite für Seite (5, dann 10er-Schritte), neueste zuerst.
- **Kennzahlen:** eine serverseitig vorgerechnete Zusammenfassung (4 Zahlen) über die Trainingseinheiten der letzten ~6 Monate — der Browser bekommt nur die fertigen Zahlen, nie die Rohdaten für diese Berechnung.

### C) Tech-Entscheidungen (Begründung für PM)

1. **Kein neues Schema, nur Lesezugriff** — alle nötigen Daten liegen bereits aus PROJ-44 vor.
2. **Eine gemeinsame Lese-Route für Liste und Kennzahlen** — beim ersten Laden liefert eine einzige Anfrage sowohl die ersten 5 Einträge als auch die 4 Kennzahlen; "Ältere Einträge laden" fragt danach nur noch weitere Listen-Seiten ab. Spart Anfragen gegenüber zwei getrennten Endpunkten.
3. **Kennzahlen werden auf dem Server berechnet, nicht im Browser** — das Umgehen mit den Freitext-Werten (führende Zahl herauslesen, siehe Spec) passiert an genau einer Stelle, und alle Geräte sehen garantiert dieselbe Zahl.
4. **"Aktuelle Serie" schaut maximal 26 Wochen zurück** — verhindert, dass die Abfrage für langjährige Nutzer unbegrenzt wächst; in der Praxis so gut wie nie relevant.
5. **Wiederverwendung des bewährten Lade-Musters aus PROJ-6** (Mahlzeiten-Historie) für die neue Trainings-Komponente — gleiches Verhalten, das Nutzer bereits kennen.
6. **Gast-Zugriff ohne neuen Code** — die bestehende Login-Hinweis-Karte wird einfach für den "Training"-Tab wiederverwendet.

### D) Abhängigkeiten (Pakete)
Keine neuen Pakete nötig — vollständig mit dem bereits installierten Next.js/Supabase-Stack umsetzbar.

## Implementation Notes (Frontend)

**Gebaut:**
- Neu: `src/components/training-kennzahlen.tsx` — 2×2-Kachel-Grid für die 4 Kennzahlen, im selben Kachel-Stil wie die bestehenden "Nährwerte pro Portion"-Kacheln auf der Rezept-Detailseite (`rounded-lg border border-border bg-muted/40`). "Steigerung" färbt sich grün/rot je nach Vorzeichen, "—" plus erklärender Sub-Text bei fehlenden Daten (kein Fehler, keine irreführende Zahl).
- Neu: `src/components/training-karte.tsx` — ein Listen-Eintrag (Icon, Plan-Titel via `findTrainingsplan()`, Datum, bei Fitnessstudio zusätzlich das gerundete bewegte Gewicht). Bewusst ohne Löschen-Button und ohne Link zu einer Detailseite (siehe Out of Scope).
- Neu: `src/components/training-historie.tsx` — Lade-Logik 1:1 nach dem Muster von `MahlzeitHistorie` (PROJ-6) kopiert: erste 5 Einträge beim Mount, "Ältere Einträge laden" holt in 10er-Schritten nach und hängt an. Kennzahlen kommen im selben Response wie die erste Seite (Feld `kennzahlen`, nur bei `offset=0` vorhanden) und werden einmalig übernommen. Kein FAB, kein Lösch-Dialog (anders als bei Mahlzeiten — hier nicht Teil der Spec).
- `src/components/analyse-historie-tabs.tsx`: `BaldVerfuegbarTab`-Platzhalter im "Training"-Tab durch `<TrainingHistorie />` ersetzt; `BaldVerfuegbarTab`s Icon-Prop-Typ von `typeof Dumbbell` auf das allgemeinere `LucideIcon` umgestellt, da `Dumbbell` nicht mehr importiert wird (wird jetzt innerhalb von `TrainingKarte` verwendet).
- Gast-Zugriff brauchte keinen neuen Code: `AnalyseHistorieTabs` (und damit der komplette "Training"-Tab) wird in `src/app/analyse/page.tsx` bereits nur für eingeloggte Nutzer gerendert — Gäste sehen dort schon die bestehende Login-Hinweis-Karte für die gesamte Sektion 3, wie in der Architektur vorgesehen.
- API-Vertrag für `/api/training/verlauf?limit=&offset=` (noch nicht gebaut, siehe unten) im Frontend bereits als TypeScript-Interface festgelegt: `{ trainings: TrainingEntry[], hasMore: boolean, kennzahlen?: TrainingKennzahlenData }`.

**Bewusst nicht gebaut (braucht `/backend`):**
- Die eigentliche API-Route `/api/training/verlauf` existiert noch nicht — die Komponente ruft sie bereits aktiv auf, bekommt aktuell 404 und zeigt dadurch korrekt ihren Fehlerzustand ("Deine Trainingseinheiten konnten nicht geladen werden."), darunter den Leer-Zustand. Verifiziert per Screenshot (Desktop + Mobile 375px) — beide Zustände greifen sauber ineinander, kein Absturz, kein horizontales Scrollen.
- Serverseitige Berechnung der 4 Kennzahlen (inkl. Freitext-Parsing von `wiederholungen`/`gewicht`, 26-Wochen-Deckelung der Serie) — vollständig in `/backend`.
- `npm run build`, `npm run lint`, `npm test` (464/464) fehlerfrei. Ein bestehender PROJ-42-Test ("Klick auf 'Training' zeigt 'Bald verfügbar'") wurde an die neue Realität angepasst (prüft jetzt, dass der Platzhalter-Text NICHT mehr erscheint) — eigene Abdeckung der neuen Funktionalität folgt in `/qa`.

## Implementation Notes (Backend)

**Keine Migration nötig** — die Route liest ausschließlich die bestehende `training_sessions`-Tabelle aus PROJ-44 (RLS-Policy "Users see own training sessions" existiert bereits und deckt den Lesezugriff vollständig ab).

**Gebaut:**
- Neu: `GET /api/training/verlauf` (`src/app/api/training/verlauf/route.ts`) — Auth-Check (401 ohne Session), `limit`/`offset`-Pagination (Limit auf 50 gedeckelt, gleiches Muster wie `/api/mahlzeiten`), `.eq('user_id', user.id)` als explizite Anwendungs-seitige Filterung zusätzlich zur RLS (Defense-in-Depth, wie überall sonst in der App).
- `parseLeadingNumber()`: extrahiert die erste Zahl aus einem Freitext-Feld (z. B. "10-12" → 10, "20kg" → 20); kein Treffer (z. B. "bis Muskelversagen", leer) → 0. `berechneVolumenKg()`: summiert Wiederholungen × Gewicht über alle Sätze/Übungen einer Trainingseinheit — defensiv geschrieben, da `uebungen` ein ungeprüfter JSONB-Blob ist.
- `berechneKennzahlen()`: nur bei `offset=0` aufgerufen, mit einer zweiten, breiteren Abfrage (letzte 26 Wochen) als Grundlage. Berechnet alle 4 Kennzahlen serverseitig exakt nach Spec: "Einheiten (7 Tage)" zählt alle Pläne, "Durchschnittsgewicht" und "Steigerung" nur Fitnessstudio-Einheiten mit der vereinbarten Datenschwelle (≥1/7 Tage, ≥2/30 Tage), "Aktuelle Serie" über `getWeekStartIso()` (wiederverwendet aus PROJ-17) mit der vereinbarten Sonderregel für die laufende, noch nicht abgeschlossene Woche.
- Response bündelt Liste und Kennzahlen in einer Antwort bei `offset=0` (Feld `kennzahlen` nur dort vorhanden) — genau wie in der Architektur festgelegt, kein zweiter Roundtrip.
- Integrationstest: `src/app/api/training/verlauf/route.test.ts` — 11 Tests (401, Happy Path inkl. Kennzahlen, kein Kennzahlen-Query bei `offset>0`, `volumenKg: null` bei Nicht-Fitnessstudio-Plänen, Freitext-Parsing inkl. nicht-numerischer Werte, 500 bei DB-Fehler, Limit-Deckelung, `hasMore`, "Steigerung" bleibt `null` unter der Datenschwelle, "Aktuelle Serie" mit Lücke und mit leerer laufender Woche).
- `npm run build`, `npm run lint`, `npm test` (475/475) fehlerfrei. Live gegen die echte DB verifiziert (QA-Testkonto, Playwright): API liefert reale Daten (18 Trainingseinheiten der letzten 7 Tage, alle "Zuhause ohne Equipment" aus früheren QA-Läufen), Kennzahlen-Kacheln zeigen korrekt "18" sowie die "nicht genug Daten"-Hinweise für Durchschnittsgewicht/Steigerung (keine Fitnessstudio-Einheiten vorhanden), "Aktuelle Serie" zeigt "1 Woche". "Ältere Einträge laden" per echtem Klick verifiziert: 5 → 18 Einträge, korrekt angehängt statt ersetzt. Auf einen echten Fitnessstudio-Testeintrag wurde bewusst verzichtet, da `training_sessions` keine DELETE-Policy hat (siehe PROJ-44) — das QA-Testkonto würde dauerhaft verschmutzt; die Volumen-/Steigerungs-/Kacheln-Logik für Fitnessstudio-Daten ist stattdessen vollständig über die 11 Vitest-Integrationstests mit kontrollierten Mock-Daten abgedeckt.

## QA Test Results

**Tested:** 2026-09-07
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Trainingsliste
- [x] Neueste zuerst, maximal 5 initial
- [x] "Ältere Einträge laden" erscheint bei mehr als 5 Einheiten
- [x] Klick lädt die nächsten 10 nach und hängt sie an (nicht ersetzt)
- [x] Button verschwindet, wenn keine weiteren Einträge existieren
- [x] Nur Fitnessstudio-Einheiten zeigen das bewegte Gewicht, die anderen beiden Pläne nicht
- [x] Leer-Zustand erscheint, wenn noch nie trainiert wurde

#### Analyse-Kennzahlen
- [x] Alle 4 Kennzahlen erscheinen oberhalb der Liste
- [x] "Einheiten (7 Tage)" zeigt die korrekte Anzahl (inkl. "0" ohne Trainings)
- [x] "Durchschnittsgewicht" zeigt einen Wert bei ≥1 Fitnessstudio-Einheit (7 Tage), sonst einen neutralen Hinweis
- [x] "Steigerung" zeigt eine Prozentzahl (positiv grün, negativ rot mit Minuszeichen) ab erreichter Datenschwelle, sonst einen Hinweis statt einer irreführenden Zahl
- [x] "Aktuelle Serie" zeigt die Wochenzahl; eine noch leere laufende Woche bricht die Serie nicht ab (per Vitest-Test mit Lücken-Szenario bestätigt)

#### Gast-Zugriff
- [x] Gast sieht eine Login-Hinweis-Karte statt des gesamten "Training"-Tabs — bestätigt sowohl für echte Gäste als auch für anonyme Sessions (`isGuest = !user || user.is_anonymous === true` gilt für die komplette Sektion 3, in der der Tab liegt; per Code-Review verifiziert, identischer, bereits getesteter Gate wie beim "Mahlzeiten"-Tab)

### Security Audit
- [x] `GET /api/training/verlauf` ohne Session → 401, keine Detail-Informationen im Fehlerkörper
- [x] RLS greift zusätzlich zur expliziten `user_id`-Filterung in der Query (Defense-in-Depth, gleiches Muster wie `/api/mahlzeiten`) — Policy bereits in PROJ-44 verifiziert
- [x] Manipulierte `limit`/`offset`-Query-Parameter (SQL-Injection-artige Strings, negative Werte) führen zu keinem 500 — `parseInt` liefert `NaN`, Supabase behandelt das robust und liefert eine leere, valide Antwort statt eines Fehlers
- [x] Keine Service-Role-Keys oder sonstigen Secrets in der Response
- [x] Kein Nutzer-Input auf der Seite selbst (reine Anzeige) — kein XSS-Vektor
- [x] Freitext-Werte aus `wiederholungen`/`gewicht` werden ausschließlich serverseitig als Zahl geparst, nie ungefiltert an den Client durchgereicht oder gerendert

### Regressionstest
- **Vitest (Gesamtsuite):** 475/475 grün (45 Testdateien) — inkl. der 11 neuen Integrationstests für `/api/training/verlauf`.
- **E2E — `tests/PROJ-50-training-tab-analyse.spec.ts` (neue, eigene Suite):** 17/17 grün — 16 deterministisch über `page.route()`-Mocks (etabliertes Muster, siehe PROJ-11/12/13/14), 1 Smoke-Test gegen die echte API/DB ohne Mock.
- **E2E — angrenzende Suiten:** `PROJ-42-analyse-uebersichtsseite.spec.ts` 13/13 (inkl. des an die neue Realität angepassten Tests aus `/frontend`), `PROJ-43-training-uebersicht.spec.ts` + `PROJ-44-trainingsplaene.spec.ts` zusammen 42/42 — keine Regression an den Ursprungs-Features, aus denen PROJ-50 seine Daten liest.
- Responsive geprüft bei 375px, 768px, 1440px (mit gemockten, befüllten Daten) — kein horizontales Scrollen bei keiner Breite, Layout bleibt sauber (Screenshots geprüft).
- Ein einzelner `ERR_NETWORK_IO_SUSPENDED`-Fehlschlag beim ersten vollständigen Suite-Lauf erwies sich beim erneuten vollständigen Lauf als nicht reproduzierbar (17/17 grün) — transientes Browser-/Ressourcen-Rauschen, keine echte Regression, konsistent mit dem bereits mehrfach dokumentierten Muster dieser Session.

### Bugs Found

#### BUG-1: Falscher Plan-Titel in einem eigenen Test verwendet
- **Severity:** N/A (reiner Testfehler, kein Produktcode-Bug)
- **Details:** Ein selbst geschriebener E2E-Test erwartete "Zu Hause mit Bändern" statt des tatsächlichen, korrekten Plan-Titels "Zu Hause mit Widerstandsbändern" (aus `src/lib/trainingsplaene.ts`, unverändert seit PROJ-44). Direkt beim Schreiben der Suite gefunden und korrigiert, kein Produktcode betroffen.
- **Status:** ✅ Fixed (2026-09-07)

Keine weiteren Bugs gefunden.

### Summary
- **Acceptance Criteria:** 17/17 passed
- **Bugs Found:** 0 im Produktcode (1 Testfehler in der eigenen QA-Suite, sofort behoben)
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** Deploy

## Deployment

**Production URL:** https://app.mehralsabnehmen.de/analyse (Training-Tab)
**Deployed:** 2026-09-07 (Vercel auto-deploy via Push zu `main`, commits `e26a43a`..`4b5ae12`, Tag `v3.18.0-PROJ-50`)
**Neue Env-Variablen:** keine
**DB-Migrationen:** keine (liest nur die bestehende `training_sessions`-Tabelle aus PROJ-44)

**Hinweis zum Deploy-Ablauf:** Der lokale `main`-Branch war nach dem letzten PROJ-24-Deploy divergiert, ohne dass ein `git push` tatsächlich stattgefunden hatte — eine parallel laufende Session hatte in der Zwischenzeit ihren eigenen Fix (PROJ-31/32 Testdaten-Bereinigung) über einen separaten PR gemerged. Dadurch blieb Produktion zunächst auf dem alten Stand, obwohl lokale Checks fälschlich "bereits synchron" meldeten. Per `git rebase origin/main` sauber aufgelöst (keine Konflikte, da unterschiedliche Dateien betroffen), dann erfolgreich gepusht.

**Post-Deployment-Verifikation:** Direkt gegen die Produktions-URL per Playwright verifiziert (QA-Testkonto) — Training-Tab zeigt alle 4 Kennzahlen-Kacheln ("Einheiten (7 Tage)": 20, "Aktuelle Serie": 2 Wochen, korrekte "nicht genug Daten"-Hinweise für Durchschnittsgewicht/Steigerung mangels Fitnessstudio-Historie), Trainingsliste mit echten Einträgen, "Ältere Einträge laden" vorhanden. Kein "Bald verfügbar"-Platzhalter, kein Fehlerzustand mehr sichtbar. Screenshot geprüft.
