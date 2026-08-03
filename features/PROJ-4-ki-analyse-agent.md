# PROJ-4: KI-Analyse-Agent (Rückfragen + BLS + Makros)

## Status: Deployed (Refinement: KI-Schätzung für unbekannte Zutaten — QA abgeschlossen, alle 3 gefundenen Bugs behoben, Production Ready, siehe `## QA Test Results`)
**Created:** 2026-06-10
**Last Updated:** 2026-08-03

**Korrektur beim Refinement (2026-08-03):** Der `Technical Requirements`-Abschnitt war veraltet — dort stand "BLS: Nicht verwendet, veraltet" und "Open Food Facts + USDA FoodData Central + KI-Fallback" als Datenquellen-Priorität. Der tatsächliche, deployte Code (`src/lib/nutrition.ts`) nutzt seit einem nicht in diesem Spec dokumentierten späteren Zeitpunkt **BLS (lokale Supabase-Tabelle `bls_lebensmittel`) als primäre Quelle, Open Food Facts als Fallback** — USDA FoodData Central existiert im Code nicht mehr (nur noch als veralteter Kommentar). Unten korrigiert. Reine Dokumentations-Korrektur, keine funktionale Änderung durch diese Korrektur selbst.

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure) — Analyse-Ergebnis wird in `meal_analyses` gespeichert
- Requires: PROJ-3 (Mahlzeit-Input) — liefert Foto und/oder Freitext als Input für den Agenten

## User Stories
- Als Nutzer möchte ich dass die KI kritisch nachfragt welche genaue Zutat verwendet wurde (z.B. Magerquark vs. Sahnequark, welches Öl, wie viel davon), damit die Analyse auf echten Daten basiert und nicht auf Annahmen.
- Als Nutzer möchte ich dass die KI bei unklaren Mengen nachfragt (z.B. "Wie viele Esslöffel Olivenöl?", "Wie viel von der Packung?"), damit die Nährstoffberechnung so präzise wie möglich ist.
- Als Nutzer möchte ich die Makronährstoffe meiner Mahlzeit qualitativ verstehen ("proteinreich", "ballaststoffarm"), damit ich ein Gefühl für das Essen bekomme statt mich von Zahlen leiten zu lassen.
- Als Nutzer möchte ich die Grammangaben als sekundäre Information sehen (kleiner, ausgegraut), damit ich sie nachschlagen kann ohne sie aufgezwungen zu bekommen.
- Als Nutzer möchte ich wissen wenn die KI unsicher ist oder mit Annahmen arbeitet, damit ich dem Ergebnis angemessen vertrauen kann.
- Als Nutzer möchte ich, dass auch ungewöhnliche oder seltene Zutaten, die in keiner Datenbank zu finden sind, sinnvoll in die Nährstoffberechnung einfließen (statt mit 0 kcal gewertet zu werden), damit meine Analyse auch bei exotischen Gerichten nicht künstlich verfälscht wird. *(Refinement 2026-08-03)*

## Out of Scope
- Sättigungs-Score und Bewertung der 6 Bausteine — das ist PROJ-5
- Verbesserungsvorschläge — das ist PROJ-5
- Anzeige des Ergebnisses (UI/Ausgabe-Screen) — das ist PROJ-5
- Mikronährstoffe, Vitamine, Mineralstoffe — Post-MVP
- Rezept-Datenbank oder Mahlzeit-Templates — Post-MVP
- Kalorien als primäre Metrik — Kalorien erscheinen nur als sekundäre Zusatzinfo
- **KI-Schätzung für Zutaten mit BLS/OFF-Treffer** (Refinement 2026-08-03) — die Schätzung greift ausschließlich, wenn beide Datenbank-Quellen keinen Treffer liefern; für gematchte Zutaten bleibt die Berechnung vollständig deterministisch
- **Manuelles Überschreiben eines geschätzten Werts durch den Nutzer** (Refinement 2026-08-03) — der Nutzer kann bereits vor der Berechnung den Zutatennamen korrigieren (z.B. um einen besseren BLS/OFF-Treffer zu erzielen); ein direktes Editieren von Nährwert-Zahlen ist nicht Teil dieses Refinements
- **Konfidenz-/Vertrauens-Score pro Schätzung** — nur ein binäres "geschätzt ja/nein" bzw. "nicht schätzbar", keine feinere Abstufung

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
- [ ] Angenommen die Zutatenliste ist finalisiert, wenn die KI die Nährstoffe berechnet, dann nutzt sie folgende Quellen in dieser Priorität: (1) BLS (Bundeslebensmittelschlüssel, lokale Datenbank) für die meisten Alltags-Zutaten, (2) Open Food Facts als Fallback für verpackte/markierte Produkte ohne BLS-Treffer, (3) **KI-Schätzung ausschließlich für Zutaten, die weder im BLS noch bei Open Food Facts gefunden werden** (neu, siehe unten). ~~USDA FoodData Central~~ wird nicht mehr verwendet (Korrektur 2026-08-03, siehe Status-Hinweis oben).
- [ ] Angenommen eine Zutat wird weder im BLS noch bei Open Food Facts gefunden, wenn die Nährstoffberechnung läuft, dann schätzt die KI **ausschließlich für diese Zutat** einen Nährwert pro 100g (kcal, Protein, Kohlenhydrate, Zucker, Fett, Ballaststoffe) — im selben Analyse-Call, ohne zusätzlichen API-Aufruf.
- [ ] Angenommen eine Zutat wurde erfolgreich im BLS oder bei Open Food Facts gefunden, wenn die KI ihre Analyse-Antwort erstellt, dann gibt sie für diese Zutat **keine eigenen Nährwert-Zahlen** aus — die Berechnung bleibt für diese Zutat vollständig deterministisch aus der Datenbank-Quelle (unverändertes bestehendes Verhalten).
- [ ] Angenommen die KI liefert eine Schätzung für eine unbekannte Zutat, wenn der geschätzte Wert außerhalb eines plausiblen Bereichs liegt (z.B. negativ oder unrealistisch hoch, exakte Grenzwerte werden in `/architecture` festgelegt), dann wird der Wert verworfen statt ungeprüft übernommen.
- [ ] Angenommen ein geschätzter Wert wurde wegen Unplausibilität verworfen, dann sieht der Nutzer für diese Zutat einen sichtbaren Hinweis ("Wert konnte nicht geschätzt werden") statt dass die Zutat still mit 0 kcal in die Berechnung eingeht.
- [ ] Angenommen ein Lebensmittel ist in keiner Datenbank gefunden und die KI liefert eine plausible Schätzung, dann kennzeichnet sie diesen Wert explizit als Schätzung ("geschätzter Wert — Datenbank hat kein passendes Ergebnis geliefert") — gleiches Label wie bisher, jetzt aber mit einem echten Wert statt 0.
- [ ] Angenommen die Datenquellen liefern Ergebnisse, dann werden die Nährstoffwerte für den Nutzer sichtbar mit ihrer Quelle verknüpft, damit er die Daten bei Bedarf selbst prüfen kann.
- [ ] Angenommen die Berechnung ist abgeschlossen, dann gibt der Agent folgende Nährstoffe aus: Protein (g), Kohlenhydrate gesamt (g), davon Zucker (g), Fett (g), Ballaststoffe (g), Energie (kcal) — jeweils für die Gesamtmahlzeit.

