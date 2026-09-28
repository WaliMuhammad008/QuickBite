import React, { useRef } from "react";
import { FaTimes, FaSpinner } from "react-icons/fa";
import ProductBasicInfoForm from "./ProductBasicInfoForm";
import ProductVariantPricingTable from "./ProductVariantPricingTable";

const MenuModal = ({
  isOpen,
  onClose,
  editingItem,
  menuForm,
  setMenuForm,
  onSave,
  categories,
  isSaving = false,
}) => {
  const fileInputRef = useRef(null);
  const promoFileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuForm({ ...menuForm, img: file });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={() => !isSaving && onClose()}
    >
      <div
        className="w-full max-w-lg md:max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[88vh] overflow-y-auto flex flex-col animate-slide-up text-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full shrink-0" />
            <h3 className="m-0 text-base sm:text-lg md:text-xl font-black text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              {editingItem ? "Edit Menu Item" : "Create New Menu Item"}
            </h3>
          </div>
          <button
            type="button"
            disabled={isSaving}
            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Content Body */}
        <div className="w-full flex-1">
          <ProductBasicInfoForm
            menuForm={menuForm}
            setMenuForm={setMenuForm}
            categories={categories}
            fileInputRef={fileInputRef}
            promoFileInputRef={promoFileInputRef}
            handleImageChange={handleImageChange}
          />
        </div>

        {/* Variants Repeater Section */}
        <div className="mt-4">
          <ProductVariantPricingTable
            menuForm={menuForm}
            setMenuForm={setMenuForm}
          />
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 border-none cursor-pointer transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onSave}
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                <span>{editingItem ? "Updating..." : "Saving..."}</span>
              </>
            ) : (
              editingItem ? "Update Item" : "Save Item"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
