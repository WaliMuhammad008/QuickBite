import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function PosSearchHeader({
  searchTerm,
  setSearchTerm,
  itemCount = 0,
}) {
  return (
    <div className="w-full space-y-3">
      {/* Top Title Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block shrink-0" />
          <h2 className="m-0 font-['Oswald',sans-serif] text-xl sm:text-2xl font-black uppercase tracking-wide text-zinc-900 dark:text-white">
            Point of Sale
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold font-mono">
            {itemCount} Items
          </span>
        </div>
      </div>

      {/* Expansive Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <FaSearch className="text-sm" />
        </div>
        <input
          type="text"
          placeholder="Search menu items by name, category, or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs transition-all box-border"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer"
            aria-label="Clear search"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>
    </div>
  );
}
