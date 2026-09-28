import { useEffect } from "react";
import { resolveImageUrl } from "../../../../utils/imageOptimizer";

export function usePopupCardValidation({
  image,
  item,
  title,
  closePopup,
  addToCart,
}) {
  // Body Scroll Lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow || "unset";
      document.body.style.paddingRight = originalPaddingRight || "unset";
    };
  }, []);

  const finalImage = resolveImageUrl(
    image || item?.image || item?.img || item?.image_url || item?.photo || "",
    800
  );

  const handleCloseModal = (e) => {
    if (e) e.stopPropagation();
    if (closePopup) closePopup();
    document.body.style.overflow = "auto";
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
  };

  const buildAndAddToCart = ({
    isDeal,
    comboItems,
    selectedUpsells = [],
    hasPizzaInCombo,
    selectedPizza,
    hasFriesInCombo,
    selectedFries,
    hasDrinkInCombo,
    selectedDrink,
    dynamicSelections = {},
    specialNote,
    singleUnitTotal,
    quantity,
    excludedIds = [],
    optionalIngredients = [],
    selectedVariant,
    selectedAddons = [],
    selectedSpice = "Medium Spicy",
    e,
  }) => {
    if (e) e.stopPropagation();

    // Combine all selected addons (product custom addons + category upsells)
    const combinedAddons = [
      ...selectedAddons.map((a) => ({
        id: a.id,
        name: a.title || a.name,
        title: a.title || a.name,
        price: parseFloat(a.price || a.addon_price || 0),
        inventory_id: a.inventory_id ? parseInt(a.inventory_id) : null,
        qty_to_deduct: a.qty_to_deduct ? parseFloat(a.qty_to_deduct) : null,
        is_custom_addon: true,
      })),
      ...selectedUpsells.map((u) => ({
        id: u.id,
        name: u.name || u.title,
        title: u.name || u.title,
        price: parseFloat(u.selectedPrice || u.price || 0),
        inventory_id: u.inventory_id ? parseInt(u.inventory_id) : null,
        qty_to_deduct: u.qty_to_deduct ? parseFloat(u.qty_to_deduct) : null,
        addon_group: u.addon_group,
        is_mapping_addon: true,
      })),
    ];

    if (isDeal) {
      const comboSummary = comboItems
        .map((c) => `${c.qty} ${c.name}`)
        .join(", ");
      const addonsSummary = combinedAddons.map((a) => a.name).join(", ");
      let noteParts = [];
      if (hasPizzaInCombo) noteParts.push(`Pizza: ${selectedPizza}`);
      if (hasFriesInCombo) noteParts.push(`Fries: ${selectedFries}`);
      if (hasDrinkInCombo) noteParts.push(`Drink: ${selectedDrink}`);
      
      // Dynamic selections notes
      if (dynamicSelections && typeof dynamicSelections === 'object') {
        Object.entries(dynamicSelections).forEach(([slotId, val]) => {
          if (val) {
            const matchedSlot = comboItems.find(c => c.id == slotId);
            const slotLabel = matchedSlot ? matchedSlot.name : `Option #${slotId}`;
            noteParts.push(`${slotLabel}: ${val}`);
          }
        });
      }

      if (addonsSummary) noteParts.push(`Addons: ${addonsSummary}`);
      if (specialNote) noteParts.push(`Note: ${specialNote}`);

      addToCart({
        id: item?.id
          ? item.id.toString().startsWith("deal-")
            ? item.id
            : `deal-${item.id}`
          : `deal-${Date.now()}`,
        title: title || item?.name || item?.title || "Combo Deal",
        price: singleUnitTotal,
        qty: quantity,
        size: "Combo",
        is_deal: true,
        image: finalImage,
        deal_items: comboItems,
        dynamicSelections,
        selectedFlavors: {
          pizza: hasPizzaInCombo ? selectedPizza : null,
          fries: hasFriesInCombo ? selectedFries : null,
          drink: hasDrinkInCombo ? selectedDrink : null,
          addOns: selectedUpsells,
          ...dynamicSelections,
        },
        addons: combinedAddons,
        selected_addons: combinedAddons,
        upsell_items: selectedUpsells,
        note: `Combo: ${comboSummary}${
          noteParts.length ? ` | ${noteParts.join(" | ")}` : ""
        }`,
      });
    } else {
      const excludedNames = excludedIds
        .map((id) => {
          const ing = optionalIngredients.find((i) => i.inventory_id === id);
          return ing ? ing.ingredient_name : null;
        })
        .filter(Boolean)
        .join(", ");

      let noteParts = [];
      if (selectedSpice && selectedSpice !== "Medium Spicy") {
        noteParts.push(`Spice: ${selectedSpice}`);
      }
      if (excludedNames) {
        noteParts.push(`Without: ${excludedNames}`);
      }
      const addonsSummary = combinedAddons.map((a) => a.name).join(", ");
      if (addonsSummary) {
        noteParts.push(`Addons: ${addonsSummary}`);
      }
      if (specialNote) {
        noteParts.push(`Note: ${specialNote}`);
      }

      addToCart({
        id: item?.id || Date.now(),
        title: title || item?.name,
        price: singleUnitTotal,
        qty: quantity,
        size: selectedVariant ? selectedVariant.size : "Regular",
        is_deal: false,
        image: finalImage,
        spice_level: selectedSpice,
        spiceLevel: selectedSpice,
        excluded_ingredients: excludedIds,
        selected_addons: combinedAddons,
        addons: combinedAddons,
        upsell_items: selectedUpsells,
        note: noteParts.join(" | "),
      });
    }

    handleCloseModal();
  };

  return {
    finalImage,
    handleCloseModal,
    buildAndAddToCart,
  };
}
