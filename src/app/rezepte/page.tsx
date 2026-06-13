import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import RezeptBibliothek, { type RezeptListItem } from '@/components/rezept-bibliothek'

export default async function RezeptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, image_path, total_time_minutes, cuisine_tags')
    .order('created_at', { ascending: false })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const rezepte: RezeptListItem[] = (recipes ?? []).map(r => ({
    id: r.id,
    title: r.title,
    imageUrl: r.image_path
      ? `${supabaseUrl}/storage/v1/object/public/recipe-images/${r.image_path}`
      : null,
    total_time_minutes: r.total_time_minutes,
    cuisine_tags: r.cuisine_tags ?? [],
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-16">
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </Link>
        <span className="font-semibold text-foreground tracking-tight flex-1 text-center">Rezepte</span>
        <div className="w-16" />
      </header>

      <RezeptBibliothek rezepte={rezepte} />
    </div>
  )
}
