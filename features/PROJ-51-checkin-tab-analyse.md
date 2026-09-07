# PROJ-51: Check-In-Tab (Analyse-Seite)

## Status: Approved
**Created:** 2026-09-07
**Last Updated:** 2026-09-07

## Dependencies
- Requires: PROJ-45 (Wochen-Check-In) — Datenquelle `wochen_check_ins`
- Requires: PROJ-42 (Analyse-Übersichtsseite) — Host-Seite; ersetzt den bestehenden "Bald verfügbar"-Platzhalter im "Check-Ins"-Tab
- Requires: PROJ-19 (Gast-Modus) — bestimmt das Verhalten für Gäste (kein Login)

**Bewusste Abgrenzung zu PROJ-45:** PROJ-45 hat bereits eine eigene "Mini-Historie" (letzte 5 Einträge, zum Laden/Bearbeiten) direkt auf `/check-in`. Dieser Tab ist etwas anderes — eine reine Lese-/Analyse-Ansicht auf der Analyse-Seite, mit voller Pagination (nicht auf 5 begrenzt) und einer neuen Trend-Auswertung über 6 Metriken. Kein Bearbeiten hier, das bleibt PROJ-45 vorbehalten.

## User Stories
- Als eingeloggter Nutzer möchte ich auf der Analyse-Seite alle meine vergangenen Check-Ins chronologisch sehen, damit ich nachvollziehen kann, wie regelmäßig ich reflektiert habe.
- Als eingeloggter Nutzer möchte ich sehen, wie sich meine wichtigsten Kennzahlen (Schlaf, Screentime, Energielevel, Ernährung, bewusstes Essen, Tracking-Bereitschaft) im Vergleich zu meinem Schnitt der letzten 30 Tage entwickelt haben, damit ich meinen Fortschritt über die Zeit einschätzen kann.
- Als Gast (kein Login) möchte ich verstehen, dass ich mich anmelden muss, um meine Check-In-Historie zu sehen.

## Out of Scope
- Bearbeiten von Check-Ins über diesen Tab — bleibt exklusiv der Mini-Historie auf `/check-in` (PROJ-45) vorbehalten.
- Anzeige der Freitext-Antworten (Highlights, Lowlights, "nächste Woche anders", Trainings-Begründung, Sonstiges) in der Liste oder Analyse — nur die Kalenderwoche pro Eintrag, siehe Product Decisions.
- Anzeige der Trainings-Frage (0–3 Mal trainiert) in der Analyse-Sektion — der Nutzer hat für die Analyse explizit nur die 6 Slider-Metriken genannt; die Trainings-Frage gehört inhaltlich eher zu PROJ-50 (Training-Tab).
- Diagramme/Verlaufskurven über die Zeit — für den MVP reicht eine Liste plus die textuelle 30-Tage-Vergleichs-Analyse.
- Eigene Zeitraum-Auswahl durch den Nutzer — fester 30-Tage-Vergleichszeitraum für den MVP.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Check-In-Liste
- [ ] Angenommen ein eingeloggter Nutzer öffnet den "Check-Ins"-Tab auf `/analyse`, wenn der Tab lädt, dann sieht er seine Check-Ins absteigend sortiert nach Kalenderwoche (neueste zuerst), maximal 5 initial
- [ ] Angenommen mehr als 5 Check-Ins existieren, wenn die ersten 5 angezeigt werden, dann erscheint darunter ein "Ältere Einträge laden"-Button
- [ ] Angenommen der Nutzer klickt "Ältere Einträge laden", wenn der Klick erfolgt, dann werden die nächsten 10 Einträge nachgeladen und ans Ende der bestehenden Liste angehängt (nicht ersetzt)
- [ ] Angenommen alle Einträge sind geladen, wenn keine weiteren existieren, dann verschwindet der "Ältere Einträge laden"-Button
- [ ] Angenommen ein Check-In wird in der Liste angezeigt, dann zeigt der Eintrag ausschließlich die Kalenderwoche als Datumsspanne (z. B. "22.–28. Sept."), keine weiteren Details
- [ ] Angenommen ein Nutzer hat noch nie einen Check-In ausgefüllt, wenn er den Tab öffnet, dann sieht er einen Leer-Zustand statt einer leeren Liste

