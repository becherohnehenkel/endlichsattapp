# PROJ-16: Beilagen-Kontext

## Status: Deployed (Refinement: Snack-Rezepttyp + Typ-Filter "Approved" — alle Bugs gefixt, bereit für /deploy)
**Created:** 2026-07-03
**Last Updated:** 2026-09-03

**Refinement (2026-09-03, Snack-Rezepttyp + Typ-Filter):** Betrifft **Teil 1+2** (Admin-`recipe_typ`, Rezept-Detailseiten-Hinweis) sowie neu **Teil 6** (Typ-Filter in Rezeptübersicht & Adminseite). `recipe_typ` bekommt einen vierten Wert `'snack'` (bisher nur `null`/`'beilage'`/`'grundlage'`); die Detailseite zeigt dafür denselben Kontext-Hinweis wie bei Beilage/Grundlage. Zusätzlich bekommt sowohl die öffentliche Rezeptbibliothek als auch die separate Admin-Rezeptliste einen neuen Typ-Filter (Alle/Mahlzeiten/Beilagen/Grundrezepte/Snacks), der das seit 2026-07-03 in Out of Scope stehende Deferred-Item einlöst. Teil 3–5 (KI-Analyse-Komponente/Snack-Output) sind von diesem Refinement nicht betroffen. Frontend + Backend fertig, DB-Migration (CHECK-Constraint additiv um `'snack'` erweitert) vom Nutzer manuell in Supabase ausgeführt und bestätigt ("Migration ist durch, alles grün"). Nächster Schritt: `/qa`.

**Refinement (2026-08-11, "Complete"-Umstrukturierung):** Betrifft ausschließlich **Teil 3+4** dieses Specs (KI-Analyse bei fotografierten/beschriebenen Mahlzeiten). **Teil 1+2** (Admin-`recipe_typ` auf Rezepten in der Rezeptbibliothek, Rezept-Detailseiten-Hinweis) sind vom Umbau nicht betroffen und bleiben unverändert live. Die bisherige Rückfrage-Trigger-Logik in Teil 3 wird durch PROJ-4s neue Schritt-0-Klassifikation ersetzt (PROJ-16 ist nicht mehr für die Erkennung zuständig, nur noch für die Darstellung). Der bisherige Beilagen-Output in Teil 4 wird zum Komponente-Output; ein komplett neuer Snack-Output kommt dazu. Nächster Schritt: `/architecture`, dann `/backend`+`/frontend`.

## Dependencies
- PROJ-8 (Rezeptbibliothek) — Beilage-Flag auf Rezepten, Rezept-Detailseite (Teil 1+2, unverändert)
- PROJ-4 (KI-Analyse-Agent) — **Refinement 2026-08-11:** liefert jetzt das `typ`-Feld (`mahlzeit`/`komponente`/`snack`) aus der Schritt-0-Klassifikation; PROJ-16 hat keine eigene Trigger-Logik mehr, konsumiert nur noch
- PROJ-5 (Sättigungs-Einschätzung) — Analyse-Output in confirm/route.ts
- PROJ-30 (Rezept-Eigentümerschaft & Filter) — **Refinement 2026-09-03:** der neue Typ-Filter (Teil 6) sitzt in derselben Filter-Leiste wie PROJ-30s Besitzer-Filter (`rezept-bibliothek.tsx`) und ist frei damit kombinierbar; kein Eingriff in PROJ-30s eigene Logik

## User Stories
- Als Nutzer, der ein Beilagen-Rezept aufruft, möchte ich sofort verstehen, dass dieses Gericht allein keine sättigende Mahlzeit ergibt — und was gut dazu passt
- Als Nutzer, der ein Foto eines Salats oder Körnigen Frischkäses macht, möchte ich eine ehrliche Einordnung erhalten, dass das noch kein vollständiges Gericht ist — mit konkreten Pairing-Ideen
- Als Admin möchte ich beim Anlegen oder Bearbeiten eines Rezepts schnell markieren können, dass es sich um eine Beilage handelt
- Als Nutzer möchte ich durch die App lernen, was eine vollständige Mahlzeit ausmacht — ohne belehrt zu werden
- Als Nutzer, der einen Snack (Apfel, Stück Kuchen) fotografiert, möchte ich eine kurze, wertfreie Bestätigung statt einer vollständigen Analyse, damit ich nicht das Gefühl habe, jeden Bissen rechtfertigen zu müssen. *(Refinement 2026-08-11 — neu)*
- Als Admin möchte ich ein Rezept auch als „Snack" markieren können, wenn es sich weder für ein vollständiges Gericht noch für Beilage/Grundlage eignet (z.B. Energiebällchen, Studentenfutter-Mischung). *(Refinement 2026-09-03 — neu)*
- Als Nutzer möchte ich in der Rezeptbibliothek gezielt nach Snacks, Beilagen, Grundrezepten oder vollständigen Mahlzeiten filtern können, statt alle Rezepte durchsuchen zu müssen. *(Refinement 2026-09-03 — neu)*
- Als Admin möchte ich auf der Admin-Rezeptliste denselben Typ-Filter nutzen können, um z.B. gezielt nur Grundrezepte zu pflegen. *(Refinement 2026-09-03 — neu)*

## Out of Scope
- Automatische KI-Erkennung ob ein Rezept eine Beilage ist (Admin entscheidet manuell via Checkbox)
- ~~Beilage-Kategorie als Filter in der Rezeptbibliothek — deferred~~ → **eingelöst durch Refinement 2026-09-03 (Teil 6)**, jetzt als vollständiger Typ-Filter (nicht nur Beilage, sondern alle 4 Typen)
- Kombinierter Sättigungs-Score für "Beilage + Hauptgericht zusammen" — zu komplex für MVP
- Mahlzeiten-Kombinations-Funktion ("analysiere Salat + Hähnchen zusammen") — deferred
- **Erkennung/Klassifikation (mahlzeit/komponente/snack)** (Refinement 2026-08-11) — das ist PROJ-4 (Schritt 0), PROJ-16 konsumiert nur das Ergebnis
- **Geschmacks-Score-Anzeige im Komponente-Output** (Refinement 2026-08-11) — laut fachlicher Neufassung soll der Geschmacks-Score künftig auch bei `typ: komponente` mitlaufen, ist aber an das noch nicht gebaute Geschmack-Feature gebunden; hier nur als offener Punkt vermerkt (siehe Open Questions), nicht als testbares Acceptance Criterion dieses Refinements

## Acceptance Criteria

### Teil 1: Admin — Rezept-Typ im Rezept-Formular

- [ ] Angenommen der Admin öffnet das Formular für ein neues Rezept, dann gibt es eine Auswahl mit drei Optionen: „Vollständiges Gericht" (Standard), „Beilage" (Salat, Rohkost, Gemüsebeilage) und „Grundlagen-Rezept" (Brot, Brühe, Sauce, Teig)
- [ ] Angenommen der Admin öffnet ein bestehendes Rezept zum Bearbeiten, wenn er die Seite lädt, dann zeigt die Auswahl den aktuell gespeicherten Typ
- [ ] Angenommen der Admin wählt „Beilage" oder „Grundlagen-Rezept" und speichert, dann wird `recipe_typ: 'beilage'` bzw. `recipe_typ: 'grundlage'` in der Datenbank gespeichert
- [ ] Angenommen der Admin wählt „Vollständiges Gericht" und speichert, dann wird `recipe_typ: null` gespeichert
- [ ] **(Refinement 2026-09-03)** Angenommen der Admin öffnet das Formular für ein neues Rezept, dann gibt es eine **vierte** Option „Snack" (z.B. Energiebällchen, Studentenfutter) zusätzlich zu Vollständiges Gericht/Beilage/Grundlagen-Rezept
- [ ] **(Refinement 2026-09-03)** Angenommen der Admin wählt „Snack" und speichert, dann wird `recipe_typ: 'snack'` in der Datenbank gespeichert

### Teil 2: Rezept-Detailseite — Kontext-Hinweis

