import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createProduct, deleteProduct } from '@/lib/actions/admin';
import { Utensils, Plus, Trash2, Check, X, Star } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params?.error;
  const supabase = await createClient();

  // Fetch all categories for the dropdown selector
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  // Fetch products with their category names joined
  const { data: products } = await supabase
    .from('products')
    .select('*, categories ( name )')
    .order('display_order');

  async function handleCreate(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const category_id = formData.get('category_id') as string;
    const description = formData.get('description') as string || '';
    const price = parseFloat(formData.get('price') as string || '0');
    const image_url = formData.get('image_url') as string || '';
    const available = formData.get('available') === 'true';
    const display_order = parseInt(formData.get('display_order') as string || '0', 10);
    const is_featured = formData.get('is_featured') === 'true';

    try {
      await createProduct({
        name,
        category_id,
        description,
        price,
        image_url,
        available,
        display_order,
        is_featured,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      redirect(`/admin/menu?error=${encodeURIComponent(msg)}`);
    }
    redirect('/admin/menu');
  }

  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    try {
      await deleteProduct(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      redirect(`/admin/menu?error=${encodeURIComponent(msg)}`);
    }
    redirect('/admin/menu');
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Utensils className="text-amber-500" />
            <span>Manage Menu & Products</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Create, update, and delete menu items offered to customers
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Form */}
        <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Plus size={18} className="text-amber-500" />
            <span>Add New Product</span>
          </h2>

          <form action={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="e.g. Nasi Goreng Spesial"
                required
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category_id" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                required
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="" className="text-neutral-500">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-white bg-[#141415]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Describe this dish, ingredients, etc."
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="price" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Price (IDR)
              </label>
              <input
                id="price"
                type="number"
                name="price"
                min="0"
                step="500"
                placeholder="e.g. 25000"
                required
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="image_url" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Image URL (Optional)
              </label>
              <input
                id="image_url"
                type="url"
                name="image_url"
                placeholder="e.g. https://images.com/dish.jpg"
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="display_order" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Display Order
              </label>
              <input
                id="display_order"
                type="number"
                name="display_order"
                placeholder="e.g. 1"
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Available
                </span>
                <select
                  name="available"
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm cursor-pointer"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Featured
                </span>
                <select
                  name="is_featured"
                  className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm cursor-pointer"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-4 text-sm"
            >
              <span>Add Product</span>
              <Plus size={16} />
            </button>
          </form>
        </div>

        {/* Right Column: Listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-5">
              Menu Items ({products?.length || 0})
            </h2>

            {(!products || products.length === 0) ? (
              <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
                <p className="text-neutral-500 text-sm">No products found. Add some items to populate the menu.</p>
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
                              <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-400" title="Available">
                                <Check size={12} />
                              </span>
                            ) : (
                              <span className="p-1 rounded-md bg-red-500/15 text-red-400" title="Unavailable">
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
                            Rp {parseFloat(p.price).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-400 mt-2 line-clamp-2 min-h-[2rem]">
                          {p.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Lower info / action */}
                      <div className="flex items-center justify-between border-t border-neutral-800/60 mt-4 pt-3">
                        <span className="text-[10px] text-neutral-500">
                          Order: {p.display_order}
                        </span>

                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
