// app/neraca/page.js - Halaman Neraca Keuangan
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatRupiah, formatTanggalSingkat } from '@/lib/helpers';
import StatCard from '@/components/StatCard';

import { 
  Scale,
  TrendingUp,
  Wallet,
  DollarSign,
  ChartLine,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

/**
 * Komponen Halaman Neraca Keuangan
 */
export default function NeracaPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    totalDP: 0,
    labaKotor: 0
  });

  useEffect(() => {
    fetchNeracaData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filterStart, filterEnd]);

  async function fetchNeracaData() {
    try {
      setLoading(true);

      if (!supabase) {
        console.error('Supabase client not initialized');
        setLoading(false);
        return;
      }

      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('tanggal_pesan', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setOrders([]);
        return;
      }

      // Fetch all biaya_produksi
      const { data: biayaData, error: biayaError } = await supabase
        .from('biaya_produksi')
        .select('*');

      if (biayaError) {
        console.error('Error fetching biaya_produksi:', biayaError);
      }

      // Gabungkan data orders dengan total biaya_produksi
      const ordersWithBiaya = (ordersData || []).map(order => {
        const biayaItems = (biayaData || []).filter(b => b.order_id === order.id);
        const totalBiaya = biayaItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
        
        return {
          ...order,
          total_biaya: totalBiaya,
          biaya_items: biayaItems,
          laba_kotor: parseFloat(order.total_tagihan || 0) - totalBiaya
        };
      });

      setOrders(ordersWithBiaya);

    } catch (error) {
      console.error('Error in fetchNeracaData:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...orders];

    // Filter berdasarkan tanggal
    if (filterStart) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.tanggal_pesan);
        const startDate = new Date(filterStart);
        return orderDate >= startDate;
      });
    }

    if (filterEnd) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.tanggal_pesan);
        const endDate = new Date(filterEnd);
        return orderDate <= endDate;
      });
    }

    setFilteredOrders(filtered);

    // Hitung statistik
    const totalPemasukan = filtered.reduce((sum, order) => sum + parseFloat(order.total_tagihan || 0), 0);
    const totalPengeluaran = filtered.reduce((sum, order) => sum + parseFloat(order.total_biaya || 0), 0);
    const totalDP = filtered.reduce((sum, order) => sum + parseFloat(order.dp || 0), 0);
    const labaKotor = totalPemasukan - totalPengeluaran;

    setStats({
      totalPemasukan,
      totalPengeluaran,
      totalDP,
      labaKotor
    });

    // Reset ke halaman pertama saat filter berubah
    setCurrentPage(1);
  }

  function handleFilterChange() {
    applyFilters();
  }

  function handleResetFilter() {
    setFilterStart('');
    setFilterEnd('');
  }

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-sky-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat data neraca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
          <div className="p-1.5 md:p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <Scale className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">Neraca Keuangan</h1>
            <p className="text-sm md:text-base text-gray-600">Laporan pemasukan, pengeluaran, dan laba kotor</p>
          </div>
        </div>
      </div>

      {/* Grid untuk kartu statistik */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-6">
        <StatCard 
          title="Total Pemasukan"
          value={formatRupiah(stats.totalPemasukan)}
          icon={Wallet}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />

        <StatCard 
          title="Total Pengeluaran"
          value={formatRupiah(stats.totalPengeluaran)}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />

        <StatCard 
          title="Total DP"
          value={formatRupiah(stats.totalDP)}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        />

        <StatCard 
          title="Laba Kotor"
          value={formatRupiah(stats.labaKotor)}
          icon={ChartLine}
          gradient={stats.labaKotor >= 0 
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600" 
            : "bg-gradient-to-br from-red-500 to-red-600"
          }
        />
      </div>

      {/* Filter Tanggal */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-purple-600" />
          Filter Tanggal
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleResetFilter}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-2 text-sm sm:text-base bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
          >
            Reset
          </button>
        </div>
        {(filterStart || filterEnd) && (
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
            Menampilkan data {filterStart ? `dari ${formatTanggalSingkat(filterStart)}` : ''} 
            {filterEnd ? ` sampai ${formatTanggalSingkat(filterEnd)}` : ''}
          </div>
        )}
      </div>

      {/* Empty State */}
      {currentOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center text-gray-400 py-12">
            <Scale size={64} className="mb-4 opacity-50" />
            <p className="text-base md:text-lg font-medium">
              {filterStart || filterEnd 
                ? 'Tidak ada data sesuai filter tanggal' 
                : 'Belum ada data order'}
            </p>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {currentOrders.length > 0 && (
        <div className="lg:hidden space-y-4">
          {currentOrders.map((order) => {
            const isPaid = parseFloat(order.sisa || 0) === 0;
            const labaKotor = order.laba_kotor || 0;
            
            // Parse items_data untuk menampilkan produk
            let produkList = [];
            try {
              if (order.items_data) {
                const itemsData = typeof order.items_data === 'string' 
                  ? JSON.parse(order.items_data) 
                  : order.items_data;
                
                if (itemsData.pesanan && Array.isArray(itemsData.pesanan)) {
                  produkList = itemsData.pesanan.map(p => ({
                    jenis_produk: p.kategori_produk || '',
                    jenis: p.jenis || '',
                    model: p.model || '',
                    tipe_desain: p.tipe_desain || ''
                  }));
                }
              }
            } catch (e) {
              console.error('Error parsing items_data:', e);
            }

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 border-b border-purple-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {order.nama ? order.nama.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{order.nama || '-'}</h3>
                        <p className="text-xs text-purple-600 font-medium">{order.no_orderan || '-'}</p>
                      </div>
                    </div>
                    {isPaid ? (
                      <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        <CheckCircle size={14} />
                        <span className="text-xs font-semibold">Lunas</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        <XCircle size={14} />
                        <span className="text-xs font-semibold">Belum</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Produk Info */}
                {produkList.length > 0 && (
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={14} className="text-gray-500" />
                      <span className="text-xs font-semibold text-gray-500 uppercase">Produk</span>
                    </div>
                    <div className="space-y-1.5">
                      {produkList.map((produk, idx) => (
                        <div key={idx}>
                          <div className="text-sm font-medium text-gray-700">{produk.jenis_produk}</div>
                          <div className="text-xs text-gray-500">
                            {[produk.jenis, produk.model, produk.tipe_desain]
                              .filter(Boolean)
                              .join(' / ')}
                          </div>
                          {idx < produkList.length - 1 && <hr className="my-1.5 border-gray-200" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tanggal Info */}
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600 uppercase">Tanggal</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-700">
                      <span className="font-medium">Pesan:</span> {formatTanggalSingkat(order.tanggal_pesan)}
                    </div>
                    <div className="text-xs text-gray-700">
                      <span className="font-medium">Deadline:</span> {formatTanggalSingkat(order.deadline)}
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Total Tagihan */}
                    <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="text-xs text-gray-600 mb-1">Total Tagihan</div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatRupiah(order.total_tagihan || 0)}
                      </div>
                    </div>

                    {/* DP */}
                    <div className="p-2.5 bg-green-50 rounded-lg border border-green-100">
                      <div className="text-xs text-gray-600 mb-1">DP</div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatRupiah(order.dp || 0)}
                      </div>
                    </div>

                    {/* Sisa */}
                    <div className="p-2.5 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-xs text-gray-600 mb-1">Sisa Bayar</div>
                      <div className={`text-sm font-bold ${
                        isPaid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatRupiah(order.sisa || 0)}
                      </div>
                    </div>

                    {/* Biaya Produksi */}
                    <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-xs text-gray-600 mb-1">Biaya Produksi</div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatRupiah(order.total_biaya || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Laba Kotor - Full Width */}
                  <div className={`p-3 rounded-lg border-2 ${
                    labaKotor >= 0 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ChartLine size={16} className={labaKotor >= 0 ? 'text-emerald-600' : 'text-red-600'} />
                        <span className="text-xs font-semibold text-gray-600 uppercase">Laba Kotor</span>
                      </div>
                      <div className={`text-base font-bold ${
                        labaKotor >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatRupiah(labaKotor)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop Table View */}
      {currentOrders.length > 0 && (
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">No. Order</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Nama</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Produk</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">Tagihan</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">DP</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">Sisa</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">Biaya Produksi</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">Laba Kotor</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentOrders.map((order) => {
                  const isPaid = parseFloat(order.sisa || 0) === 0;
                  const labaKotor = order.laba_kotor || 0;
                  
                  // Parse items_data untuk menampilkan produk
                  let produkList = [];
                  try {
                    if (order.items_data) {
                      const itemsData = typeof order.items_data === 'string' 
                        ? JSON.parse(order.items_data) 
                        : order.items_data;
                      
                      if (itemsData.pesanan && Array.isArray(itemsData.pesanan)) {
                        produkList = itemsData.pesanan.map(p => ({
                          jenis_produk: p.kategori_produk || '',
                          jenis: p.jenis || '',
                          model: p.model || '',
                          tipe_desain: p.tipe_desain || ''
                        }));
                      }
                    }
                  } catch (e) {
                    console.error('Error parsing items_data:', e);
                  }
                  
                  return (
                    <tr key={order.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-semibold text-purple-600">
                          {order.no_orderan || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {order.nama ? order.nama.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="font-medium text-gray-900">{order.nama || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {produkList.length > 0 ? (
                          <div className="space-y-2">
                            {produkList.map((produk, idx) => (
                              <div key={idx}>
                                <div className="flex items-center gap-2">
                                  <Package size={14} className="text-gray-400" />
                                  <span className="text-sm font-medium text-gray-700">{produk.jenis_produk}</span>
                                </div>
                                <div className="text-xs text-gray-500 ml-5">
                                  {[produk.jenis, produk.model, produk.tipe_desain]
                                    .filter(Boolean)
                                    .join(' / ')}
                                </div>
                                {idx < produkList.length - 1 && <hr className="my-2 border-gray-200" />}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-700">
                            {formatTanggalSingkat(order.tanggal_pesan)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Deadline: {formatTanggalSingkat(order.deadline)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatRupiah(order.total_tagihan || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-gray-700">
                          {formatRupiah(order.dp || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`font-semibold ${
                          isPaid ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {formatRupiah(order.sisa || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-gray-700">
                          {formatRupiah(order.total_biaya || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`font-bold ${
                          labaKotor >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatRupiah(labaKotor)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          {isPaid ? (
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              <CheckCircle size={16} />
                              <span className="text-xs font-semibold">Lunas</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                              <XCircle size={16} />
                              <span className="text-xs font-semibold">Belum</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
        

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
              {/* Info Text - Simplified on Mobile */}
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                <span className="hidden sm:inline">
                  Menampilkan <span className="font-semibold">{startIndex + 1}</span> - 
                  <span className="font-semibold"> {Math.min(endIndex, filteredOrders.length)}</span> dari{' '}
                  <span className="font-semibold">{filteredOrders.length}</span> order
                </span>
                <span className="sm:hidden">
                  <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredOrders.length)}</span> dari{' '}
                  <span className="font-semibold">{filteredOrders.length}</span>
                </span>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-1.5 md:gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-1.5 md:p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                >
                  <ChevronLeft size={18} className="md:w-5 md:h-5" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Mobile: Tampilkan lebih sedikit halaman
                    const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;
                    const showOnMobile = page === 1 || 
                                        page === totalPages || 
                                        page === currentPage ||
                                        (page === currentPage - 1 && currentPage > 2) ||
                                        (page === currentPage + 1 && currentPage < totalPages - 1);
                    
                    // Desktop: Tampilkan lebih banyak halaman
                    const showOnDesktop = page === 1 ||
                                         page === totalPages ||
                                         (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (showOnDesktop) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                            page === currentPage
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-1 py-2 text-gray-400 text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-1.5 md:p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                >
                  <ChevronRight size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info jika tidak ada pagination */}
        {totalPages <= 1 && filteredOrders.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{filteredOrders.length}</span> order
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}