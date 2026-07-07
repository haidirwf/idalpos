'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Category Actions
export async function createCategory(name: string, icon: string, sortOrder: number) {
  if (!name || name.trim() === '') {
    throw new Error('Name is required');
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { error } = await supabase.from('categories').insert({ name, icon, sort_order: sortOrder });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/categories');
}

export async function deleteCategory(id: string) {
  if (!id) {
    throw new Error('ID is required');
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/categories');
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
    throw new Error('Name is required');
  }
  if (!data.category_id) {
    throw new Error('Category ID is required');
  }
  if (data.price < 0) {
    throw new Error('Price must be greater than or equal to 0');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
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
  if (error) throw new Error(error.message);
  revalidatePath('/admin/menu');
}

export async function deleteProduct(id: string) {
  if (!id) {
    throw new Error('ID is required');
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/menu');
}

// Table Actions
export async function createTable(number: string) {
  if (!number || number.trim() === '') {
    throw new Error('Number is required');
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  // Simulate table URL configuration
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `https://idalpos.vercel.app/table/${number}`
  )}`;
  const { error } = await supabase.from('tables').insert({ number, qr_code_url: qrCodeUrl });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/tables');
}

export async function deleteTable(id: string) {
  if (!id) {
    throw new Error('ID is required');
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { error } = await supabase.from('tables').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/tables');
}
