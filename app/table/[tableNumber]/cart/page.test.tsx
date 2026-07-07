import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartPage from './page';
import React from 'react';

// Mock CartViewClient
vi.mock('./CartViewClient', () => ({
  default: ({ tableNumber }: { tableNumber: string }) => (
    <div data-testid="cart-view-client">
      <span>Mock Cart View Client for Table {tableNumber}</span>
    </div>
  ),
}));

// Mock supabase server client
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (table: string) => {
      if (table === 'tables') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => mockSingle(),
            }),
          }),
        };
      }
      return {
        select: () => ({
          single: async () => ({ data: null, error: new Error('Not found') }),
        }),
      };
    },
  }),
}));

describe('CartPage Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table not found when query errors or returns empty', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('Not found') });

    const params = Promise.resolve({ tableNumber: '99' });
    const pageElement = await CartPage({ params });
    render(pageElement);

    expect(screen.getByText('Meja Tidak Ditemukan')).toBeInTheDocument();
    expect(screen.getByText(/Meja nomor "99" tidak terdaftar/)).toBeInTheDocument();
  });

  it('renders table inactive message when table status is inactive', async () => {
    mockSingle.mockResolvedValue({ data: { number: '05', status: 'inactive' }, error: null });

    const params = Promise.resolve({ tableNumber: '05' });
    const pageElement = await CartPage({ params });
    render(pageElement);

    expect(screen.getByText('Meja Tidak Aktif')).toBeInTheDocument();
    expect(screen.getByText(/Meja nomor "05" saat ini sedang dinonaktifkan/)).toBeInTheDocument();
  });

  it('renders CartViewClient when table is active', async () => {
    mockSingle.mockResolvedValue({ data: { number: '03', status: 'active' }, error: null });

    const params = Promise.resolve({ tableNumber: '03' });
    const pageElement = await CartPage({ params });
    render(pageElement);

    expect(screen.getByTestId('cart-view-client')).toBeInTheDocument();
    expect(screen.getByText('Mock Cart View Client for Table 03')).toBeInTheDocument();
  });
});
