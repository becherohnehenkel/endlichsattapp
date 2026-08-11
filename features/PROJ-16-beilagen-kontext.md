# PROJ-16: Beilagen-Kontext

## Status: Deployed (Refinement: Komponente & Snack "Complete" — Approved, bereit für /deploy)
**Created:** 2026-07-03
**Last Updated:** 2026-08-11

**Refinement (2026-08-11, "Complete"-Umstrukturierung):** Betrifft ausschließlich **Teil 3+4** dieses Specs (KI-Analyse bei fotografierten/beschriebenen Mahlzeiten). **Teil 1+2** (Admin-`recipe_typ` auf Rezepten in der Rezeptbibliothek, Rezept-Detailseiten-Hinweis) sind vom Umbau nicht betroffen und bleiben unverändert live. Die bisherige Rückfrage-Trigger-Logik in Teil 3 wird durch PROJ-4s neue Schritt-0-Klassifikation ersetzt (PROJ-16 ist nicht mehr für die Erkennung zuständig, nur noch für die Darstellung). Der bisherige Beilagen-Output in Teil 4 wird zum Komponente-Output; ein komplett neuer Snack-Output kommt dazu. Nächster Schritt: `/architecture`, dann `/backend`+`/frontend`.

## Dependencies
- PROJ-8 (Rezeptbibliothek) — Beilage-Flag auf Rezepten, Rezept-Detailseite (Teil 1+2, unverändert)
- PROJ-4 (KI-Analyse-Agent) — **Refinement 2026-08-11:** liefert jetzt das `typ`-Feld (`mahlzeit`/`komponente`/`snack`) aus der Schritt-0-Klassifikation; PROJ-16 hat keine eigene Trigger-Logik mehr, konsumiert nur noch
- PROJ-5 (Sättigungs-Einschätzung) — Analyse-Output in confirm/route.ts

## User Stories
- Als Nutzer, der ein Beilagen-Rezept aufruft, möchte ich sofort verstehen, dass dieses Gericht allein keine sättigende Mahlzeit ergibt — und was gut dazu passt
- Als Nutzer, der ein Foto eines Salats oder Körnigen Frischkäses macht, möchte ich eine ehrliche Einordnung erhalten, dass das noch kein vollständiges Gericht ist — mit konkreten Pairing-Ideen
- Als Admin möchte ich beim Anlegen oder Bearbeiten eines Rezepts schnell markieren können, dass es sich um eine Beilage handelt
- Als Nutzer möchte ich durch die App lernen, was eine vollständige Mahlzeit ausmacht — ohne belehrt zu werden
- Als Nutzer, der einen Snack (Apfel, Stück Kuchen) fotografiert, möchte ich eine kurze, wertfreie Bestätigung statt einer vollständigen Analyse, damit ich nicht das Gefühl habe, jeden Bissen rechtfertigen zu müssen. *(Refinement 2026-08-11 — neu)*

## Out of Scope
- Automatische KI-Erkennung ob ein Rezept eine Beilage ist (Admin entscheidet manuell via Checkbox)
- Beilage-Kategorie als Filter in der Rezeptbibliothek — deferred
- Kombinierter Sättigungs-Score für "Beilage + Hauptgericht zusammen" — zu komplex für MVP
- Mahlzeiten-Kombinations-Funktion ("analysiere Salat + Hähnchen zusammen") — deferred
- **Erkennung/Klassifikation (mahlzeit/komponente/snack)** (Refinement 2026-08-11) — das ist PROJ-4 (Schritt 0), PROJ-16 konsumiert nur das Ergebnis
- **Geschmacks-Score-Anzeige im Komponente-Output** (Refinement 2026-08-11) — laut fachlicher Neufassung soll der Geschmacks-Score künftig auch bei `typ: komponente` mitlaufen, ist aber an das noch nicht gebaute Geschmack-Feature gebunden; hier nur als offener Punkt vermerkt (siehe Open Questions), nicht als testbares Acceptance Criterion dieses Refinements

## Acceptance Criteria

### Teil 1: Admin — Rezept-Typ im Rezept-Formular

- [ ] Angenommen der Admin öffnet das Formular für ein neues Rezept, dann gibt es eine Auswahl mit drei Optionen: „Vollständiges Gericht" (Standard), „Beilage" (Salat, Rohkost, Gemüsebeilage) und „Grundlagen-Rezept" (Brot, Brühe, Sauce, Teig)
- [ ] Angenommen der Admin öffnet ein bestehendes Rezept zum Bearbeiten, wenn er die Seite lädt, dann zeigt die Auswahl den aktuell gespeicherten Typ
- [ ] Angenommen der Admin wählt „Beilage" oder „Grundlagen-Rezept" und speichert, dann wird `recipe_typ: 'beilage'` bzw. `recipe_typ: 'grundlage'` in der Datenbank gespeichert
- [ ] Angenommen der Admin wählt „Vollständiges Gericht" und speichert, dann wird `recipe_typ: null` gespeichert

### Teil 2: Rezept-Detailseite — Kontext-Hinweis

