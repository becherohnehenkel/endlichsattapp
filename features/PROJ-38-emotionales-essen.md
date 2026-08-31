# PROJ-38: Emotionales Essen

## Status: Planned
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

### 1. Traurig?
> Dir fehlt Nähe. Simon Sinek sagt: 8 Minuten reichen, um sich verstanden zu fühlen. Frag eine Freundin oder einen Freund, ob sie 8 Minuten für dich haben. Ruf an. Tausch dich aus. Lass alles raus. Bist du nicht allein daheim: Frag nach einer Umarmung. Das schüttet Oxytocin, Dopamin und Serotonin aus. Essen löst das zwar auch aus — ist aber mit dem Runterschlucken vorbei. Deswegen die Endlosschleife.

### 2. Wütend?
> Bewegung. Die Wut muss einmal raus. Mach eine Minute Kniebeugen, Liegestütze, Planks — oder geh 10 Minuten um den Block. Wut ist meist ein Kommunikationsproblem bei Meinungsverschiedenheiten, oft von außen angestoßen. Der Körper reagiert mit einem der drei Fs: Fight, Flight oder Freeze. Bei Fight muss die Energie woanders hin — in deinen Körper, mit Bewegung. Flight entgeht der Wut, die kommt wieder. Freeze verlagert sie auf später. Essen ist keine Lösung davon.

### 3. Überfordert / Gestresst?
> Das kennen wir alle. Postfach voll, To-do-Liste quillt über. Nimm dir 5 Minuten und schreib auf, was du alles zu tun hast. Priorisiere von 1–3 (keine 4, keine 0 — nur diese drei). Schreib dahinter, was du alleine machen kannst und bis wann es fertig sein MUSS — nicht sollte. Und dann die Lieblingsspalte: Delegieren. Vielleicht kann dir jemand bei einer Aufgabe helfen oder sie ganz übernehmen. Du musst nicht alles allein machen. Jetzt die Liste sinnvoll abarbeiten — mit einem Snack wird sie nicht kürzer.

### 4. Journaling
> Nimm dir jeden Morgen oder Abend 5 Minuten Zeit für dich. Stell dir einen Timer. Mach eine Tabelle: Spalte 1 mit einem "+", Spalte 2 mit einem "−". Unter "+" schreibst du auf, was du gemacht hast, das dir gefallen hat und du wieder tun möchtest. Unter "−" kommen die Dinge, die du nicht nochmal machen willst.
>
> Es geht darum, sichtbar zu machen, was du alles getan hast. Allein durchs Aufschreiben beschäftigst du dich damit. Beim nächsten Mal, wenn du tust, was dir nicht gefallen hat, flüstert eine leise Stimme: "Moment — das hab ich doch aufgeschrieben." Mit jedem Mal Aufschreiben kannst du diesen Situationen Schritt für Schritt entkommen.

### 5. Fragebogen "Hast du wirklich Hunger?"
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
> **Einatmen:** 4 Sekunden lang tief durch die Nase in den Bauch einatmen.
> **Halten:** Den Atem 6 Sekunden lang anhalten.
> **Ausatmen:** 8 Sekunden lang langsam und vollständig durch den Mund ausatmen.
> **Wiederholen:** 5 bis 10 Minuten lang, bis der Drang nach Essen nachlässt.

