'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Jika di halaman login, tampilkan children saja tanpa Sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Jika bukan halaman login, tampilkan layout normal dengan Sidebar
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      {/* Konten Utama */}
      <main className="flex-1 lg:pl-64">
        <div className="pt-20 lg:pt-0 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}