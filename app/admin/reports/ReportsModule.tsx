'use client';

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Eye, X } from 'lucide-react';
import { usePOS, OrderCard } from '../POSContext';

export default function ReportsModule() {
  const { paidOrders } = usePOS();
  const [selectedOrder, setSelectedOrder] = useState<OrderCard | null>(null);

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
                <th className="p-4 text-right">Total</th>
                <th className="p-4 pr-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-sm text-neutral-300">
              {paidOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-500 italic bg-neutral-900/5">
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
                    <td className="p-4 text-right font-extrabold text-emerald-400">
                      Rp {Number(o.total).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 pr-6 text-center">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-amber-500 transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Lihat Detail Pesanan"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#141415] border border-neutral-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-6 top-6 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2.5">
              <span className="bg-amber-500/10 p-2 rounded-xl text-amber-500 border border-amber-500/20">
                <Eye size={18} />
              </span>
              <span>Detail Transaksi #{selectedOrder.order_number}</span>
            </h3>

            <div className="space-y-6">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-[#0F0F10] border border-neutral-850 rounded-2xl p-4 text-sm">
                <div>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Nama Pelanggan</p>
                  <p className="font-semibold text-white mt-1">{selectedOrder.customer_name || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Meja</p>
                  <p className="font-semibold text-white mt-1">
                    {selectedOrder.tables?.number ? `Meja ${selectedOrder.tables.number}` : '-'}
                  </p>
                </div>
                <div className="col-span-2 border-t border-neutral-800 pt-3">
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Waktu Pembayaran</p>
                  <p className="font-semibold text-white mt-1">
                    {selectedOrder.paid_at ? new Date(selectedOrder.paid_at).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }) : '-'}
                  </p>
                </div>
                {selectedOrder.notes && (
                  <div className="col-span-2 border-t border-neutral-800 pt-3">
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Catatan</p>
                    <p className="text-neutral-300 mt-1 italic">&ldquo;{selectedOrder.notes}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Order Items Table */}
              <div>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3">Item Pesanan</p>
                <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-[#0F0F10]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500 text-xs font-bold uppercase tracking-wider bg-neutral-900/40">
                        <th className="p-3 pl-4">Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right pr-4">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-850 text-neutral-300">
                      {(!selectedOrder.order_items || selectedOrder.order_items.length === 0) ? (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-neutral-500 italic">
                            Tidak ada detail item.
                          </td>
                        </tr>
                      ) : (
                        selectedOrder.order_items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3 pl-4">
                              <p className="font-semibold text-white">{item.product_name}</p>
                              {item.note && (
                                <p className="text-xs text-neutral-500 mt-0.5">Catatan: {item.note}</p>
                              )}
                            </td>
                            <td className="p-3 text-center font-bold text-neutral-400">
                              {item.quantity}x
                            </td>
                            <td className="p-3 text-right pr-4 font-bold text-neutral-300">
                              Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Total Row */}
              <div className="flex justify-between items-center border-t border-neutral-800 pt-5">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Total Transaksi</span>
                <span className="text-xl font-black text-emerald-400">
                  Rp {Number(selectedOrder.total).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer text-center text-sm mt-4"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
