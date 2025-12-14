// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'B13 Garment App',
  description: 'Sistem Manajemen untuk B13 Garment Factory',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'B13 Garment'
  }
};

// Separate viewport export as required by Next.js 14
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0284c7'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="B13 Garment" />
      </head>
      <body className={`${inter.className} bg-slate-100`}>
        <div className="flex min-h-screen">
          <Sidebar />
          
          {/* Konten Utama */}
          <main className="flex-1 lg:pl-64">
            <div className="pt-20 lg:pt-0 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}