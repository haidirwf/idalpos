'use client';

import React, { Suspense } from 'react';
import { TableProvider, useTable, Table, Category, Product } from './TableContext';
import MenuViewClient from './menu/MenuViewClient';
import CartViewClient from './cart/CartViewClient';
import TrackingViewClient from './tracking/TrackingViewClient';
import { Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface TableClientContainerProps {
  tableNumber: string;
  initialTable: Table;
  initialCategories: Category[];
  initialProducts: Product[];
}

function TableViewSwitcher() {
  const { activeView, activeTrackingToken, tableNumber, categories, products, setActiveView } = useTable();

  switch (activeView) {
    case 'welcome':
      return (
        <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col justify-between p-6 font-sans animate-in fade-in duration-300 relative">
          <div className="absolute top-6 right-6 z-10">
            <ThemeToggle />
          </div>
          <div className="my-auto text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
              <span className="text-[#F59E0B] text-3xl font-extrabold">🍴</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Selamat Datang</h1>
            <p className="text-neutral-400 mt-2 text-sm">Meja Anda saat ini adalah</p>
            <div className="bg-[#18181B] border border-neutral-800 py-6 px-12 rounded-2xl my-6 inline-block font-mono text-4xl font-bold text-[#F59E0B] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {tableNumber}
            </div>
            <p className="text-xs text-neutral-500 mb-8">Pilih menu favorit Anda tanpa antre & langsung diantar</p>
            <button
              onClick={() => setActiveView('menu')}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Mulai Pesan</span>
            </button>
          </div>
        </div>
      );
    case 'menu':
      return (
        <MenuViewClient
          tableNumber={tableNumber}
          categories={categories}
          products={products}
        />
      );
    case 'cart':
      return <CartViewClient tableNumber={tableNumber} />;
    case 'tracking':
      if (activeTrackingToken) {
        return (
          <TrackingViewClient
            trackingToken={activeTrackingToken}
            tableNumber={tableNumber}
          />
        );
      }
      // Fallback if no token
      return (
        <MenuViewClient
          tableNumber={tableNumber}
          categories={categories}
          products={products}
        />
      );
    default:
      return (
        <MenuViewClient
          tableNumber={tableNumber}
          categories={categories}
          products={products}
        />
      );
  }
}

export default function TableClientContainer({
  tableNumber,
  initialTable,
  initialCategories,
  initialProducts,
}: TableClientContainerProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col items-center justify-center p-6 font-sans">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
          <p className="text-neutral-400 text-sm animate-pulse">Menghubungkan ke meja...</p>
        </div>
      }
    >
      <TableProvider
        tableNumber={tableNumber}
        initialTable={initialTable}
        initialCategories={initialCategories}
        initialProducts={initialProducts}
      >
        <TableViewSwitcher />
      </TableProvider>
    </Suspense>
  );
}
