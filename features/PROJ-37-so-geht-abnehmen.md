# PROJ-37: So geht abnehmen (inkl. Kcal-Rechner)

## Status: In Progress
**Created:** 2026-08-31
**Last Updated:** 2026-08-31

## Dependencies
- Requires: PROJ-36 (Ernährung-Hub) — Zielseite `/ernaehrung/so-geht-abnehmen` existiert bereits als Platzhalter, wird hier mit echtem Inhalt befüllt
- Requires: PROJ-2 (User Authentication) — Unterscheidung eingeloggt/Gast für Speicherverhalten
- Requires: PROJ-19 (Gast-Modus) — Gäste dürfen den Rechner ohne Account nutzen
- Requires: PROJ-35 (Bottom-Navigation) — `/training` existiert bereits als Platzhalter-Route, Ziel des Krafttraining-Links

## User Stories
- Als eingeloggter Nutzer möchte ich meinen Kalorienbedarf berechnen und meine Eingaben gespeichert bekommen, damit ich sie beim nächsten Besuch nicht erneut eintippen muss.
- Als Gast möchte ich den Kalorienbedarf trotzdem berechnen können, ohne einen Account zu brauchen.
- Als Nutzer möchte ich zwischen drei Zielen (Fett verlieren, Gewicht halten, Muskeln aufbauen) wählen, damit ich direkt eine für mein Ziel passende Kalorienzahl sehe.
- Als eingeloggter Nutzer, dessen aktuelles Gewicht deutlich von meinem letzten gespeicherten Wert abweicht, möchte ich einen Hinweis bekommen, damit ich weiß, dass ich neu berechnen sollte.
- Als Nutzer möchte ich bei ungültigen Eingaben (z. B. Alter außerhalb des sinnvollen Bereichs) eine klare Fehlermeldung sehen, statt ein falsches Ergebnis zu bekommen.

## Out of Scope
- Tägliches Tracking/Fortschrittsanzeige gegen das berechnete Kalorienziel — explizites Non-Goal laut `docs/PRD.md` ("Kein Kalorienzählen oder Tracking von Tageskalorienzielen"), wird hier nicht gebaut
- Dritte Geschlechts-Option für die Formel — bewusst auf zwei Varianten beschränkt (siehe Product Decisions)
- Automatische zeitbasierte Erinnerung (z. B. "nach 30 Tagen neu berechnen") — nur die 5kg-Abweichungsprüfung beim Bearbeiten des Gewichtsfelds
- Eigener Trainingsplan-Inhalt hinter dem Krafttraining-Arbeitspunkt — der Verweis zeigt nur zum `/training`-Bereich (Platzhalter aus PROJ-35, eigener Inhalt folgt in einer späteren, noch nicht angelegten Spec), Trainingsinhalte selbst sind nicht Teil dieser Spec
- Schlaf-Tracking (Dauer/Qualität erfassen) — dieser Arbeitspunkt ist reine Aufklärung/Anleitung, kein Tracking-Tool

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Eingabe & Validierung
- [ ] Angenommen ein Nutzer öffnet den Kcal-Rechner, dann sieht er Eingabefelder für Gewicht (kg), Größe (cm), Alter (Jahre), Geschlecht (Männlich/Weiblich) und Aktivitätslevel (5 PAL-Stufen), sowie eine Ziel-Auswahl (Fett verlieren / Gewicht halten / Muskeln aufbauen).
- [ ] Angenommen ein Nutzer trägt ein Gewicht außerhalb von 30–300 kg ein, dann erscheint eine Inline-Fehlermeldung am Feld und der "Berechnen"-Button bleibt deaktiviert.
- [ ] Angenommen ein Nutzer trägt eine Größe außerhalb von 120–250 cm ein, dann erscheint eine Inline-Fehlermeldung am Feld und der "Berechnen"-Button bleibt deaktiviert.
- [ ] Angenommen ein Nutzer trägt ein Alter außerhalb von 14–100 Jahren ein, dann erscheint eine Inline-Fehlermeldung am Feld und der "Berechnen"-Button bleibt deaktiviert.
- [ ] Angenommen alle Felder sind gültig ausgefüllt, dann ist der "Berechnen"-Button aktiv.

