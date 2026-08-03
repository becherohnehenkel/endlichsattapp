# PROJ-28: Zutatenliste-Transparenz auf Ergebnis- und Historie-Seite

## Status: Approved (QA abgeschlossen, 9/9 AC erfüllt, beide gefundenen Bugs behoben und verifiziert, Production Ready)
**Created:** 2026-08-04
**Last Updated:** 2026-08-04

## Dependencies
- Requires: PROJ-4 (KI-Analyse-Agent) — liefert die finale Zutatenliste mit Gramm-Schätzungen (`zutatenliste[].grams`) und die Datenquellen-Kennzeichnung (`data_sources`) pro Zutat
- Requires: PROJ-6 (Mahlzeit-Historie) — die Historie-Detailseite ist einer der beiden Orte, an denen die Liste erscheint
- Betrifft/löst ab: die beiden separaten Hinweislisten "KI-geschätzt" / "nicht schätzbar" aus dem PROJ-4-Refinement (2026-08-03) — werden durch die pro-Zutat-Kennzeichnung in dieser neuen Liste ersetzt, siehe Out of Scope

## User Stories
- Als Nutzer möchte ich nach einer Analyse sehen, welche Zutaten mit welcher Gramm-Menge tatsächlich in die Kalorien-/Makroberechnung eingeflossen sind, damit ich der Zahl vertrauen und sie bei Bedarf nachvollziehen kann.
- Als Nutzer möchte ich auf einen Blick sehen, welche Zutat aus einer verlässlichen Datenbank (BLS/Open Food Facts) stammt und welche nur eine KI-Schätzung ist, damit ich die Genauigkeit der Analyse besser einschätzen kann.
- Als Nutzer möchte ich dieselbe Zutatenliste auch später beim Ansehen einer vergangenen Mahlzeit in der Historie wiederfinden, nicht nur direkt nach der Analyse.
- Als Nutzer möchte ich die ursprünglich von mir angegebene Menge (z.B. "1 EL") neben der daraus abgeleiteten Gramm-Schätzung sehen, damit ich nachvollziehen kann, wie die KI von meiner Eingabe auf einen Zahlenwert gekommen ist.
- Als Product Owner möchte ich mit dieser Transparenz-Funktion die Datengrundlage schaffen, auf der später ein "Rezept aus gescannter Mahlzeit anlegen"-Feature aufbauen kann.

## Out of Scope
- **Bearbeiten der Zutatenliste nach der Analyse** — bewusst rein anzeigend in diesem Schritt; Editieren hängt eng mit dem später geplanten Rezept-Feature zusammen und wird dort mitgedacht
- **"Rezept aus dieser Mahlzeit anlegen"-Funktion selbst** — eigenes, separates Feature, das auf dieser Transparenz-Grundlage aufbaut; nicht Teil dieser Spec
- **Rückwirkende Korrektur historischer, fälschlich als "Schätzung" markierter Zutaten** aus der Zeit vor dem PROJ-4-Bugfix (2026-08-03) — siehe Open Questions
- **Eigener API-Aufruf oder neue Datenbankfelder** — alle benötigten Daten (`refined_ingredients`, `data_sources`) werden bereits seit dem ursprünglichen PROJ-4 gespeichert, nur nie anzeigt

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeige auf der Ergebnisseite
- [ ] Angenommen eine Standard-Analyse ist abgeschlossen, wenn der Nutzer die Ergebnisseite sieht, dann findet er einen eigenen, ausklappbaren Bereich "🥗 Zutaten" (eingeklappt als Standardzustand), getrennt vom bestehenden "Basierend auf Annahmen"-Bereich
- [ ] Angenommen der Nutzer klappt den Zutaten-Bereich auf, dann sieht er pro Zutat: Name, ursprünglich eingegebene Menge, geschätzte Gramm-Menge (z.B. "Olivenöl · 1 EL → ≈15g")
- [ ] Angenommen eine Zutat stammt aus BLS oder Open Food Facts, dann wird sie ohne zusätzliche Kennzeichnung angezeigt (Standardfall, keine Unsicherheit)
- [ ] Angenommen eine Zutat wurde erfolgreich von der KI geschätzt (kein Datenbank-Treffer, aber plausibler Wert), dann trägt sie in dieser Liste eine sichtbare Kennzeichnung (z.B. "≈ KI-geschätzt") direkt in ihrer Zeile
- [ ] Angenommen eine Zutat konnte weder in der Datenbank gefunden noch plausibel geschätzt werden, dann trägt sie in dieser Liste eine sichtbare Warn-Kennzeichnung (z.B. "⚠️ nicht schätzbar") direkt in ihrer Zeile, anstelle der bisherigen separaten Hinweisliste
- [ ] Angenommen eine Beilagen-Analyse ist abgeschlossen, dann erscheint derselbe Zutaten-Bereich auch dort, mit derselben Struktur

