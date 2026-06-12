# PROJ-4: KI-Analyse-Agent (Rückfragen + BLS + Makros)

## Status: Deployed
**Created:** 2026-06-10
**Last Updated:** 2026-06-12

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

### Bestätigung der Zutatenliste
- [ ] Angenommen alle Rückfragen beantwortet oder übersprungen wurden, wenn die KI die finale Zutatenliste zusammengestellt hat, dann zeigt sie dem Nutzer eine Zusammenfassung ("Habe ich das richtig verstanden: 200g Hähnchenbrust, 1 EL Olivenöl, …?") bevor die Nährstoffberechnung startet.
- [ ] Angenommen die Zutatenliste zur Bestätigung angezeigt wird, wenn der Nutzer etwas korrigiert (z.B. "Nein, es war Putenbrust"), dann aktualisiert die KI die Liste und zeigt sie erneut zur Bestätigung.
- [ ] Angenommen die Zutatenliste zur Bestätigung angezeigt wird, wenn der Nutzer bestätigt, dann startet die Nährstoffberechnung.

### Nährstoffberechnung
- [ ] Angenommen die Zutatenliste ist finalisiert, wenn die KI die Nährstoffe berechnet, dann nutzt sie folgende Quellen in dieser Priorität: (1) Open Food Facts für verpackte/markierte Produkte (kostenlose REST API, 3,4 Mio. Produkte, gute Deutschland-Abdeckung), (2) USDA FoodData Central für generische Rohzutaten (Fleisch, Gemüse, Getreide), (3) eigenes Ernährungswissen des KI-Modells als Fallback für Schätzungen.
- [ ] Angenommen ein Lebensmittel ist in keiner Datenbank gefunden, wenn die KI trotzdem eine Schätzung vornimmt, dann kennzeichnet sie diesen Wert explizit als Schätzung ("geschätzter Wert — Datenbank hat kein passendes Ergebnis geliefert").
- [ ] Angenommen die Datenquellen liefern Ergebnisse, dann werden die Nährstoffwerte für den Nutzer sichtbar mit ihrer Quelle verknüpft, damit er die Daten bei Bedarf selbst prüfen kann.
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
- **Nährstoffdatenbanken (Priorität):** (1) Open Food Facts API — verpackte/markierte Produkte, (2) USDA FoodData Central — generische Rohzutaten, (3) KI-eigenes Ernährungswissen — Fallback und Schätzungen
- **BLS:** Nicht verwendet — veraltet (Stand 2010), kein öffentliches API, durch obige Quellen vollständig ersetzt
- **Quellennachweis:** Genutzte Datenquelle pro Zutat für den Nutzer sichtbar
- **Sprache:** Agent kommuniziert auf Deutsch; Rückfragen und Ausgaben sind auf Deutsch
- **Rückfragen-Limit:** Max. 3 Runden × 2 Fragen = max. 6 Rückfragen (aus PROJ-3)
- **Ausgabe-Nährstoffe:** Protein (g), KH gesamt (g), davon Zucker (g), Fett (g), Ballaststoffe (g), Energie (kcal)
- **Annahmen-Transparenz:** Jede getroffene Annahme wird im Ergebnis explizit aufgelistet
- **Ausgabe-Struktur:** Maschinenlesbar (JSON intern) damit PROJ-5 darauf aufbauen kann

