import { Minus, Plus, Trash2, Tag } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters.js'
import { useCart } from '../../contexts/CartContext.jsx'

export default function Cart({ discounts, onCheckout }) {
  const { items, updateQuantity, removeItem, discount, setDiscount, subtotal, discountAmount, total } = useCart()

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">Keranjang masih kosong</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(product.selling_price)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 dark:border-gray-700"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, Math.min(quantity + 1, product.stock))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 dark:border-gray-700"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => removeItem(product.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {discounts?.length > 0 && (
        <div className="mb-3">
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Tag size={12} /> Diskon
          </label>
          <select
            value={discount?.id ?? ''}
            onChange={(e) => {
              const d = discounts.find((x) => x.id === e.target.value)
              setDiscount(d ? { id: d.id, type: d.type, value: d.value, minimum_purchase: d.minimum_purchase, name: d.name } : null)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Tanpa diskon</option>
            {discounts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.type === 'PERCENT' ? `${d.value}%` : formatCurrency(d.value)})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5 border-t border-gray-100 pt-3 text-sm dark:border-gray-800">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Diskon</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={items.length === 0}
        className="mt-3 w-full rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 disabled:opacity-40"
      >
        Bayar
      </button>
    </div>
  )
}
