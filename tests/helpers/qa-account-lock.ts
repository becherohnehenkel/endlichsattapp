import fs from 'fs'
import os from 'os'
import path from 'path'

// PROJ-11 (Paywall) und PROJ-12 (Invite-Codes) mutieren temporär den Zugriffs-Zustand
// (trial_ends_at, subscription_status, invite_code_redeemed_at, photo_scans_remaining)
// desselben QA-Testkontos. Mit fullyParallel:true kann Playwright ihre Tests auf
// unterschiedliche Worker-Prozesse verteilen — ohne Sperre würden sich beide Dateien
// beim gleichzeitigen Schreiben auf dieselbe Profil-Zeile überschreiben. Diese
// verzeichnisbasierte Sperre (mkdir ist atomar, funktioniert prozessübergreifend auf
// derselben Maschine) serialisiert nur das kurze Zeitfenster, in dem ein Testblock den
// echten Zustand überschrieben hat.
const LOCK_PATH = path.join(os.tmpdir(), 'endlichsatt-qa-account.lock')
// Bis zu 8 Blöcke (PROJ-11: 3 Blöcke, PROJ-12: 1 Block, je x2 Browser-Projekte) können
// auf dieselbe Sperre warten; bei ungünstiger Reihenfolge braucht das letzte Element in
// der Warteschlange entsprechend lange. Aufrufer müssen ihr eigenes test.setTimeout()
// entsprechend über diesem Wert setzen (Playwrights Hook-Default von 30s reicht nicht).
export const LOCK_TIMEOUT_MS = 120_000
const POLL_INTERVAL_MS = 200

export async function acquireQaAccountLock(): Promise<() => void> {
  const start = Date.now()
  for (;;) {
    try {
      fs.mkdirSync(LOCK_PATH)
      return () => {
        try {
          fs.rmdirSync(LOCK_PATH)
        } catch {
          // bereits entfernt — kein Problem
        }
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err
      if (Date.now() - start > LOCK_TIMEOUT_MS) {
        throw new Error('QA-Konto-Sperre: Timeout beim Warten auf Freigabe (anderer Testlauf hängt?)')
      }
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
    }
  }
}
