import React from "react";
import { FaSpinner, FaChevronDown, FaCheck } from "react-icons/fa";

/**
 * ServerPaginationControls
 * Reusable server-side pagination bar with progress indicator and "Load More" button.
 * Matches the Cashier OrderHistory design standard.
 */
const ServerPaginationControls = ({
  loadedCount = 0,
  totalCount = 0,
  filteredCount = null,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  itemLabel = "records",
  isSearching = false,
}) => {
  // Hide pagination controls entirely when user is actively searching
  if (isSearching) return null;

  const displayTotal = totalCount || loadedCount;
  const progressPercent = Math.min(
    100,
    Math.round((loadedCount / (displayTotal || 1)) * 100)
  );

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center gap-3 mt-4">
      {/* Progress & count info */}
      <div className="flex flex-col items-center gap-1.5 w-full text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
          <span className="text-slate-500 dark:text-zinc-400">Showing</span>
          <span className="font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] sm:text-xs">
            {filteredCount !== null && filteredCount !== loadedCount
              ? `${filteredCount} (filtered) of `
              : ""}
            {loadedCount}
          </span>
          <span className="text-slate-500 dark:text-zinc-400">of</span>
          <span className="font-mono text-slate-900 dark:text-zinc-100 font-black">
            {displayTotal}
          </span>
          <span className="text-slate-500 dark:text-zinc-400">total {itemLabel}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs sm:max-w-sm h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Load More Button or All Loaded message */}
      <div className="w-full flex justify-center items-center pt-1">
        {hasMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full sm:w-auto max-w-[260px] sm:max-w-none inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-8 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-sm shadow-amber-500/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border-none"
          >
            {isLoadingMore ? (
              <>
                <FaSpinner className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <FaChevronDown className="w-3 h-3 shrink-0" />
                <span>Load More</span>
              </>
            )}
          </button>
        ) : (
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <FaCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>All {displayTotal} {itemLabel} loaded</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerPaginationControls;
