import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function AddonProductLinkList({
  addons = [],
  categories = [],
  targetCategory = "",
  handleAddAddon,
  handleAddonChange,
  handleRemoveAddon,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
          Addon Categories to Assign
        </label>
        <button
          type="button"
          onClick={handleAddAddon}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-500 text-xs font-bold flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 cursor-pointer transition-all"
        >
          <FaPlus className="text-[10px]" /> Add Category
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {addons.map((addon, index) => (
          <div
            key={index}
            className="flex flex-col gap-2.5 bg-zinc-50 dark:bg-neutral-800/60 p-3.5 rounded-xl border border-zinc-200 dark:border-neutral-700/60"
          >
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider">
                Addon Category
              </label>
              <button
                type="button"
                onClick={() => handleRemoveAddon(index)}
                className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 text-xs font-semibold flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                <FaTrash className="text-[10px]" /> Remove
              </button>
            </div>
            <select
              value={addon.addon_category}
              onChange={(e) =>
                handleAddonChange(index, "addon_category", e.target.value)
              }
              className="w-full bg-white dark:bg-neutral-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-neutral-700 rounded-lg px-3 py-2 outline-none focus:border-amber-500 text-sm font-semibold"
            >
              <option value="">-- Select Category (e.g. Drinks) --</option>
              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.name}
                  disabled={cat.name === targetCategory}
                >
                  {cat.name}
                </option>
              ))}
            </select>

            <div>
              <label className="text-[11px] font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">
                Custom Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Complete your meal with a Drink!"
                value={addon.custom_label || ""}
                onChange={(e) =>
                  handleAddonChange(index, "custom_label", e.target.value)
                }
                className="w-full bg-white dark:bg-neutral-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-neutral-700 rounded-lg px-3 py-2 outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="flex-1">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">
                  Selection Type
                </label>
                <select
                  value={addon.selection_type}
                  onChange={(e) =>
                    handleAddonChange(index, "selection_type", e.target.value)
                  }
                  className="w-full bg-white dark:bg-neutral-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-neutral-700 rounded-lg px-3 py-2 outline-none focus:border-amber-500 text-sm"
                >
                  <option value="single_choice">Single Choice (Radio)</option>
                  <option value="multiple_choice">
                    Multiple Choice (Checkbox)
                  </option>
                </select>
              </div>
              <div className="flex-1 flex items-center sm:pt-4">
                <label className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addon.is_required}
                    onChange={(e) =>
                      handleAddonChange(index, "is_required", e.target.checked)
                    }
                    className="w-4 h-4 cursor-pointer accent-amber-500"
                  />
                  Is Required?
                </label>
              </div>
            </div>
          </div>
        ))}
        {addons.length === 0 && (
          <p className="text-zinc-500 dark:text-neutral-400 text-xs text-center py-6 italic border border-dashed border-zinc-300 dark:border-neutral-800 rounded-xl bg-zinc-50 dark:bg-neutral-900">
            No addon categories mapped yet. Click "+ Add Category".
          </p>
        )}
      </div>
    </div>
  );
}
