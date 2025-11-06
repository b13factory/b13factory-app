"# B13 Garment App

Sistem Manajemen Order Garmen yang modern dan profesional untuk B13.

## 🎯 Fitur Saat Ini

- ✅ **Halaman Login** dengan Supabase Authentication
- ✅ **Dashboard** dengan statistik order (Total Orderan, Orderan Aktif, Pendapatan, Sisa Pembayaran)
- ✅ **UI/UX Profesional** dengan Tailwind CSS + shadcn/ui
- ✅ **Authentication Flow** lengkap (login, logout, session management)
- ✅ **Responsive Design** untuk desktop dan mobile
- ✅ **Dark Mode Ready** (belum diaktifkan, bisa ditambahkan)

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (React) dengan App Router
- **Backend**: Next.js API Routes (siap untuk dikembangkan)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel-ready

## 📁 Struktur Proyek

```
/app
├── app/                    # Next.js App Router
│   ├── page.js            # Root page (redirect ke login)
│   ├── layout.js          # Root layout dengan Toaster
│   ├── globals.css        # Global styles
│   ├── login/            
│   │   └── page.js        # Halaman login
│   └── dashboard/
│       └── page.js        # Dashboard utama
├── lib/
│   ├── supabase.js        # Supabase client setup
│   └── utils.js           # Utility functions (formatCurrency, formatDate, dll)
├── components/
│   └── ui/                # shadcn/ui components
├── .env                   # Environment variables
├── package.json
├── SUPABASE_SETUP.md      # Panduan setup Supabase
└── README.md              # File ini
```

## 🔧 Setup & Installation

### 1. Prerequisites

- Node.js 18+ 
- Akun Supabase (sudah ada)
- Yarn (sudah terinstall)

### 2. Install Dependencies

Dependencies sudah terinstall otomatis. Jika perlu install ulang:

```bash
yarn install
```

### 3. Setup Supabase

**PENTING**: Ikuti panduan lengkap di file `SUPABASE_SETUP.md`

Singkatnya:
1. Buat user di Supabase Authentication (Dashboard > Authentication > Add User)
2. Set email & password, centang \"Auto Confirm User\"
3. (Opsional) Jalankan SQL script untuk membuat tables
4. (Opsional) Buat storage bucket untuk gambar

### 4. Environment Variables

File `.env` sudah dikonfigurasi dengan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gigszmpljitrksgsinrm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres:...
JWT_SECRET=b13garmen-super-secret-key-change-in-production-2024
```

Tidak perlu diubah kecuali jika ganti project Supabase.

### 5. Run Development Server

Server sudah berjalan otomatis. Untuk restart:

```bash
sudo supervisorctl restart nextjs
```

Aplikasi berjalan di:
- Development: http://localhost:3000
- Production: https://b13garmen-app.preview.emergentagent.com

## 📖 Cara Menggunakan

### Login

1. Buka aplikasi (akan auto-redirect ke `/login`)
2. Masukkan email dan password yang dibuat di Supabase
3. Klik **Login**
4. Akan redirect ke Dashboard

### Dashboard

- Melihat statistik order (saat ini kosong karena belum ada data)
- Tombol \"Orderan Baru\" (siap untuk dikembangkan)
- Tombol \"Logout\" di header

## 🎨 Design System

### Warna Utama
- **Primary**: Blue (#2563eb) - untuk tombol utama, header, branding
- **Secondary**: Gray - untuk teks dan background
- **Success**: Green - untuk status sukses
- **Warning**: Orange - untuk pending/warning
- **Error**: Red - untuk error state

### Komponen UI
Menggunakan shadcn/ui components yang sudah terintegrasi:
- Button, Card, Input, Label
- Dialog, Alert, Toast (sonner)
- Dan banyak lagi di `/components/ui/`

## 🔒 Security & Auth

- Menggunakan Supabase Auth (secure by default)
- Session management otomatis
- Protected routes dengan middleware (bisa dikembangkan)
- Password hashing handled by Supabase
- Environment variables tidak ter-commit ke git

## 🌐 Deployment

### Deploy ke Vercel

1. Push code ke GitHub repository
2. Import project di Vercel Dashboard
3. Add environment variables dari `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Deploy!

Vercel akan auto-detect Next.js dan menggunakan konfigurasi optimal.

## 📋 TODO & Roadmap

Fitur yang bisa dikembangkan selanjutnya:

### Priority 1 (Core Features)
- [ ] CRUD Order Management (Create, Read, Update, Delete orderan)
- [ ] Form input orderan lengkap dengan validasi
- [ ] Detail orderan (halaman individual)
- [ ] History orderan
- [ ] Filter & search orderan

### Priority 2 (Supporting Features)
- [ ] Katalog Management (Bahan, Produk, Percetakan, Jasa)
- [ ] Upload gambar mockup
- [ ] Export laporan (PDF/Excel)
- [ ] Neraca & Pelunasan
- [ ] Auto-generate nomor orderan

### Priority 3 (Enhancement)
- [ ] Dashboard charts & analytics
- [ ] Multi-user dengan role (admin, staff, viewer)
- [ ] Notifikasi deadline
- [ ] WhatsApp integration untuk notif customer
- [ ] Dark mode toggle
- [ ] Mobile app integration (APK)

## 🐛 Troubleshooting

### Login tidak berhasil
- Cek apakah user sudah dibuat di Supabase Authentication
- Cek apakah \"Auto Confirm User\" sudah dicentang
- Cek email dan password sudah benar

### Dashboard kosong
- Ini normal jika belum ada data order
- Jalankan SQL script di SUPABASE_SETUP.md untuk membuat tables
- Atau mulai dengan membuat orderan baru (fitur belum ada)

### Error saat build
- Cek apakah semua environment variables sudah diset
- Cek koneksi internet (untuk Supabase)
- Run `yarn install` ulang

## 📞 Support

Untuk pertanyaan atau bantuan:
- Cek file `SUPABASE_SETUP.md` untuk setup database
- Lihat struktur file di `/app/b13garment-app/` (reference project)

## 📝 License

Private - For B13 Internal Use Only

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: ✅ Login & Dashboard Ready | 🚧 Order Management In Progress
"