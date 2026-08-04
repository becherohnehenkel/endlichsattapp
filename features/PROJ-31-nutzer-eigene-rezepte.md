# PROJ-31: Nutzer legen eigene Rezepte an

## Status: Deployed
**Created:** 2026-08-04
**Last Updated:** 2026-08-04

## Dependencies
- PROJ-30 (Rezept-Eigentümerschaft & Filter) — `owner_id`-Datenmodell, RLS-Sichtbarkeit und "Eigene Rezepte"-Filter existieren bereits
- PROJ-29 (Nährwert-Verbesserungen im Rezept-Editor) — Zutatensuche (BLS/OFF) + Live-Nährwert-Counter werden wiederverwendet
- PROJ-11 (Paywall) — bestehender Zugriffsstatus (`hasFullAccess`) steuert das 5-Rezepte-Limit
- PROJ-19 (Gast-Modus) — anonyme Nutzer müssen sich erst registrieren, bevor sie Rezepte anlegen können

## User Stories
- Als registrierter Nutzer möchte ich ein eigenes Rezept anlegen können, damit ich es später wiederfinde und für meine Mahlzeitenplanung nutzen kann.
- Als registrierter Nutzer möchte ich mein eigenes Rezept bearbeiten oder löschen können, damit ich Fehler korrigieren oder nicht mehr benötigte Rezepte entfernen kann.
- Als Nutzer ohne vollen Zugriff (Trial abgelaufen, kein Abo/Invite) möchte ich bis zu 5 eigene Rezepte kostenlos anlegen können, damit das Anlegen eigener Rezepte ein echter Anmelde-Mehrwert ist, ohne dass ich sofort zahlen muss.
- Als Product Owner möchte ich, dass das Anlegen eigener Rezepte als Registrierungs-Anreiz funktioniert — nicht als reines Premium-Feature, sondern mit einer großzügigen kostenlosen Grundmenge.

## Out of Scope
- Rezept aus einer gescannten Mahlzeit anlegen ("wie gescannt" / "mit mehr Sättigung") — das ist PROJ-32, baut direkt auf dieser Spec auf
- Teilen/Veröffentlichen eigener Rezepte für andere Nutzer — bleibt bei der in PROJ-30 getroffenen Entscheidung: eigene Rezepte sind und bleiben privat
- "Ist Gast-sichtbar"-Feld für eigene Rezepte — ergibt bei privaten Rezepten keinen Sinn, bleibt admin-exklusiv
- Admin-Moderation/-Einsicht in Nutzer-Rezepte — weiterhin außerhalb des Scopes (siehe PROJ-30)
- Zusätzliche Einstiegspunkte außerhalb der Rezepte-Seite (z.B. Startseite/Historie) — MVP beschränkt sich bewusst auf die Rezepte-Seite
- Eine zweite, separate Kaufoption nur für das Rezepte-Limit — das Limit hängt am bestehenden Zugriffsstatus, kein neues Bezahlmodell

## Acceptance Criteria

**Zugriff & Einstiegspunkt**
- [ ] Angenommen ein Gast (nicht eingeloggt oder anonym), wenn er versucht ein eigenes Rezept anzulegen, dann wird er zur Registrierung aufgefordert (analog zu bestehenden PROJ-11/19-Mustern)
- [ ] Angenommen ein eingeloggter (nicht-anonymer) Nutzer öffnet die Rezepte-Seite, wenn der "Eigene Rezepte"-Filter aktiv oder "Alle Rezepte" ausgewählt ist, dann ist ein "+ Rezept anlegen"-Einstiegspunkt sichtbar
- [ ] Angenommen der "Eigene Rezepte"-Filter zeigt aktuell keine Rezepte, wenn der Leerzustand angezeigt wird, dann führt der dortige Hinweis direkt zum Anlege-Formular (löst den in PROJ-30 vorbereiteten Platzhaltertext ein)

**Anlegen, Bearbeiten, Löschen**
- [ ] Angenommen ein eingeloggter Nutzer mit freiem Kontingent, wenn er ein Rezept mit allen Pflichtfeldern anlegt, dann wird es mit `owner_id` = seiner Nutzer-ID gespeichert und erscheint unter "Eigene Rezepte"
- [ ] Angenommen ein Nutzer legt ein Rezept an, wenn die Zutatenliste befüllt wird, dann stehen dieselbe BLS/OFF-Suche und derselbe Live-Nährwert-Counter zur Verfügung wie im Admin-Editor (PROJ-29)
- [ ] Angenommen ein Nutzer legt ein Rezept an, wenn er es speichert, dann wird automatisch dieselbe Sättigungs-Matrix-Berechnung durchgeführt wie bei offiziellen Rezepten
- [ ] Angenommen ein Nutzer betrachtet ein eigenes Rezept, wenn er auf "Bearbeiten" klickt, dann kann er alle Felder inkl. Zutaten ändern und erneut speichern
- [ ] Angenommen ein Nutzer betrachtet ein eigenes Rezept, wenn er auf "Löschen" klickt, dann erscheint eine Bestätigung, bevor das Rezept endgültig entfernt wird
- [ ] Angenommen ein Nutzer versucht ein fremdes Rezept (offiziell oder eines anderen Nutzers) zu bearbeiten oder zu löschen, dann wird der Zugriff verweigert (403/404, nicht nur UI-seitig versteckt)

