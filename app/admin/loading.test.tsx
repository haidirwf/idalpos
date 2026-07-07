import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminLoading from './loading';
import React from 'react';

describe('AdminLoading Component', () => {
  it('renders standard loading text and spinner', () => {
    render(<AdminLoading />);
    expect(screen.getByText('Memuat halaman...')).toBeInTheDocument();
    
    // Select the spinner element using class selector
    const spinner = screen.getByText('Memuat halaman...').previousSibling;
    expect(spinner).toHaveClass('animate-spin');
  });
});