### Berechnung
- [ ] Angenommen ein Nutzer klickt auf "Berechnen", dann wird der Grundumsatz per Mifflin-St-Jeor-Formel berechnet (Männer: 10×Gewicht + 6,25×Größe − 5×Alter + 5; Frauen: 10×Gewicht + 6,25×Größe − 5×Alter − 161) und mit dem gewählten PAL-Faktor multipliziert, um den Erhaltungsbedarf ("Gewicht halten") zu ermitteln.
- [ ] Angenommen das Ziel "Fett verlieren" ist gewählt, dann zeigt das Ergebnis 90 % des Erhaltungsbedarfs.
- [ ] Angenommen das Ziel "Gewicht halten" ist gewählt, dann zeigt das Ergebnis exakt den Erhaltungsbedarf (100 %).
- [ ] Angenommen das Ziel "Muskeln aufbauen" ist gewählt, dann zeigt das Ergebnis 110 % des Erhaltungsbedarfs.
- [ ] Angenommen ein Ergebnis wird angezeigt, dann ist die kcal-Zahl auf ganze Zahlen gerundet.

### Speichern (eingeloggte Nutzer)
- [ ] Angenommen ein eingeloggter Nutzer klickt auf "Berechnen", dann werden Gewicht, Größe, Alter, Geschlecht, Aktivitätslevel und Ziel automatisch gespeichert (kein separater Speichern-Schritt).
- [ ] Angenommen ein eingeloggter Nutzer mit gespeicherten Werten öffnet die Seite erneut, dann sind alle Felder mit den zuletzt gespeicherten Werten vorausgefüllt und das zuletzt berechnete Ergebnis wird sofort angezeigt (ohne erneuten Klick).
- [ ] Angenommen ein eingeloggter Nutzer ändert das Gewichtsfeld auf einen Wert, der um mindestens 5 kg vom zuletzt gespeicherten Gewicht abweicht, dann erscheint ein Hinweis, dass er neu berechnen sollte, damit die Werte übereinstimmen.
- [ ] Angenommen das Speichern schlägt fehl (z. B. Netzwerkfehler), dann wird das berechnete Ergebnis trotzdem angezeigt, zusätzlich erscheint ein Hinweis, dass das Speichern fehlgeschlagen ist.

### Gäste
- [ ] Angenommen ein Gast (keine Session oder anonym) öffnet den Kcal-Rechner, dann sind alle Felder leer, keine Werte werden vorausgefüllt.
- [ ] Angenommen ein Gast berechnet ein Ergebnis, dann wird nichts gespeichert — beim nächsten Besuch sind die Felder wieder leer.

### Seiten-Struktur "So geht abnehmen"
- [ ] Angenommen ein Nutzer öffnet `/ernaehrung/so-geht-abnehmen`, dann sieht er 5 Arbeitspunkte in dieser Reihenfolge, alle mit echtem Inhalt (keine Platzhalter mehr): 1. Kcal-Rechner, 2. Wöchentlich vs. Täglich, 3. Warum auf Proteine achten, 4. Krafttraining, 5. Schlaf/Erholung.
- [ ] Angenommen die Seite wird angezeigt, dann bleibt der bestehende Breadcrumb-Header ("Ernährung / So geht abnehmen") aus PROJ-36 erhalten.
- [ ] Angenommen die Seite wird angezeigt, dann folgen alle 5 Arbeitspunkte demselben Karten-/Fortschritts-Muster wie der bestehende "Wie esse ich richtig?"-Guide (nummeriert, "Verstanden"-Button, Fortschrittsbalken, lokal gespeicherter Fortschritt).

### Arbeitspunkt 2: Wöchentlich vs. Täglich
- [ ] Angenommen ein Nutzer öffnet diesen Arbeitspunkt, dann sieht er den Erklärtext: "Dein Körper rechnet nicht in Tagen, sondern in Wochen. Ein Tag über deinem Ziel bedeutet nicht, dass du 'versagt' hast — er wird einfach von den anderen sechs Tagen ausgeglichen. Schau auf den Wochendurchschnitt, nicht auf jeden einzelnen Tag."
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann zeigt er zwei CSS-gestylte Balken-Schaubilder mit je 7 Balken (repräsentativ für die 7 Wochentage):
  - Schaubild 1 "Wie ein starrer Plan aussieht": 7 gleich hohe Balken. Caption: "Jeden Tag exakt gleich."
  - Schaubild 2 "Wie es wirklich aussieht": 5 ungefähr gleich niedrige Balken, 1 etwas höherer, 1 etwas niedrigerer Balken. Caption: "Mal mehr, mal weniger — im Schnitt im Ziel."
