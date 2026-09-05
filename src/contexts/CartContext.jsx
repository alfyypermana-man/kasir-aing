import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // { product, quantity }
  const [discount, setDiscount] = useState(null) // { id, type: 'PERCENT'|'NOMINAL', value, minimum_purchase, name }

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        const newQty = existing.quantity + quantity
        if (newQty > product.stock) return prev
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i
        )
      }
      if (quantity > product.stock) return prev
      return [...prev, { product, quantity }]
    })
  }

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const clearCart = () => {
    setItems([])
    setDiscount(null)
  }

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.selling_price * i.quantity, 0),
    [items]
  )

  const discountAmount = useMemo(() => {
    if (!discount) return 0
    if (discount.minimum_purchase && subtotal < discount.minimum_purchase) return 0
    if (discount.type === 'PERCENT') return Math.round((subtotal * discount.value) / 100)
    return Math.min(discount.value, subtotal)
  }, [discount, subtotal])

  const total = Math.max(subtotal - discountAmount, 0)

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    discount,
    setDiscount,
    subtotal,
    discountAmount,
    total,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
