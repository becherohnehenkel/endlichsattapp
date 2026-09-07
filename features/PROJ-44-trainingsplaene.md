# PROJ-44: Trainingspläne (Detailseiten + Gewicht-Logging)

## Status: Deployed (Refinement: Numerische Felder beim Fitnessstudio-Plan "Architected")
**Created:** 2026-09-02
**Last Updated:** 2026-09-07

**Refinement (2026-09-07, Numerische Felder beim Fitnessstudio-Plan):** Bei der Umsetzung von PROJ-50 (Training-Kennzahlen auf der Analyse-Seite) hat sich gezeigt, dass die bisherigen Freitext-Felder für Wiederholungen/Gewicht eine zuverlässige Zahlen-Analyse erschweren (siehe PROJ-50 Decision Log, Freitext-Parsing als Übergangslösung). Nur Plan 3 (Fitnessstudio) wird auf echte numerische Eingabefelder umgestellt — Wiederholungen als ganze Zahl, Gewicht mit Nachkommastellen in 0,5er-Schritten (reale Hantelscheiben-Sprünge). Plan 1 bleibt unverändert (kein Gewichtsfeld). Plan 2 (Widerstandsbänder) bleibt bewusst Freitext, bekommt aber ein passenderes Label: "Gewicht" → "Widerstand", Platzhalter "z. B. 20 kg" → "z. B. Bandfarbe" (ein kg-Wert ergibt bei Bändern keinen Sinn).

## Dependencies
- PROJ-43 (Training-Übersicht) — die 3 Plan-Karten verlinken auf die hier gebauten Detailseiten
- PROJ-2 (User Authentication) — Persistenz nur für eingeloggte, nicht-anonyme Nutzer
- PROJ-19 (Gast-Modus) — bestimmt das zustandslose Verhalten für Gäste
- PROJ-42 (Analyse-Übersichtsseite) — der "Trainingseinheiten"-Tab wurde dort strukturell für genau diese Daten vorbereitet; die tatsächliche Anzeige dort ist ein späteres Refinement, nicht Teil dieser Spec

## User Stories
- Als Nutzer, der einen der drei Trainingspläne aus PROJ-43 gewählt hat, möchte ich alle Übungen mit Ausführungs-Erklärung sowie Satz-/Wiederholungs-/Pausen-Vorgaben auf einer Seite sehen, damit ich direkt trainieren kann.
- Als Nutzer möchte ich die vorausgefüllten Sätze/Wiederholungen/Pause/Gewicht-Werte anpassen können, falls ich mehr oder weniger als die Vorgabe gemacht habe.
- Als eingeloggter Nutzer möchte ich mein Training am Ende speichern können, damit ich beim nächsten Mal sehe, was ich zuletzt gemacht habe, und bewusst steigern kann.
- Als Gast möchte ich die Trainingspläne genauso nutzen können wie ein eingeloggter Nutzer, auch wenn meine Eingaben nicht gespeichert werden.
- Als Nutzer, der eine Übung nicht kennt, möchte ich eine kurze Ausführungs-Erklärung aufklappen können, ohne dass die Seite dadurch überladen wirkt.

## Out of Scope
- Anzeige der Trainings-Historie auf der Analyse-Übersicht (PROJ-42 "Trainingseinheiten"-Tab) — diese Spec liefert nur die Speicherung, die Anzeige dort folgt als eigenes Refinement.
- Eigene/individuelle Trainingspläne erstellen — es gibt nur die 3 festen Pläne aus PROJ-43.
- Zielgewicht-Empfehlungen pro Übung — der Nutzer trägt frei ein, was er tatsächlich genutzt hat, keine Vorschläge.
- ~~Validierung/Plausibilitätsprüfung der eingetragenen Werte — reine Freitextfelder, keine Bereichsprüfung (z. B. wird "200kg" bei Bizeps Curls nicht verhindert).~~ → **Refinement 2026-09-07:** gilt weiterhin für Plan 1/2 sowie die Pause bei allen Plänen (weiterhin Freitext ohne Bereichsprüfung). Bei Plan 3 (Fitnessstudio) erzwingen Wiederholungen/Gewicht jetzt einen gültigen Zahlenwert — aber weiterhin keine inhaltliche Plausibilitätsprüfung (z. B. wird "200 kg" bei Bizeps Curls weiterhin nicht verhindert, nur dass es überhaupt eine Zahl ist).
- Bearbeiten oder Löschen vergangener, bereits gespeicherter Trainingseinheiten — nur Anlegen neuer Einträge.
- Video- oder Bildanleitungen zu den Übungen — reiner Text, konsistent mit PROJ-43.
- Timer/Stoppuhr für die Pausenzeiten — reine Textanzeige der Pausenvorgabe, kein aktiver Countdown.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur & Routing
- [ ] Angenommen ein Nutzer klickt auf der Training-Übersicht (PROJ-43) auf eine der 3 Plan-Karten, wenn er das tut, dann landet er auf der zugehörigen Detailseite (`/training/zuhause-ohne-equipment`, `/training/zuhause-mit-baendern` bzw. `/training/fitnessstudio`)
- [ ] Angenommen eine Plan-Detailseite lädt, wenn sie angezeigt wird, dann zeigt sie den Plan-Namen als Überschrift, einen kurzen Intro-Satz, den Warm-Up-Hinweis und danach alle Übungen dieses Plans in der vorgegebenen Reihenfolge
- [ ] Angenommen eine Plan-Detailseite lädt, wenn der Breadcrumb angezeigt wird, dann zeigt er "Training / [Planname]" und führt beim Klick auf "Training" zurück zu `/training`

### Übungskarten
- [ ] Angenommen eine Übungskarte wird angezeigt, wenn sie lädt, dann zeigt sie den Übungsnamen und eine eingeklappte Ausführungs-Erklärung, die sich per Klick aufklappen lässt
- [ ] Angenommen eine Übungskarte wird angezeigt, wenn die Felder geladen werden, dann zeigt sie eine Zeile pro Satz (3 Zeilen bei allen 3 Plänen), jede Zeile mit Wiederholungen vorausgefüllt aus dem Plan-Schema (12 bei Plan 1 & 2, 10 bei Plan 3), sowie ein gemeinsames Pause-Feld mit "60 Sek."
- [x] ~~Angenommen Plan 2 oder Plan 3 wird angezeigt, wenn eine Übungskarte lädt, dann zeigt jede Satz-Zeile zusätzlich ein leeres Freitextfeld "Gewicht"~~ → **Refinement 2026-09-07:** Plan 2 zeigt weiterhin ein Freitextfeld, jetzt beschriftet "Widerstand" (Platzhalter "z. B. Bandfarbe"). Plan 3 zeigt ein numerisches Gewicht-Feld — siehe neue ACs unten.
- [ ] Angenommen Plan 1 wird angezeigt, wenn eine Übungskarte lädt, dann zeigen die Satz-Zeilen KEIN Gewicht-Feld

