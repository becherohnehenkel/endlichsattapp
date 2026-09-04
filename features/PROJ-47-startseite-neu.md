# PROJ-47: Startseite Neu

## Status: Deployed (Refinement: Gast-Hinweis & PWA-Installation "Approved")
**Created:** 2026-09-02
**Last Updated:** 2026-09-04

**Refinement (2026-09-04, Gast-Hinweis & PWA-Installation):** Zwei neue, eigenständige Ergänzungen. (1) Sichtbare, nicht-alarmierende Infobox zwischen der "Ein Ziel für uns alle"-Sektion (PROJ-48) und "So legst du los": erklärt Gast-Nutzung (kostenlos, aber Einträge gehen beim Neuladen verloren) vs. Login (weiterhin kostenlos, Fortschritt bleibt erhalten) sowie eine kurze Datenschutz-Zusicherung. (2) Kleines, eigenständiges Icon neben der Begrüßung (kein Text-Button) — öffnet beim Klick ein Overlay mit Schritt-für-Schritt-Anleitung, wie man die App auf dem Homescreen installiert (iOS Safari + Android Chrome getrennt), schließbar per X oder "Verstanden"-Button. Vorab per Artifact-Mockup abgestimmt. Reine Frontend-Änderung, kein Backend-Bezug.

## Dependencies
- PROJ-2 (User Authentication) — für die optionale Namens-Personalisierung bei eingeloggten Nutzern
- PROJ-19 (Gast-Modus) — Startseite muss für Gäste ohne Einschränkung nutzbar sein
- Verlinkte Zielseiten bereits vorhanden (kein neuer Funktionsumfang dort nötig): PROJ-36 (Ernährung-Hub), PROJ-42 (Analyse-Übersichtsseite), PROJ-8 (Rezeptbibliothek), PROJ-45 (Wochen-Check-In)

## User Stories
- Als neuer Nutzer möchte ich beim ersten Besuch sofort verstehen, worum es in der App geht und wie ich starte, damit ich mich willkommen und orientiert fühle.
- Als wiederkehrender Nutzer möchte ich auf der Startseite schnell sehen, welche Kernfunktionen mir zur Verfügung stehen, damit ich direkt dorthin navigieren kann, wo ich hin will.
- Als eingeloggter Nutzer möchte ich persönlich mit meinem Namen begrüßt werden, damit sich die App vertrauter anfühlt.
- Als Gast möchte ich die Startseite genauso vollständig nutzen können wie ein eingeloggter Nutzer.
- Als Nutzer, der lieber persönliche Begleitung möchte, möchte ich einen klaren Hinweis auf das Coaching-Angebot sehen, damit ich diese Option nicht verpasse.

## Out of Scope
- Echtes eingebettetes Video — in dieser Version nur ein nicht-interaktiver Platzhalter mit Ankündigungstext; das eigentliche Video-Embedding folgt als späteres Refinement, sobald das Video existiert.
- Bisherige personalisierte Inhalte (letzte Analysen, Rezept-Vorschau-Grid, Sättigungsmatrix-/Art-of-Eating-Teaser) — komplett von der Startseite entfernt. Bleiben über ihre eigenen Tabs weiterhin erreichbar (`/analyse`, `/ernaehrung/rezepte`).
- Eigene Coaching-Buchungsstrecke innerhalb der App — reiner externer Link zu onlineernaehrungsberater.de, kein eigener Flow.
- A/B-Testing oder mehrere Varianten der Startseite.
- Profil-Name-Pflichtfeld oder Aufforderung, einen Namen einzutragen — bleibt weiterhin optional.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur
- [ ] Angenommen die Startseite lädt, wenn sie angezeigt wird, dann erscheinen in dieser Reihenfolge: Begrüßungs-Überschrift + Subline, Video-Platzhalter mit Ankündigungstext, vier Funktions-Karten unter der Zeile "So legst du los", Coach-Banner
- [ ] Angenommen die Begrüßung wird angezeigt, wenn der Nutzer eingeloggt ist und einen Namen im Profil hinterlegt hat, dann lautet die Überschrift "Schön, dass du da bist, [Vorname]."
- [ ] Angenommen die Begrüßung wird angezeigt, wenn der Nutzer ein Gast ist oder keinen Namen hinterlegt hat, dann lautet die Überschrift "Schön, dass du da bist." ohne Namen

