# PROJ-32: Rezept aus gescannter Mahlzeit anlegen ("wie gescannt" / "mit mehr Sättigung")

## Status: Deployed
**Created:** 2026-08-04
**Last Updated:** 2026-08-05

## Dependencies
- PROJ-31 (Nutzer legen eigene Rezepte an) — Rezept-Formular, Anlegen-Endpunkt, 5-Rezepte-Limit werden vollständig wiederverwendet
- PROJ-30 (Rezept-Eigentümerschaft & Filter) — `owner_id`-Datenmodell
- PROJ-4 (KI-Analyse-Agent) — liefert die Zutatenliste einer analysierten Mahlzeit
- PROJ-5 (Sättigungs-Einschätzung & Verbesserungsvorschlag) — liefert die Verbesserungsvorschläge ("vorschlaege") für "mit mehr Sättigung"

## User Stories
- Als registrierter Nutzer, der eine Mahlzeit gescannt hat, möchte ich sie mit einem Klick als Rezept speichern können — genau wie gegessen — damit ich die Zutaten nicht erneut eintippen muss.
- Als registrierter Nutzer, der eine Mahlzeit gescannt hat, möchte ich eine Variante "mit mehr Sättigung" speichern können, bei der die KI-Verbesserungsvorschläge bereits als zusätzliche Zutaten-Zeilen vorbereitet sind, damit ich beim nächsten Kochen direkt die sättigendere Version zubereiten kann.
- Als Nutzer möchte ich das vorausgefüllte Rezept vor dem Speichern sehen und bearbeiten können, damit KI-Vorschläge (insbesondere die fehlende Zubereitung) nie ungeprüft übernommen werden.
- Als Gast oder Nutzer ohne vollen Zugriff möchte ich beim Versuch, ein Rezept aus einer Mahlzeit anzulegen, dieselbe Registrierungs-/Limit-Führung sehen wie beim regulären Rezept-Anlegen (PROJ-31), damit das Verhalten der App konsistent bleibt.

## Out of Scope
- "Mit mehr Sättigung" für als Beilage analysierte Mahlzeiten — dort fehlt die strukturierte Vorher/Nachher-Datenbasis (keine `vorschlaege`, kein `nachher`); "Wie gescannt" bleibt für Beilagen verfügbar
- Sofortiges Speichern ohne Formular-Vorschau — bewusst abgelehnt zugunsten von Kontrolle vor dem Speichern
- Automatisches Schätzen von Mengenangaben für Verbesserungsvorschläge — der Nutzer trägt die Menge selbst ein
- Neue Datenbank-Felder oder Migrationen — reine Wiederverwendung des PROJ-31-Datenmodells
- Rezept-Erstellung aus einer noch laufenden oder unvollständigen Analyse (`status != 'completed'`)
- Deduplizierung ähnlicher Verbesserungsvorschläge — jeder Vorschlag wird als eigene Zeile übernommen, der Nutzer kann überflüssige Zeilen selbst entfernen

## Acceptance Criteria

**Sichtbarkeit & Zugriff**
- [ ] Angenommen eine vollständig analysierte Mahlzeit wird angezeigt (frisch nach der Analyse oder in der Historie unter `/mahlzeit/[id]`), wenn der Nutzer das Ergebnis betrachtet, dann sind die Buttons "Als Rezept speichern (wie gescannt)" und "Als Rezept speichern (mit mehr Sättigung)" sichtbar
- [ ] Angenommen eine als Beilage analysierte Mahlzeit wird angezeigt, wenn der Nutzer das Ergebnis betrachtet, dann ist nur "Als Rezept speichern (wie gescannt)" sichtbar
- [ ] Angenommen ein Gast oder anonymer Nutzer betrachtet sein eigenes Analyse-Ergebnis, wenn er auf einen der beiden Buttons klickt, dann wird er zur Registrierung aufgefordert (gleiches Muster wie bei `/rezept/neu` aus PROJ-31)
- [ ] Angenommen ein registrierter Nutzer ohne vollen Zugriff hat bereits 5 eigene Rezepte, wenn er auf einen der beiden Buttons klickt, dann greift derselbe Upgrade-Hinweis wie beim regulären Rezept-Anlegen (PROJ-31)

**"Wie gescannt"**
- [ ] Angenommen ein Nutzer klickt auf "Wie gescannt", wenn sich das Rezept-Formular öffnet, dann sind Titel, Zutatenliste (Name + Menge in Gramm je gegessener Zutat), Zutaten-Tags, Portionen (1) und Rezept-Typ vorausgefüllt, aber weiterhin änderbar
- [ ] Angenommen die Mahlzeit hat ein Foto, wenn sich das Formular öffnet, dann ist der bestehende Bild-Zuschneide-Dialog mit diesem Foto vorausgefüllt
- [ ] Angenommen die Mahlzeit hat kein Foto, wenn sich das Formular öffnet, dann bleibt das Bild-Feld leer wie beim regulären Anlegen
- [ ] Angenommen das Formular ist vorausgefüllt, wenn der Nutzer die Zubereitung unverändert lässt und speichert, dann wird der vorausgefüllte Platzhaltertext als Zubereitung übernommen (kein Blockieren durch die Pflichtfeld-Validierung, da das Feld nicht leer ist)

**"Mit mehr Sättigung"**
- [ ] Angenommen ein Nutzer klickt auf "Mit mehr Sättigung", wenn sich das Formular öffnet, dann enthält die Zutatenliste zusätzlich zu den ursprünglichen Zutaten eine neue Zeile pro Verbesserungsvorschlag (Name = Vorschlagstext, Menge und Einheit leer)
- [ ] Angenommen eine aus einem Verbesserungsvorschlag übernommene Zutaten-Zeile hat keine Menge, wenn der Nutzer versucht zu speichern, dann verhindert die bestehende Validierung (Menge muss positiv sein) das Abschicken, bis die Zeile ausgefüllt oder entfernt wird

