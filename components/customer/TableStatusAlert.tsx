import React from 'react';

interface TableStatusAlertProps {
  type: 'not_found' | 'inactive';
  tableNumber: string;
}

export default function TableStatusAlert({ type, tableNumber }: TableStatusAlertProps) {
  const isNotFound = type === 'not_found';
  const emoji = isNotFound ? '⚠️' : '🔒';
  const title = isNotFound ? 'Meja Tidak Ditemukan' : 'Meja Tidak Aktif';

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col justify-center items-center p-6 font-sans">
      <div className="text-center max-w-sm mx-auto animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <span className="text-red-500 text-3xl font-extrabold">{emoji}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-red-500">{title}</h1>
        <p className="text-neutral-400 mt-2 text-sm">
          Meja nomor &quot;{tableNumber}&quot; {isNotFound ? 'tidak terdaftar dalam sistem kami.' : 'saat ini sedang dinonaktifkan.'}
        </p>
      </div>
    </div>
  );
}
