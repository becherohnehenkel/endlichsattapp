# PROJ-4: KI-Analyse-Agent (Rückfragen + BLS + Makros)

## Status: Planned
**Created:** 2026-06-10
**Last Updated:** 2026-06-10

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure) — Analyse-Ergebnis wird in `meal_analyses` gespeichert
- Requires: PROJ-3 (Mahlzeit-Input) — liefert Foto und/oder Freitext als Input für den Agenten

## User Stories
- Als Nutzer möchte ich dass die KI kritisch nachfragt welche genaue Zutat verwendet wurde (z.B. Magerquark vs. Sahnequark, welches Öl, wie viel davon), damit die Analyse auf echten Daten basiert und nicht auf Annahmen.
- Als Nutzer möchte ich dass die KI bei unklaren Mengen nachfragt (z.B. "Wie viele Esslöffel Olivenöl?", "Wie viel von der Packung?"), damit die Nährstoffberechnung so präzise wie möglich ist.
- Als Nutzer möchte ich die Makronährstoffe meiner Mahlzeit qualitativ verstehen ("proteinreich", "ballaststoffarm"), damit ich ein Gefühl für das Essen bekomme statt mich von Zahlen leiten zu lassen.
- Als Nutzer möchte ich die Grammangaben als sekundäre Information sehen (kleiner, ausgegraut), damit ich sie nachschlagen kann ohne sie aufgezwungen zu bekommen.
- Als Nutzer möchte ich wissen wenn die KI unsicher ist oder mit Annahmen arbeitet, damit ich dem Ergebnis angemessen vertrauen kann.

## Out of Scope
- Sättigungs-Score und Bewertung der 6 Bausteine — das ist PROJ-5
- Verbesserungsvorschläge — das ist PROJ-5
- Anzeige des Ergebnisses (UI/Ausgabe-Screen) — das ist PROJ-5
- Mikronährstoffe, Vitamine, Mineralstoffe — Post-MVP
- Rezept-Datenbank oder Mahlzeit-Templates — Post-MVP
- Kalorien als primäre Metrik — Kalorien erscheinen nur als sekundäre Zusatzinfo

## Acceptance Criteria

### Zutaten-Identifikation & Rückfragen
- [ ] Angenommen der Nutzer hat nur ein Foto eingereicht, wenn die KI ein Gericht erkennt aber die Zutaten unklar sind, dann stellt sie gezielte Rückfragen zu den wichtigsten Unklarheiten (max. 2 pro Runde, max. 3 Runden).
- [ ] Angenommen ein Lebensmittel kann sehr unterschiedliche Nährstoffe haben je nach Variante (z.B. Quark 0,2% vs. 40% Fett), wenn der Nutzer es nennt ohne Spezifikation, dann fragt die KI explizit nach der genauen Variante.
- [ ] Angenommen die Zubereitungsart beeinflusst die Nährstoffe erheblich (z.B. in viel Öl gebraten vs. im Ofen gebacken), wenn der Nutzer sie nicht nennt, dann fragt die KI danach.
- [ ] Angenommen Mengenangaben fehlen für eine Zutat die das Ergebnis stark beeinflusst, wenn die KI unsicher über die Portion ist, dann fragt sie konkret nach (z.B. "Wie viele Esslöffel Olivenöl? Wie viel von der Packung?").
- [ ] Angenommen der Nutzer hat alle Fragen beantwortet oder übersprungen, wenn die KI eine finale Zutatenliste erstellt, dann listet sie alle identifizierten Zutaten mit geschätzten Mengen auf — inklusive Kennzeichnung von Annahmen.

### Nährstoffberechnung
- [ ] Angenommen die Zutatenliste ist finalisiert, wenn die KI die Nährstoffe berechnet, dann nutzt sie den Bundeslebensmittelschlüssel (BLS) als primäre Quelle; für internationale oder verarbeitete Lebensmittel ergänzend USDA FoodData Central und Open Food Facts.
- [ ] Angenommen ein Lebensmittel ist in keiner Datenbank gefunden, wenn die KI trotzdem eine Schätzung vornimmt, dann kennzeichnet sie diesen Wert explizit als Schätzung ("geschätzter Wert — nicht in Datenbank gefunden").
- [ ] Angenommen die Berechnung ist abgeschlossen, dann gibt der Agent folgende Nährstoffe aus: Protein (g), Kohlenhydrate gesamt (g), davon Zucker (g), Fett (g), Ballaststoffe (g), Energie (kcal) — jeweils für die Gesamtmahlzeit.

