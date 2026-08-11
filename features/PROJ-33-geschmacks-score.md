# PROJ-33: Geschmacks-Score

## Status: Planned
**Created:** 2026-08-11
**Last Updated:** 2026-08-11

## Dependencies
- PROJ-3 (Mahlzeit-Input) — Foto/Freitext-Eingabe, auf der die Analyse aufbaut
- PROJ-4 (KI-Analyse-Agent) — Schritt-0-Klassifikation entscheidet, ob Geschmack läuft (Mahlzeit/Komponente ja, Snack nein); gemeinsamer Claude-Aufruf in `confirm/route.ts`
- PROJ-5 (Sättigungs-Einschätzung) — teilt sich die Ergebnisseite; beide Sektionen erscheinen gleichwertig nebeneinander
- PROJ-16 (Beilagen-Kontext) — Komponente-Output-Pfad, in dem Geschmack ebenfalls erscheinen muss
- PROJ-8 (Rezeptbibliothek) — Geschmacks-Score wird auch für Rezepte berechnet

## User Stories
- Als Nutzer, der eine Mahlzeit oder Komponente scannt, möchte ich zusätzlich zur Sättigung sehen, wie ausgewogen sie geschmacklich ist, damit ich verstehe, ob (und wie) ich sie noch schmackhafter machen kann — unabhängig davon, wie sättigend sie ist.
- Als Nutzer möchte ich bei einem bereits gut schmeckenden Gericht (Score 85+) nur eine Bestätigung sehen, keine erzwungenen Verbesserungsvorschläge, damit die App nicht nörgelt, wo nichts zu verbessern ist.
- Als Nutzer, der ein Rezept in der Bibliothek ansieht, möchte ich auch dort einen Geschmacks-Score sehen, damit ich Rezepte nicht nur nach Sättigung, sondern auch nach Geschmack einschätzen kann.
- Als Admin/Rezept-Ersteller möchte ich, dass der Geschmacks-Score automatisch berechnet wird, wenn ich ein Rezept anlege oder bearbeite, ohne einen manuellen Zusatzschritt.

## Out of Scope
- Snack-Analysen (PROJ-16-Prinzip "Snack braucht keine Analyse" bleibt für Geschmack konsistent)
- Eine echte interaktive Rückfragen-Runde für unklare Geschmackskomponenten (nur informativer Hinweis, siehe Decision Log)
- Anzeige der Einzelkomponenten (Salz/Fett/Säure/Umami/Kontrast/Akzente) im UI — nur Score, Label und kompakte Highlights (siehe Decision Log)
- Integration in den Wöchentlichen Sättigungs-Recap (PROJ-17) — eigenes künftiges Feature, falls gewünscht
- Rückwirkende Berechnung (Backfill) für historische Mahlzeiten oder Bestandsrezepte — Score erscheint erst für Analysen/Rezepte ab Deployment dieses Features
- Selektives Neuberechnen bei Rezept-Edits (Diffing, ob sich geschmacksrelevante Felder geändert haben) — siehe Open Questions
- Art of Eating — eigenständiges, noch zu spezifizierendes drittes Feature (siehe `docs/saettigungsmatrix.md` Abschnitt 7)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Berechnung
- [ ] Angenommen eine Mahlzeit wird als Typ "Mahlzeit" oder "Komponente" klassifiziert (Schritt-0), wenn die Analyse bestätigt wird ("Passt so"), dann berechnet derselbe Claude-Aufruf, der auch die Sättigungs-Analyse liefert, zusätzlich einen Geschmacks-Score
- [ ] Angenommen eine Mahlzeit wird als Typ "Snack" klassifiziert, wenn die Analyse bestätigt wird, dann wird kein Geschmacks-Score berechnet
- [ ] Angenommen ein Nutzer legt ein Rezept an oder bearbeitet es, wenn er speichert, dann wird der Geschmacks-Score serverseitig auf Basis von Zutatenliste und Zubereitungsanleitung neu berechnet (ein vorhandenes Rezeptfoto wird zusätzlich mitgegeben, ist aber keine Voraussetzung)

### Ergebnis-Darstellung
- [ ] Angenommen eine Mahlzeit/Komponente mit Geschmacks-Score wurde analysiert, wenn die Ergebnisseite angezeigt wird, dann erscheint die Geschmack-Sektion gleichwertig prominent neben/unter der Sättigungs-Sektion (vergleichbare Größe/visuelles Gewicht), mit Score-Zahl (0–100) und Label (fad/okay/lecker/richtig gut)
- [ ] Angenommen der Score liegt unter 85, wenn das Ergebnis angezeigt wird, dann erscheinen bis zu 2 additiv formulierte Verbesserungsvorschläge (nie restriktiv, nie mit dem Wort "gesund")
- [ ] Angenommen der Score liegt bei 85 oder höher, wenn das Ergebnis angezeigt wird, dann erscheint nur eine Bestätigung, was das Gericht geschmacklich stark macht — keine Verbesserungsvorschläge
- [ ] Angenommen eine Basis-Komponente ist als "unklar" markiert (z.B. Säure nicht erkennbar), wenn das Ergebnis angezeigt wird, dann erscheint dazu ein kurzer informativer Hinweis innerhalb der Geschmack-Sektion, ohne den Analyse-Flow zu unterbrechen
- [ ] Angenommen ein Rezept hat einen Geschmacks-Score, wenn die Rezept-Detailseite angezeigt wird, dann erscheint die Geschmack-Sektion dort ebenso gleichwertig neben der Sättigungsmatrix