- [ ] Angenommen die Schaubilder werden angezeigt, dann nutzen sie die bestehende App-Farbpalette (Primärgrün für reguläre Tage, warmer Akzent-Ton für den höheren Tag) — keine neuen Bild-Assets, reines CSS/HTML.

### Arbeitspunkt 3: Warum auf Proteine achten
- [ ] Angenommen ein Nutzer öffnet diesen Arbeitspunkt, dann sieht er den Erklärtext: "Protein hält dich länger satt als Kohlenhydrate oder Fett — und schützt beim Abnehmen deine Muskeln. Ohne genug Protein verlierst du beim Abnehmen nicht nur Fett, sondern auch Muskelmasse."
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann zeigt er den hervorgehobenen Richtwert "Mindestens 30g Protein pro Mahlzeit" in einer Info-Box (Stil konsistent mit bestehenden Info-Boxen, z. B. auf der Sättigungsmatrix-Seite).
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann listet er 3 Lebensmittel-Kategorien: Tierisch (mageres Fleisch, Fisch), Vegetarisch (magerer Käse, Milchprodukte), Vegan (Tofu, Erbsen, Linsen, Bohnen, Sojagranulat — mit Hinweis, dass diese zusätzlich Kohlenhydrate & Ballaststoffe enthalten).
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann enthält er kein Schaubild (reiner Text/Listen-Inhalt).

### Arbeitspunkt 4: Krafttraining
- [ ] Angenommen ein Nutzer öffnet diesen Arbeitspunkt, dann sieht er 4 nummerierte Gründe: (1) Muskeln erhalten im Kaloriendefizit, (2) Grundumsatz-Effekt, (3) Gesundes Altern (inkl. Kniebeuge-Analogie), (4) Körper formen.
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann zeigt er am Ende einen einzelnen, dezenten Text-Link "Trainingspläne findest du im Training-Bereich →", der zu `/training` führt — kein Button, keine weitere Erklärung, um nicht vom Ernährungs-Fokus abzulenken.

### Arbeitspunkt 5: Schlaf / Erholung
- [ ] Angenommen ein Nutzer öffnet diesen Arbeitspunkt, dann sieht er den Erklärtext zu Sättigungshormonen (Ghrelin/Leptin) und zur allgemeinen Erholungsfunktion von Schlaf (siehe Abschnitt "Content: Arbeitspunkte 2–5" für den finalen Wortlaut).
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann listet er 4 nummerierte Tipps für erholsamen Schlaf: (1) 3-2-1-Regel, (2) kühle Umgebung, (3) Dunkelheit, (4) Umgang mit kreisenden Gedanken (Atemübung, Zählen, Gedanken aufschreiben).
- [ ] Angenommen der Arbeitspunkt wird angezeigt, dann enthält er kein Schaubild (reiner Text/Listen-Inhalt).

## Edge Cases
- Gast berechnet mehrfach hintereinander mit unterschiedlichen Werten → jedes Mal ein frisches, unabhängiges Ergebnis, nichts wird gespeichert oder überschrieben.
- Eingeloggter Nutzer berechnet zum ersten Mal (keine vorher gespeicherten Werte) → Formular startet leer, kein 5kg-Hinweis möglich (kein Vergleichswert vorhanden).
- Nutzer wechselt nur das Ziel (z. B. Fett verlieren → Muskeln aufbauen), ohne Gewicht/Größe/Alter zu ändern → sofortige Neuberechnung, keine 5kg-Warnung (nur eine Gewichtsänderung löst die Warnung aus).
- Sehr extreme, aber technisch valide Eingaben (z. B. 300 kg + 120 cm) → Formel liefert trotzdem ein Ergebnis, keine zusätzliche Plausibilitätsprüfung über die harten Grenzen hinaus (bewusst einfach gehalten).

## Technical Requirements (optional)
- Security: Gespeicherte Biometrie-Daten sind personenbezogen — Zugriff ausschließlich auf die eigenen Daten des eingeloggten Nutzers (RLS), Details in `/architecture`/`/backend`.

