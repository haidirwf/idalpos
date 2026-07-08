'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { checkoutOrder } from '@/app/table/actions';
import { useTable } from '../TableContext';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';

interface Props {
  tableNumber: string;
}

export default function CartViewClient({ tableNumber }: Props) {
  const { setActiveView, setActiveTrackingToken, refreshOrders } = useTable();
  const { items, updateQuantity, updateNote, removeItem, clearCart } = useCartStore();

  const [isMounted, setIsMounted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ customerName?: string }>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col items-center justify-center p-6 font-sans">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs text-neutral-400 mt-2">Loading keranjang...</p>
      </div>
    );
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const validateForm = () => {
    const newErrors: { customerName?: string } = {};
    if (!customerName || customerName.trim() === '') {
      newErrors.customerName = 'Nama lengkap wajib diisi';
    } else if (customerName.trim().length < 3) {
      newErrors.customerName = 'Nama minimal 3 karakter';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Mohon lengkapi formulir pesanan');
      return;
    }

    if (items.length === 0) {
      toast.error('Keranjang belanja masih kosong');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await checkoutOrder({
        tableNumber,
        customerName: customerName.trim(),
        notes: notes.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          note: item.note,
        })),
      });

      // Save tracking token to localStorage for this table
      try {
        const storedTokensStr = localStorage.getItem(`tokens_table_${tableNumber}`) || '[]';
        const storedTokens = JSON.parse(storedTokensStr);
        if (!storedTokens.includes(result.trackingToken)) {
          storedTokens.push(result.trackingToken);
          localStorage.setItem(`tokens_table_${tableNumber}`, JSON.stringify(storedTokens));
        }
      } catch (err) {
        console.error('Failed to save tracking token to localStorage:', err);
      }

      toast.success('Pesanan berhasil dibuat!');
      clearCart();
      await refreshOrders();
      setActiveTrackingToken(result.trackingToken);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengirimkan pesanan. Coba lagi.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col font-sans pb-12">
      {/* Top Header */}
      <header className="sticky top-0 bg-[#0F0F10]/95 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('menu')}
            className="p-2 hover:bg-neutral-900 rounded-xl transition-colors text-neutral-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Keranjang Belanja</h1>
            <p className="text-xs text-neutral-400 mt-0.5">Meja {tableNumber}</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="px-6 py-6 flex-1 max-w-2xl mx-auto w-full space-y-6">
        {totalItems === 0 ? (
          <div className="text-center py-20 bg-[#18181B] border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-500 shadow-inner">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Keranjang Kosong</h3>
              <p className="text-neutral-400 text-xs mt-1">Belum ada menu yang ditambahkan ke keranjang Anda.</p>
            </div>
            <button
              onClick={() => setActiveView('menu')}
              className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-6 py-3 rounded-xl transition-colors shadow-md mt-2 cursor-pointer"
            >
              Kembali ke Menu
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-6">
            {/* Items List Card */}
            <div className="bg-[#18181B] border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-1">Daftar Item</h3>

              <div className="divide-y divide-neutral-800/60">
                {items.map((item) => (
                  <div key={item.productId} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-white text-sm truncate">{item.productName}</h4>
                        <span className="font-mono text-xs text-amber-500 mt-1 block">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          aria-label={`Hapus ${item.productName}`}
                          onClick={() => removeItem(item.productId)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="flex items-center gap-2 bg-[#0F0F10] border border-neutral-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 rounded-md hover:bg-neutral-800 flex items-center justify-center text-neutral-400 transition-colors cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-mono font-bold text-xs min-w-5 text-center text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 rounded-md hover:bg-neutral-800 flex items-center justify-center text-neutral-400 transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Item Note */}
                    <div>
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => updateNote(item.productId, e.target.value)}
                        placeholder="Catatan porsi/rasa (opsional)..."
                        className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-3 py-2 text-[11px] text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="bg-[#18181B] border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-1">Informasi Pelanggan</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wide">
                    Nama Pemesan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama Anda (min. 3 karakter)"
                    className={`w-full bg-[#0F0F10] border rounded-2xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-all ${errors.customerName
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-neutral-800 focus:border-amber-500 focus:ring-amber-500/20'
                      }`}
                  />
                  {errors.customerName && (
                    <p className="text-[11px] text-red-400 mt-1.5 font-medium">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wide">
                    Catatan Pesanan <span className="text-neutral-500">(Opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Meja no. 2, minta dipisah sambalnya..."
                    className="w-full bg-[#0F0F10] border border-neutral-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Option */}
            <div className="bg-[#18181B] border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-1">Metode Pembayaran</h3>

              <div className="border border-green-500/30 bg-green-500/[0.02] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white">Bayar di Kasir (Tunai / Cash)</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Lakukan pembayaran di kasir setelah pesanan diantar</p>
                </div>
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-black">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Summary Details */}
            <div className="bg-[#18181B] border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl font-mono text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal ({totalItems} Item)</span>
                <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Pajak & Biaya Layanan</span>
                <span>Rp 0</span>
              </div>
              <div className="border-t border-neutral-800/60 pt-3 flex justify-between font-bold text-base text-white">
                <span className="font-sans">Total Pembayaran</span>
                <span className="text-amber-500">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-black py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <span>Kirim Pesanan Sekarang</span>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
