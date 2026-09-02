# PROJ-45: Wochen-Check-In

## Status: In Progress
**Created:** 2026-09-02
**Last Updated:** 2026-09-02

## Dependencies
- PROJ-2 (User Authentication) — Persistenz nur für eingeloggte, nicht-anonyme Nutzer
- PROJ-19 (Gast-Modus) — bestimmt das zustandslose Verhalten für Gäste
- PROJ-35 (Bottom-Navigation & Kontobereich-Neuordnung) — `/check-in` existiert bereits als Nav-Tab und Platzhalterseite, wird hier (teilweise) mit echtem Inhalt befüllt
- PROJ-17 (Wöchentlicher Sättigungs-Recap) — wiederverwendetes Wochen-Grenzen-Muster (Sonntag–Samstag)
- PROJ-42 (Analyse-Übersichtsseite) — der "Check-Ins"-Tab wurde dort strukturell für genau diese Daten vorbereitet; die tatsächliche Anzeige dort ist ein späteres Refinement, nicht Teil dieser Spec

## User Stories
- Als Nutzer möchte ich mir einmal pro Woche 10 Minuten Zeit nehmen, um über die letzte Woche zu reflektieren, damit ich Fortschritt über die Zeit besser wahrnehme.
- Als eingeloggter Nutzer möchte ich meinen Wochen-Check-In speichern und bei Bedarf noch einmal bearbeiten können, falls ich etwas ergänzen möchte.
- Als eingeloggter Nutzer möchte ich meine letzten paar Check-Ins schnell einsehen und bei Bedarf nachträglich korrigieren können.
- Als Gast möchte ich den Check-In trotzdem ausfüllen können, auch wenn ich weiß, dass nichts gespeichert wird.
- Als Nutzer, der sich unsicher ist, ob er mit dem Tracking aufhören kann, möchte ich beim entsprechenden Slider eine konkrete Einschätzung bekommen, wann der richtige Zeitpunkt dafür ist.

## Out of Scope
- Große Auswertung/Verlauf über alle Check-Ins hinweg (Grafiken, Trends über Wochen) — das ist der bereits in PROJ-42 vorbereitete "Check-Ins"-Tab, folgt als eigenes späteres Refinement.
- Die "Gewohnheiten"-Sektion der künftigen `/check-in`-Seite — eigenes Feature PROJ-46, folgt danach.
- Erinnerungen/Benachrichtigungen, den Check-In wöchentlich auszufüllen — kein Push/E-Mail-Reminder in dieser Version.
- Zugriff auf Einträge älter als die letzten 5 (kein vollständiger, durchsuchbarer Verlauf — nur die Mini-Historie).
- Validierung/Plausibilitätsprüfung der Textfeld-Inhalte — reine Freitextfelder.
- Löschen von Einträgen — nur Anlegen und Bearbeiten.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur
- [ ] Angenommen die Wochen-Check-In-Sektion lädt, wenn sie angezeigt wird, dann zeigt sie die Überschrift "Deine Erfolgskontrolle" und den vorgegebenen Intro-Text
- [ ] Angenommen die Sektion lädt, wenn die Felder angezeigt werden, dann erscheinen alle 12 Fragen in der vorgegebenen Reihenfolge (siehe Content-Sektion)

### Formular-Felder
- [ ] Angenommen die Sektion lädt, wenn die 5 Textfragen (Highlights, Lowlights, Lowlights-Ursache, "nächste Woche anders", "Sonst noch was") angezeigt werden, dann sind sie leere, mehrzeilige Freitextfelder ohne Formatvorgabe
- [ ] Angenommen die Sektion lädt, wenn die 6 Slider-Fragen (Schlaf, Screentime, Energielevel, Ernährungs-Achtsamkeit, "bewusst essen", "Sicherheit ohne Tracking") angezeigt werden, dann zeigen sie einen Regler mit den vorgegebenen Endpunkt-/Zwischen-Beschriftungen
- [ ] Angenommen die Sektion lädt, wenn die Trainings-Frage angezeigt wird, dann erscheinen 4 auswählbare Optionen (0/1/2/3 Mal)

