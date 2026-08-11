# PROJ-27: Getrennte Test- und Produktions-Landschaften (Staging-Umgebung)

## Status: Planned
**Created:** 2026-07-24
**Last Updated:** 2026-07-24

## Dependencies
- PROJ-1 (Supabase Infrastructure) — Staging bekommt ein eigenes, zweites Supabase-Projekt mit demselben Schema
- PROJ-11 (Paywall) — Staging nutzt Stripe im Test-Modus, getrennt vom Live-Modus in Production

## User Stories
- Als Solo-Entwickler möchte ich neue Migrationen und Features gegen eine echte, produktionsnahe Umgebung testen können, ohne echte Nutzerdaten zu berühren, damit ich QA-Durchgänge nicht mehr durch temporäres Verändern und Zurücksetzen echter Produktionsdaten durchführen muss.
- Als Solo-Entwickler möchte ich, dass eine kaputte Migration oder ein fehlerhaftes Feature auf Staging auffällt, bevor es auf Production landet, damit echte Nutzer nie von einem vermeidbaren Fehler betroffen sind.
- Als Solo-Entwickler möchte ich auf Staging Zahlungen und KI-Analysen risikofrei testen können (kein echtes Geld, kein separates Kostenrisiko), damit ich den kompletten Kauf- und Analyse-Flow ohne Bedenken durchspielen kann.
- Als Solo-Entwickler möchte ich Staging und Production nie versehentlich verwechseln, damit ich nicht aus Versehen auf der falschen Umgebung arbeite oder testet.
- Als Solo-Entwickler möchte ich, dass Staging nicht versehentlich echtes Geld kostet (KI-API-Aufrufe durch Bots/Crawler), damit ein zusätzliches, unkontrolliertes Kostenrisiko ausgeschlossen ist.

## Out of Scope
- **Supabase-Branching (Pro-Plan-Feature)** — Free-Plan reicht aktuell aus; ein zweites, eigenständiges Supabase-Projekt ist die kostenlose Alternative. Kann später nachgezogen werden, falls automatische Schema-Synchronisierung wichtiger wird als die Kostenersparnis
- **PR-basierte Preview-Deployments** — würde einen Umstieg auf einen Feature-Branch/Pull-Request-Workflow erfordern; passt aktuell nicht zum bestehenden Direct-Commit-Workflow auf `main`. Ein fester `staging`-Branch ist die pragmatischere Wahl
- **Eigene Subdomain für Staging** (z.B. `staging.endlichsatt...`) — die automatische Vercel-URL reicht, kein DNS-Aufwand nötig
- **Automatisierte CI/CD-Pipeline zum Anwenden von Migrationen** (z.B. GitHub Actions, die Migrationen automatisch auf beide Projekte anwendet) — vorerst ein manueller, aber fest vorgeschriebener Workflow (siehe Acceptance Criteria); passt zum aktuellen Tempo als Solo-Entwickler-Projekt
- **Automatisches Kopieren/Anonymisieren echter Nutzerdaten nach Staging** — Staging wird ausschließlich mit synthetischen/manuell angelegten Testdaten befüllt, nie mit echten Nutzerdaten (Datenschutz)
- **Migration bestehender E2E-Test-Suiten auf Staging als Zielumgebung** — eigener Umsetzungsschritt nach diesem Feature, nicht Teil dieser Spec (betrifft `tests/*.spec.ts` aller bestehenden Features)
- **Separates Sentry-/Error-Tracking-Projekt für Staging** — falls nötig, spätere Erweiterung; nicht Teil des MVP dieser Spec

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Infrastruktur-Trennung
- [ ] Angenommen es existiert ein zweites Supabase-Projekt für Staging, dann enthält es dasselbe Datenbank-Schema wie Production (alle Tabellen, RLS-Policies, Functions, Trigger)
- [ ] Angenommen ein Nutzer pusht auf den `staging`-Branch, dann deployt Vercel automatisch eine eigene Staging-Instanz unter einer eigenen (automatisch generierten) Vercel-URL, unabhängig von der Production-Instanz auf `main`
- [ ] Angenommen die Staging-Instanz läuft, dann verwendet sie ausschließlich eigene Umgebungsvariablen: eigenes Supabase-Projekt (URL + Keys), Stripe im Test-Modus (eigener Test-Webhook-Endpunkt für die Staging-URL), einen eigenen Anthropic-API-Key
- [ ] Angenommen auf Production wird eine Änderung deployt, dann hat das keinerlei Auswirkung auf Staging (und umgekehrt) — beide Umgebungen sind vollständig voneinander isoliert (eigene Datenbank, eigene Env-Variablen, eigene Deployments)

