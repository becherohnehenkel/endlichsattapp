# PROJ-15: PWA & Native Navigation

## Status: Deployed
**Created:** 2026-07-02
**Last Updated:** 2026-07-02

## Dependencies
- PROJ-2 (User Authentication) — Admin-Link benötigt eingeloggte Session
- PROJ-13 (Admin-Dashboard) — Admin-Bereich muss über Navigation erreichbar sein

## User Stories
- Als Nutzer möchte ich die App auf meinem Homescreen installieren können, damit sie sich wie eine native App anfühlt
- Als Nutzer möchte ich über eine persistente Navigation zwischen den Hauptbereichen wechseln, ohne jedes Mal die URL einzutippen
- Als Nutzer auf Mobilgerät möchte ich eine Bottom Navigation Bar sehen, die ich mit dem Daumen erreiche
- Als Nutzer auf Desktop möchte ich eine Top Navigation sehen, die zu diesem Kontext passt
- Als Admin möchte ich den Admin-Bereich direkt über die Navigation erreichbar haben, ohne die URL manuell einzugeben

## Out of Scope
- App Store Listing (Apple App Store / Google Play Store) — kein Ziel dieses Features
- Offline-Support / Caching von Nutzerinhalten — deferred (Idee: Rezepte offline, siehe Projekt-Notizen)
- Push Notifications
- Background Sync
- Splash Screen (kann später ergänzt werden)
- In-App "Installieren"-Button/Banner — Browser zeigt nativen Prompt

## Acceptance Criteria

### PWA-Grundkonfiguration
- [ ] Angenommen die App wird im Browser geöffnet, wenn der Nutzer "Zum Homescreen hinzufügen" wählt, dann installiert sich die App als Standalone-App ohne Browser-Chrome
- [ ] Angenommen die App ist installiert, wenn sie geöffnet wird, dann zeigt sie keinen Browser-Adressbalken (display: standalone)
- [ ] Angenommen ein moderner Browser wird genutzt, wenn die App geladen wird, dann erfüllt sie die PWA-Installierbarkeits-Kriterien (Manifest + HTTPS + Service Worker)
- [ ] Angenommen die App ist auf iOS installiert, wenn sie gestartet wird, dann wird das App-Icon und der App-Name korrekt angezeigt

### Bottom Navigation (Mobil, < 768px)
- [ ] Angenommen der Nutzer ist eingeloggt und nutzt ein Mobilgerät, wenn er eine Hauptseite öffnet, dann ist die Bottom Navigation am unteren Bildschirmrand sichtbar
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die Bottom Navigation sieht, dann enthält sie: Startseite, Analyse, Rezepte, Historie, Konto
- [ ] Angenommen der Nutzer navigiert zu einer Seite, wenn er die Bottom Navigation sieht, dann ist der aktive Tab visuell hervorgehoben
- [ ] Angenommen der eingeloggte Nutzer ist Admin (Email = ADMIN_EMAIL), wenn er die Bottom Navigation sieht, dann erscheint zusätzlich ein Admin-Eintrag
- [ ] Angenommen der Nutzer ist auf einer Sub-Seite (/mahlzeit/[id], /rezept/[id]), wenn er nach unten scrollt, dann ist die Bottom Navigation weiterhin sichtbar (fixed)

### Top Navigation (Desktop, ≥ 768px)
- [ ] Angenommen der Nutzer ist eingeloggt und nutzt einen Desktop-Browser, wenn er eine Hauptseite öffnet, dann ist eine Top Navigation mit Logo und Navigationslinks sichtbar
- [ ] Angenommen der Nutzer ist eingeloggt auf Desktop, wenn er die Top Navigation sieht, dann enthält sie dieselben Links wie die Bottom Navigation
- [ ] Angenommen der eingeloggte Nutzer ist Admin, wenn er die Top Navigation auf Desktop sieht, dann ist ein Admin-Link sichtbar