### Bedingte Elemente
- [ ] Angenommen der Nutzer stellt den "Sicherheit ohne Tracking"-Slider auf 5 oder höher, wenn der Wert geändert wird, dann erscheint der Hinweistext "Dann tracke an normalen Arbeitstagen nicht — deine Routine sitzt schon."; bei einem Wert unter 5 ist er nicht sichtbar
- [ ] Angenommen der Nutzer wählt bei der Trainings-Frage 1, 2 oder 3, wenn er das tut, dann erscheint der jeweilige Feedback-Text ("Super!" / "WOW — richtig gut!" / "Dein Körper ist dir wichtig — toll!")
- [ ] Angenommen der Nutzer wählt bei der Trainings-Frage 0, wenn er das tut, dann erscheint zusätzlich ein Textfeld "Woran hat es gelegen? Wie stellst du sicher, dass es nächstes Mal klappt?"

### Speichern & Bearbeiten (eingeloggte Nutzer)
- [ ] Angenommen ein eingeloggter, nicht-anonymer Nutzer hat für die aktuelle Kalenderwoche noch keinen Eintrag, wenn er die Seite öffnet, dann ist das Formular leer
- [ ] Angenommen ein eingeloggter Nutzer hat für die aktuelle Kalenderwoche bereits einen Eintrag gespeichert, wenn er die Seite öffnet, dann ist das Formular mit diesem Eintrag vorausgefüllt
- [ ] Angenommen noch kein Eintrag für die aktuelle Woche existiert, wenn der Nutzer auf "Speichern" klickt, dann wird ein neuer Eintrag für die aktuelle Woche angelegt
- [ ] Angenommen bereits ein geladener Eintrag wird bearbeitet (aktuelle Woche oder aus der Historie geladen), wenn der Nutzer auf "Speichern" klickt, dann wird dieser Eintrag aktualisiert, es wird kein neuer Eintrag angelegt
- [ ] Angenommen der Speichervorgang schlägt fehl (z. B. Netzwerkfehler), wenn der Nutzer auf "Speichern" klickt, dann erscheint eine Fehlermeldung und die eingegebenen Werte bleiben in den Feldern erhalten

### Mini-Historie (eingeloggte Nutzer)
- [ ] Angenommen ein eingeloggter Nutzer hat mindestens einen gespeicherten Check-In, wenn die Seite lädt, dann erscheint eine ausklappbare Historie mit den letzten 5 Einträgen nach Datum
- [ ] Angenommen ein eingeloggter Nutzer klickt in der Historie auf einen Eintrag, wenn er das tut, dann wird dieser Eintrag ins Formular geladen und ist danach der Ziel-Eintrag für "Speichern"
- [ ] Angenommen ein eingeloggter Nutzer hat noch keinen gespeicherten Check-In, wenn die Seite lädt, dann erscheint keine Historie bzw. ein freundlicher Leer-Hinweis

### Gast-Verhalten
- [ ] Angenommen ein Gast (kein Login) besucht die Sektion, wenn die Seite lädt, dann kann er alle Felder genauso ausfüllen wie ein eingeloggter Nutzer
- [ ] Angenommen ein Gast besucht die Sektion, wenn sie angezeigt wird, dann erscheint statt eines Speichern-Buttons der Hinweistext: "Eingetragene Werte werden nicht gespeichert. Bei Neuladen der Seite sind die eingetragenen Daten weg. Kopiere diese Seite in deine Notizen App oder schreib dir die Fragen in dein Notizbuch auf."
- [ ] Angenommen ein Gast lädt die Seite neu, wenn er zurückkehrt, dann sind alle Felder wieder leer

## Edge Cases
- Nutzer öffnet die Seite exakt an einem Wochenwechsel (z. B. Sonntag 00:00): welche "Woche" gilt, wird serverseitig beim Laden bestimmt — kein Live-Update, wenn die Seite über den Wechsel hinweg offen bleibt (konsistent mit dem bestehenden Wochen-Recap-Verhalten aus PROJ-17).
- Nutzer bearbeitet einen alten Eintrag aus der Historie, möchte danach aber zur aktuellen Woche zurück: kein expliziter "Zurück zur aktuellen Woche"-Button in dieser Version — ein Reload der Seite bringt ihn zur aktuellen Woche zurück.
- Nutzer lässt alle Felder leer und speichert trotzdem: wird als leerer/fast-leerer Eintrag gespeichert, keine Pflichtfelder.
- Anonyme Gast-Session: verhält sich wie Gast, kein Speichern (konsistent mit `user.is_anonymous`).
- Nutzer wählt bei der Trainings-Frage einen Wert, ändert ihn dann erneut: nur der zuletzt gewählte Wert zählt, vorherige Feedback-Texte/Zusatzfelder verschwinden entsprechend.

