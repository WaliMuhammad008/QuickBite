import React from "react";
import { FaArrowLeft, FaThLarge } from "react-icons/fa";

export default function CategoryFilters({
  categories = ["All"],
  selectedCategory = "All",
  setSelectedCategory,
  onBackToCategories,
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
      {/* Back Button */}
      {onBackToCategories && (
        <button
          type="button"
          onClick={onBackToCategories}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all shrink-0 cursor-pointer"
        >
          <FaArrowLeft className="text-xs text-amber-500" />
          <span>Categories</span>
        </button>
      )}

      {/* Category Pills */}
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
              isSelected
                ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20 font-extrabold scale-[1.02]"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            {cat === "All" ? (
              <span className="flex items-center gap-1.5">
                <FaThLarge className="text-[10px]" /> All Items
              </span>
            ) : (
              cat
            )}
          </button>
        );
      })}
    </div>
  );
}