### Analyse-Kennzahlen (vor der Liste)
- [ ] Angenommen der Tab lädt, wenn die Analyse-Sektion angezeigt wird, dann erscheint sie oberhalb der Liste mit 6 Zeilen: Schlaf, Screentime, Energielevel, Ernährung, Bewusstes Essen, Tracking-Bereitschaft
- [ ] Angenommen ein Nutzer hat mindestens 1 Check-In, wenn eine Metrik-Zeile angezeigt wird, dann zeigt sie den Wert des neuesten Check-Ins (bei Screentime als Std/Min formatiert, sonst als Punktzahl)
- [ ] Angenommen ein Nutzer hat mindestens 2 Check-Ins in den letzten 30 Tagen (inkl. des neuesten), wenn eine Metrik-Zeile angezeigt wird, dann zeigt sie zusätzlich die absolute Differenz zwischen dem neuesten Wert und dem Durchschnitt der letzten 30 Tage, richtig interpretiert je nach Metrik (bei Schlaf/Energielevel/Ernährung/Bewusstes Essen/Tracking-Bereitschaft ist mehr besser, bei Screentime ist weniger besser)
- [ ] Angenommen ein Nutzer hat weniger als 2 Check-Ins in den letzten 30 Tagen, wenn eine Metrik-Zeile angezeigt wird, dann erscheint statt der Differenz ein neutraler Hinweis, dass noch nicht genug Daten vorhanden sind
- [ ] Angenommen ein Nutzer hat noch nie einen Check-In ausgefüllt, wenn die Analyse-Sektion angezeigt wird, dann erscheint sie nicht (nur der Leer-Zustand der Liste)

### Gast-Zugriff
- [ ] Angenommen ein Gast (kein Login) öffnet den "Check-Ins"-Tab, wenn der Tab lädt, dann erscheint eine Login-Hinweis-Karte statt Inhalt (analog zu den Tabs "Mahlzeiten" und "Training")

## Edge Cases
- Nutzer mit langjähriger Historie (>100 Check-Ins): Pagination verhindert, dass alles auf einmal geladen wird — analog zu PROJ-6/PROJ-50.
- Genau 2 Check-Ins in den letzten 30 Tagen, beide identisch: Differenz zeigt "0" bzw. "±0", kein Fehler.
- Screentime-Differenz über die Stunden-Grenze hinweg (z. B. Verbesserung um 75 Minuten): wird wie der reguläre Screentime-Wert als Std/Min formatiert (z. B. "−1,25 Std" bzw. passend gerundet), nicht als rohe Minutenzahl.
- Anonyme Gast-Session (`user.is_anonymous === true`): verhält sich identisch zu einem Gast ohne Session — Login-Hinweis, kein Inhalt (Gäste können laut PROJ-45 ohnehin keine Check-Ins speichern).
- Alle 6 Slider sind in jedem Check-In-Datensatz laut PROJ-45-Datenmodell Pflichtfelder (nie `null`) — kein Fall von teilweise fehlenden Metriken pro Eintrag zu behandeln.

## Technical Requirements (optional)
- Kein neues Backend-Feature nötig außer einer Lese-Route mit Pagination (analog zu `/api/training/verlauf` aus PROJ-50) — reine Lese-Operation auf der bestehenden `wochen_check_ins`-Tabelle, kein neues Schema.
- Mobile-first, wie alle anderen Bereiche der App.

