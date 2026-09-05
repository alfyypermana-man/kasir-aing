// Menghasilkan kode barcode unik sederhana (angka) yang dapat digunakan
// sebagai input JsBarcode (format CODE128) apabila admin tidak mengisi barcode sendiri.
export function generateBarcodeValue() {
  const timestamp = Date.now().toString().slice(-9)
  const random = Math.floor(100 + Math.random() * 900)
  return `${timestamp}${random}`
}

export function generateProductCode(prefix = 'PRD') {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `${prefix}-${random}`
}