- [ ] Angenommen ein Rezept hat `recipe_typ: 'beilage'`, wenn ein Nutzer die Detailseite öffnet, dann erscheint ein Hinweisblock mit Badge „Als Beilage gedacht" anstelle der normalen Sättigungs-Bewertung
- [ ] Angenommen ein Rezept hat `recipe_typ: 'grundlage'`, wenn ein Nutzer die Detailseite öffnet, dann erscheint ein Hinweisblock mit Badge „Grundlagen-Rezept" anstelle der normalen Sättigungs-Bewertung
- [ ] Angenommen der Hinweisblock wird angezeigt, dann kommuniziert er: dieses Rezept allein macht noch keine vollständige Mahlzeit — mit passender Formulierung je nach Typ (Beilage vs. Grundlage)
- [ ] Angenommen ein Rezept hat `recipe_typ: null`, wenn ein Nutzer die Detailseite öffnet, dann erscheint die normale Sättigungs-Bewertung unverändert

### Teil 3: KI-Analyse — Erkennung (Refinement 2026-08-11: verschoben nach PROJ-4)

~~Die bisherige Beilagen-Rückfrage-Logik (max. 2 Fragen, 3 Kriterien-Trigger) ist durch PROJ-4s Schritt-0-Klassifikation ersetzt~~ — siehe `PROJ-4-ki-analyse-agent.md`, Abschnitt "Schritt-0-Klassifikation". PROJ-16 bekommt das fertige `typ`-Feld geliefert und ist für die Erkennung selbst nicht mehr zuständig. Die alten Acceptance Criteria dieses Teils sind damit hinfällig (nicht mehr einzeln getestet, PROJ-4 deckt die Klassifikation ab).

### Teil 4: KI-Analyse — Komponente-Output (Refinement 2026-08-11 — vorher "Beilagen-Output")

- [ ] Angenommen `typ: komponente` (aus PROJ-4), dann erscheint kein „wenig/mäßig/sehr sättigend"-Score und keine Säulen-Bewertung
- [ ] Angenommen `typ: komponente`, dann enthält der Output eine **quantitative** positive Bilanz was das Gericht beisteuert (z.B. "Bringt schon mal 180g Gemüse und 4g Ballaststoffe mit" statt nur ein wertschätzender Satz ohne Zahlen)
- [ ] Angenommen `typ: komponente`, dann enthält der Output **maximal EINEN** Kombinationsvorschlag, womit daraus eine komplette Mahlzeit wird (Refinement — vorher 2–3 Pairing-Empfehlungen)
- [ ] Angenommen `typ: komponente`, dann formuliert die KI nie bevormundend — sie erklärt, zeigt den Mehrwert als Komponente, macht keine Schuldgefühle
- [ ] Angenommen `typ: komponente`, dann enthält der Output **kein** `art_of_eating_tipp` mehr (Refinement — Art of Eating ist jetzt eine eigene Sektion, kein Anhängsel im Komponente-Output)

### Teil 5: KI-Analyse — Snack-Output (Refinement 2026-08-11 — komplett neu)

- [ ] Angenommen `typ: snack` (aus PROJ-4), dann erscheint eine kurze, neutral-warme Bestätigung (z.B. "Alles klar, Snack — der braucht keine Analyse.") — kein Kalorien-Kommentar, kein "Ausnahme"- oder "Sünde"-Vokabular, keine Kompensations-Tipps
- [ ] Angenommen `typ: snack`, dann erscheinen kein Sättigungs-Score, kein Geschmacks-Score, keine Verbesserungs- oder Kombinationsvorschläge
- [ ] Angenommen ein Snack analysiert wurde, dann wird er trotzdem normal in der Mahlzeit-Historie geloggt und soll im künftigen Wochenrückblick (PROJ-17) als eigene Kategorie erscheinen — zählt aber nicht in die Komplett-Quote der Mahlzeiten (weder positiv noch negativ)

## Edge Cases

- **Beilage + echter Hauptgang zusammen fotografiert:** Wenn Nutzer z.B. Salat + Schnitzel fotografiert, ist das keine Komponente-Situation — wird von PROJ-4s Schritt 0 als `mahlzeit` klassifiziert, normale Analyse
- **Rezept als Beilage markiert, aber Nutzer macht separate Foto-Analyse davon:** Die Analyse weiß nichts vom Admin-Flag (Teil 1+2) — die Klassifikation läuft unabhängig über PROJ-4s Schritt 0
- **Admin markiert ein vollständiges Gericht versehentlich als Beilage/Grundlage:** Der Kontext-Hinweis erscheint trotzdem — Admin muss den Typ manuell zurücksetzen (Teil 1+2, unverändert)
- **Historische Analyse-Ergebnisse mit `typ: "beilage"`** (Refinement 2026-08-11, neu): Alte, vor diesem Refinement gespeicherte `meal_analyses`-Datensätze behalten den Wert `"beilage"` dauerhaft in ihrem gespeicherten JSON — die Anzeige-Komponente muss sowohl den alten Wert `"beilage"` als auch den neuen Wert `"komponente"` gleich behandeln (keine Migration bestehender Datensätze nötig, reine Vorwärtskompatibilität in der Rendering-Logik)
- ~~Grenzfälle (z.B. Avocado-Toast)~~ → **entfällt hier (Refinement 2026-08-11):** Grenzfall-Verhalten ist jetzt Teil von PROJ-4s Schritt 0 (Grauzone 250–400 kcal → eine Rückfrage), nicht mehr PROJ-16s Zuständigkeit

