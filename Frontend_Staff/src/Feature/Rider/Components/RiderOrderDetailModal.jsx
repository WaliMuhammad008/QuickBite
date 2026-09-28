import React from "react";
import {
  FaTimes,
  FaPhoneAlt,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaRoute,
  FaShoppingBag,
  FaMoneyBillWave,
  FaCheckCircle,
  FaBan,
  FaExclamationCircle,
  FaShareAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { formatWhatsAppPhone, getTrackingUrl } from "../../../utils/urlHelper";

export default function RiderOrderDetailModal({
  order,
  isOpen,
  onClose,
  stopNumber = 1,
  totalStops = 1,
  onNavigate,
  onComplete,
  onCancel,
  isCompleting = false,
}) {
  if (!isOpen || !order) return null;

  const isCod =
    order.paymentType === "Cash on Delivery" ||
    order.paymentType === "COD" ||
    order.payment_method === "Cash on Delivery" ||
    order.payment_method === "COD";

  const formattedWhatsAppPhone = formatWhatsAppPhone(order.phone);

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
  const waMessage = `Hi! Your BigBite order #${order.id} is with our rider *${riderName}* (${riderPhone}). On the way to deliver!`;
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

  const cartItems = Array.isArray(order.cart)
    ? order.cart
    : Array.isArray(order.items)
    ? order.items
    : [];

  const handleCancelPrompt = async () => {
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

    if (result.isConfirmed) {
      if (onCancel) {
        onCancel(order.id);
      }
      onClose();
    }
  };

  const handleDeliverPrompt = async () => {
    if (isCod) {
      const res = await Swal.fire({
        title: "Collect Payment",
        html: `
          <div style="text-align: center; font-size: 13px;">
            <p style="color: #a1a1aa; margin-bottom: 10px;">Please confirm cash collected from customer:</p>
            <div style="font-size: 28px; font-weight: 900; color: #10b981; font-family: 'Oswald', sans-serif; margin-bottom: 8px;">
              ${order.total || "Rs 0"}
            </div>
            <p style="color: #71717a; font-size: 11px; margin: 0;">Order #${order.id} &bull; ${order.customer || ""}</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Payment Received",
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
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-xs flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border-t sm:border border-stone-200 dark:border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col text-stone-900 dark:text-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between bg-stone-50 dark:bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2">
            {totalStops > 1 && (
              <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-black font-['Oswald',sans-serif] px-2 py-0.5 rounded-md uppercase tracking-wider">
                Stop #{stopNumber}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-black font-['Oswald',sans-serif] m-0">
              Order #{order.id}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {order.status || "Out for Delivery"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition-colors border-none cursor-pointer"
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
          {/* Customer Card */}
          <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3.5 rounded-2xl">
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-neutral-400 mb-1 font-['Oswald',sans-serif]">
              Customer Contact
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base font-bold text-stone-900 dark:text-white truncate">
                  {order.customer || "Valued Customer"}
                </div>
                <div className="text-xs font-mono text-stone-500 dark:text-neutral-400">
                  {order.phone || "No phone"}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${order.phone || ""}`}
                  className="w-10 h-10 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center transition-all no-underline text-sm active:scale-95"
                  title="Call Customer"
                >
                  <FaPhoneAlt />
                </a>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all no-underline text-base shadow-xs active:scale-95"
                  title="WhatsApp Customer"
                >
                  <FaWhatsapp />
                </a>
                <a
                  href={shareTrackingHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center transition-all no-underline text-sm active:scale-95"
                  title="Share Tracking Link via WhatsApp"
                >
                  <FaShareAlt />
                </a>
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-neutral-400 mb-1 font-['Oswald',sans-serif]">
              <span>Delivery Dropoff</span>
              {order.distanceKm && (
                <span className="text-sky-600 dark:text-sky-400 font-mono">
                  {order.distanceKm}
                </span>
              )}
            </div>
            <div className="flex items-start gap-2.5 text-xs text-stone-800 dark:text-neutral-200 leading-relaxed mb-3">
              <FaMapMarkerAlt className="text-rose-500 shrink-0 text-sm mt-0.5" />
              <span>{order.address || "Address not specified"}</span>
            </div>

            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[38px] rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all no-underline active:scale-95"
            >
              <FaRoute className="text-xs" />
              <span>Open in Google Maps Directions</span>
            </a>
          </div>

          {/* Order Food Items Breakdown */}
          <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-neutral-400 mb-2 font-['Oswald',sans-serif]">
              <span className="flex items-center gap-1">
                <FaShoppingBag className="text-xs" />
                <span>Food Items ({cartItems.length || 1})</span>
              </span>
              <span>Price</span>
            </div>

            {cartItems.length > 0 ? (
              <div className="divide-y divide-stone-200 dark:divide-neutral-800/80">
                {cartItems.map((item, idx) => {
                  let addons = [];
                  try {
                    if (item.selected_addons_json) {
                      addons = typeof item.selected_addons_json === "string"
                        ? JSON.parse(item.selected_addons_json)
                        : item.selected_addons_json;
                    }
                  } catch {}

                  return (
                    <div key={item.id || idx} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-stone-900 dark:text-white">
                            {item.qty || 1}x {item.title || item.name || "Item"}
                          </span>
                          {item.size && item.size !== "Regular" && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold uppercase">
                              {item.size}
                            </span>
                          )}
                          {item.note && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                              Note: {item.note}
                            </div>
                          )}
                          {Array.isArray(addons) && addons.length > 0 && (
                            <div className="text-[10px] text-stone-500 dark:text-neutral-400 mt-0.5 pl-2 border-l-2 border-amber-500/40">
                              + {addons.map((a) => a.name || a.title).join(", ")}
                            </div>
                          )}
                        </div>
                        <span className="font-mono font-bold text-stone-800 dark:text-neutral-200 shrink-0">
                          Rs {parseFloat(item.price || 0) * (parseInt(item.qty, 10) || 1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-stone-600 dark:text-neutral-400 py-1">
                {order.itemsSummary || order.items || "Order Items Details"}
              </div>
            )}
          </div>

          {/* Notes if any */}
          {order.notes && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <FaExclamationCircle className="text-amber-500 shrink-0 text-sm mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5 uppercase tracking-wider text-[10px]">
                  Special Instructions:
                </strong>
                <span>{order.notes}</span>
              </div>
            </div>
          )}

          {/* Payment & Total Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-['Oswald',sans-serif] flex items-center gap-1">
                <FaMoneyBillWave className="text-xs" />
                <span>Payment Status</span>
              </div>
              <div className="text-xs font-bold text-stone-700 dark:text-neutral-300 mt-0.5">
                {order.paymentType || "Cash on Delivery"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-neutral-400 font-['Oswald',sans-serif]">
                {isCod ? "To Collect" : "Total Paid"}
              </div>
              <div className="text-xl font-black font-['Oswald',sans-serif] text-emerald-600 dark:text-emerald-400">
                {order.total}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-950/80 space-y-2 shrink-0">
          <div className="flex gap-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  onNavigate(order.id);
                  onClose();
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-stone-200 dark:bg-neutral-800 hover:bg-stone-300 dark:hover:bg-neutral-700 text-stone-800 dark:text-neutral-200 text-xs font-black uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer border-none flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <FaRoute />
                <span>Navigate Map</span>
              </button>
            )}

            <button
              type="button"
              disabled={isCompleting}
              onClick={handleDeliverPrompt}
              className="flex-[2] min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer border-none flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <FaCheckCircle />
              <span>{isCompleting ? "Completing..." : "Mark Delivered"}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCancelPrompt}
            className="w-full min-h-[38px] rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <FaBan className="text-xs" />
            <span>Cancel This Order (Send back to Dispatcher)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
