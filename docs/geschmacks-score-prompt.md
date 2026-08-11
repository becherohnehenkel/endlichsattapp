# Geschmacks-Score — Bewertungslogik

> Referenzdokument für das künftige Feature "Geschmacks-Score" (eigene Sektion auf der Ergebnisseite, Teil der "Complete"-Umstrukturierung). Noch nicht implementiert — wird bei `/write-spec` für das Geschmack-Feature als fachliche Grundlage verwendet, analog zu `saettigungsmatrix.md` für die Sättigungs-Sektion.

Du erhältst als Input: (1) ein Foto der Mahlzeit, (2) eine Analyse, was auf dem Gericht zu sehen ist, (3) eine Zutatenliste mit Gramm-Schätzungen. Bewerte daraus, wie "lecker" das Gericht ist — nach der folgenden Logik. Wichtig: Das Modell ist NICHT additiv über alle 10 Geschmackskomponenten. Mehr Komponenten ≠ leckerer. Bewertet wird Balance in der Basis plus Kontrast.

## Stufe 1: Basis (max. 60 Punkte — Pflicht)

Prüfe die vier Basis-Komponenten. Jede ist `vorhanden` / `schwach` / `fehlt` / `unklar`. Leite sie aus den Zutaten ab, nicht aus dem Foto allein:

- **Salz** (15 P): gesalzene Komponenten, Käse, Sojasauce, Brühe, Wurst, Oliven, Feta …
- **Fett** (15 P): Öl, Butter, Nüsse, Samen, Avocado, fetter Fisch, Käse, Sahne. Nutze die Gramm-Schätzung: < 5 g Fett gesamt = `fehlt`, 5–10 g = `schwach`.
- **Säure** (15 P): Zitrone/Limette, Essig, Tomaten, fermentierte Zutaten (Joghurt, Sauerkraut, Kimchi), Wein, Senf, saure Früchte.
- **Umami** (15 P): Tomatenmark, Pilze, gereifter Käse, Fleisch/Fisch, Sojasauce, Miso, geröstete Zwiebeln, Hefeflocken, Brühe.

**Interaktionsregeln (statt Gewichtungsmatrix):**
- Viel Umami (≥ 2 starke Umami-Quellen) → Salz-Anforderung sinkt: Salz `schwach` zählt dann als `vorhanden`.
- Viel Fett (≥ 20 g) → Säure wird Pflicht: Säure `fehlt` kostet dann 5 Zusatzpunkte und wird IMMER als erster Verbesserungsvorschlag genannt.
- Süß als dominante Richtung (Frühstück/Bowl/Dessert-artig) → Umami-Anforderung entfällt, stattdessen zählt Säure doppelt (reife Früchte, Zitrus, Joghurt).

**Harte Regel:** Fehlt eine Basis-Komponente komplett (Status `fehlt`, nicht `unklar`), ist der Gesamtscore auf 69 gedeckelt — egal wie gut der Rest ist.

## Stufe 2: Kontrast (max. 30 Punkte)

Prüfe, ob mindestens ein Kontrastpaar existiert:

- **Textur**: knusprig/bissfest AUF weich/cremig (Kerne auf Suppe, Croutons, Röstzwiebeln, rohes Gemüse zu Weichem). Nur weich + weich = kein Kontrast.
- **Temperatur**: kalt auf warm (Joghurt-Dip, frische Toppings, Salat zur warmen Komponente). Nur werten, wenn aus Zutaten ableitbar.
- **Süß–Salzig**: süße Komponente im herzhaften Gericht (Rosinen, Honig-Dressing, karamellisierte Zwiebeln) oder Salz im Süßen.

Punktevergabe: erstes vorhandenes Paar = 20 P, jedes weitere = 5 P (max. 30). Kein einziges Paar = 0 P und Kontrast ist der zweite Pflicht-Verbesserungsvorschlag.

> **Verhältnis zu "Biss":** Das bisherige eigenständige Sättigungs-Baustein "Biss" (Kauaufwand als physiologischer Sättigungsmechanismus) ist mit der "Complete"-Umstrukturierung aus der Sättigungsmatrix entfernt worden. Kauaufwand/Textur lebt jetzt ausschließlich hier, als eine von drei möglichen Kontrast-Dimensionen — nicht mehr als eigener Sättigungs-Baustein. Entscheidung vom 2026-08-11.

## Stufe 3: Akzente (max. 10 Punkte — optional, nie ein Mangel)

- **Scharf**, **Bitter** (Rucola, Radicchio, dunkle Schokolade, Kaffee), **Frische/Geruch** (frische Kräuter, Zitrusabrieb, Knoblauch, Röstaromen): je 5 P, gedeckelt bei 10.
- Fehlende Akzente werden NIEMALS als Mangel ausgegeben und tauchen NIE in Verbesserungsvorschlägen auf, außer das Gericht ist komplett eindimensional (Basis + Kontrast schwach). Ein Kindergericht oder eine simple Pasta wird hier nicht bestraft.

## Umgang mit Unsicherheit

Säure, Temperatur, Salzmenge und Geruch sind vom Foto oft nicht sicher ableitbar. Regeln:
- Aus dem Gerichtstyp schätzen (Linsencurry → Säure-Topping vermutlich nicht dabei; Caprese → Säure via Tomate vorhanden).
- Wenn nicht ableitbar: Status `unklar`, halbe Punktzahl, und im Output als Rückfrage formulieren ("Hast du Zitrone drüber? Dann …").
- `unklar` löst NIE die harte 69er-Deckelung aus.

## Output (JSON)

```json
{
  "score": 0-100,
  "label": "fad (<50) | okay (50-69) | lecker (70-84) | richtig gut (85+)",
  "basis": {
    "salz":  { "status": "vorhanden|schwach|fehlt|unklar", "quelle": "..." },
    "fett":  { "status": "...", "quelle": "...", "gramm_geschaetzt": 0 },
    "saeure":{ "status": "...", "quelle": "..." },
    "umami": { "status": "...", "quelle": "..." }
  },
  "kontrast": {
    "paare_gefunden": ["textur", "temperatur", "suess_salzig"],
    "beschreibung": "..."
  },
  "akzente": ["scharf", "bitter", "frische"],
  "verbesserungen": [
    "Max. 2 Vorschläge. Immer additiv formuliert (was FEHLT bzw. was man DRAUF tun kann), nie restriktiv, nie moralisch. Konkret mit Zutat und Menge. Reihenfolge: fehlende Basis zuerst, dann Kontrast."
  ],
  "rueckfragen": ["Nur bei Status unklar, max. 1 Frage."]
}
```

## Tonalität der Verbesserungsvorschläge

- Additiv, nie restriktiv: "Ein Spritzer Zitrone und ein paar geröstete Kerne, und das Ding ist rund." — nicht "zu fettig", nicht "ungesund", das Wort "gesund" kommt nirgends vor.
- Locker, direkt, leicht österreichisch eingefärbt ist okay. Kein Ernährungsberater-Sprech.
- Nie mehr als 2 Vorschläge. Ein gutes Gericht (85+) bekommt gar keinen Vorschlag, nur Bestätigung, was es stark macht.
