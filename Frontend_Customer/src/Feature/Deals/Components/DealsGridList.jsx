import React from "react";
import { FaPercentage } from "react-icons/fa";
import { LuSlidersHorizontal } from "react-icons/lu";
import DealCard from "../../../Components/UI/DealCard";

export default function DealsGridList({
  activeCategory,
  setActiveCategory,
  isDesktopSidebarVisible,
  setIsDesktopSidebarVisible,
  setIsMobileFilterOpen,
  isLoading,
  filteredDeals = [],
}) {
  return (
    <div className="flex-1 min-w-0 w-full transition-all duration-300 ease-in-out">
      {/* Header / Active Category Bar */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-gray-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <h2 className="text-lg sm:text-2xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-gray-900 dark:text-white m-0">
            {activeCategory}
          </h2>

          {/* Desktop Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setIsDesktopSidebarVisible((prev) => !prev)}
            className="hidden lg:flex items-center justify-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400 shadow-xs transition-all active:scale-95 cursor-pointer"
            title={isDesktopSidebarVisible ? "Hide Filters" : "Show Filters"}
          >
            <LuSlidersHorizontal className="text-xs sm:text-sm" />
          </button>

          {/* Mobile Filter Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Filter Deals"
          >
            <LuSlidersHorizontal className="text-xs" />
          </button>
        </div>
      </div>

      {/* Deals Grid / States */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-[35vh] gap-3">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm font-bold font-['Oswald',sans-serif] tracking-wider uppercase text-gray-600 dark:text-neutral-400">
            Loading Delicious Combo Deals...
          </span>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-300 dark:border-neutral-800 shadow-sm max-w-md mx-auto my-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <FaPercentage className="text-xl" />
          </div>
          <h3 className="text-lg font-black font-['Oswald',sans-serif] uppercase text-gray-900 dark:text-white mb-1.5">
            No Deals in "{activeCategory}"
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-4">
            Please explore our other categories or view all active meal combos.
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory("All Deals")}
            className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider shadow-md active:scale-95 transition-all cursor-pointer border-none"
          >
            Reset & View All Deals
          </button>
        </div>
      ) : (
        /* Elevated Deals Grid with Dynamic 2-Column Mobile Baseline and 4-Column Expanded Desktop */
        <div
          className={`grid gap-3 sm:gap-4 md:gap-6 w-full transition-all duration-300 ${
            isDesktopSidebarVisible
              ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
          }`}
        >
          {filteredDeals.map((deal, idx) => (
            <div key={deal.id || idx} className="w-full">
              <DealCard deal={deal} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
