# Sättigungsmatrix

> Fachliches Fundament für die KI-Analyse. Wird vom `/fachbereich`-Skill gelesen und in den System-Prompt des Analyse-Agenten eingebettet.
>
> **Umstrukturierung "Complete" (2026-08-11):** Eine Mahlzeit ist komplett, wenn drei eigenständige Ebenen zusammenkommen — sie sättigt (dieses Dokument), sie schmeckt (`geschmacks-score-prompt.md`, eigenes künftiges Feature) und sie wird bewusst gegessen (Art of Eating, eigenes künftiges Feature). Die drei Ebenen werden getrennt bewertet, nie zu einer Zahl verrechnet. Dieses Dokument beschreibt nur noch die **Sättigungs-Ebene**: Protein, Ballaststoffe, Volumen. Geschmack, Biss und Art of Eating waren früher Teil der sechs Sättigungs-Bausteine — sie sind jetzt ausgelagert (Details siehe Abschnitt 7).

---

## 1. Sättigungsfaktoren (Makronährstoffe & Ballaststoffe)

| Nährstoff | Sättigungswirkung | Begründung / Mechanismus |
|-----------|-------------------|--------------------------|
| Protein | ⭐⭐⭐⭐⭐ sehr hoch | Langsamste Verdauung aller Makronährstoffe. Stimuliert die Ausschüttung der Sättigungshormone GLP-1 und PYY. Verringert aktiv Heißhunger. Höchste thermische Wirkung (ca. 20–30 % der Kalorien werden für die Verdauung verbraucht). |
| Ballaststoffe | ⭐⭐⭐⭐⭐ sehr hoch | Verlangsamen die Magenentleerung und Verdauung. Binden Wasser und quellen im Darm auf → erhöhen das physische Volumen. Stabilisieren den Blutzucker (kein rascher Abfall = weniger Heißhunger). |
| Fett | ⭐⭐⭐ mittel | Verlangsamt die Magenentleerung. Kalorisch dicht — geringe Menge kann viel Energie liefern, aber Sättigungssignal kommt verzögert. (Geschmacklicher Beitrag von Fett lebt jetzt in `geschmacks-score-prompt.md`.) |
| Komplexe Kohlenhydrate | ⭐⭐⭐ mittel | Werden langsamer abgebaut als einfache Zucker → stabiler Blutzucker, längere Energieversorgung. Oft kombiniert mit Ballaststoffen (Vollkorn, Hülsenfrüchte), was die Sättigungswirkung erhöht. |
| Einfache Zucker | ⭐ niedrig | Schnelle Aufnahme → rascher Blutzuckeranstieg, ebenso rascher Abfall. Kein nachhaltiges Sättigungssignal. Triggern oft Appetit auf mehr statt weniger. |
| Wasser / Volumen | ⭐⭐⭐⭐ hoch | Magenrezeptoren registrieren physische Dehnung — unabhängig vom Kaloriengehalt. Lebensmittel mit hohem Wasseranteil (Gemüse, bestimmte Früchte) erzeugen Fülle bei geringer Energiedichte. Sättigungssignal kommt ca. 20 Min. nach dem Essen. |

---

## 2. Schritt 0: Mahlzeit, Komponente oder Snack?

Nicht jedes Foto zeigt eine vollständige Mahlzeit — und nicht jedes Gericht hat den Anspruch, eine zu sein. Unterscheide VOR der Sättigungs-Analyse drei Typen:

- **`mahlzeit`** — will satt machen und wird an den drei Säulen (Abschnitt 3) gemessen.
- **`komponente`** — Teil einer Mahlzeit (Beilagensalat, Vorsuppe, einzelne Beilage), wird ergänzt gedacht. **Löst den bisherigen "Beilagen-Kontext" (PROJ-16) ab** — siehe Abschnitt 4 für das neue Output-Format.
- **`snack`** — steht bewusst für sich: der kleine Hunger zwischendurch, der gar nicht lange sättigen soll, ODER ein reiner Genussmoment (Stück Kuchen, Apfel, Eis). Ein Snack hat NIE den Anspruch, komplett zu sein — und wird deshalb auch nicht daran gemessen. **Neue Kategorie, gab es bisher nicht.**

**Wichtigste Regel: Nutzerangabe schlägt Heuristik.** Sagt der Nutzer (per Auswahl im UI oder im Text), was es ist, gilt das ohne Rückfrage und ohne Diskussion.

Ohne Nutzerangabe automatisch klassifizieren (keine Rückfrage im Regelfall — Verhaltensänderung gegenüber dem bisherigen Beilagen-Kontext, der immer aktiv nachfragte):
- `snack` vermuten bei typischen Snack-Formaten: einzelnes Obst, Gebäck/Süßes, Riegel, Handvoll Nüsse, Eis — oder unter ~250 kcal ohne erkennbaren Mahlzeits-Aufbau (kein Teller mit mehreren Komponenten).
- `komponente` vermuten, wenn es wie ein Teil eines Gerichts aussieht: Beilagensalat, Vorsuppe, eine einzelne Sättigungsbeilage.
- Bei Unklarheit (kcal zwischen 250 und 400, Zusammensetzung uneindeutig): nicht raten, sondern als einzige Rückfrage stellen: "Ist das eine Mahlzeit, ein Teil davon oder ein Snack?"

