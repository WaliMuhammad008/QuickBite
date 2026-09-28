import React from "react";
import { FaSearch } from "react-icons/fa";

export default function EmployeeFilterBar({
  totalCount = 0,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="admin-card-surface flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-3 sm:p-4 rounded-2xl shadow-sm">
      <div className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
        Staff
      </div>
      <div className="flex items-center bg-slate-50 dark:bg-[#111111] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 focus-within:border-amber-500 transition-colors w-full sm:w-80">
        <FaSearch className="text-slate-400 dark:text-neutral-500 text-xs mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, role, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-slate-900 dark:text-white text-xs outline-none w-full placeholder-slate-400 dark:placeholder-neutral-500 font-medium"
        />
      </div>
    </div>
  );
}