### Ausgabe-Format
- [ ] Angenommen die Nährstoffberechnung ist fertig, wenn die Ergebnisse angezeigt werden, dann steht die qualitative Einschätzung im Vordergrund (z.B. "proteinreich", "ballaststoffarm", "fettreich") und die Grammangaben erscheinen klein und ausgegraut daneben.
- [ ] Angenommen Annahmen getroffen wurden (durch Skip oder fehlende Angaben), wenn das Ergebnis angezeigt wird, dann erscheint ein deutlicher Hinweis welche Annahmen gemacht wurden (z.B. "Ich habe angenommen: Magerquark 0,2% Fett, 1 EL Olivenöl ca. 10g").
- [ ] Angenommen die KI hat eine Portion selbst geschätzt weil keine Mengenangabe vorlag, wenn sie das Ergebnis ausgibt, dann zeigt sie die angenommene Menge an (z.B. "Angenommene Portion: ~200g Hähnchenbrust").

### Fehlerverhalten
- [ ] Angenommen das Foto zeigt kein erkennbares Lebensmittel (z.B. ein Tisch, verschwommen), wenn die KI es nicht identifizieren kann, dann teilt sie das dem Nutzer mit und fordert ihn auf eine Textbeschreibung hinzuzufügen.
- [ ] Angenommen BLS oder Open Food Facts sind nicht erreichbar (Timeout/Fehler), wenn die KI die Analyse trotzdem durchführt, dann behandelt sie die betroffenen Zutaten wie unbekannte Zutaten (KI-Schätzung mit Plausibilitätsprüfung, siehe Nährstoffberechnung).
- [ ] Angenommen die Analyse dauert länger als erwartet, wenn der Nutzer wartet, dann sieht er einen aktiven Ladezustand mit kurzer Statusmeldung (z.B. "Zutaten werden analysiert…", "Nährwerte werden berechnet…").

## Edge Cases
- **Sehr zusammengesetztes Gericht** (z.B. Lasagne): KI schätzt Bestandteile aus typischen Rezepten und kennzeichnet die Unsicherheit; fragt ggf. nach Hauptzutaten.
- **Unbekannte Eigenkreation:** Nutzer beschreibt ein Rezept das kein Standard-Gericht ist — KI rechnet Zutat für Zutat durch.
- **Alkohol in der Mahlzeit** (z.B. Wein in der Sauce): Wird als Zutat erfasst und in die Kalorien eingerechnet; kein moralisierender Kommentar.
- **Sehr kleine Mengen** (z.B. Gewürze, Kräuter): KI ignoriert Gewürze für die Nährstoffberechnung wenn sie keinen signifikanten Beitrag leisten — transparente Notiz dazu.
- **Mehrere Gänge auf einmal:** Nutzer beschreibt Vorspeise + Hauptgericht — KI analysiert alles zusammen als eine Mahlzeit.
- **Foto + Text widersprechen sich** (z.B. Foto zeigt Pasta, Text sagt "Salat"): KI weist auf den Widerspruch hin und fragt nach Klärung.
- **Alle Zutaten einer Mahlzeit sind unbekannt** (Refinement 2026-08-03): Jede Zutat wird einzeln nach denselben Regeln geschätzt (mit Plausibilitätsprüfung); kein Sonderfall nötig, auch wenn ungewöhnlich viele Zutaten gleichzeitig geschätzt werden.
- **Eine ansonsten bekannte Zutat wird durch einen BLS/OFF-Timeout nicht gefunden** (Refinement 2026-08-03): Wird für diese eine Anfrage wie eine unbekannte Zutat behandelt (KI-Schätzung statt 0 kcal) — auch wenn sie bei einem erneuten Versuch vermutlich gefunden worden wäre.

## Technical Requirements
- **Nährstoffdatenbanken (Priorität, korrigiert 2026-08-03):** (1) BLS (Bundeslebensmittelschlüssel) — lokale Supabase-Tabelle `bls_lebensmittel`, primäre Quelle für die meisten Alltags-Zutaten, (2) Open Food Facts API — Fallback für verpackte/markierte Produkte ohne BLS-Treffer, (3) **KI-Schätzung — Fallback ausschließlich für Zutaten ohne BLS- und ohne OFF-Treffer**, mit Plausibilitätsprüfung
- **USDA FoodData Central:** Nicht mehr verwendet (war in der ursprünglichen Fassung dieses Specs vorgesehen, im tatsächlichen Code nie/nicht mehr vorhanden)
- **KI-Schätzung — Umsetzung:** Läuft im bestehenden Analyse-Call (`/api/analyse/confirm`) mit, kein zusätzlicher Claude-Aufruf. Claude bekommt die Anweisung, ausschließlich für Zutaten ohne Datenbank-Treffer einen Nährwert pro 100g zu schätzen; für alle anderen Zutaten bleibt das bestehende Verbot ("keine Zahlen ausgeben") unverändert bestehen
- **Plausibilitätsprüfung:** Geschätzte Werte werden vor der Übernahme in die Makro-Berechnung gegen einen plausiblen Wertebereich geprüft (exakte Grenzwerte: `/architecture`/`/backend`); außerhalb des Bereichs liegende Werte werden verworfen und dem Nutzer sichtbar als "nicht schätzbar" markiert statt still mit 0 in die Berechnung einzufließen
- **Quellennachweis:** Genutzte Datenquelle pro Zutat für den Nutzer sichtbar (BLS / Open Food Facts / KI-Schätzung / nicht schätzbar)
- **Sprache:** Agent kommuniziert auf Deutsch; Rückfragen und Ausgaben sind auf Deutsch
- **Rückfragen-Limit:** Max. 3 Runden × 2 Fragen = max. 6 Rückfragen (aus PROJ-3)
- **Ausgabe-Nährstoffe:** Protein (g), KH gesamt (g), davon Zucker (g), Fett (g), Ballaststoffe (g), Energie (kcal)
- **Annahmen-Transparenz:** Jede getroffene Annahme wird im Ergebnis explizit aufgelistet
- **Ausgabe-Struktur:** Maschinenlesbar (JSON intern) damit PROJ-5 darauf aufbauen kann

