import React from "react";
import { FaSpinner, FaTimes } from "react-icons/fa";
import AddonProductLinkList from "./AddonProductLinkList";

export default function AddonMappingModal({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  currentMapping,
  setCurrentMapping,
  categories = [],
  handleAddAddon,
  handleAddonChange,
  handleRemoveAddon,
  handleSave,
  isSaving,
}) {
  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 z-[9999]"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl w-full max-w-[620px] max-h-[88vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-zinc-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide m-0">
              {isEditing ? "Edit Category Mappings" : "Create Category Mapping"}
            </h2>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            onClick={() => setIsModalOpen(false)}
            aria-label="Close modal"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Target Category */}
          <div>
            <label className="text-xs font-extrabold text-zinc-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
              Target Product Category (e.g. Burgers) *
            </label>
            <select
              value={currentMapping.target_category}
              onChange={(e) =>
                setCurrentMapping({
                  ...currentMapping,
                  target_category: e.target.value,
                })
              }
              disabled={isEditing}
              className="w-full bg-zinc-50 dark:bg-neutral-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500 text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              <option value="">-- Select Target Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {isEditing && (
              <span className="text-xs text-zinc-500 dark:text-neutral-400 mt-1 block">
                Target category cannot be changed when editing.
              </span>
            )}
          </div>

          <hr className="border-zinc-200 dark:border-neutral-800 m-0" />

          {/* Addon Categories Repeater */}
          <AddonProductLinkList
            addons={currentMapping.addons}
            categories={categories}
            targetCategory={currentMapping.target_category}
            handleAddAddon={handleAddAddon}
            handleAddonChange={handleAddonChange}
            handleRemoveAddon={handleRemoveAddon}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Mappings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
