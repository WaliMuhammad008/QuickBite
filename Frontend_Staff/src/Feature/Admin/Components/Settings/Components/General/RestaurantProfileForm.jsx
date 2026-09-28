import React from "react";
import { FaCloudUploadAlt, FaTrash, FaMapMarkedAlt } from "react-icons/fa";
import RestaurantLocationPicker from "./RestaurantLocationPicker";

export default function RestaurantProfileForm({
  settings = {},
  setSettings,
  handleChange,
  handleLocationChange,
  logoFile,
  handleLogoChange,
  handleRemoveLogo,
  fileInputRef,
  phoneError = "",
  setPhoneError,
}) {
  return (
    <>
      {/* Store Logo Dropzone */}
      <div className="sm:col-span-2 space-y-2">
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block">
          Store Brand Logo
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 cursor-pointer relative overflow-hidden group flex items-center justify-center p-2 shadow-inner"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleLogoChange}
            />
            {logoFile || settings.store_logo ? (
              <>
                <img
                  src={
                    logoFile
                      ? URL.createObjectURL(logoFile)
                      : settings.store_logo
                  }
                  alt="Store Logo"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center text-white opacity-0 transition-opacity group-hover:opacity-100 p-2 text-center">
                  <FaCloudUploadAlt className="text-xl text-amber-400 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Change Logo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-slate-400 dark:text-neutral-500 p-2">
                <FaCloudUploadAlt className="text-2xl mb-1 text-amber-500" />
                <span className="text-[10px] font-bold">Upload Logo</span>
                <span className="text-[8px] text-slate-400 dark:text-neutral-600">PNG, JPG</span>
              </div>
            )}
          </div>

          {(logoFile || settings.store_logo) && (
            <button
              type="button"
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              onClick={handleRemoveLogo}
            >
              <FaTrash className="text-xs" />
              <span>Remove Logo</span>
            </button>
          )}
        </div>
      </div>

      {/* Restaurant Name */}
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Restaurant Legal Name *
        </label>
        <input
          type="text"
          name="store_name"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          value={settings.store_name}
          onChange={handleChange}
        />
      </div>

      {/* Contact Phone */}
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Contact Helpline Phone *
        </label>
        <input
          type="tel"
          name="contact_phone"
          maxLength="11"
          className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${
            phoneError ? "border-red-500" : "border-slate-300 dark:border-white/10"
          }`}
          value={settings.contact_phone}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            setSettings((prev) => ({ ...prev, contact_phone: val }));
            if (val.length > 0 && val.length < 11) {
              setPhoneError("Please enter all 11 digits.");
            } else if (val.length === 11 && !/^03\d{9}$/.test(val)) {
              setPhoneError("Number must start with 03 (e.g. 03001234567).");
            } else {
              setPhoneError("");
            }
          }}
          placeholder="03001234567"
        />
        {phoneError && (
          <span className="text-[10px] text-rose-500 font-bold block mt-1">
            {phoneError}
          </span>
        )}
      </div>

      {/* Admin Email */}
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Store Management Email *
        </label>
        <input
          type="email"
          name="admin_email"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          value={settings.admin_email}
          onChange={handleChange}
        />
      </div>

      {/* Physical Address & Map Location Picker */}
      <div className="sm:col-span-2 space-y-3 pt-3 border-t border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <label className="text-xs font-extrabold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <FaMapMarkedAlt className="text-amber-500" />
            <span>Physical Outlet Address & Store GPS Coordinates *</span>
          </label>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
            Used across the system for checkout distance calculation & takeaway counter pickup
          </span>
        </div>

        <input
          type="text"
          name="store_address"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          value={settings.store_address}
          onChange={handleChange}
          placeholder="e.g. 123 Food Street, Main Market, Gulberg, Lahore"
        />

        {/* Embedded Interactive Mapbox Picker */}
        <RestaurantLocationPicker
          storeLat={settings.store_lat}
          storeLng={settings.store_lng}
          storeAddress={settings.store_address}
          onLocationChange={handleLocationChange}
        />
      </div>
    </>
  );
}
