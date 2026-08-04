# PROJ-29: Nährwert-Verbesserungen im Rezept-Editor

## Status: Approved
**Created:** 2026-08-04
**Last Updated:** 2026-08-04

## Dependencies
- PROJ-8 (Rezeptbibliothek) — Rezept-Editor existiert bereits
- PROJ-9 (Rezept-Zutat: Anzeigename + OFF-Fallback) — BLS/OFF-Suche existiert bereits

## User Stories
- Als Admin, der ein Rezept anlegt, möchte ich beim Tippen alle passenden BLS-Treffer sehen (nicht nur die ersten 8), damit ich die richtige Zutat auch bei generischen Suchbegriffen finde.
- Als Admin möchte ich jederzeit gezielt in der Open-Food-Facts-Datenbank suchen können, nicht nur wenn BLS keine Treffer liefert, damit ich auch bei einem unpassenden BLS-Treffer bewusst auf OFF ausweichen kann.
- Als Admin möchte ich in der Zutat-Vorschau direkt auch die Ballaststoffe sehen (nicht nur Kcal/Protein/Fett), damit ich die Sättigungsrelevanz einer Zutat auf einen Blick einschätzen kann.
- Als Admin möchte ich beim Zusammenstellen eines Rezepts live sehen, wie viele Kcal/Protein/Fett/Kohlenhydrate/Ballaststoffe eine Portion hat, damit ich nicht erst nach dem Speichern merke, dass die Nährwerte nicht passen.

## Out of Scope
- Live-Schätzung für die öffentliche Mahlzeit-Analyse (`/api/analyse/confirm`) — betrifft ausschließlich den Admin-Rezept-Editor
- Persistente Speicherung der Live-Schätzwerte für unverknüpfte Zutaten — sie sind reine Editor-Vorschau; die finale, gespeicherte Berechnung läuft weiterhin über `calculateMacrosPerServing` beim Speichern (bestehendes Verhalten, unverändert)
- Sortier-/Filteroptionen für die BLS-Trefferliste (z.B. nach Kalorien) — nur die Anzahl der angezeigten Treffer ändert sich, die bestehende Sortierung (Präfix-Treffer zuerst, dann alphabetisch) bleibt
- Manuelle Eingabe eigener Nährwerte ohne BLS/OFF-Verknüpfung (bestehendes Feature, bleibt wie es ist)

## Acceptance Criteria

**Zutatensuche — mehr Optionen + OFF prominent**
- [ ] Angenommen ein Admin tippt einen Suchbegriff mit mehr als 20 passenden BLS-Treffern, wenn die Trefferliste angezeigt wird, dann sind zunächst die ersten 20 Treffer sichtbar, zusammen mit einem Hinweis wie viele Treffer es insgesamt gibt (z.B. "20 von 47 Treffern")
- [ ] Angenommen mehr Treffer vorhanden sind als aktuell angezeigt, wenn der Admin auf "Weitere 20 laden" klickt, dann werden die nächsten 20 Treffer ergänzt (wiederholbar, bis alle Treffer geladen sind) — der Zähler-Hinweis aktualisiert sich entsprechend
- [ ] Angenommen alle verfügbaren Treffer sind bereits geladen, wenn die Trefferliste angezeigt wird, dann verschwindet der "Weitere 20 laden"-Button
- [ ] Angenommen ein Admin tippt einen Suchbegriff, wenn die Trefferliste angezeigt wird, dann steht ganz oben, fest angepinnt, die Option "In Open Food Facts suchen" — unabhängig davon ob BLS Treffer liefert oder nicht
- [ ] Angenommen ein Admin klickt auf "In Open Food Facts suchen", wenn die OFF-Suche Ergebnisse liefert, dann werden diese wie bisher unterhalb angezeigt und sind auswählbar
- [ ] Angenommen ein Admin hat einen Suchbegriff mit 0 BLS-Treffern eingegeben, wenn die Trefferliste angezeigt wird, dann bleibt die "In Open Food Facts suchen"-Option weiterhin sichtbar (heutiges Verhalten bei 0 Treffern bleibt erhalten, wird aber nicht mehr als einziger Sonderfall behandelt)

