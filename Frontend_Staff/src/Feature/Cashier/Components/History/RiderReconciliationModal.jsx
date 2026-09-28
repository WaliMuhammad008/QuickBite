import React, { useState } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";
import {
  FaMotorcycle,
  FaTimes,
  FaCheckDouble,
  FaMoneyBillWave,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

export default function RiderReconciliationModal({
  isOpen,
  onClose,
  orders = [],
  onUpdateStatus,
  onBatchReconcile,
}) {
  const [expandedRiders, setExpandedRiders] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Filter Delivery orders that are COD, delivered, and NOT yet settled/paid
  const pendingCodOrders = orders.filter((order) => {
    const isDelivery =
      order.order_type?.toLowerCase().includes("delivery") ||
      order.type?.toLowerCase().includes("delivery") ||
      order.order_mode?.toLowerCase().includes("delivery");

    const pMethod = (order.payment_method || "").toLowerCase();
    const isCod =
      pMethod === "cod" ||
      pMethod.includes("cod") ||
      pMethod.includes("delivery") ||
      pMethod.includes("cash") ||
      pMethod === "";

    const pStatus = (order.payment_status || "").toLowerCase();
    const isUnsettled = pStatus !== "paid" && pStatus !== "completed";

    const ordStatus = (order.status || "").toLowerCase();
    const isDelivered = ordStatus === "delivered" || ordStatus === "completed" || ordStatus === "dispatched";

    return isDelivery && isCod && isDelivered && isUnsettled;
  });

  // Group pending orders by Rider
  const riderGroups = {};
  let totalPendingAmount = 0;

  pendingCodOrders.forEach((order) => {
    const riderKey = order.rider_id ? `rider_${order.rider_id}` : "unassigned";
    const riderName = order.rider_name || (order.rider_id ? `Rider #${order.rider_id}` : "Unassigned Deliveries");
    const riderPhone = order.rider_phone || "";

    if (!riderGroups[riderKey]) {
      riderGroups[riderKey] = {
        key: riderKey,
        rider_id: order.rider_id || null,
        rider_name: riderName,
        rider_phone: riderPhone,
        orders: [],
        totalAmount: 0,
      };
    }

    const orderAmount = parseFloat(order.total || order.total_amount || 0);
    riderGroups[riderKey].orders.push(order);
    riderGroups[riderKey].totalAmount += orderAmount;
    totalPendingAmount += orderAmount;
  });

  const ridersList = Object.values(riderGroups);

  const toggleRiderExpand = (key) => {
    setExpandedRiders((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key],
    }));
  };

  const handleReconcileRiderAll = async (riderGroup) => {
    const count = riderGroup.orders.length;
    const amountStr = `Rs. ${riderGroup.totalAmount.toFixed(2)}`;

    const result = await Swal.fire({
      title: "Collect & Settle Cash?",
      html: `
        <div class="text-left text-sm space-y-2">
          <p>Confirm cash handover from <strong>${riderGroup.rider_name}</strong>?</p>
          <div class="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-mono text-xs">
            <div class="flex justify-between"><span>Orders:</span><strong>${count} order(s)</strong></div>
            <div class="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold mt-1"><span>Total Handover:</span><strong>${amountStr}</strong></div>
          </div>
          <p class="text-xs text-zinc-500 mt-2">All ${count} orders will be marked as <strong>Paid</strong> immediately.</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, Settle ${amountStr}`,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#71717a",
      background: document.documentElement.classList.contains("dark") ? "#18181b" : "#ffffff",
      color: document.documentElement.classList.contains("dark") ? "#f4f4f5" : "#18181b",
    });

    if (result.isConfirmed) {
      try {
        setIsProcessing(true);
        const orderIds = riderGroup.orders.map((o) => o.id);
        if (onBatchReconcile) {
          await onBatchReconcile(orderIds, "Paid", riderGroup.rider_name, riderGroup.totalAmount);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSingleOrderPay = async (order, riderName) => {
    if (onUpdateStatus) {
      setIsProcessing(true);
      try {
        await onUpdateStatus(order.id, "Paid", order);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <FaMoneyBillWave className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-zinc-900 dark:text-white uppercase font-mono m-0">
                Rider COD Cash Reconciliation
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Collect and verify cash on delivery collected by dispatch riders
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border-none cursor-pointer"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Shift Summary Metrics */}
        <div className="px-5 py-3.5 bg-zinc-100/60 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-3">
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Pending COD Cash
            </div>
            <div className="text-base sm:text-lg font-black text-amber-500 font-mono mt-0.5">
              Rs. {totalPendingAmount.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Pending Orders
            </div>
            <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
              {pendingCodOrders.length}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Active Riders
            </div>
            <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
              {ridersList.length}
            </div>
          </div>
        </div>

        {/* Body - Rider Groups List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {ridersList.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <FaCheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                All COD Collections Reconciled!
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                There are no pending Cash-on-Delivery collections waiting for handover.
              </p>
            </div>
          ) : (
            ridersList.map((riderGroup) => {
              const isExpanded = expandedRiders[riderGroup.key] !== false; // default open

              return (
                <div
                  key={riderGroup.key}
                  className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all shadow-2xs"
                >
                  {/* Rider Card Top Header */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <FaMotorcycle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {riderGroup.rider_name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono">
                            {riderGroup.orders.length} order{riderGroup.orders.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        {riderGroup.rider_phone && (
                          <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                            <FaPhoneAlt className="w-2.5 h-2.5" />
                            {riderGroup.rider_phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions & Amount */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase font-mono">
                          To Collect
                        </div>
                        <div className="text-sm sm:text-base font-black text-amber-500 font-mono">
                          Rs. {riderGroup.totalAmount.toFixed(2)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReconcileRiderAll(riderGroup)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-neutral-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all border-none cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <FaCheckDouble className="w-3.5 h-3.5" />
                        <span>Collect All</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleRiderExpand(riderGroup.key)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border-none cursor-pointer"
                        title={isExpanded ? "Collapse orders" : "Expand orders"}
                      >
                        {isExpanded ? (
                          <FaChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <FaChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Orders Breakdown Table */}
                  {isExpanded && (
                    <div className="p-3 overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2">
                            <th className="py-2 px-3 w-20">ORDER</th>
                            <th className="py-2 px-3">CUSTOMER & ADDRESS</th>
                            <th className="py-2 px-3 w-24">TIME</th>
                            <th className="py-2 px-3 w-24 text-right">AMOUNT</th>
                            <th className="py-2 px-3 w-24 text-center">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 text-xs">
                          {riderGroup.orders.map((ord) => (
                            <tr
                              key={ord.id}
                              className="hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors"
                            >
                              <td className="py-2.5 px-3 font-mono font-bold text-amber-500">
                                #{ord.id}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                                  {ord.customer_name || "Customer"}
                                </div>
                                {ord.customer_address && (
                                  <div className="text-[11px] text-zinc-400 line-clamp-1 flex items-center gap-1 mt-0.5">
                                    <FaMapMarkerAlt className="w-2.5 h-2.5 shrink-0" />
                                    <span>{ord.customer_address}</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px]">
                                <div className="flex items-center gap-1">
                                  <FaClock className="w-2.5 h-2.5" />
                                  <span>{ord.time || "Recent"}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-100 text-right">
                                Rs. {Number(ord.total_amount || ord.total || 0).toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleSingleOrderPay(ord, riderGroup.rider_name)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-neutral-950 border border-emerald-500/20 hover:border-emerald-500 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  Mark Paid
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-800/30">
          <div className="text-xs text-zinc-400 font-mono">
            {pendingCodOrders.length} pending delivery COD order(s) total
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border-none cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
