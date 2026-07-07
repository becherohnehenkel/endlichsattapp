import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RegistrierenForm from '@/components/registrieren-form'

export default async function RegistrierenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // PROJ-19: Anonymous users may visit /registrieren to upgrade their account — don't redirect them.
  // Only fully logged-in users (with e-mail) are sent back home.
  if (user && !user.is_anonymous) redirect('/')

  const isAnonymousUpgrade = user?.is_anonymous === true

  return <RegistrierenForm isAnonymousUpgrade={isAnonymousUpgrade} />
}
