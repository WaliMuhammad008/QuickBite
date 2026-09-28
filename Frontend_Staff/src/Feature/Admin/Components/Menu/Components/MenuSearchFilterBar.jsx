import React from "react";
import { FaPlus, FaHamburger, FaList, FaLayerGroup } from "react-icons/fa";

export default function MenuSearchFilterBar({
  activeTab,
  setActiveTab,
  onAddProduct,
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[var(--admin-border,rgba(255,255,255,0.06))] pb-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
          <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
            Menu Management
          </h2>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar w-full sm:w-auto mt-3">
          <div className="inline-flex bg-slate-100 dark:bg-[#202020] border border-slate-200/80 dark:border-white/[0.06] rounded-full p-1 gap-1 shadow-sm">
            <button
              type="button"
              className={`py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-2 font-bold transition-all text-xs border-none whitespace-nowrap shrink-0 ${
                activeTab === "items"
                  ? "btn-brand-cta !rounded-full"
                  : "bg-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("items")}
            >
              <FaHamburger className="text-xs" />
              <span>Menu Items</span>
            </button>
            <button
              type="button"
              className={`py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-2 font-bold transition-all text-xs border-none whitespace-nowrap shrink-0 ${
                activeTab === "categories"
                  ? "btn-brand-cta !rounded-full"
                  : "bg-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("categories")}
            >
              <FaList className="text-xs" />
              <span>Explore Categories</span>
            </button>
            <button
              type="button"
              className={`py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-2 font-bold transition-all text-xs border-none whitespace-nowrap shrink-0 ${
                activeTab === "addongroups"
                  ? "btn-brand-cta !rounded-full"
                  : "bg-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("addongroups")}
            >
              <FaLayerGroup className="text-xs" />
              <span>Addon Groups</span>
            </button>
          </div>
        </div>
      </div>
      {activeTab === "items" && (
        <button
          type="button"
          className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none shrink-0 active:scale-95"
          onClick={onAddProduct}
        >
          <FaPlus className="text-xs" />
          <span>Add Product</span>
        </button>
      )}
    </div>
  );
}
