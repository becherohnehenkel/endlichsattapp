# PROJ-26: Fehler-Feedback zu KI-Ergebnissen

## Status: Deployed
**Created:** 2026-07-21
**Last Updated:** 2026-07-21

## Dependencies
- Requires: PROJ-25 (KI-Hinweis auf Ergebnisseiten) — der Feedback-Auslöser erscheint direkt beim KI-Hinweis, auf denselben drei Oberflächen
- Requires: PROJ-4, PROJ-5 (KI-Analyse-Agent, Sättigungs-Einschätzung) — Feedback bezieht sich auf deren Ausgabe
- Requires: PROJ-8 (Rezeptbibliothek) — Feedback ist auch auf der Rezept-Detailseite möglich
- Requires: PROJ-19 (Gast-Modus) — Gäste können ebenfalls Feedback abschicken
- Betrifft: PROJ-13 (Admin-Dashboard) — neue Admin-Unteransicht analog zur bestehenden Codes-Verwaltung

## User Stories
- Als Nutzer (registriert oder Gast) möchte ich direkt beim KI-Hinweis einen Fehler in der Sättigungs-Einschätzung melden können, ohne den Fehler selbst detailliert beschreiben zu müssen, damit die Meldung schnell und ohne Hürde geht.
- Als Nutzer möchte ich nach dem Absenden eine kurze Bestätigung sehen, damit ich weiß, dass mein Feedback angekommen ist.
- Als Product Owner möchte ich alle eingegangenen Feedback-Meldungen in einer Admin-Übersicht sehen — inklusive der genauen Daten, die der Nutzer zum Zeitpunkt der Meldung gesehen hat — damit ich Fehler in der KI-Analyse nachvollziehen und beheben kann.
- Als Product Owner möchte ich bereits geprüftes Feedback als erledigt markieren können, damit ich bei wachsender Liste den Überblick behalte, was ich schon bearbeitet habe.

## Out of Scope
- Echter Screenshot der Seite — es werden nur strukturierte Kontext-Daten (Seitentyp, Referenz, angezeigte Sättigungs-Werte) automatisch mitgeschickt, kein Bild. Vermeidet eine neue Abhängigkeit (z.B. `html2canvas`) und Bild-Storage für ein P2-Feature.
- Rückmeldung/Antwort an den Nutzer (z.B. per E-Mail) — reine Einbahnstraße im MVP, kein Kontaktfeld, keine Dialogfunktion
- Feedback-Trigger auf dem Wochen-Recap (PROJ-17) oder dem Beilagen-/Grundlagen-Kontext-Hinweis (PROJ-16) — konsistent mit dem Scope-Ausschluss des KI-Hinweises in PROJ-25 (dort erscheint ohnehin keine KI-Matrix, an der ein Fehler gemeldet werden könnte)
- Kategorisierung/Tagging des Fehlertyps (z.B. "falsche Kalorien", "falscher Baustein") — reines Freitext-Feld für MVP, keine strukturierte Fehler-Taxonomie
- Bearbeitungs-/Kommentarfunktion in der Admin-Übersicht über die Erledigt-Markierung hinaus — kein internes Notizfeld, kein Zuweisen an Personen (Solo-Entwickler-Projekt)
- Verknüpfung mit der Sättigungsmatrix-Dokumentation (automatisches Vorschlagen von Korrekturen) — Feedback ist reine Rohdaten-Sammlung, keine automatisierte Auswertung
- Löschen von Feedback-Einträgen — Einträge bleiben dauerhaft erhalten (Historie), nur der Erledigt-Status ändert sich

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Feedback abschicken (Nutzer)
- [ ] Angenommen ein Nutzer (registriert oder Gast) sieht den KI-Hinweis auf einer der drei Ergebnis-Oberflächen (Mahlzeit-Analyse, Mahlzeit-Historie, Rezept-Detailseite), dann sieht er direkt daneben einen Link/Button "Feedback geben".
- [ ] Angenommen ein Nutzer klickt auf "Feedback geben", dann öffnet sich ein Dialog mit einem Freitext-Nachrichtenfeld und einem Absenden-Button.
- [ ] Angenommen der Dialog ist geöffnet, wenn der Nutzer den Dialog ohne Eingabe schließt (z.B. per X oder Klick daneben), dann wird kein Feedback gespeichert.
- [ ] Angenommen der Nutzer lässt das Nachrichtenfeld leer, wenn er auf Absenden klickt, dann wird ein Validierungsfehler angezeigt und nichts wird gespeichert.
- [ ] Angenommen der Nutzer gibt eine Nachricht ein und klickt auf Absenden, dann werden automatisch und unsichtbar für den Nutzer alle zum Zeitpunkt angezeigten Analyse-Daten als Snapshot mitgeschickt — nicht nur die Kurzfassung. Bei einer Mahlzeit-Analyse (Mahlzeit-Analyse-Ergebnis/Mahlzeit-Historie): die vollständige analysierte Zutatenliste (Name, Menge, Quelle), alle getroffenen Annahmen der KI, die Vorher-Bewertung (alle 6 Bausteine einzeln + Gesamtbewertung + Erklärung + Nährwerte), alle gegebenen Verbesserungsvorschläge (Aktion, Begründung, betroffener Baustein) samt Art-of-Eating-Tipp, sowie die Nachher-Bewertung (Bausteine, Gesamtbewertung, Nährwerte, Deltas). Bei einem Rezept: die vollständige Zutatenliste (Name, Menge) und die Sättigungs-Matrix (alle 6 Bausteine einzeln inkl. Erklärung + Gesamtbewertung) sowie die Nährwerte pro Portion.
- [ ] Angenommen das Feedback wurde erfolgreich gespeichert, dann sieht der Nutzer eine kurze Bestätigung ("Danke, wir schauen uns das an" o.ä.) und der Dialog schließt sich.
- [ ] Angenommen die API ist beim Absenden nicht erreichbar, dann wird eine Fehlermeldung angezeigt und die eingegebene Nachricht bleibt im Formular erhalten.
- [ ] Angenommen ein Nutzer (registriert oder anonyme Gast-Session) hat bereits 5 Feedback-Meldungen am selben Kalendertag abgeschickt, wenn er ein weiteres Mal absenden will, dann wird eine Meldung angezeigt, dass das Tageslimit erreicht ist, und nichts wird gespeichert.

