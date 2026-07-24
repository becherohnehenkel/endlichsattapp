# PROJ-11: Paywall

## Status: Approved (Refinement: QA abgeschlossen, BUG-2 gefixt + live verifiziert, keine offenen Critical/High Bugs — siehe `## QA Test Results`)
**Created:** 2026-06-16
**Last Updated:** 2026-07-24

**Korrektur beim Refinement:** Der Status-Header war seit dem ursprünglichen Deployment (2026-06-16) fälschlich auf "Planned" stehen geblieben — das eigentliche Deployment ist im `## Deployment`-Abschnitt weiter unten korrekt dokumentiert. Reine Dokumentations-Inkonsistenz, keine funktionale Auswirkung.

## Dependencies
- PROJ-1 (Supabase Infrastructure) — Subscription-Status auf dem Profil
- PROJ-2 (User Authentication) — Paywall ist an den eingeloggten Nutzer gebunden
- PROJ-10 (Foto-Scan-Limit) — **nach dem Refinement**: das 7-Tage-Fenster startet nicht mehr am Foto-Scan-Verbrauch (siehe Decision Log), sondern an der Registrierung. Der tägliche 5-Foto-Scan-Zähler aus PROJ-10 gilt während des Trials; nach Trial-Ende fällt die Foto-Analyse auf ein einmaliges Lifetime-Kontingent zurück (dasselbe Mechanismus/Feld wie beim Gast-Kontingent)
- PROJ-8 (Rezeptbibliothek) — **nach dem Refinement**: kein harter Sperr-Redirect mehr; nach Trial-Ende fällt die Bibliothek auf die gast-sichtbare Teilmenge zurück (`is_guest_visible`), analog zur bestehenden Gast-Ansicht
- PROJ-19 (Gast-Modus) — liefert das bereits existierende Muster für die "reduzierte Ansicht + Hinweis"-UI (`isGuest`-Banner auf `/rezepte`), das jetzt für abgelaufene Trials wiederverwendet wird. Liefert außerdem den `reset_scans_on_anon_upgrade`-Trigger, der beim Übergang von Gast zu registriertem Konto feuert und jetzt zusätzlich den Trial-Start setzen muss

## User Stories
- Als neu registrierter Nutzer möchte ich 7 Tage lang vollen Zugriff (tägliche Foto-Analysen, komplette Rezeptbibliothek) haben, damit ich die App in Ruhe kennenlernen kann, bevor ich mich entscheiden muss.
- Als Nutzer möchte ich während dieser 7 Tage klar sehen, wie viel Zeit mir noch bleibt und was sich danach ändert, damit ich nicht überrascht werde.
- Als Nutzer, dessen Trial abgelaufen ist, möchte ich weiterhin die App sinnvoll nutzen können (Freitext-Analyse, ein Foto-Kontingent, Gast-Rezepte, Historie) statt komplett ausgesperrt zu werden, damit die App für mich nutzbar bleibt, auch wenn ich (noch) nicht zahle.
- Als Nutzer, dessen Trial abgelaufen ist, möchte ich an den Stellen, wo mir etwas fehlt (z.B. Rezeptbibliothek, tägliche Foto-Scans), klar und konkret sehen, was ich mit einem Abo zusätzlich bekomme, damit ich eine informierte Kaufentscheidung treffen kann.
- Als Nutzer möchte ich nach Ablauf der 7 Tage über ein günstiges Monats-Abo (4,99€) weiterhin vollen Zugriff bekommen können.
- Als Nutzer möchte ich meine bereits erstellten Analysen (Mahlzeit-Historie) sowie die dauerhaft freien Inhalte (Art of Eating, Sättigungsmatrix) jederzeit einsehen können, unabhängig von meinem Trial-/Abo-Status.
- Als Nutzer möchte ich mein Abo jederzeit selbst über eine vertraute, sichere Oberfläche verwalten oder kündigen können, ohne dafür eine E-Mail schreiben zu müssen.
- Als Product Owner möchte ich, dass Stripe-Schlüssel niemals im Code oder in Git landen, damit kein Dritter Zugriff auf die Zahlungsintegration bekommen kann.

## Out of Scope
- Invite-Codes als Bypass-Mechanismus — _eigene Spec, PROJ-12_
- Admin-Oberfläche zur Code-Generierung — _eigene Spec, PROJ-13_
- Mehrere Preisstufen oder ein Jahresabo — spätere Erweiterung; die Architektur lässt das zu (Stripe Price ID ist konfigurierbar, nicht hartcodiert), wird aber jetzt nicht gebaut
- Granulares Pro-Feature-Berechtigungssystem (z.B. unterschiedliche Tiers mit unterschiedlichen Feature-Sets) — ein einfaches `subscription_status`-Flag plus der Trial-Zeitstempel reichen für die jetzt drei Zustände (Trial/abgelaufen/aktiv)
- Sperrung der Mahlzeit-Historie, von Art of Eating oder der Sättigungsmatrix-Doku — bewusst ausgeschlossen, bleiben immer zugänglich, unabhängig vom Trial-/Abo-Status
- Eigenes Zahlungsformular (Stripe Elements/Custom Checkout) — Stripe Checkout (gehostet) gewählt
- Eigene Abo-Verwaltungsoberfläche (Kündigen, Zahlungsmethode ändern) — Stripe Customer Portal (gehostet) gewählt
- Stripes natives `trial_period_days`-Feature auf der Subscription — das 7-Tage-Übergangsfenster ist eine eigene, anwendungsseitige Phase (Timestamp auf dem Profil), keine Stripe-Subscription-Trial
- Eine Push-/E-Mail-Benachrichtigung genau zum Trial-Ablauf — der Hinweis erscheint stattdessen kontextuell dort, wo die Einschränkung sichtbar wird (Rezeptbibliothek, Foto-Upload), kein separater Benachrichtigungs-Kanal
- Rückwirkende Foto-Scans für Nutzer, deren `photo_scans_remaining` durch den alten, kaputten Mechanismus bereits "hängengeblieben" ist — betrifft nur eine Handvoll Bestandskonten aus der Zeit vor diesem Fix, kein automatisierter Korrektur-Job vorgesehen (siehe Open Questions)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Trial-Start & Trial-Verlauf
- [ ] Angenommen ein Gast erstellt ein Konto (Übergang Gast → registriert), dann wird ab genau diesem Zeitpunkt ein 7-tägiges Trial-Fenster gestartet und auf dem Profil gespeichert (`trial_ends_at` = jetzt + 7 Tage) — unabhängig davon, ob und wie viele Foto-Scans bereits verbraucht wurden
- [ ] Angenommen ein Nutzer registriert sich, dann hat er ab sofort und für die Dauer des Trials: 5 Foto-Analysen pro Tag (täglicher Reset), unbegrenzte Freitext-Analysen und Zugriff auf die vollständige Rezeptbibliothek
- [ ] Angenommen ein Nutzer befindet sich innerhalb des 7-Tage-Trials, wenn er die Mahlzeit-Eingabeseite oder die Rezeptbibliothek aufruft, dann sieht er einen dezenten Hinweis, wie viele Tage ihm noch verbleiben UND was sich nach Ablauf konkret ändert (nicht nur ein bloßer Countdown)

### Nach Trial-Ende (kein Abo, kein Invite-Code)
- [ ] Angenommen das 7-Tage-Trial ist abgelaufen und der Nutzer hat kein aktives Abo und keinen eingelösten Code, wenn er die Rezeptbibliothek öffnet, dann sieht er dieselbe reduzierte, gast-sichtbare Teilmenge wie ein nicht eingeloggter Gast — kein Redirect, kein Rauswurf — zusammen mit einem klaren Hinweis wie viele der insgesamt verfügbaren Rezepte er sieht und einem Link zu `/upgrade`
- [ ] Angenommen das 7-Tage-Trial ist abgelaufen, wenn der Nutzer eine Foto-Analyse startet, dann greift statt des täglichen 5er-Kontingents ein einmaliges Lifetime-Kontingent von 5 Foto-Scans (dasselbe Kontingent-Konzept wie bei einem Gast) — sind diese 5 verbraucht, sieht er einen Hinweis mit Link zu `/upgrade`, kann aber weiterhin Freitext-Analysen unbegrenzt durchführen
- [ ] Angenommen das 7-Tage-Trial ist abgelaufen, wenn der Nutzer eine Freitext-Analyse startet, dann funktioniert das unverändert unbegrenzt — Freitext-Analyse ist zu keinem Zeitpunkt gegatet
- [ ] Angenommen das 7-Tage-Trial ist abgelaufen, wenn der Nutzer `/upgrade` besucht (z.B. über einen der obigen Links), dann sieht er dort einen klaren Vergleich zwischen seinem aktuellen (reduzierten) Zustand und dem, was das Abo zusätzlich freischaltet

### Kauf & Abo-Verwaltung
- [ ] Angenommen ein Nutzer befindet sich auf der `/upgrade`-Seite, wenn er auf "Jetzt freischalten" klickt, dann wird er zu einer von Stripe gehosteten Checkout-Seite weitergeleitet
- [ ] Angenommen ein Nutzer schließt die Zahlung über Stripe Checkout erfolgreich ab, wenn er zur App zurückkehrt, dann hat er sofort wieder vollen Zugriff (tägliche Foto-Analysen, vollständige Rezeptbibliothek) — unabhängig davon, ob sein Trial bereits abgelaufen war
- [ ] Angenommen ein Nutzer hat ein aktives Abo, wenn er auf "Abo verwalten" klickt, dann wird er zum Stripe Customer Portal weitergeleitet
- [ ] Angenommen ein Nutzer kündigt sein Abo im Customer Portal, wenn die aktuelle Abrechnungsperiode endet, dann fällt er in denselben reduzierten Zustand zurück wie ein Nutzer mit abgelaufenem Trial (kein neues 7-Tage-Fenster wird gestartet, keine harte Sperre)
- [ ] Angenommen eine Zahlung schlägt nach Stripes automatischen Wiederholungsversuchen endgültig fehl, wenn der Stripe-Subscription-Status dadurch nicht mehr "active"/"trialing" ist, dann fällt der Nutzer in denselben reduzierten Zustand zurück

### Immer zugänglich, unabhängig vom Trial-/Abo-Status
- [ ] Angenommen ein Nutzer befindet sich in irgendeinem Zustand (Trial, abgelaufen, aktives Abo), dann kann er jederzeit alle bisherigen Analysen in der Mahlzeit-Historie einsehen
- [ ] Angenommen ein Nutzer befindet sich in irgendeinem Zustand, dann kann er jederzeit den Art-of-Eating-Guide und die Sättigungsmatrix-Dokumentation einsehen

### Sicherheit
- [ ] Angenommen der Code wird committet/gepusht, wenn das passiert, dann landen die Stripe-Secrets (Secret Key, Webhook-Signing-Secret) nie im Git-Repository — nur als Server-seitige Env-Variablen, dokumentiert in `.env.local.example` mit Dummy-Werten