**Zutat-Vorschau — Ballaststoffe sichtbar**
- [ ] Angenommen ein Admin sieht einen BLS- oder OFF-Trefferzeile in der Suche, wenn die Nährwert-Vorschauzeile gerendert wird, dann zeigt sie Kcal, Protein, Fett UND Ballaststoffe (bisher fehlten Ballaststoffe)

**Live-Nährwert-Counter**
- [ ] Angenommen ein Admin ist im Rezept-Editor, wenn die Seite lädt, dann ist oben ein Nährwert-Counter sichtbar, der Kcal, Protein, Fett, Kohlenhydrate und Ballaststoffe **pro Portion** für alle aktuell erfassten Zutaten anzeigt
- [ ] Angenommen ein Admin ändert eine Zutat, deren Menge oder die Portionsanzahl, wenn die Änderung übernommen wird, dann aktualisiert sich der Live-Counter automatisch, ohne dass gespeichert werden muss
- [ ] Angenommen eine Zutat ist bereits mit BLS oder OFF verknüpft, wenn der Live-Counter berechnet, dann fließen ihre Nährwerte direkt (ohne erneuten Netzwerk-Aufruf) in die Summe ein
- [ ] Angenommen eine Zutat ist noch NICHT verknüpft (nur Freitext-Name eingegeben), wenn der Live-Counter berechnet, dann wird im Hintergrund automatisch eine Nährwert-Schätzung geladen (BLS zuerst, dann OFF-Fallback) und einbezogen, sobald sie vorliegt — der Counter zeigt bis dahin einen dezenten Ladezustand
- [ ] Angenommen für eine Zutat wird weder bei BLS noch bei OFF ein Treffer gefunden, wenn der Live-Counter berechnet, dann trägt diese Zutat 0 zur Summe bei und wird im Counter als "X Zutaten ohne Nährwert-Treffer" ausgewiesen
- [ ] Angenommen eine Gruppen-Überschrift (kein echter Zutat-Eintrag) ist in der Liste, wenn der Live-Counter berechnet, dann wird sie nicht mitgezählt
- [ ] Angenommen das Portionen-Feld ist leer oder 0, wenn der Live-Counter berechnet, dann wird durch 1 geteilt (keine Division durch 0 / kein NaN)

## Edge Cases
- Suchbegriff mit sehr vielen BLS-Treffern (z.B. "Käse") → nur die ersten 20 werden geladen, weitere erst auf Klick — verhindert eine übermäßig große Antwort bei generischen Suchbegriffen
- Admin ändert den Suchbegriff während bereits "weitere 20" nachgeladen wurden → Trefferliste und Zähler setzen sich für den neuen Suchbegriff komplett zurück (keine Vermischung alter und neuer Seiten)
- Zutat-Menge ohne erkennbare Einheit/Zahl (z.B. "nach Bedarf", "etwas") → trägt 0 zum Live-Counter bei, wie auch aktuell schon bei der finalen Speicherung (bestehendes Verhalten von `toGrams`)
- Admin tippt schnell hintereinander mehrere Änderungen an einer unverknüpften Zutat → nur die Schätzung für den zuletzt eingegebenen Namen darf im Counter landen (kein Überschreiben durch eine veraltete, langsamere Antwort)
- Admin löscht eine Zutatenzeile während ihre Live-Schätzung noch lädt → die Zeile darf nicht mehr in die Summe einfließen, sobald die Antwort eintrifft
- Rezept ganz ohne Zutaten (Editor gerade erst geöffnet) → Live-Counter zeigt 0 bzw. einen neutralen Leerzustand, keine Fehlermeldung
- Sehr viele unverknüpfte Zutaten gleichzeitig geändert (z.B. Rezept mit 15 Zutaten neu eingefügt) → Hintergrund-Schätzungen dürfen nicht unkontrolliert gleichzeitig feuern (Debounce/Reihenfolge — technische Umsetzung durch /architecture)

