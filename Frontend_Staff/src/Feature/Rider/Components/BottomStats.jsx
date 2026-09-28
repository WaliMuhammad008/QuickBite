import React from "react";

export default function BottomStats({ stats }) {
  return (
    <div className="sticky bottom-0 left-0 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-stone-200 dark:border-neutral-800 flex justify-around py-3 px-4 z-40 transition-colors shadow-lg">
      <div className="text-center">
        <div className="text-stone-900 dark:text-white text-xl font-black font-['Oswald',sans-serif]">
          {stats.deliveries}
        </div>
        <div className="text-stone-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
          Deliveries
        </div>
      </div>

      <div className="h-8 w-px bg-stone-200 dark:border-neutral-800 self-center" />

      <div className="text-center">
        <div className="text-emerald-600 dark:text-emerald-400 text-xl font-black font-['Oswald',sans-serif]">
          Rs {stats.earnings.toLocaleString()}
        </div>
        <div className="text-stone-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
          Earned Today
        </div>
      </div>
    </div>
  );
}