## Edge Cases
- Nutzer kehrt erst am Tag 10 zurück (nach Ablauf der 7 Tage) — sieht direkt den reduzierten Zustand, kein nachträgliches Gewähren von Resttagen
- Nutzer abonniert mitten im Trial (z.B. Tag 3) — bekommt sofort vollen Zugriff, das restliche Trial-Fenster wird irrelevant
- Stripe-Webhook trifft verzögert oder gar nicht ein, nachdem der Nutzer erfolgreich bei Stripe Checkout bezahlt hat — Nutzer darf nicht dauerhaft im reduzierten Zustand hängen bleiben, nur weil der Webhook noch nicht verarbeitet wurde
- Nutzer hat bereits ein aktives Abo, ruft aber trotzdem `/upgrade` auf — sollte nicht versehentlich eine zweite Checkout-Session/Zahlung auslösen können, zeigt stattdessen den "Pro-Mitglied"-Zustand
- Stripe-API ist kurzzeitig nicht erreichbar, während eine Checkout-Session erstellt werden soll — generische Fehlermeldung, kein App-Absturz
- Nutzer löst während oder nach dem Trial einen Invite-Code ein (PROJ-12) — bekommt vollen Zugriff, unabhängig vom Ablaufdatum des Trials
- Nutzer registriert sich, nutzt die App eine Weile nicht, kommt aber innerhalb der 7 Tage zurück — Trial läuft im Hintergrund unverändert weiter (kalenderbasiert, nicht nutzungsbasiert), keine Verlängerung durch Inaktivität
- Nutzer hat als Gast bereits alle 5 Lifetime-Foto-Scans verbraucht, registriert sich danach — bekommt durch die Registrierung ein frisches, tägliches 5er-Kontingent für die Dauer des Trials (bestehendes Verhalten von `reset_scans_on_anon_upgrade`, unverändert)
- Nutzer war früher schon einmal Trial-Nutzer, dessen Trial abgelaufen ist, kündigt später ein Abo wieder — fällt in den reduzierten Zustand zurück, kein zweites 7-Tage-Trial wird jemals gewährt (Trial ist ein einmaliges, lebenslanges Ereignis pro Konto)

## Technical Requirements (optional)
- Sicherheit: `STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET` ausschließlich als serverseitige Env-Variablen (kein `NEXT_PUBLIC_`-Präfix), niemals im Code hartcodiert, niemals committet
- Webhook-Endpunkt muss die Stripe-Signatur verifizieren, bevor ein Event verarbeitet wird
- Preis (4,99€) ist über eine Stripe Price ID konfigurierbar, nicht im Code hartcodiert — spätere Preisänderungen erfordern keinen Code-Deploy

## Open Questions
- [x] Genauer Formulierungstext für den Countdown-Hinweis — Detail für `/frontend`, jetzt zusätzlich präzisiert: der Hinweis muss auch erklären, WAS sich nach Ablauf ändert, nicht nur wie viele Tage bleiben (siehe Acceptance Criteria) (2026-07-23)
- [x] Wie soll das 7-Tage-Fenster jetzt ausgelöst werden, nachdem der ursprüngliche Trigger ("Foto-Scans aufgebraucht") durch PROJ-10s Umstellung auf tägliche Foto-Limits nicht mehr funktioniert? → Feste 7 Tage ab Registrierung (Gast→Konto-Übergang), kalenderbasiert statt nutzungsbasiert (2026-07-23)
- [x] Was passiert nach Trial-Ende mit Rezeptbibliothek, Foto-Analyse und Freitext-Analyse jeweils einzeln? → Rezeptbibliothek fällt auf gast-sichtbare Teilmenge zurück, Foto-Analyse fällt auf ein einmaliges Lifetime-Kontingent von 5 zurück (statt täglich 5), Freitext-Analyse bleibt für immer unbegrenzt und wird nie gegatet (2026-07-23)
- [x] Harter Redirect zur Paywall-Seite oder Inline-Rückfall auf eine reduzierte Ansicht? → Inline-Rückfall, kein Redirect mehr — nichts wird nach Trial-Ende komplett gesperrt, nur reduziert (2026-07-23)
- [x] Was passiert mit Bestandskonten, deren `photo_scans_remaining`/`trial_ends_at` durch den gefundenen Bug bereits inkonsistent sind? → Einmalige Backfill-Migration (`trial_ends_at = created_at + 7 Tage`), siehe Tech Design Refinement Abschnitt D + Technical Decisions. Umsetzung folgt in `/backend` (2026-07-23)
- [ ] Genauer Wortlaut für den "X von Y Rezepten sichtbar"-Hinweis im abgelaufenen Trial-Zustand (Wiederverwendung/Anpassung des bestehenden Gast-Banners aus PROJ-19) — Detail für `/frontend`

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Paywall greift erst nach Verbrauch der 3 kostenlosen Foto-Scans, nicht direkt nach Registrierung | Nutzer soll die App erst kennenlernen können, bevor eine Kaufentscheidung gefordert wird | 2026-06-16 |
| 7-tägiges Übergangsfenster nach Scan-Limit, danach Sperre von Freitext-Analyse + Rezeptbibliothek | Revidiert PROJ-10s "Freitext immer unbegrenzt" bewusst — gibt dem Nutzer eine faire Übergangsphase statt einer harten Sperre direkt bei 0 Scans | 2026-06-16 |
| Mahlzeit-Historie bleibt von der Sperre ausgenommen | Eigene, bereits erstellte Daten einzusehen fühlt sich nicht wie eine zusätzliche Leistung an, sondern wie Besitz — Sperre dort wäre Datenverlust-Gefühl statt Kaufanreiz | 2026-06-16 |
| Einfaches `subscription_status`-Flag statt granularem Pro-Feature-Berechtigungssystem | Aktuell gibt es nur einen gegateten Bereich (Freitext + Rezepte); ein Tier-System wäre spekulative Architektur ohne aktuellen Bedarf, lässt sich aber ohne Umbau später ergänzen | 2026-06-16 |
| Preis: 4,99€/Monat, Stripe Checkout (gehostet) statt eigenem Formular | Niedrige Einstiegshürde; Stripe übernimmt PCI-Compliance komplett, deutlich weniger Code und Sicherheitsverantwortung für eine Solo-Entwickler-App | 2026-06-16 |
| Abo-Verwaltung über Stripe Customer Portal statt eigener UI | Kündigung, Zahlungsmethode, Rechnungen — alles von Stripe gehostet, kein eigener Code nötig | 2026-06-16 |
| Kündigung: Zugriff bis Ende der Abrechnungsperiode, danach Sperre ohne neuen Trial | Entspricht Stripes Standardverhalten, kein Sonderfall-Code nötig — einfach prüfen ob Subscription-Status aktiv ist | 2026-06-16 |
| Kein Stripe-natives Trial — eigenes Übergangsfenster-Feld auf dem Profil | Stripe-Trials sind an die Subscription-Erstellung gekoppelt; unser Fenster beginnt aber beim Scan-Verbrauch, lange bevor überhaupt eine Subscription existiert | 2026-06-16 |
| Deploy zunächst mit Stripe-Test-Modus-Keys, Live-Umstellung als separater, bewusster Schritt | PROJ-10 (Scan-Limit + 7-Tage-Fenster) lief erst seit diesem Tag — frühestens in 7 Tagen könnte überhaupt ein echter Nutzer die Paywall sehen, kein Zeitdruck. Live-Keys erfordern eigenes Produkt/Preis/Webhook im Live-Modus von Stripe (komplett getrennt vom Test-Modus) | 2026-06-16 |

#### Refinement (2026-07-23): Trial-Trigger repariert + Rückfall-Modell statt harter Sperre

**Auslöser:** Bei der Recherche zu einer unabhängigen Anfrage (aktuelle Scan-Limits erklären) fiel auf, dass der komplette 7-Tage-Trial-Mechanismus faktisch tot war: `photo_scans_remaining` wird seit PROJ-10s Umstellung auf tägliche Foto-Limits (Commit `773b35c`, 2026-07-20) bei registrierten Nutzern nie mehr verändert, wodurch `hasAccess` in `paywall.ts` dauerhaft `true` bleibt — UND `decrement_photo_scan()` setzt in seiner aktuellen Fassung `trial_ends_at` gar nicht mehr, unabhängig vom Nutzertyp. Beide Findings zusammen bedeuten: kein einziger registrierter Nutzer bekommt seit der PROJ-10-Umstellung jemals ein Trial-Fenster oder eine Paywall zu sehen.

| Decision | Rationale | Date |
|----------|-----------|------|
| Trial-Trigger von "Foto-Scans aufgebraucht" auf "feste 7 Tage ab Registrierung" umgestellt | Der ursprüngliche Trigger ist mit täglich resettenden Foto-Scans konzeptionell nicht mehr sinnvoll möglich (Scans gehen bei einem täglichen Limit nie mehr "aus") — ein kalenderbasierter Trigger ist zudem einfacher zu kommunizieren ("noch 5 Tage") als ein nutzungsabhängiger | 2026-07-23 |
| Nach Trial-Ende: Rückfall auf reduzierten Zustand statt harter Sperre/Redirect | Nutzer soll die App weiterhin sinnvoll nutzen können statt komplett ausgesperrt zu werden — motiviert die Kaufentscheidung durch sichtbaren, aber nicht bestrafenden Komfortverlust, statt durch eine Wand | 2026-07-23 |
| Rezeptbibliothek fällt nach Trial-Ende auf die gast-sichtbare Teilmenge zurück (`is_guest_visible`), inkl. Wiederverwendung des bestehenden Gast-Banners aus PROJ-19 | Kein neuer UI-Mechanismus nötig — die "reduzierte Ansicht + Hinweis"-Erfahrung existiert für Gäste bereits und lässt sich 1:1 auf abgelaufene Trials übertragen | 2026-07-23 |
| Foto-Analyse fällt nach Trial-Ende auf ein einmaliges Lifetime-Kontingent von 5 zurück (statt täglich 5) | Konsistent mit dem Gast-Kontingent — derselbe Mechanismus (`photo_scans_remaining`), nur der Auslöser für welchen Zähler-Typ gilt (täglich vs. lifetime) ändert sich von "ist der Nutzer anonym" zu "läuft noch das Trial oder ein Abo" | 2026-07-23 |
| Freitext-Analyse bleibt zu jedem Zeitpunkt für jeden Nutzertyp unbegrenzt, auch nach Trial-Ende | Explizit vom Product Owner korrigiert, nachdem eine Asymmetrie aufgezeigt wurde (ein abgelaufener registrierter Nutzer hätte sonst schlechter dagestanden als ein Gast) — Freitext ist kein Kaufanreiz, nur Foto-Analyse und die volle Rezeptbibliothek sind es | 2026-07-23 |
| `/upgrade` bleibt als eigene Seite mit vollständigem Feature-Vergleich bestehen, wird aber nicht mehr erzwungen (kein Redirect), sondern von den reduzierten Ansichten aus verlinkt | Passt zum "Rückfall statt Sperre"-Modell — die Seite ist jetzt eine Zielseite für einen informierten Klick, keine unausweichliche Sackgasse mehr | 2026-07-23 |
| Trial ist ein einmaliges, lebenslanges Ereignis pro Konto — kein zweites Trial nach einer späteren Kündigung | Verhindert, dass Nutzer durch Abo-Kündigung + irgendeinen Reset-Trigger wiederholt kostenlose Trial-Phasen bekommen; entspricht der bereits bestehenden Entscheidung "`trial_ends_at` wird einmalig gesetzt, nie zurückgesetzt" | 2026-07-23 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Zugriffsprüfung direkt in den Server Components (`AnalysePage`, `RezeptePage`) über eine gemeinsame Prüf-Funktion, statt dupliziert | Etabliertes Muster (wie `requireAdmin()` aus PROJ-9); eine Stelle für die Zugriffslogik statt zwei | 2026-06-16 |
| `subscription_status` wird ausschließlich über den Stripe-Webhook aktualisiert, nie direkt nach dem Checkout-Redirect | Der Webhook ist signiert und kommt direkt von Stripe — ein Client-Redirect ließe sich fälschen oder wiederholen | 2026-06-16 |
| Zusätzliche direkte Session-Prüfung beim Rückkehr-Redirect von Checkout (ergänzend zum Webhook) | Löst die Webhook-Verzögerung (offene Frage aus der Spec), ohne der Browser-Antwort blind zu vertrauen — Session-ID wird live bei Stripe nachgefragt | 2026-06-16 |
| Stripe Node-SDK (`stripe`-Paket) nur serverseitig, kein `@stripe/stripe-js` im Browser | Checkout läuft komplett über Redirect zu einer von Stripe gehosteten URL — kleinere Angriffsfläche, weniger Code | 2026-06-16 |
| `trial_ends_at` wird einmalig gesetzt, nie zurückgesetzt | Verhindert mehrfache Übergangsfenster durch wiederholtes Verbrauchen des Foto-Scan-Counters | 2026-06-16 |
| Seitenpfad `/upgrade` für die Paywall-Seite | Klar, kurz, eindeutig | 2026-06-16 |
| `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_PRICE_ID` ausschließlich als Server-Env-Variablen, kein `NEXT_PUBLIC_`-Präfix | Secrets dürfen nie im Browser sichtbar oder im Git-Repository landen — lokal in `.env.local` (gitignored), produktiv im Vercel-Dashboard | 2026-06-16 |

