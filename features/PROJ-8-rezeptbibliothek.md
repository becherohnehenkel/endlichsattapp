# PROJ-8: Rezeptbibliothek

## Status: Architected
**Created:** 2026-06-12
**Last Updated:** 2026-06-12

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
- Sättigungsmatrix-Score pro Rezept — Post-MVP (interessant, aber zu viel Pflegeaufwand)
- Küchen-Tag-Matching in v1 — nur Zutaten-Matching; Küchen-Tags werden angelegt aber noch nicht für Matching genutzt

## Acceptance Criteria

### Rezeptvorschläge nach Analyse
- [ ] Angenommen eine Mahlzeit-Analyse wurde abgeschlossen, wenn das Ergebnis angezeigt wird, dann erscheinen am Ende der Seite 0–2 passende Rezeptvorschläge (0 wenn kein Match mit ≥2 gemeinsamen Zutaten-Tags).
- [ ] Angenommen Rezeptvorschläge angezeigt werden, dann zeigt jede Karte: Rezeptbild (oder Platzhalter-Icon), Titel, Gesamtzeitaufwand.
- [ ] Angenommen der Nutzer tippt auf eine Rezeptkarte, dann öffnet sich die Rezept-Detailseite.

### Rezept-Detailseite
- [ ] Angenommen der Nutzer öffnet ein Rezept, dann sieht er: Titel, Bild (wenn vorhanden), Gesamtzeit, Kochzeit, Portionen, Zutatenliste mit Mengen und Einheiten, Zubereitungstext.
- [ ] Angenommen der Nutzer ist auf der Rezept-Detailseite, wenn er zurücknavigiert, dann landet er wieder auf der Analyse-Ergebnisseite.

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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
