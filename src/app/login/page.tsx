import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/login-form'

// BUG-4-Fix (siehe features/PROJ-2-user-authentication.md Decision Log, 2026-06-16):
// War vorher eine reine 'use client'-Seite ohne serverseitige Datenabfrage — Next.js
// optimierte die Route dadurch zu einer vollständig statischen Seite, bei der die
// Middleware-Weiterleitung für bereits eingeloggte Nutzer nicht griff (Next.js/Turbopack-
// Eigenheit bei statischen Routen). Dieser dünne Server-Component-Wrapper macht die Route
// dynamisch (gleiches Muster wie "/" und "/analyse") und übernimmt den Redirect zusätzlich
// selbst — robust unabhängig davon ob die Middleware greift.
export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) redirect('/')

  return <LoginForm />
}
