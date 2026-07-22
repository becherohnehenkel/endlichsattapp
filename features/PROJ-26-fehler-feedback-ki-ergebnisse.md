# PROJ-26: Fehler-Feedback zu KI-Ergebnissen

## Status: Planned
**Created:** 2026-07-21
**Last Updated:** 2026-07-21

## Dependencies
- Requires: PROJ-25 (KI-Hinweis auf Ergebnisseiten) — der Feedback-Auslöser erscheint direkt beim KI-Hinweis, auf denselben drei Oberflächen
- Requires: PROJ-4, PROJ-5 (KI-Analyse-Agent, Sättigungs-Einschätzung) — Feedback bezieht sich auf deren Ausgabe
- Requires: PROJ-8 (Rezeptbibliothek) — Feedback ist auch auf der Rezept-Detailseite möglich
- Requires: PROJ-19 (Gast-Modus) — Gäste können ebenfalls Feedback abschicken
- Betrifft: PROJ-13 (Admin-Dashboard) — neue Admin-Unteransicht analog zur bestehenden Codes-Verwaltung

## User Stories
- Als Nutzer (registriert oder Gast) möchte ich direkt beim KI-Hinweis einen Fehler in der Sättigungs-Einschätzung melden können, ohne den Fehler selbst detailliert beschreiben zu müssen, damit die Meldung schnell und ohne Hürde geht.
- Als Nutzer möchte ich nach dem Absenden eine kurze Bestätigung sehen, damit ich weiß, dass mein Feedback angekommen ist.
- Als Product Owner möchte ich alle eingegangenen Feedback-Meldungen in einer Admin-Übersicht sehen — inklusive der genauen Daten, die der Nutzer zum Zeitpunkt der Meldung gesehen hat — damit ich Fehler in der KI-Analyse nachvollziehen und beheben kann.
- Als Product Owner möchte ich bereits geprüftes Feedback als erledigt markieren können, damit ich bei wachsender Liste den Überblick behalte, was ich schon bearbeitet habe.

## Out of Scope
- Echter Screenshot der Seite — es werden nur strukturierte Kontext-Daten (Seitentyp, Referenz, angezeigte Sättigungs-Werte) automatisch mitgeschickt, kein Bild. Vermeidet eine neue Abhängigkeit (z.B. `html2canvas`) und Bild-Storage für ein P2-Feature.
- Rückmeldung/Antwort an den Nutzer (z.B. per E-Mail) — reine Einbahnstraße im MVP, kein Kontaktfeld, keine Dialogfunktion
- Feedback-Trigger auf dem Wochen-Recap (PROJ-17) oder dem Beilagen-/Grundlagen-Kontext-Hinweis (PROJ-16) — konsistent mit dem Scope-Ausschluss des KI-Hinweises in PROJ-25 (dort erscheint ohnehin keine KI-Matrix, an der ein Fehler gemeldet werden könnte)
- Kategorisierung/Tagging des Fehlertyps (z.B. "falsche Kalorien", "falscher Baustein") — reines Freitext-Feld für MVP, keine strukturierte Fehler-Taxonomie
- Bearbeitungs-/Kommentarfunktion in der Admin-Übersicht über die Erledigt-Markierung hinaus — kein internes Notizfeld, kein Zuweisen an Personen (Solo-Entwickler-Projekt)
- Verknüpfung mit der Sättigungsmatrix-Dokumentation (automatisches Vorschlagen von Korrekturen) — Feedback ist reine Rohdaten-Sammlung, keine automatisierte Auswertung
- Löschen von Feedback-Einträgen — Einträge bleiben dauerhaft erhalten (Historie), nur der Erledigt-Status ändert sich

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Feedback abschicken (Nutzer)
- [ ] Angenommen ein Nutzer (registriert oder Gast) sieht den KI-Hinweis auf einer der drei Ergebnis-Oberflächen (Mahlzeit-Analyse, Mahlzeit-Historie, Rezept-Detailseite), dann sieht er direkt daneben einen Link/Button "Feedback geben".
- [ ] Angenommen ein Nutzer klickt auf "Feedback geben", dann öffnet sich ein Dialog mit einem Freitext-Nachrichtenfeld und einem Absenden-Button.
- [ ] Angenommen der Dialog ist geöffnet, wenn der Nutzer den Dialog ohne Eingabe schließt (z.B. per X oder Klick daneben), dann wird kein Feedback gespeichert.
- [ ] Angenommen der Nutzer lässt das Nachrichtenfeld leer, wenn er auf Absenden klickt, dann wird ein Validierungsfehler angezeigt und nichts wird gespeichert.
- [ ] Angenommen der Nutzer gibt eine Nachricht ein und klickt auf Absenden, dann werden automatisch und unsichtbar für den Nutzer alle zum Zeitpunkt angezeigten Analyse-Daten als Snapshot mitgeschickt — nicht nur die Kurzfassung. Bei einer Mahlzeit-Analyse (Mahlzeit-Analyse-Ergebnis/Mahlzeit-Historie): die vollständige analysierte Zutatenliste (Name, Menge, Quelle), alle getroffenen Annahmen der KI, die Vorher-Bewertung (alle 6 Bausteine einzeln + Gesamtbewertung + Erklärung + Nährwerte), alle gegebenen Verbesserungsvorschläge (Aktion, Begründung, betroffener Baustein) samt Art-of-Eating-Tipp, sowie die Nachher-Bewertung (Bausteine, Gesamtbewertung, Nährwerte, Deltas). Bei einem Rezept: die vollständige Zutatenliste (Name, Menge) und die Sättigungs-Matrix (alle 6 Bausteine einzeln inkl. Erklärung + Gesamtbewertung) sowie die Nährwerte pro Portion.
- [ ] Angenommen das Feedback wurde erfolgreich gespeichert, dann sieht der Nutzer eine kurze Bestätigung ("Danke, wir schauen uns das an" o.ä.) und der Dialog schließt sich.
- [ ] Angenommen die API ist beim Absenden nicht erreichbar, dann wird eine Fehlermeldung angezeigt und die eingegebene Nachricht bleibt im Formular erhalten.
- [ ] Angenommen ein Nutzer (registriert oder anonyme Gast-Session) hat bereits 5 Feedback-Meldungen am selben Kalendertag abgeschickt, wenn er ein weiteres Mal absenden will, dann wird eine Meldung angezeigt, dass das Tageslimit erreicht ist, und nichts wird gespeichert.

