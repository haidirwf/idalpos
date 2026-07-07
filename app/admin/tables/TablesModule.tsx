'use client';

import React, { useState } from 'react';
import { createTable, deleteTable } from '@/lib/actions/admin';
import { Tablet, Plus, ExternalLink, Download } from 'lucide-react';
import { usePOS } from '../POSContext';
import { SubmitButton, DeleteIconButton } from '@/components/SubmitButton';

export default function TablesModule() {
  const { tables, refreshData } = usePOS();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const number = formData.get('number') as string;

    try {
      await createTable(number);
      form.reset();
      await refreshData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menambahkan meja');
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    const id = formData.get('id') as string;

    try {
      await deleteTable(id);
      await refreshData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus meja');
    }
  };

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
            <span>Register New Table</span>
          </h2>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
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

            <SubmitButton label="Add Table" icon={<Plus size={16} />} />
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
                {tables.map((t) => {
                  const qrCodeUrl = t.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    `https://idalpos.vercel.app/table/${t.number}`
                  )}`;
                  return (
                    <div key={t.id} className="bg-[#0F0F10] border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700/50 transition-all group">
                      <div className="flex gap-4">
                        {/* QR Code Container */}
                        <div className="w-24 h-24 shrink-0 bg-white p-1.5 rounded-xl border border-neutral-800 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                          <img
                            src={qrCodeUrl}
                            alt={`QR Code Table ${t.number}`}
                            className="w-full h-full object-contain"
                          />
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
                            <a
                              href={qrCodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-semibold transition-all"
                              title="Open QR Code"
                            >
                              <ExternalLink size={12} />
                              <span>Open</span>
                            </a>
                            
                            <a
                              href={qrCodeUrl}
                              download={`table-${t.number}-qr.png`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-semibold transition-all"
                              title="Download QR Code"
                            >
                              <Download size={12} />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Delete Footer */}
                      <div className="flex items-center justify-between border-t border-neutral-800/60 mt-4 pt-3">
                        <span className="text-[10px] text-neutral-500">
                          Added: {new Date(t.created_at).toLocaleDateString()}
                        </span>

                        <form onSubmit={handleDeleteSubmit}>
                          <input type="hidden" name="id" value={t.id} />
                          <DeleteIconButton title="Delete Table" />
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
