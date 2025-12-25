// lib/supabaseClient.js
import { createBrowserClient } from '@supabase/ssr';

// Ambil variabel environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL dan ANON KEY harus diset di file .env');
}

// Buat dan ekspor klien Supabase dengan browser client untuk better cookie handling
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;