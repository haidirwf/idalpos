'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Trash2 } from 'lucide-react';

interface SubmitButtonProps {
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SubmitButton({ label, icon, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className || "w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm disabled:opacity-85 disabled:cursor-not-allowed"}
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          {icon}
        </>
      )}
    </button>
  );
}

interface DeleteIconButtonProps {
  title?: string;
}

export function DeleteIconButton({ title = "Delete" }: DeleteIconButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer disabled:opacity-80 flex items-center justify-center"
      title={title}
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin text-red-400" />
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  );
}