#### Refinement (2026-07-23) — beim `/refine`-Durchgang entdeckt
| Decision | Rationale | Date |
|----------|-----------|------|
| `photo_scans_remaining` bleibt während des gesamten Trials unangetastet (nur der tägliche Zähler `photo_scans_today_count` wird während des Trials verwendet) — kann daher nach Trial-Ende direkt als Lifetime-Kontingent reaktiviert werden, ohne ein neues Datenfeld einzuführen | Beim Refinement entdeckt: der bestehende `reset_scans_on_anon_upgrade`-Trigger setzt `photo_scans_remaining = 5` bereits beim Gast→Konto-Übergang und rührt es danach nie wieder an, solange der tägliche Zähler greift — dieselbe Spalte, derselbe Mechanismus wie beim Gast-Kontingent, spart eine neue Migration | 2026-07-23 |
| `reset_scans_on_anon_upgrade`-Trigger muss zusätzlich `trial_ends_at = now() + 7 Tage` setzen (statt wie aktuell `NULL`) | Der Trigger feuert exakt am Registrierungs-Zeitpunkt (Gast→Konto-Übergang) — das ist jetzt der neue Trial-Start-Zeitpunkt. Aktuell setzt der Trigger `trial_ends_at` fälschlich auf `NULL` zurück, was Teil des gefundenen Bugs ist | 2026-07-23 |
| `decrement_photo_scan()` muss um die Fallentscheidung "täglicher vs. Lifetime-Zähler" erweitert werden, basierend auf Trial-/Abo-Status statt nur auf `is_anonymous` | Aktuell entscheidet die Funktion nur zwischen Gast (Lifetime) und registriert (täglich) — braucht jetzt einen dritten Fall: registriert, aber Trial abgelaufen und kein Abo → Lifetime, wie ein Gast | 2026-07-23 |

#### Refinement (2026-07-23) — bei `/architecture` festgelegt
| Decision | Rationale | Date |
|----------|-----------|------|
| `getAccessStatus()` liefert künftig ein einziges Signal ("volle" vs. "reduzierte Ausstattung") statt eines reinen Ja/Nein-`hasAccess`, und dieses Signal steuert sowohl den Foto-Kontingent-Typ als auch den Rezeptbibliotheks-Umfang gemeinsam | Beide Dinge ändern sich immer gemeinsam und aus denselben Gründen — ein Signal statt zwei potenziell auseinanderdriftender Flags | 2026-07-23 |
| Freitext-Analyse-Prüfung komplett aus `getAccessStatus()`/den Seiten entfernt, statt sie weiterhin zu berechnen und zu ignorieren | Toter Code, der fälschlich eine Einschränkung suggeriert, ist eine Falle für zukünftige Entwickler — sauberer, das Konzept taucht in der Zugriffslogik gar nicht mehr auf | 2026-07-23 |
| Bestehende "locked card"-Optik und der bestehende Gast-Info-Banner auf `/rezepte` werden 1:1 für den reduzierten Trial-Zustand wiederverwendet (Ziel-Link wird zu `/upgrade` statt `/registrieren`), ebenso der bestehende Sperrbildschirm auf der Rezept-Detailseite (Button-Text/Ziel angepasst) | Bereits existierende, getestete UI — spart Doppelarbeit und stellt sicher, dass sich "reduzierter Trial-Nutzer" optisch identisch zu "Gast" anfühlt, wie in der Spec gefordert | 2026-07-23 |
| Kein Redirect mehr auf `AnalysePage`/`RezeptePage` — beide Seiten rendern immer, nur der Inhalt/die Zahlen ändern sich je nach Signal | Direkte technische Umsetzung der Produkt-Entscheidung "Rückfall statt Sperre" aus dem Refinement | 2026-07-23 |
| Einmalige Backfill-Migration für Bestandskonten (`trial_ends_at = auth.users.created_at + 7 Tage` für alle seit der PROJ-10-Umstellung registrierten, noch nicht bereits mit gesetztem `trial_ends_at` versehenen Konten) | Löst die in der Spec offen gelassene Frage zu bereits inkonsistenten Bestandskonten — ohne Backfill blieben alle seit 2026-07-20 registrierten, nicht zahlenden Nutzer für immer im "volle Ausstattung"-Zustand | 2026-07-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponentenstruktur

```
AnalysePage (Server Component) — bereits PROJ-10-gated
+-- NEU: zusätzliche Zugriffsprüfung (Trial aktiv? Abo aktiv? Code eingelöst?)
+-- Gesperrt -> Weiterleitung zu /upgrade
+-- Im Übergangsfenster -> Countdown-Hinweis zusätzlich zum Foto-Scan-Hinweis

RezeptePage (Server Component) — bisher offen für alle eingeloggten Nutzer
+-- NEU: gleiche Zugriffsprüfung wie AnalysePage
+-- Gesperrt -> Weiterleitung zu /upgrade
+-- Im Übergangsfenster -> Countdown-Hinweis oben auf der Seite

/upgrade (NEU — Paywall-Seite)
+-- Erklärtext + Preis + "Jetzt freischalten" -> Stripe Checkout
+-- Hat der Nutzer bereits ein Abo: "Abo verwalten" -> Stripe Customer Portal
+-- Platz für "Ich habe einen Code"-Link (Funktion kommt mit PROJ-12)

Webhook-Endpunkt (NEU, API-Route)
+-- Empfängt Stripe-Events direkt von Stripe, aktualisiert den Abo-Status
```

### Datenmodell (in Worten)

```
profiles (bestehende Tabelle)
+ trial_ends_at — Zeitstempel, wird EINMALIG gesetzt wenn der Foto-Scan-Counter
  zum ersten Mal 0 erreicht ("jetzt + 7 Tage"), danach nie mehr verändert
+ stripe_customer_id — Referenz auf den Kunden in Stripe, leer bis zur ersten Zahlung
+ subscription_status — z.B. "active"/"canceled"/"past_due", leer = kein Abo.
  Wird AUSSCHLIESSLICH über den Stripe-Webhook aktualisiert, nie direkt vom Client

Zugriff auf Freitext-Analyse + Rezeptbibliothek ist erlaubt, wenn EINES zutrifft:
  - photo_scans_remaining > 0, ODER
  - trial_ends_at ist leer oder liegt noch in der Zukunft, ODER
  - subscription_status ist "active"/"trialing", ODER
  - ein gültiger Invite-Code wurde eingelöst (Datenmodell folgt mit PROJ-12)
Sonst: Weiterleitung zur Paywall-Seite
```

### API-Verhalten

- **`POST /api/stripe/checkout`** — erstellt eine Checkout-Session für den eingeloggten Nutzer, gibt die Stripe-URL zurück
- **`POST /api/stripe/portal`** — erstellt einen Customer-Portal-Link (nur wenn bereits `stripe_customer_id` existiert)
- **`POST /api/stripe/webhook`** — empfängt Events direkt von Stripe (nicht vom Browser), verifiziert die Signatur, aktualisiert `subscription_status`
- **Webhook-Fallback:** Beim Rückkehr-Redirect von Checkout wird die Session zusätzlich direkt bei Stripe nachgefragt, damit der Nutzer nicht auf einen verzögerten Webhook warten muss

### Sicherer Workflow für die Stripe-Keys

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` — ausschließlich Server-Env-Variablen, niemals `NEXT_PUBLIC_`-Präfix
- Lokal in `.env.local` (bereits gitignored, vom Product Owner bereits mit Test-Mode-Werten befüllt), in Produktion direkt im Vercel-Dashboard eintragen
- `.env.local.example` bekommt die drei Variablennamen mit Dummy-Werten dokumentiert
- Der Webhook verifiziert jede Anfrage mit `STRIPE_WEBHOOK_SECRET` — gefälschte "Abo aktiv"-Events sind dadurch nicht möglich
- Webhook-Secret und Live-Mode-Keys folgen erst kurz vor dem Deployment (Webhook-Endpunkt muss erst existieren, bevor er in Stripe registriert werden kann)

### Dependencies (Pakete)
- `stripe` — offizielles Node-SDK (serverseitig)

---

## Tech Design — Refinement (2026-07-23): Trial-Trigger-Fix + Rückfall-Modell

### A) Komponentenstruktur

Die zentrale Änderung: **Ein einziges Signal statt eines Ja/Nein-Zugriffsschalters.** Bisher gab es ein binäres `hasAccess` (alles offen oder alles zu). Jetzt gibt es ein Signal "volle Ausstattung oder reduzierte Ausstattung", das an drei Stellen unterschiedlich wirkt — aber nirgends mehr zu einem Rauswurf führt.

```
AnalysePage (Server Component)
+-- GEÄNDERT: kein Redirect zu /upgrade mehr
+-- Freitext-Analyse: immer erlaubt, unabhängig vom Status
+-- Foto-Analyse: zeigt "X von 5 heute" (voller Zustand) ODER "X von 5 insgesamt" (reduzierter Zustand)
     — dieselbe Zahl-Anzeige wie heute schon für Gäste, nur jetzt auch für abgelaufene Trials
+-- Im Trial -> Hinweis "noch X Tage voller Zugriff" + was sich danach ändert

RezeptePage (Server Component)
+-- GEÄNDERT: kein Redirect zu /upgrade mehr
+-- Voller Zustand -> komplette Bibliothek, wie heute für Trial-Nutzer/Abonnenten
+-- Reduzierter Zustand -> WIEDERVERWENDUNG des bestehenden Gast-Mechanismus:
     dieselbe "locked card"-Optik (Vorhängeschloss-Icon auf nicht freigegebenen Rezept-Karten),
     derselbe Hinweis-Banner ("X von Y Rezepten sichtbar"), nur mit Link zu /upgrade
     statt zu /registrieren

