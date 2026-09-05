import { supabase } from '../supabase.js'

export async function listCategories({ activeOnly = false } = {}) {
  let query = supabase.from('categories').select('*').order('name')
  if (activeOnly) query = query.eq('status', 'active')
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createCategory(payload) {
  const { data, error } = await supabase.from('categories').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateCategory(id, payload) {
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
