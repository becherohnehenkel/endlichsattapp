import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const raw = searchParams.get('next') ?? '/analyse'
  // Only allow internal paths — reject absolute URLs and protocol-relative URLs
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/analyse'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // PROJ-52: bei einem frischen Signup (nicht dem PROJ-19-Anonym-Upgrade-Pfad, der die
      // Einwilligung bereits direkt beim Upgrade setzt) existiert erst hier — nach
      // erfolgreicher E-Mail-Bestätigung — eine echte Session. Die bei der Registrierung
      // in den user_metadata mitgegebene Zustimmung wird jetzt in `profiles` übernommen.
      // `is null` macht den Aufruf idempotent, falls der Bestätigungslink doppelt geöffnet wird.
      const user = data.user
      if (user?.user_metadata?.gesundheitsdaten_einwilligung === true) {
        const admin = createAdminClient()
        await admin
          .from('profiles')
          .update({ gesundheitsdaten_einwilligung_at: new Date().toISOString() })
          .eq('id', user.id)
          .is('gesundheitsdaten_einwilligung_at', null)
      }
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL('/auth/bestaetigen?fehler=1', origin))
}
