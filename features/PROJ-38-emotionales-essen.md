# PROJ-38: Emotionales Essen

## Status: Approved
**Created:** 2026-08-31
**Last Updated:** 2026-08-31

## Dependencies
- Requires: PROJ-36 (Ernährung-Hub) — Zielseite `/ernaehrung/emotionales-essen` existiert bereits als Platzhalter, wird hier mit echtem Inhalt befüllt
- Referenziert: PROJ-37 (So geht abnehmen) — übernimmt dasselbe "Arbeitspunkte"-Guide-Muster (nummerierte Karten, Fortschrittsbalken, "Verstanden"-Buttons, lokal gespeicherter Fortschritt)

## User Stories
- Als Nutzer möchte ich verstehen, warum emotionales Essen passiert (Trauer, Wut, Überforderung, Langeweile), damit ich es nicht als persönliches Versagen sehe.
- Als Nutzer, der gerade eine starke Emotion spürt, möchte ich direkt zu einer passenden Technik für genau diese Emotion springen können (Traurigkeit, Wut, Überforderung), damit ich sofort handeln kann statt lange zu suchen.
- Als Nutzer möchte ich allgemeine Praxis-Übungen (Journaling, Fragebogen, Atemübung, Einkauf/Mahlzeiten/Screentime planen) an die Hand bekommen, damit ich emotionales Essen langfristig seltener werden lässt.
- Als Nutzer möchte ich vor dem Griff zum Kühlschrank einen kurzen Fragebogen durchgehen können, damit ich unterscheiden kann, ob ich wirklich Hunger habe.
- Als Nutzer möchte ich meinen Fortschritt durch die Arbeitspunkte sehen, damit ich weiß, was ich schon kenne und was noch offen ist.

## Out of Scope
- Digitales Journaling-Tool mit Speicherung — die Übung bleibt eine Anleitung für Papier/eigene Notizen, kein Eingabefeld in der App (siehe Product Decisions)
- Interaktiver, ausgewerteter Fragebogen (Scoring, Ergebnis-Seite) — der Fragebogen ist eine reine Lese-/Selbstreflexions-Liste, kein Formular
- Geführte, animierte Atemübung mit Timer — reine Textanleitung wie beim Schlaf-Arbeitspunkt in PROJ-37, kein interaktives Element
- Digitales Einkaufslisten-Tool (Abhaken, Speichern, Teilen) — die Liste ist eine statische Referenz zum Lesen/Abschreiben
- Screentime-Tracking innerhalb der App — verweist nur auf die Bordmittel des eigenen Smartphones, trackt nichts selbst

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seitenstruktur
- [ ] Angenommen ein Nutzer öffnet `/ernaehrung/emotionales-essen`, dann sieht er zuerst einen unnummerierten Intro-Text zu emotionalem Essen (Trauer/Wut/Überforderung als normale, nicht durch Essen lösbare Emotionen; Langeweile als Dauerstimulation/fehlender Reiz).
- [ ] Angenommen die Seite wird angezeigt, dann folgen danach 9 nummerierte Arbeitspunkte in zwei optisch getrennten Sektionen: Sektion 1 "Direkt an der Emotion ansetzen" (3 Punkte: Traurig, Wütend, Überfordert/Gestresst) und Sektion 2 (6 allgemeine Praxis-Übungen: Journaling, Fragebogen, Atemübung, Einkauf planen, Feste Mahlzeiten planen, Screentime planen).
- [ ] Angenommen die Seite wird angezeigt, dann bleibt der bestehende Breadcrumb-Header ("Ernährung / Emotionales Essen") aus PROJ-36 erhalten.
- [ ] Angenommen ein Nutzer hat noch keinen Arbeitspunkt als "Verstanden" markiert, dann zeigt der Fortschrittsbalken "0 von 9 abgeschlossen".

### Sektion 1 — Direkt an der Emotion ansetzen
- [ ] Angenommen ein Nutzer öffnet "Traurig?", dann sieht er den Hinweis auf fehlende Nähe (8-Minuten-Regel, anrufen/austauschen, ggf. Umarmung) inkl. der Erklärung zu Oxytocin/Dopamin/Serotonin und warum Essen hier nur eine kurze Endlosschleife ist.
- [ ] Angenommen ein Nutzer öffnet "Wütend?", dann sieht er den Hinweis auf Bewegung (z. B. 1 Minute Kniebeugen/Liegestütze/Planks oder 10 Minuten gehen) inkl. der kurzen Fight/Flight/Freeze-Erklärung.
- [ ] Angenommen ein Nutzer öffnet "Überfordert/Gestresst?", dann sieht er die Anleitung: 5 Minuten Zeit nehmen, Aufgaben aufschreiben, mit 1–3 priorisieren (keine 0, keine 4), Deadline ("MUSS", nicht "sollte") notieren, und eine "Delegieren"-Spalte ausfüllen.

