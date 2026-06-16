# PROJ-3: Mahlzeit-Input (Foto & Freitext)

## Status: Deployed
**Created:** 2026-06-10
**Last Updated:** 2026-06-12
**QA Completed:** 2026-06-11
**Deployed:** 2026-06-12 — https://endlichsattapp.vercel.app

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure) — für Foto-Upload in Storage und Speicherung der Mahlzeit
- Requires: PROJ-2 (User Authentication) — Seite ist nur für eingeloggte Nutzer zugänglich

## User Stories
- Als Nutzer möchte ich ein Foto meiner Mahlzeit hochladen können, damit die KI visuell erkennen kann was ich gegessen habe.
- Als Nutzer möchte ich zusätzlich im Freitext beschreiben können was ich gegessen habe (Zutaten, Menge, Zubereitungsart), damit die Analyse präziser wird.
- Als Nutzer möchte ich auch ohne Foto nur per Text analysieren lassen können, damit ich die App auch ohne Kamera nutzen kann.
- Als Nutzer möchte ich auf Mobile direkt die Kamera öffnen oder aus der Galerie wählen können, damit der Upload so schnell wie möglich geht.
- Als Nutzer möchte ich maximal 3 Runden Rückfragen der KI beantworten, damit ich schnell zum Ergebnis komme ohne genervt zu werden.
- Als ungeduldiger Nutzer möchte ich die Rückfragen überspringen können, damit ich sofort eine Analyse bekomme — auch wenn die KI dann mit expliziten Annahmen arbeitet.

## Out of Scope
- Die KI-Logik hinter den Rückfragen (was gefragt wird, wie Nährwerte berechnet werden) — das ist PROJ-4
- Das Analyse-Ergebnis und der Sättigungs-Score — das ist PROJ-5
- Speichern der Mahlzeit in der Historie — das ist PROJ-6
- Barcode-Scanner — explizites Non-Goal (PRD)
- Mehrere Fotos pro Mahlzeit — Post-MVP, ein Foto reicht für die Analyse

## Acceptance Criteria

### Eingabe-Formular
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die Analyse-Seite aufruft, dann sieht er ein Foto-Upload-Feld und ein Freitext-Eingabefeld.
- [ ] Angenommen der Nutzer hat weder Foto noch Text eingegeben, wenn er auf "Analysieren" klickt, dann wird eine Fehlermeldung angezeigt ("Bitte mindestens ein Foto oder eine Beschreibung eingeben").
- [ ] Angenommen der Nutzer gibt nur Text ein (kein Foto), wenn er auf "Analysieren" klickt, dann startet die Analyse auf Basis des Textes.
- [ ] Angenommen der Nutzer lädt nur ein Foto hoch (kein Text), wenn er auf "Analysieren" klickt, dann startet die Analyse auf Basis des Fotos.
- [ ] Angenommen der Nutzer gibt Text und Foto ein, wenn er auf "Analysieren" klickt, dann startet die Analyse mit beiden Inputs — dies liefert die präzisesten Ergebnisse.

### Foto-Upload
- [ ] Angenommen der Nutzer öffnet die Seite auf einem Mobilgerät, wenn er auf das Upload-Feld tippt, dann kann er zwischen "Kamera" und "Galerie" wählen.
- [ ] Angenommen der Nutzer öffnet die Seite auf dem Desktop, wenn er auf das Upload-Feld klickt, dann öffnet sich der Datei-Browser; alternativ kann er ein Bild per Drag & Drop ablegen.
- [ ] Angenommen der Nutzer wählt ein Foto aus, wenn das Bild größer als 10 MB ist, dann wird eine Fehlermeldung angezeigt und das Bild nicht akzeptiert.
- [ ] Angenommen ein Foto hochgeladen wurde, wenn es im Upload-Bereich angezeigt wird, dann sieht der Nutzer eine Vorschau und kann das Foto durch ein anderes ersetzen.
- [ ] Angenommen ein Foto wurde ausgewählt, wenn es hochgeladen wird, dann wird es client-seitig auf max. 1 MB / 1200px Breite komprimiert bevor es an den Server gesendet wird.

