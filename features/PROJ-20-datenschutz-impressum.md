# PROJ-20: Datenschutzerklärung & Impressum

## Status: Deployed
**Created:** 2026-07-07
**Last Updated:** 2026-07-07

## Dependencies
- Requires: PROJ-2 (User Authentication) — Registrierungsseite erhält Datenschutz-Hinweis
- Requires: PROJ-19 (Gast-Modus) — Gast-Konto-Screen erhält Footer-Links

## User Stories
- Als Nutzer möchte ich jederzeit das Impressum finden, damit ich weiß, wer hinter der App steckt.
- Als Nutzer möchte ich die Datenschutzerklärung lesen können, damit ich verstehe, welche Daten verarbeitet werden und welche Rechte ich habe.
- Als neuer Nutzer möchte ich beim Registrieren auf die Datenschutzerklärung hingewiesen werden, bevor ich meine Daten eingebe.

## Acceptance Criteria

- [ ] Angenommen ein Nutzer navigiert zu `/impressum`, dann sieht er Name, Adresse, Kontaktdaten, USt-IdNr und Angaben gemäß TMG.
- [ ] Angenommen ein Nutzer navigiert zu `/datenschutz`, dann sieht er eine vollständige DSGVO-konforme Datenschutzerklärung mit allen Drittanbietern.
- [ ] Angenommen ein Nutzer ist auf der Registrierungsseite, wenn er das Formular sieht, dann wird ein Datenschutz-Hinweis mit Link zur Datenschutzerklärung angezeigt.
- [ ] Angenommen ein Nutzer ist auf der Konto-Seite (eingeloggt oder Gast), dann findet er Links zu Impressum und Datenschutz.
- [ ] Angenommen ein Nutzer ruft `/impressum` oder `/datenschutz` auf, dann sind diese Seiten ohne Login zugänglich.

## Implementierte Inhalte

### Impressum (`/impressum`)
- Anbieter: Lukas Beck, Schulterblatt 122, 20357 Hamburg
- Kontakt: +49 (0) 173 347 0405 / lukas@onlineernaehrungsberater.de
- USt-IdNr: DE 428402078
- Verantwortlicher: Lukas Beck (§ 55 Abs. 2 RStV)
- EU-Streitschlichtungshinweis (kein Pflichtverfahren)

### Datenschutzerklärung (`/datenschutz`)
- Verantwortlicher: Lukas Beck
- Verarbeitete Daten: Account-Daten, Mahlzeit-Analysen (Text + Fotos), Gast-Sessions, Zahlungsdaten, Server-Logs
- Drittanbieter: Supabase (DB/Auth/Storage), Anthropic (KI-Analyse), Stripe (Zahlung), Vercel (Hosting) — alle mit SCCs
- Hinweis: Anthropic nutzt API-Daten nicht für Modell-Training
- Cookies: nur technisch notwendige Session-Cookies, kein Tracking
- Speicherdauer: bis Account-Löschung; gesetzliche Aufbewahrungspflichten vorbehalten
- Nutzerrechte: Art. 15–21 DSGVO
- Beschwerderecht: HmbBfDI Hamburg
- Letzte Aktualisierung: Juli 2026

### Links gesetzt in
- `registrieren-form.tsx` — Datenschutz-Hinweis vor dem Submit-Button
- `login-form.tsx` — Footer mit Impressum + Datenschutz
- `konto-view.tsx` — Footer nach "Abmelden"
- `gast-konto-view.tsx` — Footer unter dem CTA

## Deployment

**Deployed:** 2026-07-07
**Production URL:** https://app.mehralsabnehmen.de
**Git Tag:** v1.20.0-PROJ-20
