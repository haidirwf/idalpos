import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TableLandingPage from './page';

// Mock supabase server client
const mockSingle = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => mockSingle()
        })
      })
    })
  })
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('TableLandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table not found when query errors or returns empty', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('Not found') });
    
    const params = Promise.resolve({ tableNumber: '99' });
    const pageElement = await TableLandingPage({ params });
    render(pageElement);

    expect(screen.getByText('Meja Tidak Ditemukan')).toBeInTheDocument();
    expect(screen.getByText(/Meja nomor "99" tidak terdaftar/)).toBeInTheDocument();
  });

  it('renders table inactive message when table status is inactive', async () => {
    mockSingle.mockResolvedValue({ data: { number: '05', status: 'inactive' }, error: null });

    const params = Promise.resolve({ tableNumber: '05' });
    const pageElement = await TableLandingPage({ params });
    render(pageElement);

    expect(screen.getByText('Meja Tidak Aktif')).toBeInTheDocument();
    expect(screen.getByText(/Meja nomor "05" saat ini sedang dinonaktifkan/)).toBeInTheDocument();
  });

  it('renders welcoming page when table is active', async () => {
    mockSingle.mockResolvedValue({ data: { number: '02', status: 'active' }, error: null });

    const params = Promise.resolve({ tableNumber: '02' });
    const pageElement = await TableLandingPage({ params });
    render(pageElement);

    expect(screen.getByText('Selamat Datang')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mulai Pesan' })).toBeInTheDocument();
  });
});