Rezept-Detailseite (bereits bestehender Gast-Sperrbildschirm)
+-- GEÄNDERT: derselbe Sperrbildschirm erscheint jetzt auch für reduzierte
     registrierte Nutzer, mit angepasstem Button ("Jetzt Pro werden" -> /upgrade
     statt "Kostenlos registrieren" -> /registrieren)

/upgrade
+-- NEU: zeigt jetzt einen konkreten Vergleich "das hast du gerade" vs.
     "das bekommst du mit Pro" statt nur Preis + Button
+-- Rest unverändert (Checkout/Portal-Flow, siehe ursprüngliches Tech Design oben)
```

### B) Datenmodell (in Worten, aktualisiert)

```
profiles (bestehende Tabelle, keine neuen Spalten nötig)
+ trial_ends_at — GEÄNDERT: wird jetzt beim Übergang Gast -> registriertes Konto
  gesetzt ("jetzt + 7 Tage"), nicht mehr beim Verbrauch der Foto-Scans
+ photo_scans_remaining — bekommt eine neue Doppel-Rolle: während des Trials
  bleibt es unangetastet (auf 5, vom Registrierungs-Reset); nach Trial-Ende
  UND ohne Abo wird es zum aktiven, sich nie mehr auffüllenden Kontingent
  (exakt dasselbe Feld/Verhalten wie bei einem Gast)
+ photo_scans_today_count / photo_scans_today_date — bleibt aktiv, SOLANGE
  volle Ausstattung gilt (Trial läuft ODER Abo aktiv ODER Invite-Code)

"Volle Ausstattung" (täglich 5 Foto-Scans + komplette Rezeptbibliothek) gilt, wenn EINES zutrifft:
  - trial_ends_at liegt noch in der Zukunft, ODER
  - subscription_status ist "active"/"trialing", ODER
  - ein gültiger Invite-Code wurde eingelöst
Sonst: reduzierte Ausstattung (Lifetime-Foto-Kontingent + gast-sichtbare Rezepte) —
  NICHT mehr "kein Zugriff", sondern ein eigener, dauerhaft nutzbarer Zustand

