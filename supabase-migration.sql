-- ==============================================
-- B13 Garmen Database Migration for Supabase
-- Jalankan langsung di Supabase SQL Editor
-- ==============================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- Table: users (untuk autentikasi)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Table: bahan (kain/fabric)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.bahan (
    id TEXT PRIMARY KEY,
    nama_toko TEXT NOT NULL,
    jenis TEXT NOT NULL,
    warna TEXT NOT NULL,
    harga NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Table: produk
-- ==============================================
CREATE TABLE IF NOT EXISTS public.produk (
    id TEXT PRIMARY KEY,
    produk TEXT NOT NULL,
    jenis TEXT NOT NULL,
    model TEXT NOT NULL,
    tipe_desain TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Table: percetakan
-- ==============================================
CREATE TABLE IF NOT EXISTS public.percetakan (
    id TEXT PRIMARY KEY,
    jenis TEXT NOT NULL,
    model TEXT NOT NULL,
    tipe_ukuran TEXT NOT NULL,
    harga NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Table: jasa
-- ==============================================
CREATE TABLE IF NOT EXISTS public.jasa (
    id TEXT PRIMARY KEY,
    jasa TEXT NOT NULL,
    jenis TEXT NOT NULL,
    tipe TEXT NOT NULL,
    harga NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Table: pilihan (dropdown options)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.pilihan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori TEXT NOT NULL,
    nilai TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(kategori, nilai)
);

-- ==============================================
-- Table: orders
-- ==============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    no_orderan TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    nohp TEXT NOT NULL,
    alamat TEXT NOT NULL,
    jenis_produk TEXT NOT NULL,
    desain TEXT NOT NULL,
    subdesain TEXT,
    toko TEXT NOT NULL,
    jenis_kain TEXT NOT NULL,
    warna TEXT NOT NULL,
    lengan_pendek BOOLEAN DEFAULT FALSE,
    lengan_panjang BOOLEAN DEFAULT FALSE,
    ukuran_data JSONB,
    harga_satuan NUMERIC(10,2) NOT NULL,
    dp NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_tagihan NUMERIC(10,2) NOT NULL,
    sisa NUMERIC(10,2) NOT NULL,
    tanggal_pesan DATE NOT NULL,
    deadline DATE NOT NULL,
    gambar_mockup TEXT,
    items_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Table: biaya_produksi
-- ==============================================
CREATE TABLE IF NOT EXISTS public.biaya_produksi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    kategori TEXT NOT NULL,
    jenis TEXT NOT NULL,
    harga NUMERIC(10,2) NOT NULL,
    jumlah NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Indexes
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_orders_no_orderan ON public.orders(no_orderan);
CREATE INDEX IF NOT EXISTS idx_orders_tanggal_pesan ON public.orders(tanggal_pesan);
CREATE INDEX IF NOT EXISTS idx_orders_deadline ON public.orders(deadline);
CREATE INDEX IF NOT EXISTS idx_biaya_produksi_order_id ON public.biaya_produksi(order_id);
CREATE INDEX IF NOT EXISTS idx_pilihan_kategori ON public.pilihan(kategori);

-- ==============================================
-- Default admin user
-- ==============================================
INSERT INTO public.users (username, password_hash, nama_lengkap, email)
VALUES (
    'admin',
    '$2a$10$xQZJ9qZ9XQZ9qZ9XQZ9qZO5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5',
    'Administrator',
    'admin@b13garmen.com'
)
ON CONFLICT (username) DO NOTHING;

-- ==============================================
-- Row Level Security (opsional)
-- ==============================================
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bahan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.produk ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.percetakan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.jasa ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pilihan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.biaya_produksi ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- Catatan untuk Storage Bucket
-- ==============================================
-- Buat bucket di Supabase Dashboard > Storage
-- Nama bucket: mockup-images
-- Public bucket: true (agar bisa diakses tanpa auth)

-- ==============================================
-- Deskripsi tabel
-- ==============================================
COMMENT ON TABLE public.users IS 'User accounts for authentication';
COMMENT ON TABLE public.bahan IS 'Fabric/material catalog';
COMMENT ON TABLE public.produk IS 'Product catalog';
COMMENT ON TABLE public.percetakan IS 'Printing services catalog';
COMMENT ON TABLE public.jasa IS 'Service catalog';
COMMENT ON TABLE public.pilihan IS 'Dropdown options for forms';
COMMENT ON TABLE public.orders IS 'Customer orders';
COMMENT ON TABLE public.biaya_produksi IS 'Production costs breakdown per order';

-- Add kategori_produk column to produk table

-- Jalankan di Supabase SQL Editor

ALTER TABLE public.produk

ADD COLUMN IF NOT EXISTS kategori_produk TEXT;

-- Add comment

COMMENT ON COLUMN public.produk.kategori_produk IS 'Kategori produk: Garment, Advertising, Jasa, atau Lainnya';

-- Create index for better query performance

CREATE INDEX IF NOT EXISTS idx_produk_kategori ON public.produk(kategori_produk);
