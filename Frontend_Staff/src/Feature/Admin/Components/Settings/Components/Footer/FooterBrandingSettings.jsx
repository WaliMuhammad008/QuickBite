import React from "react";

export default function FooterBrandingSettings({
  settings = {},
  handleChange,
  errors = {},
}) {
  return (
    <>
      <div className="sm:col-span-2">
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Footer Tagline
        </label>
        <textarea
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 resize-y"
          name="footer_tagline"
          value={settings.footer_tagline}
          onChange={handleChange}
          placeholder="E.g. Fresh Food, Delivered Hot & Fast..."
          rows="3"
        />
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Contact Phone
        </label>
        <input
          type="text"
          className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${
            errors.footer_phone
              ? "border-red-500"
              : "border-slate-200 dark:border-neutral-700"
          }`}
          name="footer_phone"
          value={settings.footer_phone}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9\+\-\s\(\)]/g, "");
            handleChange({ target: { name: "footer_phone", value: val } });
          }}
          placeholder="+1 234 567 8900"
        />
        {errors.footer_phone && (
          <span className="text-rose-500 text-xs mt-1 block font-bold">
            {errors.footer_phone}
          </span>
        )}
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Contact Email
        </label>
        <input
          type="email"
          className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${
            errors.footer_email
              ? "border-red-500"
              : "border-slate-200 dark:border-neutral-700"
          }`}
          name="footer_email"
          value={settings.footer_email}
          onChange={handleChange}
          placeholder="support@bigbite.com"
        />
        {errors.footer_email && (
          <span className="text-rose-500 text-xs mt-1 block font-bold">
            {errors.footer_email}
          </span>
        )}
      </div>
    </>
  );
}
