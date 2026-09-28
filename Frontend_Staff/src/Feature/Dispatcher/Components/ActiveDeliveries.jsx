import React from "react";
import { FaRoute, FaMotorcycle, FaCheckCircle } from "react-icons/fa";

export default function ActiveDeliveries({ activeTrips = [], onComplete }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-3.5 sm:p-4 h-full flex flex-col shadow-xs transition-colors overflow-hidden">
      {/* Header Accent Styling */}
      <div className="text-sky-600 dark:text-sky-400 border-b-2 border-sky-500/30 pb-2 mb-3 flex items-center justify-between shrink-0 font-['Oswald',sans-serif]">
        <h3 className="m-0 text-sm sm:text-base font-black uppercase flex items-center gap-2 tracking-wide">
          <FaRoute className="text-sky-500 text-xs" />
          <span>Active Trips (On The Way)</span>
        </h3>
        <span className="bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
          {activeTrips.length}
        </span>
      </div>

      {/* Deliveries List */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 overscroll-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800">
        {activeTrips.length > 0 ? (
          activeTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 border-l-4 border-l-sky-500 hover:border-sky-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="min-w-0 flex-1">
                <div className="font-mono font-black text-sm text-stone-900 dark:text-white mb-1">
                  Order #{trip.id}
                </div>
                <div className="text-xs font-bold text-stone-800 dark:text-neutral-200 truncate">
                  {trip.customer} — {trip.address}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-neutral-800 text-[11px] text-stone-700 dark:text-neutral-300 font-semibold mt-2">
                  <FaMotorcycle className="text-amber-500 text-[10px]" />
                  <span>
                    Rider: <strong className="text-stone-900 dark:text-white">{trip.assignedRider.name}</strong>
                  </span>
                </div>
              </div>

              {/* Force Complete Action */}
              <button
                type="button"
                onClick={() => onComplete(trip.id, trip.assignedRider?.id || trip.rider_id)}
                className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-700 dark:text-sky-400 hover:text-white border border-sky-500/20 hover:border-sky-500 text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 self-start sm:self-center"
              >
                <FaCheckCircle className="text-[11px]" />
                <span>Mark Delivered</span>
              </button>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-xs text-stone-400 dark:text-neutral-500 font-semibold select-none">
            No active deliveries on route.
          </div>
        )}
      </div>
    </div>
  );
}