### Sektion 2 — Allgemeine Praxis-Übungen
- [ ] Angenommen ein Nutzer öffnet "Journaling", dann sieht er die Anleitung zur Plus/Minus-Tabelle (5 Minuten morgens oder abends, Spalte "+" und "−", warum das Aufschreiben allein schon wirkt).
- [ ] Angenommen ein Nutzer öffnet "Fragebogen", dann sieht er die Einleitung ("Du stehst vor dem Kühlschrank...") gefolgt von genau 7 nummerierten Fragen (gekürzte Fassung, siehe Content-Abschnitt der Spec).
- [ ] Angenommen ein Nutzer öffnet "Atemübung", dann sieht er die 4-6-8-Technik (4 Sek. einatmen, 6 Sek. halten, 8 Sek. ausatmen, 5–10 Minuten wiederholen).
- [ ] Angenommen ein Nutzer öffnet "Einkauf planen", dann sieht er die Referenz-Einkaufsliste aus zwei Hauptkategorien (Frisches, Haltbares) mit ihren Unterkategorien (siehe Content-Abschnitt).
- [ ] Angenommen ein Nutzer öffnet "Feste Mahlzeiten planen", dann sieht er die 20/40/40-Aufteilungsregel mit Rechenbeispiel bei 2000 kcal (400/800/800).
- [ ] Angenommen ein Nutzer öffnet "Screentime planen", dann sieht er die Anleitung, die eigene Bildschirmzeit in den Handy-Einstellungen zu prüfen und schrittweise (nicht auf einen festen Zielwert, sondern "weniger als gestern") zu reduzieren.

## Edge Cases
- Nutzer markiert alle 9 Arbeitspunkte als "Verstanden" → Fortschrittsbalance zeigt "Alles durch ✓" (analog zu PROJ-37/Art-of-Eating-Muster).
- Nutzer klickt "Verstanden" erneut → Punkt wird wieder als offen markiert (Toggle-Verhalten, wie im bestehenden Muster).
- Gast (keine Session) ruft die Seite auf → vollständig lesbar ohne Login (rein statischer Inhalt, kein Grund für eine Einschränkung).
- Sehr lange Einkaufsliste auf 375px Mobile-Breite → Layout darf nicht horizontal scrollen (gleiche Anforderung wie bei allen bestehenden Seiten).

## Technical Requirements (optional)
- Kein Backend nötig — rein statischer Inhalt, Fortschritt wird wie beim bestehenden Guide-Muster in `localStorage` gehalten (kein Server-Sync).

## Content: Intro & alle 9 Arbeitspunkte (finaler Wortlaut)

### Intro
> Trauer, Wut, Überforderung, Stress — das sind menschliche Emotionen, die auch zu einem "gesunden" Leben dazugehören können. Aber keine davon lässt sich mit etwas zu essen lösen. Wie du stattdessen damit umgehen kannst, zeige ich dir hier.
>
> Langeweile gibt es eigentlich nicht wirklich — meistens ist es ein Zeichen für Dauerstimulation. Klebst du ständig am Screen? Kopfhörer immer drin? Deine Sinne (Hören, Sehen, Riechen, Fühlen) sind permanent gereizt. Und was passt da super dazu? Genau: Geschmack, Kauen, ein tolles Mundgefühl. Die vermeintliche Langeweile ist oft nur ein fehlender Reiz, den du mit Essen oder Trinken füllen willst.

### 1. Traurig? Dir fehlt Nähe.
> Simon Sinek sagt: 8 Minuten reichen, um sich verstanden zu fühlen. Drei Aktions-Kacheln (📞 Anrufen & austauschen · 💬 Alles rauslassen · 🤗 Um Umarmung bitten), dann: Frag eine Freundin oder einen Freund, ob sie 8 Minuten für dich haben — das reicht schon. Bist du nicht allein daheim: Frag nach einer Umarmung. Das schüttet aus: Oxytocin · Dopamin · Serotonin (als Pills dargestellt). Essen löst das zwar auch aus — ist aber mit dem Runterschlucken vorbei. Deswegen die Endlosschleife.

### 2. Wütend? Dir fehlt Bewegung.
> Die Wut muss einmal raus. Wähl eine Übung — der Timer läuft direkt mit: interaktiver Bewegungs-Timer mit 4 Optionen (🏋️ Kniebeugen 1 Min. / 💪 Liegestütze 1 Min. / 🧘 Plank 1 Min. / 🚶 Runde um den Block 10 Min.), Klick auf "▶ Start" startet einen echten Countdown pro Übung. Wut ist meist ein Kommunikationsproblem bei Meinungsverschiedenheiten, oft von außen angestoßen. Der Körper reagiert mit einem der drei Fs: Fight, Flight oder Freeze. Bei Fight muss die Energie woanders hin — in deinen Körper, mit Bewegung. Flight entgeht der Wut, die kommt wieder. Freeze verlagert sie auf später. Essen ist keine Lösung davon.

