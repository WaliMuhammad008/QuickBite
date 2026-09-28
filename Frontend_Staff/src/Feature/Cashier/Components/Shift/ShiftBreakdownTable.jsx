import React from "react";

export default function ShiftBreakdownTable({
  liveOrders = [],
  paidOrders = [],
  unpaidOrders = [],
  totalSales = 0,
  cashSales = 0,
}) {
  const unpaidTotal = unpaidOrders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs mb-6">
      <h3 className="m-0 font-['Oswald',sans-serif] text-base sm:text-lg font-bold uppercase tracking-wide text-zinc-900 dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
        Payment Reconciliation Breakdown
      </h3>

      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-600 dark:text-zinc-400 font-medium">
            Gross Orders Processed:
          </span>
          <span className="font-mono font-bold text-zinc-900 dark:text-white">
            {liveOrders.length} Orders
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-600 dark:text-zinc-400 font-medium">
            Settled / Paid Transactions:
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {paidOrders.length} Orders (Rs. {Number(totalSales).toFixed(2)})
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-600 dark:text-zinc-400 font-medium">
            Unpaid / On Hold Transactions:
          </span>
          <span className="font-mono font-bold text-rose-500">
            {unpaidOrders.length} Orders (Rs. {unpaidTotal.toFixed(2)})
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-600 dark:text-zinc-400 font-medium">
            Drawer Cash Expected:
          </span>
          <span className="font-mono font-bold text-zinc-900 dark:text-white">
            Rs. {Number(cashSales).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-t-2 border-dashed border-zinc-200 dark:border-zinc-700 text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white font-['Oswald',sans-serif]">
          <span>TOTAL SALES REVENUE:</span>
          <span className="text-amber-500 font-mono">
            Rs. {Number(totalSales).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