### Anzeige in der Historie
- [ ] Angenommen ein Nutzer öffnet eine vergangene, abgeschlossene Mahlzeit aus der Historie, dann sieht er denselben "🥗 Zutaten"-Bereich mit identischem Inhalt wie direkt nach der ursprünglichen Analyse
- [ ] Angenommen eine Mahlzeit wurde vor dem Stichtag (2026-08-03, PROJ-4-Bugfix) analysiert, wenn der Nutzer sie in der Historie öffnet, dann zeigt der "🥗 Zutaten"-Bereich statt der Liste einen Hinweis, dass für diese ältere Mahlzeit keine zuverlässigen Zutatendaten vorliegen ("Diese Funktion ist seit dem 3. August 2026 verfügbar")

### Konsolidierung der bestehenden Hinweise
- [ ] Angenommen die neue Zutatenliste ist implementiert, dann verschwinden die bisherigen separaten Hinweisblöcke ("Nährwert für X ist eine KI-Schätzung" / "Nährwert für X konnte nicht geschätzt werden") aus dem "Basierend auf Annahmen"-Bereich — die Information steht jetzt ausschließlich pro Zutat in der neuen Liste

## Edge Cases
- **Sehr lange Zutatenliste** (viele Zutaten): Liste wird nicht gekürzt oder paginiert, einfach vollständig im ausgeklappten Bereich dargestellt — Ausklapp-Mechanik verhindert bereits, dass die Seite standardmäßig überladen wirkt
- **Sehr langer Zutatenname**: Zeilenumbruch statt Abschneiden (bestehendes Muster aus PROJ-4-Refinement, bereits getestet)
- **Historische Mahlzeiten vor dem PROJ-4-Bugfix (2026-08-03)**: Werden bewusst ausgeschlossen — statt der Zutatenliste (die dort unzuverlässig wäre, da `source: 'schaetzung'` damals einen stillen 0-kcal-Fallback statt eines echten KI-Werts bedeutete) erscheint ein "Diese Funktion ist seit dem 3. August 2026 verfügbar"-Hinweis
- **Zutat ohne Gramm-Wert** (`grams` ist 0 oder fehlt, sollte durch bestehende Validierung eigentlich nicht vorkommen): Zeile zeigt die vorhandene Textmenge, keinen Gramm-Wert, kein Absturz
- **Meal mit nur einer einzigen Zutat**: Liste funktioniert identisch, kein Sonderfall nötig

## Technical Requirements (optional)
- Keine neuen API-Aufrufe — alle Daten sind bereits in `refined_ingredients` (Zutatenliste inkl. Gramm) und `data_sources` (Quellen-Kennzeichnung pro Zutat) vorhanden, sowohl im direkten Analyse-Response als auch in der DB für die Historie
- Konsistente Darstellung zwischen Ergebnisseite (frisch aus dem API-Response) und Historie (aus der DB rekonstruiert) — dieselbe Logik/Komponente für beide Fälle verwenden