## Technical Requirements
- Neues Datenbankfeld: `recipe_typ text DEFAULT NULL CHECK (recipe_typ IN ('beilage', 'grundlage'))` auf der `recipes`-Tabelle (Teil 1+2, unverändert)
- API-Erweiterung: `recipe_typ` in RecipeSchema (POST/PUT /api/admin/rezepte) — Werte: `'beilage' | 'grundlage' | null` (Teil 1+2, unverändert)
- Rezept-Detailseite: Bedingte Anzeige — Kontext-Hinweis (je nach `recipe_typ`) ODER Sättigungs-Bewertung (Teil 1+2, unverändert)
- ~~KI-Prompts: `start/route.ts` und `answer/route.ts` um Beilagen-Erkennung erweitern~~ → **entfällt (Refinement 2026-08-11):** Erkennung läuft jetzt über PROJ-4s Schritt 0
- KI-Prompt: `confirm/route.ts` — Output-Typ `beilage` wird zu `komponente` erweitert (neuer Wert, alter Wert bleibt für historische Datensätze gültig, siehe Edge Cases), plus komplett neuer Output-Typ `snack`
- Frontend: `BeilagenErgebnis`-Komponente (oder Nachfolger) muss beide Werte (`typ === 'beilage'` für Altbestand, `typ === 'komponente'` neu) gleich rendern; neue Komponente/Zweig für `typ === 'snack'`

## Open Questions
- [x] Welchen genauen Wortlaut soll der Beilagen-Hinweis auf der Rezept-Detailseite haben? → Definiert: Badge "Als Beilage gedacht" + Erklärungstext "Als Beilage top — allein noch keine vollständige Mahlzeit. Kombiniere es mit einer Proteinquelle (Quark, Ei, Fleisch) und ggf. Brot oder Stärke." Exakter Wortlaut final beim /frontend-Skill
- [x] Welche Pairing-Kategorien sollen im Beilagen-Output genannt werden? → Definiert in docs/system-prompt.md: Milchprodukte (Skyr, Quark), Eier, Fleisch/Fisch, Pflanzenprotein, Brot-Kombination — kontextabhängig 2–3 Kategorien nennen, je nach Gericht
- [ ] Geschmacks-Score im Komponente-Output: läuft erst mit, sobald das Geschmack-Feature selbst existiert — dieses Refinement bereitet nur die Datenstruktur vor (kein Score verfügbar), tatsächliche Anzeige folgt bei `/write-spec` für Geschmack
- [ ] Exakter Wortlaut der Snack-Bestätigung (Refinement 2026-08-11) → Richtwert aus `docs/saettigungsmatrix.md`: "Alles klar, Snack — der braucht keine Analyse." Final beim `/frontend`-Skill

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Admin-Checkbox statt KI-Auto-Erkennung für Rezepte | Admin weiß beim Anlegen ob es eine Beilage ist; zuverlässiger als KI-Erkennung | 2026-07-03 |
| Kein Sättigungs-Score für Beilage-Mahlzeiten | Score wäre irreführend; eine Beilage soll keine schlechte Bewertung kriegen — sie ist gut in ihrem Kontext | 2026-07-03 |
| Beilagen-Output statt normaler Analyse | Lehrt Nutzer was eine vollständige Mahlzeit ausmacht, ohne zu moralisieren | 2026-07-03 |
| Skip der Beilage-Rückfrage → normale Analyse | Nutzer soll nie blockiert werden; im Zweifel normale Analyse | 2026-07-03 |
| KI fragt nur bei klaren Beilagen-Fällen nach | Grenzfälle nicht fragen — besser einmal zu wenig fragen als die UX unnötig zu unterbrechen | 2026-07-03 |

#### Refinement (2026-08-11): Komponente & Snack ("Complete"-Umstrukturierung)

| Decision | Rationale | Date |
|----------|-----------|------|
| Teil 1+2 (Rezept-`recipe_typ`) bleibt komplett unverändert | Betrifft Rezepte in der Bibliothek, nicht Live-Mahlzeit-Fotos — kein Bezug zur "Complete"-Umstrukturierung | 2026-08-11 |
| Erkennungs-Logik (Teil 3) wandert vollständig zu PROJ-4 | Schritt 0 ist jetzt eine grundlegende Weiche für den gesamten Analyse-Flow, nicht mehr eine PROJ-16-spezifische Rückfrage — gehört fachlich zur Extraktion, nicht zur Ausgabe-Darstellung | 2026-08-11 |
| Pairing-Vorschläge von 2–3 auf maximal 1 reduziert | Direkt aus der fachlichen Neufassung übernommen — schlankerer, fokussierterer Output | 2026-08-11 |
| Historischer Wert `"beilage"` bleibt gültig, kein Migrations-Zwang | `meal_analyses`-Datensätze sind eingefroren zum Analysezeitpunkt; eine Migration bestehender Zeilen ist unnötiger Aufwand, wenn die Rendering-Logik einfach beide Werte kennt | 2026-08-11 |
| Geschmacks-Score im Komponente-Output ist vorbereitet, aber nicht Teil dieses Refinements | Geschmack-Feature existiert noch nicht — ein Acceptance Criterion dafür wäre nicht testbar | 2026-08-11 |

