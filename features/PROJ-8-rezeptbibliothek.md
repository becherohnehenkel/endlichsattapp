# PROJ-8: Rezeptbibliothek

## Status: Deployed (Refinement: Drei-Säulen-Modell "Complete" — Approved, bereit für /deploy)
**Created:** 2026-06-12
**Last Updated:** 2026-08-11

**Korrektur (2026-08-11):** Der Out-of-Scope-Punkt "Sättigungsmatrix-Score pro Rezept — Post-MVP" war veraltet — das Feature wurde tatsächlich bereits am 2026-06-13 gebaut (`src/lib/saettigungs-matrix-rezept.ts`, `src/components/rezept-saettigungs-matrix.tsx`, Commit `b9e2bbd`), nie aber im Spec nachgezogen. Unten korrigiert.

**Refinement (2026-08-11, "Complete"-Umstrukturierung):** Die Rezept-Sättigungsmatrix nutzte bisher dieselben 6 Bausteine wie die Mahlzeit-Analyse — wird jetzt aus Konsistenzgründen auf dasselbe Drei-Säulen-Modell (Protein/Ballaststoffe/Volumen) umgestellt wie PROJ-5. Nächster Schritt: `/architecture`, dann `/backend`.

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure) — Rezepte und Bilder in DB + Storage
- Requires: PROJ-2 (User Authentication) — Admin-Erkennung via E-Mail
- Requires: PROJ-4 (KI-Analyse-Agent) — liefert erkannte Zutaten für das Matching
- Requires: PROJ-5 (Sättigungs-Einschätzung) — Rezeptvorschläge erscheinen am Ende der Ergebnisseite

## User Stories

### Nutzer-Perspektive
- Als Nutzer möchte ich am Ende meiner Mahlzeit-Analyse 1–2 passende Rezepte sehen, damit ich sofort weiß wie ich die Mahlzeit konkret kochen kann.
- Als Nutzer möchte ich ein Rezept antippen und die vollständigen Details sehen (Zutaten, Mengen, Zubereitung, Zeitaufwand), damit ich es direkt nachkochen kann.
- Als Nutzer möchte ich, dass die vorgeschlagenen Rezepte wirklich zu meiner Mahlzeit passen — nicht generische Vorschläge, sondern Rezepte mit denselben Hauptzutaten.

### Admin-Perspektive
- Als Admin möchte ich neue Rezepte mit Titel, Bild, Zutaten, Zubereitung und Tags anlegen können, damit die Rezeptbibliothek wächst ohne direkten Datenbank-Zugriff.
- Als Admin möchte ich bestehende Rezepte bearbeiten und löschen können, damit Fehler korrigiert werden können.
- Als Admin möchte ich Zutaten- und Küchen-Tags pro Rezept vergeben können, damit das Matching mit Mahlzeit-Analysen funktioniert.

## Out of Scope
- Eigenständige Rezept-Bibliothek zum Stöbern für Nutzer — deferred (wird in einer späteren Iteration nach PROJ-8 ergänzt)
- Nutzer können eigene Rezepte hinzufügen — Post-MVP, nur Admin erstellt Inhalte
- Rezepte bewerten oder kommentieren — Post-MVP
- Kalorienberechnung der Rezepte über BLS — Post-MVP
- Schritt-für-Schritt-Modus (einzelne Schritte durchklicken) — Post-MVP
- ~~Sättigungsmatrix-Score pro Rezept — Post-MVP (interessant, aber zu viel Pflegeaufwand)~~ → **Korrektur 2026-08-11: tatsächlich bereits deployed** seit 2026-06-13, siehe Status-Hinweis oben. Deterministisch berechnet (Keyword-Matching auf Zutaten), kein KI-Aufruf.
- Küchen-Tag-Matching in v1 — nur Zutaten-Matching; Küchen-Tags werden angelegt aber noch nicht für Matching genutzt

## Acceptance Criteria

### Rezeptvorschläge nach Analyse
- [ ] Angenommen eine Mahlzeit-Analyse wurde abgeschlossen, wenn das Ergebnis angezeigt wird, dann erscheinen am Ende der Seite 0–2 passende Rezeptvorschläge (0 wenn kein Match mit ≥2 gemeinsamen Zutaten-Tags).
- [ ] Angenommen Rezeptvorschläge angezeigt werden, dann zeigt jede Karte: Rezeptbild (oder Platzhalter-Icon), Titel, Gesamtzeitaufwand.
- [ ] Angenommen der Nutzer tippt auf eine Rezeptkarte, dann öffnet sich die Rezept-Detailseite.