### Zugriffsschutz & Kennzeichnung
- [ ] Angenommen jemand ruft die Staging-URL auf, dann wird zunächst eine Passwortabfrage (Vercel Deployment Protection) angezeigt, bevor die App selbst erreichbar ist
- [ ] Angenommen ein Nutzer befindet sich auf Staging (nach erfolgreicher Passwortabfrage), dann sieht er auf jeder Seite einen deutlich sichtbaren "STAGING"-Banner, der auf Production nicht erscheint

### Testdaten
- [ ] Angenommen das Staging-Supabase-Projekt wird neu aufgesetzt, dann ist es von Anfang an mit Basis-Testdaten befüllt: mindestens den bestehenden Test-Rezepten aus der Rezeptbibliothek und einem QA-Testkonto mit vollem Zugriff (analog zum bestehenden `qa-test@endlichsatt.dev`-Konto)

### Migrations-Workflow
- [ ] Angenommen eine neue Datenbank-Migration wird geschrieben, dann wird sie zuerst auf dem Staging-Supabase-Projekt angewendet und dort verifiziert, bevor sie identisch auf dem Production-Supabase-Projekt angewendet wird — niemals umgekehrt oder gleichzeitig ungetestet auf beiden

### QA-Workflow
- [ ] Angenommen ein `/qa`-Durchgang für ein neues Feature beginnt, dann läuft die Verifikation standardmäßig gegen die Staging-Umgebung, nicht gegen Production
- [ ] Angenommen ein Feature wurde erfolgreich auf Staging verifiziert und deployt, dann findet nach dem Production-Deploy weiterhin ein kurzer, gezielter Post-Deploy-Check gegen die echte Production-URL statt (wie bisher), aber ohne die ausführliche QA-Verifikation dort zu wiederholen

## Edge Cases
- Ein Entwickler wendet eine Migration nur auf Production an und vergisst Staging (oder umgekehrt) → die beiden Schemas driften auseinander; nächste Migration auf Staging könnte fehlschlagen oder falsch aussehen — kein automatischer Drift-Check in diesem MVP, muss der Entwickler manuell im Blick behalten (siehe Open Questions)
- Ein Staging-Deployment schlägt fehl (z.B. wegen einer fehlenden Env-Variable) → Production bleibt davon komplett unberührt, da beide Deployments unabhängig sind
- Jemand ruft versehentlich `checkout` auf Staging auf → landet garantiert im Stripe-Test-Modus (eigene Keys), kann also nie eine echte Zahlung auslösen
- Ein Bot/Crawler findet die Staging-URL → wird durch die Passwortabfrage blockiert, bevor er kostenpflichtige KI-Analyse-Routen erreichen kann
- Staging-Passwort geht verloren/wird vergessen → im Vercel-Dashboard jederzeit einsehbar/zurücksetzbar, kein Datenverlust-Risiko
- Ein QA-Test auf Staging verbraucht das Staging-Anthropic-Budget stark (z.B. durch einen Bug mit vielen wiederholten Analysen) → betrifft nur das separate Staging-Budget, nicht das Production-Budget für echte Nutzer

