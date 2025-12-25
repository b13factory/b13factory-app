import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Helper functions untuk generate ID
export function extractInitials(value) {
  const parts = value.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1) {
    return (parts[0][0] + parts[0][parts[0].length - 1]).toUpperCase();
  }
  return '--';
}

export function extractTwoFirst(value) {
  const parts = value.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  } else if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return '--';
}

export async function generateNoOrderan(nama, kodeProduk = 'ML') {
  const now = new Date();
  const tahun = now.getFullYear().toString().slice(-2);
  const bulan = (now.getMonth() + 1).toString().padStart(2, '0');
  
  const initials = nama
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
    .padEnd(2, 'X');
  
  const kode = kodeProduk.toUpperCase().substring(0, 2).padEnd(2, 'X');
  
  // Count existing orders with same prefix
  const prefix = tahun + bulan;
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .like('no_orderan', `${prefix}%`);
  
  const sequential = String((count || 0) + 1).padStart(2, '0');
  
  return `${prefix}${initials}${kode}${sequential}`;
}

// Format currency helper
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}