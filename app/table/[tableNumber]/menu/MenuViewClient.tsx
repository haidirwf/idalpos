'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/cartStore';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Utensils,
  Coffee,
  Cookie,
  ClipboardList,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

interface Product {
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

interface MyOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  tracking_token: string;
  created_at: string;
}

interface Props {
  tableNumber: string;
  categories: Category[];
  products: Product[];
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Utensils,
  Coffee,
  Cookie,
};

export default function MenuViewClient({ tableNumber, categories, products }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const { items, addToCart, updateQuantity, updateNote } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch customer orders from localStorage and listen to updates in real time
  useEffect(() => {
    if (!isMounted) return;

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

    async function fetchOrders() {
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
        console.error('Error fetching my orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchOrders();

    // Subscribe to realtime updates on these orders
    const channel = supabase
      .channel(`table-${tableNumber}-my-orders`)
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
  }, [isMounted, tableNumber]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategoryId === 'all' || product.category_id === selectedCategoryId;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Calculate cart summary
  const { totalItems, totalPrice } = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { totalItems, totalPrice };
  }, [items]);

  const getCartItem = (productId: string) => {
    if (!isMounted) return null;
    return items.find((item) => item.productId === productId);
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col font-sans pb-32">
      {/* Top Header */}
      <header className="sticky top-0 bg-[#0F0F10]/95 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>IDAL POS</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">Pesan menu favorit langsung ke meja</p>
        </div>

        <div className="flex items-center gap-2">
          {/* My Orders collapse button */}
          {isMounted && myOrders.length > 0 && (
            <button
              onClick={() => setShowMyOrders(true)}
              className="relative bg-amber-500/10 border border-amber-500/30 text-amber-500 p-2.5 rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer shadow-lg"
              title="Pesanan Saya"
            >
              <ClipboardList size={16} />
              {/* Pulsing indicator if active orders exist */}
              {myOrders.some((o) => o.status !== 'paid') && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0F0F10] animate-pulse" />
              )}
            </button>
          )}

          <div className="bg-[#18181B] border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-500 uppercase">MEJA {tableNumber}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-6 py-6 flex-1 space-y-6 max-w-2xl mx-auto w-full">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari makanan atau minuman..."
            className="w-full bg-[#18181B] border border-neutral-800 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
          />
        </div>

        {/* Category Selector Carousel */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-1">Kategori</h3>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                selectedCategoryId === 'all'
                  ? 'bg-amber-500 text-black border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.2)]'
                  : 'bg-[#18181B] text-neutral-300 border-neutral-800 hover:bg-[#202023] hover:text-white'
              }`}
            >
              <Utensils size={14} />
              <span>Semua Menu</span>
            </button>

            {categories.map((cat) => {
              const IconComponent = cat.icon ? iconMap[cat.icon] || Utensils : Utensils;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                    selectedCategoryId === cat.id
                      ? 'bg-amber-500 text-black border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.2)]'
                      : 'bg-[#18181B] text-neutral-300 border-neutral-800 hover:bg-[#202023] hover:text-white'
                  }`}
                >
                  <IconComponent size={14} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Daftar Menu ({filteredProducts.length})
            </h3>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-[#18181B] border border-neutral-800 rounded-2xl p-6">
              <span className="text-4xl">🔍</span>
              <h4 className="text-white font-bold mt-4">Menu Tidak Ditemukan</h4>
              <p className="text-neutral-400 text-xs mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const cartItem = getCartItem(product.id);

                return (
                  <div
                    key={product.id}
                    className={`bg-[#18181B] border rounded-2xl p-4 transition-all duration-300 ${
                      cartItem
                        ? 'border-amber-500/40 bg-amber-500/[0.02] shadow-[0_4px_20px_rgba(245,158,11,0.03)]'
                        : 'border-neutral-800 hover:border-neutral-700/60'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Product Image Fallback */}
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={80}
                          height={80}
                          unoptimized
                          className="w-20 h-20 object-cover rounded-2xl shrink-0 border border-neutral-800 bg-neutral-900"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center shrink-0 text-neutral-500">
                          <Utensils size={28} />
                        </div>
                      )}

                      {/* Product Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-extrabold text-white text-base leading-tight truncate">
                              {product.name}
                            </h4>
                            {product.is_featured && (
                              <span className="shrink-0 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/20">
                                Best Seller ⭐
                              </span>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-xs text-neutral-450 line-clamp-2 mt-1 leading-relaxed">
                              {product.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 gap-2">
                          <span className="font-mono text-base font-bold text-amber-500">
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>

                          {!product.available ? (
                            <span className="bg-neutral-800 text-neutral-550 border border-neutral-750 text-xs font-bold px-4 py-2 rounded-xl">
                              Habis
                            </span>
                          ) : cartItem ? (
                            <div className="flex items-center gap-3 bg-[#0F0F10] border border-neutral-800 rounded-xl p-1 shrink-0">
                              <button
                                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                                className="w-8 h-8 rounded-lg hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-mono font-bold text-sm min-w-6 text-center text-white">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                                className="w-8 h-8 rounded-lg hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                addToCart({
                                  productId: product.id,
                                  productName: product.name,
                                  price: product.price,
                                })
                              }
                              className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors shrink-0"
                            >
                              Tambah
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline Note Input if in Cart */}
                    {cartItem && (
                      <div className="mt-3.5 pt-3.5 border-t border-neutral-800/60 animate-in slide-in-from-top-1 duration-200">
                        <input
                          type="text"
                          value={cartItem.note}
                          onChange={(e) => updateNote(product.id, e.target.value)}
                          placeholder="Tambah catatan (contoh: pedas, es sedikit)..."
                          className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Summary Bar */}
      {isMounted && totalItems > 0 && (
        <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto z-20 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-amber-500 text-black px-5 py-4 rounded-2xl flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border border-amber-400">
            <div className="flex items-center gap-3">
              <div className="bg-black/10 p-2.5 rounded-xl">
                <ShoppingCart size={20} className="text-black" />
              </div>
              <div>
                <span className="font-black text-sm block leading-none">{totalItems} Item di Keranjang</span>
                <span className="font-extrabold text-xs opacity-80 mt-1 block">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <Link
              href={`/table/${tableNumber}/cart`}
              className="bg-black hover:bg-neutral-900 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              Lihat Keranjang
            </Link>
          </div>
        </div>
      )}

      {/* My Orders Sliding Sheet Drawer */}
      {showMyOrders && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center font-sans animate-in fade-in duration-300">
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0" onClick={() => setShowMyOrders(false)} />

          <div className="bg-[#141415] border-t border-neutral-800 rounded-t-[32px] w-full max-w-md p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[80vh]">
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mb-6" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-base text-white">Status Pesanan Saya</h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Meja {tableNumber}</p>
              </div>
              <button
                onClick={() => setShowMyOrders(false)}
                className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-xl transition-all cursor-pointer text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            {/* List of active orders */}
            <div className="space-y-4 overflow-y-auto pb-6 flex-1 pr-1">
              {loadingOrders && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-450">Memuat status pesanan...</p>
                </div>
              )}

              {!loadingOrders && myOrders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-500 text-xs italic">Belum ada riwayat pesanan di meja ini.</p>
                </div>
              )}

              {!loadingOrders &&
                myOrders.map((order) => {
                  const statusLabels: Record<string, { label: string; color: string; desc: string }> = {
                    pending: {
                      label: 'Menunggu',
                      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                      desc: 'Menunggu konfirmasi dapur',
                    },
                    accepted: {
                      label: 'Diterima',
                      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                      desc: 'Pesanan dikonfirmasi & antre masak',
                    },
                    cooking: {
                      label: 'Dimasak',
                      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                      desc: 'Chef sedang menyiapkan masakan Anda',
                    },
                    ready: {
                      label: 'Siap',
                      color: 'bg-green-500/10 text-green-400 border-green-500/20',
                      desc: 'Hidangan siap diantar ke meja',
                    },
                    served: {
                      label: 'Disajikan',
                      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      desc: 'Silakan nikmati hidangan Anda',
                    },
                    paid: {
                      label: 'Lunas',
                      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      desc: 'Pembayaran selesai, terima kasih!',
                    },
                  };
                  const config = statusLabels[order.status] || {
                    label: order.status,
                    color: 'bg-neutral-800 text-neutral-400 border-neutral-700/50',
                    desc: '',
                  };

                  return (
                    <div
                      key={order.id}
                      className="bg-[#0F0F10] border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-amber-500 text-sm">#{order.order_number}</span>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            {new Date(order.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                        <div>
                          <p className="text-[10px] text-neutral-500">Status Hidangan</p>
                          <p className="text-xs text-neutral-300 mt-0.5 font-medium">{config.desc}</p>
                        </div>

                        <Link
                          href={`/table/${tableNumber}/tracking/${order.tracking_token}`}
                          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <span>Pantau Live</span>
                          <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
