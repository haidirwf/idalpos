'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

export interface Table {
  id: string;
  number: string;
  status: string;
  qr_code_url?: string;
  created_at: string;
}

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
  categories?: { name: string } | null;
}

export interface OrderCard {
  id: string;
  order_number: string;
  customer_name: string;
  notes?: string;
  total: number;
  status: string;
  payment_status: string;
  tables?: { number: string } | null;
  created_at?: string;
  paid_at?: string;
}

interface POSContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tables: Table[];
  categories: Category[];
  products: Product[];
  activeOrders: OrderCard[];
  paidOrders: OrderCard[];
  loading: boolean;
  refreshData: () => Promise<void>;
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setActiveOrders: React.Dispatch<React.SetStateAction<OrderCard[]>>;
  setPaidOrders: React.Dispatch<React.SetStateAction<OrderCard[]>>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTabState] = useState<string>(initialTab);
  
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderCard[]>([]);
  const [paidOrders, setPaidOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync tab with searchParam in case user directly loads a tab, but switch states internally thereafter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTabState(tab);
    }
  }, [searchParams]);

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    // Optionally update window URL without triggering router reload
    const newUrl = `${window.location.pathname}?tab=${tab}`;
    window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, []);

  const refreshData = useCallback(async () => {
    const supabase = createClient();
    try {
      const [tablesRes, categoriesRes, productsRes, activeOrdersRes, paidOrdersRes] = await Promise.all([
        supabase.from('tables').select('*').order('number'),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('*, categories ( name )').order('display_order'),
        supabase.from('orders').select('id, order_number, customer_name, notes, total, status, payment_status, tables(number), created_at').neq('status', 'paid').order('created_at', { ascending: true }),
        supabase.from('orders').select('id, order_number, customer_name, total, paid_at, tables(number)').eq('status', 'paid').order('paid_at', { ascending: false })
      ]);

      if (tablesRes.data) setTables(tablesRes.data as Table[]);
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
      if (productsRes.data) setProducts(productsRes.data as unknown as Product[]);
      if (activeOrdersRes.data) setActiveOrders(activeOrdersRes.data as unknown as OrderCard[]);
      if (paidOrdersRes.data) setPaidOrders(paidOrdersRes.data as unknown as OrderCard[]);
    } catch (err) {
      console.error('Error refreshing POS data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    // Subscribe to realtime channels centrally to push immediate cache updates
    const supabase = createClient();
    const channel = supabase
      .channel('pos-central-cache')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  return (
    <POSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tables,
        categories,
        products,
        activeOrders,
        paidOrders,
        loading,
        refreshData,
        setTables,
        setCategories,
        setProducts,
        setActiveOrders,
        setPaidOrders,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
