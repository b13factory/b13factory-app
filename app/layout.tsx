// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils"; // pastikan lib/utils.ts ada
import { Toaster } from "react-hot-toast"; // optional, install jika belum

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "B13 Garmen App",
  description: "Internal dashboard B13 Garmen",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body className={cn("min-h-screen bg-[var(--bg)] text-[var(--text)]")}>
        {/* Global providers (Auth provider, Theme provider) bisa ditambahkan di sini */}
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
        {/* Toast notifications (optional) */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
