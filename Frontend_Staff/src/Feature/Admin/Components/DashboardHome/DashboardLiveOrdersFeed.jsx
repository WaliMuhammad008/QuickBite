import React from "react";
import { FaEye } from "react-icons/fa";

const getStatusBadge = (status) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "completed":
    case "delivered":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "pending":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    case "cooking":
    case "preparing":
      return "bg-orange-500/15 text-orange-400 border border-orange-500/30";
    case "ready":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    case "cancelled":
    case "declined":
      return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
    default:
      return "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30";
  }
};

export default function DashboardLiveOrdersFeed({
  recentOrders = [],
  onViewOrder,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
        <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] font-['Oswald',sans-serif] uppercase tracking-wide m-0">
          Recent Live Orders (Last 10)
        </h3>
      </div>

      <div className="bg-[var(--panel-bg)] border border-[var(--border-subtle)] rounded-2xl p-3 sm:p-4 overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--table-header-bg)]">
              <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                Order ID 
              </th>
              
              <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                Customer
              </th>
              <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                Items Summary
              </th>
              <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                Total
              </th>
              <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider">
                Status
              </th>
              <th className="p-3 text-[var(--text-primary)] text-[11px] uppercase font-bold tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[var(--table-row-hover)] transition-colors"
                >
                  <td className="p-3 text-xs font-black text-amber-500 align-middle font-mono">
                    {order.id}
                  </td>
                  <td className="p-3 text-xs text-[var(--text-primary)] align-middle">
                    <span className="font-extrabold block truncate max-w-[130px]">
                      {order.customerName}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">
                      {order.type}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-[var(--text-secondary)] align-middle max-w-[200px]">
                    <span className="line-clamp-1">
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                    </span>
                  </td>
                  <td className="p-3 text-xs font-black text-[var(--text-primary)] align-middle font-mono">
                    Rs. {order.total.toLocaleString()}
                  </td>
                  <td className="p-3 align-middle">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 align-middle text-right">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-[var(--input-bg)] hover:bg-amber-500 hover:text-neutral-950 text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      onClick={() => onViewOrder(order)}
                    >
                      <FaEye className="text-[11px]" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider"
                >
                  No recent orders found today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