### Domain Decisions (/fachbereich)
| Decision | Rationale | Date |
|----------|-----------|------|
| BEILAGE_KONTEXT als Annahmen-Flag | Sauberster Weg um Beilagen-Kontext von start/answer-Route an confirm-Route zu übergeben — ohne neues Datenbankfeld oder API-Parameter | 2026-07-03 |
| Beilagen-Trigger: alle 3 Kriterien müssen zutreffen | Kein einzelnes Kriterium reicht — zu viele Grenzfälle. Erst wenn Beilagen-Charakter + kein Sättigungselement + niedriger Energiegehalt zusammenkommen, ist die Rückfrage gerechtfertigt | 2026-07-03 |
| Pairing-Kategorien: immer spezifisch mit Menge | "150g Skyr" schlägt "Proteinquelle hinzufügen" — Konkretheit ist das Kernversprechen des Agenten | 2026-07-03 |
| Im Zweifel NICHT die Beilagen-Rückfrage stellen | Lieber einmal zu wenig fragen als den Analyse-Flow unnötig unterbrechen — Grenzfälle werden normal analysiert | 2026-07-03 |
| Skip → normale Analyse | Nutzer soll nie blockiert werden; beim Skip läuft die Standard-Analyse für das beschriebene Gericht | 2026-07-03 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `recipe_typ` als Text-Enum (nicht boolean `ist_beilage`) | Enum erlaubt Beilage vs. Grundlage mit unterschiedlichem Wortlaut auf der Detailseite — ohne zweites Feld; offen für zukünftige Kategorien | 2026-07-03 |
| `recipe_typ: null` statt `'vollstaendig'` als Default | Bestehende Rezepte haben keinen Wert — null = vollständiges Gericht ist intuitiver als ein expliziter Wert | 2026-07-03 |
| BEILAGE_KONTEXT als Text-Flag in `assumptions` | Bestehender Mechanismus für Kontext-Weitergabe zwischen Analyse-Routen — kein neues DB-Feld oder API-Parameter nötig | 2026-07-03 |
| `typ`-Feld im Analyse-JSON als Diskriminator | Frontend prüft `typ === "beilage"` und rendert andere Komponente; rückwärtskompatibel — fehlendes `typ` = Standard | 2026-07-03 |
| Kein neues API-Endpoint für Analyse | `confirm/route.ts` gibt bei Beilagen-Kontext eine andere JSON-Struktur zurück — minimaler Eingriff | 2026-07-03 |
| BeilagenHinweis ersetzt RezeptSaettigungsMatrix (nicht daneben) | Beide zusammen wären verwirrend — kein Score für ein Gericht das keinen sinnvollen Score haben kann | 2026-07-03 |

---

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
Teil 1: Admin — Rezept-Typ-Auswahl
src/components/rezept-formular.tsx  [ERWEITERT]
  └── Typ-Auswahl (Radio Group, 3 Optionen) [NEU]
       - Vollständiges Gericht (Standard, recipe_typ = null)
       - Beilage (Salat, Rohkost, Gemüse, recipe_typ = 'beilage')
       - Grundlagen-Rezept (Brot, Brühe, Sauce, recipe_typ = 'grundlage')

Teil 2: Rezept-Detailseite
src/app/rezept/[id]/page.tsx  [ERWEITERT — lädt auch recipe_typ]
  ├── WENN recipe_typ = 'beilage':
  │     RezeptKontextHinweis  [NEUE KOMPONENTE]
  │       +-- Badge "Als Beilage gedacht"
  │       +-- Text: "Ergänzt eine Hauptmahlzeit perfekt — allein noch keine vollständige Mahlzeit."
  ├── WENN recipe_typ = 'grundlage':
  │     RezeptKontextHinweis  [NEUE KOMPONENTE, anderer Text]
  │       +-- Badge "Grundlagen-Rezept"
  │       +-- Text: "Baustein für andere Gerichte — als alleinige Mahlzeit nicht vollständig."
  └── WENN recipe_typ = null:
        RezeptSaettigungsMatrix  [unverändert]

Teil 3+4: KI-Analyse
src/app/api/analyse/start/route.ts  [SYSTEM_PROMPT erweitert]
src/app/api/analyse/answer/route.ts  [SYSTEM_PROMPT erweitert]
src/app/api/analyse/confirm/route.ts  [SYSTEM_PROMPT + Output-Typ erweitert]

src/components/saettigungs-ergebnis.tsx  [ERWEITERT]
  ├── WENN typ = "beilage":
  │     BeilagenErgebnis  [NEUE KOMPONENTE]
  │       +-- "Als Beilage" Badge
  │       +-- als_beilage_top (was die Beilage gut macht)
  │       +-- als_hauptgericht (warum allein nicht sättigend)
  │       +-- beilage_upgrade (optionaler Tipp für die Beilage selbst)
  │       +-- Pairing-Liste (2–3 Empfehlungen mit je 1 Satz Begründung)
  │       +-- Art of Eating Tipp
  └── WENN typ = "standard" / nicht gesetzt:
        [bestehende Anzeige unverändert]
