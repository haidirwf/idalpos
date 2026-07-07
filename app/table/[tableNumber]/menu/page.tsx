import React from 'react';
import { createClient } from '@/lib/supabase/server';
import MenuViewClient from './MenuViewClient';
import TableStatusAlert from '@/components/customer/TableStatusAlert';

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
    return <TableStatusAlert type="not_found" tableNumber={tableNumber} />;
  }

  if (table.status !== 'active') {
    return <TableStatusAlert type="inactive" tableNumber={tableNumber} />;
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