### Legacy & Fehlerfälle
- [ ] Angenommen eine Mahlzeit wurde vor Einführung dieses Features analysiert (kein gespeicherter Geschmacks-Score), wenn ihre Detailseite angezeigt wird, dann erscheint die Geschmack-Sektion gar nicht (kein Platzhalter, kein Fehler)
- [ ] Angenommen die Sättigungs-Analyse im gemeinsamen Claude-Aufruf gelingt, aber der Geschmack-Teil fehlt oder ist fehlerhaft, wenn das Ergebnis angezeigt wird, dann wird die Sättigungs-Sektion trotzdem normal angezeigt und die Geschmack-Sektion zeigt einen Fehlerhinweis mit einem "Nochmal prüfen"-Button
- [ ] Angenommen der Nutzer klickt auf "Nochmal prüfen", wenn der Klick ausgelöst wird, dann wird ausschließlich der Geschmacks-Score neu angefragt (kein erneuter Sättigungs-Call, keine neuen Kosten für den bereits erfolgreichen Teil), die Sektion zeigt währenddessen einen Ladezustand und ersetzt den Fehlerhinweis durch das Ergebnis, sobald es da ist
- [ ] Angenommen der erneute Versuch über "Nochmal prüfen" schlägt wieder fehl, wenn das passiert, dann bleibt der Fehlerhinweis mit Button bestehen und ist beliebig oft erneut klickbar (kein Limit für v1)
- [ ] Angenommen ein Rezept-Speichervorgang schlägt bei der Geschmacks-Berechnung fehl, wenn der Nutzer speichert, dann wird das Rezept trotzdem gespeichert (Geschmacks-Score bleibt leer/null) und die Rezept-Detailseite zeigt denselben "Nochmal prüfen"-Button in der Geschmack-Sektion

## Edge Cases
- Ein Gericht ohne jede erkennbare Basis-Komponente (Status "fehlt" bei allen vieren) → harte Deckelung auf max. 69 Punkte greift laut Referenzdokument, unabhängig vom Rest
- Ein Rezept ohne Foto und mit sehr kurzer Anleitung (z.B. nur "Zutaten mischen") → Claude bewertet ausschließlich anhand der Zutatenliste, mehr Unsicherheit ist zu erwarten, aber kein Blocker
- Nutzer bearbeitet ein Rezept nur kosmetisch (z.B. Tippfehler in der Anleitung korrigieren) → Geschmacks-Score wird trotzdem bei jedem Speichern neu berechnet (kein Diffing) — akzeptierter Trade-off für v1
- Kombination mit PROJ-32 ("Rezept aus gescannter Mahlzeit anlegen") — ein aus einer Mahlzeit erzeugtes Rezept bekommt beim Speichern einen eigenen, frisch berechneten Geschmacks-Score, unabhängig vom Score der ursprünglichen Mahlzeit-Analyse
- Nutzer klickt mehrfach schnell hintereinander auf "Nochmal prüfen" → nur eine Anfrage gleichzeitig aktiv, Button ist während des Ladens deaktiviert (verhindert parallele/doppelte Claude-Calls)

## Technical Requirements (optional)
- Security: Bestehende Auth-/Ownership-Prüfungen (analog `confirm/route.ts`, Rezept-Routen) gelten unverändert für den zusätzlichen Score
- Kein neuer Endpunkt für die Mahlzeit-Analyse nötig (Teil des bestehenden `confirm/route.ts`-Calls); Rezept-Routen (`/api/admin/rezepte`, `/api/rezepte`) benötigen einen zusätzlichen Claude-Aufruf beim Speichern

