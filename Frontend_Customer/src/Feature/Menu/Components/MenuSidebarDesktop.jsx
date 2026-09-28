import React from "react";
import { getCategoryIcon } from "./Sidebar";

export default function MenuSidebarDesktop({
  isDesktopSidebarVisible,
  categories = [],
  activeCategory,
  scrollToCategory,
}) {
  return (
    <aside
      className={`hidden lg:block shrink-0 lg:sticky lg:top-24 lg:self-start overflow-hidden transition-all duration-300 ease-in-out z-20 ${
        isDesktopSidebarVisible
          ? "w-52 lg:w-56 xl:w-64 opacity-100 translate-x-0 mr-4 xl:mr-6"
          : "w-0 opacity-0 -translate-x-6 mr-0 pointer-events-none"
      }`}
    >
      <div className="w-52 lg:w-56 xl:w-64 max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden custom-sidebar-scroll rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-3 sm:p-4 shadow-xs">
        <div className="w-full min-w-0 overflow-x-hidden">
          <div className="pb-2.5 mb-2.5 border-b border-gray-100 dark:border-neutral-800">
            <h3 className="font-['Oswald',sans-serif] text-base font-black text-gray-900 dark:text-white uppercase tracking-wide m-0">
              Categories
            </h3>
          </div>

          <div className="flex flex-col gap-1 overflow-x-hidden">
            {categories.map((cat, idx) => {
              const catName = typeof cat === "string" ? cat : cat?.name || "";
              const catKey =
                typeof cat === "string"
                  ? cat
                  : cat?.id || cat?.name || `cat-${idx}`;
              if (!catName) return null;

              const isActive =
                (activeCategory || "").toLowerCase() === catName.toLowerCase();

              return (
                <div key={catKey} className="overflow-x-hidden">
                  <button
                    type="button"
                    className={`flex items-center gap-2.5 w-full py-2 px-2.5 rounded-xl cursor-pointer transition-all duration-200 border-none text-left font-['Oswald',sans-serif] uppercase text-xs sm:text-sm ${
                      isActive
                        ? "bg-amber-400 text-gray-950 font-bold shadow-xs"
                        : "bg-transparent text-gray-700 dark:text-neutral-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800/60 font-medium"
                    }`}
                    onClick={() => scrollToCategory(catName)}
                  >
                    <span className="text-sm flex-shrink-0">
                      {getCategoryIcon(catName)}
                    </span>
                    <span className="truncate tracking-wide">{catName}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
