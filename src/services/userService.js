import { supabase } from '../supabase.js'

export async function listUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateUserProfile(id, payload) {
  const { data, error } = await supabase.from('profiles').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function setUserStatus(id, status) {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
  if (error) throw error
}

export async function uploadAvatar(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

// Catatan: pembuatan akun kasir baru (Supabase Auth signUp/invite) memerlukan
// hak admin (service role) atau flow admin invite. Di frontend, gunakan
// supabase.auth.signUp untuk self-registration awal lalu admin mengatur role,
// ATAU jalankan Supabase Admin invite dari Dashboard Supabase secara manual,
// sesuai aturan bahwa AI tidak menggunakan service role key di frontend.
export async function inviteCashier(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'KASIR' } },
  })
  if (error) throw error
  return data
}
