import { supabase } from '../supabase.js'

export async function listProducts({ search = '', categoryId = null, activeOnly = false, sortBy = 'name', sortDir = 'asc' } = {}) {
  let query = supabase.from('products').select('*, categories(name)')
  if (search) query = query.or(`name.ilike.%${search}%,barcode.ilike.%${search}%,product_code.ilike.%${search}%`)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (activeOnly) query = query.eq('status', 'active')
  query = query.order(sortBy, { ascending: sortDir === 'asc' })
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getProduct(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function findProductByCode(code) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`barcode.eq.${code},qr_code.eq.${code},product_code.eq.${code}`)
    .eq('status', 'active')
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createProduct(payload) {
  const { data, error } = await supabase.from('products').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id, payload) {
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function setProductStatus(id, status) {
  const { error } = await supabase.from('products').update({ status }).eq('id', id)
  if (error) throw error
}

export async function uploadProductImage(file, productId) {
  const ext = file.name.split('.').pop()
  const path = `${productId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function listLowStockProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('stock', { ascending: true })
  if (error) throw error
  return (data || []).filter((p) => p.stock <= p.minimum_stock)
}
