'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

// Rendered when /analyse is visited without any session.
// Creates an anonymous Supabase session silently, then refreshes the page so
// the server component re-renders with the new user and loads their profile.
export default function AnonSignInInit() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.signInAnonymously().then(({ error }) => {
      if (!error) router.refresh()
    })
  }, [router])

  return (
    <main className="px-4 py-6 max-w-sm mx-auto space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </main>
  )
}