## Technical Requirements (optional)
- Sicherheit: Staging-Zugriffsschutz (Vercel Deployment Protection) muss aktiv sein, bevor die Staging-URL das erste Mal öffentlich erreichbar ist
- Sicherheit: Keine echten Nutzerdaten dürfen jemals nach Staging kopiert werden
- Kosten: Staging-Supabase-Projekt muss auf dem Free-Plan bleiben (kein zusätzliches Kostenrisiko durch dieses Feature)

## Open Questions
- [ ] Erlaubt der Supabase-Free-Plan pro Organisation mehr als ein aktives Free-Projekt gleichzeitig? Falls nicht, ändert das die Empfehlung "zweites eigenes Projekt" — zu klären zu Beginn von `/architecture` oder `/backend`, bevor das zweite Projekt angelegt wird
- [ ] Wie wird Schema-Drift zwischen Staging und Production erkannt, falls eine Migration doch einmal nur auf einer Seite angewendet wird? Kein Tooling dafür im MVP vorgesehen — evtl. spätere Erweiterung (z.B. periodischer Schema-Diff)
- [ ] Sollen bestehende E2E-Test-Suiten (`tests/*.spec.ts`) künftig standardmäßig gegen die Staging-URL statt `localhost:3000` laufen? Bewusst nicht Teil dieser Spec (siehe Out of Scope), aber direkte Folgefrage für die Umsetzung

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Zweites, eigenständiges Supabase-Projekt statt Branching | Bleibt auf dem Free-Plan kostenlos; Supabase-Branching erfordert den Pro-Plan (25$/Monat + Laufzeitkosten) — für die aktuelle Projektgröße nicht gerechtfertigt | 2026-07-24 |
| Fester `staging`-Branch statt PR-basierter Preview-Deployments | Passt zum bestehenden Direct-Commit-Workflow auf `main`; ein Umstieg auf Pull Requests wäre ein größerer, hier nicht gerechtfertigter Workflow-Wechsel | 2026-07-24 |
| Staging wird mit Basis-Testdaten vorbefüllt (Rezepte + QA-Testkonto) | QA kann sofort lostesten, ohne jedes Mal erst Testdaten anzulegen — spart Zeit bei jedem QA-Durchgang | 2026-07-24 |
| Migrationen immer zuerst auf Staging, dann auf Production | Verhindert, dass eine kaputte Migration direkt in Production landet — löst genau das Risiko, das bisher bestand | 2026-07-24 |
| `/qa` läuft künftig standardmäßig gegen Staging statt gegen Production | Löst das bei PROJ-11 aufgefallene Problem: QA musste bisher echte Produktionsdaten temporär verändern und zurücksetzen, um Zustände zu testen | 2026-07-24 |
| Automatische Vercel-URL statt eigener Subdomain | Kein DNS-Aufwand nötig für eine intern genutzte Umgebung | 2026-07-24 |
| Vercel Deployment Protection (Passwortschutz) für Staging | Echte Anthropic-API-Aufrufe kosten auch auf Staging echtes Geld — Schutz vor Bots/Crawlern, die die Staging-URL sonst unkontrolliert belasten könnten | 2026-07-24 |
| Eigener Anthropic-API-Key für Staging, getrennt von Production | Klare Kosten-/Nutzungstrennung zwischen Test-Traffic und echten Nutzer-Analysen; ein Bug/Loop auf Staging kann nie das Production-Budget oder -Rate-Limit belasten | 2026-07-24 |
| Sichtbarer "STAGING"-Banner auf jeder Seite | Verhindert Verwechslung zwischen Staging und Production bei ähnlichen URLs, minimaler Umsetzungsaufwand | 2026-07-24 |
| Automatisiertes Kopieren echter Nutzerdaten nach Staging ausgeschlossen | Datenschutz — Staging-Zugriffsschutz ist weniger stark abgesichert als Production, echte Nutzerdaten dort zu halten wäre ein unnötiges Risiko | 2026-07-24 |

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
