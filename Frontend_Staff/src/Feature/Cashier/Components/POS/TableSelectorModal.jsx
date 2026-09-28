import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaTimes, FaChair, FaCheckCircle, FaBan, FaSyncAlt, FaSearch } from "react-icons/fa";

export default function TableSelectorModal({ isOpen, onClose, onSelectTable, selectedTable }) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tablesData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["restaurant_tables"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_tables.php`);
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    },
    enabled: isOpen,
    staleTime: 5000,
  });

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tables = tablesData || [];
  const availableCount = tables.filter((t) => !t.is_occupied).length;
  const occupiedCount = tables.filter((t) => t.is_occupied).length;

  const filteredTables = tables.filter((table) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    return (
      (table.table_name || "").toLowerCase().includes(term) ||
      String(table.id || "").includes(term)
    );
  });

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-lg">
              <FaChair />
            </div>
            <div>
              <h3 className="m-0 font-['Oswald',sans-serif] font-black text-lg text-zinc-900 dark:text-white uppercase tracking-wide">
                Dine-In Table Selector
              </h3>
              <p className="m-0 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Live Occupancy Floor Status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className={`w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-500 flex items-center justify-center border-none cursor-pointer transition-colors ${
                isFetching ? "animate-spin text-amber-500" : ""
              }`}
              title="Refresh Tables"
            >
              <FaSyncAlt className="text-xs" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center justify-between my-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-600 dark:text-zinc-300 font-bold">
              Available: <span className="text-emerald-600 dark:text-emerald-400">{availableCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-zinc-600 dark:text-zinc-300 font-bold">
              Occupied: <span className="text-rose-600 dark:text-rose-400">{occupiedCount}</span>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3 shrink-0">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search table number (e.g. Table 1, 5)..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono box-border"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-[9px] border-none cursor-pointer"
              title="Clear Search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Tables Grid */}
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-zinc-400 font-mono">
              Loading floor tables...
            </div>
          ) : tables.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-400">
              No tables configured in restaurant database.
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <p className="m-0 font-bold mb-2">No tables found matching "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredTables.map((table) => {
                const isOccupied = !!table.is_occupied;
                const isSelected = selectedTable === table.table_name;

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={isOccupied}
                    onClick={() => {
                      if (!isOccupied) {
                        onSelectTable(table.table_name);
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center relative ${
                      isOccupied
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 cursor-not-allowed opacity-75"
                        : isSelected
                        ? "bg-amber-500 text-neutral-950 font-black border-amber-500 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400 cursor-pointer"
                        : "bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-500/10 border-zinc-200 dark:border-zinc-700/80 hover:border-emerald-500/40 text-zinc-900 dark:text-white cursor-pointer active:scale-95"
                    }`}
                  >
                    <div className="text-sm font-black font-['Oswald',sans-serif] uppercase tracking-wider">
                      {table.table_name}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase font-mono">
                      {isOccupied ? (
                        <>
                          <FaBan className="text-[9px]" />
                          <span>OCCUPIED</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="text-[9px] text-emerald-500" />
                          <span className={isSelected ? "text-neutral-900" : "text-emerald-600 dark:text-emerald-400"}>
                            AVAILABLE
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
