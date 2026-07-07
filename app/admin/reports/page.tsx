'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 text-sm">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalCount = orders.length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#6366F1] tracking-tight">Laporan Penjualan</h1>
        <p className="text-xs text-neutral-500 mt-1">Ringkasan transaksi dan pendapatan harian yang sudah lunas</p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111827] border border-neutral-800 rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Total Pendapatan</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">
            Rp {totalSales.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-[#111827] border border-neutral-800 rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Total Transaksi</p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-2">
            {totalCount} Pesanan
          </p>
        </div>
        <div className="bg-[#111827] border border-neutral-800 rounded-2xl p-6 shadow-lg sm:col-span-2 md:col-span-1">
          <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Rata-rata per Transaksi</p>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">
            Rp {totalCount > 0 ? Math.round(totalSales / totalCount).toLocaleString('id-ID') : '0'}
          </p>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-[#111827] border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-neutral-300">Riwayat Transaksi</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-xs font-semibold uppercase bg-neutral-900/50">
                <th className="p-4">No. Pesanan</th>
                <th className="p-4">Tanggal Pembayaran</th>
                <th className="p-4">Meja</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-sm text-neutral-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 italic">
                    Belum ada transaksi selesai hari ini.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4 font-bold text-amber-500">#{o.order_number}</td>
                    <td className="p-4 text-neutral-400">
                      {o.paid_at ? new Date(o.paid_at).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="p-4">{o.tables?.number ? `Meja ${o.tables.number}` : '-'}</td>
                    <td className="p-4">{o.customer_name || 'Guest'}</td>
                    <td className="p-4 text-right font-semibold text-emerald-400">
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
