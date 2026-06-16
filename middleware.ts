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

  // Redirect unauthenticated users away from protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/analyse') ||
    request.nextUrl.pathname.startsWith('/historie')

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect logged-in users away from auth pages.
  // PROJ-6 machte "/" zur Startseite/History-Landingpage ("natürlicher App-Einstieg") und änderte
  // den client-seitigen Post-Login-Redirect in login/page.tsx entsprechend — dieser serverseitige
  // Pfad (bereits eingeloggt, ruft /login oder /registrieren direkt auf) hatte noch das alte Ziel
  // "/analyse" hartcodiert. Auf "/" vereinheitlicht für Konsistenz zwischen beiden Pfaden.
  const isAuthRoute = request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/registrieren'

  if (user && isAuthRoute) {
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
