'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setError('Bitte bestätige zuerst deine E-Mail-Adresse. Schau in dein Postfach.')
        } else {
          setError('E-Mail oder Passwort falsch.')
        }
        return
      }

      if (data.session) {
        const params = new URLSearchParams(window.location.search)
        const raw = params.get('redirectTo') ?? '/'
        // Only allow internal paths — reject absolute URLs and protocol-relative URLs
        const redirectTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
        window.location.href = redirectTo
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">endlichsatt</h1>
          <p className="text-sm text-muted-foreground mt-1">Was nach dem Kalorienzählen kommt.</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Willkommen zurück</CardTitle>
            <CardDescription>Melde dich an, um weiterzumachen.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passwort</Label>
                  <Link
                    href="/auth/passwort-vergessen"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Passwort vergessen?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" size="lg" className="w-full px-4" disabled={loading}>
                {loading ? 'Einloggen…' : 'Einloggen'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Noch kein Konto?{' '}
              <Link href="/registrieren" className="text-primary hover:underline font-medium">
                Registrieren
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
