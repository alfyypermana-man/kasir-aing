import { supabase } from '../supabase.js'

export async function getStoreSettings() {
  const { data, error } = await supabase.from('store_settings').select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function updateStoreSettings(id, payload) {
  const { data, error } = await supabase.from('store_settings').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function uploadStoreAsset(file, kind) {
  const ext = file.name.split('.').pop()
  const path = `${kind}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('store-assets').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('store-assets').getPublicUrl(path)
  return data.publicUrl
}
