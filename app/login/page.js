'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!supabase) {
        setError('Koneksi ke server bermasalah');
        setLoading(false);
        return;
      }

      console.log('Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Login error from Supabase:', error);
        setError(error.message === 'Invalid login credentials' 
          ? 'Email atau password salah' 
          : error.message);
        setLoading(false);
        return;
      }

      console.log('Login successful:', data);

      if (data.session) {
        // Wait a bit to ensure session is saved
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force a hard navigation to ensure middleware picks up session
        window.location.href = '/';
      } else {
        setError('Login berhasil tapi session tidak terbuat');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan saat login: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-200">
              <LogIn className="text-white" size={40} />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            B13 Garment App
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Sistem Manajemen untuk B13 Garment Factory
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-red-800">Login Gagal</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="nama@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white rounded-lg font-semibold shadow-lg shadow-sky-200 hover:shadow-xl hover:from-sky-700 hover:to-sky-600 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Untuk pemakaian pribadi B13 Garment
          </p>
        </div>
      </div>
    </div>
  );
}