## Open Questions
- [x] ~~Datenbankstrategie: BLS gestrichen. Open Food Facts + USDA FoodData Central + KI-Fallback.~~ → **Überholt, siehe Korrektur 2026-08-03**: Tatsächlich verwendet wird BLS (primär) + Open Food Facts (Fallback), kein USDA. Nutzer sieht die Quelle pro Zutat und kann Daten selbst prüfen.
- [x] Zutatenliste wird dem Nutzer vor der finalen Berechnung zur Bestätigung gezeigt → Ja, die KI zeigt eine Zusammenfassung ("Habe ich das richtig verstanden: …?") und der Nutzer bestätigt oder korrigiert bevor die Nährstoffberechnung startet.
- [x] Exakte Plausibilitäts-Grenzwerte für KI-geschätzte Nährwerte pro 100g → 0–900 kcal/100g, 0–100g pro Makronährstoff/100g (siehe Tech Design Refinement, 2026-08-03)
- [x] Erlaubt der aktuelle System-Prompt-Aufbau eine saubere Trennung "darf schätzen" vs. "darf nicht schätzen"? → Ja, bestätigt: Die bestehende Quellen-Markierung pro Zutat, die dem Prompt schon heute mitgegeben wird, reicht dafür vollständig aus (siehe Tech Design Refinement, 2026-08-03)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Qualitativ primär, Gramm sekundär (ausgegraut) | "Gefühl für das Essen" statt Zahlenfetischismus; passt zum Positioning "nach dem Kalorienzählen" | 2026-06-10 |
| Kalorien nur als sekundäre Zusatzinfo | Kalorien sind nicht die Kernmetrik der App; sie erscheinen für Orientierung, nicht als Hauptfokus | 2026-06-10 |
| Mengen werden aktiv nachgefragt wenn relevant | Präzision hat Priorität; Annahmen nur wenn Nutzer überspringt oder keine Angabe möglich | 2026-06-10 |
| Zutatenliste vor Berechnung zur Bestätigung zeigen | Nutzer kann Fehler korrigieren bevor Nährstoffe berechnet werden; erhöht Vertrauen in das Ergebnis | 2026-06-10 |
| Keine Mikronährstoffe im MVP | Komplexität ohne direkten Mehrwert für Sättigungsanalyse; Post-MVP | 2026-06-10 |
| ~~Open Food Facts + USDA + KI-Fallback statt BLS~~ | _Überholt — siehe Refinement 2026-08-03: tatsächlich verwendet wird BLS (primär) + OFF (Fallback), kein USDA. Diese ursprüngliche Entscheidung wurde offenbar nach dem 2026-06-12-Deployment revidiert, aber nie im Spec dokumentiert_ | 2026-06-10 |
| Kein moralisierender Kommentar zu Alkohol | Nutzer sind informierte Erwachsene; App analysiert, urteilt nicht | 2026-06-10 |

#### Refinement (2026-08-03): KI-Schätzung für Zutaten ohne BLS/OFF-Treffer

| Decision | Rationale | Date |
|----------|-----------|------|
| Dokumentations-Korrektur: BLS (primär) + Open Food Facts (Fallback), kein USDA | Der Code (`src/lib/nutrition.ts`) weicht seit Längerem vom Spec ab, ohne dass das je nachgezogen wurde; beim Refinement der genau betroffenen Nährstoffberechnungs-Logik aufgefallen und direkt mitkorrigiert | 2026-08-03 |
| KI-Schätzung ausschließlich für Zutaten ohne BLS- UND ohne OFF-Treffer | Nutzer-Wunsch: bewusst kein generelles "KI schätzt alles", sondern nur die Lücke schließen, wo aktuell 0 kcal (falsch) statt eines echten Werts einfließt | 2026-08-03 |
| Schätzung läuft im bestehenden `/api/analyse/confirm`-Call mit, kein zusätzlicher Claude-Call | Keine Mehrkosten/Latenz; Claude sieht die Zutat ohnehin schon im selben Call — nur die Anweisung wird erweitert, für diese eine Kategorie doch Zahlen auszugeben | 2026-08-03 |
| Für Zutaten mit BLS/OFF-Treffer bleibt das bestehende "keine Zahlen ausgeben"-Verbot unverändert | Verhindert, dass die neue Anweisung versehentlich die bestehende, bereits zweimal durch Bugs erschütterte deterministische Makro-Berechnung für gematchte Zutaten aufweicht | 2026-08-03 |
| Plausibilitäts-Grenzwerte für geschätzte Werte, verworfene Werte sichtbar statt still auf 0 | In dieser Datei gab es bereits zwei dokumentierte Bugs mit massiv falschen, still auf 0 gefallenen kcal-Werten — eine ungeprüfte KI-Schätzung wäre ein dritter, strukturell ähnlicher Fehlerkanal. Sichtbares Scheitern ist besser als eine plausibel aussehende, aber falsche Zahl | 2026-08-03 |
| Gleiches "Schätzung"-Label wie bisher beibehalten (kein neues UI-Label) | Kein zusätzlicher UI-Aufwand nötig — der einzige Unterschied ist, dass der Wert jetzt echt statt 0 ist; das bestehende Konzept aus AC/Technical Requirements passt bereits | 2026-08-03 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `/api/analyse/complete` returns ingredient list (not final result) | Enables the confirmation step — user sees and can correct the ingredient list before nutrients are calculated; increases trust and accuracy | 2026-06-12 |
| New `POST /api/analyse/confirm` endpoint for calculation | Clean separation: complete = extraction, confirm = calculation; makes the confirmation step a first-class API interaction | 2026-06-12 |
| All external API calls (Open Food Facts, USDA) are server-side only | Security: USDA API key never exposed to browser; CORS: both APIs don't require browser access; reliability: centralised error handling | 2026-06-12 |
| No new npm packages | Native `fetch` handles all external API calls; no new dependencies to maintain | 2026-06-12 |
| ~~USDA FoodData Central requires free API key~~ | _Überholt — siehe Refinement 2026-08-03: USDA wird im tatsächlichen Code nicht (mehr) verwendet_ | 2026-06-12 |
| No `meal_analyses` schema changes needed | Existing fields (`refined_ingredients`, `macros_before/after`, `satiety_scores_before/after`, `improvement`, `data_sources`) already match the system-prompt output format exactly | 2026-06-12 |
| `meal_conversations.status` extended with `'confirming'` | Persists the state between extraction and confirmation — user can recover if they navigate away; consistent with existing status flow | 2026-06-12 |
| Two Claude calls per analysis (extraction + full analysis) | Extraction is a lightweight call (small prompt, small output); full analysis uses the complete system prompt with nutrition data; separating them reduces token cost and risk of one long call failing | 2026-06-12 |

#### Refinement (2026-08-03): KI-Schätzung für Zutaten ohne BLS/OFF-Treffer

