import React from 'react';
import { createClient } from '@/lib/supabase/server';
import TableStatusAlert from '@/components/customer/TableStatusAlert';
import TableClientContainer from './TableClientContainer';

interface Props {
  params: Promise<{ tableNumber: string }>;
}

export default async function TableLandingPage({ params }: Props) {
  const resolvedParams = await params;
  const tableNumber = resolvedParams.tableNumber;

  const supabase = await createClient();

  // Pre-fetch all necessary client records in parallel on the server (RSC)
  const [tableRes, categoriesRes, productsRes] = await Promise.all([
    supabase.from('tables').select('*').eq('number', tableNumber).single(),
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('products').select('*').order('display_order'),
  ]);

  const table = tableRes.data;
  const categories = categoriesRes.data || [];
  const products = productsRes.data || [];

  if (tableRes.error || !table) {
    return <TableStatusAlert type="not_found" tableNumber={tableNumber} />;
  }

  if (table.status !== 'active') {
    return <TableStatusAlert type="inactive" tableNumber={tableNumber} />;
  }

  return (
    <TableClientContainer
      tableNumber={tableNumber}
      initialTable={table}
      initialCategories={categories}
      initialProducts={products}
    />
  );
}
