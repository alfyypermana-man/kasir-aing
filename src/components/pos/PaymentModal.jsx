import { useMemo, useState } from 'react'
import { X, Wallet, QrCode, Loader2 } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters.js'
import { useStoreSettings } from '../../hooks/useStoreSettings.js'

const quickAmounts = (total) => {
  const rounded = Math.ceil(total / 10000) * 10000
  return Array.from(new Set([total, rounded, rounded + 20000, rounded + 50000, rounded + 100000])).slice(0, 4)
}

export default function PaymentModal({ open, onClose, total, onConfirm, submitting }) {
  const { settings } = useStoreSettings()
  const [method, setMethod] = useState('TUNAI')
  const [cashReceived, setCashReceived] = useState('')

  const change = useMemo(() => {
    const received = Number(cashReceived) || 0
    return received - total
  }, [cashReceived, total])

  if (!open) return null

  const canConfirm =
    method === 'QR_CODE' || (method === 'TUNAI' && Number(cashReceived) >= total)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-gray-900 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pembayaran</h2>
          <button onClick={onClose} className="text-gray-400">
            <X size={22} />
          </button>
        </div>

        <div className="mb-4 rounded-xl bg-primary-50 p-4 text-center dark:bg-primary-950/40">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Tagihan</p>
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{formatCurrency(total)}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => setMethod('TUNAI')}
            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 ${
              method === 'TUNAI' ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Wallet size={22} className={method === 'TUNAI' ? 'text-primary-600' : 'text-gray-400'} />
            <span className="text-sm font-medium">Tunai</span>
          </button>
          <button
            onClick={() => setMethod('QR_CODE')}
            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 ${
              method === 'QR_CODE' ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <QrCode size={22} className={method === 'QR_CODE' ? 'text-primary-600' : 'text-gray-400'} />
            <span className="text-sm font-medium">QR Code</span>
          </button>
        </div>

        {method === 'TUNAI' && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Uang Diterima</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg font-semibold outline-none focus:border-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="0"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {quickAmounts(total).map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCashReceived(String(amt))}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
                >
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
            {cashReceived !== '' && (
              <p className={`text-sm font-medium ${change < 0 ? 'text-red-500' : 'text-green-600'}`}>
                {change < 0 ? 'Uang pembayaran tidak cukup.' : `Kembalian: ${formatCurrency(change)}`}
              </p>
            )}
          </div>
        )}

        {method === 'QR_CODE' && (
          <div className="mb-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 p-5 dark:border-gray-700">
            {settings?.payment_qr_url ? (
              <img src={settings.payment_qr_url} alt="QR Pembayaran Toko" className="h-48 w-48 object-contain" />
            ) : (
              <p className="text-sm text-gray-400">QR pembayaran toko belum diatur di Pengaturan Toko.</p>
            )}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Minta customer scan QR ini menggunakan aplikasi pembayaran mereka, lalu tekan Konfirmasi Pembayaran setelah pembayaran diterima.
            </p>
          </div>
        )}

        <button
          disabled={!canConfirm || submitting}
          onClick={() =>
            onConfirm({
              method,
              cashReceived: method === 'TUNAI' ? Number(cashReceived) : null,
              change: method === 'TUNAI' ? change : null,
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white disabled:opacity-40"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Konfirmasi Pembayaran
        </button>
      </div>
    </div>
  )
}
