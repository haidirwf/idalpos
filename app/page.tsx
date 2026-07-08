'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { QrCode, ShieldAlert } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const QrScannerModal = dynamic(() => import('@/components/customer/QrScannerModal'), {
  ssr: false,
});

export default function HomePage() {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col justify-between p-6 font-sans animate-in fade-in duration-500 relative">
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="my-auto text-center max-w-md mx-auto w-full">
        {/* Logo/Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
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
          {/* Main Action: Camera Scan QR */}
          <button
            onClick={() => setShowScanner(true)}
            className="w-full bg-[#F59E0B] hover:bg-amber-600 text-black font-extrabold rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-[0_4px_25px_rgba(245,158,11,0.2)] active:scale-[0.99] flex items-center justify-between group cursor-pointer"
          >
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <QrCode size={18} />
                Pindai QR Meja
              </h3>
              <p className="text-xs text-black/70 font-semibold mt-1">
                Scan QR Code di meja untuk melihat menu &amp; memesan
              </p>
            </div>
            <span className="text-black text-xl font-bold group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>

          {/* Quick links grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/table/1"
              className="bg-[#18181B] border border-neutral-800 rounded-2xl p-5 text-left transition-all duration-300 hover:border-neutral-700/50 group"
            >
              <h3 className="font-bold text-xs text-neutral-300 group-hover:text-white transition-colors">
                Meja 1 (Demo)
              </h3>
              <p className="text-[10px] text-neutral-500 mt-1">
                Akses cepat Meja 1 tanpa scan
              </p>
            </Link>

            <Link
              href="/login"
              className="bg-[#18181B] border border-neutral-800 rounded-2xl p-5 text-left transition-all duration-300 hover:border-neutral-700/50 group flex flex-col justify-between"
            >
              <h3 className="font-bold text-xs text-neutral-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-neutral-500 group-hover:text-indigo-400 transition-colors" />
                Portal Admin
              </h3>
              <p className="text-[10px] text-neutral-500 mt-1">
                Kelola pesanan &amp; menu
              </p>
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-neutral-600 pb-4">
        <p>© 2026 IDAL POS • Powered by Next.js &amp; Supabase</p>
      </footer>

      {/* QR scanner modal overlay */}
      {showScanner && (
        <QrScannerModal onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
