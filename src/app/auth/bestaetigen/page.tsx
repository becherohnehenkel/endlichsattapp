'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function BestaetigenContent() {
  const searchParams = useSearchParams()
  const hatFehler = searchParams.get('fehler') === '1'
  const [resendEmail, setResendEmail] = useState('')
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [resendLoading, setResendLoading] = useState(false)

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    setResendLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      setResendStatus(error ? 'error' : 'sent')
    } finally {
      setResendLoading(false)
    }
  }

  if (hatFehler) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Link abgelaufen</CardTitle>
          <CardDescription>
            Dieser Bestätigungslink ist nicht mehr gültig. Fordere einen neuen an.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resendStatus === 'sent' ? (
            <p className="text-sm text-primary">
              Neue E-Mail wurde verschickt. Schau in dein Postfach.
            </p>
          ) : (
            <form onSubmit={handleResend} className="space-y-4">
              <input
                type="email"
                placeholder="deine@email.de"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {resendStatus === 'error' && (
                <p className="text-sm text-destructive">Fehler — bitte versuche es erneut.</p>
              )}
              <Button type="submit" className="w-full" disabled={resendLoading}>
                {resendLoading ? 'Wird gesendet…' : 'Neuen Link anfordern'}
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link href="/login" className="text-primary hover:underline">Zurück zum Login</Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="text-3xl mb-2">📬</div>
        <CardTitle className="text-xl">Schau in dein Postfach</CardTitle>
        <CardDescription>
          Wir haben dir eine Bestätigungsmail geschickt. Klicke den Link darin, um dein Konto zu aktivieren.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Keine E-Mail bekommen? Schau auch im Spam-Ordner nach.
        </p>

        {resendStatus === 'sent' ? (
          <p className="text-sm text-primary">Neue E-Mail wurde verschickt.</p>
        ) : (
          <form onSubmit={handleResend} className="space-y-3">
            <input
              type="email"
              placeholder="E-Mail erneut eingeben"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              required
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" variant="outline" className="w-full" disabled={resendLoading}>
              {resendLoading ? 'Wird gesendet…' : 'Erneut senden'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground pt-2">
          <Link href="/login" className="text-primary hover:underline">Zurück zum Login</Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function BestaetigenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">endlichsatt</h1>
        </div>
        <Suspense fallback={null}>
          <BestaetigenContent />
        </Suspense>
      </div>
    </main>
  )
}
