# PROJ-10: Foto-Scan-Limit pro Nutzer

## Status: Planned
**Created:** 2026-06-16
**Last Updated:** 2026-06-16

## Dependencies
- PROJ-1 (Supabase Infrastructure) — Counter-Spalte in `profiles`
- PROJ-2 (User Authentication) — Counter ist an den eingeloggten Nutzer gebunden
- PROJ-3 (Mahlzeit-Input) — Foto-Upload-Zone ist der Ort, an dem das Limit greift

## User Stories
- Als Nutzer möchte ich sehen, wie viele Foto-Scans mir noch zur Verfügung stehen, damit ich meine Nutzung einschätzen kann.
- Als Nutzer möchte ich weiterhin unbegrenzt Mahlzeiten per Freitext analysieren können, auch wenn meine Foto-Scans aufgebraucht sind.
- Als neuer Nutzer möchte ich automatisch 3 Foto-Scans erhalten, ohne etwas dafür tun zu müssen.
- Als Nutzer möchte ich, wenn meine Foto-Scans aufgebraucht sind, einen freundlichen Hinweis statt einer Fehlermeldung sehen — und direkt erkennen, dass Freitext weiterhin funktioniert.

## Out of Scope
- Paywall / Bezahlschranke — _deferred to PROJ-11_
- Invite-Codes zum Aufladen weiterer Scans — _deferred to PROJ-11_
- Wiederkehrendes/monatliches Auffüllen des Kontingents — bewusst nicht für dieses Feature, einmalige Gesamtmenge reicht für MVP
- Admin-Oberfläche um den Counter manuell zu erhöhen — vorerst direktes DB-Update, UI kommt ggf. mit PROJ-11
- Rückerstattung eines Scans bei gelöschter Mahlzeit oder fehlgeschlagener KI-Analyse
- Anzeige des Counters außerhalb der Mahlzeit-Eingabeseite (kein Profil/Settings-Bereich vorhanden)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ein neuer Nutzer registriert sich, wenn das Profil angelegt wird, dann wird `photo_scans_remaining` auf 3 gesetzt
- [ ] Angenommen ein Nutzer hat mindestens 1 Foto-Scan übrig, wenn er die Mahlzeit-Eingabeseite öffnet, dann sieht er die Foto-Upload-Zone mit einem dezenten Hinweistext ("Noch X von 3 Foto-Scans übrig")
- [ ] Angenommen ein Nutzer hat mindestens 1 Foto-Scan übrig, wenn er ein Foto erfolgreich hochlädt und die Mahlzeit serverseitig angelegt wird, dann wird `photo_scans_remaining` um genau 1 reduziert
- [ ] Angenommen ein Nutzer hat 0 Foto-Scans übrig, wenn er die Mahlzeit-Eingabeseite öffnet, dann wird die Foto-Upload-Zone durch einen freundlichen Hinweis ersetzt ("Deine Foto-Scans sind aufgebraucht — Freitext-Analyse bleibt unbegrenzt verfügbar") und das Freitextfeld bleibt normal nutzbar
- [ ] Angenommen ein Nutzer hat 0 Foto-Scans übrig, wenn er eine Mahlzeit per Freitext einreicht, dann wird die Analyse ohne jede Einschränkung durchgeführt
- [ ] Angenommen ein Nutzer hat genau 1 Foto-Scan übrig, wenn zwei Foto-Uploads quasi gleichzeitig eintreffen (z.B. zwei offene Tabs), dann wird nur einer davon akzeptiert und der Counter sinkt nicht unter 0
- [ ] Angenommen ein Nutzerkonto existiert bereits vor dem Rollout dieses Features, wenn die Migration ausgeführt wird, dann erhält auch dieses Konto `photo_scans_remaining = 3`
- [ ] Angenommen der Counter-Stand wird clientseitig zwischengespeichert, wenn der Nutzer die Seite neu lädt, dann wird der aktuelle Stand serverseitig neu abgefragt (kein veralteter Client-Wert)

## Edge Cases
- Counter erreicht 0 während eine zweite Browser-Session/Tab desselben Nutzers noch offen ist → der nächste Foto-Upload-Versuch muss serverseitig geprüft und blockiert werden, nicht nur durch den clientseitigen UI-Zustand
- Nutzer löscht eine Mahlzeit nachträglich (falls möglich) → kein Scan wird zurückerstattet
- Der Counter-Update-Query schlägt aus DB-Gründen fehl → Foto-Upload wird mit einer generischen Fehlermeldung abgebrochen, kein "kostenloser" Scan wird durchgelassen
- Migration für bestehende Konten orientiert sich nicht an bisheriger Nutzung — alle bekommen einheitlich 3, unabhängig davon wie viele Foto-Analysen sie vorher schon gemacht haben
- Schnelles Doppel-Klicken auf "Foto hochladen" darf nicht zwei Scans für eine einzige Nutzeraktion verbrauchen

## Technical Requirements (optional)
- Sicherheit: `photo_scans_remaining` darf nur serverseitig verändert werden (RLS verhindert direktes Client-Update); die Prüfung "noch Scans übrig?" erfolgt verbindlich serverseitig, das UI-Gate ist nur UX-Komfort
- Atomarität: Das Decrement muss race-condition-sicher sein (darf nicht unter 0 fallen)

