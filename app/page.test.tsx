import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from './page';
import React from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: class {
    start = vi.fn().mockResolvedValue(null);
    stop = vi.fn().mockResolvedValue(null);
    isScanning = false;
  },
}));

describe('HomePage Component', () => {
  it('renders landing text and scan QR/portal triggers', () => {
    render(<HomePage />);
    expect(screen.getByText('IDAL')).toBeInTheDocument();
    expect(screen.getByText(/Pindai QR Meja/)).toBeInTheDocument();
    expect(screen.getByText(/Meja 1 \(Demo\)/)).toBeInTheDocument();
    expect(screen.getByText(/Portal Admin/)).toBeInTheDocument();
  });

  it('toggles QR scanner modal when scan button is clicked', async () => {
    render(<HomePage />);
    
    // Modal shouldn't be visible initially
    expect(screen.queryByText('Pindai QR Code')).not.toBeInTheDocument();

    // Click the scan button
    const scanBtn = screen.getByText(/Pindai QR Meja/);
    fireEvent.click(scanBtn);

    // Modal elements should be visible (wait for dynamic import)
    const modalHeader = await screen.findByText('Pindai QR Code');
    expect(modalHeader).toBeInTheDocument();
  });
});