**Output-Feld `typ: "mahlzeit" | "komponente" | "snack"` immer mit ausgeben.**

---

## 3. Die drei Säulen der Sättigung

Gilt nur für `typ: mahlzeit`. Jede Mahlzeit wird anhand von drei Säulen bewertet — Protein, Ballaststoffe, Volumen. Alle Intervalle sind halboffen: Untergrenze eingeschlossen, Obergrenze ausgeschlossen. Nicht vor der Einstufung runden.

### a) Protein (pro Mahlzeit)

| Wert | Stufe |
|---|---|
| unter 10 g | ungenügend |
| 10 bis unter 20 g | gering |
| 20 bis unter 30 g | mittel |
| ab 30 g | gut |

Verbesserungsvorschlag: Nenne immer die Lücke in Gramm UND eine konkrete Quelle, die zum Gericht passt ("Es fehlen ~12 g — 150 g Skyr dazu oder die Portion Linsen verdoppeln."). Schlage bevorzugt vor, eine bereits vorhandene Proteinquelle zu vergrößern, bevor du eine neue Zutat einführst.

### b) Ballaststoffe (pro Mahlzeit)

| Wert | Stufe |
|---|---|
| unter 3 g | ungenügend |
| 3 bis unter 5 g | gering |
| 5 bis unter 10 g | mittel |
| ab 10 g | gut |

Verbesserungsvorschlag: gleiche Logik wie Protein — Lücke in Gramm plus passende Quelle (Hülsenfrüchte, Vollkorn-Variante des vorhandenen Carbs, Gemüse aufstocken, Leinsamen/Kerne als Topping).

### c) Volumen / Energiedichte

Ersetzt jede Fallunterscheidung nach Gerichtstyp. Berechne zwei Zahlen aus der Zutatenliste:

**1. Energiedichte der Gesamtmahlzeit** = Gesamt-kcal ÷ Gesamt-Gramm (essbare Menge, zubereitet, inkl. Saucen und Öl):

| kcal/g | Stufe |
|---|---|
| unter 1,0 | gut |
| 1,0 bis unter 1,5 | mittel |
| 1,5 bis unter 2,25 | gering |
| ab 2,25 | ungenügend |

**2. Gemüsemenge absolut** (Gemüse + Salat + Pilze; Kartoffeln, Mais und Hülsenfrüchte zählen hier NICHT als Gemüse — Hülsenfrüchte punkten bereits bei Protein und Ballaststoffen):

| Menge | Stufe |
|---|---|
| unter 100 g | ungenügend |
| 100 bis unter 200 g | mittel |
| ab 200 g | gut |

**Gesamtstufe für c):** die schlechtere der beiden Teilstufen. (Ein Gericht mit 250 g Gemüse, aber in Öl ertränkt, ist nicht "gut". Ein kalorienarmes Gericht ohne Gemüse auch nicht.)

Verbesserungsvorschlag: Benenne den Hebel, der die Gesamtstufe drückt.
- Energiedichte zu hoch → volumenreiche Komponente ERGÄNZEN (Gemüse, Salat, Suppe vorweg), nicht kalorische Komponenten streichen. Additiv formulieren.
- Gemüse zu wenig → konkrete Menge und Sorte, die geschmacklich zum Gericht passt ("200 g Brokkoli mit in die Pfanne").

**Niedrige Energiedichte (ideal für Volumen):** Gurke, Zucchini, Blattsalate, Radieschen, Staudensellerie, Kohlgemüse (Blumenkohl, Spitzkohl, Weißkohl, Rotkohl, Wirsing, Chinakohl, Grünkohl, Rosenkohl), Sauerkraut, Spinat, Wassermelone, Beeren, Papaya, Grapefruit.

**Ausgeschlossen vom Volumen-Baustein (zählen NICHT):**
- Kleine Aromaten wie Knoblauch, Zwiebel (als Menge), Schalotte, Ingwer, Chili — viel zu wenig in realistischen Mengen um Magendehnung auszulösen
- Konzentrate und Pasten (Tomatenmark, Ajvar) — hochkonzentriert, kein Volumeneffekt
- Getrocknete oder gepulverte Formen von Lebensmitteln
- Regel: Eine Zutat zählt nur als Volumen-Baustein, wenn sie in einer Menge verwendet wird die den Magen mechanisch füllen kann (typisch: ≥50g wasserhaltiges Lebensmittel)

### Unsicherheits-Regeln

- Gramm-Schätzungen aus dem Foto sind unsicher. Liegt ein Wert weniger als 10 % unter einer Stufengrenze, stufe die BESSERE Stufe ein und formuliere den Vorschlag als Absicherung ("Da bist du knapp dran — eine Handvoll mehr und es passt sicher.").
- Nicht sichtbare kalorische Zutaten (Öl in der Pfanne, Sahne in der Sauce): nimm bei gebratenen Gerichten 10 g Öl als Standard an, außer die Analyse sagt explizit etwas anderes.

### Roh-/Gekocht-Gewichtskonsistenz bei Getreide, Hülsenfrüchten & Pasta

