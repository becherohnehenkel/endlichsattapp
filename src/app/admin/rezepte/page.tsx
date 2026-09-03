import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, ChevronLeft } from 'lucide-react'
import AdminRezeptListe, { type AdminRezeptListItem } from '@/components/admin-rezept-liste'
import type { RecipeTyp } from '@/lib/recipe-typ'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email !== process.env.ADMIN_EMAIL) redirect('/admin/403')
  return { supabase, user }
}

export default async function AdminRezeptePage() {
  const { supabase } = await requireAdmin()

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, image_path, cook_time_minutes, total_time_minutes, created_at, recipe_typ')
    .order('created_at', { ascending: false })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  // PROJ-16 (Refinement 2026-09-03, Teil 6): Auth + Datenladen bleiben hier serverseitig,
  // Filterung + Darstellung wandert in die neue Client-Component AdminRezeptListe.
  const rezepte: AdminRezeptListItem[] = (recipes ?? []).map(r => ({
    id: r.id,
    title: r.title,
    imageUrl: r.image_path
      ? `${supabaseUrl}/storage/v1/object/public/recipe-images/${r.image_path}`
      : null,
    total_time_minutes: r.total_time_minutes,
    recipeTyp: r.recipe_typ as RecipeTyp,
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Rezepte verwalten</h1>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
        <Link href="/admin/rezepte/neu">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Neues Rezept
          </Button>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <AdminRezeptListe recipes={rezepte} />
      </main>
    </div>
  )
}
