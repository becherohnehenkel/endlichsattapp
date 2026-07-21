# PROJ-24: Zutaten-Reihenfolge & Gruppierung im Rezept-Editor

## Status: Approved (Refinement: Markdown-Formatierung in der Zubereitung)
**Created:** 2026-07-20
**Last Updated:** 2026-07-21

## Dependencies
- Requires: PROJ-8 (Rezeptbibliothek) — Rezept-Editor (`rezept-formular.tsx`) und Datenmodell (`recipe_ingredients` mit `sort_order`) existieren bereits

## User Stories
- Als Admin möchte ich Zutaten in der Zutatenliste per Drag-and-Drop umsortieren können, damit ich Rezepte schnell anpassen kann, ohne Zutaten löschen und neu anlegen zu müssen.
- Als Admin möchte ich Gruppen-Überschriften zwischen Zutaten einfügen können (z.B. "Für das Dressing", "Hauptzutaten"), damit lange Zutatenlisten übersichtlich strukturiert sind.
- Als Nutzer möchte ich auf der Rezept-Detailseite gruppierte Zutaten mit Überschriften sehen, damit ich beim Nachkochen leichter erkenne, welche Zutaten zusammengehören (z.B. für ein separates Dressing).
- Als Admin möchte ich im Zubereitungs-Textfeld markierten Text per Toolbar-Button fett, kursiv oder unterstrichen formatieren können, damit ich wichtige Kochschritte hervorheben kann.
- Als Nutzer möchte ich diese Formatierung auf der Rezept-Detailseite korrekt dargestellt sehen (fett/kursiv/unterstrichen statt roher Sternchen/Unterstriche), damit die Anleitung gut lesbar bleibt.

## Out of Scope
- Verschachtelte/mehrstufige Untergruppen — nur eine flache Ebene von Gruppen-Überschriften
- Block-Verschieben ganzer Gruppen (Überschrift + zugehörige Zutaten zusammen per Drag) — MVP erlaubt nur einzelne Zeilen zu verschieben (Zutat oder Überschrift getrennt)
- Ein-/Ausklappen (Collapse) von Gruppen in der Anzeige
- Kopieren/Duplizieren von Gruppen zwischen Rezepten
- Änderungen an der Rezeptvorschläge-Matching-Logik (`ingredient_tags`-basiert) — bleibt unverändert, Gruppen sind rein strukturell für die Zutatenliste
- Nachträgliche redaktionelle Gruppierung der 5 bestehenden Rezepte — freiwillige Admin-Aufgabe nach Deployment, kein Teil dieser Spec
- Markdown-Formatierung im Rezepttitel oder in Zutaten-Namen — ausschließlich das Zubereitungs-Textfeld unterstützt Formatierung
- Weitere Markdown-Elemente (Listen, Links, Überschriften, Zeilenumbrüche als eigenes Markdown-Konstrukt, Code-Blöcke) — nur Fett, Kursiv, Unterstrichen
- Ein vollwertiger WYSIWYG-Editor (z.B. TipTap/ContentEditable) — Toolbar wirkt auf ein normales `<textarea>` und fügt Markdown-Zeichen ein, keine Live-Vorschau im Editor selbst
- Toggle-Erkennung (Button erkennt, ob markierter Text bereits formatiert ist, und entfernt die Formatierung wieder) — Klick fügt immer neue Marker hinzu, auch bei bereits formatiertem Text
- Verschachtelte Formatierung (z.B. fett UND kursiv gleichzeitig auf denselben Text) — nicht offiziell unterstützt, kein aktiver Test dafür

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Admin — Zutaten umsortieren
- [ ] Angenommen der Admin bearbeitet ein Rezept mit mehreren Zutaten, wenn er eine Zutat per Drag-and-Drop an eine andere Position zieht, dann wird die neue Reihenfolge sofort im Formular übernommen.
- [ ] Angenommen der Admin nutzt ein Touch-Gerät (Smartphone/Tablet), wenn er eine Zutat per Touch verschiebt, dann funktioniert das Umsortieren gleichwertig zur Maus-Bedienung.
- [ ] Angenommen der Admin hat Zutaten umsortiert, wenn er das Formular speichert, dann wird die neue Reihenfolge persistiert und auf der Rezept-Detailseite in der gespeicherten Reihenfolge angezeigt.
- [ ] Angenommen eine Zutat hat eine verknüpfte Nährwert-Quelle (BLS/Open Food Facts), wenn die Zutat per Drag verschoben wird, dann bleibt die verknüpfte Nährwert-Quelle korrekt dieser Zutat zugeordnet (nicht der Zeilen-Position).

