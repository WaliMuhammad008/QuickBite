import React from "react";

export default function ComboIncludedList({ comboItems = [] }) {
  return (
    <div className="overflow-hidden">
      <div className="p-4 pt-0 flex flex-col gap-2 border-t border-gray-200/60 dark:border-neutral-800/80">
        {comboItems.map((cItem, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/80 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <img
                src={cItem.image}
                alt={cItem.name}
                className="w-10 h-10 rounded-xl object-cover p-0.5 border border-amber-400/30 bg-amber-400/10 shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {cItem.name}
                  </span>
                  {cItem.size && cItem.size !== "Regular" && (
                    <span className="text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                      {cItem.size}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
                  {cItem.flavor_name
                    ? `Flavor: ${cItem.flavor_name}`
                    : cItem.is_customizable
                      ? "Choice of flavor below"
                      : "Freshly prepared portion"}
                </span>
              </div>
            </div>
            <span className="text-xs font-black bg-amber-400 text-gray-950 px-2.5 py-1 rounded-lg font-['Oswald',sans-serif] tracking-wider uppercase shrink-0 shadow-xs">
              {cItem.qty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
