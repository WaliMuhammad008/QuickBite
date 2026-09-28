import React from "react";

export default function RecipeVariantTabs({
  variants = [],
  selectedVariant,
  setSelectedVariant,
}) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="flex gap-2  pb-4">
      {variants.map((variant, index) => {
        const isSelected = selectedVariant === variant.size;
        return (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedVariant(variant.size)}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all border-none ${
              isSelected
                ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 scale-[1.02]"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {variant.size}
          </button>
        );
      })}
    </div>
  );
}