## Technical Requirements (optional)
- Neue Datenbank-Tabelle für Wochen-Check-Ins: ein Eintrag pro Kalenderwoche pro Nutzer, alle Antworten gebündelt — genaue Struktur bei `/architecture`
- Neue API-Route(n) zum Speichern (Insert bei neuer Woche, Update bei bestehendem/geladenem Eintrag) sowie zum Abrufen der letzten 5 Einträge — Details bei `/architecture`
- RLS: Nutzer sehen/speichern/bearbeiten ausschließlich eigene Check-Ins
- Wochen-Grenzen (Sonntag–Samstag): bestehende Logik aus PROJ-17 (`getWeekStartIso`) wiederverwenden statt neu zu implementieren
- Neue shadcn/ui-Komponente "Slider" muss installiert werden (`npx shadcn@latest add slider`) — aktuell nicht im Projekt vorhanden

## Content: Finaler Wortlaut

**H1:** "Deine Erfolgskontrolle"

**Intro-Text:**
"Wir Menschen tun uns schwer, Fortschritt über einen langen Zeitraum zu sehen. Deshalb lohnt es sich, dir von Woche zu Woche 10 Minuten Zeit zu nehmen: Was war letzte Woche los? Wie soll es nächste Woche weitergehen? Investier diese 10 Minuten in dich."

**Fragen (in dieser Reihenfolge):**
1. Highlights der letzten Woche — Textfeld
2. Lowlights der letzten Woche — Textfeld
3. "Wie könntest du weniger Lowlights haben? Woran hat es konkret gelegen?" — Textfeld
4. "Das mache ich nächste Woche anders" — Textfeld
5. "Wie war dein Schlaf letzte Woche?" — Slider 1–10, Labels "1 Schlecht" / "10 Sehr erholsam"
6. "Wie war deine Screentime letzte Woche?" — Slider 0–10, Labels "0 Min" / ">10 Std."
7. "Wie war dein Energielevel?" — Slider 0–10, Labels "0 Krank" / "10 Bäume ausreißen"
8. "Wie sehr hast du auf deine Ernährung geachtet?" — Slider 0–10, Labels "0 Gar nicht" / "10 Alles getrackt"
9. "Wie schwer war es für dich, bewusst zu essen?" — Slider 0–10, Labels "0 Sehr schwer" / "5 Immer mal wieder" / "10 Total einfach"
10. "Wie sicher fühlst du dich, wenn du nächste Woche nicht mehr trackst?" — Slider 0–10, Labels "0 Unsicher" / "5 Könnte klappen" / "10 Bin bereit". Ab Wert 5: Zusatz-Hinweis "Dann tracke an normalen Arbeitstagen nicht — deine Routine sitzt schon."
11. "Hast du dein Training machen können?" — 4 Optionen (0/1/2/3 Mal). Feedback: 1 → "Super!", 2 → "WOW — richtig gut!", 3 → "Dein Körper ist dir wichtig — toll!". Bei 0 zusätzlich Textfeld: "Woran hat es gelegen? Wie stellst du sicher, dass es nächstes Mal klappt?"
12. "Etwas vergessen? Was war sonst noch wichtig?" — Textfeld

**Gast-Hinweistext:**
"Eingetragene Werte werden nicht gespeichert. Bei Neuladen der Seite sind die eingetragenen Daten weg. Kopiere diese Seite in deine Notizen App oder schreib dir die Fragen in dein Notizbuch auf."

