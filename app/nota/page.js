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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FileText className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Halaman Nota</h1>
            <p className="text-blue-100 mt-1">Kelola dan cetak nota pesanan pelanggan</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Cari berdasarkan nama, tanggal, atau nomor orderan..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 py-6 text-base"
            />
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
              className="px-6"
            >
              Reset
            </Button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-3 text-sm text-gray-600">
            Ditemukan <span className="font-semibold text-blue-600">{filteredOrders.length}</span> hasil
          </p>
        )}
      </div>

      {/* Table Nota */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileText size={64} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {searchQuery 
                          ? 'Tidak ada nota yang sesuai pencarian' 
                          : 'Belum ada data nota'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => {
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold">{startIndex + 1}</span> - 
                <span className="font-semibold"> {Math.min(endIndex, filteredOrders.length)}</span> dari{' '}
                <span className="font-semibold">{filteredOrders.length}</span> nota
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Preview Section */}
      {selectedOrder && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-blue-600" size={24} />
              Detail Nota - {selectedOrder.no_orderan}
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Data Customer */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="text-blue-600" size={18} />
                    Informasi Customer
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Nama</p>
                        <p className="font-medium text-gray-900">{selectedOrder.nama}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">No. HP/WhatsApp</p>
                        <p className="font-medium text-gray-900">{selectedOrder.nohp}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Alamat</p>
                        <p className="font-medium text-gray-900">{selectedOrder.alamat}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="text-green-600" size={18} />
                    Tanggal & Deadline
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Pemesanan</p>
                      <p className="font-medium text-gray-900">{formatTanggalSingkat(selectedOrder.tanggal_pesan)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Deadline</p>
                      <p className="font-medium text-gray-900">{formatTanggalSingkat(selectedOrder.deadline)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <DollarSign className="text-amber-600" size={18} />
                    Pembayaran
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Tagihan</span>
                      <span className="font-bold text-gray-900">{formatRupiah(selectedOrder.total_tagihan || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">DP/Bayar</span>
                      <span className="font-semibold text-green-600">{formatRupiah(selectedOrder.dp || 0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-amber-300">
                      <span className="text-sm font-semibold text-gray-700">Sisa</span>
                      <span className="font-bold text-red-600">{formatRupiah(selectedOrder.sisa || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Mockup & Items */}
              <div className="space-y-4">
                {/* Mockup Image */}
                {selectedOrder.gambar_mockup ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ImageIcon className="text-gray-600" size={18} />
                      Gambar Mockup
                    </h4>
                    <img
                      src={selectedOrder.gambar_mockup}
                      alt="Mockup"
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
                    <ImageIcon className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-sm text-gray-500">Tidak ada mockup</p>
                  </div>
                )}

                {/* Items Detail */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Package className="text-purple-600" size={18} />
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