**Allgemein**
- [ ] Angenommen ein Rezept wurde über "Wie gescannt" oder "Mit mehr Sättigung" gespeichert, dann zählt es normal gegen das 5-Rezepte-Limit und erscheint unter "Eigene Rezepte" wie jedes andere selbst angelegte Rezept
- [ ] Angenommen der Nutzer bricht das vorausgefüllte Formular ab, ohne zu speichern, dann wird kein Rezept angelegt (identisches Verhalten zum regulären Anlegen aus PROJ-31)

**Zutaten-Zeilen-Layout & Nährwert-Hinweis (Refinement 2026-08-05)**

> Betrifft das gemeinsame Rezept-Formular (`RezeptFormular`/`ZutatInputMitQuelle`/`NaehrwertCounter`), das PROJ-32 mit PROJ-8/24/29/31 teilt. Ausgelöst durch Nutzung des PROJ-32-Flows ("wie gescannt" liefert viele Zutaten ohne automatischen Treffer), wirkt sich aber auf alle Rezept-Bearbeitungs-Wege aus.

- [ ] Angenommen eine Zutaten-Zeile im Rezept-Formular, wenn sie angezeigt wird, dann steht der Zutat-Name in einer eigenen Zeile; Menge, Einheit und Löschen-Icon stehen darunter in einer zweiten Zeile; der Verschiebe-Griff (6 Punkte) bleibt links neben dem gesamten zweizeiligen Block, die Zeile bleibt per Drag-Handle verschiebbar
- [ ] Angenommen eine Zutat hat nach der bestehenden Hintergrund-Schätzung keinen Treffer (`status = 'not_found'` — derselbe Status, der schon heute den Hinweistext "x Zutaten ohne Nährwert-Treffer" im Nährwert-Zähler auslöst), wenn die Zeile angezeigt wird, dann wird der Zutaten-Block mit einem linken Akzentrand und leichtem Hintergrundton in der bestehenden Warnfarbe (`#D97706`) hervorgehoben
- [ ] Angenommen eine Zutat ist noch nicht ausgewertet (Schätzung lädt) oder hat einen Treffer/ist manuell mit BLS/OFF verknüpft, wenn die Zeile angezeigt wird, dann bleibt sie unhervorgehoben (kein Aufblitzen der Warnfarbe während des Ladens)
- [ ] Angenommen eine hervorgehobene Zeile wird nachträglich mit einer BLS/OFF-Quelle verknüpft oder erhält doch noch einen Treffer aus der Hintergrund-Schätzung, dann verschwindet die Hervorhebung automatisch, ohne dass der Nutzer etwas tun muss
- [ ] Die Hervorhebung ist rein visuell und nicht blockierend — Speichern bleibt trotz nicht gefundener Nährwerte weiterhin möglich (keine neue Pflicht, kein neues Validierungs-Verhalten)

## Edge Cases
- Mahlzeit ohne Freitext (reine Foto-Analyse ohne Beschreibung) → Titel fällt auf einen Datums-Platzhalter zurück (z.B. "Mahlzeit vom 04.08.")
- Zutat mit KI-geschätzten Nährwerten (`zutatenQuelle` = "schaetzung"/"nicht_schaetzbar") → wird trotzdem als normale Zutaten-Zeile übernommen; die eigentliche Nährwert-Zuordnung läuft wie bei jeder manuell eingegebenen Zutat erneut über die bestehende BLS/OFF-Suche, keine Übernahme der ursprünglichen Mahlzeit-Nährwerte
- Mahlzeit gehört einem anderen Nutzer (URL-Manipulation) → bereits durch die bestehende Eigentümer-Prüfung auf `/mahlzeit/[id]` abgedeckt; PROJ-32 kann nie von einer fremden Mahlzeit aus gestartet werden
- Zwei sehr ähnliche Verbesserungsvorschläge (z.B. beide zielen auf mehr Protein) → beide werden als separate Zeilen übernommen, keine automatische Zusammenführung
- Nutzer ändert nach dem Öffnen des vorausgefüllten Formulars alle Werte komplett → es wird ausschließlich das tatsächlich abgeschickte Formular gespeichert, keine versteckte Mahlzeit-Referenz oder Verknüpfung zur Ursprungs-Mahlzeit
- Gruppen-Überschrift-Zeilen (kein Zutat-Feld, kein Nährwert-Status) → werden nie hervorgehoben, unabhängig vom Zustand umliegender Zutaten-Zeilen

## Technical Requirements (optional)
- Kein neues Datenbank-Feld, keine neue Migration — reine Wiederverwendung des PROJ-31-Datenmodells (`recipes.owner_id`, `POST /api/rezepte`)
- Wiederverwendung von `RezeptFormular` (`variant="user"`) und dem bestehenden Anlegen-Endpunkt aus PROJ-31 — die genaue technische Übergabe der Vorbefüllung an die Formular-Seite legt `/architecture` fest
- **Refinement 2026-08-05:** Layout- und Hervorhebungs-Änderung betrifft die geteilten Komponenten `RezeptFormular` (`SortableZutatZeile`), `ZutatInputMitQuelle` und `NaehrwertCounter` — genutzt von PROJ-8/24/29/31/32 (Admin- und Nutzer-Editor gleichermaßen). Keine neuen Endpunkte, kein neues Datenfeld; die Hervorhebung nutzt den bereits vorhandenen `not_found`-Status aus `useLiveNaehrwertSchaetzung`. Kein `/architecture`-Durchlauf nötig — reine UI-Umsetzung, `/frontend` deckt es ab.

