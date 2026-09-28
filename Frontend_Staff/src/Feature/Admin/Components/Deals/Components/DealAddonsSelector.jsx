import React from "react";
import { FaLayerGroup } from "react-icons/fa";

export default function DealAddonsSelector({
  availableAddonCategories = [],
  selectedAddonCategories = [],
  toggleAddonCategory,
}) {
  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FaLayerGroup className="text-amber-500 text-sm" />
          <div>
            <h3 className="m-0 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
              3. Addon Groups & Upsells
            </h3>
           
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          {selectedAddonCategories.length} Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {availableAddonCategories.map((cat) => {
          const isSelected = selectedAddonCategories.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleAddonCategory(cat.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-start justify-between gap-2.5 ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500/60 text-slate-900 dark:text-white shadow-xs ring-1 ring-amber-500/30"
                  : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300 hover:border-amber-500/40"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 ${
                      isSelected
                        ? "bg-amber-500 text-neutral-950 font-black"
                        : "border border-slate-300 dark:border-neutral-600"
                    }`}
                  >
                    {isSelected && "✓"}
                  </div>
                  <span className="text-xs font-bold truncate">
                    {cat.name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400 m-0 mt-1 pl-6">
                  {cat.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
