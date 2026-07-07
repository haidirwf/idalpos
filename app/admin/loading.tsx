import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center animate-in fade-in duration-300 font-sans">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
        <p className="text-neutral-400 text-sm font-medium">Memuat halaman...</p>
      </div>
    </div>
  );
}