## Content: Arbeitspunkte 2–5 (finaler Wortlaut)

### 2. Wöchentlich vs. Täglich
> Dein Körper rechnet nicht in Tagen, sondern in Wochen. Ein Tag über deinem Ziel bedeutet nicht, dass du "versagt" hast — er wird einfach von den anderen sechs Tagen ausgeglichen. Schau auf den Wochendurchschnitt, nicht auf jeden einzelnen Tag.

**Schaubild 1 — "Wie ein starrer Plan aussieht":** 7 gleich hohe Balken. Caption: *"Jeden Tag exakt gleich."*
**Schaubild 2 — "Wie es wirklich aussieht":** 5 ungefähr gleich niedrige Balken, 1 etwas höherer, 1 etwas niedrigerer Balken. Caption: *"Mal mehr, mal weniger — im Schnitt im Ziel."*

### 3. Warum auf Proteine achten
> Protein hält dich länger satt als Kohlenhydrate oder Fett — und schützt beim Abnehmen deine Muskeln. Ohne genug Protein verlierst du beim Abnehmen nicht nur Fett, sondern auch Muskelmasse.
>
> **Richtwert: mindestens 30g Protein pro Mahlzeit.**
>
> Woher bekommst du es?
> - 🥩 **Tierisch:** mageres Fleisch, Fisch
> - 🧀 **Vegetarisch:** magerer Käse, Milchprodukte
> - 🌱 **Vegan:** Tofu, Erbsen, Linsen, Bohnen, Sojagranulat *(enthalten zusätzlich Kohlenhydrate & Ballaststoffe)*

### 4. Krafttraining
> Warum Krafttraining beim Abnehmen hilft:
>
> **1. Muskeln erhalten** — Im Kaloriendefizit denkt dein Körper sonst: "Das brauche ich nicht, kostet nur Energie." Krafttraining signalisiert ihm: Diese Muskulatur wird gebraucht — die bleibt.
>
> **2. Grundumsatz** — Mehr Muskelmasse erhöht deinen Grundumsatz (nicht überbewerten, aber ein netter Nebeneffekt).
>
> **3. Gesund altern** — Jede Bewegung bleibt mit steigendem Alter leichter. Eine halbe Kniebeuge ist ein Toilettengang, den du mit 80 noch selbstständig schaffen willst.
>
> **4. Körper formen** — Kleidung sitzt leichter, du fühlst dich wohler in deiner Haut.

Am Ende: dezenter Text-Link *"Trainingspläne findest du im Training-Bereich →"* → `/training`.

### 5. Schlaf / Erholung
> Ein übermüdeter Körper hat mehr Hunger — Schlafmangel bringt deine Sättigungshormone durcheinander (mehr Ghrelin, weniger Leptin). Das Ergebnis: mehr Appetit, und unbewusst greifst du eher zu schnellen Kalorien wie Süßigkeiten und Snacks statt zu einer sättigenden Mahlzeit.
>
> Genauso wichtig: Schlaf ist die Zeit, in der dein Körper insgesamt zur Ruhe kommt — das System fährt herunter und erholt sich. Nur so kannst du jeden Tag die Leistung abrufen, die du abrufen möchtest.
>
> **So gestaltest du erholsamen Schlaf:**
>
> **1. 3-2-1-Regel** — 3h vorher nichts Schweres mehr essen, 2h vorher keine Arbeit/Aufregung/laute Musik mehr, 1h vorher keine Bildschirme mehr (blaues Licht vermeiden).
>
> **2. Kühle Umgebung** — hilft deinem Körper, besser zu entspannen.
>
> **3. Dunkelheit** — Rollladen, blickdichter Vorhang oder Schlafmaske.
>
> **4. Kreisende Gedanken?** — Langsam ein-, noch langsamer ausatmen, bis du einschläfst. Oder von 21 aufwärts endlos weiterzählen. Im Notfall: Gedanken mit Stift und Papier festhalten statt im Kopf zu wälzen.

