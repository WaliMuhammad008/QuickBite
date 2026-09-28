import React from "react";
import { FaCloudUploadAlt, FaImage } from "react-icons/fa";

export default function DealImageUploader({
  fileInputRef,
  handleLogoChange,
  logoPreview = "",
  isFeaturedBanner = false,
  setIsFeaturedBanner,
  promoFileInputRef,
  handlePromoBannerChange,
  promoBannerPreview = "",
  bannerOrder = 0,
  setBannerOrder,
}) {
  return (
    <div className="space-y-4">
      {/* Image Upload Dropzone */}
      <div>
        <label className="text-xs text-slate-600 dark:text-neutral-400 font-extrabold uppercase tracking-wider mb-1.5 block">
          Deal Image
        </label>
        <div
          className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl h-40 flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-slate-50 dark:bg-white/[0.02] hover:border-amber-500 hover:bg-amber-500/5 transition-all group shadow-inner"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleLogoChange}
          />
          {logoPreview ? (
            <>
              <img
                src={logoPreview}
                alt="Deal Preview"
                className="w-full h-full object-contain p-2"
              />
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCloudUploadAlt size={28} className="text-amber-400" />
                <span className="text-xs font-bold mt-1.5">Change Image</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 dark:text-neutral-400 p-3 text-center">
              <FaCloudUploadAlt className="text-2xl text-amber-500 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <p className="m-0 font-bold text-xs text-slate-900 dark:text-white">
                Click to upload deal photo
              </p>
              <span className="text-[10px] mt-0.5 text-slate-500 dark:text-neutral-400">
                PNG or JPG up to 5MB
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Promo Banner Feature */}
      <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] space-y-2.5">
        <label
          className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${
            isFeaturedBanner
              ? "text-amber-600 dark:text-amber-400"
              : "text-slate-600 dark:text-neutral-400"
          }`}
        >
          <input
            type="checkbox"
            checked={isFeaturedBanner}
            onChange={(e) => setIsFeaturedBanner(e.target.checked)}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
          <span>Feature as Homepage Wide Promo Banner</span>
        </label>

        {isFeaturedBanner && (
          <div className="pt-2.5 border-t border-slate-200 dark:border-white/5 space-y-2.5">
            <div
              onClick={() => promoFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl h-24 flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-white dark:bg-black/30 hover:border-amber-500 group"
            >
              <input
                type="file"
                accept="image/*"
                ref={promoFileInputRef}
                className="hidden"
                onChange={handlePromoBannerChange}
              />
              {promoBannerPreview ? (
                <img
                  src={promoBannerPreview}
                  alt="Promo Banner Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2">
                  <FaImage className="text-lg text-amber-500 dark:text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-neutral-300 block">
                    Upload 1200x500 Wide Banner
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                Banner Sort Order (0 = First)
              </label>
              <input
                type="number"
                min="0"
                value={bannerOrder}
                onChange={(e) => setBannerOrder(e.target.value)}
                className="w-full p-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