## Open Questions
- [x] Wie gehen wir mit historischen Mahlzeiten vor dem 2026-08-03-Bugfix um, deren `source: 'schaetzung'`-Markierung eigentlich einen stillen 0-kcal-Fallback bedeutete, nicht einen echten KI-Wert? → Diese Mahlzeiten werden von der neuen Zutatenliste ausgeschlossen; stattdessen erscheint dort ein Hinweis ("Diese Funktion ist seit dem [Datum] verfügbar — für ältere Mahlzeiten liegen keine zuverlässigen Zutatendaten vor"). Siehe neue Acceptance Criteria unten. (2026-08-04)
- [ ] Exakte Formulierung der Kennzeichnungen pro Zutat ("≈ KI-geschätzt" / "⚠️ nicht schätzbar" sind Vorschläge) — Detail für `/frontend`
- [x] Exaktes Cutoff-Datum/-Kriterium → `meal_analyses.created_at` gegen den 3. August 2026 vergleichen, kein neues Feld nötig (siehe Tech Design). Akzeptierte Ungenauigkeit: die Prüfung läuft auf Tagesgenauigkeit, nicht exakt auf den Deploy-Zeitpunkt — betrifft praktisch niemanden, da zum Stichtag nur eine Handvoll Test-Mahlzeiten existierten (2026-08-04)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Zeigt die finalen, präzisen Gramm-Schätzungen aus dem Analyse-Call, nicht die Textmengen aus dem Bestätigungsschritt | Das sind die tatsächlich für die Berechnung verwendeten Werte — höherer Transparenzwert, und der Nutzer hat diese Zahlen noch nie gesehen | 2026-08-04 |
| Sichtbar auf Ergebnisseite UND in der Historie | Konsistent mit den bestehenden Hinweisen aus PROJ-4; für das später geplante Rezept-Feature wird die Historie ohnehin der Ort sein, an dem Nutzer eine vergangene Mahlzeit als Rezept-Grundlage auswählen | 2026-08-04 |
| Eigener, ausklappbarer "Zutaten"-Bereich statt Integration in den bestehenden "Annahmen"-Bereich | Semantisch sauberer — Zutatenliste sind keine Annahmen, sondern die tatsächliche Berechnungsgrundlage; vermeidet inhaltliche Vermischung zweier unterschiedlicher Konzepte | 2026-08-04 |
| Original-Menge UND Gramm-Schätzung beide anzeigen (nicht nur Gramm) | Nachvollziehbarkeit, wie die KI von der Nutzereingabe auf einen Zahlenwert gekommen ist | 2026-08-04 |
| KI-Schätzung/nicht-schätzbar-Kennzeichnung wandert pro Zutat in die neue Liste, bestehende separate Hinweislisten aus PROJ-4 (2026-08-03) entfallen | Eine Quelle der Wahrheit statt zweier separater, inhaltlich überlappender Listen — direkt am Ort der Information (bei der jeweiligen Zutat) statt in einem separaten Block | 2026-08-04 |
| Auch bei Beilagen-Analysen anzeigen | Konsistenz über beide Analyse-Typen hinweg, auf expliziten Wunsch des Product Owners (ursprünglich als Ausschluss vorgeschlagen, dann korrigiert) | 2026-08-04 |
| Kein Editieren der Zutatenliste in diesem Schritt | Bewusst "Schritt für Schritt" — Bearbeitung hängt eng mit dem später geplanten Rezept-Feature zusammen und wird dort mitgedacht, nicht isoliert vorgezogen | 2026-08-04 |
| Mahlzeiten vor dem 2026-08-03-Bugfix zeigen einen "seit [Datum] verfügbar"-Hinweis statt der Zutatenliste | Zutatendaten aus dieser Zeit sind bei "geschätzten" Zutaten unzuverlässig (stiller 0-kcal-Fallback statt echtem KI-Wert) — Transparenz-Feature würde sonst selbst intransparent falsche Daten zeigen | 2026-08-04 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Kein neues Datenbankfeld, kein neuer API-Endpunkt | Alle benötigten Daten existieren bereits: Zutatenliste mit Gramm (`refined_ingredients`), Quellen-Kennzeichnung (`data_sources`), Analyse-Zeitpunkt (`meal_analyses.created_at`) — reine Wiederverwendung bestehender Daten | 2026-08-04 |
| Stichtag-Prüfung über den vorhandenen Zeitstempel `meal_analyses.created_at` statt einem neuen "verlässliche Daten vorhanden"-Flag | Einfacher, keine Migration nötig — das Stichtag-Datum (2026-08-03) ist fix bekannt und wird nur ein einziges Mal gebraucht; ein dediziertes Flag wäre spekulative Infrastruktur für ein Problem, das nicht wieder auftritt | 2026-08-04 |
| Gemeinsame, wiederverwendbare Anzeige-Komponente für Standard- UND Beilagen-Ergebnisse statt zweifach duplizierter Logik | `SaettigungsErgebnis` und `BeilagenErgebnis` haben bereits identischen Code für den "Annahmen"-Bereich (zwei separate Kopien) — für den neuen Zutaten-Bereich wird das nicht wiederholt, sondern einmal gebaut und an beiden Stellen eingesetzt | 2026-08-04 |
| Kleine Backend-Erweiterung nötig: Beilagen-Zweig von `/api/analyse/confirm` berechnet aktuell `kiGeschaetzteZutaten`/`nichtSchaetzbareZutaten` nicht (nur der Standard-Zweig tut das, seit dem PROJ-4-Refinement) | Ohne diese Ergänzung hätte die neue Zutatenliste bei Beilagen-Analysen keine Kennzeichnung — kleiner, in sich abgeschlossener Nachzieh-Schritt, kein neuer Endpunkt, keine Schema-Änderung | 2026-08-04 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### System-Übersicht

