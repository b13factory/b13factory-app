import { supabase } from './supabase';

/**
 * Verify Supabase access token (JWT)
 * @param token - JWT string from cookie
 * @returns user object if valid, otherwise null
 */
export async function verifyToken(token: string | undefined) {
  if (!token) return null;

  try {
    // Verifikasi token Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.warn('Token verification failed:', error?.message);
      return null;
    }

    return data.user;
  } catch (err) {
    console.error('verifyToken error:', err);
    return null;
  }
}
