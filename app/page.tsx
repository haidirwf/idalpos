import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col justify-between p-6 font-sans animate-in fade-in duration-500">
      <div className="my-auto text-center max-w-md mx-auto w-full">
        {/* Decorative elements */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-bounce duration-1000">
            <span className="text-4xl">🍴</span>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight">
          IDAL<span className="text-[#F59E0B]">POS</span>
        </h1>
        <p className="text-neutral-400 mt-3 text-sm leading-relaxed max-w-sm mx-auto">
          Sistem pemesanan meja QR &amp; Point of Sale modern untuk bisnis restoran Anda.
        </p>

        {/* Action buttons */}
        <div className="mt-8 space-y-4">
          <Link
            href="/table/1"
            className="block w-full bg-[#18181B] border border-neutral-800 rounded-2xl p-5 text-left transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_4px_25px_rgba(245,158,11,0.08)] group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-[#F59E0B] transition-colors">
                  📱 Demo Pelanggan
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Masuk sebagai pelanggan di Meja 1
                </p>
              </div>
              <span className="text-neutral-600 group-hover:text-[#F59E0B] transition-colors text-lg">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="block w-full bg-[#18181B] border border-neutral-800 rounded-2xl p-5 text-left transition-all duration-300 hover:border-[#6366F1]/40 hover:shadow-[0_4px_25px_rgba(99,102,241,0.08)] group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-[#6366F1] transition-colors">
                  🔐 Portal Admin / Kasir
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Masuk ke dashboard POS &amp; kelola menu
                </p>
              </div>
              <span className="text-neutral-600 group-hover:text-[#6366F1] transition-colors text-lg">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>

      <footer className="text-center text-xs text-neutral-600 pb-4">
        <p>© 2026 IDAL POS • Powered by Next.js &amp; Supabase</p>
      </footer>
    </div>
  );
}
