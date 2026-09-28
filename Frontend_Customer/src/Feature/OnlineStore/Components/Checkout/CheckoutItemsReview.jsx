import React from "react";

export default function CheckoutItemsReview({ cartItems = [] }) {
  return (
    <>
      <h2 className="font-['Oswald',sans-serif] font-black text-xl uppercase tracking-wider text-neutral-900 dark:text-white m-0 pb-3 border-b border-gray-100 dark:border-neutral-800">
        Order Items ({cartItems.length})
      </h2>

      {/* Items Mini List */}
      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-sidebar-scroll">
        {cartItems.map((item) => (
          <div
            key={item.cartId || item.id}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-bold text-amber-500 font-['Oswald',sans-serif] shrink-0">
                {item.qty || 1}x
              </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {item.name || item.title}
                {item.size && item.size !== "Regular" && ` (${item.size})`}
              </span>
            </div>
            <span className="font-bold text-neutral-900 dark:text-white font-['Oswald',sans-serif] shrink-0">
              Rs {(parseFloat(item.price || 0) * (item.qty || 1)).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
