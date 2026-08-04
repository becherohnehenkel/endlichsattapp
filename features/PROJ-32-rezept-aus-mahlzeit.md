# PROJ-32: Rezept aus gescannter Mahlzeit anlegen ("wie gescannt" / "mit mehr Sättigung")

## Status: Architected
**Created:** 2026-08-04
**Last Updated:** 2026-08-04

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

## Edge Cases
- Mahlzeit ohne Freitext (reine Foto-Analyse ohne Beschreibung) → Titel fällt auf einen Datums-Platzhalter zurück (z.B. "Mahlzeit vom 04.08.")
- Zutat mit KI-geschätzten Nährwerten (`zutatenQuelle` = "schaetzung"/"nicht_schaetzbar") → wird trotzdem als normale Zutaten-Zeile übernommen; die eigentliche Nährwert-Zuordnung läuft wie bei jeder manuell eingegebenen Zutat erneut über die bestehende BLS/OFF-Suche, keine Übernahme der ursprünglichen Mahlzeit-Nährwerte
- Mahlzeit gehört einem anderen Nutzer (URL-Manipulation) → bereits durch die bestehende Eigentümer-Prüfung auf `/mahlzeit/[id]` abgedeckt; PROJ-32 kann nie von einer fremden Mahlzeit aus gestartet werden
- Zwei sehr ähnliche Verbesserungsvorschläge (z.B. beide zielen auf mehr Protein) → beide werden als separate Zeilen übernommen, keine automatische Zusammenführung
- Nutzer ändert nach dem Öffnen des vorausgefüllten Formulars alle Werte komplett → es wird ausschließlich das tatsächlich abgeschickte Formular gespeichert, keine versteckte Mahlzeit-Referenz oder Verknüpfung zur Ursprungs-Mahlzeit

## Technical Requirements (optional)
- Kein neues Datenbank-Feld, keine neue Migration — reine Wiederverwendung des PROJ-31-Datenmodells (`recipes.owner_id`, `POST /api/rezepte`)
- Wiederverwendung von `RezeptFormular` (`variant="user"`) und dem bestehenden Anlegen-Endpunkt aus PROJ-31 — die genaue technische Übergabe der Vorbefüllung an die Formular-Seite legt `/architecture` fest

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

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Mahlzeit-Referenz (welche Mahlzeit, welche Variante) wird über die Seiten-Adresse von der Mahlzeit-Ansicht zur "Rezept anlegen"-Seite übergeben | Einfachster Weg, Kontext über einen Seitenwechsel zu transportieren, ohne neuen Server-Zustand; "Rezept anlegen" bleibt weiterhin ganz normal ohne Mahlzeit-Bezug aufrufbar | 2026-08-04 |
| Umwandlung "Mahlzeit-Daten → Rezept-Entwurf" passiert einmalig beim Laden der Seite, wird nirgends zwischengespeichert oder mit der Mahlzeit verknüpft | Stellt sicher, dass sich das Formular ab dem ersten Anzeigen exakt wie ein manuell gestartetes Rezept verhält — inkl. spurlosem Verwerfen (AC "keine versteckte Mahlzeit-Referenz") | 2026-08-04 |
| Wiederverwendung von Rezept-Formular und Speicher-Endpunkt aus PROJ-31 unverändert, nur mit anderen Startwerten | Kein zweiter Anlege-Weg mit doppeltem Pflegeaufwand und doppelter Sicherheits-/Limit-Prüfung | 2026-08-04 |
| Rezept-Formular bekommt eine zusätzliche Startmöglichkeit: Bild direkt im Zuschneide-Schritt vorschlagen, statt nur "fertiges Bild" oder "leerer Upload" zu kennen | Vermeidet unnötigen erneuten Upload eines bereits vorhandenen Mahlzeit-Fotos | 2026-08-04 |

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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
