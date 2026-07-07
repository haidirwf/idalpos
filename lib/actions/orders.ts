'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const VALID_STATUSES = ['pending', 'accepted', 'cooking', 'ready', 'served', 'paid'];

export async function updateOrderStatus(orderId: string, status: string) {
  if (!orderId || typeof orderId !== 'string') {
    throw new Error('Invalid order ID');
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const supabase = await createClient();
  const timestampField = `${status}_at`;

  const { error } = await supabase
    .from('orders')
    .update({
      status,
      [timestampField]: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }

  revalidatePath('/admin/orders');
}

export async function markAsPaid(orderId: string) {
  if (!orderId || typeof orderId !== 'string') {
    throw new Error('Invalid order ID');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Failed to update payment: ${error.message}`);
  }

  revalidatePath('/admin/orders');
}
