'use client';

import React from 'react';
import { usePOS } from './POSContext';
import OrdersModule from './orders/OrdersModule';
import MenuModule from './menu/MenuModule';
import TablesModule from './tables/TablesModule';
import ReportsModule from './reports/ReportsModule';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { activeTab, loading } = usePOS();

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center animate-in fade-in duration-300 font-sans">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 text-sm font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  switch (activeTab) {
    case 'orders':
      return <OrdersModule />;
    case 'menu':
    case 'categories':
      return <MenuModule />;
    case 'tables':
      return <TablesModule />;
    case 'reports':
      return <ReportsModule />;
    default:
      return <OrdersModule />;
  }
}