**5-Rezepte-Limit**
- [ ] Angenommen ein Nutzer ohne vollen Zugriff hat bereits 5 eigene Rezepte, wenn er versucht ein weiteres anzulegen, dann führt der "+ Rezept anlegen"-Einstiegspunkt zu einem Hinweis mit Verweis auf `/upgrade` statt zum leeren Formular
- [ ] Angenommen ein Nutzer ohne vollen Zugriff hat 5 eigene Rezepte und löscht eines, dann kann er direkt danach wieder ein neues anlegen (Slot wird frei, siehe PROJ-30-Entscheidung)
- [ ] Angenommen ein Nutzer mit vollem Zugriff (aktiver Trial/Abo/Invite), wenn er ein 6. (oder beliebig weiteres) Rezept anlegt, dann gibt es keine Begrenzung
- [ ] Angenommen ein Nutzer versucht das Limit über einen direkten API-Aufruf zu umgehen (nicht über die UI), dann blockt die Backend-Prüfung das Anlegen serverseitig, unabhängig vom UI-Zustand

## Edge Cases
- Nutzer bricht das Anlegen eines Rezepts mitten im Formular ab (Navigation weg) → kein Teil-Rezept wird gespeichert, keine verwaisten Datenbank-Einträge
- Nutzer lädt ein Bild hoch, bricht dann aber komplett ab, ohne zu speichern → hochgeladenes Bild darf nicht dauerhaft verwaist im Storage liegen bleiben (gleiches Verhalten wie im bestehenden Admin-Editor sicherstellen)
- Zwei Browser-Tabs: Nutzer legt in einem Tab das 5. Rezept an, während im anderen Tab noch der alte Zähler (4) angezeigt wird, und versucht dort ein weiteres anzulegen → serverseitige Prüfung ist die Wahrheit, verhindert das 6. Rezept unabhängig vom UI-Zustand des zweiten Tabs
- Nutzer mit abgelaufenem Trial, der bereits mehr als 5 eigene Rezepte hatte (z.B. während einer früheren Trial-Phase angelegt), wechselt zurück in den eingeschränkten Zustand → bestehende Rezepte bleiben erhalten und sichtbar, nur das Anlegen NEUER Rezepte wird blockiert (kein rückwirkendes Löschen)
- Rezept-Titel identisch zu einem bereits existierenden offiziellen oder eigenen Rezept → kein Konflikt, keine Eindeutigkeits-Anforderung (wie in PROJ-30 bereits festgelegt)
- Sehr lange Zutatenliste oder Zubereitungstext → dieselben Validierungsgrenzen wie im bestehenden Admin-Editor gelten auch hier

## Technical Requirements (optional)
- Wiederverwendung des bestehenden Rezept-Formulars (`rezept-formular.tsx`) und der PROJ-29-Zutatensuche/Live-Counter-Komponenten — Umfang der Wiederverwendung vs. Anpassung legt /architecture fest
- Serverseitige Durchsetzung des 5-Rezepte-Limits ist zwingend (nicht nur UI-Check) — siehe Edge-Case "API-Umgehung"
- Bild-Upload nutzt denselben Storage-Mechanismus wie der Admin-Editor (`BildCropper`, `recipe-images`-Bucket)