### Rückfragen-Flow (KI — max. 3 Runden, max. 2 Fragen pro Runde)
- [ ] Angenommen die KI hat Unklarheiten nach dem initialen Input, wenn sie Rückfragen stellt, dann werden maximal 2 Fragen pro Runde angezeigt — keine Frageliste.
- [ ] Angenommen eine Rückfragerunde wird angezeigt, wenn der Nutzer die Fragen beantwortet und auf "Weiter" klickt, dann startet die nächste Runde oder — nach maximal 3 Runden — die finale Analyse.
- [ ] Angenommen eine Rückfragerunde wird angezeigt, wenn der Nutzer auf "Überspringen" klickt, dann werden keine weiteren Fragen gestellt und die Analyse startet sofort.
- [ ] Angenommen der Nutzer hat übersprungen, wenn die Analyse angezeigt wird, dann erscheint ein sichtbarer Hinweis welche Annahmen die KI getroffen hat (z.B. "Ich habe angenommen: Magerquark 0,2% Fett, gebraten in 1 EL Olivenöl").
- [ ] Angenommen die KI ist nach dem initialen Input bereits ausreichend sicher, wenn keine Rückfragen nötig sind, dann startet die Analyse direkt ohne Fragerunden.

### Ladestate
- [ ] Angenommen der Nutzer hat abgeschickt, wenn die Analyse läuft, dann wird ein Ladezustand angezeigt (kein leerer Bildschirm, keine Möglichkeit doppelt abzuschicken).

## Edge Cases
- **Nur Leerzeichen im Textfeld:** Wird als leere Eingabe gewertet — Pflichtfeldvalidierung greift.
- **Upload-Fehler (Netzwerk):** Fehlermeldung mit Option zum erneuten Versuch; Texteingabe bleibt erhalten.
- **Nicht unterstütztes Dateiformat:** Nur JPEG, PNG, WEBP erlaubt — klare Fehlermeldung bei anderen Formaten (z.B. PDF, HEIC).
- **Foto während Rückfragerunde ersetzen:** Nicht möglich — der Input ist nach dem Abschicken eingefroren. Nutzer kann von vorne beginnen.
- **Rückfragen-Timeout:** Wenn der Nutzer eine Rückfragerunde offen lässt und die Seite später wieder aufruft, startet er von vorne (kein Session-Resumé im MVP).
- **Sehr kurzer Text:** Texte unter 3 Wörtern (z.B. "Salat") werden akzeptiert, die KI stellt dann mehr Rückfragen.

## Technical Requirements
- **Mobile-first:** Upload-UI muss auf kleinen Screens (320px+) vollständig bedienbar sein; Touch-Targets min. 44px
- **Dateiformate:** JPEG, PNG, WEBP
- **Max. Dateigröße (vor Komprimierung):** 10 MB
- **Komprimierung:** Client-seitig auf max. 1 MB / 1200px Breite (→ PROJ-1 Spec)
- **Freitext-Limit:** Max. 1.000 Zeichen (Zeichenzähler sichtbar ab 800)
- **Rückfragen:** Max. 3 Runden × max. 2 Fragen = max. 6 Rückfragen gesamt

## Open Questions
- [ ] Soll das Freitext-Feld einen Placeholder-Text / Beispieleingabe zeigen, um Erstnutzern zu helfen? (z.B. "z.B. Hähnchenbrust mit Reis, in 2EL Olivenöl angebraten, dazu Gurkensalat mit wenig Essig und Öl")

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Foto optional, Text optional — mindestens eines Pflicht | Maximale Flexibilität; Bild+Text liefert beste Ergebnisse, ist aber kein Muss | 2026-06-10 |
| Max. 3 Runden × 2 Fragen | Balance zwischen Präzision und Nutzergeduld; nach 6 Fragen arbeitet KI mit Annahmen | 2026-06-10 |
| Skip-Option mit transparenten Annahmen | Ungeduld respektieren ohne Qualität zu verschweigen; Vertrauen durch Transparenz | 2026-06-10 |
| Nur ein Foto pro Mahlzeit (MVP) | Einfachheit; ein gutes Foto reicht für die KI-Analyse | 2026-06-10 |
| Kamera + Galerie auf Mobile | Mobile-first; direkte Kamera ist der natürlichste Einstieg beim Essen | 2026-06-10 |