## Open Questions
- [x] Exakte Copy/Reihenfolge der 4 übrigen Arbeitspunkte (Wöchentlich vs. Täglich, Proteine, Krafttraining, Schlaf/Erholung) → final erarbeitet im Refinement vom 2026-08-31, siehe Abschnitt "Content: Arbeitspunkte 2–5"

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Rechner bleibt zustandslos für Gäste, aber persistent für eingeloggte Nutzer | Nutzerwunsch: beide Zielgruppen bedienen, ohne Login-Zwang für die Grundfunktion | 2026-08-31 |
| Ziel (Fett verlieren/Halten/Muskeln aufbauen) wird mitgespeichert | Nutzerkorrektur — soll beim nächsten Besuch ebenfalls vorausgefüllt sein, nicht nur die Biometrie | 2026-08-31 |
| Autosave bei jeder Berechnung statt explizitem Speichern-Button | Einfachste UX, vom Nutzer bestätigt | 2026-08-31 |
| 5kg-Abweichungs-Hinweis beim Bearbeiten des Gewichtsfelds | Verhindert, dass gespeichertes Ergebnis und tatsächliches aktuelles Gewicht stillschweigend auseinanderlaufen | 2026-08-31 |
| Kein tägliches Tracking/Fortschritts-UI gegen das Kalorienziel | Explizites PRD-Non-Goal ("Kein Kalorienzählen oder Tracking von Tageskalorienzielen") — Rechner bleibt einmaliges, edukatives Tool | 2026-08-31 |
| Nur zwei Geschlechts-Optionen (Männlich/Weiblich) für die Formel | Mifflin-St-Jeor kennt rechnerisch nur diese zwei Varianten; bewusste Nutzerentscheidung gegen eine dritte Option | 2026-08-31 |
| 5 PAL-Stufen (1,2 / 1,375 / 1,55 / 1,725 / 1,9) | Gängige Standard-Skala, vom Nutzer bestätigt | 2026-08-31 |
| Wertebereiche: Gewicht 30–300 kg, Größe 120–250 cm, Alter 14–100 Jahre | Verhindert offensichtlich unsinnige Eingaben, vom Nutzer bestätigt | 2026-08-31 |
| Kcal-Rechner startet als einziger fertiger Arbeitspunkt, restliche 4 als Platzhalter | Content-Aufwand für die anderen 4 Themen folgt separat; der Rechner ist eigenständig wertstiftend und muss nicht darauf warten | 2026-08-31 |
| Refinement 2026-08-31: Copy für alle 4 übrigen Arbeitspunkte in gemeinsamer Runde final erarbeitet, direkt in dieselbe PROJ-37-Spec aufgenommen (kein separates PROJ) | Alle 5 Arbeitspunkte gehören zur selben Seite/demselben Feature; Aufteilung in eigene Specs hätte keinen Testbarkeits-/Deploybarkeits-Vorteil gebracht | 2026-08-31 |
| Arbeitspunkt 2 (Wöchentlich vs. Täglich) bekommt zwei CSS/HTML-Balkendiagramme statt Bild-Assets | Konsistent mit dem Rest der App (keine Illustrations-Assets irgendwo), bleibt responsiv, kein zusätzliches Laden | 2026-08-31 |
| Diagramme nutzen die bestehende App-Farbpalette statt neuer Farben | Visuelle Konsistenz mit dem Rest der App | 2026-08-31 |
| Arbeitspunkte 3 und 5 (Proteine, Schlaf) ohne Schaubild, nur Text/Listen | Nutzer-Entscheidung — bei diesen zwei Themen trägt eine Liste die Information klarer als eine Grafik | 2026-08-31 |
| Krafttraining-Arbeitspunkt verlinkt nur dezent (Text-Link, kein Button) auf `/training`, ohne weitere Erklärung dort | Nutzer will vermeiden, dass der Fokus vom Ernährungs-Bereich wegwandert — der Link soll auffindbar, aber nicht werblich sein | 2026-08-31 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Felder in der bestehenden `profiles`-Tabelle statt neuer Tabelle | 1:1-Beziehung zum Nutzer, kein Verlauf nötig — passt zum bestehenden Muster (z. B. `stripe_customer_id`) | 2026-08-31 |
| Kein Verlauf/Historie der Eingaben — nur der letzte Stand wird gespeichert | Nutzeranforderung deckt nur "letzten Stand vorausfüllen", kein Bedarf an Verlaufsanzeige | 2026-08-31 |
| Neue API-Route zum Speichern (REST-Muster wie `/api/feedback`, `/api/stripe/*`) | Konsistent mit bestehender Architektur — kein direkter DB-Zugriff aus Client-Komponenten | 2026-08-31 |
| Berechnung (Mifflin-St-Jeor + PAL + Ziel) läuft rein client-seitig | Reine Mathematik ohne sensible Serverlogik, sofortiges Ergebnis ohne Wartezeit; nur das Speichern braucht einen Server-Call | 2026-08-31 |
| Speichern nur für echte eingeloggte Nutzer, nicht für anonyme Gast-Sessions | Konsistent mit bestehenden Guest-Checks (z. B. `isAnonymous` in `rezepte/page.tsx`) | 2026-08-31 |
| Neue, reine CSS-Balkendiagramm-Komponente statt Chart-Bibliothek | Nur 2 einfache, statische Balken-Sets — eine Chart-Library wäre Overkill | 2026-08-31 |
| Formular-Steuerelemente: Geschlecht als Radio-Buttons, Ziel als antippbare Schaltflächen (Segmented-Control-Stil), Aktivitätslevel als Dropdown | Nutzervorgabe — Dropdown hält die 5 PAL-Stufen platzsparend, Radio/Buttons passen zur geringen Optionsanzahl bei Geschlecht/Ziel | 2026-08-31 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component-Struktur
```
/ernaehrung/so-geht-abnehmen (Server Component)
├── ErnaehrungSubHeader (bestehend aus PROJ-36)
└── ArbeitspunkteGuide (NEU — generisches Container-Muster, analog zu art-of-eating-guide.tsx)
    ├── Fortschrittsbalken ("X von 5 abgeschlossen")
    ├── 1. Kcal-Rechner (NEU, einzige interaktive Karte)
    │   ├── Eingabefelder (bei eingeloggten Nutzern mit letzten gespeicherten Werten vorausgefüllt)
    │   │   ├── Gewicht, Größe, Alter — Input-Felder mit Inline-Validierung
    │   │   ├── Geschlecht — Radio-Buttons
    │   │   ├── Aktivitätslevel — Dropdown (5 PAL-Stufen)
    │   │   └── Ziel — antippbare Schaltflächen (Segmented-Control-Stil, 3 Optionen)
    │   ├── "Berechnen"-Button → Ergebnis + Autosave bei eingeloggten Nutzern
    │   └── 5kg-Abweichungs-Hinweis
    ├── 2. Wöchentlich vs. Täglich (Text + 2 CSS-Balkendiagramme)
    ├── 3. Warum auf Proteine achten (Text + Info-Box + 3er-Liste)
    ├── 4. Krafttraining (Text + dezenter Link zu /training)
    └── 5. Schlaf/Erholung (Text + 4er-Liste)
```

