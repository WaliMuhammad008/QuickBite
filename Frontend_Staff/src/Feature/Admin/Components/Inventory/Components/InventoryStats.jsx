import React from "react";
import { FaCube, FaExclamationTriangle, FaCoins } from "react-icons/fa";

const InventoryStats = ({ totalItems, lowStock, totalValue }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Total Items */}
      <div className="bg-[var(--panel-bg)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group hover:border-blue-500/30 transition-all">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
            <FaCube />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono m-0">
              {totalItems}
            </h3>
            <p className="text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider m-0 mt-0.5">
              Total Raw Ingredients
            </p>
          </div>
        </div>
        <div className="text-4xl text-blue-500/5 -rotate-12 select-none pointer-events-none">
          <FaCube />
        </div>
      </div>

      {/* Card 2: Low Stock */}
      <div className="bg-[var(--panel-bg)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group hover:border-amber-500/30 transition-all">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <FaExclamationTriangle />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-500 font-mono m-0">
              {lowStock}
            </h3>
            <p className="text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider m-0 mt-0.5">
              Low Stock Warnings
            </p>
          </div>
        </div>
        <div className="text-4xl text-amber-500/5 -rotate-12 select-none pointer-events-none">
          <FaExclamationTriangle />
        </div>
      </div>

      {/* Card 3: Total Value */}
      <div className="bg-[var(--panel-bg)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group hover:border-emerald-500/30 transition-all sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
            <FaCoins />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-500 font-mono m-0">
              Rs. {parseFloat(totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider m-0 mt-0.5">
              Total Stock Valuation
            </p>
          </div>
        </div>
        <div className="text-4xl text-emerald-500/5 -rotate-12 select-none pointer-events-none">
          <FaCoins />
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;
