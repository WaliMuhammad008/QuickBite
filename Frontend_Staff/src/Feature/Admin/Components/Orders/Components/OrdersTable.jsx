import React from "react";
import { FaEye, FaEdit } from "react-icons/fa";

const getStatusBadge = (status) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    case "cooking":
    case "preparing":
      return "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30";
    case "ready":
      return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30";
    case "dispatched":
      return "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30";
    case "delivered":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30";
    case "cancelled":
    case "declined":
      return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-neutral-500/15 dark:text-neutral-400 dark:border-neutral-500/30";
  }
};

const OrdersTable = ({ orders, onEditClick, onViewClick }) => {
  return (
    <div className="admin-card-surface rounded-2xl p-3 sm:p-4 shadow-sm">
      <div className="table-responsive-container">
        <table className="min-w-[760px] lg:min-w-full w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="p-3 sm:p-3.5 text-slate-800 dark:text-neutral-200 text-[11px] uppercase font-bold tracking-wider">
                Order ID
              </th>
              <th className="p-3 sm:p-3.5 text-slate-800 dark:text-neutral-200 text-[11px] uppercase font-bold tracking-wider">
                Customer
              </th>
              <th className="p-3 sm:p-3.5 text-slate-800 dark:text-neutral-200 text-[11px] uppercase font-bold tracking-wider">
                Items Summary
              </th>
              <th className="p-3 sm:p-3.5 text-slate-800 dark:text-neutral-200 text-[11px] uppercase font-bold tracking-wider">
                Total
              </th>
              <th className="p-3 sm:p-3.5 text-slate-800 dark:text-neutral-200 text-[11px] uppercase font-bold tracking-wider">
                Status
              </th>
              <th className="p-3 sm:p-3.5 text-slate-800 dark:text-neutral-200 text-[11px] uppercase font-bold tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <td className="p-3 sm:p-3.5 text-xs font-black text-amber-600 dark:text-amber-400 align-middle font-mono">
                  {order.id}
                </td>
                <td className="p-3 sm:p-3.5 text-xs text-slate-900 dark:text-white align-middle">
                  <span className="font-extrabold block truncate max-w-[140px]">
                    {order.customerName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold">
                    {order.type}
                  </span>
                </td>
                <td className="p-3 sm:p-3.5 text-xs text-slate-600 dark:text-neutral-400 align-middle max-w-[240px]">
                  <span className="line-clamp-2">
                    {order.items && order.items.length > 0
                      ? order.items
                          .map((i) => `${i.qty}x ${i.name}`)
                          .join(", ")
                      : "No items listed"}
                  </span>
                </td>
                <td className="p-3 sm:p-3.5 text-xs font-black text-slate-900 dark:text-white align-middle font-mono">
                  Rs. {order.total}
                </td>
                <td className="p-3 sm:p-3.5 align-middle">
                  <span
                    className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider inline-block ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3 sm:p-3.5 align-middle text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-400/90 dark:hover:bg-amber-500 text-amber-700 dark:text-amber-400 hover:text-neutral-950 dark:hover:text-neutral-950 border border-amber-200 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                      onClick={() => onEditClick(order)}
                    >
                      <FaEdit className="text-[10px]" />
                      <span>Status</span>
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-amber-400/90 dark:hover:bg-amber-500 hover:text-neutral-950 text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-sm"
                      onClick={() => onViewClick(order)}
                      title="View Details"
                    >
                      <FaEye className="text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="py-12 text-center text-xs text-slate-500 dark:text-neutral-400 font-semibold"
              >
                No orders found matching the filter criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default OrdersTable;