Getreide, Reis, Pseudogetreide (Quinoa, Bulgur, Couscous), Hülsenfrüchte und Pasta nehmen beim Garen Wasser auf und werden 2- bis 3-mal schwerer. Wird die geschätzte Grammzahl versehentlich dem falschen Garzustand zugeordnet (z.B. rohes Gewicht mit gegarten Nährwerten verrechnet, oder umgekehrt), ist das Kalorienergebnis um den Faktor 2–3 falsch — ein Risiko, das bei Rezeptangaben in Tassen/Bechern (roh/trocken) besonders hoch ist.

**Regel:** Die für die Nährwertberechnung verwendete Grammzahl repräsentiert IMMER den gegarten/verzehrfertigen Zustand — das ist näher an der tatsächlich verzehrten Menge und an dem, was Nährwertdatenbanken (BLS) am häufigsten als Eintrag führen.

Liegt die Rezept- oder Nutzerangabe in rohem/trockenem Gewicht vor (z.B. "1 Tasse roher Quinoa", "80g Reis, ungekocht"), muss zuerst auf das gegarte Gewicht umgerechnet werden:

| Lebensmittel | Faktor roh → gekocht |
|---|---|
| Reis | ×2,5–3 |
| Quinoa | ×2,8–3 |
| Linsen, Kichererbsen, Bohnen (trocken) | ×2,5 |
| Pasta | ×2,2–2,5 |
| Couscous, Bulgur | ×2–2,2 |

Die Bezeichnung der Zutat (inkl. ggf. "(gekocht)"/"(roh)"-Zusatz) muss exakt zum tatsächlichen Garzustand der verwendeten Grammzahl passen — niemals "(gekocht)" labeln, während noch mit dem rohen Gewicht gerechnet wird (oder umgekehrt). Die Umrechnung muss explizit in den Annahmen genannt werden, z.B.: *"1 Tasse roher Quinoa (~75g trocken) entspricht nach dem Kochen ca. 210g (Faktor ×2,8) — Nährwerte basieren auf gegartem Zustand."*

### Hochenergiedichte + voluminenarme Gerichte (Fastfood-Erkennung)

Manche Gerichte sind nicht einfach "energiedicht" (siehe oben), sondern strukturell so aufgebaut, dass eine normale Erwachsenenportion bereits weit über das hinausgeht, was für echte Sättigung nötig wäre — bei gleichzeitig kaum vorhandenem Eigenvolumen durch Gemüse oder Ballaststoffe. Hier hilft "noch mehr ergänzen" nicht, weil es die ohnehin schon hohe Kalorienmenge nur weiter erhöht (siehe Heuristik in Abschnitt 5).

**Erkennungskriterien (alle relevant, kein hartes Einzelmaß):**
- Stark verarbeitet / Fastfood-Charakter (Lieferdienst, Imbiss, Fertigprodukt, frittiert/paniert)
- Hoher Fett- und/oder Käseanteil als Hauptcharakteristikum des Gerichts
- Kaum Eigenvolumen durch Gemüse/Ballaststoffe (kein Salat, keine Gemüsebeilage von Haus aus enthalten)
- **Entscheidend:** Die tatsächlich gegessene Menge entspricht einer vollwertigen Erwachsenenportion und liegt bei **ca. 600–700 kcal oder mehr** in einer Sitzung

**Typische Beispiele:** Pizza, Burger, Currywurst mit Pommes, Chicken/Dino-Nuggets (Erwachsenenportion), Pommes frites, fettreicher Döner.

**Wichtige Abgrenzung:** Die Kriterien greifen NICHT bei Kinderportionen, Snacks oder Mahlzeiten, die für sich genommen schon unter dem normalen Energiebedarf liegen — selbst wenn es sich um dieselbe Art von Gericht handelt (z.B. ein Dino-Nuggets-Kinderteller, von einem Erwachsenen gegessen, liefert oft zu WENIG statt zu viel Energie für eine vollwertige Mahlzeit). In diesem Fall bleibt die normale Additions-Logik aktiv.

### Mahlzeitenfrequenz & Blutzuckerstabilität
Unregelmäßiges Essen führt zu Blutzucker-Achterbahn, Energie-Crashs und erhöhter Heißhungeranfälligkeit. Empfehlung: 2–4 vollwertige Mahlzeiten pro Tag, die den Blutzucker in einem stabilen Normalbereich halten. Dies ist kein Naturgesetz — individuelle Anpassung nach Alltag, Arbeit und sozialer Kompatibilität hat Vorrang.

---

## 4. Gesamtbewertung & Output

### Gesamtbewertung (Mehrheitsprinzip)

| Anzahl "gut"-Säulen (von 3) | Gesamtbewertung |
|-----------------------------|------------------|
| 3 | Sehr sättigend |
| 2 | Mäßig sättigend |
| 0–1 | Wenig sättigend |

- Pro Säule: Stufe + der eine Wert, der sie bestimmt.
- Maximal 2 Verbesserungsvorschläge insgesamt, priorisiert nach schlechtester Stufe. Bei zwei gleich schlechten Säulen: Protein vor Ballaststoffen vor Volumen.
- Alles additiv formuliert (was DAZU kann), nie restriktiv, das Wort "gesund" kommt nicht vor.
- Alle drei Säulen "gut" → kein Vorschlag, nur benennen, was das Gericht sättigend macht.

### Output bei `typ: komponente` (löst den bisherigen Beilagen-Kontext ab)

Keine Stufen-Bewertung, kein Sättigungs-Score — eine Komponente wird nicht an einem Anspruch gemessen, den sie nie hatte.

