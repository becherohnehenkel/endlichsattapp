# PROJ-37: So geht abnehmen (inkl. Kcal-Rechner)

## Status: Planned
**Created:** 2026-08-31
**Last Updated:** 2026-08-31

## Dependencies
- Requires: PROJ-36 (Ernährung-Hub) — Zielseite `/ernaehrung/so-geht-abnehmen` existiert bereits als Platzhalter, wird hier mit echtem Inhalt befüllt
- Requires: PROJ-2 (User Authentication) — Unterscheidung eingeloggt/Gast für Speicherverhalten
- Requires: PROJ-19 (Gast-Modus) — Gäste dürfen den Rechner ohne Account nutzen

## User Stories
- Als eingeloggter Nutzer möchte ich meinen Kalorienbedarf berechnen und meine Eingaben gespeichert bekommen, damit ich sie beim nächsten Besuch nicht erneut eintippen muss.
- Als Gast möchte ich den Kalorienbedarf trotzdem berechnen können, ohne einen Account zu brauchen.
- Als Nutzer möchte ich zwischen drei Zielen (Fett verlieren, Gewicht halten, Muskeln aufbauen) wählen, damit ich direkt eine für mein Ziel passende Kalorienzahl sehe.
- Als eingeloggter Nutzer, dessen aktuelles Gewicht deutlich von meinem letzten gespeicherten Wert abweicht, möchte ich einen Hinweis bekommen, damit ich weiß, dass ich neu berechnen sollte.
- Als Nutzer möchte ich bei ungültigen Eingaben (z. B. Alter außerhalb des sinnvollen Bereichs) eine klare Fehlermeldung sehen, statt ein falsches Ergebnis zu bekommen.

## Out of Scope
- Tägliches Tracking/Fortschrittsanzeige gegen das berechnete Kalorienziel — explizites Non-Goal laut `docs/PRD.md` ("Kein Kalorienzählen oder Tracking von Tageskalorienzielen"), wird hier nicht gebaut
- Die anderen 4 Arbeitspunkte der Seite (Wöchentlich vs. Täglich, Warum auf Proteine achten, Krafttraining, Schlaf/Erholung) — Inhalt folgt in einer späteren Runde, hier nur sichtbare Platzhalter
- Dritte Geschlechts-Option für die Formel — bewusst auf zwei Varianten beschränkt (siehe Product Decisions)
- Automatische zeitbasierte Erinnerung (z. B. "nach 30 Tagen neu berechnen") — nur die 5kg-Abweichungsprüfung beim Bearbeiten des Gewichtsfelds

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Eingabe & Validierung
- [ ] Angenommen ein Nutzer öffnet den Kcal-Rechner, dann sieht er Eingabefelder für Gewicht (kg), Größe (cm), Alter (Jahre), Geschlecht (Männlich/Weiblich) und Aktivitätslevel (5 PAL-Stufen), sowie eine Ziel-Auswahl (Fett verlieren / Gewicht halten / Muskeln aufbauen).
- [ ] Angenommen ein Nutzer trägt ein Gewicht außerhalb von 30–300 kg ein, dann erscheint eine Inline-Fehlermeldung am Feld und der "Berechnen"-Button bleibt deaktiviert.
- [ ] Angenommen ein Nutzer trägt eine Größe außerhalb von 120–250 cm ein, dann erscheint eine Inline-Fehlermeldung am Feld und der "Berechnen"-Button bleibt deaktiviert.
- [ ] Angenommen ein Nutzer trägt ein Alter außerhalb von 14–100 Jahren ein, dann erscheint eine Inline-Fehlermeldung am Feld und der "Berechnen"-Button bleibt deaktiviert.
- [ ] Angenommen alle Felder sind gültig ausgefüllt, dann ist der "Berechnen"-Button aktiv.

### Berechnung
- [ ] Angenommen ein Nutzer klickt auf "Berechnen", dann wird der Grundumsatz per Mifflin-St-Jeor-Formel berechnet (Männer: 10×Gewicht + 6,25×Größe − 5×Alter + 5; Frauen: 10×Gewicht + 6,25×Größe − 5×Alter − 161) und mit dem gewählten PAL-Faktor multipliziert, um den Erhaltungsbedarf ("Gewicht halten") zu ermitteln.
- [ ] Angenommen das Ziel "Fett verlieren" ist gewählt, dann zeigt das Ergebnis 90 % des Erhaltungsbedarfs.
- [ ] Angenommen das Ziel "Gewicht halten" ist gewählt, dann zeigt das Ergebnis exakt den Erhaltungsbedarf (100 %).
- [ ] Angenommen das Ziel "Muskeln aufbauen" ist gewählt, dann zeigt das Ergebnis 110 % des Erhaltungsbedarfs.
- [ ] Angenommen ein Ergebnis wird angezeigt, dann ist die kcal-Zahl auf ganze Zahlen gerundet.