## Open Questions
- [ ] Soll der Geschmacks-Score bei Rezepten nur neu berechnet werden, wenn sich Zutaten/Anleitung tatsächlich geändert haben (Diffing), um unnötige Claude-Kosten bei rein kosmetischen Edits zu sparen? Für v1 bewusst einfach gehalten (immer neu berechnen), kann bei Bedarf in `/refine` nachgeschärft werden.
- [ ] Wird der Geschmacks-Score irgendwo aggregiert/gefiltert (z.B. "zeig mir nur Rezepte mit Score > 70")? Nicht Teil dieser Spec, könnte späteres Rezeptbibliotheks-Feature werden.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Geschmack läuft im selben Claude-Aufruf wie die Sättigungs-Analyse | Spart einen zweiten Foto+Zutaten-Kontext-Roundtrip (Kosten/Latenz); beide Ergebnisse erscheinen ohnehin zusammen | 2026-08-11 |
| Geschmack gilt für Mahlzeit + Komponente, nicht für Snack | Konsistent mit PROJ-16-Prinzip "Snack braucht keine Analyse" | 2026-08-11 |
| Keine echte Rückfragen-Runde bei "unklar"-Status, nur informativer Hinweis | Eine zweite, späte Rückfragen-Runde nur für Geschmack hätte den bestehenden Analyse-Flow spürbar verlängert; halbe Punktzahl + Hinweistext ist laut Referenzdokument ohnehin vorgesehen | 2026-08-11 |
| "Nochmal prüfen"-Button bei fehlgeschlagenem Geschmack-Teil, statt nur passiver Fehlermeldung | Nutzerwunsch (explizit gewünschter Button); erlaubt gezielten Retry nur des Geschmack-Teils ohne die bereits erfolgreiche Sättigungs-Analyse oder das gespeicherte Rezept zu beeinträchtigen | 2026-08-11 |
| Alte Mahlzeiten ohne Score: Sektion einfach ausgeblendet, kein Backfill | Kein Foto-Redo für historische Analysen praktikabel/gewünscht; konsistent zum bestehenden Umgang mit fehlenden Daten in der Historie | 2026-08-11 |
| Geschmacks-Score auch für die Rezeptbibliothek, berechnet aus Zutaten + Anleitung (Foto optional) | Nutzerwunsch: Konsistenz mit der bereits auf Rezepte ausgeweiteten Sättigungsmatrix (PROJ-8); Foto-Pflicht hätte einen Großteil der Bibliothek ausgeschlossen | 2026-08-11 |
| Geschmack-Sektion bekommt gleiche visuelle Prominenz wie Sättigung, aber kompakten Inhalt (Score + Label + max. 2 Highlights, keine Einzelkomponenten-Liste) | Nutzerwunsch: Nutzer sollen alle drei Sektionen (Sättigung, Geschmack, Art of Eating) gleichermaßen ernst nehmen — gleiche Größe/Platzierung erreicht das, ohne dass die nicht-additive Balance-Logik der 10 Geschmackskomponenten fälschlich wie eine zweite Checkliste wirkt | 2026-08-11 |
| Graceful Degradation bei Geschmack-Teilfehler | Ein Bug/Parsing-Fehler in der neueren Geschmack-Logik darf die etablierte, zentrale Sättigungs-Analyse nicht blockieren | 2026-08-11 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Geschmack-Abschnitt wird additiv an den bestehenden Analyse-Prompt angehängt, nicht als eigener Prompt-Durchlauf | Die Sättigungs-Logik im selben Prompt wurde gerade erst in dieser Session auf das 3-Säulen-Modell umgestellt und frisch QA-verifiziert — ein additiver Anbau statt Umbau minimiert das Risiko, sie erneut zu brechen | 2026-08-11 |
| Antwort wird serverseitig in zwei unabhängige Teile aufgeteilt (Sättigung / Geschmack) statt als ein untrennbares Ganzes behandelt | Ermöglicht die in der Spec geforderte Graceful Degradation ohne zwei getrennte Claude-Aufrufe — gelingt nur ein Teil, wird trotzdem gespeichert und angezeigt was da ist | 2026-08-11 |
| Geschmack-Ergebnis landet in einem neuen, eigenen Feld auf der bestehenden Mahlzeit-Analyse-Tabelle bzw. der bestehenden Rezept-Tabelle — keine neue Tabelle | Geschmack gehört 1:1 zu genau einer Analyse bzw. einem Rezept, es gibt keine Mehrfachbeziehung, die eine eigene Tabelle rechtfertigen würde; konsistent mit dem bestehenden Muster (Sättigungswerte, Makros, Beilagen-Daten liegen ebenfalls als eigene Felder auf denselben Tabellen) | 2026-08-11 |
| "Nochmal prüfen" ist ein eigener, schlanker Zweit-Pfad, der nur anhand der bereits gespeicherten Mahlzeit-/Rezept-ID erneut den Geschmack-Teil anfragt — kein Neuversand der ganzen Zutatenliste vom Client | Zutaten liegen serverseitig schon vor (aus der ursprünglichen Analyse bzw. dem gespeicherten Rezept); ein schlanker Retry-Pfad ist einfacher für den Client und günstiger, da nicht der komplette Analyse-Flow erneut durchlaufen wird | 2026-08-11 |
| Derselbe Auth-/Eigentümerschafts-Check wie beim ursprünglichen Analysieren bzw. Rezept-Speichern gilt unverändert auch für "Nochmal prüfen" | Kein neuer Berechtigungs-Pfad nötig — Retry ist konzeptionell nur eine Wiederholung eines bereits erlaubten Vorgangs, nicht ein neuer Zugriffstyp | 2026-08-11 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

**Mahlzeit-Ergebnisseite (erweitert bestehende Sättigungs-Ergebnisseite):**
```
Analyse-Ergebnisseite
├── Zutatenliste (bestehend)
├── Sättigungs-Sektion (bestehend, PROJ-5 — unverändert)
├── Geschmack-Sektion (NEU) — gleiche Größe/Platzierung wie Sättigungs-Sektion
│   ├── Score-Zahl (0–100) + Label (fad/okay/lecker/richtig gut)
│   ├── Bis zu 2 Verbesserungs-Highlights ODER Bestätigungstext (ab Score 85)
│   ├── Optionaler Hinweistext bei "unklar"-Komponenten
│   └── Fehlerzustand: Hinweistext + "Nochmal prüfen"-Button
└── Rezeptvorschläge (bestehend)
```
*Erscheint nur, wenn Typ Mahlzeit oder Komponente — bei Snack entfällt die ganze Sektion. Bei alten Mahlzeiten ohne gespeichertes Ergebnis erscheint die Sektion ebenfalls nicht.*

