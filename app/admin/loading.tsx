import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full font-sans">
      {/* Header Skeleton */}
      <div className="border-b border-neutral-800 pb-5 space-y-3">
        <div className="h-8 w-48 bg-neutral-800 rounded-xl animate-pulse" />
        <div className="h-4 w-72 bg-neutral-800/60 rounded-lg animate-pulse" />
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#141415] border border-neutral-850/60 rounded-2xl p-6 h-28 flex flex-col justify-between">
          <div className="h-4 w-24 bg-neutral-800 rounded-md animate-pulse" />
          <div className="h-8 w-32 bg-neutral-800 rounded-lg animate-pulse mt-3" />
        </div>
        <div className="bg-[#141415] border border-neutral-850/60 rounded-2xl p-6 h-28 flex flex-col justify-between">
          <div className="h-4 w-28 bg-neutral-800 rounded-md animate-pulse" />
          <div className="h-8 w-24 bg-neutral-800 rounded-lg animate-pulse mt-3" />
        </div>
        <div className="bg-[#141415] border border-neutral-850/60 rounded-2xl p-6 h-28 flex flex-col justify-between">
          <div className="h-4 w-20 bg-neutral-800 rounded-md animate-pulse" />
          <div className="h-8 w-28 bg-neutral-800 rounded-lg animate-pulse mt-3" />
        </div>
      </div>

      {/* Main Body Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card Skeleton */}
        <div className="bg-[#141415] border border-neutral-850/60 rounded-2xl p-6 h-[400px] space-y-4">
          <div className="h-5 w-32 bg-neutral-800 rounded-md animate-pulse" />
          <div className="space-y-3 pt-4">
            <div className="h-3 w-16 bg-neutral-800/60 rounded animate-pulse" />
            <div className="h-10 w-full bg-neutral-800/40 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-20 bg-neutral-800/60 rounded animate-pulse" />
            <div className="h-10 w-full bg-[#0F0F10] border border-neutral-800 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-24 bg-neutral-800/60 rounded animate-pulse" />
            <div className="h-20 w-full bg-[#0F0F10] border border-neutral-800 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Right Listing Skeleton */}
        <div className="lg:col-span-2 bg-[#141415] border border-neutral-850/60 rounded-2xl p-6 h-[500px] space-y-6">
          <div className="h-5 w-40 bg-neutral-800 rounded-md animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#0F0F10] border border-neutral-800 rounded-xl p-4 h-36 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-4 w-16 bg-neutral-800/80 rounded animate-pulse" />
                    <div className="h-4 w-4 bg-neutral-800/80 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-32 bg-neutral-800 rounded-md animate-pulse" />
                  <div className="h-3 w-full bg-neutral-800/50 rounded animate-pulse mt-3" />
                </div>
                <div className="flex justify-between items-center border-t border-neutral-800/60 pt-2.5">
                  <div className="h-3 w-12 bg-neutral-800/40 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-neutral-800/40 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
