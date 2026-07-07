'use client';

import React from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { usePOS } from '../POSContext';

export default function ReportsModule() {
  const { paidOrders } = usePOS();

  const totalSales = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalCount = paidOrders.length;

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
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-xl flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 md:p-3.5 rounded-2xl text-emerald-500 border border-emerald-500/20 shrink-0">
            <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Pendapatan</p>
            <p className="text-lg md:text-2xl font-extrabold text-emerald-400 mt-0.5 md:mt-1">
              Rp {totalSales.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-xl flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3 md:p-3.5 rounded-2xl text-indigo-500 border border-indigo-500/20 shrink-0">
            <Calendar className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Transaksi</p>
            <p className="text-lg md:text-2xl font-extrabold text-indigo-400 mt-0.5 md:mt-1">
              {totalCount} Pesanan
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
              {paidOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-500 italic bg-neutral-900/5">
                    Belum ada transaksi selesai hari ini.
                  </td>
                </tr>
              ) : (
                paidOrders.map((o) => (
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
