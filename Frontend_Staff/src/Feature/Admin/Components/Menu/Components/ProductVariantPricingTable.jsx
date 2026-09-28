import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function ProductVariantPricingTable({
  menuForm,
  setMenuForm,
}) {
  const addVariantRow = () => {
    setMenuForm({
      ...menuForm,
      variants: [
        ...(menuForm.variants || []),
        { size: "", price: "", inStock: true },
      ],
    });
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...menuForm.variants];
    updatedVariants[index][field] = value;
    setMenuForm({ ...menuForm, variants: updatedVariants });
  };

  const removeVariant = (index) => {
    const updatedVariants = menuForm.variants.filter((_, i) => i !== index);
    setMenuForm({ ...menuForm, variants: updatedVariants });
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
          Sizes & Price Tiers *
        </label>
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          At least 1 required
        </span>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {menuForm.variants &&
          menuForm.variants.map((variant, index) => (
            <div
              key={index}
              className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center p-2.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800"
            >
              <input
                type="text"
                className="flex-1 min-w-[110px] p-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg focus:outline-none focus:border-amber-500 font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder="Size (e.g. Regular, Large)"
                value={variant.size}
                onChange={(e) =>
                  updateVariant(index, "size", e.target.value)
                }
              />
              <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 w-28 min-w-[90px] focus-within:border-amber-500">
                <span className="text-[11px] text-amber-500 font-bold mr-1">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  className="w-full py-2 bg-transparent text-xs text-zinc-900 dark:text-white outline-none font-bold"
                  placeholder="0"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(index, "price", e.target.value)
                  }
                />
              </div>

              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-zinc-700 dark:text-neutral-300 select-none px-1">
                <input
                  type="checkbox"
                  checked={variant.inStock !== false}
                  onChange={(e) =>
                    updateVariant(index, "inStock", e.target.checked)
                  }
                  className="cursor-pointer accent-amber-500"
                />
                <span className="text-[11px]">Stock</span>
              </label>

              {menuForm.variants.length > 1 && (
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
                  onClick={() => removeVariant(index)}
                  aria-label="Remove variant"
                >
                  <FaTrash className="text-[10px]" />
                </button>
              )}
            </div>
          ))}
      </div>

      <button
        type="button"
        className="w-full py-2.5 bg-transparent text-amber-500 hover:text-amber-400 border border-dashed border-amber-500/30 hover:border-amber-500 rounded-xl cursor-pointer font-bold text-xs flex justify-center items-center gap-2 transition-all"
        onClick={addVariantRow}
      >
        <FaPlus className="text-[10px]" />
        <span>Add Another Size Variant</span>
      </button>
    </div>
  );
}
