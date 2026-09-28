import React from "react";
import { FaPlus, FaTrash, FaSpinner } from "react-icons/fa";

export default function AddonSubItemsTable({
  addons = [],
  inventoryItems = [],
  loading,
  handleAddRow,
  handleFieldChange,
  handleRemoveRow,
}) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col justify-center items-center text-amber-400 gap-2 font-bold text-xs">
        <FaSpinner className="animate-spin text-xl" />
        <span>Loading add-ons configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addons.map((addon, index) => {
        const selectedInv = inventoryItems.find(
          (i) => i.id == addon.inventory_id
        );
        return (
          <div
            key={index}
            className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center hover:border-amber-500/30 transition-all shadow-sm"
          >
            {/* Addon Title */}
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Add-on Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Extra Cheese, Dip Sauce"
                value={addon.addon_name}
                onChange={(e) =>
                  handleFieldChange(index, "addon_name", e.target.value)
                }
                className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            {/* Price Input */}
            <div className="w-full sm:w-28">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Price (Rs.)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={addon.addon_price}
                onChange={(e) =>
                  handleFieldChange(index, "addon_price", e.target.value)
                }
                className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            {/* Linked Ingredient */}
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Linked Stock Item
              </label>
              <select
                value={addon.inventory_id}
                onChange={(e) =>
                  handleFieldChange(index, "inventory_id", e.target.value)
                }
                className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
              >
                <option value="">None (No Stock Deduction)</option>
                {inventoryItems.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.stock} {inv.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Deduct Qty */}
            {addon.inventory_id && (
              <div className="w-full sm:w-24">
                <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                  Qty ({selectedInv?.unit || "Unit"})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="1"
                  value={addon.qty}
                  onChange={(e) =>
                    handleFieldChange(index, "qty", e.target.value)
                  }
                  className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            )}

            {/* Trash Action */}
            <div className="sm:self-end mb-1">
              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                title="Remove Add-on"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleAddRow}
        className="w-full py-3 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-dashed border-amber-500/30 hover:border-amber-500 rounded-2xl cursor-pointer font-bold text-xs flex justify-center items-center gap-2 transition-all mt-2"
      >
        <FaPlus className="text-[10px]" />
        <span>Add Another Add-on Option</span>
      </button>
    </div>
  );
}
