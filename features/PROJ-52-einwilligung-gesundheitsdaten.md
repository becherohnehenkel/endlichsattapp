# PROJ-52: Explizite Einwilligung für gesundheitsnahe Daten (Kalorien-Rechner + Wochen-Check-In)

## Status: Planned
**Created:** 2026-09-08
**Last Updated:** 2026-09-08

## Dependencies
- Requires: PROJ-2 (User Authentication) — Registrierungsformular erhält die neue Pflicht-Checkbox
- Requires: PROJ-37 (So geht abnehmen inkl. Kcal-Rechner) — der Kalorien-Rechner ist eine der beiden betroffenen Funktionen
- Requires: PROJ-45 (Wochen-Check-In) — die zweite betroffene Funktion
- Requires: PROJ-51 (Check-In-Tab, Analyse-Seite) — zeigt dieselben Wochen-Check-In-Daten und muss dieselbe Einwilligung respektieren
- Requires: PROJ-14 (Kontoübersicht & Widerrufsbutton) — Widerruf-UI folgt demselben Muster wie die bestehende Account-Löschung
- Requires: PROJ-20 (Datenschutzerklärung & Impressum) — beschreibt bereits die Art.-9-Einordnung; ein Satz zum Widerrufsverhalten wird im Rahmen dieser Spec korrigiert
- Requires: PROJ-19 (Gast-Modus) — Kontext, warum Gäste von dieser Spec nicht betroffen sind

**Vorgeschichte:** Diese Spec entstand aus dem PROJ-20-Refinement (2026-09-07), als entschieden wurde, Gewicht/Alter/Geschlecht/Größe/Kalorienziel sowie alle 6 Wochen-Check-In-Metriken als besondere Kategorie personenbezogener Daten (Art. 9 DSGVO) zu behandeln, die eine gesonderte, ausdrückliche Einwilligung erfordert. PROJ-20 lieferte dafür bereits den aktualisierten Datenschutztext; diese Spec liefert den eigentlichen Einwilligungs-Mechanismus.

## User Stories
- Als neuer Nutzer werde ich bei der Registrierung ausdrücklich gefragt, ob ich der Verarbeitung meiner Gewichts-/Ernährungsziel- und Wochen-Check-In-Daten zustimme, bevor ich ein Konto erstellen kann.
- Als bestehender Nutzer, der Kalorien-Rechner oder Wochen-Check-In bereits vor Einführung dieser Einwilligung genutzt hat, werde ich beim nächsten Zugriff einmalig um meine ausdrückliche Zustimmung gebeten, ohne dass der Rest der App dadurch blockiert wird.
- Als Nutzer kann ich meine Einwilligung jederzeit in meiner Konto-Ansicht widerrufen und weiß dabei klar, dass meine betroffenen Daten dabei gelöscht werden.
- Als Nutzer, der die Einwilligung ablehnt, kann ich die App ansonsten normal weiternutzen — nur Kalorien-Rechner und Wochen-Check-In bleiben gesperrt, bis ich zustimme.
- Als Gast (kein Account) bin ich von diesem Einwilligungsprozess nicht betroffen, da meine Eingaben in beiden Funktionen nie den Browser verlassen.