## Open Questions
- [x] Genaue technische Übergabe der Vorbefüllung an `/rezept/neu` → gelöst durch `/architecture`: Übergabe über die Seiten-Adresse (Query-Parameter mit Mahlzeit-ID + Variante), siehe Tech Design (2026-08-04)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Formular öffnet sich vorausgefüllt statt sofort zu speichern | Nutzer muss KI-Vorschläge — vor allem die fehlende Zubereitung — immer erst sehen und bestätigen, kein blindes Übernehmen | 2026-08-04 |
| Einstiegspunkt sowohl im frischen Analyse-Ergebnis als auch in der Historie (`/mahlzeit/[id]`) | Gleiche Komponente (`SaettigungsErgebnis`) an beiden Orten, geringer Mehraufwand für deutlich mehr Nutzen | 2026-08-04 |
| "Mit mehr Sättigung" nur bei vollständigen Mahlzeiten, "Wie gescannt" auch bei Beilagen | Beilagen-Analysen haben keine strukturierte Vorher/Nachher-Datenbasis für Verbesserungsvorschläge | 2026-08-04 |
| Verbesserungsvorschläge werden als neue Zutaten-Zeile mit leerer Menge übernommen, nicht als Freitext-Hinweis | Passt zur Sättigungsmatrix-Regel, dass Vorschläge fast immer "füge eine Zutat hinzu" sind — konkret umsetzbar statt nur zu lesen | 2026-08-04 |
| Zubereitung wird mit Platzhaltertext vorausgefüllt statt leer gelassen | Mahlzeit-Analyse erfasst nie echte Zubereitungsschritte; ein Platzhalter ist einladender als ein leeres Pflichtfeld | 2026-08-04 |
| Titel: Freitext der Mahlzeit falls vorhanden, sonst Datums-Fallback | Freitext ist meist schon ein guter Rezeptname und spart Tipparbeit | 2026-08-04 |
| Zutaten-Tags automatisch aus Zutatennamen abgeleitet | Pflichtfeld, spart Tipparbeit, bleibt frei editierbar | 2026-08-04 |
| Rezept-Typ automatisch aus `analysis_typ` der Mahlzeit übernommen | Konsistent mit dem gewählten Scope (nur vollständige Mahlzeiten für MVP) | 2026-08-04 |
| Mahlzeit-Foto (falls vorhanden) wird als Vorschlag in den bestehenden Bild-Zuschneide-Dialog geladen | Vermeidet erneuten Upload, nutzt den bestehenden Cropper-Flow aus PROJ-31 | 2026-08-04 |
| Portionen-Vorschlag: 1 | Übernommene Mengen entsprechen exakt einer gegessenen Mahlzeit — Nährwerte pro Portion bleiben so konsistent mit der ursprünglichen Analyse | 2026-08-04 |
| Zutaten-Zeile wird zweizeilig dargestellt (Name oben; Menge, Einheit, Löschen-Icon darunter) statt einzeilig | Ursprüngliches einzeiliges Layout war laut Nutzer zu eng, um mit Name, Menge, Einheit und Löschen gleichzeitig zu arbeiten — betrifft alle Rezept-Formulare, nicht nur den PROJ-32-Einstieg | 2026-08-05 |
| Nährwert-Treffer-Hervorhebung ist ein optionales visuelles Signal, kein Pflichtfeld und keine neue Validierung | Nutzer möchte "durchgeleitet, aber nicht gezwungen" werden — passt zum bereits bestehenden, nicht-blockierenden "x Zutaten ohne Nährwert-Treffer"-Hinweistext | 2026-08-05 |
| Hervorhebung nutzt denselben `not_found`-Status wie der bestehende Hinweistext, nicht nur "keine Quelle manuell verknüpft" | Zutaten mit erfolgreicher automatischer Hintergrund-Schätzung (aber ohne manuelle BLS/OFF-Verknüpfung) sollen nicht fälschlich als "Problem" markiert werden | 2026-08-05 |
| Visueller Stil: linker Akzentrand + leichter Hintergrundton in der bestehenden Warnfarbe `#D97706` | Konsistent mit dem Design-System (Warning-Farbe für "Hinweise"), auffällig genug, um zu lenken, ohne wie ein Fehler zu wirken | 2026-08-05 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Mahlzeit-Referenz (welche Mahlzeit, welche Variante) wird über die Seiten-Adresse von der Mahlzeit-Ansicht zur "Rezept anlegen"-Seite übergeben | Einfachster Weg, Kontext über einen Seitenwechsel zu transportieren, ohne neuen Server-Zustand; "Rezept anlegen" bleibt weiterhin ganz normal ohne Mahlzeit-Bezug aufrufbar | 2026-08-04 |
| Umwandlung "Mahlzeit-Daten → Rezept-Entwurf" passiert einmalig beim Laden der Seite, wird nirgends zwischengespeichert oder mit der Mahlzeit verknüpft | Stellt sicher, dass sich das Formular ab dem ersten Anzeigen exakt wie ein manuell gestartetes Rezept verhält — inkl. spurlosem Verwerfen (AC "keine versteckte Mahlzeit-Referenz") | 2026-08-04 |
| Wiederverwendung von Rezept-Formular und Speicher-Endpunkt aus PROJ-31 unverändert, nur mit anderen Startwerten | Kein zweiter Anlege-Weg mit doppeltem Pflegeaufwand und doppelter Sicherheits-/Limit-Prüfung | 2026-08-04 |
| Rezept-Formular bekommt eine zusätzliche Startmöglichkeit: Bild direkt im Zuschneide-Schritt vorschlagen, statt nur "fertiges Bild" oder "leerer Upload" zu kennen | Vermeidet unnötigen erneuten Upload eines bereits vorhandenen Mahlzeit-Fotos | 2026-08-04 |
| Refinement 2026-08-05: `useLiveNaehrwertSchaetzung` wird von `NaehrwertCounter` nach `RezeptFormular` hochgezogen (ein Hook-Aufruf statt zwei) | Sowohl der Nährwert-Zähler als auch die neue Zeilen-Hervorhebung brauchen denselben Pro-Zutat-Status; ein zweiter, unabhängiger Hook-Aufruf würde doppelte BLS/OFF-Suchanfragen pro Zutat auslösen | 2026-08-05 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur

