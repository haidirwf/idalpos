import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createCategory, deleteCategory } from '@/lib/actions/admin';
import { Grid, Plus, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params?.error;

  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order');

  async function handleCreate(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const icon = formData.get('icon') as string;
    const sortOrder = parseInt(formData.get('sort_order') as string || '0', 10);
    try {
      await createCategory(name, icon, sortOrder);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      redirect(`/admin/categories?error=${encodeURIComponent(msg)}`);
    }
    redirect('/admin/categories');
  }

  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    try {
      await deleteCategory(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      redirect(`/admin/categories?error=${encodeURIComponent(msg)}`);
    }
    redirect('/admin/categories');
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Grid className="text-amber-500" />
            <span>Manage Categories</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Organize products into categories for easy customer ordering
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
        {/* Left Column: Form */}
        <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Plus size={18} className="text-amber-500" />
            <span>Add New Category</span>
          </h2>

          <form action={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Category Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="e.g. Makanan Utama"
                required
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="icon" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Icon Name (Lucide Icon name)
              </label>
              <input
                id="icon"
                type="text"
                name="icon"
                placeholder="e.g. Coffee, Utensils, Cookie"
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sort_order" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Display Sort Order
              </label>
              <input
                id="sort_order"
                type="number"
                name="sort_order"
                placeholder="e.g. 1"
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
            >
              <span>Add Category</span>
              <Plus size={16} />
            </button>
          </form>
        </div>

        {/* Right Column: Listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-5">
              Existing Categories ({categories?.length || 0})
            </h2>

            {(!categories || categories.length === 0) ? (
              <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
                <p className="text-neutral-500 text-sm">No categories found. Create one to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800/80">
                {categories.map((c) => (
                  <div key={c.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-800/50 border border-neutral-800 flex items-center justify-center text-amber-500 font-mono text-xs">
                        {c.icon ? c.icon.substring(0, 3) : 'Cat'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{c.name}</h3>
                        <p className="text-xs text-neutral-500">Icon: {c.icon || 'none'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-xs font-semibold text-neutral-400 bg-[#0F0F10] border border-neutral-800/60 px-2.5 py-1 rounded-lg">
                        Order: {c.sort_order}
                      </span>
                      
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
