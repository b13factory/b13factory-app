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
  Image as ImageIcon,
  MoreVertical,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Nota Content Component - extracted to avoid re-render issues
function NotaContentComponent({ notaData, formatRupiah, formatTanggalIndonesia, calculateTotalQty }) {
  return (
    <div className="p-6 sm:p-8 md:p-12">
        {/* Header */}
        <div className="mb-4">
          {/* Company Info - Left Aligned with Logo */}
          <div className="flex items-start gap-3 mb-3">
            {/* Logo */}
            <div className="flex-shrink-0 mt-4">
              <img 
                src="/LOGO-NOTA.png" 
                alt="B13 Garment & Adv Logo" 
                className="w-20 h-20 object-right-bottom"
                />
            </div>
                
          {/* Company Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-black mb-2">
                B13 Garment & Advertising
              </h1>
              <p className="text-sm text-black leading-relaxed mt-1">
                Jl. Arowana, Prm. Kebonagung Indah Blk.13 No.16, Kec.Kaliwates - Jember
              </p>
              <p className="text-sm text-black mb-1 mt-0">
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
          <p className="text-l font-bold text-black">
            No. Order: <span className="text-black">{notaData.nota_number}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-black">
            Tanggal: <span className="font-semibold">{formatTanggalIndonesia(notaData.tanggal_nota)}</span>
          </p>
        </div>
      </div>

      {/* Customer Info - Compact */}
      <div className="mb-3 bg-gray-50 p-2 rounded">
        <div className="text-m">
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
        <table className="w-full text-m">
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
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300">
                Harga
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300">
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
                    <div className="text-m text-gray-500 italic">
                      {item.keterangan}
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 text-gray-900 font-medium">
                  {item.nama_item}
                </td>
                <td className="px-2 py-2 text-gray-700 text-left">
                  {formatRupiah(item.harga)}
                </td>
                <td className="px-2 py-2 text-gray-900 font-semibold text-left">
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
          <div className="text-m text-black">
            <p className="font-semibold">Total Qty : <span className="text-black">{calculateTotalQty()}</span></p>
          </div>

          {notaData.catatan && (
            <div className="max-w-xs">
              <p className="text-sm font-semibold text-black mb-1">Catatan :</p>
              <p className="text-sm text-black italic">{notaData.catatan}</p>
            </div>
          )}
        </div>

        {/* Right: Payment Summary */}
        <div className="border border-black rounded p-3 min-w-[300px]">
          <div className="space-y-2 text-m">
            {/* Total Tagihan */}
            <div className="flex items-center pb-1">
              <span className="font-semibold text-black w-32">Total Tagihan</span>
              <span className="font-semibold text-black mx-2">:</span>
              <span className="font-bold text-black flex-1 text-right">
                {formatRupiah(notaData.total_tagihan)}
              </span>
            </div>

            {/* DP/Bayar */}
            <div className="flex items-center pb-1">
              <span className="font-semibold text-black w-32">DP/Bayar</span>
              <span className="font-semibold text-black mx-2">:</span>
              <span className="font-bold text-black flex-1 text-right">
                {formatRupiah(notaData.dp)}
              </span>
            </div>

            {/* Sisa */}
            <div className="flex items-center pt-1">
              <span className="font-bold text-red-600 w-32">Sisa</span>
              <span className="font-bold text-red-600 mx-2">:</span>
              <span className="font-bold text-red-600 flex-1 text-right">
                {formatRupiah(notaData.sisa)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section - Compact */}
      <div className="flex justify-between items-end mt-8 pt-4 border-t border-gray-300">
        <div className="text-center">
          <p className="text-m font-semibold text-gray-700 mb-12">Tanda Terima</p>
          <div className="w-40 border-b border-gray-400 mt-20"></div>
        </div>
        
        <div className="text-center">
          <p className="text-m font-semibold text-gray-700 mb-12">{notaData.nama_cs || 'Cs. Ratih'}</p>
          <div className="w-40 border-b border-gray-400 mt-20"></div>
        </div>
      </div>

      {/* Thank You Message */}
      <div className="text-center mt-0">
        <p className="text-m font-bold text-gray-800">*** Terima Kasih ***</p>
      </div>
    </div>
  );
}


