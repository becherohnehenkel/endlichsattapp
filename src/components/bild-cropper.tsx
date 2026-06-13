'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CropRect {
  x: number
  y: number
  size: number
}

interface BildCropperProps {
  imageSrc: string
  onConfirm: (blob: Blob) => Promise<void>
  onCancel: () => void
}

export default function BildCropper({ imageSrc, onConfirm, onCancel }: BildCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const cropRef = useRef<CropRect | null>(null)
  const [crop, setCrop] = useState<CropRect | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Keep ref in sync with state for drag closures
  useEffect(() => { cropRef.current = crop }, [crop])

  function initCrop() {
    const img = imgRef.current
    if (!img || img.clientWidth === 0) return
    const w = img.clientWidth
    const h = img.clientHeight
    const size = Math.min(w, h)
    const rect = { x: (w - size) / 2, y: (h - size) / 2, size }
    setCrop(rect)
    cropRef.current = rect
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    const current = cropRef.current
    if (!current) return
    const startX = e.clientX
    const startY = e.clientY
    const startCropX = current.x
    const startCropY = current.y

    function onMove(e: MouseEvent) {
      const img = imgRef.current
      const c = cropRef.current
      if (!img || !c) return
      const maxX = img.clientWidth - c.size
      const maxY = img.clientHeight - c.size
      setCrop(prev => prev ? {
        ...prev,
        x: Math.max(0, Math.min(maxX, startCropX + e.clientX - startX)),
        y: Math.max(0, Math.min(maxY, startCropY + e.clientY - startY)),
      } : null)
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  async function handleConfirm() {
    const img = imgRef.current
    const c = cropRef.current
    if (!img || !c) return
    setConfirming(true)

    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight

    const canvas = document.createElement('canvas')
    const SIZE = 800
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')!

    ctx.drawImage(
      img,
      c.x * scaleX,
      c.y * scaleY,
      c.size * scaleX,
      c.size * scaleY,
      0, 0, SIZE, SIZE,
    )

    const blob = await new Promise<Blob>(resolve =>
      canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92)
    )

    await onConfirm(blob)
    setConfirming(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Schiebe den Rahmen auf den gewünschten Bildausschnitt.</p>

      <div className="relative w-full select-none rounded-xl overflow-hidden">
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Zuschneiden"
          className="w-full block"
          onLoad={initCrop}
          draggable={false}
        />

        {crop && (
          <>
            {/* Dark overlay in four pieces around the crop */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bg-black/55" style={{ top: 0, left: 0, right: 0, height: crop.y }} />
              <div className="absolute bg-black/55" style={{ top: crop.y + crop.size, left: 0, right: 0, bottom: 0 }} />
              <div className="absolute bg-black/55" style={{ top: crop.y, left: 0, width: crop.x, height: crop.size }} />
              <div className="absolute bg-black/55" style={{ top: crop.y, left: crop.x + crop.size, right: 0, height: crop.size }} />
            </div>

            {/* Crop frame */}
            <div
              className="absolute border-2 border-white cursor-move"
              style={{ left: crop.x, top: crop.y, width: crop.size, height: crop.size }}
              onMouseDown={onMouseDown}
            >
              {/* Rule of thirds */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 bottom-0 border-l border-white/30" style={{ left: '33.3%' }} />
                <div className="absolute top-0 bottom-0 border-l border-white/30" style={{ left: '66.6%' }} />
                <div className="absolute left-0 right-0 border-t border-white/30" style={{ top: '33.3%' }} />
                <div className="absolute left-0 right-0 border-t border-white/30" style={{ top: '66.6%' }} />
              </div>
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white" />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={confirming}>
          <X className="h-4 w-4 mr-1.5" />
          Abbrechen
        </Button>
        <Button
          type="button"
          className="flex-1 bg-[#4A7C59] hover:bg-[#3d6849] text-white"
          onClick={handleConfirm}
          disabled={!crop || confirming}
        >
          {confirming ? 'Wird verarbeitet…' : (
            <><Check className="h-4 w-4 mr-1.5" />Ausschnitt übernehmen</>
          )}
        </Button>
      </div>
    </div>
  )
}
