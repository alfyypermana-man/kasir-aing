import { Printer, Download, MessageCircle, RotateCcw, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatDateTime } from '../../utils/formatters.js'
import { generateReceiptPdf } from '../../utils/pdf.js'
import { buildReceiptWhatsappText, openWhatsappWithText } from '../../utils/whatsapp.js'
import { useState } from 'react'

export default function Receipt({ transaction, items, storeSettings, cashierName, onNewTransaction }) {
  const [waNumber, setWaNumber] = useState('')
  const [showWaInput, setShowWaInput] = useState(false)
  const paperWidth = storeSettings?.receipt_size === '80mm' ? 80 : 58

  const receiptItems = items.map((i) => ({
    name: i.product_name_snapshot,
    quantity: i.quantity,
    price: i.price_snapshot,
    subtotal: i.subtotal,
  }))

  const handlePdf = () => {
    generateReceiptPdf({
      storeName: storeSettings?.store_name,
      storeAddress: storeSettings?.address,
      storePhone: storeSettings?.phone,
      invoiceNumber: transaction.invoice_number,
      date: formatDateTime(transaction.created_at),
      cashierName,
      items: receiptItems,
      subtotal: transaction.subtotal,
      discount: transaction.discount,
      total: transaction.total,
      paymentMethod: transaction.payment_method,
      cashReceived: transaction.cash_received,
      change: transaction.change_amount,
      footerNote: storeSettings?.receipt_footer,
      paperWidth,
    })
  }

  const handleWhatsapp = () => {
    const text = buildReceiptWhatsappText({
      storeName: storeSettings?.store_name,
      invoiceNumber: transaction.invoice_number,
      date: formatDateTime(transaction.created_at),
      items: receiptItems,
      subtotal: transaction.subtotal,
      discount: transaction.discount,
      total: transaction.total,
      paymentMethod: transaction.payment_method,
      cashReceived: transaction.cash_received,
      change: transaction.change_amount,
    })
    openWhatsappWithText(waNumber, text)
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-4 flex flex-col items-center gap-2 no-print">
        <CheckCircle2 size={48} className="text-green-500" />
        <p className="text-lg font-bold text-gray-900 dark:text-white">Pembayaran Berhasil</p>
      </div>

      <div id="print-receipt" className="rounded-xl border border-gray-200 bg-white p-5 text-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 text-center">
          {storeSettings?.logo_url && (
            <img src={storeSettings.logo_url} alt="Logo" className="mx-auto mb-2 h-10 object-contain" />
          )}
          <p className="font-bold text-gray-900 dark:text-white">{storeSettings?.store_name}</p>
          {storeSettings?.address && <p className="text-xs text-gray-500">{storeSettings.address}</p>}
          {storeSettings?.phone && <p className="text-xs text-gray-500">{storeSettings.phone}</p>}
        </div>
        <div className="mb-3 border-t border-dashed border-gray-300 pt-2 text-xs text-gray-500 dark:border-gray-700">
          <p>Invoice: {transaction.invoice_number}</p>
          <p>Tanggal: {formatDateTime(transaction.created_at)}</p>
          <p>Kasir: {cashierName}</p>
        </div>
        <div className="space-y-1.5 border-t border-dashed border-gray-300 pt-2 dark:border-gray-700">
          {receiptItems.map((it, idx) => (
            <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
              <span className="max-w-[60%] truncate">{it.name} x{it.quantity}</span>
              <span>{formatCurrency(it.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-1 border-t border-dashed border-gray-300 pt-2 dark:border-gray-700">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(transaction.subtotal)}</span></div>
          {transaction.discount > 0 && (
            <div className="flex justify-between text-gray-500"><span>Diskon</span><span>-{formatCurrency(transaction.discount)}</span></div>
          )}
          <div className="flex justify-between font-bold text-gray-900 dark:text-white"><span>Total</span><span>{formatCurrency(transaction.total)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Metode</span><span>{transaction.payment_method}</span></div>
          {transaction.payment_method === 'TUNAI' && (
            <>
              <div className="flex justify-between text-gray-500"><span>Diterima</span><span>{formatCurrency(transaction.cash_received)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Kembalian</span><span>{formatCurrency(transaction.change_amount)}</span></div>
            </>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-gray-400">{storeSettings?.receipt_footer || 'Terima kasih!'}</p>
      </div>

      <div className="mt-4 space-y-2 no-print">
        {showWaInput && (
          <div className="flex gap-2">
            <input
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              placeholder="Nomor WhatsApp customer"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button onClick={handleWhatsapp} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white">
              Kirim
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium dark:border-gray-700">
            <Printer size={16} /> Print
          </button>
          <button onClick={handlePdf} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium dark:border-gray-700">
            <Download size={16} /> PDF
          </button>
          <button onClick={() => setShowWaInput((s) => !s)} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium dark:border-gray-700">
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={onNewTransaction} className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white">
            <RotateCcw size={16} /> Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  )
}
