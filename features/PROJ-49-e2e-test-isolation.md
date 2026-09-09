# PROJ-49: E2E-Testisolation — automatisches QA-Konto-Seeding für PROJ-11/PROJ-12

## Status: Deployed
**Created:** 2026-09-04
**Last Updated:** 2026-09-04

> **Hinweis:** Dieser Spec wurde rückwirkend geschrieben. Die Umsetzung erfolgte direkt in der Session (Nutzeranfrage → Fix → Verifikation → Deploy), nicht im normalen `/write-spec` → `/architecture` → `/frontend`/`/backend` → `/qa` → `/deploy`-Ablauf. Test-Infrastruktur, kein nutzersichtbares Feature — "Deployed" bedeutet hier: der Fix ist auf `main` und in Produktion gebaut, nicht dass sich am ausgelieferten Produkt etwas ändert.

## Dependencies
- Requires: PROJ-11 (Paywall) — Datei, die den Fix erhält
- Requires: PROJ-12 (Invite-Codes) — Datei, die den Fix erhält

## User Stories
- Als Entwickler, der die E2E-Suite lokal oder in CI laufen lässt, will ich, dass PROJ-11 und PROJ-12 ihre benötigte QA-Konto-Vorbedingung selbst seeden, damit ein Lauf nicht davon abhängt, was ein vorheriger Lauf zufällig im echten Supabase-Konto hinterlassen hat.
- Als Entwickler, der die Suite mit `fullyParallel: true` über mehrere Worker laufen lässt, will ich, dass sich die Zustandsänderungen von PROJ-11 und PROJ-12 auf demselben geteilten QA-Konto nie zeitlich überschneiden, damit parallel laufende Blöcke sich nicht gegenseitig die Vorbedingung überschreiben.
- Als Entwickler, der an anderen Features arbeitet, die dasselbe QA-Konto nutzen (PROJ-8/24/25/45/47), will ich, dass der permanente Baseline-Zustand des Kontos nach jedem PROJ-11/PROJ-12-Lauf zuverlässig wiederhergestellt wird, damit meine Tests nicht durch deren temporäre Zustandsänderungen brechen.

## Out of Scope
- **PROJ-10 (Foto-Scan-Limit)** — hat exakt dieselbe dokumentierte Lücke (manuelles Seeding vor jedem QA-Durchgang, siehe Kommentar in der Datei), wurde aber nicht angefasst. War nicht Teil der ursprünglichen Anfrage ("invite-code and scan-limit" = PROJ-11/PROJ-12). Möglicher Follow-up.
- **Verteiltes/Multi-Maschinen-Locking** — die Dateisystem-Sperre (`tests/helpers/qa-account-lock.ts`) garantiert gegenseitigen Ausschluss nur zwischen Prozessen auf **derselben** Maschine (reicht für `npm run test:e2e` lokal). Für parallele CI-Runner auf unterschiedlichen Maschinen bräuchte es einen anderen Mechanismus (z. B. einen verteilten Lock-Service).
- **PROJ-25-Flakiness während der Verifikation** — ein beobachteter "resolved to 2 elements"-Fehler war nachweislich unabhängig (durch eine parallel laufende, unabhängige Bearbeitung von `src/app/rezept/[id]/page.tsx` in derselben Arbeitskopie verursacht), nicht durch diesen Fix.
- **Verwaiste Lock-Datei nach abgebrochenem Lauf** — kein automatischer Stale-Lock-Erkennungsmechanismus über den Timeout hinaus (siehe Edge Cases).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [x] Angenommen die E2E-Suite (PROJ-11 + PROJ-12, beide Browser-Projekte) läuft zweimal hintereinander gegen denselben laufenden Dev-Server, wenn beide Läufe abgeschlossen sind, dann bestehen alle 54 Tests in beiden Läufen vollständig (keine durch Restzustand verursachten Fehlschläge)
- [x] Angenommen PROJ-11 und PROJ-12 mutieren mit `fullyParallel: true` gleichzeitig dasselbe QA-Konto auf unterschiedlichen Workern, wenn beide um dieselbe Vorbedingung konkurrieren, dann serialisiert die Dateisystem-Sperre ihre Schreibfenster, sodass sich kein Zustand gegenseitig überschreibt
- [x] Angenommen ein Testblock hat die Vorbedingung des QA-Kontos temporär überschrieben, wenn der Block fertig ist (auch bei einem Fehlschlag innerhalb des Blocks), dann wird der zuvor gelesene tatsächliche Kontozustand wiederhergestellt
- [x] Angenommen mehrere Blöcke warten gleichzeitig auf dieselbe Sperre, wenn die Wartezeit Playwrights Standard-Hook-Timeout (30s) überschreitet, dann schlägt der Hook nicht fälschlich mit einem Timeout fehl (explizites `test.setTimeout` über der Lock-Wartezeit)
- [x] Angenommen `beforeAll` schlägt fehl, bevor die Sperre erworben wurde, wenn danach `afterAll` läuft, dann wirft `afterAll` keinen sekundären Fehler (kein "releaseLock is not a function")
- [x] Angenommen der Suite-Lauf ist beendet, wenn man den QA-Konto-Zustand direkt in der DB prüft, dann entspricht er wieder dem permanenten Baseline-Zustand (u. a. `invite_code_redeemed_at` gesetzt, nicht `null`)