## Open Questions
Keine — alle offenen Punkte wurden im Interview geklärt.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Dieser Tab ist reine Lese-/Analyse-Ansicht, kein Bearbeiten — bleibt exklusiv der bestehenden Mini-Historie auf `/check-in` (PROJ-45) vorbehalten | Vermeidet doppelte/konkurrierende Bearbeitungswege für denselben Datensatz; klare Trennung der Zuständigkeiten | 2026-09-07 |
| Liste zeigt pro Eintrag nur die Kalenderwoche als Datumsspanne, keine Detail-Vorschau | Nutzerbestätigung — ein Check-In hat viele Freitext-Felder, eine Vorschau würde die Liste überladen; die eigentlichen Inhalte bleiben über PROJ-45 einsehbar | 2026-09-07 |
| Analyse vergleicht den neuesten Check-In-Wert gegen den Durchschnitt der letzten 30 Tage (inkl. des neuesten) | Check-Ins entstehen nur 1×/Woche (anders als Trainingseinheiten bei PROJ-50, wo mehrere pro Woche möglich sind) — ein reiner 7-Tage-Schnitt wäre meist nur 1 Wert; der 30-Tage-Durchschnitt über ~4 Wochen ist die sinnvollere Vergleichsbasis, entspricht der Nutzervorgabe "im Vergleich zu den letzten 30 Tagen" | 2026-09-07 |
| Darstellung als absolute Differenz (z. B. "+1,2 Punkte", "−15 Min"), nicht als Prozent | Bei kleinen, bereits begrenzten Skalen (0–10 bzw. Minuten) liest sich eine Prozentzahl unintuitiv; absolute Differenz ist direkter verständlich | 2026-09-07 |
| Datenschwelle für die Differenz-Anzeige: mind. 2 Check-Ins in den letzten 30 Tagen (inkl. neuestem) | Verhindert eine bedeutungslose "Differenz" auf Basis eines einzelnen Werts (Differenz zu sich selbst) | 2026-09-07 |
| Layout als kompakte Liste (6 Zeilen: Label, aktueller Wert, Differenz-Badge), kein Kachel-Grid wie bei PROJ-50 | 6 Metriken mit teils langen Labels ("Auf die Ernährung geachtet") passen nicht gut in ein Kachel-Grid; eine Liste bleibt lesbar und skaliert besser | 2026-09-07 |
| Kurze Anzeige-Labels: "Schlaf", "Screentime", "Energielevel", "Ernährung", "Bewusstes Essen", "Tracking-Bereitschaft" | Nutzerbestätigung — kürzer als die vollen Fragetexte aus PROJ-45, bleiben aber eindeutig zuordenbar | 2026-09-07 |
| Screentime-Werte (aktueller Wert wie auch Differenz) werden wie bei PROJ-45 als Std/Min formatiert, nicht als rohe Minutenzahl | Konsistenz mit der bestehenden Screentime-Darstellung aus PROJ-45 | 2026-09-07 |
| Trainings-Frage (0–3 Mal trainiert) und alle Freitext-Antworten explizit nicht Teil der Analyse-Sektion | Nutzer hat für die Analyse ausdrücklich nur die 6 Slider-Metriken genannt; Trainings-Häufigkeit wird bereits in PROJ-50 (Training-Tab) abgedeckt | 2026-09-07 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Bestehende Tabelle "Wochen-Check-Ins" (aus PROJ-45) wiederverwenden, kein neues Datenbank-Schema | Die Daten existieren bereits — dieser Tab ist reine Anzeige/Auswertung vorhandener Check-Ins | 2026-09-07 |
| Eine einzelne, neue Lese-Route mit Pagination (analog `/api/training/verlauf` aus PROJ-50) statt getrennter Endpunkte für Liste und Kennzahlen | Beim ersten Laden (Offset 0) liefert dieselbe Anfrage sowohl die ersten 5 Einträge als auch die 6 Kennzahlen-Zeilen — ein Roundtrip statt zwei | 2026-09-07 |
| Kennzahlen-Berechnung (aktueller Wert, 30-Tage-Schnitt, Differenz je Metrik) passiert serverseitig, nicht im Browser | Die Richtungs-Logik (bei Screentime ist weniger besser, bei den anderen 5 Metriken mehr) soll an einer einzigen Stelle korrekt behandelt werden, nicht dupliziert auf jedem Gerät | 2026-09-07 |
| Zeitfenster für die Kennzahlen-Abfrage: letzte 30 Tage | Reicht für den geforderten 30-Tage-Schnitt aus; anders als bei PROJ-50 (26 Wochen für die "Aktuelle Serie") gibt es hier kein längerfristiges Muster zu berechnen | 2026-09-07 |
| Screentime-Formatierung (Minuten → Std/Min-Anzeige) bleibt im Frontend, wie bereits bei PROJ-45 etabliert — der Server liefert nur die rohen Minuten-Werte (aktuell + Differenz) | Vermeidet doppelten Formatierungscode; die bestehende `formatScreentime()`-Funktion aus PROJ-45 wird wiederverwendet | 2026-09-07 |
| Neue Client-Komponenten `CheckInHistorie`, `CheckInEintrag`, `CheckInKennzahlenListe` (analog zu `TrainingHistorie`/`TrainingKarte`/`TrainingKennzahlen` aus PROJ-50) ersetzen den bisherigen "Bald verfügbar"-Platzhalter im "Check-Ins"-Tab | Gleiches, bereits bewährtes Lade-/Pagination-Verhalten wie bei Training und Mahlzeiten — konsistente Nutzererfahrung über alle 3 Tabs hinweg | 2026-09-07 |
| Gast-Zugriff nutzt die bereits bestehende Login-Hinweis-Komponente, kein neuer Code | Identisches Muster zu den Tabs "Mahlzeiten" und "Training" in derselben `AnalyseHistorieTabs`-Komponente | 2026-09-07 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

