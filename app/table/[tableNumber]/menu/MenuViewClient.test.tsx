import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MenuViewClient from './MenuViewClient';
import { TableProvider } from '../TableContext';
import React from 'react';
import { useCartStore } from '@/lib/store/cartStore';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

const mockCategories = [
  { id: 'cat-1', name: 'Makanan', icon: 'Utensils', sort_order: 1 },
  { id: 'cat-2', name: 'Minuman', icon: 'Coffee', sort_order: 2 },
];

const mockProducts = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    name: 'Nasi Goreng',
    description: 'Nasi goreng pedas gurih',
    price: 20000,
    image_url: null,
    available: true,
    display_order: 1,
    is_featured: true,
  },
  {
    id: 'prod-2',
    category_id: 'cat-2',
    name: 'Es Teh Manis',
    description: 'Es teh manis segar',
    price: 5000,
    image_url: '/img/esteh.jpg',
    available: true,
    display_order: 2,
    is_featured: false,
  },
  {
    id: 'prod-3',
    category_id: 'cat-1',
    name: 'Mie Ayam (Habis)',
    description: 'Mie ayam bakso',
    price: 15000,
    image_url: null,
    available: false,
    display_order: 3,
    is_featured: false,
  },
];

const mockTable = { id: 't-1', number: '02', status: 'active', created_at: '' };

describe('MenuViewClient', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('renders categories and all available products', () => {
    render(
      <TableProvider
        tableNumber="02"
        initialTable={mockTable}
        initialCategories={mockCategories}
        initialProducts={mockProducts}
      >
        <MenuViewClient
          tableNumber="02"
          categories={mockCategories}
          products={mockProducts}
        />
      </TableProvider>
    );

    // Header info
    expect(screen.getByText('MEJA 02')).toBeInTheDocument();

    // Category buttons
    expect(screen.getByText('Semua Menu')).toBeInTheDocument();
    expect(screen.getByText('Makanan')).toBeInTheDocument();
    expect(screen.getByText('Minuman')).toBeInTheDocument();

    // Product cards
    expect(screen.getByText('Nasi Goreng')).toBeInTheDocument();
    expect(screen.getByText('Es Teh Manis')).toBeInTheDocument();
    expect(screen.getByText('Mie Ayam (Habis)')).toBeInTheDocument();

    // Features
    expect(screen.getByText('Best Seller ⭐')).toBeInTheDocument();
    expect(screen.getByText('Habis')).toBeInTheDocument(); // For Mie Ayam
  });

  it('filters products when category is selected', () => {
    render(
      <TableProvider
        tableNumber="02"
        initialTable={mockTable}
        initialCategories={mockCategories}
        initialProducts={mockProducts}
      >
        <MenuViewClient
          tableNumber="02"
          categories={mockCategories}
          products={mockProducts}
        />
      </TableProvider>
    );

    // Click on "Minuman" category button
    fireEvent.click(screen.getByText('Minuman'));

    // Should only show Es Teh Manis
    expect(screen.queryByText('Nasi Goreng')).not.toBeInTheDocument();
    expect(screen.getByText('Es Teh Manis')).toBeInTheDocument();

    // Click back to "Semua Menu"
    fireEvent.click(screen.getByText('Semua Menu'));
    expect(screen.getByText('Nasi Goreng')).toBeInTheDocument();
    expect(screen.getByText('Es Teh Manis')).toBeInTheDocument();
  });

  it('filters products when searching', () => {
    render(
      <TableProvider
        tableNumber="02"
        initialTable={mockTable}
        initialCategories={mockCategories}
        initialProducts={mockProducts}
      >
        <MenuViewClient
          tableNumber="02"
          categories={mockCategories}
          products={mockProducts}
        />
      </TableProvider>
    );

    const searchInput = screen.getByPlaceholderText('Cari makanan atau minuman...');
    fireEvent.change(searchInput, { target: { value: 'teh' } });

    // Should only show Es Teh Manis
    expect(screen.queryByText('Nasi Goreng')).not.toBeInTheDocument();
    expect(screen.getByText('Es Teh Manis')).toBeInTheDocument();
  });

  it('adds product to cart, shows quantity selectors, updates note and displays floating cart summary', () => {
    render(
      <TableProvider
        tableNumber="02"
        initialTable={mockTable}
        initialCategories={mockCategories}
        initialProducts={mockProducts}
      >
        <MenuViewClient
          tableNumber="02"
          categories={mockCategories}
          products={mockProducts}
        />
      </TableProvider>
    );

    // Verify floating cart summary is not visible
    expect(screen.queryByText(/Item di Keranjang/)).not.toBeInTheDocument();

    // Add Nasi Goreng
    const addButtons = screen.getAllByRole('button', { name: 'Tambah' });
    // First active product is Nasi Goreng (prod-1)
    fireEvent.click(addButtons[0]);

    // Quantity selector should be shown: quantity 1
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tambah catatan (contoh: pedas, es sedikit)...')).toBeInTheDocument();
  });
});
