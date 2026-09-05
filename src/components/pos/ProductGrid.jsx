import { formatCurrency } from '../../utils/formatters.js'
import { Package, Plus } from 'lucide-react'

export default function ProductGrid({ products, onAdd, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Package size={40} />
        <p className="mt-2 text-sm">Produk tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const outOfStock = product.stock <= 0
        return (
          <button
            key={product.id}
            disabled={outOfStock}
            onClick={() => onAdd(product)}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:shadow-md disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <Package size={32} />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-0.5 p-2.5">
              <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {formatCurrency(product.selling_price)}
              </p>
              <p className={`text-xs ${outOfStock ? 'text-red-500' : 'text-gray-400'}`}>
                {outOfStock ? 'Stok habis' : `Stok: ${product.stock}`}
              </p>
            </div>
            {!outOfStock && (
              <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white opacity-0 shadow transition group-hover:opacity-100">
                <Plus size={16} />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
