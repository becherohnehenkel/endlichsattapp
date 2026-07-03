import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Clock, ChefHat, ChevronLeft } from 'lucide-react'
import AdminDeleteButton from './admin-delete-button'

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
    .select('id, title, image_path, cook_time_minutes, total_time_minutes, created_at')
    .order('created_at', { ascending: false })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

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
          <Button size="sm" className="bg-[#4A7C59] hover:bg-[#3d6849] text-white">
            <Plus className="h-4 w-4 mr-1" />
            Neues Rezept
          </Button>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {!recipes || recipes.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ChefHat className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Noch keine Rezepte. Lege das erste an!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recipes.map((recipe) => {
              const imageUrl = recipe.image_path
                ? `${supabaseUrl}/storage/v1/object/public/recipe-images/${recipe.image_path}`
                : null
              return (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={recipe.title}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <ChefHat className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{recipe.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{recipe.total_time_minutes} Min.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link href={`/admin/rezepte/${recipe.id}/bearbeiten`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AdminDeleteButton recipeId={recipe.id} title={recipe.title} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
