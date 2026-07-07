import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartViewClient from './CartViewClient';
import React from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { checkoutOrder } from '@/app/table/actions';
import { toast } from 'sonner';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock checkoutOrder Server Action
vi.mock('@/app/table/actions', () => ({
  checkoutOrder: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CartViewClient Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.getState().clearCart();
  });

  it('renders empty cart message when no items are present', () => {
    render(<CartViewClient tableNumber="02" />);

    expect(screen.getByText('Keranjang Kosong')).toBeInTheDocument();
    expect(screen.getByText('Belum ada menu yang ditambahkan ke keranjang Anda.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke Menu' })).toHaveAttribute('href', '/table/02/menu');
  });

  it('renders cart items and details correctly', () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });
    store.updateNote('p1', 'Extra spicy');

    render(<CartViewClient tableNumber="02" />);

    expect(screen.getByText('Bakso')).toBeInTheDocument();
    expect(screen.getAllByText('Rp 15.000')).toHaveLength(3);
    expect(screen.getByDisplayValue('Extra spicy')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Quantity
  });

  it('handles item quantity updates and removal', () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });

    render(<CartViewClient tableNumber="02" />);

    const countSpan = screen.getByText('1');
    const plusButton = countSpan.nextElementSibling as HTMLButtonElement;
    const minusButton = countSpan.previousElementSibling as HTMLButtonElement;

    // Increment
    fireEvent.click(plusButton);
    expect(useCartStore.getState().items[0].quantity).toBe(2);

    // Decrement
    fireEvent.click(minusButton);
    expect(useCartStore.getState().items[0].quantity).toBe(1);

    // Remove item
    const trashButton = screen.getByRole('button', { name: 'Hapus Bakso' });
    fireEvent.click(trashButton);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('validates customer name and shows error', async () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });

    render(<CartViewClient tableNumber="02" />);

    const submitButton = screen.getByRole('button', { name: 'Kirim Pesanan Sekarang' });
    fireEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith('Mohon lengkapi formulir pesanan');
    expect(screen.getByText('Nama lengkap wajib diisi')).toBeInTheDocument();
  });

  it('calls checkoutOrder and redirects on successful submit', async () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });
    store.updateNote('p1', 'No onions');

    vi.mocked(checkoutOrder).mockResolvedValue({
      orderNumber: 'ORD-1002',
      trackingToken: 'tracking-uuid-xyz',
    });

    render(<CartViewClient tableNumber="02" />);

    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda (min. 3 karakter)');
    fireEvent.change(nameInput, { target: { value: 'Budi Santoso' } });

    const notesTextArea = screen.getByPlaceholderText('Contoh: Meja no. 2, minta dipisah sambalnya...');
    fireEvent.change(notesTextArea, { target: { value: 'Please deliver fast' } });

    const submitButton = screen.getByRole('button', { name: 'Kirim Pesanan Sekarang' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(checkoutOrder).toHaveBeenCalledWith({
        tableNumber: '02',
        customerName: 'Budi Santoso',
        notes: 'Please deliver fast',
        items: [
          {
            productId: 'p1',
            productName: 'Bakso',
            price: 15000,
            quantity: 1,
            note: 'No onions',
          },
        ],
      });
      expect(toast.success).toHaveBeenCalledWith('Pesanan berhasil dibuat!');
      expect(mockPush).toHaveBeenCalledWith('/table/02/tracking/tracking-uuid-xyz');
      expect(useCartStore.getState().items).toHaveLength(0); // Cart is cleared
    });
  });
});
