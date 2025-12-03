'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { formatRupiah, formatTanggalSingkat } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileEdit,
  Save,
  ArrowLeft,
  Loader2,
  Trash2,
  Plus,
  AlertCircle,
  Info
} from 'lucide-react';

export default function EditNotaPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);
  const [customData, setCustomData] = useState(null);

  // Form state - Data yang bisa diedit
  const [notaNumber, setNotaNumber] = useState('');
  const [tanggalNota, setTanggalNota] = useState('');
  const [items, setItems] = useState([]);
  const [dp, setDp] = useState(0);
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  async function fetchOrderData() {
    try {
      setLoading(true);

      // Fetch order data
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      setOrder(orderData);

      // Fetch existing custom data if any
      const { data: customDataRes, error: customError } = await supabase
        .from('nota_customizations')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (customDataRes && !customError) {
        // Load custom data
        setCustomData(customDataRes);
        const custom = customDataRes.custom_data;
        
        setNotaNumber(custom.nota_number || orderData.no_orderan);
        setTanggalNota(custom.tanggal_nota || orderData.tanggal_pesan);
        setItems(custom.items || parseOrderItems(orderData));
        setDp(custom.dp || orderData.dp);
        setCatatan(custom.catatan || '');
      } else {
        // Load from order data
        setNotaNumber(orderData.no_orderan);
        setTanggalNota(orderData.tanggal_pesan);
        setItems(parseOrderItems(orderData));
        setDp(orderData.dp);
        setCatatan('');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Gagal memuat data order: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function parseOrderItems(orderData) {
    const parsedItems = [];
    
    try {
      let itemsData = null;
      
      if (orderData.items_data) {
        itemsData = typeof orderData.items_data === 'string' 
          ? JSON.parse(orderData.items_data) 
          : orderData.items_data;
      }

      if (!itemsData || !itemsData.pesanan) {
        return [];
      }

      itemsData.pesanan.forEach((pesanan, pesananIdx) => {
        if (pesanan.kategori_produk === 'Garment') {
          // Process Lengan Pendek
          if (pesanan.lengan_pendek) {
            Object.entries(pesanan.ukuran_pendek || {}).forEach(([size, qty]) => {
              if (qty > 0) {
                parsedItems.push({
                  id: `${pesananIdx}-pendek-${size}`,
                  banyaknya: `${qty} pcs`,
                  nama_item: `${pesanan.produk || ''} ${pesanan.jenis || ''} ${size} - Pendek`,
                  keterangan: pesanan.model ? `(${pesanan.model})` : '',
                  harga: parseFloat(pesanan.harga_satuan_pendek || 0),
                  jumlah: qty * parseFloat(pesanan.harga_satuan_pendek || 0)
                });
              }
            });
          }

          // Process Lengan Panjang
          if (pesanan.lengan_panjang) {
            Object.entries(pesanan.ukuran_panjang || {}).forEach(([size, qty]) => {
              if (qty > 0) {
                parsedItems.push({
                  id: `${pesananIdx}-panjang-${size}`,
                  banyaknya: `${qty} pcs`,
                  nama_item: `${pesanan.produk || ''} ${pesanan.jenis || ''} ${size} - Panjang`,
                  keterangan: pesanan.model ? `(${pesanan.model})` : '',
                  harga: parseFloat(pesanan.harga_satuan_panjang || 0),
                  jumlah: qty * parseFloat(pesanan.harga_satuan_panjang || 0)
                });
              }
            });
          }

          // Custom sizes pendek
          if (pesanan.custom_sizes_pendek && pesanan.custom_sizes_pendek.length > 0) {
            pesanan.custom_sizes_pendek.forEach((cs, idx) => {
              if (cs.jumlah > 0) {
                parsedItems.push({
                  id: `${pesananIdx}-custom-pendek-${idx}`,
                  banyaknya: `${cs.jumlah} pcs`,
                  nama_item: `${pesanan.produk || ''} ${cs.nama} - Pendek`,
                  keterangan: '',
                  harga: parseFloat(cs.harga || 0),
                  jumlah: cs.jumlah * parseFloat(cs.harga || 0)
                });
              }
            });
          }

          // Custom sizes panjang
          if (pesanan.custom_sizes_panjang && pesanan.custom_sizes_panjang.length > 0) {
            pesanan.custom_sizes_panjang.forEach((cs, idx) => {
              if (cs.jumlah > 0) {
                parsedItems.push({
                  id: `${pesananIdx}-custom-panjang-${idx}`,
                  banyaknya: `${cs.jumlah} pcs`,
                  nama_item: `${pesanan.produk || ''} ${cs.nama} - Panjang`,
                  keterangan: '',
                  harga: parseFloat(cs.harga || 0),
                  jumlah: cs.jumlah * parseFloat(cs.harga || 0)
                });
              }
            });
          }

          // Ukuran lainnya
          if (pesanan.ukuran_lainnya && pesanan.ukuran_lainnya.length > 0) {
            pesanan.ukuran_lainnya.forEach((u, idx) => {
              if (u.jumlah > 0) {
                parsedItems.push({
                  id: `${pesananIdx}-lainnya-${idx}`,
                  banyaknya: `${u.jumlah} pcs`,
                  nama_item: `${pesanan.produk || ''} ${u.nama}`,
                  keterangan: '',
                  harga: parseFloat(u.harga || 0),
                  jumlah: u.jumlah * parseFloat(u.harga || 0)
                });
              }
            });
          }
        } else if (pesanan.kategori_produk === 'Advertising') {
          // Process Advertising items
          if (pesanan.items_advertising && pesanan.items_advertising.length > 0) {
            pesanan.items_advertising.forEach((item, idx) => {
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
              
              parsedItems.push({
                id: `${pesananIdx}-adv-${idx}`,
                banyaknya: `${jumlah} pcs`,
                nama_item: `${pesanan.produk || ''} ${pesanan.jenis || ''} ${dimensi}`,
                keterangan: '',
                harga: harga,
                jumlah: dimensiValue * harga * jumlah
              });
            });
          }
        } else if (pesanan.kategori_produk === 'Jasa' || pesanan.kategori_produk === 'Lainnya') {
          // Process Jasa/Lainnya items
          if (pesanan.items_jasa && pesanan.items_jasa.length > 0) {
            pesanan.items_jasa.forEach((item, idx) => {
              const harga = parseFloat(item.harga) || 0;
              const jumlah = parseFloat(item.jumlah) || 0;
              
              parsedItems.push({
                id: `${pesananIdx}-jasa-${idx}`,
                banyaknya: `${jumlah} pcs`,
                nama_item: `${pesanan.produk || ''} ${pesanan.jenis || ''}`,
                keterangan: item.keterangan || '',
                harga: harga,
                jumlah: harga * jumlah
              });
            });
          }
        }
      });
    } catch (e) {
      console.error('Error parsing items:', e);
    }

    return parsedItems;
  }

  function handleAddItem() {
    const newItem = {
      id: `custom-${Date.now()}`,
      banyaknya: '1 pcs',
      nama_item: '',
      keterangan: '',
      harga: 0,
      jumlah: 0
    };
    setItems([...items, newItem]);
  }

  function handleRemoveItem(itemId) {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      setItems(items.filter(item => item.id !== itemId));
    }
  }

  function handleUpdateItem(itemId, field, value) {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        
        // Auto-calculate jumlah if harga or banyaknya changes
        if (field === 'harga' || field === 'banyaknya') {
          const qty = parseInt(updated.banyaknya) || 0;
          const harga = parseFloat(updated.harga) || 0;
          updated.jumlah = qty * harga;
        }
        
        return updated;
      }
      return item;
    }));
  }

  function calculateTotal() {
    return items.reduce((sum, item) => sum + (parseFloat(item.jumlah) || 0), 0);
  }

  function calculateTotalQty() {
    return items.reduce((sum, item) => {
      const qty = parseInt(item.banyaknya) || 0;
      return sum + qty;
    }, 0);
  }

  async function handleSave() {
    try {
      setSaving(true);

      const totalTagihan = calculateTotal();
      const sisa = totalTagihan - (parseFloat(dp) || 0);

      const customDataToSave = {
        nota_number: notaNumber,
        tanggal_nota: tanggalNota,
        items: items,
        dp: parseFloat(dp),
        total_tagihan: totalTagihan,
        sisa: sisa,
        catatan: catatan,
        // Keep customer data from original order (read-only)
        nama: order.nama,
        nohp: order.nohp,
        alamat: order.alamat
      };

      // Check if custom data exists
      if (customData) {
        // Update existing
        const { error } = await supabase
          .from('nota_customizations')
          .update({
            custom_data: customDataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', customData.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('nota_customizations')
          .insert([{
            order_id: orderId,
            custom_data: customDataToSave
          }]);

        if (error) throw error;
      }

      alert('Data nota berhasil disimpan!');
      router.push(`/nota`);
    } catch (error) {
      console.error('Error saving nota:', error);
      alert('Gagal menyimpan nota: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat data nota...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Order tidak ditemukan</p>
          <Button onClick={() => router.push('/nota')} className="mt-4">
            Kembali ke Daftar Nota
          </Button>
        </div>
      </div>
    );
  }

  const totalTagihan = calculateTotal();
  const sisa = totalTagihan - (parseFloat(dp) || 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FileEdit className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Nota</h1>
            <p className="text-blue-100 mt-1">Edit manual data nota tanpa mengubah data orderan asli</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Informasi Penting</h3>
              <p className="text-sm text-blue-800">
                Perubahan yang Anda simpan di sini <strong>tidak akan mengubah data orderan asli</strong>. 
                Data ini hanya untuk keperluan pencetakan nota dan akan digunakan sebagai acuan 
                selama data orderan tidak ada perubahan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Customer (Read-only) */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <span>Data Pelanggan</span>
            <span className="text-sm font-normal text-gray-500">(Tidak dapat diubah)</span>
          </CardTitle>
          <CardDescription>Data pelanggan dari orderan asli</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-600">Nama</Label>
            <p className="text-base font-medium mt-1">{order.nama}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-600">No. HP</Label>
            <p className="text-base font-medium mt-1">{order.nohp}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-600">Alamat</Label>
            <p className="text-base font-medium mt-1">{order.alamat}</p>
          </div>
        </CardContent>
      </Card>

      {/* Form Edit Nota */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle>Detail Nota</CardTitle>
          <CardDescription>Edit informasi nota sesuai kebutuhan</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Nomor Nota & Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nota_number" className="text-base font-semibold">
                Nomor Nota <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nota_number"
                value={notaNumber}
                onChange={(e) => setNotaNumber(e.target.value)}
                placeholder="Contoh: B13-001"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="tanggal_nota" className="text-base font-semibold">
                Tanggal Nota <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal_nota"
                type="date"
                value={tanggalNota}
                onChange={(e) => setTanggalNota(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          {/* Items List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Item Pesanan</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddItem}
              >
                <Plus size={16} className="mr-2" />
                Tambah Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Banyaknya</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nama Item</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Keterangan</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Harga</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Jumlah</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        Belum ada item. Klik tombol "Tambah Item" untuk menambah.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={item.banyaknya}
                            onChange={(e) => handleUpdateItem(item.id, 'banyaknya', e.target.value)}
                            className="w-24"
                            placeholder="1 pcs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={item.nama_item}
                            onChange={(e) => handleUpdateItem(item.id, 'nama_item', e.target.value)}
                            placeholder="Nama item"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={item.keterangan}
                            onChange={(e) => handleUpdateItem(item.id, 'keterangan', e.target.value)}
                            placeholder="Keterangan"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.harga}
                            onChange={(e) => handleUpdateItem(item.id, 'harga', e.target.value)}
                            className="w-32 text-right"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatRupiah(item.jumlah || 0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pembayaran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dp" className="text-base font-semibold">
                DP / Bayar (Rp) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dp"
                type="number"
                value={dp}
                onChange={(e) => setDp(e.target.value)}
                placeholder="0"
                min="0"
                className="mt-2"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <Label htmlFor="catatan" className="text-base font-semibold">
              Catatan Tambahan
            </Label>
            <Textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan..."
              rows={3}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle>Ringkasan Nota</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Qty:</span>
              <span className="font-bold text-lg">{calculateTotalQty()} pcs</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Tagihan:</span>
              <span className="font-bold text-lg">{formatRupiah(totalTagihan)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Bayar/DP:</span>
              <span className="font-semibold text-green-600 text-lg">{formatRupiah(dp)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-900 font-bold text-lg">Sisa:</span>
              <span className="font-bold text-red-600 text-xl">{formatRupiah(sisa)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={() => router.push('/nota')}
          disabled={saving}
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 min-w-[150px]"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Simpan Nota
            </>
          )}
        </Button>
      </div>
    </div>
  );
}