### Feedback einsehen (Admin)
- [ ] Angenommen der Product Owner ist als Admin eingeloggt, wenn er die neue Feedback-Übersicht im Admin-Bereich öffnet, dann sieht er alle eingegangenen Feedback-Einträge, neueste zuerst, offene Einträge vor bereits erledigten.
- [ ] Angenommen ein Feedback-Eintrag wird in der Admin-Übersicht angezeigt, dann sind sichtbar: die Nachricht, Zeitpunkt, Seitentyp, ein Link zur betroffenen Mahlzeit/zum betroffenen Rezept, sowie der vollständige Analyse-Snapshot (Zutatenliste mit Mengen, alle 6 Sättigungs-Bausteine einzeln, Nährwerte, Verbesserungsvorschläge/Tipps) — in derselben Aufbereitung wie auf der ursprünglichen Ergebnisseite, damit der Fehler ohne Nachschlagen an anderer Stelle nachvollziehbar ist.
- [ ] Angenommen der Admin klickt bei einem offenen Feedback-Eintrag auf "Erledigt", dann wird der Eintrag als erledigt markiert und entsprechend visuell abgesetzt (z.B. ausgegraut, ans Ende sortiert).
- [ ] Angenommen ein Nutzer ohne Admin-Rechte versucht, die Feedback-Übersicht oder die zugehörige API direkt aufzurufen, dann wird der Zugriff verweigert (analog zum bestehenden Admin-Auth-Muster).

## Edge Cases
- Nutzer schickt Feedback zu einer Mahlzeit-Analyse, löscht die Mahlzeit danach selbst → Feedback-Eintrag bleibt erhalten (Snapshot-Daten sind unabhängig vom Original gespeichert), der Link zur Mahlzeit führt aber ins Leere — Admin-Ansicht muss diesen Fall abfangen (z.B. "Mahlzeit nicht mehr vorhanden")
- Rezept wird nach der Feedback-Meldung vom Admin bearbeitet (z.B. Matrix korrigiert) → der gespeicherte Snapshot zeigt weiterhin die ursprünglichen, zum Meldezeitpunkt angezeigten Werte, nicht die aktuellen
- Gast ohne Account schickt Feedback, danach läuft die anonyme Session ab oder der Browser wird gewechselt → Feedback bleibt trotzdem gespeichert (nicht an eine dauerhafte Identität gebunden), nur das Tageslimit kann nicht mehr über dieselbe Session nachverfolgt werden
- Nutzer öffnet den Feedback-Dialog auf einem Rezept ohne Sättigungs-Matrix (Beilagen-/Grundlagen-Typ) → kann nicht vorkommen, da dort laut PROJ-25 auch der KI-Hinweis (und damit der Feedback-Link) gar nicht angezeigt wird
- Sehr lange Nachricht (z.B. mehrere tausend Zeichen) → Zeichenlimit im Formular (500 Zeichen), serverseitig zusätzlich validiert
- Zwei Feedback-Meldungen zur exakt gleichen Mahlzeit/demselben Rezept kurz hintereinander → beide werden als getrennte Einträge gespeichert, keine Deduplizierung (könnten unterschiedliche Anmerkungen sein)
- Mahlzeit-Analyse ohne Verbesserungsvorschläge (Fall "sehr sättigend", siehe PROJ-5: kein konstruierter Vorschlag nötig) → Snapshot enthält eine leere Vorschläge-Liste, kein Fehlerzustand, Admin-Ansicht zeigt diesen Abschnitt einfach leer/entfällt

## Technical Requirements (optional)
- Barrierefreiheit: Dialog muss mit Tastatur bedienbar sein (Standard-Anforderung für alle Formulare im Projekt)
- Mobile-first: Dialog muss auf 375px Breite vollständig nutzbar sein
- Rate-Limiting: max. 5 Feedback-Einträge pro Nutzer/anonyme Gast-Session und Kalendertag (analog zum bestehenden Foto-Scan-Limit-Muster aus PROJ-10)
- Admin-Zugriff: gleiches Auth-Muster wie bestehende Admin-Seiten (`ADMIN_EMAIL`-Check)

