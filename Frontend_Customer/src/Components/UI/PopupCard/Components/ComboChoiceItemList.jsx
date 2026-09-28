import React from "react";
import { FaCheck, FaBan } from "react-icons/fa";

export default function ComboChoiceItemList({
  flavors = [],
  selectedFlavor = "",
  onSelectFlavor,
  columnsClass = "grid-cols-2",
}) {
  return (
    <div className="overflow-hidden">
      <div
        className={`p-4 pt-0 grid ${columnsClass} gap-2 border-t border-gray-200/60 dark:border-neutral-800/80`}
      >
        {flavors.map((flavor, idx) => {
          // Support both string and {name, inStock} object formats
          const flavorName = typeof flavor === "string" ? flavor : (flavor.name || flavor.title || "");
          const flavorInStock = typeof flavor === "string" ? true : (flavor.inStock !== false);
          const isSelected = selectedFlavor === flavorName;

          if (!flavorInStock) {
            // Unavailable flavor: disabled, dimmed, dashed border
            return (
              <button
                key={flavorName || idx}
                type="button"
                disabled
                className="p-2.5 rounded-xl text-center text-xs font-bold border border-dashed cursor-not-allowed opacity-40 bg-gray-100 dark:bg-neutral-800/40 text-gray-400 dark:text-neutral-600 border-gray-300 dark:border-neutral-700 flex flex-col items-center justify-center gap-0.5"
              >
                <span className="flex items-center gap-1">
                  <FaBan className="text-[9px] text-red-400/70" />
                  <span>{flavorName}</span>
                </span>
                <span className="text-[9px] font-semibold text-red-400/70 uppercase tracking-wider">(Unavailable)</span>
              </button>
            );
          }

          return (
            <button
              key={flavorName || idx}
              type="button"
              onClick={() => onSelectFlavor(flavorName)}
              className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center justify-center gap-1.5 ${
                isSelected
                  ? "bg-amber-400 text-gray-950 border-amber-500 shadow-sm font-black ring-1 ring-amber-400"
                  : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-amber-400"
              }`}
            >
              {isSelected && <FaCheck className="text-[10px]" />}
              <span>{flavorName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

