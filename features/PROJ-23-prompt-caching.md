# PROJ-23: Prompt Caching für Analyse-Routen

## Status: Planned
**Created:** 2026-07-09
**Last Updated:** 2026-07-09

## Kontext & Motivation

Die KI-Analyse besteht aus zwei API-Calls pro Mahlzeit:
- `/api/analyse/answer` → `claude-sonnet-4-6` (Rückfragen-Runde)
- `/api/analyse/complete` → `claude-haiku-4-5-20251001` (Vollanalyse)

Beide schicken bei jedem Request denselben System-Prompt (~3.900 Tokens) vollständig mit. Anthropic bietet **Prompt Caching** an: der System-Prompt wird serverseitig für 5 Minuten gecacht. Folge-Requests innerhalb dieses Fensters zahlen nur ~10% des normalen Input-Preises für den gecachten Teil.

**Warum jetzt noch nicht bauen:** Bei 1–2 aktiven Nutzern treffen kaum zwei Anfragen innerhalb von 5 Minuten auf dem Server ein. Cache-Hits sind selten, Cache-Write-Kosten (+25% auf ersten Request) überwiegen den Vorteil. Der Break-Even liegt bei ca. 20–30 täglich aktiven Nutzern mit verteilter Nutzung über den Tag.

## Dependencies
- Requires: PROJ-4 (KI-Analyse-Agent) — die Routen die gecacht werden
- Requires: PROJ-5 (Sättigungs-Einschätzung) — der finale Analyse-Call

## User Stories

- Als Solo-Entwickler möchte ich die Anthropic-API-Kosten bei wachsendem Traffic automatisch reduzieren, ohne die Analyse-Qualität zu verändern.
- Als Nutzer möchte ich, dass Prompt Caching unsichtbar im Hintergrund läuft — meine Analyse soll sich nicht verändern.
- Als Produktverantwortlicher möchte ich die Kosten pro Analyse so niedrig halten, dass das Geschäftsmodell bei Scale funktioniert.

## Out of Scope

- **Caching der User-Messages oder Konversations-History** — diese sind immer einzigartig pro Analyse; Caching würde keinen Vorteil bringen und Komplexität erhöhen
- **Caching von Foto-Content** — Bilder sind ebenfalls einzigartig; nur der System-Prompt ist invariant
- **Extended Caching (1h TTL)** — Anthropic bietet längere Cache-Fenster als kostenpflichtiges Beta-Feature; vorerst reicht ephemeral (5 Min.)
- **Monitoring-Dashboard für Cache-Hit-Rate** — Anthropic liefert Cache-Metriken in der API-Response; bei Bedarf eigenes Logging als separates Ticket
- **Caching für andere API-Routen** — nur die Analyse-Routen haben System-Prompts die groß genug sind (Minimum: 1.024 Tokens für Sonnet, 2.048 für Haiku)

## Acceptance Criteria

- [ ] Angenommen die App ist in Production und der Anthropic-Call in `/api/analyse/answer` wird ausgeführt, dann wird der System-Prompt als `cache_control: { type: 'ephemeral' }` Block übergeben (kein plain string mehr).
- [ ] Angenommen die App ist in Production und der Anthropic-Call in `/api/analyse/complete` wird ausgeführt, dann wird der System-Prompt (bzw. EXTRACTION_PROMPT) als `cache_control: { type: 'ephemeral' }` Block übergeben.
- [ ] Angenommen zwei Analysen werden innerhalb von 5 Minuten gestartet, dann zeigt die Anthropic-API-Response für den zweiten Call `cache_read_input_tokens > 0` (verifizierbar im Server-Log).
- [ ] Angenommen Prompt Caching ist aktiv, dann ist das Ergebnis einer Analyse inhaltlich identisch zu einer Analyse ohne Caching — der Nutzer bemerkt keinen Unterschied.
- [ ] Angenommen das Caching schlägt fehl (Anthropic ändert API), dann fällt die App gracefully zurück: die Analyse läuft durch, nur ohne Cache-Vorteil.

## Edge Cases

- **Cache-Miss (erster Request im 5-Minuten-Fenster):** Anthropic schreibt den Cache und berechnet +25% auf den System-Prompt-Input. Kein Fehler, nur minimal höhere Kosten für diesen einen Request.
- **System-Prompt-Update:** Wenn `SYSTEM_PROMPT` geändert wird, invalidiert Anthropic automatisch den Cache (anderer Inhalt = anderer Cache-Key). Kein manuelles Invalidieren nötig.
- **Haiku-Minimum (2.048 Tokens):** Der System-Prompt muss für Haiku-Modelle ≥ 2.048 Tokens lang sein. Aktuell ~3.900 Tokens — unkritisch. Sollte der Prompt je stark gekürzt werden, diesen Check wiederholen.
- **Parallele Requests von verschiedenen Nutzern:** Cache ist global auf Anthropic-Seite für den gleichen API-Key + gleichen Prompt-Inhalt. Mehrere Nutzer profitieren voneinander — kein Datenaustausch, nur Kosten-Sharing.
- **Cold Start nach Deployment:** Nach jedem Deployment ist der Cache kalt. Erste Analysen nach dem Deploy zahlen volle Input-Preise für den System-Prompt.

## Produkt-Entscheidungen

| Entscheidung | Begründung | Datum |
|---|---|---|
| Jetzt specen, später bauen | Bei <20 DAU bringt Caching keinen messbaren Vorteil. Spec sichert das Wissen, Implementierung folgt bei Traffic. | 2026-07-09 |
| Nur System-Prompt cachen | User-Content und History sind immer einzigartig → kein Cache-Benefit. System-Prompt ist 3.900 Tokens → deutlicher Benefit. | 2026-07-09 |
| `ephemeral` statt extended TTL | Reicht für die Nutzungs-Pattern der App (Analysen verteilt über den Tag). Kein Beta-Feature nötig. | 2026-07-09 |
| Kein Monitoring-Dashboard | Anthropic gibt `cache_read_input_tokens` in der API-Response zurück — bei Bedarf einfaches `console.log` reicht zur Verifikation. | 2026-07-09 |

## Open Questions

- [ ] **Trigger-Kriterium:** Bei welchem DAU-Wert (Daily Active Users) implementieren? Empfehlung: 20+ DAU, wenn der Analyse-Traffic sich über den Tag verteilt.
- [ ] **Haiku-Pricing für Prompt Caching:** Preise für `claude-haiku-4-5-20251001` Cache-Reads zum Implementierungszeitpunkt prüfen (Anthropic ändert Preise regelmäßig).

## Technische Kurznotiz (für Backend-Entwickler)

Änderung ist minimal — **2 Dateien, je ~5 Zeilen**:

```
src/app/api/analyse/answer/route.ts
  system: SYSTEM_PROMPT
  → system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }]

src/app/api/analyse/complete/route.ts
  system: EXTRACTION_PROMPT
  → system: [{ type: 'text', text: EXTRACTION_PROMPT, cache_control: { type: 'ephemeral' } }]
```

Kein DB-Migration, keine neuen Env-Variablen, keine UI-Änderungen.
