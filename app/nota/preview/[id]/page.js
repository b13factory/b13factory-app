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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Printer size={18} className="mr-2" />
              Print
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Download size={18} className="mr-2" />
              PDF
            </Button>
            <Button
              onClick={handleExportImage}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ImageIcon size={18} className="mr-2" />
              Gambar
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Share2 size={18} className="mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Nota Preview - A4 Format */}
      <div className="flex justify-center">
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
            <div className="mb-4">
              {/* Company Info - Left Aligned with Logo */}
              <div className="flex items-start gap-4 mb-3">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <img 
                    src="/LOGO-NOTA.png" 
                    alt="B13 Garment & Adv Logo" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
                
                {/* Company Details */}
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-black mb-1">
                    B13 Garment & Advertising
                  </h1>
                  <p className="text-xs text-black leading-relaxed">
                    Jl. Arowana, Prm. Kebonagung Indah Blk.13 No.16, Kec.Kaliwates - Jember
                  </p>
                  <p className="text-xs text-black mt-1">
                    No. Hp : 081234036663 / Email : b13factory@gmail.com
                  </p>
                </div>
              </div>
              
              {/* Divider Line */}
              <div className="border-t-2 border-black mt-2 mb-2"></div>
            </div>

            {/* Order Number & Date - Compact */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-black">
                  No. Order: <span className="text-black">{notaData.nota_number}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-black">
                  Tanggal: <span className="font-semibold">{formatTanggalIndonesia(notaData.tanggal_nota)}</span>
                </p>
              </div>
            </div>

            {/* Customer Info - Compact */}
            <div className="mb-3 bg-gray-50 p-2 rounded">
              <div className="text-xs">
                <p className="mb-1">
                  <span className="font-semibold">Kepada Yth.</span>
                </p>
                <p className="font-semibold text-black mb-1">{notaData.nama}</p>
                <p className="text-black">
                  {notaData.alamat ? notaData.alamat.split(',').pop().trim() : '-'}
                </p>
              </div>
            </div>

            {/* Items Table - Compact */}
            <div className="mb-4 border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300">
                      NO
                    </th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300">
                      Qty
                    </th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300">
                      Item
                    </th>
                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border-b border-gray-300">
                      Harga
                    </th>
                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border-b border-gray-300">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notaData.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-2 py-2 text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 text-gray-700">
                        <div className="font-medium">{item.banyaknya}</div>
                        {item.keterangan && (
                          <div className="text-xs text-gray-500 italic">
                            {item.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 text-gray-900 font-medium">
                        {item.nama_item}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-right">
                        {formatRupiah(item.harga)}
                      </td>
                      <td className="px-2 py-2 text-gray-900 font-semibold text-right">
                        {formatRupiah(item.jumlah)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Section - Compact */}
            <div className="flex justify-between items-start mb-6">
              {/* Left: Info */}
              <div className="space-y-2">
                <div className="text-xs text-black">
                  <p className="font-semibold">Total Qty: <span className="text-black">{calculateTotalQty()}</span></p>
                </div>

                {notaData.catatan && (
                  <div className="max-w-xs">
                    <p className="text-xs font-semibold text-black mb-1">Catatan:</p>
                    <p className="text-xs text-black italic">{notaData.catatan}</p>
                  </div>
                )}
              </div>

              {/* Right: Payment Summary - No colored background, compact */}
              <div className="border border-black rounded p-3 min-w-[250px]">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-1 border-b border-black">
                    <span className="font-semibold text-black">Total Tagihan</span>
                    <span className="font-bold text-black">
                      {formatRupiah(notaData.total_tagihan)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-1 border-b border-black">
                    <span className="font-semibold text-black">DP/Bayar</span>
                    <span className="font-bold text-black">
                      {formatRupiah(notaData.dp)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-black">Sisa</span>
                    <span className="font-bold text-black">
                      {formatRupiah(notaData.sisa)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Section - Compact */}
            <div className="flex justify-between items-end mt-8 pt-4 border-t border-gray-300">
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700 mb-12">Tanda Terima</p>
                <div className="w-40 border-b border-gray-400"></div>
              </div>
              
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700 mb-12">{notaData.nama_cs || 'Cs. Ratih'}</p>
                <div className="w-40 border-b border-gray-400"></div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="text-center mt-6">
              <p className="text-sm font-bold text-gray-800">*** Terima Kasih ***</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}