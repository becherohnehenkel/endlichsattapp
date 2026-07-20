'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RegistrierenFormProps {
  /** PROJ-19: true wenn der aktuelle User anonym ist und seinen Account upgradet */
  isAnonymousUpgrade?: boolean
}

export default function RegistrierenForm({ isAnonymousUpgrade = false }: RegistrierenFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      if (isAnonymousUpgrade) {
        // PROJ-19: Upgrade anonymous account — keeps the same user_id so all guest
        // analyses are preserved. Supabase sends a confirmation email to activate.
        const { error } = await supabase.auth.updateUser({
          email,
          password,
          data: { name },
        })
        if (error) {
          setError('Upgrade fehlgeschlagen. Bitte versuche es erneut.')
          return
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) {
          if (error.message.toLowerCase().includes('already registered') ||
              error.message.toLowerCase().includes('user already exists')) {
            setError('Diese E-Mail-Adresse ist bereits registriert.')
          } else {
            setError('Registrierung fehlgeschlagen. Bitte versuche es erneut.')
          }
          return
        }
      }

      window.location.href = '/auth/bestaetigen'
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
            <CardTitle className="text-xl">Konto erstellen</CardTitle>
            <CardDescription>Kostenlos loslegen — keine Kreditkarte nötig.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dein Vorname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
              </div>

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
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 Zeichen"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Mit der Registrierung akzeptierst du unsere{' '}
                <Link href="/datenschutz" className="text-[#2E9E6B] hover:underline">Datenschutzerklärung</Link>.
              </p>

              <Button type="submit" size="lg" className="w-full px-4" disabled={loading}>
                {loading ? 'Konto wird erstellt…' : 'Konto erstellen'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Bereits registriert?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Einloggen
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