### Navigation ausgeblendet
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er /login oder /registrieren öffnet, dann wird keine Navigation angezeigt
- [ ] Angenommen der Nutzer befindet sich im Admin-Bereich (/admin/*), wenn er die Seite betrachtet, dann wird die globale Navigation NICHT angezeigt (Admin hat eigene Navigation)
- [ ] Angenommen der Nutzer befindet sich auf /upgrade, wenn er die Seite betrachtet, dann wird die Navigation NICHT angezeigt

### Admin-Zugang via Navigation
- [ ] Angenommen der Nutzer ist Admin, wenn er auf den Admin-Link in der Navigation klickt, dann gelangt er zu /admin ohne die URL eintippen zu müssen
- [ ] Angenommen der Nutzer ist kein Admin, wenn er die Navigation sieht, dann ist kein Admin-Link sichtbar

## Edge Cases
- **Kein eingeloggter Nutzer auf einer geschützten Seite:** Navigation nicht anzeigen — Auth-Redirect greift bereits (Supabase)
- **Navigation auf /analyse (aktiver Analyse-Flow):** Bottom Nav bleibt sichtbar aber der Analyse-Tab ist als aktiv markiert; Navigation stört den Flow nicht
- **Sehr langer App-Name in Top Nav:** Logo + App-Name "endlichsatt" links, Links rechts — auf kleinen Desktops ggf. kürzen
- **Admin-Link auf Mobilgerät mit 5 regulären Links:** 6 Items in Bottom Nav werden eng — Admin-Tab erscheint nur wenn Admin eingeloggt (ersetzt keinen anderen Tab, wird ergänzt)
- **iOS Safari Home Screen:** Erfordert spezifische `<meta>`-Tags für apple-mobile-web-app-capable und apple-touch-icon in layout.tsx

## Technical Requirements
- Service Worker: Nur Asset-Caching (JS/CSS/Fonts), kein Content-Caching
- Manifest: name, short_name, start_url ("/"), display ("standalone"), theme_color, background_color, icons (192×192 und 512×512 inkl. maskable)
- iOS Meta Tags in layout.tsx: apple-touch-icon, apple-mobile-web-app-capable, apple-mobile-web-app-title
- Navigation muss serverseitig den Admin-Status prüfen können (ADMIN_EMAIL aus Env)
- Bottom Nav: fixed, z-index über Content, kein Überlappen mit iOS Home Indicator (safe-area-inset)

## Open Questions
- [x] Welche Farbe soll als theme_color im Manifest verwendet werden? → #4A7C59
- [x] Gibt es bereits ein App-Icon / Logo in hoher Auflösung? → public/icon.svg erstellt (512×512, "es" auf #4A7C59)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| PWA statt native App (iOS/Android) | App ist Web-first; PWA reicht für Homescreen-Installation ohne App-Store-Aufwand | 2026-07-02 |
| Kein Offline-Support in diesem Feature | App ist vollständig auf Live-Daten angewiesen (KI, Supabase); Offline-Rezepte als spätere Idee notiert | 2026-07-02 |
| Bottom Nav (Mobil) + Top Nav (Desktop) | Standard-Muster für responsive Web-Apps; Bottom Nav für Daumen-Erreichbarkeit auf Mobile | 2026-07-02 |
| Admin-Link in Navigation statt URL-Eingabe | Admin ist auch Endnutzer der App; direkter Zugang ohne URL-Wissen verbessert UX | 2026-07-02 |
| Navigation auf /admin/* ausgeblendet | Admin-Bereich hat eigene Navigation (PROJ-13); doppelte Navigation wäre verwirrend | 2026-07-02 |
| Navigation auf /upgrade ausgeblendet | Paywall-Seite soll ablenkungsfrei sein | 2026-07-02 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kein next-pwa Paket | Next.js unterstützt manifest.json nativ; minimaler SW reicht für Installierbarkeit; spart Abhängigkeit + App-Router-Kompatibilitätsprobleme | 2026-07-02 |
| NavigationShell als Client Component mit usePathname | Route-spezifisches Ein-/Ausblenden der Nav lässt sich nur client-seitig per usePathname lösen; Server Components kennen den Pfad nicht direkt | 2026-07-02 |
| Admin-Check in layout.tsx (Server) | ADMIN_EMAIL ist Env-Variable; serverseitige Prüfung ist sicherer als client-seitig; Ergebnis wird als Prop weitergegeben | 2026-07-02 |
| Icons per sharp aus SVG generiert | sharp ist bereits durch Next.js vorhanden; kein Extra-Tool nötig; SVG als Single Source of Truth | 2026-07-02 |
| env(safe-area-inset-bottom) für iOS Bottom Nav | iOS Home Indicator überlagert sonst die Nav; CSS-Variable ist die korrekte Lösung ohne JS | 2026-07-02 |

---

## Tech Design (Solution Architect)

### Komponentenstruktur

```
src/app/layout.tsx  (Server Component — liest User + Admin-Status)
  ├── <head>
  │    ├── PWA Meta-Tags (iOS: apple-mobile-web-app-capable etc.)
  │    ├── <link rel="manifest">
  │    └── Service Worker Registrierung (inline script)
  │
  └── <NavigationShell isAdmin isLoggedIn>
       ├── <TopNav>          ← Desktop-Header (versteckt auf Mobile via CSS)
       ├── {children}        ← Seiteninhalt mit automatischem Bottom-Padding auf Mobile
       └── <BottomNav>       ← Mobile-Leiste (versteckt auf Desktop via CSS)

src/components/
  ├── navigation-shell.tsx   ← Client Component: prüft Pfad, blendet Nav aus wenn nötig
  ├── top-nav.tsx            ← Client Component: Logo + Links + aktiver Zustand
  └── bottom-nav.tsx         ← Client Component: Icons + Labels + aktiver Zustand

public/
  ├── manifest.json          ← PWA-Manifest
  ├── sw.js                  ← Service Worker (minimal)
  ├── icon.svg               ← Quell-Icon (bereits erstellt)
  ├── icon-192.png           ← Aus SVG generiert
  ├── icon-512.png           ← Aus SVG generiert
  └── apple-touch-icon.png   ← 180×180px für iOS
```

### Datenfluss

```
layout.tsx (Server)
  → Supabase: Wer ist eingeloggt?
  → process.env.ADMIN_EMAIL: Ist User Admin?
  → gibt isLoggedIn + isAdmin als Props an NavigationShell

NavigationShell (Client)
  → usePathname(): Welche Seite?
  → Versteckt Nav auf: /login, /registrieren, /auth/*, /admin/*, /upgrade
  → Zeigt Nav auf allen anderen Seiten

TopNav + BottomNav (Client)
  → Empfangen isAdmin als Prop
  → usePathname() für aktiven Tab-Highlight
  → Admin-Tab nur wenn isAdmin === true
```

### PWA-Konfiguration

**manifest.json:**
- name: "endlichsatt", short_name: "endlichsatt"
- start_url: "/", display: "standalone"
- theme_color: "#4A7C59", background_color: "#F7F0E6"
- icons: icon-192.png, icon-512.png (inkl. maskable purpose)

**Service Worker (public/sw.js):**
- Install-Event: JS/CSS/Fonts in Cache speichern
- Fetch-Event: Cache-first für statische Assets, Network-first für Seitennavigation
- Kein Content-Caching (Mahlzeiten, Rezepte bleiben online-only)

**iOS Meta-Tags in layout.tsx:**
- apple-mobile-web-app-capable: yes
- apple-mobile-web-app-status-bar-style: default
- apple-mobile-web-app-title: endlichsatt
- apple-touch-icon: /apple-touch-icon.png

### Navigation-Tabs

| Tab | Icon | Pfad | Sichtbarkeit |
|-----|------|------|--------------|
| Startseite | Home | / | Immer |
| Analyse | Plus/Scan | /analyse | Immer |
| Rezepte | ChefHat | /rezepte | Immer |
| Historie | Clock | /historie | Immer |
| Konto | User | /konto | Immer |
| Admin | Shield | /admin | Nur wenn isAdmin |

### Pakete

Keine neuen Abhängigkeiten. `sharp` (bereits durch Next.js vorhanden) wird einmalig per Skript für Icon-Konvertierung genutzt.

## QA Test Results

**Tested:** 2026-07-02
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### PWA-Grundkonfiguration
- [x] manifest.json erreichbar, alle Pflichtfelder korrekt (name, start_url, display, theme_color, icons)
- [x] sw.js erreichbar und registrierbar
- [x] apple-touch-icon.png erreichbar (180×180)
- [x] manifest-Link im `<head>` vorhanden
- [x] apple-touch-icon-Link im `<head>` vorhanden
- [x] display: standalone in Manifest gesetzt — App öffnet sich ohne Browser-Chrome wenn installiert
- [x] iOS Meta-Tags via Next.js `appleWebApp` Metadata API korrekt gesetzt

#### Bottom Navigation (Mobil)
- [x] Bottom Nav sichtbar auf Startseite nach Login
- [x] Enthält alle 5 Standard-Tabs (Start, Analyse, Rezepte, Historie, Konto)
- [x] Aktiver Tab (Startseite) ist hervorgehoben (text-[#4A7C59])
- [x] Aktiver Tab wechselt beim Navigieren zu /rezepte
- [x] Bottom Nav auf Sub-Seite /konto sichtbar (fixed)
- [x] Keine Bottom Nav auf /login
- [x] Keine Bottom Nav auf /upgrade
- [x] Keine Bottom Nav auf /admin
- [x] Keine Bottom Nav auf /registrieren

#### Top Navigation (Desktop)
- [x] Top Nav mit Logo "endlichsatt" sichtbar auf Startseite (chromium, 1440px)
- [x] Enthält alle 5 Standard-Links (Startseite, Analyse, Rezepte, Historie, Konto)
- [x] Aktiver Link (/rezepte) ist hervorgehoben (bg-[#E8F0EB])
- [x] Keine Top Nav auf /login
- [x] Keine Top Nav auf /admin
- [x] Kein Admin-Link für normalen Nutzer sichtbar

#### Admin-Zugang
- [x] Admin-Link nicht sichtbar für normalen QA-Nutzer
- [ ] Admin-Link sichtbar für Admin-Nutzer — **nicht automatisch testbar** (QA-Konto ist kein Admin; manuell zu verifizieren)

### Edge Cases Status

#### EC-1: Nicht eingeloggter Nutzer auf /login
- [x] Keine Navigation sichtbar — korrekt

#### EC-2: Navigation auf /admin/* ausgeblendet
- [x] Korrekt — HIDDEN_PREFIXES greift für alle /admin-Subpfade

#### EC-3: Navigation auf /upgrade ausgeblendet
- [x] Korrekt

#### EC-4: Navigation auf /auth/* ausgeblendet
- [x] Korrekt — /auth/bestaetigen getestet

### Bugs Found

#### BUG-1: viewport-fit=cover fehlt — safe-area-inset-bottom funktioniert nicht auf iOS
- **Severity:** Medium
- **Steps to Reproduce:**
  1. App auf iPhone installieren
  2. Bottom Navigation zeigt sich ggf. hinter dem iOS Home Indicator
  3. `env(safe-area-inset-bottom)` gibt 0px zurück, wenn `viewport-fit=cover` im Viewport-Meta-Tag fehlt
- **Root Cause:** `layout.tsx` exportiert `viewport: { themeColor: "#4A7C59" }` aber `viewportFit: "cover"` fehlt
- **Fix:** `viewport` in `layout.tsx` um `viewportFit: "cover"` ergänzen
- **Priority:** Fix vor Deployment (betrifft iOS-Erlebnis)

#### BUG-2: /rezept/[id] — "Rezepte"-Tab in Bottom Nav nicht aktiv
- **Severity:** Low
- **Steps to Reproduce:**
  1. Auf /rezepte navigieren → "Rezepte"-Tab ist grün
  2. Auf ein einzelnes Rezept klicken (/rezept/abc)
  3. "Rezepte"-Tab ist NICHT hervorgehoben (pathname `/rezept/...` matched nicht `/rezepte`)
- **Root Cause:** `pathname.startsWith('/rezepte')` matcht nicht `/rezept/[id]`
- **Fix:** In bottom-nav.tsx und top-nav.tsx den Rezepte-Check auf `/rezept` erweitern
- **Priority:** Nice to have (UX-Kleinigkeit)

### Security Audit
- [x] Admin-Check ist server-seitig (ADMIN_EMAIL als Env-Var, kein NEXT_PUBLIC_ Prefix) — sicher
- [x] Kein sensitives Daten-Leak durch Navigation (nur `isAdmin: boolean` an Client übergeben)
- [x] SW cached keine User-spezifischen Inhalte
- [x] manifest.json enthält keine sensitiven Informationen

### Parallele Tests
- Die E2E-Tests für PROJ-15 müssen mit `--workers=1` laufen (sequenziell), da parallele Supabase-Logins zu Timeouts führen können.

### Summary
- **Acceptance Criteria:** 18/19 testbar — 18 bestanden, 1 nicht automatisch testbar (Admin-Link manuell zu prüfen)
- **Bugs Found:** 2 (0 Critical, 0 High, 1 Medium, 1 Low)
- **Security:** Bestanden
- **Production Ready:** **JA** — BUG-1 (Medium) sollte vor Deployment gefixt werden, BUG-2 (Low) kann danach
- **Recommendation:** BUG-1 vor Deployment fixen, dann deployen

## Deployment

**Deployed:** 2026-07-02
**Commit:** 4be3b1d
**Branch:** main → Vercel Auto-Deploy

BUG-2 (Low, /rezept/[id] Tab nicht aktiv) bleibt als bekannte Kleinigkeit offen.
