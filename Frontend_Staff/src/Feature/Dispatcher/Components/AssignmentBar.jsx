import React from "react";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

export default function AssignmentBar({ order, rider, onConfirm, onCancel }) {
  if (!order || !rider) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md bg-stone-900/95 text-white dark:bg-neutral-900/95 dark:text-neutral-100 backdrop-blur-md border border-stone-700/60 dark:border-neutral-700/60 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 z-50 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
      <div className="min-w-0 flex-1">
        <span className="text-xs text-stone-300 block truncate">
          Assigning <strong className="text-amber-400 font-mono">#{order.id}</strong> to{" "}
          <strong className="text-emerald-400">{rider.name}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-all border-none cursor-pointer text-xs"
            title="Cancel selection"
          >
            <FaTimes />
          </button>
        )}
        <button
          type="button"
          onClick={onConfirm}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all border-none cursor-pointer shadow-md"
        >
          <FaCheckCircle className="text-xs" />
          <span>Confirm</span>
        </button>
      </div>
    </div>
  );
}