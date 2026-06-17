# PROJ-12: Invite-Codes

## Status: Planned
**Created:** 2026-06-17
**Last Updated:** 2026-06-17

## Dependencies
- PROJ-1 (Supabase Infrastructure) — Codes-Tabelle in der Datenbank
- PROJ-2 (User Authentication) — Einlösen ist an den eingeloggten Nutzer gebunden
- PROJ-11 (Paywall) — Code-Einlösung bypassed die Paywall; `/upgrade`-Seite und Countdown-Hinweis sind der Einstiegspunkt

---

## Kontext

Die Paywall (PROJ-11) sperrt Freitext-Analyse und Rezeptbibliothek nach Ablauf des 7-Tage-Übergangsfensters. Invite-Codes ermöglichen es dem Product Owner, ausgewählten Personen (Freunde, Familie, Beta-Tester) dauerhaften Zugriff zu schenken — ohne dass diese ein Abo abschließen müssen. Die Code-*Generierung* ist Aufgabe von PROJ-13 (Admin-Dashboard); PROJ-12 deckt ausschließlich die Nutzer-seitige Einlösung ab.

---

## User Stories

**US-1:** Als Nutzer mit einem Invite-Code möchte ich den Code auf der `/upgrade`-Seite eingeben können, damit ich die App dauerhaft ohne Abo nutzen kann.

**US-2:** Als Nutzer der noch im 7-Tage-Übergangsfenster ist möchte ich den Code schon jetzt einlösen können, damit ich nicht auf die Sperre warten muss.

**US-3:** Als Nutzer möchte ich nach dem Einlösen sofort Zugriff auf Freitext-Analyse und Rezeptbibliothek haben, ohne die Seite neu laden oder neu einloggen zu müssen.

**US-4:** Als Nutzer möchte ich eine klare Rückmeldung erhalten wenn mein Code ungültig ist, damit ich weiß dass ich etwas falsch eingegeben habe — ohne zu wissen ob der Code existiert oder bereits verwendet wurde.

**US-5:** Als Product Owner möchte ich, dass jeder Code nur einmal eingelöst werden kann, damit ich gezielt einzelnen Personen Zugang geben kann und Codes nicht weitergegeben werden.

---

## Acceptance Criteria

- [ ] Angenommen ein Nutzer befindet sich auf `/upgrade` (Paywall oder Übergangsfenster), wenn er auf "Ich habe einen Code" klickt, dann erscheint ein Texteingabefeld für den Code auf derselben Seite (kein Seitenwechsel)
- [ ] Angenommen ein Nutzer gibt einen gültigen, noch nicht eingelösten Code ein und klickt auf "Einlösen", dann wird der Code als eingelöst markiert, sein Account erhält dauerhaften Paywall-Bypass, er sieht eine kurze Erfolgsmeldung und wird anschließend zu `/analyse` weitergeleitet
- [ ] Angenommen ein Nutzer löst einen Code erfolgreich ein, wenn er danach `/analyse` oder `/rezepte` aufruft, dann hat er vollen Zugriff — unabhängig davon ob das Übergangsfenster abgelaufen ist oder ob er ein aktives Abo hat
- [ ] Angenommen ein Nutzer gibt einen ungültigen Code ein (existiert nicht oder bereits eingelöst), dann sieht er die Meldung "Dieser Code ist ungültig oder wurde bereits verwendet." — keine Unterscheidung zwischen den beiden Fällen
- [ ] Angenommen ein Nutzer hat bereits aktiven Zugriff (aktives Abo oder Code bereits eingelöst), wenn er trotzdem einen Code eingibt, dann wird der Code **nicht verbraucht** und er sieht den Hinweis "Du hast bereits vollen Zugriff."
- [ ] Angenommen ein Nutzer versucht binnen einer Stunde mehr als 10 Codes einzugeben, dann werden weitere Versuche serverseitig abgewiesen — die Fehlermeldung ist identisch mit der normalen Fehlermeldung (kein Hinweis auf das Rate-Limit)
- [ ] Angenommen der Countdown-Hinweis während des Übergangsfensters (PROJ-11) wird angezeigt, dann enthält er einen "Code einlösen"-Link der direkt zur Code-Eingabe auf `/upgrade` führt
- [ ] Angenommen ein Code wurde eingelöst, dann ist er dauerhaft als "eingelöst" markiert und kann von keinem anderen Nutzer mehr verwendet werden

---

## Out of Scope

