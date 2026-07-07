import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from './page';
import React from 'react';

describe('HomePage Component', () => {
  it('renders landing text and navigation links', () => {
    render(<HomePage />);
    expect(screen.getByText('IDAL')).toBeInTheDocument();
    expect(screen.getByText(/Demo Pelanggan/)).toBeInTheDocument();
    expect(screen.getByText(/Portal Admin \/ Kasir/)).toBeInTheDocument();
  });
});