- **Positiv bilanzieren, was sie beisteuert** — quantitativ, nicht nur ein wertschätzender Satz: *"Bringt schon mal 180 g Gemüse und 4 g Ballaststoffe mit."*
- **Maximal EIN Kombinationsvorschlag**, womit die Komponente zu einer kompletten Mahlzeit wird: *"Dazu ein Stück Brot und ein paar Kichererbsen rein, dann trägt dich das bis zum Abend."* (Reduziert gegenüber dem bisherigen Beilagen-Output mit 2–3 Pairing-Empfehlungen.)
- Der Geschmacks-Score läuft normal weiter — auch eine Komponente darf lecker sein (neu: gab es im alten Beilagen-Output nicht).
- Kein `art_of_eating_tipp` mehr in diesem Output — Art of Eating ist eine eigene Sektion, kein Anhängsel mehr.

### Output bei `typ: snack`

Keine Sättigungs-Analyse, kein Geschmacks-Score, keine Verbesserungs- oder Kombinationsvorschläge. Ein Stück Kuchen wird nicht optimiert und ein Apfel nicht aufgewertet.

- Kurz und neutral-warm bestätigen, ohne Rechtfertigungs-Framing: *"Alles klar, Snack — der braucht keine Analyse."* KEIN Kommentar zu Kalorien, KEIN "Ausnahme"- oder "Sünde"-Vokabular, KEINE Kompensations-Tipps ("dafür beim Abendessen...").
- Der Snack wird ganz normal geloggt: Im Wochenrückblick erscheint er als eigene Kategorie und zählt NICHT in die Komplett-Quote der Mahlzeiten — weder positiv noch negativ. Snacks sind Teil eines kompletten Essalltags, nicht sein Störfaktor.

---

## 5. Verbesserungs-Heuristiken & Restaurant-Kontext

> **Scope-Hinweis (2026-08-11):** Die folgenden Abschnitte (Verbesserungs-Heuristiken, Multi-Pillar-Zutaten, Tauschprinzip, Machbarkeitsfilter, Lob-Protokoll, Restaurant-Kontext) sind bewusst **noch nicht** auf das neue Drei-Säulen-Modell umgeschrieben — sie referenzieren weiterhin das alte 6-Bausteine-Modell (Geschmack, Biss, Ballaststoffe, Proteine, Volumen, Art of Eating). Sie werden überarbeitet, sobald die Geschmack- und Art-of-Eating-Features als eigene Specs existieren, um Doppelarbeit zu vermeiden. Bis dahin gilt für die reine Sättigungs-Bewertung (Protein/Ballaststoffe/Volumen) die Prioritätsregel aus Abschnitt 4 ("Protein vor Ballaststoffen vor Volumen"), nicht die Reihenfolge unten.

### Erlaubte Optimierungen

**Prinzip:** Verbesserungen müssen geschmacklich sinnvoll sein und den Charakter des Gerichts erhalten. Minimal effort, maximaler Effekt.

| Ziel | Erlaubte Maßnahmen |
|------|-------------------|
| Mehr Biss | Nüsse oder Samen obendrauf, rohes Gemüse als Beilage, Zutaten kross anbraten statt kochen, Beilagensalat als Vorspeise, Klare Suppe vorneweg |
| Mehr Ballaststoffe | Hülsenfrüchte einarbeiten (Linsen in Sauce, Kichererbsen zum Salat, Bohnen als Mus, Quinoa gekocht), Gemüse erhöhen, Obst hinzufügen |
| Mehr Proteine | Eiweißreiche Quelle ergänzen die zum Gericht passt (Fleisch, Fisch, Ei, Quark, Hüttenkäse, Skyr, Hülsenfrüchte, Tofu) |
| Mehr Volumen | Gemüseanteil erhöhen, Flüssigkeitsanteil erhöhen (mehr Hafermilch, mehr Brühe), Beeren hinzufügen |
| Mehr Geschmack | Gewürze, frische Kräuter, Röststoffe durch Anbraten, Säure (Zitrone, Essig), Umami (Parmesan, Miso, Tomatenmark) |

### Verbotene Optimierungen

- **Keine Flohsamenschalen in herzhafte Gerichte** — geschmacklich unpassend, wirkt wie ein Ernährungs-Hack statt echtes Essen
- **Keine Light-Produkte** — reduzierter Fettgehalt bedeutet oft mehr Zucker oder Zusatzstoffe, und weniger Geschmackszufriedenheit
- **Keine Mahlzeiten-Ersatz-Produkte** (Shakes, Riegel als "Lösung")
- **Keine Supplemente als Primärempfehlung** — nur wenn ein isolierter, spezifischer Mangel besteht
- **Kein Weglassen von Zutaten die der Nutzer offensichtlich mag** — Sättigung entsteht auch durch Freude am Essen
- **Keine Empfehlung weniger zu essen** — das Ziel ist besser essen, nicht weniger. Einzige Ausnahme: Portionskalibrierung bei hochenergiedichtem, voluminenarmem Fastfood (siehe eigener Abschnitt unten) — eng begrenzt, nie als generelle Regel zu verstehen.

### Abwägung Nährwert vs. Geschmack

Geschmack hat immer Vorrang. Ein sättigendes Gericht das nicht schmeckt, wird nicht wiederholt — und löst damit kein Problem. Die Optimierung muss so gestaltet sein, dass das Gericht *besser* schmeckt oder zumindest gleich gut.

