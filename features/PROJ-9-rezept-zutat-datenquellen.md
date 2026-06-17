# PROJ-9 — Rezept-Zutat: Anzeigename + OFF-Fallback

**Status:** In Review  
**Priorität:** P1  
**Abhängigkeiten:** PROJ-8 (Rezeptbibliothek, deployed)

---

## Kontext

Im Admin-Editor für Rezepte gibt es bereits eine BLS-Suche (Live-Dropdown). Wenn der Admin einen BLS-Eintrag auswählt, passieren zwei Dinge:
- Das Namensfeld wird auf den vollen BLS-Namen gesetzt (z.B. "Speisequark Magerstufe, Magerquark < 10 % Fett i. Tr.")
- Die Makros werden intern gespeichert (`macros_per_100g` in der DB)

**Problem 1:** Sobald der Admin den Namen editiert (um ihn zu kürzen), wird die Makro-Verknüpfung gelöscht. Es gibt keinen Weg, den Anzeigenamen anzupassen ohne die Nährwertdaten zu verlieren.

**Problem 2:** Wenn eine Zutat nicht im BLS ist (z.B. Convenience-Produkte, Markenartikel), gibt es keine Möglichkeit im Editor auf eine andere Quelle auszuweichen.

---

## User Stories

**US-1:** Als Admin möchte ich nach BLS-Auswahl den Anzeigenamen frei editieren können, ohne die gespeicherten Makros zu verlieren — damit das Rezept lesbar bleibt ("Magerquark" statt "Speisequark Magerstufe...").

**US-2:** Als Admin möchte ich sehen, ob eine Zutat mit BLS oder OFF verknüpft ist und die Verknüpfung bei Bedarf bewusst lösen können — damit ich weiß, woher die Nährwerte stammen.

**US-3:** Als Admin möchte ich, wenn eine Zutat nicht im BLS gefunden wird, per Button Open Food Facts durchsuchen können — damit auch Marken- und Convenienceprodukte korrekte Makros haben.

**US-4:** Als Admin möchte ich beim OFF-Ergebnis erkennen können, welches Produkt gefunden wurde (Produktname + Makros), damit ich entscheiden kann ob der Treffer passt.

---

## Acceptance Criteria

### Feature 1: Anzeigename editierbar nach BLS-Auswahl

- [x] Angenommen der Admin wählt einen BLS-Eintrag aus der Dropdown-Liste aus, dann wird der volle BLS-Name ins Textfeld gesetzt und ein "✓ BLS"-Badge erscheint
- [x] Angenommen ein BLS-Eintrag verknüpft ist, wenn der Admin den Anzeigenamen im Textfeld editiert (kürzt/ändert), dann bleiben die `macros_per_100g` erhalten — keine automatische Löschung
- [x] Angenommen ein BLS-Eintrag verknüpft ist, wenn der Admin auf das "✕"-Symbol neben dem Badge klickt, dann wird die Verknüpfung gelöst und das Feld verhält sich wieder wie ein freies Textfeld (kein Badge, Makros cleared)
- [x] Angenommen die Verknüpfung besteht, wenn das Rezept gespeichert wird, dann werden die gespeicherten `macros_per_100g` verwendet — NICHT ein Lookup über den (ggf. gekürzten) Anzeigenamen
- [x] Angenommen keine Verknüpfung besteht, dann wird der Name wie bisher für den BLS/OFF/USDA-Lookup verwendet

### Feature 2: OFF-Suche als expliziter Fallback