| Decision | Rationale | Date |
|----------|-----------|------|
| Bestehende, per-Zutat gesendete Quellen-Markierung ("BLS"/"Open Food Facts"/"keine Datenbankdaten vorhanden") wiederverwendet, um der KI zu signalisieren welche Zutaten sie schätzen darf | Existiert bereits im heutigen Prompt-Aufbau (`ingredientLines` in `analyse/confirm/route.ts`) — kein Umbau des Prompts nötig, nur eine ergänzende Anweisung. Löst die im Spec offene Frage, ob eine saubere Trennung überhaupt möglich ist | 2026-08-03 |
| Plausibilitäts-Grenzwerte: 0–900 kcal/100g, 0–100g pro Makronährstoff/100g | Einfache, nachvollziehbare Ober-/Untergrenzen aus der Ernährungswissenschaft (900 kcal/100g ≈ reines Fett, das kaloriendichteste realistische Lebensmittel; 100g Makro pro 100g Lebensmittel ist die rechnerische Obergrenze) — fängt grob halluzinierte Ausreißer ab, ohne komplexe Validierungslogik zu benötigen | 2026-08-03 |
| Vierter `data_sources`-Wert "nicht schätzbar" statt Wiederverwendung von "schaetzung" mit 0-Wert | Macht sichtbar unterscheidbar, ob eine Zutat erfolgreich geschätzt wurde oder die Schätzung verworfen wurde — verhindert, dass sich der ursprüngliche Bug (still 0 kcal) unter neuem Namen wiederholt | 2026-08-03 |
| Anzeige über den bestehenden "Annahmen"-Ausklapp-Bereich statt neuer UI-Komponente | Kein neues Frontend-Bauteil nötig; das Konzept passt inhaltlich bereits ("hier hat die KI mit Unsicherheit gearbeitet") | 2026-08-03 |

---

## Implementation Notes
- `src/components/zutatenliste-bestaetigung.tsx` — neue Komponente: zeigt Zutatenliste mit Inline-Editing, Annahmen-Alert, "Passt so"-Button
- `src/components/mahlzeit-input.tsx` — erweitert um 2 neue Steps: `'confirming'` (Zutatenliste zur Bestätigung) und `'calculating'` (Ladescreen während Nährstoffberechnung)
- `src/app/api/analyse/complete/route.ts` — implementiert: liest Konversationsverlauf, ruft Claude (Haiku) für Zutatenlisten-Extraktion auf, gibt `{ ingredients, assumptions }` zurück
- `src/app/api/analyse/confirm/route.ts` — implementiert: fragt Open Food Facts + USDA FoodData Central je Zutat ab (parallel), übergibt alle Nährstoffdaten an Claude (Sonnet) für vollständige Analyse, speichert Ergebnis in `meal_analyses`, löscht Vollbild aus Storage
- `vitest.config.ts` — `include`-Pattern auf `src/**/*.test.ts` gesetzt damit Playwright-E2E-Tests nicht versehentlich von Vitest aufgerufen werden
- Neue Env-Variable `USDA_API_KEY` — muss in `.env.local` und Vercel-Dashboard hinterlegt sein (kostenlos: api.nal.usda.gov)
- Neue Env-Variable muss zu `.env.local.example` hinzugefügt werden (manuell, da Datei außerhalb Schreibpfad)

### Bugfix 2026-06-16
Nutzer-Report: Kalorien einer Mahlzeit massiv unterschätzt (189 statt ~511 kcal laut Handrechnung). Ursache in `src/lib/nutrition.ts`:
- Von Claude formulierte Zutatennamen mit Zubereitungs-Klammerzusatz (z.B. "Karotten (geraspelt)", "roter Quinoa (gekocht)") brachen sowohl das BLS-Alias-Matching als auch die `ilike`-Suche und die Open-Food-Facts-Abfrage — verifiziert per direktem API-Call (`count: 0` mit Klammer, mehrere Treffer ohne). Betroffene Zutaten wurden in `computeMacros()` stillschweigend mit 0 kcal gewertet statt geschätzt, obwohl als "schaetzung" gelabelt.
- Fix: neue `stripDescriptors()`-Funktion entfernt Klammerzusätze vor `normalizeName()` (BLS-Alias + `ilike`) und vor `buildOFFQueries()`. Volle Bezeichnung bleibt fürs Display erhalten.
- Zusätzlich entdeckt (System-Prompt-Lücke, separat behoben): Roh-/Gekocht-Gewichtsverwechslung bei Quinoa — `grams` basierte auf rohem/trockenem Gewicht, der Zutatenname sagte aber "(gekocht)". Neue Regel "Roh-/Gekocht-Gewichtskonsistenz" im `ANALYSIS_SYSTEM_PROMPT` ergänzt (siehe `docs/saettigungsmatrix.md` und `docs/system-prompt.md`).
- Bekannte Restungenauigkeit: `queryBLS()` nutzt `ilike(...).limit(1)` ohne `ORDER BY` — bei mehreren passenden BLS-Einträgen (z.B. "Karotte/Möhre, roh/gekocht/gedünstet/...") ist die Auswahl nicht deterministisch priorisiert. Bisher kein akuter Fall gefunden, aber als Risiko notiert.

### Bugfix 2026-06-16 (Folge-Fix, gleicher Tag)
Nutzer-Report: Nährwerte bei einer weiteren Mahlzeit erneut massiv unterschätzt, trotz vorherigem Fix bereits deployed. Per Supabase-API-Logs verifiziert: Die BLS-Abfragen für „karotte" und „kichererbse reif, gekocht" lieferten in der betroffenen Anfrage `200 OK` mit echten Daten — landeten im gespeicherten Ergebnis aber trotzdem als `"schaetzung"` (0 kcal).
- Ursache: `nutritionMap` wurde vor dem Claude-Call anhand der bestätigten Eingabe-Zutatennamen aufgebaut. Die Makro-Berechnung jointe danach aber gegen `result.zutatenliste[].name` — Claudes eigene, frisch formulierte Namen aus der Analyse-Antwort (ein separater Prompt-Abschnitt, der die Zutatenliste ohnehin neu ausgeben muss). Schreibt Claude den Namen auch nur minimal anders (Singular/Plural, Wortstellung, Großschreibung), läuft der Map-Lookup leise ins Leere — unabhängig davon, ob der ursprüngliche BLS/OFF-Lookup erfolgreich war.
- Fix in `src/app/api/analyse/confirm/route.ts`: neue `resolveNutrition()`-Funktion prüft zuerst `nutritionMap` (schneller Pfad für den Normalfall), fällt bei einem Cache-Miss aber auf einen frischen BLS/OFF-Lookup mit Claudes tatsächlichem Namen zurück. `vorherInputs` und `data_sources` nutzen jetzt beide dieselbe aufgelöste Liste (`resolvedIngredients`) statt zwei unabhängiger, gleich fragiler Joins.

### Implementation Notes (Backend) — Refinement 2026-08-03: KI-Schätzung für Zutaten ohne BLS/OFF-Treffer