### Felder anpassen
- [x] ~~Angenommen ein Nutzer möchte von der Vorgabe abweichen, wenn er ein Sätze-/Wiederholungs-/Pause-/Gewicht-Feld bearbeitet, dann wird die Eingabe direkt im Feld übernommen (Freitext, keine Formatvorgabe)~~ → **Refinement 2026-09-07:** gilt weiterhin für Pause (alle Pläne), Wiederholungen bei Plan 1 & 2, und Widerstand bei Plan 2. Bei Plan 3 sind Wiederholungen und Gewicht jetzt numerisch — siehe neue ACs unten.

### Numerische Felder beim Fitnessstudio-Plan (Refinement 2026-09-07)
- [ ] Angenommen Plan 3 (Fitnessstudio) wird angezeigt, wenn eine Satz-Zeile lädt, dann ist das Wiederholungen-Feld ein numerisches Eingabefeld, das nur ganze Zahlen akzeptiert
- [ ] Angenommen Plan 3 wird angezeigt, wenn eine Satz-Zeile lädt, dann ist das Gewicht-Feld ein numerisches Eingabefeld, das Nachkommastellen in 0,5er-Schritten akzeptiert
- [ ] Angenommen ein Nutzer versucht, bei Plan 3 einen nicht-numerischen Wert einzutragen, dann verhindert das Eingabefeld dies (native Zahlen-Eingabe, kein Freitext möglich)
- [ ] Angenommen "Training abschließen" wird mit Werten außerhalb des erlaubten Formats aufgerufen (z. B. durch einen direkten API-Aufruf ohne UI), dann lehnt der Server die Anfrage mit einem Validierungsfehler ab
- [ ] Angenommen Plan 2 (Widerstandsbänder) wird angezeigt, wenn eine Satz-Zeile lädt, dann heißt das Feld "Widerstand" mit Platzhalter "z. B. Bandfarbe" statt "Gewicht"/"z. B. 20 kg"

### Speichern (eingeloggte Nutzer)
- [ ] Angenommen ein eingeloggter, nicht-anonymer Nutzer hat die Felder ausgefüllt (oder auf den Vorgaben belassen), wenn er auf "Training abschließen" klickt, dann werden alle Übungswerte dieser Seite als ein neuer, datierter Verlaufs-Eintrag gespeichert
- [ ] Angenommen ein eingeloggter Nutzer hat diesen Plan bereits mindestens einmal gespeichert, wenn er die Plan-Seite erneut öffnet, dann sind die Felder mit den zuletzt gespeicherten Werten vorausgefüllt (nicht mit dem Plan-Standardschema)
- [ ] Angenommen ein eingeloggter Nutzer öffnet einen Plan zum ersten Mal (noch nie gespeichert), wenn die Seite lädt, dann sind die Felder mit dem Plan-Standardschema vorausgefüllt
- [ ] Angenommen der Speichervorgang schlägt fehl (z. B. Netzwerkfehler), wenn der Nutzer auf "Training abschließen" klickt, dann erscheint eine Fehlermeldung und die eingegebenen Werte bleiben in den Feldern erhalten

### Gast-Verhalten
- [ ] Angenommen ein Gast (kein Login) besucht eine Plan-Detailseite, wenn die Seite lädt, dann kann er alle Felder genauso ausfüllen wie ein eingeloggter Nutzer, aber es erscheint ein Hinweis, dass die Eingaben beim Verlassen/Neuladen der Seite verloren gehen (kein "Training abschließen"-Button, stattdessen ein Link zum Konto)
- [ ] Angenommen ein Gast lädt die Seite neu oder verlässt sie, wenn er zurückkehrt, dann sind alle Felder wieder auf das Plan-Standardschema zurückgesetzt (keine Zwischenspeicherung, auch nicht im Browser)

## Edge Cases
- Nutzer trägt keinen Wert in ein Feld ein und speichert trotzdem: leere Felder werden als leer gespeichert, keine Pflichtfelder.
- Nutzer speichert denselben Plan mehrmals am selben Tag: jeder Klick auf "Training abschließen" erzeugt einen eigenen, separat datierten (mit Uhrzeit) Verlaufs-Eintrag — keine Zusammenführung.
- Anonyme Session (technische Supabase-Anon-Session ohne echtes Konto): zählt wie Gast, keine Persistenz — konsistent mit dem Muster aus PROJ-37/PROJ-42 (`user.is_anonymous`).
- Sehr lange Freitext-Eingabe in einem Feld (z. B. Gewicht "100kg + 2x rot Band"): wird übernommen bis 50 Zeichen pro Feld (serverseitiges Limit, siehe QA BUG-1 — bewusst als Missbrauchsschutz ergänzt, für reale Eingaben großzügig genug).
- Nutzer navigiert weg, ohne zu speichern (eingeloggt): Eingaben gehen verloren, kein "ungespeicherte Änderungen"-Warndialog im MVP.

## Technical Requirements (optional)
- Neue Datenbank-Tabelle für Trainings-Einheiten (ein Eintrag pro "Training abschließen"-Klick: Plan-Referenz, Nutzer, Zeitstempel, Werte pro Übung) — genaue Struktur bei `/architecture`
- Neue API-Route(n) zum Speichern sowie zum Abrufen des zuletzt gespeicherten Stands pro Plan — Details bei `/architecture`
- RLS: Nutzer sehen/speichern ausschließlich eigene Trainings-Einheiten

## Content: Finaler Wortlaut

### Plan 1 — Zu Hause ohne Equipment
**Intro:** "Bodyweight-Training für zu Hause — sechs Übungen, die du ohne jegliches Equipment machen kannst."
**Warm-Up-Hinweis:** "5–10 Minuten: Hampelmann, Highknees oder eine Runde um den Block gehen."
**Schema (Startwert aller Übungen):** 3 Sätze × 12 Wiederholungen, 60 Sek. Pause. Keine Gewicht-Felder.