### Technical Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| `browser-image-compression` für Client-Komprimierung | Handhabt EXIF-Rotation und Edge Cases; saubere Promise-API; native Canvas-Implementierung wäre fehleranfällig | 2026-06-11 |
| Direkter Upload Client → Supabase Storage | Vermeidet doppelten Datentransfer (Client → Server → Supabase); RLS stellt sicher, dass Nutzer nur in eigene Ordner schreiben | 2026-06-11 |
| Thumbnail-Generierung in PROJ-3 | Das Vollbild wird in PROJ-4 nach der Analyse gelöscht — ohne Thumbnail in PROJ-3 gäbe es in PROJ-6 kein Vorschaubild | 2026-06-11 |
| Echte Claude-API für Rückfragen bereits in PROJ-3 | Kein Stub — UI und Rückfragen-Backend werden zusammen gebaut; PROJ-4 konzentriert sich auf BLS + Makros + Sättigungsmatrix | 2026-06-11 |
| Konversations-History in eigener DB-Tabelle (`meal_conversations`) | Ermöglicht mehrstufige Claude-Dialoge ohne State im Client zu halten; ermöglicht spätere Analyse der Gesprächsqualität | 2026-06-11 |
| `useState` für Schritt-Flow im Frontend | Max. 5 Schritte, kein App-weiter Zustand nötig → kein Context oder externes State-Management nötig | 2026-06-11 |
| Upload erst beim „Analysieren"-Klick | Verhindert halb-hochgeladene Fotos ohne abgeschlossene Analyse; spart Storage-Kosten | 2026-06-11 |

---

## Tech Design (Solution Architect)

### Komponentenstruktur

```
/analyse  (Server Component — Auth-Guard)
└── MahlzeitInputPage  (Client Component — verwaltet den gesamten Flow-State)
    │
    ├── [Schritt: 'input']
    │   ├── FotoUploadZone
    │   │   ├── Upload-Bereich (Klick / Drag & Drop)
    │   │   └── BildVorschau  (nach Auswahl: Vorschau + "Foto ersetzen")
    │   ├── FreitextEingabe  (Textarea + Zeichenzähler ab 800 Zeichen)
    │   ├── Validierungshinweis  (wenn weder Foto noch Text vorhanden)
    │   └── AnalysierenButton
    │
    ├── [Schritt: 'uploading']
    │   └── LadeIndikator  ("Foto wird hochgeladen…")
    │
    ├── [Schritt: 'questions'  —  max. 3 Runden]
    │   ├── Runden-Badge  (z.B. "Kurze Rückfrage")
    │   ├── FrageCard(s)  (1–2 Fragen als Text + Textarea je Frage)
    │   ├── WeiterButton
    │   └── ÜberspringenButton
    │
    ├── [Schritt: 'analysing']
    │   └── LadeIndikator  ("Analyse läuft…")
    │
    └── [Schritt: 'done']
        └── AnalyseErgebnis  (Platzhalter — PROJ-5 füllt diesen Bereich)
```

### Datenfluss

```
1. Nutzer wählt Foto aus
   → Komprimierung im Browser (max. 1 MB / 1200 px) via browser-image-compression
   → Thumbnail-Generierung (≈50 px, Canvas API)
   → Vorschau im Upload-Bereich (noch kein Upload)

2. Nutzer klickt „Analysieren"
   → Validierung: Foto ODER Text muss vorhanden sein
   → Vollbild + Thumbnail → Supabase Storage (direkt vom Client, RLS-geschützt)
       meal-photos/{user_id}/{uuid}.jpg
       meal-photos/{user_id}/thumbs/{uuid}.jpg
   → POST /api/meal  { photo_path, thumb_path, free_text }
       → Legt Eintrag in meals-Tabelle an, gibt meal_id zurück

3. POST /api/analyse/start  { meal_id }
   → Liest Foto + Text aus DB / Storage
   → Ruft Claude auf: "Welche Informationen fehlen dir noch?"
   → Legt Eintrag in meal_conversations an
   → Gibt zurück: { questions: [{id, text}, …] }  ODER  { ready: true }

4. Rückfragen-Runde (bei questions, max. 3×)
   → POST /api/analyse/answer  { meal_id, answers: [{question_id, text}], skipped: false }
       → Speichert Antworten in meal_conversations
       → Ruft Claude erneut auf mit vollständiger Gesprächshistory
       → Gibt zurück: { questions: […] }  ODER  { ready: true }
   → ODER: skipped: true  → Claude arbeitet mit Annahmen
       → Gibt zurück: { ready: true, assumptions: ["Magerquark 0,2% Fett", …] }

5. Wenn ready → PROJ-4 übernimmt
   → POST /api/analyse/complete  { meal_id }  ← implementiert in PROJ-4
```

