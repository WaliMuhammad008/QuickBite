import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

export default function HistoryFilterBar({
  filterType = "ALL",
  setFilterType,
  paymentFilter = "ALL",
  setPaymentFilter,
  searchTerm = "",
  setSearchTerm,
}) {
  const typeTabs = [
    { label: "ALL ORDERS", value: "ALL" },
    { label: "DINE-IN", value: "DINE-IN" },
    { label: "TAKEAWAY", value: "TAKEAWAY" },
    { label: "DELIVERY", value: "DELIVERY" },
  ];

  const paymentTabs = [
    { label: "ALL PAYMENTS", value: "ALL" },
    { label: "PENDING", value: "PENDING" },
    { label: "PAID", value: "PAID" },
    { label: "COD PENDING", value: "COD_PENDING" },
  ];

  return (
    <div className="space-y-3">
      {/* Dual Row Filter Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Order Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterType(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 border-none cursor-pointer ${
                filterType === tab.value
                  ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-black"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Payment Status Filter Chips */}
        {setPaymentFilter && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 self-start md:self-auto">
            <span className="text-[11px] font-bold text-zinc-400 uppercase font-mono mr-1 hidden sm:inline flex items-center gap-1">
              <FaFilter className="w-2.5 h-2.5" />
              Payment:
            </span>
            {paymentTabs.map((tab) => {
              const isActive = paymentFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setPaymentFilter(tab.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 border cursor-pointer ${
                    isActive
                      ? tab.value === "COD_PENDING"
                        ? "bg-amber-500/20 text-amber-500 border-amber-500/40 font-black"
                        : tab.value === "PAID"
                        ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/40 font-black"
                        : tab.value === "PENDING"
                        ? "bg-rose-500/20 text-rose-500 border-rose-500/40 font-black"
                        : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent font-black"
                      : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Order ID, Customer Name, Table, or Rider..."
          className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs box-border"
        />
      </div>
    </div>
  );
}