### Video-Platzhalter
- [ ] Angenommen das Video ist noch nicht verfügbar, wenn der Platzhalter angezeigt wird, dann erscheint darunter der Hinweistext "Video kommt bald"
- [ ] Angenommen der Platzhalter wird angeklickt, wenn der Nutzer das tut, dann passiert nichts — er ist nicht interaktiv

### Funktions-Karten
- [ ] Angenommen die vier Karten werden angezeigt, wenn sie erscheinen, dann zeigen sie in dieser Reihenfolge: "Wissen wird zur Tat", "Fortschritt sichtbar machen", "Klau dir Rezepte", "Mach's dir messbar"
- [ ] Angenommen eine Karte wird angeklickt, wenn der Nutzer das tut, dann navigiert er zur jeweils hinterlegten Seite: "Wissen wird zur Tat" → `/ernaehrung`, "Fortschritt sichtbar machen" → `/analyse`, "Klau dir Rezepte" → `/ernaehrung/rezepte`, "Mach's dir messbar" → `/check-in`

### Coach-Banner
- [ ] Angenommen das Coach-Banner wird angezeigt, wenn der Nutzer darauf klickt, dann öffnet sich `https://www.onlineernaehrungsberater.de/#coachingstart` in einem neuen Tab

### Gast-Verhalten
- [ ] Angenommen ein Gast besucht die Startseite, wenn sie lädt, dann sieht er exakt denselben Inhalt und dieselbe Funktionalität wie ein eingeloggter Nutzer, mit Ausnahme der Namens-Personalisierung in der Begrüßung

### Gast/Login-Hinweis (Refinement 2026-09-04)
- [ ] Angenommen die Startseite lädt, wenn sie angezeigt wird, dann erscheint zwischen der "Ein Ziel für uns alle"-Sektion und "So legst du los" eine sichtbar farbig hinterlegte Infobox (grün/blau, nicht Warnfarbe) mit dem Hinweis zu Gast-Nutzung, Login-Vorteil und Datenschutz
- [ ] Angenommen der Hinweis wird angezeigt, dann gilt er unabhängig vom Login-Status identisch für Gäste und eingeloggte Nutzer (der Text erklärt beide Zustände gleichzeitig, keine bedingte Anzeige nötig)

### PWA-Installations-Hinweis (Refinement 2026-09-04)
- [ ] Angenommen die Startseite lädt, wenn sie angezeigt wird, dann erscheint neben der Begrüßung ein kleines, eigenständiges Icon (kein Text-Button) zum Installieren der App
- [ ] Angenommen der Nutzer klickt auf das Icon, wenn das Overlay öffnet, dann zeigt es getrennt eine Schritt-für-Schritt-Anleitung für iOS (Safari) und für Android (Chrome)
- [ ] Angenommen das Overlay ist geöffnet, wenn der Nutzer auf das X oder auf "Verstanden" klickt, dann schließt sich das Overlay

## Edge Cases
- Sehr langer Vorname: Begrüßungs-Überschrift muss umbrechen können, ohne das Layout zu sprengen.
- Name enthält Sonderzeichen/Emoji: wird unverändert angezeigt, keine serverseitige Bereinigung nötig (vertrauenswürdige, selbst gepflegte Profildaten, gleiche Behandlung wie an anderen Stellen der App, die den Namen anzeigen).
- Sehr kleine Bildschirme (< 360px): Karten und Video-Platzhalter müssen weiterhin ohne horizontales Scrollen funktionieren.
- Nutzer klickt mehrfach schnell auf das Coach-Banner: kann mehrere Tabs öffnen — Standard-Linkverhalten, bewusst kein Debounce nötig.
- Anonyme Gast-Session (`user.is_anonymous === true`): verhält sich identisch zum nicht eingeloggten Gast — keine Namens-Personalisierung.