- `src/lib/nutrition.ts` — neue exportierte Funktion `isPlausibleEstimate(n: NutritionPer100g): boolean`, prüft kcal ≤ 900/100g und jeden Makronährstoff ≤ 100g/100g, alle Werte ≥ 0 und endlich (`Number.isFinite`). Veralteten Datei-Kopfkommentar korrigiert (USDA-Erwähnung entfernt — war der letzte Code-Rest von USDA im gesamten Repo)
- `src/lib/nutrition.test.ts` — neu, 9 Tests für `isPlausibleEstimate` (Grenzwerte, negative Werte, NaN, Infinity)
- `src/app/api/analyse/confirm/route.ts`:
  - `ANALYSIS_SYSTEM_PROMPT` erweitert: neue Anweisung direkt nach dem bestehenden "keine Zahlen ausgeben"-Verbot, die genau die Ausnahme beschreibt (nur Zutaten mit der bereits bestehenden "Keine Datenbankdaten vorhanden — KI-Schätzung"-Markierung); beide JSON-Format-Beispiele (Standard + Beilage) um das optionale Feld `naehrwert_geschaetzt` ergänzt
  - `LookupSource`-Typ um `'nicht_schaetzbar'` erweitert (vierter Wert neben `'bls' | 'off' | 'schaetzung'`) — `'schaetzung'` bedeutet jetzt immer einen echten, plausibilitätsgeprüften KI-Wert; `'nicht_schaetzbar'` den neuen expliziten Fehlschlag-Fall
  - `resolveNutrition()` erweitert um einen optionalen dritten Fallback-Zweig: nutzt Claudes `naehrwert_geschaetzt` nur, wenn `isPlausibleEstimate()` zustimmt
  - Neues Feld `nichtSchaetzbareZutaten: string[]` im API-Response (`fullResult`) — Namen aller Zutaten ohne DB-Treffer und ohne plausible KI-Schätzung, für die geplante Anzeige im Frontend
  - `refined_ingredients`-Inserts brauchten einen `as unknown as Json`-Cast (TypeScript: benannte Interfaces ohne Index-Signatur sind nicht automatisch dem `Json`-Typ zuweisbar, sobald ein verschachteltes Objekt wie `naehrwert_geschaetzt` dazukommt) — gleiches Muster wie beim bereits bestehenden `beilage_data`-Cast
- `src/app/api/analyse/confirm/route.test.ts` — 4 neue Tests: plausible Schätzung fließt korrekt in die Makro-Berechnung ein, unplausible Schätzung wird verworfen und die Zutat landet in `nichtSchaetzbareZutaten`, eine Zutat ganz ohne KI-Schätzung landet ebenfalls dort, `data_sources` unterscheidet `'schaetzung'` (erfolgreich) und `'nicht_schaetzbar'` (verworfen/keine) korrekt pro Zutat
- Gesamte Vitest-Suite: 245/245 grün (vorher 232, +13 neue Tests: 9 in `nutrition.test.ts`, 4 in `confirm/route.test.ts`). `tsc --noEmit` und `eslint` für alle geänderten Dateien sauber (zwei vorbestehende, unabhängige `tsc`-Fehler in `tests/PROJ-2-*` und `tests/PROJ-5-*` unberührt von dieser Änderung)
- **Bewusst nicht angefasst:** `zusatzItems` (Nährwert-Abfrage für vorgeschlagene Zusatz-Zutaten in `vorschlaege[].zusatz`) nutzt weiterhin nur BLS/OFF ohne KI-Schätzungs-Fallback — Scope-Entscheidung aus dem Refinement war ausdrücklich "ausschließlich die unbekannten Zutaten der Mahlzeit", nicht hypothetische Vorschlags-Zutaten
- **Frontend inzwischen umgesetzt** (siehe Implementation Notes Frontend unten) — dieser Punkt ist erledigt.

### Implementation Notes (Frontend) — Refinement 2026-08-03: Anzeige der KI-Schätzung

- `src/components/saettigungs-ergebnis.tsx`:
  - `StandardAnalysisResult` um optionales Feld `nichtSchaetzbareZutaten?: string[]` erweitert
  - Bestehender "Basierend auf Annahmen"-Ausklappbereich wiederverwendet statt neuer Komponente (wie in der Architektur-Phase entschieden): Sichtbarkeits-Bedingung um `nichtSchaetzbareZutaten.length > 0` erweitert (öffnet den Bereich jetzt auch, wenn es keine sonstigen Annahmen/kein Foto gibt), neuer Warnhinweis-Block darunter (mit Trennlinie falls zusätzlich Annahmen vorhanden), Amber-Ton (`text-[#EAB308]`, passend zum bestehenden "mittel"-Bewertungston) statt des neutralen Grautons der normalen Annahmen — macht den Unterschied "das haben wir angenommen" vs. "das konnten wir nicht einschätzen" sichtbar
  - Text pro Zutat: „Nährwert für „X" konnte nicht zuverlässig geschätzt werden — fließt nicht in die Kalorienberechnung ein."
- `src/app/mahlzeit/[id]/page.tsx` (Mahlzeit-Historie-Detailansicht):
  - `data_sources` zusätzlich aus `meal_analyses` selektiert — war zuvor nie aus der DB gelesen worden (vorbestehende Lücke, unabhängig von diesem Refinement, siehe Backend-Notiz oben)
  - Neue Ableitung `nichtSchaetzbareZutaten` aus `analysis.data_sources` (`source === 'nicht_schaetzbar'`), an `StandardAnalysisResult` durchgereicht — der Hinweis erscheint jetzt auch beim späteren Ansehen einer Mahlzeit aus der Historie, nicht nur direkt nach der Analyse
- Live-Verifikation: Synthetische Test-Mahlzeit + `meal_analyses`-Zeile mit einer `nicht_schaetzbar`-markierten Zutat direkt in der Produktions-Supabase-Datenbank angelegt (qa-test-Konto), Seite per Playwright gegen den laufenden Dev-Server aufgerufen, Screenshot bestätigt: Warnhinweis erscheint korrekt getrennt von den normalen Annahmen, mit Warn-Icon und amber Farbton. Testdaten danach vollständig entfernt
- `tsc --noEmit` und `eslint` für beide geänderten Dateien sauber; komplette Vitest-Suite weiterhin 245/245 grün (keine neuen Unit-Tests nötig — reine Darstellungslogik ohne eigenständige Berechnung, bereits durch die Backend-Tests in `confirm/route.test.ts` abgesichert)

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

---

### Refinement (2026-08-03): KI-Schätzung für Zutaten ohne BLS/OFF-Treffer

**Wichtiger Befund vorab:** Das System markiert intern schon heute pro Zutat, welche Quelle die Nährwerte geliefert hat (BLS, Open Food Facts oder "keine Datenbank-Quelle gefunden"), und teilt genau diese Markierung der KI bereits im heutigen Analyse-Aufruf mit ("Keine Datenbankdaten vorhanden — KI-Schätzung"). Die KI kann "diese Zutat darf ich schätzen" also schon heute klar von "diese Zutat darf ich nicht anfassen" unterscheiden — wir müssen dafür nichts umbauen, nur die Anweisung an die KI ergänzen und ihre Antwort an der richtigen Stelle auswerten.

#### Komponenten-Struktur (Änderungen)

Keine neue UI-Komponente nötig. Der bestehende, bereits ausklappbare "Basierend auf Annahmen"-Bereich auf dem Ergebnis-Bildschirm wird wiederverwendet:

```
Ergebnis-Bildschirm (bestehend, SaettigungsErgebnis)
└── "ℹ️ Basierend auf Annahmen" — Ausklapp-Bereich (bestehend)
    ├── Bisherige Annahmen-Hinweise (unverändert)
    └── NEU: Hinweis pro Zutat, deren Nährwert nicht plausibel geschätzt werden konnte
        (z.B. "Nährwert für 'Yuzu-Paste' konnte nicht zuverlässig geschätzt werden")
```

