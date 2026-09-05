import { supabase } from '../supabase.js'

export async function listMovements({ productId = null, type = null, limit = 100 } = {}) {
  let query = supabase
    .from('inventory_movements')
    .select('*, products(name, unit)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (productId) query = query.eq('product_id', productId)
  if (type) query = query.eq('type', type)
  const { data, error } = await query
  if (error) throw error
  return data
}

// Menggunakan RPC function di database agar update stok + catatan movement
// terjadi dalam satu transaksi (atomic), mencegah race condition.
export async function recordStockMovement({ productId, type, quantity, note, userId }) {
  const { data, error } = await supabase.rpc('adjust_stock', {
    p_product_id: productId,
    p_type: type,
    p_quantity: quantity,
    p_note: note ?? null,
    p_user_id: userId,
  })
  if (error) throw error
  return data
}
