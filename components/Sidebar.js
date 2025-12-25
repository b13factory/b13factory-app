'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Home,
  ShoppingCart,
  ClipboardList,
  Package,
  DollarSign,
  History,
  FileText,
  Menu,
  X,
  LogOut,
  User,
  Loader2
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Order Baru', href: '/orderan', icon: ShoppingCart },
  { name: 'Katalog Produk', href: '/katalog', icon: Package },
  { name: 'Neraca', href: '/neraca', icon: DollarSign },
  { name: 'History', href: '/history', icon: History },
  { name: 'Nota', href: '/nota', icon: FileText },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Get user info
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar?')) {
      return;
    }

    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        alert('Gagal logout: ' + error.message);
        setLoggingOut(false);
      } else {
        // Redirect ke login
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Terjadi kesalahan saat logout');
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={18} />
            </div>
            <span className="font-bold text-gray-800 text-lg">B13 Garment</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-xl z-40 transition-transform duration-300 ease-in-out
          w-64
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="text-white" size={22} />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-xl">B13 Garment</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          {userEmail && (
            <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 font-medium">Login sebagai</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{userEmail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-200'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loggingOut ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Keluar...</span>
                </>
              ) : (
                <>
                  <LogOut size={20} />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}