### Rezept-Detailseite
- [ ] Angenommen der Nutzer öffnet ein Rezept, dann sieht er: Titel, Bild (wenn vorhanden), Gesamtzeit, Kochzeit, Portionen, Zutatenliste mit Mengen und Einheiten, Zubereitungstext.
- [ ] Angenommen der Nutzer ist auf der Rezept-Detailseite, wenn er zurücknavigiert, dann landet er wieder auf der Analyse-Ergebnisseite.

### Rezept-Sättigungsmatrix (nachträglich dokumentiert, Korrektur 2026-08-11)
- [ ] Angenommen der Nutzer öffnet ein Rezept mit `recipe_typ: null` (vollständiges Gericht), dann sieht er eine deterministisch aus den Zutaten berechnete Sättigungs-Bewertung — kein KI-Aufruf
- [ ] Angenommen `recipe_typ` ist `'beilage'` oder `'grundlage'`, dann erscheint stattdessen der Kontext-Hinweis aus PROJ-16 Teil 2 (keine Sättigungsmatrix)
- [ ] **Refinement 2026-08-11:** Die Bewertung nutzt jetzt dieselben 3 Säulen (Protein, Ballaststoffe, Volumen) und vier Stufen (ungenügend/gering/mittel/gut) wie PROJ-5, statt der bisherigen 6 Bausteine mit drei Stufen — für Konsistenz zwischen Rezept-Ansicht und Mahlzeit-Analyse
- [ ] **Refinement 2026-08-11:** Dieselbe Gesamtbewertungs-Logik wie PROJ-5 (3× gut = sehr sättigend, 2× gut = mäßig, 0–1× gut = wenig)

### Admin — Rezept anlegen
- [ ] Angenommen der eingeloggte Nutzer ist Admin, wenn er `/admin/rezepte` aufruft, dann sieht er die Rezeptliste mit "Neues Rezept"-Button.
- [ ] Angenommen der Admin klickt "Neues Rezept", dann öffnet sich ein Formular mit allen Pflichtfeldern: Titel, Portionen, Kochzeit (Minuten), Gesamtzeit (Minuten), Zubereitungstext, mindestens eine Zutat, mindestens ein Zutaten-Tag.
- [ ] Angenommen der Admin füllt das Formular aus und speichert, dann wird das Rezept in der Datenbank angelegt und erscheint in der Rezeptliste.
- [ ] Angenommen der Admin lädt ein Bild hoch, dann wird es im Supabase Storage gespeichert und im Rezept verknüpft.

### Admin — Rezept bearbeiten & löschen
- [ ] Angenommen der Admin öffnet ein bestehendes Rezept, dann kann er alle Felder bearbeiten und speichern.
- [ ] Angenommen der Admin löscht ein Rezept, dann erscheint ein Bestätigungsdialog und das Rezept wird danach aus DB und Storage entfernt.

### Admin-Zugriff
- [ ] Angenommen ein nicht eingeloggter Nutzer ruft `/admin/rezepte` auf, dann wird er zur Login-Seite weitergeleitet.
- [ ] Angenommen ein eingeloggter Nutzer der kein Admin ist, ruft `/admin/rezepte` auf, dann sieht er eine "Kein Zugriff"-Seite (403).

## Matching-Logik

**Zutaten-Tag-Matching (v1):**
- Jedes Rezept hat eine Liste von Zutaten-Tags (z.B. `["reis", "hühnchen", "sojasauce"]`)
- Die Analyse extrahiert erkannte Zutaten aus `refined_ingredients`
- Normalisierung: Zutaten-Namen werden lowercase + singular abgeglichen (z.B. "Hähnchenbrust" → "hühnchen")
- Ein Rezept wird vorgeschlagen wenn **≥ 2 Tags übereinstimmen**
- Ranking: Rezepte mit dem höchsten Overlap werden zuerst angezeigt
- Maximal 2 Rezepte werden angezeigt

**Küchen-Tags (angelegt, aber in v1 nicht für Matching genutzt):**
- Tags wie `asiatisch`, `mediterran`, `deutsch`, `vegetarisch` können vergeben werden
- Dienen als Vorbereitung für späteres Ranking (Küchen-Tag der Analyse vs. Rezept)

## Admin-Erkennung

Admin-Status wird über die E-Mail-Adresse geprüft:
- `NEXT_PUBLIC_ADMIN_EMAIL` Umgebungsvariable enthält die Admin-E-Mail
- Server-seitig: `user.email === process.env.ADMIN_EMAIL` (nicht `NEXT_PUBLIC_`)
- RLS: Admin-Schreibzugriff über separate Policy oder Service-Role in Admin-Routes

## Edge Cases
- **Kein Rezept-Match:** Kein Abschnitt am Ende der Analyse — kein leerer Bereich, kein "Keine Rezepte"-Text
- **Bild-Upload schlägt fehl:** Rezept wird ohne Bild gespeichert, Platzhalter-Icon erscheint in der App
- **Rezept wird gelöscht das in einer alten Analyse verlinkt war:** Link zeigt auf "Rezept nicht mehr verfügbar"-Seite (kein 500er)
- **Admin löscht Rezept während es jemand gerade ansieht:** Nächster API-Call gibt 404, User sieht saubere Fehlermeldung

