import jsPDF from 'jspdf'

export function generateReceiptPdf({ storeName, storeAddress, storePhone, invoiceNumber, date, cashierName, items, subtotal, discount, total, paymentMethod, cashReceived, change, footerNote, paperWidth = 58 }) {
  const widthMm = paperWidth === 80 ? 80 : 58
  const doc = new jsPDF({ unit: 'mm', format: [widthMm, 200 + items.length * 6] })
  let y = 8
  const centerX = widthMm / 2

  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text(storeName || 'Toko', centerX, y, { align: 'center' })
  y += 4
  doc.setFontSize(7)
  doc.setFont(undefined, 'normal')
  if (storeAddress) { doc.text(storeAddress, centerX, y, { align: 'center' }); y += 3.5 }
  if (storePhone) { doc.text(storePhone, centerX, y, { align: 'center' }); y += 3.5 }
  y += 1
  doc.text('-'.repeat(widthMm === 58 ? 32 : 46), centerX, y, { align: 'center' })
  y += 3.5

  doc.setFontSize(7)
  doc.text(`Invoice: ${invoiceNumber}`, 3, y); y += 3.5
  doc.text(`Tanggal: ${date}`, 3, y); y += 3.5
  doc.text(`Kasir: ${cashierName}`, 3, y); y += 3.5
  doc.text('-'.repeat(widthMm === 58 ? 32 : 46), centerX, y, { align: 'center' }); y += 3.5

  items.forEach((it) => {
    doc.text(it.name, 3, y); y += 3.2
    doc.text(`${it.quantity} x Rp${it.price.toLocaleString('id-ID')}`, 3, y)
    doc.text(`Rp${it.subtotal.toLocaleString('id-ID')}`, widthMm - 3, y, { align: 'right' })
    y += 3.8
  })

  doc.text('-'.repeat(widthMm === 58 ? 32 : 46), centerX, y, { align: 'center' }); y += 3.5
  doc.text('Subtotal', 3, y)
  doc.text(`Rp${subtotal.toLocaleString('id-ID')}`, widthMm - 3, y, { align: 'right' }); y += 3.5
  if (discount) {
    doc.text('Diskon', 3, y)
    doc.text(`-Rp${discount.toLocaleString('id-ID')}`, widthMm - 3, y, { align: 'right' }); y += 3.5
  }
  doc.setFont(undefined, 'bold')
  doc.text('TOTAL', 3, y)
  doc.text(`Rp${total.toLocaleString('id-ID')}`, widthMm - 3, y, { align: 'right' }); y += 4
  doc.setFont(undefined, 'normal')
  doc.text(`Metode: ${paymentMethod}`, 3, y); y += 3.5
  if (paymentMethod === 'TUNAI') {
    doc.text('Diterima', 3, y)
    doc.text(`Rp${(cashReceived || 0).toLocaleString('id-ID')}`, widthMm - 3, y, { align: 'right' }); y += 3.5
    doc.text('Kembalian', 3, y)
    doc.text(`Rp${(change || 0).toLocaleString('id-ID')}`, widthMm - 3, y, { align: 'right' }); y += 3.5
  }
  y += 2
  doc.setFontSize(7)
  doc.text(footerNote || 'Terima kasih!', centerX, y, { align: 'center' })

  doc.save(`${invoiceNumber}.pdf`)
}