## Technical Requirements (optional)
- Coach-Link öffnet in neuem Tab (`target="_blank"`, mit `rel="noopener"`)
- Bestehende mobile Kopfzeile (App-Name + Konto-Icon) und Bottom-Navigation bleiben unverändert bestehen — nur der Inhalt zwischen Kopfzeile und Bottom-Nav wird ersetzt

## Content: Finaler Wortlaut

**Eyebrow:** "Mehralsabnehmen"

**H1 (eingeloggt, Name vorhanden):** "Schön, dass du da bist, [Vorname]."
**H1 (Gast / kein Name hinterlegt):** "Schön, dass du da bist."

**Subline:** "Kurz erklärt: was dich erwartet, wie du loslegst."

**Video-Platzhalter-Label:** "So funktioniert die App"
**Video-Ankündigungstext:** "Video kommt bald"

**Sektions-Label:** "So legst du los"

**Karte 1 — Wissen wird zur Tat** (→ `/ernaehrung`)
"Lerne, worauf es beim Abnehmen ankommt und wie Mahlzeiten sättigend werden."

**Karte 2 — Fortschritt sichtbar machen** (→ `/analyse`)
"Verfolge deine Entwicklung — online und offline."

**Karte 3 — Klau dir Rezepte** (→ `/ernaehrung/rezepte`)
"Stöbere in der Bibliothek, probier was Neues."

**Karte 4 — Mach's dir messbar** (→ `/check-in`)
"Reflektiere ehrlich, wie deine Woche lief."

**Coach-Banner** (→ extern, neuer Tab)
"Lieber mit Coach an deiner Seite?"
"Persönliche Begleitung statt Alleingang."

**Gast/Login-Hinweis (Refinement 2026-09-04)**
"Du kannst diese App gratis nutzen, ohne dich einzuloggen. Deine Einträge werden dann aber nicht gespeichert und sind mit dem Neuladen der Seite weg. Meldest du dich an, bleibt es kostenlos — aber du kannst deinen Fortschritt wochenlang verfolgen und analysieren. Ich sehe deine Daten nicht, außer du gibst sie mir ausdrücklich frei. (Kommendes Feature für die Zukunft)"

**PWA-Installations-Hinweis (Refinement 2026-09-04)**
Icon-Button (kein Textlabel), `aria-label="Als App installieren"`. Overlay-Titel: "App installieren". Overlay-Beschreibung: "Installiere Mehralsabnehmen auf deinem Homescreen — schneller Zugriff, wie eine echte App."
- iPhone/iPad (Safari): "Tippe unten auf das Teilen-Symbol." / "Scrolle im Menü zu 'Zum Home-Bildschirm'." / "Tippe oben rechts auf 'Hinzufügen'."
- Android (Chrome): "Tippe oben rechts auf die drei Punkte." / "Wähle 'App installieren' (oder 'Zum Startbildschirm hinzufügen')." / "Bestätige mit 'Installieren'."
- Schließen-Button: "Verstanden"