PROJ-28 ist überwiegend eine Frontend-Erweiterung — fast alle benötigten Daten werden bereits heute berechnet und gespeichert, nur nie angezeigt. Der einzige serverseitige Nachzieh-Punkt betrifft die Beilagen-Variante der Analyse (siehe Technical Decisions).

```
Bestehender Analyse-Ablauf (PROJ-4, unverändert)
   ↓
POST /api/analyse/confirm
   Standard-Zweig: berechnet bereits heute zutatenliste (inkl. grams),
   kiGeschaetzteZutaten, nichtSchaetzbareZutaten → alles im Response vorhanden
   Beilagen-Zweig: berechnet zutatenliste, aber (noch) nicht die beiden
   Kennzeichnungs-Listen → kleine Ergänzung nötig
   ↓
UI: Ergebnisseite zeigt ab sofort zusätzlich den neuen "🥗 Zutaten"-Bereich
   (nutzt Daten, die im selben API-Response bereits vorhanden sind)

Historie-Detailseite (PROJ-6, unverändert in der Grundstruktur)
   liest ohnehin schon `refined_ingredients` und `data_sources` aus der DB
   (Letzteres seit dem PROJ-4-Refinement ergänzt)
   ↓
   Zusätzlich: liest `meal_analyses.created_at`, um den Stichtag zu prüfen
   ↓
UI: zeigt entweder den "🥗 Zutaten"-Bereich (Mahlzeit nach dem Stichtag)
   oder den "seit dem 3. August 2026 verfügbar"-Hinweis (davor)
```

### Komponenten-Struktur

```
Neue, wiederverwendbare Komponente: ZutatenBereich
├── Ausklapp-Trigger "🥗 Zutaten (N)"
└── Aufgeklappter Inhalt
    ├── Pro Zutat eine Zeile:
    │   Name · Original-Menge → Gramm-Schätzung · optionales Badge
    │   (kein Badge = BLS/OFF-Treffer, "≈ KI-geschätzt" = Schätzung,
    │    "⚠️ nicht schätzbar" = weder Datenbank noch plausible Schätzung)
    └── ODER: Stichtag-Hinweis, wenn die Mahlzeit zu alt ist

Eingesetzt in:
├── SaettigungsErgebnis (Ergebnisseite, Standard-Analysen)
│   └── ersetzt die bisherigen zwei separaten Hinweislisten im
│       "Annahmen"-Bereich (die verschwinden, siehe Konsolidierung)
├── BeilagenErgebnis (Ergebnisseite, Beilagen-Analysen)
│   └── neu ergänzt, analog zu oben
└── MahlzeitDetail (Historie-Detailseite)
    └── erhält den Stichtag-Zeitstempel zusätzlich als Prop
```

### Datenmodell (Klartext, keine Schema-Änderung)

Nichts Neues wird gespeichert. Für die Anzeige werden zur Laufzeit zusammengeführt:
- Die bereits gespeicherte Zutatenliste mit Gramm-Schätzungen (`refined_ingredients.ingredients`)
- Die bereits gespeicherte Quellen-Kennzeichnung pro Zutat (`data_sources` — vier mögliche Werte: BLS, Open Food Facts, KI-Schätzung, nicht schätzbar)
- Der bereits gespeicherte Analyse-Zeitpunkt (`meal_analyses.created_at`), verglichen gegen den festen Stichtag 3. August 2026

Einzige tatsächliche Änderung am Datenfluss: Der Beilagen-Zweig der Analyse berechnet ab jetzt zusätzlich, welche Zutaten KI-geschätzt bzw. nicht schätzbar waren — exakt dieselbe Logik, die für Standard-Analysen bereits existiert, nur bisher nicht für Beilagen angewendet.

### Abhängigkeiten

Keine neuen npm-Pakete — die bestehende `Collapsible`-Komponente (shadcn/ui) wird weiterverwendet, exakt wie beim bestehenden "Annahmen"-Bereich.

### Migration / Rückwirkende Daten

Keine Migration nötig. Der Stichtag-Vergleich läuft rein zur Anzeigezeit gegen den ohnehin vorhandenen Zeitstempel — alte Mahlzeiten müssen nicht nachträglich verändert werden, sie bekommen einfach den Hinweis statt der Liste.

## Implementation Notes

