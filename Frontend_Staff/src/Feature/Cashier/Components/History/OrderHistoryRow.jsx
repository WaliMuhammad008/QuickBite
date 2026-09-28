import React from "react";
import { FaClock, FaEye, FaPrint, FaMotorcycle, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import PaymentStatusDropdown from "./PaymentStatusDropdown";

export default function OrderHistoryRow({
  order,
  printHandler,
  viewHandler,
  onUpdateStatus,
  isUpdating = false,
}) {
  const isDelivery =
    order.order_type?.toLowerCase().includes("delivery") ||
    order.type?.toLowerCase().includes("delivery") ||
    order.order_mode?.toLowerCase().includes("delivery");

  const rawMethod = (order.payment_method || "").toLowerCase();
  const isCod =
    rawMethod === "cod" ||
    rawMethod.includes("delivery") ||
    rawMethod === "cash" ||
    (isDelivery && rawMethod === "");

  const rawStatus = (order.payment_status || "Pending").toLowerCase();
  const isPaid = rawStatus === "paid" || rawStatus === "completed";

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
      {/* Order ID */}
      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-black text-amber-500 text-xs sm:text-sm">
        #{order.id}
      </td>

      {/* Customer Info */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
          {order.customer_name || "Walk-in"}
        </div>
        <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
          <FaClock className="w-2.5 h-2.5" />
          {order.time || order.created_at || "Just now"}
        </div>
      </td>

      {/* Type, Table & Delivery Rider */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold uppercase font-mono">
              {order.order_type || "POS"}{" "}
              {order.table_no ? `• T-${order.table_no}` : ""}
            </span>

            {/* Payment Method Badge */}
            {isCod ? (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                  isPaid
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                }`}
                title="Cash On Delivery"
              >
                <FaMoneyBillWave className="w-2.5 h-2.5" />
                COD
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                title={order.payment_method || "Online / Prepaid"}
              >
                <FaCreditCard className="w-2.5 h-2.5" />
                {order.payment_method?.toUpperCase() || "PREPAID"}
              </span>
            )}
          </div>

          {/* Assigned Rider Indicator for Delivery */}
          {isDelivery && (
            <div>
              {order.rider_name ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold font-mono">
                  <FaMotorcycle className="w-2.5 h-2.5 shrink-0" />
                  <span>Rider: {order.rider_name}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-medium font-mono">
                  <FaMotorcycle className="w-2.5 h-2.5 shrink-0 opacity-50" />
                  <span>Unassigned</span>
                </span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Amount */}
      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-black text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
        Rs. {Number(order.total_amount || order.total || 0).toFixed(2)}
      </td>

      {/* Payment Status Dropdown */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <PaymentStatusDropdown
          order={order}
          onUpdateStatus={onUpdateStatus}
          isUpdating={isUpdating}
        />
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => printHandler && printHandler(order)}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-neutral-950 transition-all shadow-xs border-none cursor-pointer"
            title="Print Receipt"
          >
            <FaPrint className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => viewHandler && viewHandler(order)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all border-none cursor-pointer"
            title="View Details"
          >
            <FaEye className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
