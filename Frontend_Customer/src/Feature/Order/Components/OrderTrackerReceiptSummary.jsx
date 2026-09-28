import React from "react";
import { FaReceipt, FaCheckCircle, FaClock } from "react-icons/fa";

export default function OrderTrackerReceiptSummary({ order, isDineIn: propIsDineIn }) {
  if (!order) return null;

  const rawItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : Array.isArray(order.cart) && order.cart.length > 0
    ? order.cart
    : typeof order.cart === "string"
    ? JSON.parse(order.cart || "[]")
    : [];

  const getItemDetails = (item) => {
    let rawAddons =
      item.selected_addons ||
      item.selectedAddons ||
      item.addons ||
      item.selected_addons_json ||
      [];
    if (typeof rawAddons === "string") {
      try {
        rawAddons = JSON.parse(rawAddons);
      } catch {
        rawAddons = [];
      }
    }
    const addons = Array.isArray(rawAddons) ? rawAddons : [];
    const qty = parseInt(item.qty || item.quantity || 1, 10);

    const addonsUnitTotal = addons.reduce(
      (sum, a) => sum + parseFloat(a.price || a.addon_price || 0),
      0
    );

    let baseUnitPrice = 0;
    if (item.base_price !== undefined && item.base_price !== null && parseFloat(item.base_price) > 0) {
      baseUnitPrice = parseFloat(item.base_price);
    } else if (parseFloat(item.price || 0) > addonsUnitTotal) {
      baseUnitPrice = parseFloat(item.price || 0) - addonsUnitTotal;
    } else {
      baseUnitPrice = parseFloat(item.price || 0);
    }

    const baseLineTotal = baseUnitPrice * qty;
    const addonsLineTotal = addonsUnitTotal * qty;
    const itemTotalWithAddons = baseLineTotal + addonsLineTotal;

    const spiceLevel = item.spice_level && item.spice_level !== "Medium Spicy" ? item.spice_level : null;
    const note = item.note ? item.note.trim() : null;

    let rawExcluded = item.excluded_ingredients || item.excluded || [];
    if (typeof rawExcluded === "string") {
      try {
        rawExcluded = JSON.parse(rawExcluded);
      } catch {
        rawExcluded = [];
      }
    }
    const excluded = Array.isArray(rawExcluded) ? rawExcluded : [];

    return {
      qty,
      addons,
      baseUnitPrice,
      baseLineTotal,
      addonsUnitTotal,
      addonsLineTotal,
      itemTotalWithAddons,
      spiceLevel,
      note,
      excluded,
    };
  };

  const calculatedSubtotal = rawItems.reduce((s, i) => {
    const d = getItemDetails(i);
    return s + d.itemTotalWithAddons;
  }, 0);

  const subtotal =
    calculatedSubtotal > 0
      ? calculatedSubtotal
      : parseFloat(order.subtotal || order.total || order.total_amount || 0);

  const discount = parseFloat(order.discount_amount || 0);
  const couponCode = order.coupon_code || "";
  const deliveryFee = parseFloat(order.delivery_fee || order.deliveryFee || 0);
  const riderTip = parseFloat(order.rider_tip || 0);
  const taxAmount = parseFloat(order.tax_amount || order.tax || 0);

  const computedGrand = Math.max(0, subtotal - discount) + deliveryFee + riderTip + taxAmount;
  const grandTotal = computedGrand > 0 ? computedGrand : parseFloat(order.total || order.total_amount || 0);

  const rawType = (
    order.order_mode ||
    order.order_type ||
    order.type ||
    "DINE-IN"
  ).toUpperCase();

  const tableNum = order.table_number || order.table_no || order.table || "";
  const isDineIn =
    typeof propIsDineIn === "boolean"
      ? propIsDineIn
      : (rawType.includes("DINE") || (!rawType.includes("TAKEAWAY") && !rawType.includes("DELIVERY")));

  const typeDisplay =
    isDineIn && tableNum && !tableNum.toLowerCase().includes("takeaway") && !tableNum.toLowerCase().includes("delivery")
      ? `DINE-IN (Table #${tableNum})`
      : rawType;

  const paymentStatus = order.payment_status || "Pending";
  const isPaid = paymentStatus.toLowerCase() === "paid" || paymentStatus.toLowerCase() === "completed";

  return (
    <div className={`${isDineIn ? "md:col-span-12 max-w-3xl mx-auto w-full" : "md:col-span-7"} bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">
            <FaReceipt />
          </div>
          <div>
            <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 ">
               Receipt
            </h3>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              #{order.id} • {typeDisplay}
            </span>
          </div>
        </div>

        {/* Payment badge */}
        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase ${
              isPaid
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            {isPaid ? <FaCheckCircle className="text-[10px]" /> : <FaClock className="text-[10px]" />}
            <span>{(order.payment_method || "Cash").toUpperCase()} ({paymentStatus})</span>
          </span>
        </div>
      </div>

      {/* Dine-In Service Table Banner */}
      {isDineIn && (
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-900 dark:text-purple-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block">
                Dine-In Table
              </span>
              <span className="text-[11px] text-purple-700 dark:text-purple-300">
                {tableNum ? `Your hot meal will be served directly at ${tableNum}.` : "Your meal will be served hot at your table."}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
            Table Served
          </span>
        </div>
      )}

      {/* Items list with base price and separate addons */}
      <div className="space-y-2.5">
        {rawItems.map((item, idx) => {
          const d = getItemDetails(item);

          return (
            <div
              key={item.id || idx}
              className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 flex flex-col gap-1 text-xs"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm font-['Oswald',sans-serif] block truncate">
                    {d.qty}x {item.name || item.title || "Item"}
                  </span>
                  {item.size && item.size !== "Regular" && (
                    <span className="block text-neutral-500 dark:text-neutral-400 text-[11px]">
                      Size: {item.size}
                    </span>
                  )}
                </div>

                <span className="font-bold font-mono text-neutral-900 dark:text-white text-xs sm:text-sm shrink-0">
                  Rs. {d.baseLineTotal.toFixed(0)}
                </span>
              </div>

              {/* Addons listed with their own separate price */}
              {d.addons.length > 0 && (
                <div className="space-y-0.5 mt-1 pl-3 border-l-2 border-amber-500/30">
                  {d.addons.map((addon, aIdx) => {
                    const aPrice = parseFloat(addon.price || addon.addon_price || 0);
                    const aTotal = aPrice * d.qty;
                    return (
                      <div
                        key={aIdx}
                        className="flex justify-between items-center text-[11px] text-neutral-600 dark:text-neutral-400 font-mono"
                      >
                        <span>+ {addon.name || addon.title || addon.addon_name}</span>
                        <span>Rs. {aTotal.toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Customizations (Spice level, Notes, Excluded Ingredients) */}
              {(d.spiceLevel || d.note || (d.excluded && d.excluded.length > 0)) && (
                <div className="space-y-0.5 mt-1 pl-3 text-[10px] font-mono">
                  {d.spiceLevel && (
                    <span className="block text-rose-500 dark:text-rose-400 font-medium">
                      • Spice: {d.spiceLevel}
                    </span>
                  )}
                  {d.note && (
                    <span className="block text-amber-600 dark:text-amber-400 italic">
                      • Note: "{d.note}"
                    </span>
                  )}
                  {d.excluded && d.excluded.length > 0 && (
                    <span className="block text-rose-500 dark:text-rose-400">
                      • Removed: {d.excluded.length} ingredient(s)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Breakdown and Grand Total */}
      <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 space-y-1.5 font-mono text-xs">
        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Subtotal:</span>
          <span className="font-bold text-neutral-900 dark:text-white">
            Rs. {subtotal.toFixed(0)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>Discount ({couponCode || "Promo"}):</span>
            <span>-Rs. {discount.toFixed(0)}</span>
          </div>
        )}

        {deliveryFee > 0 && (
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Delivery Fee:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              Rs. {deliveryFee.toFixed(0)}
            </span>
          </div>
        )}

        {riderTip > 0 && (
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Rider Tip:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              Rs. {riderTip.toFixed(0)}
            </span>
          </div>
        )}

        {taxAmount > 0 && (
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Tax / GST:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              Rs. {taxAmount.toFixed(0)}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200 dark:border-neutral-700 flex justify-between items-baseline">
          <span className="font-['Oswald',sans-serif] font-bold text-sm sm:text-base uppercase text-neutral-900 dark:text-white">
            Grand Total
          </span>
          <span className="text-xl sm:text-2xl font-black font-['Oswald',sans-serif] text-amber-500 dark:text-amber-400">
            Rs. {grandTotal.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}

