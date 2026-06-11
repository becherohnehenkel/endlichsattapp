'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/passwort-neu`,
      })
      setStatus(error ? 'error' : 'sent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">endlichsatt</h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Passwort zurücksetzen</CardTitle>
            <CardDescription>
              Gib deine E-Mail ein — wir schicken dir einen Reset-Link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'sent' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Falls ein Konto mit dieser E-Mail existiert, haben wir einen Reset-Link geschickt.
                  Der Link ist 1 Stunde gültig.
                </p>
                <p className="text-center text-sm">
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Zurück zum Login
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-destructive">
                    Fehler beim Senden. Bitte versuche es erneut.
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Wird gesendet…' : 'Reset-Link senden'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">
                    Zurück zum Login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