- **Neue Komponente `src/components/zutaten-bereich.tsx`** — wiederverwendbarer, ausklappbarer "🥗 Zutaten"-Bereich (eigenes `Collapsible`, eigener Open-State). Zeigt pro Zutat Name, Original-Menge → Gramm-Schätzung, sowie optional ein Badge ("≈ KI-geschätzt" neutral/grau, "⚠️ nicht schätzbar" amber, passend zum bestehenden Farbschema). Bei `tooOld=true` zeigt sie stattdessen einen nicht-interaktiven Hinweis-Block ("Diese Funktion ist seit dem 3. August 2026 verfügbar…") ohne Ausklapp-Mechanik
- **`src/components/saettigungs-ergebnis.tsx`**: `zutatenliste`-Typ korrigiert (`{name, amount, source, sourceName}` → `{name, amount, grams}` — die alten Felder wurden nie tatsächlich befüllt/genutzt, reiner Typo aus der ursprünglichen PROJ-4-Implementierung). Die beiden Hinweislisten ("KI-Schätzung"/"nicht schätzbar") aus dem "Annahmen"-Bereich entfernt — Annahmen-Sichtbarkeitsbedingung wieder auf den ursprünglichen Zustand zurückgesetzt (nur `allAssumptions`/`photoUrl`). Neuer `<ZutatenBereich>` direkt darunter eingefügt, erhält `tooOld` als durchgereichten Prop
- **`src/components/beilagen-ergebnis.tsx`**: analog erweitert — neuer `<ZutatenBereich>`-Aufruf, `tooOld`-Prop ergänzt, `BeilagenAnalysisResult`-Typ um `kiGeschaetzteZutaten`/`nichtSchaetzbareZutaten` erweitert (fehlte bisher komplett)
- **`src/app/api/analyse/confirm/route.ts`** (kleine Backend-Ergänzung, wie in der Architektur vorgesehen): Beilagen-Zweig berechnet jetzt ebenfalls `kiGeschaetzteZutaten`/`nichtSchaetzbareZutaten` aus den bereits vorhandenen `resolvedBeilage`-Daten — identische Logik wie im Standard-Zweig, nur bisher dort gefehlt
- **`src/app/mahlzeit/[id]/page.tsx`**: `meal_analyses.created_at` zusätzlich selektiert; neue Stichtag-Konstante (3. August 2026, UTC) und `tooOld`-Berechnung; `nichtSchaetzbareZutaten`/`kiGeschaetzteZutaten` jetzt auch im Beilagen-Zweig der Ergebnis-Rekonstruktion ergänzt (fehlte dort bisher, nur der Standard-Zweig hatte es aus dem PROJ-4-Refinement); `tooOld` an `MahlzeitDetail` durchgereicht
- **`src/app/mahlzeit/[id]/mahlzeit-detail.tsx`**: reine Prop-Weiterleitung von `tooOld` an `SaettigungsErgebnis`
- **Test:** `src/app/api/analyse/confirm/route.test.ts` um einen Test für die neue Beilagen-Kennzeichnung erweitert (17 Tests in dieser Datei, alle grün). Gesamte Vitest-Suite: 246/246 grün (vorher 245, +1 neuer Test). `tsc --noEmit` und `eslint` für alle geänderten Dateien sauber
- **Live-Verifikation:** Drei synthetische Testmahlzeiten direkt in der Produktions-Supabase-Datenbank angelegt (qa-test-Konto) — (1) aktuelle Standard-Mahlzeit mit allen drei Zuständen (BLS-Treffer, KI-geschätzt, nicht schätzbar) gemischt, (2) Mahlzeit vor dem Stichtag (Cutoff-Hinweis statt Liste), (3) Beilagen-Analyse mit KI-Schätzung. Alle drei Zustände sowie die mobile Ansicht (375px, kein horizontales Overflow) per Screenshot bestätigt, danach Testdaten vollständig entfernt

## QA Test Results

**QA-Datum:** 2026-08-04
**App URL:** http://localhost:3000 (lokaler Dev-Server) + Live-Verifikation gegen das Produktions-Supabase-Projekt
**Tester:** QA Engineer (AI)

