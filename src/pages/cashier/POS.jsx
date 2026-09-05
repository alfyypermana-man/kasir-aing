import { useEffect, useState, useCallback } from 'react'
import { ScanLine, Search, ShoppingCart } from 'lucide-react'
import ProductGrid from '../../components/pos/ProductGrid.jsx'
import Cart from '../../components/pos/Cart.jsx'
import BarcodeScanner from '../../components/pos/BarcodeScanner.jsx'
import PaymentModal from '../../components/pos/PaymentModal.jsx'
import Receipt from '../../components/pos/Receipt.jsx'
import { listProducts, findProductByCode } from '../../services/productService.js'
import { listDiscounts } from '../../services/discountService.js'
import { checkoutTransaction, getTransactionDetail } from '../../services/transactionService.js'
import { useCart } from '../../contexts/CartContext.jsx'
import { useStoreSettings } from '../../hooks/useStoreSettings.js'
import { useDebounce } from '../../hooks/useDebounce.js'

export default function POS() {
  const { settings } = useStoreSettings()
  const cashierName = settings?.store_name ? `Kasir ${settings.store_name}` : 'Kasir'
  const cart = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [discounts, setDiscounts] = useState([])
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cartOpenMobile, setCartOpenMobile] = useState(false)
  const [completedTx, setCompletedTx] = useState(null) // { transaction, items }
  const [scanMessage, setScanMessage] = useState('')

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listProducts({ search: debouncedSearch, activeOnly: true })
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => { loadProducts() }, [loadProducts])
  useEffect(() => { listDiscounts({ activeOnly: true }).then(setDiscounts).catch(() => {}) }, [])

  const handleScan = async (code) => {
    setScannerOpen(false)
    try {
      const product = await findProductByCode(code)
      if (product) {
        cart.addItem(product, 1)
        setScanMessage(`Ditambahkan: ${product.name}`)
      } else {
        setScanMessage('Produk tidak ditemukan untuk kode tersebut.')
      }
    } catch {
      setScanMessage('Gagal mencari produk.')
    }
    setTimeout(() => setScanMessage(''), 3000)
  }

  const handleConfirmPayment = async ({ method, cashReceived, change }) => {
    setSubmitting(true)
    try {
      const tx = await checkoutTransaction({
        cashierId: null,
        items: cart.items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          price: i.product.selling_price,
          discount: 0,
        })),
        subtotal: cart.subtotal,
        discountAmount: cart.discountAmount,
        discountId: cart.discount?.id,
        total: cart.total,
        paymentMethod: method,
        cashReceived,
        changeAmount: change,
      })
      const detail = await getTransactionDetail(tx.id)
      setCompletedTx(detail)
      setPaymentOpen(false)
      cart.clearCart()
      loadProducts()
    } catch (err) {
      alert(err.message || 'Gagal memproses transaksi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (completedTx) {
    return (
      <Receipt
        transaction={completedTx.transaction}
        items={completedTx.items}
        storeSettings={settings}
        cashierName={cashierName}
        onNewTransaction={() => setCompletedTx(null)}
      />
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      <div className="flex-1">
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk / barcode..."
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-white shadow-md"
          >
            <ScanLine size={20} />
          </button>
        </div>

        {scanMessage && (
          <div className="mb-3 rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
            {scanMessage}
          </div>
        )}

        <ProductGrid products={products} onAdd={(p) => cart.addItem(p, 1)} loading={loading} />
      </div>

      {/* Desktop cart panel */}
      <div className="hidden w-96 shrink-0 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:block">
        <Cart discounts={discounts} onCheckout={() => setPaymentOpen(true)} />
      </div>

      {/* Mobile floating cart button */}
      {cart.items.length > 0 && (
        <button
          onClick={() => setCartOpenMobile(true)}
          className="fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3.5 text-white shadow-xl lg:hidden"
        >
          <ShoppingCart size={20} />
          <span className="text-sm font-semibold">{cart.items.length} item</span>
        </button>
      )}

      {cartOpenMobile && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/50 lg:hidden">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Keranjang</h3>
              <button onClick={() => setCartOpenMobile(false)} className="text-sm text-gray-400">Tutup</button>
            </div>
            <Cart
              discounts={discounts}
              onCheckout={() => {
                setCartOpenMobile(false)
                setPaymentOpen(true)
              }}
            />
          </div>
        </div>
      )}

      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={handleScan} />
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={cart.total}
        submitting={submitting}
        onConfirm={handleConfirmPayment}
      />
    </div>
  )
}
