# PROJ-5: Sättigungs-Einschätzung & Verbesserungsvorschlag

## Status: Planned
**Created:** 2026-06-10
**Last Updated:** 2026-06-10

## Dependencies
- Requires: PROJ-4 (KI-Analyse-Agent) — liefert Makros, Zutatenliste und Bausteine-Rohdaten als Input
- Requires: PROJ-1 (Supabase Infrastructure) — Ergebnis wird in `meal_analyses` gespeichert

## User Stories
- Als Nutzer möchte ich auf einen Blick sehen wie sättigend meine Mahlzeit ist, damit ich sofort verstehe wo ich stehe.
- Als Nutzer möchte ich die 6 Bausteine der Sättigungsmatrix einzeln bewertet sehen (grün/gelb/rot), damit ich verstehe welche Dimension meines Gerichts stark oder schwach ist.
- Als Nutzer möchte ich einen konkreten, sofort umsetzbaren Verbesserungsvorschlag bekommen ("eine Handvoll Kirschtomaten dazu"), damit ich morgen beim Kochen genau weiß was ich ändern kann.
- Als Nutzer möchte ich den Side-by-Side-Vergleich meiner aktuellen vs. verbesserten Mahlzeit sehen, damit ich den Unterschied der Verbesserung direkt greife.
- Als Nutzer möchte ich kurze, präzise Erklärungen ohne erhobenen Zeigefinger, damit ich mich verstanden und nicht belehrt fühle.

## Out of Scope
- Vollständige Rezept-Neuformulierung für Geschmacksoptimierung — Post-MVP, eigene Feature-Session nach dem MVP
- Feedback-Mechanismus ("War der Vorschlag hilfreich?") — Post-MVP (PROJ-7 oder späteres Feature)
- Speichern/Teilen des Ergebnisses — Speicherung läuft über PROJ-1/PROJ-4, Teilen ist Post-MVP
- Mikronährstoffe, Vitamine — explizites Non-Goal (PRD)
- Kalorien als Hauptmetrik — erscheinen nur sekundär aus PROJ-4

## Acceptance Criteria

### Sättigungs-Score & Bausteine
- [ ] Angenommen PROJ-4 hat die Analyse abgeschlossen, wenn das Ergebnis angezeigt wird, dann sieht der Nutzer alle 6 Bausteine (Geschmack, Biss, Ballaststoffe, Proteine, Volumen, Art of Eating) mit ihrer Bewertung: grün (gut), gelb (mittel), rot (schwach).
- [ ] Angenommen die 6 Bausteine bewertet sind, wenn die Gesamteinschätzung angezeigt wird, dann gilt: 5–6 grün = "Sehr sättigend", 3–4 grün = "Mäßig sättigend", 0–2 grün = "Wenig sättigend".
- [ ] Angenommen ein Baustein ist grün, wenn er angezeigt wird, dann erscheint er ohne ausführliche Erklärung — maximal eine kurze Bestätigung ("Das machst du bereits gut").
- [ ] Angenommen ein Baustein ist gelb oder rot, wenn er angezeigt wird, dann erscheint eine knappe Erklärung warum — präzise, ohne Zeigefinger, so kurz wie möglich.

### Erklärung (Warum-Abschnitt)
- [ ] Angenommen schwache Bausteine vorhanden sind, wenn die Erklärung angezeigt wird, dann fokussiert sie sich auf die roten Bausteine zuerst, dann auf gelbe — nicht auf alle sechs gleichzeitig.
- [ ] Angenommen die Erklärung angezeigt wird, dann folgt sie dem Ton-Prinzip: Handlung steht vor Theorie; Erklärungen erscheinen in Klammern, ausgegraut oder im Kleingedruckten.
- [ ] Angenommen das Gericht ist bereits "sehr sättigend" (5–6 grün), wenn das Ergebnis angezeigt wird, dann zeigt die App eine positive Bestätigung ohne konstruierte Verbesserungsvorschläge.

### Side-by-Side Vergleich
- [ ] Angenommen Verbesserungsvorschläge existieren, wenn der Vergleich angezeigt wird, dann sieht der Nutzer die 6 Bausteine nebeneinander: "Jetzt" (aktuelle Bewertung) vs. "Nach Verbesserung" (projizierte Bewertung nach Umsetzung der Vorschläge).
- [ ] Angenommen der Side-by-Side angezeigt wird, wenn ein Baustein sich durch die Verbesserung von rot/gelb auf grün verbessert, dann wird dieser Unterschied visuell hervorgehoben.
- [ ] Angenommen der Nutzer schaut sich den Vergleich auf Mobile an, dann ist der Side-by-Side auch auf kleinen Screens (320px+) lesbar — ggf. als vertikaler Vorher/Nachher-Stack.

### Verbesserungsvorschläge (Sättigender machen)
- [ ] Angenommen schwache Bausteine identifiziert sind, wenn Verbesserungsvorschläge angezeigt werden, dann folgt die Reihenfolge der Priorität aus der Sättigungsmatrix: Biss → Ballaststoffe → Volumen → Geschmack → Proteine → Art of Eating.
- [ ] Angenommen ein Verbesserungsvorschlag angezeigt wird, dann ist er konkret und sofort umsetzbar (z.B. "eine Handvoll Kirschtomaten dazu" statt "mehr Gemüse essen").
- [ ] Angenommen mehrere Bausteine schwach sind, wenn Vorschläge gemacht werden, dann priorisiert die App die 1–2 wirkungsvollsten Änderungen statt alle Schwächen gleichzeitig anzugehen.
- [ ] Angenommen ein Verbesserungsvorschlag eine Erklärung braucht, dann erscheint sie in Klammern, ausgegraut oder im Kleingedruckten — die Handlungsempfehlung steht immer zuerst.
- [ ] Angenommen die Sättigungsmatrix-Verbotsliste greift (z.B. Flohsamenschalen in herzhaftes Gericht), wenn ein Vorschlag generiert wird, dann erscheint dieser nie im Ergebnis.

