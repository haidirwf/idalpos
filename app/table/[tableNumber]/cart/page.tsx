import React from 'react';
import { createClient } from '@/lib/supabase/server';
import TableStatusAlert from '@/components/customer/TableStatusAlert';
import CartViewClient from './CartViewClient';

interface Props {
  params: Promise<{ tableNumber: string }>;
}

export default async function CartPage({ params }: Props) {
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

  return <CartViewClient tableNumber={tableNumber} />;
}
