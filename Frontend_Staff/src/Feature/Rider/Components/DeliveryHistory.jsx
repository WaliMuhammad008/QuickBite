import React, { useState } from "react";

export default function DeliveryHistory({ history = [] }) {
  const [showAll, setShowAll] = useState(false);

  if (!history || history.length === 0) return null;
  const displayHistory = showAll ? history : history.slice(0, 5);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-stone-900 dark:text-white text-base font-black uppercase tracking-wide font-['Oswald',sans-serif] m-0">
          {showAll ? "Full Delivery History" : "Recent Deliveries"}
        </h3>
        <span className="text-xs font-mono font-bold text-stone-500 dark:text-neutral-400">
          Total: {history.length}
        </span>
      </div>

      <div className="space-y-2">
        {displayHistory.map((item, index) => (
          <div
            key={item.id || index}
            className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex justify-between items-center p-3.5 rounded-xl text-xs shadow-xs transition-colors"
          >
            <div className="min-w-0 flex-1">
              <span className="text-stone-900 dark:text-white font-black font-['Oswald',sans-serif]">
                #{item.id}
              </span>{" "}
              <span className="text-stone-700 dark:text-neutral-300 font-medium truncate">
                — {item.customer}
              </span>
              <div className="text-[11px] font-mono text-stone-400 dark:text-neutral-500 mt-0.5">
                {item.time}
              </div>
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm bg-emerald-500/10 px-2.5 py-1 rounded-lg font-['Oswald',sans-serif] shrink-0 ml-2">
              +Rs {item.earnings}
            </div>
          </div>
        ))}
      </div>

      {history.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2.5 text-center text-amber-600 dark:text-amber-400 text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider bg-transparent border-none cursor-pointer hover:underline active:scale-95"
        >
          {showAll ? "Show Less" : "View All History"}
        </button>
      )}
    </div>
  );
}