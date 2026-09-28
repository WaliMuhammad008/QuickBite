import React from "react";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
  FaShoppingBag,
  FaMoneyBillWave,
  FaCheckCircle,
  FaBan,
  FaRoute,
  FaEye,
  FaLayerGroup,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { formatWhatsAppPhone } from "../../../utils/urlHelper";

export default function BatchOrdersView({
  orders = [],
  selectedOrderId,
  onSelectOrder,
  onOpenDetails,
  onComplete,
  onCancel,
  isCompleting = false,
}) {
  if (!orders || orders.length === 0) return null;

  const totalValue = orders.reduce((sum, o) => {
    const val = parseFloat(String(o.total || "0").replace(/[^0-9.]/g, "") || "0");
    return sum + val;
  }, 0);

  const handleCancelOrder = async (e, order) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: `Cancel Order #${order.id}?`,
      text: "This order will be removed from your batch and sent back to the Dispatcher for reassignment.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Return to Dispatcher",
      cancelButtonText: "Keep Order",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      background: "#18181b",
      color: "#ffffff",
    });

    if (result.isConfirmed && onCancel) {
      onCancel(order.id);
    }
  };

  const handleCompleteOrder = async (e, order) => {
    e.stopPropagation();
    const isCod =
      order.paymentType === "Cash on Delivery" ||
      order.paymentType === "COD" ||
      order.payment_method === "Cash on Delivery" ||
      order.payment_method === "COD";

    if (isCod) {
      const res = await Swal.fire({
        title: "Collect Payment",
        html: `
          <div style="text-align: center; font-size: 13px;">
            <p style="color: #a1a1aa; margin-bottom: 8px;">Please verify cash payment received:</p>
            <div style="font-size: 26px; font-weight: 900; color: #10b981; font-family: 'Oswald', sans-serif; margin-bottom: 6px;">
              ${order.total || "Rs 0"}
            </div>
            <p style="color: #71717a; font-size: 11px; margin: 0;">Order #${order.id} &bull; ${order.customer || ""}</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Cash Collected",
        confirmButtonColor: "#10b981",
        cancelButtonText: "Cancel",
        cancelButtonColor: "#71717a",
        background: "#18181b",
        color: "#ffffff",
      });
      if (!res.isConfirmed) return;
    }

    if (onComplete) {
      onComplete(order.id);
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Batch Overview Banner (Theme Compatible) */}
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-3.5 sm:p-4 rounded-2xl shadow-xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
            <FaLayerGroup />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
              {orders.length > 1 ? "Batched Route in Progress" : "Active Delivery"}
            </div>
            <h3 className="text-base font-bold font-['Oswald',sans-serif] text-stone-900 dark:text-white m-0">
              {orders.length} {orders.length > 1 ? "Stops Scheduled" : "Delivery Stop"}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-neutral-400 font-['Oswald',sans-serif]">
            Total Value
          </div>
          <div className="text-base sm:text-lg font-black font-['Oswald',sans-serif] text-emerald-600 dark:text-emerald-400">
            Rs {totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Orders Cards List */}
      <div className="space-y-3">
        {orders.map((ord, idx) => {
          const isSelected = String(ord.id) === String(selectedOrderId);
          const isNearest = idx === 0 && orders.length > 1;
          const isCod =
            ord.paymentType === "Cash on Delivery" ||
            ord.paymentType === "COD" ||
            ord.payment_method === "Cash on Delivery" ||
            ord.payment_method === "COD";

          const formattedWhatsApp = formatWhatsAppPhone(ord.phone);

          let riderUser = null;
          try {
            riderUser = JSON.parse(
              sessionStorage.getItem("staff_user") ||
              sessionStorage.getItem("staff_session") ||
              sessionStorage.getItem("user") ||
              "{}"
            );
          } catch {}
          const riderName = riderUser?.name || "Rider";
          const riderPhone = riderUser?.phone || "";
          const waText = `Hi! Your BigBite order #${ord.id} is accepted by our rider *${riderName}* (${riderPhone}). They are on the way to deliver!`;
          const waUrl = formattedWhatsApp
            ? `https://api.whatsapp.com/send?phone=${formattedWhatsApp}&text=${encodeURIComponent(waText)}`
            : "#";

          return (
            <div
              key={ord.id}
              onClick={() => onOpenDetails && onOpenDetails(ord, idx + 1)}
              className={`bg-white dark:bg-neutral-900 border rounded-2xl p-4 sm:p-5 shadow-xs transition-all cursor-pointer relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-500 ${
                isSelected
                  ? "border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                  : "border-stone-200 dark:border-neutral-800"
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isNearest ? "bg-emerald-500" : isSelected ? "bg-amber-500" : "bg-stone-300 dark:bg-neutral-700"
                }`}
              />

              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {orders.length > 1 && (
                    <span
                      className={`text-[10px] font-black font-['Oswald',sans-serif] px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isNearest
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                          : "bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-neutral-400 border border-stone-300 dark:border-neutral-700"
                      }`}
                    >
                      STOP #{idx + 1} {isNearest ? "• NEAREST" : ""}
                    </span>
                  )}
                  <span className="text-base font-black font-['Oswald',sans-serif] text-stone-900 dark:text-white">
                    Order #{ord.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {ord.status || "Out for Delivery"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {ord.distanceKm && (
                    <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                      {ord.distanceKm}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-stone-400 dark:text-neutral-500">
                    {ord.time || "Just now"}
                  </span>
                </div>
              </div>

              {/* Customer & Quick Contact */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white m-0 truncate">
                    {ord.customer || "Customer"}
                  </h4>
                  <p className="text-[11px] font-mono text-stone-500 dark:text-neutral-400 m-0">
                    {ord.phone || "No phone"}
                  </p>
                </div>

                {/* Call / WhatsApp quick buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${ord.phone || ""}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center text-xs transition-all active:scale-95 no-underline"
                    title="Call"
                  >
                    <FaPhoneAlt />
                  </a>
                  <a
                    href={waUrl}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center text-sm shadow-xs transition-all active:scale-95 no-underline"
                    title="WhatsApp Customer"
                  >
                    <FaWhatsapp />
                  </a>
                </div>
              </div>

              {/* Dropoff Address */}
              <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-2.5 rounded-xl text-xs text-stone-700 dark:text-neutral-300 flex items-start gap-2 mb-2.5">
                <FaMapMarkerAlt className="text-rose-500 shrink-0 text-xs mt-0.5" />
                <span className="truncate">{ord.address || "Address"}</span>
              </div>

              {/* Items & Payment Snapshot */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-2 rounded-xl">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-neutral-500 flex items-center gap-1">
                    <FaShoppingBag className="text-[9px]" />
                    <span>ITEMS</span>
                  </div>
                  <div className="font-bold text-stone-800 dark:text-neutral-200 truncate mt-0.5">
                    {ord.itemsSummary || ord.items || "1 Item"}
                  </div>
                </div>

                <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-2 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-neutral-500 flex items-center gap-1">
                      <FaMoneyBillWave className="text-[9px]" />
                      <span>{isCod ? "COLLECT" : "STATUS"}</span>
                    </div>
                    <div className="font-black font-['Oswald',sans-serif] text-stone-900 dark:text-white text-sm mt-0.5">
                      {isCod ? (ord.total || "Rs 0") : "PAID"}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isCod
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isCod ? "COD" : "Online"}
                  </span>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenDetails) onOpenDetails(ord, idx + 1);
                  }}
                  className="flex-1 min-h-[38px] rounded-xl bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-800 dark:text-neutral-200 text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-stone-300 dark:border-neutral-700 transition-all cursor-pointer active:scale-95"
                >
                  <FaEye className="text-xs" />
                  <span>Details</span>
                </button>

                {onSelectOrder && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrder(ord.id);
                    }}
                    className={`min-h-[38px] px-3 rounded-xl text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-amber-500 text-neutral-950 border-amber-600 shadow-xs"
                        : "bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 border-stone-300 dark:border-neutral-700 hover:border-amber-400"
                    }`}
                    title="Focus on Map"
                  >
                    <FaRoute className="text-xs" />
                    <span>{isSelected ? "Active" : "Route"}</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={(e) => handleCompleteOrder(e, ord)}
                  className="flex-[1.5] min-h-[38px] rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black font-['Oswald',sans-serif] uppercase tracking-wider flex items-center justify-center gap-1.5 border-none shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <FaCheckCircle className="text-xs" />
                  <span>Deliver</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleCancelOrder(e, ord)}
                  className="min-h-[38px] px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="Cancel order and send back to Dispatcher"
                >
                  <FaBan className="text-xs" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