## Open Questions
- [ ] Sollen Zutaten-Tags aus einer festen Liste gewählt werden (Autocomplete) oder als Freitext eingetippt? — Empfehlung: Freitext in v1, feste Liste später
- [ ] Wie genau normalisieren wir Zutaten-Namen? (z.B. "Hähnchenbrust" → "hühnchen") — Muss vor /backend definiert werden

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Nur Admin erstellt Rezepte | Qualitätskontrolle; User-generated Content bringt Moderation-Aufwand | 2026-06-12 |
| Admin-UI im App statt Supabase Dashboard | Langfristig pflegbarer; kein DB-Zugriff nötig für Content-Updates | 2026-06-12 |
| Küchen-Tags anlegen aber noch nicht matchen | Vorbereitung für späteres Ranking ohne Over-Engineering in v1 | 2026-06-12 |
| Max. 2 Rezeptvorschläge | Fokus statt Überwältigung; passt in die bestehende Ergebnis-Seite | 2026-06-12 |
| Mindestens 2 übereinstimmende Tags für Vorschlag | Verhindert irrelevante Matches (z.B. Salz als gemeinsame Zutat) | 2026-06-12 |
| Eigenständige Rezept-Bibliothek deferred | Absprung aus Analyse reicht für v1; Bibliothek ist eigenes Feature | 2026-06-12 |

#### Refinement (2026-08-11): Rezept-Sättigungsmatrix auf Drei-Säulen-Modell umgestellt

| Decision | Rationale | Date |
|----------|-----------|------|
| Rezept-Sättigungsmatrix folgt derselben 3-Säulen-Umstellung wie PROJ-5 | Konsistenz — Nutzer sollen auf Rezept- und Mahlzeit-Seiten dieselbe Bewertungslogik sehen, nicht zwei parallele Systeme | 2026-08-11 |
| Deterministische Keyword-Berechnung (kein KI-Aufruf) bleibt unverändert als Ansatz | Nur die bewerteten Dimensionen ändern sich (3 statt 6 Säulen) — der Berechnungsmechanismus selbst hat sich bewährt und bleibt gleich | 2026-08-11 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `recipe_ingredients` als separate Tabelle | Strukturierte Mengen + Einheiten; einfacher zu rendern als Freitext-Parse | 2026-06-12 |
| `recipe-images`-Bucket öffentlich | Rezeptbilder sind kein Nutzer-Datenschutz-Risiko; keine Signed URLs nötig | 2026-06-12 |
| Admin-Prüfung via E-Mail-Env-Variable | Kein Rollen-System nötig für Single-Admin; sicher da server-only | 2026-06-12 |
| Matching via Postgres Array-Overlap | Kein KI-Aufruf; deterministisch und ohne Zusatzkosten | 2026-06-12 |
| Substring-Matching für Tag-Normalisierung | Pragmatisch für v1; Admin kalibriert Tags auf Claude-Vokabular | 2026-06-12 |
| `RezeptFormular` als geteilte Komponente | Create und Edit nutzen identisches Formular; kein Duplikat-Code | 2026-06-12 |

---

## Tech Design (Solution Architect)

### Komponenten-Struktur

**Nutzer-Flow:**
```
SaettigungsErgebnis (bestehend)
  └── RezeptVorschläge [NEU] — lädt Vorschläge per API, erscheint am Ende der Ergebnisseite
       └── RezeptKarte [NEU] — Bild, Titel, Gesamtzeit, Link
            └── /rezept/[id] [NEUE SEITE]
                 └── RezeptDetail [NEU]
                      ├── Header: Titel, Bild, Zeiten, Portionen
                      ├── Zutatenliste mit Mengen und Einheiten
                      └── Zubereitungstext
```

**Admin-Flow:**
```
/admin/rezepte [NEUE SEITE — nur Admin-E-Mail]
  ├── Rezeptliste — Titel, Kochzeit, Bearbeiten / Löschen
  └── "Neues Rezept"-Button
       └── /admin/rezepte/neu [NEUE SEITE]
            └── RezeptFormular [NEU, geteilt]

/admin/rezepte/[id]/bearbeiten [NEUE SEITE]
  └── RezeptFormular [geteilt, vorausgefüllt]
```

### Datenmodell

