// app/nota/page.js - Halaman List Nota
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { formatRupiah, formatTanggalSingkat } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Edit,
  Package,
  User,
  Calendar,
  DollarSign,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export default function NotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applySearch();
  }, [orders, searchQuery]);

  async function fetchOrders() {
    try {
      setLoading(true);

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .order('tanggal_pesan', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
        return;
      }

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function applySearch() {
    let filtered = [...orders];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        // Search by nama
        const namaMatch = order.nama?.toLowerCase().includes(query);
        
        // Search by tanggal
        const tanggalMatch = order.tanggal_pesan?.includes(query);
        
        // Search by no_orderan
        const noOrderMatch = order.no_orderan?.toLowerCase().includes(query);
        
        return namaMatch || tanggalMatch || noOrderMatch;
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page on search
  }

  function handleSearch(e) {
    setSearchQuery(e.target.value);
  }

  function handleRowClick(order) {
    setSelectedOrder(order);
  }

  function handlePreview(orderId) {
    router.push(`/nota/preview/${orderId}`);
  }

  function handleEdit(orderId) {
    router.push(`/nota/edit/${orderId}`);
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
          <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat data nota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-6 sm:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-1 sm:mb-2">
          <div className="p-1.5 sm:p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
            <FileText className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">Halaman Nota</h1>
            <p className="text-blue-100 mt-0.5 text-[11px] sm:text-xs md:text-sm">Kelola dan cetak nota pesanan pelanggan</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Cari nama, tanggal, atau no. order..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
            />
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
              className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
            >
              Reset
            </Button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-3 text-xs sm:text-sm text-gray-600">
            Ditemukan <span className="font-semibold text-blue-600">{filteredOrders.length}</span> hasil
          </p>
        )}
      </div>

      {/* Table/Cards Nota */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
        {/* Empty State */}
        {currentOrders.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FileText size={64} className="mb-4 opacity-50" />
              <p className="text-base sm:text-lg font-medium">
                {searchQuery 
                  ? 'Tidak ada nota yang sesuai pencarian' 
                  : 'Belum ada data nota'}
              </p>
            </div>
          </div>
        )}

        {/* Mobile Card View (< lg) */}
        {currentOrders.length > 0 && (
          <div className="lg:hidden divide-y divide-gray-200">
            {currentOrders.map((order) => {
              const isPaid = parseFloat(order.sisa || 0) === 0;
              const isSelected = selectedOrder?.id === order.id;
              
              return (
                <div 
                  key={order.id} 
                  onClick={() => handleRowClick(order)}
                  className={`p-4 transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-100' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Header Card - Nama & No Order */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {order.nama ? order.nama.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{order.nama || '-'}</h3>
                        <p className="text-sm text-blue-600 font-medium">{order.no_orderan || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    {isPaid ? (
                      <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                        <CheckCircle size={16} />
                        <span className="text-xs font-semibold">Lunas</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                        <XCircle size={16} />
                        <span className="text-xs font-semibold">Belum Lunas</span>
                      </div>
                    )}
                  </div>

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

                  {/* Financial Info */}
                  <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={16} className="text-amber-600" />
                      <span className="text-xs font-semibold text-amber-600 uppercase">Pembayaran</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Tagihan</span>
                        <span className="font-bold text-gray-900">{formatRupiah(order.total_tagihan || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">DP/Bayar</span>
                        <span className="font-semibold text-green-600">{formatRupiah(order.dp || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-1 border-t border-amber-200">
                        <span className="font-medium text-gray-700">Sisa</span>
                        <span className={`font-bold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                          {formatRupiah(order.sisa || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(order.id)}
                      className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50 h-11"
                    >
                      <Eye size={16} className="mr-1.5" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(order.id)}
                      className="flex-1 text-green-600 border-green-300 hover:bg-green-50 h-11"
                    >
                      <Edit size={16} className="mr-1.5" />
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Desktop Table View (>= lg) */}
        {currentOrders.length > 0 && (
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">No. Orderan</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Nama Customer</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Tanggal Pesan</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Deadline</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">Total Tagihan</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentOrders.map((order) => {
                  const isPaid = parseFloat(order.sisa || 0) === 0;
                  const isSelected = selectedOrder?.id === order.id;
                  
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => handleRowClick(order)}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-100 hover:bg-blue-100' 
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span className="font-bold text-blue-600">
                          {order.no_orderan || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {order.nama ? order.nama.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="font-medium text-gray-900">{order.nama || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">
                          {formatTanggalSingkat(order.tanggal_pesan)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">
                          {formatTanggalSingkat(order.deadline)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatRupiah(order.total_tagihan || 0)}
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
                              <span className="text-xs font-semibold">Belum Lunas</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(order.id)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Eye size={16} className="mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(order.id)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600">
                Menampilkan <span className="font-semibold">{startIndex + 1}</span> - 
                <span className="font-semibold"> {Math.min(endIndex, filteredOrders.length)}</span> dari{' '}
                <span className="font-semibold">{filteredOrders.length}</span> nota
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        page === currentPage
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Preview Section */}
      {selectedOrder && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border-2 border-blue-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b-2 border-blue-200">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-blue-600 flex-shrink-0" size={18} />
              <span className="truncate">Detail Nota - {selectedOrder.no_orderan}</span>
            </h3>
          </div>
          
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Left Column - Data Customer */}
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                    <User className="text-blue-600 flex-shrink-0" size={14} />
                    Informasi Customer
                  </h4>
                  <div className="space-y-2 sm:space-y-2.5">
                    <div className="flex items-start gap-2">
                      <User size={12} className="text-gray-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-gray-500">Nama</p>
                        <p className="font-medium text-xs sm:text-sm md:text-base text-gray-900 break-words">{selectedOrder.nama}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone size={12} className="text-gray-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-gray-500">No. HP/WhatsApp</p>
                        <p className="font-medium text-xs sm:text-sm md:text-base text-gray-900 break-all">{selectedOrder.nohp}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={12} className="text-gray-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-gray-500">Alamat</p>
                        <p className="font-medium text-xs sm:text-sm md:text-base text-gray-900 break-words leading-relaxed">{selectedOrder.alamat}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="text-green-600 flex-shrink-0" size={14} />
                    Tanggal & Deadline
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">Tanggal Pemesanan</p>
                      <p className="font-medium text-xs sm:text-sm md:text-base text-gray-900">{formatTanggalSingkat(selectedOrder.tanggal_pesan)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">Deadline</p>
                      <p className="font-medium text-xs sm:text-sm md:text-base text-gray-900">{formatTanggalSingkat(selectedOrder.deadline)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 sm:p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                    <DollarSign className="text-amber-600 flex-shrink-0" size={14} />
                    Pembayaran
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">Total Tagihan</span>
                      <span className="font-bold text-xs sm:text-sm md:text-base text-gray-900 text-right">{formatRupiah(selectedOrder.total_tagihan || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">DP/Bayar</span>
                      <span className="font-semibold text-xs sm:text-sm md:text-base text-green-600 text-right">{formatRupiah(selectedOrder.dp || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2 pt-1.5 sm:pt-2 border-t border-amber-300">
                      <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-700">Sisa</span>
                      <span className="font-bold text-xs sm:text-sm md:text-base text-red-600 text-right">{formatRupiah(selectedOrder.sisa || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Mockup & Items */}
              <div className="space-y-3 sm:space-y-4">
                {/* Mockup Image */}
                {selectedOrder.gambar_mockup ? (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <ImageIcon className="text-gray-600 flex-shrink-0" size={14} />
                      Gambar Mockup
                    </h4>
                    <img
                      src={selectedOrder.gambar_mockup}
                      alt="Mockup"
                      className="w-full rounded-lg shadow-md object-contain max-h-64 sm:max-h-80 md:max-h-96"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-lg border border-gray-200 text-center">
                    <ImageIcon className="mx-auto text-gray-300 mb-2" size={28} />
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Tidak ada mockup</p>
                  </div>
                )}

                {/* Items Detail */}
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                    <Package className="text-purple-600 flex-shrink-0" size={14} />
                    Detail Pesanan
                  </h4>
                  <OrderItemsPreview order={selectedOrder} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to preview order items
function OrderItemsPreview({ order }) {
  let itemsData = null;
  
  try {
    if (order.items_data) {
      itemsData = typeof order.items_data === 'string' 
        ? JSON.parse(order.items_data) 
        : order.items_data;
    }
  } catch (e) {
    console.error('Error parsing items_data:', e);
  }

  if (!itemsData || !itemsData.pesanan || itemsData.pesanan.length === 0) {
    return <p className="text-sm text-gray-500">Tidak ada detail pesanan</p>;
  }

  return (
    <div className="space-y-3">
      {itemsData.pesanan.map((pesanan, idx) => (
        <div key={idx} className="bg-white p-3 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
              #{idx + 1}
            </span>
            <span className="font-semibold text-gray-800">{pesanan.kategori_produk}</span>
          </div>
          
          {pesanan.kategori_produk === 'Garment' && (
            <div className="text-sm space-y-1 text-gray-700">
              <p><span className="font-medium">Produk:</span> {pesanan.produk || '-'}</p>
              <p><span className="font-medium">Jenis:</span> {pesanan.jenis || '-'}</p>
              <p><span className="font-medium">Model:</span> {pesanan.model || '-'}</p>
              <p><span className="font-medium">Bahan:</span> {pesanan.jenis_kain || '-'} - {pesanan.warna || '-'}</p>
              
              {pesanan.lengan_pendek && (
                <div className="mt-2 bg-blue-50 p-2 rounded">
                  <p className="font-medium text-blue-900">Lengan Pendek:</p>
                  <div className="grid grid-cols-5 gap-1 mt-1">
                    {Object.entries(pesanan.ukuran_pendek || {}).map(([size, qty]) => (
                      qty > 0 && (
                        <span key={size} className="text-xs bg-white px-2 py-1 rounded border">
                          {size}: {qty}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              {pesanan.lengan_panjang && (
                <div className="mt-2 bg-green-50 p-2 rounded">
                  <p className="font-medium text-green-900">Lengan Panjang:</p>
                  <div className="grid grid-cols-5 gap-1 mt-1">
                    {Object.entries(pesanan.ukuran_panjang || {}).map(([size, qty]) => (
                      qty > 0 && (
                        <span key={size} className="text-xs bg-white px-2 py-1 rounded border">
                          {size}: {qty}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {pesanan.kategori_produk === 'Advertising' && (
            <div className="text-sm space-y-1 text-gray-700">
              <p><span className="font-medium">Jenis:</span> {pesanan.produk || '-'}</p>
              <p><span className="font-medium">Model:</span> {pesanan.jenis || '-'}</p>
              {pesanan.items_advertising && pesanan.items_advertising.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Items:</p>
                  {pesanan.items_advertising.map((item, i) => (
                    <p key={i} className="text-xs">
                      • Dimensi: {item.dimensi}, Harga: {formatRupiah(item.harga)}, Jumlah: {item.jumlah}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {(pesanan.kategori_produk === 'Jasa' || pesanan.kategori_produk === 'Lainnya') && (
            <div className="text-sm space-y-1 text-gray-700">
              <p><span className="font-medium">Jenis:</span> {pesanan.produk || '-'}</p>
              <p><span className="font-medium">Model:</span> {pesanan.jenis || '-'}</p>
              {pesanan.items_jasa && pesanan.items_jasa.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Items:</p>
                  {pesanan.items_jasa.map((item, i) => (
                    <p key={i} className="text-xs">
                      • {item.keterangan}: {formatRupiah(item.harga)} x {item.jumlah}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}