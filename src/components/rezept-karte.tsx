import Image from 'next/image'
import Link from 'next/link'
import { Clock, ChefHat } from 'lucide-react'

export interface RezeptKarteData {
  id: string
  title: string
  imageUrl: string | null
  total_time_minutes: number
}

export default function RezeptKarte({ id, title, imageUrl, total_time_minutes }: RezeptKarteData) {
  return (
    <Link
      href={`/rezept/${id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-accent/30 active:bg-accent/50 transition-colors"
    >
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <ChefHat className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground leading-tight line-clamp-2">{title}</p>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>{total_time_minutes} Min.</span>
        </div>
      </div>
    </Link>
  )
}