**Tabelle `recipes`:**
- `id` — eindeutige ID
- `title` — Rezepttitel
- `image_path` — optionaler Bildpfad im Storage-Bucket `recipe-images`
- `servings` — Portionen (Zahl)
- `cook_time_minutes` — Kochzeit in Minuten
- `total_time_minutes` — Gesamtzeit in Minuten
- `instructions` — Zubereitungstext (Freitext)
- `ingredient_tags` — Zutaten-Tags als Array (z.B. `["reis", "hühnchen"]`)
- `cuisine_tags` — Küchen-Tags als Array (z.B. `["asiatisch"]`)
- `created_at`, `updated_at`

**Tabelle `recipe_ingredients`:**
- `id`, `recipe_id` (FK → recipes, CASCADE DELETE)
- `name` — Zutat (z.B. "Hähnchenbrust")
- `amount` — Menge (Dezimalzahl)
- `unit` — Einheit (z.B. "g", "EL", "Stück")
- `sort_order` — Reihenfolge in der Zutatenliste

**Storage-Bucket `recipe-images`:** öffentlich (Rezeptbilder sind keine Nutzerdaten)

### API-Routen

| Route | Zweck | Zugriff |
|-------|-------|---------|
| `GET /api/rezepte/[id]` | Einzelnes Rezept für Detailansicht | Eingeloggte Nutzer |
| `GET /api/rezepte/vorschlaege?analysisId=X` | Passende Rezepte für eine Analyse | Eingeloggte Nutzer |
| `GET /api/admin/rezepte` | Alle Rezepte auflisten | Nur Admin |
| `POST /api/admin/rezepte` | Neues Rezept anlegen | Nur Admin |
| `GET /api/admin/rezepte/[id]` | Einzelnes Rezept für Bearbeitung laden | Nur Admin |
| `PUT /api/admin/rezepte/[id]` | Rezept aktualisieren | Nur Admin |
| `DELETE /api/admin/rezepte/[id]` | Rezept + Bild löschen | Nur Admin |

### Matching-Logik

Die Route `GET /api/rezepte/vorschlaege?analysisId=X`:
1. Liest `refined_ingredients` aus `meal_analyses` für die gegebene Analyse
2. Normalisiert Zutaten-Namen (lowercase)
3. Fragt alle `recipes` ab deren `ingredient_tags` mindestens 2 Elemente mit den normalisierten Zutaten teilen (Postgres Array-Overlap)
4. Sortiert nach Anzahl der Überschneidungen (höchste zuerst)
5. Gibt maximal 2 Rezepte zurück

**Normalisierung v1:** Tags als Kleinbuchstaben, Substring-Matching gegen Zutaten-Namen (Tag `hähnchen` trifft `Hähnchenbrust`). Admin kalibriert Tags auf Claude's Ausgabe-Vokabular.

### Admin-Absicherung

- Alle `/admin/*`-Seiten: Server-seitige E-Mail-Prüfung (`user.email === process.env.ADMIN_EMAIL`), Redirect zu 403-Seite bei Mismatch
- Alle `/api/admin/*`-Routen: gleiche Prüfung, 403-Response bei Mismatch
- RLS `recipes`: SELECT für alle Auth-User; INSERT/UPDATE/DELETE nur wenn `auth.jwt()->>'email' = process.env.ADMIN_EMAIL`
- Neue Umgebungsvariable: `ADMIN_EMAIL` (server-only, kein `NEXT_PUBLIC_`-Prefix)

### Keine neuen Pakete nötig
Alles bereits vorhanden: `react-hook-form` + `zod` (Formulare), shadcn/ui (UI), Supabase Storage (Bilder — Muster aus PROJ-3 wiederverwendbar).

---

### Refinement (2026-08-11): Rezept-Sättigungsmatrix auf Drei-Säulen — gemeinsamer Architecture-Pass mit PROJ-4/PROJ-5/PROJ-16

> Gemeinsamer Architecture-Pass für vier zusammenhängende Specs — Details zu Klassifikation (PROJ-4), Drei-Säulen-Mahlzeit-Anzeige (PROJ-5) und Komponente/Snack (PROJ-16) stehen in den jeweiligen Specs. Hier der PROJ-8-spezifische Teil.

#### Komponenten-Struktur (Änderungen)

```
RezeptSaettigungsMatrix (bestehend, src/components/rezept-saettigungs-matrix.tsx)
└── Baustein-Grid: 3 Säulen (Protein, Ballaststoffe, Volumen) statt 6, vier Farbstufen
    statt drei — sonst unverändert (weiterhin bei jedem Seitenaufruf live berechnet)
```

#### Datenmodell (einfache Sprache)

Die Rezept-Sättigungsmatrix wird bei jedem Seitenaufruf frisch aus den aktuellen Zutaten berechnet und nirgends gespeichert. Anders als bei Mahlzeit-Analysen (PROJ-4/5/16) gibt es hier also **keine historischen Datensätze mit der alten Struktur** — sobald die neue Berechnungslogik deployed ist, zeigt jeder Rezept-Seitenaufruf sofort die neue Drei-Säulen-Bewertung. Kein neues Datenbankfeld, keine Migration.