### Ausgabe-Format
- [ ] Angenommen die Nährstoffberechnung ist fertig, wenn die Ergebnisse angezeigt werden, dann steht die qualitative Einschätzung im Vordergrund (z.B. "proteinreich", "ballaststoffarm", "fettreich") und die Grammangaben erscheinen klein und ausgegraut daneben.
- [ ] Angenommen Annahmen getroffen wurden (durch Skip oder fehlende Angaben), wenn das Ergebnis angezeigt wird, dann erscheint ein deutlicher Hinweis welche Annahmen gemacht wurden (z.B. "Ich habe angenommen: Magerquark 0,2% Fett, 1 EL Olivenöl ca. 10g").
- [ ] Angenommen die KI hat eine Portion selbst geschätzt weil keine Mengenangabe vorlag, wenn sie das Ergebnis ausgibt, dann zeigt sie die angenommene Menge an (z.B. "Angenommene Portion: ~200g Hähnchenbrust").

### Fehlerverhalten
- [ ] Angenommen das Foto zeigt kein erkennbares Lebensmittel (z.B. ein Tisch, verschwommen), wenn die KI es nicht identifizieren kann, dann teilt sie das dem Nutzer mit und fordert ihn auf eine Textbeschreibung hinzuzufügen.
- [ ] Angenommen die Nährstoffdatenbank ist nicht erreichbar, wenn die KI die Analyse trotzdem durchführt, dann nutzt sie ihr eigenes Ernährungswissen und kennzeichnet alle Werte als Schätzungen.
- [ ] Angenommen die Analyse dauert länger als erwartet, wenn der Nutzer wartet, dann sieht er einen aktiven Ladezustand mit kurzer Statusmeldung (z.B. "Zutaten werden analysiert…", "Nährwerte werden berechnet…").

## Edge Cases
- **Sehr zusammengesetztes Gericht** (z.B. Lasagne): KI schätzt Bestandteile aus typischen Rezepten und kennzeichnet die Unsicherheit; fragt ggf. nach Hauptzutaten.
- **Unbekannte Eigenkreation:** Nutzer beschreibt ein Rezept das kein Standard-Gericht ist — KI rechnet Zutat für Zutat durch.
- **Alkohol in der Mahlzeit** (z.B. Wein in der Sauce): Wird als Zutat erfasst und in die Kalorien eingerechnet; kein moralisierender Kommentar.
- **Sehr kleine Mengen** (z.B. Gewürze, Kräuter): KI ignoriert Gewürze für die Nährstoffberechnung wenn sie keinen signifikanten Beitrag leisten — transparente Notiz dazu.
- **Mehrere Gänge auf einmal:** Nutzer beschreibt Vorspeise + Hauptgericht — KI analysiert alles zusammen als eine Mahlzeit.
- **Foto + Text widersprechen sich** (z.B. Foto zeigt Pasta, Text sagt "Salat"): KI weist auf den Widerspruch hin und fragt nach Klärung.

## Technical Requirements
- **Primäre Nährstoffdatenbank:** Bundeslebensmittelschlüssel (BLS) — Details zur Integration in `/architecture`
- **Sekundäre Quellen:** USDA FoodData Central, Open Food Facts
- **Sprache:** Agent kommuniziert auf Deutsch; Rückfragen und Ausgaben sind auf Deutsch
- **Rückfragen-Limit:** Max. 3 Runden × 2 Fragen = max. 6 Rückfragen (aus PROJ-3)
- **Ausgabe-Nährstoffe:** Protein (g), KH gesamt (g), davon Zucker (g), Fett (g), Ballaststoffe (g), Energie (kcal)
- **Annahmen-Transparenz:** Jede getroffene Annahme wird im Ergebnis explizit aufgelistet
- **Ausgabe-Struktur:** Maschinenlesbar (JSON intern) damit PROJ-5 darauf aufbauen kann

## Open Questions
- [ ] Wie wird der BLS technisch integriert? (Download + eigene DB, externe API, oder KI-Wissen als Fallback?) — Entscheidung in `/architecture PROJ-4`
- [ ] Soll die verfeinerte Zutatenliste dem Nutzer vor der finalen Berechnung zur Bestätigung gezeigt werden ("Habe ich das richtig verstanden: …?") oder läuft das automatisch durch?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Qualitativ primär, Gramm sekundär (ausgegraut) | "Gefühl für das Essen" statt Zahlenfetischismus; passt zum Positioning "nach dem Kalorienzählen" | 2026-06-10 |
| Kalorien nur als sekundäre Zusatzinfo | Kalorien sind nicht die Kernmetrik der App; sie erscheinen für Orientierung, nicht als Hauptfokus | 2026-06-10 |
| Mengen werden aktiv nachgefragt wenn relevant | Präzision hat Priorität; Annahmen nur wenn Nutzer überspringt oder keine Angabe möglich | 2026-06-10 |
| Keine Mikronährstoffe im MVP | Komplexität ohne direkten Mehrwert für Sättigungsanalyse; Post-MVP | 2026-06-10 |
| BLS primär + USDA + Open Food Facts supplementär | Deutsche App braucht deutsche Referenzdatenbank; internationale Ergänzung für globale Lebensmittel | 2026-06-10 |
| Kein moralisierender Kommentar zu Alkohol | Nutzer sind informierte Erwachsene; App analysiert, urteilt nicht | 2026-06-10 |

### Technical Decisions
<!-- Added by /architecture -->

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