```
Mahlzeit-Ergebnisansicht (SaettigungsErgebnis — bestehende Komponente,
genutzt sowohl direkt nach der Analyse als auch in der Historie)
├── ... bestehende Abschnitte (Zutatenliste, Sättigungs-Bausteine, Vorschläge, Nährwerte)
└── NEU: "Rezept speichern"-Leiste
    ├── Button "Wie gescannt" — immer sichtbar
    └── Button "Mit mehr Sättigung" — nur bei vollständigen Mahlzeiten (ausgeblendet bei Beilage)

Rezept anlegen (/rezept/neu — bestehende Seite aus PROJ-31)
├── NEU: erkennt optional eine mitgegebene Mahlzeit-Referenz in der Seiten-Adresse
│   ├── lädt die Mahlzeit + ihr Analyse-Ergebnis (bestehende Datenquelle, wie in der Historie)
│   └── baut daraus die Formular-Vorbefüllung (Titel, Zutaten, Tags, Portionen, Rezept-Typ, ggf. Bild)
└── Bestehendes Rezept-Formular (Verhalten unverändert, startet nur mit anderen Werten)
    └── NEU (kleine Erweiterung): kann direkt mit einem vorgeschlagenen Bild im
        Zuschneide-Schritt starten, statt nur mit fertigem Bild oder leerem Upload-Feld
```

### B) Datenmodell (einfache Sprache)

Kein neues Datenbank-Feld, keine neue Tabelle. Alles, was für die Vorbefüllung gebraucht wird, existiert bereits in den Datensätzen jeder abgeschlossenen Mahlzeit-Analyse (Zutatenliste, Verbesserungsvorschläge, Mahlzeit-Typ, Foto). Diese Daten werden einmalig beim Öffnen von "Rezept anlegen" gelesen und in dieselbe Form gebracht, die das Formular ohnehin für ein manuell gestartetes Rezept erwartet. Nichts davon wird gespeichert oder mit der Mahlzeit verknüpft, solange der Nutzer nicht aktiv auf "Rezept anlegen" klickt — genau wie in der Spec festgelegt, entsteht dadurch keine dauerhafte Verbindung zwischen Rezept und Ursprungs-Mahlzeit.

### C) Tech-Entscheidungen (Begründung)

1. **Die Information "aus welcher Mahlzeit, mit welcher Variante" wird über die Seiten-Adresse (URL) von der Mahlzeit-Ansicht zur "Rezept anlegen"-Seite mitgegeben.** Das ist der einfachste Weg, diesen Kontext über einen Seitenwechsel hinweg zu transportieren, ohne neuen Server-Zustand zu erfinden. Die "Rezept anlegen"-Seite bleibt dadurch weiterhin ganz normal direkt aufrufbar wie bisher (ohne Mahlzeit-Bezug) und bekommt nur zusätzlich die Fähigkeit, mit vorausgefüllten Werten zu starten.
2. **Die Umwandlung "Mahlzeit-Daten → Rezept-Entwurf" passiert einmalig beim Laden der Seite — nicht rückwirkend gespeichert, nicht mit der Mahlzeit synchronisiert.** Das stellt sicher, dass sich das Formular ab dem Moment, in dem der Nutzer es sieht, exakt so verhält wie ein ganz normal manuell gestartetes Rezept — inklusive der Möglichkeit, alles spurlos zu verwerfen.
3. **Es wird bewusst dasselbe Rezept-Formular und derselbe Speicher-Endpunkt aus PROJ-31 wiederverwendet — nur die Startwerte unterscheiden sich.** Ein zweiter, eigenständiger Anlege-Weg hätte doppelten Pflegeaufwand bedeutet und ein zweites Sicherheits-/Limit-Prüfungssystem, das dauerhaft identisch zum ersten gehalten werden müsste.
4. **Das Formular bekommt eine kleine, zusätzliche Startmöglichkeit: ein vorgeschlagenes Bild direkt im Zuschneide-Schritt zu übernehmen**, statt nur zwischen "schon fertiges Bild" und "Nutzer lädt manuell hoch" zu unterscheiden. Das vermeidet einen unnötigen Zwischenschritt (erneutes Hochladen eines Fotos, das bereits vorliegt).

### D) Abhängigkeiten (Pakete)

Keine neuen Pakete — alle nötigen Bausteine existieren bereits (Rezept-Formular, Bild-Zuschnitt, Speicher-Endpunkt, Mahlzeit-Datenmodell).

### Backend-Bedarf

Kein `/backend`-Durchlauf nötig: keine neuen Datenbank-Felder, keine neue Migration, keine neue RLS-Policy, kein neuer API-Endpunkt. Es wird ausschließlich gelesen (bestehende, bereits durch RLS abgesicherte Mahlzeit-Daten des eingeloggten Nutzers) und der bestehende PROJ-31-Speicher-Endpunkt wiederverwendet. `/frontend` deckt die komplette Umsetzung ab.

## Implementation Notes (Frontend)