### Rezept-Delta (Lecker bleiben)
- [ ] Angenommen Verbesserungsvorschläge existieren, wenn das Rezept-Delta angezeigt wird, dann zeigt es nur was sich ändert — nicht das vollständige Rezept neu formuliert.
- [ ] Angenommen das Rezept-Delta angezeigt wird, dann kommuniziert es explizit was am Original bleibt ("Deine Pasta bleibt wie sie ist, aber: …").
- [ ] Angenommen das Rezept-Delta Änderungen enthält, dann sind sie geschmacklich stimmig zum Originalgericht — keine Zutaten die den Charakter des Gerichts zerstören.

### Art of Eating
- [ ] Angenommen alle anderen Bausteine sind grün oder wurden verbessert, wenn das Ergebnis angezeigt wird, dann erscheint "Art of Eating" als abschließender Hinweis — nicht als Vorwurf sondern als Ergänzung.
- [ ] Angenommen "Art of Eating" als Baustein bewertet wird, dann basiert die Bewertung auf den Kontextangaben des Nutzers (sitzend gegessen? ablenkungsfrei?) — ohne Angabe erscheint es als neutraler Coaching-Tipp am Ende.

## Edge Cases
- **Mahlzeit bereits sehr sättigend:** Keine konstruierten Vorschläge — stattdessen Bestätigung und ggf. ein einziger "Feintuning"-Tipp.
- **Nur ein Lebensmittel analysiert** (z.B. "ein Apfel"): Score wird korrekt ausgegeben (wahrscheinlich wenig sättigend); Verbesserungsvorschlag erklärt dass ein Apfel als Snack ok ist aber keine vollständige Mahlzeit darstellt.
- **Nutzer hat übersprungen (Skip):** Verbesserungsvorschlag basiert auf den Annahmen der KI — Annahmen-Transparenz aus PROJ-4 wird oben im Ergebnis sichtbar eingeblendet, damit der Nutzer weiß worauf die Bewertung basiert.
- **Alle 6 Bausteine rot:** App zeigt maximal 2 konkrete Verbesserungsvorschläge (Priorität: Biss und Ballaststoffe) — keine überwältigende Liste.
- **Widersprüchliche Optimierungsziele** (mehr Volumen würde den Geschmack verschlechtern): App wählt den Vorschlag der Geschmack erhält — Geschmack hat immer Vorrang.

## Ton-Prinzipien (für KI-Prompt in /fachbereich)
- **Handlung vor Theorie** — konkrete Empfehlung zuerst, Erklärung dahinter
- **Hilfe zur Selbsthilfe** — der Nutzer soll verstehen, nicht befolgen
- **Kein erhobener Zeigefinger** — informieren, nicht mahnen
- **So kurz wie möglich, so lang wie nötig** — keine Textblöcke
- **Respekt vor dem Original** — was der Nutzer kocht bleibt erhalten

## Technical Requirements
- **Mobile-first:** Side-by-Side als vertikaler Stack auf <480px, nebeneinander ab 480px
- **Ausgabe-Struktur:** Maschinenlesbar (JSON) damit PROJ-6 (Historie) die Bewertung speichern kann
- **Ton:** Deutsch, du-Form, präzise, nie bevormundend

## Open Questions
- [ ] Soll der Nutzer einzelne Verbesserungsvorschläge als "nicht umsetzbar" markieren können (z.B. "ich mag keine Tomaten"), damit die App beim nächsten Mal bessere Vorschläge macht? — Post-MVP Überlegung, für jetzt nicht relevant

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine scrollende Seite statt Klick-durch-Schritte | Liest sich wie ein Coaching-Brief, nicht wie ein Formular; natürlicher Flow | 2026-06-10 |
| Side-by-Side Jetzt vs. Nach Verbesserung | Nutzen der Verbesserung sofort sichtbar; Motivation statt Belehrung | 2026-06-10 |
| Handlung vor Theorie — Erklärung in Klammern/klein | "Hilfe zur Selbsthilfe"; Nutzer der Theorie will kann nachlesen, muss es nicht | 2026-06-10 |
| Max. 1–2 Verbesserungsvorschläge bei mehreren Schwächen | Überwältigung vermeiden; Priorität nach Sättigungsmatrix-Reihenfolge | 2026-06-10 |
| Rezept-Delta statt Vollrezept | Respektiert das Original; kurz und direkt umsetzbar | 2026-06-10 |
| Vollständige Rezept-Geschmacksoptimierung Post-MVP | Braucht eigene Session und eigenes Feature; zu komplex für MVP-Scope | 2026-06-10 |
| Art of Eating immer als abschließender Tipp, nie als Vorwurf | Ton-Prinzip: informieren, nicht mahnen | 2026-06-10 |

### Technical Decisions
<!-- Added by /architecture -->

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
