# PROJ-3: Mahlzeit-Input (Foto & Freitext)

## Status: Planned
**Created:** 2026-06-10
**Last Updated:** 2026-06-10

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure) — für Foto-Upload in Storage und Speicherung der Mahlzeit
- Requires: PROJ-2 (User Authentication) — Seite ist nur für eingeloggte Nutzer zugänglich

## User Stories
- Als Nutzer möchte ich ein Foto meiner Mahlzeit hochladen können, damit die KI visuell erkennen kann was ich gegessen habe.
- Als Nutzer möchte ich zusätzlich im Freitext beschreiben können was ich gegessen habe (Zutaten, Menge, Zubereitungsart), damit die Analyse präziser wird.
- Als Nutzer möchte ich auch ohne Foto nur per Text analysieren lassen können, damit ich die App auch ohne Kamera nutzen kann.
- Als Nutzer möchte ich auf Mobile direkt die Kamera öffnen oder aus der Galerie wählen können, damit der Upload so schnell wie möglich geht.
- Als Nutzer möchte ich maximal 3 Runden Rückfragen der KI beantworten, damit ich schnell zum Ergebnis komme ohne genervt zu werden.
- Als ungeduldiger Nutzer möchte ich die Rückfragen überspringen können, damit ich sofort eine Analyse bekomme — auch wenn die KI dann mit expliziten Annahmen arbeitet.

## Out of Scope
- Die KI-Logik hinter den Rückfragen (was gefragt wird, wie Nährwerte berechnet werden) — das ist PROJ-4
- Das Analyse-Ergebnis und der Sättigungs-Score — das ist PROJ-5
- Speichern der Mahlzeit in der Historie — das ist PROJ-6
- Barcode-Scanner — explizites Non-Goal (PRD)
- Mehrere Fotos pro Mahlzeit — Post-MVP, ein Foto reicht für die Analyse

## Acceptance Criteria

### Eingabe-Formular
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die Analyse-Seite aufruft, dann sieht er ein Foto-Upload-Feld und ein Freitext-Eingabefeld.
- [ ] Angenommen der Nutzer hat weder Foto noch Text eingegeben, wenn er auf "Analysieren" klickt, dann wird eine Fehlermeldung angezeigt ("Bitte mindestens ein Foto oder eine Beschreibung eingeben").
- [ ] Angenommen der Nutzer gibt nur Text ein (kein Foto), wenn er auf "Analysieren" klickt, dann startet die Analyse auf Basis des Textes.
- [ ] Angenommen der Nutzer lädt nur ein Foto hoch (kein Text), wenn er auf "Analysieren" klickt, dann startet die Analyse auf Basis des Fotos.
- [ ] Angenommen der Nutzer gibt Text und Foto ein, wenn er auf "Analysieren" klickt, dann startet die Analyse mit beiden Inputs — dies liefert die präzisesten Ergebnisse.

### Foto-Upload
- [ ] Angenommen der Nutzer öffnet die Seite auf einem Mobilgerät, wenn er auf das Upload-Feld tippt, dann kann er zwischen "Kamera" und "Galerie" wählen.
- [ ] Angenommen der Nutzer öffnet die Seite auf dem Desktop, wenn er auf das Upload-Feld klickt, dann öffnet sich der Datei-Browser; alternativ kann er ein Bild per Drag & Drop ablegen.
- [ ] Angenommen der Nutzer wählt ein Foto aus, wenn das Bild größer als 10 MB ist, dann wird eine Fehlermeldung angezeigt und das Bild nicht akzeptiert.
- [ ] Angenommen ein Foto hochgeladen wurde, wenn es im Upload-Bereich angezeigt wird, dann sieht der Nutzer eine Vorschau und kann das Foto durch ein anderes ersetzen.
- [ ] Angenommen ein Foto wurde ausgewählt, wenn es hochgeladen wird, dann wird es client-seitig auf max. 1 MB / 1200px Breite komprimiert bevor es an den Server gesendet wird.