#### Tech-Entscheidungen (für PM, mit Begründung)

- **Deutlich einfacher als der Mahlzeit-Teil:** weil nichts gespeichert wird, entfällt die ganze "alte vs. neue Struktur erkennen"-Logik, die bei PROJ-4/5/16 nötig ist — reines Austauschen der Bewertungsfunktion.
- **Wird trotzdem gemeinsam mit PROJ-4/PROJ-5/PROJ-16 umgesetzt und deployed**, damit Rezept-Seiten und Mahlzeit-Analyse ab demselben Zeitpunkt konsistent aussehen — kein technischer Zwang, aber ein Konsistenz-Wunsch des Product Owners (siehe Decision Log).

#### Abhängigkeiten

Keine neuen npm-Pakete. Keine neue Umgebungsvariable. Keine Schema-Migration.

## Implementation Notes (Frontend)

**Neue Komponenten:**
- `src/components/rezept-karte.tsx` — Rezept-Karte (Bild, Titel, Gesamtzeit, Link)
- `src/components/rezept-vorschlaege.tsx` — Client Component, fetcht `/api/rezepte/vorschlaege`, zeigt 0–2 Karten, lädt Skeleton
- `src/components/rezept-formular.tsx` — Geteiltes Admin-Formular (react-hook-form + useFieldArray), Bild-Upload via `/api/admin/rezepte/bild`

**Neue Seiten:**
- `src/app/rezept/[id]/page.tsx` — Rezept-Detailseite (Server Component, direkter Supabase-Zugriff)
- `src/app/admin/rezepte/page.tsx` — Admin-Liste mit Bearbeiten/Löschen
- `src/app/admin/rezepte/neu/page.tsx` — Neues Rezept anlegen
- `src/app/admin/rezepte/[id]/bearbeiten/page.tsx` — Rezept bearbeiten (vorausgefüllt)
- `src/app/admin/403/page.tsx` — Zugriffsverweigerung für Nicht-Admins

**Geänderte Dateien:**
- `src/components/saettigungs-ergebnis.tsx` — `analysisId?` Prop, `RezeptVorschlaege` am Ende (vor Reset-Button)
- `src/components/mahlzeit-input.tsx` — `analysisId` aus API-Response lesen, an `SaettigungsErgebnis` übergeben
- `src/app/mahlzeit/[id]/page.tsx` — `meal_analyses.id` in der DB-Query ergänzt
- `src/app/mahlzeit/[id]/mahlzeit-detail.tsx` — `analysisId` Prop + Weitergabe

**Admin-Auth Pattern:** Server-seitiger Check `user.email === process.env.ADMIN_EMAIL` in jeder Admin-Seite und API-Route. Redirect zu `/admin/403` bei Mismatch.

## Implementation Notes (Backend) — Refinement 2026-08-11: Drei-Säulen-Modell + Backfill

Gemeinsamer Backend-Durchlauf mit PROJ-4/PROJ-5/PROJ-16. Für PROJ-8 eigenständig (eigenes deterministisches System, kein KI-Aufruf):

**Korrektur gegenüber Architektur:** Die Rezept-Sättigungsmatrix wird entgegen der ursprünglichen Architektur-Annahme NICHT live bei jedem Seitenaufruf berechnet, sondern beim Anlegen/Bearbeiten eines Rezepts berechnet und in `recipes.saettigungs_matrix` gespeichert (`src/app/api/{admin/,}rezepte/route.ts` bzw. `[id]/route.ts`). Bestehende Rezepte hatten also doch die alte Struktur gespeichert.

**Geänderte Dateien:**
- `src/lib/saettigungs-matrix-rezept.ts` — komplett neu: `calculateRezeptMatrix()` liefert jetzt `{saeulen: {proteine, ballaststoffe, volumen}, gesamtbewertung}` statt der alten 6-Schlüssel-`bausteine`-Form. Neue Funktions-Signatur braucht zusätzlich `servings` (für Energiedichte/Gemüsemenge pro Portion) sowie `amount`/`unit` pro Zutat (für `toGrams()`-Umrechnung) — vorher nur `name`.
- `src/app/api/{admin/,}rezepte/route.ts` und `[id]/route.ts` (4 Dateien) — `calculateRezeptMatrix()`-Aufruf um `recipeData.servings` ergänzt.
- **Backfill statt Alt-Format-Erkennung:** Da nur 15 Rezepte existierten und die Berechnung rein deterministisch aus Zutaten+Portionen ist (im Gegensatz zu Mahlzeit-Analysen, die einen nicht wiederholbaren Foto-Analyse-Moment einfrieren), wurde ein einmaliges Backfill-Skript (`scripts/backfill-rezept-saettigungsmatrix.mjs`) geschrieben und ausgeführt — alle 15 Rezepte haben jetzt die neue `{saeulen, ...}`-Struktur. **Keine Alt-Format-Erkennung im Frontend nötig**, anders als bei PROJ-4/5/16.
- Neues Feld `saeulen` statt `bausteine` ist eine bewusste Namensänderung (nicht nur weniger Schlüssel) — da vollständig gebackfillt, keine Rückwärtskompatibilitäts-Sorge nötig.

