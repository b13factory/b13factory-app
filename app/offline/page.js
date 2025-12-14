'use client';

export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tidak Ada Koneksi Internet
        </h1>
        <p className="text-gray-600 mb-6">
          Beberapa fitur mungkin tidak tersedia saat offline
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}