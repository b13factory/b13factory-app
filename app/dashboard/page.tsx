"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Jika kamu punya package @supabase/supabase-js:
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Jika belum punya, kamu bisa hapus import di atas dan pakai definisi ini:
// type SupabaseUser = { id: string; email?: string | null };

interface Order {
  id: string | number;
  no_orderan?: string;
  nama?: string;
  jenis_produk?: string;
  deadline?: string;
  total_tagihan?: number;
  sisa?: number;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser as SupabaseUser | null);
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("orders").select("*");
        if (error) throw error;
        setOrders((data as Order[]) || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
    fetchOrders();
  }, []);

  const totalTagihan = orders.reduce(
    (sum, order) => sum + (order.total_tagihan || 0),
    0
  );
  const totalSisa = orders.reduce((sum, order) => sum + (order.sisa || 0), 0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Dashboard
            </h1>
            <p className="text-gray-500">
              Selamat datang kembali, {user?.email || "Pengguna"} 👋
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="mt-4 sm:mt-0">
            Logout
          </Button>
        </header>

        {/* Statistik */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card className="bg-white shadow-sm border rounded-2xl">
            <CardHeader>
              <CardTitle>Total Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-sky-700">
                Rp {totalTagihan.toLocaleString("id-ID")}
              </p>
              <span className="text-sm text-gray-500">
                Jumlah keseluruhan tagihan
              </span>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border rounded-2xl">
            <CardHeader>
              <CardTitle>Total Sisa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-amber-600">
                Rp {totalSisa.toLocaleString("id-ID")}
              </p>
              <span className="text-sm text-gray-500">
                Sisa tagihan belum dibayar
              </span>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border rounded-2xl">
            <CardHeader>
              <CardTitle>Jumlah Order</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-green-700">
                {orders.length}
              </p>
              <span className="text-sm text-gray-500">Total pesanan masuk</span>
            </CardContent>
          </Card>
        </section>

        {/* Tabel Order */}
        <section>
          <Card className="bg-white shadow-sm border rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daftar Order</CardTitle>
                <Button onClick={() => router.push("/orders/new")}>
                  + Tambah Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-gray-500">Memuat data...</div>
              ) : orders.length === 0 ? (
                <div className="text-gray-500 text-sm">Belum ada data order.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 border-b text-left">No</th>
                        <th className="px-4 py-2 border-b text-left">No Order</th>
                        <th className="px-4 py-2 border-b text-left">Nama</th>
                        <th className="px-4 py-2 border-b text-left">Jenis Produk</th>
                        <th className="px-4 py-2 border-b text-left">Deadline</th>
                        <th className="px-4 py-2 border-b text-right">Total</th>
                        <th className="px-4 py-2 border-b text-right">Sisa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr
                          key={String(order.id)}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{order.no_orderan ?? "-"}</td>
                          <td className="px-4 py-2">{order.nama ?? "-"}</td>
                          <td className="px-4 py-2">{order.jenis_produk ?? "-"}</td>
                          <td className="px-4 py-2">{order.deadline ?? "-"}</td>
                          <td className="px-4 py-2 text-right">
                            Rp {(order.total_tagihan ?? 0).toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-2 text-right">
                            Rp {(order.sisa ?? 0).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
