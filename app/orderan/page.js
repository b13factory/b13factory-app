'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ShoppingCart, Save, ArrowLeft, Plus, Trash2, Loader2, PackagePlus,
  FileImage, Upload, DollarSign, Package, Scissors, Printer, X, Shirt
} from 'lucide-react';
import Link from 'next/link';

export default function OrderanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
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
    tanggal_pesan: new Date().toISOString().split('T')[0],
    deadline: '',
    dp: 0,
    gambar_mockup: '',
    gambar_preview: ''
  });
  
  // Array pesanan (multiple products)
  const [pesanan, setPesanan] = useState([{
    id: Date.now(),
    kategori: '',
    jenis: '',
    model: '',
    tipe_desain: '',
    toko: '',
    jenis_kain: '',
    warna: '',
    harga_kain: 0,
    bahan_tambahan: [],
    ukuran: {
      pendek: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
      panjang: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
      custom_pendek: [],
      custom_panjang: [],
      lainnya: []
    },
    harga_satuan_pendek: 0,
    harga_satuan_panjang: 0,
    items_advertising: [{ dimensi: '', harga: 0, jumlah: 0 }],
    items_jasa: [{ harga: 0, jumlah: 0 }]
  }]);
  
  // Biaya produksi
  const [biayaProduksi, setBiayaProduksi] = useState({
    kain: [],
    percetakan: [],
    jasa: []
  });

  useEffect(() => {
    fetchKatalog();
  }, []);

  async function fetchKatalog() {
    setLoading(true);
    try {
      const [produkRes, bahanRes, percetakanRes, jasaRes] = await Promise.all([
        fetch('/api/katalog/produk').then(r => r.json()),
        fetch('/api/katalog/bahan').then(r => r.json()),
        fetch('/api/katalog/percetakan').then(r => r.json()),
        fetch('/api/katalog/jasa').then(r => r.json())
      ]);
      
      console.log('📦 Produk loaded:', produkRes?.length || 0, 'items');
      console.log('🧵 Bahan loaded:', bahanRes?.length || 0, 'items');
      console.log('🖨️  Percetakan loaded:', percetakanRes?.length || 0, 'items');
      console.log('🛠️  Jasa loaded:', jasaRes?.length || 0, 'items');

      setProdukList(produkRes || []);
      setBahanList(bahanRes || []);
      setPercetakanList(percetakanRes || []);
      setJasaList(jasaRes || []);
    } catch (error) {
      console.error('Error fetching katalog:', error);
      alert('Gagal memuat katalog: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // ========= PESANAN FUNCTIONS =========
  function tambahPesanan() {
    setPesanan([...pesanan, {
      id: Date.now(),
      kategori: '',
      jenis: '',
      model: '',
      tipe_desain: '',
      toko: '',
      jenis_kain: '',
      warna: '',
      harga_kain: 0,
      bahan_tambahan: [],
      ukuran: {
        pendek: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
        panjang: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
        custom_pendek: [],
        custom_panjang: [],
        lainnya: []
      },
      harga_satuan_pendek: 0,
      harga_satuan_panjang: 0,
      items_advertising: [{ dimensi: '', harga: 0, jumlah: 0 }],
      items_jasa: [{ harga: 0, jumlah: 0 }]
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
    setPesanan(pesanan.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  function updateUkuran(id, lengan, size, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ukuran: {
            ...p.ukuran,
            [lengan]: { ...p.ukuran[lengan], [size]: parseInt(value) || 0 }
          }
        };
      }
      return p;
    }));
  }

  function tambahCustomSize(pesananId, lengan) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          ukuran: {
            ...p.ukuran,
            [`custom_${lengan}`]: [...p.ukuran[`custom_${lengan}`], { nama: '', jumlah: 0, harga: 0 }]
          }
        };
      }
      return p;
    }));
  }

  function updateCustomSize(pesananId, lengan, index, field, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        const customSizes = [...p.ukuran[`custom_${lengan}`]];
        customSizes[index] = { ...customSizes[index], [field]: value };
        return {
          ...p,
          ukuran: {
            ...p.ukuran,
            [`custom_${lengan}`]: customSizes
          }
        };
      }
      return p;
    }));
  }

  function hapusCustomSize(pesananId, lengan, index) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          ukuran: {
            ...p.ukuran,
            [`custom_${lengan}`]: p.ukuran[`custom_${lengan}`].filter((_, i) => i !== index)
          }
        };
      }
      return p;
    }));
  }

  function tambahUkuranLainnya(pesananId) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          ukuran: {
            ...p.ukuran,
            lainnya: [...p.ukuran.lainnya, { nama: '', harga: 0, jumlah: 0 }]
          }
        };
      }
      return p;
    }));
  }

  function updateUkuranLainnya(pesananId, index, field, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        const lainnya = [...p.ukuran.lainnya];
        lainnya[index] = { ...lainnya[index], [field]: value };
        return {
          ...p,
          ukuran: {
            ...p.ukuran,
            lainnya
          }
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

  function tambahBahanTambahan(pesananId) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          bahan_tambahan: [...(p.bahan_tambahan || []), { toko: '', jenis: '', warna: '' }]
        };
      }
      return p;
    }));
  }

  function updateBahanTambahan(pesananId, index, field, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        const bahanTambahan = [...(p.bahan_tambahan || [])];
        bahanTambahan[index] = { ...bahanTambahan[index], [field]: value };
        return {
          ...p,
          bahan_tambahan: bahanTambahan
        };
      }
      return p;
    }));
  }

  function hapusBahanTambahan(pesananId, index) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          bahan_tambahan: (p.bahan_tambahan || []).filter((_, i) => i !== index)
        };
      }
      return p;
    }));
  }

  function tambahAdvertisingItem(pesananId) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          items_advertising: [...p.items_advertising, { dimensi: '', harga: 0, jumlah: 0 }]
        };
      }
      return p;
    }));
  }

  function updateAdvertisingItem(pesananId, index, field, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        const items = [...p.items_advertising];
        items[index] = { ...items[index], [field]: value };
        return {
          ...p,
          items_advertising: items
        };
      }
      return p;
    }));
  }

  function hapusAdvertisingItem(pesananId, index) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId && p.items_advertising.length > 1) {
        return {
          ...p,
          items_advertising: p.items_advertising.filter((_, i) => i !== index)
        };
      }
      return p;
    }));
  }

  function tambahJasaItem(pesananId) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          items_jasa: [...p.items_jasa, { harga: 0, jumlah: 0 }]
        };
      }
      return p;
    }));
  }

  function updateJasaItem(pesananId, index, field, value) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId) {
        const items = [...p.items_jasa];
        items[index] = { ...items[index], [field]: value };
        return {
          ...p,
          items_jasa: items
        };
      }
      return p;
    }));
  }

  function hapusJasaItem(pesananId, index) {
    setPesanan(pesanan.map(p => {
      if (p.id === pesananId && p.items_jasa.length > 1) {
        return {
          ...p,
          items_jasa: p.items_jasa.filter((_, i) => i !== index)
        };
      }
      return p;
    }));
  }

  // ========= BIAYA PRODUKSI FUNCTIONS =========
  // Fungsi untuk Kain
  function tambahBiayaKain() {
    setBiayaProduksi({
      ...biayaProduksi,
      kain: [...biayaProduksi.kain, { toko: '', jenis: '', warna: '', jumlah: 0, harga: 0 }]
    });
  }

  function updateBiayaKain(index, field, value) {
    const newKain = [...biayaProduksi.kain];
    newKain[index] = { ...newKain[index], [field]: value };
    
    // Auto-fill harga dari katalog
    if (field === 'warna' && newKain[index].toko && newKain[index].jenis && value) {
      const item = bahanList.find(b => 
        b.nama_toko === newKain[index].toko && 
        b.jenis === newKain[index].jenis && 
        b.warna === value
      );
      if (item) {
        newKain[index].harga = item.harga;
      }
    }
    
    setBiayaProduksi({ ...biayaProduksi, kain: newKain });
  }

  function hapusBiayaKain(index) {
    setBiayaProduksi({
      ...biayaProduksi,
      kain: biayaProduksi.kain.filter((_, i) => i !== index)
    });
  }

  function tambahBiayaPercetakan() {
    setBiayaProduksi({
      ...biayaProduksi,
      percetakan: [...biayaProduksi.percetakan, { jenis: '', model: '', tipe_ukuran: '', jumlah: 0, harga: 0 }]
    });
  }

  function updateBiayaPercetakan(index, field, value) {
    const newPercetakan = [...biayaProduksi.percetakan];
    newPercetakan[index] = { ...newPercetakan[index], [field]: value };
    
    // Auto-fill harga dari katalog
    if (field === 'tipe_ukuran' && newPercetakan[index].jenis && newPercetakan[index].model && value) {
      const item = percetakanList.find(p => 
        p.jenis === newPercetakan[index].jenis && 
        p.model === newPercetakan[index].model && 
        p.tipe_ukuran === value
      );
      if (item) {
        newPercetakan[index].harga = item.harga;
      }
    }
    
    setBiayaProduksi({ ...biayaProduksi, percetakan: newPercetakan });
  }

  function hapusBiayaPercetakan(index) {
    setBiayaProduksi({
      ...biayaProduksi,
      percetakan: biayaProduksi.percetakan.filter((_, i) => i !== index)
    });
  }

  function tambahBiayaJasa() {
    setBiayaProduksi({
      ...biayaProduksi,
      jasa: [...biayaProduksi.jasa, { jasa: '', jenis: '', tipe: '', jumlah: 0, harga: 0 }]
    });
  }

  function updateBiayaJasa(index, field, value) {
    const newJasa = [...biayaProduksi.jasa];
    newJasa[index] = { ...newJasa[index], [field]: value };
    
    // Auto-fill harga dari katalog
    if (field === 'tipe' && newJasa[index].jasa && newJasa[index].jenis && value) {
      const item = jasaList.find(j => 
        j.jasa === newJasa[index].jasa && 
        j.jenis === newJasa[index].jenis && 
        j.tipe === value
      );
      if (item) {
        newJasa[index].harga = item.harga;
      }
    }
    
    setBiayaProduksi({ ...biayaProduksi, jasa: newJasa });
  }

  function hapusBiayaJasa(index) {
    setBiayaProduksi({
      ...biayaProduksi,
      jasa: biayaProduksi.jasa.filter((_, i) => i !== index)
    });
  }

  // ========= FILE UPLOAD FUNCTION =========
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 1MB');
      e.target.value = '';
      return;
    }

    // Validasi format
    const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      alert('Format file tidak valid! Gunakan PNG, JPG, atau WEBP');
      e.target.value = '';
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64 untuk preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          gambar_preview: reader.result,
          gambar_mockup: file.name
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengupload gambar: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  }

  // ========= PERHITUNGAN TOTAL =========
  function hitungTotalTagihan() {
    let total = 0;

    pesanan.forEach(p => {
      if (p.kategori === 'Garment') {
        // Hitung lengan pendek standar
        Object.values(p.ukuran.pendek).forEach(qty => {
          total += (qty || 0) * (parseFloat(p.harga_satuan_pendek) || 0);
        });
        
        // Custom pendek
        (p.ukuran.custom_pendek || []).forEach(cs => {
          total += (parseInt(cs.jumlah) || 0) * (parseFloat(cs.harga) || 0);
        });

        // Hitung lengan panjang standar
        Object.values(p.ukuran.panjang).forEach(qty => {
          total += (qty || 0) * (parseFloat(p.harga_satuan_panjang) || 0);
        });
        
        // Custom panjang
        (p.ukuran.custom_panjang || []).forEach(cs => {
          total += (parseInt(cs.jumlah) || 0) * (parseFloat(cs.harga) || 0);
        });

        // Ukuran lainnya
        (p.ukuran.lainnya || []).forEach(ul => {
          total += (parseInt(ul.jumlah) || 0) * (parseFloat(ul.harga) || 0);
        });
      } else if (p.kategori === 'Advertising') {
        (p.items_advertising || []).forEach(item => {
          let dimensiValue = 1;
          if (item.dimensi) {
            if (item.dimensi.includes('x')) {
              const parts = item.dimensi.split('x');
              dimensiValue = parts.reduce((a, b) => parseFloat(a) * parseFloat(b), 1);
            } else {
              dimensiValue = parseFloat(item.dimensi) || 1;
            }
          }
          total += dimensiValue * (parseFloat(item.harga) || 0) * (parseInt(item.jumlah) || 0);
        });
      } else if (p.kategori === 'Jasa' || p.kategori === 'Lainnya') {
        (p.items_jasa || []).forEach(item => {
          total += (parseFloat(item.harga) || 0) * (parseInt(item.jumlah) || 0);
        });
      }
    });

    return total;
  }

  function hitungTotalBiayaProduksi() {
    let total = 0;

    // Hitung biaya kain/bahan
    biayaProduksi.kain.forEach(item => {
      total += (parseFloat(item.harga) || 0) * (parseFloat(item.jumlah) || 0);
    });

    // Hitung biaya percetakan
    biayaProduksi.percetakan.forEach(item => {
      total += (parseFloat(item.harga) || 0) * (parseFloat(item.jumlah) || 0);
    });

    // Hitung biaya jasa
    biayaProduksi.jasa.forEach(item => {
      total += (parseFloat(item.harga) || 0) * (parseFloat(item.jumlah) || 0);
    });

    return total;
  }

  // ========= SUBMIT FUNCTION =========
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.nama || !formData.nohp || !formData.alamat) {
      alert('Mohon lengkapi data pemesan!');
      return;
    }

    if (!formData.deadline) {
      alert('Mohon tentukan deadline!');
      return;
    }

    if (pesanan.length === 0 || !pesanan[0].kategori) {
      alert('Mohon tambahkan minimal satu pesanan!');
      return;
    }

    // Validasi pesanan
    for (const p of pesanan) {
      if (!p.kategori) {
        alert('Mohon pilih kategori untuk setiap pesanan!');
        return;
      }
      if (!p.jenis || !p.model) {
        alert('Mohon lengkapi detail produk untuk setiap pesanan!');
        return;
      }
    }

    setSubmitting(true);

    try {
      const totalTagihan = hitungTotalTagihan();
      
      // Format biaya produksi
      const biayaProduksiFormatted = [
        ...biayaProduksi.percetakan.map(p => ({
          kategori: 'Percetakan',
          jenis: `${p.jenis} - ${p.model} - ${p.tipe_ukuran}`,
          harga: parseFloat(p.harga) || 0,
          jumlah: parseFloat(p.jumlah) || 0
        })),
        ...biayaProduksi.jasa.map(j => ({
          kategori: 'Jasa',
          jenis: `${j.jasa} - ${j.jenis} - ${j.tipe}`,
          harga: parseFloat(j.harga) || 0,
          jumlah: parseFloat(j.jumlah) || 0
        }))
      ];

      const orderData = {
        nama: formData.nama,
        nohp: formData.nohp,
        alamat: formData.alamat,
        tanggal_pesan: formData.tanggal_pesan,
        deadline: formData.deadline,
        dp: parseFloat(formData.dp) || 0,
        total_tagihan: totalTagihan,
        items_data: pesanan,
        gambar_mockup: formData.gambar_mockup || '',
        biaya_produksi: biayaProduksiFormatted
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`Order berhasil dibuat!
No Order: ${result.no_orderan}

Total: ${formatRupiah(totalTagihan)}
DP: ${formatRupiah(formData.dp)}
Sisa: ${formatRupiah(totalTagihan - formData.dp)}`);
        router.push('/');
      } else {
        throw new Error(result.error || 'Gagal menyimpan order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Gagal menyimpan order: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ========= GET CASCADING OPTIONS =========
  function getKategoriOptions() {
    // Ambil dari kategori_produk di database Supabase
    const categories = [...new Set(produkList.map(p => p.kategori_produk).filter(Boolean))];
    console.log('🏷️  Kategori options:', categories);
    return categories.sort();
  }

  function getJenisOptions(kategori) {
    if (!kategori) return [];
    // Filter berdasarkan kategori_produk dari Supabase
    const jenis = [...new Set(produkList.filter(p => 
      p.kategori_produk === kategori
    ).map(p => p.jenis).filter(Boolean))];
    return jenis.sort();
  }

  function getModelOptions(kategori, jenis) {
    if (!kategori || !jenis) return [];
    const models = [...new Set(produkList.filter(p => 
      p.kategori_produk === kategori && p.jenis === jenis
    ).map(p => p.model).filter(Boolean))];
    return models.sort();
  }

  function getTipeOptions(kategori, jenis, model) {
    if (!kategori || !jenis || !model) return [];
    const tipes = [...new Set(produkList.filter(p => 
      p.kategori_produk === kategori && 
      p.jenis === jenis && p.model === model
    ).map(p => p.tipe_desain).filter(Boolean))];
    return tipes.sort();
  }

  function getTokoOptions() {
    const tokos = [...new Set(bahanList.map(b => b.nama_toko))];
    return tokos.sort();
  }

  function getJenisKainOptions(toko) {
    if (!toko) return [];
    const jenis = [...new Set(bahanList.filter(b => b.nama_toko === toko).map(b => b.jenis))];
    return jenis.sort();
  }

  function getWarnaOptions(toko, jenis) {
    if (!toko || !jenis) return [];
    const warnas = bahanList.filter(b => b.nama_toko === toko && b.jenis === jenis).map(b => ({ warna: b.warna, harga: b.harga }));
    return warnas;
  }

  function getWarnaKainOptions(toko, jenis) {
    if (!toko || !jenis) return [];
    return bahanList.filter(b => b.nama_toko === toko && b.jenis === jenis);
  }

  // Fungsi untuk Biaya Produksi - Bahan
  function getJenisBahanOptions(toko) {
    if (!toko) return [];
    const jenis = [...new Set(bahanList.filter(b => b.nama_toko === toko).map(b => b.jenis))];
    return jenis.sort();
  }

  function getWarnaBahanOptions(toko, jenis) {
    if (!toko || !jenis) return [];
    const warnas = [...new Set(bahanList.filter(b => b.nama_toko === toko && b.jenis === jenis).map(b => b.warna))];
    return warnas.sort();
  }

  function getJenisPercetakanOptions() {
    const jenis = [...new Set(percetakanList.map(p => p.jenis))];
    return jenis.sort();
  }

  function getModelPercetakanOptions(jenis) {
    if (!jenis) return [];
    const models = [...new Set(percetakanList.filter(p => p.jenis === jenis).map(p => p.model))];
    return models.sort();
  }

  function getTipePercetakanOptions(jenis, model) {
    if (!jenis || !model) return [];
    return percetakanList.filter(p => p.jenis === jenis && p.model === model);
  }

  function getJasaNameOptions() {
    const names = [...new Set(jasaList.map(j => j.jasa))];
    return names.sort();
  }

  function getJenisJasaOptions(jasaName) {
    if (!jasaName) return [];
    const jenis = [...new Set(jasaList.filter(j => j.jasa === jasaName).map(j => j.jenis))];
    return jenis.sort();
  }

  function getTipeJasaOptions(jasaName, jenis) {
    if (!jasaName || !jenis) return [];
    return jasaList.filter(j => j.jasa === jasaName && j.jenis === jenis);
  }

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat katalog...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* DATA PEMESAN */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Data Pemesan
            </CardTitle>
            <CardDescription>Informasi lengkap pemesan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nohp">No. HP/WhatsApp *</Label>
                <Input
                  id="nohp"
                  type="tel"
                  value={formData.nohp}
                  onChange={(e) => setFormData({ ...formData, nohp: e.target.value })}
                  required
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat Lengkap *</Label>
              <Textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                required
                rows={3}
                placeholder="Masukkan alamat lengkap"
              />
            </div>
          </CardContent>
        </Card>

        {/* DATA PESANAN */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Data Pesanan
              </span>
              <Button type="button" onClick={tambahPesanan} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pesanan
              </Button>
            </CardTitle>
            <CardDescription>Detail produk yang dipesan (dapat menambahkan lebih dari 1 pesanan)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pesanan.map((p, idx) => (
              <div key={p.id} className="border border-border rounded-lg p-4 bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-sm">
                    <PackagePlus className="h-3 w-3 mr-1" />
                    Pesanan #{idx + 1}
                  </Badge>
                  {pesanan.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => hapusPesanan(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Pilih Kategori */}
                <div className="space-y-2">
                  <Label>Kategori Produk *</Label>
                  <Select
                    value={p.kategori}
                    onValueChange={(value) => {
                      console.log('✅ Kategori selected:', value);
                      updatePesanan(p.id, 'kategori', value);
                      updatePesanan(p.id, 'jenis', '');
                      updatePesanan(p.id, 'model', '');
                      updatePesanan(p.id, 'tipe_desain', '');
                    }}
                  >
                    <SelectTrigger data-testid={`kategori-select-${idx}`}>
                      <SelectValue placeholder="-- Pilih Kategori --" />
                    </SelectTrigger>
                    <SelectContent>
                      {getKategoriOptions().map(kat => (
                        <SelectItem key={kat} value={kat}>{kat}</SelectItem>
                      ))}
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Detail Produk - Cascading Dropdown */}
                {p.kategori && (
                  <div className="space-y-4">
                    <Separator />
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      Detail Produk
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Jenis *</Label>
                        <Select
                          value={p.jenis}
                          onValueChange={(value) => {
                            updatePesanan(p.id, 'jenis', value);
                            updatePesanan(p.id, 'model', '');
                            updatePesanan(p.id, 'tipe_desain', '');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="-- Pilih Jenis --" />
                          </SelectTrigger>
                          <SelectContent>
                            {getJenisOptions(p.kategori).map(jenis => (
                              <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Model *</Label>
                        <Select
                          value={p.model}
                          onValueChange={(value) => {
                            updatePesanan(p.id, 'model', value);
                            updatePesanan(p.id, 'tipe_desain', '');
                          }}
                          disabled={!p.jenis}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="-- Pilih Model --" />
                          </SelectTrigger>
                          <SelectContent>
                            {getModelOptions(p.kategori === 'Lainnya' ? 'Jasa' : p.kategori, p.jenis).map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Tipe/Desain</Label>
                        <Select
                          value={p.tipe_desain}
                          onValueChange={(value) => updatePesanan(p.id, 'tipe_desain', value)}
                          disabled={!p.model}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="-- Pilih Tipe --" />
                          </SelectTrigger>
                          <SelectContent>
                            {getTipeOptions(p.kategori === 'Lainnya' ? 'Jasa' : p.kategori, p.jenis, p.model).map(tipe => (
                              <SelectItem key={tipe} value={tipe}>{tipe}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* GARMENT SPECIFIC FIELDS */}
                {p.kategori === 'Garment' && (
                  <div className="space-y-4">
                    {/* Bahan Utama */}
                    <div className="space-y-4">
                      <Separator />
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Scissors className="h-4 w-4" />
                        Bahan Utama
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Toko Kain *</Label>
                          <Select
                            value={p.toko}
                            onValueChange={(value) => {
                              updatePesanan(p.id, 'toko', value);
                              updatePesanan(p.id, 'jenis_kain', '');
                              updatePesanan(p.id, 'warna', '');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Toko --" />
                            </SelectTrigger>
                            <SelectContent>
                              {getTokoOptions().map(toko => (
                                <SelectItem key={toko} value={toko}>{toko}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Jenis Kain *</Label>
                          <Select
                            value={p.jenis_kain}
                            onValueChange={(value) => {
                              updatePesanan(p.id, 'jenis_kain', value);
                              updatePesanan(p.id, 'warna', '');
                            }}
                            disabled={!p.toko}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Jenis --" />
                            </SelectTrigger>
                            <SelectContent>
                              {getJenisKainOptions(p.toko).map(jenis => (
                                <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Warna *</Label>
                          <Select
                            value={p.warna}
                            onValueChange={(value) => {
                              updatePesanan(p.id, 'warna', value);
                              // Auto-fill harga
                              const warna = getWarnaOptions(p.toko, p.jenis_kain).find(w => w.warna === value);
                              if (warna) {
                                updatePesanan(p.id, 'harga_kain', warna.harga);
                              }
                            }}
                            disabled={!p.jenis_kain}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Warna --" />
                            </SelectTrigger>
                            <SelectContent>
                              {getWarnaOptions(p.toko, p.jenis_kain).map((w, i) => (
                                <SelectItem key={i} value={w.warna}>
                                  {w.warna} - {formatRupiah(w.harga)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Bahan Tambahan */}
                    <div className="space-y-2">
                      <Label className="text-sm">Bahan Tambahan (Opsional)</Label>
                      {(p.bahan_tambahan || []).map((bt, btIdx) => (
                        <div key={btIdx} className="flex gap-2">
                          <Select
                            value={bt.toko}
                            onValueChange={(value) => {
                              updateBahanTambahan(p.id, btIdx, 'toko', value);
                              updateBahanTambahan(p.id, btIdx, 'jenis', '');
                              updateBahanTambahan(p.id, btIdx, 'warna', '');
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Toko" />
                            </SelectTrigger>
                            <SelectContent>
                              {getTokoOptions().map(toko => (
                                <SelectItem key={toko} value={toko}>{toko}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={bt.jenis}
                            onValueChange={(value) => {
                              updateBahanTambahan(p.id, btIdx, 'jenis', value);
                              updateBahanTambahan(p.id, btIdx, 'warna', '');
                            }}
                            disabled={!bt.toko}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                              {getJenisKainOptions(bt.toko).map(jenis => (
                                <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={bt.warna}
                            onValueChange={(value) => updateBahanTambahan(p.id, btIdx, 'warna', value)}
                            disabled={!bt.jenis}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Warna" />
                            </SelectTrigger>
                            <SelectContent>
                              {getWarnaOptions(bt.toko, bt.jenis).map((w, i) => (
                                <SelectItem key={i} value={w.warna}>{w.warna}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => hapusBahanTambahan(p.id, btIdx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => tambahBahanTambahan(p.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Bahan
                      </Button>
                    </div>

                    {/* Ukuran */}
                    <div className="space-y-4">
                      <Separator />
                      <h4 className="font-semibold text-sm">Ukuran & Kuantitas</h4>
                      
                      {/* Ukuran Standar */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Lengan Pendek</Label>
                        <div className="grid grid-cols-5 gap-2">
                          {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                            <div key={size} className="space-y-1">
                              <Label className="text-xs text-center block">{size}</Label>
                              <Input
                                type="number"
                                min="0"
                                value={p.ukuran.pendek[size]}
                                onChange={(e) => updateUkuran(p.id, 'pendek', size, e.target.value)}
                                className="text-center"
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* Custom Size Pendek */}
                        {(p.ukuran.custom_pendek || []).map((cs, csIdx) => (
                          <div key={csIdx} className="flex gap-2">
                            <Input
                              placeholder="Nama ukuran"
                              value={cs.nama}
                              onChange={(e) => updateCustomSize(p.id, 'pendek', csIdx, 'nama', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Jumlah"
                              min="0"
                              value={cs.jumlah}
                              onChange={(e) => updateCustomSize(p.id, 'pendek', csIdx, 'jumlah', e.target.value)}
                              className="w-24"
                            />
                            <Input
                              type="number"
                              placeholder="Harga"
                              min="0"
                              value={cs.harga}
                              onChange={(e) => updateCustomSize(p.id, 'pendek', csIdx, 'harga', e.target.value)}
                              className="w-32"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => hapusCustomSize(p.id, 'pendek', csIdx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => tambahCustomSize(p.id, 'pendek')}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Custom Size Pendek
                        </Button>

                        <div className="space-y-2">
                          <Label>Harga Satuan Lengan Pendek (Rp)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={p.harga_satuan_pendek}
                            onChange={(e) => updatePesanan(p.id, 'harga_satuan_pendek', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Lengan Panjang */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Lengan Panjang</Label>
                        <div className="grid grid-cols-5 gap-2">
                          {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                            <div key={size} className="space-y-1">
                              <Label className="text-xs text-center block">{size}</Label>
                              <Input
                                type="number"
                                min="0"
                                value={p.ukuran.panjang[size]}
                                onChange={(e) => updateUkuran(p.id, 'panjang', size, e.target.value)}
                                className="text-center"
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* Custom Size Panjang */}
                        {(p.ukuran.custom_panjang || []).map((cs, csIdx) => (
                          <div key={csIdx} className="flex gap-2">
                            <Input
                              placeholder="Nama ukuran"
                              value={cs.nama}
                              onChange={(e) => updateCustomSize(p.id, 'panjang', csIdx, 'nama', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Jumlah"
                              min="0"
                              value={cs.jumlah}
                              onChange={(e) => updateCustomSize(p.id, 'panjang', csIdx, 'jumlah', e.target.value)}
                              className="w-24"
                            />
                            <Input
                              type="number"
                              placeholder="Harga"
                              min="0"
                              value={cs.harga}
                              onChange={(e) => updateCustomSize(p.id, 'panjang', csIdx, 'harga', e.target.value)}
                              className="w-32"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => hapusCustomSize(p.id, 'panjang', csIdx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => tambahCustomSize(p.id, 'panjang')}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Custom Size Panjang
                        </Button>

                        <div className="space-y-2">
                          <Label>Harga Satuan Lengan Panjang (Rp)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={p.harga_satuan_panjang}
                            onChange={(e) => updatePesanan(p.id, 'harga_satuan_panjang', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Ukuran Lainnya */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Ukuran Lainnya (Opsional)</Label>
                        {(p.ukuran.lainnya || []).map((ul, ulIdx) => (
                          <div key={ulIdx} className="flex gap-2">
                            <Input
                              placeholder="Nama ukuran"
                              value={ul.nama}
                              onChange={(e) => updateUkuranLainnya(p.id, ulIdx, 'nama', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Harga"
                              min="0"
                              value={ul.harga}
                              onChange={(e) => updateUkuranLainnya(p.id, ulIdx, 'harga', e.target.value)}
                              className="w-32"
                            />
                            <Input
                              type="number"
                              placeholder="Jumlah"
                              min="0"
                              value={ul.jumlah}
                              onChange={(e) => updateUkuranLainnya(p.id, ulIdx, 'jumlah', e.target.value)}
                              className="w-24"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => hapusUkuranLainnya(p.id, ulIdx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => tambahUkuranLainnya(p.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Ukuran Lainnya
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADVERTISING SPECIFIC FIELDS */}
                {p.kategori === 'Advertising' && (
                  <div className="space-y-4">
                    <Separator />
                    <h4 className="font-semibold text-sm">Detail Pesanan Advertising</h4>
                    <div className="space-y-2">
                      {(p.items_advertising || []).map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-2">
                          <Input
                            placeholder="Dimensi (contoh: 2x3 atau 5)"
                            value={item.dimensi}
                            onChange={(e) => updateAdvertisingItem(p.id, itemIdx, 'dimensi', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Harga per m²/unit"
                            min="0"
                            value={item.harga}
                            onChange={(e) => updateAdvertisingItem(p.id, itemIdx, 'harga', e.target.value)}
                            className="w-40"
                          />
                          <Input
                            type="number"
                            placeholder="Jumlah"
                            min="0"
                            value={item.jumlah}
                            onChange={(e) => updateAdvertisingItem(p.id, itemIdx, 'jumlah', e.target.value)}
                            className="w-24"
                          />
                          {p.items_advertising.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => hapusAdvertisingItem(p.id, itemIdx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => tambahAdvertisingItem(p.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Item
                      </Button>
                    </div>
                  </div>
                )}

                {/* JASA/LAINNYA SPECIFIC FIELDS */}
                {(p.kategori === 'Jasa' || p.kategori === 'Lainnya') && (
                  <div className="space-y-4">
                    <Separator />
                    <h4 className="font-semibold text-sm">Detail Pesanan {p.kategori}</h4>
                    <div className="space-y-2">
                      {(p.items_jasa || []).map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Harga"
                            min="0"
                            value={item.harga}
                            onChange={(e) => updateJasaItem(p.id, itemIdx, 'harga', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Jumlah"
                            min="0"
                            value={item.jumlah}
                            onChange={(e) => updateJasaItem(p.id, itemIdx, 'jumlah', e.target.value)}
                            className="w-32"
                          />
                          {p.items_jasa.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => hapusJasaItem(p.id, itemIdx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => tambahJasaItem(p.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Item
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* BIAYA PRODUKSI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Biaya Produksi
            </CardTitle>
            <CardDescription>Input biaya produksi untuk kain/bahan, percetakan dan jasa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Kain/Bahan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Kain / Bahan
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🔘 Button Tambah Kain clicked');
                    tambahBiayaKain();
                  }}
                  data-testid="tambah-biaya-kain"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </div>
              {biayaProduksi.kain.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Select
                    value={item.toko}
                    onValueChange={(value) => {
                      updateBiayaKain(idx, 'toko', value);
                      updateBiayaKain(idx, 'jenis', '');
                      updateBiayaKain(idx, 'warna', '');
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Toko" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTokoOptions().map(toko => (
                        <SelectItem key={toko} value={toko}>{toko}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.jenis}
                    onValueChange={(value) => {
                      updateBiayaKain(idx, 'jenis', value);
                      updateBiayaKain(idx, 'warna', '');
                    }}
                    disabled={!item.toko}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      {getJenisBahanOptions(item.toko).map(jenis => (
                        <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.warna}
                    onValueChange={(value) => updateBiayaKain(idx, 'warna', value)}
                    disabled={!item.jenis}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Warna" />
                    </SelectTrigger>
                    <SelectContent>
                      {getWarnaBahanOptions(item.toko, item.jenis).map((warna, i) => {
                        const bahanItem = bahanList.find(b => 
                          b.nama_toko === item.toko && 
                          b.jenis === item.jenis && 
                          b.warna === warna
                        );
                        return (
                          <SelectItem key={i} value={warna}>
                            {warna} {bahanItem ? `- ${formatRupiah(bahanItem.harga)}` : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Harga"
                    min="0"
                    value={item.harga}
                    onChange={(e) => updateBiayaKain(idx, 'harga', e.target.value)}
                    className="w-32"
                  />

                  <Input
                    type="number"
                    placeholder="Jumlah"
                    min="0"
                    step="0.1"
                    value={item.jumlah}
                    onChange={(e) => updateBiayaKain(idx, 'jumlah', e.target.value)}
                    className="w-24"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => hapusBiayaKain(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {biayaProduksi.kain.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada data kain/bahan
                </p>
              )}
            </div>

            <Separator />

            {/* Percetakan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Percetakan
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={tambahBiayaPercetakan}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </div>
              {biayaProduksi.percetakan.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Select
                    value={item.jenis}
                    onValueChange={(value) => {
                      updateBiayaPercetakan(idx, 'jenis', value);
                      updateBiayaPercetakan(idx, 'model', '');
                      updateBiayaPercetakan(idx, 'tipe_ukuran', '');
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      {getJenisPercetakanOptions().map(jenis => (
                        <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.model}
                    onValueChange={(value) => {
                      updateBiayaPercetakan(idx, 'model', value);
                      updateBiayaPercetakan(idx, 'tipe_ukuran', '');
                    }}
                    disabled={!item.jenis}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelPercetakanOptions(item.jenis).map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.tipe_ukuran}
                    onValueChange={(value) => updateBiayaPercetakan(idx, 'tipe_ukuran', value)}
                    disabled={!item.model}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Tipe/Ukuran" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTipePercetakanOptions(item.jenis, item.model).map((tipe, i) => (
                        <SelectItem key={i} value={tipe.tipe_ukuran}>
                          {tipe.tipe_ukuran} - {formatRupiah(tipe.harga)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Harga"
                    min="0"
                    value={item.harga}
                    onChange={(e) => updateBiayaPercetakan(idx, 'harga', e.target.value)}
                    className="w-32"
                  />

                  <Input
                    type="number"
                    placeholder="Jumlah"
                    min="0"
                    value={item.jumlah}
                    onChange={(e) => updateBiayaPercetakan(idx, 'jumlah', e.target.value)}
                    className="w-24"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => hapusBiayaPercetakan(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {biayaProduksi.percetakan.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada data percetakan
                </p>
              )}
            </div>

            <Separator />

            {/* Jasa */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Jasa
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={tambahBiayaJasa}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </div>
              {biayaProduksi.jasa.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Select
                    value={item.jasa}
                    onValueChange={(value) => {
                      updateBiayaJasa(idx, 'jasa', value);
                      updateBiayaJasa(idx, 'jenis', '');
                      updateBiayaJasa(idx, 'tipe', '');
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Jasa" />
                    </SelectTrigger>
                    <SelectContent>
                      {getJasaNameOptions().map(jasa => (
                        <SelectItem key={jasa} value={jasa}>{jasa}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.jenis}
                    onValueChange={(value) => {
                      updateBiayaJasa(idx, 'jenis', value);
                      updateBiayaJasa(idx, 'tipe', '');
                    }}
                    disabled={!item.jasa}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      {getJenisJasaOptions(item.jasa).map(jenis => (
                        <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.tipe}
                    onValueChange={(value) => updateBiayaJasa(idx, 'tipe', value)}
                    disabled={!item.jenis}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTipeJasaOptions(item.jasa, item.jenis).map((tipe, i) => (
                        <SelectItem key={i} value={tipe.tipe}>
                          {tipe.tipe} - {formatRupiah(tipe.harga)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Harga"
                    min="0"
                    value={item.harga}
                    onChange={(e) => updateBiayaJasa(idx, 'harga', e.target.value)}
                    className="w-32"
                  />

                  <Input
                    type="number"
                    placeholder="Jumlah"
                    min="0"
                    value={item.jumlah}
                    onChange={(e) => updateBiayaJasa(idx, 'jumlah', e.target.value)}
                    className="w-24"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => hapusBiayaJasa(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {biayaProduksi.jasa.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada data jasa
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PEMBAYARAN & TANGGAL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pembayaran & Jadwal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dp">DP (Down Payment) *</Label>
                <Input
                  id="dp"
                  type="number"
                  min="0"
                  value={formData.dp}
                  onChange={(e) => setFormData({ ...formData, dp: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal_pesan">Tanggal Pemesanan *</Label>
                <Input
                  id="tanggal_pesan"
                  type="date"
                  value={formData.tanggal_pesan}
                  onChange={(e) => setFormData({ ...formData, tanggal_pesan: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label htmlFor="gambar_mockup" className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Gambar Mockup (Opsional)
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="gambar_mockup"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  className="flex-1"
                  disabled={uploadingImage}
                />
                {uploadingImage && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
              <p className="text-sm text-muted-foreground">
                Format: PNG, JPG, WEBP. Maksimal 1MB
              </p>
              {formData.gambar_preview && (
                <div className="mt-4 relative w-48 h-48 border rounded-lg overflow-hidden">
                  <img src={formData.gambar_preview} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData({ ...formData, gambar_preview: '', gambar_mockup: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RINGKASAN */}
        <Card className="bg-muted/50 border-2">
          <CardHeader>
            <CardTitle className="text-xl">Ringkasan Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Jumlah Pesanan:</span>
                <span className="font-medium">{pesanan.length} item</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nama Pemesan:</span>
                <span className="font-medium">{formData.nama || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">No. HP:</span>
                <span className="font-medium">{formData.nohp || '-'}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Tagihan:</span>
                <span className="text-primary">{formatRupiah(hitungTotalTagihan())}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Biaya Produksi:</span>
                <span className="text-orange-600">{formatRupiah(hitungTotalBiayaProduksi())}</span>
              </div>
              <div className="flex justify-between">
                <span>DP:</span>
                <span className="font-medium">{formatRupiah(formData.dp)}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-xl font-bold">
              <span>Sisa Pembayaran:</span>
              <span className="text-destructive">{formatRupiah(hitungTotalTagihan() - formData.dp)}</span>
            </div>

            {hitungTotalBiayaProduksi() > 0 && (
              <>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span>Estimasi Laba Kotor:</span>
                  <span className={hitungTotalTagihan() - hitungTotalBiayaProduksi() > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {formatRupiah(hitungTotalTagihan() - hitungTotalBiayaProduksi())}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end gap-4 sticky bottom-4 bg-background p-4 border rounded-lg shadow-lg">
          <Link href="/">
            <Button type="button" variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={submitting} size="lg" className="min-w-[200px]">
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Simpan Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}