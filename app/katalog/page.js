'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatRupiah } from '@/lib/helpers';
import {
  Package,
  Shirt,
  Printer,
  Wrench,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Save,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartSelect } from '@/components/SmartSelect';

export default function KatalogPage() {
  const [activeTab, setActiveTab] = useState('produk');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentItem, setCurrentItem] = useState(null);

  // Data states
  const [produkList, setProdukList] = useState([]);
  const [kainList, setKainList] = useState([]);
  const [percetakanList, setPercetakanList] = useState([]);
  const [jasaList, setJasaList] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    kategori_produk: '',
    produk: '',
    jenis: '',
    model: '',
    tipe_desain: '',
    nama_toko: '',
    warna: '',
    harga: '',
    tipe_ukuran: '',
    jasa: '',
    tipe: ''
  });

  // Filtered options untuk dropdown cascade
  const [filteredJenisKain, setFilteredJenisKain] = useState([]);
  const [filteredWarna, setFilteredWarna] = useState([]);

  // Filtered options untuk produk cascade
  const [filteredProduk, setFilteredProduk] = useState([]);
  const [filteredJenisProduk, setFilteredJenisProduk] = useState([]);
  const [filteredModelProduk, setFilteredModelProduk] = useState([]);
  const [filteredTipeProduk, setFilteredTipeProduk] = useState([]);
  
  // Filtered options untuk percetakan cascade
  const [filteredModelCetak, setFilteredModelCetak] = useState([]);
  const [filteredTipeUkuran, setFilteredTipeUkuran] = useState([]);
  
  // Filtered options untuk jasa cascade
  const [filteredJenisJasa, setFilteredJenisJasa] = useState([]);
  const [filteredTipeJasa, setFilteredTipeJasa] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // ========== PRODUK CASCADE FILTERING ==========
  // Filter Produk berdasarkan Kategori Produk
  useEffect(() => {
    if (formData.kategori_produk) {
      const produkOptions = produkList
        .filter(item => item.kategori_produk === formData.kategori_produk)
        .map(item => item.produk);
      setFilteredProduk([...new Set(produkOptions)]);
    } else {
      setFilteredProduk([]);
    }
  }, [formData.kategori_produk, produkList]);

  // Filter Jenis berdasarkan Kategori + Produk
  useEffect(() => {
    if (formData.kategori_produk && formData.produk) {
      const jenisOptions = produkList
        .filter(item => 
          item.kategori_produk === formData.kategori_produk &&
          item.produk === formData.produk
        )
        .map(item => item.jenis);
      setFilteredJenisProduk([...new Set(jenisOptions)]);
    } else {
      setFilteredJenisProduk([]);
    }
  }, [formData.kategori_produk, formData.produk, produkList]);

  // Filter Model berdasarkan Kategori + Produk + Jenis
  useEffect(() => {
    if (formData.kategori_produk && formData.produk && formData.jenis) {
      const modelOptions = produkList
        .filter(item => 
          item.kategori_produk === formData.kategori_produk &&
          item.produk === formData.produk &&
          item.jenis === formData.jenis
        )
        .map(item => item.model);
      setFilteredModelProduk([...new Set(modelOptions)]);
    } else {
      setFilteredModelProduk([]);
    }
  }, [formData.kategori_produk, formData.produk, formData.jenis, produkList]);

  // Filter Tipe/Desain berdasarkan Kategori + Produk + Jenis + Model
  useEffect(() => {
    if (formData.kategori_produk && formData.produk && formData.jenis && formData.model) {
      const tipeOptions = produkList
        .filter(item => 
          item.kategori_produk === formData.kategori_produk &&
          item.produk === formData.produk &&
          item.jenis === formData.jenis &&
          item.model === formData.model &&
          item.tipe_desain
        )
        .map(item => item.tipe_desain);
      setFilteredTipeProduk([...new Set(tipeOptions)]);
    } else {
      setFilteredTipeProduk([]);
    }
  }, [formData.kategori_produk, formData.produk, formData.jenis, formData.model, produkList]);

  // ========== KAIN CASCADE FILTERING ==========
  // Filter Jenis Kain berdasarkan Toko
  useEffect(() => {
    if (formData.nama_toko) {
      const jenisOptions = kainList
        .filter(item => item.nama_toko === formData.nama_toko)
        .map(item => item.jenis);
      setFilteredJenisKain([...new Set(jenisOptions)]);
    } else {
      setFilteredJenisKain([]);
    }
  }, [formData.nama_toko, kainList]);

  // Filter Warna berdasarkan Toko + Jenis
  useEffect(() => {
    if (formData.nama_toko && formData.jenis) {
      const warnaOptions = kainList
        .filter(item => 
          item.nama_toko === formData.nama_toko && 
          item.jenis === formData.jenis
        )
        .map(item => item.warna);
      setFilteredWarna([...new Set(warnaOptions)]);
    } else {
      setFilteredWarna([]);
    }
  }, [formData.nama_toko, formData.jenis, kainList]);

  // ========== PERCETAKAN CASCADE FILTERING ==========
  // Filter Model berdasarkan Jenis
  useEffect(() => {
    if (formData.jenis && activeTab === 'percetakan') {
      const modelOptions = percetakanList
        .filter(item => item.jenis === formData.jenis)
        .map(item => item.model);
      setFilteredModelCetak([...new Set(modelOptions)]);
    } else {
      setFilteredModelCetak([]);
    }
  }, [formData.jenis, percetakanList, activeTab]);

  // Filter Tipe/Ukuran berdasarkan Jenis + Model
  useEffect(() => {
    if (formData.jenis && formData.model && activeTab === 'percetakan') {
      const tipeOptions = percetakanList
        .filter(item => 
          item.jenis === formData.jenis &&
          item.model === formData.model
        )
        .map(item => item.tipe_ukuran);
      setFilteredTipeUkuran([...new Set(tipeOptions)]);
    } else {
      setFilteredTipeUkuran([]);
    }
  }, [formData.jenis, formData.model, percetakanList, activeTab]);

  // ========== JASA CASCADE FILTERING ==========
  // Filter Jenis berdasarkan Jasa
  useEffect(() => {
    if (formData.jasa) {
      const jenisOptions = jasaList
        .filter(item => item.jasa === formData.jasa)
        .map(item => item.jenis);
      setFilteredJenisJasa([...new Set(jenisOptions)]);
    } else {
      setFilteredJenisJasa([]);
    }
  }, [formData.jasa, jasaList]);

  // Filter Tipe berdasarkan Jasa + Jenis
  useEffect(() => {
    if (formData.jasa && formData.jenis) {
      const tipeOptions = jasaList
        .filter(item => 
          item.jasa === formData.jasa &&
          item.jenis === formData.jenis
        )
        .map(item => item.tipe);
      setFilteredTipeJasa([...new Set(tipeOptions)]);
    } else {
      setFilteredTipeJasa([]);
    }
  }, [formData.jasa, formData.jenis, jasaList]);

  // Extract unique options dari data yang ada
  const uniqueOptions = useMemo(() => {
    return {
      // Produk options
      kategoriProduk: ['Garment', 'Advertising', 'Jasa', 'Lainnya'],
      produkNames: [...new Set(produkList.map(item => item.produk).filter(Boolean))],
      produkJenis: [...new Set(produkList.map(item => item.jenis).filter(Boolean))],
      produkModel: [...new Set(produkList.map(item => item.model).filter(Boolean))],
      produkTipe: [...new Set(produkList.map(item => item.tipe_desain).filter(Boolean))],
      
      // Kain options
      namaToko: [...new Set(kainList.map(item => item.nama_toko).filter(Boolean))],
      jenisKain: [...new Set(kainList.map(item => item.jenis).filter(Boolean))],
      warnaKain: [...new Set(kainList.map(item => item.warna).filter(Boolean))],
      
      // Percetakan options
      jenisCetak: [...new Set(percetakanList.map(item => item.jenis).filter(Boolean))],
      modelCetak: [...new Set(percetakanList.map(item => item.model).filter(Boolean))],
      tipeUkuran: [...new Set(percetakanList.map(item => item.tipe_ukuran).filter(Boolean))],
      
      // Jasa options
      jenisJasa: [...new Set(jasaList.map(item => item.jasa).filter(Boolean))],
      kategoriJasa: [...new Set(jasaList.map(item => item.jenis).filter(Boolean))],
      tipeJasa: [...new Set(jasaList.map(item => item.tipe).filter(Boolean))],
    };
  }, [produkList, kainList, percetakanList, jasaList]);

  async function fetchAllData() {
    setLoading(true);
    try {
      await Promise.all([
        fetchProduk(),
        fetchKain(),
        fetchPercetakan(),
        fetchJasa()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProduk() {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching produk:', error);
    } else {
      setProdukList(data || []);
    }
  }

  async function fetchKain() {
    const { data, error } = await supabase
      .from('bahan')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching kain:', error);
    } else {
      setKainList(data || []);
    }
  }

  async function fetchPercetakan() {
    const { data, error } = await supabase
      .from('percetakan')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching percetakan:', error);
    } else {
      setPercetakanList(data || []);
    }
  }

  async function fetchJasa() {
    const { data, error } = await supabase
      .from('jasa')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching jasa:', error);
    } else {
      setJasaList(data || []);
    }
  }

  function openAddModal(type) {
    setModalMode('add');
    setCurrentItem(null);
    setFormData({
      kategori_produk: '',
      produk: '',
      jenis: '',
      model: '',
      tipe_desain: '',
      nama_toko: '',
      warna: '',
      harga: '',
      tipe_ukuran: '',
      jasa: '',
      tipe: ''
    });
    setIsModalOpen(true);
  }

  function openEditModal(item, type) {
    setModalMode('edit');
    setCurrentItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  }

  // Fungsi duplikat - membuka form dengan data pre-filled
  function openDuplicateModal(item, type) {
    setModalMode('add'); // Mode add, bukan edit
    setCurrentItem(null); // Tidak ada current item
    setFormData({ ...item, id: undefined }); // Copy data tapi hapus ID
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (modalMode === 'add') {
        await handleAdd();
      } else {
        await handleUpdate();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan data: ' + error.message);
    }
  }

  async function handleAdd() {
    let tableName = '';
    let dataToInsert = {};

    if (activeTab === 'produk') {
      tableName = 'produk';
      const id = generateIdProduk();
      dataToInsert = {
        id,
        kategori_produk: formData.kategori_produk || null,
        produk: formData.produk,
        jenis: formData.jenis,
        model: formData.model,
        tipe_desain: formData.tipe_desain || null
      };
    } else if (activeTab === 'kain') {
      tableName = 'bahan';
      const id = generateIdKain();
      dataToInsert = {
        id,
        nama_toko: formData.nama_toko,
        jenis: formData.jenis,
        warna: formData.warna,
        harga: parseFloat(formData.harga)
      };
    } else if (activeTab === 'percetakan') {
      tableName = 'percetakan';
      const id = generateIdPercetakan();
      dataToInsert = {
        id,
        jenis: formData.jenis,
        model: formData.model,
        tipe_ukuran: formData.tipe_ukuran,
        harga: parseFloat(formData.harga)
      };
    } else if (activeTab === 'jasa') {
      tableName = 'jasa';
      const id = generateIdJasa();
      dataToInsert = {
        id,
        jasa: formData.jasa,
        jenis: formData.jenis,
        tipe: formData.tipe,
        harga: parseFloat(formData.harga)
      };
    }

    const { error } = await supabase
      .from(tableName)
      .insert([dataToInsert]);

    if (error) throw error;

    setIsModalOpen(false);
    await fetchAllData();
    alert('Data berhasil ditambahkan!');
  }

  async function handleUpdate() {
    let tableName = '';
    let dataToUpdate = {};

    if (activeTab === 'produk') {
      tableName = 'produk';
      dataToUpdate = {
        kategori_produk: formData.kategori_produk || null,
        produk: formData.produk,
        jenis: formData.jenis,
        model: formData.model,
        tipe_desain: formData.tipe_desain || null
      };
    } else if (activeTab === 'kain') {
      tableName = 'bahan';
      dataToUpdate = {
        nama_toko: formData.nama_toko,
        jenis: formData.jenis,
        warna: formData.warna,
        harga: parseFloat(formData.harga)
      };
    } else if (activeTab === 'percetakan') {
      tableName = 'percetakan';
      dataToUpdate = {
        jenis: formData.jenis,
        model: formData.model,
        tipe_ukuran: formData.tipe_ukuran,
        harga: parseFloat(formData.harga)
      };
    } else if (activeTab === 'jasa') {
      tableName = 'jasa';
      dataToUpdate = {
        jasa: formData.jasa,
        jenis: formData.jenis,
        tipe: formData.tipe,
        harga: parseFloat(formData.harga)
      };
    }

    const { error } = await supabase
      .from(tableName)
      .update(dataToUpdate)
      .eq('id', currentItem.id);

    if (error) throw error;

    setIsModalOpen(false);
    await fetchAllData();
    alert('Data berhasil diupdate!');
  }

  async function handleDelete(item, type) {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    let tableName = '';
    if (type === 'produk') tableName = 'produk';
    else if (type === 'kain') tableName = 'bahan';
    else if (type === 'percetakan') tableName = 'percetakan';
    else if (type === 'jasa') tableName = 'jasa';

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', item.id);

    if (error) {
      alert('Gagal menghapus data: ' + error.message);
    } else {
      alert('Data berhasil dihapus!');
      await fetchAllData();
    }
  }

  // Generate ID functions
  function generateIdProduk() {
    let id = '';
    if (formData.produk) id += formData.produk[0].toUpperCase();
    if (formData.jenis) id += formData.jenis[0].toUpperCase();
    if (formData.model) id += formData.model[0].toUpperCase();
    if (formData.tipe_desain) id += formData.tipe_desain[0].toUpperCase();
    id += Date.now().toString().slice(-4);
    return id;
  }

  function generateIdKain() {
    let id = '';
    if (formData.nama_toko) id += formData.nama_toko[0].toUpperCase();
    if (formData.jenis) id += formData.jenis[0].toUpperCase();
    if (formData.warna) id += formData.warna[0].toUpperCase();
    id += Date.now().toString().slice(-4);
    return id;
  }

  function generateIdPercetakan() {
    let id = '';
    if (formData.jenis) id += formData.jenis[0].toUpperCase();
    if (formData.model) id += formData.model[0].toUpperCase();
    if (formData.tipe_ukuran) id += formData.tipe_ukuran[0].toUpperCase();
    id += Date.now().toString().slice(-4);
    return id;
  }

  function generateIdJasa() {
    let id = '';
    if (formData.jasa) id += formData.jasa[0].toUpperCase();
    if (formData.jenis) id += formData.jenis[0].toUpperCase();
    if (formData.tipe) id += formData.tipe[0].toUpperCase();
    id += Date.now().toString().slice(-4);
    return id;
  }

  // Filter data
  function filterData(list) {
    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(query)
      );
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-sky-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Memuat data katalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-500 p-8 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Package className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Katalog Bahan</h1>
            <p className="text-sky-100 mt-1">Kelola katalog produk, kain, percetakan, dan jasa</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b-2 border-gray-100 px-6 pt-6">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl h-auto gap-2 bg-gray-50">
              <TabsTrigger 
                value="produk" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
              >
                <Package size={20} />
                <span className="font-semibold">Produk</span>
              </TabsTrigger>
              <TabsTrigger 
                value="kain" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
              >
                <Shirt size={20} />
                <span className="font-semibold">Kain</span>
              </TabsTrigger>
              <TabsTrigger 
                value="percetakan" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
              >
                <Printer size={20} />
                <span className="font-semibold">Percetakan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="jasa" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
              >
                <Wrench size={20} />
                <span className="font-semibold">Jasa</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Search & Add Button */}
          <div className="p-6 border-b-2 border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Cari data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            <Button
              onClick={() => openAddModal(activeTab)}
              className="bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={20} className="mr-2" />
              Tambah Data
            </Button>
          </div>

          {/* Tab Content - Produk */}
          <TabsContent value="produk" className="p-6">
            <ProdukTable
              data={filterData(produkList)}
              onEdit={(item) => openEditModal(item, 'produk')}
              onDelete={(item) => handleDelete(item, 'produk')}
              onDuplicate={(item) => openDuplicateModal(item, 'produk')}
            />
          </TabsContent>

          {/* Tab Content - Kain */}
          <TabsContent value="kain" className="p-6">
            <KainTable
              data={filterData(kainList)}
              onEdit={(item) => openEditModal(item, 'kain')}
              onDelete={(item) => handleDelete(item, 'kain')}
              onDuplicate={(item) => openDuplicateModal(item, 'kain')}
            />
          </TabsContent>

          {/* Tab Content - Percetakan */}
          <TabsContent value="percetakan" className="p-6">
            <PercetakanTable
              data={filterData(percetakanList)}
              onEdit={(item) => openEditModal(item, 'percetakan')}
              onDelete={(item) => handleDelete(item, 'percetakan')}
              onDuplicate={(item) => openDuplicateModal(item, 'percetakan')}
            />
          </TabsContent>

          {/* Tab Content - Jasa */}
          <TabsContent value="jasa" className="p-6">
            <JasaTable
              data={filterData(jasaList)}
              onEdit={(item) => openEditModal(item, 'jasa')}
              onDelete={(item) => handleDelete(item, 'jasa')}
              onDuplicate={(item) => openDuplicateModal(item, 'jasa')}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {modalMode === 'add' ? '➕ Tambah' : '✏️ Edit'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {modalMode === 'add' 
                ? 'Isi form di bawah untuk menambahkan data baru. Pilih dari dropdown atau ketik manual.' 
                : 'Update data yang sudah ada dengan form di bawah ini.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            {/* Form Produk */}
            {activeTab === 'produk' && (
              <div className="space-y-5">
                <div className="bg-sky-50 p-4 rounded-lg border-l-4 border-sky-500">
                  <Label htmlFor="kategori_produk" className="text-base font-semibold text-gray-800 mb-2 block">
                    Kategori Produk <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.kategori_produk} 
                    onValueChange={(value) => setFormData({ ...formData, kategori_produk: value })}
                    required
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 focus:border-sky-500 focus:ring-sky-500">
                      <SelectValue placeholder="Pilih kategori produk..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueOptions.kategoriProduk.map((kategori) => (
                        <SelectItem key={kategori} value={kategori}>
                          {kategori}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-1">Pilihan: Garment, Advertising, Jasa, atau Lainnya</p>
                </div>

                <SmartSelect
                  id="produk"
                  label="Nama Produk"
                  value={formData.produk}
                  onChange={(value) => setFormData({ ...formData, produk: value, jenis: '', model: '', tipe_desain: '' })}
                  options={filteredProduk.length > 0 ? filteredProduk : uniqueOptions.produkNames}
                  placeholder="Contoh: Kaos"
                  required
                />
                {formData.kategori_produk && filteredProduk.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan produk kategori {formData.kategori_produk}</p>
                )}
                
                <SmartSelect
                  id="jenis"
                  label="Jenis"
                  value={formData.jenis}
                  onChange={(value) => setFormData({ ...formData, jenis: value, model: '', tipe_desain: '' })}
                  options={filteredJenisProduk.length > 0 ? filteredJenisProduk : uniqueOptions.produkJenis}
                  placeholder="Contoh: Oblong"
                  required
                />
                {formData.kategori_produk && formData.produk && filteredJenisProduk.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan jenis dari {formData.produk}</p>
                )}
                
                <SmartSelect
                  id="model"
                  label="Model"
                  value={formData.model}
                  onChange={(value) => setFormData({ ...formData, model: value, tipe_desain: '' })}
                  options={filteredModelProduk.length > 0 ? filteredModelProduk : uniqueOptions.produkModel}
                  placeholder="Contoh: Lengan Pendek"
                  required
                />
                {formData.kategori_produk && formData.produk && formData.jenis && filteredModelProduk.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan model dari {formData.jenis}</p>
                )}
                
                <SmartSelect
                  id="tipe_desain"
                  label="Tipe/Desain"
                  value={formData.tipe_desain}
                  onChange={(value) => setFormData({ ...formData, tipe_desain: value })}
                  options={filteredTipeProduk.length > 0 ? filteredTipeProduk : uniqueOptions.produkTipe}
                  placeholder="Opsional"
                />
                {formData.kategori_produk && formData.produk && formData.jenis && formData.model && filteredTipeProduk.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan tipe dari {formData.model}</p>
                )}
              </div>
            )}

            {/* Form Kain */}
            {activeTab === 'kain' && (
              <div className="space-y-5">
                <SmartSelect
                  id="nama_toko"
                  label="Nama Toko"
                  value={formData.nama_toko}
                  onChange={(value) => {
                    setFormData({ ...formData, nama_toko: value, jenis: '', warna: '' });
                  }}
                  options={uniqueOptions.namaToko}
                  placeholder="Contoh: Toko Kain Sejahtera"
                  required
                />
                
                <SmartSelect
                  id="jenis"
                  label="Jenis Kain"
                  value={formData.jenis}
                  onChange={(value) => {
                    setFormData({ ...formData, jenis: value, warna: '' });
                  }}
                  options={filteredJenisKain.length > 0 ? filteredJenisKain : uniqueOptions.jenisKain}
                  placeholder="Contoh: Cotton Combed"
                  required
                />
                {formData.nama_toko && filteredJenisKain.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan jenis kain dari {formData.nama_toko}</p>
                )}
                
                <SmartSelect
                  id="warna"
                  label="Warna"
                  value={formData.warna}
                  onChange={(value) => setFormData({ ...formData, warna: value })}
                  options={filteredWarna.length > 0 ? filteredWarna : uniqueOptions.warnaKain}
                  placeholder="Contoh: Hitam"
                  required
                />
                {formData.nama_toko && formData.jenis && filteredWarna.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan warna dari {formData.nama_toko} - {formData.jenis}</p>
                )}
                
                <div>
                  <Label htmlFor="harga" className="text-base font-semibold text-gray-800 mb-2 block">
                    Harga per kg (Rp) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="harga"
                    type="number"
                    value={formData.harga}
                    onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                    required
                    min="0"
                    step="100"
                    placeholder="Contoh: 50000"
                    className="bg-white border-gray-300 focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Form Percetakan */}
            {activeTab === 'percetakan' && (
              <div className="space-y-5">
                <SmartSelect
                  id="jenis"
                  label="Jenis"
                  value={formData.jenis}
                  onChange={(value) => setFormData({ ...formData, jenis: value, model: '', tipe_ukuran: '' })}
                  options={uniqueOptions.jenisCetak}
                  placeholder="Contoh: Sablon"
                  required
                />
                
                <SmartSelect
                  id="model"
                  label="Model"
                  value={formData.model}
                  onChange={(value) => setFormData({ ...formData, model: value, tipe_ukuran: '' })}
                  options={filteredModelCetak.length > 0 ? filteredModelCetak : uniqueOptions.modelCetak}
                  placeholder="Contoh: DTF"
                  required
                />
                {formData.jenis && filteredModelCetak.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan model dari {formData.jenis}</p>
                )}
                
                <SmartSelect
                  id="tipe_ukuran"
                  label="Tipe/Ukuran"
                  value={formData.tipe_ukuran}
                  onChange={(value) => setFormData({ ...formData, tipe_ukuran: value })}
                  options={filteredTipeUkuran.length > 0 ? filteredTipeUkuran : uniqueOptions.tipeUkuran}
                  placeholder="Contoh: A4"
                  required
                />
                {formData.jenis && formData.model && filteredTipeUkuran.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan tipe/ukuran dari {formData.model}</p>
                )}
                
                <div>
                  <Label htmlFor="harga" className="text-base font-semibold text-gray-800 mb-2 block">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="harga"
                    type="number"
                    value={formData.harga}
                    onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                    required
                    min="0"
                    step="100"
                    placeholder="Contoh: 15000"
                    className="bg-white border-gray-300 focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Form Jasa */}
            {activeTab === 'jasa' && (
              <div className="space-y-5">
                <SmartSelect
                  id="jasa"
                  label="Jasa"
                  value={formData.jasa}
                  onChange={(value) => setFormData({ ...formData, jasa: value, jenis: '', tipe: '' })}
                  options={uniqueOptions.jenisJasa}
                  placeholder="Contoh: Jahit"
                  required
                />
                
                <SmartSelect
                  id="jenis"
                  label="Jenis"
                  value={formData.jenis}
                  onChange={(value) => setFormData({ ...formData, jenis: value, tipe: '' })}
                  options={filteredJenisJasa.length > 0 ? filteredJenisJasa : uniqueOptions.kategoriJasa}
                  placeholder="Contoh: Obras"
                  required
                />
                {formData.jasa && filteredJenisJasa.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan jenis dari {formData.jasa}</p>
                )}
                
                <SmartSelect
                  id="tipe"
                  label="Tipe"
                  value={formData.tipe}
                  onChange={(value) => setFormData({ ...formData, tipe: value })}
                  options={filteredTipeJasa.length > 0 ? filteredTipeJasa : uniqueOptions.tipeJasa}
                  placeholder="Contoh: Standar"
                  required
                />
                {formData.jasa && formData.jenis && filteredTipeJasa.length > 0 && (
                  <p className="text-xs text-sky-600 -mt-3">✓ Menampilkan tipe dari {formData.jenis}</p>
                )}
                
                <div>
                  <Label htmlFor="harga" className="text-base font-semibold text-gray-800 mb-2 block">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="harga"
                    type="number"
                    value={formData.harga}
                    onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                    required
                    min="0"
                    step="100"
                    placeholder="Contoh: 5000"
                    className="bg-white border-gray-300 focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="border-gray-300 hover:bg-gray-50"
              >
                <X size={18} className="mr-2" />
                Batal
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 shadow-md"
              >
                <Save size={18} className="mr-2" />
                {modalMode === 'add' ? 'Simpan' : 'Update'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Table Components
function ProdukTable({ data, onEdit, onDelete, onDuplicate }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Package size={80} className="mx-auto mb-4 opacity-30" />
        <p className="text-xl font-semibold">Belum ada data produk</p>
        <p className="text-sm mt-2">Klik tombol "Tambah Data" untuk menambahkan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Kategori</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Produk</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Jenis</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Model</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tipe/Desain</th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, index) => (
            <tr key={item.id} className="hover:bg-sky-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-mono bg-gray-50">{item.id}</td>
              <td className="px-6 py-4">
                {item.kategori_produk && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                    {item.kategori_produk}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{item.produk}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{item.jenis}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{item.model}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{item.tipe_desain || '-'}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(item)}
                    className="text-sky-600 hover:text-sky-700 hover:bg-sky-100"
                    title="Duplikat"
                  >
                    <Copy size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KainTable({ data, onEdit, onDelete, onDuplicate }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Shirt size={80} className="mx-auto mb-4 opacity-30" />
        <p className="text-xl font-semibold">Belum ada data kain</p>
        <p className="text-sm mt-2">Klik tombol "Tambah Data" untuk menambahkan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Toko</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Jenis Kain</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Warna</th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Harga/kg</th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-sky-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-mono bg-gray-50">{item.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{item.nama_toko}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{item.jenis}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {item.warna}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">
                {formatRupiah(item.harga)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(item)}
                    className="text-sky-600 hover:text-sky-700 hover:bg-sky-100"
                    title="Duplikat"
                  >
                    <Copy size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PercetakanTable({ data, onEdit, onDelete, onDuplicate }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Printer size={80} className="mx-auto mb-4 opacity-30" />
        <p className="text-xl font-semibold">Belum ada data percetakan</p>
        <p className="text-sm mt-2">Klik tombol "Tambah Data" untuk menambahkan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Jenis</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Model</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tipe/Ukuran</th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Harga</th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-sky-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-mono bg-gray-50">{item.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{item.jenis}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{item.model}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{item.tipe_ukuran}</td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">
                {formatRupiah(item.harga)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(item)}
                    className="text-sky-600 hover:text-sky-700 hover:bg-sky-100"
                    title="Duplikat"
                  >
                    <Copy size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JasaTable({ data, onEdit, onDelete, onDuplicate }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Wrench size={80} className="mx-auto mb-4 opacity-30" />
        <p className="text-xl font-semibold">Belum ada data jasa</p>
        <p className="text-sm mt-2">Klik tombol "Tambah Data" untuk menambahkan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Jasa</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Jenis</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tipe</th>
            <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Harga</th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-sky-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-mono bg-gray-50">{item.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{item.jasa}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{item.jenis}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{item.tipe}</td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">
                {formatRupiah(item.harga)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(item)}
                    className="text-sky-600 hover:text-sky-700 hover:bg-sky-100"
                    title="Duplikat"
                  >
                    <Copy size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}