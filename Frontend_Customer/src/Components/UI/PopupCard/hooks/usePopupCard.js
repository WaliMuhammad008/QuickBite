import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../../../../Context/CartContext";
import { parseComboItems } from "../comboHelpers";
import { usePopupCardPricing } from "./usePopupCardPricing";
import { usePopupCardValidation } from "./usePopupCardValidation";
import { API_BASE } from "../../../../config/api";

export function usePopupCard({
  item,
  price,
  title,
  image,
  description,
  closePopup,
}) {
  const { addToCart } = useCart();
  const [specialNote, setSpecialNote] = useState("");
  const [selectedSpice, setSelectedSpice] = useState("Medium Spicy");
  const [selectedDrink, setSelectedDrink] = useState("Coca-Cola");
  const [selectedPizza, setSelectedPizza] = useState("Chicken Tikka");
  const [selectedFries, setSelectedFries] = useState("Masala Fries");
  const [fullItem, setFullItem] = useState(item);
  const [dynamicSelections, setDynamicSelectionsState] = useState({});

  // Helper: set a single slot selection
  const setDynamicSelection = (slotId, flavorName) => {
    setDynamicSelectionsState(prev => ({ ...prev, [slotId]: flavorName }));
  };

  const isDeal = Boolean(
    fullItem?.is_deal === true ||
      fullItem?.isDeal === true ||
      fullItem?.type === "deal" ||
      (fullItem?.id && fullItem.id.toString().startsWith("deal-")) ||
      (fullItem?.items &&
        Array.isArray(fullItem.items) &&
        fullItem.items.length > 0)
  );

  useEffect(() => {
    setFullItem(item);
    if (!item) return;

    const rawId =
      item.deal_id ||
      String(item.id || "")
        .replace("deal-", "")
        .replace("prod-", "");
    const isDealItem = Boolean(
      item?.is_deal === true ||
        item?.isDeal === true ||
        item?.type === "deal" ||
        (item?.id && item.id.toString().startsWith("deal-")) ||
        (item?.items && Array.isArray(item.items) && item.items.length > 0)
    );

    if (isDealItem && (!item.items || item.items.length === 0)) {
      fetch(`${API_BASE}/get_deal_details.php?id=${rawId}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.deal) {
            setFullItem((prev) => ({
              ...prev,
              ...res.deal,
              is_deal: true,
              items: res.deal.items || [],
            }));
          }
        })
        .catch((e) =>
          console.error("Could not fetch full deal details in modal", e)
        );
    }
  }, [item]);

  const rawDesc =
    fullItem?.items_description || description || fullItem?.description || "";
  const comboItems = useMemo(
    () => parseComboItems(rawDesc, fullItem?.items),
    [rawDesc, fullItem?.items]
  );
  const hasDrinkInCombo = comboItems.some((c) => c.isDrink);
  const hasPizzaInCombo = comboItems.some((c) => c.isPizza);
  const hasFriesInCombo = comboItems.some((c) => c.isFries);

  // Auto-select first available flavor for each customizable slot
  useEffect(() => {
    if (!comboItems || comboItems.length === 0) return;
    const newSelections = {};
    let pizzaSet = false, friesSet = false, drinkSet = false;
    comboItems.forEach(slot => {
      if (!slot.is_customizable || !Array.isArray(slot.options) || slot.options.length === 0) return;
      // Find first in-stock option
      const firstAvail = slot.options.find(o => {
        if (typeof o === 'string') return true;
        return o.inStock !== false;
      });
      const firstName = firstAvail
        ? (typeof firstAvail === 'string' ? firstAvail : firstAvail.name)
        : '';
      if (firstName) {
        newSelections[slot.id] = firstName;
        // Also set legacy state
        if (slot.isPizza && !pizzaSet) { setSelectedPizza(firstName); pizzaSet = true; }
        if (slot.isFries && !friesSet) { setSelectedFries(firstName); friesSet = true; }
        if (slot.isDrink && !drinkSet) { setSelectedDrink(firstName); drinkSet = true; }
      }
    });
    if (Object.keys(newSelections).length > 0) {
      setDynamicSelectionsState(prev => ({ ...prev, ...newSelections }));
    }
  }, [comboItems]);

  const [openSections, setOpenSections] = useState({
    comboIncludes: true,
    pizzaFlavor: true,
    friesFlavor: true,
    drinkFlavor: true,
    ingredients: false,
    productAddons: true,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Fetch Full Addons & Optional Ingredients with Dynamic Cache
  const itemCategory = (
    fullItem?.category_name ||
    fullItem?.category ||
    fullItem?.category_title ||
    fullItem?.type ||
    (isDeal ? "deals" : "General")
  )
    .toString()
    .trim()
    .toLowerCase();

  const rawIdVal = fullItem?.id
    ? String(fullItem.id).replace("prod-", "").replace("deal-", "")
    : "";
  const cleanItemId = parseInt(rawIdVal, 10) || 0;
  const dealId = isDeal ? (fullItem?.deal_id || cleanItemId) : null;

  const { data: addonsData = { product_addons: [], addon_groups: [] } } = useQuery({
    queryKey: [
      "item_addons_full",
      isDeal ? `deal_${dealId}` : `prod_${itemCategory}_${cleanItemId}`,
    ],
    queryFn: async () => {
      try {
        const url = isDeal && dealId
          ? `${API_BASE}/get_menu_addons.php?category=deals&deal_id=${encodeURIComponent(dealId)}`
          : `${API_BASE}/get_menu_addons.php?category=${encodeURIComponent(itemCategory)}&item_id=${encodeURIComponent(cleanItemId)}`;
        
        const res = await fetch(url, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (data && data.success) {
          return data;
        }

        // Fallback to legacy endpoint if needed
        const legacyUrl = `${API_BASE}/addon_groups.php?action=get_for_product&category=${encodeURIComponent(itemCategory)}&item_id=${encodeURIComponent(cleanItemId)}`;
        const legRes = await fetch(legacyUrl);
        const legData = await legRes.json();
        return {
          product_addons: [],
          addon_groups: legData?.addon_groups || [],
        };
      } catch (err) {
        return { product_addons: [], addon_groups: [] };
      }
    },
    enabled: !!(itemCategory || cleanItemId),
  });

  const productCustomAddons = addonsData.product_addons || [];
  const mappedAddonGroups = addonsData.addon_groups || [];

  const { data: optionalIngredients = [] } = useQuery({
    queryKey: ["product_optional_ingredients", item?.id],
    queryFn: async () => {
      if (!item?.id || isDeal) return [];
      try {
        const res = await fetch(
          `${API_BASE}/get_product_ingredients.php?id=${item.id}`
        );
        const data = await res.json();
        return Array.isArray(data)
          ? data.filter((i) => i.is_optional == 1 || i.is_optional == "1")
          : [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!item?.id && !isDeal,
  });

  // Pricing & Selection Sub-Hook
  const pricing = usePopupCardPricing({
    fullItem,
    item,
    price,
    isDeal,
  });

  // Validation & Payload Sub-Hook
  const validation = usePopupCardValidation({
    image,
    item,
    title,
    closePopup,
    addToCart,
  });

  const isOutOfStock =
    fullItem?.inStock === false ||
    fullItem?.inStock === 0 ||
    fullItem?.inStock === "0" ||
    fullItem?.isAvailable === false ||
    fullItem?.isAvailable === 0 ||
    fullItem?.isAvailable === "0" ||
    (Array.isArray(fullItem?.variants) &&
      fullItem.variants.length > 0 &&
      fullItem.variants.every(
        (v) =>
          v.inStock === false ||
          v.in_stock === false ||
          v.in_stock === 0 ||
          v.in_stock === "0"
      ));

  const handleAddToCart = (e) => {
    if (isOutOfStock) return;
    validation.buildAndAddToCart({
      isDeal,
      comboItems,
      selectedUpsells: pricing.selectedUpsells,
      hasPizzaInCombo,
      selectedPizza,
      hasFriesInCombo,
      selectedFries,
      hasDrinkInCombo,
      selectedDrink,
      dynamicSelections,
      specialNote,
      singleUnitTotal: pricing.singleUnitTotal,
      quantity: pricing.quantity,
      excludedIds: pricing.excludedIds,
      optionalIngredients,
      selectedVariant: pricing.selectedVariant,
      selectedAddons: pricing.selectedAddons,
      selectedSpice,
      e,
    });
  };

  return {
    isDeal,
    isOutOfStock,
    fullItem,
    rawDesc,
    comboItems,
    hasDrinkInCombo,
    hasPizzaInCombo,
    hasFriesInCombo,
    openSections,
    toggleSection,
    selectedVariant: pricing.selectedVariant,
    setSelectedVariant: pricing.setSelectedVariant,
    selectedSpice,
    setSelectedSpice,
    hasSpiceOption: fullItem?.has_spice_option !== 0 && fullItem?.has_spice_option !== false,
    selectedPizza,
    setSelectedPizza,
    selectedFries,
    setSelectedFries,
    selectedDrink,
    setSelectedDrink,
    dynamicSelections,
    setDynamicSelection,
    productCustomAddons,
    selectedProductAddons: pricing.selectedAddons,
    toggleProductAddon: pricing.toggleProductAddon,
    mappedAddonGroups,
    selectedUpsells: pricing.selectedUpsells,
    toggleMappedAddon: pricing.toggleMappedAddon,
    optionalIngredients,
    excludedIds: pricing.excludedIds,
    toggleRemovable: pricing.toggleRemovable,
    quantity: pricing.quantity,
    increaseQuantity: pricing.increaseQuantity,
    decreaseQuantity: pricing.decreaseQuantity,
    grandTotal: pricing.grandTotal,
    specialNote,
    setSpecialNote,
    finalImage: validation.finalImage,
    handleAddToCart,
    handleCloseModal: validation.handleCloseModal,
  };
}