### Prioritätsreihenfolge bei mehreren schwachen Bausteinen (altes Modell — siehe Scope-Hinweis oben)

0. **Portionskalibrierung** — NUR wenn die Erkennungskriterien für "hochenergiedicht + voluminenarm" erfüllt sind (siehe Abschnitt 3). In diesem Fall VOR allen anderen Prioritäten.
1. **Biss** — größte Wirkung auf das wahrgenommene Sättigungsgefühl
2. **Ballaststoffe** — größte Wirkung auf die Sättigungsdauer
3. **Volumen** — einfachste Verbesserung mit geringstem Kalorienaufwand
4. **Geschmack** — nur wenn das Gericht nachweislich wenig Komplexität hat
5. **Proteine** — Ergänzung vorschlagen, nicht ersetzen
6. **Art of Eating** — immer erwähnen wenn andere Bausteine bereits stark sind

---

### Portionskalibrierung bei hochenergiedichtem Fastfood (Ausnahme von "keine Iss-weniger-Empfehlung")

**Trigger:** Die Erkennungskriterien für "hochenergiedicht + voluminenarm" sind erfüllt (siehe Abschnitt 3) — insbesondere: Erwachsenenportion, ≥ ca. 600–700 kcal, kaum Eigenvolumen.

Bei reinen Additions-Vorschlägen (mehr Ballaststoffe/Biss/Volumen ergänzen) wird ein bereits sehr kalorienreiches Gericht kalorisch noch größer, statt besser balanciert zu werden. Für diesen engen Fall gilt eine bewusste Ausnahme von "keine Empfehlung weniger zu essen":

1. **Vor** allen Additions-Vorschlägen: Portionskalibrierung vorschlagen — z.B. "2/3" oder "die Hälfte", je nach Energiedichte des Gerichts.
2. **Framing — niemals als Verzicht:** Kommuniziert wird eine Kalibrierung auf echte Sättigung, nicht eine Diät-Maßnahme. Gleiche Logik wie Hara Hachi Bu und die bestehende "Teilen"-Strategie im Restaurant-Kontext. Formulierungsvorbild: *"Bei diesem Energiegehalt reicht oft schon 2/3 für echte Sättigung — der Rest ist meist Gewohnheit, nicht Hunger."*
3. **Immer mit einer Volumen-/Ballaststoff-Ergänzung kombinieren, wenn realistisch verfügbar** (z.B. Tütensalat + Dressing zur Lieferpizza) — damit die Gesamtkalorien gleich bleiben oder sinken, aber die Sättigung pro Kalorie steigt.
4. **Wenn keine Ergänzung realistisch verfügbar ist** (z.B. Imbiss, Lieferdienst ohne Alternative): Portionskalibrierung allein reicht aus. Wie im Restaurant-Kontext darf optional auf die nächste Mahlzeit verwiesen werden.
5. **Eng gefasste Ausnahme:** Diese Regel gilt NUR bei erfüllten Erkennungskriterien. Für alle anderen Gerichte — auch kalorienreiche, wenn sie nicht voluminenarm sind, oder kleine/Kinderportionen — bleibt "keine Iss-weniger-Empfehlung" unverändert in Kraft.

---

### Nüsse, Samen und Kerne sind Multi-Pillar-Zutaten

Körner, Samen und Nüsse (z.B. Sonnenblumenkerne, Kürbiskerne, Sesam, Walnüsse, Mandeln) dürfen **niemals nur dem Biss-Baustein zugeordnet werden**. Sie liefern gleichzeitig:

- **Biss** — echter Kauaufwand, mechanischer Sättigungsreiz
- **Fett** — trägt zur verzögerten Magenentleerung bei und ist Hauptgeschmacksträger (Aromen, Mundgefühl)
- **Ballaststoffe** — je nach Menge relevant
- **Sensorische Zufriedenheit** — das Fett macht den entscheidenden Unterschied zwischen "satt" und "wirklich zufrieden"

**Konsequenz für die Analyse:** Wenn Kerne/Samen in einer Mahlzeit enthalten sind, wird der Fett-Beitrag im Baustein **Geschmack** und in der Gesamtbewertung mitgezählt — nicht nur als Biss-Upgrade. In der Kommunikation mit dem Nutzer beide Wirkungen benennen: *"Die Körner geben nicht nur Biss, sondern liefern auch die Fette die das Gericht wirklich sättigend machen."*

---

### Tauschprinzip: Kalorienneutrale Verbesserung

Wenn eine Verbesserung kalorienreiche Zutaten ergänzt (Kerne, Nüsse, Eier, Käse, Proteinbeilagen), soll **gleichzeitig eine weniger sättigungsrelevante Kalorienquelle reduziert werden** — damit die Gesamtkalorien ähnlich bleiben. Typische Tauschkandidaten:

| Ergänzung | Reduktion |
|-----------|-----------|
| Kerne/Samen (ca. 20–30g) | Dressing oder Öl um ca. 1 EL reduzieren |
| Ei oder Proteinbeilage | Dressing-Menge halbieren |
| Nüsse | Sauce oder Dressing reduzieren |
| Käse | Croutons oder Brot weglassen |

