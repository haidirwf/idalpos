'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, Loader2, DollarSign, Calendar, RefreshCcw } from 'lucide-react';

interface PaidOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  paid_at: string;
  tables?: { number: string } | null;
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<PaidOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchReportData() {
      try {
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, customer_name, total, paid_at, tables(number)')
          .eq('status', 'paid')
          .order('paid_at', { ascending: false });
        if (data) {
          setOrders(data as unknown as PaidOrder[]);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReportData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-10 h-10 border-amber-500 rounded-full animate-spin mx-auto mb-4 text-amber-500" />
          <p className="text-neutral-400 text-sm">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalCount = orders.length;
  const averageSale = totalCount > 0 ? Math.round(totalSales / totalCount) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="text-amber-500" />
            <span>Laporan Penjualan</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Ringkasan pendapatan harian dan histori transaksi lunas
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3.5 rounded-2xl text-emerald-500 border border-emerald-500/20">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Pendapatan</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              Rp {totalSales.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3.5 rounded-2xl text-indigo-500 border border-indigo-500/20">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Transaksi</p>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1">
              {totalCount} Pesanan
            </p>
          </div>
        </div>

        <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="bg-amber-500/10 p-3.5 rounded-2xl text-amber-500 border border-amber-500/20">
            <RefreshCcw size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Rata-rata Pendapatan</p>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">
              Rp {averageSale.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-[#141415] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-neutral-850 bg-neutral-900/10">
          <h3 className="font-bold text-base text-neutral-300">Riwayat Transaksi Lunas</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-xs font-bold uppercase bg-[#0F0F10] tracking-wider">
                <th className="p-4 pl-6">No. Pesanan</th>
                <th className="p-4">Tanggal Pembayaran</th>
                <th className="p-4">Meja</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4 pr-6 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-sm text-neutral-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-500 italic bg-neutral-900/5">
                    Belum ada transaksi selesai hari ini.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4 pl-6 font-bold text-amber-500">#{o.order_number}</td>
                    <td className="p-4 text-xs text-neutral-400">
                      {o.paid_at ? new Date(o.paid_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '-'}
                    </td>
                    <td className="p-4">
                      {o.tables?.number ? (
                        <span className="bg-neutral-850 px-2 py-0.5 rounded border border-neutral-800 text-xs text-neutral-400 font-semibold">
                          Meja {o.tables.number}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 font-medium">{o.customer_name || 'Guest'}</td>
                    <td className="p-4 pr-6 text-right font-extrabold text-emerald-400">
                      Rp {Number(o.total).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
