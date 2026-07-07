import { describe, it, expect, vi } from 'vitest';
import Page from './page';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Cart Redirect Page', () => {
  it('redirects to table root cart view', async () => {
    const params = Promise.resolve({ tableNumber: '02' });
    await Page({ params });
    expect(redirect).toHaveBeenCalledWith('/table/02?view=cart');
  });
});