### Automatisierte Tests (zuerst ausgeführt)
- `vitest run`: **246/246 grün**
- `tsc --noEmit`: sauber (zwei vorbestehende, unabhängige Fehler in `tests/PROJ-2-*`/`tests/PROJ-5-*` unberührt)
- `eslint`: sauber
- Neue permanente E2E-Suite `tests/PROJ-28-zutatenliste-transparenz.spec.ts`: **4/4 grün** (mocked `/api/analyse/confirm`-Flow, analog zum bestehenden Muster aus `PROJ-4-ki-analyse-agent.spec.ts`)
- Regressionslauf verwandter Suiten (PROJ-4, PROJ-5, PROJ-6, PROJ-16, PROJ-25, PROJ-26 — alle Nutzer dieser gemeinsamen Ergebnis-Komponenten): siehe Regression Testing unten

### Acceptance Criteria Status

**Anzeige auf der Ergebnisseite**
- [x] Eigener, ausklappbarer "🥗 Zutaten"-Bereich, getrennt von "Basierend auf Annahmen", standardmäßig eingeklappt — live per Screenshot bestätigt (Trigger sichtbar, Inhalt erst nach Klick), zusätzlich E2E-Test
- [x] Zeigt pro Zutat Name, Original-Menge → Gramm-Schätzung (Format wie im Spec-Mockup) — bestätigt
- [x] BLS/OFF-Zutat ohne Kennzeichnung — bestätigt (Regelfall)
- [x] KI-geschätzte Zutat mit "≈ KI-geschätzt"-Badge — bestätigt, **aber mit Einschränkung bei doppelten Zutatennamen, siehe BUG-7**
- [x] Nicht schätzbare Zutat mit "⚠️ nicht schätzbar"-Badge — bestätigt, gleiche Einschränkung wie oben
- [x] Auch bei Beilagen-Analysen — live per Screenshot bestätigt, inkl. Badge

**Anzeige in der Historie**
- [x] Identischer Zutaten-Bereich beim Öffnen einer vergangenen Mahlzeit — strukturell garantiert (dieselbe `ZutatenBereich`-Komponente wird von `SaettigungsErgebnis`/`BeilagenErgebnis` sowohl direkt nach der Analyse als auch aus `MahlzeitDetail` heraus verwendet), zusätzlich live an allen drei Testmahlzeiten über die Historie-Route (`/mahlzeit/[id]`) verifiziert
- [x] Mahlzeiten vor dem Stichtag (3. August 2026) zeigen den Verfügbarkeits-Hinweis statt der Liste — live per Screenshot bestätigt

**Konsolidierung**
- [x] Alte separate Hinweisblöcke ("... ist eine KI-Schätzung (keine Datenbankquelle...)" / "... konnte nicht zuverlässig geschätzt werden — fließt...") verschwunden — per E2E-Test und Responsive-Checks an allen drei Breakpoints bestätigt (`toHaveCount(0)`)

**Ergebnis: 9/9 Acceptance Criteria erfüllt** (2 davon mit einer beim Testen entdeckten Einschränkung, siehe BUG-7)

### Security Audit (Red Team)
- [x] Keine neuen API-Endpunkte, keine neue Angriffsfläche — reine Anzeige bereits vorhandener, RLS-geschützter Daten
- [x] `meal_analyses.created_at` (neu selektiert für den Stichtag-Vergleich) unterliegt derselben RLS-Policy wie die übrigen Spalten dieser Tabelle — erneut live geprüft, weiterhin korrekt auf `meals.user_id = auth.uid()` beschränkt
- [x] Zutatennamen werden über JSX-Interpolation gerendert (React escaped automatisch) — kein XSS-Vektor, selbst bei einem manipulierten/injizierten Namen aus der KI-Antwort
- [x] Stichtag-Vergleich läuft serverseitig gegen einen DB-kontrollierten, nicht nutzerschreibbaren Zeitstempel — nicht client-seitig manipulierbar
- [x] Keine Kosten-/Rate-Limiting-Angriffsfläche verändert — keine neuen Claude-Aufrufe

### Edge Cases Status
- [x] Sehr langer Zutatenname — **wird abgeschnitten (Ellipsis), nicht umgebrochen**, siehe BUG-8 (Low, UX)
- [x] Mahlzeit ganz ohne "problematische" Zutat (alles BLS/OFF) — Zutaten-Bereich zeigt Liste ohne jegliche Badges, kein Absturz (E2E-Test)
- [ ] **Neu entdeckt, nicht im ursprünglichen Spec dokumentiert:** Zwei Zutaten mit identischem Namen, aber unterschiedlicher Datenquelle (z.B. "Zwiebel" zweimal, einmal BLS-Treffer, einmal KI-geschätzt) — siehe BUG-7

