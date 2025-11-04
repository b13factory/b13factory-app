# B13 Garment App

Sistem Manajemen Order Garmen untuk B13

## Tech Stack

- **Frontend**: Next.js 14 (React)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: JWT
- **Styling**: Tailwind CSS + shadcn/ui

## Features

- 🔐 Authentication dengan JWT
- 📊 Dashboard dengan statistik order
- 📝 Manajemen Order (Create, Read, Update, Delete)
- 🏪 Katalog Management (Bahan, Produk, Percetakan, Jasa)
- 📜 History Order
- 💰 Neraca & Pelunasan
- 📸 Upload Gambar Mockup
- 🔢 Auto-generate ID & Nomor Order

## Getting Started

### 1. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 2. Setup Supabase

Lihat file `SUPABASE_SETUP.md` untuk panduan lengkap setup database.

### 3. Run Development Server

```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 4. Login

Default credentials:
- Username: `admin`
- Password: `admin123`

## Project Structure

```
b13garment-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard page
│   ├── orderan/           # Order management
│   ├── katalog/           # Catalog management
│   ├── history/           # Order history
│   ├── neraca/            # Financial page
│   ├── layout.js          # Root layout
│   └── page.js            # Login page
├── components/            # Reusable components
│   └── ui/               # shadcn components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   └── auth.js           # Auth utilities
├── public/                # Static files
├── .env                   # Environment variables
├── supabase-migration.sql # Database schema
└── package.json
```

## Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di Vercel
3. Add environment variables dari `.env`
4. Deploy!

## License

Private - For B13 Internal Use Only
