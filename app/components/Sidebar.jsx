'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, Book, History, BarChart3 } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/orderan', label: 'Input Orderan', icon: Plus },
    { href: '/katalog', label: 'Katalog', icon: Book },
    { href: '/history', label: 'History Orderan', icon: History },
    { href: '/neraca', label: 'Neraca Keuangan', icon: BarChart3 },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 text-white p-6 z-50">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-orange-400">B13 Garment</h2>
        <p className="text-xs text-slate-400 mt-1">& Advertising</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-xs text-slate-400">Version 2.0</p>
          <p className="text-xs text-slate-500 mt-1">Powered by Supabase</p>
        </div>
      </div>
    </aside>
  );
}