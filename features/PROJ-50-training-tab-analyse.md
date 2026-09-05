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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
