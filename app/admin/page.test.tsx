import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminPage from './page';
import React from 'react';

// Mock POS Context
const mockUsePOS = vi.fn();
vi.mock('./POSContext', () => ({
  usePOS: () => mockUsePOS()
}));

// Mock modules to keep tests light
vi.mock('./orders/OrdersModule', () => ({
  default: () => <div data-testid="orders-module">Orders POS Pipeline</div>
}));

describe('AdminPage Root Component', () => {
  it('renders loading state when context loading is true', () => {
    mockUsePOS.mockReturnValue({ activeTab: 'orders', loading: true });
    render(<AdminPage />);
    expect(screen.getByText('Memuat data dashboard...')).toBeInTheDocument();
  });

  it('renders OrdersModule when activeTab is orders', () => {
    mockUsePOS.mockReturnValue({ activeTab: 'orders', loading: false });
    render(<AdminPage />);
    expect(screen.getByTestId('orders-module')).toBeInTheDocument();
    expect(screen.getByText('Orders POS Pipeline')).toBeInTheDocument();
  });
});