**Ziel:** Gleiche oder ähnliche Gesamtkalorien, aber höherer Sättigungsindex durch bessere Nährstoffstruktur. Das Tauschprinzip dem Nutzer transparent kommunizieren: *"Damit du trotz der Extras bei ähnlichen Kalorien bleibst, würde ich das Dressing um einen Esslöffel reduzieren."*

---

### Verbesserungsvorschläge müssen konkret und berechenbar sein

Jeder Vorschlag muss folgendes enthalten — vage Alternativen reichen nicht:

- **Eine spezifische Zutat** (nicht "Ei oder Thunfisch") — immer die eine konkrete Wahl nennen, die für die Berechnung verwendet wurde
- **Eine konkrete Grammangabe** (z.B. "1 hartgekochtes Ei, ca. 60g")
- **Das resultierende Nährwertdelta** (kcal, Protein, Fett, Ballaststoffe) so dass der Nutzer versteht was sich wirklich verändert

**Beispiel korrekt:** *"1 hartgekochtes Ei (ca. 60g) on top → +8g Protein, +5g Fett, +78 kcal"*

**Beispiel falsch:** *"Proteinbeilage wie Ei oder Thunfisch hinzufügen"* — unklar welches, welche Menge, welcher Effekt.

---

### Lob-Protokoll: Wenn eine Mahlzeit bereits sehr gut ist

**Trigger:** 5 oder 6 Bausteine sind grün bewertet (altes Modell — bei drei Säulen entspricht das analog "alle drei Säulen gut", siehe Abschnitt 4).

In diesem Fall gelten besondere Regeln:

1. **Keine erfundenen Schwächen.** Es ist nicht nötig, Verbesserungsvorschläge zu formulieren nur um etwas zu sagen. Wer gut kocht, soll das hören — ohne "aber".

2. **Echte Anerkennung führt.** Die Eröffnung der Antwort soll aufrichtig positiv sein, ohne herablassend oder übertrieben zu wirken. Beispiel: *"Das ist eine wirklich gut strukturierte Mahlzeit — du hast intuitiv fast alle Sättigungsprinzipien umgesetzt."*

3. **Maximal ein optionaler Feinschliff.** Falls es einen Baustein gibt der noch fehlt oder sehr schwach ist, kann dieser leicht erwähnt werden — aber als optionales Extra, nicht als Mangel. Formulierung: *"Falls du noch einen kleinen Schritt machen willst: …"*

4. **Rezeptbibliothek-Verweis ist automatisch, nicht Teil der LLM-Antwort.** Die Ergebnisseite zeigt unter jeder Analyse — unabhängig von der Gesamtbewertung — deterministisch ein passendes Rezept (Zutaten-Tag-Matching) oder, falls keins passt, einen Hinweis mit Link zur Rezeptbibliothek (`RezeptVorschlaege`-Komponente). Der LLM-Prompt muss dafür nichts setzen und keinen Text dazu formulieren.

5. **Keine Liste von Verbesserungsvorschlägen** — diese Sektion bleibt leer oder enthält höchstens einen einzigen optionalen Hinweis.

---

### Machbarkeitsfilter: Was ist ein realistischer Verbesserungsvorschlag?

Jeder Vorschlag muss diesen Filter bestehen, bevor er ausgegeben wird:

**Kriterium 1 — Kein zusätzlicher Einkauf nötig**
Der Vorschlag soll aus Kühlschrank- oder Vorratszutaten bestehen. Was ein durchschnittlicher Haushalt immer da hat: Eier, Naturjoghurt, Quark, Nüsse, Samen, Hülsenfrüchte aus der Dose, Haferflocken, Frischkäse, geriebener Käse, Zitrone, Kräuter, Gewürze, Olivenöl.

**Kriterium 2 — Kein wesentlicher Mehraufwand**
Der Vorschlag darf nicht mehr Kochaufwand bedeuten als das ursprüngliche Gericht selbst. Beispiele:
- Ei hartkochen (5 Min.) → ✓ bei Salat
- Hähnchenbrust anbraten (20 Min.) → ✓ wenn das Gericht sowieso warm gekocht wurde
- Ein Steak zubereiten → ✗ wenn das Ausgangsgericht ein schneller Salat war

**Kriterium 3 — Geschmackliche Kompatibilität**
Der Vorschlag muss zum Geschmacksprofil des Gerichts passen. Orientierung nach Gerichtstyp:

| Gerichtstyp | Sinnvolle Protein-Ergänzung | Nicht passend |
|-------------|----------------------------|----------------|
| Salat | Ei, Thunfisch, Hühnchen, Feta, Kichererbsen, Lachs | Quark pur, Proteinshake |
| Pasta / Risotto | Thunfisch, Hackfleisch, Ricotta, Mozzarella, Hülsenfrüchte, Meeresfrüchte, Fisch | Hartgekochtes Ei obendrauf |
| Suppe / Eintopf | Linsen einrühren, Tofu würfeln, Ei verquirlen, Joghurt obendrauf | Käse (außer bei passenden Varianten) |
| Curry / asiatisch | Hühnchen, Tofu, Kichererbsen, Tempeh | Feta, europäische Milchprodukte |
| Frühstück | Ei, Joghurt, Quark, Nüsse, Samen | Fleisch (außer explizit gewünscht) |
| Fleischgericht als Hauptzutat | Kein Protein-Upgrade nötig — andere Bausteine prüfen | Weiteres Protein |
| Sandwich / Wrap | Quark als Aufstrich, Ei, Hüttenkäse, Skyr, Thunfisch, Dosenbohnen, Dosenkichererbsen | Rohe Hülsenfrüchte |