| # | Übung | Ausführungs-Erklärung |
|---|-------|------------------------|
| 1 | Kniebeuge | Füße schulterbreit, Zehen leicht nach außen. Gesäß nach hinten schieben, als würdest du dich auf einen Stuhl setzen. Knie zeigen in Zehenrichtung, Rücken bleibt gerade. Runter bis Oberschenkel etwa parallel zum Boden, dann hochdrücken. |
| 2 | Glute Bridge | Rückenlage, Knie angewinkelt, Füße hüftbreit aufgestellt. Po anspannen und Becken nach oben heben, bis Schultern-Knie eine Linie bilden. Kurz halten, dann kontrolliert absenken. |
| 3 | Ausfallschritte abwechselnd | Großer Schritt nach vorne, hinteres Knie sinkt Richtung Boden ab, vorderes Knie bleibt über dem Fuß. Oberkörper aufrecht. Zurück in den Stand drücken, Seite wechseln. |
| 4 | Liegestütz (ggf. kniend) | Hände etwas breiter als schulterbreit, Körper bildet eine gerade Linie von Kopf bis Fersen (oder Knien bei der erleichterten Variante). Brust Richtung Boden senken, Ellbogen nah am Körper, dann hochdrücken. |
| 5 | Superman Pose | Bauchlage, Arme nach vorne gestreckt. Arme und Beine gleichzeitig leicht vom Boden abheben, Rücken anspannen. Kurz halten, dann sanft ablegen. |
| 6 | Beinheben | Rückenlage, Beine gestreckt. Unteren Rücken in den Boden drücken, Beine gemeinsam kontrolliert nach oben heben, dann langsam wieder absenken, ohne den Boden zu berühren. |

### Plan 2 — Zu Hause mit Widerstandsbändern
**Intro:** "Trainiere zu Hause mit einem einfachen Widerstandsband — mehr Spannung als bei reinem Bodyweight, ohne großes Equipment."
**Warm-Up-Hinweis:** "5–10 Minuten: Hampelmann, Highknees oder eine Runde um den Block gehen."
**Schema (Startwert aller Übungen):** 3 Sätze × 12 Wiederholungen, 60 Sek. Pause. Zusätzliches Freitextfeld pro Satz-Zeile — **Refinement 2026-09-07:** Label "Widerstand" statt "Gewicht", Platzhalter "z. B. Bandfarbe" statt "z. B. 20 kg".

| # | Übung | Ausführungs-Erklärung |
|---|-------|------------------------|
| 1 | Kreuzheben | Auf die Mitte des Bandes stellen, Enden mit beiden Händen greifen. Hüfte nach hinten schieben, Rücken gerade, Band an den Beinen entlang nach unten führen, dann Hüfte nach vorne strecken und aufrichten. |
| 2 | Rudern vorgebeugt | Band unter den Füßen fixieren, leicht in der Hüfte vorbeugen, Rücken gerade. Ellbogen nah am Körper nach hinten ziehen, Schulterblätter zusammenziehen, dann kontrolliert zurückführen. |
| 3 | Kniebeugen | Band unter den Füßen fixieren, Enden auf Schulterhöhe halten. Wie eine normale Kniebeuge absenken — der Widerstand des Bandes nimmt beim Hochdrücken zu. |
| 4 | Schulterdrücken | Band unter den Füßen fixieren, Enden auf Schulterhöhe. Arme nach oben strecken, bis sie fast durchgestreckt sind, dann kontrolliert zurückführen. |
| 5 | Seitenheben | Auf das Band stellen, Enden in beiden Händen. Arme seitlich bis auf Schulterhöhe anheben, Ellbogen leicht gebeugt, dann langsam absenken. |
| 6 | Bizeps Curls | Auf das Band stellen, Handflächen zeigen nach vorne. Unterarme beugen, Ellbogen bleiben am Körper, dann kontrolliert wieder strecken. |
| 7 | Trizeps drücken | Band über einen erhöhten Punkt hängen oder mit einer Hand über der Schulter fixieren. Arm nach unten/hinten strecken, dann kontrolliert zurückführen. |
| 8 | Armkreisen | Arme seitlich auf Schulterhöhe ausstrecken, kleine, kontrollierte Kreise vorwärts und rückwärts — reine Mobilisationsübung, kein Widerstand nötig. |

### Plan 3 — Fitnessstudio
**Intro:** "Der klassische Fitnessstudio-Plan mit Lang- und Kurzhanteln sowie Kabelzug."
**Warm-Up-Hinweis:** "5–10 Minuten am Rad-/Ruderergometer, Fahrrad oder Laufband."
**Schema (Startwert aller Übungen):** 3 Sätze × 10 Wiederholungen, 60 Sek. Pause. Zusätzliches Gewicht-Feld pro Satz-Zeile — **Refinement 2026-09-07:** jetzt numerisch statt Freitext (Wiederholungen: ganze Zahl; Gewicht: Nachkommastellen in 0,5er-Schritten).

| # | Übung | Ausführungs-Erklärung |
|---|-------|------------------------|
| 1 | Kniebeuge mit Langhantel | Stange auf dem oberen Rücken (nicht im Nacken), Füße schulterbreit. Wie eine normale Kniebeuge absenken, Rücken bleibt gerade, Knie in Zehenrichtung, dann hochdrücken. |
| 2 | Vorgebeugtes Rudern mit Langhantel | Hüfte nach hinten schieben, Oberkörper etwa 45° vorgebeugt, Rücken gerade. Stange zum unteren Bauch ziehen, Ellbogen nah am Körper, dann kontrolliert absenken. |
| 3 | Schulterdrücken mit Langhantel | Stange auf Schulterhöhe, Griff etwas breiter als schulterbreit. Nach oben drücken, bis Arme fast durchgestreckt sind, dann kontrolliert zur Schulter zurückführen. |
| 4 | Bankdrücken mit Kurzhantel | Rückenlage auf der Bank, Hanteln auf Brusthöhe. Nach oben drücken, bis Arme fast durchgestreckt sind, dann kontrolliert wieder absenken. |
| 5 | Latziehen am Kabelzug | Griff etwas breiter als schulterbreit fassen, aufrecht sitzen. Stange Richtung obere Brust ziehen, Schulterblätter zusammenziehen, dann kontrolliert nach oben zurückführen. |
| 6 | Trizepsdrücken am Kabelzug | Griff am oberen Kabelzug fassen, Ellbogen bleiben am Körper. Nach unten drücken, bis Arme durchgestreckt sind, dann kontrolliert zurückführen. |
| 7 | Bizeps Curls am Kabelzug | Griff am unteren Kabelzug fassen, Ellbogen bleiben am Körper. Unterarme nach oben beugen, dann kontrolliert wieder strecken. |

