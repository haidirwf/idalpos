import { describe, it, expect, vi } from 'vitest';
import AdminPage from './page';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('AdminPage Root Component', () => {
  it('redirects to /admin/orders', () => {
    AdminPage();
    expect(redirect).toHaveBeenCalledWith('/admin/orders');
  });
});