## Open Questions
- [ ] Exaktes visuelles Feintuning (Icons, Spacing, Farbverläufe) — Mockup als Referenz vorhanden, wird bei `/frontend` final umgesetzt

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Komplett ersetzt bisherige personalisierte Startseite (letzte Analysen, Rezept-Vorschau, Teaser) für alle Nutzer | Nutzerwunsch: einheitlicher, einfacher Willkommens-Moment bei jedem Besuch; die entfernten Inhalte sind über eigene Tabs weiterhin erreichbar | 2026-09-02 |
| Video-Platzhalter ist nicht interaktiv, zeigt nur einen Ankündigungstext | Einfachste Umsetzung für einen temporären Zustand, kein falsches Erwartungsmanagement durch einen Klick ins Leere | 2026-09-02 |
| Begrüßung mit Vornamen für eingeloggte Nutzer mit hinterlegtem Namen, generischer Fallback sonst | Persönlicher Touch, ohne das Ausfüllen eines Profil-Namens zu erzwingen | 2026-09-02 |
| Coach-Link öffnet extern zu onlineernaehrungsberater.de in neuem Tab | Nutzervorgabe, kein eigener Coaching-Flow in der App geplant | 2026-09-02 |
| Karten-Ziele: Wissen→`/ernaehrung`, Fortschritt→`/analyse`, Rezepte→`/ernaehrung/rezepte`, Check-In→`/check-in` | Direkteste Verbindung zwischen dem Versprechen der Karte und der Seite, die es einlöst | 2026-09-02 |
| Copy so kurz wie möglich gehalten, alle Karten-Texte auf max. 2 Zeilen getrimmt | Nutzerwunsch aus dem Design-Brainstorming, Startseite soll überblickbar bleiben | 2026-09-02 |
| Gast/Login-Hinweis in Grün/Blau (`#DFF0F2`/`#0E7C86`) statt Gelb/Amber | Nutzerwunsch: "Gelb sieht so alarmierend aus" — der Hinweis ist informativ, keine Warnung; Farbe folgt der bereits etablierten Info-Box-Konvention (z.B. Fun-Fact-Boxen in PROJ-34) | 2026-09-04 |
| PWA-Hinweis bewusst nur als Icon ohne Textlabel neben der Begrüßung, öffnet Overlay statt eigener Seite | Nutzervorgabe: "Der Hinweis soll nur als Symbol auf der Startseite sichtbar sein" — hält die Begrüßung aufgeräumt, Anleitung ist trotzdem einen Klick entfernt | 2026-09-04 |
| Icon-Wahl: Smartphone mit kleinem Plus-Badge (statt z.B. Download-Icon) | Kommuniziert "Gerät + Hinzufügen" auf einen Blick, passt zum bestehenden Badge-Icon-Muster (kleines Icon + Corner-Badge) aus anderen Refinements dieser Session | 2026-09-04 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Kein neuer API-Endpunkt, keine neue Tabelle — nur eine leichte Profil-Abfrage (`profiles.name`) für eingeloggte Nutzer | Deutlich schlanker als die bisherige Startseite mit parallelen Abfragen für Mahlzeiten, Rezepte und Zähler; alle anderen Inhalte sind fest im Code hinterlegt | 2026-09-02 |
| Ersetzt die bestehende `/`-Route direkt, statt eine neue Route anzulegen | Die Startseite bleibt weiterhin unter `/` erreichbar, kein Routing-Wechsel nötig | 2026-09-02 |
| Coach-Link als einfacher externer Link (`target="_blank"`, `rel="noopener"`) | Kein eigener Coaching-Flow oder Tracking in dieser Version geplant | 2026-09-02 |
| Video-Platzhalter ist rein visuell, kein `<video>`-Tag oder Player-Setup | Spart Komplexität, bis das echte Video existiert — wird beim späteren Refinement ergänzt | 2026-09-02 |
| PWA-Overlay als bestehende shadcn `Dialog`-Komponente umgesetzt, kein eigenes Custom-Modal | `Dialog` bringt X-Close, Escape/Klick-außerhalb-Close und Fokus-Trap bereits eingebaut — spart Code und Accessibility-Arbeit | 2026-09-04 |
| Kein Gerätetyp-Erkennung — beide Anleitungen (iOS + Android) werden immer gleichzeitig gezeigt | Einfachste, robusteste Lösung; kein User-Agent-Sniffing nötig, Nutzer sieht ggf. einfach die für ihn irrelevante Anleitung mit | 2026-09-04 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Komponenten-Struktur (Visuell)

```
/ (Startseite, ersetzt den bestehenden Inhalt)
├── Mobile-Kopfzeile (unverändert: App-Name + Konto-Icon)
├── Begrüßungs-Bereich (Überschrift + Subline)
├── Video-Platzhalter (rein visuell, nicht interaktiv)
├── "So legst du los"-Sektion
│   └── 4 Funktions-Karten (Icon + Titel + Kurztext + Link)
├── Coach-Banner (externer Link, neuer Tab)
└── Bottom-Navigation (unverändert)
```

### B) Datenmodell (in Worten)

Kein neues Datenbank-Schema. Die Seite liest nur:
- Ist der Nutzer eingeloggt (Session)?
- Falls ja: Vorname aus dem bestehenden Profil (`profiles.name`), falls hinterlegt

