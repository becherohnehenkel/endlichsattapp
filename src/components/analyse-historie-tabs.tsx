'use client'

import { Dumbbell, ClipboardCheck } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import MahlzeitHistorie from '@/components/mahlzeit-historie'

function BaldVerfuegbarTab({ icon: Icon, label }: { icon: typeof Dumbbell; label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-16">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">Bald verfügbar.</p>
    </div>
  )
}

// PROJ-42: Sektion 3 der Analyse-Übersicht, nur für eingeloggte Nutzer gerendert.
// Struktur bewusst so gebaut, dass Trainingseinheiten/Check-Ins später als gleichwertige
// Kategorien andocken können, ohne die Seite neu zu strukturieren (siehe Spec Decision Log).
export function AnalyseHistorieTabs() {
  return (
    <Tabs defaultValue="mahlzeiten">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="mahlzeiten">Analysierte Mahlzeiten</TabsTrigger>
        <TabsTrigger value="training">Trainingseinheiten</TabsTrigger>
        <TabsTrigger value="checkin">Check-Ins</TabsTrigger>
      </TabsList>
      <TabsContent value="mahlzeiten" className="mt-4">
        <MahlzeitHistorie embedded />
      </TabsContent>
      <TabsContent value="training" className="mt-4">
        <BaldVerfuegbarTab icon={Dumbbell} label="Trainingseinheiten" />
      </TabsContent>
      <TabsContent value="checkin" className="mt-4">
        <BaldVerfuegbarTab icon={ClipboardCheck} label="Check-Ins" />
      </TabsContent>
    </Tabs>
  )
}