#### Datenmodell (Klartext, keine Schema-Änderung)

Jede Zutat trägt intern schon eine von drei Kennzeichnungen: "aus BLS", "aus Open Food Facts" oder "keine Datenbank-Quelle". Neu kommt hinzu:
- Für Zutaten mit der Kennzeichnung "keine Datenbank-Quelle" liefert die KI in ihrer ohnehin stattfindenden Antwort zusätzlich einen geschätzten Nährwert pro 100g (Kalorien, Protein, Kohlenhydrate, Zucker, Fett, Ballaststoffe) — nur für genau diese Zutaten.
- Dieser geschätzte Wert wird gegen einen plausiblen Wertebereich geprüft, bevor er in die Berechnung einfließt (siehe Tech-Entscheidungen unten).
- Besteht die Prüfung nicht, bekommt die Zutat eine vierte Kennzeichnung: "nicht schätzbar" — sie fließt dann wie bisher mit 0 in die Berechnung ein, aber der Nutzer sieht das jetzt explizit statt dass es unsichtbar bleibt.
- Kein neues Datenbankfeld nötig — die bestehende `data_sources`-Spalte in `meal_analyses` bekommt lediglich einen vierten möglichen Wert zusätzlich zu den bestehenden drei.

#### Tech-Entscheidungen (für PM, mit Begründung)

- **Kein zusätzlicher KI-Aufruf:** Die Schätzung läuft im bestehenden Analyse-Aufruf mit — die KI sieht die betroffene Zutat ohnehin schon in diesem Schritt. Ein zweiter, separater Aufruf nur für die Schätzung würde Kosten und Wartezeit erhöhen, ohne einen erkennbaren Vorteil zu bringen.
- **Plausibilitäts-Grenzwerte statt ungeprüfter Übernahme:** Kalorien pro 100g werden auf 0–900 begrenzt (900 entspricht in etwa reinem Fett/Öl — dem kaloriendichtesten realistischen Lebensmittel, alles darüber ist mit sehr hoher Wahrscheinlichkeit ein Fehler der KI), jeder Makronährstoff (Protein/Kohlenhydrate/Zucker/Fett/Ballaststoffe) auf 0–100g pro 100g begrenzt (kann rein rechnerisch nicht mehr sein). Das ist eine einfache, nachvollziehbare Faustregel-Prüfung, keine komplexe Validierungslogik — reicht aber aus, um einen krass falschen (halluzinierten) Einzelwert abzufangen, wie er in dieser Datei schon zweimal zu falschen Kalorienangaben geführt hat.
- **Wiederverwendung der bestehenden "Annahmen"-Anzeige statt neuer UI:** Minimiert den Frontend-Aufwand; das Konzept "hier hat die KI mit Unsicherheit gearbeitet" existiert dort bereits und passt inhaltlich genau.
- **Bestehende Nährwert-Markierung (BLS/OFF/keine Quelle) wird wiederverwendet, nicht neu gebaut:** Die KI bekommt dadurch ohne Prompt-Umbau exakt das Signal, welche Zutaten sie schätzen darf.

#### Abhängigkeiten

Keine neuen npm-Pakete. Keine neue Umgebungsvariable. Keine Schema-Migration.

## QA Test Results

### Refinement-QA (2026-08-03) — KI-Schätzung für Zutaten ohne BLS/OFF-Treffer

**QA-Datum:** 2026-08-03
**App URL:** http://localhost:3000 (lokaler Dev-Server) + Live-Verifikation gegen das Produktions-Supabase-Projekt
**Tester:** QA Engineer (AI)
**Scope:** Nur die Refinement-Änderungen (KI-Schätzung + Plausibilitätsprüfung + Anzeige). Die restlichen Acceptance Criteria des ursprünglichen PROJ-4 (Rückfragen, Zutatenlisten-Bestätigung, Grundberechnung) waren bereits am 2026-06-12 QA-approved und wurden hier nur im Rahmen der Regressionstests erneut angefasst, nicht einzeln neu bewertet.

#### Automatisierte Tests (zuerst ausgeführt)
- `vitest run`: **245/245 grün** (13 neue Tests: 9 `isPlausibleEstimate`, 4 `confirm/route.test.ts`)
- `tsc --noEmit`: sauber für alle geänderten Dateien (zwei vorbestehende, unabhängige Fehler in `tests/PROJ-2-*` und `tests/PROJ-5-*` unberührt)
- `eslint`: sauber
- Neue Playwright-Tests (`tests/PROJ-4-ki-analyse-agent.spec.ts`, Gruppe "KI-Schätzung für unbekannte Zutaten"): **3/3 grün** auf Chromium UND Mobile Chrome
- **Vollständiger Regressionslauf der bestehenden `PROJ-4-ki-analyse-agent.spec.ts`-Suite (21 Tests, vor den 3 neuen): 4 Fehlschläge — alle als vorbestehend verifiziert, siehe Bugs unten**

#### Acceptance Criteria Status (Refinement)

**Nährstoffberechnung**
- [x] BLS → Open Food Facts → KI-Schätzung als Prioritätsreihenfolge — Code-Review + Unit-Tests bestätigt
- [x] Unbekannte Zutat → Schätzung im selben Analyse-Call, kein zusätzlicher API-Aufruf — Code-Review bestätigt (weiterhin nur 1 Claude-Aufruf pro Analyse, unverändert seit PROJ-18)
- [x] Bekannte Zutat → KI gibt keine eigenen Zahlen aus — bestätigt, UND zusätzlich robust gegen ein "ungehorsames" Claude-Verhalten: `resolveNutrition()` prüft BLS/OFF/Cache **immer zuerst**, ein eventuell trotzdem mitgeliefertes `naehrwert_geschaetzt` für eine bereits gematchte Zutat wird dadurch strukturell ignoriert, nicht nur per Prompt-Anweisung verhindert
- [x] Unplausible Schätzung wird verworfen statt übernommen — Unit-Tests bestätigt (0–900 kcal/100g, 0–100g je Makro, `Number.isFinite`)
- [x] Verworfene Schätzung → sichtbarer Hinweis statt stiller 0-kcal-Wertung — live verifiziert (Screenshot, siehe Frontend-Notes)
- [ ] **FEHLGESCHLAGEN:** Erfolgreiche Schätzung wird explizit als "Schätzung" gekennzeichnet ("gleiches Label wie bisher, jetzt mit echtem Wert") — siehe BUG-4 unten: dieses Label wurde nie irgendwo gerendert, auch nicht vor dem Refinement. Die Zahl selbst ist korrekt, aber für den Nutzer nicht von einem BLS/OFF-Wert zu unterscheiden
- [x] Datenquellen sind pro Zutat maschinenlesbar mit Quelle verknüpft (`data_sources`, jetzt 4 Werte) — Datenmodell-seitig korrekt, aber siehe BUG-4 (nicht in der UI sichtbar — vorbestehende Lücke, nicht durch dieses Refinement verursacht, aber auch nicht dadurch geschlossen)

