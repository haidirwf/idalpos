'use client';

import React, { useState, useTransition } from 'react';
import { isRedirectError } from 'next/navigation';
import { login } from './actions';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await login(formData);
      } catch (err) {
        if (isRedirectError(err)) {
          throw err;
        }
        const message = err instanceof Error ? err.message : 'Invalid email or password';
        setError(message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center p-4 text-white relative overflow-hidden font-sans">
      {/* Background decorative glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#18181B] border border-neutral-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 shadow-inner">
            <span className="text-2xl font-black text-amber-500">I</span>
          </div>
          <h1 className="text-3xl font-extrabold text-amber-500 tracking-tight">
            IDAL POS
          </h1>
          <p className="text-neutral-400 text-sm mt-2">
            Sign in to your administration panel
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold text-red-400">Authentication failed</p>
              <p className="mt-0.5 text-neutral-300">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-neutral-300">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500 pointer-events-none">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="email"
                type="email"
                name="email"
                required
                disabled={isPending}
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="admin@restaurant.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-neutral-300">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500 pointer-events-none">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password"
                type="password"
                name="password"
                required
                disabled={isPending}
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
