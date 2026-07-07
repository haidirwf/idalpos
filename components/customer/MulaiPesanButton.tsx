'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface MulaiPesanButtonProps {
  tableNumber: string;
}

export default function MulaiPesanButton({ tableNumber }: MulaiPesanButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      router.push(`/table/${tableNumber}/menu`);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-80 text-black font-extrabold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat Menu...</span>
        </>
      ) : (
        <span>Mulai Pesan</span>
      )}
    </button>
  );
}