## Open Questions
- [x] Welche Daten genau soll der Snapshot enthalten? → Vollständige Analyse statt Kurzfassung: komplette Zutatenliste mit Mengen, alle 6 Bausteine einzeln, Nährwerte, alle Verbesserungsvorschläge/Tipps (siehe Acceptance Criteria + Decision Log) (2026-07-21)
- [x] Technische Speicherform des Snapshots → ein zusammenhängender Datenblock (JSON), keine einzelnen Spalten pro Feld — bildet die bereits vorhandene, verschachtelte Analyse-Struktur 1:1 ab (2026-07-21)
- [x] Soll die Admin-Übersicht mit dem bestehenden `/admin`-Dashboard zusammengeführt oder als eigener Menüpunkt geführt werden? → Eigene Unterseite `/admin/feedback`, verlinkt über eine neue Kachel auf `/admin` — konsistent mit dem bestehenden Muster (`/admin/rezepte`, `/admin/codes`) (2026-07-21)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kein echter Screenshot, nur strukturierte Kontext-Daten | Vermeidet neue Abhängigkeit (z.B. `html2canvas`) und Bild-Storage — für ein P2-Feature unverhältnismäßiger Aufwand; strukturierte Daten (Seitentyp, Referenz, angezeigte Werte) reichen aus, um den Fehler nachzuvollziehen | 2026-07-21 |
| Zwingende Admin-Übersicht statt reiner DB-Speicherung | Explizit vom Product Owner gefordert — "ich muss schon sehen können, was alles nicht funktioniert" | 2026-07-21 |
| Feedback-Auslöser direkt beim KI-Hinweis platziert | Genau dort, wo der Nutzer liest, dass Fehler möglich sind, kann er sie sofort melden — kürzester Weg von Problem-Erkenntnis zu Meldung | 2026-07-21 |
| Auslöser auf denselben 3 Oberflächen wie der KI-Hinweis (PROJ-25) | Konsistenz — überall wo ein Fehler sichtbar sein könnte, muss er auch meldbar sein | 2026-07-21 |
| Dialog/Modal mit Freitext-Pflichtfeld statt Inline-Formular | Lenkt beim Absenden nicht vom Rest der Seite ab, klar abgegrenzte Interaktion; Kontext-Daten werden automatisch und unsichtbar mitgeschickt, damit der Nutzer nichts technisches beschreiben muss | 2026-07-21 |
| Admin-Übersicht mit Erledigt-Markierung statt reiner Leseliste | Ohne Status verliert der Product Owner bei wachsender Liste den Überblick, was schon geprüft wurde | 2026-07-21 |
| Auch Gäste können Feedback abschicken | Konsistent mit dem KI-Hinweis, der ebenfalls für Gäste sichtbar ist (PROJ-19) — Gäste sehen dieselben Analyse-Ergebnisse und können dieselben Fehler entdecken | 2026-07-21 |
| Einfaches Rate-Limit (5/Tag pro Nutzer/Gast-Session) | Da auch nicht eingeloggte Gäste schreiben können, braucht die API einen Basis-Spam-Schutz; einfaches Tageslimit reicht für MVP, analog zum bestehenden Foto-Scan-Limit-Muster (PROJ-10) | 2026-07-21 |
| Keine Rückmeldung/Kontaktaufnahme im MVP | Hält das Formular minimal und DSGVO-unkritisch (keine Kontaktdaten-Erfassung); kann bei Bedarf später als eigenes Refinement ergänzt werden | 2026-07-21 |
| Feedback-Snapshot bleibt beim Bearbeiten/Löschen der referenzierten Mahlzeit/des Rezepts erhalten | Der Admin muss sehen können, was der Nutzer zum Meldezeitpunkt tatsächlich gesehen hat, auch wenn sich die Originaldaten später ändern oder verschwinden | 2026-07-21 |
| Snapshot enthält die vollständige Analyse (komplette Zutatenliste mit Mengen, alle 6 Bausteine einzeln, Nährwerte, alle Verbesserungsvorschläge/Tipps) statt nur einer Kurzfassung der Sättigungs-Werte | Auf expliziten Wunsch des Product Owners nach der ersten Spec-Fassung — um einen gemeldeten Fehler tatsächlich diagnostizieren zu können (z.B. "welche Zutat wurde falsch erkannt", "welcher Baustein ist falsch bewertet"), reicht eine Kurzfassung nicht aus; der Admin muss dieselbe vollständige Ansicht sehen, die auch der Nutzer beim Melden vor sich hatte | 2026-07-21 |
| Kein Löschen von Feedback-Einträgen, nur Erledigt-Status | Feedback bleibt als Historie erhalten — Löschen wäre unnötiges Risiko, echte Aufräum-Anforderung besteht nicht bei erwartbar überschaubarem Volumen | 2026-07-21 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue eigenständige Tabelle für Feedback statt Erweiterung von `meals`/`recipes` | Feedback ist konzeptionell eine Meldung über eine Mahlzeit/ein Rezept, kein Teil davon; braucht eigene RLS-Regeln (jeder darf einfügen, nur Admin liest/aktualisiert) | 2026-07-21 |
| Analyse-Snapshot als ein zusammenhängender Datenblock (JSON) statt einzelner Spalten pro Feld | Die Analyse-Struktur ist bereits komplex und variiert zwischen Mahlzeit- und Rezept-Kontext — 1:1-Übernahme der vorhandenen Struktur statt eines parallelen, starren Schemas | 2026-07-21 |
| Rate-Limiting nach demselben Tages-Zähler-Muster wie PROJ-10 (`profiles`-Tabelle) | Bereits bewährt, funktioniert identisch für Gäste und registrierte Nutzer (beide haben eine feste `profiles`-Zeile durch Supabase-Anonymous-Auth) | 2026-07-21 |
| Dialog (shadcn `Dialog`, bereits im Projekt installiert) statt eigener Seite für das Feedback-Formular | Kein neues Paket nötig; kürzester Weg für den Nutzer ohne Seitenwechsel | 2026-07-21 |
| Admin-Feedback-Ansicht als eigene Unterseite `/admin/feedback`, analog zu `/admin/codes` (Server-Component mit Auth-Check + Client-Component-Tabelle für Interaktion) | Bestehendes, bewährtes Muster im Projekt — konsistent mit dem Rest des Admin-Bereichs | 2026-07-21 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Component-Struktur

```
Ergebnis-Seite (Mahlzeit-Analyse / Mahlzeit-Historie / Rezept-Detailseite)
  └── KIHinweis (bestehend aus PROJ-25)
       └── "Feedback geben"-Link [NEU] — öffnet Dialog

FeedbackDialog [NEU]
  ├── Freitext-Nachrichtenfeld (Pflicht, max. 500 Zeichen)
  ├── Absenden-Button
  └── Nach Erfolg: kurze Bestätigung, Dialog schließt sich
       (Kontext-Daten — Seitentyp, Referenz, vollständiger Analyse-Snapshot —
        werden beim Absenden automatisch mitgeschickt, für den Nutzer unsichtbar)

Admin-Bereich (/admin)
  └── neue Kachel "Feedback" [NEU] — analog zu den bestehenden Kacheln "Rezepte" und "Codes"

/admin/feedback [NEU]
  └── FeedbackListe [NEU]
       └── Ein Eintrag pro Meldung, offene zuerst:
            ├── Nachricht + Zeitpunkt + Seitentyp
            ├── Link zur betroffenen Mahlzeit/zum betroffenen Rezept
            ├── Vollständiger Analyse-Snapshot (Zutatenliste, alle 6 Bausteine,
            │    Nährwerte, Verbesserungsvorschläge) — in derselben Aufbereitung
            │    wie auf der ursprünglichen Ergebnisseite
            └── "Erledigt"-Button
```

### B) Datenmodell (fachlich beschrieben)

Jede Feedback-Meldung speichert:
- Wer sie geschickt hat (Nutzer-ID — auch Gäste haben eine feste ID, siehe PROJ-19)
- Zeitpunkt
- Freitext-Nachricht (max. 500 Zeichen)
- Seitentyp (Mahlzeit-Analyse / Mahlzeit-Historie / Rezept)
- Referenz zur betroffenen Mahlzeit oder zum betroffenen Rezept (der Link führt ins Leere, falls das Original später gelöscht wird — der Snapshot bleibt trotzdem vollständig lesbar)
- Vollständiger Snapshot der Analyse zum Meldezeitpunkt (Zutatenliste, alle 6 Sättigungs-Bausteine, Nährwerte, Verbesserungsvorschläge) — unveränderlich, unabhängig vom Original gespeichert
- Erledigt-Status (offen/erledigt)

**Gespeichert in:** Supabase, neue Tabelle, Zeilen-Sicherheit (RLS) aktiviert: jeder darf eigene Meldungen einfügen, nur der Admin darf lesen und den Erledigt-Status ändern.

