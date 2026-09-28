import React from "react";
import { FaCheckSquare, FaRegSquare } from "react-icons/fa";

export default function ItemIngredientToggles({
  optionalIngredients = [],
  excludedIds = [],
  toggleIngredient,
}) {
  if (!optionalIngredients || optionalIngredients.length === 0) return null;

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 font-mono">
        Ingredients (Click to remove)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {optionalIngredients.map((ing, idx) => {
          const ingId = ing.inventory_id ?? ing.id ?? idx;
          const isExcluded = excludedIds.includes(ingId);
          const ingredientName =
            ing.ingredient_name || ing.item_name || ing.name || "Ingredient";

          return (
            <button
              key={ingId}
              type="button"
              onClick={() => toggleIngredient(ingId)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer select-none ${
                isExcluded
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/30 font-semibold line-through decoration-rose-500/60"
                  : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {isExcluded ? (
                <FaRegSquare className="text-rose-500 shrink-0 text-sm" />
              ) : (
                <FaCheckSquare className="text-amber-500 shrink-0 text-sm" />
              )}
              <span className="truncate">{ingredientName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
