import React from 'react';
import { createClient } from '@/lib/supabase/server';
import MenuViewClient from './MenuViewClient';

interface Props {
  params: Promise<{ tableNumber: string }>;
}

export default async function MenuSelectionPage({ params }: Props) {
  const resolvedParams = await params;
  const tableNumber = resolvedParams.tableNumber;

  const supabase = await createClient();

  // Validate table existence & status
  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('*')
    .eq('number', tableNumber)
    .single();

  if (tableError || !table) {
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col justify-center items-center p-6 font-sans">
        <div className="text-center max-w-sm mx-auto animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <span className="text-red-500 text-3xl font-extrabold">⚠️</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-red-500">Meja Tidak Ditemukan</h1>
          <p className="text-neutral-400 mt-2 text-sm">Meja nomor &quot;{tableNumber}&quot; tidak terdaftar dalam sistem kami.</p>
        </div>
      </div>
    );
  }

  if (table.status !== 'active') {
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col justify-center items-center p-6 font-sans">
        <div className="text-center max-w-sm mx-auto animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <span className="text-red-500 text-3xl font-extrabold">🔒</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-red-500">Meja Tidak Aktif</h1>
          <p className="text-neutral-400 mt-2 text-sm">Meja nomor &quot;{tableNumber}&quot; saat ini sedang dinonaktifkan.</p>
        </div>
      </div>
    );
  }

  // Fetch categories ordered by sort_order
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  // Fetch products ordered by display_order
  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .order('display_order');

  const categories = categoriesData || [];
  const products = productsData || [];

  return (
    <MenuViewClient
      tableNumber={tableNumber}
      categories={categories}
      products={products}
    />
  );
}
