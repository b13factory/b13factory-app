// app/history/page.js - History Page
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatRupiah, formatTanggalSingkat } from '@/lib/helpers';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

import { 
  History as HistoryIcon,
  DollarSign,
  TrendingUp,
  ClipboardList,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Package,
  Calendar,
  Factory
} from 'lucide-react';

/**
 * Komponen Halaman History
 */
export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalOrder: 0,
    totalTagihan: 0,
    totalBiaya: 0,
    labaKotor: 0
  });

  useEffect(() => {
    fetchHistoryData();
  }, []);

  async function fetchHistoryData() {
    try {
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
        setLoading(false);
        return;
      }

      // Fetch all biaya produksi
      const { data: biayaData, error: biayaError } = await supabase
        .from('biaya_produksi')
        .select('*');

      if (biayaError) {
        console.error('Error fetching biaya produksi:', biayaError);
      }

      // Map biaya produksi to orders
      const ordersWithBiaya = (ordersData || []).map(order => {
        const orderBiaya = (biayaData || []).filter(b => b.order_id === order.id);
        const totalBiaya = orderBiaya.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
        return {
          ...order,
          total_biaya: totalBiaya,
          biaya_items: orderBiaya
        };
      });

      setOrders(ordersWithBiaya);

      // Calculate statistics
      const totalOrder = ordersWithBiaya.length;
      const totalTagihan = ordersWithBiaya.reduce((sum, order) => sum + (parseFloat(order.total_tagihan) || 0), 0);
      const totalBiaya = ordersWithBiaya.reduce((sum, order) => sum + (order.total_biaya || 0), 0);
      const labaKotor = totalTagihan - totalBiaya;

      setStats({
        totalOrder,
        totalTagihan,
        totalBiaya,
        labaKotor
      });

    } catch (error) {
      console.error('Error in fetchHistoryData:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(orderId) {
    if (!confirm('Apakah Anda yakin ingin menghapus order ini beserta biaya produksinya?')) {
      return;
    }

    try {
      // Biaya produksi akan otomatis terhapus karena ON DELETE CASCADE
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        alert('Gagal menghapus order: ' + error.message);
      } else {
        alert('Order berhasil dihapus');
        fetchHistoryData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Terjadi kesalahan saat menghapus order');
    }
  }

  // Filter orders berdasarkan search
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.nama?.toLowerCase().includes(query) ||
      order.no_orderan?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-sky-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat data history...</p>
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
            <HistoryIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">History Orderan Masuk</h1>
            <p className="text-sm md:text-base text-gray-600">Riwayat semua orderan yang pernah masuk</p>
          </div>
        </div>
      </div>
      
      {/* Grid untuk kartu statistik */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-6">
        <StatCard 
          title="Total Order"
          value={stats.totalOrder.toString()}
          icon={ClipboardList}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />

        <StatCard 
          title="Total Tagihan"
          value={formatRupiah(stats.totalTagihan)}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
        />

        <StatCard 
          title="Total Biaya Produksi"
          value={formatRupiah(stats.totalBiaya)}
          icon={Factory}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />

        <StatCard 
          title="Laba Kotor"
          value={formatRupiah(stats.labaKotor)}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Search & Table/Cards */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama pemesan atau no. order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ClipboardList size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {searchQuery ? 'Tidak ada order yang sesuai dengan pencarian' : 'Belum ada history order'}
              </p>
            </div>
          </div>
        )}

        {/* Mobile Card View (< lg) */}
        {filteredOrders.length > 0 && (
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const isPaid = (order.sisa || 0) === 0;
              
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
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  {/* Header Card - Nama & No Order */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {order.nama ? order.nama.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{order.nama || '-'}</h3>
                        <p className="text-sm text-purple-600 font-medium">{order.no_orderan || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Produk Info */}
                  {produkList.length > 0 && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package size={16} className="text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Produk</span>
                      </div>
                      <div className="space-y-2">
                        {produkList.map((produk, idx) => (
                          <div key={idx}>
                            <div className="text-sm font-medium text-gray-700">{produk.jenis_produk}</div>
                            <div className="text-xs text-gray-500">
                              {[produk.jenis, produk.model, produk.tipe_desain]
                                .filter(Boolean)
                                .join(' / ')}
                            </div>
                            {idx < produkList.length - 1 && <hr className="my-2 border-gray-200" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tanggal Info */}
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600 uppercase">Tanggal</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Pesan:</span> {formatTanggalSingkat(order.tanggal_pesan)}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Deadline:</span> {formatTanggalSingkat(order.deadline)}
                    </div>
                  </div>

                  {/* Financial Info Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {/* Total Tagihan */}
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Total Tagihan</div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatRupiah(order.total_tagihan || 0)}
                      </div>
                    </div>

                    {/* DP */}
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">DP</div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatRupiah(order.dp || 0)}
                      </div>
                    </div>

                    {/* Sisa */}
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Sisa Bayar</div>
                      <div className={`text-sm font-bold ${
                        isPaid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatRupiah(order.sisa || 0)}
                      </div>
                    </div>

                    {/* Biaya Produksi */}
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Biaya Produksi</div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatRupiah(order.total_biaya || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/order/${order.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors font-medium"
                    >
                      <Eye size={18} />
                      <span>Detail</span>
                    </Link>
                    <Link
                      href={`/orderan/edit/${order.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors font-medium"
                    >
                      <Edit size={18} />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Desktop Table View (>= lg) */}
        {filteredOrders.length > 0 && (
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">No. Order</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tgl Pesan & Deadline</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Tagihan</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">DP</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Sisa</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Biaya Produksi</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const isPaid = (order.sisa || 0) === 0;
                  
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
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-purple-600">
                          {order.no_orderan || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {order.nama ? order.nama.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="font-medium text-gray-900">{order.nama || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-700 font-medium">
                            {formatTanggalSingkat(order.tanggal_pesan)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>s/d {formatTanggalSingkat(order.deadline)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatRupiah(order.total_tagihan || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-700">
                          {formatRupiah(order.dp || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${
                          isPaid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatRupiah(order.sisa || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatRupiah(order.total_biaya || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/order/${order.id}`}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Detail"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            href={`/orderan/edit/${order.id}`}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        {filteredOrders.length > 0 && (
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{filteredOrders.length}</span> dari{' '}
              <span className="font-semibold">{orders.length}</span> order
            </p>
          </div>
        )}
      </div>
    </div>
  );
}