**Verifikation:** Backfill-Lauf protokolliert (15/15 Rezepte aktualisiert, Stichprobe gegen `recipe_ingredients` geprüft — ein Fall mit "0g Gemüse" verifiziert als korrektes Ergebnis, nicht als Bug: Rezept enthält nur Kartoffel/Süßkartoffel/Rote Bete, die laut neuer Spec bewusst nicht als Gemüse zählen). 22 neue Unit-Tests in `src/lib/saettigungs-matrix-rezept.test.ts` (Schwellenwerte, Energiedichte, Gemüsemenge, Division durch Portionen, Edge Cases). `npm test` 369/369 grün, `tsc --noEmit`/`npm run lint` sauber für alle Backend-Dateien.

**Noch offen (gehört zu `/frontend`):** `src/components/rezept-saettigungs-matrix.tsx` liest noch `matrix.bausteine.*` (6 Schlüssel) und muss auf `matrix.saeulen.*` (3 Schlüssel, 4 Farbstufen) umgestellt werden — aktuell einziger `tsc`/`next build`-Fehler im gesamten Projekt.

## Implementation Notes (Frontend) — Refinement 2026-08-11

Gemeinsamer Frontend-Durchlauf mit PROJ-4/PROJ-5/PROJ-16 — geteilte Infrastruktur in PROJ-4s Implementation Notes. Für PROJ-8 eigenständig (kein Alt-Format-Problem, da vollständig gebackfillt):

- `src/components/rezept-saettigungs-matrix.tsx` — 3 Säulen statt 6 Bausteine, `matrix.saeulen.*` statt `matrix.bausteine.*`, kein Alt-Format-Zweig nötig (alle 15 Rezepte gebackfillt, siehe Backend-Notes). `art_of_eating`-Sonderfall (Link zu "Wie esse ich richtig?") entfernt, da Art of Eating keine Säule mehr ist.
- `src/app/rezept/[id]/page.tsx` — Überschrift "Sättigungs-Bausteine" → "Sättigungs-Säulen"

**Verifikation:** siehe PROJ-4 Implementation Notes (gemeinsamer Verifikationslauf). Live per Screenshot bestätigt: Rezeptseite "Gemüse Spaghetti" zeigt korrekt Proteine/Ballaststoffe/Volumen mit den gebackfillten Werten.

## QA Test Results

**QA Date:** 2026-06-12
**QA Status:** APPROVED ✅

### Acceptance Criteria Results

#### Rezeptvorschläge nach Analyse
- [x] Angenommen eine Mahlzeit-Analyse wurde abgeschlossen, wenn das Ergebnis angezeigt wird, dann erscheinen am Ende der Seite 0–2 passende Rezeptvorschläge — **PASSED**
- [x] Angenommen Rezeptvorschläge angezeigt werden, dann zeigt jede Karte: Rezeptbild (oder Platzhalter-Icon), Titel, Gesamtzeitaufwand — **PASSED**
- [x] Angenommen der Nutzer tippt auf eine Rezeptkarte, dann öffnet sich die Rezept-Detailseite — **PASSED**

#### Rezept-Detailseite
- [x] Angenommen der Nutzer öffnet ein Rezept, dann sieht er: Titel, Bild (wenn vorhanden), Gesamtzeit, Kochzeit, Portionen, Zutatenliste mit Mengen und Einheiten, Zubereitungstext — **PASSED**
- [x] Angenommen der Nutzer ist auf der Rezept-Detailseite, wenn er zurücknavigiert, dann landet er wieder auf der Analyse-Ergebnisseite — **PASSED**

#### Admin — Rezept anlegen
- [x] Angenommen der eingeloggte Nutzer ist Admin, wenn er `/admin/rezepte` aufruft, dann sieht er die Rezeptliste mit "Neues Rezept"-Button — **PASSED** (manual)
- [x] Angenommen der Admin klickt "Neues Rezept", dann öffnet sich ein Formular mit allen Pflichtfeldern — **PASSED** (manual)
- [x] Angenommen der Admin füllt das Formular aus und speichert, dann wird das Rezept angelegt — **PASSED** (manual)
- [x] Angenommen der Admin lädt ein Bild hoch, dann wird es im Supabase Storage gespeichert — **PASSED** (manual)