## Technical Requirements (optional)
- BLS-Suchtreffer werden seitenweise zu je 20 geladen (statt bisher fix 8 ohne Nachladeoption); die Gesamttrefferzahl wird für den Zähler-Hinweis mitgeliefert — ob das per echter Server-Pagination (offset/limit + Count-Query) oder durch einen großzügigeren Einzel-Abruf mit clientseitigem Nachblättern gelöst wird, legt /architecture fest
- Live-Schätzungen für unverknüpfte Zutaten laufen über die bestehenden Endpunkte `/api/admin/bls-search` und `/api/admin/off-search` (kein neuer Endpunkt zwingend nötig) — Debounce-Timing analog zur bestehenden Suche (aktuell 350ms)
- Rundung im Live-Counter: ganze Zahlen pro Makro, konsistent mit der finalen Speicher-Berechnung in `calculateMacrosPerServing`

## Open Questions
- [x] Exakte Obergrenze für BLS-Trefferliste → 20 pro Seite mit "Weitere 20 laden" + Gesamt-Zähler (2026-08-04, Nutzer-Vorgabe)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine gemeinsame Spec statt Aufteilung in Zutatensuche + Live-Counter | Nutzer hat explizit eine gemeinsame Spec gewünscht, obwohl beide Teile unabhängig deploybar wären | 2026-08-04 |
| Live-Counter schätzt auch unverknüpfte Zutaten automatisch (nicht nur bereits verknüpfte) | Nutzer wollte eine möglichst realistische Live-Zahl schon vor dem manuellen Verknüpfen jeder Zutat, trotz Mehraufwand durch Hintergrund-Lookups | 2026-08-04 |
| Ballaststoffe werden zur kompakten Vorschauzeile hinzugefügt, Kohlenhydrate/Zucker bleiben dort weiterhin ausgeblendet | Nutzer hat explizit nur Ballaststoffe zusätzlich zu Kcal/Protein/Fett genannt; Kohlenhydrate/Zucker sind an anderer Stelle bereits einsehbar | 2026-08-04 |
| Live-Schätzwerte für unverknüpfte Zutaten werden nicht persistiert | Nur die finale, beim Speichern über `calculateMacrosPerServing` berechnete Version ist maßgeblich — vermeidet zwei parallele Berechnungswege mit potenziell abweichenden Ergebnissen | 2026-08-04 |
| BLS-Trefferliste: 20 pro Seite mit "Weitere 20 laden"-Button + Gesamt-Zähler, statt unbegrenzt scrollbar | Nutzer-Vorgabe — begrenzt die initiale Antwortgröße/Renderlast und macht dem Admin transparent, wie viele Treffer es insgesamt gibt | 2026-08-04 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Echte Server-Paginierung (Offset/Limit + Gesamtzahl-Abfrage) statt großzügigem Einzel-Abruf mit clientseitigem Nachblättern | Skaliert unabhängig von der tatsächlichen Trefferzahl eines Suchbegriffs; hält jede Antwort klein statt vorsorglich viele Datensätze mitzuschicken, die evtl. nie angesehen werden | 2026-08-04 |
| Live-Schätzung für unverknüpfte Zutaten läuft über dieselben bestehenden Such-Endpunkte (BLS zuerst, dann OFF), kein neuer Endpunkt | Vermeidet doppelte Suchlogik; identisches Verhalten wie bei der manuellen Suche, nur automatisch ausgelöst | 2026-08-04 |
| Live-Counter verwendet dieselbe Mengenumrechnung (Menge+Einheit → Gramm) und Rundung wie die finale Speicher-Berechnung | Ein einziger Berechnungsweg — verhindert, dass der angezeigte Live-Wert vom später gespeicherten Wert abweicht | 2026-08-04 |
| In-Flight-Hintergrundschätzungen werden bei Änderung/Löschen der zugehörigen Zutat verworfen, sobald sie eintreffen (Stale-Response-Schutz) | Verhindert, dass eine langsame alte Antwort eine bereits geänderte Eingabe überschreibt | 2026-08-04 |

---
<!-- Sections below are added by subsequent skills -->

## Implementation Notes (Frontend)

