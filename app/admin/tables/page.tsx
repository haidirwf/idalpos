import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createTable, deleteTable } from '@/lib/actions/admin';
import { Tablet, Plus, Trash2, ExternalLink, Download } from 'lucide-react';

export default async function TablesPage() {
  const supabase = await createClient();
  const { data: tables } = await supabase.from('tables').select('*').order('number');

  async function handleCreate(formData: FormData) {
    'use server';
    const number = formData.get('number') as string;
    await createTable(number);
  }

  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await deleteTable(id);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Tablet className="text-amber-500" />
            <span>Manage Tables & QR Codes</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Register restaurant tables and access their QR codes for customer self-ordering
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Plus size={18} className="text-amber-500" />
            <span>Register New Table</span>
          </h2>

          <form action={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="number" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Table Number / Name
              </label>
              <input
                id="number"
                type="text"
                name="number"
                placeholder="e.g. 01, VIP-1"
                required
                className="w-full bg-[#0F0F10] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              />
              <p className="text-[10px] text-neutral-500">
                A QR code will automatically be configured pointing to this table ID.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
            >
              <span>Add Table</span>
              <Plus size={16} />
            </button>
          </form>
        </div>

        {/* Right Column: Listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#141415] border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-5">
              Restaurant Tables ({tables?.length || 0})
            </h2>

            {(!tables || tables.length === 0) ? (
              <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
                <p className="text-neutral-500 text-sm">No tables registered yet. Add one above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tables.map((t) => (
                  <div key={t.id} className="bg-[#0F0F10] border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700/50 transition-all group">
                    <div className="flex gap-4">
                      {/* QR Code Container */}
                      <div className="w-24 h-24 shrink-0 bg-white p-1.5 rounded-xl border border-neutral-800 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                        {t.qr_code_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={t.qr_code_url}
                            alt={`QR Code Table ${t.number}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-neutral-400 text-center font-semibold">Generating...</span>
                        )}
                      </div>

                      {/* Info Container */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-extrabold text-white text-base">
                              Table {t.number}
                            </h3>
                            
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              {t.status || 'active'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                            ID: {t.id.substring(0, 8)}...
                          </p>
                        </div>

                        {/* Quick Action Links */}
                        <div className="flex items-center gap-3 mt-3">
                          {t.qr_code_url && (
                            <>
                              <a
                                href={t.qr_code_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-semibold transition-all"
                                title="Open QR Code"
                              >
                                <ExternalLink size={12} />
                                <span>Open</span>
                              </a>
                              
                              <a
                                href={t.qr_code_url}
                                download={`table-${t.number}-qr.png`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-semibold transition-all"
                                title="Download QR Code"
                              >
                                <Download size={12} />
                                <span>Download</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Footer */}
                    <div className="flex items-center justify-between border-t border-neutral-800/60 mt-4 pt-3">
                      <span className="text-[10px] text-neutral-500">
                        Added: {new Date(t.created_at).toLocaleDateString()}
                      </span>

                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={t.id} />
                        <button
                          type="submit"
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer"
                          title="Delete Table"
                        >
                          <Trash2 size={14} />
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