## Out of Scope
- Gast-spezifischer Einwilligungs-Flow — technisch nicht nötig, da Gast-Eingaben in Kalorien-Rechner (`src/components/kcal-rechner.tsx:107`, `kannSpeichern`-Gate) und Wochen-Check-In (kein Speichern-Button für Gäste, `is_anonymous` wird serverseitig zusätzlich mit 403 abgelehnt) nachweislich nie an den Server gesendet werden.
- Feingranulare, getrennte Einwilligung pro Funktion (Kalorien-Rechner separat von Wochen-Check-In) — eine gemeinsame Einwilligung deckt laut PROJ-20-Decision-Log beide ab, da beide dieselbe Art.-9-Kategorie betreffen.
- E-Mail-Kampagne an Bestandsnutzer zur nachträglichen Einwilligung — bewusst nicht gewählt, stattdessen einmaliger In-App-Nachtrag beim nächsten Zugriff.
- Teil-Löschung einzelner Felder innerhalb eines Wochen-Check-In-Eintrags (z. B. nur die 6 Slider-Werte leeren, Freitext behalten) — bei fehlender/widerrufener Einwilligung werden ganze Einträge gelöscht.
- Eigene Zustimmungs-Bildschirme für die "passiven" Anzeige-Stellen (So-geht-abnehmen-Guide, Analyse-Übersicht, Emotionales Essen) — diese behandeln fehlende Einwilligung wie ihren bereits bestehenden Leerzustand, ohne eigenen Dialog.
- Undo/Wiederherstellung nach Löschung durch Widerruf oder Ablehnung — einmal gelöschte Daten sind endgültig weg.
- Änderung der Registrierungspflicht rückwirkend für bereits bestehende Accounts — nur neue Registrierungen ab Deploy dieser Spec verlangen die Pflicht-Checkbox; Bestandsnutzer durchlaufen stattdessen den separaten Nachtrag-Flow.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Registrierung (neue Nutzer)
- [ ] Angenommen ein neuer Nutzer füllt das Registrierungsformular aus, wenn er das Formular ohne aktivierte Einwilligungs-Checkbox abschickt, dann wird die Registrierung mit einer Validierungsfehlermeldung abgelehnt (zusätzlich zur bereits bestehenden allgemeinen Datenschutz-Bestätigung)
- [ ] Angenommen die neue Checkbox ist aktiviert, wenn die Registrierung erfolgreich abgeschlossen wird, dann wird die Einwilligung mit Zeitstempel dem neuen Konto zugeordnet gespeichert

### Bestandsnutzer ohne Einwilligung
- [ ] Angenommen ein eingeloggter, nicht-anonymer Bestandsnutzer ohne gespeicherte Einwilligung öffnet den Kalorien-Rechner (`/ernaehrung/so-geht-abnehmen`), dann sieht er statt der Eingabefelder einen Zustimmungs-Bildschirm mit Erklärung und Link zur Datenschutzerklärung
- [ ] Angenommen derselbe Nutzer öffnet stattdessen den Wochen-Check-In (`/check-in`) oder den Check-In-Tab auf der Analyse-Seite (PROJ-51), dann sieht er denselben Zustimmungs-Bildschirm statt der jeweiligen Funktion
- [ ] Angenommen der Nutzer klickt auf dem Zustimmungs-Bildschirm "Zustimmen", dann wird die Einwilligung mit Zeitstempel gespeichert und sowohl Kalorien-Rechner als auch Wochen-Check-In (inkl. PROJ-51-Tab) sind ab sofort ohne erneutes Laden nutzbar
- [ ] Angenommen der Nutzer klickt stattdessen auf "Ablehnen", dann werden eventuell bereits vorhandene Kalorien-Rechner-Werte genullt und alle vorhandenen Wochen-Check-In-Einträge dieses Nutzers gelöscht, und beide Funktionen bleiben gesperrt
- [ ] Angenommen ein Bestandsnutzer ohne Einwilligung nutzt andere Bereiche der App (Mahlzeit-Analyse, Rezepte, Training, Startseite etc.), dann ist dies uneingeschränkt möglich, ohne dass der Zustimmungs-Bildschirm dort erscheint

### Widerruf
- [ ] Angenommen ein Nutzer hat bereits zugestimmt, wenn er in der Konto-Ansicht auf "Einwilligung für Gesundheitsdaten widerrufen" klickt, dann erscheint ein Bestätigungsdialog, der ausdrücklich auf die bevorstehende Löschung der betroffenen Daten hinweist
- [ ] Angenommen der Nutzer bestätigt den Widerruf im Dialog, dann werden seine Kalorien-Rechner-Werte genullt, alle seine Wochen-Check-In-Einträge gelöscht, die Einwilligung zurückgesetzt, und beide Funktionen sind ab sofort wieder gesperrt
- [ ] Angenommen der Nutzer bricht den Bestätigungsdialog ab, dann bleibt seine Einwilligung und alle Daten unverändert erhalten

