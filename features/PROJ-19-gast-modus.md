# PROJ-19: Gast-Modus (Anonyme Nutzung ohne Account)

## Status: Planned
**Created:** 2026-07-07
**Last Updated:** 2026-07-07

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure) — anonyme Auth läuft über Supabase
- Requires: PROJ-2 (User Authentication) — Upgrade-Flow von anonym zu vollem Account
- Requires: PROJ-10 (Foto-Scan-Limit) — Gast-Limit nutzt dieselbe Infrastruktur; Free-Limit wird von 3 auf 5 angehoben
- Requires: PROJ-11 (Paywall) — Paywall greift erst nach Registrierung + Free-Limit-Erschöpfung

## User Stories
- Als Erstbesucher möchte ich die App sofort ausprobieren können, ohne mich registrieren zu müssen, damit ich erst sehe ob sie mir nützt.
- Als Gast möchte ich eine Mahlzeit analysieren und meinen Sättigungs-Score sehen, damit ich den Kern-Nutzen verstehe bevor ich einen Account erstelle.
- Als Gast möchte ich Rezepte durchstöbern und Art of Eating lesen, damit ich den Mehrwert der App erkenne.
- Als Gast, der 5 Foto-Analysen gemacht hat, möchte ich eine klare Einladung sehen mich zu registrieren — und meine bisherigen Analysen nicht verlieren.
- Als Gast, der sich registriert, möchte ich meine bisherigen Gast-Analysen in meiner neuen Historie sehen, damit der Übergang nahtlos ist.

## Out of Scope
- **Wochenrückblick für Gäste** — setzt persistente Historie voraus; bleibt hinter dem Account-Gate
- **Invite-Code-Einlösung für Gäste** — Codes sind an registrierte Accounts gebunden; Gäste werden zum Registrieren aufgefordert
- **Geräte-übergreifende Sync für Gäste** — anonyme Session ist browser-/gerätegebunden; kein Account = keine Cloud-Sync (by design)
- **Proaktive Registrierungs-Banner oder Pop-ups** — nur reaktive Conversion-Prompts, wenn der Gast auf eine Grenze stößt
- **Automatische Löschung alter Gast-Accounts** — Cleanup-Logik für inaktive anonyme Accounts ist ein technisches Wartungsfeature, kein Teil von PROJ-19
- **Gast-Zugang zu Admin-Routes** — `/admin` bleibt vollständig geschützt
- **Passwort-vergessen-Flow für Gäste** — Gäste haben kein Passwort; nur nach Registrierung relevant

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Automatischer Gast-Zugang

- [ ] Angenommen ein Besucher hat keinen Account und keine aktive Session, wenn er die App öffnet, dann kann er `/`, `/rezepte`, `/wie-esse-ich-richtig` ohne Anmeldung aufrufen.
- [ ] Angenommen ein Besucher startet seine erste Analyse (Foto oder Freitext), wenn er `/analyse` aufruft, dann wird im Hintergrund automatisch eine anonyme Supabase-Session erstellt — ohne sichtbare Aktion oder Prompt.
- [ ] Angenommen ein Gast hat eine aktive anonyme Session, wenn er den Browser schließt und auf demselben Gerät zurückkommt, dann ist seine Session noch aktiv und seine bisherigen Analysen sind erhalten.

### Foto-Scan-Limit für Gäste

- [ ] Angenommen ein Gast hat weniger als 5 Foto-Analysen gemacht, wenn er eine neue Foto-Analyse startet, dann läuft die Analyse normal durch.
- [ ] Angenommen ein Gast hat 5 Foto-Analysen erreicht, wenn er eine weitere Foto-Analyse starten möchte, dann erscheint ein Conversion-Prompt: *"Du hast 5 Foto-Analysen als Gast genutzt. Erstelle einen kostenlosen Account — und analysiere weiter."*
- [ ] Angenommen das Foto-Scan-Limit ist erreicht, wenn der Gast den Conversion-Prompt sieht, dann hat er direkt die Möglichkeit sich zu registrieren oder einzuloggen (kein separater Navigations-Schritt nötig).
- [ ] Angenommen ein Gast hat das Foto-Limit erreicht, wenn er stattdessen eine Freitext-Analyse startet, dann ist das weiterhin unbegrenzt möglich.

### Freitext-Analysen für Gäste

- [ ] Angenommen ein Gast nutzt die Freitext-Eingabe, wenn er beliebig viele Freitext-Analysen durchführt, dann gibt es kein Limit — die Analysen laufen durch.

### Navigation & Gast-Konto-Screen

- [ ] Angenommen ein Gast tippt auf den "Konto"-Tab in der Navigation, wenn er die Seite sieht, dann wird ein Conversion-Screen angezeigt mit: Wert-Versprechen ("Sichere deine Analysen, sieh deine Historie, erhalte deinen Wochenrückblick"), Button "Registrieren" und Link "Bereits einen Account? Einloggen".
- [ ] Angenommen ein Gast tippt auf den "Historie"-Tab, wenn er weitergeleitet wird, dann landet er auf dem `/konto`-Conversion-Screen mit kontextueller Nachricht: *"Erstelle einen kostenlosen Account um deine Analyse-Historie zu sehen."*
- [ ] Angenommen ein eingeloggter Nutzer tippt auf den "Konto"-Tab, wenn er die Seite sieht, dann wird die bestehende Konto-Übersicht (PROJ-14) wie bisher angezeigt — keine Änderung für eingeloggte Nutzer.
- [ ] Angenommen ein Gast navigiert durch die App, wenn er die Bottom-Navigation sieht, dann sind alle Tabs sichtbar (kein Ausblenden, kein Lock-Icon).

