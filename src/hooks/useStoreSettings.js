import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase.js'

export function useStoreSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('store_settings').select('*').limit(1).maybeSingle()
    setSettings(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { settings, loading, reload: load }
}