### Regression Testing
- [x] `vitest run`: 246/246 grün (keine Regressionen in bestehenden Komponenten/Routen)
- [x] PROJ-16 (Beilagen-Kontext), PROJ-25 (KI-Hinweis), PROJ-26 (Fehler-Feedback): alle vollständig grün, keine Regressionen
- [x] PROJ-4 (KI-Analyse-Agent): 3 erwartete Fehlschläge gefunden und behoben — die Tests aus der Gruppe "KI-Schätzung für unbekannte Zutaten" prüften exakt die alte Anzeige-Stelle (Hinweisblöcke im "Annahmen"-Bereich), die PROJ-28 bewusst entfernt (siehe Konsolidierung). Die Gruppe wurde aus `tests/PROJ-4-ki-analyse-agent.spec.ts` entfernt und ist inhaltlich durch die neue Suite `tests/PROJ-28-zutatenliste-transparenz.spec.ts` ersetzt. Nach der Bereinigung: **18/18 grün**
- [x] PROJ-5 (Sättigungs-Einschätzung) und PROJ-6 (Mahlzeit-Historie): initial 6 bzw. 17 Fehlschläge beobachtet, aber **per `git stash` rigoros als vorbestehend und unabhängig von PROJ-28 verifiziert** — identische Fehlschläge treten auch beim Stand vor allen PROJ-28-Änderungen auf (u.a. `tests/PROJ-6-mahlzeit-historie.spec.ts` Zeile 267, "nicht eingeloggter Nutzer wird zum Login weitergeleitet" — betrifft die Middleware, die durch dieses Feature nicht angefasst wurde). Nicht Teil dieses Bugs-Berichts, da außerhalb des PROJ-28-Scopes, aber siehe Hinweis unten
- Nebenbefund: Der lokale Dev-Server lief seit dem 21. Juli ununterbrochen (viele Stunden, unzählige Hot-Reloads) — ein Neustart hat das Problem nicht behoben, also keine reine Server-Instabilität, sondern ein echter, reproduzierbarer Zustand in PROJ-5/PROJ-6

### Hinweis (kein PROJ-28-Bug, aber gefunden): PROJ-5- und PROJ-6-Testsuiten sind unabhängig von diesem Feature bereits kaputt
23 Tests (6 in PROJ-5, 17 in PROJ-6) schlagen fehl, und zwar nachweislich bereits ohne jede PROJ-28-Änderung — inklusive Tests, die nichts mit der Ergebnis-Anzeige zu tun haben (Login-Redirect, leerer Zustand der Historie-Liste, Pagination, Lösch-Dialog). Das deutet auf eine eigenständige, vorbestehende Störung hin, die unabhängig von diesem QA-Durchgang untersucht werden sollte — vermutlich seit einer der letzten Änderungen an einer gemeinsam genutzten Stelle (Auth-Middleware, Historie-Liste) entstanden, aber außerhalb des Zeit-/Scope-Rahmens dieses PROJ-28-QA-Durchgangs zu isolieren. Empfehlung: eigener kurzer Untersuchungs-Task, unabhängig von PROJ-28.

### Bugs Found

