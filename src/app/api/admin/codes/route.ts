import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const CODE_LENGTH = 8
const MAX_ATTEMPTS = 3

function generateCode(): string {
  return Array.from({ length: CODE_LENGTH }, () =>
    CHARSET[Math.floor(Math.random() * CHARSET.length)]
  ).join('')
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (user.email !== process.env.ADMIN_EMAIL) return null
  return user
}

export async function POST() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
  }

  const admin = createAdminClient()

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateCode()
    const { error } = await admin
      .from('invite_codes')
      .insert({ code, created_at: new Date().toISOString() })

    if (!error) {
      return NextResponse.json({ code })
    }
    // unique violation → retry with new code
    if (error.code !== '23505') {
      return NextResponse.json({ error: 'Fehler beim Generieren' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Fehler beim Generieren' }, { status: 500 })
}