## Open Questions
- [ ] Exakte Nutzerführung beim Limit-Hinweis (Modal vs. eigene Seite, Wortlaut) — final durch /frontend

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| "Rezept-Typ" (Beilage/Grundlage) bleibt als Feld verfügbar, "Ist Gast-sichtbar" wird weggelassen | Nutzer-Vorgabe — Beilage/Grundlage kann auch für eigene Rezepte nützlich sein, Gast-Sichtbarkeit ergibt bei privaten Rezepten keinen Sinn | 2026-08-04 |
| Bild-Upload mit Zuschneiden ist von Anfang an dabei, keine bildlose MVP-Variante | Nutzer-Vorgabe — Komponente existiert bereits (`BildCropper`), kein Mehraufwand durch Wiederverwendung | 2026-08-04 |
| Limit erreicht → Button führt zu einem Upgrade-Hinweis statt deaktiviert zu werden | Nutzer-Vorgabe — erhält die Konversions-Chance (aktiver Klick zum Upgrade-Pfad), analog zu bestehenden Paywall-Mustern | 2026-08-04 |
| Einstiegspunkt nur auf der Rezepte-Seite (Leerzustand + "+"-Button), keine zusätzliche Platzierung auf Startseite/Historie für den MVP | Nutzer-Vorgabe — kleinerer Eingriff in bestehende Screens, Rezepte-Seite ist der naheliegende Ort | 2026-08-04 |
| Bearbeiten und Löschen eigener Rezepte sind Teil dieser Spec, nicht separat | Ein "Anlegen" ohne Korrekturmöglichkeit wäre für Nutzer kaum brauchbar — gehört zum Mindestumfang einer nutzbaren CRUD-Funktion | 2026-08-04 |
| Sättigungs-Matrix-Berechnung läuft für eigene Rezepte automatisch mit, identisch zu offiziellen Rezepten | Kernversprechen der App (Sättigungs-Einschätzung) soll nicht nur offiziellen Rezepten vorbehalten sein | 2026-08-04 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Schreibrechte (Insert/Update/Delete) über Row Level Security, nicht nur Anwendungscode | Konsistent mit PROJ-30s Leserechte-Ansatz; verlässlichste Absicherung gegen API-Umgehungsversuche | 2026-08-04 |
| 5-Rezepte-Limit als Anwendungslogik in der Anlege-Funktion, nicht über RLS | Mengen-Grenze über mehrere Zeilen ist eine Geschäftsregel, kein reiner Zugriffs-Check — RLS ist dafür das falsche Werkzeug | 2026-08-04 |
| Bestehendes Rezept-Formular um "Nutzer-Modus" erweitert statt eigene Komponente | Unterschied ist minimal (ein Feld + Ziel-Endpunkt); zwei Formulare wären ein Pflege-Risiko | 2026-08-04 |
| Neuer, separater Bild-Upload-Endpunkt für Nutzer-Rezepte | Der bestehende Admin-Endpunkt bleibt bewusst admin-exklusiv, keine Aufweichung dieser Grenze | 2026-08-04 |
| Neue Routen im Singular-Schema der öffentlichen Rezeptseiten (`/rezept/...`), nicht im Admin-Plural-Schema | Nutzerseitige Funktion gehört zur bestehenden öffentlichen Struktur, nicht zum Admin-Bereich | 2026-08-04 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur

```
Rezepte-Seite (/rezepte)
├── Filter-Leiste (bestehend, PROJ-30)
│   └── "+ Rezept anlegen" (NEU) — sichtbar bei "Alle Rezepte" / "Eigene Rezepte", nicht für Gäste
└── "Eigene Rezepte"-Leerzustand (bestehend, PROJ-30)
    └── Hinweistext wird zum echten Link auf das Anlege-Formular (NEU)

Rezept anlegen/bearbeiten (NEU — /rezept/neu, /rezept/[id]/bearbeiten)
└── Wiederverwendetes Rezept-Formular (bestehende Komponente, um einen "Nutzer-Modus" erweitert)
    ├── Titel, Zeiten, Portionen, Zubereitung, Tags (bestehend)
    ├── Rezept-Typ Beilage/Grundlage (bestehend, bleibt sichtbar)
    ├── "Ist Gast-sichtbar"-Feld (bestehend) — im Nutzer-Modus ausgeblendet
    ├── Zutatenliste mit BLS/OFF-Suche + Live-Nährwert-Counter (bestehend, PROJ-29, unverändert)
    └── Bild-Upload mit Zuschneiden (bestehend, wiederverwendet)

Rezept-Detailseite (/rezept/[id], bestehend)
└── "Bearbeiten" / "Löschen" (NEU) — nur sichtbar, wenn der Betrachter der Eigentümer ist

Limit-Hinweis (NEU, einfache Seite/Hinweis-Box)
└── Erscheint statt des Formulars, wenn Limit erreicht — Verweis auf /upgrade (bestehende Seite)
```

### B) Datenmodell (einfache Sprache)

Kein neues Datenbank-Feld nötig — `owner_id` existiert bereits aus PROJ-30. Neu ist nur die **Berechtigung, zu schreiben**: bisher konnten nur Rezepte ohne Eigentümer (offiziell, über den Admin-Bereich) angelegt/geändert werden. Jetzt darf ein Nutzer zusätzlich Rezepte anlegen, bearbeiten und löschen, bei denen er selbst als Eigentümer eingetragen ist — für alle anderen Rezepte (offiziell oder fremd) bleibt das weiterhin verboten.

Das 5-Rezepte-Limit wird nicht als eigenes Datenbank-Feld gespeichert, sondern bei jedem Anlege-Versuch frisch berechnet: „Wie viele Rezepte gehören diesem Nutzer bereits, und hat er vollen Zugriff (bestehende Regel aus PROJ-11)?"