### Passive Anzeige-Stellen
- [ ] Angenommen ein Nutzer hat keine gespeicherte Einwilligung (nie erteilt, abgelehnt oder widerrufen), wenn er Seiten besucht, die abgeleitete Werte aus dem Kalorien-Rechner anzeigen (So-geht-abnehmen-Guide, Analyse-Übersicht, Emotionales Essen), dann zeigen diese Seiten ihren bestehenden Leerzustand ("noch keine Werte hinterlegt") — ohne eigenen Zustimmungs-Bildschirm und ohne die eigentlich vorhandenen (aber nicht-eingewilligten) Werte anzuzeigen

### Datenschutztext
- [ ] Angenommen ein Nutzer liest die Datenschutzerklärung, dann beschreibt der Abschnitt zum Widerrufsrecht korrekt, dass ein Widerruf die betroffenen Daten löscht (Korrektur des bisherigen Texts aus PROJ-20, der noch "nicht automatisch gelöscht" beschreibt)

## Edge Cases
- Nutzer schließt den Zustimmungs-Bildschirm ohne Klick auf "Zustimmen" oder "Ablehnen" (z. B. Navigation weg, Browser-Zurück): Zustand bleibt unentschieden, keine Datenänderung — der Bildschirm erscheint beim nächsten Versuch erneut.
- Nutzer widerruft oder lehnt ab, möchte später wieder zustimmen: Kalorien-Rechner und Wochen-Check-In starten danach leer, keine Wiederherstellung der gelöschten Werte.
- Neuer Nutzer aktiviert die Registrierungs-Checkbox nicht: Registrierung wird blockiert (Pflicht-Checkbox), Konto wird nicht angelegt, bis er zustimmt.
- Gleichzeitiger Zugriff auf Kalorien-Rechner und Check-In-Tab (PROJ-51) in zwei Browser-Tabs, während der Bestandsnutzer noch unentschieden ist: beide Tabs zeigen unabhängig denselben Zustimmungs-Bildschirm; stimmt der Nutzer in einem Tab zu, zeigt der andere Tab den freigeschalteten Zustand erst nach eigenem Neuladen (kein Realtime-Sync nötig).
- Nutzer widerruft, während er gerade unsaved Freitext im Check-In-Formular eingegeben hat: nur bereits gespeicherte (in der Datenbank liegende) Einträge werden gelöscht — unsaved lokale Eingaben wurden ohnehin nie an den Server übertragen.
- Nutzer löscht seinen gesamten Account (PROJ-14), unabhängig vom Einwilligungsstatus: bestehende Account-Löschung entfernt ohnehin alle Daten inklusive der hier betroffenen — kein Sonderfall nötig.

## Technical Requirements (optional)
- Neues Feld auf `profiles`, z. B. `gesundheitsdaten_einwilligung_at TIMESTAMPTZ NULL` — `null` bedeutet keine Einwilligung (nie erteilt, abgelehnt oder widerrufen), ein gesetzter Zeitstempel bedeutet erteilte Einwilligung.
- Eine zentrale, serverseitige Prüffunktion für den Einwilligungsstatus, die von allen betroffenen Stellen genutzt wird (Kalorien-Rechner-Formular, Check-In-Formular, Check-In-Tab aus PROJ-51, sowie den 3 passiven Anzeige-Stellen).
- Löschung bei Ablehnung/Widerruf: `kcal_gewicht_kg`, `kcal_groesse_cm`, `kcal_alter_jahre`, `kcal_geschlecht`, `kcal_aktivitaetslevel`, `kcal_ziel` auf `profiles` nullen; alle Zeilen des Nutzers in `wochen_check_ins` löschen.
- Mobile-first wie alle anderen Bereiche der App.

