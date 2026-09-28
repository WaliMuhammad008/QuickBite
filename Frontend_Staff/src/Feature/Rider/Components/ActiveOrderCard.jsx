import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaMoneyBillWave,
  FaWhatsapp,
  FaCheckCircle,
  FaTimes,
  FaBan,
  FaRoute,
  FaShareAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { apiFetch } from "../../../utils/apiHelper";
import { formatWhatsAppPhone, getTrackingUrl } from "../../../utils/urlHelper";

export default function ActiveOrderCard({
  order,
  onComplete,
  onCancel,
  isCompleting,
  stopNumber = 1,
  totalStops = 1,
}) {
  const [isFailing, setIsFailing] = useState(false);
  if (!order) return null;
  const isCod = order.paymentType === "Cash on Delivery" || order.paymentType === "COD";

  const formattedWhatsAppPhone = formatWhatsAppPhone(order.phone);

  let staffUser = null;
  try {
    staffUser = JSON.parse(
      sessionStorage.getItem("staff_user") ||
      sessionStorage.getItem("staff_session") ||
      sessionStorage.getItem("user") ||
      "{}"
    );
  } catch {}
  const riderName = staffUser?.name || "Rider";
  const riderPhone = staffUser?.phone || "";
  const waMessage = `Hi! Your BigBite order #${order.id} is accepted by our rider *${riderName}* (${riderPhone}). On the way to deliver!`;
  const waHref = formattedWhatsAppPhone
    ? `https://api.whatsapp.com/send?phone=${formattedWhatsAppPhone}&text=${encodeURIComponent(waMessage)}`
    : "#";

  // Tracking link WhatsApp share
  const trackingUrl = getTrackingUrl(order.id, order.phone);
  const shareTrackingMsg = `📍 Track your BigBite order #${order.id} live here:\n${trackingUrl}`;
  const shareTrackingHref = formattedWhatsAppPhone
    ? `https://api.whatsapp.com/send?phone=${formattedWhatsAppPhone}&text=${encodeURIComponent(shareTrackingMsg)}`
    : "#";

  const navUrl =
    order.targetLat && order.targetLng
      ? `https://www.google.com/maps/dir/?api=1&destination=${order.targetLat},${order.targetLng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          order.address || ""
        )}`;

  const handleDeliveryFailed = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Report Delivery Failed",
      html: `
        <div style="text-align: left; font-size: 13px;">
          <p style="margin-bottom: 8px; color: #a1a1aa;">Select the failure reason. Ingredients & package cost will be logged to the restaurant loss audit.</p>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; color: #fff;">Failure Reason:</label>
          <select id="swal-fail-reason" style="width: 100%; padding: 8px 12px; background: #27272a; color: #fff; border: 1px solid #3f3f46; border-radius: 8px; margin-bottom: 12px;">
            <option value="Customer unreachable / phone powered off">Customer unreachable / phone powered off</option>
            <option value="Customer refused delivery at doorstep">Customer refused delivery at doorstep</option>
            <option value="Spilled or damaged in transit">Spilled or damaged in transit</option>
            <option value="Incorrect address / out of delivery area">Incorrect address / out of delivery area</option>
          </select>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; color: #fff;">Notes (Optional):</label>
          <input id="swal-fail-notes" placeholder="e.g. Called 3 times at gate, no answer" style="width: 100%; padding: 8px 12px; background: #27272a; color: #fff; border: 1px solid #3f3f46; border-radius: 8px; box-sizing: border-box;" />
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Confirm Delivery Failure",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      background: "#18181b",
      color: "#fff",
      preConfirm: () => {
        return {
          reason: document.getElementById("swal-fail-reason").value,
          notes: document.getElementById("swal-fail-notes").value,
        };
      },
    });

    if (formValues) {
      setIsFailing(true);
      try {
        const user = JSON.parse(
          sessionStorage.getItem("staff_user") ||
            sessionStorage.getItem("staff_session") ||
            sessionStorage.getItem("user") ||
            "{}"
        );
        const riderName = user.name || user.username || "Delivery Rider";

        const res = await apiFetch("log_wastage.php", {
          method: "POST",
          body: JSON.stringify({
            action: "report_delivery_failure",
            order_id: order.id,
            reason: formValues.reason,
            notes: formValues.notes,
            reported_by: riderName,
          }),
        });
        const data = await res.json();

        if (data.success) {
          Swal.fire({
            icon: "warning",
            title: "Delivery Failed",
            text: `Order #${order.id} marked failed. Loss of Rs ${parseFloat(data.total_cost_lost || 0).toFixed(2)} logged for Admin review.`,
            background: "#18181b",
            color: "#fff",
            timer: 2500,
            showConfirmButton: false,
          });
          if (onCancel) onCancel(order.id);
        } else {
          Swal.fire("Error", data.message || "Failed to log delivery failure", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Server connection failed", "error");
      } finally {
        setIsFailing(false);
      }
    }
  };

  const isNearest = stopNumber === 1 && totalStops > 1;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden mb-4 shadow-xs transition-colors relative">
      {/* Top Accent Stripe */}
      <div className={`h-1.5 w-full ${isNearest ? "bg-emerald-500" : "bg-amber-500"}`} />

      {/* Header Info */}
      <div className="p-4 sm:p-5 pb-3 flex justify-between items-center border-b border-stone-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          {totalStops > 1 && (
            <span
              className={`text-[11px] font-black font-['Oswald',sans-serif] px-2 py-0.5 rounded-md uppercase tracking-wider ${
                isNearest
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                  : "bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-neutral-400 border border-stone-300 dark:border-neutral-700"
              }`}
            >
              Stop #{stopNumber} {isNearest ? "• Nearest" : ""}
            </span>
          )}
          <span className="text-lg sm:text-xl font-black font-['Oswald',sans-serif] text-stone-900 dark:text-white">
            Order #{order.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {order.distanceKm && (
            <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
              {order.distanceKm}
            </span>
          )}
          <span className="text-xs font-mono font-bold text-stone-500 dark:text-neutral-400">
            {order.time || "Just now"}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Customer & Call / WhatsApp Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-base font-bold text-stone-900 dark:text-neutral-100 m-0 truncate">
              {order.customer || "Valued Customer"}
            </h4>
            <div className="text-xs font-mono text-stone-500 dark:text-neutral-400 mt-0.5">
              {order.phone || "No phone provided"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${order.phone || ""}`}
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all no-underline active:scale-95"
            >
              <FaPhoneAlt className="text-xs" />
              <span>Call</span>
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all no-underline shadow-xs active:scale-95"
            >
              <FaWhatsapp className="text-sm" />
              <span>WhatsApp</span>
            </a>
            <a
              href={shareTrackingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all no-underline active:scale-95"
              title="Share live tracking link via WhatsApp"
            >
              <FaShareAlt className="text-xs" />
              <span>Track Link</span>
            </a>
          </div>
        </div>

        {/* Delivery Address & Navigate */}
        <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3 rounded-xl text-xs text-stone-800 dark:text-neutral-200 leading-relaxed flex items-center justify-between gap-2.5">
          <div className="flex items-start gap-2 min-w-0">
            <FaMapMarkerAlt className="text-red-500 shrink-0 text-sm mt-0.5" />
            <span className="font-medium truncate">{order.address || "Customer Address"}</span>
          </div>
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 min-h-[36px] px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all no-underline active:scale-95"
          >
            <FaRoute className="text-xs" />
            <span>Directions</span>
          </a>
        </div>

        {/* Order Items */}
        <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3 rounded-xl text-xs text-stone-800 dark:text-neutral-200">
          <div className="text-[10px] font-bold text-stone-500 dark:text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <FaShoppingBag className="text-[10px]" />
            <span>ORDER ITEMS</span>
          </div>
          <span className="font-semibold">{order.items || "1x Food Item"}</span>
        </div>

        {/* Payment Amount to Collect */}
        <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3.5 rounded-xl flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold text-stone-500 dark:text-neutral-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <FaMoneyBillWave className="text-[10px]" />
              <span>TO COLLECT</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-['Oswald',sans-serif] text-stone-900 dark:text-white">
              {isCod ? (order.total || "Rs 0") : "PAID"}
            </div>
          </div>

          <div
            className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase ${
              isCod
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {order.paymentType || "COD"}
          </div>
        </div>

        {/* Actions: Cancel (Return to Dispatcher) & Mark as Delivered */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            disabled={isFailing || isCompleting}
            onClick={async () => {
              const res = await Swal.fire({
                title: `Cancel Order #${order.id}?`,
                text: "This order will be removed from your batch and returned to the Dispatcher queue for reassignment.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Return to Dispatcher",
                cancelButtonText: "Keep Order",
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#71717a",
                background: "#18181b",
                color: "#ffffff",
              });
              if (res.isConfirmed && onCancel) {
                onCancel(order.id);
              }
            }}
            className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <FaBan className="text-xs" />
            <span>Cancel Order</span>
          </button>
          <button
            type="button"
            disabled={isCompleting || isFailing}
            onClick={async () => {
              if (isCod) {
                const res = await Swal.fire({
                  title: "Collect Cash on Delivery",
                  html: `
                    <div style="text-align: center; font-size: 13px;">
                      <p style="color: #a1a1aa; margin-bottom: 10px;">Please verify you have received payment from the customer:</p>
                      <div style="font-size: 26px; font-weight: 900; color: #10b981; font-family: 'Oswald', sans-serif; margin-bottom: 8px;">
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
                  color: "#fff",
                });
                if (!res.isConfirmed) return;
              }
              if (onComplete) onComplete(order.id);
            }}
            className="flex-[2] min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaCheckCircle className="text-xs" />
            <span>{isCompleting ? "Completing..." : "Mark as Delivered"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}