## Edge Cases
- Bis zu 8 gleichzeitige Anwärter auf dieselbe Sperre (PROJ-11: 3 Blöcke, PROJ-12: 1 Block, je × 2 Browser-Projekte) — Wartezeit kann sich in ungünstiger Reihenfolge addieren; `LOCK_TIMEOUT_MS` (120s) und der zugehörige Hook-Timeout sind entsprechend großzügig bemessen.
- `beforeAll` schlägt fehl (z. B. QA-Konto per E-Mail nicht gefunden) — `afterAll` darf nicht crashen, wenn `releaseLock`/`qaUserId`/`baseline` nie gesetzt wurden.
- Verwaiste Lock-Datei durch einen hart abgebrochenen Lauf (z. B. Ctrl+C mitten im Block) — wird nicht automatisch erkannt oder entfernt; ein nachfolgender Lauf wartet bis zum 120s-Timeout und schlägt dann mit einer klaren Fehlermeldung fehl statt hängen zu bleiben, erfordert aber manuelles Aufräumen der Lock-Datei im OS-Temp-Verzeichnis.
- Zwei Dateien (PROJ-11, PROJ-12) mutieren dieselben Profilfelder — die Reihenfolge, in der sie die Sperre bekommen, ist nicht deterministisch; das ist bewusst so, da beide unabhängig vom jeweils anderen korrekt seeden/restaurieren.

## Technical Requirements (optional)
- Sperre: `fs.mkdirSync` (atomar) unter `os.tmpdir()`, funktioniert prozessübergreifend auf einer Maschine — kein zusätzlicher Dependency.
- Kein Einfluss auf Produktionscode oder Laufzeitverhalten der App — reine Test-Infrastruktur unter `tests/`.

