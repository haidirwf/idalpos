import React from 'react';
import { createClient } from '@/lib/supabase/server';
import TableStatusAlert from '@/components/customer/TableStatusAlert';
import MulaiPesanButton from '@/components/customer/MulaiPesanButton';

interface Props {
  params: Promise<{ tableNumber: string }>;
}

export default async function TableLandingPage({ params }: Props) {
  const resolvedParams = await params;
  const tableNumber = resolvedParams.tableNumber;

  const supabase = await createClient();
  const { data: table, error } = await supabase
    .from('tables')
    .select('*')
    .eq('number', tableNumber)
    .single();

  if (error || !table) {
    return <TableStatusAlert type="not_found" tableNumber={tableNumber} />;
  }

  if (table.status !== 'active') {
    return <TableStatusAlert type="inactive" tableNumber={tableNumber} />;
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col justify-between p-6 font-sans animate-in fade-in duration-300">
      <div className="my-auto text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <span className="text-[#F59E0B] text-3xl font-extrabold">🍴</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Selamat Datang</h1>
        <p className="text-neutral-400 mt-2 text-sm">Meja Anda saat ini adalah</p>
        <div className="bg-[#18181B] border border-neutral-800 py-6 px-12 rounded-2xl my-6 inline-block font-mono text-4xl font-bold text-[#F59E0B] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {tableNumber}
        </div>
        <p className="text-xs text-neutral-500 mb-8">Pilih menu favorit Anda tanpa antre & langsung diantar</p>
        <MulaiPesanButton tableNumber={tableNumber} />
      </div>
    </div>
  );
}