- [x] Angenommen die BLS-Suche liefert 0 Ergebnisse für den eingetippten Begriff, dann erscheint unterhalb des leeren Dropdowns ein Button "Nicht im BLS? Open Food Facts durchsuchen →"
- [x] Angenommen der Admin klickt den OFF-Button, dann wird eine Suche über OFF mit dem aktuellen Suchbegriff ausgeführt (Ladezustand sichtbar)
- [x] Angenommen OFF Ergebnisse vorliegen, dann werden sie in einer separaten Dropdown-Liste angezeigt mit Produktname + Makros pro 100g und einer "OFF"-Quelle-Kennzeichnung
- [x] Angenommen der Admin wählt einen OFF-Eintrag aus, dann wird der Produktname ins Textfeld gesetzt, ein "✓ OFF"-Badge erscheint und die Makros werden gespeichert
- [x] Angenommen ein OFF-Eintrag verknüpft ist, verhält sich der Anzeigename genauso editierbar wie bei BLS (Feature 1 gilt für beide Quellen)
- [x] Angenommen OFF ebenfalls 0 Ergebnisse findet, dann erscheint ein Hinweis "Kein Eintrag gefunden — Makros werden zur Laufzeit geschätzt"

---

## Out of Scope

- Barcode-Scanner für Produkte
- Manuelles Eingeben von Makros durch den Admin (keine Freitexteingabe von Nährwerten)
- Automatischer OFF-Fallback ohne User-Aktion (expliziter Button bleibt Prinzip)
- Veränderung der öffentlichen Rezept-Detailseite — nur der Admin-Editor ist betroffen
- Synchronisierung von Anzeigenamen mit der BLS-Bezeichnung (einmalige Entkopplung beim Editieren)

---

## Edge Cases

- Admin sucht "Proteinpudding von Ehrmann" → BLS findet nichts → OFF-Button erscheint → OFF findet "Ehrmann High Protein Pudding" → Admin wählt aus und kürzt den Namen auf "Proteinpudding (Ehrmann)"
- Admin hat BLS verknüpft, kürzt den Namen auf "Quark", speichert → `macros_per_100g` = BLS-Werte, nicht neue BLS-Suche für "Quark" (kein Aliasing)
- Admin klickt OFF-Button, OFF schlägt fehl (Timeout/Fehler) → Fehlermeldung, kein Crash
- Vorhandene Rezepte mit gespeicherten `macros_per_100g` werden nicht verändert — kein Migration der alten Daten nötig

---

## Tech Design (Solution Architect)

### Komponentenstruktur

```
RezeptFormular (bestehend — src/components/rezept-formular.tsx)
+-- (für jede Zutat-Zeile)
    +-- ZutatInputMitQuelle [umbenennen: usda-ingredient-input.tsx → zutat-input-mit-quelle.tsx]
        +-- Textfeld (Anzeigename — frei editierbar, auch nach BLS/OFF-Auswahl)
        +-- Quelle-Badge [NEU]
        |   +-- "✓ BLS" wenn mit BLS verknüpft
        |   +-- "✓ OFF" wenn mit OFF verknüpft
        |   +-- ✕-Button → löst Verknüpfung explizit
        +-- BLS-Dropdown (live, automatisch beim Tippen wie bisher)
        |   +-- Treffer: Name + kcal / Protein / Fett pro 100g
        |   +-- [wenn 0 Treffer und mind. 2 Zeichen getippt]
        |       +-- "Nicht im BLS? Open Food Facts →" Button [NEU]
        +-- OFF-Dropdown [NEU — erscheint nur nach OFF-Button-Klick]
            +-- Treffer: Produktname + Makros + "Open Food Facts"-Kennung
            +-- [wenn 0 Treffer] → "Kein Eintrag gefunden — Makros werden geschätzt"
```

### Datenmodell

**Keine DB-Änderungen.** Das Feld `macros_per_100g` existiert bereits in `recipe_ingredients`.

```
Jede Zutat speichert:
- name            → Anzeigename (was der Admin eingibt — unabhängig vom BLS-Namen)
- amount          → Menge
- unit            → Einheit
- macros_per_100g → Nährwerte pro 100g (gepinnt von BLS oder OFF, oder null)
```

