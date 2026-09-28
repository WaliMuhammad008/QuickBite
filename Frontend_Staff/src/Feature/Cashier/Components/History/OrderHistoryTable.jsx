import React from "react";
import OrderHistoryRow from "./OrderHistoryRow";

export default function OrderHistoryTable({
  filteredOrders = [],
  printHandler,
  viewHandler,
  onUpdateStatus,
  updatingOrderId = null,
}) {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <th className="py-3.5 px-4 w-24">ORDER ID</th>
              <th className="py-3.5 px-4">CUSTOMER</th>
              <th className="py-3.5 px-4">TYPE & RIDER</th>
              <th className="py-3.5 px-4">AMOUNT</th>
              <th className="py-3.5 px-4">PAYMENT STATUS</th>
              <th className="py-3.5 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs sm:text-sm">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-12 text-center text-zinc-400 dark:text-zinc-500 font-medium"
                >
                  No orders found matching your filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <OrderHistoryRow
                  key={order.id}
                  order={order}
                  printHandler={printHandler}
                  viewHandler={viewHandler}
                  onUpdateStatus={onUpdateStatus}
                  isUpdating={updatingOrderId === order.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
