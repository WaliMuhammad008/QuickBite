import React, { useState } from "react";
import DealMaker from "./DealMaker";
import DealList from "./DealList";
import { LuLayers, LuCirclePlus } from "react-icons/lu";
import { FaTag } from "react-icons/fa";

const DealsDashboard = () => {
  const [activeSubTab, setActiveSubTab] = useState("manage");
  const [dealToEdit, setDealToEdit] = useState(null);

  const handleEditDeal = (deal) => {
    setDealToEdit(deal);
    setActiveSubTab("create");
  };

  const clearEdit = () => {
    setDealToEdit(null);
    setActiveSubTab("manage");
  };

  return (
    <div className="w-full space-y-5 animate-slide-up">
      {/* Header & Sub-Tabs Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Combos & Deals Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Build bundled food combos, dynamic discount packages, and time-restricted offers.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] p-1 rounded-2xl shadow-sm gap-1">
          <button
            type="button"
            onClick={clearEdit}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none ${
              activeSubTab === "manage"
                ? "bg-amber-400/90 dark:bg-amber-500 text-neutral-950 shadow-sm"
                : "bg-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <LuLayers className="w-3.5 h-3.5" />
            <span>Manage Deals</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDealToEdit(null);
              setActiveSubTab("create");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none ${
              activeSubTab === "create"
                ? "bg-amber-400/90 dark:bg-amber-500 text-neutral-950 shadow-sm"
                : "bg-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <LuCirclePlus className="w-3.5 h-3.5" />
            <span>{dealToEdit ? "Edit Deal" : "Create New Deal"}</span>
          </button>
        </div>
      </div>

      {/* Content View */}
      {activeSubTab === "manage" ? (
        <DealList onEdit={handleEditDeal} />
      ) : (
        <DealMaker editDeal={dealToEdit} onSuccess={clearEdit} />
      )}
    </div>
  );
};

export default DealsDashboard;
