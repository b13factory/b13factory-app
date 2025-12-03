// app/page.js - Dashboard Page
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatRupiah, formatTanggalSingkat, isDeadlinePassed } from '@/lib/helpers';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

import { 
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Package
} from 'lucide-react';

/**
 * Komponen Halaman Dashboard
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalOrder: 0,
    lunas: 0,
    belumLunas: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        setLoading(false);
        return;
      }

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } else {
        setOrders(ordersData || []);
        
        // Hitung statistik
        const total = ordersData?.length || 0;
        const lunas = ordersData?.filter(order => (order.sisa || 0) === 0).length || 0;
        const belumLunas = total - lunas;
        
        setStats({
          totalOrder: total,
          lunas: lunas,
          belumLunas: belumLunas
        });
      }
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(orderId) {
    if (!confirm('Apakah Anda yakin ingin menghapus order ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        alert('Gagal menghapus order: ' + error.message);
      } else {
        alert('Order berhasil dihapus');
        fetchOrders();
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
      order.no_orderan?.toLowerCase().includes(query) ||
      order.jenis_produk?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-sky-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg">
              <ClipboardList className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Order</h1>
          </div>
          <p className="text-gray-600">Kelola semua orderan B13 Garment</p>
        </div>
        <Link
          href="/orderan"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white rounded-lg font-medium shadow-lg shadow-sky-200 hover:shadow-xl hover:from-sky-700 hover:to-sky-600 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <Plus size={20} />
          <span>Tambah Order Baru</span>
        </Link>
      </div>
      
      {/* Grid untuk kartu statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Order"
          value={stats.totalOrder.toString()}
          icon={ClipboardList}
          gradient="bg-gradient-to-br from-sky-500 to-sky-600"
        />

        <StatCard 
          title="Lunas"
          value={stats.lunas.toString()}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />

        <StatCard 
          title="Belum Lunas"
          value={stats.belumLunas.toString()}
          icon={AlertCircle}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama pemesan, no. order, atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">No. Order</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Produk</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tanggal & Deadline</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Tagihan</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">DP</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Sisa</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ClipboardList size={64} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {searchQuery ? 'Tidak ada order yang sesuai dengan pencarian' : 'Belum ada order'}
                      </p>
                      {!searchQuery && (
                        <Link
                          href="/orderan"
                          className="mt-4 text-sky-600 hover:text-sky-700 font-medium"
                        >
                          Tambah order pertama →
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPaid = (order.sisa || 0) === 0;
                  const deadlinePassed = isDeadlinePassed(order.deadline);
                  
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
                        <span className="font-semibold text-sky-600">
                          {order.no_orderan || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-bold">
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
                          <div className="text-sm text-gray-700">
                            {formatTanggalSingkat(order.tanggal_pesan)}
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${
                            deadlinePassed ? 'text-red-600 font-semibold' : 'text-gray-500'
                          }`}>
                            <Calendar size={12} />
                            <span>Deadline: {formatTanggalSingkat(order.deadline)}</span>
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
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