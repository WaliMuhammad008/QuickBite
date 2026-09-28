import React from "react";
import ProductImageDropzone from "./ProductImageDropzone";
import ProductMetadataFields from "./ProductMetadataFields";

export default function ProductBasicInfoForm({
  menuForm,
  setMenuForm,
  categories = [],
  fileInputRef,
  promoFileInputRef,
  handleImageChange,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 w-full">
      {/* LEFT COLUMN: Image Upload */}
      <div className="md:col-span-4 flex flex-col gap-4">
        <ProductImageDropzone
          menuForm={menuForm}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
        />
      </div>

      {/* RIGHT COLUMN: General Info & Metadata Controls */}
      <div className="md:col-span-8 flex flex-col gap-4">
        <div>
          <label className="text-xs font-extrabold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
            Item Title *
          </label>
          <input
            type="text"
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-hidden focus:border-amber-500 text-sm font-semibold placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all"
            value={menuForm.name}
            onChange={(e) =>
              setMenuForm({ ...menuForm, name: e.target.value })
            }
            placeholder="e.g. Gourmet Beef Burger, Margherita Pizza..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-extrabold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
              Category *
            </label>
            <select
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-hidden focus:border-amber-500 text-sm font-semibold cursor-pointer transition-all"
              value={menuForm.category}
              onChange={(e) =>
                setMenuForm({ ...menuForm, category: e.target.value })
              }
            >
              <option className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white" value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option
                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  key={cat.id}
                  value={cat.name}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
              Description (Optional)
            </label>
            <textarea
              rows={1}
              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-hidden focus:border-amber-500 text-sm resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all"
              value={menuForm.description || ""}
              onChange={(e) =>
                setMenuForm({ ...menuForm, description: e.target.value })
              }
              placeholder="Key ingredients, culinary notes..."
            />
          </div>
        </div>

        <ProductMetadataFields
          menuForm={menuForm}
          setMenuForm={setMenuForm}
          promoFileInputRef={promoFileInputRef}
        />
      </div>
    </div>
  );
}
