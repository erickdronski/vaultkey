import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    _supabase = createClient(url, key)
  }
  return _supabase
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    _supabaseAdmin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  return _supabaseAdmin
}

// Named exports for backward compat (lazy)
export const supabase = { get: getSupabase }
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseAdmin() as any)[prop]
  }
})