### 3. Überfordert / Gestresst? Mach das:
> Postfach voll, To-do-Liste quillt über? Nimm dir 5 Minuten und schreib deine Aufgaben so auf — 4 Beispiel-Aufgaben zeigen das Format (Aufgabe / Priorität / Bis wann / Delegieren), darunter erklärt je ein Bulletpoint eine Spalte: 📝 Aufgabe — schreib auf, was du alles zu tun hast · 🔢 Priorität — vergib 1–3 (keine 4, keine 0) · ⏰ Bis wann — wann es fertig sein MUSS, nicht sollte · 🤝 Delegieren — wer kann dir helfen oder es übernehmen? Du musst nicht alles allein machen. Jetzt die Liste sinnvoll abarbeiten — mit einem Snack wird sie nicht kürzer.

### 4. Journaling
> Nimm dir jeden Morgen oder Abend Zeit für dich (⏱ 5 Minuten). Zwei Beispiel-Listen machen sichtbar, was gemeint ist: "+ Was lief gut" (3 Beispiele: entspannt aufgewacht, bewusst Mittag gegessen, alle ToDos abgearbeitet) und "− Was lief nicht so gut" (4 Beispiele, je mit dem eigentlichen Wunsch dahinter in Klammern: Sport übersprungen / Ja zum Kuchen gesagt / auf der Couch versackt / zu lange am Handy).
>
> Allein durchs Aufschreiben beschäftigst du dich damit. Beim nächsten Mal flüstert eine leise Stimme: "Moment — das hab ich doch aufgeschrieben." So kannst du dich Schritt für Schritt aus solchen Situationen befreien.

### 5. Fragebogen "Hast du wirklich Hunger?"
> Routinen machen dir den Alltag leichter — aber manche stehen dem Abnehmen im Weg, und schwups landest du bei der Snackschublade. Die Auslöser dafür sind endlos. Bevor die Routine "Essen" startet, stell dir diese Fragen. Davor eine kleine Grafik der Routine-Kette: 🧠 Auslöser → 🔄 Routine → 🍫 Belohnung.
>
> Du stehst vor der Snackschublade oder dem Kühlschrank? Okay. Beantworte dir erst diese Fragen — dann geht's weiter.
>
> 1. Ich WILL essen — warum? Was hatte ich gerade eigentlich vor?
> 2. Würde ich jetzt auch eine trockene Scheibe Brot essen?
> 3. Habe ich genug getrunken — bin ich vielleicht nur durstig?
> 4. Wie habe ich geschlafen, wie viel Sport hatte ich zuletzt? Wenig von beidem heißt: mein Körper braucht evtl. mehr Energie — das ist okay.
> 5. Wann war meine letzte Mahlzeit, wann ist die nächste geplant? Hat mich die letzte nicht wirklich gesättigt? *(Falls ja: nochmal zu Frage 1.)*
> 6. Wurde ich gerade getriggert — Geruch, Werbung, Kuchen im Büro?
> 7. Okay, ich habe wirklich Hunger. Aber: Was ist eigentlich mein Ziel — und wie weit wirft mich das jetzt zurück?

### 6. Atemübung (4-6-8-Technik)
> Animierter Atem-Block statt reinem Text: startet mit 5-Sekunden-Countdown, dann 5 Runden à Einatmen (4s, Block füllt sich) → Halten (6s, Farbe pulsiert leicht) → Ausatmen (8s, Block leert sich). Rundenzähler daneben ("Runde X von 5"). Läuft nur, während das Akkordion-Item geöffnet ist — schließen pausiert/stoppt die Animation, erneutes Öffnen startet sie neu von vorn.

### 7. Einkauf planen
> Was du immer zu Hause haben solltest, damit du unfallfrei und schnell kochen kannst. Das ist nur ein Vorschlag — mach ihn zu deinem!
>
> **Frisches**
> - 🥦 Gemüse (saisonal, z. B. Frühling: Rhabarber, Radieschen, Spargel, Brokkoli … / Sommer: Paprika, Zucchini, Tomate … / Herbst: Kürbis, Mais … / Winter: Wurzelgemüse, Rotkohl, Grünkohl …), plus Pilze, Zitrone/Limette, Karotte, Knollensellerie, Kartoffel, Zwiebel, Knoblauch
> - 🍎 Obst (saisonal, z. B. Beeren, Kirschen, Äpfel, Trauben, Birnen, Zitrusfrüchte je nach Jahreszeit)
> - 🌿 Kräuter (Petersilie, Schnittlauch, Basilikum, Rosmarin, Ingwer …)
> - 🧀 Milchprodukte (Quark, Harzer Käse, Käse, Joghurt, Butter)
> - 🥚 Weitere Proteinquellen (Tofu, Tempeh, Eier)
> - 🫙 Gekühltes Haltbares (Sauerkraut, Kimchi, Misopaste, Senf, Currypaste)
>
> **Haltbares**
> - 🥫 Konserven (Kichererbsen, Bohnen, Mais, Tomatensoße, Tomatenmark)
> - 🍓 Eingekochtes (Marmelade, Apfelmark)
> - 🍯 Glasware (Honig, Mandelmus)
> - 🌶️ Getrocknet (Kräutermischungen, Chillies, Zimt)
> - 🧴 Flaschen (natives Öl, raffiniertes Öl/Schmalz, Essige, Sojasauce)
> - 🌾 Alles Korn (Hafer-/Dinkel-/Weizenflocken, Müslimix, Vollkornmehl, Brot/Tortillas, Nudeln, Reis)
> - 🍫 Süßes in Maßen (dunkle Schokolade, Studentenfutter, zuckerfreie Getränke, Proteinriegel)
> - 🧊 Tiefkühlware (Beeren, Fisch und Fleisch, Erbsen, TK-Gemüsemischung)

