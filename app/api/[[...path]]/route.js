import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateToken, comparePassword, hashPassword, getAuthUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate order number
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `B13-${year}${month}${day}-${random}`;
};

// ============ AUTH ROUTES ============
async function handleLogin(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function handleVerifyToken(request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  return NextResponse.json({ success: true, user });
}

// ============ DASHBOARD ROUTES ============
async function handleDashboard(request) {
  try {
    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get pending orders (where sisa > 0)
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('sisa')
      .gt('sisa', 0);

    // Get completed orders (where sisa = 0)
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('sisa', 0);

    // Get total revenue
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total_tagihan, dp');

    const totalRevenue = allOrders?.reduce((sum, order) => sum + (parseFloat(order.dp) || 0), 0) || 0;
    const totalPending = pendingOrders?.reduce((sum, order) => sum + (parseFloat(order.sisa) || 0), 0) || 0;

    // Get recent orders (last 5)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders?.length || 0,
        completedOrders: completedOrders?.length || 0,
        totalRevenue: totalRevenue,
        totalPending: totalPending
      },
      recentOrders: recentOrders || []
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

// ============ ORDERS ROUTES ============
async function handleGetOrders(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function handleCreateOrder(request) {
  try {
    const body = await request.json();
    const orderId = uuidv4();
    const noOrderan = generateOrderNumber();

    const orderData = {
      id: orderId,
      no_orderan: noOrderan,
      nama: body.nama,
      nohp: body.nohp,
      alamat: body.alamat,
      jenis_produk: body.jenis_produk,
      desain: body.desain,
      subdesain: body.subdesain || null,
      toko: body.toko,
      jenis_kain: body.jenis_kain,
      warna: body.warna,
      lengan_pendek: body.lengan_pendek || false,
      lengan_panjang: body.lengan_panjang || false,
      ukuran_data: body.ukuran_data ? JSON.stringify(body.ukuran_data) : null,
      harga_satuan: parseFloat(body.harga_satuan) || 0,
      dp: parseFloat(body.dp) || 0,
      total_tagihan: parseFloat(body.total_tagihan) || 0,
      sisa: parseFloat(body.sisa) || 0,
      tanggal_pesan: body.tanggal_pesan,
      deadline: body.deadline,
      gambar_mockup: body.gambar_mockup || null
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Create order error:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function handleUpdateOrder(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Process ukuran_data if exists
    if (updateData.ukuran_data && typeof updateData.ukuran_data === 'object') {
      updateData.ukuran_data = JSON.stringify(updateData.ukuran_data);
    }

    // Ensure numeric fields are numbers
    if (updateData.harga_satuan) updateData.harga_satuan = parseFloat(updateData.harga_satuan);
    if (updateData.dp) updateData.dp = parseFloat(updateData.dp);
    if (updateData.total_tagihan) updateData.total_tagihan = parseFloat(updateData.total_tagihan);
    if (updateData.sisa) updateData.sisa = parseFloat(updateData.sisa);

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update order error:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function handleDeleteOrder(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ============ CATALOG ROUTES (Bahan, Produk, Percetakan, Jasa) ============
async function handleGetCatalog(tableName, request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: `Failed to fetch ${tableName}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error(`Get ${tableName} error:`, error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function handleCreateCatalog(tableName, request) {
  try {
    const body = await request.json();
    const itemId = `${tableName.substring(0, 3).toUpperCase()}-${Date.now()}`;

    const itemData = {
      id: itemId,
      ...body
    };

    const { data, error } = await supabase
      .from(tableName)
      .insert([itemData])
      .select()
      .single();

    if (error) {
      console.error(`Create ${tableName} error:`, error);
      return NextResponse.json({ error: `Failed to create ${tableName}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`Create ${tableName} error:`, error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function handleUpdateCatalog(tableName, request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Update ${tableName} error:`, error);
      return NextResponse.json({ error: `Failed to update ${tableName}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`Update ${tableName} error:`, error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function handleDeleteCatalog(tableName, request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: `Failed to delete ${tableName}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `${tableName} deleted` });
  } catch (error) {
    console.error(`Delete ${tableName} error:`, error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ============ PILIHAN (OPTIONS) ROUTES ============
async function handleGetPilihan(request) {
  try {
    const { data, error } = await supabase
      .from('pilihan')
      .select('*')
      .order('kategori', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
    }

    // Group by kategori
    const grouped = {};
    (data || []).forEach(item => {
      if (!grouped[item.kategori]) {
        grouped[item.kategori] = [];
      }
      grouped[item.kategori].push(item.nilai);
    });

    return NextResponse.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Get pilihan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ============ MAIN HANDLER ============
export async function GET(request, { params }) {
  const path = params?.path ? params.path.join('/') : '';

  // Public routes
  if (path === 'health') {
    return NextResponse.json({ status: 'ok' });
  }

  if (path === 'auth/verify') {
    return handleVerifyToken(request);
  }

  // Protected routes - check auth
  const user = getAuthUser(request);
  if (!user && path !== 'auth/login') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Route handlers
  if (path === 'dashboard') return handleDashboard(request);
  if (path === 'orders') return handleGetOrders(request);
  if (path === 'bahan') return handleGetCatalog('bahan', request);
  if (path === 'produk') return handleGetCatalog('produk', request);
  if (path === 'percetakan') return handleGetCatalog('percetakan', request);
  if (path === 'jasa') return handleGetCatalog('jasa', request);
  if (path === 'pilihan') return handleGetPilihan(request);

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request, { params }) {
  const path = params?.path ? params.path.join('/') : '';

  if (path === 'auth/login') {
    return handleLogin(request);
  }

  // Protected routes
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (path === 'orders') return handleCreateOrder(request);
  if (path === 'bahan') return handleCreateCatalog('bahan', request);
  if (path === 'produk') return handleCreateCatalog('produk', request);
  if (path === 'percetakan') return handleCreateCatalog('percetakan', request);
  if (path === 'jasa') return handleCreateCatalog('jasa', request);

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT(request, { params }) {
  const path = params?.path ? params.path.join('/') : '';

  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (path === 'orders') return handleUpdateOrder(request);
  if (path === 'bahan') return handleUpdateCatalog('bahan', request);
  if (path === 'produk') return handleUpdateCatalog('produk', request);
  if (path === 'percetakan') return handleUpdateCatalog('percetakan', request);
  if (path === 'jasa') return handleUpdateCatalog('jasa', request);

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(request, { params }) {
  const path = params?.path ? params.path.join('/') : '';

  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (path === 'orders') return handleDeleteOrder(request);
  if (path === 'bahan') return handleDeleteCatalog('bahan', request);
  if (path === 'produk') return handleDeleteCatalog('produk', request);
  if (path === 'percetakan') return handleDeleteCatalog('percetakan', request);
  if (path === 'jasa') return handleDeleteCatalog('jasa', request);

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}