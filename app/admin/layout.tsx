import React from 'react';
import Link from 'next/link';
import { logout } from '@/app/login/actions';
import { Grid, Utensils, Tablet, LogOut, ShoppingBag, TrendingUp } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#141415] border-b md:border-b-0 md:border-r border-neutral-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500 border border-amber-500/20">
              <Utensils size={24} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-wider text-white">
                IDAL<span className="text-amber-500">POS</span>
              </h1>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Administration</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/30 hover:border-neutral-700/50 border border-transparent transition-all font-semibold text-sm"
            >
              <ShoppingBag size={18} className="text-amber-500" />
              <span>Orders Pipeline</span>
            </Link>
            <Link
              href="/admin/menu"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/30 hover:border-neutral-700/50 border border-transparent transition-all font-semibold text-sm"
            >
              <Utensils size={18} className="text-amber-500" />
              <span>Menu / Products</span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/30 hover:border-neutral-700/50 border border-transparent transition-all font-semibold text-sm"
            >
              <Grid size={18} className="text-amber-500" />
              <span>Categories</span>
            </Link>
            <Link
              href="/admin/tables"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/30 hover:border-neutral-700/50 border border-transparent transition-all font-semibold text-sm"
            >
              <Tablet size={18} className="text-amber-500" />
              <span>Tables & QR Codes</span>
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/30 hover:border-neutral-700/50 border border-transparent transition-all font-semibold text-sm"
            >
              <TrendingUp size={18} className="text-amber-500" />
              <span>Laporan Penjualan</span>
            </Link>
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="mt-8 pt-4 border-t border-neutral-800/80">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all font-semibold text-sm text-left cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