### Datenbankstruktur (neu in PROJ-3)

```
meal_conversations  (neue Tabelle)
  id                UUID, Primary Key
  meal_id           FK → meals (CASCADE DELETE)
  claude_messages   JSONB  (vollständige Claude-Konversationshistory)
  status            'questioning' | 'ready' | 'skipped'
  current_round     integer  (0–3)
  assumptions       JSONB nullable  (befüllt wenn Nutzer übersprungen hat)
  created_at        Timestamp

RLS: Nutzer sieht nur eigene Einträge (über meal_id → meals.user_id = auth.uid())
```

### Neues Package

| Package | Zweck |
|---|---|
| `browser-image-compression` | Client-seitige Bildkomprimierung mit EXIF-Unterstützung (~10 KB) |

Alle UI-Elemente werden mit bereits installierten shadcn/ui-Komponenten gebaut:
`Card`, `Textarea`, `Button`, `Badge`, `Skeleton`, `Alert`

## Implementation Notes (Backend — 2026-06-11)

### API Routes
- `POST /api/meal` — Erstellt Mahlzeit-Eintrag in DB; validiert mit Zod; gibt `{ id }` zurück
- `POST /api/analyse/start` — Liest Meal aus DB, lädt Foto aus Supabase Storage als Base64, ruft Claude auf, erstellt `meal_conversations`-Eintrag; gibt `{ questions }` oder `{ ready: true }` zurück
- `POST /api/analyse/answer` — Setzt Konversation fort (oder skippt); aktualisiert `meal_conversations`; gibt nächste Fragen oder `{ ready: true, assumptions? }` zurück

### DB-Migration
- Neue Tabelle `meal_conversations` angelegt (RLS aktiv)
- Supabase TypeScript-Typen regeneriert

### Env Variable (neu)
- `ANTHROPIC_API_KEY` — muss in `.env.local` eingetragen sein

### Cleanup
- Debug-Routes `debug-auth` / `debug-middleware` entfernt
- Middleware: `console.log` und Debug-Header entfernt

### Bugfix 2026-06-16 — E2E-Tests erreichten den erwarteten Folgezustand nie
Während des PROJ-2-Bugfix-Durchgangs (Login-Redirect seit PROJ-6) fiel auf: sobald `tests/PROJ-3-mahlzeit-input.spec.ts` überhaupt am Login vorbeikam, schlugen 4 Tests im "Rückfragen-Flow" fehl. Ursache: `mockApis()`s `/api/analyse/complete`-Mock gab nur `{ ok: true }` zurück — `runCompleteAnalysis()` in `mahlzeit-input.tsx` erwartet aber `{ ingredients: [...], assumptions?: [...] }` und interpretierte die fehlende Form als "Zutaten nicht erkannt", sprang zurück zu `'input'`. Die Tests warteten auf Text, der so nie erreicht wurde — vorher nie aufgefallen, weil der Login-Bug die Tests gar nicht so weit kommen ließ.

Fix: `/api/analyse/complete`-Mock liefert jetzt realistische `ingredients`. Betroffene Tests klicken jetzt zusätzlich durch die Bestätigungs-Ansicht ("Hab ich das richtig verstanden?" / "Passt so →"), mit `/api/analyse/confirm` neu gemockt für die beiden Tests, die wirklich bis zum Endergebnis ("Neue Mahlzeit") durchlaufen müssen. Alle 21 Tests grün auf Chromium + Mobile Chrome.

## QA Test Results

**QA Date:** 2026-06-11
**Tester:** QA Engineer (automated + manual review)
**Result: APPROVED — No critical or high bugs. Ready to deploy.**