**Rate-Limiting:** Derselbe Tages-Zähler-Mechanismus wie beim bestehenden Foto-Scan-Limit (PROJ-10, `profiles`-Tabelle) — funktioniert identisch für Gäste und registrierte Nutzer, da beide eine feste, dauerhafte Nutzer-ID haben (per Supabase-Anonymous-Auth, PROJ-19).

### C) Tech-Entscheidungen (Begründung)

- **Warum eine neue Tabelle statt bestehende Strukturen zu erweitern?** Feedback ist konzeptionell eigenständig — kein Teil einer Mahlzeit oder eines Rezepts, sondern eine Meldung darüber. Braucht außerdem eigene Zugriffsregeln (jeder darf schreiben, nur der Admin darf lesen), die sich nicht sauber in die bestehenden `meals`-/`recipes`-Tabellen einfügen ließen.
- **Warum der komplette Analyse-Snapshot als ein zusammenhängender Datenblock statt einzelner Felder?** Die Analyse-Struktur (Zutatenliste, 6 Bausteine, Vorschläge, Nährwerte) ist bereits eine komplexe, verschachtelte Struktur, die für Mahlzeiten und Rezepte leicht unterschiedlich aussieht. Sie 1:1 zu übernehmen, statt ein paralleles, starres Tabellenschema mit dutzenden Einzelspalten nachzubauen, ist einfacher zu pflegen und bildet exakt das ab, was der Nutzer tatsächlich gesehen hat.
- **Warum Rate-Limiting nach demselben Muster wie PROJ-10?** Bereits bewährt im Projekt, funktioniert für Gäste und registrierte Nutzer identisch (beide haben eine `profiles`-Zeile) — kein neues Konzept nötig.
- **Warum ein Dialog statt einer eigenen Seite?** Kürzester Weg für den Nutzer — er bleibt auf der Ergebnisseite, kein Seitenwechsel, kein Kontextverlust.
- **Warum eine Admin-Seite analog zu `/admin/codes`?** Bestehendes, bewährtes Muster im Projekt (geschützte Übersichtsseite + interaktive Liste für Status-Änderungen) — konsistent mit dem Rest des Admin-Bereichs, nichts Neues zu lernen für den Product Owner.
- **Warum eine eigene Unterseite (`/admin/feedback`) statt Einbau in die bestehende `/admin`-Übersicht?** Konsistent mit dem bestehenden Muster: `/admin` ist eine reine Kachel-Übersicht, die eigentliche Arbeit passiert auf eigenen Unterseiten (`/admin/rezepte`, `/admin/codes`) — löst die offene Frage aus dem Interview.

### D) Abhängigkeiten (zu installierende Pakete)

Keine neuen Pakete — der benötigte `Dialog`-Baustein ist über shadcn/ui bereits im Projekt installiert (`src/components/ui/dialog.tsx`).

## Implementation Notes (Backend)

**DB-Migration** (`create_feedback_table_and_rate_limit`, angewendet auf Projekt `endlichsattsupybase`):
- `profiles`: neue Spalten `feedback_today_count integer NOT NULL DEFAULT 0`, `feedback_today_date date` — gleiches Tages-Zähler-Muster wie `photo_scans_today_*` (PROJ-10)
- Neue Tabelle `feedback`: `id`, `user_id` (FK → `auth.users`, `ON DELETE CASCADE` — Feedback eines gelöschten Kontos wird mitgelöscht, DSGVO-konform), `message` (TEXT, CHECK 1–500 Zeichen), `page_type` (TEXT, CHECK IN `mahlzeit_analyse`/`mahlzeit_historie`/`rezept`), `reference_id` (UUID, **bewusst ohne FK** — Snapshot muss lesbar bleiben, auch wenn die referenzierte Mahlzeit/das Rezept später gelöscht wird; eine FK würde das Löschen blockieren oder das Feedback mitlöschen), `snapshot` (JSONB NOT NULL), `resolved` (BOOLEAN DEFAULT false), `created_at`
- RLS aktiviert: einzige Policy erlaubt `INSERT` mit `WITH CHECK (auth.uid() = user_id)` — bewusst **keine** SELECT/UPDATE-Policy für normale Nutzer (Admin-Ansicht liest/aktualisiert ausschließlich über den Service-Role-Client, gleiches Muster wie `invite_codes`)
- Index `idx_feedback_resolved_created (resolved, created_at DESC)` für die "offene zuerst, neueste zuerst"-Sortierung
- Neue Postgres-Funktion `check_and_increment_feedback_count()` (SECURITY DEFINER, atomarer Tages-Zähler, analog zu `decrement_photo_scan()` aus PROJ-10) — gibt verbleibende Anzahl zurück oder `NULL` bei erreichtem Tageslimit
- `src/types/database.ts` neu generiert

**Geänderte/neue Dateien:**
- `src/lib/feedback-schema.ts` — **neu**. `FeedbackSchema` (Zod): `message` (1–500 Zeichen, getrimmt), `pageType` (Enum), `referenceId` (UUID), `snapshot` (`z.record(z.string(), z.unknown())`, zusätzlich auf max. 20 KB serialisierte Größe begrenzt gegen Missbrauch). Snapshot-Struktur bewusst nicht feldweise validiert — variiert je nach `pageType`, wird 1:1 als opaker Block gespeichert (siehe Tech Design).
- `src/app/api/feedback/route.ts` — **neu**. `POST`: Auth-Check (401), Zod-Validierung (400), Rate-Limit via RPC (429 bei `NULL`-Rückgabe), Insert. Gibt `{ success: true }` zurück (kein `id`, siehe Bug-Fund unten).
- `src/app/api/admin/feedback/route.ts` — **neu**. `GET`: `requireAdmin()` (401/403), liest über `createAdminClient()` alle Einträge, sortiert `resolved ASC, created_at DESC`.
- `src/app/api/admin/feedback/[id]/route.ts` — **neu**. `PATCH`: `requireAdmin()` (401/403), setzt `resolved = true` über `createAdminClient()`, 404 falls ID nicht existiert.

