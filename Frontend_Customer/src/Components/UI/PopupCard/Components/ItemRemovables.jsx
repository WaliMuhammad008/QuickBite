import React from "react";
import { FaSlidersH, FaChevronDown } from "react-icons/fa";

export default function ItemRemovables({
  isDeal = false,
  optionalIngredients = [],
  openSections = {},
  toggleSection,
  excludedIds = [],
  toggleRemovable,
}) {
  if (isDeal || optionalIngredients.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => toggleSection("ingredients")}
        className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
      >
        <div className="flex items-center gap-2.5">
          <FaSlidersH className="text-gray-500 text-sm" />
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
              Customize Ingredients
            </h4>
            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
              Uncheck to remove ingredients from your meal
            </span>
          </div>
        </div>
        <FaChevronDown
          className={`text-xs text-gray-400 transition-transform duration-300 ${
            openSections.ingredients ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          openSections.ingredients
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0 grid grid-cols-2 gap-2 border-t border-gray-200/50 dark:border-neutral-800/80">
            {optionalIngredients.map((ing, idx) => {
              const isExcluded = excludedIds.includes(ing.inventory_id);

              return (
                <label
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
                    isExcluded
                      ? "bg-gray-100 dark:bg-neutral-800/50 text-gray-400 line-through border-gray-200 dark:border-neutral-800 opacity-60"
                      : "bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!isExcluded}
                    onChange={() => toggleRemovable(ing.inventory_id)}
                    className="accent-amber-400 cursor-pointer"
                  />
                  <span>{ing.ingredient_name}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
