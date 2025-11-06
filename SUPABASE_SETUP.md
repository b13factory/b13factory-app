"# Setup Supabase untuk B13 Garment App

## Langkah 1: Buat User di Supabase Authentication

1. Login ke Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda: `b13-garmen` (gigszmpljitrksgsinrm)
3. Klik **Authentication** di sidebar kiri
4. Klik **Users** tab
5. Klik tombol **Add user** (atau **Invite user**)
6. Pilih **Create new user**
7. Isi form:
   - **Email**: masukkan email yang ingin Anda gunakan (misalnya: admin@b13garment.com)
   - **Password**: masukkan password yang aman
   - **Auto Confirm User**: ✅ CENTANG ini (agar langsung bisa login tanpa konfirmasi email)
8. Klik **Create user**

**Penting**: Catat email dan password yang Anda buat, karena ini yang akan digunakan untuk login!

## Langkah 2: Setup Database Tables (Opsional)

Jika Anda ingin menambahkan fitur order management, jalankan script SQL ini:

1. Klik **SQL Editor** di sidebar
2. Klik **New Query**
3. Copy-paste script SQL di bawah:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
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

-- Table: bahan (kain/fabric)
CREATE TABLE IF NOT EXISTS bahan (
    id TEXT PRIMARY KEY,
    nama_toko TEXT NOT NULL,
    jenis TEXT NOT NULL,
    warna TEXT NOT NULL,
    harga NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: produk
CREATE TABLE IF NOT EXISTS produk (
    id TEXT PRIMARY KEY,
    produk TEXT NOT NULL,
    jenis TEXT NOT NULL,
    model TEXT NOT NULL,
    tipe_desain TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: biaya_produksi
CREATE TABLE IF NOT EXISTS biaya_produksi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    kategori TEXT NOT NULL,
    jenis TEXT NOT NULL,
    harga NUMERIC(10,2) NOT NULL,
    jumlah NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_no_orderan ON orders(no_orderan);
CREATE INDEX IF NOT EXISTS idx_orders_tanggal_pesan ON orders(tanggal_pesan);
CREATE INDEX IF NOT EXISTS idx_orders_deadline ON orders(deadline);
CREATE INDEX IF NOT EXISTS idx_biaya_produksi_order_id ON biaya_produksi(order_id);
```

4. Klik **Run** atau tekan `Ctrl+Enter`
5. Tunggu sampai muncul \"Success\"

## Langkah 3: Setup Storage Bucket untuk Gambar (Opsional)

1. Klik **Storage** di sidebar
2. Klik **Create a new bucket**
3. Isi:
   - **Name**: `mockup-images`
   - **Public bucket**: ✅ CENTANG (agar gambar bisa diakses publik)
4. Klik **Create bucket**

## Langkah 4: Test Login

1. Buka aplikasi: https://b13garmen-app.preview.emergentagent.com
2. Akan redirect ke halaman login
3. Masukkan email dan password yang Anda buat di Langkah 1
4. Klik **Login**
5. Jika berhasil, akan redirect ke Dashboard

## Troubleshooting

### Error: \"Invalid login credentials\"
- Pastikan email dan password yang Anda masukkan sesuai dengan yang dibuat di Supabase
- Pastikan user sudah Auto Confirmed (cek di Authentication > Users, kolom \"Confirmed At\" harus terisi)

### Error: \"User not found\" 
- User belum dibuat di Supabase Authentication
- Kembali ke Langkah 1 dan buat user baru

### Dashboard kosong / tidak ada data
- Ini normal jika baru pertama kali setup
- Database tables belum dibuat (Langkah 2 opsional)
- Atau memang belum ada orderan yang dibuat

## Environment Variables (Sudah Dikonfigurasi)

File `.env` sudah berisi:
- `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key untuk client-side
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key untuk admin operations

Tidak perlu diubah kecuali jika ganti project Supabase.

---

Setelah setup selesai, aplikasi sudah siap digunakan! 🚀
"