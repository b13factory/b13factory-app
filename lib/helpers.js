// Helper functions untuk generate ID katalog

export function extractInitials(value) {
  const parts = value.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1) {
    return (parts[0][0] + parts[0][parts[0].length - 1]).toUpperCase();
  }
  return '--';
}

export function extractTwoFirst(value) {
  const parts = value.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  } else if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return '--';
}

export async function generateKainId(supabase, toko, jenis, warna) {
  const tokoInit = extractTwoFirst(toko);
  const jenisInit = extractTwoFirst(jenis);
  const warnaInit = extractTwoFirst(warna);
  
  const prefix = `${tokoInit}${jenisInit}${warnaInit}`;
  
  const { data, error } = await supabase
    .from('bahan')
    .select('id')
    .like('id', `${prefix}%`)
    .order('id', { ascending: false })
    .limit(1);
  
  let num = 1;
  if (data && data.length > 0) {
    const lastId = data[0].id;
    const lastNum = parseInt(lastId.slice(-2));
    if (!isNaN(lastNum)) {
      num = lastNum + 1;
    }
  }
  
  return `${prefix}${String(num).padStart(2, '0')}`;
}

export async function generateProdukId(supabase, produk, jenis, model, tipeDesain) {
  const produkInit = extractTwoFirst(produk);
  const jenisInit = extractTwoFirst(jenis);
  const modelInit = extractTwoFirst(model);
  const tipeInit = tipeDesain ? extractTwoFirst(tipeDesain) : 'XX';
  
  const prefix = `${produkInit}${jenisInit}${modelInit}${tipeInit}`;
  
  const { data } = await supabase
    .from('produk')
    .select('id')
    .like('id', `${prefix}%`)
    .order('id', { ascending: false })
    .limit(1);
  
  let num = 1;
  if (data && data.length > 0) {
    const lastId = data[0].id;
    const lastNum = parseInt(lastId.slice(-2));
    if (!isNaN(lastNum)) {
      num = lastNum + 1;
    }
  }
  
  return `${prefix}${String(num).padStart(2, '0')}`;
}

export async function generatePercetakanId(supabase, jenis, model, tipeUkuran) {
  const jenisInit = extractTwoFirst(jenis);
  const modelInit = extractTwoFirst(model);
  const tipeInit = extractTwoFirst(tipeUkuran);
  
  const prefix = `${jenisInit}${modelInit}${tipeInit}`;
  
  const { data } = await supabase
    .from('percetakan')
    .select('id')
    .like('id', `${prefix}%`)
    .order('id', { ascending: false })
    .limit(1);
  
  let num = 1;
  if (data && data.length > 0) {
    const lastId = data[0].id;
    const lastNum = parseInt(lastId.slice(-2));
    if (!isNaN(lastNum)) {
      num = lastNum + 1;
    }
  }
  
  return `${prefix}${String(num).padStart(2, '0')}`;
}

export async function generateJasaId(supabase, jasa, jenis, tipe) {
  const jasaInit = extractTwoFirst(jasa);
  const jenisInit = extractTwoFirst(jenis);
  const tipeInit = extractTwoFirst(tipe);
  
  const prefix = `${jasaInit}${jenisInit}${tipeInit}`;
  
  const { data } = await supabase
    .from('jasa')
    .select('id')
    .like('id', `${prefix}%`)
    .order('id', { ascending: false })
    .limit(1);
  
  let num = 1;
  if (data && data.length > 0) {
    const lastId = data[0].id;
    const lastNum = parseInt(lastId.slice(-2));
    if (!isNaN(lastNum)) {
      num = lastNum + 1;
    }
  }
  
  return `${prefix}${String(num).padStart(2, '0')}`;
}