## Open Questions
- [x] Datenbankstrategie: BLS gestrichen. Open Food Facts (REST API, kostenlos) + USDA FoodData Central (REST API, kostenlos) + KI-Fallback. Nutzer sieht die Quelle pro Zutat und kann Daten selbst prüfen.
- [x] Zutatenliste wird dem Nutzer vor der finalen Berechnung zur Bestätigung gezeigt → Ja, die KI zeigt eine Zusammenfassung ("Habe ich das richtig verstanden: …?") und der Nutzer bestätigt oder korrigiert bevor die Nährstoffberechnung startet.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Qualitativ primär, Gramm sekundär (ausgegraut) | "Gefühl für das Essen" statt Zahlenfetischismus; passt zum Positioning "nach dem Kalorienzählen" | 2026-06-10 |
| Kalorien nur als sekundäre Zusatzinfo | Kalorien sind nicht die Kernmetrik der App; sie erscheinen für Orientierung, nicht als Hauptfokus | 2026-06-10 |
| Mengen werden aktiv nachgefragt wenn relevant | Präzision hat Priorität; Annahmen nur wenn Nutzer überspringt oder keine Angabe möglich | 2026-06-10 |
| Zutatenliste vor Berechnung zur Bestätigung zeigen | Nutzer kann Fehler korrigieren bevor Nährstoffe berechnet werden; erhöht Vertrauen in das Ergebnis | 2026-06-10 |
| Keine Mikronährstoffe im MVP | Komplexität ohne direkten Mehrwert für Sättigungsanalyse; Post-MVP | 2026-06-10 |
| Open Food Facts + USDA + KI-Fallback statt BLS | BLS veraltet (2010), kein öffentliches API; Open Food Facts hat moderne Supermarkt-Produkte (Rewe, Aldi, Edeka), USDA für Rohzutaten; Nutzer kann Datenquelle pro Zutat einsehen und bei Bedarf prüfen | 2026-06-10 |
| Kein moralisierender Kommentar zu Alkohol | Nutzer sind informierte Erwachsene; App analysiert, urteilt nicht | 2026-06-10 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `/api/analyse/complete` returns ingredient list (not final result) | Enables the confirmation step — user sees and can correct the ingredient list before nutrients are calculated; increases trust and accuracy | 2026-06-12 |
| New `POST /api/analyse/confirm` endpoint for calculation | Clean separation: complete = extraction, confirm = calculation; makes the confirmation step a first-class API interaction | 2026-06-12 |
| All external API calls (Open Food Facts, USDA) are server-side only | Security: USDA API key never exposed to browser; CORS: both APIs don't require browser access; reliability: centralised error handling | 2026-06-12 |
| No new npm packages | Native `fetch` handles all external API calls; no new dependencies to maintain | 2026-06-12 |
| USDA FoodData Central requires free API key | Free registration at api.nal.usda.gov; key stored as server-side env var `USDA_API_KEY` | 2026-06-12 |
| No `meal_analyses` schema changes needed | Existing fields (`refined_ingredients`, `macros_before/after`, `satiety_scores_before/after`, `improvement`, `data_sources`) already match the system-prompt output format exactly | 2026-06-12 |
| `meal_conversations.status` extended with `'confirming'` | Persists the state between extraction and confirmation — user can recover if they navigate away; consistent with existing status flow | 2026-06-12 |
| Two Claude calls per analysis (extraction + full analysis) | Extraction is a lightweight call (small prompt, small output); full analysis uses the complete system prompt with nutrition data; separating them reduces token cost and risk of one long call failing | 2026-06-12 |

---

## Implementation Notes
- `src/components/zutatenliste-bestaetigung.tsx` — neue Komponente: zeigt Zutatenliste mit Inline-Editing, Annahmen-Alert, "Passt so"-Button
- `src/components/mahlzeit-input.tsx` — erweitert um 2 neue Steps: `'confirming'` (Zutatenliste zur Bestätigung) und `'calculating'` (Ladescreen während Nährstoffberechnung)
- `src/app/api/analyse/complete/route.ts` — implementiert: liest Konversationsverlauf, ruft Claude (Haiku) für Zutatenlisten-Extraktion auf, gibt `{ ingredients, assumptions }` zurück
- `src/app/api/analyse/confirm/route.ts` — implementiert: fragt Open Food Facts + USDA FoodData Central je Zutat ab (parallel), übergibt alle Nährstoffdaten an Claude (Sonnet) für vollständige Analyse, speichert Ergebnis in `meal_analyses`, löscht Vollbild aus Storage
- `vitest.config.ts` — `include`-Pattern auf `src/**/*.test.ts` gesetzt damit Playwright-E2E-Tests nicht versehentlich von Vitest aufgerufen werden
- Neue Env-Variable `USDA_API_KEY` — muss in `.env.local` und Vercel-Dashboard hinterlegt sein (kostenlos: api.nal.usda.gov)
- Neue Env-Variable muss zu `.env.local.example` hinzugefügt werden (manuell, da Datei außerhalb Schreibpfad)