Alle anderen Inhalte (Karten-Texte, Links, Coach-URL) sind fest im Code hinterlegt, kein Datenbankbezug.

### C) Tech-Entscheidungen (Begründung)

1. **Kein neuer API-Endpunkt, keine neue Tabelle** — nur eine einzelne, sehr leichte Profil-Abfrage statt der bisherigen Mehrfachabfrage.
2. **Ersetzt die bestehende `/`-Route direkt**, statt eine neue Route anzulegen.
3. **Coach-Link als einfacher externer Link**, kein eigenes Tracking in dieser Version.
4. **Video-Platzhalter ist rein visuell** — spart Komplexität, bis das echte Video existiert.

### D) Abhängigkeiten (Pakete)
Keine neuen Pakete nötig.

## Implementation Notes (Frontend)

**Gebaut:**
- `src/app/page.tsx` komplett ersetzt: bisherige Mehrfachabfrage (letzte Mahlzeiten, Rezepte, Zähler) entfernt, durch eine einzelne, leichte `profiles.name`-Abfrage für eingeloggte, nicht-anonyme Nutzer ersetzt.
  - Begrüßung zeigt `Schön, dass du da bist, [Vorname].` (nur der erste Namensteil aus `profiles.name`) bzw. den generischen Fallback ohne Namen für Gäste und Nutzer ohne hinterlegten Namen
  - Video-Platzhalter als reiner Gradient-Block mit Play-Icon und „So funktioniert die App"-Label, darunter „Video kommt bald" — nicht interaktiv (kein `<button>`/`onClick`, reines `<div>`)
  - 4 Funktions-Karten (Lucide-Icons `Lightbulb`/`TrendingUp`/`ChefHat`/`CheckCircle2` statt Emoji, passend zum bestehenden Icon-Stil der App) mit exaktem Wortlaut aus der Spec, verlinkt auf `/ernaehrung`, `/analyse`, `/ernaehrung/rezepte`, `/check-in`
  - Coach-Banner als externer Link (`target="_blank" rel="noopener noreferrer"`, bestehende App-Konvention für externe Links) zu `onlineernaehrungsberater.de`
- Reine Server-Component, kein `'use client'` nötig — nichts auf der Seite ist interaktiv (nur Links/externer Link)

**Verifiziert:** `npm run build`, `npm run lint`, `npm test` (443/443, unverändert — keine bestehenden Tests hingen an der alten Startseite). Per Playwright verifiziert: alle 4 Karten-Links und der Coach-Link (inkl. `target="_blank"`) korrekt gesetzt, Video-Platzhalter nicht interaktiv, Mobile (375px) kein horizontales Scrollen. Personalisierte Begrüßung live gegen das bestehende QA-Testkonto verifiziert (`profiles.name` auf "Lukas Testerson" gesetzt, bleibt als Fixture für künftige QA-Läufe bestehen) — zeigt korrekt "Schön, dass du da bist, Lukas.". Bottom-Navigation fehlt für einen Nutzer ganz ohne jede Session (nicht mal anonym) — bestätigt als vorbestehendes, unverändertes Verhalten aus `navigation-shell.tsx` (siehe PROJ-35), kein PROJ-47-Bug.

### Implementation Notes (Frontend) — Refinement 2026-09-04, Gast-Hinweis & PWA-Installation

**Gebaut:**
- `src/app/page.tsx`: neue Infobox zwischen der "Ein Ziel für uns alle"-Sektion (PROJ-48) und "So legst du los" — `#DFF0F2`-Hintergrund mit `Info`-Icon in weißer Kachel, Text exakt aus der Spec (siehe Content-Sektion). Begrüßungs-Sektion zu `flex items-start justify-between` umgebaut, `<PwaInstallHinweis />` als Geschwister-Element neben dem Begrüßungstext eingefügt.
- `src/components/pwa-install-hinweis.tsx` (neu, Client Component): Icon-Button (`Smartphone` + kleiner `#2E9E6B`-Kreis mit `Plus`-Badge, `position:absolute -bottom-1 -right-1`, analog zum etablierten Icon+Corner-Badge-Muster) öffnet eine bestehende shadcn `Dialog`-Komponente. Overlay zeigt iOS- und Android-Anleitung als zwei nummerierte Listen, schließbar über die eingebaute `DialogPrimitive.Close`-X (kein Zusatzaufwand nötig) sowie einen `DialogClose asChild`-`Verstanden`-Button im Footer.
- Beide Ergänzungen sind reine Frontend-Änderungen ohne Backend-Bezug, kein neuer State über `useState` hinaus (Dialog-Open-State wird intern von Radix verwaltet).