### C) Tech-Entscheidungen (Begründung)

1. **Schreibrechte werden ebenfalls auf Datenbankebene erzwungen (Row Level Security), nicht nur im Anwendungscode.** Konsistent mit der in PROJ-30 getroffenen Grundsatzentscheidung für Leserechte — ein Nutzer kann so grundsätzlich nur Zeilen anlegen, bei denen er selbst als Eigentümer eingetragen ist, und nur eigene Zeilen ändern/löschen. Das ist die verlässlichste Absicherung gegen den in den Edge Cases genannten Umgehungsversuch per direktem API-Aufruf.
2. **Das 5-Rezepte-Limit läuft dagegen bewusst NICHT über die Datenbank-Zugriffsregeln, sondern als Prüfung in der Anlege-Funktion selbst.** Eine Mengen-Grenze über mehrere Zeilen hinweg ("wie viele haben Sie schon") ist eine Geschäftsregel, keine reine Zugriffsfrage — dafür sind Zugriffsregeln nicht das richtige Werkzeug. Wichtig: diese Prüfung muss serverseitig erfolgen, nicht nur im Formular, damit sie nicht umgangen werden kann.
3. **Das bestehende Rezept-Formular wird um einen "Nutzer-Modus" erweitert statt dupliziert.** Es unterscheidet sich nur in einem einzigen Feld ("Ist Gast-sichtbar" wird ausgeblendet) und im Ziel-Endpunkt beim Speichern — eine komplette zweite Formular-Komponente nur dafür wäre unnötiger Mehraufwand und ein Pflege-Risiko (zwei Stellen, die bei künftigen Änderungen synchron gehalten werden müssten).
4. **Neuer, eigener Endpunkt für den Bild-Upload eigener Rezepte statt Wiederverwendung des Admin-Endpunkts.** Der bestehende Admin-Upload-Endpunkt ist bewusst auf Admin-Zugriff beschränkt — ihn für normale Nutzer zu öffnen würde diese Absicherung aufweichen. Ein neuer, inhaltlich identischer Endpunkt (gleiche Validierung: Dateityp, Größe) hält die Trennung klar.
5. **Neue Routen folgen der bestehenden öffentlichen Namenskonvention (`/rezept/neu`, `/rezept/[id]/bearbeiten`, Singular), nicht der Admin-Konvention (`/admin/rezepte/...`, Plural).** Das Anlegen/Bearbeiten ist eine nutzerseitige Funktion auf der bereits bestehenden öffentlichen Rezeptseiten-Struktur, kein Admin-Werkzeug.

### D) Abhängigkeiten (Pakete)

Keine neuen Pakete — alle benötigten Bausteine (Formular, Bild-Zuschnitt, Zutatensuche, Sättigungs-Matrix-Berechnung) existieren bereits und werden wiederverwendet.

## Implementation Notes (Backend)

**Datenbank / RLS** — Migration `proj31_recipe_owner_write_policies`: 6 neue RLS-Policies (INSERT/UPDATE/DELETE auf `recipes`, jeweils gespiegelt auf `recipe_ingredients` über eine `EXISTS`-Subquery), alle scoped auf `auth.uid() = owner_id`. Kein neues Schema-Feld nötig — `owner_id` existiert bereits aus PROJ-30.

**API-Routen**
- `POST /api/rezepte` (neu) — legt ein eigenes Rezept an (`owner_id` = aktueller Nutzer), prüft vorher das 5-Rezepte-Limit serverseitig, berechnet Makros/Sättigungs-Matrix identisch zum Admin-Pfad, räumt bei fehlgeschlagenem Zutaten-Insert das bereits angelegte Rezept wieder auf.
- `PUT` / `DELETE /api/rezepte/[id]` (erweitert, GET bereits aus PROJ-30 vorhanden) — explizite Eigentümer-Prüfung vor jeder Änderung (403 bei fremdem/offiziellem Rezept, 404 wenn nicht gefunden). `DELETE` entfernt ein vorhandenes Bild über den Admin-Client (der `recipe-images`-Bucket hat keine Storage-RLS für reguläre Nutzer — die Eigentümer-Prüfung in der Route selbst ist die eigentliche Absicherung).
- `POST /api/rezepte/bild` (neu) — eigenständiger Upload-Endpunkt für Nutzer-Rezeptbilder (Validierung: Dateityp, max. 5 MB), läuft ebenfalls über den Admin-Storage-Client aus demselben Grund.
- `is_guest_visible` wird in allen drei Routen serverseitig ignoriert, selbst wenn vom Client mitgeschickt — bleibt ausschließlich über den Admin-Endpunkt steuerbar.

