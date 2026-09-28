import React from "react";
import { FaPlus, FaEdit, FaTrash, FaUtensils } from "react-icons/fa";
import { resolveImageUrl } from "../../../../../utils/imageOptimizer";

export default function MenuCategoryTabs({
  categories = [],
  menuItems = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4.5 pt-4 animate-slide-up">
      {/* 1. Add Category Action Card */}
      <div
        className="border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/[0.03] hover:bg-amber-500/[0.08] rounded-3xl p-4 flex flex-col items-center justify-center min-h-[190px] cursor-pointer group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg shadow-sm"
        onClick={onAddCategory}
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 flex items-center justify-center text-base shadow-md shadow-amber-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform mb-3">
          <FaPlus />
        </div>
        <span className="font-['Oswald',sans-serif] font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider text-center">
          Add Category
        </span>
        <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold mt-1 text-center">
          New catalog group
        </span>
      </div>

      {/* 2. Category Cards */}
      {categories.map((cat) => {
        const catItemsCount = menuItems.filter(
          (m) =>
            String(m.category || "")
              .toLowerCase()
              .trim() ===
            String(cat.name || "")
              .toLowerCase()
              .trim()
        ).length;

        const imgSrc = resolveImageUrl(cat.img, 400);

        return (
          <div
            key={cat.id}
            className="group relative rounded-3xl p-3 bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-xl hover:border-amber-500/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Stage with Food Image & Soft Ambient Glow */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-amber-500/[0.06] via-slate-100/60 to-slate-200/40 dark:from-amber-500/[0.08] dark:via-neutral-900/90 dark:to-neutral-950 flex items-center justify-center p-3 border border-slate-100 dark:border-white/5">
              {/* Featured on Hero Badge */}
              {Boolean(cat.show_on_hero == 1 || cat.show_on_hero === true || cat.show_on_hero === "1") && (
                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-sm shadow-amber-500/30">
                    ★ Hero
                  </span>
                </div>
              )}

              {/* Action Buttons (Hover overlay) */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(cat);
                  }}
                  className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center cursor-pointer border-none shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
                  title="Edit Category"
                >
                  <FaEdit className="text-[10px]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(cat.id);
                  }}
                  className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center cursor-pointer border-none shadow-md shadow-rose-500/20 active:scale-95 transition-transform"
                  title="Delete Category"
                >
                  <FaTrash className="text-[10px]" />
                </button>
              </div>

              {/* Crisp Vibrant Food Image without washed-out fog */}
              <img
                src={imgSrc}
                alt={cat.name}
                className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 group-hover:rotate-1 transition-all duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/200?text=No+Image";
                }}
              />
            </div>

            {/* Bottom Category Name Footer */}
            <div className="pt-3 pb-1 px-1 text-center">
              <h3 className="m-0 font-['Oswald',sans-serif] font-black text-xs sm:text-sm md:text-base text-slate-900 dark:text-white uppercase tracking-wide truncate group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                {cat.name}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}