- Code-Generierung durch den Admin — _PROJ-13_
- Zeitlich begrenzte Codes (z.B. 30 Tage) — bewusst nicht für diese Version; dauerhafter Zugriff reicht für Beta-Phase
- Codes die zusätzliche Foto-Scans gewähren — Foto-Scan-Counter bleibt von Invite-Codes unberührt; ein eingelöster Code entspricht exakt einem aktiven Abo (Freitext + Rezepte), nicht mehr
- Codes für verschiedene Zugangsstufen (z.B. "Nur Rezepte", "Nur Analyse") — ein Code = voller Paywall-Bypass, keine Granularität
- Codes per E-Mail direkt aus der App verschicken — Admin verschickt Codes manuell außerhalb der App
- Code-Einlösung für nicht-eingeloggte Nutzer — Auth ist Voraussetzung
- Deep-Links mit Code in der URL (z.B. `/einlösen?code=XYZ`) — Einlösung nur über das Formular auf `/upgrade`
- Rückgabe oder Deaktivierung eingelöster Codes durch Nutzer — nur Admin kann Codes verwalten (PROJ-13)

---

## Edge Cases

- Nutzer hat Scans noch nicht verbraucht (kein Trial gestartet) → kein Code-Eingabefeld sichtbar, Paywall noch nicht relevant
- Nutzer gibt denselben Code zweimal ein (Doppelklick auf "Einlösen") → serverseitig idempotent: zweiter Request erkennt dass der Code bereits vom selben Nutzer eingelöst wurde → zeigt "Du hast bereits vollen Zugriff."
- Nutzer gibt Code ein während das Übergangsfenster in genau dieser Sekunde abläuft → Code-Einlösung gewinnt, Zugriff bleibt erhalten
- Nutzer öffnet `/upgrade` in zwei Tabs gleichzeitig und löst denselben Code in beiden ein → nur der erste Request verbraucht den Code (atomare DB-Operation), zweiter Request erhält "Du hast bereits vollen Zugriff." (weil der erste Request bereits den Bypass gesetzt hat)
- Netzwerkfehler während der Code-Einlösung → Fehlermeldung "Etwas ist schiefgelaufen — bitte versuche es erneut.", Code bleibt unverbraucht
- Code enthält Leerzeichen oder unterschiedliche Groß-/Kleinschreibung → serverseitig trimmen und case-insensitiv prüfen, damit Tippfehler keine frustrierende Ablehnung erzeugen

---

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Dauerhafter Zugriff (kein Ablaufdatum) | Beta-Phase braucht keine zeitliche Verwaltung; dauerhafte Codes sind einfacher zu generieren und zu erklären | 2026-06-17 |
| Einmalige Nutzung pro Code | Jede eingeladene Person bekommt einen eigenen Code — kontrollierte Vergabe, keine unkontrollierte Weitergabe | 2026-06-17 |
| Code-Eingabe nur auf `/upgrade`, kein Deep-Link | Einfachste Implementierung; Nutzer mit einem Code kommen ohnehin über die Paywall oder den Countdown-Hinweis auf `/upgrade` | 2026-06-17 |
| Gleiche Fehlermeldung für "ungültig" und "bereits eingelöst" | Verhindert, dass jemand systematisch herausfindet ob ein Code existiert (Security by Obscurity für einen niedrig-stakes Kontext) | 2026-06-17 |
| Code nicht verbrauchen wenn Nutzer bereits Zugriff hat | Verhindert irrtümliches Verbrennen eines Codes bei einem Nutzer der ihn gar nicht braucht | 2026-06-17 |
| Rate-Limit ohne sichtbaren Lockout | Schutz gegen Brute-Force ohne ehrliche Nutzer (die sich vielleicht vertippt haben) zu bestrafen | 2026-06-17 |
| Kein extra Foto-Scan-Aufladen durch Codes | Code = Paywall-Bypass = Abo-Äquivalent; Foto-Scans sind ein separates, unabhängiges Limit | 2026-06-17 |
| Case-insensitive Prüfung + automatisches Trimmen | Nutzer tippen Codes oft ab (z.B. aus einer Nachricht), Groß-/Kleinschreibung und führende Leerzeichen sollen keine frustrierende Ablehnung erzeugen | 2026-06-17 |

### Open Questions
- [ ] Wie viele Zeichen soll ein Code haben, und welches Format (z.B. `XXXX-XXXX` oder 8 zufällige alphanumerische Zeichen)? → Entscheidung bei PROJ-13 (Code-Generierung), hier nur als Hinweis: Format muss für beide Specs konsistent sein
