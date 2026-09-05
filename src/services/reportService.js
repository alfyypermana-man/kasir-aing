import { supabase } from '../supabase.js'

export async function getTodaySummary() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('transactions')
    .select('total, id')
    .eq('transaction_status', 'PAID')
    .gte('created_at', startOfDay.toISOString())
  if (error) throw error

  const revenue = (data || []).reduce((s, t) => s + Number(t.total), 0)
  return { revenue, count: data?.length ?? 0 }
}

export async function getMonthSummary() {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('transactions')
    .select('total')
    .eq('transaction_status', 'PAID')
    .gte('created_at', startOfMonth.toISOString())
  if (error) throw error

  const revenue = (data || []).reduce((s, t) => s + Number(t.total), 0)
  return { revenue }
}

export async function getRevenueSeries({ from, to }) {
  const { data, error } = await supabase
    .from('transactions')
    .select('total, created_at')
    .eq('transaction_status', 'PAID')
    .gte('created_at', from)
    .lte('created_at', to)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getTopProducts({ from, to, limit = 5 }) {
  const { data, error } = await supabase
    .from('transaction_items')
    .select('product_name_snapshot, quantity, subtotal, transactions!inner(created_at, transaction_status)')
    .gte('transactions.created_at', from)
    .lte('transactions.created_at', to)
    .eq('transactions.transaction_status', 'PAID')
  if (error) throw error

  const grouped = {}
  for (const item of data || []) {
    const key = item.product_name_snapshot
    if (!grouped[key]) grouped[key] = { name: key, quantity: 0, revenue: 0 }
    grouped[key].quantity += item.quantity
    grouped[key].revenue += Number(item.subtotal)
  }
  return Object.values(grouped)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

export async function getPaymentMethodBreakdown({ from, to }) {
  const { data, error } = await supabase
    .from('transactions')
    .select('payment_method, total')
    .eq('transaction_status', 'PAID')
    .gte('created_at', from)
    .lte('created_at', to)
  if (error) throw error

  const grouped = {}
  for (const t of data || []) {
    grouped[t.payment_method] = (grouped[t.payment_method] || 0) + Number(t.total)
  }
  return grouped
}

export async function getRecentTransactions(limit = 5) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, profiles!transactions_cashier_id_fkey(name)')
    .eq('transaction_status', 'PAID')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