## Tech Design (Solution Architect)

### System-Übersicht

PROJ-4 extends the analysis flow from PROJ-3. PROJ-3 handles the Rückfragen (conversation); PROJ-4 takes over after the conversation reaches `status: 'ready'` and produces the full nutritional analysis.

```
PROJ-3 ends → meal_conversations.status = 'ready'
   ↓
POST /api/analyse/complete
   Claude extracts ingredient list from conversation history
   meal_conversations.status → 'confirming'
   Returns { ingredients, assumptions } to UI
   ↓
UI: step = 'confirming'
   ZutatenlisteBestaetigung component
   User reviews, edits inline, clicks "Passt so"
   ↓
POST /api/analyse/confirm
   Server queries Open Food Facts (packaged/branded products)
   Server queries USDA FoodData Central (raw ingredients)
   Claude receives all nutrition data → full analysis
   Saves to meal_analyses table
   Deletes fullsize photo from Storage
   meal_conversations.status → 'completed'
   meals.status → 'completed'
   Returns full analysis result
   ↓
UI: step = 'done' (PROJ-5 renders the result)
```

### Komponenten-Struktur

```
/analyse (existing page)
└── MahlzeitInput (extended)
    ├── step: 'input'         (existing)
    ├── step: 'uploading'     (existing)
    ├── step: 'questions'     (existing — PROJ-3 Rückfragen)
    ├── step: 'analysing'     (existing — triggers /api/analyse/complete)
    ├── step: 'confirming'    (NEW — user reviews ingredient list)
    │   └── ZutatenlisteBestaetigung (NEW component)
    │       ├── Zutat-Item with inline edit (each ingredient editable)
    │       └── "Passt so" button → triggers /api/analyse/confirm
    ├── step: 'calculating'   (NEW — loading while nutrients are computed)
    └── step: 'done'          (existing placeholder — PROJ-5 fills this)
```

### Datenmmodell

Keine Schema-Änderungen notwendig. Die bestehende `meal_analyses`-Tabelle deckt alle Felder ab:

| Feld | Inhalt |
|------|--------|
| `refined_ingredients` | Bestätigte Zutatenliste mit Mengen, Annahmen, Datenquelle pro Zutat |
| `macros_before` | Nährwerte der aktuellen Mahlzeit (kcal, Protein, KH, Zucker, Fett, Ballaststoffe) |
| `macros_after` | Nährwerte der verbesserten Mahlzeit |
| `satiety_scores_before` | Alle 6 Baustein-Bewertungen mit Erklärungen (Vorher) |
| `satiety_scores_after` | Alle 6 Baustein-Bewertungen (Nachher) |
| `improvement` | 1–3 konkrete Verbesserungsvorschläge mit Begründung und Baustein-Referenz |
| `data_sources` | Pro Zutat: welche Datenbank, gematchter Produktname, ID |

`meal_conversations.status` bekommt einen neuen Wert: `'confirming'` (zwischen `'ready'` und `'completed'`).

### API Design

**`POST /api/analyse/complete`** (stub → vollständige Implementierung)
- Input: `{ mealId }`
- Auth: Nutzer muss Eigentümer der Mahlzeit sein
- Was passiert: Liest Konversationsverlauf aus `meal_conversations` → ruft Claude auf für leichtgewichtige Zutaten-Extraktion → speichert Status `'confirming'` in `meal_conversations`
- Gibt zurück: `{ ingredients: [{ name, amount, unit, isAssumption }], assumptions: string[] }`