## Open Questions
- [ ] Soll PROJ-10 (Foto-Scan-Limit) denselben automatisierten Seed/Restore-Mechanismus bekommen? Hat dieselbe dokumentierte Lücke, war aber nicht Teil dieser Anfrage.
- [ ] Braucht die Lock-Datei einen Stale-Lock-Cleanup (z. B. PID-Check oder TTL), falls ein Lauf mitten im gesperrten Zustand hart abbricht?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Automatisches Seed+Restore statt einmaligem manuellem DB-Skript | Macht Wiederholbarkeit des Laufs zum Teil des Testcodes selbst statt einer externen, leicht vergessenen Voraussetzung — genau das hat den ursprünglichen Fehlschlag verursacht | 2026-09-04 |
| Dateisystem-Lock statt globalem `workers: 1` | Serialisiert nur die ~2 betroffenen Dateien statt die gesamte ~1300-Test-Suite zu verlangsamen | 2026-09-04 |
| PROJ-12-Seeding auf Dateiebene statt nur im "Code-Formular"-Block | Mehrere Blöcke (Code-Einlösung, Rate-Limit) hängen ebenfalls vom sichtbaren Einladungscode-Link ab — beim ersten Verifikationslauf mit block-lokalem Seeding schlugen genau diese Blöcke fehl | 2026-09-04 |
| Helper-Funktion von `useSeededAccountState` zu `seedAccountState` umbenannt | ESLint `react-hooks/rules-of-hooks` interpretierte den `use`-Präfix als React-Hook-Aufruf auf Modulebene | 2026-09-04 |
| PROJ-10 bewusst nicht mit angefasst | Nicht Teil der Nutzeranfrage ("invite-code and scan-limit" = PROJ-11/PROJ-12); gleiche Lücke dort aber dokumentiert für späteren Follow-up | 2026-09-04 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `fs.mkdirSync`-basierte Sperre statt einer npm-Locking-Library | Kein zusätzlicher Dependency nötig; `mkdir` ist atomar und funktioniert prozessübergreifend auf einer Maschine, was für lokale Parallel-Worker ausreicht | 2026-09-04 |
| Lock-Timeout 120s, Hook-Timeout = Lock-Timeout + 30s Puffer | Bis zu 8 Blöcke können auf dieselbe Sperre warten; Playwrights Standard-Hook-Timeout (30s) reichte im ersten Verifikationslauf nachweislich nicht | 2026-09-04 |

---

## Tech Design (Solution Architect)
_Kein separater `/architecture`-Durchlauf — Umsetzung erfolgte direkt als Bugfix in der Session. Siehe Commit [95d55ae] für die technische Umsetzung: `tests/helpers/qa-account-lock.ts` (neu), `tests/PROJ-11-paywall.spec.ts`, `tests/PROJ-12-invite-codes.spec.ts`._

## QA Test Results
**Verifiziert am 2026-09-04:**
- `npm run lint` — 0 Fehler
- `tsc --noEmit` — keine neuen Fehler (ein vorbestehender, unabhängiger Fehler in PROJ-2-user-authentication.spec.ts bestätigt via Stash-Vergleich)
- PROJ-11 + PROJ-12 gemeinsam, beide Browser-Projekte (chromium + Mobile Chrome), **zweimal direkt hintereinander** gegen denselben laufenden Dev-Server: 54/54 Tests bestanden in beiden Läufen (vorher: 2. Lauf schlug mit Timeout/falscher Fehler-Struktur fehl)
- QA-Konto-Zustand direkt per Supabase-Admin-Client nach dem Lauf geprüft: Baseline korrekt wiederhergestellt (`invite_code_redeemed_at` gesetzt, `subscription_status: null`, `photo_scans_remaining: 9999`)
- Regressionscheck PROJ-25 (hängt vom permanenten Baseline-Zustand desselben Kontos ab): anfänglicher Fehlschlag als umgebungsbedingt (parallele fremde Bearbeitung von `page.tsx`) identifiziert, nicht durch diesen Fix verursacht

**Keine Critical/High Bugs.**

## Deployment
- **Commits:** [95d55ae] (Fix), [9b8dbed] (Index-Update)
- **Tag:** `v3.17.0-PROJ-49`
- **Production URL:** https://app.mehralsabnehmen.de/ (unverändert — Test-Infrastruktur ohne Laufzeit-Auswirkung auf die App)
- **Deployed:** 2026-09-04
- **Post-Deploy-Verifikation:** Vercel Runtime Logs geprüft (0 Errors, 0 Fatal, ein unabhängiger vorbestehender Supabase-SDK-Hinweis)
