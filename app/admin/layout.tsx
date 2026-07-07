'use client';

import React, { useState, Suspense } from 'react';
import { logout } from '@/app/login/actions';
import { Utensils, Tablet, LogOut, ShoppingBag, TrendingUp, Menu as MenuIcon, X } from 'lucide-react';
import { POSProvider, usePOS } from './POSContext';
import AdminLoading from './loading';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { activeTab, setActiveTab } = usePOS();

  const getLinkClass = (tab: string) => {
    const base = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer border";
    if (activeTab === tab || (tab === 'menu' && activeTab === 'categories')) {
      return `${base} bg-neutral-800/50 text-white border-neutral-700/50`;
    }
    return `${base} text-neutral-400 hover:text-white hover:bg-neutral-800/30 hover:border-neutral-700/50 border-transparent`;
  };

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#141415] border-b md:border-b-0 md:border-r border-neutral-800 p-4 md:p-6 flex flex-col shrink-0 transition-all duration-300">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between md:mb-8">
          {/* Logo / Header */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500 border border-amber-500/20">
              <Utensils size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-base md:text-lg leading-tight tracking-wider text-white">
                IDAL<span className="text-amber-500">POS</span>
              </h1>
              <p className="text-[9px] md:text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Administration</p>
            </div>
          </div>

          {/* Toggle Button for mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl border border-neutral-800 transition-colors cursor-pointer"
          >
            {isOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>

        {/* Collapsible Menu Content */}
        <div className={`${isOpen ? 'block mt-6' : 'hidden'} md:block md:mt-0 flex-1 flex flex-col justify-between`}>
          {/* Nav Links */}
          <nav className="space-y-1">
            <button
              onClick={() => handleTabSwitch('orders')}
              className={getLinkClass('orders')}
            >
              <ShoppingBag size={18} className="text-amber-500" />
              <span>Orders Pipeline</span>
            </button>
            <button
              onClick={() => handleTabSwitch('menu')}
              className={getLinkClass('menu')}
            >
              <Utensils size={18} className="text-amber-500" />
              <span>Menu / Produk</span>
            </button>
            <button
              onClick={() => handleTabSwitch('tables')}
              className={getLinkClass('tables')}
            >
              <Tablet size={18} className="text-amber-500" />
              <span>Tables & QR Codes</span>
            </button>
            <button
              onClick={() => handleTabSwitch('reports')}
              className={getLinkClass('reports')}
            >
              <TrendingUp size={18} className="text-amber-500" />
              <span>Laporan Penjualan</span>
            </button>
          </nav>

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <POSProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </POSProvider>
    </Suspense>
  );
}
