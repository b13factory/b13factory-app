import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { generateNoOrderan } from '@/lib/supabase';
import { 
  generateKainId, 
  generateProdukId, 
  generatePercetakanId, 
  generateJasaId 
} from '@/lib/helpers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

async function handleRoute(request, { params }) {
  const { path: pathSegments = [] } = params;
  const route = `/${pathSegments.join('/')}`;
  const method = request.method;

  try {
    // ==================== ORDERS ====================
    
    // GET /api/orders - Get all orders
    if (route === '/orders' && method === 'GET') {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    // GET /api/orders/:id - Get single order
    const orderMatch = route.match(/^\/orders\/([a-f0-9-]+)$/);
    if (orderMatch && method === 'GET') {
      const orderId = orderMatch[1];
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: biayaData } = await supabase
        .from('biaya_produksi')
        .select('*')
        .eq('order_id', orderId);

      return handleCORS(NextResponse.json({
        success: true,
        data: { ...orderData, biaya_produksi: biayaData || [] }
      }));
    }

    // POST /api/orders - Create new order
    if (route === '/orders' && method === 'POST') {
      const formData = await request.formData();
      
      const nama = formData.get('nama');
      const nohp = formData.get('nohp');
      const alamat = formData.get('alamat');
      const tanggal_pesan = formData.get('tanggal_pesan');
      const deadline = formData.get('deadline');
      const dp = parseFloat(formData.get('dp') || 0);
      const total_tagihan = parseFloat(formData.get('total_tagihan') || 0);
      const sisa = total_tagihan - dp;
      
      const itemsDataStr = formData.get('items_data');
      const items_data = itemsDataStr ? JSON.parse(itemsDataStr) : [];
      
      const biayaDataStr = formData.get('biaya_produksi');
      const biaya_produksi = biayaDataStr ? JSON.parse(biayaDataStr) : [];
      
      // Handle file upload
      let gambar_mockup = '';
      const file = formData.get('gambar_mockup');
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const timestamp = Date.now();
        const filename = `mockup_${nama.replace(/\s+/g, '_')}_${timestamp}.${file.name.split('.').pop()}`;
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const filepath = path.join(uploadsDir, filename);
        
        await mkdir(uploadsDir, { recursive: true });
        await writeFile(filepath, buffer);
        gambar_mockup = filename;
      }
      
      const no_orderan = await generateNoOrderan(nama, items_data[0]?.jenis_produk || 'ML');
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          no_orderan,
          nama,
          nohp,
          alamat,
          dp,
          total_tagihan,
          sisa,
          tanggal_pesan,
          deadline,
          gambar_mockup,
          items_data,
          jenis_produk: items_data[0]?.jenis_produk || '',
          desain: items_data[0]?.jenis || '',
          subdesain: items_data[0]?.model || '',
          toko: items_data[0]?.toko || '',
          jenis_kain: items_data[0]?.jenis_kain || '',
          warna: items_data[0]?.warna || '',
          lengan_pendek: false,
          lengan_panjang: false,
          ukuran_data: items_data[0]?.ukuran_data || null,
          harga_satuan: total_tagihan
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      if (biaya_produksi.length > 0) {
        const biayaRecords = biaya_produksi.map(bp => ({
          order_id: orderData.id,
          kategori: bp.kategori,
          jenis: bp.jenis,
          harga: bp.harga,
          jumlah: bp.jumlah,
          total: bp.harga * bp.jumlah,
        }));
        
        await supabase.from('biaya_produksi').insert(biayaRecords);
      }
      
      return handleCORS(NextResponse.json({
        success: true,
        data: orderData,
        message: 'Order berhasil dibuat'
      }));
    }

    // PUT /api/orders/:id - Update order
    if (orderMatch && method === 'PUT') {
      const orderId = orderMatch[1];
      const formData = await request.formData();
      
      const nama = formData.get('nama');
      const nohp = formData.get('nohp');
      const alamat = formData.get('alamat');
      const tanggal_pesan = formData.get('tanggal_pesan');
      const deadline = formData.get('deadline');
      const dp = parseFloat(formData.get('dp') || 0);
      const total_tagihan = parseFloat(formData.get('total_tagihan') || 0);
      const sisa = total_tagihan - dp;
      
      const itemsDataStr = formData.get('items_data');
      const items_data = itemsDataStr ? JSON.parse(itemsDataStr) : [];
      
      const biayaDataStr = formData.get('biaya_produksi');
      const biaya_produksi = biayaDataStr ? JSON.parse(biayaDataStr) : [];
      
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('gambar_mockup')
        .eq('id', orderId)
        .single();
      
      let gambar_mockup = existingOrder?.gambar_mockup || '';
      const file = formData.get('gambar_mockup');
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const timestamp = Date.now();
        const filename = `mockup_${nama.replace(/\s+/g, '_')}_${timestamp}.${file.name.split('.').pop()}`;
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const filepath = path.join(uploadsDir, filename);
        
        await mkdir(uploadsDir, { recursive: true });
        await writeFile(filepath, buffer);
        gambar_mockup = filename;
      }
      
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          nama,
          nohp,
          alamat,
          dp,
          total_tagihan,
          sisa,
          tanggal_pesan,
          deadline,
          gambar_mockup,
          items_data,
          jenis_produk: items_data[0]?.jenis_produk || '',
          desain: items_data[0]?.jenis || '',
          subdesain: items_data[0]?.model || '',
          toko: items_data[0]?.toko || '',
          jenis_kain: items_data[0]?.jenis_kain || '',
          warna: items_data[0]?.warna || '',
          harga_satuan: total_tagihan
        })
        .eq('id', orderId);
      
      if (orderError) throw orderError;
      
      await supabase.from('biaya_produksi').delete().eq('order_id', orderId);
      
      if (biaya_produksi.length > 0) {
        const biayaRecords = biaya_produksi.map(bp => ({
          order_id: orderId,
          kategori: bp.kategori,
          jenis: bp.jenis,
          harga: bp.harga,
          jumlah: bp.jumlah,
          total: bp.harga * bp.jumlah,
        }));
        
        await supabase.from('biaya_produksi').insert(biayaRecords);
      }
      
      return handleCORS(NextResponse.json({
        success: true,
        message: 'Order berhasil diupdate'
      }));
    }

    // DELETE /api/orders/:id
    if (orderMatch && method === 'DELETE') {
      const orderId = orderMatch[1];
      
      await supabase.from('biaya_produksi').delete().eq('order_id', orderId);
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({
        success: true,
        message: 'Order berhasil dihapus'
      }));
    }

    // POST /api/orders/:id/pelunasan - Update payment
    const pelunasanMatch = route.match(/^\/orders\/([a-f0-9-]+)\/pelunasan$/);
    if (pelunasanMatch && method === 'POST') {
      const orderId = pelunasanMatch[1];
      const body = await request.json();
      const { dp_tambahan } = body;
      
      const { data: order } = await supabase
        .from('orders')
        .select('dp, total_tagihan')
        .eq('id', orderId)
        .single();
      
      const newDp = order.dp + parseFloat(dp_tambahan);
      const newSisa = order.total_tagihan - newDp;
      
      const { error } = await supabase
        .from('orders')
        .update({ dp: newDp, sisa: newSisa })
        .eq('id', orderId);
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil diupdate'
      }));
    }

    // ==================== KATALOG BAHAN ====================
    
    if (route === '/katalog/bahan' && method === 'GET') {
      const { data, error } = await supabase
        .from('bahan')
        .select('*')
        .order('nama_toko');
      
      return handleCORS(NextResponse.json({ success: !error, data: data || [] }));
    }

    if (route === '/katalog/bahan' && method === 'POST') {
      const body = await request.json();
      const { nama_toko, jenis, warna, harga } = body;
      
      const id = await generateKainId(supabase, nama_toko, jenis, warna);
      
      const { data, error } = await supabase
        .from('bahan')
        .insert({ id, nama_toko, jenis, warna, harga })
        .select()
        .single();
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    const bahanMatch = route.match(/^\/katalog\/bahan\/(.+)$/);
    if (bahanMatch && method === 'PUT') {
      const id = decodeURIComponent(bahanMatch[1]);
      const body = await request.json();
      const { nama_toko, jenis, warna, harga } = body;
      
      const { data, error } = await supabase
        .from('bahan')
        .update({ nama_toko, jenis, warna, harga })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    if (bahanMatch && method === 'DELETE') {
      const id = decodeURIComponent(bahanMatch[1]);
      
      const { error } = await supabase
        .from('bahan')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true }));
    }

    // ==================== KATALOG PRODUK ====================
    
    if (route === '/katalog/produk' && method === 'GET') {
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .order('produk');
      
      return handleCORS(NextResponse.json({ success: !error, data: data || [] }));
    }

    if (route === '/katalog/produk' && method === 'POST') {
      const body = await request.json();
      const { produk, jenis, model, tipe_desain } = body;
      
      const id = await generateProdukId(supabase, produk, jenis, model, tipe_desain);
      
      const { data, error } = await supabase
        .from('produk')
        .insert({ id, produk, jenis, model, tipe_desain })
        .select()
        .single();
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    const produkMatch = route.match(/^\/katalog\/produk\/(.+)$/);
    if (produkMatch && method === 'PUT') {
      const id = decodeURIComponent(produkMatch[1]);
      const body = await request.json();
      const { produk, jenis, model, tipe_desain } = body;
      
      const { data, error } = await supabase
        .from('produk')
        .update({ produk, jenis, model, tipe_desain })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    if (produkMatch && method === 'DELETE') {
      const id = decodeURIComponent(produkMatch[1]);
      
      const { error } = await supabase
        .from('produk')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true }));
    }

    // ==================== KATALOG PERCETAKAN ====================
    
    if (route === '/katalog/percetakan' && method === 'GET') {
      const { data, error } = await supabase
        .from('percetakan')
        .select('*')
        .order('jenis');
      
      return handleCORS(NextResponse.json({ success: !error, data: data || [] }));
    }

    if (route === '/katalog/percetakan' && method === 'POST') {
      const body = await request.json();
      const { jenis, model, tipe_ukuran, harga } = body;
      
      const id = await generatePercetakanId(supabase, jenis, model, tipe_ukuran);
      
      const { data, error } = await supabase
        .from('percetakan')
        .insert({ id, jenis, model, tipe_ukuran, harga })
        .select()
        .single();
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    const percetakanMatch = route.match(/^\/katalog\/percetakan\/(.+)$/);
    if (percetakanMatch && method === 'PUT') {
      const id = decodeURIComponent(percetakanMatch[1]);
      const body = await request.json();
      const { jenis, model, tipe_ukuran, harga } = body;
      
      const { data, error } = await supabase
        .from('percetakan')
        .update({ jenis, model, tipe_ukuran, harga })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    if (percetakanMatch && method === 'DELETE') {
      const id = decodeURIComponent(percetakanMatch[1]);
      
      const { error } = await supabase
        .from('percetakan')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true }));
    }

    // ==================== KATALOG JASA ====================
    
    if (route === '/katalog/jasa' && method === 'GET') {
      const { data, error } = await supabase
        .from('jasa')
        .select('*')
        .order('jasa');
      
      return handleCORS(NextResponse.json({ success: !error, data: data || [] }));
    }

    if (route === '/katalog/jasa' && method === 'POST') {
      const body = await request.json();
      const { jasa, jenis, tipe, harga } = body;
      
      const id = await generateJasaId(supabase, jasa, jenis, tipe);
      
      const { data, error } = await supabase
        .from('jasa')
        .insert({ id, jasa, jenis, tipe, harga })
        .select()
        .single();
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    const jasaMatch = route.match(/^\/katalog\/jasa\/(.+)$/);
    if (jasaMatch && method === 'PUT') {
      const id = decodeURIComponent(jasaMatch[1]);
      const body = await request.json();
      const { jasa, jenis, tipe, harga } = body;
      
      const { data, error } = await supabase
        .from('jasa')
        .update({ jasa, jenis, tipe, harga })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    if (jasaMatch && method === 'DELETE') {
      const id = decodeURIComponent(jasaMatch[1]);
      
      const { error } = await supabase
        .from('jasa')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return handleCORS(NextResponse.json({ success: true }));
    }

    // ==================== DYNAMIC DROPDOWNS ====================
    
    // Distinct toko for bahan
    if (route === '/dropdown/toko' && method === 'GET') {
      const { data } = await supabase
        .from('bahan')
        .select('nama_toko')
        .order('nama_toko');
      
      const unique = [...new Set(data?.map(d => d.nama_toko) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Jenis kain by toko
    const tokoMatch = route.match(/^\/dropdown\/toko\/(.+)\/jenis$/);
    if (tokoMatch && method === 'GET') {
      const toko = decodeURIComponent(tokoMatch[1]);
      
      const { data } = await supabase
        .from('bahan')
        .select('jenis')
        .eq('nama_toko', toko)
        .order('jenis');
      
      const unique = [...new Set(data?.map(d => d.jenis) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Warna by toko and jenis
    const warnaMatch = route.match(/^\/dropdown\/toko\/(.+)\/jenis\/(.+)\/warna$/);
    if (warnaMatch && method === 'GET') {
      const toko = decodeURIComponent(warnaMatch[1]);
      const jenis = decodeURIComponent(warnaMatch[2]);
      
      const { data } = await supabase
        .from('bahan')
        .select('warna')
        .eq('nama_toko', toko)
        .eq('jenis', jenis)
        .order('warna');
      
      const unique = [...new Set(data?.map(d => d.warna) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Get bahan dengan harga by toko, jenis, warna
    const hargaBahanMatch = route.match(/^\/dropdown\/bahan\/harga$/);
    if (hargaBahanMatch && method === 'POST') {
      const body = await request.json();
      const { toko, jenis, warna } = body;
      
      const { data } = await supabase
        .from('bahan')
        .select('*')
        .eq('nama_toko', toko)
        .eq('jenis', jenis)
        .eq('warna', warna)
        .single();
      
      return handleCORS(NextResponse.json({ success: true, data }));
    }

    // Distinct produk names
    if (route === '/dropdown/produk' && method === 'GET') {
      const { data } = await supabase
        .from('produk')
        .select('produk')
        .order('produk');
      
      const unique = [...new Set(data?.map(d => d.produk) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Jenis by produk
    const produkJenisMatch = route.match(/^\/dropdown\/produk\/(.+)\/jenis$/);
    if (produkJenisMatch && method === 'GET') {
      const produk = decodeURIComponent(produkJenisMatch[1]);
      
      const { data } = await supabase
        .from('produk')
        .select('jenis')
        .eq('produk', produk)
        .order('jenis');
      
      const unique = [...new Set(data?.map(d => d.jenis) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Model by jenis
    const modelMatch = route.match(/^\/dropdown\/produk\/jenis\/(.+)\/model$/);
    if (modelMatch && method === 'GET') {
      const jenis = decodeURIComponent(modelMatch[1]);
      
      const { data } = await supabase
        .from('produk')
        .select('model')
        .eq('jenis', jenis)
        .order('model');
      
      const unique = [...new Set(data?.map(d => d.model) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Tipe desain by model
    const tipeDesainMatch = route.match(/^\/dropdown\/produk\/model\/(.+)\/tipe-desain$/);
    if (tipeDesainMatch && method === 'GET') {
      const model = decodeURIComponent(tipeDesainMatch[1]);
      
      const { data } = await supabase
        .from('produk')
        .select('tipe_desain')
        .eq('model', model)
        .order('tipe_desain');
      
      const unique = [...new Set(data?.map(d => d.tipe_desain).filter(Boolean) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Distinct percetakan jenis
    if (route === '/dropdown/percetakan/jenis' && method === 'GET') {
      const { data } = await supabase
        .from('percetakan')
        .select('jenis')
        .order('jenis');
      
      const unique = [...new Set(data?.map(d => d.jenis) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Model percetakan by jenis
    const percetakanModelMatch = route.match(/^\/dropdown\/percetakan\/jenis\/(.+)\/model$/);
    if (percetakanModelMatch && method === 'GET') {
      const jenis = decodeURIComponent(percetakanModelMatch[1]);
      
      const { data } = await supabase
        .from('percetakan')
        .select('model')
        .eq('jenis', jenis)
        .order('model');
      
      const unique = [...new Set(data?.map(d => d.model) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Tipe ukuran by model
    const tipeUkuranMatch = route.match(/^\/dropdown\/percetakan\/model\/(.+)\/tipe-ukuran$/);
    if (tipeUkuranMatch && method === 'GET') {
      const model = decodeURIComponent(tipeUkuranMatch[1]);
      
      const { data } = await supabase
        .from('percetakan')
        .select('tipe_ukuran, harga')
        .eq('model', model)
        .order('tipe_ukuran');
      
      return handleCORS(NextResponse.json({ success: true, data: data || [] }));
    }

    // Distinct jasa names
    if (route === '/dropdown/jasa' && method === 'GET') {
      const { data } = await supabase
        .from('jasa')
        .select('jasa')
        .order('jasa');
      
      const unique = [...new Set(data?.map(d => d.jasa) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Jenis jasa by jasa
    const jasaJenisMatch = route.match(/^\/dropdown\/jasa\/(.+)\/jenis$/);
    if (jasaJenisMatch && method === 'GET') {
      const jasa = decodeURIComponent(jasaJenisMatch[1]);
      
      const { data } = await supabase
        .from('jasa')
        .select('jenis')
        .eq('jasa', jasa)
        .order('jenis');
      
      const unique = [...new Set(data?.map(d => d.jenis) || [])];
      return handleCORS(NextResponse.json({ success: true, data: unique }));
    }

    // Tipe jasa by jenis
    const tipejasaMatch = route.match(/^\/dropdown\/jasa\/jenis\/(.+)\/tipe$/);
    if (tipejasaMatch && method === 'GET') {
      const jenis = decodeURIComponent(tipejasaMatch[1]);
      
      const { data } = await supabase
        .from('jasa')
        .select('tipe, harga')
        .eq('jenis', jenis)
        .order('tipe');
      
      return handleCORS(NextResponse.json({ success: true, data: data || [] }));
    }

    // Not found
    return handleCORS(NextResponse.json(
      { success: false, error: `Route ${route} not found` },
      { status: 404 }
    ));

  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    ));
  }
}

export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;