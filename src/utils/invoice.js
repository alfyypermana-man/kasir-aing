// Format invoice: INV-YYYYMMDD-0001
// Nomor urut sebaiknya dihasilkan oleh fungsi database (lihat supabase/functions.sql)
// agar unik dan aman dari race condition. Fungsi ini hanya untuk fallback tampilan.
export function buildInvoicePreview(date = new Date(), sequence = 1) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const seq = String(sequence).padStart(4, '0')
  return `INV-${y}${m}${d}-${seq}`
}