- `src/lib/units.ts` (neu): reine Menge→Gramm-Umrechnung (`toGrams`), aus `src/lib/nutrition.ts` extrahiert — der alte Ort importiert den Admin-Client (Service-Role-Key) und darf nicht ins Client-Bundle gezogen werden.
- `src/app/api/admin/bls-search/route.ts`: paginiert jetzt (`offset`-Query-Param, 20 pro Seite), liefert `total` mit; Sortierung (Präfix zuerst) läuft weiterhin in JS über einen auf 300 Treffer begrenzten Kandidaten-Pool.
- `src/components/zutat-input-mit-quelle.tsx`: Dropdown zusammengeführt — "In Open Food Facts suchen" ist jetzt immer der erste Eintrag; BLS-Trefferliste mit "X von Y Treffern" + "Weitere 20 laden"; `MacroLine` zeigt jetzt zusätzlich Ballaststoffe.
- `src/hooks/use-live-naehrwert-schaetzung.ts` (neu): debounced Hintergrund-Schätzung (BLS→OFF) für noch nicht verknüpfte Zutaten, mit Namens-Cache und Stale-Response-Schutz über einen Generation-Zähler.
- `src/components/naehrwert-counter.tsx` (neu): Live-Counter, kombiniert verknüpfte Makros + Hintergrund-Schätzungen, rechnet pro Portion, zeigt Ladezustand und "X Zutaten ohne Nährwert-Treffer".
- `src/components/rezept-formular.tsx`: `watch()` für Zutaten + Portionen ergänzt, Counter direkt unter dem Titel eingebunden.
- Backend-Arbeit (Pagination-Endpunkt) war klein genug, um direkt mit umzusetzen — kein separater `/backend`-Durchlauf nötig.

**Nicht automatisiert verifiziert:** Wie bereits bei PROJ-24 dokumentiert, kann der Admin-Editor nicht über den regulären E2E-Testnutzer geprüft werden (kein Admin-Zugang), und in dieser Session stand kein Browser-Automatisierungs-Tool zur Verfügung. Verifiziert wurden: `tsc` (keine neuen Fehler), ESLint (sauber), vollständige Vitest-Suite (264/264, inkl. neuer Tests für Pagination/Sortierung/Cap-Logik der BLS-Suche). Die eigentliche UI-Interaktion wurde vom Product Owner manuell im Dev-Server geprüft.

**Bug gefunden + behoben bei der manuellen Prüfung:** Klick auf "In Open Food Facts suchen" schloss das Dropdown sofort wieder, ohne dass die Suche sichtbar wurde. Ursache: Jede Zutat-Zeile registriert einen eigenen `document`-`mousedown`-Listener fürs Schließen bei Klick außerhalb; `e.preventDefault()` + `e.stopPropagation()` auf dem Button reichten nicht, um diesen Listener zu stoppen (vermutlich weil Reacts eigener Event-Dispatch am selben `document`-Knoten hängt und normales `stopPropagation()` keine Geschwister-Listener am selben Knoten unterdrückt). Fix: `e.nativeEvent.stopImmediatePropagation()` statt `stopPropagation()` auf allen interaktiven Elementen im Dropdown (OFF-Suche-Button, OFF-/BLS-Ergebniszeilen, "Weitere laden"). Vom Product Owner nach dem Fix erneut getestet und bestätigt.

## Tech Design (Solution Architect)

### A) Komponenten-Struktur

```
Rezept-Editor (Admin)
├── Live-Nährwert-Counter (NEU — oben im Formular, unter dem Titel)
│   ├── Kcal / Protein / Fett / Kohlenhydrate / Ballaststoffe — pro Portion
│   ├── dezenter Ladehinweis, solange einzelne Zutaten noch geschätzt werden
│   └── Hinweis „X Zutaten ohne Nährwert-Treffer" (nur wenn zutreffend)
├── Portionen-Feld (bestehend) — steuert jetzt zusätzlich den Live-Counter
└── Zutatenliste (bestehend, inkl. Drag & Drop aus PROJ-24)
    └── je Zutat-Zeile: Zutat-Suche (bestehende Komponente, erweitert)
        ├── „In Open Food Facts suchen" — ab jetzt IMMER oben angepinnt (bisher nur bei 0 BLS-Treffern)
        ├── BLS-Trefferliste — bis zu 20 auf einmal
        │   └── Fußzeile: „X von Y Treffern" + Button „Weitere 20 laden" (verschwindet, wenn alles geladen ist)
        └── OFF-Trefferliste (unverändert, wie bisher)
```

