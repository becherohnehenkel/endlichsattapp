import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Read session for redirect decisions — getSession() is reliable in Edge Runtime (local JWT decode, no network)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // PROJ-19: /analyse is public — anon session created client-side on first visit.
  // /historie needs a full account — unauthenticated visitors go to /konto with context.
  const isHistorie = request.nextUrl.pathname.startsWith('/historie')
  if (!user && isHistorie) {
    const redirectUrl = new URL('/konto', request.url)
    redirectUrl.searchParams.set('reason', 'historie')
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect logged-in non-anonymous users away from auth pages.
  // PROJ-6 machte "/" zur Startseite/History-Landingpage ("natürlicher App-Einstieg") und änderte
  // den client-seitigen Post-Login-Redirect in login/page.tsx entsprechend — dieser serverseitige
  // Pfad (bereits eingeloggt, ruft /login oder /registrieren direkt auf) hatte noch das alte Ziel
  // "/analyse" hartcodiert. Auf "/" vereinheitlicht für Konsistenz zwischen beiden Pfaden.
  // PROJ-19: anonymous users may visit /registrieren to upgrade their account — skip redirect for them.
  const isAuthRoute = request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/registrieren'
  const isAnonymous = user?.is_anonymous === true

  if (user && !isAnonymous && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Bugfix 2026-08-04 (gefunden bei PROJ-30-QA): `/rezept/[id]` liegt hinter einem
  // `loading.tsx` (Suspense-Streaming) — ruft die Seite dort `notFound()` auf (z.B. für ein
  // fremdes privates Rezept, das RLS korrekt verbirgt), sind die Response-Header inkl.
  // Status-Code laut Next.js-Doku bereits als 200 verschickt, bevor notFound() greift; der
  // Seiteninhalt ist korrekt (kein Datenleck), nur der HTTP-Status bleibt fälschlich 200.
  // Next.js' eigene Doku empfiehlt genau diesen Fall im Proxy zu prüfen (siehe
  // https://nextjs.org/docs/app/api-reference/file-conventions/loading#status-codes).
  // Bewusst nur ein leichtgewichtiger Existenz-Check (select('id')) — die Seite selbst lädt
  // weiterhin die vollen Daten, hier geht es nur um den korrekten Status-Code.
  const recipeMatch = request.nextUrl.pathname.match(/^\/rezept\/([^/]+)$/)
  if (recipeMatch) {
    const recipeId = recipeMatch[1]
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipeId)
    const recipeExists = isValidUuid && !!(
      await supabase.from('recipes').select('id').eq('id', recipeId).maybeSingle()
    ).data
    if (!recipeExists) {
      return NextResponse.rewrite(request.url, { status: 404 })
    }
  }

  // Bugfix 2026-08-04 (gefunden bei PROJ-31-QA): dieselbe Ursache wie oben, aber für die
  // Bearbeiten-Route (`/rezept/[id]/bearbeiten`) — dort reicht eine reine Existenz-/
  // Sichtbarkeits-Prüfung nicht aus, da ein offizielles Rezept zwar sichtbar (RLS), aber nicht
  // bearbeitbar ist. Geprüft wird deshalb explizit die Eigentümerschaft, nicht nur die Existenz.
  // Für Gäste/anonyme Nutzer greift stattdessen weiterhin der bestehende redirect() der Seite
  // selbst (Aufforderung zur Registrierung) — hier nur der Eigentümer-404-Fall.
  const recipeEditMatch = request.nextUrl.pathname.match(/^\/rezept\/([^/]+)\/bearbeiten$/)
  if (recipeEditMatch && user && !isAnonymous) {
    const recipeId = recipeEditMatch[1]
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipeId)
    const { data: editableRecipe } = isValidUuid
      ? await supabase.from('recipes').select('owner_id').eq('id', recipeId).maybeSingle()
      : { data: null }
    if (!editableRecipe || editableRecipe.owner_id !== user.id) {
      return NextResponse.rewrite(request.url, { status: 404 })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
