import React from "react";

export default function StatusToggle({ isOnline, onToggle, isToggling }) {
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-stone-50 dark:bg-neutral-950/80 border-b border-stone-200 dark:border-neutral-800 transition-colors">
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isOnline ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
          }`}
        />
        <span
          className={`font-black text-xs tracking-wider uppercase font-['Oswald',sans-serif] ${
            isOnline
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-stone-500 dark:text-neutral-400"
          }`}
        >
          {isOnline ? "Duty Status: ONLINE" : "Duty Status: OFFLINE"}
        </span>
      </div>

      <button
        type="button"
        disabled={isToggling}
        onClick={onToggle}
        className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out border-none p-0 focus:outline-hidden disabled:opacity-50 ${
          isOnline ? "bg-emerald-500" : "bg-stone-300 dark:bg-neutral-700"
        }`}
        aria-label="Toggle duty status"
      >
        <span
          className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 ease-out shadow-sm block ${
            isOnline ? "left-8" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}