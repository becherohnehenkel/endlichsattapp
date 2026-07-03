# PROJ-16: Beilagen-Kontext

## Status: Deployed
**Created:** 2026-07-03
**Last Updated:** 2026-07-03

## Dependencies
- PROJ-8 (Rezeptbibliothek) — Beilage-Flag auf Rezepten, Rezept-Detailseite
- PROJ-4 (KI-Analyse-Agent) — Rückfrage-Logik in start/route.ts und answer/route.ts
- PROJ-5 (Sättigungs-Einschätzung) — Analyse-Output in confirm/route.ts

## User Stories
- Als Nutzer, der ein Beilagen-Rezept aufruft, möchte ich sofort verstehen, dass dieses Gericht allein keine sättigende Mahlzeit ergibt — und was gut dazu passt
- Als Nutzer, der ein Foto eines Salats oder Körnigen Frischkäses macht, möchte ich eine ehrliche Einordnung erhalten, dass das noch kein vollständiges Gericht ist — mit konkreten Pairing-Ideen
- Als Admin möchte ich beim Anlegen oder Bearbeiten eines Rezepts schnell markieren können, dass es sich um eine Beilage handelt
- Als Nutzer möchte ich durch die App lernen, was eine vollständige Mahlzeit ausmacht — ohne belehrt zu werden

## Out of Scope
- Automatische KI-Erkennung ob ein Rezept eine Beilage ist (Admin entscheidet manuell via Checkbox)
- Beilage-Kategorie als Filter in der Rezeptbibliothek — deferred
- Kombinierter Sättigungs-Score für "Beilage + Hauptgericht zusammen" — zu komplex für MVP
- Mahlzeiten-Kombinations-Funktion ("analysiere Salat + Hähnchen zusammen") — deferred

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

### Teil 3: KI-Analyse — Rückfrage bei typischen Beilagen-Gerichten

- [ ] Angenommen ein Nutzer beschreibt oder fotografiert ein Gericht, das wie eine typische Beilage wirkt (Salat ohne Protein, Rohkost, einzelner Frischkäse, trockenes Brötchen, Gurkenscheiben o.ä.), wenn die KI die Mahlzeit initial einschätzt, dann stellt sie als eine ihrer max. 2 Fragen: „Ist das deine komplette Mahlzeit oder eine Beilage zu etwas?"
- [ ] Angenommen ein Nutzer antwortet „Ja, das ist alles", wenn die KI die Analyse abschließt, dann erhält er den Beilagen-Output (kein Sättigungs-Score, stattdessen Pairing-Kontext)
- [ ] Angenommen ein Nutzer antwortet „Nein, dazu gab es noch X", wenn die KI die Analyse abschließt, dann läuft die normale Analyse für die Gesamtmahlzeit weiter
- [ ] Angenommen ein Nutzer überspringt die Beilagen-Rückfrage (Rückfragen-Skip), wenn die KI die Analyse abschließt, dann behandelt die KI die Mahlzeit als vollständiges Gericht und analysiert normal

### Teil 4: KI-Analyse — Beilagen-Output

