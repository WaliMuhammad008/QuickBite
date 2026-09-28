import React from "react";
import { FaChevronDown, FaCheck, FaPlus } from "react-icons/fa";

export default function ItemAddonsPicker({
  mappedAddonGroups = [],
  openSections = {},
  toggleSection,
  selectedUpsells = [],
  toggleMappedAddon,
  getCategoryIcon,
}) {
  if (!mappedAddonGroups || mappedAddonGroups.length === 0) return null;

  return (
    <>
      {mappedAddonGroups.map((group) => {
        const sectionKey = `group_${group.id || group.name}`;
        const isSectionOpen = openSections[sectionKey] ?? true;
        const isSingle = group.type === "single_choice";
        const groupItems = Array.isArray(group.items) ? group.items : [];

        if (groupItems.length === 0) return null;

        const groupKey = (group.group_id || group.name || "").toLowerCase();
        const groupTitle =
          group.group_title ||
          group.title ||
          (groupKey.includes("drink")
            ? "COMPLETE WITH A DRINK"
            : groupKey.includes("pair") || groupKey.includes("perfect")
              ? "PERFECT PAIRINGS"
              : groupKey.includes("sauc") || groupKey.includes("dip")
                ? "ADD SOME DIPS"
                : group.name);

        const groupSubtitle =
          group.subtitle ||
          group.custom_label ||
          (isSingle ? "Choose 1 option" : "Select any options");

        return (
          <div
            key={group.id || group.name}
            className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300"
          >
            <button
              type="button"
              onClick={() => toggleSection(sectionKey)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
            >
              <div className="flex items-center gap-2.5">
                {getCategoryIcon && getCategoryIcon(group.group_id || group.name)}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                    {groupTitle}
                  </h4>
                  <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                    {groupSubtitle}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    group.is_required
                      ? "bg-red-600/10 text-red-600 dark:bg-red-600/20 font-bold"
                      : "bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {group.is_required ? "Required" : "Optional"}
                </span>
                <FaChevronDown
                  className={`text-xs text-gray-400 transition-transform duration-300 ${
                    isSectionOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isSectionOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0 pointer-events-none"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-gray-200/50 dark:border-neutral-800/80">
                  {groupItems.map((addonItem) => {
                    const isSelected = Boolean(
                      selectedUpsells.find(
                        (u) =>
                          u.id === addonItem.id && u.addon_group === group.name
                      )
                    );
                    const price = parseFloat(addonItem.price || 0);

                    return (
                      <button
                        key={addonItem.id}
                        type="button"
                        onClick={() => toggleMappedAddon(group, addonItem)}
                        className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-400/20 border-amber-400 text-gray-950 dark:text-white shadow-xs ring-1 ring-amber-400"
                            : "bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:border-amber-400"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1 gap-1">
                          <span className="text-xs font-bold truncate">
                            {addonItem.item_name || addonItem.name}
                          </span>
                          {isSelected ? (
                            <FaCheck className="text-[10px] text-amber-500 shrink-0" />
                          ) : isSingle ? (
                            <span className="w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-neutral-600 shrink-0" />
                          ) : (
                            <FaPlus className="text-[10px] text-gray-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-between w-full mt-1">
                          {addonItem.category && (
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-gray-400 dark:text-neutral-500 truncate max-w-[80px]">
                              {addonItem.category}
                            </span>
                          )}
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif] ml-auto">
                            +Rs {price}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