## Open Questions
- [x] Exaktes Datenmodell (z. B. eine Zeile pro Übung vs. ein Datensatz pro Trainingseinheit mit den Übungswerten gebündelt) — wird bei `/architecture` entschieden → Ein Datensatz pro Trainingseinheit, Übungswerte als JSONB-Blob gebündelt (siehe Technical Decisions unten), entschieden bei `/architecture` (2026-09-02)
- [x] Wie die gespeicherten Trainingseinheiten später im "Trainingseinheiten"-Tab der Analyse-Übersicht (PROJ-42) dargestellt werden — eigenes, späteres Refinement, nicht Teil dieser Spec → Umgesetzt in PROJ-50 (Training-Tab, Analyse-Seite), deployed 2026-09-07
- [x] Sollen bestehende, bereits gespeicherte Fitnessstudio-Einheiten mit alten Freitext-Werten (z. B. "10-12") nachträglich bereinigt werden, oder bleiben sie unverändert als historische Freitext-Daten stehen? → Keine Migration, bleiben unverändert stehen (entschieden bei `/architecture`, 2026-09-07 — siehe Technical Decisions)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Sätze/Wiederholungen/Pause sind Freitext, vorausgefüllt mit dem Plan-Schema (3x12 bei Plan 1 & 2, 3x10 bei Plan 3), aber pro Übung unabhängig editierbar | Startwert erleichtert die Nutzung, freie Anpassung deckt reale Abweichungen ab, ohne Formatzwang | 2026-09-02 |
| Gewicht/Widerstand-Feld nur bei Plan 2 und 3, Plan 1 (reines Bodyweight) hat kein solches Feld | Plan 1 hat kein Gewicht/Widerstand-Konzept — ein leeres/optionales Feld dort wäre verwirrend, klare strukturelle Trennung stattdessen | 2026-09-02 |
| Kein Zielgewicht/keine Empfehlung pro Übung, nur ein freies Eingabefeld | Vermeidet Content-Aufwand und impliziten Trainer-Rat — der Nutzer trägt ein, was er tatsächlich genutzt hat | 2026-09-02 |
| "Training abschließen" als expliziter Button, der einen neuen Verlaufs-Eintrag anlegt (kein Auto-Save mit Überschreiben) | Baut echten Trainings-Verlauf auf, passt zum später geplanten "Trainingseinheiten"-Tab in PROJ-42 | 2026-09-02 |
| Bei Rückkehr zeigt die Seite die zuletzt gespeicherten Werte, nicht das Plan-Standardschema | Unterstützt progressive Steigerung direkt im Sinne von PROJ-43 "Richtig steigern" | 2026-09-02 |
| Gäste nutzen alle Felder wie eingeloggte Nutzer, aber ganz ohne Persistenz (kein Button, kein Zwischenspeicher, auch nicht lokal) | Konsistent mit dem bereits in PROJ-42/PROJ-43 etablierten Gast-Modus-Muster | 2026-09-02 |
| Übungs-Ausführungs-Erklärungen von Claude entworfen (generische, weit verbreitete Form-Hinweise, keine Trainer-Zertifizierung), vom Nutzer vor Freigabe geprüft und bestätigt | Sicherheitsrelevanter Content — Nutzer wollte selbst prüfen statt blind zu übernehmen | 2026-09-02 |
| Bewusste Ausnahme vom PRD-Non-Goal "Kein Sport-/Workout-Tracking": echtes, dauerhaftes Logging für eingeloggte Nutzer, zustandslos für Gäste | Bereits in PROJ-43 als Kontext-Entscheidung festgehalten — Nutzerwunsch, verbunden mit dem "Trainingseinheiten"-Tab aus PROJ-42 | 2026-09-02 |
| **Refinement 2026-09-02 (vor `/backend`):** Statt eines einzelnen "Sätze"-Zählfelds zeigt jede Übungskarte eine Zeile pro Satz (3 Zeilen), jede mit eigenem Wiederholungen- (und bei Plan 2/3 Gewicht-)Feld; Pause bleibt ein gemeinsames Feld. Das Feld-Label "Gewicht/Widerstand" wurde zu "Gewicht" gekürzt | Nutzerwunsch: realistischeres Logging, da sich Wiederholungen/Gewicht zwischen den Sätzen einer Übung typischerweise unterscheiden (Ermüdung); kürzeres Label ist eindeutig genug und passt besser in die schmalen Felder auf Mobile | 2026-09-02 |
| **Refinement 2026-09-07:** Numerische Wiederholungen-/Gewicht-Felder nur bei Plan 3 (Fitnessstudio), Plan 1 & 2 bleiben unverändert | Ursprünglicher Nutzerhinweis bezog sich explizit aufs "Gymtraining"; PROJ-50s Kennzahlen-Berechnung nutzt ohnehin ausschließlich Fitnessstudio-Daten — Plan 2 (Bänder) hat keine echten kg-Werte, eine Umstellung dort brächte keinen Nutzen | 2026-09-07 |
| **Refinement 2026-09-07:** Gewicht bei Plan 3 erlaubt Nachkommastellen in 0,5er-Schritten, Wiederholungen bleibt ganzzahlig | Reale Hantelscheiben-Sprünge sind oft 1,25 kg pro Seite (= 2,5 kg gesamt) bzw. 0,5-kg-Schritte bei kleineren Gewichten — eine reine Ganzzahl-Vorgabe hätte gängige, reale Trainingsgewichte wie "62,5 kg" verhindert | 2026-09-07 |
| **Refinement 2026-09-07:** Plan 2 (Widerstandsbänder) bleibt Freitext, Label wechselt von "Gewicht" zu "Widerstand", Platzhalter von "z. B. 20 kg" zu "z. B. Bandfarbe" | Ein kg-Wert ergibt bei einem Widerstandsband keinen fachlich sinnvollen Sinn — das alte Label/Placeholder suggerierte fälschlich eine Gewichtsangabe | 2026-09-07 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine dynamische Route `/training/[plan]` statt 3 einzelner Seiten | Abweichung vom Ernährung-Guide-Muster (dort inhaltlich/interaktiv unterschiedlich) — hier sind alle 3 Pläne strukturell identisch (gleiche Übungskarten-Logik, gleiche Felder), nur Übungsliste und Gewicht-Feld-Sichtbarkeit unterscheiden sich. Eine gemeinsame Seite mit Plan-Daten spart dreifachen Code | 2026-09-02 |
| Neue Tabelle "Trainingseinheiten": ein Datensatz pro "Training abschließen"-Klick, Übungswerte aller Übungen dieses Trainings in einem Datensatz gebündelt (nicht eine Zeile pro Übung) | Übungsliste ist pro Plan fest vorgegeben, nie nutzerdefiniert — nie ein Bedarf, einzelne Übungen unabhängig abzufragen; gebündelt ist einfacher zu schreiben/lesen | 2026-09-02 |
| Neue API-Route nur zum Speichern (POST, "Training abschließen") | Das Lesen des zuletzt gespeicherten Stands passiert direkt in der Seite selbst (Server-Component-Query), wie bei der Analyse-Übersicht (PROJ-42) — keine eigene Lese-Route nötig | 2026-09-02 |
| Übungstexte und Plan-Schema (Sätze/Wdh/Pause-Startwerte) bleiben statischer Code-Content, nicht in der Datenbank | Ändern sich nicht pro Nutzer, gleiches Muster wie bei den Ernährung-Guides und PROJ-43 | 2026-09-02 |
| Neuer gemeinsamer `TrainingSubHeader` für die Breadcrumb-Navigation | Analog zu den bestehenden `AnalyseSubHeader`/`ErnaehrungSubHeader`, konsistentes Navigationsmuster | 2026-09-02 |
| Keine neuen npm-Pakete | Alles läuft über bereits installierte shadcn/ui-Komponenten und bestehende Projekt-Muster | 2026-09-02 |
| **Refinement 2026-09-07:** Validierung auf zwei Ebenen — native HTML5-Zahlen-Eingabe im Browser + serverseitige, plan-abhängige Zod-Prüfung nur für Plan 3 | Browser-Validierung allein reicht laut Projekt-Sicherheitsregel nicht (umgehbar via direktem API-Aufruf); Plan 1/2 bleiben bewusst unvalidierter Freitext | 2026-09-07 |
| **Refinement 2026-09-07:** Keine Datenbank-Migration, keine rückwirkende Bereinigung alter Fitnessstudio-Freitext-Werte | Trainingseinheiten sind laut Ursprungs-Entscheidung unveränderlich (kein Edit/Delete); PROJ-50s Kennzahlen-Berechnung liest alte Text-Werte bereits robust (führende Zahl) — löst die offene Frage aus der Spec | 2026-09-07 |
| **Refinement 2026-09-07:** `parseLeadingNumber()` in PROJ-50s `/api/training/verlauf`-Route muss um den Fall "Wert ist bereits eine Zahl" ergänzt werden (aktuell wird alles außer Strings als 0 behandelt) | Ohne diese Anpassung würden neu gespeicherte, echte Zahlen-Werte fälschlich als 0 in die Kennzahlen einfließen — vor dem Fitnessstudio-Feld-Umbau zwingend mitzuziehen, sonst zeigt die Analyse-Seite falsche Werte | 2026-09-07 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