**Verifiziert:** `tsc --noEmit` (clean), gezieltes `eslint` auf beide geänderten/neuen Dateien (clean), `npm run build` (clean), `npm test` (464/464 — 21 neue Tests gegenüber dem vorherigen Stand, alle aus anderen Refinements dieser Session, keine Regression). `tests/PROJ-47-startseite-neu.spec.ts`: 20/20 auf Chromium, 5/5 der neuen Tests zusätzlich auf Mobile Chrome. `tests/PROJ-48-startseite-ultimatives-ziel.spec.ts`: 8/8 (bestätigt keine Störung der direkt benachbarten PROJ-48-Sektion durch die neue Infobox). Visuell gegen das zuvor abgestimmte Artifact-Mockup verglichen (Farben, Icon-Platzierung, Overlay-Layout) — Übereinstimmung bestätigt.

## QA Test Results

**Tested:** 2026-09-02
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Seitenstruktur
- [x] Reihenfolge: Begrüßung → Video-Platzhalter → "So legst du los" → 4 Karten → Coach-Banner
- [x] Eingeloggter Nutzer mit hinterlegtem Namen sieht "Schön, dass du da bist, [Vorname]."
- [x] Gast bzw. Nutzer ohne hinterlegten Namen sieht die generische Begrüßung ohne Namen

#### Video-Platzhalter
- [x] Zeigt den Ankündigungstext "Video kommt bald"
- [x] Nicht interaktiv — kein `<a>`/`<button>` im Elternpfad, Klick löst keine Navigation aus

#### Funktions-Karten
- [x] Alle 4 Karten erscheinen in der vorgegebenen Reihenfolge mit den korrekten `href`-Zielen
- [x] Klick auf eine Karte navigiert tatsächlich zur Zielseite (end-to-end mit "Wissen wird zur Tat" → `/ernaehrung` geprüft)

#### Coach-Banner
- [x] Verlinkt korrekt auf `onlineernaehrungsberater.de/#coachingstart`, öffnet echt in einem neuen Tab (`target="_blank"`, `rel="noopener noreferrer"`)

#### Gast-Verhalten
- [x] Gast sieht exakt denselben Inhalt und dieselbe Funktionalität wie ein eingeloggter Nutzer, bis auf die Namens-Personalisierung

### Edge Cases Status
- [x] Sehr langer Vorname: bricht um, kein horizontales Scrollen (getestet mit "Maximilian-Alexander-Konstantin")
- [x] Name mit Sonderzeichen/Emoji inkl. `<script>`-Payload: wird ausschließlich als Text gerendert, kein XSS ausgeführt
- [x] Sehr kleine Bildschirme (375px): kein horizontales Scrollen
- [x] Anonyme Gast-Session (`user.is_anonymous === true`, ausgelöst über `/analyse/start`): verhält sich identisch zu einem Gast ohne jede Session
- [x] Mehrfache schnelle Klicks auf das Coach-Banner: durch Design nicht getestet — Standard-Browser-Linkverhalten, bewusst kein Debounce laut Spec, kein app-spezifisches Verhalten zu prüfen

### Security Audit Results
- [x] Kein `dangerouslySetInnerHTML`/`innerHTML` im neuen Code — Name wird ausschließlich als React-Text gerendert (XSS-Payload-Test bestätigt: kein Skript ausgeführt)
- [x] Keine client-seitige Profil-Abfrage im Netzwerk-Traffic — der Name wird ausschließlich server-seitig gerendert, keine separate `/rest/v1/profiles`-Anfrage vom Client aus sichtbar
- [x] Kein Auth-Bypass relevant — Seite ist für Gäste und eingeloggte Nutzer bewusst identisch zugänglich, keine privilegierte Aktion vorhanden
- [x] Keine sensiblen Daten exponiert — es wird ausschließlich `profiles.name` gelesen, kein anderes Profilfeld
- [x] Rate Limiting: nicht anwendbar (keine neuen Server-Requests, nur eine bestehende, leichte Profil-Abfrage)

