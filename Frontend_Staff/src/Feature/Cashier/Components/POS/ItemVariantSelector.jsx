import React from "react";

export default function ItemVariantSelector({
  variants = [],
  selectedVariant = "",
  setSelectedVariant,
}) {
  if (!variants || variants.length === 0) return null;

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 font-mono">
        Select Size / Variant
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {variants.map((v) => {
          const isSelected = selectedVariant === v.size;
          const isOut =
            v.inStock === false || v.inStock === 0 || v.inStock === "0";
          return (
            <button
              key={v.size}
              type="button"
              disabled={isOut}
              onClick={() => setSelectedVariant(v.size)}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isOut
                  ? "opacity-40 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 cursor-not-allowed"
                  : isSelected
                    ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20 font-bold scale-[1.02]"
                    : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-amber-500"
              }`}
            >
              <span className="text-xs font-extrabold">{v.size}</span>
              <span className="text-[11px] font-mono mt-1 opacity-90">
                {isOut ? "Sold Out" : `Rs. ${v.price}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
