import React from "react";
import { FaChevronDown } from "react-icons/fa";

export default function ComboTierHeader({
  icon,
  title,
  subtitle,
  badgeText = "Free Choice",
  badgeColorClass = "text-red-500 bg-red-500/10",
  isOpen,
  onToggle,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
    >
      <div className="flex items-center gap-2.5">
        {typeof icon === "string" ? (
          <span className="text-base">{icon}</span>
        ) : (
          icon
        )}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
            {title}
          </h4>
          {subtitle && (
            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeColorClass}`}
        >
          {badgeText}
        </span>
        <FaChevronDown
          className={`text-xs text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>
    </button>
  );
}
