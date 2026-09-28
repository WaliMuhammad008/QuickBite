import React from "react";
import { FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";

export default function ItemQuantityFooter({
  quantity = 1,
  increaseQuantity,
  decreaseQuantity,
  grandTotal = 0,
  handleAddToCart,
  specialNote = "",
  setSpecialNote,
  mode = "desktop", // "desktop", "mobile", or "note_only"
  isOutOfStock = false,
}) {
  if (mode === "note_only") {
    return (
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 font-['Oswald',sans-serif] block mb-1.5">
          Special Instructions
        </label>
        <textarea
          value={specialNote}
          onChange={(e) => setSpecialNote(e.target.value)}
          placeholder="e.g. Extra crispy, sauce on the side..."
          rows={2}
          className="w-full p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 text-xs text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-800 outline-none focus:border-amber-400 transition-colors duration-200 resize-none font-medium"
        />
      </div>
    );
  }

  if (mode === "desktop") {
    return (
      <div className="hidden lg:flex flex-col gap-3.5 pt-4 border-t border-gray-200/80 dark:border-neutral-800 z-10">
        {/* Price Summary Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 font-['Oswald',sans-serif]">
            Total Amount
          </span>
          <div className="text-right">
            <span className={`text-2xl font-black font-['Oswald',sans-serif] ${
              isOutOfStock ? "text-neutral-400 dark:text-neutral-500" : "text-amber-500 dark:text-amber-400"
            }`}>
              Rs {grandTotal}
            </span>
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className={`flex items-center justify-between bg-gray-100 dark:bg-neutral-800/90 p-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 ${isOutOfStock ? "opacity-50 pointer-events-none" : ""}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 font-['Oswald',sans-serif] pl-2">
            Quantity
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={decreaseQuantity}
              className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black text-gray-800 dark:text-white flex items-center justify-center cursor-pointer border-none transition-all active:scale-90 shadow-xs"
              aria-label="Decrease quantity"
            >
              <FaMinus className="text-[10px]" />
            </button>
            <span className="text-sm font-black text-gray-900 dark:text-white min-w-[24px] text-center font-['Oswald',sans-serif]">
              {quantity}
            </span>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={increaseQuantity}
              className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black text-gray-800 dark:text-white flex items-center justify-center cursor-pointer border-none transition-all active:scale-90 shadow-xs"
              aria-label="Increase quantity"
            >
              <FaPlus className="text-[10px]" />
            </button>
          </div>
        </div>

        {/* Desktop Add to Cart Button */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`w-full py-3.5 px-4 rounded-xl font-bold font-['Oswald',sans-serif] text-base tracking-wide flex items-center justify-center gap-2 border-none transition-all ${
            isOutOfStock
              ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed shadow-none"
              : "bg-amber-500 hover:bg-amber-400 text-black shadow-lg active:scale-98 cursor-pointer"
          }`}
        >
          <FaShoppingBag className="text-sm text-neutral-950" />
          <span>{isOutOfStock ? "CURRENTLY OUT OF STOCK" : `ADD TO CART • RS ${grandTotal}`}</span>
        </button>
      </div>
    );
  }

  // Mobile Sticky Bottom Bar
  return (
    <div className="lg:hidden sticky bottom-0 z-30 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-gray-200 dark:border-white/10 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
      {/* Quantity Stepper */}
      <div className={`flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 p-1 sm:p-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 shrink-0 ${isOutOfStock ? "opacity-50 pointer-events-none" : ""}`}>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={decreaseQuantity}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black text-gray-800 dark:text-white flex items-center justify-center cursor-pointer border-none transition-all active:scale-90"
          aria-label="Decrease quantity"
        >
          <FaMinus className="text-[10px]" />
        </button>
        <span className="text-xs sm:text-sm md:text-base font-black text-gray-900 dark:text-white min-w-[18px] text-center font-['Oswald',sans-serif]">
          {quantity}
        </span>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={increaseQuantity}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black text-gray-800 dark:text-white flex items-center justify-center cursor-pointer border-none transition-all active:scale-90"
          aria-label="Increase quantity"
        >
          <FaPlus className="text-[10px]" />
        </button>
      </div>

      {/* Standalone Add to Cart Button with Full Price */}
      <button
        type="button"
        disabled={isOutOfStock}
        onClick={handleAddToCart}
        className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold font-['Oswald',sans-serif] text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center gap-2 border-none transition-all ${
          isOutOfStock
            ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed shadow-none"
            : "bg-amber-500 hover:bg-amber-400 text-black shadow-lg active:scale-98 cursor-pointer"
        }`}
      >
        <FaShoppingBag className="text-xs sm:text-sm text-neutral-950" />
        <span>{isOutOfStock ? "CURRENTLY OUT OF STOCK" : `ADD TO CART • RS ${grandTotal}`}</span>
      </button>
    </div>
  );
}