```
/analyse (Analyse-Übersichtsseite, PROJ-42)
└── AnalyseHistorieTabs (bestehend)
    └── Tab "Check-Ins" (ersetzt den bisherigen "Bald verfügbar"-Platzhalter)
        ├── Gast (kein Login): Login-Hinweis-Karte (bestehende Komponente,
        │     identisches Muster zu den Tabs "Mahlzeiten" und "Training")
        └── Eingeloggter Nutzer: CheckInHistorie (neu, analog zu TrainingHistorie aus PROJ-50)
            ├── Analyse-Kennzahlen-Liste (neu, oberhalb der Liste)
            │   └── 6 Zeilen: Schlaf, Screentime, Energielevel, Ernährung,
            │         Bewusstes Essen, Tracking-Bereitschaft — je mit aktuellem
            │         Wert und Differenz zum 30-Tage-Schnitt (oder Hinweis bei
            │         zu wenig Daten)
            ├── Check-In-Liste (neueste Woche zuerst, erste 5)
            │   └── Check-In-Eintrag (neu, analog zu TrainingKarte)
            │       └── Kalenderwoche als Datumsspanne, sonst nichts
            ├── "Ältere Einträge laden"-Button (lädt in 10er-Schritten nach)
            └── Leer-Zustand ("Noch kein Check-In")
```

### B) Datenmodell (in Worten)

Kein neues Datenbank-Schema — es wird ausschließlich die bereits bestehende Tabelle "Wochen-Check-Ins" aus PROJ-45 gelesen (nie geschrieben). Jede Zeile darin ist ein Check-In für eine Kalenderwoche mit den 6 Metriken-Werten sowie weiteren Feldern (Freitexte, Trainings-Frage), die dieser Tab bewusst nicht anzeigt.

Für die Anzeige werden zwei Sichten auf dieselben Daten gebraucht:
- **Liste:** die rohen Check-In-Einträge, Seite für Seite (5, dann 10er-Schritte), neueste Woche zuerst.
- **Kennzahlen:** eine serverseitig vorgerechnete Zusammenfassung (6 Metriken-Zeilen) über die Check-Ins der letzten 30 Tage — der Browser bekommt nur die fertigen Werte, nie die Rohdaten für diese Berechnung.

### C) Tech-Entscheidungen (Begründung für PM)

1. **Kein neues Schema, nur Lesezugriff** — alle nötigen Daten liegen bereits aus PROJ-45 vor.
2. **Eine gemeinsame Lese-Route für Liste und Kennzahlen** — beim ersten Laden liefert eine einzige Anfrage sowohl die ersten 5 Einträge als auch die 6 Kennzahlen-Zeilen; "Ältere Einträge laden" fragt danach nur noch weitere Listen-Seiten ab.
3. **Kennzahlen werden auf dem Server berechnet, nicht im Browser** — insbesondere die Richtungs-Logik (bei Screentime ist ein niedrigerer Wert besser, bei den anderen 5 Metriken ein höherer) soll an genau einer Stelle korrekt behandelt werden.
4. **Wiederverwendung des bewährten Lade-Musters aus PROJ-50** (Training-Tab) für die neue Check-In-Komponente — gleiches Verhalten, das Nutzer bereits kennen.
5. **Screentime-Formatierung bleibt im Frontend**, wiederverwendet aus PROJ-45 — der Server liefert nur rohe Minuten-Werte.
6. **Gast-Zugriff ohne neuen Code** — die bestehende Login-Hinweis-Karte wird einfach für den "Check-Ins"-Tab wiederverwendet.

