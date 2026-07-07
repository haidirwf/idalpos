import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import OrderTrackingPage from './[trackingToken]/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ trackingToken: 'sample-token', tableNumber: '1' }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { order_number: 'ORD-1005', status: 'cooking', total: 25000 },
            error: null,
          }),
        }),
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({}),
      }),
    }),
    removeChannel: () => {},
  }),
}));

describe('Tracking Page test suites', () => {
  it('resolves orders state and displays correct statuses', async () => {
    await act(async () => {
      render(<OrderTrackingPage />);
    });
    const textNode = await screen.findByText(/ORD-1005/);
    expect(textNode).toBeInTheDocument();
    
    const tableNode = screen.getByText(/Meja 1/);
    expect(tableNode).toBeInTheDocument();

    const priceNode = screen.getByText(/25\.000/);
    expect(priceNode).toBeInTheDocument();
  });
});