#### BUG-7: Badge-Kennzeichnung kann bei doppeltem Zutatennamen die falsche Zeile treffen — ✅ GEFIXT (2026-08-04)
- **Severity:** Medium
- **Beschreibung:** `ZutatenBereich` prüft die Kennzeichnung einer Zeile per einfachem Namens-Abgleich (`kiGeschaetzteZutaten.includes(item.name)` / `nichtSchaetzbareZutaten.includes(item.name)`), nicht per eindeutiger Position/ID. Enthält die Zutatenliste zwei Einträge mit identischem Namen, aber unterschiedlicher Datenquelle (z.B. "Zwiebel" einmal aus BLS, einmal KI-geschätzt), bekommen **beide** Zeilen dieselbe Kennzeichnung — auch die, die eigentlich keine verdient hätte.
- **Live reproduziert:** Synthetische Mahlzeit mit zwei "Zwiebel"-Einträgen (`data_sources`: einer `bls`, einer `schaetzung`) angelegt — beide Zeilen zeigten fälschlich "≈ KI-geschätzt" (Screenshot, Testdaten danach entfernt).
- **Impact:** Kein Rechenfehler (die Kalorien-Berechnung selbst nutzt weiterhin die korrekte, positionsgenaue Zuordnung serverseitig) — reines Anzeige-/Vertrauensproblem: eine tatsächlich datenbankverifizierte Zutat wird fälschlich als unsicher gekennzeichnet, was der Kernabsicht des Features (Transparenz schaffen) zuwiderläuft.
- **Wahrscheinlichkeit:** Nicht extrem selten — doppelte Zutatennamen mit unterschiedlicher Verwendung (z.B. "Zwiebel roh" + "Zwiebel geröstet" landen beide als "Zwiebel", falls Claude die Zubereitungsart nicht in den Namen aufnimmt) sind in echten Mahlzeiten plausibel.
- **Empfehlung:** Kennzeichnung anhand des Index/der Position in der Zutatenliste statt per Namens-String zuordnen (z.B. `data_sources` mit dem Array-Index statt nur dem Namen verknüpfen, oder die Kennzeichnung direkt serverseitig ins jeweilige `zutatenliste[i]`-Objekt schreiben statt als separate Namenslisten).
- **Priority:** Sollte vor dem nächsten Deploy behoben werden
- **Fix:** Die beiden namensbasierten Listen `nichtSchaetzbareZutaten`/`kiGeschaetzteZutaten` wurden durch ein einziges, positionsgenaues Array `zutatenQuellen: ZutatenQuelle[]` ersetzt (`ZutatenQuelle = 'bls' | 'off' | 'schaetzung' | 'nicht_schaetzbar'`) — `zutatenQuellen[i]` gehört exakt zu `zutatenliste[i]`. Geändert in: `confirm/route.ts` (Standard- **und** Beilagen-Zweig, beide bauen die Liste ohnehin schon per `.map()` über dieselbe geordnete Zutatenliste), `saettigungs-ergebnis.tsx`/`beilagen-ergebnis.tsx` (Typen + Weitergabe), `zutaten-bereich.tsx` (Badge-Logik liest jetzt `zutatenQuellen[i]` statt `.includes(item.name)`), `mahlzeit/[id]/page.tsx` (Historie-Ableitung aus `data_sources` jetzt ebenfalls positionsgenau statt gefiltert-gesammelt).
- **Verifikation:** Exakte Reproduktion aus dem Bug-Report erneut durchgespielt (zwei "Zwiebel"-Einträge, eine BLS, eine KI-geschätzt, live in der Produktions-DB) — jetzt trägt nur noch die zweite Zeile das Badge (Screenshot, Testdaten danach entfernt). Neuer Regressionstest in `confirm/route.test.ts` (Unit) und `PROJ-28-zutatenliste-transparenz.spec.ts` (E2E), beide grün. Alle bestehenden Tests, die die alten Feldnamen nutzten (4 in `confirm/route.test.ts`, 4 in `PROJ-28-zutatenliste-transparenz.spec.ts`), auf das neue Format umgestellt.
- **Priority:** Erledigt

#### BUG-8: Sehr lange Zutatennamen werden abgeschnitten statt umgebrochen — ✅ GEFIXT (2026-08-04, im selben Rutsch wie BUG-7)
- **Severity:** Low
- **Beschreibung:** Der Name in `ZutatenBereich` nutzt `className="... truncate"` — bei sehr langen Namen wird der Text mit "…" abgeschnitten statt umzubrechen. Der bereits bestehende "nicht schätzbar"-Hinweis aus PROJ-4 nutzt an vergleichbarer Stelle bewussten Zeilenumbruch statt Abschneiden.
- **Reproduktion:** Zutat mit einem sehr langen Namen (>40 Zeichen) → Name wird in der Zutatenliste mit "…" abgeschnitten, vollständiger Name ist nicht mehr lesbar (Screenshot bei 375px).
- **Impact:** Rein kosmetisch, betrifft nur ungewöhnlich lange KI-generierte Zutatennamen.
- **Empfehlung:** `truncate` durch Zeilenumbruch ersetzen, konsistent mit dem bestehenden Muster aus PROJ-4.
- **Fix:** `truncate` → `break-words` in `zutaten-bereich.tsx`, direkt beim Anfassen derselben Zeile für BUG-7 mit erledigt.
- **Priority:** Erledigt

### Summary
- **Acceptance Criteria:** 9/9 erfüllt
- **Bugs Found:** 2, beide behoben und verifiziert (0 Critical, 0 High, 1 Medium: BUG-7 ✅, 1 Low: BUG-8 ✅)
- **Security:** Pass — keine neue Angriffsfläche, RLS weiterhin korrekt, kein XSS-Vektor
- **Production Ready:** **JA** — keine offenen Bugs jeglicher Severity
- **Empfehlung:** Deployen

## Deployment
_To be added by /deploy_