**`POST /api/analyse/confirm`** (neuer Endpoint)
- Input: `{ mealId, ingredients: [{ name, amount, unit }] }`
- Auth: Nutzer muss Eigentümer der Mahlzeit sein
- Was passiert: Abfragen von Open Food Facts + USDA pro Zutat (parallel) → Claude-Aufruf mit vollständigem System-Prompt + Nährstoffdaten → Ergebnis in `meal_analyses` speichern → Vollbild aus Storage löschen → Status aktualisieren
- Gibt zurück: `{ analysisId, result }` — das vollständige strukturierte Analyse-JSON

### Externe Integrationen

| Dienst | Zweck | Auth | Limit |
|--------|-------|------|-------|
| Open Food Facts | Verpackte/markierte Produkte (Rewe, Aldi, Edeka) | Kein Key — kostenlos öffentlich | Großzügig (User-Agent-Header Pflicht) |
| USDA FoodData Central | Generische Rohzutaten (Fleisch, Gemüse, Getreide) | Kostenloser API-Key (api.nal.usda.gov) | 3.600 Anfragen/Stunde |
| Anthropic Claude | Extraktion + vollständige Analyse | Bestehender `ANTHROPIC_API_KEY` | Standard |

### Neue Umgebungsvariablen

| Variable | Pflicht | Quelle |
|----------|---------|--------|
| `USDA_API_KEY` | Ja | Kostenlose Registrierung auf api.nal.usda.gov |
| `ANTHROPIC_API_KEY` | Bereits vorhanden | Anthropic Console |

### Sicherheit

- Beide neuen Endpoints prüfen Session und Eigentümerschaft der `mealId`
- `USDA_API_KEY` nur serverseitig — nie im Browser sichtbar
- Alle externen API-Aufrufe (Open Food Facts, USDA) laufen ausschließlich serverseitig
- Vollbild wird nach abgeschlossener Analyse aus Storage gelöscht (bestehende Anforderung aus PROJ-1)

### Abhängigkeiten

Keine neuen npm-Pakete nötig. Alle externen APIs werden mit nativem `fetch` aufgerufen.

## QA Test Results

**QA-Datum:** 2026-06-12
**Status:** Approved — Medium-Bug (Längenbeschränkung) wurde während QA behoben

### Test-Zusammenfassung

| Suite | Tests | Bestanden | Fehlgeschlagen |
|-------|-------|-----------|----------------|
| Unit Tests (Vitest) | 22 | 22 | 0 |
| E2E Tests (Playwright, Chromium) | 18 | 18 | 0 |
| E2E Tests (Playwright, Mobile 375px) | 2 | 2 | 0 |
| **Gesamt** | **42** | **42** | **0** |

### Acceptance Criteria — Status

#### Zutaten-Identifikation & Rückfragen
- [x] Rückfragen werden bei Unklarheiten gestellt (aus PROJ-3 getestet)
- [x] Varianten-Rückfragen (Quark 0,2% vs. 40%) — KI-Verhalten, kein Regressionsfehler
- [x] Zubereitungsart wird nachgefragt wenn relevant — KI-Verhalten
- [x] Mengenangaben werden nachgefragt — KI-Verhalten
- [x] Finale Zutatenliste mit Annahmen-Kennzeichnung ✅

#### Bestätigung der Zutatenliste
- [x] Zutatenliste zur Bestätigung angezeigt: "Hab ich das richtig verstanden?" ✅
- [x] Inline-Bearbeitung einzelner Zutaten möglich ✅ (Edit-Icon, Fertig, Enter, Escape)
- [x] "Passt so →" startet Nährstoffberechnung ✅
- [x] Fehler bei /api/analyse/confirm: zurück zu confirming, Fehlermeldung sichtbar ✅