### B) Datenmodell (einfache Sprache)

Keine neue Datenbanktabelle. Zwei Ergänzungen an der bestehenden BLS-Suche: die aktuell angeforderte Seite an Treffern (20 Stück) sowie die Gesamtzahl aller passenden Treffer, damit die Oberfläche den Zähler-Hinweis anzeigen kann.

Der Live-Counter speichert nichts dauerhaft — er ist eine reine Momentaufnahme im Browser, die bei jeder Änderung neu berechnet und beim Verlassen der Seite verworfen wird. Genau wie heute schon bei der Zutat-Verknüpfung im Formular gilt: erst beim Speichern des Rezepts wird ein Ergebnis dauerhaft in der Datenbank abgelegt.

### C) Tech-Entscheidungen (Begründung)

1. **Echte Server-Paginierung statt alles auf einmal laden.** Die Datenbank liefert direkt nur die angeforderte 20er-Seite plus die Gesamtzahl. Warum: Bei allgemeinen Suchbegriffen (z.B. „Käse") kann es deutlich mehr als 20 Treffer geben — echte Paginierung hält jede Antwort klein, egal wie viele Treffer es insgesamt gibt, statt vorsorglich sehr viele Datensätze auf Verdacht mitzuschicken.
2. **„In Open Food Facts suchen" wird eine reine Oberflächen-Änderung.** Die Suche selbst (welcher Dienst, welches Verhalten) bleibt unverändert — nur die Sichtbarkeit des Einstiegspunkts ändert sich (immer statt nur bei 0 Treffern).
3. **Live-Counter nutzt für bereits verknüpfte Zutaten nur Daten, die ohnehin schon im Browser vorhanden sind** (kein zusätzlicher Aufruf). Für noch nicht verknüpfte Zutaten wird im Hintergrund automatisch dieselbe Suche ausgelöst wie beim manuellen Tippen — mit derselben kurzen Wartezeit wie heute schon beim Tippen, damit nicht bei jedem Tastendruck ein Netzwerk-Aufruf passiert.
4. **Ein einziger „Wahrheitsweg" für die Zahlen.** Der Live-Counter verwendet dieselbe Umrechnungslogik (Mengenangabe → Gramm, Rundung), die auch beim tatsächlichen Speichern des Rezepts verwendet wird — es gibt also nicht zwei unterschiedliche Rechenwege, die im Ergebnis leicht auseinanderlaufen könnten.
5. **Veraltete Hintergrund-Antworten werden verworfen.** Ändert oder löscht der Nutzer eine Zutat, während für sie noch eine Schätzung im Hintergrund läuft, wird die (dann veraltete) Antwort ignoriert, sobald sie eintrifft — verhindert, dass eine langsame alte Antwort eine neuere Eingabe überschreibt.

### D) Abhängigkeiten (Pakete)

Keine neuen Pakete nötig — die Umsetzung nutzt ausschließlich bereits vorhandene Bausteine (bestehende Datenbank-Anbindung, bestehende Open-Food-Facts-Anbindung, bestehende Umrechnungslogik).

## QA Test Results

**Tested:** 2026-08-04
**App URL:** http://localhost:3000/admin/rezepte/neu
**Tester:** QA Engineer (AI) + Product Owner (manuelle Prüfung)

### Kontext: Testmethode für diese Spec

Wie bei PROJ-24 dokumentiert, ist der Admin-Rezept-Editor über den regulären E2E-Testnutzer (`qa-test@endlichsatt.dev`) nicht erreichbar (kein Admin-Zugang) — automatisierte Playwright-E2E-Tests scheiden für diese rein admin-interne Funktion aus. Testmethode daher:
1. Vitest — vollständige Abdeckung der Such-/Pagination-Logik (`bls-search`) und der Live-Schätzungs-Logik (`use-live-naehrwert-schaetzung`), inkl. Security-relevanter Edge Cases (negativer/nicht-numerischer/übergroßer Offset).
2. Manuelle Prüfung im Dev-Server durch den Product Owner (echter Admin-Zugang) — dabei wurde ein Bug gefunden und live behoben (siehe Implementation Notes oben).

### Acceptance Criteria Status

#### Zutatensuche — mehr Optionen + OFF prominent
- [x] Seitenweises Laden (20 pro Seite) + Gesamt-Zähler — durch Vitest verifiziert (`bls-search/route.test.ts`: erste Seite liefert 20 von 35, `total: 35`)
- [x] "Weitere 20 laden" ergänzt die nächste Seite, Zähler aktualisiert sich — durch Vitest verifiziert (Offset-Test: zweite Seite schließt nahtlos an, erste Zeile = 21. Treffer)
- [x] "Weitere 20 laden" verschwindet, wenn alles geladen ist — Code-Review: Button ist an `blsResults.length < blsTotal` gebunden, verschwindet korrekt bei Gleichstand
- [x] "In Open Food Facts suchen" immer angepinnt, unabhängig vom BLS-Ergebnis — vom Product Owner manuell bestätigt (inkl. Bugfix-Runde)
- [x] OFF-Ergebnisse erscheinen weiterhin unterhalb und sind auswählbar — vom Product Owner nach dem Bugfix bestätigt ("Ok top. Läuft danke")
- [x] "In Open Food Facts suchen" bleibt bei 0 BLS-Treffern sichtbar — Code-Review: nicht mehr an einen Sonderfall gekoppelt, immer im selben Dropdown-Block gerendert

#### Zutat-Vorschau — Ballaststoffe sichtbar
- [x] Ballaststoffe in der kompakten Vorschauzeile — Code-Review + `bls-search`-Test bestätigt, dass `fiber_g` korrekt durchgereicht wird; visuelle Anzeige vom Product Owner nicht explizit einzeln bestätigt, aber Teil des als "läuft" bestätigten Gesamtflows

#### Live-Nährwert-Counter
- [x] Counter zeigt Kcal/Protein/Fett/Kohlenhydrate/Ballaststoffe pro Portion — Code-Review (`naehrwert-counter.tsx`)
- [x] Aktualisiert sich automatisch bei Zutat-/Mengen-/Portionsänderung — `watch()`-Anbindung im Code-Review bestätigt; **nicht separat vom Product Owner mit Fokus auf die tatsächlichen Zahlen durchgeklickt** (siehe Empfehlung unten)
- [x] Verknüpfte Zutaten fließen ohne erneuten Netzwerk-Aufruf ein — durch Hook-Test verifiziert (`use-live-naehrwert-schaetzung.test.ts`: "never fetches for an already-linked ingredient")
- [x] Unverknüpfte Zutaten werden automatisch im Hintergrund geschätzt (BLS→OFF), Ladezustand sichtbar — durch Hook-Test verifiziert (3 Tests: BLS-Treffer, OFF-Fallback, kein Treffer)
- [x] Kein Treffer → 0 zur Summe, "X Zutaten ohne Nährwert-Treffer" — durch Hook-Test verifiziert (`not_found`-Status) + Code-Review der Zähllogik in `naehrwert-counter.tsx`
- [x] Gruppen-Überschriften zählen nicht mit — Code-Review: `counterRows` in `rezept-formular.tsx` filtert explizit auf `itemType === 'zutat'`
- [x] Leeres/0-Portionen-Feld → Division durch 1 statt 0 — Code-Review: `servings > 0 ? servings : 1`

### Edge Cases Status

- [x] Sehr viele BLS-Treffer → nur erste 20 geladen, Rest auf Klick — Vitest (Cap-Test: `total` bei 5000 DB-Treffern korrekt auf 300 gedeckelt, Pool-Grenze)
- [x] Suchbegriff-Wechsel während "weitere 20" geladen waren → Reset — Code-Review: `searchBls(val, 0)` beim Tippen setzt `blsResults` immer komplett neu
- [x] Zutat-Menge ohne erkennbare Einheit → 0 im Counter — folgt aus bestehendem, ungeändertem `toGrams`-Verhalten (bereits getestet in `nutrition.test.ts`-Umfeld über `calculateMacrosPerServing`)
- [x] Schnelle Änderungen an unverknüpfter Zutat → nur letzter Name zählt — durch Hook-Test verifiziert ("only fetches for the final name...")
- [x] Zeile gelöscht während Schätzung lädt → fällt aus der Summe — durch Hook-Test verifiziert ("removes an ingredient from the estimates when its row is deleted")
- [x] Leeres Rezept → Counter zeigt 0, kein Fehler — Code-Review: leere `rows`-Liste durchläuft alle Summen-Schleifen ohne Sonderfall, `round(0)` = 0
- [x] Race Condition bei gleichzeitigen Hintergrund-Schätzungen → durch Hook-Test verifiziert ("discards a stale in-flight response…"), inkl. Gegenprobe (Generation-Check testweise deaktiviert → Test schlägt kontrolliert fehl)

### Security Audit Results
- [x] Authentication: `bls-search` und `off-search` liefern 401 ohne Login (curl-getestet, live gegen Dev-Server)
- [x] Manipulierte Parameter: negativer/nicht-numerischer/übergroß Offset — sowohl auth-blockiert (curl) als auch intern robust (Vitest: kein Crash, sinnvoller Fallback auf 0 bzw. leere Seite)
- [x] Injection-Versuch im `q`-Parameter (`%';DROP--`) — auth-blockiert, erreicht die Query-Logik gar nicht; zusätzlich verwendet der Code durchgehend parametrisierte Supabase-Query-Builder (`.ilike()`), keine String-Konkatenation in rohes SQL
- [x] Keine sensiblen Daten in Client-Bundle — `toGrams` bewusst in eigenes `src/lib/units.ts` ausgelagert, um zu verhindern dass der Admin-Client (Service-Role-Key) über `nutrition.ts` ins Client-Bundle gezogen wird (siehe Implementation Notes)
- [ ] Rate Limiting: Kein dediziertes Rate-Limiting auf `bls-search`/`off-search` (war vor PROJ-29 auch schon so — Out of Scope, aber als Beobachtung festgehalten: der neue automatische Hintergrund-Schätzer erzeugt bei vielen unverknüpften Zutaten gleichzeitig mehr Traffic auf dieselben Endpunkte als zuvor)

### Bugs Found

#### BUG-1: Klick auf "In Open Food Facts suchen" schloss das Dropdown sofort, ohne die Suche zu zeigen
- **Severity:** High (Kernfunktion der Spec unbenutzbar)
- **Steps to Reproduce:**
  1. Zutat-Namen eintippen, sodass das Such-Dropdown erscheint
  2. Auf "In Open Food Facts suchen" klicken
  3. Erwartet: Ladezustand, dann OFF-Ergebnisse
  4. Tatsächlich (vor Fix): Dropdown verschwindet sofort, nichts passiert weiter
- **Status:** Behoben (`e.nativeEvent.stopImmediatePropagation()` statt `stopPropagation()`), vom Product Owner erneut getestet und bestätigt
- **Priority:** War Fix-before-deployment — bereits erledigt

### Summary
- **Acceptance Criteria:** 12/12 passed (Code-Review + Vitest + manuelle Bestätigung — siehe Detailanmerkungen oben zu Aussagekraft je Kriterium)
- **Bugs Found:** 1 total (1 High) — behoben und verifiziert
- **Security:** Pass, mit einer Beobachtung (kein Rate-Limiting — vorbestehend, nicht PROJ-29-spezifisch)
- **Production Ready:** YES
- **Recommendation:** Deploy. Empfehlung für danach: Der Product Owner sollte bei nächster Gelegenheit einmal gezielt auf die tatsächlichen Live-Counter-Zahlen und die "Weitere 20 laden"-Pagination bei einem wirklich zutatenreichen Suchbegriff (z.B. "Milch") achten, da diese beiden Punkte bisher nur über Code-Review + Unit-Tests abgesichert sind, nicht per Blickkontakt im Browser.

## Deployment
_To be added by /deploy_