```
/training/[plan] (eine dynamische Route für alle 3 Pläne)
├── TrainingSubHeader (neu, analog zu AnalyseSubHeader/ErnaehrungSubHeader)
│   └── Breadcrumb "Training / [Planname]"
├── H1 (Planname) + Intro-Satz
├── Warm-Up-Hinweis (Text)
├── Übungsliste
│   └── Übungskarte (je Übung)
│       ├── Name + einklappbare Ausführungs-Erklärung
│       ├── Freitextfeld: Pause (ein gemeinsamer Wert)
│       └── eine Zeile pro Satz: Wiederholungen + Gewicht (nur Plan 2 & 3)
├── Gäste: Hinweis-Karte "Eingaben gehen verloren" + Link zum Konto
└── Eingeloggt: "Training abschließen"-Button
```

### B) Datenmodell (in Worten)

**Eine neue Tabelle "Trainingseinheiten":** Jede Zeile ist EIN abgeschlossenes Training.
- Wer (Nutzer)
- Welcher Plan (zuhause-ohne-equipment / zuhause-mit-baendern / fitnessstudio)
- Wann (Zeitstempel)
- Die eingetragenen Werte aller Übungen dieses Trainings, gebündelt in einem Datensatz

Beim Öffnen einer Plan-Seite wird für eingeloggte Nutzer der neueste Eintrag für diesen Plan gelesen und als Vorausfüllung genutzt. Gäste lösen gar keine Datenbank-Abfrage aus.

### C) Tech-Entscheidungen (Begründung)

1. **Eine dynamische Route statt 3 einzelner Seiten** — alle 3 Pläne sind strukturell identisch, eine gemeinsame Seite mit Plan-Daten spart dreifachen Code.
2. **Ein Datensatz pro Trainingseinheit, Übungswerte gebündelt** — einfacher zu schreiben/lesen, da nie einzelne Übungen unabhängig abgefragt werden.
3. **Neue API-Route nur zum Speichern** — das Lesen passiert direkt in der Seite selbst, wie bei der Analyse-Übersicht.
4. **Übungstexte und Plan-Schema bleiben statischer Code-Content**, nicht in der Datenbank.
5. **Neuer gemeinsamer `TrainingSubHeader`** für die Breadcrumb-Navigation.

### D) Abhängigkeiten (Pakete)
Keine neuen Pakete.

## Tech Design — Refinement: Numerische Felder beim Fitnessstudio-Plan (2026-09-07)

### A) Komponenten-Struktur (Visuell)

```
Übungskarte (bestehend, pro Übung)
├── Pause-Feld (unverändert, Freitext, alle Pläne)
└── Satz-Zeilen (3 pro Übung)
    ├── Wiederholungen-Feld
    │     ├── Plan 1 & 2: Freitext (unverändert)
    │     └── Plan 3: Zahlen-Feld, nur ganze Zahlen
    └── Zusatzfeld
          ├── Plan 1: kein Feld (unverändert)
          ├── Plan 2: Freitext, Label "Widerstand", Platzhalter "z. B. Bandfarbe"
          └── Plan 3: Zahlen-Feld, Label "Gewicht", halbe Schritte erlaubt (z. B. 62,5)
```

