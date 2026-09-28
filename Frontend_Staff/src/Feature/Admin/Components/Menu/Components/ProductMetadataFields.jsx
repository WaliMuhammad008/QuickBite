import React from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function ProductMetadataFields({
  menuForm,
  setMenuForm,
  promoFileInputRef,
}) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
      <h4 className="m-0 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
        Badges & Visibility
      </h4>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/50 hover:border-amber-500/50 transition-colors shadow-sm">
          <input
            type="checkbox"
            checked={menuForm.isAvailable !== false}
            onChange={(e) =>
              setMenuForm({ ...menuForm, isAvailable: e.target.checked })
            }
            className="w-4 h-4 cursor-pointer accent-amber-500 rounded"
          />
          <span>Available in Store</span>
        </label>

        <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/50 hover:border-amber-500/50 transition-colors shadow-sm">
          <input
            type="checkbox"
            checked={menuForm.isTopDeal || false}
            onChange={(e) =>
              setMenuForm({ ...menuForm, isTopDeal: e.target.checked })
            }
            className="w-4 h-4 cursor-pointer accent-amber-500 rounded"
          />
          <span>Mark as Top Deal</span>
        </label>

        <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/50 hover:border-amber-500/50 transition-colors shadow-sm">
          <input
            type="checkbox"
            checked={menuForm.isBestSeller || false}
            onChange={(e) =>
              setMenuForm({ ...menuForm, isBestSeller: e.target.checked })
            }
            className="w-4 h-4 cursor-pointer accent-amber-500 rounded"
          />
          <span>Mark as Best Seller</span>
        </label>
        
      </div>

      {/* Spice Selection Control */}
      <div className="my-1 border-b border-zinc-200 dark:border-zinc-800" />
      <h4 className="m-0 text-[11px] uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
        Customizer Controls
      </h4>

      <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/50 hover:border-amber-500/50 transition-colors shadow-sm">
        <input
          type="checkbox"
          checked={menuForm.has_spice_option !== false && menuForm.has_spice_option !== 0}
          onChange={(e) =>
            setMenuForm({ ...menuForm, has_spice_option: e.target.checked })
          }
          className="w-4 h-4 cursor-pointer accent-amber-500 rounded"
        />
        <span>Enable Spice Level Selection (Mild / Medium / Hot)</span>
      </label>

      {/* Promo Banner Feature */}
      <div className="my-1 border-b border-zinc-200 dark:border-zinc-800" />
      <label
        className={`flex items-center gap-2.5 text-xs font-semibold cursor-pointer p-2.5 rounded-xl transition-all shadow-sm ${
          menuForm.is_featured_banner
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/40"
            : "bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/50 hover:border-amber-500/50"
        }`}
      >
        <input
          type="checkbox"
          checked={menuForm.is_featured_banner || false}
          onChange={(e) =>
            setMenuForm({
              ...menuForm,
              is_featured_banner: e.target.checked,
            })
          }
          className="w-4 h-4 cursor-pointer accent-amber-500 rounded"
        />
        <span>Homepage Hero Banner</span>
      </label>

      {menuForm.is_featured_banner && (
        <div className="flex flex-col gap-3 p-3.5 bg-zinc-100/70 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 mt-1">
          <label className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
            Wide Promo Banner (1200x500px)
          </label>
          <div
            onClick={() => promoFileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl h-24 flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-white dark:bg-zinc-900/60 hover:border-amber-500 group transition-colors"
          >
            <input
              type="file"
              accept="image/*"
              ref={promoFileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file)
                  setMenuForm({
                    ...menuForm,
                    promo_banner_image: file,
                  });
              }}
            />
            {menuForm.promo_banner_image ? (
              <>
                <img
                  src={
                    typeof menuForm.promo_banner_image === "string"
                      ? menuForm.promo_banner_image
                      : URL.createObjectURL(menuForm.promo_banner_image)
                  }
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold bg-black/50 px-3 py-1.5 rounded-lg">
                    Change Banner
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-zinc-500 dark:text-zinc-400 text-center p-2">
                <FaCloudUploadAlt className="text-xl text-amber-500 mb-1" />
                <span className="text-xs font-semibold">
                  Upload Wide Banner
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">PNG, JPG or WEBP</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold block mb-1 uppercase tracking-wider">
              Banner Sort Order (0 = First)
            </label>
            <input
              type="number"
              min="0"
              value={menuForm.banner_order ?? 0}
              onChange={(e) =>
                setMenuForm({
                  ...menuForm,
                  banner_order: e.target.value,
                })
              }
              className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