### Feedback einsehen (Admin)
- [ ] Angenommen der Product Owner ist als Admin eingeloggt, wenn er die neue Feedback-Übersicht im Admin-Bereich öffnet, dann sieht er alle eingegangenen Feedback-Einträge, neueste zuerst, offene Einträge vor bereits erledigten.
- [ ] Angenommen ein Feedback-Eintrag wird in der Admin-Übersicht angezeigt, dann sind sichtbar: die Nachricht, Zeitpunkt, Seitentyp, ein Link zur betroffenen Mahlzeit/zum betroffenen Rezept, sowie der vollständige Analyse-Snapshot (Zutatenliste mit Mengen, alle 6 Sättigungs-Bausteine einzeln, Nährwerte, Verbesserungsvorschläge/Tipps) — in derselben Aufbereitung wie auf der ursprünglichen Ergebnisseite, damit der Fehler ohne Nachschlagen an anderer Stelle nachvollziehbar ist.
- [ ] Angenommen der Admin klickt bei einem offenen Feedback-Eintrag auf "Erledigt", dann wird der Eintrag als erledigt markiert und entsprechend visuell abgesetzt (z.B. ausgegraut, ans Ende sortiert).
- [ ] Angenommen ein Nutzer ohne Admin-Rechte versucht, die Feedback-Übersicht oder die zugehörige API direkt aufzurufen, dann wird der Zugriff verweigert (analog zum bestehenden Admin-Auth-Muster).

## Edge Cases
- Nutzer schickt Feedback zu einer Mahlzeit-Analyse, löscht die Mahlzeit danach selbst → Feedback-Eintrag bleibt erhalten (Snapshot-Daten sind unabhängig vom Original gespeichert), der Link zur Mahlzeit führt aber ins Leere — Admin-Ansicht muss diesen Fall abfangen (z.B. "Mahlzeit nicht mehr vorhanden")
- Rezept wird nach der Feedback-Meldung vom Admin bearbeitet (z.B. Matrix korrigiert) → der gespeicherte Snapshot zeigt weiterhin die ursprünglichen, zum Meldezeitpunkt angezeigten Werte, nicht die aktuellen
- Gast ohne Account schickt Feedback, danach läuft die anonyme Session ab oder der Browser wird gewechselt → Feedback bleibt trotzdem gespeichert (nicht an eine dauerhafte Identität gebunden), nur das Tageslimit kann nicht mehr über dieselbe Session nachverfolgt werden
- Nutzer öffnet den Feedback-Dialog auf einem Rezept ohne Sättigungs-Matrix (Beilagen-/Grundlagen-Typ) → kann nicht vorkommen, da dort laut PROJ-25 auch der KI-Hinweis (und damit der Feedback-Link) gar nicht angezeigt wird
- Sehr lange Nachricht (z.B. mehrere tausend Zeichen) → Zeichenlimit im Formular (500 Zeichen), serverseitig zusätzlich validiert
- Zwei Feedback-Meldungen zur exakt gleichen Mahlzeit/demselben Rezept kurz hintereinander → beide werden als getrennte Einträge gespeichert, keine Deduplizierung (könnten unterschiedliche Anmerkungen sein)
- Mahlzeit-Analyse ohne Verbesserungsvorschläge (Fall "sehr sättigend", siehe PROJ-5: kein konstruierter Vorschlag nötig) → Snapshot enthält eine leere Vorschläge-Liste, kein Fehlerzustand, Admin-Ansicht zeigt diesen Abschnitt einfach leer/entfällt