**Neue/erweiterte Dateien**
- `src/components/rezept-aus-mahlzeit-buttons.tsx` (neu) — "Als Rezept speichern"-Leiste mit den beiden Buttons, verlinkt auf `/rezept/neu?mealId=<id>&variante=wie-gescannt|mehr-saettigung`. In `SaettigungsErgebnis` (nach den Rezeptvorschlägen, vor dem Reset-Button) und in `BeilagenErgebnis` (nur "Wie gescannt") eingebunden.
- `src/lib/rezept-aus-mahlzeit.ts` (neu) — reine Transformations-Funktion `buildRezeptVorbefuellung()`: Mahlzeit-Daten → Formular-Vorbefüllung (Titel, Portionen=1, Zutaten-Tags, Zutatenliste, Zubereitung-Platzhalter, Rezept-Typ). Bewusst von der Datenquelle getrennt, um unabhängig testbar zu sein.
- `src/app/rezept/neu/page.tsx` (erweitert) — liest `mealId`/`variante` aus den Such-Parametern, lädt die Mahlzeit + Analyse mit derselben Eigentümer-/Status-Prüfung wie `/mahlzeit/[id]` (`user_id`-Check + `status = 'completed'`). Bei fremder/fehlender/unvollständiger Mahlzeit: stiller Fallback auf ein leeres Formular (kein Auskunfts-Orakel über fremde Mahlzeit-IDs).
- `src/components/rezept-formular.tsx` (erweitert) — neue `suggestedImageUrl`-Prop: lädt beim Mounten (nur `mode="create"`, nur wenn noch kein Bild gesetzt) das Bild per `fetch()` zu einer lokalen Blob-URL und öffnet direkt den Zuschneide-Dialog. Bewusst über `fetch()` statt direktem `crossOrigin`-Attribut am `<img>`, um ein "tainted canvas" beim späteren Zuschneiden zuverlässig zu vermeiden, falls die Quelladresse keine passenden CORS-Header setzt — schlägt der fetch fehl, bleibt das Bild-Feld einfach leer.
- `src/components/beilagen-ergebnis.tsx` — neue `mealId`-Prop durchgereicht (wurde bisher nicht übergeben).

**Verhalten wie in der Spec festgelegt:** "Mit mehr Sättigung" wird zusätzlich nur angezeigt, wenn tatsächlich Verbesserungsvorschläge vorhanden sind (`vorschlaege.length > 0`) — bei einer bereits "sehr sättigenden" Mahlzeit ohne Vorschläge wäre der Button sonst inhaltsgleich zu "Wie gescannt" gewesen. Diese Verfeinerung geht über den wörtlichen Spec-Text hinaus, folgt aber unmittelbar aus der dort begründeten Absicht.

### Bugfix (während der Umsetzung gefunden): Live-Zutatensuche für reguläre Nutzer war seit PROJ-31 tot

Beim Testen mit echten Zutatennamen fiel auf, dass `ZutatInputMitQuelle` (Live-Suche + "Pro Portion (live)"-Zähler, aus PROJ-29 für den Admin-Editor übernommen) unverändert `/api/admin/bls-search` und `/api/admin/off-search` anspricht — beide admin-exklusiv (`requireAdmin()`). Für reguläre Nutzer im PROJ-31-Formular (`variant="user"`) lieferten beide Endpunkte durchgehend 403, seit PROJ-31 deployt wurde — die Live-Suche und der Live-Nährwert-Counter waren für alle normalen Nutzer faktisch wirkungslos (kein Datenverlust: `POST /api/rezepte` berechnet die Makros beim Speichern ohnehin serverseitig über eine eigene BLS-Datenbankabfrage, unabhängig von dieser Such-UI).

**Fix** (Nutzer-Entscheidung: sofort mitbeheben, nicht als separates Ticket):
- Zwei neue, nicht-admin-exklusive Endpunkte: `src/app/api/rezepte/bls-search/route.ts`, `src/app/api/rezepte/off-search/route.ts` — verlangen nur eine authentifizierte, nicht-anonyme Session (kein Admin), analog zum bereits etablierten Muster aus PROJ-31 (z.B. `/api/rezepte/bild` neben `/api/admin/rezepte/bild`). `bls_lebensmittel` hat bereits eine öffentliche RLS-SELECT-Policy — der reguläre Client reicht, kein Service-Role-Client nötig.
- `ZutatInputMitQuelle` und der Hook `useLiveNaehrwertSchaetzung` (genutzt von `NaehrwertCounter`) bekommen beide eine `variant`-Prop (`'admin' | 'user'`, Default `'admin'` — keine Verhaltensänderung für den bestehenden Admin-Pfad) und wählen darüber den passenden Endpunkt.
- 8 neue Vitest-Tests für die beiden neuen Routen (401/403/200-Happy-Path je Route), alle grün. Bestehende Admin-Routen-Tests unverändert grün (Default-Verhalten unangetastet).
- Live verifiziert: Netzwerk-Log vor dem Fix zeigte durchgehend 403 auf `/api/admin/*-search` beim Öffnen eines vorausgefüllten PROJ-32-Formulars; nach dem Fix 200-Antworten, und der Live-Counter zeigt korrekte, aus echten BLS-Treffern berechnete Werte (verifiziert sowohl für den PROJ-32-Vorbefüllungs-Pfad als auch für das normale manuelle Anlegen aus PROJ-31).

**Verifikation (gesamt):** `npm test` (316/316 grün, 8 davon neu), `npm run lint` (0 Fehler), `tsc --noEmit` (7 vorbestehende Fehler unverändert, keine neuen), `npm run build` (erfolgreich, alle neuen Routen registriert). Manuell im Browser verifiziert: beide Varianten ("Wie gescannt"/"Mit mehr Sättigung") für vollständige Mahlzeiten, nur "Wie gescannt" für Beilagen, kein "Mit mehr Sättigung" bei fehlenden Vorschlägen, Rezept-Typ-Übernahme, Bild-Vorschlag im Zuschneide-Dialog, vollständiger Speicher-Durchlauf inkl. Sättigungs-Matrix-Berechnung, sowie der graceful Fallback bei ungültiger/fremder `mealId`.

### Refinement 2026-08-05: Zutaten-Zeilen-Layout & Nährwert-Hervorhebung

