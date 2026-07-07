'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Category Actions
export async function createCategory(name: string, icon: string, sortOrder: number) {
  if (!name || name.trim() === '') {
    return { success: false, error: 'Name is required' };
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('categories').insert({ name, icon, sort_order: sortOrder });
    if (error) {
      return { success: false, error: error.message };
    }
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menambahkan kategori';
    return { success: false, error: msg };
  }
}

export async function deleteCategory(id: string) {
  if (!id) {
    return { success: false, error: 'ID is required' };
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        return { success: false, error: 'Kategori tidak bisa dihapus karena memiliki produk terkait. Silakan hapus produk di dalamnya terlebih dahulu.' };
      }
      return { success: false, error: error.message };
    }
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus kategori';
    return { success: false, error: msg };
  }
}

// Product Actions
export async function createProduct(data: {
  name: string;
  category_id: string;
  description: string;
  price: number;
  image_url: string;
  available: boolean;
  display_order: number;
  is_featured: boolean;
}) {
  if (!data.name || data.name.trim() === '') {
    return { success: false, error: 'Name is required' };
  }
  if (!data.category_id) {
    return { success: false, error: 'Category ID is required' };
  }
  if (data.price < 0) {
    return { success: false, error: 'Price must be greater than or equal to 0' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('products').insert({
      name: data.name,
      category_id: data.category_id,
      description: data.description,
      price: data.price,
      image_url: data.image_url,
      available: data.available,
      display_order: data.display_order,
      is_featured: data.is_featured,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    revalidatePath('/admin/menu');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menambahkan produk';
    return { success: false, error: msg };
  }
}

export async function deleteProduct(id: string) {
  if (!id) {
    return { success: false, error: 'ID is required' };
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      // Foreign Key Violation Code (referenced by active/past order_items)
      if (error.code === '23503') {
        return {
          success: false,
          error: 'Menu tidak bisa dihapus karena sudah ada histori transaksinya. Silakan ubah ketersediaan produk menjadi "Tidak" saja agar tidak muncul di halaman pemesanan pelanggan.'
        };
      }
      return { success: false, error: error.message };
    }
    revalidatePath('/admin/menu');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus produk';
    return { success: false, error: msg };
  }
}

export async function updateProduct(id: string, data: {
  name: string;
  category_id: string;
  description: string;
  price: number;
  image_url: string;
  available: boolean;
  display_order: number;
  is_featured: boolean;
}) {
  if (!id) {
    return { success: false, error: 'ID is required' };
  }
  if (!data.name || data.name.trim() === '') {
    return { success: false, error: 'Name is required' };
  }
  if (!data.category_id) {
    return { success: false, error: 'Category ID is required' };
  }
  if (data.price < 0) {
    return { success: false, error: 'Price must be greater than or equal to 0' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('products').update({
      name: data.name,
      category_id: data.category_id,
      description: data.description,
      price: data.price,
      image_url: data.image_url,
      available: data.available,
      display_order: data.display_order,
      is_featured: data.is_featured,
    }).eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    revalidatePath('/admin/menu');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui produk';
    return { success: false, error: msg };
  }
}

// Table Actions
export async function createTable(number: string) {
  if (!number || number.trim() === '') {
    return { success: false, error: 'Number is required' };
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `https://idalpos.vercel.app/table/${number}`
    )}`;
    const { error } = await supabase.from('tables').insert({ number, qr_code_url: qrCodeUrl });
    if (error) {
      return { success: false, error: error.message };
    }
    revalidatePath('/admin/tables');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menambahkan meja';
    return { success: false, error: msg };
  }
}

export async function deleteTable(id: string) {
  if (!id) {
    return { success: false, error: 'ID is required' };
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('tables').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        return { success: false, error: 'Meja tidak bisa dihapus karena sudah memiliki transaksi. Silakan bersihkan histori terlebih dahulu.' };
      }
      return { success: false, error: error.message };
    }
    revalidatePath('/admin/tables');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus meja';
    return { success: false, error: msg };
  }
}
