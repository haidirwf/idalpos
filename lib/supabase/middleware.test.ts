import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { updateSession } from './middleware';
import { createServerClient } from '@supabase/ssr';

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

describe('Middleware session test', () => {
  const mockGetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
    } as unknown as ReturnType<typeof createServerClient>);
  });

  it('redirects unauthenticated user from /admin to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = new NextRequest(new URL('http://localhost/admin/dashboard'));
    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/login');
  });

  it('redirects authenticated user from /login to /admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });

    const request = new NextRequest(new URL('http://localhost/login'));
    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/admin');
  });

  it('allows unauthenticated user to access /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = new NextRequest(new URL('http://localhost/login'));
    const response = await updateSession(request);

    expect(response.status).not.toBe(307);
  });

  it('allows authenticated user to access /admin/dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });

    const request = new NextRequest(new URL('http://localhost/admin/dashboard'));
    const response = await updateSession(request);

    expect(response.status).not.toBe(307);
  });
});
