'use client';

import React, { useState } from 'react';
import { createProduct, deleteProduct, updateProduct, createCategory, deleteCategory } from '@/lib/actions/admin';
import { Utensils, Plus, Check, X, Star, Grid, Edit, AlertCircle, Loader2 } from 'lucide-react';
import { usePOS, Product } from '../POSContext';
import { SubmitButton, DeleteIconButton } from '@/components/SubmitButton';

export default function MenuModule() {
  const { categories, products, activeTab, setActiveTab, refreshData } = usePOS();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const handleCreateProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const category_id = formData.get('category_id') as string;
    const description = formData.get('description') as string || '';
    const price = parseFloat(formData.get('price') as string || '0');
    const image_url = formData.get('image_url') as string || '';
    const available = formData.get('available') === 'true';
    const display_order = parseInt(formData.get('display_order') as string || '0', 10);
    const is_featured = formData.get('is_featured') === 'true';

    const result = await createProduct({
      name,
      category_id,
      description,
      price,
      image_url,
      available,
      display_order,
      is_featured,
    });

    if (result && !result.success) {
      setErrorMsg(result.error || 'Gagal menambahkan produk');
    } else {
      form.reset();
      await refreshData();
    }
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditErrorMsg(null);
    if (!editingProduct) return;

    setIsEditSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const category_id = formData.get('category_id') as string;
    const description = formData.get('description') as string || '';
    const price = parseFloat(formData.get('price') as string || '0');
    const image_url = formData.get('image_url') as string || '';
    const available = formData.get('available') === 'true';
    const display_order = parseInt(formData.get('display_order') as string || '0', 10);
    const is_featured = formData.get('is_featured') === 'true';

    const result = await updateProduct(editingProduct.id, {
      name,
      category_id,
      description,
      price,
      image_url,
      available,
      display_order,
      is_featured,
    });

    setIsEditSubmitting(false);
    if (result && !result.success) {
      setEditErrorMsg(result.error || 'Gagal memperbarui produk');
    } else {
      setEditingProduct(null);
      await refreshData();
    }
  };

  const handleDeleteProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    const id = formData.get('id') as string;

    const result = await deleteProduct(id);
    if (result && !result.success) {
      setErrorMsg(result.error || 'Gagal menghapus produk');
    } else {
      await refreshData();
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const icon = formData.get('icon') as string;
    const sortOrder = parseInt(formData.get('sort_order') as string || '0', 10);

    const result = await createCategory(name, icon, sortOrder);
    if (result && !result.success) {
      setErrorMsg(result.error || 'Gagal menambahkan kategori');
    } else {
      form.reset();
      await refreshData();
    }
  };

  const handleDeleteCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    const id = formData.get('id') as string;

    const result = await deleteCategory(id);
    if (result && !result.success) {
      setErrorMsg(result.error || 'Gagal menghapus kategori');
    } else {
      await refreshData();
    }
  };

  const currentTab = activeTab === 'categories' ? 'categories' : 'products';

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Utensils className="text-amber-500" />
            <span>Manage Menu &amp; Categories</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Kelola menu hidangan restoran dan atur kategorinya untuk pemesanan pelanggan
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-neutral-800 pb-px">
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-6 py-3 border-b-2 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'products'
              ? 'border-amber-500 text-amber-500 bg-amber-500/5'
              : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/30'
          }`}
        >
          <Utensils size={16} />
          <span>Menu &amp; Produk</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 border-b-2 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'categories'
              ? 'border-amber-500 text-amber-500 bg-amber-500/5'
              : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/30'
          }`}
        >
          <Grid size={16} />
          <span>Kategori</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-red-300">Action Failed</h4>
            <p className="mt-0.5 text-xs text-red-400/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {currentTab === 'products' ? (
        /* PRODUCTS TAB content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Create Product Form */}
          <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Plus size={18} className="text-amber-500" />
              <span>Tambah Produk Baru</span>
            </h2>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Nama Produk
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Contoh: Nasi Goreng Spesial"
                  required
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="category_id" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Kategori
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  required
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="text-neutral-500">Pilih Kategori</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-white bg-[#141415]">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  placeholder="Detail hidangan, bahan, dsb."
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="price" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Harga (Rupiah)
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  min="0"
                  step="500"
                  placeholder="Contoh: 25000"
                  required
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="image_url" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  URL Gambar (Opsional)
                </label>
                <input
                  id="image_url"
                  type="url"
                  name="image_url"
                  placeholder="Contoh: https://images.com/dish.jpg"
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="display_order" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Urutan Tampilan
                </label>
                <input
                  id="display_order"
                  type="number"
                  name="display_order"
                  placeholder="Contoh: 1"
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Tersedia
                  </span>
                  <select
                    name="available"
                    className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm cursor-pointer"
                  >
                    <option value="true">Ya</option>
                    <option value="false">Tidak</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Best Seller
                  </span>
                  <select
                    name="is_featured"
                    className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm cursor-pointer"
                  >
                    <option value="false">Tidak</option>
                    <option value="true">Ya</option>
                  </select>
                </div>
              </div>

              <SubmitButton label="Tambah Produk" icon={<Plus size={16} />} />
            </form>
          </div>

          {/* Right Column: Products Listing */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-5">
                Daftar Menu ({products?.length || 0})
              </h2>

              {(!products || products.length === 0) ? (
                <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
                  <p className="text-neutral-500 text-sm">Tidak ada produk ditemukan. Tambah menu baru untuk memulainya.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((p) => {
                    const categoryName = (p.categories as unknown as { name: string } | null)?.name || 'Uncategorized';
                    return (
                      <div key={p.id} className="bg-[#0F0F10] border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-700/50 transition-all group">
                        <div>
                          {/* Upper info */}
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              {categoryName}
                            </span>
                            
                            <div className="flex gap-1.5">
                              {p.is_featured && (
                                <span className="p-1 rounded-md bg-amber-500/15 text-amber-500" title="Featured Item">
                                  <Star size={12} fill="currentColor" />
                                </span>
                              )}
                              {p.available ? (
                                <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-400" title="Tersedia">
                                  <Check size={12} />
                                </span>
                              ) : (
                                <span className="p-1 rounded-md bg-red-500/15 text-red-400" title="Habis">
                                  <X size={12} />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title and price */}
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-white text-sm group-hover:text-amber-500 transition-colors">
                              {p.name}
                            </h3>
                            <span className="text-sm font-extrabold text-white shrink-0">
                              Rp {Number(p.price).toLocaleString('id-ID')}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-400 mt-2 line-clamp-2 min-h-[2rem]">
                            {p.description || 'Tidak ada deskripsi.'}
                          </p>
                        </div>

                        {/* Lower info / action */}
                        <div className="flex items-center justify-between border-t border-neutral-800/60 mt-4 pt-3">
                          <span className="text-[10px] text-neutral-500">
                            Urutan: {p.display_order}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(p);
                                setEditErrorMsg(null);
                              }}
                              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-450 hover:text-white transition-all cursor-pointer"
                              title="Edit Produk"
                            >
                              <Edit size={14} />
                            </button>
                            <form onSubmit={handleDeleteProductSubmit}>
                              <input type="hidden" name="id" value={p.id} />
                              <DeleteIconButton title="Hapus Produk" />
                            </form>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* CATEGORIES TAB content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Create Category Form */}
          <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Plus size={18} className="text-amber-500" />
              <span>Tambah Kategori Baru</span>
            </h2>

            <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Nama Kategori
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Contoh: Makanan Utama, Minuman"
                  required
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="icon" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Ikon Kategori
                </label>
                <select
                  id="icon"
                  name="icon"
                  required
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="Utensils">Utensils (Makanan)</option>
                  <option value="Coffee">Coffee (Minuman)</option>
                  <option value="Cookie">Cookie (Camilan / Penutup)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sort_order" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Urutan Tampilan
                </label>
                <input
                  id="sort_order"
                  type="number"
                  name="sort_order"
                  placeholder="Contoh: 1"
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>

              <SubmitButton label="Tambah Kategori" icon={<Plus size={16} />} />
            </form>
          </div>

          {/* Right Column: Categories Listing */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-5">
                Daftar Kategori ({categories?.length || 0})
              </h2>

              {(!categories || categories.length === 0) ? (
                <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
                  <p className="text-neutral-500 text-sm">Tidak ada kategori ditemukan. Tambah kategori baru untuk memulai.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((c) => (
                    <div key={c.id} className="bg-[#0F0F10] border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-700/50 transition-all group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white text-sm group-hover:text-amber-500 transition-colors">
                            {c.name}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-1">
                            Ikon: {c.icon || 'Utensils'}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          Urutan: {c.sort_order}
                        </span>
                      </div>

                      <div className="flex items-center justify-end border-t border-neutral-800/60 mt-4 pt-3">
                        <form onSubmit={handleDeleteCategorySubmit}>
                          <input type="hidden" name="id" value={c.id} />
                          <DeleteIconButton title="Hapus Kategori" />
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#141415] border border-neutral-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute right-6 top-6 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2.5">
              <Edit className="text-amber-500" />
              <span>Edit Produk</span>
            </h3>

            {editErrorMsg && (
              <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-455 animate-pulse" />
                <div>
                  <p className="font-semibold text-red-450">Gagal Memperbarui</p>
                  <p className="mt-0.5 text-neutral-350">{editErrorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateProductSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="edit-name" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Nama Produk
                </label>
                <input
                  id="edit-name"
                  type="text"
                  name="name"
                  defaultValue={editingProduct.name}
                  required
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-category_id" className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider">
                  Kategori
                </label>
                <select
                  id="edit-category_id"
                  name="category_id"
                  defaultValue={editingProduct.category_id || ''}
                  required
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm cursor-pointer"
                >
                  <option value="" className="text-neutral-500">Pilih Kategori</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-white bg-[#141415]">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-description" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Deskripsi
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={2}
                  defaultValue={editingProduct.description || ''}
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="edit-price" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Harga (Rupiah)
                  </label>
                  <input
                    id="edit-price"
                    type="number"
                    name="price"
                    min="0"
                    step="500"
                    defaultValue={editingProduct.price}
                    required
                    className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-display_order" className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider">
                    Urutan
                  </label>
                  <input
                    id="edit-display_order"
                    type="number"
                    name="display_order"
                    defaultValue={editingProduct.display_order}
                    className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-image_url" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  URL Gambar (Opsional)
                </label>
                <input
                  id="edit-image_url"
                  type="url"
                  name="image_url"
                  defaultValue={editingProduct.image_url || ''}
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider">
                    Tersedia
                  </span>
                  <select
                    name="available"
                    defaultValue={editingProduct.available ? 'true' : 'false'}
                    className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm cursor-pointer"
                  >
                    <option value="true" className="text-white bg-[#141415]">Ya</option>
                    <option value="false" className="text-white bg-[#141415]">Tidak</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider">
                    Best Seller
                  </span>
                  <select
                    name="is_featured"
                    defaultValue={editingProduct.is_featured ? 'true' : 'false'}
                    className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm cursor-pointer"
                  >
                    <option value="false" className="text-white bg-[#141415]">Tidak</option>
                    <option value="true" className="text-white bg-[#141415]">Ya</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer text-center text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {isEditSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