## Open Questions
- [ ] Exakte Darstellung der Mini-Historie (Liste, Karten, Datumsformat) — wird bei `/frontend` entschieden
- [ ] Exaktes Datenmodell (einzelne Spalten vs. gebündeltes JSON-Feld für alle Antworten) — wird bei `/architecture` entschieden

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Genau ein Eintrag pro Kalenderwoche (Upsert) statt beliebig vieler Einträge pro Woche | Nutzerwunsch: verhindert Duplikate, entspricht dem wöchentlichen Ritual-Charakter des Check-Ins | 2026-09-02 |
| Bearbeiten vergangener Einträge über eine Mini-Historie (letzte 5) ermöglicht, nicht nur Anlegen neuer Einträge | Nutzerwunsch: nachträgliche Korrektur/Ergänzung soll möglich sein — bewusste Abweichung vom Nur-Anlegen-Muster aus PROJ-44 | 2026-09-02 |
| Große Auswertung/Verlauf über die Zeit bewusst nicht Teil dieser Spec | Gehört zum bereits in PROJ-42 vorbereiteten "Check-Ins"-Tab, eigenes späteres Refinement | 2026-09-02 |
| Trainings-Frage als 4 wählbare Buttons/Chips statt Slider | Nur 4 diskrete Werte mit je eigenem Feedback-Text, ein stufenloser Regler würde das nicht sauber abbilden | 2026-09-02 |
| Bedingter Hinweis ab Sicherheits-Slider-Wert 5 | Direkte Nutzervorgabe, hilft bei der Entscheidung, wann Tracking reduziert werden kann | 2026-09-02 |
| Playful Slider-Label "Bäume ausreißen" beibehalten (nur Tippfehler korrigiert) | Passt zum bereits etablierten, lockeren Ton der App (vgl. "das Ego bleibt in der Umkleide" aus PROJ-43) | 2026-09-02 |
| Gast-Hinweistext 1:1 vom Nutzer übernommen | Explizit vorgegebener Wortlaut | 2026-09-02 |
| "Gewohnheiten"-Sektion der `/check-in`-Seite als eigenes Feature (PROJ-46) gesplittet | Unterschiedliches Datenmodell (wöchentlicher Eintrag vs. tägliche Checkliste) — analog zum Hub/Detail-Split bei Training | 2026-09-02 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine Woche = ein Datensatz, technisch über eine Unique-Constraint (Nutzer + Wochenstart) erzwungen, nicht nur Konvention | Verhindert zuverlässig Duplikate; Speichern und Bearbeiten werden dadurch zum selben Upsert-Vorgang, kein Unterschied im Code zwischen "neu" und "aktualisieren" | 2026-09-02 |
| Alle 12 Antworten gebündelt in einem JSON-Datenblock statt 12 einzelnen Spalten | Fragen sind fest vorgegeben, werden nie einzeln abgefragt — gebündelt einfacher zu pflegen, gleiches Muster wie bei den Trainingseinheiten (PROJ-44) | 2026-09-02 |
| Wochen-Grenzen-Berechnung (`getWeekStartIso`) aus der PROJ-17-Route in eine gemeinsame Datei ausgelagert | Wird jetzt von PROJ-17 UND PROJ-45 gebraucht, war bisher nur lokal in `/api/recap/wochen/route.ts` definiert — vermeidet Duplizierung | 2026-09-02 |
| Laden der aktuellen Woche und der letzten 5 Einträge passiert direkt in der Seite selbst (Server-Component-Query), keine eigene Lese-Route | Gleiches Muster wie bei der Analyse-Übersicht (PROJ-42) und den Trainingsplänen (PROJ-44) | 2026-09-02 |
| Neue shadcn/ui-Komponente "Slider" installieren | Offizieller, Radix-basierter Baustein, bisher nicht im Projekt vorhanden, für 6 der 12 Fragen benötigt | 2026-09-02 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

```
/check-in (bestehende Platzhalterseite — PROJ-45 baut die erste Sektion)
├── H1 "Deine Erfolgskontrolle" + Intro-Text
├── Formular (12 Fragen)
│   ├── 5 Freitextfelder
│   ├── 6 Slider (einer davon mit bedingtem Hinweistext ab Wert 5)
│   └── 1 Auswahl-Frage (4 Optionen + bedingtes Textfeld bei "0")
├── Mini-Historie (ausklappbar, letzte 5 Einträge nach Datum, anklickbar zum Laden/Bearbeiten)
├── Gäste: Hinweistext statt Speichern-Button
└── Eingeloggt: "Speichern"-Button
```

### B) Datenmodell (in Worten)