Rein visuell ändert sich wenig — dieselbe Zeilen-/Spalten-Struktur bleibt, nur der Feld-Typ und die Beschriftung unterscheiden sich jetzt zusätzlich zwischen Plan 2 und Plan 3 (bisher galt für beide dieselbe Regel).

### B) Datenmodell (in Worten)

Kein neues Datenbankschema und keine Migration. Die bestehende Tabelle "Trainingseinheiten" speichert die Übungswerte weiterhin im selben Feld wie bisher — bei Plan 3 künftig als echte Zahl statt als Text, bei Plan 1/2 unverändert als Text.

**Bereits gespeicherte, alte Fitnessstudio-Einträge** (z. B. "10-12" als Text) bleiben unverändert in der Datenbank stehen — keine rückwirkende Bereinigung. Grund: Trainingseinheiten sind laut Ursprungs-Spec bewusst unveränderlich (kein Bearbeiten/Löschen vergangener Einträge), und die Analyse-Kennzahlen (PROJ-50) lesen solche alten Text-Werte ohnehin bereits robust (sie ziehen sich die erste enthaltene Zahl heraus). Damit ist die offene Frage aus der Spec entschieden: **keine Migration, alte Einträge bleiben wie sie sind.**

Die Plan-Konfiguration (bereits als fester Code-Inhalt vorhanden, nicht in der Datenbank) bekommt zwei zusätzliche Angaben pro Plan: welchen Feld-Typ Wiederholungen und das Zusatzfeld jeweils haben sollen, plus den passenden Anzeige-Text (Label/Platzhalter) für das Zusatzfeld.

### C) Tech-Entscheidungen (Begründung für PM)

1. **Validierung auf zwei Ebenen** — im Browser (verhindert ungültige Zeichen sofort beim Tippen, gute Nutzererfahrung) UND zusätzlich auf dem Server (Pflicht laut Projekt-Sicherheitsregeln, da sich eine reine Browser-Prüfung umgehen lässt, z. B. durch einen direkten Aufruf der Speicher-Funktion ohne die App zu benutzen). Nur beim Fitnessstudio-Plan wird serverseitig auf eine echte Zahl geprüft — bei den anderen beiden Plänen bleibt es wie bisher unvalidierter Freitext.
2. **Keine Datenbank-Änderung nötig** — die Umstellung ist rein eine Frage, WELCHE Werte künftig gespeichert werden (Zahl statt Text), nicht WO oder WIE.
3. **Bestehende Analyse-Logik (PROJ-50) muss um einen Fall ergänzt werden**: sie erwartet aktuell ausschließlich Text-Werte und würde neue, echte Zahlen-Werte fälschlich als "0" behandeln. Das muss beim Umsetzen mitgezogen werden, sonst zeigt die Analyse-Seite nach diesem Refinement falsche (zu niedrige) Werte für neu gespeicherte Fitnessstudio-Einheiten.
4. **Keine rückwirkende Datenbereinigung** — konsistent mit der bestehenden Regel, dass Trainingseinheiten nach dem Speichern unveränderlich sind.

### D) Abhängigkeiten (Pakete)
Keine neuen Pakete — native HTML5-Zahlen-Eingabefelder und die bereits verwendete Zod-Validierungs-Bibliothek reichen aus.

## Implementation Notes (Frontend)

**Gebaut:**
- Statischer Plan-/Übungs-Content in `src/lib/trainingsplaene.ts` — 3 Pläne, 21 Übungen mit Ausführungs-Erklärung, Plan-Schema (Sätze/Wdh/Pause-Startwerte), `zeigtGewichtsfeld` pro Plan (Plan 1 = `false`).
- Neuer gemeinsamer `TrainingSubHeader` (`src/components/training-sub-header.tsx`), analog zu `AnalyseSubHeader`/`ErnaehrungSubHeader`.
- `src/components/trainingsplan-detail.tsx`: H1 + Intro, Warm-Up-Hinweis, Übungskarten mit Name, einklappbarer Ausführung (Collapsible), einem gemeinsamen Pause-Feld sowie einer Zeile pro Satz (Wiederholungen + Gewicht bei Plan 2/3), vorausgefüllt mit dem Plan-Schema (Refinement 2026-09-02, siehe Decision Log).
- Neue dynamische Route `src/app/training/[plan]/page.tsx` — löst den Slug gegen `findTrainingsplan()` auf, `notFound()` bei ungültigem Slug (verifiziert: zeigt die Next.js-404-Seite).
- Verifiziert per Playwright-Screenshot-Skript: Plan 1 (keine Gewicht-Spalte), Plan 3 auf Mobile 375px (3 Satz-Zeilen mit Wiederholungen + Gewicht, kein horizontales Scrollen), Ausführung-Aufklappen, Feld-Bearbeitung, End-to-End-Navigation Hub → Plan-Detailseite → Breadcrumb zurück zum Hub.
- `tests/PROJ-43-training-uebersicht.spec.ts`: Testname einer Assertion aktualisiert ("noch nicht gebaute" → "richtige" Detailrouten, da die Routen jetzt existieren) — Suite weiterhin 16/16 grün.

**Bewusst nicht gebaut (braucht `/backend`):**
- Persistenz vollständig ausständig — die Felder sind aktuell reiner lokaler Component-State (immer das Plan-Schema als Startwert), nichts wird gespeichert oder gelesen.
- Kein "Training abschließen"-Button — würde eine Speicher-API voraussetzen, die noch nicht existiert (fehlende Tabelle "Trainingseinheiten"). Analog zum Vorgehen bei PROJ-42s "Mahlzeiten pro Tag"-Einstellung wird die komplette Speicher-UI (Button + API-Anbindung) gebündelt in `/backend` gebaut, statt jetzt einen nicht-funktionalen Button auszuliefern.
- Kein Gast-Hinweis-Banner ("Eingaben gehen verloren") — ohne echte Persistenz gibt es aktuell keinen Unterschied zwischen Gast und eingeloggtem Nutzer; der Hinweis ergibt erst Sinn, sobald eingeloggte Nutzer tatsächlich speichern können. Kommt zusammen mit dem Speichern in `/backend`.
- Vorausfüllung mit dem zuletzt gespeicherten Stand — setzt die Speicherung voraus, folgt in `/backend`.
- `npm run build`, `npm run lint`, `npm test` (423/423) fehlerfrei.