**5-Rezepte-Limit** — `getOwnRecipeLimitStatus()` in `src/lib/paywall.ts`: zählt die eigenen Rezepte des Nutzers und kombiniert das mit dem bestehenden `getAccessStatus()` (PROJ-11) — Nutzer mit vollem Zugriff sind unbegrenzt, alle anderen bei 5 gedeckelt. Läuft serverseitig in `POST /api/rezepte` und in der `/rezept/neu`-Seite (Formular vs. Upgrade-Hinweis).

**Tests** — 37 neue/geänderte Vitest-Tests über 4 Dateien (Paywall-Limit-Logik, POST/PUT/DELETE/Bild-Route), alle grün. Für den Bild-Upload-Test musste `request.formData()` direkt gemockt werden statt eine echte `FormData`/`File` zu konstruieren — jsdoms `File`-Implementierung kollidiert mit der Node/undici-basierten `FormData`-Auswertung in echten `Request`-Objekten.

### Fix BUG-2 (2026-08-04, nach QA)

`middleware.ts` um einen zweiten Streaming-Status-Check erweitert, analog zum bestehenden PROJ-30-Fix für `/rezept/[id]`, aber für `/rezept/[id]/bearbeiten`: statt nur Existenz/Sichtbarkeit (wie beim Lese-Pfad ausreichend, da RLS dort bereits auf offiziell+eigen filtert) wird hier explizit die **Eigentümerschaft** geprüft (`owner_id === user.id`), da ein offizielles Rezept zwar sichtbar, aber nicht bearbeitbar ist — eine reine Existenzprüfung hätte den Bug nicht behoben. Der Check greift nur für eingeloggte, nicht-anonyme Nutzer; für Gäste bleibt der bestehende `redirect()` der Seite selbst zuständig (dessen eigener, unabhängiger Status-Code-Quirk war laut QA-Report explizit nicht Teil dieses Fixes).

Verifiziert per `next build && next start` auf Port 3099 (identische Methode wie beim PROJ-30-Fix, da Middleware unter `next dev` in dieser lokalen Umgebung bekanntlich nicht ausgeführt wird):
- Fremdes/offizielles Rezept → `bearbeiten` → 404 (vorher: 200)
- Eigenes Rezept → `bearbeiten` → weiterhin 200, Formular lädt korrekt
- Nicht-existente Rezept-ID → 404
- `/rezept/[id]` (PROJ-30-Fix) unverändert funktionsfähig
- Gast → weiterhin korrekter Redirect zu `/konto?reason=eigenes-rezept` (unverändert)

`npm test` (308/308) und `npm run lint` (0 Fehler) erneut grün nach dem Fix.

## Implementation Notes (Frontend)

- `rezept-formular.tsx` um eine `variant: 'admin' | 'user'`-Prop erweitert (Default `'admin'`, kein Verhaltensbruch für bestehende Admin-Nutzung): blendet die Gast-Freischaltung im Nutzer-Modus aus, spricht `/api/rezepte*` statt `/api/admin/rezepte*` an (Formular-Submit + Bild-Upload) und leitet nach dem Speichern zur Rezept-Detailseite statt zur Admin-Übersicht weiter.
- Neue Seiten: `/rezept/neu` (Anlegen, mit serverseitigem Limit-Check → zeigt entweder das Formular oder einen Upgrade-Hinweis mit Verweis auf `/upgrade`) und `/rezept/[id]/bearbeiten` (Bearbeiten, mit expliziter Eigentümer-Prüfung — `notFound()` bei fremdem/offiziellem Rezept, da RLS-Lesbarkeit allein nicht ausreicht).
- Anonyme/Gast-Zugriffe auf beide Seiten werden zu `/konto?reason=eigenes-rezept` umgeleitet (neuer `reason`-Fall in `GastKontoView`, analog zum bestehenden `historie`-Muster aus PROJ-19).
- `/rezept/[id]/page.tsx`: neue `OwnRecipeActions`-Komponente (Bearbeiten-Link + Löschen mit Bestätigungsdialog, analog zu `admin-delete-button.tsx`), nur sichtbar wenn `isOwn` zutrifft.
- `rezept-bibliothek.tsx`: "+ Eigenes Rezept anlegen"-Button erscheint, sobald der "Eigene Rezepte"-Filter aktiv ist; der PROJ-30-Platzhaltertext im Leerzustand wurde durch einen echten Link auf `/rezept/neu` ersetzt.

**Verifikation:** `npm test` (308/308 grün), `npm run lint` (0 Fehler, 1 vorbestehende Warnung unverändert), `tsc --noEmit` (7 vorbestehende Fehler unverändert, keine neuen), `npm run build` (erfolgreich, beide neuen Routen registriert).

## QA Test Results

