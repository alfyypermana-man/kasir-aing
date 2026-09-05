import { supabase } from '../supabase.js'

export async function listDiscounts({ activeOnly = false } = {}) {
  let query = supabase.from('discounts').select('*').order('created_at', { ascending: false })
  if (activeOnly) {
    const today = new Date().toISOString().slice(0, 10)
    query = query.eq('status', 'active').lte('start_date', today).gte('end_date', today)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createDiscount(payload) {
  const { data, error } = await supabase.from('discounts').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateDiscount(id, payload) {
  const { data, error } = await supabase.from('discounts').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteDiscount(id) {
  const { error } = await supabase.from('discounts').delete().eq('id', id)
  if (error) throw error
}
