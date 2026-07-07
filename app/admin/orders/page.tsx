'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateOrderStatus, markAsPaid } from '@/lib/actions/orders';

interface OrderCard {
  id: string;
  order_number: string;
  customer_name: string;
  notes: string;
  total: number;
  status: string;
  payment_status: string;
  tables?: { number: string } | null;
  created_at?: string;
}

const COLUMNS = [
  { key: 'pending', label: 'Menunggu', color: 'bg-amber-500', icon: '⏳' },
  { key: 'accepted', label: 'Diterima', color: 'bg-indigo-500', icon: '✅' },
  { key: 'cooking', label: 'Dimasak', color: 'bg-orange-500', icon: '🍳' },
  { key: 'ready', label: 'Siap', color: 'bg-green-500', icon: '🛎️' },
  { key: 'served', label: 'Disajikan', color: 'bg-blue-500', icon: '🍽️' },
];

const NEXT_STATUS: Record<string, { status: string; label: string; className: string }> = {
  pending: {
    status: 'accepted',
    label: 'Terima',
    className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  accepted: {
    status: 'cooking',
    label: 'Masak',
    className: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  cooking: {
    status: 'ready',
    label: 'Siap',
    className: 'bg-green-600 hover:bg-green-700 text-white',
  },
  ready: {
    status: 'served',
    label: 'Sajikan',
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export default function AdminOrdersPOS() {
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchActiveOrders() {
      try {
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, customer_name, notes, total, status, payment_status, tables(number), created_at')
          .neq('status', 'paid')
          .order('created_at', { ascending: true });
        if (data) {
          setOrders(data as unknown as OrderCard[]);
        }
      } catch (err) {
        console.error('Error fetching active orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchActiveOrders();

    const channel = supabase
      .channel('admin-pos-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch the full order details including tables(number) for consistency
          const { data } = await supabase
            .from('orders')
            .select('id, order_number, customer_name, notes, total, status, payment_status, tables(number), created_at')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setOrders((prev) => [...prev, data as unknown as OrderCard]);
          } else {
            setOrders((prev) => [...prev, payload.new as OrderCard]);
          }

          // Play notification chime
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
          } catch (err) {
            console.log('Audio chime failed: ', err);
          }
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as OrderCard;
          if (row.status === 'paid') {
            setOrders((prev) => prev.filter((o) => o.id !== row.id));
          } else {
            // Re-fetch or update in state
            const { data } = await supabase
              .from('orders')
              .select('id, order_number, customer_name, notes, total, status, payment_status, tables(number), created_at')
              .eq('id', row.id)
              .single();

            if (data) {
              setOrders((prev) => prev.map((o) => (o.id === row.id ? (data as unknown as OrderCard) : o)));
            } else {
              setOrders((prev) => prev.map((o) => (o.id === row.id ? { ...o, ...row } : o)));
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await markAsPaid(orderId);
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 text-sm">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  const totalActiveOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6 font-sans">
      <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#6366F1] tracking-tight">Orders POS Pipeline</h1>
          <p className="text-xs text-neutral-500 mt-1">Kelola dan pantau pesanan pelanggan secara realtime</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#111827] border border-neutral-800 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold text-amber-400">{totalActiveOrders}</p>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Aktif</p>
          </div>
          <div className="bg-[#111827] border border-neutral-800 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Pipeline</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="bg-[#111827] p-4 rounded-xl border border-neutral-800 flex flex-col min-h-[500px] shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-850 pb-2">
                <h3 className="capitalize font-bold text-sm text-neutral-300 flex items-center gap-2">
                  <span>{col.icon}</span>
                  {col.label}
                </h3>
                <span className="bg-neutral-800 text-neutral-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {columnOrders.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnOrders.length === 0 && (
                  <p className="text-neutral-700 text-xs text-center py-8">Tidak ada pesanan</p>
                )}
                {columnOrders.map((o) => (
                  <div key={o.id} className="bg-[#1F2937] p-4 rounded-lg border border-neutral-700 space-y-3 shadow-md hover:border-neutral-600 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-amber-500 text-sm">#{o.order_number}</span>
                      <span className="text-xs text-neutral-400 font-semibold">
                        {o.tables?.number ? `Meja ${o.tables.number}` : 'Guest'}
                      </span>
                    </div>
                    {o.customer_name && (
                      <p className="text-xs text-neutral-300 font-medium">Nama: {o.customer_name}</p>
                    )}
                    {o.notes && (
                      <p className="text-xs text-neutral-500 italic bg-neutral-900/50 p-2 rounded border border-neutral-800">
                        &quot;{o.notes}&quot;
                      </p>
                    )}
                    <div className="pt-2 flex justify-between items-center border-t border-neutral-700/50">
                      <span className="text-xs font-bold text-emerald-400">
                        Rp {Number(o.total).toLocaleString('id-ID')}
                      </span>
                      {col.key === 'served' ? (
                        <button
                          onClick={() => handleMarkPaid(o.id)}
                          disabled={actionLoading === o.id}
                          className="bg-[#10B981] hover:bg-emerald-600 text-black font-bold text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                        >
                          {actionLoading === o.id ? '...' : 'Bayar'}
                        </button>
                      ) : NEXT_STATUS[col.key] ? (
                        <button
                          onClick={() => handleStatusChange(o.id, NEXT_STATUS[col.key].status)}
                          disabled={actionLoading === o.id}
                          className={`${NEXT_STATUS[col.key].className} text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50`}
                        >
                          {actionLoading === o.id ? '...' : NEXT_STATUS[col.key].label}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