## Implementation Notes (Backend)

**Migration (vom Nutzer manuell im Supabase SQL Editor auszuführen, MCP-Zugriff diese Session getrennt):**
```sql
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_slug TEXT NOT NULL,
  uebungen JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own training sessions" ON training_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own training sessions" ON training_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_training_sessions_user_plan ON training_sessions(user_id, plan_slug, created_at DESC);
```
Keine UPDATE/DELETE-Policy — laut Spec werden vergangene Einträge nie bearbeitet oder gelöscht, nur neue angelegt (siehe Out of Scope). `uebungen` ist ein JSONB-Blob, gebündelt pro Übung (`{ [uebungId]: { pause, saetze: [{wiederholungen, gewicht}, ...] } }`), da die Übungsliste pro Plan fest vorgegeben ist (siehe Architektur-Entscheidung).

**Gebaut:**
- Neu: `POST /api/training/[plan]` (`src/app/api/training/[plan]/route.ts`) — 404 bei unbekanntem Plan-Slug, Auth-Check (401 ohne Session, 403 für anonyme Gast-Sessions), Zod-Validierung (Freitextfelder auf 50 Zeichen begrenzt, max. 20 Sätze — reine Struktur-/Längenprüfung, keine Wertebereichs-Validierung laut Spec), zusätzliche Prüfung, dass nur bekannte Übungs-IDs des jeweiligen Plans eingereicht werden. Schreiben über den Service-Role-Client mit explizitem `user_id` — identisches Muster zu `/api/kcal-rechner` und `/api/mahlzeiten-ziel`.
- `src/app/training/[plan]/page.tsx` liest jetzt den zuletzt gespeicherten Stand direkt per Supabase-Query (kein eigener Lese-Endpoint, wie in der Architektur festgelegt) — Fehler (z. B. Tabelle existiert noch nicht) werden bewusst ignoriert, die Seite fällt dann auf die Plan-Standardwerte zurück statt zu crashen.
- `src/components/trainingsplan-detail.tsx`: Feld-State liegt jetzt in der Elternkomponente (kontrollierte `UebungsKarte`n statt eigenem lokalem State), damit "Training abschließen" auf alle Werte zugreifen kann. Button ruft `POST /api/training/[plan]` auf, zeigt Erfolgs-/Fehlermeldung, Werte bleiben bei Fehler erhalten.
- Gast-Hinweis (`LoginHinweis`, `reason=training`) ersetzt den Button für Gäste — neuer `reason === 'training'`-Fall in `gast-konto-view.tsx`.
- `AnalyseLoginHinweis` in `LoginHinweis` umbenannt (`src/components/login-hinweis.tsx`) und `/analyse`-Seite entsprechend angepasst, da die Komponente jetzt von PROJ-42 UND PROJ-44 genutzt wird — analog zur `HubCard`-Auslagerung in PROJ-43.
- `src/types/database.ts`: `training_sessions`-Tabelle (Row/Insert/Update) ergänzt.
- Integrationstest: `src/app/api/training/[plan]/route.test.ts` — 404 (unbekannter Plan) / 401 / 403 / 400 (fehlerhafter Body, unbekannte Übungs-ID) / 500 / Erfolgsfall, 7 neue Tests.
- `npm run build`, `npm run lint`, `npm test` (430/430) fehlerfrei. Live verifiziert (noch vor Migration): Gast sieht Login-Hinweis statt Button, eingeloggter Nutzer sieht den Button, Klick zeigt aktuell erwartungsgemäß "Speichern fehlgeschlagen" (Tabelle fehlt noch), Fehlerbehandlung funktioniert sauber (Werte bleiben erhalten, Button bleibt nutzbar).
- **Migration ausgeführt und live verifiziert** (2026-09-02, temporäres Playwright-Skript, nicht committed — offizielle E2E-Abdeckung folgt in `/qa`): Satz-1-Wiederholungen bei "Kniebeuge" auf einen Testwert gesetzt → "Training abschließen" → "Training gespeichert ✓" → Reload lädt den Wert korrekt aus der echten DB zurück (Vorausfüllung mit dem zuletzt gespeicherten Stand bestätigt) → zurückgesetzt auf den Plan-Standardwert und erneut gespeichert (QA-Testkonto sauber hinterlassen).

## QA Test Results

**Tested:** 2026-09-02
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Seitenstruktur & Routing
- [x] Plan-Karte auf der Übersicht (PROJ-43) navigiert zur richtigen Detailseite
- [x] Detailseite zeigt Planname als Überschrift, Intro, Warm-Up-Hinweis, alle Übungen in korrekter Reihenfolge
- [x] Breadcrumb "Training / [Planname]" sichtbar, führt zurück zu `/training`
- [x] Ungültiger Plan-Slug zeigt die Next.js-404-Seite

#### Übungskarten
- [x] Name + eingeklappte Ausführungs-Erklärung, per Klick aufklappbar
- [x] 3 Satz-Zeilen mit Wiederholungen vorausgefüllt aus dem Plan-Schema (12 bei Plan 1/2, 10 bei Plan 3), gemeinsames Pause-Feld "60 Sek."
- [x] Plan 2 und 3 zeigen ein Gewicht-Feld pro Satz-Zeile
- [x] Plan 1 (Bodyweight) zeigt kein Gewicht-Feld

#### Felder anpassen
- [x] Wiederholungen, Pause und Gewicht sind frei editierbar (Freitext, keine Formatvorgabe)

#### Speichern (eingeloggte Nutzer)
- [x] "Training abschließen" speichert live gegen die echte Datenbank, Erfolgsmeldung erscheint
- [x] Reload lädt den zuletzt gespeicherten Stand korrekt als Vorausfüllung zurück
- [x] Erster Besuch (noch nie gespeichert) zeigt das Plan-Standardschema — bereits in `/backend` live verifiziert
- [x] Fehlerbehandlung bereits in `/backend` verifiziert (Fehlermeldung erscheint, Werte bleiben erhalten) — vor der Migration provoziert, danach nicht erneut reproduziert (kein einfacher Weg, einen Speicherfehler gegen die jetzt echte DB zu erzwingen, ohne die DB mutwillig zu beschädigen)

