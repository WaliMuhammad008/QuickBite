import React from "react";

export default function ItemVariantList({
  isDeal = false,
  fullItem,
  selectedVariant,
  setSelectedVariant,
}) {
  if (isDeal || !fullItem?.variants || fullItem.variants.length <= 1) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl p-4 border border-gray-200/80 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 font-['Oswald',sans-serif]">
          Choose An Option <span className="text-red-600">*</span>
        </span>
        <span className="text-[11px] font-semibold bg-red-600/10 text-red-600 dark:bg-red-600/20 px-2 py-0.5 rounded-full">
          Required
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {(fullItem.variants || []).map((v, idx) => {
          const isSelected = selectedVariant?.size === v.size;
          const isOutOfStock =
            v.inStock === false || v.inStock === 0 || v.inStock === "0";

          return (
            <button
              key={idx}
              type="button"
              disabled={isOutOfStock}
              onClick={() => setSelectedVariant(v)}
              className={`p-3 rounded-xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-400/20 border-amber-400 text-gray-950 dark:text-white shadow-sm ring-2 ring-amber-400"
                  : "bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-amber-400"
              } ${isOutOfStock ? "opacity-40 cursor-not-allowed line-through" : ""}`}
            >
              <span className="text-xs font-bold uppercase">{v.size}</span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1 font-['Oswald',sans-serif]">
                {isOutOfStock ? "Out of Stock" : `Rs ${v.price}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
