import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 }) }
  }

  if (user.email !== process.env.ADMIN_EMAIL) {
    return { user: null, error: NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 }) }
  }

  return { user, error: null }
}
