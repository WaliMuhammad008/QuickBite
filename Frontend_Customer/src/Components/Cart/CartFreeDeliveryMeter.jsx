import React from "react";
import { FaTruck, FaCheckCircle, FaFire } from "react-icons/fa";

const CartFreeDeliveryMeter = ({
  subtotal = 0,
  threshold = 1500,
  defaultFee = 150,
  isDineIn = false,
  className = "",
}) => {
  if (isDineIn || !threshold || threshold <= 0) return null;

  const remaining = Math.max(threshold - subtotal, 0);
  const percent = Math.min(Math.round((subtotal / threshold) * 100), 100);
  const isUnlocked = percent >= 100;

  return (
    <div
      className={`w-full bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 shadow-sm backdrop-blur-md transition-all duration-300 ${className}`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2 font-medium">
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <FaCheckCircle className="text-sm text-emerald-500 animate-pulse" />
              <span>Free Delivery Unlocked!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <FaTruck className="text-xs text-amber-500 shrink-0" />
              <span>
                Add <strong className="text-amber-600 dark:text-amber-400 font-black">Rs {remaining.toLocaleString()}</strong> more for <strong className="text-zinc-900 dark:text-white font-bold">FREE Delivery</strong>
              </span>
            </div>
          )}
        </div>
        <span className={`font-black font-['Oswald',sans-serif] text-xs ${isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {percent}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-zinc-200 dark:bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-zinc-300/60 dark:border-neutral-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isUnlocked
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'bg-gradient-to-r from-amber-600 to-amber-400'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default CartFreeDeliveryMeter;
