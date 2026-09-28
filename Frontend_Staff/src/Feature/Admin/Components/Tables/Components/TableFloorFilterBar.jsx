import React from "react";
import { FaPlus, FaGlobe, FaSave } from "react-icons/fa";

export default function TableFloorFilterBar({
  baseUrlInput,
  setBaseUrlInput,
  handleSaveBaseUrl,
  setIsModalOpen,
}) {
  return (
    <>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Tables & Dine-In QR Generator
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Manage restaurant tables and generate high-resolution QR codes for contactless Dine-In ordering.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-brand-cta px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none shrink-0 active:scale-95"
        >
          <FaPlus className="text-xs" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Base Domain Input Helper */}
      <div className="p-4 bg-[var(--panel-bg)] rounded-2xl border border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-sm shrink-0">
            <FaGlobe />
          </span>
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block">
              Dine-In QR Base Domain
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={baseUrlInput}
            onChange={(e) => setBaseUrlInput(e.target.value)}
            placeholder="e.g. https://bigbite.pk"
            className="flex-1 p-2.5 bg-[var(--input-bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl text-xs font-mono outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="button"
            onClick={handleSaveBaseUrl}
            className="btn-brand-cta px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none shrink-0 active:scale-95"
          >
            <FaSave className="text-xs" />
            <span>Save URL</span>
          </button>
        </div>
      </div>
    </>
  );
}