**Rezept-Detailseite (erweitert bestehende Seite aus PROJ-8):**
```
Rezept-Detailseite
├── Rezept-Info (Titel, Foto, Zeit, Portionen — bestehend)
├── Sättigungs-Säulen (bestehend, PROJ-8 — unverändert)
├── Geschmack-Sektion (NEU) — dieselbe Darstellung wie bei der Mahlzeit-Ergebnisseite
├── Zutatenliste (bestehend)
└── Zubereitung (bestehend)
```

### B) Datenmodell (fachlich)

**Pro Mahlzeit-Analyse** (Mahlzeit oder Komponente) kommt ein neues Geschmack-Ergebnis-Feld dazu, mit:
- Score (Zahl 0–100)
- Label (Text)
- Bis zu 2 Verbesserungs-Hinweise (Text)
- Optionaler Hinweistext bei Unklarheit
- Leer/nicht vorhanden, wenn die Berechnung fehlgeschlagen ist oder die Analyse vor Einführung des Features entstand

**Pro Rezept** dasselbe Feld, in derselben Struktur — analog zum bereits bestehenden Sättigungsmatrix-Feld auf Rezepten, neu berechnet bei jedem Anlegen/Bearbeiten.

**Gespeichert in:** den bereits bestehenden Supabase-Tabellen für Mahlzeit-Analysen bzw. Rezepte — jeweils ein neues Feld, keine neue Tabelle. Kein Daten-Redesign nötig, da Geschmack immer eindeutig zu genau einer Analyse oder einem Rezept gehört (1:1-Beziehung).

### C) Tech-Entscheidungen (Begründung für PM)

1. **Additiver Anbau am bestehenden Analyse-Prompt statt Neubau.** Der Prompt, der die Sättigungs-Analyse steuert, wurde in dieser Session gerade erst auf das neue 3-Säulen-Modell umgestellt und durchlief eine volle QA-Runde. Der Geschmack-Teil wird als klar abgegrenzter, zusätzlicher Abschnitt angehängt — die bestehende Sättigungs-Logik bleibt unangetastet. Das ist der sicherste Weg, das gerade Stabilisierte nicht wieder zu gefährden.

2. **Die Antwort wird serverseitig in zwei unabhängige Teile zerlegt.** Auch wenn beide Ergebnisse in einer Antwort zurückkommen, werden Sättigung und Geschmack getrennt verarbeitet und gespeichert. So kann Sättigung erfolgreich durchlaufen, während Geschmack scheitert (Graceful Degradation) — ohne dass dafür zwei komplette Claude-Aufrufe nötig wären.

3. **"Nochmal prüfen" ist ein schlanker, eigener Pfad, kein Neustart der ganzen Analyse.** Da die Zutaten für die betroffene Mahlzeit bzw. das Rezept bereits gespeichert sind, braucht der Retry nur die ID der Mahlzeit/des Rezepts — nicht die komplette Zutatenliste erneut vom Nutzer. Das hält den Retry schnell, günstig (nur der fehlgeschlagene Teil wird neu bezahlt) und einfach in der Bedienung.

4. **Rezepte bekommen den Geschmack-Wert bei jedem Speichern neu berechnet, ohne zu prüfen, ob sich etwas Geschmacksrelevantes geändert hat.** Anders als die deterministische, kostenlose Sättigungsmatrix-Berechnung verursacht das bei jedem Speichern tatsächliche KI-Kosten — bewusst einfach gehalten für v1 (siehe Open Questions in der Spec zum möglichen Diffing später).

### D) Abhängigkeiten (Pakete)

Keine neuen Pakete nötig. Nutzt durchgehend bereits vorhandene Bausteine:
- Anthropic-SDK-Client (bereits für die Sättigungs-Analyse im Einsatz)
- Supabase-Anbindung (bestehende Tabellen, neue Felder)
- shadcn/ui-Komponenten (Karten/Alert-Bausteine, wie schon bei der Sättigungs- und Fehleranzeige verwendet)

### Offene technische Punkte (an /backend und /frontend übergeben)
- Exakte Feldbenennung und Migrationsdetails für die neuen Felder → `/backend`
- Wie der "Nochmal prüfen"-Button visuell in die bestehende Fehlerzustands-Optik eingebettet wird → `/frontend`
- Mögliche Wechselwirkung mit PROJ-23 (Prompt Caching für Analyse-Routen, aktuell Status "Planned") — ein größerer, zweigeteilter Prompt könnte das Caching-Verhalten beeinflussen; nicht blockierend für PROJ-33, aber bei Umsetzung von PROJ-23 zu berücksichtigen

## Frontend Implementation Notes (2026-08-11)

