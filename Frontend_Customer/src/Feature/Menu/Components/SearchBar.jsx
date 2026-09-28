import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { FiSliders } from "react-icons/fi";
import { resolveImageUrl } from "../../../utils/imageOptimizer";

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  showDropdown,
  setShowDropdown,
  searchBoxRef,
  onFilterToggle,
  isFilterActive,
}) => {
  return (
    <div className="sticky top-14 sm:top-16 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-[#0a0a0c]/95 pt-3.5 pb-3 px-2 border-b border-gray-200/80 dark:border-neutral-800 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center gap-3 w-full px-2 sm:px-4">
        {/* ══ Restored FILTERS Button on the Left ══ */}
        <button
          type="button"
          onClick={onFilterToggle}
          className={`px-4 py-2.5 rounded-2xl transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer border shadow-sm font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider flex-shrink-0 ${
            isFilterActive
              ? "bg-amber-400 hover:bg-amber-500 text-gray-950 border-amber-400 shadow-amber-400/25 ring-2 ring-amber-400/30"
              : "bg-amber-400 hover:bg-amber-500 text-gray-950 border-amber-400 hover:shadow-md"
          }`}
          title="Toggle Categories / Filters"
          aria-label="Toggle Categories / Filters"
        >
          <FiSliders className="w-4 h-4 text-sm" />
          <span>Filters</span>
        </button>

        {/* ══ Sleek Wide Search Bar ══ */}
        <div
          className="flex-1 flex items-center bg-gray-100 dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl shadow-xs px-4 py-2.5 focus-within:ring-2 focus-within:ring-amber-400 focus-within:bg-white dark:focus-within:bg-neutral-900 focus-within:border-transparent transition-all duration-200 relative"
          ref={searchBoxRef}
        >
          <FaSearch className="text-gray-400 dark:text-neutral-500 text-xs mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="e.g: burgers, pizzas, drinks, fried chicken, wraps..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="flex-1 bg-transparent border-none text-gray-900 dark:text-white text-xs sm:text-sm outline-none py-0.5 w-full placeholder:text-gray-400 dark:placeholder:text-neutral-500 font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setShowDropdown(false);
              }}
              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showDropdown && searchTerm && searchResults.length > 0 && (
            <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-white dark:bg-[#18181b] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
              {searchResults.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 dark:border-neutral-800/80 transition-colors duration-150 last:border-b-0 hover:bg-amber-50 dark:hover:bg-amber-400/10"
                  onClick={() => {
                    setSearchTerm(item.name);
                    setShowDropdown(false);
                  }}
                >
                  <img
                    className="w-10 h-10 rounded-xl object-contain p-0.5 border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 flex-shrink-0"
                    src={resolveImageUrl(
                      item.img || "https://placehold.co/100x100",
                      100
                    )}
                    alt={item.name}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-gray-900 dark:text-white text-xs sm:text-sm font-bold truncate">
                      {item.name}
                    </span>
                    <span className="text-amber-500 text-xs font-semibold">
                      Rs {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;