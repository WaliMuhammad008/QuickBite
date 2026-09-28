import React from "react";
import { FaCalendarAlt, FaSyncAlt } from "react-icons/fa";

export default function AnalyticsDateFilterBar({
  statsFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onRefresh,
  isRefreshing = false,
}) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Analytics & Sales Overview
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Real-time business performance metrics, volume patterns, and product trends.
          </p>
        </div>

        {/* Sync Live Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="self-stretch sm:self-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-neutral-200 shadow-xs active:scale-95 disabled:opacity-60"
            title="Sync Live Analytics Data"
            aria-label="Sync Live Analytics Data"
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Live Data"}</span>
          </button>
        )}
      </div>

      {/* Custom Date Range Bar */}
      {statsFilter === "custom" && (
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/[0.04] p-3 rounded-2xl border border-slate-200 dark:border-amber-500/20 flex-wrap">
          <FaCalendarAlt className="text-amber-500 text-xs" />
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
            <span>From:</span>
            <input
              type="date"
              className="bg-white dark:bg-black/40 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300">
            <span>To:</span>
            <input
              type="date"
              className="bg-white dark:bg-black/40 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      )}
    </>
  );
}
