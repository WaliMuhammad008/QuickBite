import React from "react";
import {
  FaPlus,
  FaTrash,
  FaCheckSquare,
  FaRegSquare,
  FaSpinner,
} from "react-icons/fa";

export default function RecipeIngredientsMatrix({
  ingredients = [],
  inventoryItems = [],
  isFetching,
  addIngredientRow,
  handleIngredientChange,
  removeIngredient,
}) {
  if (isFetching) {
    return (
      <div className="py-12 flex flex-col justify-center items-center text-amber-400 gap-2 font-bold text-xs">
        <FaSpinner className="animate-spin text-xl" />
        <span>Loading ingredient recipe...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ingredients.map((ing, index) => {
        const selectedItemData = inventoryItems?.find(
          (item) => item.id == ing.inventory_id
        );
        const unitLabel = selectedItemData ? selectedItemData.unit : "Unit";

        return (
          <div
            key={index}
            className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center hover:border-amber-500/30 transition-all shadow-sm"
          >
            {/* Ingredient Select */}
            <div className="flex-1 min-w-[160px]">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Raw Inventory Item *
              </label>
              <select
                className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                value={ing.inventory_id}
                onChange={(e) =>
                  handleIngredientChange(index, "inventory_id", e.target.value)
                }
              >
                <option value="" disabled>
                  Select Raw Ingredient
                </option>
                {inventoryItems &&
                  inventoryItems.map((invItem) => (
                    <option key={invItem.id} value={invItem.id}>
                      {invItem.name} ({invItem.stock} {invItem.unit})
                    </option>
                  ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div className="w-full sm:w-32">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Quantity ({unitLabel})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={ing.qty}
                onChange={(e) =>
                  handleIngredientChange(index, "qty", e.target.value)
                }
                className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            {/* Removable Toggle */}
            <div className="flex items-center gap-2 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={() =>
                  handleIngredientChange(
                    index,
                    "is_removable",
                    !ing.is_removable
                  )
                }
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
                  ing.is_removable
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {ing.is_removable ? (
                  <FaCheckSquare className="text-amber-500 text-xs" />
                ) : (
                  <FaRegSquare className="text-xs" />
                )}
                <span className="text-[11px]">Optional</span>
              </button>

              {/* Remove Row Button */}
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
                title="Remove Ingredient"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addIngredientRow}
        className="w-full py-3 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-dashed border-amber-500/30 hover:border-amber-500 rounded-2xl cursor-pointer font-bold text-xs flex justify-center items-center gap-2 transition-all mt-2"
      >
        <FaPlus className="text-[10px]" />
        <span>Add Ingredient to Recipe</span>
      </button>
    </div>
  );
}
