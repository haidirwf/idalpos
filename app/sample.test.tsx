import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Sample Test Suite', () => {
  it('verifies unit testing works', () => {
    render(<h1>Testing Playground</h1>);
    expect(screen.getByText('Testing Playground')).toBeInTheDocument();
  });
});
