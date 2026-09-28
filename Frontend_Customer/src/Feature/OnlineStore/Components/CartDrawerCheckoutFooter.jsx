import React from "react";
import { FaArrowRight, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { useStoreStatus } from "../../../Context/StoreStatusContext";

export default function CartDrawerCheckoutFooter({
  totalQty,
  totalAmount,
  effectiveDeliveryFee = 0,
  defaultFee = 150,
  isFreeDelivery = false,
  isDineIn = false,
  grandTotal,
  toggleCart,
  navigate,
}) {
  const { isOpen, openClosedModal } = useStoreStatus();
  const finalTotal = isDineIn
    ? totalAmount
    : grandTotal !== undefined
    ? grandTotal
    : totalAmount + effectiveDeliveryFee;

  return (
    <div className="p-3.5 sm:p-5 border-t border-gray-200/80 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md space-y-3 shrink-0">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>Subtotal ({totalQty} items)</span>
          <span className="font-bold text-neutral-900 dark:text-white">
            Rs {totalAmount.toLocaleString()}
          </span>
        </div>

        {/* Dynamic Delivery Fee with Free Waiver indicator (Hidden in Dine-In Mode) */}
        {!isDineIn && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Delivery Fee</span>
            {isFreeDelivery ? (
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-neutral-400 line-through text-[11px]">
                  Rs {defaultFee}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                  <FaCheckCircle className="text-[10px]" /> FREE
                </span>
              </div>
            ) : (
              <span className="font-bold text-neutral-900 dark:text-white">
                Rs {defaultFee}
              </span>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-baseline">
          <div>
            <span className="font-['Oswald',sans-serif] font-bold text-xs sm:text-sm uppercase text-neutral-900 dark:text-white block">
              Grand Total
            </span>
            {!isDineIn && isFreeDelivery && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Free delivery discount applied
              </span>
            )}
          </div>
          <span className="text-lg sm:text-xl font-black font-['Oswald',sans-serif] text-amber-500 dark:text-amber-400">
            Rs {finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!isOpen) {
            toggleCart();
            openClosedModal();
            return;
          }
          toggleCart();
          navigate("/checkout");
        }}
        className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-neutral-950 font-['Oswald',sans-serif] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
      >
        <span>{isOpen ? "Proceed to Checkout" : "Restaurant Currently Closed"}</span>
        <FaArrowRight className="text-xs" />
      </button>

   
    </div>
  );
}
