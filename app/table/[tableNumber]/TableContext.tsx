'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  display_order: number;
  is_featured: boolean;
}

export interface Table {
  id: string;
  number: string;
  status: string;
  created_at: string;
}

export interface MyOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  tracking_token: string;
  created_at: string;
}

interface TableContextType {
  activeView: string;
  setActiveView: (view: string) => void;
  activeTrackingToken: string | null;
  setActiveTrackingToken: (token: string | null) => void;
  tableNumber: string;
  table: Table;
  categories: Category[];
  products: Product[];
  myOrders: MyOrder[];
  loadingOrders: boolean;
  refreshOrders: () => Promise<void>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({
  children,
  tableNumber,
  initialTable,
  initialCategories,
  initialProducts,
}: {
  children: React.ReactNode;
  tableNumber: string;
  initialTable: Table;
  initialCategories: Category[];
  initialProducts: Product[];
}) {
  const searchParams = useSearchParams();
  const queryView = searchParams.get('view') || 'welcome';
  const queryToken = searchParams.get('token');

  const [activeView, setActiveViewState] = useState<string>(queryView);
  const [activeTrackingToken, setActiveTrackingTokenState] = useState<string | null>(queryToken);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

  // Sync state with URL params on load
  useEffect(() => {
    const view = searchParams.get('view');
    const token = searchParams.get('token');
    if (view) {
      setActiveViewState(view);
    }
    if (token) {
      setActiveTrackingTokenState(token);
    }
  }, [searchParams]);

  const setActiveView = useCallback((view: string) => {
    setActiveViewState(view);
    let newUrl = `${window.location.pathname}?view=${view}`;
    if (view === 'tracking' && activeTrackingToken) {
      newUrl += `&token=${activeTrackingToken}`;
    }
    window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [activeTrackingToken]);

  const setActiveTrackingToken = useCallback((token: string | null) => {
    setActiveTrackingTokenState(token);
    if (token) {
      setActiveViewState('tracking');
      const newUrl = `${window.location.pathname}?view=tracking&token=${token}`;
      window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    let tokens: string[] = [];
    try {
      const storedTokensStr = localStorage.getItem(`tokens_table_${tableNumber}`) || '[]';
      tokens = JSON.parse(storedTokensStr);
    } catch (err) {
      console.error('Failed to parse stored tokens:', err);
    }

    if (tokens.length === 0) return;

    const supabase = createClient();
    setLoadingOrders(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, status, total, tracking_token, created_at')
        .in('tracking_token', tokens)
        .order('created_at', { ascending: false });
      if (data) {
        setMyOrders(data as MyOrder[]);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [tableNumber]);

  useEffect(() => {
    refreshOrders();

    // Subscribe to realtime changes on orders to update statuses instantly
    let tokens: string[] = [];
    try {
      const storedTokensStr = localStorage.getItem(`tokens_table_${tableNumber}`) || '[]';
      tokens = JSON.parse(storedTokensStr);
    } catch (err) {
      console.error('Failed to parse tokens for subscription:', err);
    }
    if (tokens.length === 0) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`table-${tableNumber}-realtime-my-orders`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updatedOrder = payload.new as MyOrder;
          if (tokens.includes(updatedOrder.tracking_token)) {
            setMyOrders((prev) =>
              prev.map((o) =>
                o.tracking_token === updatedOrder.tracking_token
                  ? { ...o, ...updatedOrder }
                  : o
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableNumber, refreshOrders]);

  return (
    <TableContext.Provider
      value={{
        activeView,
        setActiveView,
        activeTrackingToken,
        setActiveTrackingToken,
        tableNumber,
        table: initialTable,
        categories: initialCategories,
        products: initialProducts,
        myOrders,
        loadingOrders,
        refreshOrders,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
}