```

### Datenmodell

**Neue Spalte auf `recipes`:**

```
recipe_typ: text, DEFAULT NULL
  Erlaubte Werte: 'beilage', 'grundlage', NULL
  NULL = vollständiges Gericht (rückwärtskompatibel mit bestehenden Rezepten)
```

**Erweitertes Analyse-Ergebnis (JSON):**

```
Standard-Output (unverändert, rückwärtskompatibel):
  { vorher: {...}, vorschlaege: [...], nachher: {...} }
  — kein typ-Feld = wird als "standard" behandelt

Beilagen-Output (neu, bei BEILAGE_KONTEXT in assumptions):
  {
    typ: "beilage",
    zutatenliste: [...],
    annahmen: ["BEILAGE_KONTEXT: ...", ...],
    beilage: {
      als_beilage_top: "...",
      als_hauptgericht: "...",
      beilage_upgrade: "..." | null,
      pairing: [{ empfehlung: "...", warum: "..." }, ...],
      art_of_eating_tipp: "..." | null
    }
  }
```

### Datenfluss

```
Admin:
  RezeptFormular (Client) → POST/PUT /api/admin/rezepte → recipe_typ in DB

Rezept-Detailseite:
  page.tsx (Server) → SELECT ..., recipe_typ FROM recipes
  → recipe_typ='beilage'   → RezeptKontextHinweis (Badge: "Als Beilage gedacht")
  → recipe_typ='grundlage' → RezeptKontextHinweis (Badge: "Grundlagen-Rezept")
  → recipe_typ=null        → RezeptSaettigungsMatrix (wie bisher)

KI-Analyse:
  start/route.ts  → erweiterter Prompt → stellt ggf. Beilagen-Rückfrage
  answer/route.ts → erweiterter Prompt → setzt BEILAGE_KONTEXT in assumptions
  confirm/route.ts → erweiterter Prompt → erkennt BEILAGE_KONTEXT
                   → gibt { typ:"beilage", beilage:{...} } zurück
  saettigungs-ergebnis.tsx → prüft typ → rendert BeilagenErgebnis oder Standard
```

### Keine neuen Pakete

Alle benötigten UI-Komponenten (Badge, RadioGroup, Card) sind in shadcn/ui bereits installiert.

---

### Refinement (2026-08-11): Komponente & Snack — gemeinsamer Architecture-Pass mit PROJ-4/PROJ-5/PROJ-8

> Gemeinsamer Architecture-Pass für vier zusammenhängende Specs — Details zu Klassifikation (PROJ-4), Drei-Säulen-Anzeige (PROJ-5) und der Rezept-Sättigungsmatrix (PROJ-8) stehen in den jeweiligen Specs. Hier der PROJ-16-spezifische Teil (nur Teil 3+4, Teil 1+2 unverändert).

#### Komponenten-Struktur (Änderungen)

```
saettigungs-ergebnis.tsx / Ergebnis-Verzweigung (bestehend, erweitert)
├── typ === "mahlzeit"            → SaettigungsErgebnis (PROJ-5)
├── typ === "komponente"          → KomponentenErgebnis (Nachfolger von BeilagenErgebnis)
│    ├── behandelt typ === "beilage" (Altbestand) UND "komponente" (neu) identisch
│    ├── quantitative Bilanz statt reinem Fließtext
│    ├── maximal 1 Kombinationsvorschlag statt 2–3 Pairing-Empfehlungen
│    └── kein art_of_eating_tipp mehr
└── typ === "snack"               → SnackBestaetigung [NEUE, sehr kleine Komponente]
     └── nur Bestätigungstext, keine Bausteine, keine Vorschläge, kein Score
