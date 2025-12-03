// components/Sidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LuLayoutDashboard, 
  LuPackage, 
  LuShoppingCart, 
  LuBook, 
  LuMenu, 
  LuX,
  LuHistory,
  LuClipboardList,
  LuFileText
} from 'react-icons/lu';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LuLayoutDashboard },
  { name: 'Orderan', href: '/orderan', icon: LuShoppingCart },
  { name: 'Katalog Bahan', href: '/katalog', icon: LuPackage },
  { name: 'History', href: '/history', icon: LuHistory },
  { name: 'Neraca', href: '/neraca', icon: LuBook },
  { name: 'Nota', href: '/nota', icon: LuFileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const baseLinkClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200";
  const inactiveLinkClasses = "text-gray-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-sky-100 hover:text-sky-700";
  const activeLinkClasses = "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-200";

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white shadow-xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-sky-600 to-sky-500">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <LuClipboardList size={28} className="text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">B13 Garment</h1>
            <p className="text-xs text-sky-100 mt-1">Sistem Manajemen</p>
          </div>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
            >
              <Icon size={22} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">© 2025 B13 Garment</p>
        <p className="text-xs text-gray-400 text-center mt-1">v1.0.0</p>
      </div>
    </div>
  );

  return (
    <>
      {/* --- Sidebar untuk Desktop --- */}
      <aside className="hidden lg:flex lg:flex-col w-64 fixed inset-y-0 z-10 bg-white">
        <SidebarContent />
      </aside>

      {/* --- Tombol Menu Mobile --- */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg text-sky-600 hover:bg-sky-50 transition-all duration-200"
        aria-label="Buka menu"
      >
        {isMobileMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
      </button>

      {/* --- Overlay untuk Mobile --- */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      
      {/* --- Sidebar untuk Mobile (Overlay) --- */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}