### 8. Feste Mahlzeiten planen (ohne Ablenkung)
> Wenn du "immer" isst, hat dein Körper keinen Rhythmus — und der liebt Rhythmus. Deshalb reden wir von 3 festen Mahlzeiten am Tag, aufgeteilt nach der Formel 20/40/40. Interaktiv: ein Balken + 3 Blöcke (Frühstück/Mittag/Abend) zeigen die Aufteilung mit kcal und Prozent — auf Basis des eigenen PROJ-37-Kcal-Rechner-Ergebnisses, sonst Referenzwert 2000 kcal. Ein Schalter "Snack einbauen?" fügt einen 4. Block zwischen Mittag- und Abendessen ein und nimmt dafür je 10 Prozentpunkte der Gesamtkalorien von Mittag- und Abendessen (20/30/20/30 statt 20/40/40).

### 9. Screentime planen
> Deine Sinne sind oft permanent gereizt — das erzeugt den Drang nach **mehr** Reiz und kann zu mehr unbewusstem Essen führen.
>
> Reiz-Ampel (5 Sinne): Hören ("Kopfhörer immer drin?"), Sehen ("Ständig am Screen?") und Fühlen ("Handy ständig in der Hand?") sind vom Smartphone bedient — als "angetickt" markiert (grüner Haken). Riechen ("Frisches Brot, Kaffeeduft, Gebäck") und Schmecken ("Essen, kauen, leckeres Mundgefühl") bleiben offen/ausgegraut (gestrichelter Kreis) — genau die Lücke, die unbewusstes Essen zu füllen versucht.
>
> Limitiere deine Hauptablenkungs-App auf eine "Tagesdosis" von 45 Minuten pro Tag. Glaub mir — du wirst über den Effekt staunen!

## Open Questions
- [x] Visuelle Gestaltung für Arbeitspunkt 9 (Screentime planen) → Reiz-Ampel (5 Sinne, Hören/Sehen/Fühlen "angetickt" vs. Riechen/Schmecken offen), entschieden nach Mockup-Vergleich (2026-09-01).