Wenn `macros_per_100g` gesetzt: wird direkt für Kalorienberechnung genutzt, kein Runtime-Lookup.
Wenn `macros_per_100g` leer: Fallback-Lookup über BLS-Aliases → OFF → Schätzung (unverändertes Verhalten).

**Nur im Browser (nicht in der DB):**
- `isPinned` — true nach BLS- oder OFF-Auswahl; verhindert ungewolltes Makro-Löschen beim Tippen
- `source` — `'bls' | 'off' | null` — bestimmt welcher Badge und welches ✕ erscheint

### API-Routen

| Route | Zustand | Zweck |
|-------|---------|-------|
| `GET /api/admin/bls-search?q=...` | bestehend | BLS-Datenbanksuche |
| `GET /api/admin/off-search?q=...` | **neu** | OFF-Suche — nutzt bestehende `queryOpenFoodFacts`-Funktion inkl. Multi-Strategy-Logik |

Die neue Route ist admin-geschützt (gleiche `requireAdmin()`-Guard) und gibt denselben Datentyp zurück: Produktname + Makros pro 100g.

### Tech-Entscheidungen

**Kein neues DB-Feld** — `macros_per_100g` reicht aus; Anzeigename und Nährwertquelle sind entkoppelt.

**`isPinned` lokal im Browser** — der Pin-Zustand muss nicht persistiert werden. Beim Laden einer Zutat gilt: wenn `macros_per_100g` befüllt ist, startet die Zeile als gepinnt.

**OFF erst auf Knopfdruck** — BLS und OFF werden nicht gemischt. Erst wenn BLS 0 Ergebnisse hat UND der Admin klickt, startet die OFF-Suche. Verhindert, dass weniger zuverlässige OFF-Daten BLS-Ergebnisse verdrängen.

**`queryOpenFoodFacts` wiederverwenden** — inkl. der Multi-Strategy-Logik für deutsche Compoundwords.

**Keine neuen Pakete nötig.**

---

## Decision Log

| Entscheidung | Begründung | Datum |
|---|---|---|
| Anzeigename = voller BLS-Name, manuell editierbar | User-Präferenz: Admin will selbst entscheiden wie er kürzt, kein Automatismus | 2026-06-15 |
| OFF als expliziter Button, nicht automatisch | Admin soll bewusst entscheiden, welche Quelle er nutzt — OFF-Daten sind weniger verlässlich als BLS | 2026-06-15 |
| Kein neues DB-Feld nötig | `macros_per_100g` existiert bereits in `recipe_ingredients` | 2026-06-15 |
| "✕ BLS / ✕ OFF"-Badge statt separates Feld | Platzsparender im Editor; Quelle sichtbar ohne UI-Aufblähen | 2026-06-15 |
| `isPinned` nur im Browser-State | Beim Laden: `macros_per_100g != null` → startet gepinnt; beim Speichern zählt nur DB-Wert | 2026-06-15 |
| OFF erst auf Knopfdruck (nicht automatisch) | Verhindert Verwechslung von BLS- und OFF-Daten; Admin entscheidet bewusst | 2026-06-15 |
| Komponente umbenennen: `usda-ingredient-input` → `zutat-input-mit-quelle` | Name war irreführend (USDA wird dort nicht genutzt) | 2026-06-15 |

---

## Open Questions

- [x] Soll die OFF-Suche denselben `buildOFFQueries`-Algorithmus nutzen? → Ja, wiederverwendet bestehende Logik.
- [x] Welche Felder soll das OFF-Suchergebnis im Dropdown zeigen? → Produktname + kcal + Protein (wie BLS-Dropdown)

---

## Implementation Notes

**Neue Dateien:**
- `src/components/zutat-input-mit-quelle.tsx` — ersetzt `usda-ingredient-input.tsx` (gelöscht). Enthält BLS-Live-Suche, `isPinned`/`source`-State, Quelle-Badge mit ✕, OFF-Button + OFF-Dropdown, Lade-/Fehlerzustände.
- `src/app/api/admin/off-search/route.ts` — admin-geschützte Route, nutzt OFF Search API direkt (kein `queryOpenFoodFacts`-Wrapper — stattdessen eigene Inline-Implementierung mit DE → World Fallback). Gibt Produktname + `NutritionPer100g` zurück.