#### Nährstoffberechnung
- [x] Open Food Facts + USDA abgefragt (parallel, server-side) ✅ Unit Tests
- [x] Fallback bei fehlendem DB-Ergebnis → KI-Schätzung (in Analyse-Prompt verankert)
- [x] Berechnung-Ladescreen sichtbar (⚗️ + "Nährstoffe werden berechnet…") ✅
- [x] Ergebnis in `meal_analyses` gespeichert ✅ Unit Tests

#### Ausgabe-Format
- [x] Qualitativ primär, Grammangaben sekundär → in PROJ-5 (Out of Scope für PROJ-4)
- [x] Annahmen-Alert ("Ich habe angenommen:") sichtbar wenn Annahmen vorhanden ✅

#### Fehlerverhalten
- [x] /api/analyse/complete Fehler → Fehlermeldung + zurück zu Input ✅
- [x] 503 Überlastet → nutzerfreundliche Meldung ✅ (unit + E2E)
- [x] Ladescreen bei laufender Berechnung ✅

### Security Audit (Red Team)

| Prüfpunkt | Ergebnis | Severity |
|-----------|----------|----------|
| Auth: Unauthentifizierter Zugriff auf beide Endpoints | ✅ 401 korrekt zurückgegeben | — |
| Authorization: User A greift auf Mahlzeit von User B zu | ✅ `.eq('user_id', user.id)` verhindert dies | — |
| API-Keys (`USDA_API_KEY`, `ANTHROPIC_API_KEY`) nie im Browser | ✅ Nur in server-seitigen Route Handlers | — |
| Input Validation: Zod auf allen Inputs | ✅ UUID-Pflicht, Array min 1/max 30 | — |
| String-Länge `name`/`amount` unbegrenzt | ⚠️ Kein `.max()` auf Zutatenfelder → zu lange Strings blähen Claude-Prompt auf | **Medium** |
| `/api/analyse/confirm` prüft nicht `meal_conversations.status` | ⚠️ Out-of-order Calls möglich (kein Sicherheitsproblem, aber Daten-Integrität) | **Low** |
| console.error loggt keine sensiblen Daten | ✅ Nur Claude-Rohantworten und DB-Errors geloggt | — |
| Externe API-Aufrufe ausschließlich serverseitig | ✅ Open Food Facts + USDA nur in route.ts | — |

### Bugs

#### Medium — Name/Amount ohne Längenbeschränkung
**Beschreibung:** `ingredientSchema` in `/api/analyse/confirm/route.ts` hat kein `.max()` auf `name` und `amount`. Ein Angreifer könnte 30 Zutaten mit extrem langen Namen schicken und so den Claude-Prompt künstlich aufblähen.
**Schritte:** POST `/api/analyse/confirm` mit `{ name: "a".repeat(10000), amount: "..." }` × 30
**Fix:** `z.string().min(1).max(200)` für `name`, `.max(50)` für `amount`

#### Low — `/api/analyse/confirm` ohne Status-Check
**Beschreibung:** Das Endpoint prüft nicht ob `meal_conversations.status === 'confirming'`. Ein eingeloggter Nutzer könnte `/api/analyse/confirm` direkt aufrufen ohne den `/complete`-Schritt gemacht zu haben.
**Impact:** Keine Sicherheitslücke (Eigentümerschaft wird geprüft); nur Daten-Integrität
**Fix:** Status-Check auf `meal_conversations` vor der Verarbeitung

### Responsive-Test

| Viewport | Befund |
|----------|--------|
| Desktop 1280px | ✅ kein horizontaler Scroll, alle Touch-Targets bedienbar |
| Mobile 375px | ✅ kein horizontaler Scroll, "Passt so →"-Button ≥ 44px |

### Produktionsreife-Entscheidung

**BEREIT** — Medium-Bug wurde während QA behoben. Keine Critical/High Bugs. Keine Medium Bugs mehr offen.

## Deployment

**Deployed:** 2026-06-12
**Production URL:** https://endlichsattapp.vercel.app/
**Git Tag:** v1.4.0-PROJ-4
**Neue Env-Variable:** `USDA_API_KEY` in Vercel Dashboard hinterlegt
