import { useEffect, useRef, useState } from 'react'
import { X, ScanLine, Keyboard } from 'lucide-react'

export default function BarcodeScanner({ open, onClose, onDetected }) {
  const [manualCode, setManualCode] = useState('')
  const [cameraError, setCameraError] = useState(false)
  const scannerRef = useRef(null)
  const containerId = 'barcode-scanner-region'

  useEffect(() => {
    if (!open) return

    let html5QrCode
    let cancelled = false

    ;(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        html5QrCode = new Html5Qrcode(containerId)
        scannerRef.current = html5QrCode
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            onDetected(decodedText)
          },
          () => {}
        )
      } catch (err) {
        setCameraError(true)
      }
    })()

    return () => {
      cancelled = true
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current.clear?.()
        })
      }
    }
  }, [open, onDetected])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      <div className="flex items-center justify-between p-4">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <ScanLine size={20} /> Scan Barcode / QR
        </h2>
        <button onClick={onClose} className="text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        {!cameraError ? (
          <div id={containerId} className="w-full max-w-sm overflow-hidden rounded-xl" />
        ) : (
          <p className="text-center text-sm text-gray-300">
            Kamera tidak tersedia. Silakan gunakan input manual di bawah ini.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (manualCode.trim()) onDetected(manualCode.trim())
            setManualCode('')
          }}
          className="flex w-full max-w-sm items-center gap-2"
        >
          <div className="relative flex-1">
            <Keyboard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Input kode manual"
              className="w-full rounded-lg border border-gray-600 bg-gray-800 py-2.5 pl-9 pr-3 text-sm text-white outline-none"
            />
          </div>
          <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white">
            Cari
          </button>
        </form>
      </div>
    </div>
  )
}