### D) Abhängigkeiten (Pakete)
Keine neuen Pakete nötig — vollständig mit dem bereits installierten Next.js/Supabase-Stack umsetzbar.

## Implementation Notes (Frontend)

**Gebaut:**
- Neu: `src/lib/format-wochen-check-in.ts` — `formatScreentime()` und `formatWochenLabel()` aus `wochen-check-in-form.tsx` (PROJ-45) hierher ausgelagert und dort durch einen Import ersetzt (reine Verschiebung, kein Verhaltensunterschied), damit dieser Tab dieselbe Formatierung ohne Duplikat nutzt — analog zur bereits bestehenden Auslagerung von `getWeekStartIso` in `wochen-grenzen.ts`.
- Neu: `src/components/checkin-eintrag.tsx` — ein Listen-Eintrag zeigt ausschließlich die Kalenderwoche (`formatWochenLabel`), keine weiteren Details (siehe Spec).
- Neu: `src/components/checkin-kennzahlen.tsx` — kompakte Liste mit 6 Zeilen (Label, aktueller Wert, Differenz-Badge). Punkte-Metriken zeigen "X / 10", Screentime nutzt `formatScreentime()`. Die Differenz-Farbe (grün/rot) berücksichtigt die Richtung pro Metrik (`richtung: 'mehr' | 'weniger'`) — bei Screentime bedeutet ein negativer Wert eine Verbesserung, bei den anderen 5 ein positiver. Bei `differenz === null` erscheint der neutrale "Noch nicht genug Daten"-Hinweis statt eines Vorzeichens.
- Neu: `src/components/checkin-historie.tsx` — Lade-Logik 1:1 nach dem Muster von `TrainingHistorie` (PROJ-50) kopiert: erste 5 Einträge beim Mount, "Ältere Einträge laden" holt in 10er-Schritten nach. Kennzahlen kommen im selben Response wie die erste Seite (Feld `kennzahlen`, nur bei `offset=0`).
- `src/components/analyse-historie-tabs.tsx`: `BaldVerfuegbarTab`-Platzhalter im "Check-Ins"-Tab durch `<CheckInHistorie />` ersetzt; da `BaldVerfuegbarTab` (und der zugehörige `ClipboardCheck`-Import) dadurch keinen Aufrufer mehr hatte, wurde er entfernt statt auskommentiert zu bleiben.
- Gast-Zugriff brauchte keinen neuen Code — `AnalyseHistorieTabs` wird in `src/app/analyse/page.tsx` bereits nur für eingeloggte Nutzer gerendert, identisch zum bestehenden Verhalten der Tabs "Mahlzeiten" und "Training".
- API-Vertrag für `/api/check-in/verlauf?limit=&offset=` (noch nicht gebaut) im Frontend bereits als TypeScript-Interface festgelegt: `{ checkIns: CheckInEntry[], hasMore: boolean, kennzahlen?: CheckInMetrikErgebnis[] }`.

**Bewusst nicht gebaut (braucht `/backend`):**
- Die eigentliche API-Route `/api/check-in/verlauf` existiert noch nicht — die Komponente ruft sie bereits aktiv auf, bekommt aktuell 404 und zeigt dadurch korrekt ihren Fehlerzustand ("Deine Check-Ins konnten nicht geladen werden."), darunter den Leer-Zustand. Verifiziert per Screenshot (Desktop + Mobile 375px) — beide Zustände greifen sauber ineinander, kein Absturz, kein horizontales Scrollen.
- Serverseitige Berechnung der 6 Kennzahlen (aktueller Wert, 30-Tage-Schnitt, Differenz, Datenschwelle) — vollständig in `/backend`.
- `npm run build`, `npm run lint`, `npm test` (481/481) fehlerfrei. Ein bestehender PROJ-42-Test ("Klick auf 'Check-Ins' zeigt 'Bald verfügbar'") wurde an die neue Realität angepasst (prüft jetzt, dass der Platzhalter-Text NICHT mehr erscheint) — eigene Abdeckung der neuen Funktionalität folgt in `/qa`.