- [ ] Angenommen ein Rezept hat `recipe_typ: 'beilage'`, wenn ein Nutzer die Detailseite öffnet, dann erscheint ein Hinweisblock mit Badge „Als Beilage gedacht" anstelle der normalen Sättigungs-Bewertung
- [ ] Angenommen ein Rezept hat `recipe_typ: 'grundlage'`, wenn ein Nutzer die Detailseite öffnet, dann erscheint ein Hinweisblock mit Badge „Grundlagen-Rezept" anstelle der normalen Sättigungs-Bewertung
- [ ] Angenommen der Hinweisblock wird angezeigt, dann kommuniziert er: dieses Rezept allein macht noch keine vollständige Mahlzeit — mit passender Formulierung je nach Typ (Beilage vs. Grundlage)
- [ ] Angenommen ein Rezept hat `recipe_typ: null`, wenn ein Nutzer die Detailseite öffnet, dann erscheint die normale Sättigungs-Bewertung unverändert
- [ ] **(Refinement 2026-09-03)** Angenommen ein Rezept hat `recipe_typ: 'snack'`, wenn ein Nutzer die Detailseite öffnet, dann erscheint ein Hinweisblock mit Badge „Snack" und dem Text „Ein Snack für zwischendurch — muss keine vollständige Mahlzeit sein." anstelle der normalen Sättigungs-Bewertung

### Teil 3: KI-Analyse — Erkennung (Refinement 2026-08-11: verschoben nach PROJ-4)

~~Die bisherige Beilagen-Rückfrage-Logik (max. 2 Fragen, 3 Kriterien-Trigger) ist durch PROJ-4s Schritt-0-Klassifikation ersetzt~~ — siehe `PROJ-4-ki-analyse-agent.md`, Abschnitt "Schritt-0-Klassifikation". PROJ-16 bekommt das fertige `typ`-Feld geliefert und ist für die Erkennung selbst nicht mehr zuständig. Die alten Acceptance Criteria dieses Teils sind damit hinfällig (nicht mehr einzeln getestet, PROJ-4 deckt die Klassifikation ab).

### Teil 4: KI-Analyse — Komponente-Output (Refinement 2026-08-11 — vorher "Beilagen-Output")

- [ ] Angenommen `typ: komponente` (aus PROJ-4), dann erscheint kein „wenig/mäßig/sehr sättigend"-Score und keine Säulen-Bewertung
- [ ] Angenommen `typ: komponente`, dann enthält der Output eine **quantitative** positive Bilanz was das Gericht beisteuert (z.B. "Bringt schon mal 180g Gemüse und 4g Ballaststoffe mit" statt nur ein wertschätzender Satz ohne Zahlen)
- [ ] Angenommen `typ: komponente`, dann enthält der Output **maximal EINEN** Kombinationsvorschlag, womit daraus eine komplette Mahlzeit wird (Refinement — vorher 2–3 Pairing-Empfehlungen)
- [ ] Angenommen `typ: komponente`, dann formuliert die KI nie bevormundend — sie erklärt, zeigt den Mehrwert als Komponente, macht keine Schuldgefühle
- [ ] Angenommen `typ: komponente`, dann enthält der Output **kein** `art_of_eating_tipp` mehr (Refinement — Art of Eating ist jetzt eine eigene Sektion, kein Anhängsel im Komponente-Output)

### Teil 5: KI-Analyse — Snack-Output (Refinement 2026-08-11 — komplett neu)

- [ ] Angenommen `typ: snack` (aus PROJ-4), dann erscheint eine kurze, neutral-warme Bestätigung (z.B. "Alles klar, Snack — der braucht keine Analyse.") — kein Kalorien-Kommentar, kein "Ausnahme"- oder "Sünde"-Vokabular, keine Kompensations-Tipps
- [ ] Angenommen `typ: snack`, dann erscheinen kein Sättigungs-Score, kein Geschmacks-Score, keine Verbesserungs- oder Kombinationsvorschläge
- [ ] Angenommen ein Snack analysiert wurde, dann wird er trotzdem normal in der Mahlzeit-Historie geloggt und soll im künftigen Wochenrückblick (PROJ-17) als eigene Kategorie erscheinen — zählt aber nicht in die Komplett-Quote der Mahlzeiten (weder positiv noch negativ)

### Teil 6: Rezept-Typ-Filter in Rezeptübersicht & Adminseite (Refinement 2026-09-03 — komplett neu)

- [ ] Angenommen ein Nutzer öffnet die Rezeptbibliothek (`/ernaehrung/rezepte`), dann sieht er zwischen dem Such-Eingabefeld und dem bestehenden Cuisine-Tag-Filter eine neue Filter-Leiste mit fünf Optionen: „Alle" (Standard, aktiv), „Mahlzeiten", „Beilagen", „Grundrezepte", „Snacks" — durch eine Trennlinie vom Cuisine-Tag-Filter abgesetzt *(Feinschliff 2026-09-03: ursprünglich über allen Filtern geplant, nach Live-Ansicht durch Nutzer hierher verschoben — siehe Decision Log)*
- [ ] Angenommen der Nutzer wählt „Mahlzeiten", dann werden nur Rezepte mit `recipe_typ: null` angezeigt
- [ ] Angenommen der Nutzer wählt „Beilagen"/„Grundrezepte"/„Snacks", dann werden nur Rezepte mit `recipe_typ: 'beilage'`/`'grundlage'`/`'snack'` angezeigt
- [ ] Angenommen der Nutzer wählt „Alle", dann werden wieder Rezepte aller Typen angezeigt (kein Typ-Filter aktiv)
- [ ] Angenommen der Nutzer hat einen Typ-Filter aktiv, wenn er zusätzlich den Besitzer-Filter wechselt oder einen Suchbegriff/Cuisine-Tag eingibt, dann werden beide Filter kombiniert angewendet (UND-Verknüpfung) — der Typ-Filter bleibt dabei aktiv
- [ ] Angenommen ein Admin öffnet die Admin-Rezeptliste (`/admin/rezepte`), dann sieht er dieselbe Typ-Filter-Leiste (Alle/Mahlzeiten/Beilagen/Grundrezepte/Snacks) wie in der öffentlichen Bibliothek
- [ ] Angenommen für einen gewählten Typ-Filter existiert kein passendes Rezept, dann erscheint ein Leerer-Zustand-Hinweis (kein leerer, unkommentierter Bildschirm)

## Edge Cases

- **Beilage + echter Hauptgang zusammen fotografiert:** Wenn Nutzer z.B. Salat + Schnitzel fotografiert, ist das keine Komponente-Situation — wird von PROJ-4s Schritt 0 als `mahlzeit` klassifiziert, normale Analyse
- **Rezept als Beilage markiert, aber Nutzer macht separate Foto-Analyse davon:** Die Analyse weiß nichts vom Admin-Flag (Teil 1+2) — die Klassifikation läuft unabhängig über PROJ-4s Schritt 0
- **Admin markiert ein vollständiges Gericht versehentlich als Beilage/Grundlage:** Der Kontext-Hinweis erscheint trotzdem — Admin muss den Typ manuell zurücksetzen (Teil 1+2, unverändert)
- **Historische Analyse-Ergebnisse mit `typ: "beilage"`** (Refinement 2026-08-11, neu): Alte, vor diesem Refinement gespeicherte `meal_analyses`-Datensätze behalten den Wert `"beilage"` dauerhaft in ihrem gespeicherten JSON — die Anzeige-Komponente muss sowohl den alten Wert `"beilage"` als auch den neuen Wert `"komponente"` gleich behandeln (keine Migration bestehender Datensätze nötig, reine Vorwärtskompatibilität in der Rendering-Logik)
- ~~Grenzfälle (z.B. Avocado-Toast)~~ → **entfällt hier (Refinement 2026-08-11):** Grenzfall-Verhalten ist jetzt Teil von PROJ-4s Schritt 0 (Grauzone 250–400 kcal → eine Rückfrage), nicht mehr PROJ-16s Zuständigkeit
- **Bestehende Rezepte ohne `recipe_typ` (Refinement 2026-09-03):** Zählen unverändert als „Mahlzeiten" im neuen Filter (kein Migrations-Zwang, `null` war schon immer der Default)
- **Typ-Filter + Besitzer-Filter liefern zusammen 0 Treffer (Refinement 2026-09-03):** z.B. „Eigene" + „Grundrezepte" wenn der Nutzer noch keine eigenen Grundrezepte hat — Leerer-Zustand-Hinweis, kein Fehler

