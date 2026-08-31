import { ErnaehrungSubHeader } from '@/components/ernaehrung-sub-header'
import { EmotionalesEssenGuide } from '@/components/emotionales-essen-guide'

export default function EmotionalesEssenPage() {
  return (
    <div className="min-h-screen bg-background">
      <ErnaehrungSubHeader title="Emotionales Essen" />

      <main className="max-w-sm md:max-w-[850px] mx-auto px-4 py-6">
        <EmotionalesEssenGuide />
      </main>
    </div>
  )
}