**Eine neue Tabelle "Wochen-Check-Ins":** genau EIN Eintrag pro Nutzer pro Kalenderwoche (technisch erzwungen, nicht nur per Konvention).
- Wer (Nutzer)
- Welche Woche (Wochenstart-Datum, Sonntag — dieselbe Berechnung wie beim bestehenden Wochen-Rückblick)
- Alle 12 Antworten gebündelt in einem Datensatz
- Wann zuletzt gespeichert

Speichern läuft immer über denselben Mechanismus: "leg diesen Eintrag für diese Woche an, oder überschreibe ihn, falls es ihn schon gibt" — dadurch ist "neuer Eintrag" und "bestehenden bearbeiten" technisch derselbe Vorgang.

### C) Tech-Entscheidungen (Begründung)

1. **Eine Woche = ein Datensatz, technisch erzwungen** — verhindert zuverlässig Duplikate, macht Speichern und Bearbeiten zum selben einfachen Vorgang.
2. **Alle 12 Antworten gebündelt** statt 12 einzelnen Spalten — die Fragen sind fest vorgegeben, gebündelt ist einfacher zu pflegen.
3. **Wochen-Grenzen-Berechnung aus PROJ-17 wird ausgelagert**, statt sie zu duplizieren.
4. **Laden der aktuellen Woche und der Historie passiert direkt in der Seite selbst**, keine eigene Lese-Route.
5. **Neue shadcn/ui-Komponente "Slider"** muss installiert werden.

### D) Abhängigkeiten (Pakete)
Ein neues shadcn/ui-Paket: `slider` (offizielle Radix-basierte Komponente, wie alle anderen UI-Bausteine im Projekt).

## Implementation Notes (Frontend)

**Gebaut:**
- `src/lib/wochen-grenzen.ts`: `getWeekStartIso` aus `src/app/api/recap/wochen/route.ts` ausgelagert (Technical Decision aus der Architektur), beide Nutzstellen (Route + zugehöriger Test) umgestellt, `npm test` bestätigt unverändertes Verhalten (323 Tests grün vor dem restlichen Frontend-Build).
- shadcn/ui-Komponente `slider` installiert (`npm exec shadcn@latest -- add slider --yes` — `npx` ist in dieser Umgebung defekt, siehe bekannte Workaround-Notiz).
- `src/components/wochen-check-in-form.tsx`: alle 12 Fragen als reiner lokaler Component-State (`useState`), exakter Wortlaut aus der Content-Sektion übernommen.
  - 5 Freitextfelder (Textarea, mehrzeilig, kein Format-Constraint)
  - 6 Slider (Radix-basiert) mit Endpunkt-/Zwischen-Beschriftungen; Sicherheits-Slider zeigt den Hinweistext automatisch ab Wert 5
  - Trainings-Frage als 4 auswählbare Chips (0–3), mit passendem Feedback-Text bei 1–3 und zusätzlichem Textfeld bei 0
- `src/app/check-in/page.tsx`: Platzhalter durch `WochenCheckInForm` ersetzt (Header/Nav-Struktur unverändert).

**Bewusst NICHT gebaut (verschoben auf `/backend`, gleiches Muster wie PROJ-42/PROJ-44):**
- „Speichern"-Button und der komplette Upsert-Mechanismus (neuer Eintrag vs. Update)
- Vorbefüllung mit dem bestehenden Eintrag der aktuellen Woche
- Mini-Historie (letzte 5 Einträge, ausklappbar, anklickbar zum Laden)
- Gast- vs. eingeloggt-Unterscheidung inkl. Gast-Hinweistext (hängt von der Session ab, die serverseitig ermittelt wird)

**Verifiziert:** `npm run build`, `npm run lint` (0 Fehler, 1 vorbestehende, unabhängige Warnung), `npm test` (430/430 grün). Visuell per Playwright-Screenshot auf Desktop und Mobile (375px, kein horizontales Scrollen) geprüft: alle Slider, der bedingte Hinweistext ab Wert 5, die Trainings-Chips mit Feedback-Text und das bedingte Textfeld bei „0x" funktionieren wie spezifiziert.

## Implementation Notes (Backend)