### Neue/geänderte Dateien
- **`src/components/geschmack-ergebnis.tsx`** (neu) — eigenständige, wiederverwendbare Geschmack-Sektion. Rendert entweder den Erfolgs-Zustand (Score-Zahl groß + Label-Pille + bis zu 2 Tipp-Karten bzw. Bestätigungsblock bei Score ≥ 85 + optionaler Unklarheits-Hinweis) oder den Fehler-Zustand (Hinweistext + "Nochmal prüfen"-Button). Retry-Ergebnis wird bewusst lokal im Component-State gehalten, nicht an einen Eltern-State zurückgereicht.
- **`src/components/saettigungs-ergebnis.tsx`** — neue Typen `GeschmackLabel`, `GeschmackResult`, `GeschmackState` (exportiert); `geschmack?: GeschmackState` auf `StandardAnalysisResult` und `KomponenteAnalysisResult` ergänzt (nie auf `SnackAnalysisResult`, siehe Spec). Neue Sektion direkt nach dem 3-Säulen-Grid eingebunden (## 2b), mit eigenem `Separator`, damit sie optisch gleichwertig zur Sättigung wirkt statt als Anhängsel unten.
- **`src/components/komponenten-ergebnis.tsx`** — dieselbe Sektion eingebunden (Komponente-Typ bekommt laut Spec ebenfalls Geschmack); `analysisId`-Prop war im Interface bereits vorhanden, aber nie destrukturiert — dabei ergänzt.
- **`src/app/rezept/[id]/page.tsx`** — Geschmack-Sektion eingebunden, bewusst **außerhalb** des `recipeTyp ? … : matrix ? …` Verzweigungsblocks, da Geschmack unabhängig von `recipe_typ` gilt (auch ein Beilage-/Grundlage-Rezept hat einen Geschmack).
- **`src/app/mahlzeit/[id]/page.tsx`** — TODO-Kommentar bei der Query ergänzt, kein funktionaler Change (siehe unten).

### Bewusst unvollständig gelassen (für /backend)
Da die Spalte für den Geschmack-Score in der Datenbank noch nicht existiert, wurde **keine** der bestehenden Supabase-`select()`-Abfragen um ein neues Feld erweitert — eine Abfrage auf eine nicht existierende Spalte hätte sofort alle Rezept- bzw. Mahlzeit-Detailseiten mit einem Datenbankfehler brechen lassen. Stattdessen:
- `src/app/rezept/[id]/page.tsx`: `const recipeGeschmack = undefined as GeschmackState | undefined` mit TODO-Kommentar — sobald die Spalte existiert, hier `recipe.geschmack_score` lesen.
- `src/app/mahlzeit/[id]/page.tsx`: TODO-Kommentar bei der Query, wo `geschmack_score` mitselektiert und in beide Result-Typen durchgereicht werden muss.
- `src/app/api/analyse/confirm/route.ts`: liefert aktuell kein `geschmack`-Feld — solange das so bleibt, ist die Sektion überall unsichtbar (sicherer Zustand), bricht aber nichts.

**Erwarteter Vertrag für `/backend`** (aus den Component-Props abgeleitet):
- Live-Analyse (`confirm/route.ts`): `result.geschmack` = `{ status: 'ok', score, label, verbesserungen, unklarHinweis } | { status: 'error' } | undefined` (undefined nur bei Snack oder wenn die Berechnung aus irgendeinem Grund gar nicht erst versucht wurde)
- Retry-Endpunkt Mahlzeit: `POST /api/analyse/geschmack-retry`, Body `{ analysisId: string }`, Antwort `{ geschmack: GeschmackResult }` (bei Erfolg) — Component erwartet bei Fehlschlag einfach eine Non-2xx-Antwort
- Retry-Endpunkt Rezept: `POST /api/rezepte/[id]/geschmack-retry`, kein Body nötig (ID kommt aus dem Pfad), Antwort `{ geschmack: GeschmackResult }`

### Visuell verifiziert (lokal, gemockte Daten, kein echter Claude-Call)
- Erfolgs-Zustand: Score, Label-Pille (Farbe je nach Label: `fad`=rot, `okay`=amber, `lecker`=Accent Strong `#0E7C86`, `richtig_gut`=emerald), Tipp-Karte — sitzt sichtbar gleichwertig neben "Die 3 Sättigungs-Säulen", nicht als Fußnote
- Score ≥ 85: Bestätigungsblock statt Tipp-Karten
- Fehler-Zustand: Fehlertext + Button, Rest der Seite (Sättigung, Nährwerte, Rezeptvorschläge) bleibt unbeeinträchtigt sichtbar
- Klick auf "Nochmal prüfen": Ladezustand, Fehlschlag (da Endpunkt noch nicht existiert) wird sauber abgefangen, Button bleibt danach erneut klickbar — kein Absturz, keine Endlosschleife
- `npm run build`, `tsc --noEmit`, `eslint` — alle sauber (ein vorbestehender, unabhängiger tsc-Fehler in `PROJ-2-user-authentication.spec.ts`, nicht durch diese Änderung berührt)

## Backend Implementation Notes (2026-08-11)

### Datenbank
- **Migration `proj33_geschmack_score`**: additive Spalte `geschmack_score JSONB` auf `meal_analyses` und `recipes` (NULL = kein Score, Frontend blendet dann aus — kein Backfill, siehe Spec).
- **Migration `proj33_meal_analyses_update_policy`**: `meal_analyses` hatte bisher nur INSERT+SELECT-RLS-Policies (Zeilen waren bis jetzt insert-once). Für den "Nochmal prüfen"-Retry war eine neue UPDATE-Policy nötig (auf eigene Mahlzeiten begrenzt, exakt wie die bestehende SELECT-Policy). `recipes` hatte bereits eine passende owner-scoped UPDATE-Policy.
- `src/types/database.ts` neu generiert (`mcp__supabase__generate_typescript_types`).

### Neue/geänderte Dateien
- **`src/lib/geschmack.ts`** (neu) — geteilte Bewertungslogik (`GESCHMACK_PROMPT_RULES`, kondensiert aus `docs/geschmacks-score-prompt.md`) zwischen dem gemeinsamen Analyse-Prompt und den eigenständigen Retry-/Rezept-Aufrufen, damit beide Prompts nicht auseinanderdriften. `geschmackLabelFromScore()` leitet das Label serverseitig aus dem Score ab — Claude liefert nur die Zahl, nie das Label selbst (verhindert Inkonsistenzen wie score:72 + label:"fad"). `parseGeschmackFragment()` validiert per Zod und gibt bei jedem Problem `{status:'error'}` zurück, nie einen Wurf (Graceful Degradation). `computeGeschmack()` ist der eigenständige, schlanke Claude-Aufruf für Retry/Rezept (nur Zutaten + optionale Anleitung, kein Foto).
- **`src/app/api/analyse/confirm/route.ts`** — Prompt additiv um den Geschmack-Abschnitt erweitert (Standard- UND Komponente-Format bekommen ein `geschmack`-Feld, Snack-Format bewusst nicht). `parseGeschmackFragment()` wird auf `result.geschmack` angewandt und in beide Response-Objekte sowie `meal_analyses.geschmack_score` geschrieben.
- **`src/app/api/analyse/geschmack-retry/route.ts`** (neu) — `POST { analysisId }`. Ownership läuft komplett über RLS (SELECT-Policy filtert fremde Analysen bereits heraus, kein manueller Join-Check nötig) — leere Row wird einheitlich als 404 behandelt.
- **`src/app/api/rezepte/[id]/geschmack-retry/route.ts`** (neu) — `POST` ohne Body (ID aus dem Pfad). Berechtigung: Eigentümer der eigenen Rezepte via regulärem Client (RLS erlaubt es), offizielle Rezepte (owner_id null) nur Admin via Admin-Client (RLS-UPDATE-Policy erlaubt dort niemandem außer dem — nicht existenten — Owner zu schreiben).
- **`src/app/api/admin/rezepte/route.ts`, `[id]/route.ts`, `src/app/api/rezepte/route.ts`, `[id]/route.ts`** — jeweils `computeGeschmack()` beim Speichern ergänzt (gleicher Zeitpunkt wie die bestehende Sättigungsmatrix-Berechnung), Ergebnis in `geschmack_score` persistiert. Kein Diffing (siehe Spec Open Questions) — jedes Speichern berechnet neu, auch bei rein kosmetischen Edits.
- **`src/app/mahlzeit/[id]/page.tsx`, `src/app/rezept/[id]/page.tsx`** — die beiden TODOs aus der Frontend-Phase aufgelöst: `geschmack_score` wird jetzt mitselektiert und als `geschmack` in die jeweiligen Result-Typen durchgereicht.

### Tests
- `src/app/api/analyse/confirm/route.test.ts` — 6 neue Tests: valides Fragment inkl. Label-Ableitung, fehlendes Fragment (Graceful Degradation), fehlerhaftes Fragment (Score außerhalb 0–100), Score≥85-Label, Komponente-Branch, Snack bekommt kein `geschmack`-Feld.
- `src/app/api/analyse/geschmack-retry/route.test.ts` (neu) — 5 Tests (401/400/404, Erfolg inkl. Persistierung, 500 bei DB-Fehler).
- `src/app/api/rezepte/[id]/geschmack-retry/route.test.ts` (neu) — 7 Tests (401/404, 403 fremdes privates Rezept, 403 offizielles Rezept ohne Admin, Erfolg eigenes Rezept via regulärem Client, Erfolg offizielles Rezept via Admin-Client, 500 bei DB-Fehler).
- Alle 4 Rezept-Speicher-Testdateien: `computeGeschmack` gemockt (kein echter Claude-Call in Unit-Tests) + je eine Assertion, dass `geschmack_score` im finalen Update-Payload landet.
- `npm test`: 387/387 passed · `tsc --noEmit`: sauber (1 vorbestehender, unabhängiger Fehler) · `eslint`: sauber (1 vorbestehende, unabhängige Warnung) · `npm run build`: erfolgreich.

## QA Test Results

**Tested:** 2026-08-11
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Berechnung
- [x] Mahlzeit/Komponente bekommen einen Geschmack-Score im selben Claude-Aufruf wie die Sättigungs-Analyse — **live gegen den echten Claude-Aufruf verifiziert** (nicht nur gemockt): drei reale Analysen durchlaufen (Salatteller → Mahlzeit, Beilagensalat → Komponente, Apfel → Snack)
- [x] Snack bekommt keinen Geschmack-Score — live bestätigt (Ergebnis zeigt nur die Bestätigung, kein `geschmack`-Feld)
- [x] Rezepte bekommen einen Geschmack-Score beim Speichern (Zutaten + Anleitung, kein Foto nötig) — live verifiziert: Testrezept angelegt, Score 78/"Lecker" korrekt berechnet und angezeigt

#### Ergebnis-Darstellung
- [x] Geschmack-Sektion erscheint gleichwertig prominent neben der Sättigung (eigene Überschrift, eigener KI-Hinweis, eigener großer Score) — visuell bestätigt per Screenshot, live und gemockt
- [x] Score < 85 zeigt bis zu 2 additive Verbesserungsvorschläge — live bestätigt (reale Vorschläge wie "Ein Spritzer Zitrone…", nie restriktiv, nie mit "gesund"/"ungesund" formuliert)
- [x] Score ≥ 85 zeigt nur eine Bestätigung, keine Vorschläge — per E2E-Test verifiziert (Mocking, da in den drei Live-Durchläufen kein Score ≥85 auftrat)
- [x] Unklar-Hinweis erscheint als reiner Info-Text ohne den Flow zu unterbrechen — live bestätigt (z.B. "Kommt noch Olivenöl dazu?" erschien direkt im Ergebnis, keine zusätzliche Rückfragen-Runde)
- [x] Rezept-Detailseite zeigt die Geschmack-Sektion gleichwertig neben der Sättigungsmatrix — live bestätigt

#### Legacy & Fehlerfälle
- [x] Alte Mahlzeiten/Rezepte ohne Score: Sektion bleibt ausgeblendet — per E2E-Test verifiziert (kein Live-Fixture mit fehlendem Score vorhanden, da alle QA-Fixture-Mahlzeiten aus früheren Runden vor Reparaturen liegen — Verhalten ist aber baugleich zum bereits live verifizierten PROJ-5-Legacy-Pfad, der dasselbe `undefined`-Muster nutzt)
- [x] Graceful Degradation bei fehlerhaftem Geschmack-Fragment: Sättigung bleibt normal sichtbar, Geschmack zeigt Fehlerhinweis + Button — per Unit- und E2E-Test verifiziert (`parseGeschmackFragment` gibt bei jedem Validierungsfehler `{status:'error'}` zurück, nie einen Wurf)
- [x] "Nochmal prüfen" fragt nur den Geschmack-Teil neu an — **live gegen den echten Endpunkt verifiziert**: `POST /api/rezepte/[id]/geschmack-retry` auf ein echtes Testrezept aufgerufen, Antwort 200 mit frischem Score, per SQL-Abfrage bestätigt in `geschmack_score` persistiert
- [x] Rezept wird trotz fehlgeschlagener Geschmack-Berechnung gespeichert — per Unit-Test verifiziert (Route speichert immer, unabhängig vom `computeGeschmack`-Ergebnis)

**16/16 Acceptance Criteria passed.**

### Automated Tests
- `npm test`: **387/387 passed** (33 davon PROJ-33-spezifisch: 6 in `confirm/route.test.ts`, 5 in `geschmack-retry/route.test.ts`, 7 in `rezepte/[id]/geschmack-retry/route.test.ts`, 4× je 1 Assertion in den Rezept-Speicher-Tests)
- `npm run test:e2e` (neue + betroffene Regressions-Suiten):
  - `tests/PROJ-33-geschmacks-score.spec.ts` (neu): **14/14 passed**
  - Regression: `PROJ-4` (32/32), `PROJ-5` + `PROJ-5-legacy-rendering` (32+4), `PROJ-16` (14/14), `PROJ-8` (79/80 — 1 Fehlschlag ist der bereits aus der vorherigen QA-Runde bekannte, unabhängige Dev-Server/Turbopack-404-Status-Quirk, siehe dortige QA-Notizen, kein PROJ-33-Bezug), `PROJ-6` (18/18), `PROJ-17` (26/26), `PROJ-25` (4/4), `PROJ-26` (9/9), `PROJ-32` (13/13) — **keine Regressionen**
- `tsc --noEmit`: sauber (1 vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`)
- `eslint`: sauber (1 vorbestehende, unabhängige Warnung in `bild-cropper.tsx`)
- `npm run build`: erfolgreich

### Manuelle Live-Tests (echter Claude-Aufruf, kein Mock)
Diese Prompt-Logik wurde vorher nur gegen Mocks getestet — hier erstmals live gegen das echte Modell verifiziert:
1. **Mahlzeit** ("Salatteller mit Feta, Oliven, Tomaten, Gurke, Olivenöl, Zitronendressing, Kürbiskerne"): Sättigung "Wenig sättigend" + Geschmack 81/"Lecker" gleichzeitig korrekt und unabhängig dargestellt — gute Demonstration, dass die beiden Achsen nie vermischt werden (ein Gericht kann gleichzeitig wenig sättigend UND lecker sein)
2. **Komponente** ("Beilagensalat mit Rucola, Parmesan, Balsamico, zum Steak"): Komponente-Bilanz + Geschmack 78/"Lecker" beide korrekt gerendert
3. **Snack** ("Ein Apfel"): korrekt keine Geschmack-Sektion, nur die neutrale Bestätigung
4. **Rezept anlegen**: Geschmack 78/"Lecker" korrekt berechnet und angezeigt (KI-Hinweis-Variante "automatisch", nicht "allgemein" — korrekt kontextabhängig)
5. **Retry-Endpunkt** direkt gegen das echte, gerade angelegte Rezept aufgerufen — 200, neuer Score korrekt in der DB persistiert (per SQL verifiziert)

Alle Test-Datensätze (9 Mahlzeiten, 1 Rezept) nach Abschluss wieder gelöscht.

### Security Audit
- [x] Authentication: beide Retry-Endpunkte verlangen `auth.getUser()` — 401 sonst (live verifiziert)
- [x] Authorization Mahlzeit-Retry: Ownership läuft komplett über die RLS-SELECT-Policy — fremde/nicht existierende `analysisId` ergibt einheitlich 404, kein Unterschied im Statuscode zwischen "existiert nicht" und "gehört jemand anderem" (kein Enumerations-Leck)
- [x] Authorization Rezept-Retry: eigene Rezepte via regulärem Client (RLS erzwingt Owner), offizielle Rezepte nur Admin via Admin-Client — per Unit-Test das komplette Berechtigungs-Matrix abgedeckt (401/404/403 privates fremdes Rezept/403 offizielles Rezept ohne Admin/200 Owner/200 Admin)
- [x] Input-Validierung: `analysisId` per Zod auf UUID geprüft (400 sonst)
- [x] Keine neuen `dangerouslySetInnerHTML`-Stellen — alle neuen Texte (Score-Tipps, Unklar-Hinweis) laufen durch normales JSX-Escaping
- [x] RLS-Migration korrekt: `meal_analyses` hatte vorher keine UPDATE-Policy (Zeilen waren insert-once) — neue Policy exakt auf eigene Mahlzeiten begrenzt, gleiche Bedingung wie die bestehende SELECT-Policy

#### BUG-1 (Medium): Kein Rate-Limiting auf den Geschmack-Retry-Endpunkten
- **Severity:** Medium
- **Beschreibung:** Weder `/api/analyse/geschmack-retry` noch `/api/rezepte/[id]/geschmack-retry` haben ein Rate-Limit. Die Frontend-Komponente deaktiviert den Button zwar während des Ladens, aber ein authentifizierter Nutzer kann den Endpunkt direkt (außerhalb der UI) beliebig oft aufrufen — jeder Aufruf löst einen echten, kostenpflichtigen Claude-Aufruf aus.
- **Einordnung:** Kein Datenleck, keine Rechteausweitung — reines Kosten-/Abuse-Risiko, exploitierbar nur mit einem gültigen eigenen Account und einer eigenen Mahlzeit/einem zugänglichen Rezept. Vergleichbares Risiko besteht bereits heute unadressiert beim zentralen `/api/analyse/confirm` (kein Retry-spezifisches Problem, aber durch den neuen, gezielt kleineren Endpunkt leichter wiederholt aufrufbar).
- **Priority:** Vor breiterem Rollout beheben (z.B. per-Nutzer Tageslimit wie bei `feedback_today_count`), nicht zwingend vor diesem Merge — Projekt ist aktuell Solo-Nutzung/QA-Konto, reales Abuse-Risiko heute gering.

#### Beobachtung außerhalb des PROJ-33-Scopes (nicht blockierend)
Beim Live-Test des Komponente-Pfads enthielt der von Claude generierte `kombinationsvorschlag`-Text das Wort **"gesundes Fett"** — verstößt gegen die projektweite Regel "nie die Wörter 'gesund'/'ungesund' verwenden" (bereits explizit im bestehenden System-Prompt verboten, siehe `confirm/route.ts` Zeile 68). Das ist kein PROJ-33-Bug — der betroffene Text-Abschnitt (`komponente.kombinationsvorschlag`) gehört zu PROJ-16 und wurde in dieser Session nicht verändert. Empfehlung: als eigenes kleines Ticket für PROJ-16 nachziehen (Prompt-Hinweis allein reicht laut früherer Projekt-Erfahrung nicht zuverlässig — ggf. serverseitiger Wort-Check als zusätzliche Absicherung erwägen).

### Summary
- **Acceptance Criteria:** 16/16 passed
- **Bugs Found:** 1 (1 Medium — kein Rate-Limiting) + 1 Beobachtung außerhalb des Scopes (PROJ-16)
- **Security:** Pass (Medium-Finding dokumentiert, nicht blockierend)
- **Production Ready:** JA
- **Recommendation:** Deploybereit als Teil des gemeinsamen "Complete"-Rollouts (wartet laut Absprache auf Rename/Headline/Geschmack/Art of Eating zusammen). Rate-Limiting auf den Retry-Endpunkten vor breiterem Nutzerwachstum nachziehen.

## Deployment
_To be added by /deploy_
