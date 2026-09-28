import React, { useRef, useState } from "react";
import { FaCloudUploadAlt, FaTimes, FaSpinner } from "react-icons/fa";

const CategoryModal = ({
  isOpen,
  onClose,
  categoryForm,
  setCategoryForm,
  onSave,
  editingCategory,
}) => {
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryForm({ ...categoryForm, img: file });
    }
  };

  const desktopImagePreviewUrl =
    categoryForm.img instanceof File
      ? URL.createObjectURL(categoryForm.img)
      : categoryForm.img;

  const handleLocalSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-[99999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl relative animate-slide-up text-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full shrink-0" />
            <h3 className="m-0 text-base sm:text-lg md:text-xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-zinc-900 dark:text-white">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            aria-label="Close modal"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Image Upload Area */}
        <div className="mb-4">
          <label className="block text-xs font-extrabold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Category Image
          </label>
          <div
            className="relative w-full h-44 sm:h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl overflow-hidden cursor-pointer group bg-zinc-50 dark:bg-zinc-800/40 hover:border-amber-400 hover:bg-amber-400/5 transition-all flex flex-col justify-center items-center shadow-xs"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
            {categoryForm.img ? (
              <>
                <img
                  src={desktopImagePreviewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover block"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-center items-center text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <FaCloudUploadAlt size={32} className="text-amber-400" />
                  <span className="mt-2 font-bold text-xs">Change Image</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FaCloudUploadAlt className="text-2xl" />
                </div>
                <p className="m-0 font-bold text-xs text-zinc-900 dark:text-white">
                  Upload Category Image
                </p>
                <span className="text-[10px] mt-1 text-zinc-400 dark:text-zinc-500">
                  Click to browse PNG, JPG or WebP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Category Name Input */}
        <div className="mb-4">
          <label className="block text-xs font-extrabold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Category Name *
          </label>
          <input
            type="text"
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-hidden focus:border-amber-500 text-sm font-semibold placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all"
            value={categoryForm.name}
            placeholder="e.g. Burgers, Pizzas, Cold Drinks..."
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, name: e.target.value })
            }
          />
        </div>

        {/* Show on Hero Section Toggle */}
        <div
          className="mb-6 p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors hover:bg-amber-500/15"
          onClick={() =>
            setCategoryForm({
              ...categoryForm,
              show_on_hero: !categoryForm.show_on_hero,
            })
          }
        >
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>Show on Hero Section</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-black">
                3D Orbit
              </span>
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Featured in rotating circular showcase on customer homepage
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
            <input
              type="checkbox"
              checked={Boolean(categoryForm.show_on_hero)}
              onChange={() => {}}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 border-none cursor-pointer transition-all flex items-center justify-center gap-2 min-w-[120px]"
            onClick={handleLocalSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                <span>Saving...</span>
              </>
            ) : editingCategory ? (
              "Update Category"
            ) : (
              "Save Category"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;