**Konsequenz:** Wenn kein Vorschlag den Filter besteht, lieber keinen machen als einen unpassenden. Qualität vor Quantität.

**Absolut verboten — unabhängig vom Gerichtstyp:**
- Proteinshakes oder Proteinpulver als Lösung ("einfach einen Shake dazutrinken")
- Nahrungsergänzungsmittel als primäre Empfehlung
- "Kauf dir eine Proteinquelle" — das ist keine Mahlzeitenoptimierung

---

## 6. Restaurant-Kontext

### Grundprinzip: Strategie statt Zutaten

Im Restaurant gelten andere Regeln als zu Hause. Der Nutzer kann die Zutaten nicht kontrollieren — er kann nur beeinflussen:
1. **Was er bestellt** (und in welcher Reihenfolge)
2. **Wie viel er davon isst** (Portion, Teilen)
3. **Wie er isst** (Art of Eating — im Restaurant besonders relevant)

**Konsequenz für Verbesserungsvorschläge:**
- Keine Vorschläge wie "Kichererbsen dazugeben" oder "mit Vollkornbeilage" — das kann man nicht bestellen
- Stattdessen: Bestell- und Verhaltensstrategien die mit dem vorhandenen Angebot funktionieren
- Vorschläge müssen realistisch umsetzbar sein ohne die Situation zu verkomplizieren

---

### Strategie 1: Vorspeisensalat als Puffer

**Wann sinnvoll:** Wenn die Hauptspeise kalorisch dicht und schwer ist (Schnitzel, Pasta, Pizza, Burger) und der Hunger groß ist.

**Mechanismus:** Ein gemischter Salat als Vorspeise liefert Ballaststoffe und Volumen bevor das Hauptgericht kommt. Die Magenrezeptoren registrieren erste Füllung, Sättigungshormone beginnen anzusteigen. Ergebnis: Man isst beim Hauptgericht automatisch etwas weniger — ohne Verzicht, ohne Hunger.

**Wichtig:** Das ist kein Trick um "weniger zu essen", sondern ein Weg um Nährstoffe zu priorisieren. Wer danach noch hungrig ist, isst das Hauptgericht weiter. Wer satt ist, hört früher auf — ganz natürlich.

**Funktioniert besonders gut vor:**
- Schnitzel, Braten, Fleischgerichte (wenig Volumen, viel Energie)
- Pasta, Risotto (wenig Volumen, viele Kohlenhydrate)
- Pizza (je nach Größe und Belag)
- Burger (kalorisch dicht, wenig Volumen)

**Funktioniert weniger gut vor:**
- Gerichten die selbst schon viel Volumen haben (z.B. großer Fischfilet-Salat als Hauptgericht)
- Kleinen, leichten Hauptgerichten wo kein Überschuss erwartet wird

---

### Strategie 2: Teilen

**Wann sinnvoll:** Bei sehr großen oder kalorisch dichten Portionen in einer Gruppe.

**Mechanismus:** Durch Teilen reduziert man die Portion auf ein sättigungsgerechtes Maß. Das funktioniert aber nur wenn man ehrlich einschätzt ob die halbe Portion ausreicht — nicht als Diät-Maßnahme, sondern als vernünftige Einschätzung.

**Pizza-Beispiel:**
Eine üppig belegte Pizza (viel Käse, Olivenöl, reichhaltige Beläge) enthält durch Fett und Geschmack bereits gute Sättigungspotenziale. Je nach Größe und eigenem Hunger kann das in drei Varianten enden:
- **Ganze Pizza alleine, bewusst gegessen** → kann sehr sättigend sein wenn die Sättigungssignale beachtet werden
- **Halbe Pizza + Salat teilen** → bessere Nährstoffbalance, wahrscheinlich ähnliche Sättigung
- **Ganze Pizza + kein Salat, schnell gegessen** → weniger sättigend trotz mehr Kalorien (Art of Eating fehlt)

**Konsequenz:** Beim Teilen ist Art of Eating besonders wichtig — wer die halbe Portion schnell und abgelenkt isst, profitiert nicht vom Teilen.

---

### Strategie 3: Art of Eating im Restaurant ist besonders kritisch

Das Restaurant ist die höchste Risikostufe für schlechtes Art of Eating: Gespräche, Ablenkung, sozialem Druck schnell zu essen oder das Gleiche zu bestellen wie andere.

**Restaurant-spezifische Empfehlungen:**
- Zwischen den Bissen die Gabel ablegen — das ist der wichtigste Hebel
- Kurze Pause in der Mitte des Hauptgerichts: *"Bin ich noch hungrig, oder esse ich aus Gewohnheit weiter?"*
- Teller darf stehen bleiben — eine Restaurantportion ist selten auf den eigenen Hunger kalibriert
- Smartphone weglegen (bei Gesellschaft sowieso, aber auch beim Allein-Essen)

**Sättigungseffekt:** Langsames Essen im Restaurant kann den Unterschied machen ob eine "üppige" Mahlzeit sättigend wirkt oder nicht — unabhängig von den Zutaten.

---

### Erkennungsmuster: Wann ist eine Mahlzeit ein Restaurantbesuch?