- [ ] Angenommen die Analyse erkennt eine Beilage, dann erscheint kein „wenig/mäßig/sehr sättigend"-Score
- [ ] Angenommen die Analyse erkennt eine Beilage, dann enthält der Output: eine ehrliche Einordnung was das Gericht als Beilage leistet, konkrete Pairing-Vorschläge (was passt gut dazu), und optional eine kleine Aufwertung des Beilagen-Gerichts selbst (z.B. „Eine Handvoll Kerne drüber gibt mehr Biss")
- [ ] Angenommen die Analyse erkennt eine Beilage, dann formuliert die KI nie bevormundend — sie erklärt, zeigt den Mehrwert als Beilage, macht keine Schuldgefühle

## Edge Cases

- **Beilage + echter Hauptgang zusammen fotografiert:** Wenn Nutzer z.B. Salat + Schnitzel fotografiert, ist das keine Beilage-Situation — KI fragt nicht nach, normale Analyse
- **Rezept als Beilage markiert, aber Nutzer macht separate Analyse davon:** Die Analyse weiß nichts vom Admin-Flag — die KI erkennt die Beilage-Natur selbst über den Rückfrage-Mechanismus
- **Grenzfälle (z.B. Avocado-Toast):** Kann Hauptgericht oder Beilage sein — KI fragt nur nach, wenn der Beilage-Charakter klar überwiegt; bei Zweifelsfällen keine Rückfrage
- **Admin markiert ein vollständiges Gericht versehentlich als Beilage/Grundlage:** Der Kontext-Hinweis erscheint trotzdem — Admin muss den Typ manuell zurücksetzen
- **KI-Analyse eines Rezepts das als Grundlage markiert ist:** Die Analyse weiß nichts vom Admin-Flag — die KI erkennt Beilagen-Charakter selbst über den Rückfrage-Mechanismus. Brühe oder Brot allein würde die Beilagen-Rückfrage auslösen.

## Technical Requirements
- Neues Datenbankfeld: `recipe_typ text DEFAULT NULL CHECK (recipe_typ IN ('beilage', 'grundlage'))` auf der `recipes`-Tabelle
- API-Erweiterung: `recipe_typ` in RecipeSchema (POST/PUT /api/admin/rezepte) — Werte: `'beilage' | 'grundlage' | null`
- Rezept-Detailseite: Bedingte Anzeige — Kontext-Hinweis (je nach `recipe_typ`) ODER Sättigungs-Bewertung
- KI-Prompts: `start/route.ts` und `answer/route.ts` um Beilagen-Erkennung erweitern
- KI-Prompt: `confirm/route.ts` um Beilagen-Output-Logik erweitern (neuer Output-Typ: `beilage`)

## Open Questions
- [x] Welchen genauen Wortlaut soll der Beilagen-Hinweis auf der Rezept-Detailseite haben? → Definiert: Badge "Als Beilage gedacht" + Erklärungstext "Als Beilage top — allein noch keine vollständige Mahlzeit. Kombiniere es mit einer Proteinquelle (Quark, Ei, Fleisch) und ggf. Brot oder Stärke." Exakter Wortlaut final beim /frontend-Skill
- [x] Welche Pairing-Kategorien sollen im Beilagen-Output genannt werden? → Definiert in docs/system-prompt.md: Milchprodukte (Skyr, Quark), Eier, Fleisch/Fisch, Pflanzenprotein, Brot-Kombination — kontextabhängig 2–3 Kategorien nennen, je nach Gericht

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Admin-Checkbox statt KI-Auto-Erkennung für Rezepte | Admin weiß beim Anlegen ob es eine Beilage ist; zuverlässiger als KI-Erkennung | 2026-07-03 |
| Kein Sättigungs-Score für Beilage-Mahlzeiten | Score wäre irreführend; eine Beilage soll keine schlechte Bewertung kriegen — sie ist gut in ihrem Kontext | 2026-07-03 |
| Beilagen-Output statt normaler Analyse | Lehrt Nutzer was eine vollständige Mahlzeit ausmacht, ohne zu moralisieren | 2026-07-03 |
| Skip der Beilage-Rückfrage → normale Analyse | Nutzer soll nie blockiert werden; im Zweifel normale Analyse | 2026-07-03 |
| KI fragt nur bei klaren Beilagen-Fällen nach | Grenzfälle nicht fragen — besser einmal zu wenig fragen als die UX unnötig zu unterbrechen | 2026-07-03 |

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
**Production URL:** https://satt.mehralsabnehmen.de
**Git Tag:** v1.16.0-PROJ-16

### Was deployed
- `recipe_typ` Spalte auf `recipes` Tabelle (DB-Migration bereits live)
- Admin-Formular: Radio-Group für Vollständiges Gericht / Beilage / Grundlage
- Rezept-Detailseite: Kontext-Hinweis bei `recipe_typ = 'beilage'` oder `'grundlage'`
- KI-Analyse: Erweiterte Prompts für Beilagen-Rückfrage (start/answer/confirm)
- Beilagen-Ergebnis-Komponente: Pairing-Vorschläge, upgrade-Tipp, Art of Eating
- 4 Commits: `0a5cd22`, `403dd74`, `ce0f6d1`, `fe375cc`
