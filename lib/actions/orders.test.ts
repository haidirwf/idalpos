import { describe, it, expect, vi } from 'vitest';
import { updateOrderStatus, markAsPaid } from './orders';

const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({
      update: (val: any) => {
        mockUpdate(val);
        return {
          eq: async (col: string, val2: any) => {
            mockEq(col, val2);
            return { error: null };
          },
        };
      },
    }),
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: () => {},
}));

describe('Admin POS Action Suite', () => {
  it('successfully updates order state and status-specific timestamp', async () => {
    mockUpdate.mockClear();
    mockEq.mockClear();

    await expect(updateOrderStatus('ord-123', 'cooking')).resolves.not.toThrow();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'cooking',
        cooking_at: expect.any(String),
        updated_at: expect.any(String),
      })
    );
    expect(mockEq).toHaveBeenCalledWith('id', 'ord-123');
  });

  it('successfully marks order as paid', async () => {
    mockUpdate.mockClear();
    mockEq.mockClear();

    await expect(markAsPaid('ord-123')).resolves.not.toThrow();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_status: 'paid',
        status: 'paid',
        paid_at: expect.any(String),
        updated_at: expect.any(String),
      })
    );
    expect(mockEq).toHaveBeenCalledWith('id', 'ord-123');
  });

  it('fails for invalid status values', async () => {
    await expect(updateOrderStatus('ord-123', 'invalid-status')).rejects.toThrow('Invalid status: invalid-status');
  });

  it('fails for empty order ID in updateOrderStatus', async () => {
    await expect(updateOrderStatus('', 'cooking')).rejects.toThrow('Invalid order ID');
  });

  it('fails for empty order ID in markAsPaid', async () => {
    await expect(markAsPaid('')).rejects.toThrow('Invalid order ID');
  });
});
