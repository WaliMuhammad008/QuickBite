import React from "react";
import { FaCalendarAlt, FaCheckDouble, FaSave, FaSpinner } from "react-icons/fa";

export default function AttendanceHeaderControls({
  selectedDate,
  setSelectedDate,
  markAllPresent,
  handleSave,
  isSubmitting,
}) {
  return (
    <div className="admin-card-surface flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-4 rounded-2xl shadow-sm">
      {/* Date Selector */}
      <div className="flex items-center gap-2.5 text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
        <FaCalendarAlt className="text-amber-500 text-sm" />
        <span>Attendance Date:</span>
        <input
          type="date"
          className="bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-amber-500 cursor-pointer"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          onClick={markAllPresent}
        >
          <FaCheckDouble className="text-amber-500 text-xs" />
          <span>Mark All Present</span>
        </button>
        <button
          type="button"
          className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none active:scale-95 disabled:opacity-50"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : (
            <FaSave className="text-xs" />
          )}
          <span>Save Sheet</span>
        </button>
      </div>
    </div>
  );
}
