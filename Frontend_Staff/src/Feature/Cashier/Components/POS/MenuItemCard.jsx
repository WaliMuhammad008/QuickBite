import React from "react";
import { FaPlus, FaUtensils } from "react-icons/fa";

export default function MenuItemCard({ item, onItemClick }) {
  const hasVariants = item.variants && item.variants.length > 1;
  const isOutOfStock =
    !item.variants || item.variants.length === 0
      ? false
      : item.variants.every(
          (v) => v.inStock === false || v.inStock === 0 || v.inStock === "0"
        );

  return (
    <div
      onClick={() => !isOutOfStock && onItemClick(item, true)}
      className={`group relative bg-white dark:bg-zinc-900 border rounded-2xl p-3 flex flex-col justify-between transition-all select-none ${
        isOutOfStock
          ? "opacity-50 border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
          : "border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer active:scale-[0.98]"
      }`}
      style={{ transform: "none", perspective: "none" }}
    >
      {/* Item Image / Fallback Container */}
      <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2.5 flex items-center justify-center">
        {item.img ? (
          <img
            src={
              item.img.startsWith("http")
                ? item.img
                : `${import.meta.env.VITE_API_BASE.replace(/\/api$/, "")}/${item.img.replace(/^\//, "")}`
            }
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex items-center justify-center text-zinc-400 ${
            item.img ? "hidden" : "flex"
          }`}
        >
          <FaUtensils className="text-2xl opacity-40" />
        </div>

        {/* Category Tag */}
        {item.category && item.category !== "Uncategorized" && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-white">
            {item.category}
          </span>
        )}

        {/* Variant Indicator */}
        {hasVariants && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-[10px] font-extrabold uppercase text-neutral-950 shadow-xs">
            {item.variants.length} Sizes
          </span>
        )}
      </div>

      {/* Item Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="m-0 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight">
            {item.title}
          </h3>
        </div>

        {/* Price & Add Trigger Row */}
        <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="font-mono font-extrabold text-sm sm:text-base text-zinc-900 dark:text-amber-400">
            Rs. {item.price}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border-none transition-all shadow-xs cursor-pointer ${
              isOutOfStock
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-neutral-950 active:scale-95"
            }`}
            title={hasVariants ? "Choose size & options" : "Add to order"}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onItemClick(item, false);
            }}
          >
            <FaPlus className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
