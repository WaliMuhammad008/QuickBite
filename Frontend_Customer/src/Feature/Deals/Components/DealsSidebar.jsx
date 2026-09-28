import React from "react";
import { FaTimes, FaFire, FaHamburger, FaUsers, FaUser, FaLayerGroup } from "react-icons/fa";
import { LuPizza, LuSparkles, LuDrumstick } from "react-icons/lu";

export const getDealCategoryIcon = (category = "") => {
  const name = category.toLowerCase();
  if (name.includes("all")) return <FaLayerGroup className="text-lg" />;
  if (name.includes("solo") || name.includes("single"))
    return <FaUser className="text-lg" />;
  if (name.includes("duo") || name.includes("couple"))
    return <FaUsers className="text-lg" />;
  if (name.includes("family") || name.includes("feast") || name.includes("box"))
    return <LuDrumstick className="text-lg" />;
  if (name.includes("pizza")) return <LuPizza className="text-lg" />;
  if (name.includes("burger")) return <FaHamburger className="text-lg" />;
  if (name.includes("saver") || name.includes("popular"))
    return <LuSparkles className="text-lg" />;
  return <FaFire className="text-lg" />;
};

const DealsSidebar = ({
  categories = [],
  activeCategory = "All Deals",
  onSelectCategory,
  onClose,
  isMobileDrawer = false,
  isOpen = false,
}) => {
  const renderList = (isDrawer) =>
    categories.map((cat) => {
      const isActive = activeCategory === cat;

      const desktopBtnClass = `flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl cursor-pointer transition-all duration-200 text-left border-none ${
        isActive
          ? "bg-amber-100/90 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold border-l-4 border-amber-400 shadow-xs"
          : "bg-transparent text-gray-700 dark:text-neutral-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800/60 font-medium"
      }`;

      const mobileBtnClass = `flex items-center gap-3.5 w-full p-4 text-[15px] rounded-2xl cursor-pointer transition-all duration-200 border-none ${
        isActive
          ? "bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20 border-l-4 border-amber-500"
          : "bg-gray-50 dark:bg-neutral-800/80 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 font-medium"
      }`;

      return (
        <button
          key={cat}
          type="button"
          className={isDrawer ? mobileBtnClass : desktopBtnClass}
          onClick={() => {
            onSelectCategory(cat);
            if (isDrawer && onClose) onClose();
          }}
        >
          <span
            className={`flex-shrink-0 transition-colors ${
              isActive
                ? isDrawer
                  ? "text-neutral-950"
                  : "text-amber-500"
                : "text-gray-400 dark:text-neutral-500"
            }`}
          >
            {getDealCategoryIcon(cat)}
          </span>
          <span className="truncate tracking-wide font-['Oswald',sans-serif] uppercase text-xs sm:text-sm">
            {cat}
          </span>
        </button>
      );
    });

  // 📱 Mobile Drawer Modal View
  if (isMobileDrawer) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={onClose}
        />

        {/* Drawer */}
        <div className="relative ml-auto w-[85%] max-w-sm h-full bg-white dark:bg-neutral-900 p-6 shadow-2xl overflow-y-auto flex flex-col justify-between z-10 animate-slide-left">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800 mb-5">
              <div>
                <h3 className="text-lg font-black font-['Oswald',sans-serif] uppercase tracking-wide text-gray-900 dark:text-white m-0">
                  Filter Deals
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 m-0 mt-0.5">
                  Select a category to filter
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer border-none"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* List without counters */}
            <nav className="space-y-2.5">{renderList(true)}</nav>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer border-none shadow-md"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🖥️ Desktop Sidebar View
  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl p-3.5 sm:p-4 border border-gray-200 dark:border-neutral-800 shadow-xs">
      <div className="pb-2.5 mb-2.5 border-b border-gray-100 dark:border-neutral-800/80">
        <h4 className="text-xs font-black text-gray-400 dark:text-neutral-500 tracking-wider uppercase m-0">
          CATEGORIES
        </h4>
      </div>
      <nav className="space-y-1">{renderList(false)}</nav>
    </div>
  );
};

export default DealsSidebar;