Freitext-Analyse ist AUSSCHLIESSLICH an "ist der Nutzer eingeloggt" gekoppelt,
nicht mehr an obiges Signal — komplett aus der Zugriffsprüfung entfernt
```

### C) Tech-Entscheidungen (Begründung)

- **Warum ein einziges "volle/reduzierte Ausstattung"-Signal statt getrennter Flags pro Feature?** Foto-Kontingent-Typ und Rezeptbibliothek-Umfang ändern sich immer gleichzeitig und aus denselben Gründen (Trial läuft/läuft ab, Abo aktiv/inaktiv) — ein gemeinsames Signal spiegelt das wider und verhindert, dass beide Werte auseinanderdriften könnten.
- **Warum Freitext-Analyse komplett aus der Prüfung entfernen statt nur "immer true" zurückzugeben?** Weniger Code, der etwas Falsches suggerieren könnte — eine Bedingung, die nie etwas verhindert, ist potenzielle Verwirrung für zukünftige Entwickler. Sauberer, sie taucht in der Zugriffslogik gar nicht mehr auf.
- **Warum dieselbe "locked card"-Komponente und derselbe Gast-Banner wiederverwenden statt etwas Neues zu bauen?** Diese UI existiert bereits, ist bereits getestet und optisch etabliert — ein Nutzer, dessen Trial abläuft, soll sich genau so "auf Gast-Niveau" fühlen, wie es die Wortwahl in der Spec vorgibt. Zwei verschiedene UIs für dasselbe Konzept wären unnötige Doppelarbeit und Inkonsistenz-Risiko.
- **Warum kein Redirect mehr, sondern Inline-Darstellung?** Direkte Umsetzung der Refinement-Entscheidung "Rückfall statt Sperre" — ein Redirect ist per Definition ein Rauswurf, das widerspricht dem neuen Modell strukturell.
- **Warum wird der Trial-Start jetzt im bestehenden `reset_scans_on_anon_upgrade`-Trigger gesetzt, statt einer neuen, separaten Stelle im Anwendungscode?** Dieser Trigger feuert bereits exakt am richtigen Zeitpunkt (Gast → registriertes Konto) und ist bereits die Stelle, die `photo_scans_remaining` zurücksetzt — beide Felder gehören fachlich zusammen und werden jetzt an derselben Stelle gesetzt, atomar mit der Kontoerstellung, kein zusätzlicher Netzwerk-Roundtrip vom Anwendungscode aus nötig.
- **Warum `decrement_photo_scan()` um einen dritten Fall erweitern statt einer komplett neuen Funktion?** Die Funktion kennt bereits den Unterschied zwischen "täglich" und "lifetime" (für Gäste). Der neue Fall (registriert, aber reduziert) nutzt exakt denselben "lifetime"-Zweig wie Gäste — nur die Bedingung, WANN dieser Zweig gilt, wird erweitert (nicht mehr nur "ist anonym", sondern "hat keine volle Ausstattung").

### D) Migration bestehender Konten (offene Frage aus der Spec)

Bestandskonten, die seit der PROJ-10-Umstellung (2026-07-20) registriert wurden, haben aktuell kein `trial_ends_at` gesetzt (der Bug betraf sie alle). Empfehlung: eine einmalige Backfill-Migration setzt für alle betroffenen Konten `trial_ends_at = created_at + 7 Tage` (Registrierungsdatum aus `auth.users.created_at`) — dadurch werden auch länger schon registrierte, nie zahlende Bestandskonten korrekt in den reduzierten Zustand versetzt, statt für immer versehentlich volle Ausstattung zu behalten. Wird in `/backend` konkret umgesetzt.

### E) Keine neuen Pakete
Reine Logik-/Daten-Änderung an bereits vorhandenen Feldern und Komponenten — keine neue Abhängigkeit.

## Implementation Notes (Backend)

**Migration (Supabase, angewendet):**
- `add_paywall_fields_to_profiles` — neue Spalten `trial_ends_at`, `stripe_customer_id` (UNIQUE), `subscription_status` (CHECK auf gültige Stripe-Statuswerte) auf `profiles`. Tabellen-weites `UPDATE` für `authenticated`/`anon` war bereits in PROJ-10 entzogen — neue Spalten sind dadurch automatisch ohne weiteres `REVOKE` vor Client-Manipulation geschützt (per `information_schema.column_privileges` verifiziert: nur `SELECT`/`INSERT`/`REFERENCES`, kein `UPDATE`).
- `decrement_photo_scan()` (PROJ-10) erweitert: setzt `trial_ends_at` einmalig auf "jetzt + 7 Tage", wenn der Counter durch dasselbe atomare Update auf 0 fällt und noch kein Fenster existiert — bleibt eine einzige Operation, kein Race-Condition-Risiko. Per simuliertem Nutzer (Transaktion mit Rollback) verifiziert: 3 Aufrufe → 0, `trial_ends_at` exakt +7 Tage gesetzt.

**Code:**
- `src/lib/stripe.ts` — server-only Stripe-Client (`STRIPE_SECRET_KEY`)
- `src/lib/paywall.ts` — `getAccessStatus(supabase, userId)`: zentrale Zugriffsprüfung (aktives Abo ODER noch Foto-Scans übrig ODER Übergangsfenster läuft), liefert auch `trialDaysRemaining` für den Countdown-Hinweis. PROJ-12 ergänzt hier später die Invite-Code-Bedingung.
- `src/app/api/stripe/checkout/route.ts` — erstellt Checkout-Session (Subscription-Modus), nutzt vorhandene `stripe_customer_id` falls vorhanden statt einen Duplikat-Kunden anzulegen
- `src/app/api/stripe/portal/route.ts` — erstellt Customer-Portal-Link, `404` falls kein Abo vorhanden
- `src/app/api/stripe/webhook/route.ts` — verifiziert Signatur mit `STRIPE_WEBHOOK_SECRET`, verarbeitet `checkout.session.completed`, `customer.subscription.updated`/`.deleted` (Admin-Client, da kein Nutzer-Session-Kontext bei einem Webhook)
- `src/app/api/stripe/sync-session/route.ts` — Webhook-Fallback: fragt die Checkout-Session beim Rückkehr-Redirect direkt bei Stripe nach (nicht der Browser-URL vertrauen), Sicherheitscheck dass `client_reference_id` zum eingeloggten Nutzer passt (403 sonst)
- `src/types/database.ts` — `profiles`-Typen ergänzt
- `src/lib/env.ts` — `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_PRICE_ID` zu `serverOnly` ergänzt

**Tests:** 29 neue Tests (4 Routen + `paywall.ts`-Unit-Tests), alle grün. Bestehende Suite unverändert (87/94 — die 7 Fehler in `admin/rezepte` sind vorbestehend, nicht PROJ-11). `npm run build` erfolgreich.

**Sicherheits-Hinweis:** Konnte `.env.local.example` nicht selbst aktualisieren — `.env*`-Dateien sind für mich aus Sicherheitsgründen komplett gesperrt (auch lesend). Der Product Owner hat die drei Variablennamen bereits selbst in `.env.local`/`.env.local.example` ergänzt.

**Bewusst nicht umgesetzt (gehört zu `/frontend`):**
- `/upgrade`-Seite (Paywall-UI, Checkout-Button, Customer-Portal-Link, "Ich habe einen Code"-Platzhalter für PROJ-12)
- Einbindung von `getAccessStatus()` in `AnalysePage`/`RezeptePage` inkl. Redirect bei fehlendem Zugriff
- Countdown-Hinweis-UI während des Übergangsfensters

## Implementation Notes (Backend) — Refinement (2026-07-23)

**Migration** (`proj11_fix_trial_trigger_and_photo_scan_fallback`, angewendet auf Projekt `endlichsattsupybase`):
- `reset_scans_on_anon_upgrade()` (Trigger auf `auth.users`, feuert beim Gast→Konto-Übergang): setzt jetzt zusätzlich `trial_ends_at = now() + interval '7 days'`, statt es wie zuvor fälschlich auf `NULL` zu setzen. `photo_scans_remaining = 5` bleibt unverändert. Zusätzlich `SET search_path TO 'public'` ergänzt (fehlte vorher, kleine Sicherheits-Verbesserung nebenbei).
- `decrement_photo_scan()`: dritter Fall ergänzt. Liest jetzt zusätzlich `trial_ends_at`/`subscription_status`/`invite_code_redeemed_at` und berechnet dieselbe "volle vs. reduzierte Ausstattung"-Bedingung wie `getAccessStatus()` in TypeScript (bewusst dieselbe Logik an zwei Stellen — DB-Funktion und `paywall.ts` müssen unabhängig zum selben Ergebnis kommen, da die DB-Funktion für die tatsächliche Buchung zuständig ist und `paywall.ts` nur für die Anzeige). Bei voller Ausstattung: täglicher Zähler wie bisher. Bei reduzierter Ausstattung: derselbe Lifetime-Zweig wie bei einem Gast (`photo_scans_remaining`).
- Backfill: `UPDATE profiles SET trial_ends_at = auth.users.created_at + 7 Tage` für alle nicht-anonymen Konten — ersetzt auch bereits vorhandene (nach dem alten, jetzt obsoleten Mechanismus berechnete) Werte. Betraf alle 4 zum Zeitpunkt der Migration existierenden registrierten Konten; harmlos für aktive Abos/Invite-Codes, da deren Zugriff nicht von `trial_ends_at` abhängt.
- Keine neuen Spalten, keine neue Migration-Infrastruktur — reine Funktions-/Daten-Korrektur.

**Code:**
- `src/lib/paywall.ts` — `getAccessStatus()` überarbeitet: `hasAccess` (jetzt dokumentiert als "volle Ausstattung") berechnet sich nur noch aus `isSubscribed || hasInviteAccess || trialActive` — `photo_scans_remaining` fließt nicht mehr ein (war der Kern des Bugs: dieses Feld wird bei registrierten Nutzern während des Trials nie verändert, wodurch es `hasAccess` fälschlich dauerhaft auf `true` hielt). `trialActive` behandelt `trial_ends_at = null` jetzt als **nicht aktiv** (sicherer Default) statt wie zuvor als "noch nicht gestartet, also aktiv" — diese Umkehr ist beabsichtigt und Teil des Fixes. `photoScansRemaining` liefert jetzt je nach `hasAccess` entweder den Tages-Zähler oder den Lifetime-Zähler — muss exakt zur Verzweigung in `decrement_photo_scan()` passen (gleiche Bedingung, zwei Implementierungen).
- Keine Änderungen an den Stripe-Routen, dem Webhook-Handler oder dem Datenmodell selbst nötig — der Fix betrifft ausschließlich, WANN "volle Ausstattung" gilt und was bei "reduziert" mit dem Foto-Kontingent passiert.

**Tests:** `paywall.test.ts` erweitert — ein bestehender Test drehte sich um (demonstrierte vorher fälschlich, dass verbleibende Lifetime-Scans allein Zugriff gewähren; zeigt jetzt das korrekte Gegenteil), 4 neue Tests für das duale Foto-Kontingent-Verhalten (Tages-Reset bei voller Ausstattung inkl. bereits verbrauchter Scans, Lifetime-Rückfall bei reduzierter Ausstattung, kein negativer Wert). 11/11 grün. Gesamte Suite: 228/228 grün, `tsc --noEmit`/ESLint fehlerfrei, `npm run build` erfolgreich.

**Live-Verifikation gegen die echte Datenbank** (nicht nur gemockt):
- `decrement_photo_scan()` direkt per SQL simuliert (`set local role authenticated` + `request.jwt.claims`, Transaktion mit Rollback, keine echten Daten verändert): bei abgelaufenem Trial (echtes QA-Konto, `trial_ends_at` in der Vergangenheit) wurde korrekt `photo_scans_remaining` dekrementiert (9999→9998), `photo_scans_today_count` blieb unverändert. Mit testweise auf +3 Tage gesetztem `trial_ends_at` (gleiche Transaktion, Rollback) griff korrekt der Tages-Zähler (`photo_scans_today_count` 0→1), `photo_scans_remaining` blieb unangetastet.
- Trigger-Definition und -Aktivierung nach der Migration erneut abgefragt und bestätigt (`reset_scans_on_anon_upgrade`, aktiv auf `auth.users`).
- End-to-End gegen den echten Dev-Server: QA-Testkonto mit abgelaufenem Trial (durch Backfill korrekt gesetzt) wird beim Aufruf von `/analyse` jetzt zuverlässig zu `/upgrade` weitergeleitet — vorher (mit dem Bug) wäre das nie passiert, da `hasAccess` permanent `true` war. Bestätigt den Fix End-to-End, bevor der Redirect selbst in `/frontend` durch das neue "kein Rauswurf"-Modell ersetzt wird.

**Bewusst nicht umgesetzt (gehört zu `/frontend`):**
- Entfernen der `redirect('/upgrade')`-Aufrufe in `AnalysePage`/`RezeptePage` (Rückfall-Modell statt harter Sperre)
- Wiederverwendung der "locked card"-Optik + des Gast-Banners für den reduzierten Trial-Zustand
- Angepasster Sperrbildschirm-Text auf der Rezept-Detailseite ("Jetzt Pro werden" statt "Kostenlos registrieren")
- Neuer Vergleichs-Abschnitt auf `/upgrade` ("das hast du jetzt" vs. "das bekommst du mit Pro")
- Countdown-Hinweis-Text, der auch erklärt WAS sich nach Trial-Ende ändert (nicht nur die Tage)

## Implementation Notes (Frontend)

- `src/app/upgrade/page.tsx` (NEU) — liest `getAccessStatus()`, übergibt `subscriptionStatus` und den `?session_id`-Query-Parameter (Rückkehr von Checkout) an `UpgradeView`
- `src/components/upgrade-view.tsx` (NEU, Client Component):
  - bei vorhandener `session_id`: ruft `POST /api/stripe/sync-session` auf (Webhook-Fallback), zeigt währenddessen "Zahlung wird bestätigt…"
  - Abo aktiv (`active`/`trialing`) → "Du bist Pro-Mitglied" + "Abo verwalten" (`POST /api/stripe/portal`) + Link zurück zu `/analyse`
  - kein Abo → Preis (4,99€/Monat), "Jetzt freischalten" (`POST /api/stripe/checkout`), dezenter Hinweis dass Einladungscodes noch folgen (PROJ-12, bewusst kein nicht-funktionales Eingabefeld)
- `src/app/analyse/page.tsx` — ruft zusätzlich `getAccessStatus()` auf, `redirect('/upgrade')` wenn `!hasAccess`; reicht `trialDaysRemaining` an `MahlzeitInput` weiter
- `src/app/rezepte/page.tsx` — gleiche Zugriffsprüfung + Redirect; zeigt den Countdown-Hinweis direkt im Server Component oberhalb von `RezeptBibliothek` (kein neuer Prop nötig, da statischer Server-berechneter Wert); `redirect('/login')` um `redirectTo=/rezepte` ergänzt (war vorher ohne, kleine konsistente Verbesserung)
- `src/components/mahlzeit-input.tsx` — neue Prop `trialDaysRemaining`; der bestehende "Foto-Scans aufgebraucht"-Hinweis (PROJ-10) wurde korrigiert (behauptete vorher fälschlich "Freitext bleibt unbegrenzt verfügbar" — das gilt seit PROJ-11 nicht mehr) und zeigt jetzt den Countdown, wenn ein Übergangsfenster läuft
- Verifiziert: `npm run build` erfolgreich, Vitest unverändert (87/94, vorbestehende Fehler unberührt), PROJ-10-E2E-Suite (beide Test-Gruppen, inkl. erneutem Seed auf 0 Scans) weiterhin grün — keine Regression durch die Paywall-Integration

**Bewusst nicht umgesetzt (gehört zu `/qa` bzw. PROJ-12):**
- E2E-Tests für PROJ-11 selbst (neue `/upgrade`-Seite, Redirect-Verhalten von `/analyse`/`/rezepte`)
- Tatsächliche Einladungscode-Eingabe (PROJ-12)
- Aufruf von `/api/stripe/sync-session` beim Rückkehr-Redirect (`?session_id=...`) von der `/upgrade`-Seite

## Implementation Notes (Frontend) — Refinement (2026-07-24)

**Geänderte Dateien:**
- `src/app/analyse/page.tsx` — `redirect('/upgrade')` entfernt. Neues `hasFullAccess`-Flag (aus `getAccessStatus().hasAccess`) wird an `MahlzeitInput` durchgereicht, steuert dort die Foto-Kontingent-Darstellung.
- `src/components/mahlzeit-input.tsx` — neue Prop `hasFullAccess`. Foto-Kontingent-Hinweis um einen dritten Fall erweitert (registriert + reduziert → Lifetime-Formulierung "Noch X von 5 übrig" wie bei einem Gast, statt "Heute noch X von 5"). Neuer Upgrade-Prompt (analog zum bestehenden Gast-Conversion-Prompt, aber mit Ziel `/upgrade` statt `/registrieren`), wenn das Lifetime-Kontingent aufgebraucht ist. Neuer Trial-Countdown-Hinweis oberhalb der Foto-Zone, wenn `hasFullAccess && trialDaysRemaining !== null`.
- `src/app/rezepte/page.tsx` — `redirect('/upgrade')` entfernt. Neues `restricted`-Flag (`isGuest || (access !== null && !access.hasAccess)`) ersetzt das bisherige reine `isGuest`. Banner-Text und Link differenzieren jetzt zwischen Gast (`/registrieren`) und abgelaufenem Trial (`/upgrade`). Countdown-Hinweis-Text korrigiert (behauptete vorher fälschlich, dass Freitext-Analyse mit eingeschränkt wird).
- `src/components/rezept-bibliothek.tsx` — Prop von `isGuest` zu `restricted` umbenannt (semantisch präziser, da jetzt auch registrierte Nutzer ohne volle Ausstattung betrifft). Keine Verhaltensänderung an der "locked card"-Logik selbst.
- `src/app/rezept/[id]/page.tsx` — Sperrbildschirm-Bedingung von `isGuest` auf `restricted` erweitert (neue `getAccessStatus()`-Abfrage für registrierte, nicht-anonyme Nutzer). Sperrbildschirm-Text und Button differenzieren zwischen Gast ("Kostenlos registrieren" → `/registrieren`, inkl. "Bereits einen Account? Einloggen") und abgelaufenem Trial ("Jetzt Pro werden" → `/upgrade`, kein Login-Link nötig, Nutzer ist ja bereits eingeloggt).
- `src/app/upgrade/page.tsx` — übergibt zusätzlich `hasFullAccess` und `trialDaysRemaining` an `UpgradeView`.
- `src/components/upgrade-view.tsx` — neue `FeatureComparison`-Komponente: dreizeilige Vergleichstabelle (Foto-Analyse, Rezeptbibliothek, Freitext-Analyse) mit zwei Spalten, deren linke Spaltenüberschrift je nach Zustand variiert ("Nach Trial-Ende" während eines aktiven Trials — zeigt die Konsequenz eines Nicht-Upgrades; "Aktuell" nach Trial-Ende — zeigt den tatsächlichen Ist-Zustand). Überschrift/Absatz-Text ebenfalls zustandsabhängig. Veraltete Copy entfernt, die fälschlich eine Freitext-Sperre behauptete.

**Gefundenes und behobenes Test-Infrastruktur-Problem:** Das gemeinsam genutzte QA-Testkonto (`qa-test@endlichsatt.dev`) hatte durch den ursprünglichen Bug bisher *immer* vollen Zugriff — dadurch konnten PROJ-8/24/25-E2E-Tests unbemerkt beliebige, nicht gast-sichtbare Rezepte öffnen. Nach dem Fix griff die (jetzt korrekte) Trial-Ablauf-Logik auch für dieses Konto, wodurch 10 Tests aus fremden Test-Suiten plötzlich fehlschlugen (Sperrbildschirm statt Rezeptinhalt). Behoben durch eine neue **permanente Baseline** für das Testkonto: `invite_code_redeemed_at` dauerhaft gesetzt (gewährt vollen Zugriff unabhängig vom Trial-Status). Die PROJ-11-eigene Test-Suite muss dieses Feld für ihre eigenen Zustands-Tests temporär auf `NULL` setzen und danach wieder auf die Baseline zurücksetzen (im Test-Datei-Kopfkommentar dokumentiert).

**Tests:** `tests/PROJ-11-paywall.spec.ts` komplett neu geschrieben (die alte Version testete den jetzt entfernten Redirect und veralteten Wortlaut, wäre also durchgehend fehlgeschlagen). 3 Zustands-Gruppen (reduziert/Trial aktiv/Abo aktiv), je einzeln mit manuellem DB-Seeding gegen den echten Dev-Server verifiziert: 6/6, 3/3, 3/3 — alle grün. Gleiche CI-Einschränkung wie bei PROJ-10 dokumentiert (kein automatisiertes Seeding, Tests laufen serialisiert pro Gruppe).

**Live-Verifikation:** Alle vier neuen/geänderten UI-Zustände (reduzierte Rezeptbibliothek mit Banner + gesperrten Karten, Lifetime-Foto-Kontingent-Hinweis, Rezept-Sperrbildschirm mit "Jetzt Pro werden", Vergleichstabelle auf `/upgrade` in beiden Spalten-Varianten) per Screenshot gegen den echten Dev-Server mit dem QA-Testkonto bestätigt (drei verschiedene DB-Zustände testweise gesetzt und danach auf die korrekte Baseline zurückgesetzt).

**Verifikation:** `tsc --noEmit`, ESLint: fehlerfrei. Vitest: 228/228 grün (unverändert). `npm run build`: erfolgreich. E2E-Regression `PROJ-8`/`PROJ-24`/`PROJ-25`/`PROJ-26` (nach Wiederherstellen der Testkonto-Baseline): 42/43 grün — einziger Fehlschlag ist das vorbestehende, dokumentierte BUG-3.

**Bewusst nicht umgesetzt (gehört zu `/qa`):**
- Vollständiger Security-Audit dieser Refinement-Änderungen (RLS-Prüfung der neuen Zugriffs-Logik, Manipulationsversuche)
- Cross-Browser-Verifikation über Chromium hinaus

## QA Test Results

### Refinement-QA (2026-07-24) — Trial-Trigger-Fix + Rückfall-Modell

**Tested:** 2026-07-24
**App URL:** http://localhost:3000 (lokaler Dev-Server) + Live-Verifikation gegen das Produktions-Supabase-Projekt
**Tester:** QA Engineer (AI)
**Scope:** Nur die Refinement-Änderungen (Trial-Trigger-Fix, Rückfall- statt Sperr-Modell, Vorteilskommunikation auf `/upgrade`). Die Stripe-Checkout/Portal/Webhook-Mechanik wurde durch dieses Refinement nicht verändert — deren Ergebnisse aus der ursprünglichen QA-Runde (2026-06-16, siehe unten) bleiben gültig und wurden nicht erneut vollständig durchlaufen, nur stichprobenartig auf Regression geprüft (siehe Regression Testing unten).

#### Acceptance Criteria Status

**Trial-Start & Trial-Verlauf**
- [x] `trial_ends_at` wird exakt bei Registrierung auf `jetzt + 7 Tage` gesetzt, unabhängig vom Foto-Scan-Verbrauch — verifiziert per Migration (`reset_scans_on_anon_upgrade()`) und Backfill für Bestandskonten, live gegen das Produktions-Projekt bestätigt (`/backend`-Phase)
- [x] Voller Zugriff während des Trials (5 Foto-Scans/Tag, unbegrenzte Freitext-Analyse, komplette Bibliothek) — E2E-Gruppe "Voller Zugriff — 7-Tage-Trial aktiv" (3/3 grün); Freitext-Analyse zusätzlich per Code-Review bestätigt: das Eingabefeld in `mahlzeit-input.tsx` ist zu keinem Zeitpunkt von `hasFullAccess` abhängig
- [x] Dezenter Hinweis mit Tagen UND was sich danach ändert — Code-Review + Screenshot: `/analyse` zeigt "Noch X Tage tägliche Foto-Analysen — danach ein einmaliges Kontingent von 5", `/rezepte` zeigt "Noch X Tage volle Rezeptbibliothek & tägliche Foto-Analysen — danach reduziert sich dein Zugriff auf die Gast-Auswahl" — beide erklären explizit die Konsequenz, nicht nur den Countdown

**Nach Trial-Ende (kein Abo, kein Invite-Code)**
- [x] Rezeptbibliothek fällt auf gast-sichtbare Teilmenge zurück, kein Redirect/Rauswurf, Hinweis + Link zu `/upgrade` — E2E "Reduzierter Zugriff" (6/6 grün), zusätzlich per Mobile-Screenshot (375px) visuell bestätigt: Locks korrekt nur auf den 5 nicht-gast-sichtbaren von 8 Rezepten, die 3 gast-sichtbaren (Linsen Dahl, Lukas' Power Oats, Quinoa-Shuka) korrekt ungesperrt
- [x] Foto-Analyse fällt auf einmaliges Lifetime-Kontingent von 5 zurück, Hinweis + Link zu `/upgrade` bei 0, Freitext bleibt unbegrenzt — E2E bestätigt Lifetime-Zähler-Darstellung ("von 5 Foto-Scans übrig"); Upgrade-Prompt-Text bei 0 Scans per Code-Review bestätigt ("Freitext-Analyse bleibt für dich weiterhin unbegrenzt")
- [x] Freitext-Analyse bleibt nach Trial-Ende unverändert unbegrenzt — Code-Review: kein `hasFullAccess`-Check im gesamten Freitext-Pfad (Eingabefeld, `handleAnalysieren`, `handleWeiter`) in `mahlzeit-input.tsx`
- [x] `/upgrade` zeigt Vergleich aktueller vs. Pro-Zustand — E2E bestätigt Tabelle mit "Aktuell"/"Mit Pro"-Spalten (Foto-Analyse, Rezeptbibliothek, Freitext-Analyse), zusätzlich per Mobile-Screenshot visuell bestätigt

**Kauf & Abo-Verwaltung** *(Mechanik unverändert durch Refinement, nur Rückfall-Ziel-Zustand hat sich geändert)*
- [x] Checkout-Redirect — E2E "Jetzt freischalten" → `checkout.stripe.com` (1/1 grün, wie ursprünglich verifiziert)
- [x] Sofortiger Zugriff nach Zahlung, Portal-Redirect, Kündigung/Fehlschlag → reduzierter statt gesperrter Zustand — per Code-Review bestätigt: `getAccessStatus()` prüft weiterhin nur `subscription_status`, unverändert seit der ursprünglichen QA-Runde; einziger Unterschied ist, dass der "Nicht-mehr-aktiv"-Zweig jetzt `hasAccess: false` statt eines Redirects auslöst — dieselbe Codepfad-Logik wie beim abgelaufenen Trial, dort bereits vollständig E2E-getestet

**Immer zugänglich**
- [x] Mahlzeit-Historie und Art-of-Eating/Sättigungsmatrix unverändert erreichbar — Code-Review: keine `getAccessStatus()`-Prüfung in `/historie`, `/art-of-eating`, `/saettigungsmatrix` ergänzt (bewusst aus dem Refinement ausgeschlossen, siehe Out of Scope)

**Sicherheit**
- [x] Keine Stripe-Secrets im Git — `git log -p` für alle Refinement-Commits durchsucht, keine Treffer

#### Security Audit Results (Red Team)

- [x] **Spalten-Schutz weiterhin aktiv:** Erneuter Versuch, `trial_ends_at`/`subscription_status`/`invite_code_redeemed_at` per direktem `UPDATE profiles` als simulierter `authenticated`-Nutzer zu setzen → weiterhin `permission denied for table profiles`. Die neue SQL-Funktion `decrement_photo_scan()` und der erweiterte Trigger ändern nichts an den bestehenden RLS-Policies/Grants.
- [x] Race-Condition-Schutz bei `decrement_photo_scan()`: atomares `UPDATE ... WHERE ... RETURNING`, kein Read-then-Write-Fenster — unverändert seit `/backend`-Verifikation, neue `v_has_full_access`-Verzweigung ändert nichts an der Atomarität.
- [ ] **CRITICAL/HIGH FINDING — siehe BUG-2 unten:** `GET /api/rezepte/[id]` umgeht die komplette Zugriffsbeschränkung, die dieses Refinement gerade erst wieder funktionsfähig gemacht hat.
- [x] `GET /api/rezepte/vorschlaege` geprüft (gleiches Bug-Muster vermutet, aber): liefert nur `id`, `title`, `imageUrl`, `total_time_minutes` — keine Zutaten/Zubereitung. Dieselben Metadaten sind bereits auf gesperrten Karten in der Bibliotheksansicht sichtbar (Titel + Bild werden dort bewusst gezeigt, nur Inhalt ist gesperrt) — kein zusätzliches Datenleck, kein Bug.
- [x] Keine Secrets in den neuen/geänderten API-Antworten sichtbar (Code-Review `analyse/page.tsx`, `rezepte/page.tsx`, `rezept/[id]/page.tsx`, `upgrade/page.tsx`)

#### Edge Cases Status
- [x] Rückkehr nach Trial-Ende → sofort reduzierter Zustand, keine Kulanz — folgt direkt aus der Zeitstempel-Logik
- [x] Nutzer mit abgelaufenem Trial löst Invite-Code ein → voller Zugriff, unabhängig vom Trial — `getAccessStatus()`-Verknüpfung (`hasInviteAccess ||`) unverändert, bereits in `/backend` verifiziert
- [x] Bestandskonten mit inkonsistentem Zustand vor dem Fix → per Backfill-Migration korrigiert (`trial_ends_at = created_at + 7 Tage` für alle 4 betroffenen Konten), live verifiziert
- [x] Kündigung mitten in der Abrechnungsperiode → Zugriff bleibt bis Periodenende, kein neues Trial — unverändert seit ursprünglicher QA-Runde

#### Regression Testing
- [x] `tsc --noEmit` — clean
- [x] `vitest run` — 228/228 grün (inkl. 11 neuer/angepasster `paywall.test.ts`-Tests)
- [x] PROJ-8/PROJ-24/PROJ-25/PROJ-26 E2E-Suiten — nach dem Fix zunächst 10 Regressionen entdeckt (qa-test-Konto verlor durch den jetzt korrekt greifenden Trial-Ablauf ungewollt den Zugriff auf nicht-gast-sichtbare Test-Rezepte), behoben durch permanente `invite_code_redeemed_at`-Baseline auf dem QA-Konto, danach 42/43 grün (1 vorbestehender, PROJ-11-unabhängiger Fehler: BUG-3 unten)
- [x] `PROJ-11-paywall.spec.ts` (12 Tests, 3 Zustandsgruppen) — alle 12 einzeln grün bei korrektem Seeding
- [x] Mobile 375px: `/rezepte`, `/upgrade`, `/analyse` im reduzierten Zustand — kein horizontales Overflow, Layout bricht nicht (per Playwright-Messung `scrollWidth > clientWidth` und visueller Screenshot-Kontrolle)

#### Bugs Found

##### BUG-2: `GET /api/rezepte/[id]` umgeht die komplette Zugriffsbeschränkung der Rezeptbibliothek — ✅ GEFIXT (2026-07-24)
- **Severity:** High
- **Beschreibung:** Die Route (`src/app/api/rezepte/[id]/route.ts:15-22`) prüft ausschließlich, ob überhaupt eine authentifizierte Session existiert (`if (!user) return 401`). Sie prüft weder `is_guest_visible` noch den `hasAccess`/`restricted`-Status aus `getAccessStatus()`. Jede authentifizierte Session — auch eine anonyme Gast-Session oder ein Konto mit abgelaufenem Trial — kann dadurch per direktem API-Aufruf den vollständigen Rezeptinhalt (Titel, Zubereitung, komplette Zutatenliste) jedes beliebigen Rezepts abrufen, unabhängig von `is_guest_visible`. Das hebelt genau die Beschränkung aus, die dieses Refinement gerade erst wieder funktionsfähig gemacht hat (vorher war die Beschränkung wegen des PROJ-11-Kernbugs ohnehin dauerhaft deaktiviert, weshalb dieser Bypass bisher folgenlos blieb).
- **Reproduktion (live verifiziert):**
  1. Als Gast `/analyse` aufrufen (etabliert eine echte anonyme Supabase-Session)
  2. `/rezept/ac634f99-9290-4c47-b5d3-78f3c11744f3` (Fenchelsalat, `is_guest_visible = false`) aufrufen → UI zeigt korrekt den Sperrbildschirm ("Kostenlos registrieren")
  3. Mit derselben Session direkt `page.request.get('/api/rezepte/ac634f99-9290-4c47-b5d3-78f3c11744f3')` aufrufen → `200 OK` mit vollständigem Rezept (`title: 'Fenchelsalat', hasInstructions: true, ingredientCount: 5`)
- **Einordnung High statt Critical:** Kein Zugriff auf fremde Nutzerdaten, keine Kontoübernahme, keine PII betroffen — reines Content-Gating wird umgangen. Aber: es hebelt den gesamten Zweck der Rezept-Beschränkung aus (sowohl für Gäste seit PROJ-19 als auch jetzt für abgelaufene Trials), ist trivial ausnutzbar (kein Exploit-Code nötig, nur die Rezept-ID, die z.B. aus dem Sperrbildschirm-Link selbst auslesbar ist) und betrifft eine Kernfunktion der Paywall.
- **Empfehlung:** In `GET /api/rezepte/[id]` denselben `restricted`-Check einbauen, der bereits in `src/app/rezept/[id]/page.tsx` existiert (`isGuest || (access !== null && !access.hasAccess)`), und bei `restricted && !recipe.is_guest_visible` nur die für die gesperrte Ansicht nötigen Minimal-Felder zurückgeben (oder `403`).
- **Priority:** Sollte vor dem nächsten Deploy behoben werden
- **Fix:** `src/app/api/rezepte/[id]/route.ts` prüft jetzt vor der Antwort denselben `restricted`-Zustand wie die Detailseite (`isAnonymous || (access !== null && !access.hasAccess)`, via `getAccessStatus()`) und gibt bei `restricted && !recipe.is_guest_visible` `403` statt der vollen Rezeptdaten zurück. Für anonyme Nutzer wird `getAccessStatus()` gar nicht erst aufgerufen (unnötiger DB-Roundtrip vermieden, analog zur Seite).
- **Verifikation:** Exakte Reproduktion aus dem Bug-Report erneut durchgespielt (anonyme Session via `/analyse` etablieren → `/rezept/[id]` zeigt weiterhin korrekt den Sperrbildschirm → direkter API-Aufruf) — liefert jetzt `403 {"error":"Kein Zugriff auf dieses Rezept"}` statt `200` mit vollem Inhalt. Als permanenter Regressionstest in `tests/PROJ-11-paywall.spec.ts` verankert (neue Gruppe "Sicherheit — Rezept-API-Bypass", kein DB-Seeding nötig, läuft mit frischer anonymer Session). Zusätzlich `src/app/api/rezepte/[id]/route.test.ts` um 4 neue Unit-Tests erweitert (Gast + guest-visible / nicht guest-visible, abgelaufener Trial + guest-visible / nicht guest-visible). Gesamte Vitest-Suite: 232/232 grün (vorher 228, +4 neue Tests).

##### BUG-3: (vorbestehend, nicht PROJ-11-bezogen) — siehe vorherige QA-Runden für Details
- **Severity:** wie zuvor eingestuft, unverändert durch dieses Refinement
- **Hinweis:** Nur zur Vollständigkeit der Regressionsstatistik (42/43) erwähnt, kein neuer Fund

#### Tests (Refinement-QA)
- `src/lib/paywall.test.ts` — 11 Tests (Trial-Logik, Lifetime- vs. Tages-Zähler), alle grün
- `tests/PROJ-11-paywall.spec.ts` — komplett neu geschrieben (alte Version testete den entfernten Redirect), jetzt 13 Tests über 3 Zustandsgruppen + 1 seedingsfreie Sicherheitsgruppe, alle einzeln grün
- `src/app/api/rezepte/[id]/route.test.ts` — um 4 Tests für den BUG-2-Fix erweitert (Gast/abgelaufener Trial × guest-visible/nicht guest-visible), alle grün

#### Summary (Refinement-QA)
- **Acceptance Criteria:** 14/14 vollständig erfüllt
- **Bugs Found:** 1 neuer, gefixt und live verifiziert (BUG-2, war High), 1 vorbestehender unveränderter (BUG-3)
- **Security:** BUG-2 gefixt und per permanentem Regressionstest abgesichert — Spalten-Schutz und Race-Condition-Schutz weiterhin robust
- **Production Ready:** **JA** — keine offenen Critical/High Bugs mehr
- **Empfehlung:** Deployen

---

#### Ursprüngliche QA-Runde (2026-06-16)

**Tested:** 2026-06-16
**App URL:** http://localhost:3000 (lokaler Dev-Server, Stripe Test-Modus)
**Tester:** QA Engineer (AI)

#### Acceptance Criteria Status

#### AC-1: Übergangsfenster startet einmalig bei Counter=0
- [x] Bereits in `/backend` per simuliertem Nutzer (Transaktion mit Rollback) verifiziert: 3 Aufrufe von `decrement_photo_scan()` → 0, `trial_ends_at` exakt +7 Tage. Hier erneut bestätigt: kein direkter Eingriff von außen möglich (siehe Security Audit).

#### AC-2: Countdown-Hinweis während des Übergangsfensters
- [x] E2E: QA-Konto mit `trial_ends_at = +3 Tage` zeigt den Hinweis sowohl auf `/analyse` als auch auf `/rezepte`.

#### AC-3: Weiterleitung zur Paywall nach Ablauf
- [x] E2E: QA-Konto mit `trial_ends_at` in der Vergangenheit, kein Abo → `/analyse` UND `/rezepte` leiten zuverlässig zu `/upgrade` weiter.

#### AC-4: "Jetzt freischalten" → Stripe Checkout
- [x] E2E gegen die echte Stripe-API (Test-Modus): Klick führt zu einer echten, von Stripe gehosteten Checkout-Seite (`checkout.stripe.com`, Produkt "EndlichSatt Pro Test", 4,99€/Monat sichtbar — Preis und Produktname korrekt aus der konfigurierten Price ID übernommen).

#### AC-5: Sofortiger Zugriff nach erfolgreicher Zahlung
- [~] **Teilweise verifiziert** — siehe Bug/Hinweis unten. Checkout-Erstellung und Redirect zur echten Stripe-Seite bestätigt; die komplette Zahlung (Kartendaten ausfüllen, abschließen, Rückkehr-Redirect, Sync) wurde aus Zeitgründen nicht automatisiert bis zum Ende durchgespielt (Stripe Checkouts Kartenfelder liegen in eigenen iframes, die sich nicht zuverlässig innerhalb der verfügbaren Zeit automatisieren ließen). Die zugrunde liegende Logik (`sync-session`-Route, Webhook-Handler) ist über 29 Unit-/Integrationstests mit realistischen Stripe-Event-Shapes abgedeckt. Empfehlung siehe BUG/Hinweis unten.

#### AC-6: "Abo verwalten" → Stripe Customer Portal
- [x] E2E: QA-Konto mit `subscription_status = 'active'` zeigt auf `/upgrade` "Pro-Mitglied" + "Abo verwalten"-Button statt Kaufangebot. Tatsächlicher Klick zum echten Portal nicht erneut einzeln getestet (gleicher Code-Pfad/gleiche Absicherung wie Checkout, dort bereits gegen echte Stripe-API verifiziert).

#### AC-7: Kündigung → Sperre erst nach Periodenende
- [x] Code-Review + Logik-Test (`paywall.test.ts`): `getAccessStatus()` sperrt korrekt, sobald `subscription_status` nicht mehr `active`/`trialing` ist, unabhängig vom Trial-Status. Kein neues Übergangsfenster wird dabei gestartet (nur `decrement_photo_scan()` kann `trial_ends_at` setzen, Kündigung tut das nicht).

#### AC-8: Fehlgeschlagene Zahlung → Sperre
- [x] Code-Review: identische Prüfung wie AC-7 (`subscription_status` ungleich aktiv → gesperrt). Webhook setzt den Status 1:1 aus Stripes `customer.subscription.updated`-Event, kein eigener Sonderfall-Code mit zusätzlichem Fehlerrisiko.

#### AC-9: Mahlzeit-Historie bleibt zugänglich
- [x] Code-Review: `/historie` wurde durch PROJ-11 nicht verändert, keine `getAccessStatus()`-Prüfung dort ergänzt — wie in der Spec gefordert bewusst ausgenommen.

#### AC-10: Stripe-Secrets nie im Repository
- [x] `git log -p` für alle PROJ-11-Commits durchsucht — keine Treffer für `sk_test`, `sk_live`, `whsec_`, `price_`. Secrets liegen ausschließlich in `.env.local` (gitignored). `.env.local.example` wurde vom Product Owner selbst ergänzt (für mich aus Sicherheitsgründen komplett gesperrte Dateien, auch lesend).

#### Security Audit Results (Red Team)
- [x] **Spalten-Schutz (kritischster Punkt):** Direkter `UPDATE profiles SET subscription_status = 'active', stripe_customer_id = 'cus_fake', trial_ends_at = ...` als simulierter `authenticated`-Nutzer → `permission denied for table profiles`. Ein Nutzer kann sich **nicht selbst freischalten**, egal was er versucht.
- [x] **CHECK-Constraint:** `subscription_status = 'free_forever_hack'` wird auch mit vollen Rechten von der DB abgelehnt (`violates check constraint`) — Defense in depth falls der Anwendungscode je einen Bug hätte.
- [x] **Webhook-Signatur:** Live gegen den laufenden Dev-Server getestet — Anfrage ohne `stripe-signature`-Header → `400`; Anfrage mit gefälschter Signatur → `400`, Profil nachweislich unverändert. Keine gefälschten "Abo aktiv"-Events möglich.
- [x] **Authentifizierung:** `/api/stripe/checkout`, `/api/stripe/portal`, `/api/stripe/sync-session` live gegen den Dev-Server getestet — alle drei `401` ohne Session.
- [x] **`sync-session`-Ownership-Check:** Unit-Test bestätigt `403`, wenn `client_reference_id` der Stripe-Session nicht zum eingeloggten Nutzer passt — verhindert, dass jemand eine fremde `session_id` errät/abfängt und sich selbst freischaltet.
- [x] Keine Secrets in API-Antworten sichtbar (Code-Review aller vier Routen).
- [ ] **Nicht geprüft / offen:** kein Rate-Limiting auf `/api/stripe/checkout` — ein eingeloggter Nutzer könnte theoretisch viele Checkout-Sessions erzeugen (kein Sicherheitsrisiko, da jede Session für sich harmlos ist, aber unnötige Last/Spam Richtung Stripe). Gleiche Einschätzung wie bei PROJ-10s offenem Punkt zu Doppelklick-Schutz — Low Priority.

#### Edge Cases Status
- [x] Rückkehr erst nach Ablauf des Fensters → direkte Sperre, keine Kulanz (folgt direkt aus der Zeitstempel-Logik, kein Sonderfall-Code nötig)
- [x] Abo mitten im Fenster → sofortiger Zugriff (durch `isSubscribed ||`-Verknüpfung in `getAccessStatus()` automatisch erfüllt)
- [~] Verzögerter/ausbleibender Webhook → `sync-session`-Fallback vorhanden und unit-getestet, aber nicht im echten Browser bis zum Ende durchgespielt (siehe AC-5)
- [x] Bereits abonniert, ruft Paywall-Seite trotzdem auf → zeigt "Pro-Mitglied" statt Kaufangebot, kein Duplikat-Checkout möglich (UI bietet in diesem Zustand gar keinen Checkout-Button an)
- [ ] Stripe-API kurzzeitig nicht erreichbar → durch generischen `try/catch` abgedeckt (Unit-Test mit `mockRejectedValue`), aber nicht gegen einen echten Ausfall getestet (schwer simulierbar)
- [x] Invite-Code-Interaktion → korrekt als Out-of-Scope/PROJ-12 behandelt, `getAccessStatus()` hat dafür bereits den vorgesehenen Erweiterungspunkt

#### Regression Testing
- [x] PROJ-10 E2E-Suite (Scans verfügbar, 4 Tests) erneut grün — Paywall-Integration hat die bestehende Foto-Scan-Logik nicht beeinträchtigt
- [x] Vitest-Gesamtsuite unverändert: 87/94 (die 7 Fehler in `admin/rezepte` sind vorbestehend, nicht PROJ-11 zuzuordnen)
- [x] `npm run build` erfolgreich

#### Bugs Found

#### BUG-1: Checkout-Erstellung bei bereits laufender Stripe-Session nicht idempotent geprüft
- **Severity:** Low
- **Beschreibung:** Klickt ein Nutzer mehrfach hintereinander auf "Jetzt freischalten" (z.B. Doppelklick oder zwei Tabs), werden mehrere Checkout-Sessions bei Stripe erzeugt. Keine davon ist schädlich (unbenutzte Sessions laufen bei Stripe automatisch ab), aber unnötig.
- **Priority:** Nice to have

#### Hinweis (kein Bug, aber wichtig für die Produktionsreife): vollständiger Zahlungs-Webhook-Loop nicht Ende-zu-Ende im Browser verifiziert
- Empfehlung vor dem ersten echten Kunden: Stripe CLI installieren (`stripe listen --forward-to localhost:3000/api/stripe/webhook` + `stripe trigger checkout.session.completed`) und/oder einmal manuell im Browser eine Testzahlung mit Kartennummer `4242 4242 4242 4242` abschließen, um den kompletten Kreis (Checkout → Webhook → `subscription_status` → `/upgrade` zeigt "Pro-Mitglied") einmal live zu sehen. Die Einzelteile sind alle getestet (Checkout-Erstellung gegen echte API, Webhook-Signaturprüfung gegen echten Dev-Server, Handler-Logik per Unit-Tests) — nur der vollständige Kreis in einem Durchlauf fehlt.

#### Tests geschrieben
- `tests/PROJ-11-paywall.spec.ts` — 9 neue E2E-Tests (3 Zustands-Gruppen: kein Zugriff, Übergangsfenster aktiv, aktives Abo), alle grün auf Chromium. Benötigt wie bei PROJ-10 manuelles DB-Seeding für den Initialzustand (während dieses Durchgangs per Supabase MCP durchgeführt, am Ende auf den Ausgangszustand zurückgesetzt) — gleicher offener CI-Punkt wie in PROJ-10 dokumentiert.
- Kleinere Lint-Korrektur in `src/lib/paywall.test.ts` (unnötiger eslint-disable-Kommentar entfernt).

#### Summary
- **Acceptance Criteria:** 8/10 vollständig erfüllt, 2 teilweise (AC-5 Checkout→Zugriff-Loop nur teilweise Ende-zu-Ende verifiziert, AC-6 Portal-Klick analog zu Checkout eingeschätzt statt einzeln nachgestellt)
- **Bugs Found:** 1 total (0 critical, 0 high, 0 medium, 1 low)
- **Security:** Pass — alle kritischen Punkte (Spalten-Schutz, Webhook-Signatur, Ownership-Check, Auth) per echtem Angriffsversuch oder Unit-Test bestätigt
- **Production Ready:** **JA, mit einer Empfehlung** — vor dem ersten echten zahlenden Kunden einmal den vollen Checkout→Webhook-Kreis live durchspielen (siehe Hinweis oben), da das der einzige nicht vollständig Ende-zu-Ende verifizierte Pfad ist
- **Empfehlung:** Deployen. Die Sicherheits-Eigenschaften (das, was bei einer Paywall am meisten schiefgehen kann — sich selbst freischalten) sind nachweislich robust. Der offene Punkt ist Vollständigkeit der Verifikation, kein gefundenes Sicherheits- oder Funktionsproblem.

## Deployment

**Deployed:** 2026-06-16
**Production URL:** https://endlichsattapp.vercel.app
**Tag:** `v1.11.0-PROJ-11`
**Stripe-Modus:** Test-Modus (bewusste Entscheidung, siehe Decision Log unten — Live-Umstellung erfolgt separat, sobald der Product Owner bereit ist)

### Pre-Deployment Checks
- [x] `npm run build` erfolgreich
- [x] `npm run lint` — keine neuen Fehler (1 vorbestehender Fehler in `art-of-eating-guide.tsx`, unberührt von PROJ-11)
- [x] QA approved (siehe QA Test Results oben, 8/10 AC vollständig + 2 teilweise, 1 Low-Bug ohne Sicherheitsauswirkung)
- [x] Keine Critical/High Bugs
- [x] Keine Secrets im Git-Repository (History durchsucht, keine Treffer)
- [x] Alle DB-Migrationen bereits während `/backend` live auf das Produktions-Supabase-Projekt angewendet
- [x] Alle Commits gepusht
- [x] **Vercel Environment Variables ergänzt:** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (Test-Modus-Werte) vom Product Owner im Vercel-Dashboard hinterlegt. Zugehöriger Test-Modus-Webhook-Endpunkt in Stripe auf `https://endlichsattapp.vercel.app/api/stripe/webhook` angelegt (Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)
- [x] Manueller Ende-zu-Ende-Test vom Product Owner durchgeführt: echte Stripe-Test-Zahlung (Testkarte) über `/upgrade` abgeschlossen → "Pro-Mitglied"-Zustand erfolgreich erreicht. Schließt die im QA-Bericht offen gelassene Lücke (AC-5 vollständig verifiziert)