Der Assistent erkennt einen Restaurant-Kontext an:
- Gerichten die man typischerweise nicht zu Hause kocht (Schnitzel mit Pommes, Pasta al forno, Sushi, etc.)
- Beschreibungen wie "im Restaurant", "wir waren essen", "bestellt", "Speisekarte"
- Sehr uniformen Portionen ohne individuelle Mengenangaben
- Fehlenden Angaben zu Zubereitungsweise (weil man es nicht weiß)

**Im Restaurant-Kontext gilt:** Vorschläge zur nächsten Mahlzeit ("Morgen beim Mittagessen könntest du...") sind erlaubt — nicht alle Optimierungen müssen beim aktuellen Gericht passieren.

---

## 7. Ausgelagert: Geschmack, Biss & Art of Eating

Vor der "Complete"-Umstrukturierung (2026-08-11) waren Geschmack, Biss und Art of Eating drei der sechs Bausteine dieser Matrix. Sie sind jetzt eigenständige Ebenen, nicht mehr Teil der Sättigungs-Bewertung:

- **Geschmack** (inkl. Biss als Kontrast-Dimension) → `docs/geschmacks-score-prompt.md`, eigenes künftiges Feature mit eigenem Score (0–100) und eigener Sektion auf der Ergebnisseite.
- **Art of Eating** → eigenes künftiges Feature. Laut Konzept-Dokument "Selbstauskunft" — der Nutzer beantwortet aktiv etwas, statt dass die KI es aus dem Foto schätzt. Die fachlichen Kernprinzipien (Sitzen, Ablenkungsfrei, Riechen, Kauen, Hara Hachi Bu) aus der bisherigen Fassung dieses Dokuments bleiben als Grundlage gültig und wandern beim `/write-spec` für dieses Feature dorthin.

Die Abschnitte 5 und 6 oben (Verbesserungs-Heuristiken, Restaurant-Kontext) referenzieren beide Ebenen weiterhin unverändert im alten 6-Bausteine-Modell — siehe Scope-Hinweis am Anfang von Abschnitt 5.

---

## 8. Quellen & Referenzen

### Physiologische Sättigungsmechanismen
- **GLP-1 (Glucagon-like Peptide-1)** und **PYY (Peptid YY)**: Sättigungshormone die primär durch Proteinzufuhr stimuliert werden. Signalisieren dem Hypothalamus Sättigung.
- **Ghrelinunterdrückung**: Ghrelin ist das primäre Hungerhormon. Proteine und Ballaststoffe unterdrücken die Ghrelin-Ausschüttung stärker als Fett oder einfache Kohlenhydrate.
- **Magenrezeptoren**: Mechanorezeptoren in der Magenwand reagieren auf Dehnung — unabhängig vom Kaloriengehalt. Grundlage für den Volumen-Baustein.
- **Thermischer Effekt**: Protein hat mit ca. 20–30 % den höchsten thermischen Effekt aller Makronährstoffe (Kohlenhydrate ca. 5–10 %, Fett ca. 0–3 %).

### Kauforschung (Grundlage für `geschmacks-score-prompt.md`, nicht mehr Teil dieser Matrix)
- Mechanisches Kauen aktiviert den Kiefer-Hypothalamus-Signalweg und erhöht die Sättigungswahrnehmung unabhängig vom Nahrungsinhalt.
- Langsames Essen (>20 Minuten) korreliert mit niedrigerer Gesamtkalorienaufnahme, da die Sättigungshormone Zeit brauchen um die Blut-Hirn-Schranke zu passieren.

### Geruch & Geschmack (Grundlage für `geschmacks-score-prompt.md`, nicht mehr Teil dieser Matrix)
- Bis zu 80 % des bewusst wahrgenommenen Geschmacks entsteht über den Geruchssinn (retronasal). Essen mit verstopfter Nase schmeckt kaum — Erdbeer- und Himbeermarmelade sind bei verschlossener Nase kaum zu unterscheiden.

### Blutzucker & Mahlzeitenfrequenz
- Unregelmäßiges Essen mit langen Fastenphasen gefolgt von großen Mahlzeiten führt zu Insulinspitzen und nachfolgendem reaktivem Blutzuckerabfall → erhöhte Heißhungeranfälligkeit.
- 2–4 vollwertige Mahlzeiten stabilisieren den Blutzuckerverlauf ohne ständige Insulinstimulation. Extremfall dauerhafter Snacking: erhöhtes Risiko für Insulinresistenz und langfristig Typ-2-Diabetes.

### Hara Hachi Bu (Grundlage für das künftige Art-of-Eating-Feature)
- Japanische Ernährungsphilosophie aus Okinawa (einer der fünf "Blue Zones" mit überdurchschnittlicher Lebenserwartung): Essen einstellen wenn der Magen zu ca. 80 % gefüllt ist. Nutzt die 20-Minuten-Verzögerung des Sättigungssignals als Puffer gegen Überessen.

### Bundeslebensmittelschlüssel (BLS)
- Offizielle deutsche Nährwertdatenbank des Max-Rubner-Instituts (MRI). Referenz für Makro- und Mikronährstoffe von Lebensmitteln im deutschen Markt.
- Ergänzt durch: USDA FoodData Central (internationale Lebensmittel), Open Food Facts (verarbeitete Produkte).