#### Gast-Verhalten
- [x] Gast kann alle Felder nutzen, sieht Login-Hinweis-Karte statt Button, Link zeigt korrekt auf `/konto?reason=training`
- [x] Gast-Eingaben gehen beim Reload verloren (keine Persistenz, auch nicht lokal)

### Edge Cases Status
- [x] Sehr lange Freitext-Eingabe: von Zod auf 50 Zeichen pro Feld begrenzt (in der Spec als "keine Zeichenbegrenzung im MVP" beschrieben — die Praxis weicht hier bewusst ab, siehe Bug-Eintrag unten, Severity Low)
- [x] Mehrfaches Speichern desselben Plans: jeder Klick legt einen eigenen, neuen Eintrag an (verifiziert über wiederholtes Speichern im selben Testlauf)
- [x] XSS-Payload (`<img src=x onerror=alert(1)>`) in einem Feld: wird als reiner Text gespeichert und wieder angezeigt, kein Skript-Alert ausgelöst (live gegen den echten Server verifiziert)
- [x] Anonyme Gast-Session: verhält sich wie Gast (403 auf der API, kein Button in der UI)

### Security Audit Results
- [x] `POST /api/training/[plan]` ohne Session → 401 (live verifiziert)
- [x] `POST /api/training/[plan]` mit anonymer Gast-Session → 403 (Unit-Test)
- [x] Unbekannter Plan-Slug → 404, auch ohne Authentifizierung (live verifiziert)
- [x] Unbekannte Übungs-ID im Body → 400, kein beliebiger JSON-Key wird akzeptiert (live verifiziert)
- [x] Malformter Body (fehlendes `saetze`) → 400 (live verifiziert)
- [x] XSS-Payload wird sicher als Text behandelt, keine Skript-Ausführung (live verifiziert)
- [x] Kein IDOR möglich: `user_id` wird ausschließlich serverseitig aus der Session abgeleitet, ist kein Client-Input; sowohl die Speicher-Route als auch die Lese-Query in der Seite sind auf `user.id` gescoped (Code-Review, konsistent mit dem etablierten Muster aller anderen Routen in diesem Projekt)
- [x] Kein Rate-Limiting auf `/api/training/[plan]` — konsistent mit dem bestehenden `/api/kcal-rechner`/`/api/mahlzeiten-ziel`-Muster, kein neu eingeführter Gap

### Regression Testing
- [x] `PROJ-42-analyse-uebersichtsseite.spec.ts`: 13/13 grün (Umbenennung `AnalyseLoginHinweis` → `LoginHinweis` verifiziert unauffällig)
- [x] `PROJ-43-training-uebersicht.spec.ts`: 16/16 grün (Plan-Karten-Links funktionieren jetzt end-to-end)
- [x] `PROJ-35-bottom-navigation-kontobereich.spec.ts`: 11/12 grün — der eine Fehlschlag ist der bereits aus der PROJ-42/43-QA bekannte, unabhängige `/ernaehrung`-Alias-Befund, nicht durch PROJ-44 verursacht
- [x] `npm test` (430/430) unverändert grün
- [x] 768px (Tablet) und Mobile 375px: kein horizontales Scrollen auf der Plan-Detailseite

### Bugs Found

#### BUG-1: Freitextfelder sind serverseitig auf 50 Zeichen begrenzt, obwohl die Spec "keine Zeichenbegrenzung im MVP" vorsieht
- **Severity:** Low
- **Steps to Reproduce:**
  1. Auf einer Plan-Detailseite ein Gewicht- oder Pause-Feld mit mehr als 50 Zeichen befüllen
  2. "Training abschließen" klicken
  3. Erwartet laut Spec-Edge-Case: wird unverändert übernommen, keine Begrenzung
  4. Tatsächlich: `POST /api/training/[plan]` liefert 400, Speichern schlägt fehl
- **Screenshot:** nicht visuell, API-Verhalten
- **Priority:** Nice to have — 50 Zeichen sind für die Praxis (z. B. "100kg + 2x rot Band") großzügig genug, ein echter Nutzer wird das kaum erreichen; wurde bewusst als Sicherheits-/Längenschutz beim Schreiben der Route ergänzt, ohne das explizit mit der Spec abzugleichen. Empfehlung: Spec nachträglich anpassen (Limit dokumentieren) statt Code zu lockern, da eine echte Unbegrenztheit ein unnötiges Freitext-Missbrauchsrisiko wäre.

### Summary
- **Acceptance Criteria:** 17/17 bestanden
- **Neue Tests:** `tests/PROJ-44-trainingsplaene.spec.ts` (13 E2E-Tests, chromium + Mobile Chrome grün)
- **Bugs Found:** 1 (0 kritisch/hoch, 0 mittel, 1 niedrig — Spec/Code-Diskrepanz bei der Zeichenbegrenzung, keine funktionale Einschränkung in der Praxis)
- **Security:** Pass — Auth/Validierung/Scoping/XSS-Schutz live gegen den echten Server verifiziert
- **Production Ready:** YES
- **Recommendation:** Deploy (BUG-1 als Low-Priority-Doku-Nachtrag für die Spec vermerken, nicht blockierend)

## Deployment
- **Production URL:** https://app.mehralsabnehmen.de/training/zuhause-ohne-equipment
- **Deployed:** 2026-09-02 (Vercel auto-deploy via Push zu `main`, commits `16a28f1`..`930dac0`)
- **Verified in Produktion:** Nutzer hat die Live-Seite geprüft, alles grün ("Alles auf Grün").
- **Umfang dieses Deploys:** vollständige PROJ-44-Implementierung — 3 Trainingsplan-Detailseiten unter `/training/[plan]` mit Übungskarten (einklappbare Ausführungs-Erklärung, editierbare Satz-Zeilen für Wiederholungen + Gewicht bei Plan 2/3, gemeinsames Pause-Feld), neue Tabelle `training_sessions` + `POST /api/training/[plan]` zum Speichern, Vorausfüllung mit dem zuletzt gespeicherten Stand für eingeloggte Nutzer, zustandslose Nutzung für Gäste. `AnalyseLoginHinweis` in `LoginHinweis` umbenannt (jetzt von PROJ-42 und PROJ-44 geteilt). Migration wurde vom Nutzer manuell ausgeführt und live verifiziert (siehe Implementation Notes Backend).