### Post-Deployment Verification
- [x] Produktions-URL lädt (`307` zu `/login` für nicht eingeloggte Anfragen, erwartetes Verhalten)
- [x] Diese Bookkeeping-Änderung löst einen frischen Vercel-Deploy aus, der die neu hinterlegten Env-Variablen erstmals lädt (Vercel übernimmt sie nicht rückwirkend auf bereits laufende Deployments)
- [x] Manuelle Verifikation der `/upgrade`-Seite direkt gegen die Produktions-URL durch den Product Owner: "Jetzt freischalten" auf `https://endlichsattapp.vercel.app/upgrade` führt korrekt zur echten Stripe-Sandbox-Checkout-Seite — bestätigt, dass die frisch hinterlegten Vercel-Env-Variablen geladen werden

### Hinweis
Kein Erst-Deployment — Vercel/GitHub-Anbindung bestand bereits seit dem MVP. Production-Ready-Essentials (Error Tracking, Security Headers etc.) wurden dort bereits eingerichtet, nicht erneut für dieses Feature wiederholt.

---

### Refinement-Deployment (2026-07-24): Trial-Trigger-Fix + Rückfall-Modell + BUG-2-Fix

**Deployed:** 2026-07-24
**Production URL:** https://endlichsattapp.vercel.app
**Tag:** `v1.12.0-PROJ-11`
**Commit:** `011f78e`

