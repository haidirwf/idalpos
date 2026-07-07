import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, logout, signup } from './actions';

const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockSignUp = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      signUp: mockSignUp,
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

  describe('signup', () => {
    it('throws error if email is missing', async () => {
      const data = new FormData();
      data.append('password', 'secret');
      await expect(signup(data)).rejects.toThrow('Email and password are required');
    });

    it('throws error if password is missing', async () => {
      const data = new FormData();
      data.append('email', 'new@test.com');
      await expect(signup(data)).rejects.toThrow('Email and password are required');
    });

    it('throws error when supabase signUp fails', async () => {
      mockSignUp.mockResolvedValueOnce({
        error: { message: 'Password is too weak' },
      });

      const data = new FormData();
      data.append('email', 'new@test.com');
      data.append('password', '123');

      await expect(signup(data)).rejects.toThrow('Password is too weak');
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: '123',
      });
    });

    it('redirects to login with registered flag on success', async () => {
      mockSignUp.mockResolvedValueOnce({
        error: null,
      });

      const data = new FormData();
      data.append('email', 'new@test.com');
      data.append('password', 'strongpass');

      await expect(signup(data)).rejects.toThrow('Redirected to /login?registered=true');
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'strongpass',
      });
    });
  });
});
