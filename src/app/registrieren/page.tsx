import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RegistrierenForm from '@/components/registrieren-form'

// BUG-4-Fix — siehe src/app/login/page.tsx für die ausführliche Begründung.
export default async function RegistrierenPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) redirect('/')

  return <RegistrierenForm />
}
