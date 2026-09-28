import React from "react";

export default function OperationalHoursForm({ settings = {}, handleChange }) {
  return (
    <>
      {/* Opening Time */}
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Opening Time
        </label>
        <div className="relative flex items-center">
          <input
            type="time"
            name="restaurant_open_time"
            value={settings.restaurant_open_time}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Closing Time */}
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Closing Time
        </label>
        <div className="relative flex items-center">
          <input
            type="time"
            name="restaurant_close_time"
            value={settings.restaurant_close_time}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>
    </>
  );
}
