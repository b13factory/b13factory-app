'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatRupiah, formatDate } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = orders.filter(order =>
        order.nama.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        setFilteredOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/orders/${deleteId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Berhasil',
          description: 'Order berhasil dihapus',
        });
        fetchOrders();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus order',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const stats = {
    total: orders.length,
    lunas: orders.filter(o => o.sisa === 0 || o.sisa === '0').length,
    belumLunas: orders.filter(o => o.sisa > 0).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 text-white p-6 z-10">
        <h2 className="text-xl font-bold mb-8 text-orange-400 border-b border-slate-700 pb-3">
          B13 Garment & Adv
        </h2>
        <nav className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 rounded-md bg-slate-700 text-white"
          >
            <i className="fas fa-tachometer-alt w-5"></i>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/orderan"
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition text-gray-300"
          >
            <i className="fas fa-plus w-5"></i>
            <span>Input Orderan</span>
          </Link>
          <Link
            href="/katalog"
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition text-gray-300"
          >
            <i className="fas fa-book w-5"></i>
            <span>Katalog</span>
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition text-gray-300"
          >
            <i className="fas fa-history w-5"></i>
            <span>History Orderan</span>
          </Link>
          <Link
            href="/neraca"
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-700 transition text-gray-300"
          >
            <i className="fas fa-balance-scale w-5"></i>
            <span>Neraca Keuangan</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <i className="fas fa-tachometer-alt text-blue-600"></i>
              Dashboard Order
            </h1>
          </div>
          <Link href="/orderan">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <i className="fas fa-plus mr-2"></i>
              Tambah Order Baru
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Order</CardTitle>
              <i className="fas fa-clipboard-list text-2xl text-blue-500"></i>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lunas</CardTitle>
              <i className="fas fa-check-circle text-2xl text-green-500"></i>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.lunas}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belum Lunas</CardTitle>
              <i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.belumLunas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <Input
              placeholder="Cari nama pemesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Orders Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Daftar Order</CardTitle>
            <CardDescription>
              Total {filteredOrders.length} order ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-3xl text-blue-600 mb-3"></i>
                <p className="text-gray-600">Memuat data...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-inbox text-5xl mb-3 opacity-30"></i>
                <p>{searchQuery ? 'Tidak ada order yang sesuai pencarian' : 'Belum ada order'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Order</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Tanggal & Deadline</TableHead>
                      <TableHead className="text-right">Tagihan</TableHead>
                      <TableHead className="text-right">DP</TableHead>
                      <TableHead className="text-right">Sisa</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const isPaid = order.sisa === 0 || order.sisa === '0';
                      const itemsData = order.items_data || [];
                      const currentDate = new Date().toISOString().split('T')[0];
                      const isDeadlinePassed = order.deadline < currentDate;
                      
                      return (
                        <TableRow
                          key={order.id}
                          className={isPaid ? 'bg-green-50' : 'bg-red-50'}
                        >
                          <TableCell className="font-medium text-blue-600">
                            {order.no_orderan}
                          </TableCell>
                          <TableCell className="font-medium">{order.nama}</TableCell>
                          <TableCell>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {itemsData.map((item, idx) => (
                                <div key={idx} className="text-sm">
                                  <div className="font-medium">{item.jenis_produk}</div>
                                  <div className="text-gray-600 text-xs">
                                    {item.jenis}
                                    {item.model && ` / ${item.model}`}
                                    {item.tipe_desain && ` / ${item.tipe_desain}`}
                                  </div>
                                  {idx < itemsData.length - 1 && (
                                    <hr className="my-1" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(order.tanggal_pesan)}</div>
                              <div className={`text-xs ${isDeadlinePassed ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                Deadline: {formatDate(order.deadline)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(order.total_tagihan)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(order.dp)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={isPaid ? 'success' : 'destructive'}
                              className={`${isPaid ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
                            >
                              {formatRupiah(order.sisa)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Link href={`/order/${order.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                                  title="Detail"
                                >
                                  <i className="fas fa-eye"></i>
                                </Button>
                              </Link>
                              <Link href={`/orderan?edit=${order.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white"
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500 text-white hover:bg-red-600 hover:text-white"
                                onClick={() => setDeleteId(order.id)}
                                title="Hapus"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus order ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}