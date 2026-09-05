import { supabase } from '../supabase.js'

// Membuat transaksi lengkap (transaction + items + payment + kurangi stok
// + catat inventory movement) dilakukan lewat satu RPC function di database
// (checkout_transaction) agar atomic dan mencegah duplicate/negative stock.
export async function checkoutTransaction({
  cashierId,
  items, // [{ productId, quantity, price, discount }]
  subtotal,
  discountAmount,
  discountId,
  total,
  paymentMethod, // 'TUNAI' | 'QR_CODE'
  cashReceived,
  changeAmount,
}) {
  const { data, error } = await supabase.rpc('checkout_transaction', {
    p_cashier_id: cashierId,
    p_items: items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
      price: i.price,
      discount: i.discount ?? 0,
    })),
    p_subtotal: subtotal,
    p_discount: discountAmount,
    p_discount_id: discountId ?? null,
    p_total: total,
    p_payment_method: paymentMethod,
    p_cash_received: cashReceived ?? null,
    p_change: changeAmount ?? null,
  })
  if (error) throw error
  return data // returns transaction row (with invoice_number)
}

export async function listTransactions({ cashierId = null, dateFrom = null, dateTo = null, paymentMethod = null, search = null, limit = 100 } = {}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cashierId) query = query.eq('cashier_id', cashierId)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)
  if (paymentMethod) query = query.eq('payment_method', paymentMethod)
  if (search) query = query.ilike('invoice_number', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getTransactionDetail(id) {
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*, payments(*)')
    .eq('id', id)
    .single()
  if (error) throw error

  const { data: items, error: itemsError } = await supabase
    .from('transaction_items')
    .select('*')
    .eq('transaction_id', id)
  if (itemsError) throw itemsError

  return { transaction, items }
}
