'use server';

import { createClient } from '@/lib/supabase/server';

interface CheckoutInput {
  tableNumber: string;
  customerName: string;
  notes: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    note: string;
  }[];
}

export async function checkoutOrder(input: CheckoutInput) {
  // Input validations
  if (!input.tableNumber) {
    throw new Error('Table number is required');
  }

  if (!input.customerName || input.customerName.trim() === '') {
    throw new Error('Customer name is required');
  }

  if (!input.items || input.items.length === 0) {
    throw new Error('Cart must not be empty');
  }

  for (const item of input.items) {
    if (!item.productId) {
      throw new Error('Product ID is required for all items');
    }
    if (!item.productName) {
      throw new Error('Product name is required for all items');
    }
    if (item.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (item.price < 0) {
      throw new Error('Price must be greater than or equal to 0');
    }
  }

  const supabase = await createClient();

  // 1. Resolve table ID
  const { data: tableData, error: tableErr } = await supabase
    .from('tables')
    .select('id, status')
    .eq('number', input.tableNumber)
    .single();

  if (tableErr || !tableData) {
    throw new Error(`Table number ${input.tableNumber} is not registered`);
  }

  if (tableData.status !== 'active') {
    throw new Error('Table number is inactive');
  }

  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // No tax/charges in MVP

  // 2. Insert Order
  const { data: orderData, error: orderErr } = await supabase
    .from('orders')
    .insert({
      table_id: tableData.id,
      customer_name: input.customerName,
      notes: input.notes,
      subtotal,
      total,
      status: 'pending',
      payment_method: 'cash',
      payment_status: 'unpaid',
    })
    .select('id, order_number, tracking_token')
    .single();

  if (orderErr || !orderData) {
    throw new Error(`Failed to place order: ${orderErr?.message}`);
  }

  // 3. Insert Order Items (capturing immutable snapshots of names)
  const itemsToInsert = input.items.map((item) => ({
    order_id: orderData.id,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    price: item.price,
    note: item.note,
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
  if (itemsErr) {
    // Cleanup placed order on item insertion failure
    await supabase.from('orders').delete().eq('id', orderData.id);
    throw new Error(`Failed to insert order items: ${itemsErr.message}`);
  }

  return {
    orderNumber: orderData.order_number,
    trackingToken: orderData.tracking_token,
  };
}