### Rückfragen-Flow (KI — max. 3 Runden, max. 2 Fragen pro Runde)
- [ ] Angenommen die KI hat Unklarheiten nach dem initialen Input, wenn sie Rückfragen stellt, dann werden maximal 2 Fragen pro Runde angezeigt — keine Frageliste.
- [ ] Angenommen eine Rückfragerunde wird angezeigt, wenn der Nutzer die Fragen beantwortet und auf "Weiter" klickt, dann startet die nächste Runde oder — nach maximal 3 Runden — die finale Analyse.
- [ ] Angenommen eine Rückfragerunde wird angezeigt, wenn der Nutzer auf "Überspringen" klickt, dann werden keine weiteren Fragen gestellt und die Analyse startet sofort.
- [ ] Angenommen der Nutzer hat übersprungen, wenn die Analyse angezeigt wird, dann erscheint ein sichtbarer Hinweis welche Annahmen die KI getroffen hat (z.B. "Ich habe angenommen: Magerquark 0,2% Fett, gebraten in 1 EL Olivenöl").
- [ ] Angenommen die KI ist nach dem initialen Input bereits ausreichend sicher, wenn keine Rückfragen nötig sind, dann startet die Analyse direkt ohne Fragerunden.

### Ladestate
- [ ] Angenommen der Nutzer hat abgeschickt, wenn die Analyse läuft, dann wird ein Ladezustand angezeigt (kein leerer Bildschirm, keine Möglichkeit doppelt abzuschicken).

## Edge Cases
- **Nur Leerzeichen im Textfeld:** Wird als leere Eingabe gewertet — Pflichtfeldvalidierung greift.
- **Upload-Fehler (Netzwerk):** Fehlermeldung mit Option zum erneuten Versuch; Texteingabe bleibt erhalten.
- **Nicht unterstütztes Dateiformat:** Nur JPEG, PNG, WEBP erlaubt — klare Fehlermeldung bei anderen Formaten (z.B. PDF, HEIC).
- **Foto während Rückfragerunde ersetzen:** Nicht möglich — der Input ist nach dem Abschicken eingefroren. Nutzer kann von vorne beginnen.
- **Rückfragen-Timeout:** Wenn der Nutzer eine Rückfragerunde offen lässt und die Seite später wieder aufruft, startet er von vorne (kein Session-Resumé im MVP).
- **Sehr kurzer Text:** Texte unter 3 Wörtern (z.B. "Salat") werden akzeptiert, die KI stellt dann mehr Rückfragen.

## Technical Requirements
- **Mobile-first:** Upload-UI muss auf kleinen Screens (320px+) vollständig bedienbar sein; Touch-Targets min. 44px
- **Dateiformate:** JPEG, PNG, WEBP
- **Max. Dateigröße (vor Komprimierung):** 10 MB
- **Komprimierung:** Client-seitig auf max. 1 MB / 1200px Breite (→ PROJ-1 Spec)
- **Freitext-Limit:** Max. 1.000 Zeichen (Zeichenzähler sichtbar ab 800)
- **Rückfragen:** Max. 3 Runden × max. 2 Fragen = max. 6 Rückfragen gesamt

## Open Questions
- [ ] Soll das Freitext-Feld einen Placeholder-Text / Beispieleingabe zeigen, um Erstnutzern zu helfen? (z.B. "z.B. Hähnchenbrust mit Reis, in Olivenöl angebraten, dazu Gurkensalat")

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Foto optional, Text optional — mindestens eines Pflicht | Maximale Flexibilität; Bild+Text liefert beste Ergebnisse, ist aber kein Muss | 2026-06-10 |
| Max. 3 Runden × 2 Fragen | Balance zwischen Präzision und Nutzergeduld; nach 6 Fragen arbeitet KI mit Annahmen | 2026-06-10 |
| Skip-Option mit transparenten Annahmen | Ungeduld respektieren ohne Qualität zu verschweigen; Vertrauen durch Transparenz | 2026-06-10 |
| Nur ein Foto pro Mahlzeit (MVP) | Einfachheit; ein gutes Foto reicht für die KI-Analyse | 2026-06-10 |
| Kamera + Galerie auf Mobile | Mobile-first; direkte Kamera ist der natürlichste Einstieg beim Essen | 2026-06-10 |

### Technical Decisions
<!-- Added by /architecture -->

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
