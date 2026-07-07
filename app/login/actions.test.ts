import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, logout } from './actions';

const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`Redirected to ${url}`);
  },
}));

describe('Authentication Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('throws error if email is missing', async () => {
      const data = new FormData();
      data.append('password', 'correct');
      await expect(login(data)).rejects.toThrow('Email and password are required');
    });

    it('throws error if password is missing', async () => {
      const data = new FormData();
      data.append('email', 'admin@test.com');
      await expect(login(data)).rejects.toThrow('Email and password are required');
    });

    it('throws error for invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        error: { message: 'Invalid credentials' },
      });

      const data = new FormData();
      data.append('email', 'fail@test.com');
      data.append('password', 'wrong');

      await expect(login(data)).rejects.toThrow('Invalid credentials');
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'fail@test.com',
        password: 'wrong',
      });
    });

    it('redirects to /admin on successful login', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        error: null,
      });

      const data = new FormData();
      data.append('email', 'admin@test.com');
      data.append('password', 'correct');

      await expect(login(data)).rejects.toThrow('Redirected to /admin');
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'correct',
      });
    });
  });

  describe('logout', () => {
    it('calls signOut and redirects to /login', async () => {
      mockSignOut.mockResolvedValueOnce({});

      await expect(logout()).rejects.toThrow('Redirected to /login');
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});