Keine offenen Fragen mehr — Copy für Intro und alle 9 Arbeitspunkte final (Quelle: vom Nutzer bereitgestellte PDFs "Emotionales_Essen.pdf" und "AnatomieDesKühlschranksV2.pdf", Fragebogen von 9 auf 7 Fragen gekürzt; alle 9 Arbeitspunkte am 2026-09-01 visuell überarbeitet, siehe Implementation Notes).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Journaling, Fragebogen, Atemübung und Einkauf planen bleiben reine Text-/Lese-Inhalte ohne Interaktivität oder Speicherung | Ursprüngliche Annahme (interaktive Tools) war zu weit gedacht — Nutzer wollte Methoden erklärt haben, kein digitales Tool; kein Backend nötig | 2026-08-31 |
| Fragebogen von 9 auf 7 Fragen gekürzt (Fragen zu Schlaf+Sport sowie Mahlzeit-Timing zusammengelegt) | Nutzerwunsch nach kürzerer, prägnanterer Fassung | 2026-08-31 |
| 3 emotionsspezifische Punkte (Traurig/Wütend/Überfordert) als eigene, separate Arbeitspunkte statt Unterpunkte eines gemeinsamen Punkts | Jede Emotion verdient einen eigenständigen, direkt anspringbaren Punkt | 2026-08-31 |
| Diese 3 Punkte stehen an erster Stelle und sind optisch von den 6 allgemeinen Praxis-Übungen abgesetzt | Nutzerwunsch — direkter Emotionsbezug soll sich vom eher allgemeinen Rest abheben | 2026-08-31 |
| Kein Trainingsplan-artiger Verweis wie bei PROJ-37 (Krafttraining → /training) nötig | Diese Seite hat keine thematische Überschneidung mit einem anderen Nav-Bereich | 2026-08-31 |
| Reiz-Ampel (statische 5-Sinne-Übersicht) statt interaktivem Screentime-Rechner für Punkt 9 | Nutzer lehnte den interaktiven Rechner explizit ab: "Bei B können sich die Leute zu sehr selbst verarschen" — Risiko unehrlicher Selbsteingaben bei einem sensiblen Thema | 2026-09-01 |
| Riechen & Schmecken bewusst als "offen/ausgegraut" dargestellt, nicht als weitere "angetickte" Punkte | Zeigt die Sinneslücke, die das Smartphone nicht füllen kann — genau die Lücke, die unbewusstes Essen zu füllen versucht (Kernaussage des Arbeitspunkts) | 2026-09-01 |
| Fester Zielwert "45 Minuten pro Tag" statt der bisherigen vagen "einfach weniger als gestern"-Formulierung | Nutzer-Vorgabe — konkreter, actionable-r Richtwert | 2026-09-01 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue gemeinsame Komponente `ArbeitspunkteListe` statt einer dritten Kopie der Fortschritts-/Karten-/Toggle-Logik | Art of Eating und So geht abnehmen duplizieren dieselbe Logik bereits; eine dritte Kopie hätte die Duplikation weiter verschärft | 2026-08-31 |
| Bestehende zwei Guide-Seiten (Art of Eating, So geht abnehmen) bleiben unangetastet, nutzen den neuen Baustein noch nicht | Umbau bereits ausgelieferter, getesteter Features liegt außerhalb des Rahmens von PROJ-38 — Migration kann bei künftigem Anfassen dieser Seiten nachgezogen werden | 2026-08-31 |
| Sektions-Trenner (Divider + kleine Überschrift) als einfache visuelle Ergänzung, keine neue Bibliothek | Reicht aus, um die 3 emotionsspezifischen Punkte optisch abzusetzen | 2026-08-31 |
| Kein Backend | Reiner statischer Inhalt, kein Formular, keine Persistenz | 2026-08-31 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component-Struktur
```
/ernaehrung/emotionales-essen (Server Component)
├── ErnaehrungSubHeader (bestehend aus PROJ-36)
└── EmotionalesEssenGuide (NEU)
    ├── Intro-Text (unnummeriert)
    └── ArbeitspunkteListe (NEU: gemeinsamer Baustein für Fortschrittsbalken,
    │                        Karten-Optik und "Verstanden"-Toggle)
        ├── Sektion "Direkt an der Emotion ansetzen" (Trennlinie + kleine Überschrift)
        │   ├── 1. Traurig?
        │   ├── 2. Wütend?
        │   └── 3. Überfordert/Gestresst?
        └── Sektion "Allgemeine Praxis-Übungen"
            ├── 4. Journaling
            ├── 5. Fragebogen (7 Fragen)
            ├── 6. Atemübung
            ├── 7. Einkauf planen
            ├── 8. Feste Mahlzeiten planen
            └── 9. Screentime planen
```

### Datenmodell
Keins — reiner statischer Inhalt. Fortschritt bleibt wie bisher in `localStorage` (eigener Key für diese Seite, kein Server-Sync).

### Backend-Bedarf
Keiner.

## Implementation Notes (Frontend)
- Neu: `src/components/arbeitspunkte-liste.tsx` — gemeinsamer Baustein (Fortschrittsbalken, Karten-Optik, "Verstanden"-Toggle, `localStorage`, optionale Sektions-Trenner), extrahiert aus dem bisher zweifach duplizierten Muster (`art-of-eating-guide.tsx`, `so-geht-abnehmen-guide.tsx` — beide bewusst unangetastet gelassen, siehe Architektur-Entscheidung).
- Neu: `src/components/emotionales-essen-guide.tsx` — Intro-Text + 9 Arbeitspunkte in 2 Sektionen, nutzt `ArbeitspunkteListe` mit eigenem `localStorage`-Key (`ee_completed`).
- `src/app/ernaehrung/emotionales-essen/page.tsx`: Platzhalter durch `EmotionalesEssenGuide` ersetzt.
- `npm run build`, `npm run lint`, `npm test` (415/415) fehlerfrei. Verifiziert per Accessibility-Tree (Screenshot-Capture des Browser-Tools war in dieser Session zeitweise instabil, siehe unten): Intro, Fortschrittsbalken "0 von 9", beide Sektionen mit Trennlinie/Überschrift, alle 9 Arbeitspunkte mit korrektem Inhalt (Fragebogen mit exakt 7 Fragen in Reihenfolge, Einkaufsliste mit Frisches/Haltbares-Gliederung), Breadcrumb-Header aus PROJ-36 erhalten.
- Ein React-Konsolenfehler ("missing key prop", zugeschrieben an `ArbeitspunkteListe`) tauchte im Browser-Tool auf, blieb aber identisch bestehen, nachdem zu einer völlig anderen Seite navigiert wurde, die diese Komponente gar nicht rendert (`/ernaehrung/wie-esse-ich-richtig`, nutzt `ArtOfEatingGuide`) — eindeutiges Zeichen für einen hängengebliebenen Tool-Puffer, nicht für einen echten Fehler. Code-Review bestätigt: beide `.map()`-Aufrufe in `arbeitspunkte-liste.tsx` haben eindeutige `key`-Props (`sektionIndex`, `punkt.id`), `emotionales-essen-guide.tsx` enthält keine `.map()`-Aufrufe. Sollte sich das bei der QA-Runde (mit funktionierendem Browser-Zugriff) doch reproduzieren lassen, bitte als Bug behandeln.