## Open Questions
- [ ] Soll ein in PROJ-11 eingelöster Code den Counter erhöhen (additiv) oder auf einen neuen Wert setzen? Wird final in PROJ-11 entschieden, hier nur als Hinweis dass das Datenmodell (einfache Integer-Spalte) das unterstützen sollte.
- [ ] Was passiert, wenn der Counter erfolgreich reduziert wurde, aber das Anlegen der Mahlzeit direkt danach aus einem anderen Grund fehlschlägt (seltener DB-Fehler)? `/backend` entscheidet die genaue Fehlerbehandlung (z.B. automatischer Rollback).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Verbrauch bei erfolgreichem Foto-Upload, nicht erst nach erfolgreicher KI-Analyse | Einfacher zu implementieren (kein Rollback bei Claude-Fehlern nötig); Claude-Fehler sind selten und bereits mit Retry-Hinweis abgefangen | 2026-06-16 |
| Foto-Upload-Zone wird bei 0 verbleibenden Scans proaktiv durch Hinweistext ersetzt | Verhindert frustrierende Fehlermeldung nach einem bereits begonnenen Upload-Versuch | 2026-06-16 |
| Counter ist immer dezent sichtbar, nicht nur bei niedrigem Stand | Transparenz von Anfang an statt einer Überraschung bei 0 | 2026-06-16 |
| Einmalige Gesamtmenge (3) ohne automatisches Auffüllen | Einfachste MVP-Variante; ein Aufladen-Mechanismus kommt ggf. mit PROJ-11 (Invite-Codes) | 2026-06-16 |
| Bestehende Konten erhalten per Migration ebenfalls den Default-Wert 3, kein Sonderfall | Konsistenz und Einfachheit; der Product Owner kann seinen eigenen Account danach händisch in der DB anpassen | 2026-06-16 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Counter (`photo_scans_remaining`) lebt als neue Spalte direkt in `profiles`, keine eigene Tabelle | Ein einzelner Zähler pro Nutzer braucht keinen Join, einfachstes Datenmodell | 2026-06-16 |
| Prüfung + Reduzierung läuft im bestehenden `POST /api/meal`-Endpunkt, kein neuer Endpunkt | Foto-Mahlzeiten laufen ohnehin durch diesen Endpunkt — kein zusätzlicher Request nötig | 2026-06-16 |
| Prüfung + Reduzierung als eine atomare Datenbankoperation | Verhindert Race Conditions bei zwei gleichzeitigen Anfragen (z.B. zwei offene Tabs) — Counter kann nie unter 0 fallen | 2026-06-16 |
| Counter ist auf Datenbankebene vor direkter Veränderung durch den Browser geschützt (nur Server darf ihn ändern) | Verhindert Manipulation über die Browser-Konsole/Netzwerk-Tab, selbst wenn die normale Profil-Update-Policy sonst eigene Felder erlaubt | 2026-06-16 |
| Migration für Bestandskonten als einmaliges DB-Skript statt Code-Pfad in der App | Einfacher, einmaliger Vorgang braucht keine Laufzeit-Logik | 2026-06-16 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponentenstruktur

```
AnalysePage (Server Component, src/app/analyse/page.tsx)
+-- liest profiles.photo_scans_remaining für den eingeloggten Nutzer
+-- MahlzeitInput (Client Component, erhält photoScansRemaining als neue Prop)
    +-- Wenn photoScansRemaining > 0:
    |   +-- FotoUploadZone — zusätzlich kleiner Text "Noch X von 3 Foto-Scans übrig"
    +-- Wenn photoScansRemaining === 0:
    |   +-- Hinweis-Banner statt Foto-Upload-Zone: "Deine Foto-Scans sind aufgebraucht — Freitext bleibt unbegrenzt verfügbar"
    +-- Freitext-Textarea — immer aktiv, unabhängig vom Counter
```

### Datenmodell (in Worten)

```
profiles (bestehende Tabelle)
+ neue Spalte: photo_scans_remaining
  - Zahl, Standardwert 3, darf nie negativ werden
  - wird bei Account-Erstellung automatisch gesetzt
  - bestehende Konten erhalten per einmaliger Migration ebenfalls 3
  - darf NUR vom Server verändert werden — nicht direkt vom Browser
    aus, selbst wenn jemand technisch versucht den eigenen Account
    direkt anzusprechen
```

### API-Verhalten

`POST /api/meal` (bestehender Endpunkt, keine neue Route nötig):
- Enthält die Anfrage ein Foto: Counter wird zuerst geprüft. Bei 0 → Anfrage wird mit einer freundlichen Fehlermeldung abgelehnt, keine Mahlzeit wird angelegt. Bei ≥1 → Counter wird um genau 1 reduziert, danach läuft alles wie bisher.
- Enthält die Anfrage nur Text: Counter wird gar nicht angefasst.
- Prüfung + Reduzierung passiert in einem einzigen, nicht unterbrechbaren Datenbankschritt — verhindert, dass zwei gleichzeitige Anfragen (z.B. zwei offene Tabs) sich überholen und der Wert unter 0 fällt.

### Dependencies (Pakete)
Keine neuen — läuft komplett mit dem bestehenden Supabase/Next.js-Stack.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