**Gefundener und behobener Bug während der Live-Verifikation:** Die ursprüngliche `POST`-Implementierung nutzte `.insert({...}).select('id').single()`, um die neue ID zurückzugeben. Live-Test gegen den echten Dev-Server schlug mit 500 fehl — Postgres-Logs zeigten `"new row violates row-level security policy for table feedback"`, obwohl `auth.uid() = user_id` nachweislich (per direkter SQL-Diagnose mit `set local request.jwt.claims`) korrekt zutraf. Root Cause: `INSERT ... RETURNING` erfordert unter RLS zusätzlich eine **SELECT-Policy** für die Sichtbarkeit der zurückgegebenen Zeile — die für `feedback` bewusst nicht existiert (Architektur-Entscheidung: Nutzer sollen eigenes Feedback nicht zurücklesen können). Diagnostiziert durch Vergleich mit der strukturell identischen, aber funktionierenden `meals`-Insert-Policy (die zusätzlich eine SELECT-Policy hat) sowie durch Testen mit/ohne `RETURNING`-Klausel direkt in SQL. **Fix:** `.select().single()` entfernt, Route gibt nur `{ success: true }` zurück statt der neuen ID — vermeidet das Problem, ohne die bewusst restriktive RLS-Policy aufzuweichen.

**Tests:** 15 neue Vitest-Integrationstests (`feedback/route.test.ts`: 7, `admin/feedback/route.test.ts`: 4, `admin/feedback/[id]/route.test.ts`: 4) — Happy Path, Validierungsfehler, 401/403/429/404/500. Gesamte Suite: 224/224 grün, `tsc --noEmit` und ESLint fehlerfrei, `npm run build` erfolgreich.

**Live-Verifikation:** Gegen den echten Dev-Server mit dem QA-Testkonto durchgeführt (nach dem RLS-Fix): `POST /api/feedback` → 201, Zeile korrekt mit vollständigem Snapshot in der DB verifiziert; `GET /api/admin/feedback` als Nicht-Admin → 403; `POST` mit leerer Nachricht → 400. Test-Zeile und Rate-Limit-Zähler des QA-Kontos danach zurückgesetzt (keine Testdaten-Reste). Admin-`GET`/`PATCH`-Routen selbst nicht live mit echtem Admin-Account getestet (kein Zugriff auf `ADMIN_EMAIL`-Passwort, gleiche Einschränkung wie in PROJ-24/PROJ-25 dokumentiert) — nutzen aber `createAdminClient()` (Service-Role, umgeht RLS vollständig), wodurch die hier gefundene RETURNING-Falle dort strukturell nicht auftreten kann.

**Hinweis für /frontend:** `reference_id` muss vom Frontend korrekt befüllt werden — für `pageType: 'mahlzeit_analyse'`/`'mahlzeit_historie'` die `meals.id` (nicht `meal_analyses.id`), passend zur Route `/mahlzeit/[id]`; für `pageType: 'rezept'` die `recipes.id`, passend zu `/rezept/[id]`.

## Implementation Notes (Frontend)

**Neue Dateien:**
- `src/components/feedback-dialog.tsx` — **neu**. `FeedbackDialog` (shadcn `Dialog`), Props `pageType`/`referenceId`/`snapshot`. Trigger: dezenter Text-Link "Feedback geben" (analog zum `KIHinweis`-Stil). Formular: `Textarea` (max. 500 Zeichen, Pflichtfeld — Client-seitige Prüfung vor dem Absenden, kein API-Call bei leerer Nachricht), Absenden-Button mit Ladezustand. Nach Erfolg: Bestätigungs-Screen ("Danke, wir schauen uns das an!") ersetzt das Formular im selben Dialog. 429 (Tageslimit) und sonstige Fehler zeigen eine Inline-Fehlermeldung, die eingegebene Nachricht bleibt erhalten. Schließen ohne Absenden (Escape/Klick daneben/X) setzt das Formular zurück, ohne etwas zu speichern.
- `src/app/admin/feedback/page.tsx` — **neu**. Server Component, gleiches `requireAdmin()`-Redirect-Muster wie `/admin/codes` (nicht eingeloggt → `/login`, kein Admin → `/admin/403`). Lädt alle Einträge über `createAdminClient()`, sortiert `resolved ASC, created_at DESC`.
- `src/app/admin/feedback/feedback-list.tsx` — **neu**. Client Component. Pro Eintrag: Nachricht, Zeitpunkt, Seitentyp-Label, Link zur betroffenen Mahlzeit/zum Rezept (fehlt die Referenz, weil das Original gelöscht wurde, wird stattdessen "Original nicht mehr vorhanden" angezeigt), "Erledigt"-Button (nur bei offenen Einträgen sichtbar, ruft `PATCH /api/admin/feedback/[id]`, aktualisiert die Liste optimistisch und sortiert erledigte Einträge ans Ende), sowie ein aufklappbarer Bereich (`Collapsible`, analog zum bestehenden Annahmen-Aufklapper in `saettigungs-ergebnis.tsx`) mit dem vollständigen Snapshot: Zutatenliste, alle 6 Bausteine (funktioniert sowohl für das `vorher`/`nachher`-Format der Mahlzeit-Analyse als auch für das `matrix`-Format der Rezept-Seite — generischer Renderer erkennt beide Formen), Nährwerte, Verbesserungsvorschläge, Art-of-Eating-Tipp.

**Geänderte Dateien:**
- `src/app/admin/page.tsx` — neue Kachel "Feedback" → `/admin/feedback`, gleiches Muster wie die bestehenden Kacheln "Rezepte" und "Codes".
- `src/app/rezept/[id]/page.tsx` — `FeedbackDialog` (`pageType="rezept"`) direkt unter den KI-Hinweisen bei den Sättigungs-Bausteinen. Snapshot: Zutatenliste (nur `item_type === 'zutat'`, Name/Menge/Einheit), die komplette `matrix`, sowie `macros` (Nährwerte pro Portion).
- `src/components/saettigungs-ergebnis.tsx` — zwei neue optionale Props `mealId`/`pageType` (`'mahlzeit_analyse' | 'mahlzeit_historie'`). `FeedbackDialog` erscheint nur, wenn beide gesetzt sind (defensive Absicherung, praktisch immer der Fall sobald ein Ergebnis angezeigt wird). Snapshot: `zutatenliste`, `annahmen`, `vorher`, `vorschlaege`, `art_of_eating_tipp`, `nachher` — 1:1 aus dem bereits vorhandenen `result`-Objekt, keine zusätzliche Datenaufbereitung nötig. Wichtig: `mealId` ist **nicht** dasselbe wie das bereits vorhandene `analysisId` (das referenziert `meal_analyses.id`, für die Rezeptvorschläge-Abfrage) — `mealId` referenziert `meals.id`, passend zur Detailseiten-Route.
- `src/components/mahlzeit-input.tsx` (frischer Analyse-Flow) — übergibt `mealId` (bereits vorhandener State) und `pageType="mahlzeit_analyse"`.
- `src/app/mahlzeit/[id]/mahlzeit-detail.tsx` + `src/app/mahlzeit/[id]/page.tsx` (Historie) — `mealId`-Prop neu durchgereicht (Route-Param `id` war serverseitig schon vorhanden, wurde bisher nur nicht an die Komponente weitergegeben), `pageType="mahlzeit_historie"`.

