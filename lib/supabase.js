// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
}

// create client - safe for SSR (storage only applied on client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
    // storage will be undefined on server
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// helpers (sesuaikan jika mau)
export async function signInWithPassword(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    console.error('Error signing in:', error?.message ?? error)
    return { success: false, error: error?.message ?? String(error) }
  }
}

export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user ?? null
  } catch (error) {
    console.error('Error getting user:', error?.message ?? error)
    return null
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error signing out:', error)
    return { success: false, error: error?.message ?? String(error) }
  }
}
