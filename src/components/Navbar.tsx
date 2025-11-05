import Link from "next/link";
export default function Navbar() {
  return (
    <nav className="bg-blue-700 p-4 text-white flex gap-4">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/items">Barang</Link>
      <Link href="/suppliers">Supplier</Link>
      <Link href="/transactions">Transaksi</Link>
      <Link href="/reports">Laporan</Link>
      <Link href="/login">Logout</Link>
    </nav>
  );
}