**Geänderte Dateien** (alle Teil des gemeinsamen Rezept-Formulars, betrifft PROJ-8/24/29/31/32 gleichermaßen):
- `src/components/rezept-formular.tsx` — `SortableZutatZeile` von einer einzeiligen `flex`-Zeile auf einen zweizeiligen Block umgebaut: Name (`ZutatInputMitQuelle`) in eigener Zeile, darunter Menge/Einheit/Löschen-Icon; der Verschiebe-Griff bleibt links am gesamten Block, unverändert per `useSortable` draggable. Neue `notFound`-Prop steuert einen linken Akzentrand (`border-l-amber-400`) plus Hintergrundton (`bg-amber-50`) auf dem Zeilen-Wrapper — `border-l-2 border-l-transparent` im Normalzustand, um Layout-Sprünge beim Ein-/Ausblenden zu vermeiden.
- Der `useLiveNaehrwertSchaetzung`-Hook (bisher in `NaehrwertCounter`) wird jetzt einmalig in `RezeptFormular` aufgerufen (`naehrwertEstimates`) und sowohl an `NaehrwertCounter` (als neue `estimates`-Prop, ersetzt den bisherigen internen Hook-Aufruf und die `variant`-Prop dort) als auch an jede `SortableZutatZeile` (`notFound={naehrwertEstimates[field.id]?.status === 'not_found'}`) weitergereicht — ein Hook-Aufruf statt zwei, keine doppelten BLS/OFF-Suchanfragen.
- `src/components/naehrwert-counter.tsx` — ruft den Hook nicht mehr selbst auf, nimmt `estimates` als Prop entgegen; sonst unverändert (gleiche Zähl-/Summierlogik, gleicher "x Zutaten ohne Nährwert-Treffer"-Hinweistext).

**Verhalten wie in der Spec festgelegt:** Hervorhebung nutzt exakt denselben `not_found`-Status wie der bestehende Hinweistext — Zutaten mit erfolgreicher Hintergrund-Schätzung (aber ohne manuelle BLS/OFF-Verknüpfung) werden nicht hervorgehoben, nur echte Nicht-Treffer. Rein visuell, keine neue Validierung, Speichern bleibt uneingeschränkt möglich.

**Verifikation:** `npm test` (329/329 grün, keine Änderung an Testanzahl — reines UI-Refinement ohne neue Unit-Tests, da keine neue reine Logik-Funktion entstanden ist), `npm run lint` (0 Fehler in den geänderten Dateien), `tsc --noEmit` (keine neuen Fehler in den geänderten Dateien, die vorbestehenden 7 Fehler in Test-Dateien unverändert), `npm run build` (erfolgreich). Manuell mit Playwright gegen den laufenden Dev-Server verifiziert (`/rezept/neu`, echter Login als `qa-test@endlichsatt.dev`): zweizeiliges Layout mit Name oben, Menge/Einheit/Löschen darunter, Verschiebe-Griff links; eine Zutat ohne Treffer (`xyzznonfood123`) erhält nach der Hintergrund-Schätzung den amber Akzentrand + Hintergrundton, synchron mit dem Zähler-Hinweis "1 Zutat ohne Nährwert-Treffer"; eine Zutat mit Treffer (`Reis`) bleibt unhervorgehoben.

## QA Test Results

**Tested:** 2026-08-04
**App URL:** http://localhost:3000 (`next dev`) + `next build && next start` auf Port 3099 für Middleware-abhängige Regressionschecks
**Tester:** QA Engineer (AI)
**Testnutzer:** `qa-test@endlichsatt.dev`, mit zwei neuen permanenten Mahlzeit-Fixtures (analog zum PROJ-30-Rezept-Fixture-Muster): `44444444-…` (vollständig, mit 2 Verbesserungsvorschlägen) und `55555555-…` (Beilage)

### Acceptance Criteria Status

**Sichtbarkeit & Zugriff**
- [x] Vollständige Mahlzeit zeigt beide Buttons
- [x] Beilage zeigt nur "Wie gescannt"
- [x] Gast/anonymer Nutzer wird bei Klick zur Registrierung aufgefordert (`/konto?reason=eigenes-rezept`) — auch bei direktem Aufruf mit `mealId` in der URL, der Zugriffs-Check greift vor jeder Mahlzeit-Ladelogik
- [x] Limit-Hinweis bei 5 eigenen Rezepten greift identisch (Code-Pfad-Inspektion: `limitStatus.allowed` umschließt die komplette Formular-Ausgabe unabhängig von `mealId` — bereits ausführlich in der PROJ-31-QA mit echtem Zugriffs-Flag-Wechsel verifiziert, hier keine erneute Account-Manipulation nötig, da derselbe Codepfad)

**"Wie gescannt"**
- [x] Titel, Zutatenliste (Name + Gramm), Zutaten-Tags, Portionen=1, Rezept-Typ vorausgefüllt und änderbar
- [x] Mahlzeit-Foto wird in den Zuschneide-Dialog vorgeladen (verifiziert mit echtem Storage-Objekt: Dialog öffnet sich automatisch mit ladbarem Bild)
- [x] Ohne Foto bleibt das Bild-Feld leer
- [x] Unverändertes Speichern übernimmt den Zubereitung-Platzhaltertext, kein Blockieren

**"Mit mehr Sättigung"**
- [x] Zutatenliste enthält zusätzlich eine leere Zeile pro Verbesserungsvorschlag
- [x] Speichern ohne ausgefüllte Vorschlags-Menge schlägt fehl (Server-Validierung `amount > 0`), mit ausgefüllter Menge gelingt es

**Allgemein**
- [x] Gespeichertes Rezept zählt normal gegen das 5-Rezepte-Limit, erscheint unter "Eigene Rezepte"
- [x] Abbruch ohne Speichern hinterlässt kein Rezept (Formular sendet erst bei explizitem Submit)

### Edge Cases Status
- [x] Mahlzeit ohne Freitext → Datums-Titel-Fallback (per Unit-Test verifiziert: `buildRezeptVorbefuellung`)
- [x] Zutat mit KI-geschätzten Nährwerten → wird als normale Zeile übernommen, eigene BLS/OFF-Zuordnung beim Speichern
- [x] Fremde Mahlzeit (echte mealId eines anderen, realen Nutzers) → stiller Fallback auf leeres Formular, kein Datenleck (Titel leer, Standard-Portionen 2, eine leere Zutaten-Zeile)
- [x] Mehrere ähnliche Vorschläge → beide als separate Zeilen übernommen (per Unit-Test verifiziert)
- [x] Formular-Werte nach dem Öffnen komplett verändert → nur die abgeschickten Werte werden gespeichert (bereits aus PROJ-31 bekanntes Verhalten, hier unverändert)