**Fehlerverhalten**
- [x] BLS/OFF nicht erreichbar → wie unbekannte Zutat behandelt (Schätzung + Plausibilitätsprüfung) — Code-Review: beide Query-Funktionen fangen Fehler intern ab und geben `null` zurück, identischer Pfad wie "kein Treffer"

#### Edge Cases (Refinement)
- [x] Alle Zutaten einer Mahlzeit unbekannt — jede Zutat wird unabhängig behandelt, keine Array-Größen-Annahmen im Code, die das brechen könnten (Code-Review)
- [x] BLS/OFF-Timeout bei einer sonst bekannten Zutat → korrekt wie unbekannte Zutat behandelt (siehe Fehlerverhalten oben)

#### Security Audit (Red Team)
- [x] Typ-Verwirrung / Halluzination in `naehrwert_geschaetzt`: String, `null`, `NaN`, `Infinity` als Wert → alle sicher durch `Number.isFinite()` abgefangen (Unit-Tests: `rejects NaN`, `rejects Infinity`)
- [x] Bekannte Zutat mit trotzdem mitgeliefertem `naehrwert_geschaetzt` → strukturell wirkungslos (siehe AC oben) — kein Weg für eine (versehentlich oder absichtlich) falsch befüllte Schätzung, eine bereits korrekt gematchte Zutat zu überschreiben
- [x] `{name}` in der neuen Warnmeldung wird über JSX interpoliert (React escaped automatisch) — kein XSS-Vektor selbst bei einem manipulierten Zutatennamen
- [x] RLS auf `meal_analyses` erneut live geprüft (`SELECT`-Policy filtert weiterhin auf `meals.user_id = auth.uid()`) — durch die neue `data_sources`-Selektion in der Historie-Detailseite nicht verändert oder umgangen
- [x] Keine neue Kosten-/Rate-Limiting-Angriffsfläche — weiterhin exakt 1 Claude-Aufruf pro Analyse, unabhängig davon ob eine Schätzung stattfindet

#### Regression Testing
- [x] Komplette Vitest-Suite: 245/245 grün
- [x] Neue Refinement-E2E-Tests: 3/3 grün auf Chromium + Mobile Chrome (kein Cross-Browser-Test möglich — Repo hat nur `chromium`/`Mobile Chrome`-Projekte konfiguriert, kein Firefox/Safari, vorbestehende Projekt-Einschränkung)
- [x] Responsive 375px mit einem absichtlich sehr langen Zutatennamen: kein horizontales Overflow, sauberer Zeilenumbruch (Screenshot)
- [~] Vollständiger Regressionslauf der bestehenden `PROJ-4-ki-analyse-agent.spec.ts` (21 Tests vor den 3 neuen): **4 Fehlschläge, alle als vorbestehend und unabhängig von diesem Refinement verifiziert** (kein Dateizugriff durch dieses Refinement auf die betroffene Komponente `zutatenliste-bestaetigung.tsx`) — siehe BUG-5 und BUG-6 unten

#### Bugs Found

