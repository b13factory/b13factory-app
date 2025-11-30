'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatRupiah } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ClipboardList,
  Plus,
  Trash2,
  User,
  Package,
  DollarSign,
  Calendar,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { SmartSelect } from '@/components/SmartSelect';

export default function OrderanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data Pemesan
  const [dataPemesan, setDataPemesan] = useState({
    nama: '',
    nohp: '',
    alamat: ''
  });

  // Data Pesanan (Multiple)
  const [pesananList, setPesananList] = useState([]);

  // Biaya Produksi
  const [biayaKain, setBiayaKain] = useState([]);
  const [biayaPercetakan, setBiayaPercetakan] = useState([]);
  const [biayaJasa, setBiayaJasa] = useState([]);

  // Pembayaran & Jadwal
  const [dp, setDp] = useState(0);
  const [tanggalPesan, setTanggalPesan] = useState('');
  const [deadline, setDeadline] = useState('');
  const [gambarMockup, setGambarMockup] = useState(null);
  const [gambarMockupPreview, setGambarMockupPreview] = useState(null);

  // Katalog Data
  const [katalogProduk, setKatalogProduk] = useState([]);
  const [katalogBahan, setKatalogBahan] = useState([]);
  const [katalogPercetakan, setKatalogPercetakan] = useState([]);
  const [katalogJasa, setKatalogJasa] = useState([]);

  // Daftar Toko untuk dropdown
  const [daftarToko, setDaftarToko] = useState([]);

  useEffect(() => {
    fetchKatalogData();
    // Set tanggal default hari ini
    const today = new Date().toISOString().split('T')[0];
    setTanggalPesan(today);
  }, []);

  async function fetchKatalogData() {
    try {
      const [produkRes, bahanRes, percetakanRes, jasaRes] = await Promise.all([
        supabase.from('produk').select('*').order('kategori_produk, produk, jenis'),
        supabase.from('bahan').select('*').order('nama_toko, jenis'),
        supabase.from('percetakan').select('*').order('jenis, model'),
        supabase.from('jasa').select('*').order('jasa, jenis')
      ]);

      if (produkRes.data) setKatalogProduk(produkRes.data);
      if (bahanRes.data) {
        setKatalogBahan(bahanRes.data);
        // Extract unique toko names
        const tokoSet = new Set(bahanRes.data.map(b => b.nama_toko));
        setDaftarToko([...tokoSet]);
      }
      if (percetakanRes.data) setKatalogPercetakan(percetakanRes.data);
      if (jasaRes.data) setKatalogJasa(jasaRes.data);

      // Add first pesanan by default
      tambahPesanan();
    } catch (error) {
      console.error('Error fetching katalog:', error);
      alert('Gagal memuat data katalog');
    } finally {
      setLoading(false);
    }
  }

  function tambahPesanan() {
    const newPesanan = {
      id: Date.now(),
      kategori_produk: '',
      produk: '',
      jenis: '',
      model: '',
      tipe_desain: '',
      // Garment specific
      toko: '',
      jenis_kain: '',
      warna: '',
      bahan_tambahan: [],
      lengan_pendek: true,
      lengan_panjang: true,
      ukuran_pendek: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
      ukuran_panjang: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
      custom_sizes_pendek: [],
      custom_sizes_panjang: [],
      ukuran_lainnya: [],
      harga_satuan_pendek: 0,
      harga_satuan_panjang: 0,
      // Advertising specific
      items_advertising: [],
      // Jasa specific
      items_jasa: []
    };
    setPesananList([...pesananList, newPesanan]);
  }

  function hapusPesanan(id) {
    if (pesananList.length <= 1) {
      alert('Minimal harus ada satu pesanan');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      setPesananList(pesananList.filter(p => p.id !== id));
    }
  }

  function updatePesanan(id, field, value) {
    setPesananList(pesananList.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        // Reset dependent fields when parent changes
        if (field === 'kategori_produk') {
          updated.produk = '';
          updated.jenis = '';
          updated.model = '';
          updated.tipe_desain = '';
        } else if (field === 'produk') {
          updated.jenis = '';
          updated.model = '';
          updated.tipe_desain = '';
        } else if (field === 'jenis') {
          updated.model = '';
          updated.tipe_desain = '';
        } else if (field === 'model') {
          updated.tipe_desain = '';
        } else if (field === 'toko') {
          updated.jenis_kain = '';
          updated.warna = '';
        } else if (field === 'jenis_kain') {
          updated.warna = '';
        }
        return updated;
      }
      return p;
    }));
  }

  function getFilteredOptions(pesanan, field) {
    if (field === 'produk' && pesanan.kategori_produk) {
      const filtered = katalogProduk
        .filter(p => p.kategori_produk === pesanan.kategori_produk)
        .map(p => p.produk);
      return [...new Set(filtered)];
    }
    if (field === 'jenis' && pesanan.kategori_produk && pesanan.produk) {
      const filtered = katalogProduk
        .filter(p => p.kategori_produk === pesanan.kategori_produk && p.produk === pesanan.produk)
        .map(p => p.jenis);
      return [...new Set(filtered)];
    }
    if (field === 'model' && pesanan.kategori_produk && pesanan.produk && pesanan.jenis) {
      const filtered = katalogProduk
        .filter(p => p.kategori_produk === pesanan.kategori_produk && p.produk === pesanan.produk && p.jenis === pesanan.jenis)
        .map(p => p.model);
      return [...new Set(filtered)];
    }
    if (field === 'tipe_desain' && pesanan.kategori_produk && pesanan.produk && pesanan.jenis && pesanan.model) {
      const filtered = katalogProduk
        .filter(p => p.kategori_produk === pesanan.kategori_produk && p.produk === pesanan.produk && p.jenis === pesanan.jenis && p.model === pesanan.model)
        .map(p => p.tipe_desain)
        .filter(t => t);
      return [...new Set(filtered)];
    }
    if (field === 'jenis_kain' && pesanan.toko) {
      const filtered = katalogBahan
        .filter(b => b.nama_toko === pesanan.toko)
        .map(b => b.jenis);
      return [...new Set(filtered)];
    }
    if (field === 'warna' && pesanan.toko && pesanan.jenis_kain) {
      const filtered = katalogBahan
        .filter(b => b.nama_toko === pesanan.toko && b.jenis === pesanan.jenis_kain)
        .map(b => b.warna);
      return [...new Set(filtered)];
    }
    return [];
  }

  function tambahBahanTambahan(pesananId) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          bahan_tambahan: [...p.bahan_tambahan, { id: Date.now(), toko: '', jenis: '', warna: '' }]
        };
      }
      return p;
    }));
  }

  function hapusBahanTambahan(pesananId, bahanId) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          bahan_tambahan: p.bahan_tambahan.filter(b => b.id !== bahanId)
        };
      }
      return p;
    }));
  }

  function updateBahanTambahan(pesananId, bahanId, field, value) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          bahan_tambahan: p.bahan_tambahan.map(b => {
            if (b.id === bahanId) {
              const updated = { ...b, [field]: value };
              if (field === 'toko') {
                updated.jenis = '';
                updated.warna = '';
              } else if (field === 'jenis') {
                updated.warna = '';
              }
              return updated;
            }
            return b;
          })
        };
      }
      return p;
    }));
  }

  function tambahCustomSize(pesananId, jenis) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        const field = `custom_sizes_${jenis}`;
        return {
          ...p,
          [field]: [...p[field], { id: Date.now(), nama: '', jumlah: 0, harga: 0 }]
        };
      }
      return p;
    }));
  }

  function hapusCustomSize(pesananId, jenis, sizeId) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        const field = `custom_sizes_${jenis}`;
        return {
          ...p,
          [field]: p[field].filter(s => s.id !== sizeId)
        };
      }
      return p;
    }));
  }

  function updateCustomSize(pesananId, jenis, sizeId, field, value) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        const fieldName = `custom_sizes_${jenis}`;
        return {
          ...p,
          [fieldName]: p[fieldName].map(s => s.id === sizeId ? { ...s, [field]: value } : s)
        };
      }
      return p;
    }));
  }

  function tambahUkuranLainnya(pesananId) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          ukuran_lainnya: [...p.ukuran_lainnya, { id: Date.now(), nama: '', harga: 0, jumlah: 0 }]
        };
      }
      return p;
    }));
  }

  function hapusUkuranLainnya(pesananId, ukuranId) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          ukuran_lainnya: p.ukuran_lainnya.filter(u => u.id !== ukuranId)
        };
      }
      return p;
    }));
  }

  function updateUkuranLainnya(pesananId, ukuranId, field, value) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          ukuran_lainnya: p.ukuran_lainnya.map(u => u.id === ukuranId ? { ...u, [field]: value } : u)
        };
      }
      return p;
    }));
  }

  function updateUkuran(pesananId, jenis, size, value) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        const field = `ukuran_${jenis}`;
        return {
          ...p,
          [field]: { ...p[field], [size]: parseInt(value) || 0 }
        };
      }
      return p;
    }));
  }

  // Advertising Functions
  function tambahItemAdvertising(pesananId) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          items_advertising: [...(p.items_advertising || []), { id: Date.now(), dimensi: '', harga: 0, jumlah: 0 }]
        };
      }
      return p;
    }));
  }

  function hapusItemAdvertising(pesananId, itemId) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          items_advertising: p.items_advertising.filter(item => item.id !== itemId)
        };
      }
      return p;
    }));
  }

  function updateItemAdvertising(pesananId, itemId, field, value) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          items_advertising: p.items_advertising.map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
          )
        };
      }
      return p;
    }));
  }

  // Jasa/Lainnya Functions
  function tambahItemJasa(pesananId) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          items_jasa: [...(p.items_jasa || []), { id: Date.now(), harga: 0, jumlah: 0, keterangan: '' }]
        };
      }
      return p;
    }));
  }

  function hapusItemJasa(pesananId, itemId) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          items_jasa: p.items_jasa.filter(item => item.id !== itemId)
        };
      }
      return p;
    }));
  }

  function updateItemJasa(pesananId, itemId, field, value) {
    setPesananList(pesananList.map(p => {
      if (p.id === pesananId) {
        return {
          ...p,
          items_jasa: p.items_jasa.map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
          )
        };
      }
      return p;
    }));
  }

  // Biaya Produksi Functions
  function tambahBiayaKain() {
    setBiayaKain([...biayaKain, { id: Date.now(), nama: '', harga: 0, jumlah: 0 }]);
  }

  function updateBiayaKain(id, field, value) {
    setBiayaKain(biayaKain.map(b => {
      if (b.id === id) {
        const updated = { ...b, [field]: value };
        // Auto-fill harga jika nama dipilih dari katalog
        if (field === 'nama' && value) {
          const bahanData = katalogBahan.find(k => 
            `${k.nama_toko} - ${k.jenis} - ${k.warna}` === value
          );
          if (bahanData) {
            updated.harga = bahanData.harga;
          }
        }
        return updated;
      }
      return b;
    }));
  }

  function hapusBiayaKain(id) {
    setBiayaKain(biayaKain.filter(b => b.id !== id));
  }

  function tambahBiayaPercetakan() {
    setBiayaPercetakan([...biayaPercetakan, { id: Date.now(), jenis: '', model: '', tipe: '', harga: 0, jumlah: 0 }]);
  }

  function updateBiayaPercetakan(id, field, value) {
    setBiayaPercetakan(biayaPercetakan.map(b => {
      if (b.id === id) {
        const updated = { ...b, [field]: value };
        if (field === 'jenis') {
          updated.model = '';
          updated.tipe = '';
        } else if (field === 'model') {
          updated.tipe = '';
        }
        // Auto-fill harga jika lengkap
        if (updated.jenis && updated.model && updated.tipe) {
          const cetakData = katalogPercetakan.find(k => 
            k.jenis === updated.jenis && k.model === updated.model && k.tipe_ukuran === updated.tipe
          );
          if (cetakData) {
            updated.harga = cetakData.harga;
          }
        }
        return updated;
      }
      return b;
    }));
  }

  function hapusBiayaPercetakan(id) {
    setBiayaPercetakan(biayaPercetakan.filter(b => b.id !== id));
  }

  function getFilteredPercetakan(item, field) {
    if (field === 'model' && item.jenis) {
      return [...new Set(katalogPercetakan.filter(p => p.jenis === item.jenis).map(p => p.model))];
    }
    if (field === 'tipe' && item.jenis && item.model) {
      return [...new Set(katalogPercetakan.filter(p => p.jenis === item.jenis && p.model === item.model).map(p => p.tipe_ukuran))];
    }
    return [];
  }

  function tambahBiayaJasa() {
    setBiayaJasa([...biayaJasa, { id: Date.now(), jasa: '', jenis: '', tipe: '', harga: 0, jumlah: 0 }]);
  }

  function updateBiayaJasa(id, field, value) {
    setBiayaJasa(biayaJasa.map(b => {
      if (b.id === id) {
        const updated = { ...b, [field]: value };
        if (field === 'jasa') {
          updated.jenis = '';
          updated.tipe = '';
        } else if (field === 'jenis') {
          updated.tipe = '';
        }
        // Auto-fill harga jika lengkap
        if (updated.jasa && updated.jenis && updated.tipe) {
          const jasaData = katalogJasa.find(k => 
            k.jasa === updated.jasa && k.jenis === updated.jenis && k.tipe === updated.tipe
          );
          if (jasaData) {
            updated.harga = jasaData.harga;
          }
        }
        return updated;
      }
      return b;
    }));
  }

  function hapusBiayaJasa(id) {
    setBiayaJasa(biayaJasa.filter(b => b.id !== id));
  }

  function getFilteredJasa(item, field) {
    if (field === 'jenis' && item.jasa) {
      return [...new Set(katalogJasa.filter(j => j.jasa === item.jasa).map(j => j.jenis))];
    }
    if (field === 'tipe' && item.jasa && item.jenis) {
      return [...new Set(katalogJasa.filter(j => j.jasa === item.jasa && j.jenis === item.jenis).map(j => j.tipe))];
    }
    return [];
  }

  // Kalkulasi
  function hitungTotalTagihan() {
    let total = 0;
    
    // Hitung dari pesanan
    pesananList.forEach(pesanan => {
      if (pesanan.kategori_produk === 'Garment') {
        // Lengan Pendek
        if (pesanan.lengan_pendek) {
          const totalPendek = Object.values(pesanan.ukuran_pendek).reduce((sum, val) => sum + val, 0);
          total += totalPendek * (parseFloat(pesanan.harga_satuan_pendek) || 0);
          
          // Custom sizes pendek
          pesanan.custom_sizes_pendek.forEach(cs => {
            total += (parseFloat(cs.jumlah) || 0) * (parseFloat(cs.harga) || 0);
          });
        }
        
        // Lengan Panjang
        if (pesanan.lengan_panjang) {
          const totalPanjang = Object.values(pesanan.ukuran_panjang).reduce((sum, val) => sum + val, 0);
          total += totalPanjang * (parseFloat(pesanan.harga_satuan_panjang) || 0);
          
          // Custom sizes panjang
          pesanan.custom_sizes_panjang.forEach(cs => {
            total += (parseFloat(cs.jumlah) || 0) * (parseFloat(cs.harga) || 0);
          });
        }
        
        // Ukuran Lainnya
        pesanan.ukuran_lainnya.forEach(u => {
          total += (parseFloat(u.jumlah) || 0) * (parseFloat(u.harga) || 0);
        });
      } else if (pesanan.kategori_produk === 'Advertising') {
        // Hitung advertising items
        pesanan.items_advertising?.forEach(item => {
          const dimensi = item.dimensi || '0';
          let dimensiValue = 0;
          if (dimensi.includes('x')) {
            const parts = dimensi.split('x');
            dimensiValue = parseFloat(parts[0] || 0) * parseFloat(parts[1] || 0);
          } else {
            dimensiValue = parseFloat(dimensi || 0);
          }
          const harga = parseFloat(item.harga) || 0;
          const jumlah = parseFloat(item.jumlah) || 0;
          total += dimensiValue * harga * jumlah;
        });
      } else if (pesanan.kategori_produk === 'Jasa' || pesanan.kategori_produk === 'Lainnya') {
        // Hitung jasa items
        pesanan.items_jasa?.forEach(item => {
          const harga = parseFloat(item.harga) || 0;
          const jumlah = parseFloat(item.jumlah) || 0;
          total += harga * jumlah;
        });
      }
    });
    
    return total;
  }

  function hitungTotalBiayaProduksi() {
    let total = 0;
    
    // Kain
    biayaKain.forEach(b => {
      total += (parseFloat(b.harga) || 0) * (parseFloat(b.jumlah) || 0);
    });
    
    // Percetakan
    biayaPercetakan.forEach(b => {
      total += (parseFloat(b.harga) || 0) * (parseFloat(b.jumlah) || 0);
    });
    
    // Jasa
    biayaJasa.forEach(b => {
      total += (parseFloat(b.harga) || 0) * (parseFloat(b.jumlah) || 0);
    });
    
    return total;
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setGambarMockup(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGambarMockupPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation
    if (!dataPemesan.nama || !dataPemesan.nohp || !dataPemesan.alamat) {
      alert('Mohon lengkapi data pemesan');
      return;
    }
    
    if (pesananList.length === 0) {
      alert('Minimal harus ada satu pesanan');
      return;
    }
    
    if (!tanggalPesan || !deadline) {
      alert('Mohon isi tanggal pemesanan dan deadline');
      return;
    }
    
    setSaving(true);
    
    try {
      // Upload gambar mockup jika ada
      let mockupUrl = null;
      if (gambarMockup) {
        const fileName = `mockup_${Date.now()}_${gambarMockup.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('mockup-images')
          .upload(fileName, gambarMockup);
        
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('mockup-images')
            .getPublicUrl(fileName);
          mockupUrl = publicUrl;
        }
      }
      
      // Generate nomor orderan
      const noOrderan = `ORD${Date.now()}`;
      
      const totalTagihan = hitungTotalTagihan();
      const totalBiaya = hitungTotalBiayaProduksi();
      const sisaBayar = totalTagihan - (parseFloat(dp) || 0);
      
      // Prepare order data
      const orderData = {
        no_orderan: noOrderan,
        nama: dataPemesan.nama,
        nohp: dataPemesan.nohp,
        alamat: dataPemesan.alamat,
        jenis_produk: pesananList[0]?.kategori_produk || '',
        desain: pesananList[0]?.produk || '',
        subdesain: pesananList[0]?.jenis || '',
        toko: pesananList[0]?.toko || '',
        jenis_kain: pesananList[0]?.jenis_kain || '',
        warna: pesananList[0]?.warna || '',
        lengan_pendek: pesananList[0]?.lengan_pendek || false,
        lengan_panjang: pesananList[0]?.lengan_panjang || false,
        ukuran_data: { pesanan: pesananList },
        harga_satuan: pesananList[0]?.harga_satuan_pendek || 0,
        dp: parseFloat(dp) || 0,
        total_tagihan: totalTagihan,
        sisa: sisaBayar,
        tanggal_pesan: tanggalPesan,
        deadline: deadline,
        gambar_mockup: mockupUrl,
        items_data: {
          pesanan: pesananList,
          biaya_kain: biayaKain,
          biaya_percetakan: biayaPercetakan,
          biaya_jasa: biayaJasa
        }
      };
      
      // Insert order
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select();
      
      if (orderError) throw orderError;
      
      const orderId = insertedOrder[0].id;
      
      // Insert biaya produksi
      const biayaProduksiData = [];
      
      biayaKain.forEach(b => {
        if (b.nama && b.harga && b.jumlah) {
          biayaProduksiData.push({
            order_id: orderId,
            kategori: 'Kain',
            jenis: b.nama,
            harga: parseFloat(b.harga),
            jumlah: parseFloat(b.jumlah),
            total: parseFloat(b.harga) * parseFloat(b.jumlah)
          });
        }
      });
      
      biayaPercetakan.forEach(b => {
        if (b.jenis && b.harga && b.jumlah) {
          biayaProduksiData.push({
            order_id: orderId,
            kategori: 'Percetakan',
            jenis: `${b.jenis} - ${b.model} - ${b.tipe}`,
            harga: parseFloat(b.harga),
            jumlah: parseFloat(b.jumlah),
            total: parseFloat(b.harga) * parseFloat(b.jumlah)
          });
        }
      });
      
      biayaJasa.forEach(b => {
        if (b.jasa && b.harga && b.jumlah) {
          biayaProduksiData.push({
            order_id: orderId,
            kategori: 'Jasa',
            jenis: `${b.jasa} - ${b.jenis} - ${b.tipe}`,
            harga: parseFloat(b.harga),
            jumlah: parseFloat(b.jumlah),
            total: parseFloat(b.harga) * parseFloat(b.jumlah)
          });
        }
      });
      
      if (biayaProduksiData.length > 0) {
        const { error: biayaError } = await supabase
          .from('biaya_produksi')
          .insert(biayaProduksiData);
        
        if (biayaError) {
          console.error('Error inserting biaya produksi:', biayaError);
        }
      }
      
      alert('Order berhasil disimpan!');
      router.push('/');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Gagal menyimpan order: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-sky-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat form order...</p>
        </div>
      </div>
    );
  }

  const totalTagihan = hitungTotalTagihan();
  const totalBiayaProduksi = hitungTotalBiayaProduksi();
  const sisaBayar = totalTagihan - (parseFloat(dp) || 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-500 p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <ClipboardList className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Tambah Order Baru</h1>
            <p className="text-sky-100 mt-1">Isi form di bawah untuk membuat order baru</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Pemesan */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-600 rounded-lg">
                <User className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>Data Pemesan</CardTitle>
                <CardDescription>Informasi lengkap pemesan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="nama" className="text-base font-semibold">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input
                id="nama"
                value={dataPemesan.nama}
                onChange={(e) => setDataPemesan({ ...dataPemesan, nama: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="nohp" className="text-base font-semibold">No HP/WhatsApp <span className="text-red-500">*</span></Label>
              <Input
                id="nohp"
                value={dataPemesan.nohp}
                onChange={(e) => setDataPemesan({ ...dataPemesan, nohp: e.target.value })}
                placeholder="Contoh: 081234567890"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="alamat" className="text-base font-semibold">Alamat Lengkap <span className="text-red-500">*</span></Label>
              <Textarea
                id="alamat"
                value={dataPemesan.alamat}
                onChange={(e) => setDataPemesan({ ...dataPemesan, alamat: e.target.value })}
                placeholder="Contoh: Jl. Mawar No. 10, Jakarta Selatan"
                required
                rows={3}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Pesanan */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Package className="text-white" size={20} />
                </div>
                <div>
                  <CardTitle>Data Pesanan</CardTitle>
                  <CardDescription>Detail produk yang dipesan</CardDescription>
                </div>
              </div>
              <Button type="button" onClick={tambahPesanan} variant="outline" size="sm">
                <Plus size={16} className="mr-2" />
                Tambah Pesanan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {pesananList.map((pesanan, index) => (
              <div key={pesanan.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-sky-600 text-white rounded-full text-sm">
                      {index + 1}
                    </span>
                    Pesanan #{index + 1}
                  </h3>
                  {pesananList.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => hapusPesanan(pesanan.id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Hapus
                    </Button>
                  )}
                </div>

                {/* Kategori Produk */}
                <div className="space-y-4">
                  <div className="bg-sky-100 p-4 rounded-lg border-l-4 border-sky-600">
                    <Label className="text-base font-semibold mb-2 block">Kategori Produk <span className="text-red-500">*</span></Label>
                    <Select
                      value={pesanan.kategori_produk}
                      onValueChange={(value) => updatePesanan(pesanan.id, 'kategori_produk', value)}
                      required
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Pilih kategori produk..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Garment">Garment</SelectItem>
                        <SelectItem value="Advertising">Advertising</SelectItem>
                        <SelectItem value="Jasa">Jasa</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 mt-2">Pilih kategori untuk menampilkan form yang sesuai</p>
                  </div>

                  {/* Detail Pesanan - Garment */}
                  {pesanan.kategori_produk === 'Garment' && (
                    <GarmentForm
                      pesanan={pesanan}
                      updatePesanan={updatePesanan}
                      getFilteredOptions={getFilteredOptions}
                      daftarToko={daftarToko}
                      tambahBahanTambahan={tambahBahanTambahan}
                      hapusBahanTambahan={hapusBahanTambahan}
                      updateBahanTambahan={updateBahanTambahan}
                      updateUkuran={updateUkuran}
                      tambahCustomSize={tambahCustomSize}
                      hapusCustomSize={hapusCustomSize}
                      updateCustomSize={updateCustomSize}
                      tambahUkuranLainnya={tambahUkuranLainnya}
                      hapusUkuranLainnya={hapusUkuranLainnya}
                      updateUkuranLainnya={updateUkuranLainnya}
                    />
                  )}

                  {/* Detail Pesanan - Advertising */}
                  {pesanan.kategori_produk === 'Advertising' && (
                    <AdvertisingForm
                      pesanan={pesanan}
                      updatePesanan={updatePesanan}
                      getFilteredOptions={getFilteredOptions}
                      tambahItemAdvertising={tambahItemAdvertising}
                      hapusItemAdvertising={hapusItemAdvertising}
                      updateItemAdvertising={updateItemAdvertising}
                    />
                  )}

                  {/* Detail Pesanan - Jasa */}
                  {pesanan.kategori_produk === 'Jasa' && (
                    <JasaForm
                      pesanan={pesanan}
                      updatePesanan={updatePesanan}
                      getFilteredOptions={getFilteredOptions}
                      tambahItemJasa={tambahItemJasa}
                      hapusItemJasa={hapusItemJasa}
                      updateItemJasa={updateItemJasa}
                    />
                  )}

                  {/* Detail Pesanan - Lainnya */}
                  {pesanan.kategori_produk === 'Lainnya' && (
                    <LainnyaForm
                      pesanan={pesanan}
                      updatePesanan={updatePesanan}
                      getFilteredOptions={getFilteredOptions}
                      tambahItemJasa={tambahItemJasa}
                      hapusItemJasa={hapusItemJasa}
                      updateItemJasa={updateItemJasa}
                    />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Biaya Produksi */}
        <BiayaProduksiSection
          biayaKain={biayaKain}
          biayaPercetakan={biayaPercetakan}
          biayaJasa={biayaJasa}
          katalogBahan={katalogBahan}
          tambahBiayaKain={tambahBiayaKain}
          updateBiayaKain={updateBiayaKain}
          hapusBiayaKain={hapusBiayaKain}
          tambahBiayaPercetakan={tambahBiayaPercetakan}
          updateBiayaPercetakan={updateBiayaPercetakan}
          hapusBiayaPercetakan={hapusBiayaPercetakan}
          getFilteredPercetakan={getFilteredPercetakan}
          katalogPercetakan={katalogPercetakan}
          tambahBiayaJasa={tambahBiayaJasa}
          updateBiayaJasa={updateBiayaJasa}
          hapusBiayaJasa={hapusBiayaJasa}
          getFilteredJasa={getFilteredJasa}
          katalogJasa={katalogJasa}
        />

        {/* Pembayaran & Jadwal */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Calendar className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>Pembayaran & Jadwal</CardTitle>
                <CardDescription>Informasi pembayaran dan tenggat waktu</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="dp" className="text-base font-semibold">DP (Rp) <span className="text-red-500">*</span></Label>
              <Input
                id="dp"
                type="number"
                value={dp}
                onChange={(e) => setDp(e.target.value)}
                placeholder="0"
                min="0"
                required
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tanggal_pesan" className="text-base font-semibold">Tanggal Pemesanan <span className="text-red-500">*</span></Label>
                <Input
                  id="tanggal_pesan"
                  type="date"
                  value={tanggalPesan}
                  onChange={(e) => setTanggalPesan(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="deadline" className="text-base font-semibold">Deadline <span className="text-red-500">*</span></Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mockup" className="text-base font-semibold">Gambar Mockup</Label>
              <Input
                id="mockup"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
              />
              {gambarMockupPreview && (
                <div className="mt-4">
                  <img
                    src={gambarMockupPreview}
                    alt="Preview mockup"
                    className="max-w-xs rounded-lg border-2 border-gray-200 shadow-md"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ringkasan Order */}
        <RingkasanOrder
          dataPemesan={dataPemesan}
          pesananList={pesananList}
          biayaKain={biayaKain}
          biayaPercetakan={biayaPercetakan}
          biayaJasa={biayaJasa}
          dp={dp}
          tanggalPesan={tanggalPesan}
          deadline={deadline}
          totalTagihan={totalTagihan}
          totalBiayaProduksi={totalBiayaProduksi}
          sisaBayar={sisaBayar}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
            disabled={saving}
          >
            <ArrowLeft size={18} className="mr-2" />
            Kembali
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 min-w-[150px]"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
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

// Garment Form Component
function GarmentForm({
  pesanan,
  updatePesanan,
  getFilteredOptions,
  daftarToko,
  tambahBahanTambahan,
  hapusBahanTambahan,
  updateBahanTambahan,
  updateUkuran,
  tambahCustomSize,
  hapusCustomSize,
  updateCustomSize,
  tambahUkuranLainnya,
  hapusUkuranLainnya,
  updateUkuranLainnya
}) {
  const produkOptions = getFilteredOptions(pesanan, 'produk');
  const jenisOptions = getFilteredOptions(pesanan, 'jenis');
  const modelOptions = getFilteredOptions(pesanan, 'model');
  const tipeOptions = getFilteredOptions(pesanan, 'tipe_desain');
  const jenisKainOptions = getFilteredOptions(pesanan, 'jenis_kain');
  const warnaOptions = getFilteredOptions(pesanan, 'warna');

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border">
      {/* Detail Produk */}
      <div>
        <Label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide">Detail Produk</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm mb-1 block">Jenis <span className="text-red-500">*</span></Label>
            <SmartSelect
              value={pesanan.produk}
              onChange={(value) => updatePesanan(pesanan.id, 'produk', value)}
              options={produkOptions}
              placeholder="Pilih produk..."
              required
            />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Model <span className="text-red-500">*</span></Label>
            <SmartSelect
              value={pesanan.jenis}
              onChange={(value) => updatePesanan(pesanan.id, 'jenis', value)}
              options={jenisOptions}
              placeholder="Pilih jenis..."
              required
              disabled={!pesanan.produk}
            />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Tipe/Desain</Label>
            <SmartSelect
              value={pesanan.model}
              onChange={(value) => updatePesanan(pesanan.id, 'model', value)}
              options={modelOptions}
              placeholder="Pilih model..."
              disabled={!pesanan.jenis}
            />
          </div>
        </div>
      </div>

      {/* Bahan Utama */}
      <div>
        <Label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide">Bahan Utama</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm mb-1 block">Toko <span className="text-red-500">*</span></Label>
            <SmartSelect
              value={pesanan.toko}
              onChange={(value) => updatePesanan(pesanan.id, 'toko', value)}
              options={daftarToko}
              placeholder="Pilih toko..."
              required
            />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Jenis Kain <span className="text-red-500">*</span></Label>
            <SmartSelect
              value={pesanan.jenis_kain}
              onChange={(value) => updatePesanan(pesanan.id, 'jenis_kain', value)}
              options={jenisKainOptions}
              placeholder="Pilih jenis kain..."
              required
              disabled={!pesanan.toko}
            />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Warna <span className="text-red-500">*</span></Label>
            <SmartSelect
              value={pesanan.warna}
              onChange={(value) => updatePesanan(pesanan.id, 'warna', value)}
              options={warnaOptions}
              placeholder="Pilih warna..."
              required
              disabled={!pesanan.jenis_kain}
            />
          </div>
        </div>
      </div>

      {/* Bahan Tambahan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Bahan Tambahan</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => tambahBahanTambahan(pesanan.id)}
          >
            <Plus size={14} className="mr-1" />
            Tambah
          </Button>
        </div>
        {pesanan.bahan_tambahan && pesanan.bahan_tambahan.length > 0 ? (
          <div className="space-y-3">
            {pesanan.bahan_tambahan.map((bahan) => {
              const jenisKainTambahanOptions = bahan.toko ? getFilteredOptions({ toko: bahan.toko }, 'jenis_kain') : [];
              const warnaTambahanOptions = bahan.toko && bahan.jenis ? getFilteredOptions({ toko: bahan.toko, jenis_kain: bahan.jenis }, 'warna') : [];
              
              return (
                <div key={bahan.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg border">
                  <SmartSelect
                    value={bahan.toko}
                    onChange={(value) => updateBahanTambahan(pesanan.id, bahan.id, 'toko', value)}
                    options={daftarToko}
                    placeholder="Toko..."
                  />
                  <SmartSelect
                    value={bahan.jenis}
                    onChange={(value) => updateBahanTambahan(pesanan.id, bahan.id, 'jenis', value)}
                    options={jenisKainTambahanOptions}
                    placeholder="Jenis..."
                    disabled={!bahan.toko}
                  />
                  <SmartSelect
                    value={bahan.warna}
                    onChange={(value) => updateBahanTambahan(pesanan.id, bahan.id, 'warna', value)}
                    options={warnaTambahanOptions}
                    placeholder="Warna..."
                    disabled={!bahan.jenis}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => hapusBahanTambahan(pesanan.id, bahan.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Belum ada bahan tambahan</p>
        )}
      </div>

      {/* Ukuran */}
      <div>
        <Label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide">Ukuran</Label>
        
        {/* Checkboxes */}
        <div className="flex gap-6 mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`lengan-pendek-${pesanan.id}`}
              checked={pesanan.lengan_pendek}
              onCheckedChange={(checked) => updatePesanan(pesanan.id, 'lengan_pendek', checked)}
            />
            <Label htmlFor={`lengan-pendek-${pesanan.id}`} className="cursor-pointer font-semibold">Lengan Pendek</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`lengan-panjang-${pesanan.id}`}
              checked={pesanan.lengan_panjang}
              onCheckedChange={(checked) => updatePesanan(pesanan.id, 'lengan_panjang', checked)}
            />
            <Label htmlFor={`lengan-panjang-${pesanan.id}`} className="cursor-pointer font-semibold">Lengan Panjang</Label>
          </div>
        </div>

        {/* Lengan Pendek */}
        {pesanan.lengan_pendek && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <Label className="font-semibold text-blue-900">Ukuran Lengan Pendek</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => tambahCustomSize(pesanan.id, 'pendek')}
              >
                <Plus size={14} className="mr-1" />
                Custom
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                <div key={size}>
                  <Label className="text-xs mb-1 block text-center font-bold">{size}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={pesanan.ukuran_pendek[size]}
                    onChange={(e) => updateUkuran(pesanan.id, 'pendek', size, e.target.value)}
                    className="text-center"
                  />
                </div>
              ))}
            </div>
            
            {/* Custom Sizes Pendek */}
            {pesanan.custom_sizes_pendek && pesanan.custom_sizes_pendek.length > 0 && (
              <div className="mt-3 space-y-2">
                {pesanan.custom_sizes_pendek.map(cs => (
                  <div key={cs.id} className="grid grid-cols-4 gap-2 p-2 bg-white rounded border">
                    <Input
                      placeholder="Nama"
                      value={cs.nama}
                      onChange={(e) => updateCustomSize(pesanan.id, 'pendek', cs.id, 'nama', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Jumlah"
                      min="0"
                      value={cs.jumlah}
                      onChange={(e) => updateCustomSize(pesanan.id, 'pendek', cs.id, 'jumlah', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Harga"
                      min="0"
                      value={cs.harga}
                      onChange={(e) => updateCustomSize(pesanan.id, 'pendek', cs.id, 'harga', e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => hapusCustomSize(pesanan.id, 'pendek', cs.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lengan Panjang */}
        {pesanan.lengan_panjang && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <Label className="font-semibold text-green-900">Ukuran Lengan Panjang</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => tambahCustomSize(pesanan.id, 'panjang')}
              >
                <Plus size={14} className="mr-1" />
                Custom
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                <div key={size}>
                  <Label className="text-xs mb-1 block text-center font-bold">{size}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={pesanan.ukuran_panjang[size]}
                    onChange={(e) => updateUkuran(pesanan.id, 'panjang', size, e.target.value)}
                    className="text-center"
                  />
                </div>
              ))}
            </div>
            
            {/* Custom Sizes Panjang */}
            {pesanan.custom_sizes_panjang && pesanan.custom_sizes_panjang.length > 0 && (
              <div className="mt-3 space-y-2">
                {pesanan.custom_sizes_panjang.map(cs => (
                  <div key={cs.id} className="grid grid-cols-4 gap-2 p-2 bg-white rounded border">
                    <Input
                      placeholder="Nama"
                      value={cs.nama}
                      onChange={(e) => updateCustomSize(pesanan.id, 'panjang', cs.id, 'nama', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Jumlah"
                      min="0"
                      value={cs.jumlah}
                      onChange={(e) => updateCustomSize(pesanan.id, 'panjang', cs.id, 'jumlah', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Harga"
                      min="0"
                      value={cs.harga}
                      onChange={(e) => updateCustomSize(pesanan.id, 'panjang', cs.id, 'harga', e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => hapusCustomSize(pesanan.id, 'panjang', cs.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ukuran Lainnya */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Ukuran Lainnya</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => tambahUkuranLainnya(pesanan.id)}
          >
            <Plus size={14} className="mr-1" />
            Tambah
          </Button>
        </div>
        {pesanan.ukuran_lainnya && pesanan.ukuran_lainnya.length > 0 ? (
          <div className="space-y-2">
            {pesanan.ukuran_lainnya.map(ukuran => (
              <div key={ukuran.id} className="grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded border">
                <Input
                  placeholder="Nama Ukuran"
                  value={ukuran.nama}
                  onChange={(e) => updateUkuranLainnya(pesanan.id, ukuran.id, 'nama', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Jumlah"
                  min="0"
                  value={ukuran.jumlah}
                  onChange={(e) => updateUkuranLainnya(pesanan.id, ukuran.id, 'jumlah', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Harga"
                  min="0"
                  value={ukuran.harga}
                  onChange={(e) => updateUkuranLainnya(pesanan.id, ukuran.id, 'harga', e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => hapusUkuranLainnya(pesanan.id, ukuran.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Belum ada ukuran lainnya</p>
        )}
      </div>

      {/* Harga Satuan */}
      <div>
        <Label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide">Harga Satuan</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-1 block">Harga Satuan Lengan Pendek (Rp)</Label>
            <Input
              type="number"
              min="0"
              value={pesanan.harga_satuan_pendek}
              onChange={(e) => updatePesanan(pesanan.id, 'harga_satuan_pendek', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Harga Satuan Lengan Panjang (Rp)</Label>
            <Input
              type="number"
              min="0"
              value={pesanan.harga_satuan_panjang}
              onChange={(e) => updatePesanan(pesanan.id, 'harga_satuan_panjang', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Advertising Form Component
function AdvertisingForm({
  pesanan,
  updatePesanan,
  getFilteredOptions,
  tambahItemAdvertising,
  hapusItemAdvertising,
  updateItemAdvertising
}) {
  const produkOptions = getFilteredOptions(pesanan, 'produk');
  const jenisOptions = getFilteredOptions(pesanan, 'jenis');
  const modelOptions = getFilteredOptions(pesanan, 'model');

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border">
      {/* Detail Produk */}
      <div>
        <Label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide">Detail Produk</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm mb-1 block">Jenis <span className="text-red-500">*</span></Label>
            <SmartSelect
              value={pesanan.produk}
              onChange={(value) => updatePesanan(pesanan.id, 'produk', value)}
              options={produkOptions}
              placeholder="Pilih Jenis..."
              required
            />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Model <span className="text-red-500">*</span></Label>
            <SmartSelect
              value={pesanan.jenis}
              onChange={(value) => updatePesanan(pesanan.id, 'jenis', value)}
              options={jenisOptions}
              placeholder="Pilih Model..."
              required
              disabled={!pesanan.produk}
            />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Tipe/Desain</Label>
            <SmartSelect
              value={pesanan.model}
              onChange={(value) => updatePesanan(pesanan.id, 'model', value)}
              options={modelOptions}
              placeholder="Pilih Tipe/Desain..."
              disabled={!pesanan.jenis}
            />
          </div>
        </div>
      </div>

      {/* Detail Pesanan Advertising */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Detail Pesanan Advertising</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => tambahItemAdvertising(pesanan.id)}
          >
            <Plus size={14} className="mr-1" />
            Tambah Item
          </Button>
        </div>
        {pesanan.items_advertising && pesanan.items_advertising.length > 0 ? (
          <div className="space-y-2">
            {pesanan.items_advertising.map(item => (
              <div key={item.id} className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg border">
                <Input
                  placeholder="Dimensi (misal: 2x3)"
                  value={item.dimensi}
                  onChange={(e) => updateItemAdvertising(pesanan.id, item.id, 'dimensi', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Harga per m²"
                  min="0"
                  value={item.harga}
                  onChange={(e) => updateItemAdvertising(pesanan.id, item.id, 'harga', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Jumlah"
                  min="0"
                  value={item.jumlah}
                  onChange={(e) => updateItemAdvertising(pesanan.id, item.id, 'jumlah', e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => hapusItemAdvertising(pesanan.id, item.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Belum ada item advertising</p>
        )}
      </div>
    </div>
  );
}

// Jasa Form Component
function JasaForm({
  pesanan,
  updatePesanan,
  getFilteredOptions,
  tambahItemJasa,
  hapusItemJasa,
  updateItemJasa
}) {
  const produkOptions = getFilteredOptions(pesanan, 'produk');
  const jenisOptions = getFilteredOptions(pesanan, 'jenis');
  const modelOptions = getFilteredOptions(pesanan, 'model');

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border">
      {/* Detail Produk */}
      <div>
        <Label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide">Detail Produk</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm mb-1 block">Jenis <span className="text-red-500">*</span></Label>
            <SmartSelect
              value={pesanan.produk}
              onChange={(value) => updatePesanan(pesanan.id, 'produk', value)}
              options={produkOptions}
              placeholder="Pilih Jenis..."
              required
            />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Model <span className="text-red-500">*</span></Label>
            <SmartSelect
              value={pesanan.jenis}
              onChange={(value) => updatePesanan(pesanan.id, 'jenis', value)}
              options={jenisOptions}
              placeholder="Pilih Model..."
              required
              disabled={!pesanan.produk}
            />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Tipe/Desain</Label>
            <SmartSelect
              value={pesanan.model}
              onChange={(value) => updatePesanan(pesanan.id, 'model', value)}
              options={modelOptions}
              placeholder="Pilih Tipe/Desain..."
              disabled={!pesanan.jenis}
            />
          </div>
        </div>
      </div>

      {/* Detail Pesanan Jasa */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Detail Pesanan Jasa</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => tambahItemJasa(pesanan.id)}
          >
            <Plus size={14} className="mr-1" />
            Tambah Item
          </Button>
        </div>
        {pesanan.items_jasa && pesanan.items_jasa.length > 0 ? (
          <div className="space-y-2">
            {pesanan.items_jasa.map(item => (
              <div key={item.id} className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg border">
                <Input
                  placeholder="Keterangan"
                  value={item.keterangan || ''}
                  onChange={(e) => updateItemJasa(pesanan.id, item.id, 'keterangan', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Harga"
                  min="0"
                  value={item.harga}
                  onChange={(e) => updateItemJasa(pesanan.id, item.id, 'harga', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Jumlah"
                  min="0"
                  value={item.jumlah}
                  onChange={(e) => updateItemJasa(pesanan.id, item.id, 'jumlah', e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => hapusItemJasa(pesanan.id, item.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Belum ada item jasa</p>
        )}
      </div>
    </div>
  );
}

// Lainnya Form Component (sama dengan Jasa)
function LainnyaForm(props) {
  return <JasaForm {...props} />;
}

// Biaya Produksi Section
function BiayaProduksiSection({
  biayaKain,
  biayaPercetakan,
  biayaJasa,
  katalogBahan,
  tambahBiayaKain,
  updateBiayaKain,
  hapusBiayaKain,
  tambahBiayaPercetakan,
  updateBiayaPercetakan,
  hapusBiayaPercetakan,
  getFilteredPercetakan,
  katalogPercetakan,
  tambahBiayaJasa,
  updateBiayaJasa,
  hapusBiayaJasa,
  getFilteredJasa,
  katalogJasa
}) {
  const jenisCetakOptions = [...new Set(katalogPercetakan.map(p => p.jenis))];
  const jenisJasaOptions = [...new Set(katalogJasa.map(j => j.jasa))];
  
  // Create options for kain dropdown
  const kainOptions = katalogBahan.map(b => `${b.nama_toko} - ${b.jenis} - ${b.warna}`);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-lg">
            <DollarSign className="text-white" size={20} />
          </div>
          <div>
            <CardTitle>Biaya Produksi</CardTitle>
            <CardDescription>Rincian biaya kain, percetakan, dan jasa</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Keterangan Info */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg flex gap-3">
          <Info className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Keterangan:</p>
            <p>Data biaya produksi dapat dipilih dari katalog atau diisi manual. Anda dapat mengedit harga dan jumlah sesuai kebutuhan tanpa mengubah data di katalog.</p>
          </div>
        </div>

        {/* Kain */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-bold">Kain/Bahan</Label>
            <Button type="button" size="sm" variant="outline" onClick={tambahBiayaKain}>
              <Plus size={14} className="mr-1" />
              Tambah Kain
            </Button>
          </div>
          {biayaKain.length > 0 ? (
            <div className="space-y-2">
              {biayaKain.map(item => (
                <div key={item.id} className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg border">
                  <SmartSelect
                    value={item.nama}
                    onChange={(value) => updateBiayaKain(item.id, 'nama', value)}
                    options={kainOptions}
                    placeholder="Pilih/Tulis Nama Kain..."
                  />
                  <Input
                    type="number"
                    placeholder="Harga (Rp)"
                    min="0"
                    value={item.harga}
                    onChange={(e) => updateBiayaKain(item.id, 'harga', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Jumlah (kg)"
                    min="0"
                    step="0.1"
                    value={item.jumlah}
                    onChange={(e) => updateBiayaKain(item.id, 'jumlah', e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => hapusBiayaKain(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Belum ada biaya kain</p>
          )}
        </div>

        {/* Percetakan */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-bold">Percetakan</Label>
            <Button type="button" size="sm" variant="outline" onClick={tambahBiayaPercetakan}>
              <Plus size={14} className="mr-1" />
              Tambah Percetakan
            </Button>
          </div>
          {biayaPercetakan.length > 0 ? (
            <div className="space-y-2">
              {biayaPercetakan.map(item => {
                const modelOptions = getFilteredPercetakan(item, 'model');
                const tipeOptions = getFilteredPercetakan(item, 'tipe');
                
                return (
                  <div key={item.id} className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-lg border">
                    <SmartSelect
                      value={item.jenis}
                      onChange={(value) => updateBiayaPercetakan(item.id, 'jenis', value)}
                      options={jenisCetakOptions}
                      placeholder="Jenis..."
                    />
                    <SmartSelect
                      value={item.model}
                      onChange={(value) => updateBiayaPercetakan(item.id, 'model', value)}
                      options={modelOptions}
                      placeholder="Model..."
                      disabled={!item.jenis}
                    />
                    <SmartSelect
                      value={item.tipe}
                      onChange={(value) => updateBiayaPercetakan(item.id, 'tipe', value)}
                      options={tipeOptions}
                      placeholder="Tipe..."
                      disabled={!item.model}
                    />
                    <Input
                      type="number"
                      placeholder="Harga"
                      min="0"
                      value={item.harga}
                      onChange={(e) => updateBiayaPercetakan(item.id, 'harga', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Jumlah"
                      min="0"
                      value={item.jumlah}
                      onChange={(e) => updateBiayaPercetakan(item.id, 'jumlah', e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => hapusBiayaPercetakan(item.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Belum ada biaya percetakan</p>
          )}
        </div>

        {/* Jasa */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-bold">Jasa</Label>
            <Button type="button" size="sm" variant="outline" onClick={tambahBiayaJasa}>
              <Plus size={14} className="mr-1" />
              Tambah Jasa
            </Button>
          </div>
          {biayaJasa.length > 0 ? (
            <div className="space-y-2">
              {biayaJasa.map(item => {
                const jenisOptions = getFilteredJasa(item, 'jenis');
                const tipeOptions = getFilteredJasa(item, 'tipe');
                
                return (
                  <div key={item.id} className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-lg border">
                    <SmartSelect
                      value={item.jasa}
                      onChange={(value) => updateBiayaJasa(item.id, 'jasa', value)}
                      options={jenisJasaOptions}
                      placeholder="Jasa..."
                    />
                    <SmartSelect
                      value={item.jenis}
                      onChange={(value) => updateBiayaJasa(item.id, 'jenis', value)}
                      options={jenisOptions}
                      placeholder="Jenis..."
                      disabled={!item.jasa}
                    />
                    <SmartSelect
                      value={item.tipe}
                      onChange={(value) => updateBiayaJasa(item.id, 'tipe', value)}
                      options={tipeOptions}
                      placeholder="Tipe..."
                      disabled={!item.jenis}
                    />
                    <Input
                      type="number"
                      placeholder="Harga"
                      min="0"
                      value={item.harga}
                      onChange={(e) => updateBiayaJasa(item.id, 'harga', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Jumlah"
                      min="0"
                      value={item.jumlah}
                      onChange={(e) => updateBiayaJasa(item.id, 'jumlah', e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => hapusBiayaJasa(item.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Belum ada biaya jasa</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Ringkasan Order Component
function RingkasanOrder({
  dataPemesan,
  pesananList,
  biayaKain,
  biayaPercetakan,
  biayaJasa,
  dp,
  tanggalPesan,
  deadline,
  totalTagihan,
  totalBiayaProduksi,
  sisaBayar
}) {
  return (
    <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200">
      <CardHeader>
        <CardTitle className="text-2xl">Ringkasan Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Pemesan */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-lg mb-3 text-gray-800">Data Pemesan</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Nama:</span> {dataPemesan.nama || '-'}</p>
            <p><span className="font-semibold">No HP:</span> {dataPemesan.nohp || '-'}</p>
            <p><span className="font-semibold">Alamat:</span> {dataPemesan.alamat || '-'}</p>
          </div>
        </div>

        {/* Detail Pesanan */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-lg mb-3 text-gray-800">Detail Pesanan ({pesananList.length} item)</h3>
          <div className="space-y-4">
            {pesananList.map((pesanan, index) => {
              let subtotal = 0;
              
              return (
                <div key={pesanan.id} className="border-l-4 border-sky-500 pl-4 py-2">
                  <p className="font-semibold text-sky-700">Pesanan #{index + 1}: {pesanan.kategori_produk || '-'}</p>
                  
                  {pesanan.kategori_produk === 'Garment' && (
                    <div className="text-sm mt-2 space-y-1">
                      <p><span className="font-medium">Detail:</span> {pesanan.produk || '-'} / {pesanan.jenis || '-'} / {pesanan.model || '-'}</p>
                      <p><span className="font-medium">Bahan:</span> {pesanan.toko || '-'} / {pesanan.jenis_kain || '-'} / {pesanan.warna || '-'}</p>
                      
                      {/* Ukuran Pendek */}
                      {pesanan.lengan_pendek && (() => {
                        const totalPendek = Object.values(pesanan.ukuran_pendek).reduce((sum, val) => sum + val, 0);
                        const hargaPendek = parseFloat(pesanan.harga_satuan_pendek) || 0;
                        const subtotalPendek = totalPendek * hargaPendek;
                        subtotal += subtotalPendek;
                        
                        let customSubtotal = 0;
                        pesanan.custom_sizes_pendek?.forEach(cs => {
                          const csTotal = (parseFloat(cs.jumlah) || 0) * (parseFloat(cs.harga) || 0);
                          customSubtotal += csTotal;
                        });
                        subtotal += customSubtotal;
                        
                        return (
                          <p><span className="font-medium">Lengan Pendek:</span> {totalPendek} pcs @ {formatRupiah(hargaPendek)} = {formatRupiah(subtotalPendek + customSubtotal)}</p>
                        );
                      })()}
                      
                      {/* Ukuran Panjang */}
                      {pesanan.lengan_panjang && (() => {
                        const totalPanjang = Object.values(pesanan.ukuran_panjang).reduce((sum, val) => sum + val, 0);
                        const hargaPanjang = parseFloat(pesanan.harga_satuan_panjang) || 0;
                        const subtotalPanjang = totalPanjang * hargaPanjang;
                        subtotal += subtotalPanjang;
                        
                        let customSubtotal = 0;
                        pesanan.custom_sizes_panjang?.forEach(cs => {
                          const csTotal = (parseFloat(cs.jumlah) || 0) * (parseFloat(cs.harga) || 0);
                          customSubtotal += csTotal;
                        });
                        subtotal += customSubtotal;
                        
                        return (
                          <p><span className="font-medium">Lengan Panjang:</span> {totalPanjang} pcs @ {formatRupiah(hargaPanjang)} = {formatRupiah(subtotalPanjang + customSubtotal)}</p>
                        );
                      })()}
                      
                      {/* Ukuran Lainnya */}
                      {pesanan.ukuran_lainnya && pesanan.ukuran_lainnya.length > 0 && (() => {
                        let lainnyaTotal = 0;
                        pesanan.ukuran_lainnya.forEach(u => {
                          lainnyaTotal += (parseFloat(u.jumlah) || 0) * (parseFloat(u.harga) || 0);
                        });
                        subtotal += lainnyaTotal;
                        return <p><span className="font-medium">Ukuran Lainnya:</span> {formatRupiah(lainnyaTotal)}</p>;
                      })()}
                      
                      <p className="font-semibold text-sky-600">Subtotal: {formatRupiah(subtotal)}</p>
                    </div>
                  )}
                  
                  {pesanan.kategori_produk === 'Advertising' && (
                    <div className="text-sm mt-2 space-y-1">
                      <p><span className="font-medium">Detail:</span> {pesanan.produk || '-'} / {pesanan.jenis || '-'} / {pesanan.model || '-'}</p>
                      {pesanan.items_advertising && pesanan.items_advertising.length > 0 && (
                        <div>
                          <p className="font-medium">Items:</p>
                          <ul className="ml-4 list-disc">
                            {pesanan.items_advertising.map(item => {
                              const dimensi = item.dimensi || '0';
                              let dimensiValue = 0;
                              if (dimensi.includes('x')) {
                                const parts = dimensi.split('x');
                                dimensiValue = parseFloat(parts[0] || 0) * parseFloat(parts[1] || 0);
                              } else {
                                dimensiValue = parseFloat(dimensi || 0);
                              }
                              const harga = parseFloat(item.harga) || 0;
                              const jumlah = parseFloat(item.jumlah) || 0;
                              const itemTotal = dimensiValue * harga * jumlah;
                              subtotal += itemTotal;
                              
                              return (
                                <li key={item.id}>{dimensi} x {formatRupiah(harga)} x {jumlah} = {formatRupiah(itemTotal)}</li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      <p className="font-semibold text-sky-600">Subtotal: {formatRupiah(subtotal)}</p>
                    </div>
                  )}
                  
                  {(pesanan.kategori_produk === 'Jasa' || pesanan.kategori_produk === 'Lainnya') && (
                    <div className="text-sm mt-2 space-y-1">
                      <p><span className="font-medium">Detail:</span> {pesanan.produk || '-'} / {pesanan.jenis || '-'} / {pesanan.model || '-'}</p>
                      {pesanan.items_jasa && pesanan.items_jasa.length > 0 && (
                        <div>
                          <p className="font-medium">Items:</p>
                          <ul className="ml-4 list-disc">
                            {pesanan.items_jasa.map(item => {
                              const harga = parseFloat(item.harga) || 0;
                              const jumlah = parseFloat(item.jumlah) || 0;
                              const itemTotal = harga * jumlah;
                              subtotal += itemTotal;
                              
                              return (
                                <li key={item.id}>{item.keterangan || 'Item'}: {formatRupiah(harga)} x {jumlah} = {formatRupiah(itemTotal)}</li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      <p className="font-semibold text-sky-600">Subtotal: {formatRupiah(subtotal)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Biaya Produksi */}
        {(biayaKain.length > 0 || biayaPercetakan.length > 0 || biayaJasa.length > 0) && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-3 text-gray-800">Biaya Produksi</h3>
            <div className="text-sm space-y-2">
              {biayaKain.map(item => {
                const total = (parseFloat(item.harga) || 0) * (parseFloat(item.jumlah) || 0);
                return (
                  <p key={item.id}><span className="font-medium">Kain:</span> {item.nama} - {formatRupiah(item.harga)} x {item.jumlah} = {formatRupiah(total)}</p>
                );
              })}
              {biayaPercetakan.map(item => {
                const total = (parseFloat(item.harga) || 0) * (parseFloat(item.jumlah) || 0);
                return (
                  <p key={item.id}><span className="font-medium">Percetakan:</span> {item.jenis} {item.model} {item.tipe} - {formatRupiah(item.harga)} x {item.jumlah} = {formatRupiah(total)}</p>
                );
              })}
              {biayaJasa.map(item => {
                const total = (parseFloat(item.harga) || 0) * (parseFloat(item.jumlah) || 0);
                return (
                  <p key={item.id}><span className="font-medium">Jasa:</span> {item.jasa} {item.jenis} {item.tipe} - {formatRupiah(item.harga)} x {item.jumlah} = {formatRupiah(total)}</p>
                );
              })}
              <p className="font-semibold text-orange-600 pt-2 border-t">Total Biaya Produksi: {formatRupiah(totalBiayaProduksi)}</p>
            </div>
          </div>
        )}

        {/* Pembayaran & Jadwal */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-lg mb-3 text-gray-800">Pembayaran & Jadwal</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">DP:</span> {formatRupiah(dp)}</p>
            <p><span className="font-semibold">Tanggal Pesan:</span> {tanggalPesan || '-'}</p>
            <p><span className="font-semibold">Deadline:</span> {deadline || '-'}</p>
          </div>
        </div>

        {/* Total Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Total Tagihan</p>
            <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalTagihan)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Total Biaya Produksi</p>
            <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalBiayaProduksi)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-amber-500">
            <p className="text-sm text-gray-600 mb-1">Sisa Pembayaran</p>
            <p className="text-2xl font-bold text-amber-600">{formatRupiah(sisaBayar)}</p>
          </div>
        </div>
        
        {sisaBayar < 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800 font-semibold">Perhatian: DP melebihi total tagihan!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}