#### Admin — Rezept bearbeiten & löschen
- [x] Angenommen der Admin öffnet ein bestehendes Rezept, dann kann er alle Felder bearbeiten und speichern — **PASSED** (manual)
- [x] Angenommen der Admin löscht ein Rezept, dann erscheint ein Bestätigungsdialog — **PASSED** (manual)

#### Admin-Zugriff
- [x] Angenommen ein nicht eingeloggter Nutzer ruft `/admin/rezepte` auf, dann wird er zur Login-Seite weitergeleitet — **PASSED**
- [x] Angenommen ein eingeloggter Nutzer der kein Admin ist, ruft `/admin/rezepte` auf, dann sieht er eine "Kein Zugriff"-Seite (403) — **PASSED**

### Bugs Found

#### Fixed (Medium) — `totalTimeMinutes` vs `total_time_minutes` field name mismatch
- **Severity:** Medium
- **Description:** `GET /api/rezepte/vorschlaege` returned `totalTimeMinutes` (camelCase) but `RezeptKarteData` interface expected `total_time_minutes` (snake_case). Time showed as "undefined Min." on recipe cards.
- **Fix:** Changed API response field name to `total_time_minutes` in `src/app/api/rezepte/vorschlaege/route.ts`
- **Status:** FIXED ✅

### Automated Test Results

**Unit Tests (Vitest):** 63/63 passed
**E2E Tests (Playwright):** 32/32 passed (Chromium + Mobile Chrome)

### Security Audit

- **Authentication:** All API routes return 401 for unauthenticated requests ✅
- **Authorization:** Admin-only routes verify `user.email === ADMIN_EMAIL` server-side ✅
- **RLS:** Recipe reads allowed for all auth users; writes restricted to admin via RLS policy ✅
- **Storage:** `recipe-images` bucket is public (intentional — recipe images are not user-sensitive data) ✅
- **Service Role Key:** Used only in admin API routes, never exposed to client ✅
- **No secrets in client bundle:** `ADMIN_EMAIL` has no `NEXT_PUBLIC_` prefix ✅

### Production Readiness

**READY ✅** — No critical or high bugs. Medium bug fixed. All 32 E2E tests passing.

## Deployment

**Deployed:** 2026-06-13
**Tag:** v1.8.0-PROJ-8
**Production URL:** https://endlichsattapp.vercel.app

**New env var required on Vercel:**
- `ADMIN_EMAIL` — server-only, no NEXT_PUBLIC_ prefix. Must match the admin's login email to grant access to `/admin/rezepte`.

### Refinement "Complete"-Umstrukturierung (Drei-Säulen-Modell)
**Deployed:** 2026-08-11
**Production URL:** https://app.mehralsabnehmen.de/
**Git Tag:** v2.0.0-complete-umstrukturierung (gemeinsamer Release mit PROJ-4/5/16/33/34 + Rebranding)
**Neue Env-Variablen:** keine
**DB-Migrationen:** keine (Bestandsrezepte per einmaligem Backfill-Script migriert, nicht per DB-Migration)

## Post-Deployment: Matching-Verfeinerung (Datenkorrekturen)

**Datum:** 2026-07-20

Bei einer Prüfung der bestehenden 5 Rezepte wurden zwei Datenprobleme gefunden und direkt in der DB behoben:

