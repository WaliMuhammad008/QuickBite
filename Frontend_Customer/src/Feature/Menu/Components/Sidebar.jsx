import React from "react";
import { FaTimes, FaHamburger } from "react-icons/fa";
import {
  LuDrumstick,
  LuPizza,
  LuCupSoda,
  LuFlame,
  LuUtensils,
  LuSoup,
  LuSparkles,
  LuSandwich,
} from "react-icons/lu";

export const getCategoryIcon = (categoryName = "") => {
  const name = categoryName.toLowerCase();
  if (
    name.includes("broast") ||
    name.includes("fried chicken") ||
    name.includes("chicken")
  ) {
    return <LuDrumstick className="text-base" />;
  }
  if (name.includes("sauce") || name.includes("sause") || name.includes("dip")) {
    return <LuSparkles className="text-base" />;
  }
  if (name.includes("shawarma") || name.includes("wrap")) {
    return <LuSandwich className="text-base" />;
  }
  if (name.includes("drink") || name.includes("beverage")) {
    return <LuCupSoda className="text-base" />;
  }
  if (name.includes("wing") || name.includes("grill")) {
    return <LuFlame className="text-base" />;
  }
  if (name.includes("pizza")) {
    return <LuPizza className="text-base" />;
  }
  if (name.includes("potato") || name.includes("fries")) {
    return <LuUtensils className="text-base" />;
  }
  if (name.includes("burger")) {
    return <FaHamburger className="text-base" />;
  }
  if (name.includes("pasta")) {
    return <LuSoup className="text-base" />;
  }
  return <LuUtensils className="text-base" />;
};

const Sidebar = ({
  isDesktop,
  isOpen,
  onClose,
  categories,
  activeCategory,
  expandedCategory,
  menuItems,
  onCategoryClick,
  onProductClick,
}) => {
  if (!Array.isArray(categories)) return null;

  const renderList = (isDesktopMode) =>
    categories.map((cat, idx) => {
      const catName = typeof cat === "string" ? cat : cat?.name || "";
      const catKey =
        typeof cat === "string" ? cat : cat?.id || cat?.name || `cat-${idx}`;
      if (!catName) return null;

      const isExpanded =
        (expandedCategory || "").toLowerCase() === catName.toLowerCase();
      const isActive =
        (activeCategory || "").toLowerCase() === catName.toLowerCase();
      const catItems = (menuItems || []).filter(
        (item) => (item.category || "").toLowerCase() === catName.toLowerCase()
      );

      const desktopBtnClass = `flex items-center gap-3 w-full px-3.5 py-2.5 text-sm rounded-xl cursor-pointer transition-all duration-200 text-left border-none overflow-x-hidden ${
        isActive
          ? "bg-amber-400/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-400 font-bold border-l-4 border-amber-400 shadow-xs"
          : "bg-transparent text-gray-600 dark:text-neutral-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800/60 font-medium"
      }`;

      const mobileBtnClass = `flex items-center gap-3 w-full p-3.5 text-sm rounded-xl cursor-pointer transition-all duration-200 border-none overflow-x-hidden ${
        isActive
          ? "bg-amber-400 text-gray-950 font-bold shadow-sm"
          : "bg-white dark:bg-neutral-800/80 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700"
      }`;

      return (
        <div key={catKey} className="flex flex-col overflow-x-hidden">
          <button
            className={isDesktopMode ? desktopBtnClass : mobileBtnClass}
            onClick={() => onCategoryClick(catName)}
          >
            <span
              className={`flex-shrink-0 transition-colors ${
                isActive
                  ? isDesktopMode
                    ? "text-amber-500"
                    : "text-gray-950"
                  : "text-gray-400 dark:text-neutral-500"
              }`}
            >
              {getCategoryIcon(catName)}
            </span>
            <span className="flex-1 truncate">{catName}</span>
          </button>

          {isExpanded && catItems.length > 0 && (
            <div className="flex flex-col pl-7 py-1.5 space-y-1.5 border-l-2 border-amber-400/30 ml-4 my-1 overflow-x-hidden">
              {catItems.map((item, itemIdx) => (
                <div
                  key={item.id || item.name || itemIdx}
                  className="text-xs text-gray-500 dark:text-neutral-400 font-medium cursor-pointer transition-all hover:text-amber-600 dark:hover:text-amber-400 hover:translate-x-1 py-0.5 truncate"
                  onClick={() => onProductClick(item.name)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });

  if (isDesktop) {
    return (
      <div className="w-64 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-neutral-800 rounded-3xl p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden custom-sidebar-scroll shadow-sm dark:shadow-none">
        <h3 className="font-['Oswald',sans-serif] text-lg font-black text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-neutral-800 pb-2.5 uppercase tracking-wide">
          Categories
        </h3>
        <div className="flex flex-col gap-1 overflow-x-hidden">
          {renderList(true)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed top-0 w-72 h-full bg-white dark:bg-[#18181b] z-[10001] transition-all duration-300 shadow-2xl flex flex-col border-r border-gray-200 dark:border-neutral-800 overflow-x-hidden ${
        isOpen ? "left-0" : "-left-full"
      }`}
    >
      <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex-shrink-0">
        <h3 className="m-0 text-gray-900 dark:text-white font-['Oswald',sans-serif] text-lg font-black uppercase tracking-wide">
          Categories
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-transparent border-none cursor-pointer"
        >
          <FaTimes className="text-base" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto overflow-x-hidden custom-sidebar-scroll flex flex-col gap-1.5 flex-1">
        {renderList(false)}
      </div>
    </div>
  );
};

export default Sidebar;