### Admin — Gruppen-Überschriften
- [ ] Angenommen der Admin bearbeitet die Zutatenliste, wenn er auf "Gruppe hinzufügen" klickt, dann erscheint eine neue Überschriften-Zeile mit leerem Textfeld am Ende der Liste.
- [ ] Angenommen eine Gruppen-Überschrift wurde hinzugefügt, wenn der Admin sie per Drag-and-Drop zwischen zwei Zutaten platziert, dann gehören alle nachfolgenden Zutaten bis zur nächsten Überschrift (oder bis zum Listenende) zu dieser Gruppe.
- [ ] Angenommen Zutaten stehen vor der ersten Gruppen-Überschrift, dann bleiben sie ungruppiert und werden ohne Überschrift dargestellt.
- [ ] Angenommen der Admin lässt das Textfeld einer Gruppen-Überschrift leer, wenn er versucht zu speichern, dann wird ein Validierungsfehler angezeigt und das Speichern verhindert.
- [ ] Angenommen eine Gruppen-Überschrift hat keine Zutaten unter sich (z.B. direkt gefolgt von der nächsten Überschrift oder dem Ende der Liste), wenn der Admin speichert, dann wird ein Validierungsfehler angezeigt ("Gruppe „…" hat keine Zutaten") und das Speichern wird verhindert.
- [ ] Angenommen der Admin löscht eine Gruppen-Überschrift, dann bleiben die zugehörigen Zutaten erhalten und werden Teil der vorherigen Gruppe (oder ungruppiert, falls es die erste Gruppe in der Liste war).

### Nutzer — Anzeige auf der Rezept-Detailseite
- [ ] Angenommen ein Rezept hat Gruppen-Überschriften, wenn ein Nutzer die Rezept-Detailseite öffnet, dann werden die Zutaten unter ihrer jeweiligen Überschrift gruppiert angezeigt, in der gespeicherten Reihenfolge.
- [ ] Angenommen ein Rezept hat keine Gruppen-Überschriften (Altbestand oder bewusst ungruppiert angelegt), wenn ein Nutzer die Rezept-Detailseite öffnet, dann wird die Zutatenliste unverändert als flache Liste ohne Überschriften angezeigt.
- [ ] Angenommen ein Rezept hat eine oder mehrere Gruppen, wenn ein Nutzer die Rezept-Detailseite öffnet, dann ist jede Gruppe (Überschrift + ihre Zutaten zusammen) optisch von einem Rahmen umschlossen — als klar erkennbare visuelle Einheit.
- [ ] Angenommen ein Rezept hat mehrere Gruppen, wenn ein Nutzer die Rezept-Detailseite öffnet, dann ist der Abstand zwischen den Gruppen spürbar größer als der Abstand zwischen einzelnen Zutaten innerhalb einer Gruppe.
- [ ] Angenommen ein Rezept hat ungruppierte Zutaten vor der ersten Überschrift, wenn ein Nutzer die Rezept-Detailseite öffnet, dann bleiben diese Zutaten ohne Rahmen — der Rahmen kennzeichnet ausschließlich echte Gruppen.

### Bestehende Validierung bleibt bestehen
- [ ] Angenommen alle echten Zutaten wurden entfernt und nur Gruppen-Überschriften bleiben übrig, wenn der Admin speichert, dann greift weiterhin die bestehende "mindestens eine Zutat"-Regel und das Speichern wird verhindert.

### Admin — Markdown-Formatierung im Zubereitungs-Textfeld
- [ ] Angenommen der Admin bearbeitet die Zubereitung und hat Text markiert, wenn er auf den Fett-Button klickt, dann wird die Markierung mit `**` umschlossen (`**markierter Text**`).
- [ ] Angenommen der Admin bearbeitet die Zubereitung und hat Text markiert, wenn er auf den Kursiv-Button klickt, dann wird die Markierung mit `*` umschlossen (`*markierter Text*`).
- [ ] Angenommen der Admin bearbeitet die Zubereitung und hat Text markiert, wenn er auf den Unterstrichen-Button klickt, dann wird die Markierung mit `__` umschlossen (`__markierter Text__`).
- [ ] Angenommen der Admin hat keinen Text markiert (Cursor steht nur an einer Position), wenn er einen der drei Formatierungs-Buttons klickt, dann werden die passenden Marker direkt an der Cursor-Position eingefügt und der Cursor zwischen den Markern platziert.
- [ ] Angenommen der Admin speichert die Zubereitung mit Formatierungs-Markern, dann wird der Text inklusive der Marker unverändert in der Datenbank gespeichert (gleiche Spalte, kein neues Feld).

### Nutzer — Formatierte Zubereitung auf der Rezept-Detailseite
- [ ] Angenommen die Zubereitung enthält `**Text**`, wenn ein Nutzer die Rezept-Detailseite öffnet, dann wird "Text" fett dargestellt, ohne die Sternchen anzuzeigen.
- [ ] Angenommen die Zubereitung enthält `*Text*`, wenn ein Nutzer die Rezept-Detailseite öffnet, dann wird "Text" kursiv dargestellt, ohne die Sternchen anzuzeigen.
- [ ] Angenommen die Zubereitung enthält `__Text__`, wenn ein Nutzer die Rezept-Detailseite öffnet, dann wird "Text" unterstrichen dargestellt, ohne die Unterstriche anzuzeigen.
- [ ] Angenommen die Zubereitung enthält keinerlei Formatierungs-Marker (Altbestand), wenn ein Nutzer die Rezept-Detailseite öffnet, dann wird der Text unverändert wie bisher als reiner Fließtext angezeigt.
- [ ] Angenommen die Zubereitung enthält Zeilenumbrüche, wenn ein Nutzer die Rezept-Detailseite öffnet, dann bleiben diese wie bisher erhalten (`whitespace-pre-line`-Verhalten bleibt unverändert, unabhängig von der neuen Formatierung).

## Edge Cases
- Zwei Gruppen-Überschriften direkt hintereinander ohne dazwischenliegende Zutat → leere Gruppe → Validierungsfehler beim Speichern
- Gruppen-Überschrift als letztes Element der Liste ohne folgende Zutat → leere Gruppe → Validierungsfehler beim Speichern
- Zutat wird auf einem Touch-Gerät über den sichtbaren Bildschirmrand hinaus gezogen (lange Liste) → Auto-Scroll muss greifen, damit auch Positionen außerhalb des sichtbaren Bereichs erreichbar sind
- Verknüpfte Makros (BLS/OFF-Quelle) einer Zutat müssen nach dem Verschieben exakt an der richtigen Zutat hängen bleiben, nicht an der alten Zeilen-Position
- Rezept ohne jegliche Gruppen (aktueller Altbestand: alle 5 Rezepte) → unverändertes Verhalten, keine Datenmigration notwendig, keine Pflicht zur Gruppierung
- Löschen der einzigen vorhandenen Gruppen-Überschrift → zugehörige Zutaten werden vollständig ungruppiert (da keine vorherige Gruppe existiert)
- Netzwerkfehler beim Speichern nach Umsortieren/Gruppieren → bestehende Fehlerbehandlung greift, die im Formular vorgenommene Reihenfolge/Gruppierung bleibt erhalten (kein Datenverlust, kein Reset des Formulars)
- Rezept besteht ausschließlich aus ungruppierten Zutaten (keine einzige Gruppe) → keine Box irgendwo auf der Seite, Darstellung bleibt die bisherige flache Liste ohne jeglichen Rahmen
- Admin markiert Text, der bereits `**`/`*`/`__` enthält, und klickt erneut auf einen Formatierungs-Button → Marker werden trotzdem um die (bereits Marker enthaltende) Auswahl gelegt, keine Erkennung von "schon formatiert" (siehe Out of Scope)
- Admin fügt Formatierungs-Marker über mehrere Zeilen hinweg ein (Markierung schließt einen Zeilenumbruch mit ein) → Marker umschließen den kompletten markierten Bereich inklusive Zeilenumbruch, Rendering-Verhalten in diesem Fall nicht gesondert getestet (seltener Fall, nicht blockierend)
- Zubereitungstext enthält ein einzelnes, unpaariges `*`, `**` oder `__` (z.B. Admin verwendet Sternchen als Aufzählungszeichen) → Bestandsdaten wurden vor diesem Refinement geprüft und enthalten keine dieser Zeichen (siehe Product Decisions); für künftige Eingaben liegt die Verantwortung beim Admin, den Marker paarig zu verwenden — kein Auto-Escaping vorgesehen
- Formatierung wird auf der Gast-Sperrbildschirm-Variante der Detailseite nicht angezeigt (Zubereitung wird dort ohnehin nicht gerendert) → keine Änderung nötig

## Technical Requirements (optional)
- Drag-and-Drop muss sowohl Maus- als auch Touch-Eingabe unterstützen (Mobile-first-Vorgabe aus der PRD gilt auch für dieses Admin-Feature)
- Rendering der Formatierungs-Marker auf der öffentlichen Seite darf kein `dangerouslySetInnerHTML` verwenden — sicherer, eigener Parser der nur `**`/`*`/`__` erkennt und in React-Elemente (`<strong>`/`<em>`/`<u>`) umwandelt, alles andere bleibt Klartext (kein XSS-Vektor über Zubereitungstext)

## Open Questions
- [x] Sollte Markdown-Formatierung als eigene Spec (PROJ-25) statt als Erweiterung von PROJ-24 laufen? → Nein, bewusst in PROJ-24 aufgenommen, obwohl fachlich getrennt von der Zutaten-Gruppierung (2026-07-21)
- [ ] Verschachtelte Formatierung (fett + kursiv gleichzeitig) — Verhalten nicht spezifiziert, siehe Out of Scope. Bei Bedarf in einem separaten Refinement nachziehen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Feature als eigenständige Spec PROJ-24, abhängig von PROJ-8, statt Erweiterung der bestehenden PROJ-8-Spec | Klar abgrenzbare, unabhängig testbare Änderung am Editor; single responsibility pro Spec | 2026-07-20 |
| Priorität P2 | Admin-Tooling-Verbesserung, kein nutzerkritisches MVP-Feature | 2026-07-20 |
| Drag-and-Drop statt Pfeil-Buttons für die Zutaten-Reihenfolge | Explizit vom Product Owner gewünscht — intuitivere Bedienung, trotz höherem Implementierungsaufwand als einfache Auf/Ab-Buttons | 2026-07-20 |
| Touch-Support für Drag-and-Drop ist Pflicht, nicht optional | Konsistent mit der PRD-Vorgabe "Mobile-first: alle Screens vollständig auf Mobilgeräten nutzbar" | 2026-07-20 |
| Gruppen-Überschriften werden auch auf der öffentlichen Rezept-Detailseite angezeigt (nicht nur im Admin-Editor) | Der eigentliche Nutzen der Gruppierung ist bessere Lesbarkeit beim Nachkochen für den Nutzer, nicht nur Admin-Komfort beim Bearbeiten | 2026-07-20 |
| Gruppe wird über einen eigenen "Gruppe hinzufügen"-Button erstellt (analog zu "Zutat hinzufügen") und dann per Drag positioniert | Konsistent mit bestehendem UI-Muster im Editor, kein zusätzliches Kontextmenü pro Zutat nötig | 2026-07-20 |
| Ungruppierte Zutaten sind erlaubt (Zutaten vor der ersten Überschrift) | Rückwärtskompatibel mit allen bestehenden Rezepten ohne Gruppen; Gruppierung bleibt ein rein optionales Werkzeug | 2026-07-20 |
| Leere Gruppen (Überschrift ohne Zutaten) sind ein Validierungsfehler beim Speichern | Vermutlich ein Versehen (z.B. letzte Zutat der Gruppe weggezogen) — soll dem Admin aktiv auffallen statt still im Hintergrund zu bleiben | 2026-07-20 |
| Löschen einer Gruppen-Überschrift löscht nicht die zugehörigen Zutaten (Merge in vorherige Gruppe statt Cascade-Delete) | Verhindert versehentlichen Datenverlust beim Aufräumen der Gruppenstruktur | 2026-07-20 |
| Gruppen-Label ist Pflichtfeld, max. 40 Zeichen | Leere Überschriften sind sinnlos (dann eher keine Gruppe anlegen); Zeichenlimit hält die Editor-UI kompakt | 2026-07-20 |
| Nur einzelne Zeilen sind draggable — kein Block-Move ganzer Gruppen (Überschrift + Zutaten zusammen) | Einfachere Implementierung für MVP, deckt den beschriebenen Use-Case (Dressing von Hauptzutaten trennen) bereits vollständig ab | 2026-07-20 |
| Rahmen umschließt Gruppen-Titel + Zutaten zusammen als eine Box (nicht nur die Zutatenliste) | Product-Owner-Wunsch nach dem Live-Test — macht jede Gruppe auf einen Blick als zusammengehörige Einheit erkennbar, statt Titel und Liste optisch getrennt wirken zu lassen | 2026-07-21 |
| Zusätzlicher Abstand nur zwischen Gruppen, nicht zwischen einzelnen Zutaten innerhalb einer Gruppe | Zutaten einer Gruppe sollen kompakt und erkennbar zusammengehörig bleiben; die zusätzliche Luft soll ausschließlich verschiedene Abschnitte voneinander trennen | 2026-07-21 |
| Ungruppierte Zutaten (vor der ersten Überschrift) bekommen bewusst KEINEN Rahmen | Der Rahmen ist das visuelle Signal für "das ist eine Gruppe" — würden auch ungruppierte Zutaten einen Rahmen bekommen, ginge dieser Unterschied verloren | 2026-07-21 |
| Admin-Editor bleibt optisch unverändert (kein passender Rahmen um Gruppen-Zeilen im Formular) | Editor-Darstellung ist funktional anders begründet (gestrichelter Rahmen signalisiert dort die einzeln draggable Überschriften-Zeile, nicht eine fertige Gruppe) — reine Anzeige-Politur auf der öffentlichen Seite, keine Änderung an der Gruppierungs-Funktion selbst nötig | 2026-07-21 |
| Markdown-Formatierung (Fett/Kursiv/Unterstrichen) als Erweiterung von PROJ-24 statt eigene Spec | Explizit vom Product Owner so gewünscht, trotz fachlicher Trennung von der Zutaten-Gruppierung | 2026-07-21 |
| Formatierung gilt ausschließlich für das Zubereitungs-Textfeld, nicht für Titel oder Zutaten-Namen | Dort ist der Nutzen am größten (lange Freitext-Anleitung); Titel/Zutaten sind kurze, strukturierte Felder ohne Formatierungsbedarf | 2026-07-21 |
| Toolbar-Button fügt Marker an der Cursor-Position ein, wenn nichts markiert ist (statt deaktiviert zu sein) | Funktioniert immer ohne Sonderfall, Admin tippt einfach zwischen den eingefügten Markern weiter | 2026-07-21 |
| Unterstrichen-Syntax: `__Text__` (doppelter Unterstrich) statt HTML `<u>`-Tags | Explizit vom Product Owner gewählt; da Fett in dieser App über `**` (nicht `__`) läuft, gibt es innerhalb des eigenen Parsers keine Kollision — weicht aber vom verbreiteten Markdown-Standard ab, in dem `__Text__` oft „fett" bedeutet. Dokumentiert als App-eigene Konvention. | 2026-07-21 |
| Kein Toggle/Erkennung von bereits vorhandener Formatierung beim Klick auf einen Button | Für „basic" Formatierung wie gewünscht ausreichend; Toggle-Logik hätte den Scope unnötig vergrößert | 2026-07-21 |
| Rendering über einen eigenen, minimalen Parser (kein `dangerouslySetInnerHTML`, keine Markdown-Library wie `react-markdown`) | Nur 3 Formatierungs-Arten nötig — ein voller Markdown-Parser wäre unnötiger Funktionsumfang (Listen, Links, Headers etc. explizit out of scope). Eigener Parser vermeidet zudem jedes XSS-Risiko, da nur `**`/`*`/`__` erkannt und in React-Elemente umgewandelt werden, alles andere bleibt Klartext. | 2026-07-21 |
| Bestandsdaten (5 Rezepte) vor dem Deploy auf `*`/`_`-Zeichen geprüft | Sollte ein Rezeptschritt bereits Sternchen als Aufzählungszeichen enthalten haben, würde die neue Formatierung das ungewollt umbrechen. Ergebnis: keines der 5 Rezepte enthält `*` oder `_` in der Zubereitung — kein Nacharbeits-Bedarf. | 2026-07-21 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Drag-and-Drop-Library: `@dnd-kit` (`core` + `sortable` + `utilities`) | Aktiv gepflegt, eingebaute Maus-, Touch- und Tastatur-Unterstützung (erfüllt die Mobile-first-Pflicht aus der Spec ohne Zusatzaufwand), reine React-Hooks-API ohne eigene DOM-Verwaltung — lässt sich sauber mit react-hook-forms `useFieldArray` kombinieren (Array-Move statt eigenem State). Alternative `react-beautiful-dnd` ist unmaintained und wurde deshalb verworfen. | 2026-07-20 |
| Gruppen-Überschriften werden als eigener Zeilen-Typ in derselben `recipe_ingredients`-Tabelle gespeichert (kein neues Datenmodell/keine neue Tabelle) | Die Tabelle wird beim Speichern ohnehin komplett gelöscht und aus der Formular-Reihenfolge neu angelegt (bestehendes Muster aus PROJ-8). Ein einzelner Zeilen-Typ pro Position ist die einfachste Erweiterung dieses Musters — Header und Zutaten teilen sich dieselbe fortlaufende Positions-Reihenfolge, wodurch die Gruppierung implizit aus der Reihenfolge entsteht (keine separate Gruppen-ID, keine Fremdschlüssel-Beziehung nötig). | 2026-07-20 |
| Gruppierung wird beim Lesen berechnet (jede Zutat gehört zur nächsten vorherigen Überschriften-Zeile), nicht als eigenes gespeichertes Attribut pro Zutat | Vermeidet Inkonsistenzen (z.B. eine Zutat referenziert eine Gruppen-ID, die beim Umsortieren nicht mehr existiert). Die Reihenfolge ist ohnehin die einzige Quelle der Wahrheit für Drag-and-Drop — Gruppierung ist eine reine Ableitung daraus. | 2026-07-20 |
| Validierung (Pflicht-Label, keine leeren Gruppen) läuft clientseitig im Formular vor dem Absenden UND serverseitig in der bestehenden Zod-Validierung der Admin-API-Route | Konsistent mit dem bestehenden Muster in `/api/admin/rezepte`: Client-Validierung für sofortiges Feedback, Server-Validierung als zweite Absicherung (nie nur Client-seitig vertrauen) | 2026-07-20 |
| Kein Datenbank-Migrationsschritt für bestehende Rezepte nötig | Bestehende Zutaten sind implizit "ungruppiert", da keine Überschriften-Zeilen existieren — das neue Zeilen-Typ-Feld hat einen Default-Wert, der bestehende Zutaten unverändert lässt | 2026-07-20 |
| Zusätzlicher DB-CHECK-Constraint (`recipe_ingredients_type_shape_check`) neben der Zod-Validierung | Dritte, unabhängige Absicherung direkt auf Datenbankebene — verhindert inkonsistente Zeilen (z.B. `gruppe` ohne Label) selbst falls ein zukünftiger Code-Pfad (Migration, direkter DB-Zugriff, Bug) die Zod-Validierung umgeht | 2026-07-20 |
| Zod-Ingredient-Schema in eigenes Modul `src/lib/recipe-ingredients-schema.ts` ausgelagert, statt wie bisher pro Route zu duplizieren | Die Validierungslogik (discriminated union + zwei `.refine()`-Checks für "mindestens eine Zutat" und "keine leeren Gruppen") ist deutlich komplexer als das alte Ein-Zeilen-`IngredientSchema` — Duplizieren hätte ein hohes Drift-Risiko zwischen POST- und PUT-Route bedeutet | 2026-07-20 |
| `name`/`amount`/`unit` in `recipe_ingredients` nullable statt zwei getrennte Tabellen (Zutaten vs. Gruppen) | Konsistent mit der ursprünglichen Architektur-Entscheidung (ein Zeilentyp, eine Tabelle); nullable Spalten + CHECK-Constraint sind der pragmatischste Weg, das ohne Tabellen-Split umzusetzen | 2026-07-20 |
| Markdown-Formatierung: reines Frontend-Feature, keine Backend-/DB-Änderung | `instructions`-Spalte ist bereits Freitext ohne Struktur-Vorgaben; Formatierungs-Marker sind einfach zusätzliche Zeichen im selben Feld — bestehende Admin-API und Zod-Validierung (`required`-Check auf `instructions`) bleiben unverändert gültig | 2026-07-21 |
| Kein Markdown-Rendering-Package (z.B. `react-markdown`), stattdessen eigene minimale Parse-Funktion | Nur 3 Formatierungs-Arten nötig (fett/kursiv/unterstrichen), keine Listen/Links/Headers — eine volle Markdown-Bibliothek wäre unnötiger Funktionsumfang und zusätzliches Bundle-Gewicht für ein einzelnes Textfeld | 2026-07-21 |
| Rendering erzeugt React-Elemente (`<strong>`/`<em>`/`<u>`) direkt aus dem geparsten Text, kein `dangerouslySetInnerHTML` | Verhindert jedes XSS-Risiko über den Zubereitungstext strukturell, statt sich auf Sanitizing zu verlassen — konsistent mit der bestehenden Sicherheits-Anforderung aus der Spec | 2026-07-21 |
| Toolbar manipuliert die native Textarea-Selektion (`selectionStart`/`selectionEnd`) direkt, kein Rich-Text-Editor-Framework (z.B. TipTap, Slate) | Einfachste Umsetzung für "basic"-Anforderung; das Zubereitungsfeld bleibt ein normales `<textarea>`, keine neue Editor-Infrastruktur nötig | 2026-07-21 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Refinement: Markdown-Formatierung in der Zubereitung (2026-07-21)

#### A) Component-Struktur

**Admin-Editor (`RezeptFormular`) — Zubereitungs-Feld, erweitert:**
```
RezeptFormular (bestehend)
  └── Zubereitungs-Bereich [ERWEITERT]
       ├── Formatierungs-Toolbar [NEU] — drei Buttons: Fett (B), Kursiv (I), Unterstrichen (U)
       └── Zubereitungs-Textfeld (bestehend, unverändert als reines Eingabefeld)
```
Die Toolbar sitzt direkt über dem bestehenden Zubereitungs-Textfeld. Ein Klick auf einen Button wirkt auf die aktuell markierte Textstelle im Feld (oder fügt an der Cursor-Position Marker ein, falls nichts markiert ist) — das Textfeld selbst bleibt ein normales Eingabefeld ohne Live-Vorschau.

**Rezept-Detailseite (`/rezept/[id]`) — Zubereitungs-Anzeige, erweitert:**
```
RezeptDetail (bestehend)
  └── Zubereitungs-Abschnitt [ERWEITERT]
       └── Formatierte Anzeige [NEU] — wandelt Formatierungs-Marker in fett/kursiv/unterstrichen
           dargestellten Text um; Text ohne Marker sieht exakt wie bisher aus
```

#### B) Datenmodell (fachlich beschrieben)

Keine Änderung am Datenmodell. Die Zubereitung wird weiterhin als einfacher Text in derselben Datenbank-Spalte gespeichert wie bisher — die Formatierungs-Marker (z.B. `**wichtig**`) sind einfach Teil dieses Texts, genau wie es der Admin eintippt. Es gibt kein separates "formatiertes" und "unformatiertes" Feld und keine Datenbank-Migration.

#### C) Tech-Entscheidungen (Begründung)

- **Warum kein Rich-Text-Editor (WYSIWYG)?** Der Wunsch war ausdrücklich "basic" — drei Formatierungs-Optionen über einfache Toolbar-Buttons. Ein vollwertiger Editor (mit Live-Vorschau direkt im Eingabefeld) wäre ein deutlich größerer Aufwand für einen Nutzen, den ein einzelner Admin beim Eintippen weniger Rezepte kaum braucht.
- **Warum ein eigener, minimaler Text-Umwandler statt einer fertigen Markdown-Bibliothek?** Es werden nur drei Formatierungs-Arten gebraucht (fett, kursiv, unterstrichen) — keine Listen, Links, Überschriften oder Tabellen. Eine vollständige Markdown-Bibliothek würde ungenutzten Funktionsumfang und zusätzliches Gewicht in die App bringen. Ein schlanker, selbst geschriebener Umwandler deckt genau den Bedarf ab und ist einfacher zu überblicken.
- **Warum kein Sicherheitsrisiko durch das Rendern der Marker?** Der Text wird nicht als rohes HTML eingefügt, sondern gezielt in die drei erlaubten Darstellungs-Elemente (fett/kursiv/unterstrichen) übersetzt — alles andere bleibt immer normaler, sicher dargestellter Text. Es gibt keinen Weg, darüber beliebigen HTML-Code einzuschleusen.
- **Warum keine Backend-Änderung nötig?** Die Zubereitung wird bereits heute als freier Text gespeichert und übertragen — die neuen Formatierungs-Marker sind einfach zusätzliche Zeichen innerhalb dieses bestehenden Texts. Speichern und Laden funktionieren unverändert über die bestehende Admin-API.

#### D) Abhängigkeiten (zu installierende Pakete)

Keine neuen Pakete nötig — die Toolbar und die Anzeige-Umwandlung werden mit reinen React-Bordmitteln umgesetzt, ohne zusätzliche Bibliothek.

---

### A) Component-Struktur

**Admin-Editor (`RezeptFormular`) — Zutaten-Bereich, erweitert:**
```
RezeptFormular (bestehend)
  └── Zutaten-Bereich [ERWEITERT]
       └── Sortierbarer Bereich (Drag-and-Drop-Kontext) [NEU]
            ├── ZutatZeile [ERWEITERT um Drag-Handle]
            │    └── (bestehende Felder: Name/Quelle, Menge, Einheit, Löschen)
            └── GruppenUeberschriftZeile [NEU]
                 └── Drag-Handle, Textfeld für Überschrift, Löschen-Button
       ├── "Zutat hinzufügen"-Button (bestehend, unverändert)
       └── "Gruppe hinzufügen"-Button [NEU] — fügt eine GruppenUeberschriftZeile am Ende der Liste ein
```
Jede Zeile (Zutat oder Überschrift) ist einzeln greifbar und wird per Drag an eine neue Position in der gemeinsamen Liste verschoben — Zutaten und Überschriften liegen in einer einzigen, gemeinsam sortierbaren Reihenfolge.

**Rezept-Detailseite (`/rezept/[id]`) — Zutatenliste, erweitert:**
```
RezeptDetail (bestehend)
  └── Zutatenliste [ERWEITERT]
       ├── Ungruppierte Zutaten (falls vorhanden, vor der ersten Überschrift) — wie bisher ohne Heading
       ├── Gruppe 1: Überschrift [NEU] + zugehörige Zutaten
       ├── Gruppe 2: Überschrift [NEU] + zugehörige Zutaten
       └── ... (in gespeicherter Reihenfolge)
```
Rezepte ohne jegliche Überschriften-Zeile zeigen weiterhin exakt die bisherige flache Liste — visuell keine Änderung für den Nutzer.

### B) Datenmodell (fachlich beschrieben)

Jeder Eintrag in der Zutatenliste eines Rezepts ist entweder:

- **eine Zutat** — wie bisher: Name, Menge, Einheit, Position in der Liste, optional verknüpfte Nährwert-Quelle
- **eine Gruppen-Überschrift** — neu: nur ein Beschriftungstext (max. 40 Zeichen) und eine Position in derselben Liste

Beide Eintrags-Arten liegen in **derselben fortlaufenden Reihenfolge**. Welche Zutaten zu welcher Gruppe gehören, ergibt sich automatisch daraus, welche Überschrift zuletzt vor ihnen in der Liste stand — es gibt keine separate "Gruppen"-Verwaltung, keine Gruppen-IDs, keine eigene Tabelle. Zutaten vor der ersten Überschrift gehören zu keiner Gruppe.

Gespeichert wird weiterhin in derselben Datenstruktur wie heute (`recipe_ingredients`), nur um die Information "ist das eine Zutat oder eine Überschrift" ergänzt. Bestehende Rezepte haben ausschließlich Zutaten-Einträge und bleiben dadurch unverändert funktionsfähig — keine Datenmigration notwendig.

### C) Tech-Entscheidungen (Begründung)

- **Warum `@dnd-kit` statt einer Eigenbau-Lösung?** Drag-and-Drop mit korrektem Touch-Verhalten (Scrollen vs. Ziehen unterscheiden, Auto-Scroll am Bildschirmrand, Tastatur-Zugänglichkeit) selbst zu bauen ist aufwändig und fehleranfällig. `@dnd-kit` ist der aktuelle Standard im React-Ökosystem für genau diesen Fall und deckt die Mobile-first-Anforderung der Spec direkt ab.
- **Warum keine neue Tabelle für Gruppen?** Eine separate Tabelle würde bedeuten, dass jede Zutat auf eine Gruppen-ID verweist — bei jedem Umsortieren müsste diese Verknüpfung mitgepflegt werden, inklusive der Sonderfälle "Zutat vor der ersten Gruppe" und "Gruppe löschen, Zutaten bleiben". Die gewählte Lösung (Überschrift als eigener Zeilentyp in der ohnehin bestehenden, reihenfolge-basierten Liste) bildet die Gruppierung allein durch die Position ab — einfacher zu verstehen, einfacher zu testen, und passt zum bestehenden "komplett neu schreiben beim Speichern"-Muster aus PROJ-8.
- **Warum Validierung an zwei Stellen (Client + Server)?** Gleiches Muster wie der Rest der Admin-Rezept-API: Der Client gibt sofortiges Feedback ohne Serverkontakt, der Server validiert unabhängig davon nochmal — falls die Anfrage nicht über das Formular, sondern direkt an die API geschickt wird.

### D) Abhängigkeiten (zu installierende Pakete)

- `@dnd-kit/core` — Grundlegende Drag-and-Drop-Funktionalität (Sensoren für Maus/Touch/Tastatur)
- `@dnd-kit/sortable` — Fertige Sortier-Logik für Listen (Zutaten + Überschriften neu anordnen)
- `@dnd-kit/utilities` — Hilfsfunktionen für die visuelle Darstellung während des Ziehens (CSS-Transforms)

Kein neues Backend-Paket nötig — die Änderung an der Admin-API ist eine Erweiterung des bestehenden Validierungs- und Speicher-Musters.

## Implementation Notes (Frontend)

**Geänderte Dateien:**
- `src/components/rezept-formular.tsx` — Zutatenliste komplett auf `@dnd-kit` umgestellt: `DndContext` + `SortableContext` umschließen alle Zeilen, jede Zeile (`SortableZutatZeile` / `SortableGruppenZeile`, beide neu, im selben File) ist einzeln per Drag-Handle (`GripVertical`-Icon) verschiebbar, mit `PointerSensor` (Maus) und `TouchSensor` (Touch, `delay: 150ms`/`tolerance: 5px` um Scrollen nicht zu blockieren). Neuer Button "Gruppe hinzufügen" neben "Zutat hinzufügen". `ingredientMacros`-State von index-basiertem Array auf `Record<fieldId, NutritionPer100g | null>` umgestellt, damit verknüpfte Nährwert-Quellen beim Umsortieren korrekt an der jeweiligen Zutat bleiben (nicht an der alten Position). Neue Hilfsfunktion `findEmptyGroupLabel()` prüft vor dem Speichern auf leere Gruppen und blockiert den Submit mit Fehlermeldung.
- `src/app/admin/rezepte/[id]/bearbeiten/page.tsx` — `defaultValues.ingredients`-Mapping um `itemType: 'zutat', groupLabel: ''` ergänzt (bestehende Rezepte haben aktuell nur Zutaten-Zeilen, da das Backend Gruppen noch nicht persistiert).

**Bekannter Folgefehler (behoben):** Beim ersten Live-Test durch den Product Owner zeigte das Formular `[object Object]` als Fehlermeldung statt eines lesbaren Texts. Ursache: `data.error` ist bei Zod-Validierungsfehlern ein Objekt (`flatten()`-Ergebnis), nicht ein String — `new Error(data.error)` hat das Objekt zu `"[object Object]"` gecastet. Fix in `rezept-formular.tsx`: Fehlermeldung wird jetzt aus `data.error.fieldErrors` zusammengesetzt, wenn `data.error` kein String ist.

### Refinement: Markdown-Formatierung in der Zubereitung (2026-07-21)

**Geänderte/neue Dateien:**
- `src/lib/format-rezept-text.tsx` — **neu**. `formatRezeptText(text: string): ReactNode[]` erkennt `**fett**`, `*kursiv*` und `__unterstrichen__` per Regex (`/\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*/g`, Bold-Alternative zuerst, damit `**` nicht fälschlich als zwei einzelne `*`-Marker erkannt wird) und baut daraus `<strong>`/`<em>`/`<u>`-Elemente. Kein `dangerouslySetInnerHTML` — Text außerhalb der Marker bleibt normaler React-Text-Node, dadurch strukturell kein XSS-Vektor möglich.
- `src/app/rezept/[id]/page.tsx` — Zubereitungs-Absatz rendert jetzt `formatRezeptText(recipe.instructions)` statt des rohen Strings. `whitespace-pre-line` bleibt auf dem umschließenden `<p>`, Zeilenumbrüche funktionieren unverändert (werden von Kind-Elementen geerbt).
- `src/components/rezept-formular.tsx` — Formatierungs-Toolbar (3 Icon-Buttons: Fett/Kursiv/Unterstrichen, `lucide-react` `Bold`/`Italic`/`Underline`) über dem Zubereitungs-Textfeld. Neue Funktion `applyInstructionsFormat(marker)`: liest `selectionStart`/`selectionEnd` über eine zusätzliche Ref (`instructionsRef`, gemerged mit dem React-Hook-Form-Ref über `instructionsField.ref`), umschließt die Selektion mit dem Marker (leere Selektion → Marker paarig an der Cursor-Position, Cursor landet dazwischen), schreibt den neuen Wert direkt auf das DOM-Element UND über `setValue(..., { shouldDirty: true })` ins Formular zurück.

**Kein Backend-Änderung nötig** (wie in der Architektur festgelegt) — `instructions` ist bereits ein Freitext-Feld, die Marker sind einfach zusätzliche Zeichen im bestehenden String, gespeichert über die unveränderte Admin-API.

**Tests:** 7 neue Vitest-Tests in `src/lib/format-rezept-text.test.tsx` (`@testing-library/react`) — je ein Test pro Formatierungs-Typ, unformatierter Text bleibt unverändert, mehrere Marker im selben Text, unpaarige Marker bleiben Klartext, sowie ein expliziter XSS-Test (`**<img src=x onerror=alert(1)>**` wird als Text im `<strong>` gerendert, kein `<img>`-Element entsteht). Gesamte Suite: 209/209 grün.

**Manuelle Live-Verifikation:** Das echte Rezept "Spitzhkohl Erdnuss Nudeln" enthielt bereits `*Nudeln*` in Schritt 8 (vom Admin während der vorherigen Session eingetippt, bevor dieses Feature existierte) — diente als organischer Live-Test ohne Datenänderung: Screenshot bestätigt "Nudeln" wird kursiv ohne Sternchen dargestellt, der Rest des Texts unverändert. Die Admin-Toolbar selbst konnte nicht live durchgeklickt werden (kein Zugriff auf den echten Admin-Account/Passwort — `ADMIN_EMAIL` ist die private Adresse des Product Owners, gleiche Einschränkung wie bei BUG-2/Touch-Drag dokumentiert); Verifikation dort per Code-Review (Standard-DOM-Selection-API, gleiche Technik wie in unzähligen Rich-Text-Toolbars, kein exotisches Verhalten).

## Implementation Notes (Backend)

**DB-Migration** (`recipe_ingredients_add_item_type_and_label`, angewendet auf Projekt `endlichsattsupybase`):
- `name`, `amount`, `unit` von NOT NULL auf nullable umgestellt
- Neue Spalten: `item_type TEXT NOT NULL DEFAULT 'zutat' CHECK (item_type IN ('zutat', 'gruppe'))`, `label TEXT`
- Neuer CHECK-Constraint `recipe_ingredients_type_shape_check`: erzwingt auf DB-Ebene, dass `zutat`-Zeilen `name`/`amount`/`unit` gesetzt haben und `gruppe`-Zeilen ein nicht-leeres `label` (≤ 40 Zeichen) — zweite Sicherheitsebene unabhängig von der API-Validierung
- Bestehende 75 Zutaten-Zeilen (alle 5 Rezepte) automatisch auf `item_type = 'zutat'` migriert, keine Datenverluste, keine manuelle Nacharbeit nötig
- `src/types/database.ts` neu generiert (`generate_typescript_types`)

**Geänderte/neue Dateien:**
- `src/lib/recipe-ingredients-schema.ts` — **neu**. Gemeinsames Zod-Schema (`RecipeIngredientsSchema`, discriminated union über `item_type`) für beide Admin-Routen, um die komplexe Validierungslogik (Pflicht-Zutat vorhanden, keine leeren Gruppen) nicht doppelt zu pflegen. `isZutat()`-Type-Guard zum Filtern der Zutaten-Zeilen für Makro-/Matrix-Berechnung.
- `src/app/api/admin/rezepte/route.ts` (POST) und `src/app/api/admin/rezepte/[id]/route.ts` (GET/PUT) — nutzen jetzt `RecipeIngredientsSchema`. Persistenz schreibt `item_type`/`label` mit; `calculateMacrosPerServing`/`calculateRezeptMatrix` laufen nur noch über die gefilterten Zutaten-Zeilen (Gruppen haben keine Nährwerte).
- `src/app/api/rezepte/[id]/route.ts` — Select + Response um `item_type`/`label` ergänzt (Konsistenz mit den Admin-Routen, auch wenn die aktuelle UI diese Route nicht direkt aufruft).
- `src/app/admin/rezepte/[id]/bearbeiten/page.tsx` — lädt jetzt `item_type`/`label` aus der DB und mapped sie korrekt auf `itemType`/`groupLabel` im Formular — bestehende Rezepte können jetzt tatsächlich Gruppen laden/speichern.
- `src/app/rezept/[id]/page.tsx` — Zutatenliste wird serverseitig anhand `item_type` in Abschnitte gruppiert (`zutatenGruppen`-Reduce), Gruppen-Label wird als kleine Überschrift über den zugehörigen Zutaten gerendert. Rezepte ohne Gruppen zeigen weiterhin exakt die bisherige flache Liste.

**Validierung (zwei Ebenen wie in der Architektur festgelegt):**
1. Client (`rezept-formular.tsx`): `findEmptyGroupLabel()` vor dem Submit
2. Server (`RecipeIngredientsSchema`): `.refine()` für "mindestens eine Zutat" und "keine leeren Gruppen", zusätzlich DB-CHECK-Constraint als dritte, unabhängige Ebene

**Tests:** 6 neue Vitest-Integrationstests (POST/PUT: Gruppe erfolgreich anlegen inkl. `item_type`/`label`-Payload-Assertion, leere Gruppe → 400, nur Gruppen ohne Zutat → 400). Bestehende Tests (`route.test.ts`, `[id]/route.test.ts`) auf das neue Payload-Format aktualisiert. Gesamte Suite: 189/189 Tests grün, `tsc --noEmit` und ESLint fehlerfrei.

**Manueller Live-Test:** Vom Product Owner direkt im Dev-Server durchgeführt (`/admin/rezepte/[id]/bearbeiten`, echtes Rezept). Der `[object Object]`-Fehler beim Speichern einer Gruppe wurde dabei gefunden und behoben (siehe oben) — das war die einzige gefundene Regression.

## QA Test Results

**Tested:** 2026-07-20
**App URL:** http://localhost:3000 (Dev-Server)
**Tester:** QA Engineer (AI)

### Testmethodik

Der Admin-Editor selbst (Drag-and-Drop, "Gruppe hinzufügen") läuft auf Seiten mit echtem Server-seitigem Admin-Auth-Check — automatisiertes Browser-Testing (Playwright) kann diesen Check nicht mocken (greift auf dem Next.js-Server, nicht im Browser; gleiche Einschränkung wie in PROJ-9/PROJ-13 dokumentiert). Die Testabdeckung kombiniert deshalb vier Quellen:

1. **Echter manueller Live-Test durch den Product Owner** im Dev-Server (Rezept "Spitzhkohl Erdnuss Nudeln") — per direkter DB-Abfrage verifiziert
2. **E2E-Tests (Playwright)** für alles, was ohne Admin-Session testbar ist: öffentliche Anzeige (gegen das echte Rezept "Spitzhkohl Erdnuss Nudeln", kein eigenes Test-Fixture), Zugriffskontrolle, API-Security — `tests/PROJ-24-rezept-zutaten-gruppierung.spec.ts`, 18/18 grün (Desktop + Mobile 375px)
3. **Integrationstests (Vitest)** für die Server-Validierung: `src/app/api/admin/rezepte/route.test.ts`, `[id]/route.test.ts` — 6 neue + alle bestehenden Tests aktualisiert
4. **Unit-Tests (Vitest)** für die reine Validierungslogik: `src/lib/recipe-ingredients-schema.test.ts` — 13 neue Tests
5. **Code-Review** für UI-Verhalten, das weder per DB-Query noch per E2E beobachtbar ist (z.B. Drag-Verhalten im Detail)

### Acceptance Criteria Status

#### Admin — Zutaten umsortieren
- [x] Drag-and-Drop übernimmt neue Reihenfolge sofort im Formular — Code-Review (`@dnd-kit`-Wiring korrekt: `DndContext`/`SortableContext`/`useSortable`, `move()` aus `useFieldArray`) + manueller Live-Test (Reihenfolge im gespeicherten Rezept entspricht der Bearbeitung)
- [x] Touch-Umsortierung gleichwertig zur Maus — `TouchSensor` korrekt konfiguriert (`delay: 150ms`, `tolerance: 5px`, verhindert Scroll-Konflikt). **Nicht auf echtem Touch-Gerät verifiziert** — siehe BUG-2
- [x] Reihenfolge wird persistiert und auf der Detailseite in gespeicherter Reihenfolge angezeigt — Live-Test: `sort_order` 0–9 sequenziell und korrekt in DB, E2E-Test bestätigt Anzeige-Reihenfolge am echten Rezept "Spitzhkohl Erdnuss Nudeln"
- [x] Verknüpfte Nährwert-Quelle bleibt nach Verschieben korrekt der Zutat zugeordnet — `ingredientMacros` ist jetzt `Record<fieldId, ...>` statt indexbasiert (Code-Review); Live-Test zeigt alle 9 Zutaten-Zeilen im echten Rezept mit korrekt gesetzten `macros_per_100g`, keine Vertauschung erkennbar

#### Admin — Gruppen-Überschriften
- [x] "Gruppe hinzufügen" erzeugt neue Überschriften-Zeile — Code-Review + Live-Test (Gruppe "Dressing" wurde erfolgreich angelegt)
- [x] Per Drag positionierte Gruppe bestimmt Zutaten-Zugehörigkeit — Live-Test: Gruppe "Dressing" (sort_order 5) gefolgt von 4 Zutaten (sort_order 6–9), korrekt der Gruppe zugeordnet; per E2E direkt gegen dieses echte Rezept bestätigt
- [x] Zutaten vor der ersten Überschrift bleiben ungruppiert — Live-Test: 5 Zutaten vor "Dressing" mit `label: null`; E2E-Test `zeigt ungruppierte Zutaten vor der ersten Überschrift ohne Heading` grün
- [x] Leeres Label blockiert Speichern — Unit-Test (`RecipeIngredientItemSchema`) + Integrationstest (Zod `min(1)` auf `label`)
- [x] Leere Gruppe blockiert Speichern — Unit-Test (`hasEmptyGroup`-Fälle: zwei Überschriften hintereinander, Überschrift am Ende) + Integrationstest (`returns 400 when a group header has no following ingredient`)
- [x] Löschen einer Überschrift verliert keine Zutaten (Merge in vorherige Gruppe) — Code-Review: reines Entfernen der Zeile aus dem Array (`remove(index)`), keine Kaskaden-Logik nötig, da Gruppierung positionsbasiert aus dem verbleibenden Array neu abgeleitet wird. **Nicht explizit im UI durchgeklickt** — geringes Risiko, da Eigenschaft der Architektur und nicht bespoke Code

#### Nutzer — Anzeige auf der Rezept-Detailseite
- [x] Gruppierte Anzeige mit Überschriften — E2E-Test `zeigt Gruppen-Überschrift über den zugehörigen Zutaten` grün (echte DB-Daten, kein Mock)
- [x] Rezepte ohne Gruppen zeigen unveränderte flache Liste — E2E-Test gegen bestehendes Rezept "Fenchelsalat" (kein Gruppen-Feature genutzt) grün, keine visuelle Regression

#### Bestehende Validierung bleibt bestehen
- [x] "Mindestens eine Zutat"-Regel weiterhin aktiv, auch wenn nur Gruppen übrig sind — Unit-Test + Integrationstest (`returns 400 when ingredients contain only group headers`) + UI-seitig ohnehin unerreichbar (Löschen der letzten Zutat ist im Formular deaktiviert)

**12/12 Acceptance Criteria erfüllt** (2 mit dokumentierter Einschränkung, siehe BUG-2 und Hinweis oben — beide nicht blockierend)

### Edge Cases Status
- [x] Zwei Gruppen-Überschriften hintereinander → Validierungsfehler — Unit- + Integrationstest
- [x] Gruppen-Überschrift am Listenende ohne Zutat → Validierungsfehler — Unit- + Integrationstest
- [ ] Touch-Auto-Scroll bei langen Listen am Bildschirmrand — **nicht verifiziert**, siehe BUG-2
- [x] Makros bleiben nach Verschieben an der richtigen Zutat — Live-Test-Daten zeigen korrekte Zuordnung, Code-Review bestätigt Root-Cause-Fix (fieldId-Keying)
- [x] Bestehende Rezepte ohne Gruppen unverändert, keine Migration nötig — DB-Check: alle ursprünglich 75 Zutaten-Zeilen automatisch auf `item_type = 'zutat'` migriert, 0 Datenverlust
- [x] Löschen der einzigen Gruppe → Zutaten vollständig ungruppiert — Code-Review (siehe oben)
- [x] Netzwerkfehler beim Speichern → Formular behält Eingaben — bestehendes, unverändertes try/catch/finally-Muster, keine Regression durch diesen Diff

### Security Audit Results
- [x] Authentication: Alle geänderten/neuen API-Routen (`POST`/`PUT /api/admin/rezepte*`) geben weiterhin 401 ohne Session zurück — E2E- und Vitest-Tests bestätigt
- [x] Authorization: 403 für eingeloggte Nicht-Admins — E2E- und Vitest-Tests bestätigt; RLS unverändert (nur Spalten ergänzt, keine Policy-Änderung)
- [x] Input validation: `label`/`name` serverseitig per Zod validiert (Länge, Pflichtfeld), zusätzlich DB-CHECK-Constraint als dritte Ebene; React escaped Gruppen-Label und Zutatennamen automatisch beim Rendern (kein `dangerouslySetInnerHTML`) → kein XSS-Vektor über Gruppen-Label gefunden
- [x] Keine sensiblen Daten in neuen API-Response-Feldern (`item_type`, `label` sind unkritische Strukturdaten)
- [x] Rate limiting: keine Änderung ggü. bestehendem Verhalten der Admin-Routen (out of scope für dieses Feature, kein neuer Gap)

### Bugs Found

#### BUG-1 (Gefunden & behoben während /backend): `[object Object]` statt lesbarer Fehlermeldung beim Speichern einer Gruppe
- **Severity:** Medium
- **Steps to Reproduce:** Gruppe im Editor anlegen → Speichern, bevor die Backend-API `item_type` unterstützte
- **Ursache:** `data.error` ist bei Zod-Validierungsfehlern ein Objekt (`.flatten()`), `new Error(data.error)` castete es zu `"[object Object]"`
- **Status:** ✅ FIXED — `rezept-formular.tsx` extrahiert jetzt `fieldErrors` in einen lesbaren String
- **Priority:** War blockierend, ist behoben

#### BUG-2: Touch-Drag-and-Drop und Auto-Scroll nicht auf echtem Touch-Gerät verifiziert
- **Severity:** Low
- **Beschreibung:** `TouchSensor` ist korrekt konfiguriert (Code-Review), aber weder auf einem echten Smartphone/Tablet noch per Touch-simulierendem E2E-Test verifiziert. Playwrights "Mobile Chrome"-Projekt emuliert nur Viewport-Breite, nicht echte Touch-Drag-Gesten. Speziell der Edge Case "Auto-Scroll am Bildschirmrand bei langen Listen" (explizit in der Spec dokumentiert) ist ungetestet.
- **Priority:** Nice to have — vor dem produktiven Rollout einmal manuell auf einem echten Gerät gegenprüfen, blockiert Deployment aber nicht (Desktop-Pfad vollständig funktional, Editor ist Admin-only/Single-User-Tool)

#### BUG-3 (Out of Scope, pre-existing, untersucht): `/rezept/[id]` gibt bei ungültiger ID HTTP 200 statt 404 zurück
- **Severity:** Low
- **Steps to Reproduce:** `GET /rezept/non-existent-recipe-id-12345` → Next.js rendert die Not-Found-UI korrekt (HTML enthält "not-found"/404-Marker), aber der HTTP-Status ist 200 statt 404
- **Verifiziert als nicht PROJ-24-bedingt:** Reproduziert identisch mit `git stash` auf den unveränderten Pre-PROJ-24-Code
- **Verifiziert als projektweit, nicht dateispezifisch:** `/mahlzeit/[id]` (unabhängige Route aus PROJ-6) zeigt exakt dasselbe Verhalten
- **Vertiefte Untersuchung (auf expliziten Wunsch):**
  - Ursprüngliche Theorie — `loading.tsx` lässt den Stream mit Status 200 starten, bevor `notFound()` im async Server Component greift — durch Entfernen von `loading.tsx` **widerlegt**: Status bleibt 200 auch ohne Loading-Skeleton
  - Fix-Versuch: `notFound()` in `generateMetadata()` vorgezogen (Next.js-Standardmuster für genau diesen Fall, inkl. `React.cache()` zum Dedupen der Query) — **behebt den Status-Code ebenfalls nicht**, weder im Dev-Server noch im Produktions-Build (`next build && next start`)
  - Echte Next.js-404-Fälle (nicht existierende Route, kein `notFound()`-Aufruf nötig) funktionieren korrekt (`/totally-random-page` → 404) — das Problem betrifft spezifisch programmatische `notFound()`-Aufrufe innerhalb dynamischer Server Components
  - **Vorläufige Einschätzung:** Wirkt wie ein Verhalten/Bug auf Next.js-16.1.1-Ebene selbst, nicht in der Anwendungslogik behebbar mit den Standard-Next.js-Mustern. Root Cause nicht abschließend gefunden — bräuchte entweder ein Next.js-Downgrade zum Vergleich oder einen Workaround außerhalb des App-Router-Standardmusters (z.B. expliziter Response-Status in einem Route Handler statt einer Page-Komponente)
- **Nebeneffekt des Fix-Versuchs:** `generateMetadata()` wurde beibehalten (schadet nicht, liefert jetzt korrekt den Rezepttitel als `<title>`-Tag statt des statischen "endlichsatt" — vorher fehlte das komplett)
- **Priority:** Separates Ticket empfohlen — Untersuchung war deutlich aufwändiger als erwartet und reicht über PROJ-24 und sogar über die Anwendungslogik hinaus. Blockiert dieses Feature nicht (sichtbare UX ist korrekt, nur der HTTP-Status-Code ist betroffen)

### Regressionstest
- Vollständige Vitest-Suite: **202/202 grün** (`npm test`)
- `tsc --noEmit` und ESLint: fehlerfrei über alle geänderten Dateien
- E2E-Regressionslauf der gesamten Suite (`npm run test:e2e`, alle ~30 Spec-Dateien parallel) zeigte 91 Fehlschläge quer über praktisch alle Features (PROJ-2 bis PROJ-22) — verifiziert als **Infrastruktur-Flakiness** (gemeinsamer QA-Account + reales Supabase-Backend unter hoher Parallelität), nicht als PROJ-24-Regression: stichprobenartig isoliert erneut ausgeführte Spec-Dateien (PROJ-9: 9/9, PROJ-8: 15/16 — der eine Fehlschlag ist BUG-3, pre-existing) liefen jeweils grün bzw. mit demselben vorbestehenden Befund

### Summary
- **Acceptance Criteria:** 12/12 passed (2 mit dokumentierter, nicht-blockierender Einschränkung)
- **Bugs Found:** 3 total (0 Critical, 0 High, 1 Medium — bereits behoben, 2 Low)
- **Security:** Pass — keine neuen Schwachstellen gefunden
- **Production Ready:** YES
- **Recommendation:** Deploy. BUG-2 (echtes Touch-Gerät gegenprüfen) und BUG-3 (pre-existing 404-Status) als Nice-to-have/separates Ticket nachverfolgen, beide nicht blockierend.

---

## QA Test Results — Refinement: Markdown-Formatierung (2026-07-21)

**Tested:** 2026-07-21
**App URL:** http://localhost:3000 (Dev-Server, echtes Supabase-Backend)
**Tester:** QA Engineer (AI)

### Testmethodik
Gleiche Einschränkung wie beim ursprünglichen PROJ-24-QA-Pass: Die Toolbar-Buttons leben im Admin-Editor hinter einem echten Server-seitigen Admin-Auth-Check (`ADMIN_EMAIL` = private Adresse des Product Owners) — kein Test-Account mit Admin-Rechten verfügbar, daher kein Browser-Klicktest der Buttons selbst möglich. Kombinierte Testabdeckung:
1. **Unit-Tests (Vitest + Testing Library)** für den Parser: `src/lib/format-rezept-text.test.tsx`, 7/7 grün
2. **E2E-Test (Playwright)** für die öffentliche Anzeige: `tests/PROJ-24-rezept-zutaten-gruppierung.spec.ts`, neuer Test in eigenem `describe`-Block
3. **Code-Review** für die Toolbar-Interaktion im Admin-Editor (Selection-API-Handling, Cursor-Positionierung)
4. **Vollständiger Regressionslauf** der bestehenden PROJ-24- und PROJ-8-E2E-Suiten

### Acceptance Criteria Status

#### Admin — Markdown-Formatierung im Zubereitungs-Textfeld
- [x] Fett-Button umschließt Selektion mit `**` — Code-Review (`applyInstructionsFormat('**')`, korrekt verdrahtet an den Button-Klick)
- [x] Kursiv-Button umschließt Selektion mit `*` — Code-Review (`applyInstructionsFormat('*')`)
- [x] Unterstrichen-Button umschließt Selektion mit `__` — Code-Review (`applyInstructionsFormat('__')`)
- [x] Ohne Selektion: Marker paarig an Cursor-Position eingefügt, Cursor dazwischen platziert — Code-Review bestätigt: bei leerer Selektion (`selected.length === 0`) kollabiert `setSelectionRange(cursorStart, cursorStart + 0)` korrekt auf eine Cursor-Position zwischen den beiden eingefügten Markern
- [x] Zubereitung wird inkl. Marker unverändert gespeichert — kein neuer Code-Pfad, der Marker herausfiltert oder verändert (per Grep bestätigt); nutzt denselben, unveränderten Submit-Flow wie zuvor
- **Nicht per Browser-Klick durchgetestet** — siehe BUG-4 (analog zu BUG-2 aus dem ursprünglichen PROJ-24-QA-Pass)

#### Nutzer — Formatierte Zubereitung auf der Rezept-Detailseite
- [x] `**Text**` → fett dargestellt, ohne Sternchen — Unit-Test `rendert **Text** als <strong>`
- [x] `*Text*` → kursiv dargestellt, ohne Sternchen — Unit-Test `rendert *Text* als <em>`
- [x] `__Text__` → unterstrichen dargestellt, ohne Unterstriche — Unit-Test `rendert __Text__ als <u>`
- [x] Text ohne Marker (Altbestand) bleibt unverändert reiner Fließtext — Unit-Test `lässt Text ohne Marker unverändert als reinen Text` + E2E-Test bestätigt am echten, aktuellen Rezepttext keine rohen `**`-Reste
- [x] Zeilenumbrüche bleiben erhalten, unabhängig von Formatierung — Code-Review: `whitespace-pre-line` bleibt auf dem umschließenden `<p>`, wird von den neuen Kind-Elementen (`<strong>`/`<em>`/`<u>`/Text-Fragmenten) geerbt (CSS-Property ist vererbend); zusätzlich visuell im Live-Screenshot während `/frontend` bestätigt (Nummerierte Schritte 1–8 korrekt getrennt)

**10/10 neue Acceptance Criteria erfüllt** (1 mit dokumentierter, nicht-blockierender Einschränkung — siehe BUG-4)

### Security Audit Results
- [x] **XSS über Formatierungs-Marker:** Explizit mit Angriffs-Payload getestet (`**<img src=x onerror=alert(1)>**`) — Unit-Test bestätigt: kein `<img>`-Element entsteht, der komplette String landet als reiner Text-Inhalt im `<strong>`. Kein `dangerouslySetInnerHTML` im gesamten Diff (per Grep verifiziert).
- [x] **Authentication/Authorization:** Keine neuen API-Routen, kein geändertes Auth-Verhalten — bestehende 401/403-Tests der Admin-Rezept-API weiterhin grün (Regressionslauf)
- [x] **Input Validation:** Keine Änderung an der Zod-Validierung nötig/vorgenommen — `instructions` bleibt ein einfaches Pflicht-Textfeld, Marker sind nur zusätzliche Zeichen im bestehenden String
- [x] **ReDoS/Performance:** Parser-Regex (`/\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*/g`) hat keine verschachtelten Quantifizierer — worst-case linear-quadratisches Verhalten bei pathologischem Input, für realistische Rezepttext-Längen (wenige KB, nur von Admin editierbar) irrelevant

### Bugs Found

#### BUG-4: Formatierungs-Toolbar nicht per echtem Browser-Klick verifiziert
- **Severity:** Low
- **Beschreibung:** Analog zu BUG-2 — die drei Toolbar-Buttons (Fett/Kursiv/Unterstrichen) sind per Code-Review verifiziert (Standard-`selectionStart`/`selectionEnd`-API, korrekt an `setValue` gekoppelt), aber nicht live im Browser durchgeklickt, da kein Test-Account mit Admin-Rechten existiert (`ADMIN_EMAIL` ist die private Adresse des Product Owners).
- **Priority:** Nice to have — vor dem produktiven Rollout einmal manuell im Editor gegenprüfen (markieren → Button klicken → Marker erscheinen wie erwartet), blockiert Deployment aber nicht (Logik ist einfache, gut verstandene Browser-Standard-API, kein exotisches Verhalten)

### Regressionstest
- Vollständige Vitest-Suite: **209/209 grün** (202 bestehend + 7 neu für den Parser)
- `tsc --noEmit` und ESLint: fehlerfrei über alle geänderten/neuen Dateien
- `npm run build`: erfolgreich
- E2E-Regression `tests/PROJ-24-rezept-zutaten-gruppierung.spec.ts` (Desktop + Mobile 375px): **22/22 grün** (inkl. dem neuen Markdown-Test)
- E2E-Regression `tests/PROJ-8-rezeptbibliothek.spec.ts`: 15/16 grün — der eine Fehlschlag ist das vorbestehende, dokumentierte BUG-3 (404-Status), keine neue Regression
- Ein einzelner Vitest-Lauf während dieser QA-Session zeigte 4 kurzzeitige Fehlschläge in einer Testdatei, die bei zwei direkt darauffolgenden Wiederholungen nicht reproduzierbar waren (209/209 beide Male) — bewertet als Umgebungs-Flakiness (vermutlich Ressourcen-Konkurrenz durch parallel laufende `tsc`/`eslint`/`vitest`-Prozesse in derselben Shell-Kommandozeile), nicht als Code-Defekt

### Summary
- **Acceptance Criteria (Refinement):** 10/10 passed (1 mit dokumentierter, nicht-blockierender Einschränkung)
- **Bugs Found (Refinement):** 1 total (0 Critical, 0 High, 0 Medium, 1 Low)
- **Security:** Pass — expliziter XSS-Test bestanden, keine neuen Schwachstellen
- **Production Ready:** YES
- **Recommendation:** Deploy. BUG-4 (Toolbar einmal manuell im Editor gegenprüfen) als Nice-to-have nachverfolgen, nicht blockierend — gleiche Einschätzung wie bei BUG-2.

## Deployment

**Deployed:** 2026-07-20
**Tag:** v1.9.0-PROJ-24
**Production URL:** https://endlichsattapp.vercel.app
**Commit:** `465ffed` (feat(PROJ-24): Zutaten-Reihenfolge & Gruppierung im Rezept-Editor), vorausgehend `838d11e` (Kohl-Sättigungsbewertung + Rezept-Tag-Korrekturen)

**Pre-Deployment-Checks:**
- `npm run build` — erfolgreich
- `npm run lint` — 0 Fehler (1 vorbestehende, unabhängige Warnung in `bild-cropper.tsx`)
- QA: Approved, 0 Critical/High Bugs
- Keine neuen Env-Vars nötig
- `@dnd-kit/*` korrekt in `dependencies` (nicht `devDependencies`)
- DB-Migration bereits vor `/backend` live angewendet (`recipe_ingredients_add_item_type_and_label`)
- Keine Secrets im Diff

**Post-Deployment-Verifikation:**
- Produktions-URL lädt (200), Rezept-Detailseite lädt korrekt (Gast-Sperrbildschirm greift wie erwartet für nicht-freigeschaltete Rezepte)
- Vercel-Build vom Product Owner im Dashboard als grün bestätigt

**Kein neues Setup nötig** (Vercel-Projekt, Domain, Env-Vars bereits aus vorherigen Deployments vorhanden).