- **Fenchelsalat hatte nur einen `ingredient_tag`** (`fenchel`). Da das Matching ≥ 2 übereinstimmende Tags voraussetzt (siehe [Matching-Logik](#matching-logik)), konnte dieses Rezept rechnerisch nie vorgeschlagen werden. Fix: `zwiebel` als zweiten Tag ergänzt (Speisezwiebel ist tatsächlich Bestandteil des Rezepts) → `ingredient_tags: [fenchel, zwiebel]`.
- **Lukas' Power Oats hatte `gesund` als `cuisine_tag`.** Verstößt gegen die Projekt-Konvention, dass "gesund/ungesund" nicht verwendet wird (Sättigung ist kein Gesundheitsurteil). Fix: Tag entfernt → `cuisine_tags: [frühstück, porridge]`.
- Bekannt, aber unverändert gelassen: der Tag `granola` bei Lukas' Power Oats entspricht keiner Zutat in `recipe_ingredients` (dort z.B. "Fitness-Mischung", "Sonnenblumenkern"). Auf Wunsch des Product Owners nicht angefasst.

**Bestätigt, kein Bug:** `cuisine_tags` fließen wie in der Spec dokumentiert ("Küchen-Tag-Matching in v1" — Out of Scope) bewusst nicht in die Matching-Logik ein, nur `ingredient_tags`.

## Post-Deployment: Rezeptvorschläge vereinheitlicht (Bugfix + Verhaltensänderung)

**Datum:** 2026-07-20

**Gefundener Bug:** Auf der Analyse-Ergebnisseite gab es zwei getrennte "Rezept"-Hinweise: (1) `RezeptVorschlaege` (Zutaten-Tag-Matching, diese Spec) und (2) eine separate, vom LLM gesteuerte "Zur Rezeptbibliothek"-CTA (Flag `rezeptbibliothek_hinweis`, nur bei `sehr_saettigend`-Bewertungen gesetzt). Flag (2) wurde nie in `meal_analyses` persistiert — nur im frisch von der API zurückgegebenen Ergebnis vorhanden. Beim erneuten Aufruf von `/mahlzeit/[id]` (Server-seitig aus der DB rekonstruiert) fehlte das Feld, die CTA verschwand. Zusätzlich hatte dieser Block keinen `<Separator />` vor sich und hing optisch direkt am "Art of Eating"-Block.

**Fix:** CTA (2) komplett entfernt (Komponente, Typ-Feld, LLM-Prompt-Instruktion in `/api/analyse/confirm`). `RezeptVorschlaege` ist jetzt die einzige Quelle für Rezept-Hinweise auf der Ergebnisseite — lädt live per API, dadurch unabhängig davon ob frisch analysiert oder später erneut aufgerufen, immer konsistent.

**Verhaltensänderung (Product-Owner-Wunsch):**
- Zeigt jetzt **maximal 1 Rezept** statt bisher bis zu 2 (`/api/rezepte/vorschlaege` cappt serverseitig auf `.slice(0, 1)`)
- **Neuer Empty-State:** Wenn kein Rezept ≥ 2 Tag-Matches erreicht, zeigt die Komponente jetzt einen kleinen Hinweis-Block mit Link zur Rezeptbibliothek, statt wie vorher gar nichts zu rendern — jede Analyse hat dadurch immer einen Rezept-Touchpoint, unabhängig vom Match-Ergebnis
- Betrifft nur `src/components/rezept-vorschlaege.tsx` und `src/app/api/rezepte/vorschlaege/route.ts` — Matching-Logik (≥2 Tags, `ingredient_tags`-basiert) selbst unverändert

---

## QA Test Results (Refinement 2026-08-11 — "Complete"-Umstrukturierung: Rezept-Sättigungsmatrix)

**Tested:** 2026-08-11
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

Gemeinsamer QA-Pass für PROJ-4/PROJ-5/PROJ-16/PROJ-8 — Details zu Security und der vollständigen Testsuite siehe [PROJ-16 QA-Abschnitt](PROJ-16-beilagen-kontext.md#qa-test-results-refinement-2026-08-11--complete-umstrukturierung-komponente--snack).

### Acceptance Criteria Status

#### Rezept-Sättigungsmatrix auf 3 Säulen umgestellt
- [x] `calculateRezeptMatrix()` liefert `saeulen` (proteine/ballaststoffe/volumen) statt `bausteine`
- [x] Alle 15 Bestandsrezepte per einmaligem Backfill-Script (`scripts/backfill-rezept-saettigungsmatrix.mjs`) erfolgreich auf das neue Format migriert (15/15) — kein Dual-Format-Rendering nötig, da Rezept-Matrix deterministisch aus Zutaten/Makros neu berechenbar ist (im Gegensatz zu `meal_analyses`)
- [x] Admin- und Nutzer-Rezept-Routen (`/api/admin/rezepte`, `/api/rezepte`, jeweils `[id]`) übergeben korrekt `servings` als dritten Parameter an `calculateRezeptMatrix`
- [x] Rezept-Detailseite zeigt "Sättigungs-Säulen" (nicht mehr "-Bausteine")

### Automated Tests
- `npm test`: 369/369 passed (inkl. 22 Tests für `calculateRezeptMatrix`)
- `tests/PROJ-8-rezeptbibliothek.spec.ts`: 47/47 passed (Fixture auf neues Format aktualisiert; ein Flaky-Fehlschlag durch parallele Worker isoliert und als Test-Infrastruktur-Rauschen bestätigt, nicht reproduzierbar bei `--workers=1`)
- Ein während dieser QA-Runde entdeckter Datensatz-Altlast (4 verwaiste Test-Rezepte aus vorherigen fehlgeschlagenen QA-Testläufen dieser Session, durch fehlgeschlagene Assertions vor dem Cleanup-Schritt) wurde bereinigt (DB-Löschung), kein Produktbug

### Summary
- **Acceptance Criteria:** 4/4 passed
- **Bugs Found:** 0
- **Security:** Pass (siehe PROJ-16)
- **Production Ready:** JA — BUG-1 aus PROJ-16 wurde in derselben Sitzung behoben, siehe dortiges Re-Test
- **Recommendation:** Bereit für gemeinsames Deployment mit PROJ-4/PROJ-5/PROJ-16
