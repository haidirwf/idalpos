'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTable } from '../TableContext';

interface OrderDetails {
  order_number: string;
  status: string;
  total: number;
}

// Simplified steps for customer viewing
const STATUS_STEPS = ['pending', 'cooking', 'served', 'paid'];

const STEP_MAP: Record<string, string> = {
  pending: 'pending',
  accepted: 'pending',
  cooking: 'cooking',
  ready: 'cooking',
  served: 'served',
  paid: 'paid',
};

const STEP_LABELS: Record<string, { title: string; desc: string; icon: string }> = {
  pending: {
    title: 'Pesanan Diterima',
    desc: 'Pesanan telah diterima dan sedang diproses',
    icon: '📝',
  },
  cooking: {
    title: 'Sedang Diantar',
    desc: 'Kurir sedang mengantarkan pesanan ke meja Anda',
    icon: '🛵',
  },
  served: {
    title: 'Siap Dimakan / Sudah Diantar',
    desc: 'Selamat menikmati hidangan Anda!',
    icon: '🍽️',
  },
  paid: {
    title: 'Selesai & Lunas',
    desc: 'Pembayaran berhasil, terima kasih!',
    icon: '💳',
  },
};

interface TrackingViewClientProps {
  trackingToken: string;
  tableNumber: string;
}

export default function TrackingViewClient({ trackingToken, tableNumber }: TrackingViewClientProps) {
  const { setActiveView } = useTable();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchOrder() {
      try {
        const { data } = await supabase
          .from('orders')
          .select('order_number, status, total')
          .eq('tracking_token', trackingToken)
          .single();
        if (data) {
          setOrder(data);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();

    const channel = supabase
      .channel(`track-${trackingToken}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `tracking_token=eq.${trackingToken}` },
        (payload: { new: { status: string } }) => {
          setOrder((prev) => (prev ? { ...prev, status: payload.new.status } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackingToken]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#0F0F10] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-400 text-sm animate-pulse">Memuat status pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-[#0F0F10] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 text-red-500 text-2xl">
          ⚠️
        </div>
        <h1 className="text-xl font-bold mb-2">Pesanan Tidak Ditemukan</h1>
        <p className="text-neutral-400 text-sm text-center max-w-xs mb-6">
          Token pelacakan tidak valid atau pesanan tidak dapat ditemukan.
        </p>
        <button
          onClick={() => setActiveView('menu')}
          className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  const mappedStatus = STEP_MAP[order.status] || 'pending';
  const currentStepIndex = STATUS_STEPS.indexOf(mappedStatus);

  return (
    <div className="min-h-[80vh] bg-[#0F0F10] text-white p-6 font-sans flex flex-col justify-between animate-in fade-in duration-300">
      <div className="max-w-md mx-auto w-full flex-grow flex flex-col justify-center py-8">
        <header className="text-center mb-8 relative">
          <button
            onClick={() => setActiveView('menu')}
            className="absolute left-0 top-0 text-xs font-bold text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          >
            ← Menu
          </button>
          
          <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider block mt-8 md:mt-0">Status Pesanan</span>
          <h1 className="text-3xl font-extrabold text-[#F59E0B] tracking-wide mt-2 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]">
            #{order.order_number}
          </h1>
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-neutral-400">
            <span>Meja {tableNumber}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700"></span>
            <span>Total: Rp {Number(order.total).toLocaleString('id-ID')}</span>
          </div>
        </header>

        <div className="relative bg-[#18181B] p-6 rounded-2xl border border-neutral-800 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          {/* Vertical progress line */}
          <div className="absolute left-[31px] top-9 bottom-9 w-0.5 bg-neutral-800">
            <div
              className="w-full bg-[#F59E0B] transition-all duration-700 ease-in-out"
              style={{
                height: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="space-y-8 relative">
            {STATUS_STEPS.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const stepInfo = STEP_LABELS[step] || { title: step, desc: '', icon: '•' };

              return (
                <div key={step} className="flex items-start space-x-4 group animate-in slide-in-from-bottom duration-300">
                  {/* Step node */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      isActive
                        ? 'bg-[#F59E0B] text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-4 ring-amber-500/10'
                        : 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                    } ${isCurrent ? 'animate-pulse scale-110 ring-8 ring-amber-500/5' : ''}`}
                  >
                    <span className="text-xs transition-transform duration-300 group-hover:scale-110">
                      {isActive && !isCurrent ? '✓' : stepInfo.icon}
                    </span>
                  </div>

                  {/* Step information */}
                  <div className="flex-grow pt-0.5">
                    <h3
                      className={`font-bold text-sm transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-neutral-500'
                      } ${isCurrent ? 'text-[#F59E0B]' : ''}`}
                    >
                      {stepInfo.title}
                    </h3>
                    {stepInfo.desc && (
                      <p
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          isActive ? 'text-neutral-400' : 'text-neutral-600'
                        }`}
                      >
                        {stepInfo.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-neutral-600 mt-8 pb-4">
        <p>Halaman ini akan diperbarui secara otomatis.</p>
        <p className="mt-1">IDAL POS • QR Table Ordering System</p>
      </footer>
    </div>
  );
}