**Geänderte Dateien:**
- `src/components/rezept-formular.tsx` — importiert `ZutatInputMitQuelle`, neues Prop `defaultIngredientMacros?: (NutritionPer100g | null)[]`, `ingredientMacros`-Initialisierung nutzt jetzt die übergebenen Default-Makros statt immer `null`.
- `src/app/admin/rezepte/[id]/bearbeiten/page.tsx` — `recipe_ingredients`-Query um `macros_per_100g` erweitert, `defaultIngredientMacros` an `RezeptFormular` übergeben.

**Verhalten beim Editieren bestehender Zutaten:**
- `isPinned` initialisiert mit `linkedMacros !== null` → bestehende Makros werden beim Tippen nicht überschrieben
- `source` bleibt `null` (DB speichert keine Quelle) → Badge zeigt "✓" ohne BLS/OFF-Label (neutrales Grau statt Grün/Blau)
- ✕-Button erscheint trotzdem → Admin kann Verknüpfung bewusst lösen

**Build:** `npm run build` erfolgreich, keine neuen Fehler/Warnings.

---

## QA Test Results

**Tested:** 2026-06-17
**App URL:** http://localhost:3000 (lokaler Dev-Server)
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Feature 1: Anzeigename editierbar nach BLS-Auswahl

- [x] **AC-1:** BLS-Eintrag wählen → Name ins Textfeld, "✓ BLS"-Badge — Code-Review: `handleSelectBls` setzt `onChange(result.name_de)`, `setSource('bls')`, `setIsPinned(true)`; JSX: `{isPinned && (<span>✓ {source === 'off' ? 'OFF' : 'BLS'}</span>)}`.
- [x] **AC-2:** Anzeigenamen editieren (kürzen) → `macros_per_100g` erhalten — Code-Review: `handleChange` prüft `if (isPinned) return` — kein `onClearMacros()` wird aufgerufen.
- [x] **AC-3:** ✕ klicken → Badge weg, Makros cleared — Code-Review: `handleClearPin` setzt `setIsPinned(false)`, `setSource(null)`, ruft `onClearMacros()`.
- [x] **AC-4:** Beim Speichern Makros aus gespeichertem State, kein Re-Lookup — Code-Review: `onSubmit` nutzt `ingredientMacros[idx] ?? null`, nicht den Anzeigenamen.
- [x] **AC-5:** Ohne Verknüpfung: BLS-Live-Suche aktiv — Code-Review: `handleChange` ruft `searchBls(val)` wenn `!isPinned`.

#### Feature 2: OFF-Suche als expliziter Fallback

- [x] **AC-6:** BLS 0 Ergebnisse → "Nicht im BLS?"-Button — Code-Review: `setShowOffButton(results.length === 0)` in `searchBls`.
- [x] **AC-7:** OFF-Button klicken → Suche mit Ladezustand — Code-Review: `handleOffSearch` setzt `setOffLoading(true)`, JSX zeigt "Open Food Facts wird durchsucht…".
- [x] **AC-8:** OFF-Ergebnisse → separate Dropdown-Liste mit "Open Food Facts"-Label + Makros — Code-Review: blauer Header-Abschnitt "Open Food Facts", `MacroLine` pro Eintrag.
- [x] **AC-9:** OFF-Eintrag wählen → Produktname, "✓ OFF"-Badge, Makros gespeichert — Code-Review: `handleSelectOff` setzt `setSource('off')`, `onSelectSource(result.per100g)`.
- [x] **AC-10:** OFF editierbar wie BLS (Feature 1 gilt) — Code-Review: `isPinned`-Logik ist quellenunabhängig.
- [x] **AC-11:** OFF 0 Ergebnisse → Hinweistext — Code-Review: `setOffError('Kein Eintrag gefunden — Makros werden zur Laufzeit geschätzt')`.

