import React from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function TableFormModal({
  isModalOpen,
  setIsModalOpen,
  handleAddTable,
  newTableName,
  setNewTableName,
  newTableCapacity,
  setNewTableCapacity,
}) {
  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative animate-slide-up text-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
            <h3 className="m-0 text-base sm:text-lg font-black text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              Add Restaurant Table
            </h3>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            onClick={() => setIsModalOpen(false)}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleAddTable} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              Table Name or Number *
            </label>
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="e.g. Table 01, VIP Terrace A"
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              Seating Capacity (Guests)
            </label>
            <select
              value={newTableCapacity}
              onChange={(e) => setNewTableCapacity(e.target.value)}
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="2">2 Persons (Couple Table)</option>
              <option value="4">4 Persons (Standard Table)</option>
              <option value="6">6 Persons (Family Table)</option>
              <option value="8">8 Persons (Large Group)</option>
              <option value="12">12+ Persons (VIP Lounge)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 border-none cursor-pointer flex items-center gap-2 transition-all"
            >
              <FaPlus className="text-xs" />
              <span>Create Table</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