**Migration (manuell im Supabase SQL Editor auszuführen — MCP-Zugriff diese Session getrennt):**
```sql
CREATE TABLE wochen_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  woche_start DATE NOT NULL,
  antworten JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, woche_start)
);

ALTER TABLE wochen_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own wochen check-ins" ON wochen_check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own wochen check-ins" ON wochen_check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own wochen check-ins" ON wochen_check_ins
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_wochen_check_ins_user_woche ON wochen_check_ins(user_id, woche_start DESC);
```
Keine DELETE-Policy — laut Spec werden Einträge nie gelöscht, nur angelegt/bearbeitet (siehe Out of Scope). Die Unique-Constraint auf `(user_id, woche_start)` ist der technische Upsert-Mechanismus: „neuer Eintrag" und „bestehenden bearbeiten" sind serverseitig derselbe Vorgang, nie ein Unterschied im Code.

**Gebaut:**
- Neu: `POST /api/check-in/wochen` (`src/app/api/check-in/wochen/route.ts`) — Auth-Check (401 ohne Session, 403 für anonyme Gast-Sessions), Zod-Validierung aller 12 Antworten (Freitextfelder auf 2000 Zeichen begrenzt, Slider-Werte auf ihren jeweiligen Wertebereich, Trainings-Frage 0–3 oder `null`). Der Client schickt immer den Ziel-Wochenstart mit (aktuelle Woche oder eine aus der Mini-Historie geladene Woche) — die Route validiert serverseitig, dass dieser Wochenstart exakt auf einen Sonntag fällt (`getWeekStartIso`-Normalisierung) und nicht in der Zukunft liegt, bevor sie per Service-Role-Client upserted (`onConflict: 'user_id,woche_start'`). Diese serverseitige Erzwingung folgt der bestehenden Projekt-Erkenntnis, dass reine Prompt-/Client-Hinweise nicht für Dateintegrität ausreichen.
- `src/app/check-in/page.tsx` ist jetzt eine async Server-Component: liest Session, lädt bei eingeloggten Nutzern die letzten 5 Check-Ins direkt per Supabase-Query (kein eigener Lese-Endpoint, wie in der Architektur festgelegt) und übergibt sie ans Formular. Fehler (z. B. Tabelle existiert noch nicht) werden ignoriert — Formular fällt dann auf leer zurück.
- `src/components/wochen-check-in-form.tsx` erweitert:
  - Vorausfüllung mit dem Eintrag der aktuellen Woche, falls vorhanden.
  - „Speichern"-Button für eingeloggte, nicht-anonyme Nutzer mit Erfolgs-/Fehlerbehandlung (Werte bleiben bei Fehler erhalten).
  - Mini-Historie: ausklappbare Liste der letzten 5 Einträge (Datum + „vor X Tagen aktualisiert"), Klick auf einen Eintrag lädt ihn ins Formular und wird zum neuen Speichern-Ziel; freundlicher Leer-Hinweis, wenn noch kein Eintrag existiert.
  - Zusätzlich zur Spec (Nutzerwunsch beim `/backend`-Kickoff): kleiner Hinweis-Chip über dem Formular zeigt „Aktuelle Woche" oder „Vergangene Woche" plus Datumsspanne, sowie „vor X Tagen aktualisiert" bei einem bereits gespeicherten Eintrag — funktioniert unabhängig vom Wochentag.
  - Gast-Hinweistext (1:1 Wortlaut aus der Spec) ersetzt den Speichern-Button für Gäste — bewusst kein Login-Vorschlag wie bei `LoginHinweis`, Gäste füllen die Felder weiterhin vollständig aus.
- `src/types/database.ts`: `wochen_check_ins`-Tabelle (Row/Insert/Update) ergänzt.
- Integrationstest: `src/app/api/check-in/wochen/route.test.ts` — 401 / 403 / 400 (fehlerhafter Body, Wochenstart nicht Sonntag-ausgerichtet, Wochenstart in der Zukunft) / 500 / Erfolgsfall aktuelle Woche / Erfolgsfall vergangene Woche aus der Historie, 8 neue Tests.
- `npm run build`, `npm run lint`, `npm test` (438/438) fehlerfrei. Live per Playwright verifiziert (noch vor Migration): Gast sieht alle Felder voll nutzbar, Hinweistext statt Speichern-Button, keine Mini-Historie.
- **Noch offen:** Live-Verifikation des kompletten Speichern-/Vorausfüll-/Mini-Historie-Zyklus für eingeloggte Nutzer steht aus, bis die Migration ausgeführt ist.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
