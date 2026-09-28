import React from "react";
import { FaBoxOpen, FaMoneyBillWave, FaChartLine, FaPercent } from "react-icons/fa";

export default function ProfitSummaryMetrics({
  totalQty = 0,
  totalCost = 0,
  totalProfit = 0,
  storeMargin = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-[var(--panel-bg)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block">
            Units Dispatched
          </span>
          <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-sans block">
            {totalQty.toLocaleString()} Items
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-sm font-black shrink-0">
          <FaBoxOpen />
        </div>
      </div>

      <div className="bg-[var(--panel-bg)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block">
            Total Production Cost
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-500 font-sans block">
            Rs. {Math.round(totalCost).toLocaleString()}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-sm font-black shrink-0">
          <FaMoneyBillWave />
        </div>
      </div>

      <div className="bg-[var(--panel-bg)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block">
            Net Gross Profit
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-500 font-sans block">
            Rs. {Math.round(totalProfit).toLocaleString()}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-sm font-black shrink-0">
          <FaChartLine />
        </div>
      </div>

      <div className="bg-[var(--panel-bg)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block">
            Average Margin
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-500 font-mono block">
            {storeMargin}%
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-sm font-black shrink-0">
          <FaPercent />
        </div>
      </div>
    </div>
  );
}