#### Pre-Deployment Checks
- [x] `next build` erfolgreich
- [x] `eslint .` — 0 Fehler (1 vorbestehende Warnung in `bild-cropper.tsx`, unberührt von PROJ-11)
- [x] QA approved (siehe `## QA Test Results` oben, 14/14 AC, BUG-2 gefixt + verifiziert, keine offenen Critical/High Bugs)
- [x] Keine Secrets im Diff (geprüft: kein `sk_test`/`sk_live`/`whsec_`/`SUPABASE_SERVICE_ROLE`/`ANTHROPIC_API_KEY`)
- [x] Keine neuen Env-Variablen, keine neuen Pakete — nichts an Vercel-Konfiguration zu ändern
- [x] DB-Migration (`proj11_fix_trial_trigger_and_photo_scan_fallback`) bereits während `/backend` live auf das Produktions-Supabase-Projekt angewendet, inkl. Backfill für Bestandskonten
- [x] Alle Commits gepusht (`011f78e` auf `main`)

#### Post-Deployment Verification
- [x] Produktions-URL lädt, kein Build-Fehler in Vercel
- [x] `/analyse` und `/rezepte` laden für einen eingeloggten Testnutzer ohne Fehler, kein Redirect mehr zu `/upgrade`
- [x] `/upgrade` zeigt live die neue Feature-Vergleichstabelle ("Aktuell"/"Mit Pro", inkl. "5 einmalig" und "Nur Gast-Auswahl") für ein Konto mit reduziertem Zugriff — per temporärem DB-Seed auf dem qa-test-Konto verifiziert, danach zurückgesetzt
- [x] **BUG-2-Fix live verifiziert:** exakte Reproduktion aus dem QA-Bericht gegen die Produktions-URL wiederholt (anonyme Session über `/analyse` etablieren → `/rezept/[id]` zeigt Sperrbildschirm → direkter Aufruf von `GET /api/rezepte/[id]`) → liefert jetzt `403 {"error":"Kein Zugriff auf dieses Rezept"}` statt der vollen Rezeptdaten
- [x] Keine neuen Browser-Konsolenfehler durch PROJ-11 (ein vorbestehender `404` für eine Ressource wurde beobachtet, unabhängig von PROJ-11, nicht weiter untersucht — kein Zusammenhang mit den geänderten Routen/Komponenten)
- [x] Auth-Flow funktioniert (Login mit Testkonto erfolgreich)

#### Hinweis
Reines Code-Deployment (Bugfix + UI-Refinement), keine Datenbank-Änderung in diesem Schritt (Migration lief bereits vorher). Kein neuer Stripe-Webhook/Env-Setup nötig.