### Refinement (2026-08-31): Ein-/Ausklappen + Layout-Feedback
Nutzer-Feedback nach erstem Review: zu viel Text auf einmal sichtbar. Umgesetzt:
- `ArbeitspunkteListe` von "immer ausgeklappt" auf shadcn `Accordion` (`type="multiple"`, jeder Punkt unabhängig auf-/zuklappbar, alle standardmäßig eingeklappt) umgestellt. Neuer optionaler `defaultOffenIds`-Prop, damit einzelne Punkte (z. B. der Kcal-Rechner bei bereits gespeicherten Werten) trotzdem sofort ohne Klick sichtbar starten können — wichtig, um das PROJ-37-Akzeptanzkriterium "Ergebnis sofort sichtbar" nicht zu brechen.
- **Übergreifend auf alle 3 Guides angewendet** (Nutzerwunsch, explizit bestätigt trotz Aufwand für 2 bereits deployte Features): `art-of-eating-guide.tsx` (PROJ-34) und `so-geht-abnehmen-guide.tsx` (PROJ-37) wurden ebenfalls auf `ArbeitspunkteListe` umgestellt — beide nutzten zuvor eine eigene, duplizierte "immer ausgeklappt"-Implementierung.
- Textbreite: horizontaler Innenabstand im aufgeklappten Zustand entfernt (volle Kartenbreite statt Einrückung unter der Nummer).
- Schriftgröße im Fließtext aller 3 Guides von `text-sm` auf `text-xs` reduziert (mehr Inhalt pro Bildschirm auf Mobile).
- Desktop-Breite der 3 Guide-Seiten von `max-w-sm` (384px) auf `md:max-w-[850px]` erhöht (Mobile bleibt unverändert).
- Bestehende E2E-Suiten `PROJ-37-so-geht-abnehmen.spec.ts` und `PROJ-36-ernaehrung-hub.spec.ts` angepasst (Accordion-Items müssen vor Sichtbarkeits-Checks erst aufgeklappt werden; `/ernaehrung/emotionales-essen` aus der Platzhalter-Testliste entfernt, da jetzt echter Inhalt). `PROJ-34-art-of-eating.spec.ts` unverändert — testet nur einen Link auf die Guide-Seite, nie deren Inhalt selbst.
- `npm run build`, `npm run lint`, `npm test` (415/415), sowie `PROJ-37` (17/17) und `PROJ-36` (20/20) E2E-Suiten grün nach der Umstellung.