### Datenmodell
Neue, optionale Felder in der bestehenden `profiles`-Tabelle: Gewicht, Größe, Alter, Geschlecht, Aktivitätslevel, Ziel. Kein Verlauf — nur der letzte Stand wird gespeichert. Für Gäste wird nichts angelegt.

### Backend-Bedarf
Eine neue API-Route zum Speichern der Rechner-Eingaben für eingeloggte Nutzer (Lesen der zuletzt gespeicherten Werte erfolgt serverseitig beim Seitenaufruf, kein separater API-Aufruf nötig).

## Implementation Notes (Frontend)
- Neu: `src/lib/kcal-rechner.ts` — reine Berechnungslogik (Mifflin-St-Jeor, PAL-Faktoren, Ziel-Faktoren, Validierungsgrenzen), keine React-Abhängigkeit, gut isoliert testbar.
- Neu: `src/components/kcal-rechner.tsx` — interaktives Formular (Client Component), inkl. Inline-Validierung, 5kg-Abweichungs-Hinweis, Autosave-Aufruf gegen `/api/kcal-rechner` (POST) — **diese Route existiert noch nicht, folgt in `/backend`**. Fehlerfall (Route fehlt/schlägt fehl) wird bereits jetzt korrekt abgefangen (Ergebnis bleibt sichtbar, "Speichern fehlgeschlagen"-Hinweis erscheint) — das war ohnehin ein Akzeptanzkriterium.
- Neu: `src/components/wochen-balken-diagramm.tsx` — reine CSS/HTML-Balkendiagramm-Komponente (kein Bild-Asset, keine Chart-Bibliothek).
- Neu: `src/components/so-geht-abnehmen-guide.tsx` — Arbeitspunkte-Container nach demselben Muster wie `art-of-eating-guide.tsx` (eigener localStorage-Key `sga_completed`, Fortschrittsbalken, "Verstanden"-Buttons). Arbeitspunkt 1 rendert `KcalRechner`, Arbeitspunkte 2–5 sind statische JSX-Inhalte mit dem final abgestimmten Wortlaut aus der Spec.
- `src/app/ernaehrung/so-geht-abnehmen/page.tsx` liest die zuletzt gespeicherten Werte serverseitig aus `profiles` (Spalten `kcal_gewicht_kg`, `kcal_groesse_cm`, `kcal_alter_jahre`, `kcal_geschlecht`, `kcal_aktivitaetslevel`, `kcal_ziel`) — **diese Spalten existieren noch nicht**. Die Query ist bewusst so geschrieben, dass ein PostgREST-Fehler bei unbekannter Spalte als "keine gespeicherten Werte" behandelt wird (kein Absturz); ein expliziter Type-Cast überbrückt, dass die generierten Supabase-Typen die neuen Spalten vor der Migration noch nicht kennen.
- **Für `/backend` offen:** (1) Migration für die 6 neuen `profiles`-Spalten, (2) `POST /api/kcal-rechner`-Route (Auth-Check: nur echte, nicht-anonyme Nutzer; Upsert der 6 Felder), (3) danach den Type-Cast in `page.tsx` entfernen, sobald die generierten Supabase-Typen aktuell sind.
- `npm run build`, `npm run lint`, `npm test` (390/390) fehlerfrei. Manuell im Browser verifiziert: Formular-Validierung (Wertebereiche, Button-Deaktivierung), Berechnung (Mifflin-St-Jeor + PAL + Ziel-Faktor gegen Hand­rechnung geprüft: 80kg/180cm/30J/männlich/moderat aktiv → 2759 kcal Erhaltungsbedarf, 2483 kcal bei "Fett verlieren" — exakt 90 %), alle 5 Arbeitspunkte inkl. Diagramm-Captions, Protein-Liste, Krafttraining-Punkte, Schlaf-Tipps und Training-Link.