## Implementation Notes (Backend)

**Keine Migration nötig** — die Route liest ausschließlich die bestehende `wochen_check_ins`-Tabelle aus PROJ-45 (RLS-Policy "Users see own wochen check-ins" existiert bereits und deckt den Lesezugriff vollständig ab; passender Index auf `(user_id, woche_start DESC)` ebenfalls schon vorhanden).

**Gebaut:**
- Neu: `GET /api/check-in/verlauf` (`src/app/api/check-in/verlauf/route.ts`) — Auth-Check (401 ohne Session), `limit`/`offset`-Pagination (Limit auf 50 gedeckelt, gleiches Muster wie `/api/training/verlauf`), `.eq('user_id', user.id)` als explizite Filterung zusätzlich zur RLS.
- `berechneKennzahlen()`: nur bei `offset=0` aufgerufen. "Aktueller Wert" kommt direkt aus dem ersten Eintrag der ohnehin bereits geladenen Liste (neueste-zuerst sortiert) — keine zusätzliche Abfrage nötig dafür. Für den 30-Tage-Schnitt läuft eine zweite, breitere Abfrage (`gte('woche_start', ...)`). Datenschwelle: mind. 2 Check-Ins im 30-Tage-Fenster, sonst `differenz: null`.
- Werte werden serverseitig gerundet, bevor sie zurückgehen: Punkte-Metriken auf 1 Nachkommastelle, Screentime (Minuten) auf ganze Zahlen — vermeidet hässliche Fließkomma-Reste im Frontend.
- Response bündelt Liste und Kennzahlen in einer Antwort bei `offset=0` (Feld `kennzahlen` nur dort vorhanden), identisch zur PROJ-50-Architektur.
- Integrationstest: `src/app/api/check-in/verlauf/route.test.ts` — 9 Tests (401, Happy Path inkl. Kennzahlen, kein Kennzahlen-Query bei `offset>0`, korrekte Differenz-Berechnung inkl. invertierter Screentime-Richtung, Rundung auf 1 Nachkommastelle, leere Liste ohne Fehler, 500 bei DB-Fehler, Limit-Deckelung, `hasMore`).
- `npm run build`, `npm run lint`, `npm test` (490/490) fehlerfrei. Live gegen die echte DB verifiziert (QA-Testkonto, Playwright): ein echter Wochen-Check-In über `/check-in` gespeichert → Check-Ins-Tab zeigt die Woche korrekt als "6. Sept. – 12. Sept." sowie alle 6 Kennzahlen mit dem richtigen aktuellen Wert (u. a. "0 Min" für Screentime, "5 / 10" für die Punkte-Slider) und korrekt "Noch nicht genug Daten" bei allen 6 Metriken, da nur 1 Check-In vorliegt (Datenschwelle von mind. 2 greift wie spezifiziert).

## QA Test Results

**Tested:** 2026-09-07
**Tested by:** QA Engineer (Claude)
**Test account:** `qa-test@endlichsatt.dev`

### Acceptance Criteria Status

**Check-In-Liste**
- [x] Sortiert absteigend nach Kalenderwoche, max. 5 initial — PASS
- [x] "Ältere Einträge laden" erscheint bei >5 Einträgen — PASS
- [x] Klick auf "Ältere Einträge laden" hängt an (ersetzt nicht) — PASS
- [x] Button verschwindet, wenn keine weiteren Einträge existieren — PASS
- [x] Eintrag zeigt ausschließlich die Kalenderwoche als Datumsspanne — PASS
- [x] Leer-Zustand bei noch nie ausgefülltem Check-In — PASS

**Analyse-Kennzahlen**
- [x] Zeigt alle 6 Metrik-Zeilen oberhalb der Liste — PASS
- [x] Zeigt aktuellen Wert des neuesten Check-Ins (Punkte als "X / 10") — PASS
- [x] Screentime als Std/Min formatiert, nicht als rohe Minutenzahl — PASS
- [x] Differenz zum 30-Tage-Schnitt korrekt berechnet, Richtung je Metrik korrekt (Screentime invertiert) — PASS
- [x] Neutraler Hinweis statt Differenz unterhalb der Datenschwelle (<2 Check-Ins/30 Tage) — PASS
- [x] Analyse-Sektion erscheint nicht bei null Check-Ins — PASS

