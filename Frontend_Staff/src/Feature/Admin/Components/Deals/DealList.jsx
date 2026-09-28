import React from "react";
import { FaFire, FaSearch } from "react-icons/fa";
import DealCardItem from "./Components/DealCardItem";
import { useDealList } from "./hooks/useDealList";

const DealList = ({ onEdit }) => {
  const {
    searchTerm,
    setSearchTerm,
    filteredDeals,
    isLoading,
    handleToggleStatus,
    handleDelete,
  } = useDealList();

  if (isLoading) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center gap-3 text-[var(--admin-muted,#888)]">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Loading Deals Catalog...
        </span>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-4">
      {/* Header Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white dark:bg-[#161616] p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm">
        <div className="flex items-center gap-2">
          <FaFire className="text-amber-500 text-sm" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
            Active Combos & Deals ({filteredDeals.length})
          </span>
        </div>

        <div className="flex items-center bg-slate-50 dark:bg-[#111111] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 focus-within:border-amber-500 transition-colors w-full sm:w-72">
          <FaSearch className="text-slate-400 dark:text-neutral-500 text-xs mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search deals by title or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-900 dark:text-white text-xs outline-none w-full placeholder:text-slate-400 dark:placeholder:text-neutral-500 font-medium"
          />
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredDeals.map((deal) => (
            <DealCardItem
              key={deal.id}
              deal={deal}
              onEdit={onEdit}
              handleToggleStatus={handleToggleStatus}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-[var(--admin-muted,#888)] text-xs sm:text-sm bg-[var(--admin-panel,#171717)] rounded-2xl border border-[var(--admin-border,rgba(255,255,255,0.06))]">
          No combo deals match your search criteria.
        </div>
      )}
    </div>
  );
};

export default DealList;
