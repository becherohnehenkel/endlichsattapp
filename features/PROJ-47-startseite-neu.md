# PROJ-47: Startseite Neu

## Status: Deployed
**Created:** 2026-09-02
**Last Updated:** 2026-09-02

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

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Kein neuer API-Endpunkt, keine neue Tabelle — nur eine leichte Profil-Abfrage (`profiles.name`) für eingeloggte Nutzer | Deutlich schlanker als die bisherige Startseite mit parallelen Abfragen für Mahlzeiten, Rezepte und Zähler; alle anderen Inhalte sind fest im Code hinterlegt | 2026-09-02 |
| Ersetzt die bestehende `/`-Route direkt, statt eine neue Route anzulegen | Die Startseite bleibt weiterhin unter `/` erreichbar, kein Routing-Wechsel nötig | 2026-09-02 |
| Coach-Link als einfacher externer Link (`target="_blank"`, `rel="noopener"`) | Kein eigener Coaching-Flow oder Tracking in dieser Version geplant | 2026-09-02 |
| Video-Platzhalter ist rein visuell, kein `<video>`-Tag oder Player-Setup | Spart Komplexität, bis das echte Video existiert — wird beim späteren Refinement ergänzt | 2026-09-02 |

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

## Deployment
- **Production URL:** https://app.mehralsabnehmen.de/
- **Deployed:** 2026-09-02 (Vercel auto-deploy via Push zu `main`, commits `9f2372f`..`bc5c03c`)
- **Verified in Produktion:** Nutzer hat die Live-Seite geprüft, alles grün ("Alles auf Grün").
- **Umfang dieses Deploys:** vollständige PROJ-47-Implementierung — komplette Neugestaltung der Startseite (`/`): Begrüßung mit optionaler Vorname-Personalisierung, Video-Platzhalter, 4 Funktions-Karten (Wissen, Fortschritt, Rezepte, Check-In) und externes Coach-Banner. Ersetzt die bisherige personalisierte Startseite (letzte Analysen, Rezept-Vorschau, Teaser) komplett — identisch für Gast und eingeloggten Nutzer. Kein Backend, kein neuer API-Endpunkt.