**Gast-Zugriff**
- [x] Gast sieht Login-Hinweis-Karte statt Check-Ins-Tab-Inhalt — PASS

**Ergebnis: 13/13 Acceptance Criteria bestanden.**

### Security Audit (Red Team)
- **Authentifizierung:** `GET /api/check-in/verlauf` ohne Session → 401 (abgedeckt durch Vitest-Test).
- **Autorisierung:** Route filtert explizit über `.eq('user_id', user.id)` zusätzlich zur bestehenden RLS-Policy auf `wochen_check_ins` — kein Zugriff auf fremde Check-Ins möglich.
- **Datensparsamkeit (Response-Shape):** Gezielt geprüft, dass die Route ausschließlich `id`, `wocheStart` pro Listeneintrag sowie die 6 definierten Kennzahlen-Felder zurückgibt. Die Freitext-Felder des zugrunde liegenden `antworten`-JSONB-Blobs (Highlights, Lowlights, Ursache, "nächste Woche anders", Trainings-Begründung, Sonstiges) werden **nicht** an den Client ausgeliefert — bestätigt per Netzwerk-Inspektion der echten API-Antwort. Keine über die Spec hinausgehende Anforderung, aber ein sinnvoller Zusatz-Check angesichts des breiten zugrunde liegenden Datensatzes.
- **Rate Limiting:** Keine dedizierte Rate-Limitierung auf dieser Lese-Route — konsistent mit dem bestehenden Muster bei `/api/training/verlauf` (PROJ-50) und `/api/mahlzeiten/verlauf` (PROJ-6); kein neues Risiko gegenüber bereits akzeptiertem Bestandsverhalten.
- **Input-Validierung:** `limit`/`offset` werden serverseitig geparst und `limit` auf 50 gedeckelt — kein ungebremstes Auslesen möglich.
- Keine XSS-Angriffsfläche: keine Freitext-Nutzereingaben werden in dieser Ansicht gerendert (nur Datum und numerische Werte).

### Regressionstest
- `npm test` (Vitest): **490/490 bestanden**, keine Regressionen.
- `npm run test:e2e` — isolierter Lauf `tests/PROJ-51-checkin-tab-analyse.spec.ts`: **16/16 bestanden**.
- Regressionslauf `tests/PROJ-42-analyse-uebersichtsseite.spec.ts` + `tests/PROJ-45-wochen-check-in.spec.ts` (host-Seite bzw. Datenquelle dieses Features): **39/39 bestanden**, keine Regressionen — inkl. des angepassten PROJ-42-Tests, der jetzt korrekt prüft, dass der alte "Bald verfügbar"-Platzhalter im Check-Ins-Tab nicht mehr erscheint.
- `npm run build` und gezieltes `eslint` auf alle neuen/geänderten Dateien: fehlerfrei.
- Responsive Sichtprüfung (375px, 768px, 1440px) mit realistischen Mock-Daten (gemischte positive/negative/neutrale Differenzen über alle 6 Metriken): sauberes Layout, kein horizontales Scrollen, keine Überlappungen auf allen drei Breakpoints.
- Cross-Browser: Chromium getestet (Projekt-Standard, siehe bestehende Testsuite-Konfiguration); kein browserspezifischer Code in dieser Änderung (Standard-CSS/React), daher kein erhöhtes Risiko für Firefox/Safari.

### Bugs Found
Keine Bugs gefunden — weder Critical, High, Medium noch Low.

### Summary
- Acceptance Criteria: 13/13 PASS
- Bugs: 0
- Security: keine Findings, zusätzlicher Datensparsamkeits-Check bestätigt sauberes Response-Shape
- Regressionen: keine (490 Unit-/Integrationstests, 55 E2E-Tests über PROJ-42/45/51 hinweg)

**Production Ready: YES**

## Deployment
_To be added by /deploy_
