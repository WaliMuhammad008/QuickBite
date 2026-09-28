import React from "react";

export default function PayrollSummaryCards({
  totalDays = 30,
  offDays = 4,
  workingDays = 26,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="admin-card-surface p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-between shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider">
          Total Calendar Days
        </span>
        <span className="font-bold text-2xl tracking-tight font-mono">
          {totalDays} Days
        </span>
      </div>
      <div className="admin-card-surface p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-between shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider">
          Monthly Off Days
        </span>
        <span className="font-bold text-2xl tracking-tight font-mono">
          {offDays} Days
        </span>
      </div>
      <div className="admin-card-surface p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider">
          Calculated Working Days
        </span>
        <span className="font-bold text-2xl tracking-tight font-mono">
          {workingDays} Days
        </span>
      </div>
    </div>
  );
}