### Regression Testing
- [x] Vitest-Gesamtsuite: 443/443 grün, unverändert
- [x] PROJ-19 (Gast-Modus): 3 Testgruppen (Rezept-Vorschau, Upsell-Hint, Art-of-Eating-Teaser auf der Startseite) testeten Inhalte, die durch PROJ-47 bewusst von der Startseite entfernt wurden — entfernt und durch Kommentare mit Verweis auf PROJ-47 dokumentiert, restliche 40 Tests unverändert grün (68/68 nach Bereinigung)
- [x] PROJ-22 (App-Performance): 2 Tests prüften die alte Hero-Überschrift — auf die neue Begrüßung umgestellt, gleiche Kernaussage ("Seite lädt fehlerfrei") bleibt erhalten
- [x] PROJ-42 (Analyse-Übersichtsseite): 1 Test prüfte die alte Hero-Überschrift — auf die neue Begrüßung umgestellt, ursprüngliche Kernaussage (kein "Mahlzeit analysieren"-Button mehr) bleibt geprüft
- [x] PROJ-35 (Bottom-Navigation): einziger verbleibender Fehlschlag ist der bereits bei der PROJ-45-QA dokumentierte, vorbestehende `/ernaehrung`-Test (unabhängig von PROJ-47, in separatem Branch bereits behoben)

**1 vorbestehender, nicht mit PROJ-47 zusammenhängender Befund entdeckt:**
- `tests/PROJ-14-konto-widerruf.spec.ts`: Test "unauthenticated → Redirect zu /login" schlägt fehl — `/konto` leitet ohne Session nicht mehr zu `/login` weiter. Reproduziert auch mit vollständig gestashten PROJ-47-Änderungen auf `main` (identischer Fehlschlag ohne jeden Code dieses Features). Als separaten Task ausgelagert.

### Bugs Found

Keine Bugs im PROJ-47-Scope gefunden. Zwei Test-Timing-Probleme in den eigenen neuen Tests gefunden und behoben (verfrühtes `innerText()`-Lesen vor vollständigem Rendern; `innerText()` spiegelt CSS-`uppercase`-Transformation wider, wodurch ein Case-sensitiver String-Vergleich fälschlich fehlschlug) — beides reine Test-Bugs, kein Produktcode betroffen.

### E2E-Testsuite

Neu: `tests/PROJ-47-startseite-neu.spec.ts` — 15 Tests, decken alle 9 Acceptance Criteria und 4 der 5 Edge Cases automatisiert ab. Struktur-/Karten-/Video-/Coach-Tests laufen ohne Login; die Namens-Personalisierung nutzt das bestehende QA-Testkonto (jetzt mit hinterlegtem Namen als dauerhafte Fixture) sowie einen temporären, nach dem Lauf wieder gelöschten Testnutzer für den "kein Name"-Fall und die Edge Cases. Grün auf Chromium und Mobile Chrome (375px).

### Summary
- **Acceptance Criteria:** 9/9 passed
- **Edge Cases:** 4/5 automatisiert getestet, 1/5 durch Design nicht anwendbar
- **Bugs Found:** 0 (0 critical, 0 high, 0 medium, 0 low) im PROJ-47-Scope; 1 vorbestehender, unabhängiger Befund in einem anderen Feature dokumentiert und ausgelagert
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** Deploy

### QA Test Results (Refinement 2026-09-04): Gast-Hinweis & PWA-Installation

**Tested:** 2026-09-04
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

#### Acceptance Criteria Status