### Security Audit Results
- [x] Authorization: fremde/ungültige `mealId` → kein Datenleck, leeres Formular (verifiziert mit echter Mahlzeit eines anderen Nutzers, nicht nur einer nicht-existenten ID)
- [x] Authentication: Gast mit `mealId` in der URL wird trotzdem zur Registrierung geleitet, `mealId` hebelt den Zugriffs-Check nicht aus
- [x] Input validation: Freitext-Titel und Zutaten-/Vorschlagstexte mit `<img onerror>`/`<script>`-Inhalt werden als Text angezeigt, kein ausgeführtes JavaScript (im Formular UND auf der gespeicherten Rezept-Detailseite geprüft)
- [x] Rate limiting: nicht implementiert, aber app-weite vorbestehende Lücke, nicht PROJ-32-spezifisch (wie schon in PROJ-31 dokumentiert)

### Regressionstests
- `npm test`: 329/329 grün (13 neue Unit-Tests für `buildRezeptVorbefuellung`, 8 neue aus dem Bugfix während `/frontend`)
- `tests/PROJ-30-…`, `tests/PROJ-31-…`, `tests/PROJ-32-…` (insgesamt 25 E2E-Tests) gegen einen echten Produktions-Build (`next build && next start`, Port 3099): **25/25 grün** — inklusive des PROJ-30-Tests, der unter `next dev` durchgehend an der bekannten lokalen Middleware-Einschränkung scheitert
- Responsive (375px, 768px, 1440px): "Als Rezept speichern"-Buttons und das vorausgefüllte Formular sauber auf allen drei Breiten, kein horizontales Scrollen

### Bugs Found
Keine neuen Bugs in PROJ-32 selbst gefunden. Ein Bug wurde während der `/frontend`-Umsetzung entdeckt und noch in derselben Session behoben (siehe Implementation Notes → "Bugfix"): die Live-Zutatensuche/Nährwert-Counter sprach seit PROJ-31 admin-exklusive Endpunkte an und war für reguläre Nutzer faktisch wirkungslos — behoben durch zwei neue, nicht-admin-exklusive Endpunkte. Dieser Fix wurde bereits vor dieser QA-Runde committet und ist Teil der hier verifizierten Regression.

### Summary
- **Acceptance Criteria:** 10/10 vollständig bestanden
- **Bugs Found:** 0 neue (1 während der Umsetzung gefunden und bereits behoben, siehe oben)
- **Security:** Pass — kein Datenleck über fremde `mealId`, kein Auth-Bypass, kein XSS
- **Production Ready:** Ja
- **Recommendation:** Deploy freigegeben

---

## QA Test Results — Refinement 2026-08-05 (Zutaten-Zeilen-Layout & Nährwert-Hinweis)

**Tested:** 2026-08-05
**App URL:** http://localhost:3000 (`next dev`) + `next build && next start` auf Port 3099 für den Middleware-abhängigen Regressionscheck
**Tester:** QA Engineer (AI)
**Testnutzer:** `qa-test@endlichsatt.dev` (bestehende Mahlzeit-Fixture `44444444-…`)
**Scope:** Betrifft das geteilte Rezept-Formular (`RezeptFormular`/`SortableZutatZeile`/`ZutatInputMitQuelle`/`NaehrwertCounter`), genutzt von PROJ-8/24/29/31/32 — hier über den PROJ-32-Einstieg getestet, zusätzlich Regression auf PROJ-8/24/30/31 (teilen dieselben Komponenten bzw. dieselbe `next()`-404-Middleware-Eigenheit).

### Acceptance Criteria Status

**Zutaten-Zeilen-Layout & Nährwert-Hinweis**
- [x] Zutat-Name steht in eigener Zeile, Menge/Einheit/Löschen-Icon darunter, Verschiebe-Griff bleibt links am gesamten Block erhalten und funktionsfähig (E2E: Bounding-Box-Vergleich Name vs. Menge — gleiche linke Kante, Menge unterhalb; `aria-label="Zutat verschieben"` weiterhin vorhanden). Tatsächliches Drag-Verhalten selbst nicht per E2E automatisiert — wie schon bei PROJ-24 dokumentiert (dnd-kit-Pointer-Sequenzen sind dort bewusst nicht automatisiert), stattdessen manuell im Browser bestätigt (Screenshot, siehe Implementation Notes).
- [x] Zutat ohne Nährwert-Treffer (`status = 'not_found'`) wird mit linkem Akzentrand + Hintergrundton in der Warnfarbe hervorgehoben; Zutaten mit Treffer (vorausgefüllt: Hähnchenbrust, Reis) bleiben unhervorgehoben
- [x] Während die Hintergrund-Schätzung noch lädt, erscheint keine Hervorhebung (kein Aufblitzen) — implizit durch die Statusmaschine des Hooks sichergestellt (`loading` ≠ `not_found`); im E2E-Test wird ausschließlich auf den finalen `not_found`-Zustand gewartet, ein Zwischenzustand mit Hervorhebung wurde in keinem Testlauf beobachtet
- [x] Hervorhebung verschwindet automatisch, sobald die Zutat mit einer BLS-Quelle verknüpft wird (E2E: nicht-gefundene Zutat → Treffer-Zutat "Apfel" eingetippt, erstes BLS-Ergebnis angeklickt → Hervorhebung und Hinweistext verschwinden ohne weiteres Zutun)
- [x] Hervorhebung ist rein visuell und nicht blockierend — Speichern mit nicht gefundenen Nährwerten bleibt möglich (keine neue Validierung eingeführt, bestehendes Speicher-Verhalten unverändert getestet in den ursprünglichen PROJ-32-Kriterien oben)
- [x] Gruppen-Überschriften werden nie hervorgehoben, auch wenn eine benachbarte Zutat `not_found` ist (E2E verifiziert)