### Speichern (eingeloggte Nutzer)
- [ ] Angenommen ein eingeloggter Nutzer klickt auf "Berechnen", dann werden Gewicht, Größe, Alter, Geschlecht, Aktivitätslevel und Ziel automatisch gespeichert (kein separater Speichern-Schritt).
- [ ] Angenommen ein eingeloggter Nutzer mit gespeicherten Werten öffnet die Seite erneut, dann sind alle Felder mit den zuletzt gespeicherten Werten vorausgefüllt und das zuletzt berechnete Ergebnis wird sofort angezeigt (ohne erneuten Klick).
- [ ] Angenommen ein eingeloggter Nutzer ändert das Gewichtsfeld auf einen Wert, der um mindestens 5 kg vom zuletzt gespeicherten Gewicht abweicht, dann erscheint ein Hinweis, dass er neu berechnen sollte, damit die Werte übereinstimmen.
- [ ] Angenommen das Speichern schlägt fehl (z. B. Netzwerkfehler), dann wird das berechnete Ergebnis trotzdem angezeigt, zusätzlich erscheint ein Hinweis, dass das Speichern fehlgeschlagen ist.

### Gäste
- [ ] Angenommen ein Gast (keine Session oder anonym) öffnet den Kcal-Rechner, dann sind alle Felder leer, keine Werte werden vorausgefüllt.
- [ ] Angenommen ein Gast berechnet ein Ergebnis, dann wird nichts gespeichert — beim nächsten Besuch sind die Felder wieder leer.

### Seiten-Struktur "So geht abnehmen"
- [ ] Angenommen ein Nutzer öffnet `/ernaehrung/so-geht-abnehmen`, dann sieht er den Kcal-Rechner als ersten, voll funktionsfähigen Arbeitspunkt sowie 4 weitere Einträge (Wöchentlich vs. Täglich, Warum auf Proteine achten, Krafttraining, Schlaf/Erholung) als sichtbare "Bald verfügbar"-Platzhalter.
- [ ] Angenommen die Seite wird angezeigt, dann bleibt der bestehende Breadcrumb-Header ("Ernährung / So geht abnehmen") aus PROJ-36 erhalten.

## Edge Cases
- Gast berechnet mehrfach hintereinander mit unterschiedlichen Werten → jedes Mal ein frisches, unabhängiges Ergebnis, nichts wird gespeichert oder überschrieben.
- Eingeloggter Nutzer berechnet zum ersten Mal (keine vorher gespeicherten Werte) → Formular startet leer, kein 5kg-Hinweis möglich (kein Vergleichswert vorhanden).
- Nutzer wechselt nur das Ziel (z. B. Fett verlieren → Muskeln aufbauen), ohne Gewicht/Größe/Alter zu ändern → sofortige Neuberechnung, keine 5kg-Warnung (nur eine Gewichtsänderung löst die Warnung aus).
- Sehr extreme, aber technisch valide Eingaben (z. B. 300 kg + 120 cm) → Formel liefert trotzdem ein Ergebnis, keine zusätzliche Plausibilitätsprüfung über die harten Grenzen hinaus (bewusst einfach gehalten).

## Technical Requirements (optional)
- Security: Gespeicherte Biometrie-Daten sind personenbezogen — Zugriff ausschließlich auf die eigenen Daten des eingeloggten Nutzers (RLS), Details in `/architecture`/`/backend`.

## Open Questions
- [ ] Exakte Copy/Reihenfolge der 4 übrigen Arbeitspunkte (Wöchentlich vs. Täglich, Proteine, Krafttraining, Schlaf/Erholung) — folgt in einer späteren Runde.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Rechner bleibt zustandslos für Gäste, aber persistent für eingeloggte Nutzer | Nutzerwunsch: beide Zielgruppen bedienen, ohne Login-Zwang für die Grundfunktion | 2026-08-31 |
| Ziel (Fett verlieren/Halten/Muskeln aufbauen) wird mitgespeichert | Nutzerkorrektur — soll beim nächsten Besuch ebenfalls vorausgefüllt sein, nicht nur die Biometrie | 2026-08-31 |
| Autosave bei jeder Berechnung statt explizitem Speichern-Button | Einfachste UX, vom Nutzer bestätigt | 2026-08-31 |
| 5kg-Abweichungs-Hinweis beim Bearbeiten des Gewichtsfelds | Verhindert, dass gespeichertes Ergebnis und tatsächliches aktuelles Gewicht stillschweigend auseinanderlaufen | 2026-08-31 |
| Kein tägliches Tracking/Fortschritts-UI gegen das Kalorienziel | Explizites PRD-Non-Goal ("Kein Kalorienzählen oder Tracking von Tageskalorienzielen") — Rechner bleibt einmaliges, edukatives Tool | 2026-08-31 |
| Nur zwei Geschlechts-Optionen (Männlich/Weiblich) für die Formel | Mifflin-St-Jeor kennt rechnerisch nur diese zwei Varianten; bewusste Nutzerentscheidung gegen eine dritte Option | 2026-08-31 |
| 5 PAL-Stufen (1,2 / 1,375 / 1,55 / 1,725 / 1,9) | Gängige Standard-Skala, vom Nutzer bestätigt | 2026-08-31 |
| Wertebereiche: Gewicht 30–300 kg, Größe 120–250 cm, Alter 14–100 Jahre | Verhindert offensichtlich unsinnige Eingaben, vom Nutzer bestätigt | 2026-08-31 |
| Kcal-Rechner startet als einziger fertiger Arbeitspunkt, restliche 4 als Platzhalter | Content-Aufwand für die anderen 4 Themen folgt separat; der Rechner ist eigenständig wertstiftend und muss nicht darauf warten | 2026-08-31 |

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