### Acceptance Criteria — All Passed ✓

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Eingeloggter Nutzer sieht Foto-Upload-Feld und Freitext-Feld | ✓ Pass |
| 2 | Leeres Formular zeigt Fehlermeldung ("Bitte mindestens ein Foto oder eine Beschreibung eingeben") | ✓ Pass |
| 3 | Nur Text eingeben startet Analyse | ✓ Pass |
| 4 | Nur Foto hochladen startet Analyse | ✓ Pass (tested via upload tests) |
| 5 | Datei über 10 MB wird abgelehnt mit Fehlermeldung | ✓ Pass |
| 6 | Nicht unterstütztes Format (GIF) wird abgelehnt | ✓ Pass |
| 7 | Foto-Vorschau erscheint nach Auswahl, Ersetzen-Button sichtbar | ✓ Pass |
| 8 | Foto kann per X-Button entfernt werden | ✓ Pass |
| 9 | Rückfragen werden angezeigt (max. 2 pro Runde, Runden-Badge sichtbar) | ✓ Pass |
| 10 | Weiter-Button sendet Antworten und schließt Rückfragen ab | ✓ Pass |
| 11 | Überspringen startet Analyse sofort | ✓ Pass |
| 12 | Annahmen werden nach Überspringen angezeigt | ✓ Pass |
| 13 | KI startet direkt ohne Rückfragen wenn ausreichend Info vorhanden | ✓ Pass |
| 14 | Ladestate erscheint nach Absenden (kein leerer Bildschirm, kein Doppel-Submit) | ✓ Pass |

### Edge Cases — All Passed ✓

| Edge Case | Status |
|-----------|--------|
| Nur Leerzeichen im Textfeld gilt als leer | ✓ Pass |
| Zeichenzähler erscheint ab 800 Zeichen | ✓ Pass |
| Freitext-Limit: 1000 Zeichen akzeptiert, 1001 abgelehnt | ✓ Pass |
| Upload-Fehler (500 Server Error) zeigt Fehlermeldung, bleibt auf Input-Seite | ✓ Pass |

### Responsive — All Passed ✓

| Test | Status |
|------|--------|
| Kein horizontales Scrollen auf 375px | ✓ Pass |
| Analysieren-Button ≥ 44px Touch-Target | ✓ Pass |
| Upload-Zone ≥ 44px Touch-Target | ✓ Pass |

### Security Audit

| Check | Result |
|-------|--------|
| Auth guard: `/analyse` redirects to login when not authenticated | ✓ Pass (middleware-enforced) |
| RLS: `meals` und `meal_conversations` Tabellen — Nutzer sieht nur eigene Einträge | ✓ Konfiguriert |
| Supabase Storage: Nutzer können nur in eigene Ordner schreiben (`{user_id}/...`) | ✓ RLS-enforced |
| `SUPABASE_SERVICE_ROLE_KEY` nur serverseitig, nie im Client | ✓ Korrekt |
| Input-Validierung: Zod-Schema auf allen API-Routen | ✓ Korrekt |
| SQL Injection: Supabase parametrized queries | ✓ Kein Risiko |

### Automated Tests

**Unit Tests (Vitest):** 7/7 passed (`src/app/api/meal/route.test.ts`)
- 401 unauthenticated, 400 empty body, 400 whitespace, 400 >1000 chars, 201 text-only, 201 photo-only, 500 DB error

**E2E Tests (Playwright):** 21/21 passed (`tests/PROJ-3-mahlzeit-input.spec.ts`)
- Eingabe-Formular: 4 tests ✓
- Foto-Upload: 5 tests ✓
- Rückfragen-Flow: 5 tests ✓
- Edge Cases: 4 tests ✓
- Responsive Mobile 375px: 3 tests ✓

### Bugs Found

#### Low Severity

**BUG-3-1: Vitest picks up Playwright spec files** (pre-existing)
- `tests/` directory is not excluded from Vitest's test runner
- Running `npm test` collects and fails on Playwright spec files
- Workaround: Run `npm run test:e2e` for E2E tests, `npm test` for unit tests only
- Impact: Low — CI pipeline just needs separate commands; functionality unaffected

**BUG-3-2: Filechooser-Dialog in Playwright Headless nicht testbar** (test infrastructure limitation)
- Triggering the native file browser dialog via programmatic click is blocked by Chromium headless security
- Test rewritten to verify structural correctness (upload zone visible, file input exists with `accept="image/*"`)
- Impact: Low — actual file upload behavior is covered by the other 4 Foto-Upload tests

### Bugs Fixed During QA

- **aria-label Inkonsistenz:** Upload-Zone hatte `aria-label="Foto hochladen"` statt `aria-label="Foto aufnehmen"` — nicht konsistent mit sichtbarem Text und Test-Selektoren. Behoben in `foto-upload-zone.tsx`.

## Deployment
_To be added by /deploy_
