import React from "react";

export default function SocialLinksSettings({
  settings = {},
  handleChange,
  errors = {},
}) {
  return (
    <>
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Facebook URL
        </label>
        <input
          type="text"
          className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${
            errors.footer_facebook
              ? "border-red-500"
              : "border-slate-200 dark:border-neutral-700"
          }`}
          name="footer_facebook"
          value={settings.footer_facebook}
          onChange={handleChange}
          placeholder="https://facebook.com/..."
        />
        {errors.footer_facebook && (
          <span className="text-rose-500 text-xs mt-1 block font-bold">
            {errors.footer_facebook}
          </span>
        )}
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Twitter URL
        </label>
        <input
          type="text"
          className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${
            errors.footer_twitter
              ? "border-red-500"
              : "border-slate-200 dark:border-neutral-700"
          }`}
          name="footer_twitter"
          value={settings.footer_twitter}
          onChange={handleChange}
          placeholder="https://twitter.com/..."
        />
        {errors.footer_twitter && (
          <span className="text-rose-500 text-xs mt-1 block font-bold">
            {errors.footer_twitter}
          </span>
        )}
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Instagram URL
        </label>
        <input
          type="text"
          className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${
            errors.footer_instagram
              ? "border-red-500"
              : "border-slate-200 dark:border-neutral-700"
          }`}
          name="footer_instagram"
          value={settings.footer_instagram}
          onChange={handleChange}
          placeholder="https://instagram.com/..."
        />
        {errors.footer_instagram && (
          <span className="text-rose-500 text-xs mt-1 block font-bold">
            {errors.footer_instagram}
          </span>
        )}
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          YouTube URL
        </label>
        <input
          type="text"
          className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${
            errors.footer_youtube
              ? "border-red-500"
              : "border-slate-200 dark:border-neutral-700"
          }`}
          name="footer_youtube"
          value={settings.footer_youtube}
          onChange={handleChange}
          placeholder="https://youtube.com/..."
        />
        {errors.footer_youtube && (
          <span className="text-rose-500 text-xs mt-1 block font-bold">
            {errors.footer_youtube}
          </span>
        )}
      </div>
    </>
  );
}