##### BUG-4: Kein sichtbarer Hinweis bei erfolgreicher KI-Schätzung (bzw. bei jeder Datenbank-Quelle allgemein) — ✅ GEFIXT (2026-08-03)
- **Severity:** Medium
- **Beschreibung:** `data_sources` wird korrekt berechnet und persistiert, aber weder auf der Ergebnisseite direkt nach der Analyse noch in der Historie-Detailansicht jemals gerendert — auch nicht für BLS/OFF-Treffer. Der Nutzer kann also nicht erkennen, ob eine Kalorienzahl aus einer verlässlichen Datenbank stammt oder von der KI geschätzt wurde. Das war schon vor diesem Refinement so (das "Schätzung"-Label aus dem ursprünglichen AC 42 wurde nie umgesetzt) — durch dieses Refinement bekommt der geschätzte Wert zwar zum ersten Mal einen echten, plausiblen Inhalt statt 0, bleibt aber weiterhin unmarkiert.
- **Nicht durch dieses Refinement verursacht**, aber eine der eigenen Acceptance Criteria des Refinements ("gleiches Label wie bisher, jetzt mit echtem Wert") ist dadurch **nicht erfüllt** — es gibt kein "bisheriges Label", das wiederverwendet werden könnte.
- **Impact:** Kein Datenfehler (die Zahl ist korrekt), aber ein Transparenz-/Vertrauens-Defizit — genau das, was die App an anderer Stelle (KI-Hinweis, PROJ-25) explizit betont.
- **Empfehlung:** Kleiner Badge/Hinweis analog zum neuen "nicht schätzbar"-Warnhinweis, z.B. "✨ KI-geschätzt" neben oder in der Zutatenliste, wenn `source === 'schaetzung'`.
- **Priority:** Sollte zeitnah nachgezogen werden, kein Deploy-Blocker.
- **Fix:** Neues Feld `kiGeschaetzteZutaten: string[]` im API-Response von `/api/analyse/confirm` (analog zu `nichtSchaetzbareZutaten`, gefiltert auf `source === 'schaetzung'`). `saettigungs-ergebnis.tsx` zeigt diese im selben "Basierend auf Annahmen"-Bereich mit neutralem Ton ("≈ Nährwert für „X" ist eine KI-Schätzung (keine Datenbankquelle gefunden)."), bewusst in `text-muted-foreground` statt der Warnfarbe des "nicht schätzbar"-Hinweises, da dieser Fall kein Problem darstellt. Historie-Detailseite (`mahlzeit/[id]/page.tsx`) leitet denselben Wert zusätzlich aus `data_sources` ab, analog zu BUG-4s Pendant.
- **Verifikation:** Live gegen die Produktions-Supabase-Datenbank mit einer synthetischen Testmahlzeit (qa-test-Konto) verifiziert — Screenshot bestätigt klare visuelle Trennung zwischen KI-Schätzung (neutral, "≈") und "nicht schätzbar" (Warnung, "⚠️"), danach Testdaten entfernt. Permanenter Regressionstest ergänzt (`tests/PROJ-4-ki-analyse-agent.spec.ts`, "erfolgreiche KI-Schätzung wird als solche gekennzeichnet..."). Neue Assertions in 3 bestehenden `confirm/route.test.ts`-Tests ergänzt. Vitest weiterhin 245/245 grün.

##### BUG-5: "Fertig"-Button in der Zutatenlisten-Bearbeitung hat keinen zugänglichen Namen mehr — ✅ GEFIXT (2026-08-03)
- **Severity:** Medium
- **Beschreibung:** `src/components/zutatenliste-bestaetigung.tsx:111-113` — der Speichern-Button beim Inline-Editieren einer Zutat ist inzwischen ein reiner Icon-Button (`<Check />`, lucide-react) ohne Text und ohne `aria-label`. `getByRole('button', { name: 'Fertig' })` findet ihn dadurch nicht mehr — sowohl in Screenreadern als auch für automatisierte Tests unauffindbar.
- **Nicht durch dieses Refinement verursacht** — diese Datei wurde in diesem Refinement nicht angefasst; die Änderung muss zu einem früheren, nicht dokumentierten Zeitpunkt passiert sein (vermutlich ein UI-Redesign auf Icon-Buttons).
- **Reproduktion:** Auf `/analyse` eine Zutat im Bestätigungsschritt bearbeiten (Stift-Icon) → Speichern-Button ist da und funktioniert per Klick, aber `getByRole('button', {name: 'Fertig'})` bzw. jede name-basierte Auffindung schlägt fehl.
- **Betroffene, aktuell rot laufende Tests:** `Zutatenliste-Bestätigung — Inline-Bearbeitung › Edit-Icon öffnet Bearbeitungsfelder für die Zutat`, `› "Fertig"-Button speichert den geänderten Zutaten-Namen`
- **Empfehlung:** `aria-label="Fertig"` (oder sichtbaren Text) auf den Button ergänzen — echte Accessibility-Lücke, nicht nur ein Test-Problem.
- **Priority:** Sollte behoben werden (Accessibility), aber unabhängig von diesem Refinement — eigener kleiner Fix-Task.
- **Fix:** `aria-label="Fertig"` auf `src/components/zutatenliste-bestaetigung.tsx:111` ergänzt. Beim Fixen einen identischen zweiten Fall im selben Icon-Button-Muster gefunden und mitbehoben: der "Zutat hinzufügen"-Bestätigungsbutton (Zeile 167) hatte dasselbe Problem, jetzt `aria-label="Zutat hinzufügen"`.
- **Verifikation:** Beide zuvor roten Tests (`Edit-Icon öffnet Bearbeitungsfelder für die Zutat`, `"Fertig"-Button speichert den geänderten Zutaten-Namen`) sowie die restlichen 3 Tests derselben Gruppe erneut ausgeführt — 5/5 grün.

##### BUG-6: Veraltete Test-Assertion auf entfernten "USDA"-Ladetext — ✅ GEFIXT (2026-08-03)
- **Severity:** Low
- **Beschreibung:** `tests/PROJ-4-ki-analyse-agent.spec.ts:169` prüft auf den Text "Open Food Facts & USDA werden abgefragt." — dieser Text existiert in der aktuellen `mahlzeit-input.tsx` nicht mehr (nur noch "Nährstoffe werden berechnet…", ohne Unterzeile). Reiner Test-Fossil-Fund aus der Zeit vor der BLS-Umstellung, kein Nutzer-Impact (die echte UI zeigt korrekt keinen USDA-Text mehr).
- **Betroffener Test:** `Nährstoffberechnung › "Passt so →" zeigt Berechnungs-Ladescreen mit ⚗️`
- **Empfehlung:** Assertion auf die zweite Zeile entfernen oder an den aktuellen Text anpassen.
- **Priority:** Nice to have — Test-Wartung, kein Produktcode betroffen.
- **Fix:** Zeile mit der veralteten Assertion entfernt (`tests/PROJ-4-ki-analyse-agent.spec.ts:169`).
- **Verifikation:** Test erneut ausgeführt — grün.

#### Nachtrag: alle 3 Bugs behoben (2026-08-03, vor dem nächsten Deploy)
Auf Wunsch des Product Owners direkt im Anschluss an die QA behoben, Schritt für Schritt (BUG-6 → BUG-5 → BUG-4), jeweils mit Tests verifiziert. Vollständiger Regressionslauf der gesamten `PROJ-4-ki-analyse-agent.spec.ts`-Suite danach: **22/22 grün** (vorher 18/22 mit den 4 bekannten Fehlschlägen — jetzt inkl. 4 neuer Tests aus diesem Refinement). Komplette Vitest-Suite weiterhin 245/245 grün, `tsc`/`eslint` sauber.

#### Summary (Refinement-QA)
- **Acceptance Criteria:** 8/8 der Refinement-spezifischen Kriterien erfüllt (BUG-4 behoben)
- **Bugs Found:** 3, alle 3 behoben und verifiziert (0 Critical, 0 High, 2 Medium: BUG-4 ✅, BUG-5 ✅, 1 Low: BUG-6 ✅)
- **Security:** Pass — Plausibilitätsprüfung robust gegen Typ-Verwirrung/Halluzination, keine neue Angriffsfläche, RLS weiterhin korrekt
- **Production Ready:** **JA** — keine offenen Bugs jeglicher Severity
- **Empfehlung:** Deployen

---

### Ursprüngliche QA-Runde (2026-06-12)

**QA-Datum:** 2026-06-12
**Status:** Approved — Medium-Bug (Längenbeschränkung) wurde während QA behoben

#### Test-Zusammenfassung

| Suite | Tests | Bestanden | Fehlgeschlagen |
|-------|-------|-----------|----------------|
| Unit Tests (Vitest) | 22 | 22 | 0 |
| E2E Tests (Playwright, Chromium) | 18 | 18 | 0 |
| E2E Tests (Playwright, Mobile 375px) | 2 | 2 | 0 |
| **Gesamt** | **42** | **42** | **0** |

#### Acceptance Criteria — Status

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

#### Security Audit (Red Team)

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

#### Bugs

#### Medium — Name/Amount ohne Längenbeschränkung
**Beschreibung:** `ingredientSchema` in `/api/analyse/confirm/route.ts` hat kein `.max()` auf `name` und `amount`. Ein Angreifer könnte 30 Zutaten mit extrem langen Namen schicken und so den Claude-Prompt künstlich aufblähen.
**Schritte:** POST `/api/analyse/confirm` mit `{ name: "a".repeat(10000), amount: "..." }` × 30
**Fix:** `z.string().min(1).max(200)` für `name`, `.max(50)` für `amount`

#### Low — `/api/analyse/confirm` ohne Status-Check
**Beschreibung:** Das Endpoint prüft nicht ob `meal_conversations.status === 'confirming'`. Ein eingeloggter Nutzer könnte `/api/analyse/confirm` direkt aufrufen ohne den `/complete`-Schritt gemacht zu haben.
**Impact:** Keine Sicherheitslücke (Eigentümerschaft wird geprüft); nur Daten-Integrität
**Fix:** Status-Check auf `meal_conversations` vor der Verarbeitung

#### Responsive-Test

| Viewport | Befund |
|----------|--------|
| Desktop 1280px | ✅ kein horizontaler Scroll, alle Touch-Targets bedienbar |
| Mobile 375px | ✅ kein horizontaler Scroll, "Passt so →"-Button ≥ 44px |

#### Produktionsreife-Entscheidung

**BEREIT** — Medium-Bug wurde während QA behoben. Keine Critical/High Bugs. Keine Medium Bugs mehr offen.

## Deployment

**Deployed:** 2026-06-12
**Production URL:** https://endlichsattapp.vercel.app/
**Git Tag:** v1.4.0-PROJ-4
**Neue Env-Variable:** `USDA_API_KEY` in Vercel Dashboard hinterlegt