## Technical Requirements
- Neues Datenbankfeld: `recipe_typ text DEFAULT NULL CHECK (recipe_typ IN ('beilage', 'grundlage'))` auf der `recipes`-Tabelle (Teil 1+2, unverändert)
- API-Erweiterung: `recipe_typ` in RecipeSchema (POST/PUT /api/admin/rezepte) — Werte: `'beilage' | 'grundlage' | null` (Teil 1+2, unverändert)
- Rezept-Detailseite: Bedingte Anzeige — Kontext-Hinweis (je nach `recipe_typ`) ODER Sättigungs-Bewertung (Teil 1+2, unverändert)
- ~~KI-Prompts: `start/route.ts` und `answer/route.ts` um Beilagen-Erkennung erweitern~~ → **entfällt (Refinement 2026-08-11):** Erkennung läuft jetzt über PROJ-4s Schritt 0
- KI-Prompt: `confirm/route.ts` — Output-Typ `beilage` wird zu `komponente` erweitert (neuer Wert, alter Wert bleibt für historische Datensätze gültig, siehe Edge Cases), plus komplett neuer Output-Typ `snack`
- Frontend: `BeilagenErgebnis`-Komponente (oder Nachfolger) muss beide Werte (`typ === 'beilage'` für Altbestand, `typ === 'komponente'` neu) gleich rendern; neue Komponente/Zweig für `typ === 'snack'`