### Edge Cases Status
- [x] Gruppen-Überschrift-Zeile (kein Zutat-Feld) → nie hervorgehoben, unabhängig vom Zustand umliegender Zutaten-Zeilen (E2E verifiziert, siehe oben)

### Security Audit Results
- [x] Keine neuen Endpunkte, keine neue Eingabeverarbeitung — Hervorhebung ist eine reine CSS-Klassen-Bedingung auf einem bereits vorhandenen, bereits geprüften Status (`not_found` aus `useLiveNaehrwertSchaetzung`, dessen zugrundeliegende Endpunkte `/api/rezepte/bls-search` und `/api/rezepte/off-search` bereits in der ursprünglichen PROJ-32-QA auditiert wurden)
- [x] Kein neues XSS-Risiko: Zutat-Name wird weiterhin ausschließlich über React-Text-Interpolation gerendert, keine neue `dangerouslySetInnerHTML`-Nutzung eingeführt

### Regressionstests
- `npm test`: 329/329 grün (unverändert — reines UI-Refinement ohne neue isolierte Logik-Funktion, daher keine neuen Unit-Tests nötig; bestehende Tests für `useLiveNaehrwertSchaetzung` unverändert grün)
- `npm run lint`: 0 Fehler in den geänderten Dateien
- `tsc --noEmit`: keine neuen Fehler in den geänderten Dateien (dieselben 7 vorbestehenden Fehler in Test-Dateien, unverändert)
- `npm run build`: erfolgreich
- E2E-Regression (`next dev`, Port 3000): `tests/PROJ-32-…` (26/26 grün, inkl. 4 neuer Refinement-Tests, Chromium + Mobile Chrome), `tests/PROJ-30-…` + `tests/PROJ-31-…` + `tests/PROJ-24-…` + `tests/PROJ-8-…` (102/104 grün) — die 2 verbleibenden Fehlschläge sind exakt die bereits dokumentierte, lokale `next dev`-Middleware-Eigenheit (`notFound()` liefert unter `next dev` 200 statt 404), nicht durch diese Änderung verursacht
- Gegen echten Produktions-Build verifiziert (`next build && next start`, Port 3099): der betroffene PROJ-30-404-Test läuft dort 16/16 grün (Chromium + Mobile Chrome) — bestätigt, dass es sich um die bekannte Dev-Only-Einschränkung handelt, keine echte Regression
- Responsive: E2E lief sowohl im Chromium-Projekt (1280px) als auch im Mobile-Chrome-Projekt (375px) grün — zweizeiliges Layout und Hervorhebung funktionieren auf beiden Breiten identisch; zusätzlich manuell bei 900px Browser-Breite per Screenshot bestätigt

### Bugs Found
Keine.

### Summary
- **Acceptance Criteria:** 6/6 vollständig bestanden
- **Bugs Found:** 0
- **Security:** Pass — keine neue Eingabeverarbeitung, kein neues XSS-Risiko, bestehende Endpunkt-Absicherung unverändert genutzt
- **Production Ready:** Ja
- **Recommendation:** Deploy freigegeben

## Deployment

- **Deployed:** 2026-08-04
- **Production URL:** https://app.mehralsabnehmen.de/mahlzeit/[id] und https://app.mehralsabnehmen.de/rezept/neu (neue Query-Parameter `mealId`/`variante`)
- **Commit:** `ec4d233`
- **Git Tag:** `v1.29.0-PROJ-32`
- **Pre-Deployment-Checks:** `npm run build` ✓, `npm run lint` ✓ (nur die vorbestehende, unveränderte Bild-Element-Warnung), QA Approved, keine Critical/High-Bugs, keine neuen Env-Variablen, keine Secrets im Diff, keine neue Migration nötig (bestehende RLS-Policy auf `bls_lebensmittel` reichte bereits aus)
- **Post-Deploy-Verifikation:** Neue Route `/api/rezepte/bls-search` live (401 bei unauthentifiziertem Zugriff, wie erwartet); `/rezept/neu` vom Nutzer im Browser als korrekt ladend bestätigt (kurzzeitige 404-Anzeige beim automatisierten Check war erneut eine sandbox-seitige Netzwerk-Inkonsistenz, kein echtes Deployment-Problem — gleiches Muster wie beim PROJ-31-Deploy)

### Deployment — Refinement 2026-08-05 (Zutaten-Zeilen-Layout & Nährwert-Hervorhebung)

- **Deployed:** 2026-08-05
- **Production URL:** https://app.mehralsabnehmen.de/rezept/neu (betrifft das geteilte Rezept-Formular, damit auch `/rezept/[id]/bearbeiten` sowie den Admin-Editor unter `/admin/rezepte/*`)
- **Commit:** `87f0ebc`
- **Git Tag:** `v1.30.0-PROJ-32-refinement`
- **Pre-Deployment-Checks:** `npm run build` ✓, `npm run lint` ✓ (nur die vorbestehende, unveränderte Bild-Element-Warnung), QA Approved (6/6 Acceptance Criteria, 0 Bugs), keine neuen Env-Variablen, keine Secrets im Diff, keine neue Migration nötig (rein clientseitige UI-Änderung)
- **Post-Deploy-Verifikation:** `https://app.mehralsabnehmen.de/` antwortet 200, `/rezept/neu` löst korrekt auf (`x-matched-path: /rezept/neu`). Visuelle Bestätigung des zweizeiligen Layouts + der amber Nährwert-Hervorhebung in Produktion steht noch aus — dafür ist ein echter eingeloggter Browser-Zugriff nötig, den die Sandbox nicht zuverlässig automatisieren kann (gleiche Einschränkung wie beim ursprünglichen PROJ-32-Deploy dokumentiert); der Nutzer wurde gebeten, dies selbst zu bestätigen.