##### Gast/Login-Hinweis
- [x] Infobox erscheint zwischen "Ein Ziel für uns alle" (PROJ-48) und "So legst du los" — per Bounding-Box-Reihenfolge geprüft
- [x] Farblich hinterlegt in Grün/Blau (`bg-[#DFF0F2]`, Text `#0E7C86`), nicht Gelb/Amber — per `getComputedStyle`, nicht nur Klassenname
- [x] Text identisch für Gast und eingeloggten Nutzer (keine bedingte Anzeige) — beide Zustände getestet, exakt gleicher Inhalt

##### PWA-Installations-Hinweis
- [x] Icon-Button (kein Textlabel) neben der Begrüßung sichtbar, `aria-label="Als App installieren"`
- [x] Klick öffnet Overlay mit getrennter iOS- (Safari) und Android-Anleitung (Chrome), je 3 Schritten
- [x] Schließt per X-Button — Radix `DialogPrimitive.Close`, keine Zusatzimplementierung nötig
- [x] Schließt per "Verstanden"-Button
- [x] Zusätzlich verifiziert (über die ACs hinaus): schließt auch per `Escape`-Taste; Icon ist per Tab erreichbar und öffnet das Overlay per `Enter` (Tastatur-Zugänglichkeit)

#### Security Audit
Pass (trivial) — beide Ergänzungen sind vollständig statischer Text ohne Nutzer- oder Server-Dateninterpolation, kein `dangerouslySetInnerHTML`, keine neue API-Route, kein neuer Auth-Pfad. Beide Elemente sind für Gast und eingeloggten Nutzer identisch sichtbar (kein Auth-Bypass relevant, keine privilegierte Aktion).

#### Regressionstest
- **Vitest (Gesamtsuite):** 464/464 grün (44 Testdateien), unverändert.
- **E2E — `tests/PROJ-47-startseite-neu.spec.ts` (eigene Suite):** von 15 auf 20 Tests erweitert (2 neue Describe-Blöcke: "Gast/Login-Hinweis" mit 2 Tests, "PWA-Installations-Hinweis" mit 3 Tests). 20/20 grün auf Chromium (isolierter Lauf, `workers=1`); ein einzelner Fehlschlag bei `workers=2` reproduzierte sich bei isoliertem Re-Run nicht — per `git stash`-Vergleichsmuster als Ressourcen-Konkurrenz zwischen parallelen Workern eingestuft, keine echte Regression. 5/5 der neuen Tests zusätzlich grün auf Mobile Chrome (375px).
- **E2E — `tests/PROJ-48-startseite-ultimatives-ziel.spec.ts` (direkt benachbarte Sektion):** 8/8 grün — keine Störung durch die neue Infobox zwischen den beiden Sektionen.
- Visuell gegen das abgestimmte Artifact-Mockup verglichen (Desktop-Screenshot, Mobile-375px-Screenshot, geöffnetes Overlay) — Farben, Icon-Platzierung und Overlay-Layout stimmen überein.
- `npm run build` und gezieltes `eslint` auf beide geänderten/neuen Dateien fehlerfrei.

#### Bugs Found
Keine.

#### Summary
- **Acceptance Criteria:** 5/5 passed (Gast/Login-Hinweis: 2/2, PWA-Installations-Hinweis: 3/3)
- **Bugs Found:** 0
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** Deploy. Reine Frontend-Änderung, keine DB-Migration, kein zusätzlicher Backend-Schritt nötig.

## Deployment
- **Production URL:** https://app.mehralsabnehmen.de/
- **Deployed:** 2026-09-02 (Vercel auto-deploy via Push zu `main`, commits `9f2372f`..`bc5c03c`)
- **Verified in Produktion:** Nutzer hat die Live-Seite geprüft, alles grün ("Alles auf Grün").
- **Umfang dieses Deploys:** vollständige PROJ-47-Implementierung — komplette Neugestaltung der Startseite (`/`): Begrüßung mit optionaler Vorname-Personalisierung, Video-Platzhalter, 4 Funktions-Karten (Wissen, Fortschritt, Rezepte, Check-In) und externes Coach-Banner. Ersetzt die bisherige personalisierte Startseite (letzte Analysen, Rezept-Vorschau, Teaser) komplett — identisch für Gast und eingeloggten Nutzer. Kein Backend, kein neuer API-Endpunkt.