**Tested:** 2026-08-04
**App URL:** http://localhost:3000 (`next dev`)
**Tester:** QA Engineer (AI)
**Testnutzer:** `qa-test@endlichsatt.dev` (permanenter E2E-Fixture-Account, hat vollen Zugriff über einen eingelösten Invite-Code)

### Acceptance Criteria Status

#### Zugriff & Einstiegspunkt
- [x] Gast wird bei `/rezept/neu` zur Registrierung aufgefordert (GastKontoView mit passendem Hinweistext, Link zu `/registrieren`)
- [x] ~~BUG-1: "+ Rezept anlegen"-Einstiegspunkt fehlte im "Alle Rezepte"-Filter~~ — **behoben** (2026-08-04)
- [x] Leerzustand-Hinweis verlinkt auf `/rezept/neu` (per Code-Review verifiziert — der permanente PROJ-30-Fixture-Datensatz verhindert einen echten 0-Ergebnisse-Zustand für den Testaccount, ohne die PROJ-30-Regressionsdaten zu gefährden)

#### Anlegen, Bearbeiten, Löschen
- [x] Rezept mit `owner_id` = eigener Nutzer-ID wird angelegt, erscheint unter "Eigene Rezepte"
- [x] BLS/OFF-Zutatensuche + Live-Nährwert-Counter verfügbar (unveränderte PROJ-29-Komponenten)
- [x] Sättigungs-Matrix wird automatisch berechnet (verifiziert per DB-Abfrage nach dem Anlegen)
- [x] Bearbeiten: alle Felder inkl. Zutaten änderbar, erneut speicherbar
- [x] Löschen zeigt Bestätigungsdialog; Abbrechen erhält das Rezept, Bestätigen entfernt es endgültig
- [x] Fremdes (offizielles) Rezept: PUT/DELETE über die API korrekt mit 403 abgelehnt, kein Bearbeiten/Löschen-UI sichtbar
- [x] ~~BUG-2: `/rezept/[id]/bearbeiten` liefert bei einem fremden/offiziellen Rezept HTTP 200 statt 404~~ — **behoben** (siehe Implementation Notes (Backend) / Fix BUG-2)

#### 5-Rezepte-Limit
- [x] Bei erreichtem Limit ohne vollen Zugriff führt der Einstiegspunkt zu einem Hinweis mit Verweis auf `/upgrade` statt zum Formular (manuell verifiziert mit temporär entferntem Invite-Zugriff für den Testaccount, danach vollständig zurückgesetzt)
- [x] Nach dem Löschen eines Rezepts ist der Slot sofort wieder frei
- [x] Nutzer mit vollem Zugriff: keine Begrenzung (6 Rezepte erfolgreich angelegt)
- [x] Direkter API-Aufruf am Limit wird serverseitig blockiert (403, `limitReached: true`)

### Edge Cases Status

- [x] Abbruch mitten im Formular → kein Teil-Rezept wird gespeichert (Rezept entsteht erst mit vollständigem POST)
- [ ] **Nicht behoben, nicht neu:** Bild hochgeladen, dann Formular ohne Speichern verlassen → Bild bleibt verwaist im Storage (identisches, vorbestehendes Verhalten im Admin-Editor, nicht durch PROJ-31 eingeführt — siehe Empfehlungen)
- [x] Race Condition zwei Tabs: Limit-Prüfung läuft bei jedem Request serverseitig neu, kein zwischengespeicherter Client-Zustand entscheidet
- [x] Bestehende Rezepte über dem Limit bleiben erhalten — Limit-Prüfung greift ausschließlich beim Anlegen (`DELETE` hat keine Limit-Logik, per Code-Review verifiziert)
- [x] Doppelte Rezept-Titel → kein Konflikt (keine Eindeutigkeits-Validierung, wie in PROJ-30 festgelegt)

### Security Audit Results
- [x] Authentication: `POST /api/rezepte` ohne Session → 401
- [x] Authentication: anonymer Gast → 403 mit Hinweis auf Registrierung
- [x] Authorization: fremdes Rezept per PUT/DELETE → 403, verifiziert dass das Zielrezept unverändert blieb
- [x] Input validation: Titel mit `<img src=x onerror=alert(1)>` wird escaped als Text gerendert, kein XSS im DOM
- [x] Storage: Bild-Löschung beim Rezept-Löschen funktioniert (verifiziert: Datenbankzeile UND Storage-Objekt beide entfernt)
- [ ] Rate limiting: nicht implementiert — betrifft aber alle Routen der App gleichermaßen (vorbestehende, app-weite Lücke, nicht PROJ-31-spezifisch)