### Refinement (2026-09-01): Visuelle Überarbeitung Arbeitspunkte 1–4 & 8
Nutzer-Feedback: Überschriften 1/2 sollten den Kern vorwegnehmen, Arbeitspunkte 3/4 waren reiner Fließtext ("erschlägt einen") und sollten visueller/scanbarer werden, Arbeitspunkt 8 sollte die 3-Mahlzeiten-Aufteilung sichtbar und mit echten kcal-Werten zeigen.
- **1 (Traurig) & 2 (Wütend):** Überschrift nimmt jetzt die Kernaussage vorweg ("Traurig? Dir fehlt Nähe." / "Wütend? Dir fehlt Bewegung."), der bisher redundante erste Satz/das erste Wort im Fließtext entfernt.
- **3 (Überfordert/Gestresst):** Von Fließtext auf 4 Beispiel-Aufgaben-Karten (Aufgabe/Priorität/Bis-wann/Delegieren) + 4 erklärende Bulletpoints (mit Emoji) umgestellt — die 4 Spalten des ursprünglichen Konzepts sind jetzt an 4 konkreten Beispielen ablesbar statt nur beschrieben.
- **4 (Journaling):** Von Fließtext-Anleitung auf ein visuelles Beispiel umgestellt — Timer-Icon mit "5 Minuten", plus eine grüne "+"-Box (3 Beispiele) und eine amber "−"-Box (4 Beispiele, je mit dem eigentlichen Wunsch in Klammern). Konkrete Beispiele vom Nutzer vorgegeben.
- **8 (Feste Mahlzeiten planen):** Von statischem Text auf eine interaktive Komponente (`src/components/feste-mahlzeiten-planer.tsx`, Client Component) umgestellt — zeigt Frühstück/Mittag/Abend als farbige Balken-Segmente + Karten mit kcal und Prozent, nutzt den zuletzt berechneten PROJ-37-Kcal-Rechner-Wert (`profiles.kcal_*`, serverseitig in `emotionales-essen/page.tsx` geladen und über `berechneKcal()` ausgewertet) oder den Referenzwert 2000 kcal, falls noch nicht berechnet (mit Link zum Kcal-Rechner). Ein shadcn `Switch` "Snack einbauen?" fügt einen 4. Block ein und verschiebt die Aufteilung von 20/40/40 auf 20/30/20/30 (Snack = je 10 Prozentpunkte von Mittag- und Abendessen).
- Emojis vor Bulletpoints ergänzt, wo neue Listen/Beispiele entstanden sind (Punkte 3 & 4) — bestehender Inhalt (Fragebogen, Atemübung, Einkauf planen) bewusst unangetastet gelassen, da nicht Teil dieser Anfrage.
- `tests/PROJ-38-emotionales-essen.spec.ts`: 2 Tests an neue Textstruktur angepasst (Punkt 3 & 4), 2 neue Tests ergänzt (statischer 2000-kcal-Referenzwert; Snack-Schalter-Interaktion). Alle 36 E2E-Tests grün (18 Acceptance-Tests × 2 Browser-Projekte).
- `npm run build`, `npm run lint`, `npm test` (415/415) weiterhin grün.
### Refinement (2026-09-01, Teil 2): Reiz-Ampel für Arbeitspunkt 9 (Screentime planen)
Für Punkt 9 wurden dem Nutzer 3 visuelle Konzepte als Artifact-Mockup vorgelegt (schrumpfender Wochen-Balken / interaktiver Rechner / Reiz-Ampel). Entscheidung: **Reiz-Ampel**, mit Begründung "bei B können sich die Leute zu sehr selbst verarschen" (Ablehnung der interaktiven Selbsteingabe — Risiko unehrlicher/geschönter Werte).
- Von reinem Fließtext auf eine 5-Sinne-Übersicht umgestellt: Hören/Sehen/Fühlen sind vom Smartphone bedient und als "angetickt" markiert (grüner Kreis mit Haken, `lucide-react` `Check`); Riechen/Schmecken bleiben bewusst offen/ausgegraut (gestrichelter Rahmen, gestrichelter leerer Kreis) — visualisiert die Lücke, die unbewusstes Essen zu füllen versucht.
- Intro-Satz verschärft: "…kann zu mehr unbewusstem Essen führen" (statt der bisherigen vagen Formulierung) — verbindet Punkt 9 direkter mit dem Kernthema der Seite.
- Konkreter Zielwert statt vager schrittweiser Reduktion: "Tagesdosis von 45 Minuten pro Tag" (Nutzer-Vorgabe, ersetzt die bisherige "einfach weniger als gestern"-Formulierung).
- Kein zusätzlicher Client-State nötig (rein statische Darstellung) — anders als bei Punkt 8 blieb `emotionales-essen-guide.tsx` hier eine reine (Server-)Komponente.
- 2 neue E2E-Tests ergänzt (45-Minuten-Tagesdosis; alle 5 Sinne inkl. Schmecken-Beschreibung sichtbar). `PROJ-38`-Suite: 19/19 (chromium). `npm run build`, `npm run lint`, `npm test` (415/415) weiterhin grün.
- Damit sind alle 9 Arbeitspunkte final überarbeitet — keine offenen Fragen mehr zu Punkt 9.

### Refinement (2026-09-01, Teil 3): Visuelle Auflockerung Punkte 1, 2, 5, 6 & Emojis in Punkt 7
Letzte Anpassungsrunde des Nutzers, um die verbliebenen reinen Text-Arbeitspunkte visueller zu machen.
- **1 (Traurig):** Design-Entscheidung ohne Rückfrage getroffen (Nutzer bat explizit um Unterstützung): 3 Aktions-Kacheln (📞 Anrufen & austauschen · 💬 Alles rauslassen · 🤗 Um Umarmung bitten) direkt nach der 8-Minuten-Regel, am Ende die 3 ausgeschütteten Hormone als Pills ("Das schüttet aus: Oxytocin · Dopamin · Serotonin") statt als Fließtext-Aufzählung.
- **2 (Wütend):** Neue Komponente `src/components/bewegungs-timer.tsx` (Client) — 4 Übungs-Zeilen (🏋️ Kniebeugen, 💪 Liegestütze, 🧘 Plank je 1 Min.; 🚶 Runde um den Block 10 Min.), Klick auf "▶ Start" startet einen echten, unabhängigen Sekunden-Countdown pro Zeile (`setInterval`), Anzeige wechselt zu "✅ Fertig" bei 0.
- **5 (Fragebogen):** Neuer, vereinfacht formulierter Intro-Absatz zur Routine-Mechanik + kleine Habit-Loop-Grafik (🧠 Auslöser → 🔄 Routine → 🍫 Belohnung) vor den 7 Fragen — verbindet das "Warum" der Fragen mit dem eigentlichen Auslöser-Modell.
- **6 (Atemübung):** Neue Komponente `src/components/atemuebung-animation.tsx` (Client) — animierter Atem-Block statt Text: 5s-Start-Countdown, dann 5 Runden Einatmen (4s, Block füllt sich von unten) → Halten (6s, `animate-pulse` mit 3s-Zyklus) → Ausatmen (8s, Block leert sich). Läuft rein über verkettete `setTimeout`s in einem `useEffect`; da Radix' `AccordionContent` standardmäßig kein `forceMount` nutzt, unmounted es seinen Inhalt automatisch beim Schließen — der Effekt-Cleanup stoppt die Animation dadurch von selbst, kein zusätzlicher "ist Akkordion offen"-Mechanismus nötig. Erneutes Öffnen mounted die Komponente frisch und startet den 5s-Countdown erneut.
- **7 (Einkauf planen):** Jede der 14 Zeilen (Frisches + Haltbares) um ein passendes Emoji vorangestellt (🥦🍎🌿🧀🥚🫙 / 🥫🍓🍯🌶️🧴🌾🍫🧊).
- `tests/PROJ-38-emotionales-essen.spec.ts`: Tests für Punkt 1, 2, 5, 6 neu geschrieben (u. a. Timer-Start-Interaktion, Warten auf Animations-Phasenwechsel mit Timeout, sowie ein dedizierter Test, dass die Atemübungs-Animation beim Schließen des Akkordions tatsächlich verschwindet/pausiert). `PROJ-38`-Suite: 20/20 (chromium).
- `npm run build`, `npm run lint`, `npm test` (415/415) weiterhin grün.