## Technical Requirements (optional)
- Barrierefreiheit: Dialog muss mit Tastatur bedienbar sein (Standard-Anforderung für alle Formulare im Projekt)
- Mobile-first: Dialog muss auf 375px Breite vollständig nutzbar sein
- Rate-Limiting: max. 5 Feedback-Einträge pro Nutzer/anonyme Gast-Session und Kalendertag (analog zum bestehenden Foto-Scan-Limit-Muster aus PROJ-10)
- Admin-Zugriff: gleiches Auth-Muster wie bestehende Admin-Seiten (`ADMIN_EMAIL`-Check)

## Open Questions
- [x] Welche Daten genau soll der Snapshot enthalten? → Vollständige Analyse statt Kurzfassung: komplette Zutatenliste mit Mengen, alle 6 Bausteine einzeln, Nährwerte, alle Verbesserungsvorschläge/Tipps (siehe Acceptance Criteria + Decision Log) (2026-07-21)
- [ ] Technische Speicherform des Snapshots (z.B. ein JSON-Feld vs. strukturierte Spalten) — wird in `/architecture` festgelegt
- [ ] Soll die Admin-Übersicht später mit dem bestehenden `/admin`-Dashboard (PROJ-13) visuell zusammengeführt oder als eigener Menüpunkt geführt werden? — Entscheidung wird in `/architecture` getroffen

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kein echter Screenshot, nur strukturierte Kontext-Daten | Vermeidet neue Abhängigkeit (z.B. `html2canvas`) und Bild-Storage — für ein P2-Feature unverhältnismäßiger Aufwand; strukturierte Daten (Seitentyp, Referenz, angezeigte Werte) reichen aus, um den Fehler nachzuvollziehen | 2026-07-21 |
| Zwingende Admin-Übersicht statt reiner DB-Speicherung | Explizit vom Product Owner gefordert — "ich muss schon sehen können, was alles nicht funktioniert" | 2026-07-21 |
| Feedback-Auslöser direkt beim KI-Hinweis platziert | Genau dort, wo der Nutzer liest, dass Fehler möglich sind, kann er sie sofort melden — kürzester Weg von Problem-Erkenntnis zu Meldung | 2026-07-21 |
| Auslöser auf denselben 3 Oberflächen wie der KI-Hinweis (PROJ-25) | Konsistenz — überall wo ein Fehler sichtbar sein könnte, muss er auch meldbar sein | 2026-07-21 |
| Dialog/Modal mit Freitext-Pflichtfeld statt Inline-Formular | Lenkt beim Absenden nicht vom Rest der Seite ab, klar abgegrenzte Interaktion; Kontext-Daten werden automatisch und unsichtbar mitgeschickt, damit der Nutzer nichts technisches beschreiben muss | 2026-07-21 |
| Admin-Übersicht mit Erledigt-Markierung statt reiner Leseliste | Ohne Status verliert der Product Owner bei wachsender Liste den Überblick, was schon geprüft wurde | 2026-07-21 |
| Auch Gäste können Feedback abschicken | Konsistent mit dem KI-Hinweis, der ebenfalls für Gäste sichtbar ist (PROJ-19) — Gäste sehen dieselben Analyse-Ergebnisse und können dieselben Fehler entdecken | 2026-07-21 |
| Einfaches Rate-Limit (5/Tag pro Nutzer/Gast-Session) | Da auch nicht eingeloggte Gäste schreiben können, braucht die API einen Basis-Spam-Schutz; einfaches Tageslimit reicht für MVP, analog zum bestehenden Foto-Scan-Limit-Muster (PROJ-10) | 2026-07-21 |
| Keine Rückmeldung/Kontaktaufnahme im MVP | Hält das Formular minimal und DSGVO-unkritisch (keine Kontaktdaten-Erfassung); kann bei Bedarf später als eigenes Refinement ergänzt werden | 2026-07-21 |
| Feedback-Snapshot bleibt beim Bearbeiten/Löschen der referenzierten Mahlzeit/des Rezepts erhalten | Der Admin muss sehen können, was der Nutzer zum Meldezeitpunkt tatsächlich gesehen hat, auch wenn sich die Originaldaten später ändern oder verschwinden | 2026-07-21 |
| Snapshot enthält die vollständige Analyse (komplette Zutatenliste mit Mengen, alle 6 Bausteine einzeln, Nährwerte, alle Verbesserungsvorschläge/Tipps) statt nur einer Kurzfassung der Sättigungs-Werte | Auf expliziten Wunsch des Product Owners nach der ersten Spec-Fassung — um einen gemeldeten Fehler tatsächlich diagnostizieren zu können (z.B. "welche Zutat wurde falsch erkannt", "welcher Baustein ist falsch bewertet"), reicht eine Kurzfassung nicht aus; der Admin muss dieselbe vollständige Ansicht sehen, die auch der Nutzer beim Melden vor sich hatte | 2026-07-21 |
| Kein Löschen von Feedback-Einträgen, nur Erledigt-Status | Feedback bleibt als Historie erhalten — Löschen wäre unnötiges Risiko, echte Aufräum-Anforderung besteht nicht bei erwartbar überschaubarem Volumen | 2026-07-21 |

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