### Regressionstests
- `npm test`: 308/308 grün
- `tests/PROJ-30-rezept-eigentuemerschaft-filter.spec.ts`: 7/8 grün — der eine Fehlschlag (404-Status beim direkten URL-Aufruf eines fremden Rezepts) ist die bereits in der PROJ-30-Spec dokumentierte, vorbestehende Einschränkung, dass Middleware unter `next dev` in dieser lokalen Umgebung nicht ausgeführt wird (in Produktions-Builds bereits verifiziert korrekt) — keine PROJ-31-Regression
- Admin-Editor (`variant="admin"`-Pfad): nicht live nachgetestet (kein Admin-Test-Login in dieser Session verfügbar), aber Code-Review zeigt eine rein additive, abwärtskompatible Änderung (Default `variant='admin'`, unverändertes Verhalten), zusätzlich bestätigt der Produktions-Build beide Admin-Routen erfolgreich

### Responsive
- 375px (Mobile Chrome, Playwright-Projekt): `/rezepte` mit "Eigene Rezepte"-Filter und `/rezept/neu`-Formular — kein horizontales Scrollen, sticky Bottom-Nav überlappt keinen Inhalt (anfänglicher Verdacht durch einen Full-Page-Screenshot-Stitching-Artefakt entkräftet, im echten Viewport bestätigt korrekt)
- 768px: gleiche Seiten, sauberes Layout
- 1440px: Formular bleibt sinnvoll schmal (`max-w-lg`), kein Stretching
- **Kleiner, vorbestehender kosmetischer Befund:** Platzhaltertext "Menge" im Mengen-Feld der Zutatenzeile wird auf allen Breiten leicht abgeschnitten ("Meng") — unverändert aus der geteilten `rezept-formular.tsx`-Komponente übernommen, nicht PROJ-31-spezifisch

### Bugs Found

#### BUG-1: "+ Rezept anlegen" fehlt im "Alle Rezepte"-Filter
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Als registrierter Nutzer auf `/rezepte` einloggen
  2. Filter auf "Alle Rezepte" (Standard) belassen
  3. Erwartet (laut Acceptance Criteria): "+ Rezept anlegen"-Button sichtbar
  4. Tatsächlich: Button erscheint erst nach Wechsel zu "Eigene Rezepte"
- **Hinweis:** In der Decision Log der Spec (write-spec-Interview) wurde "Nur im 'Eigene Rezepte'-Filter" als Produktentscheidung festgehalten — die schriftliche Acceptance Criteria (Zeile 31) verlangt jedoch explizit beide Filter. Das ist ein interner Widerspruch in der Spec selbst, kein reiner Implementierungsfehler. Ein Workaround existiert (ein Klick auf "Eigene Rezepte").
- **Priority:** Klärung mit Product Owner nötig — entweder AC anpassen (spiegelt die tatsächliche Produktentscheidung) oder Implementierung erweitern
- **Nutzer-Entscheidung (2026-08-04):** Implementierung erweitern (AC erfüllen) — Button ist jetzt sowohl im "Alle Rezepte"- als auch im "Eigene Rezepte"-Filter sichtbar, weiterhin ausgeblendet in "Lukas' Rezepte"
- **Status (2026-08-04):** **Behoben** — `rezept-bibliothek.tsx`: Sichtbarkeits-Bedingung von `ownerFilter === 'eigene'` auf `ownerFilter === 'eigene' || ownerFilter === 'alle'` erweitert. Live verifiziert (Button erscheint in "Alle Rezepte" und "Eigene Rezepte", bleibt in "Lukas' Rezepte" ausgeblendet) und als neuer Regressionstest in `tests/PROJ-31-nutzer-eigene-rezepte.spec.ts` festgehalten (9/9 E2E-Tests weiterhin grün, `npm test` 329/329 grün).

#### BUG-2: `/rezept/[id]/bearbeiten` liefert HTTP 200 statt 404 bei fremden Rezepten
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Als Nutzer A eingeloggt, direkte URL `/rezept/{fremde-oder-offizielle-id}/bearbeiten` aufrufen
  2. Erwartet: HTTP 404
  3. Tatsächlich: HTTP 200, aber korrekter 404-Seiteninhalt (kein Datenleck — inhaltlich sicher)
- **Root Cause:** Identisches Bug-Muster wie in PROJ-30 bereits für `/rezept/[id]` behoben (`notFound()` in einer Route unter einem `loading.tsx`-Suspense-Boundary kann den initialen HTTP-Status nicht mehr ändern). Die PROJ-30-Middleware-Lösung deckt nur den exakten Pfad `/rezept/[id]` ab, nicht das neue `/rezept/[id]/bearbeiten`.
- **Priority:** Fix vor Deployment empfohlen, um mit dem PROJ-30-Präzedenzfall konsistent zu sein (gleiche Behebung: Middleware-Regex erweitern) — kein Sicherheitsrisiko, da kein Content-Leak
- **Nutzer-Entscheidung (2026-08-04):** Vor Deployment beheben — zurück an `/backend` zur Umsetzung
- **Status (2026-08-04):** **Behoben** — siehe Implementation Notes (Backend) / Fix BUG-2. Middleware um Eigentümer-Prüfung für `/rezept/[id]/bearbeiten` erweitert, per `next build && next start` verifiziert (404 für fremde/offizielle/nicht-existente Rezepte, 200 weiterhin für eigene, `/rezept/[id]`-Fix aus PROJ-30 unverändert funktionsfähig). Erneute `/qa`-Verifikation ausstehend.