**Gefundener und behobener Bug während der Live-Verifikation (Backend, hier erneut relevant):** Die anfängliche `POST /api/feedback`-Implementierung gab die neue ID über `.insert().select().single()` zurück, was unter RLS ohne SELECT-Policy fehlschlägt (siehe Implementation Notes Backend). Für das Frontend bedeutet das: die Antwort auf erfolgreiches Absenden liefert nur `{ success: true }`, keine ID — der Bestätigungs-Screen im Dialog braucht daher keine ID und zeigt nur die statische Erfolgsmeldung.

**Tests:** 8 neue E2E-Tests (`tests/PROJ-26-fehler-feedback-ki-ergebnisse.spec.ts`, Desktop + Mobile 375px = 20 Testläufe): Trigger-Sichtbarkeit, Dialog öffnen/schließen ohne zu speichern, Client-seitige Leer-Validierung (mit `page.route()`-Spy, der bestätigt, dass die API dabei gar nicht aufgerufen wird), sowie Auth-Sicherheit für alle vier Routen (`/api/feedback`, `/api/admin/feedback`, `/api/admin/feedback/[id]`, `/admin/feedback`). **Bewusst kein automatisierter Test des vollen Absende-Erfolgspfads** in der permanenten Suite — da Feedback-Einträge laut Spec nicht löschbar sind, würde ein wiederholt laufender Test bei jedem Durchlauf einen bleibenden Fake-Eintrag in der echten Admin-Übersicht hinterlassen. Stattdessen einmalig manuell live verifiziert (siehe unten) und per SQL wieder aufgeräumt.

**Live-Verifikation (Frontend):** Dialog-Öffnen, Absenden und Erfolgs-Bestätigung per Screenshot gegen den echten Dev-Server bestätigt (Rezept-Detailseite). Der resultierende DB-Eintrag enthielt exakt den erwarteten vollständigen Snapshot (Zutatenliste mit alle 13 Zutaten inkl. Mengen, alle 6 Bausteine mit Rating + Erklärung, Nährwerte) — danach gelöscht, Rate-Limit-Zähler des Testkontos zurückgesetzt. Admin-Auth-Schutz (`/admin/feedback` unauthenticated → `/login`, nicht-Admin → `/admin/403`) per echter Browser-Navigation verifiziert (curl ist für Next.js-RSC-Antworten dieser Version nicht zuverlässig auswertbar, siehe BUG-3-Kontext in PROJ-24). Admin-Ansicht selbst (Feedback-Liste inkl. aufklappbarem Snapshot, Erledigt-Button) **nicht** mit echtem Admin-Account durchgeklickt — gleiche Einschränkung wie in PROJ-24/PROJ-25 (kein Zugriff auf `ADMIN_EMAIL`-Passwort). Struktur und Logik per Code-Review verifiziert; das Rendering des Snapshots wurde gegen die tatsächlich in der DB gespeicherte Struktur geprüft (siehe oben), nicht nur gegen Annahmen.

**Verifikation:** `tsc --noEmit`, ESLint: fehlerfrei. Vitest: 224/224 grün (unverändert, keine neuen Unit-Tests nötig — reine UI-Komponenten ohne eigenständige, isoliert testbare Logik jenseits der E2E-Abdeckung). `npm run build`: erfolgreich. E2E-Regression `PROJ-24`/`PROJ-8`: 30/31 grün (einziger Fehlschlag: vorbestehendes, dokumentiertes BUG-3).

**Gefundener und behobener Bug nach Nutzer-Feedback ("Die Schaltfläche ist unsichtbar"):** `src/components/ui/dialog.tsx` — `DialogContent` hatte keine Höhenbegrenzung/Scroll-Verhalten. Auf einem ausreichend kurzen Viewport (z.B. Mobilgerät mit geöffneter Bildschirmtastatur, oder ein schmales Browser-Fenster) wurde der zentrierte Dialog oben UND unten über den sichtbaren Bereich hinaus gerendert — der "Absenden"-Button am Fußende des Formulars war dadurch fast vollständig abgeschnitten (nur ein 1–2px schmaler Rand blieb sichtbar). Per Playwright bei `375×200px` reproduziert und mit Screenshot bestätigt. **Root Cause betrifft die geteilte `Dialog`-Komponente, nicht nur PROJ-26** — alle 5 anderen Stellen im Projekt, die `DialogContent` nutzen (`admin-delete-button.tsx`, `invite-codes-table.tsx`, `mahlzeit-historie.tsx`, `konto-view.tsx`, sowie das Basis-`command.tsx`), waren strukturell für dasselbe Problem anfällig, sobald ihr Inhalt lang genug wird. **Fix:** `max-h-[90vh] overflow-y-auto` auf `DialogContent` ergänzt — der Dialog scrollt jetzt intern statt über den Viewport hinauszuwachsen. Betrifft ausschließlich Fälle, in denen der Dialog-Inhalt tatsächlich zu groß für den verfügbaren Platz ist; bei allen bisherigen, kürzeren Dialogen ändert sich optisch nichts. Nach dem Fix erneut bei `375×200px` verifiziert: Button jetzt per Scroll erreichbar und vollständig sichtbar (Screenshot bestätigt). Vollständige Regression (Vitest 224/224, `tsc`, ESLint, Build, E2E für PROJ-13/24/25/26) danach erneut grün — der einzige Fehlschlag (`PROJ-13-admin-dashboard.spec.ts`, "zeigt zwei Navigationskarten") wurde per `git stash` gegen den unveränderten Stand verifiziert als vorbestehend und unabhängig von dieser Änderung (Auth-Mock-Ansatz des Tests funktioniert in diesem Dev-Setup generell nicht zuverlässig, nicht Teil dieser Feature-Arbeit).

## QA Test Results

**Tested:** 2026-07-22
**App URL:** http://localhost:3000 (Dev-Server, echtes Supabase-Backend)
**Tester:** QA Engineer (AI)