## Implementation Notes (Backend)
- Migration (vom Nutzer manuell in Supabase SQL Editor ausgeführt, da MCP-Zugriff diese Session getrennt war): 6 neue, optionale Spalten auf `profiles` (`kcal_gewicht_kg`, `kcal_groesse_cm`, `kcal_alter_jahre`, `kcal_geschlecht`, `kcal_aktivitaetslevel`, `kcal_ziel`), letztere drei mit `CHECK`-Constraints auf die gültigen Enum-Werte.
- Neu: `POST /api/kcal-rechner` (`src/app/api/kcal-rechner/route.ts`) — Zod-Validierung (Wertebereiche/Enums aus `src/lib/kcal-rechner.ts` wiederverwendet, keine doppelte Grenzwert-Pflege), Auth-Check (401 ohne Session, 403 für anonyme Gast-Sessions), Schreiben über den Service-Role-Client mit explizitem `.eq('id', user.id)` — selbes Muster wie `/api/invite/redeem`.
- `src/types/database.ts`: die 6 neuen Spalten in die `profiles`-Typdefinition (Row/Insert/Update) ergänzt — der Type-Cast aus der Frontend-Phase in `page.tsx` konnte dadurch wieder entfernt werden, keine Workarounds mehr im Code.
- Integrationstest: `src/app/api/kcal-rechner/route.test.ts` — 401/403/400 (pro Feld out-of-range + ungültiges Enum)/500/Erfolgsfall, insgesamt 11 neue Tests.
- End-to-End gegen die echte (migrierte) Datenbank live verifiziert: Speichern liefert 200, nach Seiten-Reload sind Gewicht/Größe/Alter/Geschlecht korrekt vorausgefüllt (temporäres Playwright-Skript, nicht committed — offizielle E2E-Abdeckung folgt in `/qa`).
- `npm run build`, `npm run lint`, `npm test` (401/401) fehlerfrei.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