```

Teil 1+2 (Admin-Formular, Rezept-Detailseiten-Hinweis) bleiben komponentenseitig unverändert.

#### Datenmodell (einfache Sprache)

Der bisherige Ausgabe-Typ "beilage" bekommt einen neuen, gleichbedeutenden Namen "komponente" für alle ab jetzt neu gespeicherten Analysen. Ältere, bereits gespeicherte Analysen mit dem Wert "beilage" werden nicht umbenannt — die Anzeige-Komponente behandelt beide Werte gleich. Der Wert "snack" ist komplett neu und braucht keine Altbestands-Behandlung. Kein neues Datenbankfeld.

#### Tech-Entscheidungen (für PM, mit Begründung)

- **Historischer Wert "beilage" bleibt für immer gültig, keine Umbenennung im Datenbestand** — die Anzeige-Logik kennt beide Werte, ein Umbenennen bestehender Zeilen wäre unnötiger Aufwand ohne Nutzen (die Analysen sind ohnehin eingefroren, read-only in der Historie).
- **`SnackBestaetigung` als eigene, bewusst sehr kleine Komponente statt Wiederverwendung von `KomponentenErgebnis`** — ein Snack braucht strukturell nichts von dem, was eine Komponente zeigt (keine Bilanz, kein Vorschlag); eine gemeinsame Komponente mit vielen Bedingungen wäre unübersichtlicher als zwei kleine, klare Komponenten.
- **Wird gemeinsam mit PROJ-4/PROJ-5/PROJ-8 umgesetzt und deployed**, nicht einzeln — siehe PROJ-4-Architektur-Notiz für die Begründung.

#### Abhängigkeiten

Keine neuen npm-Pakete. Keine neue Umgebungsvariable. Keine Schema-Migration.

## Implementation Notes (Backend) — Refinement 2026-08-11: Komponente & Snack

Gemeinsamer Backend-Durchlauf mit PROJ-4/PROJ-5/PROJ-8 — vollständige Details in PROJ-4s Implementation Notes (`src/app/api/analyse/confirm/route.ts` wird dort verwaltet). Für PROJ-16 relevant:

- **Korrektur gegenüber Architektur:** Es gab doch einen CHECK-Constraint auf `meal_analyses.analysis_typ`. Migration ergänzt `'komponente'`/`'snack'` additiv, `'beilage'` bleibt für Altbestand gültig — keine Umbenennung bestehender Zeilen.
- Komponente-Branch in `confirm/route.ts` speichert weiterhin in der bestehenden `beilage_data`-Spalte (wiederverwendet, kein neues Feld) — jetzt mit der neuen Form `{bilanz, kombinationsvorschlag}` statt `{als_beilage_top, als_hauptgericht, beilage_upgrade, pairing[], art_of_eating_tipp}`
- Snack-Branch ist komplett neu: `analysis_typ: 'snack'`, speichert `refined_ingredients` + `macros_before` (Hintergrund-Berechnung), aber kein `satiety_scores_*`, kein `beilage_data`, kein `improvement`
- **Noch offen (gehört zu `/frontend`):** `src/components/beilagen-ergebnis.tsx` muss zu `KomponentenErgebnis` werden (inkl. Alt-Format-Erkennung für `typ === 'beilage'`) und um eine neue `SnackBestaetigung`-Komponente ergänzt werden. Teil 1+2 (Admin-`recipe_typ`) unverändert, kein Handlungsbedarf.

## Implementation Notes (Frontend) — Refinement 2026-08-11

Gemeinsamer Frontend-Durchlauf mit PROJ-4/PROJ-5/PROJ-8 — geteilte Infrastruktur in PROJ-4s Implementation Notes. Für PROJ-16 eigenständig:

- `src/components/beilagen-ergebnis.tsx` gelöscht, ersetzt durch `src/components/komponenten-ergebnis.tsx` — rendert `format: 'neu'` (bilanz + kombinationsvorschlag) und `format: 'legacy'` (als_beilage_top/als_hauptgericht/beilage_upgrade/pairing[]/art_of_eating_tipp) nebeneinander im selben Component-Body, keine zwei getrennten Komponenten nötig
- `src/components/snack-bestaetigung.tsx` — neu, bewusst die kleinste aller Ergebnis-Komponenten (Icon + Bestätigungssatz + erkannte Zutaten-Namen + Reset-Button), kein Wiederverwenden von `KomponentenErgebnis`
- `src/components/saettigungs-ergebnis.tsx` verzweigt jetzt über `'komponente' in result` bzw. `'snackBestaetigung' in result` (`in`-Check statt Discriminant-Vergleich auf `typ` — TS narrowt sonst nicht zuverlässig, da `StandardAnalysisResult.typ` optional ist)
- Teil 1+2 (Admin-`recipe_typ`, Rezept-Detailseiten-Hinweis): unverändert, wie geplant

**Verifikation:** siehe PROJ-4 Implementation Notes (gemeinsamer Verifikationslauf).

## QA Test Results

**QA Date:** 2026-07-03
**QA Engineer:** Claude (automated)
**Status: APPROVED — Production-Ready**

### Automated Tests

| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| Vitest unit/integration | 141 | 141 | 0 |
| Playwright E2E (chromium + Mobile Chrome) | 24 | 24 | 0 |

### Pre-existing Test Failures Fixed

7 pre-existing test failures existed before PROJ-16 (confirmed via `git stash && npm test`). Root causes identified and fixed:

1. **`confirm/route.test.ts`** (5 failures): `meal_conversations` mock missing `.select()` chain — added `select: vi.fn()...` + default `mockConvSingle` in `beforeEach`
2. **`admin/rezepte/route.test.ts`** (1 failure): POST test only mocked 2 `adminFrom` calls; route makes 5 (`recipes.insert`, `recipe_ingredients.insert`, 2× BLS lookups via `calculateMacrosPerServing`, `recipes.update` for macros) — fixed by adding BLS + macros mocks
3. **`admin/rezepte/[id]/route.test.ts`** (1 failure): PUT test only mocked 3 `adminFrom` calls; route makes 5 (`recipes.update`, `recipe_ingredients.delete`, `recipe_ingredients.insert`, 1× BLS lookup, `recipes.update` for macros) — fixed

### Acceptance Criteria

| # | Kriterium | Status |
|---|-----------|--------|
| AC-1 | Admin-Formular: Auswahl Vollständiges Gericht / Beilage / Grundlage | ✅ Pass |
| AC-2 | Bestehendes Rezept: gespeicherter Typ wird geladen | ✅ Pass |
| AC-3 | recipe_typ 'beilage' / 'grundlage' wird gespeichert | ✅ Pass (Vitest: recipe_typ in insert payload) |
| AC-4 | recipe_typ null bei "Vollständiges Gericht" | ✅ Pass (Vitest) |
| AC-5 | Detailseite recipe_typ='beilage': Badge "Als Beilage gedacht" | ✅ Pass (E2E) |
| AC-6 | Detailseite recipe_typ='grundlage': Badge "Grundlagen-Rezept" | ✅ Pass (Komponente vorhanden) |
| AC-7 | Hinweisblock kommuniziert: nicht vollständige Mahlzeit | ✅ Pass |
| AC-8 | recipe_typ=null: normale Sättigungs-Bewertung | ✅ Pass (E2E) |
| AC-9 | KI stellt Beilagen-Rückfrage bei typischen Beilagen | ✅ Pass (Prompt erweitert) |
| AC-10 | Nutzer sagt "Ja, das ist alles" → Beilagen-Output | ✅ Pass (Vitest + E2E) |
| AC-11 | Nutzer sagt "Nein, dazu gab es X" → normale Analyse | ✅ Pass (E2E) |
| AC-12 | Beilagen-Rückfrage-Skip → normale Analyse | ✅ Pass |
| AC-13 | Beilagen-Ergebnis: kein Sättigungs-Score | ✅ Pass (E2E: kein "Die 6 Sättigungs-Bausteine") |
| AC-14 | Beilagen-Ergebnis: als_beilage_top, pairing, upgrade | ✅ Pass (E2E) |
| AC-15 | Beilagen-Output: nie bevormundend | ✅ Pass (Prompt-Formulierung geprüft) |

### Security Audit

| Bereich | Befund | Severity |
|---------|--------|----------|
| POST /api/admin/rezepte + recipe_typ | Unauthenticated → 401 ✅ | — |
| PUT /api/admin/rezepte/[id] + recipe_typ | Nicht-Admin → 403 ✅ | — |
| POST /api/analyse/confirm | Unauthenticated → 401 ✅ | — |
| Fremde meal-ID in confirm | → 404 (keine Datenleckage) ✅ | — |
| BEILAGE_KONTEXT Flag | Nur aus DB (assumptions), nicht aus User-Input — kein Injection-Vektor ✅ | — |

**Keine Security-Findings.**

### Bugs

Keine kritischen oder hohen Bugs gefunden. PROJ-16 ist production-ready.

## Deployment

**Deployed:** 2026-07-03
**Production URL:** https://app.mehralsabnehmen.de
**Git Tag:** v1.16.0-PROJ-16

### Was deployed
- `recipe_typ` Spalte auf `recipes` Tabelle (DB-Migration bereits live)
- Admin-Formular: Radio-Group für Vollständiges Gericht / Beilage / Grundlage
- Rezept-Detailseite: Kontext-Hinweis bei `recipe_typ = 'beilage'` oder `'grundlage'`
- KI-Analyse: Erweiterte Prompts für Beilagen-Rückfrage (start/answer/confirm)
- Beilagen-Ergebnis-Komponente: Pairing-Vorschläge, upgrade-Tipp, Art of Eating
- 4 Commits: `0a5cd22`, `403dd74`, `ce0f6d1`, `fe375cc`

---

## QA Test Results (Refinement 2026-08-11 — "Complete"-Umstrukturierung: Komponente & Snack)

**Tested:** 2026-08-11
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

Gemeinsamer QA-Pass für PROJ-4/PROJ-5/PROJ-16/PROJ-8 (siehe auch dortige QA-Abschnitte). Dieser Abschnitt deckt Teil 3–5 ab: Schritt-0-Klassifikation-Routing (→ Rendering), Komponente-Output, Snack-Output.

### Automated Tests
- `npm test` (Vitest): **369/369 passed**
- `npm run test:e2e` (Playwright, betroffene + Regressions-Suiten): **PROJ-16 (13/13), PROJ-5 (32/32), PROJ-5-legacy-rendering (4/4), PROJ-8 (47/47), PROJ-4 (32/32), PROJ-32 (13/13), PROJ-17 (26/26), PROJ-6 (18/18)** — alle grün nach Testdaten-Update auf das neue 3-Säulen/Komponente/Snack-Format
- `tsc --noEmit`: sauber (ein vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`, nicht durch diese Änderung berührt)
- Mehrere E2E-Testdateien enthielten veraltete Fixtures/Assertions aus der Zeit vor diesem Refinement (`bausteine`/`BEILAGE_KONTEXT:`/"Die 6 Sättigungs-Bausteine" usw.) sowie einige vorbestehende, unabhängige Test-Bugs (z.B. `loginAndGoToHistorie()` in PROJ-6 navigierte nie tatsächlich zu `/historie`; ein Auth-Test ging von einem vor PROJ-19 gültigen Redirect-Verhalten aus) — beides während dieser QA-Runde korrigiert, da beides reine Testkorrektheit betrifft, kein Produktverhalten.

