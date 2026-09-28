import React from "react";
import { FaSave, FaSpinner } from "react-icons/fa";
import DealSelectedItemsTable from "./DealSelectedItemsTable";
import DealAddonsSelector from "./DealAddonsSelector";

export default function DealItemsSelector({
  includedItems = [],
  handleAddItemRow,
  handleRemoveItemRow,
  handleItemChange,
  handleUpdateItemRow,
  handleQuickSelectMenu,
  menuItems = [],
  availableAddonCategories = [],
  selectedAddonCategories = [],
  toggleAddonCategory,
  handleSaveDeal,
  isSaving = false,
  editDeal = null,
}) {
  return (
    <>
      {/* 2. Combo Bundled Items Repeater */}
      <DealSelectedItemsTable
        includedItems={includedItems}
        handleAddItemRow={handleAddItemRow}
        handleRemoveItemRow={handleRemoveItemRow}
        handleItemChange={handleItemChange}
        handleUpdateItemRow={handleUpdateItemRow}
        handleQuickSelectMenu={handleQuickSelectMenu}
        menuItems={menuItems}
      />

      {/* 3. Attach Dynamic Addon Groups & Upsells */}
      <DealAddonsSelector
        availableAddonCategories={availableAddonCategories}
        selectedAddonCategories={selectedAddonCategories}
        toggleAddonCategory={toggleAddonCategory}
      />

      {/* Submit Action Bar */}
      <div className="admin-card-surface flex justify-end gap-3 p-4 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200 dark:border-white/[0.06] shadow-sm">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveDeal}
          className="bg-amber-500/90 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-neutral-900 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all duration-200 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          {isSaving ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : (
            <FaSave className="text-xs" />
          )}
          <span>
            {isSaving
              ? editDeal
                ? "Updating Deal..."
                : "Saving Deal..."
              : editDeal
                ? "Update Deal"
                : "Publish Deal to Menu"}
          </span>
        </button>
      </div>
    </>
  );
}
