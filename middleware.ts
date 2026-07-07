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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
