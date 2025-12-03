'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { formatRupiah, formatTanggalSingkat } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { 
  Eye,
  Download,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Printer,
  Share2
} from 'lucide-react';

export default function PreviewNotaPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  const notaRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [notaData, setNotaData] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchNotaData();
    }
  }, [orderId]);

  async function fetchNotaData() {
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

      // Check for custom nota data
      const { data: customDataRes, error: customError } = await supabase
        .from('nota_customizations')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (customDataRes && !customError) {
        // Use custom data
        setNotaData(customDataRes.custom_data);
      } else {
        // Use order data
        const parsedData = {
          nota_number: orderData.no_orderan,
          tanggal_nota: orderData.tanggal_pesan,
          items: parseOrderItems(orderData),
          dp: orderData.dp,
          total_tagihan: orderData.total_tagihan,
          sisa: orderData.sisa,
          nama: orderData.nama,
          nohp: orderData.nohp,
          alamat: orderData.alamat,
          catatan: ''
        };
        setNotaData(parsedData);
      }
    } catch (error) {
      console.error('Error fetching nota:', error);
      alert('Gagal memuat data nota: ' + error.message);
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
                  nama_item: `${pesanan.produk || ''} ${pesanan.jenis || ''} ${size}`,
                  keterangan: `Lengan Pendek${pesanan.model ? ` - ${pesanan.model}` : ''}`,
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
                  nama_item: `${pesanan.produk || ''} ${pesanan.jenis || ''} ${size}`,
                  keterangan: `Lengan Panjang${pesanan.model ? ` - ${pesanan.model}` : ''}`,
                  harga: parseFloat(pesanan.harga_satuan_panjang || 0),
                  jumlah: qty * parseFloat(pesanan.harga_satuan_panjang || 0)
                });
              }
            });
          }

          // Custom sizes & ukuran lainnya
          if (pesanan.custom_sizes_pendek && pesanan.custom_sizes_pendek.length > 0) {
            pesanan.custom_sizes_pendek.forEach((cs, idx) => {
              if (cs.jumlah > 0) {
                parsedItems.push({
                  id: `${pesananIdx}-custom-pendek-${idx}`,
                  banyaknya: `${cs.jumlah} pcs`,
                  nama_item: `${pesanan.produk || ''} ${cs.nama}`,
                  keterangan: 'Lengan Pendek',
                  harga: parseFloat(cs.harga || 0),
                  jumlah: cs.jumlah * parseFloat(cs.harga || 0)
                });
              }
            });
          }

          if (pesanan.custom_sizes_panjang && pesanan.custom_sizes_panjang.length > 0) {
            pesanan.custom_sizes_panjang.forEach((cs, idx) => {
              if (cs.jumlah > 0) {
                parsedItems.push({
                  id: `${pesananIdx}-custom-panjang-${idx}`,
                  banyaknya: `${cs.jumlah} pcs`,
                  nama_item: `${pesanan.produk || ''} ${cs.nama}`,
                  keterangan: 'Lengan Panjang',
                  harga: parseFloat(cs.harga || 0),
                  jumlah: cs.jumlah * parseFloat(cs.harga || 0)
                });
              }
            });
          }

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
                nama_item: `${pesanan.produk || ''} ${pesanan.jenis || ''}`,
                keterangan: `${dimensi}`,
                harga: harga,
                jumlah: dimensiValue * harga * jumlah
              });
            });
          }
        } else if (pesanan.kategori_produk === 'Jasa' || pesanan.kategori_produk === 'Lainnya') {
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

  function calculateTotalQty() {
    if (!notaData || !notaData.items) return 0;
    return notaData.items.reduce((sum, item) => {
      const qty = parseInt(item.banyaknya) || 0;
      return sum + qty;
    }, 0);
  }

  function formatTanggalIndonesia(tanggal) {
    if (!tanggal) return '-';
    const date = new Date(tanggal);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  }

  function handlePrint() {
    window.print();
  }

  function handleEdit() {
    router.push(`/nota/edit/${orderId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-mediu">Memuat preview nota...</p>
        </div>
      </div>
    );
  }

  if (!order || !notaData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Data nota tidak ditemukan</p>
          <Button onClick={() => router.push('/nota')} className="mt-4">
            Kembali ke Daftar Nota
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Action Bar - Hidden when printing */}
      <div className="print:hidden bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Eye className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Preview Nota</h1>
              <p className="text-blue-100 mt-1">Nota: {notaData.nota_number}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/nota')}
              className="bg-white hover:bg-gray-100"
            >
              <ArrowLeft size={18} className="mr-2" />
              Kembali
            </Button>
            <Button
              variant="outline"
              onClick={handleEdit}
              className="bg-white hover:bg-gray-100"
            >
              <FileText size={18} className="mr-2" />
              Edit
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-whit"
            >
              <Printer size={18} className="mr-2" />
              Print
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Download size={18} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Nota Preview - A4 Format */}
      <div className="flex justify-cente">
        <div 
          ref={notaRef}
          className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none"
          style={{
            width: '210mm',
            minHeight: '297mm',
            maxWidth: '100%'
          }}
        >
          {/* Nota Content */}
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-300">
              {/* Left: Company Info */}
              <div className="flex items-start gap-4">
                {/* Logo Placeholder */}
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">B13</span>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    B13 FACTORY GR & ADV
                  </h1>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Jl. Arowana Perum Kebonagung<br />
                    Indah Blok 13 No 16
                  </p>
                  <p className="text-sm text-gray-600 mt-1 font-semibold">
                    ☎ 081234036663
                  </p>
                </div>
              </div>

              {/* Right: Date & Customer */}
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Tanggal:</span>
                </p>
                <p className="text-base font-bold text-gray-900 mb-3">
                  {formatTanggalIndonesia(notaData.tanggal_nota)}
                </p>
                
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Kepada Yth.</span>
                </p>
                <p className="text-base font-bold text-gray-900">
                  {notaData.nama}
                </p>
                <p className="text-sm text-gray-600">
                  {notaData.alamat}
                </p>
              </div>
            </div>

            {/* Nota Number */}
            <div className="mb-6">
              <p className="text-lg font-bold text-gray-900">
                No. Nota <span className="text-blue-600">{notaData.nota_number}</span>
              </p>
            </div>

            {/* Items Table */}
            <div className="mb-8 border-2 border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                      NO
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                      BANYAKNYA
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                      NAMA ITEM
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                      HARGA
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                      JUMLAH
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notaData.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700">
                        <div className="font-semibold">{item.banyaknya}</div>
                        {item.keterangan && (
                          <div className="text-xs text-gray-500 italic">
                            {item.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 font-medium">
                        {item.nama_item}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-right">
                        {formatRupiah(item.harga)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 font-bold text-right">
                        {formatRupiah(item.jumlah)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-start mb-8">
              {/* Left: Info & Signature */}
              <div className="space-y-6">
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-semibold">[ Printed by e-Nota ]</span>
                  </p>
                  <p className="font-semibold">Total Qty: <span className="text-gray-900">{calculateTotalQty()}</span></p>
                </div>

                {notaData.catatan && (
                  <div className="max-w-xs">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Catatan:</p>
                    <p className="text-sm text-gray-600 italic">{notaData.catatan}</p>
                  </div>
                )}
              </div>

              {/* Right: Payment Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 min-w-[300px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                    <span className="text-sm font-semibold text-gray-700">TOTAL</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatRupiah(notaData.total_tagihan)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                    <span className="text-sm font-semibold text-gray-700">BAYAR</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatRupiah(notaData.dp)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-bold text-gray-900">SISA</span>
                    <span className="text-xl font-bold text-red-600">
                      {formatRupiah(notaData.sisa)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="flex justify-between items-end mt-12 pt-8 border-t-2 border-gray-300">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 mb-16">Tanda Terima</p>
                <div className="w-48 border-b-2 border-gray-400"></div>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 mb-16">Cs. Ratih</p>
                <div className="w-48 border-b-2 border-gray-400"></div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="text-center mt-8">
              <p className="text-lg font-bold text-gray-800">*** Terima Kasih ***</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}