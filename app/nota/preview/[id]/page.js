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
  Share2,
  Image as ImageIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
          catatan: '',
          nama_cs: 'Cs. Ratih' // Default CS name
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
    if (!notaData || !notaData.items) return '';
    
    // Group by product type (based on keterangan or nama_item)
    const qtyByType = {};
    
    notaData.items.forEach(item => {
      const qty = parseInt(item.banyaknya) || 0;
      
      // Determine product type from keterangan or nama_item
      let productType = 'Item';
      
      if (item.keterangan) {
        if (item.keterangan.toLowerCase().includes('printing') || 
            item.keterangan.toLowerCase().includes('cetak')) {
          productType = 'Printing';
        } else if (item.nama_item.toLowerCase().includes('kaos') || 
                   item.nama_item.toLowerCase().includes('polo') ||
                   item.nama_item.toLowerCase().includes('jaket')) {
          productType = 'Kaos';
        } else {
          // Use the keterangan as product type
          productType = item.keterangan.split(' - ')[0] || 'Item';
        }
      } else {
        // Fallback: use nama_item as product type
        const nameParts = item.nama_item.split(' ');
        productType = nameParts[0] || 'Item';
      }
      
      if (!qtyByType[productType]) {
        qtyByType[productType] = 0;
      }
      qtyByType[productType] += qty;
    });
    
    // Format as string: "Kaos = 40, Printing = 5"
    return Object.entries(qtyByType)
      .map(([type, qty]) => `${type} = ${qty}`)
      .join(', ');
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

  
  async function handleExportPDF() {
    try {
      const element = notaRef.current;
      if (!element) return;

      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Nota_${notaData.nota_number}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengexport PDF: ' + error.message);
    }
  }

  async function handleExportImage() {
    try {
      const element = notaRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Nota_${notaData.nota_number}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Gagal mengexport gambar: ' + error.message);
    }
  }

  async function handleSendWhatsApp() {
    try {
      const element = notaRef.current;
      if (!element) return;

      // Generate image first
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // For WhatsApp, we'll open the web interface with a pre-filled message
      // Note: Due to browser limitations, we can't directly send the image via WhatsApp Web
      // User will need to manually attach the downloaded image
      
      const phoneNumber = '6281234036663'; // Format: country code + number
      const message = `Nota ${notaData.nota_number} - ${notaData.nama}`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Download image first
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Nota_${notaData.nota_number}.png`;
        link.click();
        URL.revokeObjectURL(url);
        
        // Open WhatsApp after a short delay
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
          alert('Gambar nota telah didownload. Silahkan attach gambar tersebut di WhatsApp.');
        }, 500);
      }, 'image/png');
    } catch (error) {
      console.error('Error sending to WhatsApp:', error);
      alert('Gagal mengirim ke WhatsApp: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat preview nota...</p>
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
    <div className="space-y-3 sm:space-y-4 md:space-y-6 pb-6 sm:pb-8">
      {/* Action Bar - Hidden when printing */}
      <div className="print:hidden bg-gradient-to-r from-blue-600 to-blue-500 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-lg">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Header Section */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="p-1.5 sm:p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
              <Eye className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">Preview Nota</h1>
              <p className="text-blue-100 mt-0.5 text-xs sm:text-sm truncate">Nota: {notaData.nota_number}</p>
            </div>
          </div>
          
          {/* Action Buttons - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/nota')}
              className="bg-white hover:bg-gray-100 h-11 sm:h-10 text-sm"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Kembali
            </Button>
            <Button
              variant="outline"
              onClick={handleEdit}
              className="bg-white hover:bg-gray-100 h-11 sm:h-10 text-sm"
            >
              <FileText size={16} className="mr-1.5" />
              Edit
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white h-11 sm:h-10 text-sm"
            >
              <Printer size={16} className="mr-1.5" />
              Print
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-red-600 hover:bg-red-700 text-white h-11 sm:h-10 text-sm"
            >
              <Download size={16} className="mr-1.5" />
              PDF
            </Button>
            <Button
              onClick={handleExportImage}
              className="bg-purple-600 hover:bg-purple-700 text-white h-11 sm:h-10 text-sm"
            >
              <ImageIcon size={16} className="mr-1.5" />
              Gambar
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white h-11 sm:h-10 text-sm col-span-2 sm:col-span-1"
            >
              <Share2 size={16} className="mr-1.5" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Nota Preview - A4 Format */}
      <div className="flex justify-center px-2 sm:px-0">
        <div 
          ref={notaRef}
          className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none w-full print:w-[210mm]"
          style={{
            maxWidth: '210mm'
          }}
        >
          {/* Nota Content */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-12">
            {/* Header */}
            <div className="mb-3 sm:mb-4">
              {/* Company Info - Left Aligned with Logo */}
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                {/* Logo */}
                <div className="flex-shrink-0 mt-1 sm:mt-4">
                  <img 
                    src="/LOGO-NOTA.png" 
                    alt="B13 Garment & Adv Logo" 
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-right-bottom"
                  />
                </div>
                
                {/* Company Details */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black mb-1 sm:mb-2">
                    B13 Garment & Advertising
                  </h1>
                  <p className="text-xs sm:text-sm text-black leading-relaxed mt-0.5 sm:mt-1">
                    Jl. Arowana, Prm. Kebonagung Indah Blk.13 No.16, Kec.Kaliwates - Jember
                  </p>
                  <p className="text-xs sm:text-sm text-black mb-1 mt-0">
                    No. Hp : 081234036663 / Email : b13factory@gmail.com
                  </p>
                </div>
              </div>
              
              {/* Divider Line */}
              <div className="border-t-2 border-black mt-1 sm:mt-2 mb-1 sm:mb-2"></div>
            </div>

            {/* Order Number & Date - Compact & Responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 mb-3">
              <div>
                <p className="text-sm sm:text-base md:text-lg font-bold text-black">
                  No. Order: <span className="text-black">{notaData.nota_number}</span>
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs sm:text-sm text-black">
                  Tanggal: <span className="font-semibold">{formatTanggalIndonesia(notaData.tanggal_nota)}</span>
                </p>
              </div>
            </div>

            {/* Customer Info - Compact & Responsive */}
            <div className="mb-3 bg-gray-50 p-3 sm:p-2 rounded">
              <div className="text-xs sm:text-sm">
                <p className="mb-1">
                  <span className="font-semibold">Kepada Yth.</span>
                </p>
                <p className="font-semibold text-black mb-1">{notaData.nama}</p>
                <p className="text-black">
                  {notaData.alamat ? notaData.alamat.split(',').pop().trim() : '-'}
                </p>
              </div>
            </div>

            {/* Items Table - Compact & Responsive */}
            <div className="mb-4 border border-gray-300 rounded overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-1.5 sm:px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300 text-xs sm:text-sm">
                      NO
                    </th>
                    <th className="px-1.5 sm:px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300 text-xs sm:text-sm">
                      Qty
                    </th>
                    <th className="px-1.5 sm:px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300 text-xs sm:text-sm">
                      Item
                    </th>
                    <th className="px-1.5 sm:px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300 text-xs sm:text-sm">
                      Harga
                    </th>
                    <th className="px-1.5 sm:px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300 text-xs sm:text-sm">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notaData.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-1.5 sm:px-2 py-2 text-gray-700 text-xs sm:text-sm">
                        {index + 1}
                      </td>
                      <td className="px-1.5 sm:px-2 py-2 text-gray-700 text-xs sm:text-sm">
                        <div className="font-medium">{item.banyaknya}</div>
                        {item.keterangan && (
                          <div className="text-[10px] sm:text-xs text-gray-500 italic">
                            {item.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="px-1.5 sm:px-2 py-2 text-gray-900 font-medium text-xs sm:text-sm">
                        {item.nama_item}
                      </td>
                      <td className="px-1.5 sm:px-2 py-2 text-gray-700 text-left text-xs sm:text-sm">
                        {formatRupiah(item.harga)}
                      </td>
                      <td className="px-1.5 sm:px-2 py-2 text-gray-900 font-semibold text-left text-xs sm:text-sm">
                        {formatRupiah(item.jumlah)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Section - Compact & Responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              {/* Left: Info */}
              <div className="space-y-2 flex-shrink-0">
                <div className="text-xs sm:text-sm text-black">
                  <p className="font-semibold">Total Qty : <span className="text-black">{calculateTotalQty()}</span></p>
                </div>

                {notaData.catatan && (
                  <div className="max-w-full sm:max-w-xs">
                    <p className="text-xs sm:text-sm font-semibold text-black mb-1">Catatan :</p>
                    <p className="text-xs sm:text-sm text-black italic">{notaData.catatan}</p>
                  </div>
                )}
              </div>

              {/* Right: Payment Summary - PERBAIKAN ALIGNMENT TITIK DUA & RESPONSIVE */}
              <div className="border border-black rounded p-3 w-full sm:w-auto sm:min-w-[280px] md:min-w-[300px]">
                <div className="space-y-2 text-xs sm:text-sm">
                  {/* Total Tagihan */}
                  <div className="flex items-center pb-1">
                    <span className="font-semibold text-black w-28 sm:w-32">Total Tagihan</span>
                    <span className="font-semibold text-black mx-2">:</span>
                    <span className="font-bold text-black flex-1 text-right">
                      {formatRupiah(notaData.total_tagihan)}
                    </span>
                  </div>

                  {/* DP/Bayar */}
                  <div className="flex items-center pb-1">
                    <span className="font-semibold text-black w-28 sm:w-32">DP/Bayar</span>
                    <span className="font-semibold text-black mx-2">:</span>
                    <span className="font-bold text-black flex-1 text-right">
                      {formatRupiah(notaData.dp)}
                    </span>
                  </div>

                  {/* Sisa */}
                  <div className="flex items-center pt-1">
                    <span className="font-bold text-red-600 w-28 sm:w-32">Sisa</span>
                    <span className="font-bold text-red-600 mx-2">:</span>
                    <span className="font-bold text-red-600 flex-1 text-right">
                      {formatRupiah(notaData.sisa)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Section - Compact & Responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-8 sm:gap-0 mt-8 pt-4 border-t border-gray-300">
              <div className="text-center flex-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-8 sm:mb-12">Tanda Terima</p>
                <div className="w-32 sm:w-40 border-b border-gray-400 mt-12 sm:mt-20 mx-auto"></div>
              </div>
              
              <div className="text-center flex-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-8 sm:mb-12">{notaData.nama_cs || 'Cs. Ratih'}</p>
                <div className="w-32 sm:w-40 border-b border-gray-400 mt-12 sm:mt-20 mx-auto"></div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="text-center mt-0">
              <p className="text-xs sm:text-sm font-bold text-gray-800">*** Terima Kasih ***</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}