### Testmethodik
1. **E2E-Tests (Playwright)** für Nutzer-Flow, Client-Validierung und alle Sicherheits-Grenzen: `tests/PROJ-26-fehler-feedback-ki-ergebnisse.spec.ts` (Desktop + Mobile 375px, 24 Tests)
2. **Live-Verifikation gegen den echten Dev-Server** für Vorgänge, die nicht permanent in der Regressions-Suite laufen dürfen (echtes Absenden, Rate-Limit, direkte RLS-Angriffsversuche) — jeweils per SQL wieder aufgeräumt
3. **Vollständiger Regressionslauf** der bestehenden PROJ-8/PROJ-24/PROJ-25-Suiten sowie der gesamten Vitest-Suite
4. **Code-Review** für Admin-Ansicht-Interaktion (kein Zugriff auf `ADMIN_EMAIL`-Passwort, gleiche dokumentierte Einschränkung wie PROJ-24/PROJ-25)

### Acceptance Criteria Status

#### Feedback abschicken (Nutzer)
- [x] "Feedback geben"-Link erscheint beim KI-Hinweis auf der Rezept-Detailseite — E2E-Test grün. Mahlzeit-Analyse/-Historie per Code-Review (identischer `FeedbackDialog`-Aufruf, kein separater Code-Pfad) — kein Testkonto mit vorhandener Mahlzeit-Analyse, echte Analyse hätte Claude-API-Kosten verursacht
- [x] Klick öffnet Dialog mit Freitextfeld + Absenden-Button — E2E-Test grün
- [x] Schließen ohne Eingabe speichert nichts — E2E-Test grün (Dialog per Escape geschlossen, kein API-Aufruf beobachtet)
- [x] Leeres Nachrichtenfeld → Validierungsfehler, nichts gespeichert — E2E-Test grün, zusätzlich mit `page.route()`-Spy verifiziert, dass die API dabei gar nicht aufgerufen wird
- [x] Vollständiger Analyse-Snapshot wird automatisch mitgeschickt — Live-Verifikation: DB-Eintrag nach echtem Absenden enthielt exakt die erwartete Struktur (Rezept-Kontext: alle 13 Zutaten mit Mengen, alle 6 Bausteine mit Rating + Erklärung, Nährwerte pro Portion)
- [x] Erfolgreiches Absenden zeigt Bestätigung, Dialog schließt sich danach manuell — Live-Verifikation per Screenshot bestätigt ("Danke, wir schauen uns das an!" + Schließen-Button)
- [x] API nicht erreichbar → Fehlermeldung, Eingabe bleibt erhalten — Code-Review (`catch`-Block setzt Fehlertext, `message`-State wird nicht zurückgesetzt bei Fehlern)
- [x] Tageslimit (5/Tag) → Meldung, nichts gespeichert — Live-Verifikation: 5× `POST /api/feedback` → 201, 6. Versuch → 429, danach zurückgesetzt

#### Feedback einsehen (Admin)
- [x] Admin-Übersicht zeigt alle Einträge, offene vor erledigten, neueste zuerst — Code-Review (Sortierung `resolved ASC, created_at DESC` in `page.tsx` und der zugrundeliegenden `GET`-Route identisch)
- [x] Eintrag zeigt Nachricht, Zeitpunkt, Seitentyp, Link zum Original, vollständigen Snapshot — Code-Review + der tatsächlich in der DB gespeicherte Snapshot (siehe oben) wurde gegen den generischen `SnapshotDetails`-Renderer geprüft, passt strukturell (`vorher`/`nachher`/`matrix`/`zutatenliste`/`naehrwerte`/`vorschlaege` werden alle erkannt)
- [x] "Erledigt"-Button markiert Eintrag, visuell abgesetzt — Code-Review (`PATCH`-Aufruf + optimistisches Re-Sortieren, `opacity-50` auf erledigte Einträge)
- [x] Zugriff ohne Admin-Rechte verweigert — E2E-Test grün für alle 4 betroffenen Routen (`/admin/feedback`, `GET`/`PATCH /api/admin/feedback*`)

**12/12 Acceptance Criteria erfüllt** (4 davon per Code-Review statt Live-Klick in der Admin-UI selbst — dokumentierte, nicht-blockierende Einschränkung, siehe BUG-5)

### Edge Cases Status
- [x] Feedback zu gelöschter Mahlzeit/Rezept bleibt erhalten, Link läuft ins Leere — Code-Review: `reference_id` hat bewusst keine FK, `feedback-list.tsx` zeigt "Original nicht mehr vorhanden" wenn `referenceHref()` `null` liefert (Function selbst kann das aktuell nicht auslösen, da `reference_id` bei jedem Insert gesetzt wird — der Fallback greift nur, wenn `reference_id` selbst `null` ist, nicht bei einem inhaltlich toten Link; siehe BUG-6)
- [x] Snapshot bleibt beim späteren Bearbeiten des Rezepts unverändert (Momentaufnahme) — strukturell garantiert, da der Snapshot beim Absenden 1:1 kopiert und nie nachträglich aktualisiert wird
- [x] Gast-Session: Feedback bleibt nach Session-Ende gespeichert — strukturell garantiert (Insert ist nicht an eine laufende Session gebunden, `user_id` bleibt die feste Anonymous-Auth-ID)
- [x] Feedback-Dialog kann auf Beilagen-/Grundlagen-Rezept nicht vorkommen — bestätigt: kein `FeedbackDialog` im `recipeTyp`-Zweig von `rezept/[id]/page.tsx`
- [x] Nachricht > 500 Zeichen → serverseitig abgelehnt — durch bestehenden Vitest-Test (`route.test.ts`) abgedeckt, zusätzlich `maxLength={500}` client-seitig auf dem `Textarea`
- [x] Zwei Meldungen zum selben Ziel → beide gespeichert, keine Deduplizierung — strukturell garantiert (kein Unique-Constraint, kein Dedup-Code)
- [x] Mahlzeit ohne Verbesserungsvorschläge → leere Liste im Snapshot, kein Fehlerzustand — Code-Review (`vorschlaege` ist immer ein Array, auch leer; `SnapshotDetails` rendert den Abschnitt einfach nicht, wenn leer)