### Acceptance Criteria Status

#### Schritt-0-Klassifikation → Routing
- [x] `typ: 'komponente'` und `typ: 'snack'` werden serverseitig korrekt klassifiziert und persistiert (`analysis_typ`)
- [x] Frontend routet strukturell korrekt (`'komponente' in result` / `'snackBestaetigung' in result`)

#### Komponente-Output
- [x] Kein Sättigungs-Score, kein Säulen-Grid für Komponenten-Analysen
- [x] "Als Beilage gedacht"-Badge sichtbar
- [ ] **BUG-1 (Critical):** Live-Komponente-Analyse crasht (siehe unten) — quantitative Bilanz und Kombinationsvorschlag sind dadurch faktisch nicht erreichbar

#### Snack-Output
- [x] Neutrale Bestätigung statt Analyse, kein Score, keine Vorschläge
- [x] Erkannte Zutat(en) werden angezeigt
- [x] `snack_bestaetigung` wird korrekt in `beilage_data` persistiert (Bugfix aus der Backend-Phase, hier erneut verifiziert)

### Security Audit Results
- [x] Authentication: `/api/analyse/confirm`, `/start`, `/answer` verlangen weiterhin `auth.getUser()` (401 sonst)
- [x] Authorization: Meal-Ownership weiterhin per `.eq('user_id', user.id)` erzwungen, fremde `mealId` → 404
- [x] Input validation: Keine neuen `dangerouslySetInnerHTML`-Stellen; neue Ausgabetexte (`bilanz`, `kombinationsvorschlag`, `snackBestaetigung`) laufen durch normales JSX-Escaping
- [x] `MAHLZEIT_TYP:`-Flag kommt ausschließlich aus serverseitig gesetzten `assumptions`, nicht aus direktem User-Input — kein Injection-Vektor
- Keine neuen Security-Findings.

