import React from "react";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";

export default function CartItemRow({ item, updateQty, removeFromCart }) {
  const price = Number(item.price || 0);
  const qty = Number(item.qty || item.quantity || 1);
  const itemTotal = (price * qty).toFixed(2);
  const title = item.name || item.title || "Item";

  return (
    <div
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3 text-zinc-900 dark:text-white shadow-xs shrink-0 transition-all"
      style={{
        borderRadius: "12px",
        transform: "none",
        perspective: "none",
        transformStyle: "flat",
        clipPath: "none",
        maskImage: "none",
        WebkitMaskImage: "none",
      }}
    >
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate m-0">
          {title}{" "}
          {item.variant || (item.size && item.size !== "Regular") ? (
            <span className="text-amber-500 text-[11px] font-semibold">
              ({item.variant || item.size})
            </span>
          ) : (
            ""
          )}
        </h4>
        {item.note && (
          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 italic truncate mt-0.5">
            "{item.note}"
          </div>
        )}
        {item.excluded_ingredients && item.excluded_ingredients.length > 0 && (
          <div className="text-[9px] text-rose-500 dark:text-rose-400 font-semibold mt-0.5">
            - {item.excluded_ingredients.length} item(s) removed
          </div>
        )}
        {item.selected_addons && item.selected_addons.length > 0 && (
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 space-y-0.5">
            {item.selected_addons.map((a, idx) => (
              <div key={idx} className="truncate">
                + {a.name || a.title} (Rs. {Number(a.price || 0)})
              </div>
            ))}
          </div>
        )}
        <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
          Rs. {price.toFixed(2)} × {qty}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => updateQty(item.cartId || item.id, qty - 1)}
            className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
          >
            <FaMinus className="w-2.5 h-2.5" />
          </button>
          <span className="px-2 text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 min-w-[16px] text-center">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => updateQty(item.cartId || item.id, qty + 1)}
            className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
          >
            <FaPlus className="w-2.5 h-2.5" />
          </button>
        </div>

        <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 min-w-[65px] text-right">
          Rs. {itemTotal}
        </span>

        <button
          type="button"
          onClick={() => removeFromCart(item.cartId || item.id)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer border-none bg-transparent"
          title="Remove Item"
        >
          <FaTrash className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
