export function buildReceiptWhatsappText({ storeName, invoiceNumber, date, items, subtotal, discount, total, paymentMethod, cashReceived, change }) {
  const lines = []
  lines.push(`*${storeName}*`)
  lines.push(`Invoice: ${invoiceNumber}`)
  lines.push(`Tanggal: ${date}`)
  lines.push('')
  items.forEach((it) => {
    lines.push(`${it.name} x${it.quantity} = Rp${it.subtotal.toLocaleString('id-ID')}`)
  })
  lines.push('')
  lines.push(`Subtotal: Rp${subtotal.toLocaleString('id-ID')}`)
  if (discount) lines.push(`Diskon: -Rp${discount.toLocaleString('id-ID')}`)
  lines.push(`*Total: Rp${total.toLocaleString('id-ID')}*`)
  lines.push(`Metode: ${paymentMethod}`)
  if (paymentMethod === 'TUNAI') {
    lines.push(`Diterima: Rp${cashReceived?.toLocaleString('id-ID')}`)
    lines.push(`Kembalian: Rp${change?.toLocaleString('id-ID')}`)
  }
  lines.push('')
  lines.push('Terima kasih atas kunjungan Anda!')
  return lines.join('\n')
}

export function openWhatsappWithText(phoneNumber, text) {
  const cleaned = (phoneNumber || '').replace(/[^0-9]/g, '')
  const normalized = cleaned.startsWith('0') ? `62${cleaned.slice(1)}` : cleaned
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}