## Open Questions
Keine — alle offenen Punkte wurden im Interview geklärt.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Gäste erhalten keinen eigenen Einwilligungs-Flow | Code-Prüfung bestätigt: Gast-Eingaben in Kalorien-Rechner und Wochen-Check-In werden nie an den Server gesendet (client-seitige Berechnung bzw. kein Speichern-Button, zusätzlich serverseitiger 403 für `is_anonymous`) — es findet keine Verarbeitung durch den Verantwortlichen statt, die eine Einwilligung erfordern würde | 2026-09-08 |
| Registrierungs-Checkbox ist Pflicht, nicht optional | Nutzerentscheidung — keine Registrierung ohne Zustimmung möglich | 2026-09-08 |
| Nachtrag für Bestandsnutzer sperrt nur die 2 betroffenen Funktionen, nicht den gesamten Account | Vermeidet, Nutzer wegen einer Funktion zu blockieren, die mit dem Kern der App (Mahlzeit-Analyse) nichts zu tun hat | 2026-09-08 |
| Zustimmungs-Bildschirm ersetzt das Formular vollständig (statt sichtbarer Felder mit gesperrtem Speichern-Button) | Sauberer aus DSGVO-Sicht — keine Dateneingabe, bevor die Einwilligung vorliegt | 2026-09-08 |
| Widerruf UND Ablehnung löschen die betroffenen Daten (Kalorien-Rechner-Werte nullen, Wochen-Check-In-Einträge löschen), statt sie nur zugriffsgesperrt zu belassen | Korrektur einer ursprünglich in PROJ-20 getroffenen Entscheidung — Art. 7 Abs. 3 DSGVO entzieht der Verarbeitung (inkl. Speicherung, Art. 4 Nr. 2 DSGVO) die einzige verfügbare Rechtsgrundlage, sobald die Einwilligung widerrufen wird; für Art.-9-Daten gibt es hier keine alternative Rechtsgrundlage, die eine Aufbewahrung rechtfertigen würde | 2026-09-08 |
| Bei Widerruf/Ablehnung werden ganze Wochen-Check-In-Einträge gelöscht, nicht nur die 6 sensiblen Felder darin | Einfacher umzusetzen als Teil-Löschung im JSON; ein Eintrag ohne die 6 Metriken hat ohnehin kaum eigenständigen Wert, da sich die Freitext-Reflexionen meist inhaltlich darauf beziehen | 2026-09-08 |
| Widerruf-Button lebt zentral in der Konto-Ansicht (analog zur bestehenden Account-Löschung aus PROJ-14), nicht dezentral in den beiden betroffenen Funktionen | Konsistent mit bestehendem Muster, eine zentrale Stelle statt zwei duplizierter Widerruf-Links | 2026-09-08 |
| Die "passiven" Anzeige-Stellen (So-geht-abnehmen-Guide, Analyse-Übersicht, Emotionales Essen) bekommen keinen eigenen Zustimmungs-Bildschirm, sondern behandeln fehlende Einwilligung wie ihren bereits bestehenden Leerzustand | Vermeidet, denselben Zustimmungs-Bildschirm an 4+ Stellen einzubauen; diese Seiten zeigen ohnehin bereits einen Leerzustand für "noch keine Werte hinterlegt", der sich technisch identisch verhält | 2026-09-08 |
| Der Check-In-Tab aus PROJ-51 zählt als Haupt-Einstiegspunkt (wie `/check-in` selbst), nicht als passive Anzeige-Stelle | Zeigt aktiv historische, potenziell sensible Einzeleinträge, nicht nur eine abgeleitete Zusammenfassung — verdient denselben vollen Zustimmungs-Bildschirm | 2026-09-08 |
| Der Datenschutztext aus PROJ-20 zum Widerrufsverhalten wird korrigiert (Löschung statt reiner Sperre), sobald diese Spec deployed ist | Text muss die tatsächliche, jetzt korrigierte Produktentscheidung widerspiegeln; Korrektur erfolgt erst mit dem Deploy dieser Spec, nicht vorher, um keine noch nicht existierende Fähigkeit zu versprechen | 2026-09-08 |

### Technical Decisions
<!-- Added by /architecture -->

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
