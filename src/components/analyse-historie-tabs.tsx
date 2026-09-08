'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import MahlzeitHistorie from '@/components/mahlzeit-historie'
import TrainingHistorie from '@/components/training-historie'
import CheckInHistorie from '@/components/checkin-historie'
import { GesundheitsdatenConsentGate } from '@/components/gesundheitsdaten-consent-gate'

// PROJ-42: Sektion 3 der Analyse-Übersicht, nur für eingeloggte Nutzer gerendert.
// Struktur bewusst so gebaut, dass Trainingseinheiten/Check-Ins später als gleichwertige
// Kategorien andocken können, ohne die Seite neu zu strukturieren (siehe Spec Decision Log).
export function AnalyseHistorieTabs() {
  return (
    <Tabs defaultValue="mahlzeiten">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="mahlzeiten">Mahlzeiten</TabsTrigger>
        <TabsTrigger value="training">Training</TabsTrigger>
        <TabsTrigger value="checkin">Check-Ins</TabsTrigger>
      </TabsList>
      <TabsContent value="mahlzeiten" className="mt-4">
        <MahlzeitHistorie embedded />
      </TabsContent>
      <TabsContent value="training" className="mt-4">
        <TrainingHistorie />
      </TabsContent>
      <TabsContent value="checkin" className="mt-4">
        <GesundheitsdatenConsentGate aktiv>
          <CheckInHistorie />
        </GesundheitsdatenConsentGate>
      </TabsContent>
    </Tabs>
  )
}