### 7. Einkauf planen
> Was du immer zu Hause haben solltest, damit du unfallfrei und schnell kochen kannst. Das ist nur ein Vorschlag — mach ihn zu deinem!
>
> **Frisches**
> - Gemüse (saisonal, z. B. Frühling: Rhabarber, Radieschen, Spargel, Brokkoli … / Sommer: Paprika, Zucchini, Tomate … / Herbst: Kürbis, Mais … / Winter: Wurzelgemüse, Rotkohl, Grünkohl …), plus Pilze, Zitrone/Limette, Karotte, Knollensellerie, Kartoffel, Zwiebel, Knoblauch
> - Obst (saisonal, z. B. Beeren, Kirschen, Äpfel, Trauben, Birnen, Zitrusfrüchte je nach Jahreszeit)
> - Kräuter (Petersilie, Schnittlauch, Basilikum, Rosmarin, Ingwer …)
> - Milchprodukte (Quark, Harzer Käse, Käse, Joghurt, Butter)
> - Weitere Proteinquellen (Tofu, Tempeh, Eier)
> - Gekühltes Haltbares (Sauerkraut, Kimchi, Misopaste, Senf, Currypaste)
>
> **Haltbares**
> - Konserven (Kichererbsen, Bohnen, Mais, Tomatensoße, Tomatenmark)
> - Eingekochtes (Marmelade, Apfelmark)
> - Glasware (Honig, Mandelmus)
> - Getrocknet (Kräutermischungen, Chillies, Zimt)
> - Flaschen (natives Öl, raffiniertes Öl/Schmalz, Essige, Sojasauce)
> - Alles Korn (Hafer-/Dinkel-/Weizenflocken, Müslimix, Vollkornmehl, Brot/Tortillas, Nudeln, Reis)
> - Süßes in Maßen (dunkle Schokolade, Studentenfutter, zuckerfreie Getränke, Proteinriegel)
> - Tiefkühlware (Beeren, Fisch und Fleisch, Erbsen, TK-Gemüsemischung)

### 8. Feste Mahlzeiten planen (ohne Ablenkung)
> Wenn du "immer" isst, hat dein Körper keinen Rhythmus — und der liebt Rhythmus. Deshalb reden wir oft von 3 Mahlzeiten am Tag; ein Snack kann eingebaut werden, aber eigentlich reicht das. Teile deine Kalorien nach der Formel 20/40/40 auf. Beispiel bei 2000 Tageskalorien: Frühstück 400 kcal, Mittag- und Abendessen je 800 kcal.

### 9. Screentime planen
> Das Smartphone hat vieles einfacher und schneller gemacht — das ist verständlich. Aber schau in deinen Einstellungen nach, wie lange du in welcher App verbringst. Meist ist es Social Media. Limitiere diese App auf eine "Tagesdosis" — nicht sofort auf 20 Minuten, sondern einfach weniger als gestern. Reduziere weiter, sobald es sich leicht anfühlt. Viele fremde Gedanken, die im Sekundentakt auf dich einprasseln, beeinflussen nicht nur deine Gedanken, sondern auch dein Verhältnis zum Essen.

## Open Questions
Keine — Copy für Intro und alle 9 Arbeitspunkte final (Quelle: vom Nutzer bereitgestellte PDFs "Emotionales_Essen.pdf" und "AnatomieDesKühlschranksV2.pdf", Fragebogen von 9 auf 7 Fragen gekürzt).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Journaling, Fragebogen, Atemübung und Einkauf planen bleiben reine Text-/Lese-Inhalte ohne Interaktivität oder Speicherung | Ursprüngliche Annahme (interaktive Tools) war zu weit gedacht — Nutzer wollte Methoden erklärt haben, kein digitales Tool; kein Backend nötig | 2026-08-31 |
| Fragebogen von 9 auf 7 Fragen gekürzt (Fragen zu Schlaf+Sport sowie Mahlzeit-Timing zusammengelegt) | Nutzerwunsch nach kürzerer, prägnanterer Fassung | 2026-08-31 |
| 3 emotionsspezifische Punkte (Traurig/Wütend/Überfordert) als eigene, separate Arbeitspunkte statt Unterpunkte eines gemeinsamen Punkts | Jede Emotion verdient einen eigenständigen, direkt anspringbaren Punkt | 2026-08-31 |
| Diese 3 Punkte stehen an erster Stelle und sind optisch von den 6 allgemeinen Praxis-Übungen abgesetzt | Nutzerwunsch — direkter Emotionsbezug soll sich vom eher allgemeinen Rest abheben | 2026-08-31 |
| Kein Trainingsplan-artiger Verweis wie bei PROJ-37 (Krafttraining → /training) nötig | Diese Seite hat keine thematische Überschneidung mit einem anderen Nav-Bereich | 2026-08-31 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
