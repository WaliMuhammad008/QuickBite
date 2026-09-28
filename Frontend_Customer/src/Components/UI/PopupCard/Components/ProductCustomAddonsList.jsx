import React, { useState } from "react";
import { FaPlus, FaCheck, FaChevronDown, FaLayerGroup } from "react-icons/fa";

export default function ProductCustomAddonsList({
  productAddons = [],
  selectedProductAddons = [],
  toggleProductAddon,
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!Array.isArray(productAddons) || productAddons.length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <FaLayerGroup className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif] flex items-center gap-2">
              Product Add-ons & Upgrades
              {selectedProductAddons.length > 0 && (
                <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                  {selectedProductAddons.length} selected
                </span>
              )}
            </h4>
            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
              Customize with extra cheese, sauces, and toppings
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Optional
          </span>
          <FaChevronDown
            className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="p-3 sm:p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {productAddons.map((addon) => {
              const isSelected = selectedProductAddons.some(
                (a) => a.id === addon.id || a.title === addon.title
              );

              return (
                <button
                  key={addon.id || addon.title}
                  type="button"
                  onClick={() => toggleProductAddon && toggleProductAddon(addon)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-amber-400/10 dark:bg-amber-400/15 border-amber-500 text-gray-900 dark:text-white ring-2 ring-amber-400/25 shadow-xs"
                      : "bg-white dark:bg-neutral-800/40 border-gray-200/80 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:border-amber-400/50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 transition-colors ${
                        isSelected
                          ? "bg-amber-500 text-neutral-950 font-black"
                          : "bg-gray-200 dark:bg-neutral-700 text-gray-400"
                      }`}
                    >
                      {isSelected ? (
                        <FaCheck className="w-2.5 h-2.5" />
                      ) : (
                        <FaPlus className="w-2.5 h-2.5" />
                      )}
                    </div>
                    <span className="text-xs font-bold truncate">
                      {addon.title || addon.name}
                    </span>
                  </div>

                  <span className="text-xs font-black font-['Oswald',sans-serif] text-amber-600 dark:text-amber-400 shrink-0">
                    +Rs {parseFloat(addon.price || 0).toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
