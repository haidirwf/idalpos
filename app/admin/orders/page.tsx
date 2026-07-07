'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateOrderStatus, markAsPaid } from '@/lib/actions/orders';
import { ShoppingBag, Loader2, Play, Check, Flame, Award, Navigation, DollarSign, Layers } from 'lucide-react';

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
  { key: 'pending', label: 'Menunggu', color: 'text-amber-500 border-amber-500/20 bg-amber-500/5', icon: <Layers size={16} /> },
  { key: 'accepted', label: 'Diterima', color: 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5', icon: <Play size={16} /> },
  { key: 'cooking', label: 'Dimasak', color: 'text-orange-500 border-orange-500/20 bg-orange-500/5', icon: <Flame size={16} /> },
  { key: 'ready', label: 'Siap', color: 'text-green-500 border-green-500/20 bg-green-500/5', icon: <Award size={16} /> },
  { key: 'served', label: 'Disajikan', color: 'text-blue-500 border-blue-500/20 bg-blue-500/5', icon: <Navigation size={16} /> },
];

const NEXT_STATUS: Record<string, { status: string; label: string; className: string }> = {
  pending: {
    status: 'accepted',
    label: 'Terima Pesanan',
    className: 'bg-amber-500 hover:bg-amber-600 text-black font-bold',
  },
  accepted: {
    status: 'cooking',
    label: 'Mulai Masak',
    className: 'bg-amber-500 hover:bg-amber-600 text-black font-bold',
  },
  cooking: {
    status: 'ready',
    label: 'Makanan Siap',
    className: 'bg-amber-500 hover:bg-amber-600 text-black font-bold',
  },
  ready: {
    status: 'served',
    label: 'Sajikan Hidangan',
    className: 'bg-amber-500 hover:bg-amber-600 text-black font-bold',
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
      // Update local state immediately for instantaneous UI transition
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
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
      // Remove paid orders immediately from the active pipeline
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-10 h-10 border-amber-500 rounded-full animate-spin mx-auto mb-4 text-amber-500" />
          <p className="text-neutral-400 text-sm">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  const totalActiveOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-amber-500" />
            <span>Orders POS Pipeline</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Kelola dan pantau pesanan pelanggan secara realtime
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 shrink-0">
          <div className="bg-[#141415] border border-neutral-800 rounded-2xl px-5 py-3 text-center min-w-[90px] shadow-lg">
            <p className="text-2xl font-extrabold text-amber-500">{totalActiveOrders}</p>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Aktif</p>
          </div>
          <div className="bg-[#141415] border border-neutral-800 rounded-2xl px-5 py-3 text-center min-w-[130px] shadow-lg">
            <p className="text-2xl font-extrabold text-emerald-400">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Pipeline</p>
          </div>
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="bg-[#141415] border border-neutral-800 rounded-2xl flex flex-col min-h-[550px] shadow-xl overflow-hidden">
              {/* Column Header */}
              <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/30 flex items-center justify-between">
                <h3 className="capitalize font-bold text-xs text-neutral-300 flex items-center gap-2">
                  <span className={`${col.color} p-1.5 rounded-lg border`}>{col.icon}</span>
                  <span>{col.label}</span>
                </h3>
                <span className="bg-[#0F0F10] border border-neutral-800 text-neutral-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {columnOrders.length}
                </span>
              </div>

              {/* Order Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto bg-neutral-900/10">
                {columnOrders.length === 0 && (
                  <p className="text-neutral-600 text-xs text-center py-12 italic">Tidak ada pesanan</p>
                )}
                {columnOrders.map((o) => (
                  <div key={o.id} className="bg-[#0F0F10] p-4 rounded-xl border border-neutral-800 flex flex-col justify-between gap-3 shadow-md hover:border-neutral-700/60 transition-colors group">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-amber-500 text-sm">#{o.order_number}</span>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-850 px-2 py-0.5 rounded border border-neutral-800">
                          {o.tables?.number ? `Meja ${o.tables.number}` : 'Guest'}
                        </span>
                      </div>
                      {o.customer_name && (
                        <p className="text-xs font-semibold text-neutral-300">
                          Pelanggan: <span className="text-neutral-400 font-normal">{o.customer_name}</span>
                        </p>
                      )}
                      {o.notes && (
                        <p className="text-xs text-neutral-500 italic bg-neutral-950/50 p-2 rounded border border-neutral-900">
                          &quot;{o.notes}&quot;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-neutral-500">Total Harga</span>
                        <span className="text-xs font-extrabold text-emerald-400">
                          Rp {Number(o.total).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {col.key === 'served' ? (
                        <button
                          onClick={() => handleMarkPaid(o.id)}
                          disabled={actionLoading === o.id}
                          className="w-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {actionLoading === o.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <DollarSign size={12} />
                          )}
                          <span>Bayar Cash</span>
                        </button>
                      ) : NEXT_STATUS[col.key] ? (
                        <button
                          onClick={() => handleStatusChange(o.id, NEXT_STATUS[col.key].status)}
                          disabled={actionLoading === o.id}
                          className={`w-full font-bold text-xs py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${NEXT_STATUS[col.key].className}`}
                        >
                          {actionLoading === o.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            null
                          )}
                          <span>{NEXT_STATUS[col.key].label}</span>
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