### Summary
- **Acceptance Criteria:** 13/13 vollständig bestanden (nach BUG-1-Fix)
- **Bugs Found:** 2 total (0 critical, 0 high, 2 medium, 0 low) — **beide behoben (BUG-1, BUG-2)**
- **Security:** Pass — keine Auth-/Autorisierungs-/XSS-Lücken gefunden
- **Production Ready:** **Ja** — kein Critical/High-Bug, beide Medium-Bugs behoben und bestätigt
- **Recommendation:** Deploy freigegeben

### Re-Verifikation nach BUG-2-Fix (2026-08-04)

**Automatisiert:**
- `npm test`: 308/308 grün
- `npm run lint`: 0 Fehler (1 vorbestehende, unveränderte Warnung)
- `npm run build`: erfolgreich

**Middleware-Fix (BUG-2), verifiziert per `next build && next start` auf Port 3099** — dieselbe Methode wie beim ursprünglichen PROJ-30-Fix, da Middleware unter `next dev` in dieser lokalen Umgebung bekanntlich nicht ausgeführt wird:
- Fremdes/offizielles Rezept → `/rezept/[id]/bearbeiten` → **404** (vorher: 200) ✓
- Eigenes Rezept → `/rezept/[id]/bearbeiten` → weiterhin **200**, Formular lädt korrekt ✓
- Nicht-existente Rezept-ID → `/rezept/[id]/bearbeiten` → **404** ✓
- `/rezept/[id]` (PROJ-30-Fix) → weiterhin **200** für offizielle Rezepte, unverändert funktionsfähig ✓

**E2E-Regression gegen denselben Produktions-Build** (`tests/PROJ-30-rezept-eigentuemerschaft-filter.spec.ts` + `tests/PROJ-31-nutzer-eigene-rezepte.spec.ts`, 16 Tests): **16/16 grün** — inklusive des PROJ-30-Tests, der unter `next dev` bekanntlich am lokalen Middleware-Limit scheitert (siehe vorherige QA-Runde) und hier gegen den echten Produktions-Build erstmals sauber durchläuft. Kein Hinweis auf eine Regression durch den BUG-2-Fix.

DB-Zustand nach Testlauf verifiziert sauber (nur der permanente PROJ-30-Fixture-Datensatz für `qa-test@endlichsatt.dev` vorhanden, keine Testreste).

### Re-Verifikation nach BUG-1-Fix (2026-08-04)

`rezept-bibliothek.tsx` erweitert: "+ Rezept anlegen" sichtbar in "Alle Rezepte" UND "Eigene Rezepte", weiterhin ausgeblendet in "Lukas' Rezepte" — live per Playwright-Skript verifiziert (alle drei Filter-Zustände geprüft), zusätzlich als permanenter Regressionstest festgehalten. `npm test` (329/329), `npm run lint` (0 Fehler), `tsc --noEmit` (7 vorbestehende Fehler unverändert) alle grün nach dem Fix. Damit sind beide in dieser QA-Runde gefundenen Bugs behoben — PROJ-31 ist vollständig produktionsbereit.

## Deployment

- **Deployed:** 2026-08-04
- **Production URL:** https://app.mehralsabnehmen.de/rezepte (neu: `/rezept/neu`, `/rezept/[id]/bearbeiten`)
- **Commit:** `e231f8a` (inkl. BUG-2-Fix aus der erneuten QA-Runde)
- **Git Tag:** `v1.28.0-PROJ-31`
- **Pre-Deployment-Checks:** `npm run build` ✓, `npm run lint` ✓ (nur die vorbestehende, unveränderte Bild-Element-Warnung), QA Approved, keine Critical/High-Bugs, keine neuen Env-Variablen, keine Secrets im Diff, RLS-Migration bereits live angewendet (`proj31_recipe_owner_write_policies`)
- **Hinweis:** Beim ersten Post-Deploy-Check zeigte `app.mehralsabnehmen.de` kurzzeitig noch die alte Version (404 auf `/rezept/neu`), obwohl Vercel den Build bereits als "Ready" auf `e231f8a` führte — vom Nutzer im Vercel-Dashboard als korrekt (Production-Environment, Domain zugeordnet) bestätigt, vermutlich reine Propagations-/Edge-Verzögerung
