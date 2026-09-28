import React from "react";
import { LuArrowRight, LuShieldCheck, LuTag, LuHeart } from "react-icons/lu";
import CheckoutItemsReview from "./CheckoutItemsReview";

export default function OrderSummaryCard({
  cartItems = [],
  subTotal = 0,
  deliveryFee = 0,
  riderTip = 0,
  discountAmount = 0,
  appliedCoupon = null,
  orderType = "delivery",
  total = 0,
  isSubmitting = false,
  handleProceedOrder,
  isOutOfDeliveryRadius = false,
  deliveryDistanceKm = 0,
  maxDeliveryRadiusKm = 10,
}) {
  const isDelivery = orderType === "delivery";

  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-sm backdrop-blur-md space-y-6">
      <CheckoutItemsReview cartItems={cartItems} />

      {/* Breakdown */}
      <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 space-y-2 text-sm">
        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Subtotal</span>
          <span className="font-bold text-neutral-900 dark:text-white">
            Rs {subTotal.toLocaleString()}
          </span>
        </div>

        {/* Applied Coupon Discount Line */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <LuTag className="w-3.5 h-3.5 text-emerald-500" />
              <span>Coupon Discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ""}</span>
            </span>
            <span className="font-bold">
              -Rs {discountAmount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Delivery Fee Line */}
        {isDelivery ? (
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Delivery Fee</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {deliveryFee > 0 ? `Rs ${deliveryFee.toLocaleString()}` : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
              )}
            </span>
          </div>
        ) : (
          <div className="flex justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Fulfillment Type</span>
            <span className="font-bold text-amber-500 uppercase font-['Oswald',sans-serif]">
              {orderType === "dine_in" ? "Dine-In Table Service" : "Self Takeaway"}
            </span>
          </div>
        )}

        {/* Rider Tip Line */}
        {isDelivery && riderTip > 0 && (
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-medium">
            <span>
              Rider Tip
            </span>
            <span className="font-bold text-neutral-900 dark:text-white">
              Rs {riderTip.toLocaleString()}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-baseline">
          <span className="font-['Oswald',sans-serif] font-bold text-base uppercase text-neutral-900 dark:text-white">
            Grand Total
          </span>
          <span className="text-2xl font-black font-['Oswald',sans-serif] text-amber-500">
            Rs {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Out of Delivery Radius Alert */}
      {isOutOfDeliveryRadius && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs flex items-start gap-2.5 animate-fade-in">
          <span className="text-base shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-red-400 m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Outside Delivery Zone ({deliveryDistanceKm.toFixed(1)} km)
            </p>
            <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
              We only deliver within {maxDeliveryRadiusKm} km of our restaurant. Please choose a nearby address or switch your order to <strong>Takeaway</strong> for self-pickup.
            </p>
          </div>
        </div>
      )}

      {/* Place Order CTA Button */}
      <button
        type="button"
        disabled={isSubmitting || isOutOfDeliveryRadius}
        onClick={handleProceedOrder}
        className={`w-full py-4 rounded-2xl font-['Oswald',sans-serif] font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-none ${
          isOutOfDeliveryRadius
            ? "bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 cursor-not-allowed border border-gray-300 dark:border-white/5 opacity-70"
            : "bg-amber-400 hover:bg-amber-500 active:scale-[0.98] disabled:opacity-50 text-neutral-950 shadow-lg shadow-amber-400/25 cursor-pointer"
        }`}
      >
        <span>
          {isSubmitting
            ? "Placing Order..."
            : isOutOfDeliveryRadius
            ? `Address Exceeds ${maxDeliveryRadiusKm} km Radius`
            : `Place Order (Rs ${total.toLocaleString()})`}
        </span>
        {!isOutOfDeliveryRadius && <LuArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

