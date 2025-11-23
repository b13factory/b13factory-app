'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ShoppingCart,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  PackagePlus,
  FileImage
} from 'lucide-react';
import Link from 'next/link';

export default function OrderanAdvancedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data katalog
  const [produkList, setProdukList] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [percetakanList, setPercetakanList] = useState([]);
  const [jasaList, setJasaList] = useState([]);
  
  // Form data pemesan
  const [formData, setFormData] = useState({
    nama: '',
    nohp: '',
    alamat: '',
    tanggal_pesan: '',
    deadline: '',
    dp: 0,
    gambar_mockup: null
  });
  
  // Array pesanan (multiple products)
  const [pesanan, setPesanan] = useState([
    {
      id: Date.now(),
      jenis_produk: '',
      jenis: '',
      model: '',
      tipe_desain: '',
      toko: '',
      jenis_kain: '',
      warna: '',
      harga_kain: 0,
      bahan_tambahan: [],
      ukuran: {
        pendek: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        panjang: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        lainnya: []
      },
      harga_satuan_pendek: 0,
      harga_satuan_panjang: 0
    }
  ]);
  
  // Biaya produksi
  const [biayaProduksi, setBiayaProduksi] = useState({
    percetakan: [],
    jasa: []
  });

  useEffect(() => {
    fetchKatalog();
    // Set tanggal default
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, tanggal_pesan: today }));
  }, []);

  async function fetchKatalog() {
    setLoading(true);
    try {
      const [produkRes, bahanRes, percetakanRes, jasaRes] = await Promise.all([
        supabase.from('produk').select('*').order('produk'),
        supabase.from('bahan').select('*').order('nama_toko'),
        supabase.from('percetakan').select('*').order('jenis'),
        supabase.from('jasa').select('*').order('jasa')
      ]);
      
      setProdukList(produkRes.data || []);
      setBahanList(bahanRes.data || []);
      setPercetakanList(percetakanRes.data || []);
      setJasaList(jasaRes.data || []);
    } catch (error) {
      console.error('Error fetching katalog:', error);
    } finally {
      setLoading(false);
    }
  }

  // Pesanan functions
  function tambahPesanan() {
    setPesanan([...pesanan, {
      id: Date.now(),
      jenis_produk: '',
      jenis: '',
      model: '',
      tipe_desain: '',
      toko: '',
      jenis_kain: '',
      warna: '',
      harga_kain: 0,
      bahan_tambahan: [],
      ukuran: {
        pendek: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        panjang: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        lainnya: []
      },
      harga_satuan_pendek: 0,
      harga_satuan_panjang: 0
    }]);
  }

  function hapusPesanan(id) {
    if (pesanan.length <= 1) {
      alert('Minimal harus ada satu pesanan!');
      return;
    }
    if (confirm('Hapus pesanan ini?')) {
      setPesanan(pesanan.filter(p => p.id !== id));
    }
  }

  function updatePesanan(id, field, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  }

  function updateUkuran(id, lengan, size, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ukuran: {
            ...p.ukuran,
            [lengan]: {
              ...p.ukuran[lengan],
              [size]: parseInt(value) || 0
            }
          }
        };
      }
      return p;
    }));
  }

  function tambahUkuranLainnya(id) {
    setPesanan(pesanan.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ukuran: {
            ...p.ukuran,
            lainnya: [...p.ukuran.lainnya, { nama: '', jumlah: 0 }]
          }
        };
      }
      return p;
    }));
  }

  function updateUkuranLainnya(pesananId, index, field, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        const newLainnya = [...p.ukuran.lainnya];
        newLainnya[index] = { ...newLainnya[index], [field]: value };
        return {
          ...p,
          ukuran: { ...p.ukuran, lainnya: newLainnya }
        };
      }
      return p;
    }));
  }

  function hapusUkuranLainnya(pesananId, index) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          ukuran: {
            ...p.ukuran,
            lainnya: p.ukuran.lainnya.filter((_, i) => i !== index)
          }
        };
      }
      return p;
    }));
  }

  // Bahan tambahan functions
  function tambahBahanTambahan(id) {
    setPesanan(pesanan.map(p => {
      if (p.id === id) {
        return {
          ...p,
          bahan_tambahan: [...p.bahan_tambahan, { toko: '', jenis: '', warna: '', jumlah: 0, harga: 0 }]
        };
      }
      return p;
    }));
  }

  function updateBahanTambahan(pesananId, index, field, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        const newBahan = [...p.bahan_tambahan];
        newBahan[index] = { ...newBahan[index], [field]: value };
        return { ...p, bahan_tambahan: newBahan };
      }
      return p;
    }));
  }

  function hapusBahanTambahan(pesananId, index) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          bahan_tambahan: p.bahan_tambahan.filter((_, i) => i !== index)
        };
      }
      return p;
    }));
  }

  // Biaya produksi functions
  function tambahPercetakan() {
    setBiayaProduksi({
      ...biayaProduksi,
      percetakan: [...biayaProduksi.percetakan, { jenis: '', model: '', tipe_ukuran: '', jumlah: 0, harga: 0 }]
    });
  }

  function updatePercetakan(index, field, value) {
    const newPercetakan = [...biayaProduksi.percetakan];
    newPercetakan[index] = { ...newPercetakan[index], [field]: value };
    setBiayaProduksi({ ...biayaProduksi, percetakan: newPercetakan });
  }

  function hapusPercetakan(index) {
    setBiayaProduksi({
      ...biayaProduksi,
      percetakan: biayaProduksi.percetakan.filter((_, i) => i !== index)
    });
  }

  function tambahJasa() {
    setBiayaProduksi({
      ...biayaProduksi,
      jasa: [...biayaProduksi.jasa, { jasa: '', jenis: '', tipe: '', jumlah: 0, harga: 0 }]
    });
  }

  function updateJasa(index, field, value) {
    const newJasa = [...biayaProduksi.jasa];
    newJasa[index] = { ...newJasa[index], [field]: value };
    setBiayaProduksi({ ...biayaProduksi, jasa: newJasa });
  }

  function hapusJasa(index) {
    setBiayaProduksi({
      ...biayaProduksi,
      jasa: biayaProduksi.jasa.filter((_, i) => i !== index)
    });
  }

  // Calculate totals
  function hitungTotalTagihan() {
    let total = 0;
    pesanan.forEach(p => {
      // Hitung total ukuran pendek
      const totalPendek = Object.values(p.ukuran.pendek).reduce((sum, val) => sum + val, 0);
      total += totalPendek * p.harga_satuan_pendek;
      
      // Hitung total ukuran panjang
      const totalPanjang = Object.values(p.ukuran.panjang).reduce((sum, val) => sum + val, 0);
      total += totalPanjang * p.harga_satuan_panjang;
      
      // Hitung ukuran lainnya (assume harga sama dengan pendek)
      const totalLainnya = p.ukuran.lainnya.reduce((sum, u) => sum + u.jumlah, 0);
      total += totalLainnya * p.harga_satuan_pendek;
    });
    return total;
  }

  function hitungTotalBiayaProduksi() {
    let total = 0;
    
    // Percetakan
    biayaProduksi.percetakan.forEach(p => {
      total += p.jumlah * p.harga;
    });
    
    // Jasa
    biayaProduksi.jasa.forEach(j => {
      total += j.jumlah * j.harga;
    });
    
    return total;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validasi
    if (!formData.nama || !formData.deadline) {
      alert('Mohon lengkapi nama dan deadline!');
      return;
    }
    
    if (pesanan.length === 0 || !pesanan[0].jenis_produk) {
      alert('Mohon tambahkan minimal satu pesanan!');
      return;
    }

    setSubmitting(true);

    try {
      const totalTagihan = hitungTotalTagihan();
      const totalBiaya = hitungTotalBiayaProduksi();
      const sisa = totalTagihan - parseFloat(formData.dp || 0);
      
      // Generate nomor orderan
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const noOrderan = `ORD-${year}${month}-${random}`;

      // Simpan order utama
      const orderData = {
        no_orderan: noOrderan,
        nama: formData.nama,
        nohp: formData.nohp || '-',
        alamat: formData.alamat || '-',
        jenis_produk: pesanan[0].jenis_produk,
        desain: pesanan[0].jenis || 'Custom',
        subdesain: pesanan[0].tipe_desain || null,
        toko: pesanan[0].toko || '-',
        jenis_kain: pesanan[0].jenis_kain || '-',
        warna: pesanan[0].warna || '-',
        harga_satuan: pesanan[0].harga_satuan_pendek || 0,
        tanggal_pesan: formData.tanggal_pesan,
        deadline: formData.deadline,
        total_tagihan: totalTagihan,
        dp: parseFloat(formData.dp || 0),
        sisa: sisa,
        ukuran_data: pesanan[0].ukuran,
        items_data: pesanan.length > 1 ? pesanan : null,
        gambar_mockup: formData.gambar_mockup || null,
        created_at: new Date().toISOString()
      };

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (orderError) throw orderError;

      // Simpan biaya produksi
      if (orderResult && orderResult[0]) {
        const orderId = orderResult[0].id;
        const biayaData = [];
        
        // Percetakan
        biayaProduksi.percetakan.forEach(p => {
          if (p.jumlah > 0) {
            biayaData.push({
              order_id: orderId,
              kategori: 'Percetakan',
              jenis: `${p.jenis} - ${p.model}`,
              harga: p.harga,
              jumlah: p.jumlah,
              total: p.harga * p.jumlah
            });
          }
        });
        
        // Jasa
        biayaProduksi.jasa.forEach(j => {
          if (j.jumlah > 0) {
            biayaData.push({
              order_id: orderId,
              kategori: 'Jasa',
              jenis: `${j.jasa} - ${j.jenis}`,
              harga: j.harga,
              jumlah: j.jumlah,
              total: j.harga * j.jumlah
            });
          }
        });
        
        if (biayaData.length > 0) {
          const { error: biayaError } = await supabase
            .from('biaya_produksi')
            .insert(biayaData);
          
          if (biayaError) console.error('Error saving biaya:', biayaError);
        }
      }

      alert('Order berhasil disimpan! ✅');
      router.push('/');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Gagal menyimpan order: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-sky-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat katalog...</p>
        </div>
      </div>
    );
  }

  const totalTagihan = hitungTotalTagihan();
  const totalBiaya = hitungTotalBiayaProduksi();
  const sisa = totalTagihan - parseFloat(formData.dp || 0);
  const filteredProdukList = produkList.filter(p => p.produk === 'Garment');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg">
              <PackagePlus className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Order Lengkap</h1>
              <p className="text-gray-600 mt-1">Form input order dengan detail kompleks</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Pemesan */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Data Pemesan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nama">Nama Pemesan *</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div>
              <Label htmlFor="nohp">Nomor HP</Label>
              <Input
                id="nohp"
                value={formData.nohp}
                onChange={(e) => setFormData({ ...formData, nohp: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Alamat lengkap"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Data Pesanan */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h2 className="text-xl font-bold text-gray-800">Data Pesanan</h2>
            <Button type="button" onClick={tambahPesanan} size="sm" className="bg-sky-600 hover:bg-sky-700">
              <Plus size={16} className="mr-1" />
              Tambah Pesanan
            </Button>
          </div>
          
          {pesanan.map((p, index) => (
            <PesananCard
              key={p.id}
              pesanan={p}
              index={index}
              produkList={filteredProdukList}
              bahanList={bahanList}
              onUpdate={updatePesanan}
              onUpdateUkuran={updateUkuran}
              onTambahBahan={tambahBahanTambahan}
              onUpdateBahan={updateBahanTambahan}
              onHapusBahan={hapusBahanTambahan}
              onTambahUkuranLainnya={tambahUkuranLainnya}
              onUpdateUkuranLainnya={updateUkuranLainnya}
              onHapusUkuranLainnya={hapusUkuranLainnya}
              onHapus={hapusPesanan}
              canDelete={pesanan.length > 1}
            />
          ))}
        </div>

        {/* Biaya Produksi */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Biaya Produksi</h2>
          
          {/* Percetakan */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">Percetakan</h3>
              <Button type="button" onClick={tambahPercetakan} size="sm" variant="outline">
                <Plus size={16} className="mr-1" />
                Tambah
              </Button>
            </div>
            {biayaProduksi.percetakan.map((item, index) => (
              <PercetakanRow
                key={index}
                item={item}
                index={index}
                percetakanList={percetakanList}
                onUpdate={updatePercetakan}
                onHapus={hapusPercetakan}
              />
            ))}
          </div>
          
          {/* Jasa */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">Jasa</h3>
              <Button type="button" onClick={tambahJasa} size="sm" variant="outline">
                <Plus size={16} className="mr-1" />
                Tambah
              </Button>
            </div>
            {biayaProduksi.jasa.map((item, index) => (
              <JasaRow
                key={index}
                item={item}
                index={index}
                jasaList={jasaList}
                onUpdate={updateJasa}
                onHapus={hapusJasa}
              />
            ))}
          </div>
        </div>

        {/* Pembayaran & Tanggal */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Pembayaran & Tanggal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tanggal_pesan">Tanggal Pesan *</Label>
              <Input
                id="tanggal_pesan"
                type="date"
                value={formData.tanggal_pesan}
                onChange={(e) => setFormData({ ...formData, tanggal_pesan: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="dp">DP / Uang Muka (Rp)</Label>
              <Input
                id="dp"
                type="number"
                value={formData.dp}
                onChange={(e) => setFormData({ ...formData, dp: e.target.value })}
                min="0"
                step="1000"
              />
            </div>
            <div>
              <Label htmlFor="gambar_mockup">Gambar Mockup</Label>
              <div className="flex items-center gap-2">
                <FileImage className="text-gray-400" size={20} />
                <Input
                  id="gambar_mockup"
                  type="text"
                  value={formData.gambar_mockup || ''}
                  onChange={(e) => setFormData({ ...formData, gambar_mockup: e.target.value })}
                  placeholder="URL gambar mockup (opsional)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-xl shadow-sm border-l-4 border-sky-600">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Order</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total Tagihan:</span>
              <span className="font-bold text-sky-600">Rp {totalTagihan.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-semibold">DP:</span>
              <span>Rp {parseFloat(formData.dp || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-lg border-t pt-2">
              <span className="font-semibold">Sisa Pembayaran:</span>
              <span className={`font-bold ${sisa === 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {sisa.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-lg border-t pt-2 mt-3">
              <span className="font-semibold">Total Biaya Produksi:</span>
              <span className="font-bold text-orange-600">Rp {totalBiaya.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
            Batal
          </Button>
          <div className="flex-1"></div>
          <Button
            type="submit"
            className="flex-1 sm:flex-none bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 shadow-lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Simpan Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Component untuk card pesanan
function PesananCard({ pesanan, index, produkList, bahanList, onUpdate, onUpdateUkuran, onTambahBahan, onUpdateBahan, onHapusBahan, onTambahUkuranLainnya, onUpdateUkuranLainnya, onHapusUkuranLainnya, onHapus, canDelete }) {
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const tokoList = [...new Set(bahanList.map(b => b.nama_toko))];
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">Pesanan #{index + 1}</h3>
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onHapus(pesanan.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>
      
      {/* Jenis Produk */}
      <div className="mb-4">
        <Label>Jenis Produk *</Label>
        <Select value={pesanan.jenis_produk} onValueChange={(val) => onUpdate(pesanan.id, 'jenis_produk', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenis produk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Garment">Garment</SelectItem>
            <SelectItem value="Advertising">Advertising</SelectItem>
            <SelectItem value="Jasa">Jasa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Detail Produk */}
      {pesanan.jenis_produk === 'Garment' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <Label>Jenis</Label>
              <Input
                value={pesanan.jenis}
                onChange={(e) => onUpdate(pesanan.id, 'jenis', e.target.value)}
                placeholder="Contoh: Oblong"
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={pesanan.model}
                onChange={(e) => onUpdate(pesanan.id, 'model', e.target.value)}
                placeholder="Contoh: Lengan Pendek"
              />
            </div>
            <div>
              <Label>Tipe/Desain</Label>
              <Input
                value={pesanan.tipe_desain}
                onChange={(e) => onUpdate(pesanan.id, 'tipe_desain', e.target.value)}
                placeholder="Contoh: Sablon"
              />
            </div>
          </div>
          
          {/* Bahan Utama */}
          <div className="mb-4 p-3 bg-white rounded-lg">
            <Label className="text-sm font-semibold mb-2 block">Bahan Utama</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Toko</Label>
                <Select value={pesanan.toko} onValueChange={(val) => onUpdate(pesanan.id, 'toko', val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilih toko" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokoList.map(toko => (
                      <SelectItem key={toko} value={toko}>{toko}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Jenis Kain</Label>
                <Input
                  className="h-9"
                  value={pesanan.jenis_kain}
                  onChange={(e) => onUpdate(pesanan.id, 'jenis_kain', e.target.value)}
                  placeholder="Cotton, PE, dll"
                />
              </div>
              <div>
                <Label className="text-xs">Warna</Label>
                <Input
                  className="h-9"
                  value={pesanan.warna}
                  onChange={(e) => onUpdate(pesanan.id, 'warna', e.target.value)}
                  placeholder="Hitam, Putih, dll"
                />
              </div>
            </div>
          </div>
          
          {/* Ukuran */}
          <div className="mb-4 p-3 bg-white rounded-lg">
            <Label className="text-sm font-semibold mb-2 block">Ukuran Lengan Pendek</Label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {sizes.map(size => (
                <div key={size}>
                  <Label className="text-xs text-center block mb-1">{size}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={pesanan.ukuran.pendek[size]}
                    onChange={(e) => onUpdateUkuran(pesanan.id, 'pendek', size, e.target.value)}
                    className="h-9 text-center"
                  />
                </div>
              ))}
            </div>
            
            <Label className="text-sm font-semibold mb-2 block">Ukuran Lengan Panjang</Label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {sizes.map(size => (
                <div key={size}>
                  <Label className="text-xs text-center block mb-1">{size}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={pesanan.ukuran.panjang[size]}
                    onChange={(e) => onUpdateUkuran(pesanan.id, 'panjang', size, e.target.value)}
                    className="h-9 text-center"
                  />
                </div>
              ))}
            </div>
            
            {/* Ukuran Lainnya */}
            {pesanan.ukuran.lainnya.length > 0 && (
              <div className="mb-2">
                <Label className="text-sm font-semibold mb-2 block">Ukuran Lainnya</Label>
                {pesanan.ukuran.lainnya.map((uk, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Nama ukuran"
                      value={uk.nama}
                      onChange={(e) => onUpdateUkuranLainnya(pesanan.id, idx, 'nama', e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Jumlah"
                      value={uk.jumlah}
                      onChange={(e) => onUpdateUkuranLainnya(pesanan.id, idx, 'jumlah', e.target.value)}
                      className="h-9 w-24"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onHapusUkuranLainnya(pesanan.id, idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button type="button" onClick={() => onTambahUkuranLainnya(pesanan.id)} size="sm" variant="outline">
              <Plus size={14} className="mr-1" />
              Tambah Ukuran Lainnya
            </Button>
          </div>
          
          {/* Harga Satuan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Harga Satuan Lengan Pendek (Rp)</Label>
              <Input
                type="number"
                min="0"
                value={pesanan.harga_satuan_pendek}
                onChange={(e) => onUpdate(pesanan.id, 'harga_satuan_pendek', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label className="text-sm">Harga Satuan Lengan Panjang (Rp)</Label>
              <Input
                type="number"
                min="0"
                value={pesanan.harga_satuan_panjang}
                onChange={(e) => onUpdate(pesanan.id, 'harga_satuan_panjang', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Component untuk percetakan row
function PercetakanRow({ item, index, percetakanList, onUpdate, onHapus }) {
  return (
    <div className="flex gap-2 mb-2">
      <Input
        placeholder="Jenis"
        value={item.jenis}
        onChange={(e) => onUpdate(index, 'jenis', e.target.value)}
        className="h-9"
      />
      <Input
        placeholder="Model"
        value={item.model}
        onChange={(e) => onUpdate(index, 'model', e.target.value)}
        className="h-9"
      />
      <Input
        type="number"
        placeholder="Jumlah"
        value={item.jumlah}
        onChange={(e) => onUpdate(index, 'jumlah', parseFloat(e.target.value) || 0)}
        className="h-9 w-24"
      />
      <Input
        type="number"
        placeholder="Harga"
        value={item.harga}
        onChange={(e) => onUpdate(index, 'harga', parseFloat(e.target.value) || 0)}
        className="h-9 w-32"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onHapus(index)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

// Component untuk jasa row
function JasaRow({ item, index, jasaList, onUpdate, onHapus }) {
  return (
    <div className="flex gap-2 mb-2">
      <Input
        placeholder="Jasa"
        value={item.jasa}
        onChange={(e) => onUpdate(index, 'jasa', e.target.value)}
        className="h-9"
      />
      <Input
        placeholder="Jenis"
        value={item.jenis}
        onChange={(e) => onUpdate(index, 'jenis', e.target.value)}
        className="h-9"
      />
      <Input
        type="number"
        placeholder="Jumlah"
        value={item.jumlah}
        onChange={(e) => onUpdate(index, 'jumlah', parseFloat(e.target.value) || 0)}
        className="h-9 w-24"
      />
      <Input
        type="number"
        placeholder="Harga"
        value={item.harga}
        onChange={(e) => onUpdate(index, 'harga', parseFloat(e.target.value) || 0)}
        className="h-9 w-32"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onHapus(index)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}