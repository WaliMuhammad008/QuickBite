import React from "react";
import {
  FaMotorcycle,
  FaStar,
  FaBiking,
  FaBox,
  FaPhone,
  FaBan,
  FaShippingFast,
} from "react-icons/fa";

function RiderCapacityPill({ rider }) {
  const { activeOrders, isOffline, canAccept } = rider;

  if (isOffline) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 bg-stone-300/20 text-stone-500 dark:text-neutral-500 border border-stone-300/30 dark:border-neutral-700">
        <span className="flex items-center gap-1">
          <FaBan className="text-[8px]" />
          Offline
        </span>
      </span>
    );
  }

  if (activeOrders >= 3) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 animate-pulse">
        Max (3/3)
      </span>
    );
  }

  if (activeOrders > 0) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30">
        Active ({activeOrders}/3)
      </span>
    );
  }

  // 0 active orders, fully available
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
      Available
    </span>
  );
}

export default function ActiveRidersList({
  riders = [],
  selectedId,
  onSelect,
}) {
  // Sort: available first, then by active orders ascending, then offline last
  const sortedRiders = [...riders].sort((a, b) => {
    if (a.isOffline !== b.isOffline) return a.isOffline ? 1 : -1;
    if (a.canAccept !== b.canAccept) return a.canAccept ? -1 : 1;
    return a.activeOrders - b.activeOrders;
  });

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-3.5 sm:p-4 h-full flex flex-col shadow-xs transition-colors overflow-hidden">
      {/* Header Accent Styling */}
      <div className="text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500/30 pb-2 mb-3 flex items-center justify-between shrink-0 font-['Oswald',sans-serif]">
        <div>
          <h3 className="m-0 text-sm sm:text-base font-black uppercase flex items-center gap-2 tracking-wide">
            <FaMotorcycle className="text-emerald-500 text-xs" />
            <span>Active Riders</span>
          </h3>
          <p className="m-0 text-[10px] text-stone-500 dark:text-neutral-400 font-sans">
            Select a rider to assign (max 3 orders each)
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            {riders.filter((r) => r.canAccept).length}/{riders.length}
          </span>
        </div>
      </div>

      {/* Riders List */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 overscroll-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800">
        {sortedRiders.length > 0 ? (
          sortedRiders.map((rider) => {
            const isSelected = selectedId === rider.id;
            const isSelectable = rider.canAccept;

            return (
              <div
                key={rider.id}
                onClick={() => isSelectable && onSelect(rider)}
                className={`bg-stone-50 dark:bg-neutral-950/80 border rounded-xl p-3.5 transition-all duration-200 ${
                  isSelectable
                    ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
                    : "opacity-50 cursor-not-allowed"
                } ${
                  isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm"
                    : "border-stone-200 dark:border-neutral-800 hover:border-emerald-500/40 shadow-xs"
                }`}
              >
                {/* Rider Info Row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Avatar with Live Status Pulse Indicator */}
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-amber-500 text-neutral-950 font-black text-sm flex items-center justify-center shrink-0 shadow-xs font-['Oswald',sans-serif]">
                        {rider.name.charAt(0)}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-900 ${
                          rider.isOffline
                            ? "bg-stone-400"
                            : rider.activeOrders >= 3
                            ? "bg-rose-500"
                            : rider.activeOrders > 0
                            ? "bg-sky-500 animate-pulse"
                            : "bg-emerald-500 animate-pulse"
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="m-0 text-sm font-bold text-stone-900 dark:text-neutral-100 flex items-center gap-1.5 truncate">
                        <span className="truncate">{rider.name}</span>
                        <span className="text-[10px] bg-stone-200 dark:bg-neutral-800 px-1.5 py-0.2 rounded text-stone-700 dark:text-neutral-300 flex items-center gap-1 shrink-0 font-normal">
                          <FaBiking className="text-[9px]" />
                          <span>{rider.vehicle}</span>
                        </span>
                      </h4>
                      <span className="text-xs text-stone-500 dark:text-neutral-400 font-mono flex items-center gap-1">
                        <FaPhone className="text-[9px]" />
                        <span>{rider.phone}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <RiderCapacityPill rider={rider} />
                </div>

                {/* Active Load Bar */}
                {!rider.isOffline && (
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                      <span className="text-stone-500 dark:text-neutral-400 flex items-center gap-1">
                        <FaShippingFast className="text-[9px]" />
                        Active Deliveries
                      </span>
                      <span
                        className={`font-mono font-black ${
                          rider.activeOrders >= 3
                            ? "text-rose-600 dark:text-rose-400"
                            : rider.activeOrders > 0
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {rider.activeOrders}/3
                      </span>
                    </div>
                    {/* Capacity bar visualization */}
                    <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rider.activeOrders >= 3
                            ? "bg-rose-500"
                            : rider.activeOrders >= 2
                            ? "bg-amber-500"
                            : rider.activeOrders >= 1
                            ? "bg-sky-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${(rider.activeOrders / 3) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats Row */}
                {!rider.isOffline && (
                  <div className="grid grid-cols-3 gap-2 mt-2.5 text-xs text-stone-500 dark:text-neutral-400 font-semibold border-t border-dashed border-stone-200 dark:border-neutral-800 pt-2">
                    <div>
                      <span>Trips: </span>
                      <strong className="text-stone-900 dark:text-neutral-200 font-mono">
                        {rider.trips}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-amber-500 text-[10px]" />
                      <span className="text-stone-900 dark:text-neutral-200 font-bold">
                        {rider.rating}
                      </span>
                    </div>
                    <div className="text-right">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {rider.accuracy}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-stone-400 dark:text-neutral-500 font-semibold select-none">
            No registered riders found.
          </div>
        )}
      </div>
    </div>
  );
}