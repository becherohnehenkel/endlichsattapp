import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserRound, Play, Lightbulb, TrendingUp, ChefHat, CheckCircle2, ArrowRight, Check, Info } from 'lucide-react'
import { PwaInstallHinweis } from '@/components/pwa-install-hinweis'

const KARTEN = [
  {
    icon: Lightbulb,
    titel: 'Wissen wird zur Tat',
    text: 'Lerne, worauf es beim Abnehmen ankommt und wie Mahlzeiten sättigend werden.',
    href: '/ernaehrung',
  },
  {
    icon: TrendingUp,
    titel: 'Fortschritt sichtbar machen',
    text: 'Verfolge deine Entwicklung — online und offline.',
    href: '/analyse',
  },
  {
    icon: ChefHat,
    titel: 'Klau dir Rezepte',
    text: 'Stöbere in der Bibliothek, probier was Neues.',
    href: '/ernaehrung/rezepte',
  },
  {
    icon: CheckCircle2,
    titel: "Mach's dir messbar",
    text: 'Reflektiere ehrlich, wie deine Woche lief.',
    href: '/check-in',
  },
] as const

const ZIELE = [
  '80–90 % der Zeit vollwertig und bewusst essen',
  'Ausreichend Wasser trinken',
  'Alltagsbewegung hoch halten (Schritte, Haushalt, etc.)',
  'Sport: 3× die Woche (Kraft- und Ausdauertraining gemischt)',
  'Schlaf priorisieren',
  'Körpergefühl schärfen',
] as const

// PROJ-47: Ersetzt die bisherige, personalisierte Startseite (letzte Analysen,
// Rezept-Vorschau, Teaser) durch einen einheitlichen Willkommens-Moment — identisch
// für Gast und eingeloggten Nutzer, bis auf die optionale Namens-Personalisierung in
// der Begrüßung. Die entfernten Inhalte bleiben über ihre eigenen Tabs erreichbar
// (/analyse, /ernaehrung/rezepte).
export default async function StartPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  const isGuest = !user || user.is_anonymous === true

  let vorname: string | null = null
  if (!isGuest && user) {
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single()
    vorname = profile?.name?.trim().split(/\s+/)[0] || null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-foreground tracking-tight">Mehralsabnehmen</span>
        <Link href="/konto" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted">
          <UserRound className="h-4 w-4" />
        </Link>
      </header>

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-8 space-y-8">

        {/* ── Begrüßung ─────────────────────────────────────── */}
        <section className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#2E9E6B] uppercase tracking-wide">Mehralsabnehmen</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              {vorname ? `Schön, dass du da bist, ${vorname}.` : 'Schön, dass du da bist.'}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kurz erklärt: was dich erwartet, wie du loslegst.
            </p>
          </div>
          <PwaInstallHinweis />
        </section>

        {/* ── Video-Platzhalter ─────────────────────────────── */}
        <section className="space-y-2">
          <div className="rounded-[20px] bg-gradient-to-br from-[#0E7C86] to-[#2E9E6B] aspect-[16/10] flex flex-col items-center justify-center gap-2.5">
            <div className="w-14 h-14 rounded-full bg-white/20 border border-white/50 flex items-center justify-center">
              <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
            </div>
            <span className="text-[13px] font-semibold text-white bg-[#0B2C30]/35 px-3 py-1 rounded-full">
              So funktioniert die App
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            <span className="font-semibold text-foreground">Video kommt bald</span>
          </p>
        </section>

        {/* ── Ultimatives Ziel (PROJ-48) ─────────────────────── */}
        {/* Bewusst ohne Rahmen-Box/Hover-Effekt wie die Funktions-Karten darunter — auf den
            ersten Blick klar: diese Sektion ist zum Lesen, nicht zum Klicken. */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              Ein Ziel für uns alle
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Wir alle haben das gleiche Ziel — die Frage ist nur, wie wir da hinkommen. Der Weg dahin ist so individuell wie dein Fingerabdruck. Das Problem: Niemand von uns mag Veränderung.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deswegen geht diese App einen anderen Weg — kleine Anpassungen, die deinen Alltag verändern, ohne dass es sich nach viel anfühlt. Ich möchte, dass du nach 6 Monaten sagen kannst: Auf deinen Körper zu achten ist für dich einfach normal geworden. Nimm dir die Zeit, die du brauchst — dein aktuelles Gewicht ist auch nicht über Nacht entstanden. Geh Schritt für Schritt durch die App, schau, was dir gerade hilft, und verändere deinen Alltag langsam. Viel Spaß dabei!
            </p>
          </div>
          <ul className="space-y-2.5 rounded-2xl bg-[#DFF0F2]/60 p-4">
            {ZIELE.map(ziel => (
              <li key={ziel} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check className="h-4 w-4 text-[#2E9E6B] flex-shrink-0 mt-0.5" />
                <span>{ziel}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Gast/Login-Hinweis ────────────────────────────── */}
        <div className="rounded-2xl bg-[#DFF0F2] p-4 flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-white flex items-center justify-center flex-shrink-0">
            <Info className="h-4 w-4 text-[#0E7C86]" />
          </div>
          <p className="text-xs text-[#0E7C86] leading-relaxed">
            Du kannst diese App gratis nutzen, ohne dich einzuloggen. Deine Einträge werden dann aber nicht gespeichert und sind mit dem Neuladen der Seite weg. Meldest du dich an, bleibt es kostenlos — aber du kannst deinen Fortschritt wochenlang verfolgen und analysieren. Ich sehe deine Daten nicht, außer du gibst sie mir ausdrücklich frei. (Kommendes Feature für die Zukunft)
          </p>
        </div>

        {/* ── Funktions-Karten ──────────────────────────────── */}
        <section className="space-y-3.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">So legst du los</p>
          <div className="space-y-3">
            {KARTEN.map(karte => (
              <Link
                key={karte.href}
                href={karte.href}
                className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 hover:border-[#2E9E6B] transition-colors"
              >
                <div className="w-[42px] h-[42px] rounded-xl bg-[#DFF0F2] flex items-center justify-center flex-shrink-0">
                  <karte.icon className="h-5 w-5 text-[#2E9E6B]" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-foreground leading-tight">{karte.titel}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{karte.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Coach-Banner ──────────────────────────────────── */}
        <a
          href="https://www.onlineernaehrungsberater.de/#coachingstart"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 rounded-2xl bg-[#0E7C86] px-5 py-4 hover:brightness-105 transition-[filter]"
        >
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">Lieber mit Coach an deiner Seite?</p>
            <p className="text-xs text-white/80">Persönliche Begleitung statt Alleingang.</p>
          </div>
          <div className="w-[34px] h-[34px] rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="h-4 w-4 text-white" />
          </div>
        </a>

      </main>
    </div>
  )
}