export default function PreviewNotaPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  const notaRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [order, setOrder] = useState(null);
  const [notaData, setNotaData] = useState(null);
  const [notaImageUrl, setNotaImageUrl] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const screenCheck = window.innerWidth < 768;
      setIsMobile(mobileCheck || screenCheck);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (orderId) {
      fetchNotaData();
    }
  }, [orderId]);

  // Generate image for mobile view
  useEffect(() => {
    if (!loading && notaData && isMobile && !notaImageUrl && notaRef.current) {
      // Add a slight delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        generateNotaImage();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, notaData, isMobile, notaImageUrl]);

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

  async function generateNotaImage() {
    try {
      setGeneratingImage(true);
      
      // Wait for the DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      const element = notaRef.current;
      if (!element) {
        console.error('Element not found for image generation');
        setGeneratingImage(false);
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2.5, // Balanced scale for quality and performance
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        removeContainer: true
      });

      const imageUrl = canvas.toDataURL('image/png', 0.95);
      setNotaImageUrl(imageUrl);
      console.log('Image generated successfully');
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Gagal generate gambar nota. Menampilkan versi HTML.');
      // Fallback: don't set image, show HTML version instead
      setIsMobile(false); 
    } finally {
      setGeneratingImage(false);
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
      let imgData;
      
      // If mobile and we already have the image, use it directly
      if (isMobile && notaImageUrl) {
        imgData = notaImageUrl;
      } else {
        // Otherwise, generate from HTML element
        const element = notaRef.current;
        if (!element) {
          alert('Tidak dapat menemukan konten nota');
          return;
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: false,
          foreignObjectRendering: false
        });

        imgData = canvas.toDataURL('image/png');
      }
      
      // Create PDF from image
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Load image to get dimensions
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth;
      const imgHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Nota_${notaData.nota_number}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengexport PDF: ' + error.message);
    }
  }

  async function handleExportImage() {
    try {
      let imageData;
      
      // If mobile and we already have the image, use it directly
      if (isMobile && notaImageUrl) {
        imageData = notaImageUrl;
        
        // Convert base64 to blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Nota_${notaData.nota_number}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Otherwise, generate from HTML element
        const element = notaRef.current;
        if (!element) {
          alert('Tidak dapat menemukan konten nota');
          return;
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: false,
          foreignObjectRendering: false
        });

        // Convert to blob
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Nota_${notaData.nota_number}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 'image/png');
      }
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Gagal mengexport gambar: ' + error.message);
    }
  }

  async function handleSendWhatsApp() {
    try {
      let imageData;
      
      // If mobile and we already have the image, use it directly
      if (isMobile && notaImageUrl) {
        imageData = notaImageUrl;
      } else {
        // Otherwise, generate from HTML element
        const element = notaRef.current;
        if (!element) {
          alert('Tidak dapat menemukan konten nota');
          return;
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: false,
          foreignObjectRendering: false
        });

        imageData = canvas.toDataURL('image/png');
      }

      // For WhatsApp, we'll open the web interface with a pre-filled message
      const phoneNumber = '6281234036663'; // Format: country code + number
      const message = `Nota ${notaData.nota_number} - ${notaData.nama}`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Download image first
      const response = await fetch(imageData);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nota_${notaData.nota_number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Open WhatsApp after a short delay
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        alert('Gambar nota telah didownload. Silahkan attach gambar tersebut di WhatsApp.');
      }, 500);
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
    <div className="space-y-4 pb-8">
      {/* Mobile Action Bar */}
      {isMobile && (
        <div className="print:hidden bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg">
          {/* Header */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Eye className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Preview Nota</h1>
                  <p className="text-blue-100 text-sm">{notaData.nota_number}</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="text-white" size={24} />
                ) : (
                  <MoreVertical className="text-white" size={24} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Collapsible */}
          {showMobileMenu && (
            <div className="border-t border-white/20 p-4 space-y-2">
              <Button
                onClick={() => router.push('/nota')}
                className="w-full bg-white hover:bg-gray-100 text-blue-600 justify-start"
                size="lg"
              >
                <ArrowLeft size={20} className="mr-3" />
                Kembali
              </Button>
              <Button
                onClick={handleEdit}
                className="w-full bg-white hover:bg-gray-100 text-blue-600 justify-start"
                size="lg"
              >
                <FileText size={20} className="mr-3" />
                Edit Nota
              </Button>
              <Button
                onClick={handlePrint}
                className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                size="lg"
              >
                <Printer size={20} className="mr-3" />
                Print
              </Button>
              <Button
                onClick={handleExportPDF}
                className="w-full bg-red-600 hover:bg-red-700 text-white justify-start"
                size="lg"
              >
                <Download size={20} className="mr-3" />
                Download PDF
              </Button>
              <Button
                onClick={handleExportImage}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                size="lg"
              >
                <ImageIcon size={20} className="mr-3" />
                Download Gambar
              </Button>
              <Button
                onClick={handleSendWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white justify-start"
                size="lg"
              >
                <Share2 size={20} className="mr-3" />
                Kirim WhatsApp
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Desktop Action Bar */}
      {!isMobile && (
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
      )}

      {/* Loading indicator for image generation on mobile */}
      {isMobile && generatingImage && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Memproses nota untuk tampilan mobile...</p>
          </div>
        </div>
      )}

      {/* Nota Content */}
      {isMobile && notaImageUrl ? (
        // Mobile: Show as zoomable image
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-200 p-3 text-center">
              <p className="text-sm text-blue-800 font-medium">
                💡 Gunakan pinch/zoom untuk melihat detail nota
              </p>
            </div>
            <div className="relative" style={{ height: '70vh', touchAction: 'none' }}>
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ disabled: false, step: 0.7 }}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '100%'
                  }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src={notaImageUrl} 
                    alt="Preview Nota" 
                    className="max-w-full h-auto"
                    style={{ 
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
          
          {/* Hidden HTML element for backup/regeneration - kept in DOM but not visible */}
          <div className="fixed top-0 left-[-9999px] pointer-events-none opacity-0" aria-hidden="true">
            <div 
              ref={notaRef}
              className="bg-white shadow-2xl rounded-lg overflow-hidden"
              style={{
                width: '210mm',
                minHeight: '297mm'
              }}
            >
              <NotaContentComponent 
                notaData={notaData} 
                formatRupiah={formatRupiah}
                formatTanggalIndonesia={formatTanggalIndonesia}
                calculateTotalQty={calculateTotalQty}
              />
            </div>
          </div>
        </>
      ) : (
        // Desktop: Show as HTML (also used as source for mobile image generation)
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
            <NotaContentComponent 
              notaData={notaData} 
              formatRupiah={formatRupiah}
              formatTanggalIndonesia={formatTanggalIndonesia}
              calculateTotalQty={calculateTotalQty}
            />
          </div>
        </div>
      )}
    </div>
  );
}