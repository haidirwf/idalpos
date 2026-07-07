import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuSelectionPage from './page';
import React from 'react';

// Mock MenuViewClient to verify it is called with right props
vi.mock('./MenuViewClient', () => ({
  default: ({ tableNumber, categories, products }: { tableNumber: string; categories: unknown[]; products: unknown[] }) => (
    <div data-testid="menu-view-client">
      <span>Mock Menu View Client for Table {tableNumber}</span>
      <span>Categories Count: {categories.length}</span>
      <span>Products Count: {products.length}</span>
    </div>
  ),
}));

// Mock supabase server client
const mockSingle = vi.fn();
const mockSelect = vi.fn();

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
      // For categories and products
      return {
        select: () => ({
          order: async () => mockSelect(table),
        }),
      };
    },
  }),
}));

describe('MenuSelectionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table not found when query errors or returns empty', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('Not found') });

    const params = Promise.resolve({ tableNumber: '99' });
    const pageElement = await MenuSelectionPage({ params });
    render(pageElement);

    expect(screen.getByText('Meja Tidak Ditemukan')).toBeInTheDocument();
    expect(screen.getByText(/Meja nomor "99" tidak terdaftar/)).toBeInTheDocument();
  });

  it('renders table inactive message when table status is inactive', async () => {
    mockSingle.mockResolvedValue({ data: { number: '05', status: 'inactive' }, error: null });

    const params = Promise.resolve({ tableNumber: '05' });
    const pageElement = await MenuSelectionPage({ params });
    render(pageElement);

    expect(screen.getByText('Meja Tidak Aktif')).toBeInTheDocument();
    expect(screen.getByText(/Meja nomor "05" saat ini sedang dinonaktifkan/)).toBeInTheDocument();
  });

  it('renders MenuViewClient with fetched categories and products when table is active', async () => {
    mockSingle.mockResolvedValue({ data: { number: '03', status: 'active' }, error: null });
    
    mockSelect.mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          data: [
            { id: 'c1', name: 'Makanan Utama', icon: 'Utensils', sort_order: 1 },
          ],
          error: null,
        };
      }
      if (table === 'products') {
        return {
          data: [
            {
              id: 'p1',
              category_id: 'c1',
              name: 'Nasi Goreng',
              description: 'Nasi goreng pedas',
              price: 25000,
              image_url: null,
              available: true,
              display_order: 1,
              is_featured: true,
            },
          ],
          error: null,
        };
      }
      return { data: [], error: null };
    });

    const params = Promise.resolve({ tableNumber: '03' });
    const pageElement = await MenuSelectionPage({ params });
    render(pageElement);

    expect(screen.getByTestId('menu-view-client')).toBeInTheDocument();
    expect(screen.getByText('Mock Menu View Client for Table 03')).toBeInTheDocument();
    expect(screen.getByText('Categories Count: 1')).toBeInTheDocument();
    expect(screen.getByText('Products Count: 1')).toBeInTheDocument();
  });
});
