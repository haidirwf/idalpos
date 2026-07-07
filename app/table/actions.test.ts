import { describe, it, expect, vi } from 'vitest';
import { checkoutOrder } from './actions';

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (table: string) => {
      if (table === 'tables') {
        return {
          select: () => ({
            eq: (field: string, val: string) => {
              if (val === '99') {
                // Return not found for table number 99
                return {
                  single: async () => ({ data: null, error: { message: 'Table not found' } }),
                };
              }
              return {
                single: async () => ({ data: { id: 'table-uuid-123' }, error: null }),
              };
            },
          }),
        };
      }
      return {
        insert: () => {
          return {
            select: () => ({
              single: async () => ({
                data: { id: 'order-uuid-999', order_number: 'ORD-1002', tracking_token: 'token-uuid-777' },
                error: null,
              }),
            }),
            error: null,
          };
        },
        delete: () => ({
          eq: () => ({
            error: null,
          }),
        }),
      };
    },
  }),
}));

describe('Checkout flow server actions', () => {
  it('creates an order successfully returning tracking token', async () => {
    const result = await checkoutOrder({
      tableNumber: '02',
      customerName: 'Budi',
      notes: 'Less sugar please',
      items: [{ productId: 'p1', productName: 'Ice Tea', price: 5000, quantity: 2, note: '' }],
    });

    expect(result.orderNumber).toBe('ORD-1002');
    expect(result.trackingToken).toBe('token-uuid-777');
  });

  it('throws an error if table number is not registered', async () => {
    await expect(
      checkoutOrder({
        tableNumber: '99',
        customerName: 'Budi',
        notes: '',
        items: [{ productId: 'p1', productName: 'Ice Tea', price: 5000, quantity: 2, note: '' }],
      })
    ).rejects.toThrow('Table number 99 is not registered');
  });

  it('throws an error if customer name is empty', async () => {
    await expect(
      checkoutOrder({
        tableNumber: '02',
        customerName: '',
        notes: '',
        items: [{ productId: 'p1', productName: 'Ice Tea', price: 5000, quantity: 2, note: '' }],
      })
    ).rejects.toThrow('Customer name is required');
  });

  it('throws an error if items list is empty', async () => {
    await expect(
      checkoutOrder({
        tableNumber: '02',
        customerName: 'Budi',
        notes: '',
        items: [],
      })
    ).rejects.toThrow('Cart must not be empty');
  });

  it('throws an error if an item quantity is 0 or negative', async () => {
    await expect(
      checkoutOrder({
        tableNumber: '02',
        customerName: 'Budi',
        notes: '',
        items: [{ productId: 'p1', productName: 'Ice Tea', price: 5000, quantity: 0, note: '' }],
      })
    ).rejects.toThrow('Quantity must be greater than 0');
  });
});