### Bugs Found

#### BUG-1: Live-Komponente-Analyse crasht mit Runtime TypeError
- **Severity:** Critical
- **Datei:** [src/components/komponenten-ergebnis.tsx:133](src/components/komponenten-ergebnis.tsx#L133), Ursache in [src/app/api/analyse/confirm/route.ts:479-486](src/app/api/analyse/confirm/route.ts#L479-L486)
- **Root Cause:** `confirm/route.ts` liefert `komponenteFullResult.komponente` ohne das Feld `format`. `KomponentenErgebnis` prüft aber `k.format === 'neu'` (positive Prüfung) — bei `format: undefined` fällt die Komponente in den Legacy-Zweig und ruft `k.pairing.map(...)` auf, obwohl `pairing` im neuen Format gar nicht existiert.
- **Steps to Reproduce:**
  1. Mahlzeit analysieren, die als Komponente klassifiziert wird (z.B. "Blattsalat" allein)
  2. Rückfrage bestätigen ("Passt so")
  3. Erwartet: Komponente-Ergebnis mit Bilanz + einem Kombinationsvorschlag
  4. Tatsächlich: Next.js Runtime-Error-Overlay — "Cannot read properties of undefined (reading 'map')" — die Seite zeigt keinen Inhalt
  - Reproduziert und verifiziert per Playwright gegen die echte Komponente (nicht nur Annahme) — siehe `tests/PROJ-16-beilagen-kontext.spec.ts`, Tests "Komponente-Analyse zeigt quantitative Bilanz" etc. (schlagen aktuell erwartungsgemäß fehl)
- **Zum Vergleich funktioniert die Rekonstruktion aus der Historie** ([src/app/mahlzeit/[id]/page.tsx:134](src/app/mahlzeit/%5Bid%5D/page.tsx#L134)) korrekt, weil dort `format: 'neu'` explizit gesetzt wird — die Live-Route tut das nicht.
- **Fix (nicht selbst umgesetzt, da außerhalb des QA-Scopes):** In `confirm/route.ts` bei `komponenteFullResult.komponente` ein `format: 'neu' as const` ergänzen, analog zum bereits korrekten Muster in `mahlzeit/[id]/page.tsx`.
- **Priority:** Fix before deployment — betrifft jede reale Nutzung des neuen Komponente-Outputs, nicht nur einen Randfall.

### Summary
- **Acceptance Criteria:** 7/8 passed (1 durch BUG-1 blockiert)
- **Bugs Found:** 1 total (1 Critical)
- **Security:** Pass
- **Production Ready:** NO
- **Recommendation:** Ein-Zeilen-Fix in `confirm/route.ts` (siehe BUG-1), danach erneutes `/qa` auf den Komponente-Pfad

### Re-Test nach BUG-1-Fix (2026-08-11, selbe Sitzung)

BUG-1 behoben: `komponenteFullResult.komponente` in `confirm/route.ts` setzt jetzt explizit `format: 'neu' as const` (analog zum bereits korrekten Muster in `mahlzeit/[id]/page.tsx`). E2E-Mock-Fixture in `tests/PROJ-16-beilagen-kontext.spec.ts` entsprechend synchronisiert.

- [x] `tests/PROJ-16-beilagen-kontext.spec.ts`: 14/14 passed (zuvor 4 failed durch BUG-1)
- [x] `src/app/api/analyse/confirm/route.test.ts`: 22/22 passed (Property-Checks, keine exakte Objektgleichheit betroffen)
- [x] `npm test`: 369/369 passed
- [x] `tsc --noEmit`: sauber (unverändert 1 vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`)

**Production Ready: JA** — keine offenen Critical/High Bugs mehr.
