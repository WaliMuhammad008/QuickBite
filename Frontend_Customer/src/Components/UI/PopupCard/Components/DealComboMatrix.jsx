import React from "react";
import { FaUtensils, FaGlassMartiniAlt } from "react-icons/fa";
import {
  DEFAULT_DRINK_FLAVORS,
  DEFAULT_PIZZA_FLAVORS,
  DEFAULT_FRIES_FLAVORS,
} from "../comboHelpers";
import ComboTierHeader from "./ComboTierHeader";
import ComboIncludedList from "./ComboIncludedList";
import ComboChoiceItemList from "./ComboChoiceItemList";

// Helper to get emoji/icon for choice group
function getChoiceIcon(groupName = "", item = {}) {
  const g = (groupName || "").toLowerCase();
  const n = (item.name || "").toLowerCase();
  if (g.includes("pizza") || n.includes("pizza")) return "🍕";
  if (g.includes("fries") || n.includes("fries") || n.includes("potato")) return "🍟";
  if (g.includes("drink") || n.includes("drink") || n.includes("ml") || n.includes("coke")) {
    return <FaGlassMartiniAlt className="text-red-500 text-sm" />;
  }
  if (g.includes("burger") || n.includes("burger")) return "🍔";
  if (g.includes("wrap") || n.includes("wrap") || n.includes("shawarma")) return "🌯";
  return <FaUtensils className="text-amber-500 text-sm" />;
}

// Helper to get column class
function getColumnsClass(optionsCount) {
  if (optionsCount <= 3) return "grid-cols-3";
  if (optionsCount <= 4) return "grid-cols-2";
  return "grid-cols-2 sm:grid-cols-3";
}

export default function DealComboMatrix({
  isDeal = false,
  comboItems = [],
  openSections = {},
  toggleSection,
  // Legacy props (still supported for backward compatibility)
  hasPizzaInCombo = false,
  selectedPizza = "Chicken Tikka",
  setSelectedPizza,
  hasFriesInCombo = false,
  selectedFries = "Masala Fries",
  setSelectedFries,
  hasDrinkInCombo = false,
  selectedDrink = "Coca-Cola",
  setSelectedDrink,
  // Dynamic selections map: { [comboItemId]: selectedFlavorName }
  dynamicSelections = {},
  setDynamicSelection,
}) {
  if (!isDeal || comboItems.length === 0) return null;

  // Identify customizable combo slots
  const customizableSlots = comboItems.filter(c => c.is_customizable && Array.isArray(c.options) && c.options.length > 0);

  // Helper to get/set selection for a slot
  const getSelection = (slot) => {
    // Check dynamic selections first
    if (dynamicSelections[slot.id] !== undefined) return dynamicSelections[slot.id];
    // Legacy fallback
    if (slot.isPizza) return selectedPizza;
    if (slot.isFries) return selectedFries;
    if (slot.isDrink) return selectedDrink;
    // Auto-select first available option
    const firstAvail = slot.options.find(o => typeof o === "string" || o.inStock !== false);
    return firstAvail ? (typeof firstAvail === "string" ? firstAvail : firstAvail.name) : "";
  };

  const handleSelect = (slot, flavorName) => {
    // Use dynamic setter if available
    if (setDynamicSelection) {
      setDynamicSelection(slot.id, flavorName);
    }
    // Also update legacy state for backward compat
    if (slot.isPizza && setSelectedPizza) setSelectedPizza(flavorName);
    if (slot.isFries && setSelectedFries) setSelectedFries(flavorName);
    if (slot.isDrink && setSelectedDrink) setSelectedDrink(flavorName);
  };

  // Section key for each slot
  const getSectionKey = (slot) => {
    if (slot.isPizza) return "pizzaFlavor";
    if (slot.isFries) return "friesFlavor";
    if (slot.isDrink) return "drinkFlavor";
    return `choice_${slot.id}`;
  };

  return (
    <div className="space-y-3">
      {/* 1. ACCORDION: COMBO INCLUDES */}
      <div className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
        <ComboTierHeader
          icon={<FaUtensils className="text-amber-500 text-sm" />}
          title={`Combo Includes (${comboItems.length} Items)`}
          subtitle="Bundled dishes & sides in this package"
          badgeText="Included"
          badgeColorClass="text-amber-600 dark:text-amber-400 bg-amber-400/10"
          isOpen={openSections.comboIncludes}
          onToggle={() => toggleSection("comboIncludes")}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            openSections.comboIncludes
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <ComboIncludedList comboItems={comboItems} />
        </div>
      </div>

      {/* 2. DYNAMIC CHOICE ACCORDIONS (Pizza, Fries, Drinks, or any customizable slot) */}
      {customizableSlots.map((slot) => {
        const sectionKey = getSectionKey(slot);
        const selectedValue = getSelection(slot);
        const icon = getChoiceIcon(slot.choice_group_name, slot);
        const isOpen = openSections[sectionKey] !== false; // default open

        return (
          <div
            key={slot.id}
            className="bg-gray-50 dark:bg-neutral-900/70 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300"
          >
            <ComboTierHeader
              icon={icon}
              title={slot.choice_group_name || `Choose ${slot.name} Option`}
              subtitle={
                <>
                  Selected:{" "}
                  <span className="font-bold text-amber-500">{selectedValue || "None"}</span>
                </>
              }
              isOpen={isOpen}
              onToggle={() => toggleSection(sectionKey)}
            />

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0 pointer-events-none"
              }`}
            >
              <ComboChoiceItemList
                flavors={slot.options}
                selectedFlavor={selectedValue}
                onSelectFlavor={(name) => handleSelect(slot, name)}
                columnsClass={getColumnsClass(slot.options.length)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

