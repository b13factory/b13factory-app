import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'B13 Garment - Sistem Manajemen Order',
  description: 'Sistem manajemen order garmen profesional untuk B13',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}