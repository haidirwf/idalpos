import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AdminLoading from './loading';
import React from 'react';

describe('AdminLoading Component', () => {
  it('renders loading skeletons with pulsing animation class', () => {
    const { container } = render(<AdminLoading />);
    const pulsingElements = container.querySelectorAll('.animate-pulse');
    expect(pulsingElements.length).toBeGreaterThan(0);
  });
});