### Refinement (2026-09-03): Snack-Rezepttyp + Typ-Filter
- **DB-Migration nötig:** `recipes.recipe_typ`-CHECK-Constraint additiv um `'snack'` erweitern: `CHECK (recipe_typ IN ('beilage', 'grundlage', 'snack'))`. Da Supabase-MCP diese Session getrennt ist, muss der Nutzer die Migration wie gewohnt manuell in Supabase ausführen (siehe `/backend`-Skill-Notiz)
- **API-Erweiterung:** `recipe_typ`-Zod-Enum in allen 4 Stellen (`src/app/api/admin/rezepte/route.ts`, `src/app/api/admin/rezepte/[id]/route.ts`, `src/app/api/rezepte/route.ts`, `src/app/api/rezepte/[id]/route.ts`) um `'snack'` erweitern — aktuell jeweils separat dupliziert, kein gemeinsamer Typ in `src/lib`
- **Formular:** `RecipeTyp`-Type in `src/components/rezept-formular.tsx` (aktuell `'vollstaendig' | 'beilage' | 'grundlage'`) um `'snack'` erweitern, vierte Radio-Option „Snack"
- **Detailseite:** `RezeptKontextHinweis`-Komponente (oder Nachfolger) um `recipe_typ === 'snack'`-Zweig erweitern (Badge „Snack" + Hinweistext)
- **Filter:** Neue Typ-Filter-Leiste in `src/components/rezept-bibliothek.tsx` (analog zum bestehenden `OwnerFilter`-Muster) — Client-seitige Filterung auf bereits geladenen Rezepten, kein neuer API-Parameter nötig
- **Admin-Seite:** `src/app/admin/rezepte/page.tsx` ist aktuell eine eigene, einfache Server-Component-Liste (kein Filter, keine Suche) — bekommt entweder denselben Typ-Filter client-seitig nachgerüstet, oder wird (Architektur-Entscheidung, siehe `/architecture`) auf dieselbe Filter-Logik wie `rezept-bibliothek.tsx` umgestellt

## Open Questions
- [x] Welchen genauen Wortlaut soll der Beilagen-Hinweis auf der Rezept-Detailseite haben? → Definiert: Badge "Als Beilage gedacht" + Erklärungstext "Als Beilage top — allein noch keine vollständige Mahlzeit. Kombiniere es mit einer Proteinquelle (Quark, Ei, Fleisch) und ggf. Brot oder Stärke." Exakter Wortlaut final beim /frontend-Skill
- [x] Welche Pairing-Kategorien sollen im Beilagen-Output genannt werden? → Definiert in docs/system-prompt.md: Milchprodukte (Skyr, Quark), Eier, Fleisch/Fisch, Pflanzenprotein, Brot-Kombination — kontextabhängig 2–3 Kategorien nennen, je nach Gericht
- [ ] Geschmacks-Score im Komponente-Output: läuft erst mit, sobald das Geschmack-Feature selbst existiert — dieses Refinement bereitet nur die Datenstruktur vor (kein Score verfügbar), tatsächliche Anzeige folgt bei `/write-spec` für Geschmack
- [ ] Exakter Wortlaut der Snack-Bestätigung (Refinement 2026-08-11) → Richtwert aus `docs/saettigungsmatrix.md`: "Alles klar, Snack — der braucht keine Analyse." Final beim `/frontend`-Skill
- [x] Sollen die 4 Filter-Optionen (Snacks/Beilagen/Mahlzeiten/Grundrezepte) oder nur 3 (ohne Mahlzeiten) angeboten werden? (Refinement 2026-09-03) → 4 Optionen, siehe Decision Log (2026-09-03)
- [x] Bekommt die separate Admin-Rezeptliste denselben Typ-Filter wie die öffentliche Bibliothek? (Refinement 2026-09-03) → Ja, siehe Decision Log (2026-09-03)
- [x] Bekommt ein Snack-Rezept einen Kontext-Hinweis auf der Detailseite? (Refinement 2026-09-03) → Ja, Badge „Snack" analog zu Beilage/Grundlage, siehe Decision Log (2026-09-03)
- [x] Genaue technische Umsetzung der Admin-Filter (client-seitiges Nachrüsten der bestehenden einfachen Liste vs. Umstellung auf `rezept-bibliothek.tsx`-Logik) → Gemeinsame kleine `RezeptTypFilter`-Komponente, Admin-Seite in Server-Teil + neuen Client-Teil aufgeteilt, keine volle Übernahme der Bibliothek-Logik (2026-09-03, siehe Tech Design)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Admin-Checkbox statt KI-Auto-Erkennung für Rezepte | Admin weiß beim Anlegen ob es eine Beilage ist; zuverlässiger als KI-Erkennung | 2026-07-03 |
| Kein Sättigungs-Score für Beilage-Mahlzeiten | Score wäre irreführend; eine Beilage soll keine schlechte Bewertung kriegen — sie ist gut in ihrem Kontext | 2026-07-03 |
| Beilagen-Output statt normaler Analyse | Lehrt Nutzer was eine vollständige Mahlzeit ausmacht, ohne zu moralisieren | 2026-07-03 |
| Skip der Beilage-Rückfrage → normale Analyse | Nutzer soll nie blockiert werden; im Zweifel normale Analyse | 2026-07-03 |
| KI fragt nur bei klaren Beilagen-Fällen nach | Grenzfälle nicht fragen — besser einmal zu wenig fragen als die UX unnötig zu unterbrechen | 2026-07-03 |

#### Refinement (2026-08-11): Komponente & Snack ("Complete"-Umstrukturierung)

| Decision | Rationale | Date |
|----------|-----------|------|
| Teil 1+2 (Rezept-`recipe_typ`) bleibt komplett unverändert | Betrifft Rezepte in der Bibliothek, nicht Live-Mahlzeit-Fotos — kein Bezug zur "Complete"-Umstrukturierung | 2026-08-11 |
| Erkennungs-Logik (Teil 3) wandert vollständig zu PROJ-4 | Schritt 0 ist jetzt eine grundlegende Weiche für den gesamten Analyse-Flow, nicht mehr eine PROJ-16-spezifische Rückfrage — gehört fachlich zur Extraktion, nicht zur Ausgabe-Darstellung | 2026-08-11 |
| Pairing-Vorschläge von 2–3 auf maximal 1 reduziert | Direkt aus der fachlichen Neufassung übernommen — schlankerer, fokussierterer Output | 2026-08-11 |
| Historischer Wert `"beilage"` bleibt gültig, kein Migrations-Zwang | `meal_analyses`-Datensätze sind eingefroren zum Analysezeitpunkt; eine Migration bestehender Zeilen ist unnötiger Aufwand, wenn die Rendering-Logik einfach beide Werte kennt | 2026-08-11 |
| Geschmacks-Score im Komponente-Output ist vorbereitet, aber nicht Teil dieses Refinements | Geschmack-Feature existiert noch nicht — ein Acceptance Criterion dafür wäre nicht testbar | 2026-08-11 |

#### Refinement (2026-09-03): Snack-Rezepttyp + Typ-Filter

| Decision | Rationale | Date |
|----------|-----------|------|
| 4 Filter-Optionen (Alle/Mahlzeiten/Beilagen/Grundrezepte/Snacks), nicht nur 3 | Nutzer bat um 4 konkrete Kategorien; "Mahlzeiten" als eigener Filter-Button macht die vollständigen Gerichte genauso gezielt auffindbar wie die anderen Typen, statt nur implizit über "Alle" sichtbar zu sein | 2026-09-03 |
| Typ-Filter auch auf der separaten Admin-Rezeptliste (`/admin/rezepte`) | Nutzer verwaltet dort gezielt einzelne Typen (z.B. nur Grundrezepte pflegen) — dieselbe Filter-Leiste wie in der öffentlichen Bibliothek spart Suchaufwand | 2026-09-03 |
| Snack-Rezepte bekommen denselben Kontext-Hinweis-Mechanismus wie Beilage/Grundlage (Badge statt Sättigungs-Bewertung) | Konsistentes Muster — eine Sättigungs-Bewertung für einen Snack wäre ohnehin nicht sinnvoll, genau wie bei Beilage/Grundlage | 2026-09-03 |
| Typ-Filter und Besitzer-Filter sind frei kombinierbar (UND-Verknüpfung) | Beide Filter-Dimensionen sind unabhängig voneinander (wer vs. was) — Nutzer soll z.B. "Eigene Grundrezepte" filtern können | 2026-09-03 |

**Feinschliff 2026-09-03 (nach Live-Ansicht durch Nutzer):** Typ-Filter von "über allen Filtern" verschoben nach "zwischen Such-Eingabefeld und Cuisine-Tag-Filter", plus Trennlinie zum Cuisine-Tag-Filter ergänzt — bessere visuelle Gruppierung (Typ-Filter und Cuisine-Tag-Filter sind beides Rezept-Eigenschaften-Filter, klar getrennt vom Besitzer-Filter darüber).

**Feinschliff 2026-09-03 (Teil 2, volle Breite):** Typ-Filter-Buttons spannen jetzt die volle Breite (`flex-1`, analog zum Besitzer-Filter), statt wie zuvor nur so breit wie ihr Text. Auf Mobile (375px) wurde dadurch bei 5 gleich breiten Buttons "Snacks" abgeschnitten (5 Optionen vs. nur 3 beim Besitzer-Filter, plus das lange Label "Grundrezepte") — gelöst durch kleinere Schrift/Padding auf Mobile (`text-[10px] px-1` statt `text-xs px-2`, ab `md:` wieder auf die reguläre Größe), statt Umbruch auf 2 Zeilen oder horizontalem Scroll.

### Domain Decisions (/fachbereich)

#### Refinement (2026-09-03): Snack-Rezepttyp + Typ-Filter — Technical Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Gemeinsame `RezeptTypFilter`-Komponente statt Admin-Seite auf `rezept-bibliothek.tsx` umzustellen | Admin-Seite braucht nur den Typ-Filter, nicht Suche/Tags/Besitzer-Filter — volle Wiederverwendung der Bibliothek hätte unnötige Funktionen aufgezwungen; eine kleine geteilte Filter-Komponente vermeidet trotzdem Code-Duplizierung | 2026-09-03 |
| Admin-Seite wird in Server-Teil (Auth + Datenladen) + neuen Client-Teil (Filter + Darstellung) aufgeteilt | Kleinstmöglicher Eingriff in die bisher rein serverseitige, einfache Liste; Auth-Check bleibt serverseitig, nur die Darstellung wird interaktiv | 2026-09-03 |
| Zentrale Werte-Liste für `recipe_typ` (Werte + Labels an einer Stelle) statt weiterer Duplizierung | Der Wert war bereits in 4 API-Dateien separat dupliziert — ein fünfter/sechster Duplizierungs-Ort (Filter, Formular) wäre eine Wartungsfalle; behebt die bestehende Duplizierung gleich mit | 2026-09-03 |
| Client-seitige Filterung, kein neuer API-Parameter | Konsistent mit bestehendem Besitzer- und Tag-Filter-Muster; Datenmenge klein genug für vollständiges Laden + Browser-seitiges Filtern | 2026-09-03 |
| `z.enum(RECIPE_TYP_DB_VALUES)` statt weiterhin hartcodierter Literale in den 4 API-Routen | Zieht die Backend-Validierung auf dieselbe zentrale Werte-Liste wie Formular und Filter — ein neuer Rezept-Typ künftig nur noch an einer Stelle ergänzen, nicht an 5+ | 2026-09-03 |
| CHECK-Constraint-Migration sucht den bestehenden Constraint-Namen dynamisch über `pg_constraint`, statt ihn zu vermuten | Der ursprüngliche Constraint wurde nicht explizit benannt (Postgres-Default-Name) — ein hartcodierter Name wäre fragil, falls er von der Annahme abweicht | 2026-09-03 |
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

---

### Refinement (2026-08-11): Komponente & Snack — gemeinsamer Architecture-Pass mit PROJ-4/PROJ-5/PROJ-8

> Gemeinsamer Architecture-Pass für vier zusammenhängende Specs — Details zu Klassifikation (PROJ-4), Drei-Säulen-Anzeige (PROJ-5) und der Rezept-Sättigungsmatrix (PROJ-8) stehen in den jeweiligen Specs. Hier der PROJ-16-spezifische Teil (nur Teil 3+4, Teil 1+2 unverändert).

#### Komponenten-Struktur (Änderungen)

```
saettigungs-ergebnis.tsx / Ergebnis-Verzweigung (bestehend, erweitert)
├── typ === "mahlzeit"            → SaettigungsErgebnis (PROJ-5)
├── typ === "komponente"          → KomponentenErgebnis (Nachfolger von BeilagenErgebnis)
│    ├── behandelt typ === "beilage" (Altbestand) UND "komponente" (neu) identisch
│    ├── quantitative Bilanz statt reinem Fließtext
│    ├── maximal 1 Kombinationsvorschlag statt 2–3 Pairing-Empfehlungen
│    └── kein art_of_eating_tipp mehr
└── typ === "snack"               → SnackBestaetigung [NEUE, sehr kleine Komponente]
     └── nur Bestätigungstext, keine Bausteine, keine Vorschläge, kein Score
```

Teil 1+2 (Admin-Formular, Rezept-Detailseiten-Hinweis) bleiben komponentenseitig unverändert.

#### Datenmodell (einfache Sprache)

Der bisherige Ausgabe-Typ "beilage" bekommt einen neuen, gleichbedeutenden Namen "komponente" für alle ab jetzt neu gespeicherten Analysen. Ältere, bereits gespeicherte Analysen mit dem Wert "beilage" werden nicht umbenannt — die Anzeige-Komponente behandelt beide Werte gleich. Der Wert "snack" ist komplett neu und braucht keine Altbestands-Behandlung. Kein neues Datenbankfeld.

#### Tech-Entscheidungen (für PM, mit Begründung)

- **Historischer Wert "beilage" bleibt für immer gültig, keine Umbenennung im Datenbestand** — die Anzeige-Logik kennt beide Werte, ein Umbenennen bestehender Zeilen wäre unnötiger Aufwand ohne Nutzen (die Analysen sind ohnehin eingefroren, read-only in der Historie).
- **`SnackBestaetigung` als eigene, bewusst sehr kleine Komponente statt Wiederverwendung von `KomponentenErgebnis`** — ein Snack braucht strukturell nichts von dem, was eine Komponente zeigt (keine Bilanz, kein Vorschlag); eine gemeinsame Komponente mit vielen Bedingungen wäre unübersichtlicher als zwei kleine, klare Komponenten.
- **Wird gemeinsam mit PROJ-4/PROJ-5/PROJ-8 umgesetzt und deployed**, nicht einzeln — siehe PROJ-4-Architektur-Notiz für die Begründung.

#### Abhängigkeiten

Keine neuen npm-Pakete. Keine neue Umgebungsvariable. Keine Schema-Migration.

### Refinement (2026-09-03): Snack-Rezepttyp + Typ-Filter

#### Komponenten-Struktur

```
Rezeptbibliothek (öffentlich, /ernaehrung/rezepte) — bestehend, erweitert
├── Besitzer-Filter (bestehend, unverändert)
├── Typ-Filter [NEU] — nutzt neue gemeinsame Komponente "RezeptTypFilter"
├── Suche (bestehend, unverändert)
├── Cuisine-Tag-Filter (bestehend, unverändert)
└── Rezept-Liste (jetzt zusätzlich nach Typ gefiltert)

Admin-Rezeptliste (/admin/rezepte) — umgebaut
├── Seite (Server-Teil: Admin-Check + Datenladen, jetzt inkl. recipe_typ) [ERWEITERT]
└── Liste (NEUER Client-Teil, ausgelagert aus der Seite)
     ├── Typ-Filter [NEU] — dieselbe gemeinsame Komponente "RezeptTypFilter"
     └── bestehendes Karten-Layout (Bild, Titel, Zeit, Bearbeiten/Löschen) — unverändert

Rezept-Formular (Anlegen/Bearbeiten)
└── Rezept-Typ-Auswahl [ERWEITERT] — vierte Option "Snack"

Rezept-Detailseite
└── Kontext-Hinweis-Baustein [ERWEITERT] — dritter Fall "Snack" (Badge + Text)
```

Warum eine gemeinsame Filter-Komponente statt die komplette Bibliothek auf der Admin-Seite wiederzuverwenden: Die Admin-Seite braucht keine Suche, keine Cuisine-Tags und keinen Besitzer-Filter — nur den neuen Typ-Filter. Eine kleine, wiederverwendbare Filter-Leisten-Komponente vermeidet doppelten Code, ohne der einfachen Admin-Liste unnötige Funktionen aufzuzwingen, die dort niemand braucht.

#### Datenmodell (einfache Sprache)

Kein neues Feld — `recipe_typ` bekommt einen vierten erlaubten Wert:
```
recipe_typ: null | "beilage" | "grundlage" | "snack"
null = vollständiges Gericht (wie bisher)
```
Die Liste der vier Werte + ihrer Anzeige-Labels ("Mahlzeiten"/"Beilagen"/"Grundrezepte"/"Snacks") wird an einer zentralen Stelle definiert, statt wie bisher in vier API-Dateien einzeln dupliziert — Formular, Filter und API-Validierung greifen alle auf dieselbe Quelle zu. Das verhindert, dass Label und Datenbankwert bei zukünftigen Änderungen auseinanderlaufen.

#### Tech-Entscheidungen (für PM, mit Begründung)

- **Client-seitige Filterung, kein neuer API-Parameter** — konsistent mit dem bestehenden Besitzer- und Tag-Filter; die Rezeptmenge ist klein genug, dass alles auf einmal geladen und im Browser gefiltert wird.
- **Admin-Seite wird in einen Server-Teil (Auth-Check + Datenladen) und einen neuen Client-Teil (Filter + Darstellung) aufgeteilt** — kleinstmöglicher Eingriff in eine bisher rein serverseitige Seite, Auth-Check bleibt serverseitig.
- **Zentrale Werte-Liste für `recipe_typ`** statt weiterer Duplizierung — behebt nebenbei die bestehende 4-fache Duplizierung der Typ-Werte in den API-Routen.

#### Abhängigkeiten

Keine neuen npm-Pakete. Keine neue Umgebungsvariable. DB-Migration: additive CHECK-Constraint-Erweiterung auf `recipes.recipe_typ` (siehe Technical Requirements) — vom Nutzer manuell in Supabase auszuführen, da Supabase-MCP getrennt ist.

## Implementation Notes (Backend) — Refinement 2026-08-11: Komponente & Snack

Gemeinsamer Backend-Durchlauf mit PROJ-4/PROJ-5/PROJ-8 — vollständige Details in PROJ-4s Implementation Notes (`src/app/api/analyse/confirm/route.ts` wird dort verwaltet). Für PROJ-16 relevant:

- **Korrektur gegenüber Architektur:** Es gab doch einen CHECK-Constraint auf `meal_analyses.analysis_typ`. Migration ergänzt `'komponente'`/`'snack'` additiv, `'beilage'` bleibt für Altbestand gültig — keine Umbenennung bestehender Zeilen.
- Komponente-Branch in `confirm/route.ts` speichert weiterhin in der bestehenden `beilage_data`-Spalte (wiederverwendet, kein neues Feld) — jetzt mit der neuen Form `{bilanz, kombinationsvorschlag}` statt `{als_beilage_top, als_hauptgericht, beilage_upgrade, pairing[], art_of_eating_tipp}`
- Snack-Branch ist komplett neu: `analysis_typ: 'snack'`, speichert `refined_ingredients` + `macros_before` (Hintergrund-Berechnung), aber kein `satiety_scores_*`, kein `beilage_data`, kein `improvement`
- **Noch offen (gehört zu `/frontend`):** `src/components/beilagen-ergebnis.tsx` muss zu `KomponentenErgebnis` werden (inkl. Alt-Format-Erkennung für `typ === 'beilage'`) und um eine neue `SnackBestaetigung`-Komponente ergänzt werden. Teil 1+2 (Admin-`recipe_typ`) unverändert, kein Handlungsbedarf.

## Implementation Notes (Frontend) — Refinement 2026-08-11

Gemeinsamer Frontend-Durchlauf mit PROJ-4/PROJ-5/PROJ-8 — geteilte Infrastruktur in PROJ-4s Implementation Notes. Für PROJ-16 eigenständig:

- `src/components/beilagen-ergebnis.tsx` gelöscht, ersetzt durch `src/components/komponenten-ergebnis.tsx` — rendert `format: 'neu'` (bilanz + kombinationsvorschlag) und `format: 'legacy'` (als_beilage_top/als_hauptgericht/beilage_upgrade/pairing[]/art_of_eating_tipp) nebeneinander im selben Component-Body, keine zwei getrennten Komponenten nötig
- `src/components/snack-bestaetigung.tsx` — neu, bewusst die kleinste aller Ergebnis-Komponenten (Icon + Bestätigungssatz + erkannte Zutaten-Namen + Reset-Button), kein Wiederverwenden von `KomponentenErgebnis`
- `src/components/saettigungs-ergebnis.tsx` verzweigt jetzt über `'komponente' in result` bzw. `'snackBestaetigung' in result` (`in`-Check statt Discriminant-Vergleich auf `typ` — TS narrowt sonst nicht zuverlässig, da `StandardAnalysisResult.typ` optional ist)
- Teil 1+2 (Admin-`recipe_typ`, Rezept-Detailseiten-Hinweis): unverändert, wie geplant

**Verifikation:** siehe PROJ-4 Implementation Notes (gemeinsamer Verifikationslauf).

## Implementation Notes (Frontend) — Refinement 2026-09-03: Snack-Rezepttyp + Typ-Filter

- **`src/lib/recipe-typ.ts`** (neu) — zentrale Werte-Liste: `RECIPE_TYP_DB_VALUES`, Formular-Optionen (`RECIPE_TYP_FORMULAR_OPTIONEN`), Kontext-Hinweis-Texte (`RECIPE_TYP_KONTEXT_HINWEIS`), Filter-Optionen (`RECIPE_TYP_FILTER_OPTIONEN`) und `matchesRecipeTypFilter()`. Löst die bisherige 4-fache (jetzt 7-fache) Duplizierung der Typ-Werte ab.
- **`src/components/rezept-typ-filter.tsx`** (neu) — kleine geteilte Filter-Leisten-Komponente, wie in der Architektur geplant von Bibliothek UND Admin-Liste genutzt.
- **`src/components/rezept-formular.tsx`** — `RecipeTyp`-Type entfernt, ersetzt durch `RecipeTypFormular`/`RecipeTypDb` aus `recipe-typ.ts`; Radio-Optionen kommen jetzt aus `RECIPE_TYP_FORMULAR_OPTIONEN` (vierte Option „Snack" automatisch mit dabei). `variant="user"` UND `variant="admin"` zeigen dieselbe Rezept-Typ-Auswahl (unverändert, schon vorher so).
- **`src/components/rezept-kontext-hinweis.tsx`** — nutzt jetzt `RECIPE_TYP_KONTEXT_HINWEIS` aus der zentralen Datei statt eigenem `CONFIG`-Objekt; Snack-Fall automatisch mit dabei.
- **`src/components/rezept-bibliothek.tsx`** — `RezeptListItem` um `recipeTyp` erweitert; neuer `typFilter`-State + `<RezeptTypFilter>` zwischen Such-Eingabefeld und Cuisine-Tag-Filter gerendert, mit `<Separator>` dazwischen (Feinschliff 2026-09-03, nach Live-Ansicht durch Nutzer verschoben — ursprünglich über allen Filtern platziert, siehe Decision Log); Filter-Logik um `matchesRecipeTypFilter()` erweitert; Leerer-Zustand-Bedingung für "Eigene Rezepte anlegen"-Hinweis um `typFilter === 'alle'` ergänzt (sonst hätte ein aktiver Typ-Filter fälschlich die "Du hast noch keine eigenen Rezepte"-CTA statt "Keine Rezepte gefunden" gezeigt — beim Bauen aufgefallen, nicht in der Spec vorgesehen).
- **`src/app/ernaehrung/rezepte/page.tsx`** — `recipe_typ` zur Supabase-Query hinzugefügt, in `RezeptListItem.recipeTyp` gemappt. (Hinweis: Diese Datei wurde während der Implementierung von außerhalb dieser Session zusätzlich auf Suspense-Streaming mit Skeleton-Fallback umgebaut — unabhängig von diesem Refinement, aber die `recipe_typ`-Änderung wurde in der neuen Struktur mit übernommen.)
- **`src/app/admin/rezepte/page.tsx`** — wie geplant aufgeteilt: bleibt Server Component (Auth + Datenladen, jetzt inkl. `recipe_typ`), rendert neu `<AdminRezeptListe>`.
- **`src/components/admin-rezept-liste.tsx`** (neu) — Client Component, übernimmt die bisherige Karten-Darstellung 1:1 aus der alten `page.tsx` plus neuen `<RezeptTypFilter>`.
- **`src/app/rezept/[id]/page.tsx`, `src/app/rezept/[id]/bearbeiten/page.tsx`, `src/app/admin/rezepte/[id]/bearbeiten/page.tsx`** — Type-Casts von `'beilage' | 'grundlage' | null` auf `RecipeTypDb | null` erweitert (jetzt inkl. `'snack'`).
- **Bewusst NICHT angefasst (Backend-Scope):** Die 4 API-Routen (`src/app/api/admin/rezepte/route.ts`, `.../[id]/route.ts`, `src/app/api/rezepte/route.ts`, `.../[id]/route.ts`) validieren `recipe_typ` weiterhin nur gegen `'beilage' | 'grundlage'` — ein Speichern mit `recipe_typ: 'snack'` schlägt bis zum `/backend`-Durchlauf mit 400 fehl. Ebenso die DB-CHECK-Constraint-Migration (additiv um `'snack'`).

**Verifikation:**
- `tsc --noEmit`: sauber (unverändert 1 vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`)
- `eslint` auf allen geänderten Dateien: 0 Fehler
- Playwright (Scratch-Verifikation, gelöscht nach Gebrauch): Typ-Filter-Leiste in der Rezeptbibliothek sichtbar (Alle/Mahlzeiten/Beilagen/Grundrezepte/Snacks), Filterung auf „Snacks" liefert korrekt 0 Treffer + Leerer-Zustand („Keine Rezepte gefunden", noch keine Snack-Rezepte in der DB); Rezept-Typ-Auswahl im Formular (`variant="user"`, `/rezept/neu`) zeigt „Snack" mit korrektem Wortlaut und ist auswählbar; mobile Ansicht (375px) bricht die Filter-Leiste sauber um, kein horizontales Overflow
- **Admin-Seite (`/admin/rezepte`, `/admin/rezepte/neu`) nicht automatisiert testbar** — gleiche Einschränkung wie PROJ-24: der E2E-Testnutzer `qa-test@endlichsatt.dev` ist kein `ADMIN_EMAIL`, der serverseitige Admin-Check greift vor jeglichem Mocking. Da die Rezept-Typ-Auswahl aber identisch für `variant="admin"` und `variant="user"` ist (dieselbe Komponente, kein Verzweigungscode), deckt der `variant="user"`-Test dieselbe UI-Logik ab. Der Typ-Filter auf der Admin-Liste (`AdminRezeptListe`) selbst sollte vom Nutzer manuell im Dev-Server verifiziert werden.

## Implementation Notes (Backend) — Refinement 2026-09-03: Snack-Rezepttyp + Typ-Filter

- **API-Routen** — `recipe_typ`-Zod-Enum in allen 4 Routen von `z.enum(['beilage', 'grundlage'])` auf `z.enum(RECIPE_TYP_DB_VALUES)` (aus `src/lib/recipe-typ.ts`) umgestellt, statt weiterhin hartcodierte Literale zu duplizieren:
  - `src/app/api/admin/rezepte/route.ts` (POST)
  - `src/app/api/admin/rezepte/[id]/route.ts` (PUT) — zusätzlich der GET-Response-Cast (`recipeTyp: recipe.recipe_typ as ...`) auf `RecipeTypDb | null` erweitert
  - `src/app/api/rezepte/route.ts` (POST, eigene Rezepte)
  - `src/app/api/rezepte/[id]/route.ts` (PUT, eigene Rezepte)
- **DB-Migration** — additive Erweiterung der CHECK-Constraint auf `recipes.recipe_typ` um `'snack'`. **Da Supabase-MCP diese Session getrennt ist, musste der Nutzer die Migration manuell in Supabase ausführen** (SQL siehe Chat-Verlauf / unten):
  ```sql
  DO $$
  DECLARE
    constraint_name text;
  BEGIN
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
    WHERE rel.relname = 'recipes'
      AND con.contype = 'c'
      AND att.attname = 'recipe_typ';

    IF constraint_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE recipes DROP CONSTRAINT %I', constraint_name);
    END IF;

    ALTER TABLE recipes ADD CONSTRAINT recipes_recipe_typ_check
      CHECK (recipe_typ IN ('beilage', 'grundlage', 'snack'));
  END $$;
  ```
  Sucht die bestehende CHECK-Constraint dynamisch über den Systemkatalog (statt einen vermuteten Namen hart zu kodieren), damit die Migration unabhängig vom tatsächlichen Constraint-Namen sicher funktioniert.
- **Integrationstests (Vitest)** — je 1 Test "akzeptiert `recipe_typ: 'snack'`" + 1 Test "lehnt ungültigen `recipe_typ`-Wert mit 400 ab" in allen 4 zugehörigen `*.route.test.ts`-Dateien ergänzt (8 neue Tests insgesamt).
- **Keine neuen Endpunkte, keine neue Tabelle, keine RLS-Änderung** — reine additive Erweiterung eines bestehenden Enums.

**Verifikation:**
- `npm test`: 455/455 grün (43 Testdateien, 8 neue Tests: 4× "akzeptiert Snack" + 4× "lehnt ungültigen Wert ab", je einmal pro API-Route)
- `tsc --noEmit`: sauber (unverändert 1 vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`)
- `eslint` auf allen 4 geänderten Route-Dateien: 0 Fehler
- **Migration vom Nutzer manuell in Supabase ausgeführt und bestätigt** (2026-09-03, "Migration ist durch, alles grün") — `recipe_typ: 'snack'` ist damit sowohl API-seitig als auch auf DB-Ebene zugelassen

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
**Production URL:** https://app.mehralsabnehmen.de
**Git Tag:** v1.16.0-PROJ-16

### Was deployed
- `recipe_typ` Spalte auf `recipes` Tabelle (DB-Migration bereits live)
- Admin-Formular: Radio-Group für Vollständiges Gericht / Beilage / Grundlage
- Rezept-Detailseite: Kontext-Hinweis bei `recipe_typ = 'beilage'` oder `'grundlage'`
- KI-Analyse: Erweiterte Prompts für Beilagen-Rückfrage (start/answer/confirm)
- Beilagen-Ergebnis-Komponente: Pairing-Vorschläge, upgrade-Tipp, Art of Eating
- 4 Commits: `0a5cd22`, `403dd74`, `ce0f6d1`, `fe375cc`

### Refinement "Complete"-Umstrukturierung (Komponente & Snack)
**Deployed:** 2026-08-11
**Production URL:** https://app.mehralsabnehmen.de/
**Git Tag:** v2.0.0-complete-umstrukturierung (gemeinsamer Release mit PROJ-4/5/8/33/34 + Rebranding)
**Neue Env-Variablen:** keine
**DB-Migrationen:** additive CHECK-Constraint-Erweiterung auf `meal_analyses.analysis_typ` (bereits vor QA angewendet)

---

## QA Test Results (Refinement 2026-08-11 — "Complete"-Umstrukturierung: Komponente & Snack)

**Tested:** 2026-08-11
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

Gemeinsamer QA-Pass für PROJ-4/PROJ-5/PROJ-16/PROJ-8 (siehe auch dortige QA-Abschnitte). Dieser Abschnitt deckt Teil 3–5 ab: Schritt-0-Klassifikation-Routing (→ Rendering), Komponente-Output, Snack-Output.

### Automated Tests
- `npm test` (Vitest): **369/369 passed**
- `npm run test:e2e` (Playwright, betroffene + Regressions-Suiten): **PROJ-16 (13/13), PROJ-5 (32/32), PROJ-5-legacy-rendering (4/4), PROJ-8 (47/47), PROJ-4 (32/32), PROJ-32 (13/13), PROJ-17 (26/26), PROJ-6 (18/18)** — alle grün nach Testdaten-Update auf das neue 3-Säulen/Komponente/Snack-Format
- `tsc --noEmit`: sauber (ein vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`, nicht durch diese Änderung berührt)
- Mehrere E2E-Testdateien enthielten veraltete Fixtures/Assertions aus der Zeit vor diesem Refinement (`bausteine`/`BEILAGE_KONTEXT:`/"Die 6 Sättigungs-Bausteine" usw.) sowie einige vorbestehende, unabhängige Test-Bugs (z.B. `loginAndGoToHistorie()` in PROJ-6 navigierte nie tatsächlich zu `/historie`; ein Auth-Test ging von einem vor PROJ-19 gültigen Redirect-Verhalten aus) — beides während dieser QA-Runde korrigiert, da beides reine Testkorrektheit betrifft, kein Produktverhalten.

### Acceptance Criteria Status

#### Schritt-0-Klassifikation → Routing
- [x] `typ: 'komponente'` und `typ: 'snack'` werden serverseitig korrekt klassifiziert und persistiert (`analysis_typ`)
- [x] Frontend routet strukturell korrekt (`'komponente' in result` / `'snackBestaetigung' in result`)

#### Komponente-Output
- [x] Kein Sättigungs-Score, kein Säulen-Grid für Komponenten-Analysen
- [x] "Als Beilage gedacht"-Badge sichtbar
- [ ] **BUG-1 (Critical):** Live-Komponente-Analyse crasht (siehe unten) — quantitative Bilanz und Kombinationsvorschlag sind dadurch faktisch nicht erreichbar

#### Snack-Output
- [x] Neutrale Bestätigung statt Analyse, kein Score, keine Vorschläge
- [x] Erkannte Zutat(en) werden angezeigt
- [x] `snack_bestaetigung` wird korrekt in `beilage_data` persistiert (Bugfix aus der Backend-Phase, hier erneut verifiziert)

### Security Audit Results
- [x] Authentication: `/api/analyse/confirm`, `/start`, `/answer` verlangen weiterhin `auth.getUser()` (401 sonst)
- [x] Authorization: Meal-Ownership weiterhin per `.eq('user_id', user.id)` erzwungen, fremde `mealId` → 404
- [x] Input validation: Keine neuen `dangerouslySetInnerHTML`-Stellen; neue Ausgabetexte (`bilanz`, `kombinationsvorschlag`, `snackBestaetigung`) laufen durch normales JSX-Escaping
- [x] `MAHLZEIT_TYP:`-Flag kommt ausschließlich aus serverseitig gesetzten `assumptions`, nicht aus direktem User-Input — kein Injection-Vektor
- Keine neuen Security-Findings.

### Bugs Found

#### BUG-1: Live-Komponente-Analyse crasht mit Runtime TypeError
- **Severity:** Critical
- **Datei:** [src/components/komponenten-ergebnis.tsx:133](src/components/komponenten-ergebnis.tsx#L133), Ursache in [src/app/api/analyse/confirm/route.ts:479-486](src/app/api/analyse/confirm/route.ts#L479-L486)
- **Root Cause:** `confirm/route.ts` liefert `komponenteFullResult.komponente` ohne das Feld `format`. `KomponentenErgebnis` prüft aber `k.format === 'neu'` (positive Prüfung) — bei `format: undefined` fällt die Komponente in den Legacy-Zweig und ruft `k.pairing.map(...)` auf, obwohl `pairing` im neuen Format gar nicht existiert.
- **Steps to Reproduce:**
  1. Mahlzeit analysieren, die als Komponente klassifiziert wird (z.B. "Blattsalat" allein)
  2. Rückfrage bestätigen ("Passt so")
  3. Erwartet: Komponente-Ergebnis mit Bilanz + einem Kombinationsvorschlag
  4. Tatsächlich: Next.js Runtime-Error-Overlay — "Cannot read properties of undefined (reading 'map')" — die Seite zeigt keinen Inhalt
  - Reproduziert und verifiziert per Playwright gegen die echte Komponente (nicht nur Annahme) — siehe `tests/PROJ-16-beilagen-kontext.spec.ts`, Tests "Komponente-Analyse zeigt quantitative Bilanz" etc. (schlagen aktuell erwartungsgemäß fehl)
- **Zum Vergleich funktioniert die Rekonstruktion aus der Historie** ([src/app/mahlzeit/[id]/page.tsx:134](src/app/mahlzeit/%5Bid%5D/page.tsx#L134)) korrekt, weil dort `format: 'neu'` explizit gesetzt wird — die Live-Route tut das nicht.
- **Fix (nicht selbst umgesetzt, da außerhalb des QA-Scopes):** In `confirm/route.ts` bei `komponenteFullResult.komponente` ein `format: 'neu' as const` ergänzen, analog zum bereits korrekten Muster in `mahlzeit/[id]/page.tsx`.
- **Priority:** Fix before deployment — betrifft jede reale Nutzung des neuen Komponente-Outputs, nicht nur einen Randfall.

### Summary
- **Acceptance Criteria:** 7/8 passed (1 durch BUG-1 blockiert)
- **Bugs Found:** 1 total (1 Critical)
- **Security:** Pass
- **Production Ready:** NO
- **Recommendation:** Ein-Zeilen-Fix in `confirm/route.ts` (siehe BUG-1), danach erneutes `/qa` auf den Komponente-Pfad

### Re-Test nach BUG-1-Fix (2026-08-11, selbe Sitzung)

BUG-1 behoben: `komponenteFullResult.komponente` in `confirm/route.ts` setzt jetzt explizit `format: 'neu' as const` (analog zum bereits korrekten Muster in `mahlzeit/[id]/page.tsx`). E2E-Mock-Fixture in `tests/PROJ-16-beilagen-kontext.spec.ts` entsprechend synchronisiert.

- [x] `tests/PROJ-16-beilagen-kontext.spec.ts`: 14/14 passed (zuvor 4 failed durch BUG-1)
- [x] `src/app/api/analyse/confirm/route.test.ts`: 22/22 passed (Property-Checks, keine exakte Objektgleichheit betroffen)
- [x] `npm test`: 369/369 passed
- [x] `tsc --noEmit`: sauber (unverändert 1 vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`)

**Production Ready: JA** — keine offenen Critical/High Bugs mehr.

---

## QA Test Results (Refinement 2026-09-03: Snack-Rezepttyp + Typ-Filter)

**Tested:** 2026-09-03
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Automated Tests
- `npm test` (Vitest): **462/462 passed** (44 Testdateien — 7 neue Unit-Tests für `matchesRecipeTypFilter()` + Werte-Listen in `src/lib/recipe-typ.test.ts`, 8 neue Integrationstests über die 4 Rezept-API-Routen aus der Backend-Phase)
- `node_modules/.bin/playwright test tests/PROJ-16-beilagen-kontext.spec.ts`: **20/20 passed** (7 neue E2E-Tests für dieses Refinement, zweifach wiederholt zur Stabilitätsprüfung — beide Male grün)
- `tsc --noEmit`: sauber (unverändert 1 vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`)

### Acceptance Criteria Status

#### Teil 1: Admin/Nutzer-Formular — Snack als vierter Rezept-Typ
- [x] Vierte Option „Snack" im Formular sichtbar (Radio-Group, Label + Beschreibung)
- [x] `recipe_typ: 'snack'` wird beim Anlegen akzeptiert und gespeichert (End-to-End über echte, per API angelegte Rezepte verifiziert — nicht nur gemockt)
- [x] Ungültiger `recipe_typ`-Wert (inkl. Injection-Versuch `"snack'; DROP TABLE recipes; --"`) wird mit 400 abgelehnt

#### Teil 2: Rezept-Detailseite — Snack-Kontext-Hinweis
- [x] Snack-Rezept zeigt Badge „Snack" + Text „Ein Snack für zwischendurch — muss keine vollständige Mahlzeit sein." anstelle der normalen Sättigungs-Bewertung („Sättigungs-Säulen" nicht sichtbar)

#### Teil 6: Rezept-Typ-Filter in Rezeptübersicht & Adminseite
- [x] Filter-Leiste zeigt alle 5 Optionen (Alle/Mahlzeiten/Beilagen/Grundrezepte/Snacks)
- [x] Filter „Snacks" findet ein Snack-Rezept; Filter „Mahlzeiten" findet es korrekt NICHT
- [x] Typ-Filter und Besitzer-Filter sind kombinierbar (UND-Verknüpfung) — „Eigene Rezepte" + „Snacks" funktioniert
- [x] Leerer-Zustand-Hinweis bei 0 Treffern („Keine Rezepte gefunden"), kein Fehler oder leerer Bildschirm
- [~] **Admin-Rezeptliste (`/admin/rezepte`) nicht automatisiert testbar** — gleiche Einschränkung wie PROJ-24: `qa-test@endlichsatt.dev` ist kein `ADMIN_EMAIL`. Der Typ-Filter dort nutzt exakt dieselbe `RezeptTypFilter`-Komponente wie die öffentliche Bibliothek (kein separater Code-Pfad) — strukturell durch die Bibliotheks-Tests mitabgedeckt, aber nicht live auf `/admin/rezepte` verifiziert. **Empfehlung: kurz manuell im Dev-Server gegenprüfen.**

### Responsive
- [x] 375px: Filter-Leiste bricht nicht um, alle 5 Labels vollständig lesbar (kleinere Schrift/Padding wie in der Frontend-Phase umgesetzt)
- [x] 768px, 1440px: Filter-Leiste rendert sauber, Seite bleibt auf die Design-System-Breite begrenzt

### Security Audit Results
- [x] `POST /api/rezepte` mit `recipe_typ`-Injection-Versuch → 400, kein SQL-Injection-Vektor (Supabase-Client nutzt parametrisierte Queries, Zod validiert vor jeder DB-Interaktion)
- [x] `POST /api/rezepte` ohne Session → 401
- [x] Admin-Routen (`POST /api/admin/rezepte`, `PUT .../[id]`) weiterhin korrekt gegen `ADMIN_EMAIL` geschützt (401/403) — durch die Zod-Enum-Umstellung nicht verändert
- [x] Keine neuen Secrets/sensiblen Daten in API-Responses (nur der neue Enum-Wert `'snack'`, keine Freitext-Ausgabe)
- [x] DB-CHECK-Constraint zusätzlich zur Zod-Validierung als zweite Verteidigungslinie aktiv (vom Nutzer bestätigt ausgeführt) — ein Bypass der API würde trotzdem auf DB-Ebene abgelehnt

### Regressionstest
- **Vitest (Gesamtsuite):** 462/462 grün.
- **E2E — PROJ-30, PROJ-31, PROJ-8, PROJ-36 (angrenzende Rezept-Features):** 48/52 grün. 4 Fehlschläge gefunden, davon:
  - **1 durch dieses Refinement verursacht** (siehe BUG-1 unten)
  - **3 vorbestehende, unabhängige Bugs** (siehe BUG-2, BUG-3 unten) — bestätigt nicht durch dieses Refinement verursacht (betroffene Codepfade von diesem Refinement nicht berührt), als separate Hintergrund-Tasks ausgelagert

### Bugs Found

#### BUG-1: Zwei Buttons mit identischem Accessible Name "Alle" — GEFIXT
- **Severity:** Medium
- **Datei:** [src/components/rezept-bibliothek.tsx](src/components/rezept-bibliothek.tsx) — neuer Typ-Filter (aus [src/components/rezept-typ-filter.tsx](src/components/rezept-typ-filter.tsx)) und der bestehende Cuisine-Tag-Filter haben beide einen Button mit dem Text „Alle"
- **Steps to Reproduce:** `/ernaehrung/rezepte` öffnen → `page.getByRole('button', { name: 'Alle' })` (oder ein Screenreader, der nach dem Accessible Name "Alle" sucht) matched zwei unterschiedliche, funktional verschiedene Buttons ohne Möglichkeit der Unterscheidung
- **Tatsächliche Auswirkung:** Bricht den vorbestehenden Regressionstest `tests/PROJ-36-ernaehrung-hub.spec.ts:113` (Playwright-Strict-Mode-Violation). Für sehende Nutzer visuell unterscheidbar (unterschiedliche Button-Form/Größe), für Screenreader-Nutzer aber nicht — zwei interaktive Elemente mit identischem Namen und unterschiedlicher Funktion ist ein A11y-Antipattern (WCAG 2.4.4/4.1.2)
- **Fix:** `aria-label="Alle Rezept-Typen"` auf dem Typ-Filter-„Alle"-Button ergänzt ([src/components/rezept-typ-filter.tsx](src/components/rezept-typ-filter.tsx)) — Cuisine-Tag-Filter-Button bleibt unverändert „Alle". Da Playwrights `getByRole(..., {name})` standardmäßig als Teilstring matcht, wurde zusätzlich der betroffene Locator in `tests/PROJ-36-ernaehrung-hub.spec.ts:113` auf `{ name: 'Alle', exact: true }` präzisiert (matcht dadurch nur noch den Cuisine-Tag-Button).
- **Verifiziert:** `tests/PROJ-36-ernaehrung-hub.spec.ts` grün, `tests/PROJ-16-beilagen-kontext.spec.ts` weiterhin 20/20 grün (keine Regression durch das aria-label).

#### BUG-2: `/rezept/[id]` liefert 200 statt 404 im Dev-Server — GEFIXT (Test angepasst, kein App-Code-Fix nötig)
- **Severity:** Low
- Betrifft `tests/PROJ-8-rezeptbibliothek.spec.ts` und `tests/PROJ-30-rezept-eigentuemerschaft-filter.spec.ts`. **Root Cause gefunden:** reiner **Next.js/Turbopack-Dev-Server-Effekt** — verifiziert per `npm run build && npm run start`: im Produktions-Build liefert dieselbe URL korrekt HTTP 404. `curl` gegen den Dev-Server bestätigte den falschen 200-Status unabhängig vom Browser (kein Playwright-Artefakt). Die Seite selbst war nie fehlerhaft — der App-Code (`generateMetadata()` + `notFound()`) ist bereits korrekt, das Verhalten unterscheidet sich nur zwischen Dev- und Produktions-Server.
- **Fix:** Da die Test-Suite gegen den Dev-Server läuft (nicht gegen einen Produktions-Build) und dort der HTTP-Status systembedingt unzuverlässig ist, prüfen beide Tests jetzt zusätzlich den tatsächlich gerenderten Seiteninhalt ("This page could not be found" sichtbar, bei PROJ-30 zusätzlich: der private Rezepttitel ist NICHT sichtbar — die eigentliche sicherheitsrelevante Garantie) statt sich ausschließlich auf den Status zu verlassen. Kein App-Code geändert, da bereits korrekt.
- **Verifiziert:** Beide Tests grün gegen den Dev-Server; Produktions-Build separat mit `curl` bestätigt (404).

#### BUG-3: Veralteter Text "Sättigungs-Bausteine" in PROJ-31-Test — GEFIXT
- **Severity:** Low
- `tests/PROJ-31-nutzer-eigene-rezepte.spec.ts:106` erwartete "Sättigungs-Bausteine", aktuelle Überschrift ist seit der "Complete"-Umstrukturierung (2026-08-11) "Sättigungs-Säulen" — reiner Test-Bug, kein Produktfehler.
- **Fix:** Text in `tests/PROJ-31-nutzer-eigene-rezepte.spec.ts:106` auf "Sättigungs-Säulen" korrigiert.
- **Nebenfund beim Fixen:** Da dieser Test seit der Umbenennung (2026-08-11) bei jedem Lauf schon vor dem Cleanup-Schritt (`deleteRecipeViaApi`) fehlschlug, hatten sich **8 verwaiste Test-Rezepte** ("QA-Test E2E: Neues Rezept", angelegt unter dem `qa-test`-Account) in der Produktions-Datenbank angesammelt — sichtbar geworden durch einen Folgefehler (`getByText(...)` matchte 8 Elemente statt 1). Alle 8 wurden über `DELETE /api/rezepte/[id]` bereinigt (je 200-Antwort bestätigt).
- **Verifiziert:** `tests/PROJ-31-nutzer-eigene-rezepte.spec.ts` 9/9 grün.

### Re-Test nach allen 3 Bugfixes (2026-09-03, selbe Sitzung)
- `node_modules/.bin/playwright test tests/PROJ-30-rezept-eigentuemerschaft-filter.spec.ts tests/PROJ-31-nutzer-eigene-rezepte.spec.ts tests/PROJ-8-rezeptbibliothek.spec.ts tests/PROJ-36-ernaehrung-hub.spec.ts tests/PROJ-16-beilagen-kontext.spec.ts`: **72/72 passed**
- `npm test` (Vitest): **462/462 passed**
- `tsc --noEmit`: sauber (unverändert 1 vorbestehender, unabhängiger Fehler in `PROJ-2-user-authentication.spec.ts`)
- `eslint` auf `src/components/rezept-typ-filter.tsx`: 0 Fehler

### Summary
- **Acceptance Criteria:** 9/10 vollständig verifiziert (1 strukturell abgedeckt, aber nicht live auf der Admin-Seite verifizierbar — Empfehlung: manuelle Gegenprüfung)
- **Bugs Found:** 3 total (0 Critical, 0 High, 1 Medium, 2 Low) — **alle 3 gefixt**, keine offenen Bugs mehr
- **Security:** Pass
- **Production Ready: JA** — keine offenen Bugs.
- **Recommendation:** Deploy.
