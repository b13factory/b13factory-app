// app/order/[id]/page.js - Order Detail Page
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { formatRupiah, formatTanggalLengkap } from '@/lib/helpers';
import Link from 'next/link';
import Image from 'next/image';

import { 
  ArrowLeft,
  Edit,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  Factory,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  CreditCard
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Komponen Halaman Detail Order
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [biayaProduksi, setBiayaProduksi] = useState([]);
  const [totalBiaya, setTotalBiaya] = useState(0);

  // State untuk pembayaran
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  async function fetchOrderDetail() {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        setLoading(false);
        return;
      }

      // Fetch order data
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        setLoading(false);
        return;
      }

      setOrder(orderData);

      // Fetch biaya produksi
      const { data: biayaData, error: biayaError } = await supabase
        .from('biaya_produksi')
        .select('*')
        .eq('order_id', orderId);

      if (biayaError) {
        console.error('Error fetching biaya produksi:', biayaError);
      } else {
        setBiayaProduksi(biayaData || []);
        
        // Calculate total biaya
        const total = (biayaData || []).reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        setTotalBiaya(total);
      }

    } catch (error) {
      console.error('Error in fetchOrderDetail:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTambahPembayaran() {
    const bayar = parseFloat(jumlahBayar);
    
    if (!bayar || bayar <= 0) {
      alert('Mohon masukkan jumlah pembayaran yang valid');
      return;
    }
    
    if (bayar > order.sisa) {
      alert('Jumlah pembayaran tidak boleh melebihi sisa tagihan');
      return;
    }
    
    if (!confirm(`Konfirmasi pembayaran sebesar ${formatRupiah(bayar)}?`)) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const dpBaru = (parseFloat(order.dp) || 0) + bayar;
      const sisaBaru = (parseFloat(order.sisa) || 0) - bayar;
      
      const { error } = await supabase
        .from('orders')
        .update({
          dp: dpBaru,
          sisa: sisaBaru,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      alert('Pembayaran berhasil ditambahkan!');
      setJumlahBayar('');
      
      // Refresh data order
      await fetchOrderDetail();
      
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Gagal menambahkan pembayaran: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-sky-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat detail order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Order dengan ID tersebut tidak ditemukan di database.</p>
          <Button onClick={() => router.push('/history')}>
            <ArrowLeft className="mr-2" size={18} />
            Kembali ke History
          </Button>
        </div>
      </div>
    );
  }

  // Parse items_data
  let itemsData = { pesanan: [], biaya_kain: [], biaya_percetakan: [], biaya_jasa: [] };
  try {
    if (order.items_data) {
      itemsData = typeof order.items_data === 'string' 
        ? JSON.parse(order.items_data) 
        : order.items_data;
    }
  } catch (e) {
    console.error('Error parsing items_data:', e);
  }

  const isPaid = (order.sisa || 0) === 0;
  const labaKotor = (order.total_tagihan || 0) - totalBiaya;

  // Group biaya produksi by kategori
  const biayaKain = biayaProduksi.filter(b => b.kategori === 'Kain');
  const biayaPercetakan = biayaProduksi.filter(b => b.kategori === 'Percetakan');
  const biayaJasa = biayaProduksi.filter(b => b.kategori === 'Jasa');

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 pb-4 sm:pb-6 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-500 p-3 sm:p-4 md:p-6 rounded-lg md:rounded-xl shadow-lg">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="p-1.5 sm:p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl">
              <FileText className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-white">Detail Order</h1>
              <p className="text-sky-100 mt-0.5 text-xs sm:text-sm md:text-base truncate">Informasi lengkap order {order.no_orderan}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={`/orderan/edit/${orderId}`} className="flex-1 sm:flex-initial">
              <Button variant="outline" className="bg-white hover:bg-gray-100 w-full text-xs sm:text-sm md:text-base h-9 sm:h-10">
                <Edit size={14} className="mr-1 sm:mr-1.5 md:mr-2" />
                Edit
              </Button>
            </Link>
            <Link href="/history" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="bg-white hover:bg-gray-100 w-full text-xs sm:text-sm md:text-base h-9 sm:h-10">
                <ArrowLeft size={14} className="mr-1 sm:mr-1.5 md:mr-2" />
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <Badge 
          variant={isPaid ? "default" : "destructive"}
          className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 w-fit ${isPaid ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {isPaid ? (
            <>
              <CheckCircle size={14} className="mr-1.5 sm:mr-2" />
              Lunas
            </>
          ) : (
            <>
              <AlertCircle size={14} className="mr-1.5 sm:mr-2" />
              Belum Lunas
            </>
          )}
        </Badge>
        <span className="text-xs sm:text-sm text-gray-600">
          No. Order: <span className="font-bold text-sky-600">{order.no_orderan}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Informasi Pemesan */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-sky-600 rounded-lg">
                  <User className="text-white" size={18} />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl">Informasi Pemesan</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Data lengkap pemesan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <User className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Nama Lengkap</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words">{order.nama}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2 sm:gap-3">
                <Phone className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">No. HP/WhatsApp</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-all">{order.nohp}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2 sm:gap-3">
                <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Alamat</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words">{order.alamat}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2 sm:gap-3">
                <Calendar className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Tanggal Pesan</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">{formatTanggalLengkap(order.tanggal_pesan)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Deadline</p>
                      <p className="text-sm sm:text-base font-semibold text-red-600">{formatTanggalLengkap(order.deadline)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gambar Mockup */}
          {order.gambar_mockup && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-purple-600 rounded-lg">
                    <ImageIcon className="text-white" size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg md:text-xl">Gambar Mockup</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Desain mockup produk</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4 md:p-6">
                <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={order.gambar_mockup}
                    alt="Mockup Order"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detail Pesanan */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-600 rounded-lg">
                  <Package className="text-white" size={18} />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl">Detail Pesanan</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Rincian produk yang dipesan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4 md:p-6">
              {itemsData.pesanan && itemsData.pesanan.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {itemsData.pesanan.map((pesanan, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-sky-600 text-white rounded-full text-xs sm:text-sm font-bold">
                          {index + 1}
                        </span>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                          {pesanan.kategori_produk || 'Produk'}
                        </h3>
                      </div>

                      {/* Detail per kategori */}
                      {pesanan.kategori_produk === 'Garment' && (
                        <GarmentDetail pesanan={pesanan} />
                      )}
                      
                      {pesanan.kategori_produk === 'Advertising' && (
                        <AdvertisingDetail pesanan={pesanan} />
                      )}
                      
                      {(pesanan.kategori_produk === 'Jasa' || pesanan.kategori_produk === 'Lainnya') && (
                        <JasaDetail pesanan={pesanan} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Tidak ada detail pesanan</p>
              )}
            </CardContent>
          </Card>

          {/* Biaya Produksi */}
          {biayaProduksi.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-orange-600 rounded-lg">
                    <Factory className="text-white" size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg md:text-xl">Biaya Produksi</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Rincian biaya produksi order ini</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4 md:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Biaya Kain */}
                  {biayaKain.length > 0 && (
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Biaya Kain
                      </h4>
                      <div className="space-y-2">
                        {biayaKain.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm sm:text-base font-medium text-gray-800 break-words">{item.jenis}</p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatRupiah(item.harga)} × {item.jumlah}
                              </p>
                            </div>
                            <p className="text-sm sm:text-base font-bold text-blue-600 flex-shrink-0">{formatRupiah(item.total)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Biaya Percetakan */}
                  {biayaPercetakan.length > 0 && (
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                        Biaya Percetakan
                      </h4>
                      <div className="space-y-2">
                        {biayaPercetakan.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 sm:p-3 bg-purple-50 rounded-lg gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm sm:text-base font-medium text-gray-800 break-words">{item.jenis}</p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatRupiah(item.harga)} × {item.jumlah}
                              </p>
                            </div>
                            <p className="text-sm sm:text-base font-bold text-purple-600 flex-shrink-0">{formatRupiah(item.total)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Biaya Jasa */}
                  {biayaJasa.length > 0 && (
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Biaya Jasa
                      </h4>
                      <div className="space-y-2">
                        {biayaJasa.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded-lg gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm sm:text-base font-medium text-gray-800 break-words">{item.jenis}</p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatRupiah(item.harga)} × {item.jumlah}
                              </p>
                            </div>
                            <p className="text-sm sm:text-base font-bold text-green-600 flex-shrink-0">{formatRupiah(item.total)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />
                  
                  {/* Total Biaya Produksi */}
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-100 rounded-lg gap-2">
                    <p className="text-sm sm:text-base md:text-lg font-bold text-gray-800">Total Biaya Produksi</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 flex-shrink-0">{formatRupiah(totalBiaya)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Financial Summary */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Rincian Pembayaran */}
          <Card className="lg:sticky lg:top-6">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-yellow-600 rounded-lg">
                  <DollarSign className="text-white" size={18} />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl">Rincian Pembayaran</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Detail tagihan dan pembayaran</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center gap-2">
                <p className="text-sm sm:text-base text-gray-600">Total Tagihan</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 flex-shrink-0">{formatRupiah(order.total_tagihan)}</p>
              </div>
              <Separator />
              <div className="flex justify-between items-center gap-2">
                <p className="text-sm sm:text-base text-gray-600">DP Dibayar</p>
                <p className="text-base sm:text-lg font-bold text-blue-600 flex-shrink-0">{formatRupiah(order.dp)}</p>
              </div>
              <Separator />
              <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-lg gap-2">
                <p className="text-base sm:text-lg font-bold text-gray-800">Sisa Pembayaran</p>
                <p className={`text-lg sm:text-xl md:text-2xl font-bold flex-shrink-0 ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                  {formatRupiah(order.sisa)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form Tambah Pembayaran - hanya tampil jika belum lunas */}
          {!isPaid && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-emerald-600 rounded-lg">
                    <CreditCard className="text-white" size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg md:text-xl">Tambah Pembayaran</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Input pembayaran pelunasan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
                <div>
                  <Label htmlFor="jumlah-bayar" className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 block">
                    Jumlah Pembayaran (Rp)
                  </Label>
                  <Input
                    id="jumlah-bayar"
                    type="number"
                    min="0"
                    max={order.sisa}
                    value={jumlahBayar}
                    onChange={(e) => setJumlahBayar(e.target.value)}
                    placeholder="Masukkan jumlah pembayaran"
                    className="text-base sm:text-lg h-11 sm:h-10"
                    disabled={isProcessing}
                    data-testid="input-jumlah-pembayaran"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Maksimal: {formatRupiah(order.sisa)}
                  </p>
                </div>
                
                <Button
                  onClick={handleTambahPembayaran}
                  disabled={isProcessing || !jumlahBayar || parseFloat(jumlahBayar) <= 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-11 sm:h-10 text-sm sm:text-base"
                  data-testid="btn-submit-pembayaran"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-1.5 sm:mr-2" size={16} />
                      <span className="text-sm sm:text-base">Memproses...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} className="mr-1.5 sm:mr-2" />
                      <span className="text-sm sm:text-base">Tambah Pembayaran</span>
                    </>
                  )}
                </Button>
                
                {jumlahBayar && parseFloat(jumlahBayar) > 0 && (
                  <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm text-gray-700 mb-1 font-medium">Preview:</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Sisa saat ini:</span>
                        <span className="font-semibold flex-shrink-0">{formatRupiah(order.sisa)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Pembayaran:</span>
                        <span className="font-semibold text-blue-600 flex-shrink-0">- {formatRupiah(parseFloat(jumlahBayar) || 0)}</span>
                      </div>
                      <Separator className="my-1.5 sm:my-2" />
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-700 font-bold">Sisa setelah bayar:</span>
                        <span className={`font-bold flex-shrink-0 ${(order.sisa - parseFloat(jumlahBayar)) === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {formatRupiah(Math.max(0, order.sisa - (parseFloat(jumlahBayar) || 0)))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Laba Kotor */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-600 rounded-lg">
                  <TrendingUp className="text-white" size={18} />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl">Analisis Laba</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Perhitungan keuntungan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
              <div className="flex justify-between items-center gap-2">
                <p className="text-xs sm:text-sm text-gray-600">Total Tagihan</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900 flex-shrink-0">{formatRupiah(order.total_tagihan)}</p>
              </div>
              <div className="flex justify-between items-center gap-2">
                <p className="text-xs sm:text-sm text-gray-600">Total Biaya Produksi</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900 flex-shrink-0">- {formatRupiah(totalBiaya)}</p>
              </div>
              <Separator />
              <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg gap-2">
                <p className="text-base sm:text-lg font-bold text-white">Laba Kotor</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white flex-shrink-0">{formatRupiah(labaKotor)}</p>
              </div>
              <div className="text-center pt-1 sm:pt-2">
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Margin: {order.total_tagihan > 0 ? ((labaKotor / order.total_tagihan) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component untuk detail Garment
function GarmentDetail({ pesanan }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Produk</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.produk || '-'}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Jenis</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.jenis || '-'}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Model</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.model || '-'}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Tipe Desain</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.tipe_desain || '-'}</p>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3">Bahan Utama</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Toko</p>
            <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.toko || '-'}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Jenis Kain</p>
            <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.jenis_kain || '-'}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Warna</p>
            <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.warna || '-'}</p>
          </div>
        </div>
      </div>

      {pesanan.bahan_tambahan && pesanan.bahan_tambahan.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3">Bahan Tambahan</p>
            <div className="space-y-2">
              {pesanan.bahan_tambahan.map((bahan, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm p-2 sm:p-3 bg-white rounded border border-gray-200">
                  <span className="text-gray-600 break-words">{bahan.toko}</span>
                  <span className="text-gray-600 break-words">{bahan.jenis}</span>
                  <span className="font-medium text-gray-900 break-words">{bahan.warna}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div>
        <p className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3">Ukuran</p>
        
        {pesanan.lengan_pendek && (
          <div className="mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-semibold text-blue-700 mb-2">Lengan Pendek</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {pesanan.ukuran_pendek && Object.entries(pesanan.ukuran_pendek).map(([size, qty]) => (
                qty > 0 && (
                  <div key={size} className="bg-blue-50 p-2 rounded text-center">
                    <p className="text-[10px] sm:text-xs text-gray-600">{size}</p>
                    <p className="text-sm sm:text-base font-bold text-blue-700">{qty}</p>
                  </div>
                )
              ))}
            </div>
            {pesanan.harga_satuan_pendek > 0 && (
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Harga: {formatRupiah(pesanan.harga_satuan_pendek)} / pcs
              </p>
            )}
          </div>
        )}

        {pesanan.lengan_panjang && (
          <div className="mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-semibold text-green-700 mb-2">Lengan Panjang</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {pesanan.ukuran_panjang && Object.entries(pesanan.ukuran_panjang).map(([size, qty]) => (
                qty > 0 && (
                  <div key={size} className="bg-green-50 p-2 rounded text-center">
                    <p className="text-[10px] sm:text-xs text-gray-600">{size}</p>
                    <p className="text-sm sm:text-base font-bold text-green-700">{qty}</p>
                  </div>
                )
              ))}
            </div>
            {pesanan.harga_satuan_panjang > 0 && (
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Harga: {formatRupiah(pesanan.harga_satuan_panjang)} / pcs
              </p>
            )}
          </div>
        )}

        {pesanan.ukuran_lainnya && pesanan.ukuran_lainnya.length > 0 && (
          <div>
            <p className="text-xs sm:text-sm font-semibold text-purple-700 mb-2">Ukuran Lainnya</p>
            <div className="space-y-2">
              {pesanan.ukuran_lainnya.map((ukuran, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-purple-50 rounded">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 break-words">{ukuran.nama}</span>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="font-bold text-purple-700">{ukuran.jumlah} pcs</span>
                    <span className="text-gray-600">@ {formatRupiah(ukuran.harga)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Component untuk detail Advertising
function AdvertisingDetail({ pesanan }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Jenis</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.produk || '-'}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Model</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.jenis || '-'}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Tipe/Desain</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.model || '-'}</p>
        </div>
      </div>

      {pesanan.items_advertising && pesanan.items_advertising.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3">Detail Item</p>
            <div className="space-y-2">
              {pesanan.items_advertising.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 sm:p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">Dimensi: {item.dimensi || '-'}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {formatRupiah(item.harga)} per m² × {item.jumlah} pcs
                    </p>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-sky-600 flex-shrink-0">
                    {formatRupiah((parseFloat(item.dimensi?.split('x').reduce((a, b) => parseFloat(a) * parseFloat(b), 1) || 0) * parseFloat(item.harga || 0) * parseFloat(item.jumlah || 0)))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Component untuk detail Jasa/Lainnya
function JasaDetail({ pesanan }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Jenis</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.produk || '-'}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Model</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.jenis || '-'}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Tipe/Desain</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{pesanan.model || '-'}</p>
        </div>
      </div>

      {pesanan.items_jasa && pesanan.items_jasa.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3">Detail Item</p>
            <div className="space-y-2">
              {pesanan.items_jasa.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 sm:p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{item.keterangan || 'Item ' + (idx + 1)}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {formatRupiah(item.harga)} × {item.jumlah}
                    </p>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-green-600 flex-shrink-0">
                    {formatRupiah((parseFloat(item.harga || 0) * parseFloat(item.jumlah || 0)))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}