### Security Audit Results
- [x] **RLS — direkter REST-Zugriff (nicht nur über die eigene API):** `SELECT` auf `feedback` mit echtem, gültigem Nutzer-Token liefert `200` mit leerem Array — **kein Nutzer sieht irgendein Feedback, auch nicht sein eigenes**. Per E2E-Test gegen die echte Supabase-REST-API verifiziert (nicht nur gemockt)
- [x] **Identitäts-Spoofing:** Versuch, Feedback mit fremder `user_id` einzufügen, direkt gegen die REST-API → `403` (RLS-Violation). Per E2E-Test verifiziert
- [x] **XSS:** Kein `dangerouslySetInnerHTML` in irgendeiner neuen Datei (Formular, Admin-Liste, Snapshot-Renderer) — Nachricht und alle Snapshot-Felder laufen ausschließlich durch normales React-Rendering (automatisches Escaping)
- [x] **Rate-Limiting:** 5/Tag pro Nutzer, atomar über Postgres-Funktion (kein Race-Condition-Fenster wie bei einem Read-then-Write-Ansatz in Anwendungscode) — live mit 6 aufeinanderfolgenden Requests verifiziert
- [x] **Admin-Auth:** Alle 4 betroffenen Routen 401 (nicht eingeloggt) / 403 (kein Admin) — E2E-Test verifiziert
- [x] **Massen-Payload-Schutz:** Snapshot auf 20 KB serialisierte Größe begrenzt (Zod `.refine()`) — verhindert künstlich aufgeblähte Payloads als DB-Bloat-Vektor

### Bugs Found

#### BUG-5: Admin-Interaktion (Erledigt-Button, Snapshot-Aufklapper) nicht live durchgeklickt
- **Severity:** Low
- **Beschreibung:** Analog zu BUG-2/BUG-4 aus PROJ-24/PROJ-25 — kein Zugriff auf den echten `ADMIN_EMAIL`-Account. Struktur und Logik per Code-Review verifiziert, der tatsächlich gespeicherte Snapshot wurde gegen den Renderer geprüft (siehe oben), aber der Klick-Pfad selbst (Aufklappen, Erledigt-Button, Sortier-Verhalten in einer echten Browser-Session) ist ungetestet.
- **Priority:** Nice to have — vor dem produktiven Rollout einmal manuell gegenprüfen, blockiert Deployment nicht (Admin-Bereich ist Single-User/Solo-Entwickler-Tool)

#### BUG-6: "Original nicht mehr vorhanden"-Hinweis in der Admin-Liste kann aktuell nie auftreten
- **Severity:** Low
- **Beschreibung:** `feedback-list.tsx` zeigt "Original nicht mehr vorhanden", wenn `referenceHref()` `null` zurückgibt — das passiert aber nur, wenn `reference_id` selbst `null`/leer ist. In der Praxis wird `reference_id` bei jedem Insert immer gesetzt (Pflichtfeld im Zod-Schema), und selbst wenn die referenzierte Mahlzeit/das Rezept später gelöscht wird, bleibt `reference_id` unverändert gesetzt — der generierte Link (`/mahlzeit/{id}` bzw. `/rezept/{id}`) wird dann einfach zu einer 404-Seite führen, statt dass die Admin-Liste das vorab erkennt und den freundlicheren Hinweis zeigt. Der Edge Case aus der Spec ("Link läuft ins Leere") ist damit funktional abgedeckt (kein Absturz, nur eine normale 404), aber nicht mit der ursprünglich vorgesehenen freundlichen Meldung.
- **Priority:** Nice to have — würde einen zusätzlichen Existenz-Check (Join gegen `meals`/`recipes` beim Laden der Admin-Liste) brauchen, um sauber zu lösen; kein Datenverlust oder Sicherheitsproblem, rein kosmetisch

### Regressionstest
- Vollständige Vitest-Suite: **224/224 grün**
- `tsc --noEmit` und ESLint: fehlerfrei über alle geänderten/neuen Dateien
- `npm run build`: erfolgreich
- E2E `tests/PROJ-26-fehler-feedback-ki-ergebnisse.spec.ts` (Desktop + Mobile 375px): **24/24 grün**
- E2E-Regression `PROJ-8`/`PROJ-24`/`PROJ-25` (Desktop + Mobile): 60/62 grün — die 2 Fehlschläge sind beide dasselbe vorbestehende, dokumentierte BUG-3 (404-Status), keine neue Regression
- Zusätzlich gefundener und bereits behobener Bug während der Frontend-Phase (Dialog-Höhenbegrenzung, betraf die geteilte `Dialog`-Komponente) — siehe Implementation Notes, wurde vor diesem QA-Durchlauf bereits gefixt und hier erneut mitgetestet (in den 24 E2E-Tests enthalten)

### Summary
- **Acceptance Criteria:** 12/12 passed (4 mit dokumentierter, nicht-blockierender Einschränkung)
- **Bugs Found:** 2 total (0 Critical, 0 High, 0 Medium, 2 Low)
- **Security:** Pass — RLS direkt gegen die REST-API verifiziert (nicht nur über die eigene Route), Identitäts-Spoofing blockiert, kein XSS-Vektor, Rate-Limiting atomar und funktional bestätigt
- **Production Ready:** YES
- **Recommendation:** Deploy. BUG-5 (Admin-UI einmal manuell gegenprüfen) und BUG-6 (kosmetischer Edge Case in der Admin-Liste) als Nice-to-have nachverfolgen, beide nicht blockierend.

## Deployment

**Deployed:** 2026-07-22
**Tag:** v1.24.0-PROJ-26
**Production URL:** https://app.mehralsabnehmen.de
**Commit:** `88bbdc2` (deploy(PROJ-26): Deploy Fehler-Feedback zu KI-Ergebnissen), vorausgehend `4d8fe32` (PROJ-25 Wortlaut-Fix)

**Pre-Deployment-Checks:**
- `npm run build` — erfolgreich
- `npm run lint` — 0 Fehler (1 vorbestehende, unabhängige Warnung in `bild-cropper.tsx`)
- QA: Approved, 0 Critical/High Bugs (2 Low, nicht blockierend)
- DB-Migration (`create_feedback_table_and_rate_limit`) bereits vor `/frontend` live auf dem Produktions-Supabase-Projekt angewendet (Dev und Prod teilen sich dasselbe Supabase-Projekt)
- Keine neuen Env-Vars nötig (nutzt bestehende `SUPABASE_SERVICE_ROLE_KEY`/`ADMIN_EMAIL`)
- Keine neuen Dependencies (`package.json` unverändert im Diff)
- Keine Secrets im Diff

**Post-Deployment-Verifikation:**
- Per eingeloggter Playwright-Session gegen Production verifiziert (curl allein reicht bei den auth-geschützten Routen nicht, siehe PROJ-24/25-Erfahrung):
  - `/rezept/fe8e05ab-af68-4e61-b8fd-6ead79b5e4e3` zeigt den "Feedback geben"-Link
  - `/admin/feedback` leitet den Nicht-Admin-Testaccount korrekt zu `/admin/403` um

**Kein neues Setup nötig.**