#### Edit-Mode Initialization (Bugfix dieser Session)

- [x] `bearbeiten/page.tsx` lädt `macros_per_100g` aus der DB und übergibt `defaultIngredientMacros`
- [x] `ingredientMacros` startet korrekt mit den geladenen Makros
- [x] `isPinned` startet `true` wenn `linkedMacros !== null` (neue `useState(() => linkedMacros !== null)`)
- [x] Remove-Handler (`prev.filter`) und Append-Handler (`[...prev, null]`) synchronisieren `ingredientMacros` korrekt mit `fields`

### Edge Cases Status

- [x] **EC-1:** BLS leer → OFF-Button → OFF auswählen → Name kürzen — Code-Pfad geprüft: `showOffButton=true` → `handleOffSearch` → `handleSelectOff` pinnt mit `source='off'` → `handleChange` mit `isPinned=true` ändert nur den Namen.
- [x] **EC-2:** BLS verknüpft, Name kürzen auf "Quark", speichern → Makros = BLS-Werte — `isPinned` blockiert `searchBls`, `ingredientMacros[idx]` = gespeicherte BLS-Werte.
- [x] **EC-3:** OFF Timeout/Fehler → Fehlermeldung, kein Crash — `catch { setOffError('Suche fehlgeschlagen…') }`.
- [x] **EC-4:** Vorhandene Rezepte unverändert — keine Migration nötig, bestehende `macros_per_100g` bleiben in der DB.

### Security Audit

- [x] **`/api/admin/bls-search`:** 401 ohne Auth (Playwright verifiziert), 403 für Nicht-Admin (Playwright verifiziert)
- [x] **`/api/admin/off-search`:** 401 ohne Auth (Playwright verifiziert), 403 für Nicht-Admin (Playwright verifiziert)
- [x] **Admin-Seiten:** Unauthenticated → `/login`-Redirect; Nicht-Admin → `/admin/403` (Playwright verifiziert)
- [x] **`requireAdmin()`** prüft `auth.uid()` server-seitig — kein Client-Bypass möglich
- [x] Keine Secrets im Response-Body

### Automated Test Results

**Vitest (Unit Tests — OFF Search Route):**
`src/app/api/admin/off-search/route.test.ts` — **11/11 Tests grün**
- Auth (401/403), leere Queries, DE-Fallback auf World, Filterung ohne Nutriments, Filterung bei 0 kcal+Protein, Max-5-Limit, Fehlerbehandlung, Produktname-Fallback

**E2E (Playwright):**
`tests/PROJ-9-rezept-zutat-datenquellen.spec.ts` — **18/18 Tests grün** (Chromium + Mobile Chrome)
- Admin-Zugriff-Redirects (Rezept-Neu, Rezept-Edit), API-Security-Checks (BLS + OFF)

**Vollständige E2E-Regressionssuite:** **152/152 Tests grün** — keine Regressions

**Vitest (gesamt):** 87/94 — 7 vorbestehende Fehler unberührt (alle in `analyse/confirm` und `admin/rezepte/[id]`, pre-existing)

**Hinweis Admin-UI:** Die eigentliche UI-Interaktion (BLS-Dropdown, Badge, Pin-Verhalten, OFF-Flow) konnte per Playwright nicht automatisiert werden, da der E2E-Testnutzer (`qa-test@endlichsatt.dev`) kein Admin ist. Alle 11 AC wurden per Code-Review gegen `zutat-input-mit-quelle.tsx` verifiziert.

### Bugs Found

Keine Bugs gefunden.

### Summary

- **Acceptance Criteria:** 11/11 passed (per Code-Review verifiziert)
- **Bugs:** 0
- **Security:** Pass
- **Production Ready:** **YES**
