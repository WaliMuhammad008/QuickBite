import React from "react";
import { FaSearch, FaPlus } from "react-icons/fa";

const InventoryControls = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onAddClick,
}) => {
  const tabs = ["All", "In Stock", "Low Stock", "Out of Stock"];

  return (
    <div className="admin-card-surface flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5 p-3 sm:p-4 rounded-2xl shadow-sm">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar w-full sm:w-auto">
        <div className="bg-slate-100 dark:bg-[#202020] p-1 rounded-full border border-slate-200/80 dark:border-white/[0.06] flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all whitespace-nowrap shrink-0 border-none ${
                  isActive
                    ? "bg-amber-500/90 dark:bg-amber-500 text-neutral-900 shadow-sm"
                    : "bg-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar & Add Button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:w-64">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 text-xs" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="bg-amber-500/90 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-neutral-900 font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none shrink-0 active:scale-95"
        >
          <FaPlus className="text-xs" />
          <span className="hidden sm:inline">Add Ingredient</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </div>
  );
};

export default InventoryControls;