### Daten-Erhalt bei Registrierung

- [ ] Angenommen ein Gast registriert sich nach einer oder mehreren Analysen, wenn die Registrierung abgeschlossen ist, dann sind alle Gast-Analysen in seiner neuen Historie sichtbar — kein Datenverlust.
- [ ] Angenommen ein Gast loggt sich in einen bestehenden Account ein (statt neu zu registrieren), dann gehen die Gast-Analysen verloren — der bestehende Account-Datenstand bleibt erhalten. (Hinweis: technische Einschränkung von Supabase bei Identity-Merge.)

### Free-User-Limit (Änderung an PROJ-10)

- [ ] Angenommen ein registrierter Free-User hat weniger als 5 Foto-Analysen gemacht, wenn er eine neue startet, dann läuft sie normal durch.
- [ ] Angenommen ein registrierter Free-User erreicht 5 Foto-Analysen, wenn er eine weitere starten möchte, dann erscheint der bestehende Paywall-Screen (PROJ-11) — unverändert.

## Edge Cases

- **Gast löscht Cookies / Browser-Daten:** Anonyme Session geht verloren, Analysen sind nicht mehr zugänglich. Der Gast startet als neuer Gast. Keine Fehlermeldung — normales Verhalten (wie ein neuer Erstbesucher).
- **Gast nutzt anderes Gerät:** Neue anonyme Session, keine Synchronisation. By design — ohne Account kein Cloud-Sync.
- **Gast hat 5 Foto-Analysen gemacht und registriert sich:** Nach Registrierung startet der Free-Quota-Zähler frisch bei 0 (die Gast-Analysen zählen nicht gegen das neue Free-Limit). So hat der Nutzer einen positiven "Upgrade-Effekt".
- **Anonymous Sign-in schlägt fehl (Netzwerkfehler):** `/analyse` zeigt einen Fehler-Toast und verhindert den Start der Analyse. Keine kaputten Daten.
- **Gast versucht Invite-Code einzulösen:** Redirect zum Conversion-Screen mit Nachricht "Erstelle zuerst einen Account um den Einladungscode einzulösen."
- **Gast-Session läuft ab (Supabase Token-Expiry):** Token wird automatisch im Hintergrund refreshed (Standard-Supabase-Verhalten). Kein sichtbarer Effekt für den Nutzer.

## Technical Requirements
- Performance: Anonymous sign-in im Hintergrund < 500ms (kein sichtbares Laden)
- Security: Anonyme User sehen nur eigene Daten (RLS via `user_id` — wie bei regulären Usern)
- Keine neue DB-Tabelle nötig — anonyme User sind reguläre Supabase-User ohne E-Mail

## Open Questions
- [ ] Soll das Foto-Limit von 5 für Free-User (PROJ-10-Änderung) sofort beim Deploy von PROJ-19 live gehen, oder als separater Schritt? → Empfehlung: gleichzeitig, eine Änderung im Codebase.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Nur reaktive Conversion-Prompts, keine proaktiven Banner | Niederschwelliger Einstieg; Nutzer soll App erst erleben, nicht sofort bedrängt werden | 2026-07-07 |
| Freitext-Analysen unbegrenzt für Gäste | Geringere Token-Kosten als Foto; großzügiger Einstieg macht Foto-Feature als Upgrade-Argument spürbarer | 2026-07-07 |
| Foto-Limit auf 5 für Gäste UND Free-User | Konsistente Kommunikation ("5 kostenlose Foto-Analysen"); echter Upgrade-Anreiz ist Persistenz, nicht Scan-Anzahl | 2026-07-07 |
| `/konto`-Tab als Conversion-Screen für Gäste (nicht `/login`) | Nutzt bestehende Navigation; kein separater Onboarding-Screen nötig; einheitlicher Einstiegspunkt | 2026-07-07 |
| Alle Nav-Tabs für Gäste sichtbar (kein Ausblenden) | Zeigt den vollen Funktionsumfang; weckt Neugier; Lock-Icons wirken abschreckend | 2026-07-07 |
| Gast-Analysen bleiben bei Registrierung erhalten | Kritisch für UX: Datenverlust beim Sign-up würde Vertrauen zerstören; Supabase Anonymous Auth macht das möglich | 2026-07-07 |
| Beim Login in bestehenden Account: Gast-Daten gehen verloren | Technische Einschränkung von Supabase Identity-Merge; Aufwand für Edge-Case zu hoch für MVP | 2026-07-07 |
| Gast-Foto-Analysen zählen NICHT gegen neues Free-Limit nach Registrierung | Positiver "Upgrade-Effekt" als Registrierungs-Anreiz; Nutzer fühlt sich belohnt statt bestraft | 2026-07-07 |

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
