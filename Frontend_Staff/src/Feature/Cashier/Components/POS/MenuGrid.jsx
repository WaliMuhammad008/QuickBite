import React from "react";
import MenuItemCard from "./MenuItemCard";
import { FaSearch } from "react-icons/fa";

export default function MenuGrid({
  items = [],
  isLoading = false,
  onItemClick,
  searchTerm = "",
  onClearSearch,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-3 space-y-2 animate-pulse"
          >
            <div className="w-full aspect-4/3 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
          <FaSearch className="text-lg" />
        </div>
        <h3 className="m-0 text-base font-bold text-zinc-800 dark:text-zinc-200">
          No Menu Items Found
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
          {searchTerm
            ? `No products matching "${searchTerm}". Try another search term.`
            : "No items available in this category."}
        </p>
        {searchTerm && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold transition-all hover:bg-amber-400 border-none cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
      style={{ transform: "none", perspective: "none" }}
    >
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} onItemClick={onItemClick} />
      ))}
    </div>
  );
}