## QA Test Results

**Tested:** 2026-08-31
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Seitenstruktur
- [x] Intro-Text (Trauer/Wut/Überforderung + Langeweile-Punkt) sichtbar
- [x] 9 Arbeitspunkte in 2 optisch getrennten Sektionen, korrekte Reihenfolge
- [x] Breadcrumb "Ernährung / Emotionales Essen" erhalten
- [x] Fortschrittsbalken startet bei "0 von 9 abgeschlossen"
- [x] Alle Arbeitspunkte starten eingeklappt (Refinement-Verhalten)

#### Sektion 1 — Direkt an der Emotion ansetzen
- [x] Traurig? — Nähe/8-Minuten-Regel/Oxytocin-Dopamin-Serotonin
- [x] Wütend? — Bewegung/Fight-Flight-Freeze
- [x] Überfordert/Gestresst? — Priorisierung 1–3/Delegieren

#### Sektion 2 — Allgemeine Praxis-Übungen
- [x] Journaling — Plus/Minus-Tabelle
- [x] Fragebogen — genau 7 Fragen, korrekte Reihenfolge (Frage 1 und Frage 7 stichprobenartig geprüft)
- [x] Atemübung — 4-6-8-Technik vollständig
- [x] Einkauf planen — Frisches/Haltbares-Kategorien
- [x] Feste Mahlzeiten planen — 20/40/40-Regel
- [x] Screentime planen — Tagesdosis-Hinweis

#### Ein-/Ausklappen & Fortschritt
- [x] Aufklappen eines Punkts lässt andere unberührt (unabhängiges Verhalten, `type="multiple"`)
- [x] "Verstanden" markiert Punkt als erledigt, Fortschrittsbalken aktualisiert sich

#### Gast-Zugriff
- [x] Vollständig lesbar ohne Login (Status < 400)

### Edge Cases Status
- [x] Kein Backend-Aufruf, keine Formulare — keine Netzwerkfehler-Fälle relevant
- [x] Sehr lange Einkaufsliste auf 375px — manuell geprüft, kein horizontales Scrollen (Layout nutzt `grid grid-cols-1` + `space-y`, keine feste Breite)

### Security Audit Results
- [x] Keine Secrets/Env-Variablen im HTML-Response (per `curl` geprüft)
- [x] Kein Auth-Bypass relevant — Seite ist bewusst öffentlich, keine sensiblen Daten
- [x] Keine Eingabefelder, keine API-Calls, kein neuer Angriffsvektor — rein statischer Inhalt

### Bugs Found
Keine.

### Regressionstest
- **Vitest:** 415/415 grün.
- **E2E — neue Datei `tests/PROJ-38-emotionales-essen.spec.ts`:** 17/17 grün.
- **E2E — kombinierter Lauf aller 4 betroffenen Suiten** (PROJ-34 Art of Eating, PROJ-36 Ernährung-Hub, PROJ-37 So geht abnehmen, PROJ-38 Emotionales Essen) nach dem Accordion-Refinement: **59/59 grün.** Bestätigt: die rückwirkende Umstellung von PROJ-34 und PROJ-37 auf die gemeinsame `ArbeitspunkteListe`-Komponente hat keine Regressionen verursacht, inkl. des zuvor gefixten "Kcal-Rechner startet aufgeklappt bei gespeicherten Werten"-Verhaltens.

### Summary
- **Acceptance Criteria:** 16/16 passed
- **Bugs Found:** 0
- **Security:** Pass — keine Angriffsfläche, rein statischer Inhalt
- **Production Ready:** YES
- **Recommendation:** Deploy. Da dieses Refinement auch `art-of-eating-guide.tsx` (PROJ-34) und `so-geht-abnehmen-guide.tsx` (PROJ-37) verändert hat, sollte der Deploy-Schritt beide bereits live befindlichen Features implizit mit aktualisieren (derselbe Produktions-Build) — kein separater Deploy-Zyklus für sie nötig, aber im Deployment-Log erwähnenswert.

## Deployment
_To be added by /deploy_
