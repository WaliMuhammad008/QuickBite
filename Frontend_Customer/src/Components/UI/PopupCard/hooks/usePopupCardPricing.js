import { useState, useEffect } from "react";

export function usePopupCardPricing({
  fullItem,
  item,
  price,
  isDeal,
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedUpsells, setSelectedUpsells] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);

  useEffect(() => {
    if (fullItem?.variants && fullItem.variants.length > 0) {
      const firstAvailableVariant =
        fullItem.variants.find((v) => v.inStock !== false && v.inStock !== 0) ||
        fullItem.variants[0];
      setSelectedVariant(firstAvailableVariant);
    } else if (!isDeal) {
      setSelectedVariant({
        id: 1,
        size: "Regular",
        price: parseFloat(fullItem?.price || price || 0),
        inStock: true,
      });
    }
  }, [fullItem, isDeal, price]);

  const toggleMappedAddon = (group, addonItem) => {
    setSelectedUpsells((prev) => {
      const groupName = group.name;
      const isSingle = group.type === "single_choice";
      const exists = prev.find(
        (u) => u.id === addonItem.id && u.addon_group === groupName
      );

      if (exists) {
        return prev.filter(
          (u) => !(u.id === addonItem.id && u.addon_group === groupName)
        );
      } else {
        const itemPrice = parseFloat(addonItem.price || 0);
        const newItem = {
          id: addonItem.id,
          name: addonItem.item_name || addonItem.name,
          price: itemPrice,
          selectedPrice: itemPrice,
          img: addonItem.img || addonItem.image,
          addon_group: groupName,
          is_addon_mapping: true,
        };

        if (isSingle) {
          const filtered = prev.filter((u) => u.addon_group !== groupName);
          return [...filtered, newItem];
        } else {
          return [...prev, newItem];
        }
      }
    });
  };

  const toggleProductAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some(
        (a) => a.id === addon.id || a.title === addon.title
      );
      if (exists) {
        return prev.filter(
          (a) => !(a.id === addon.id || a.title === addon.title)
        );
      } else {
        return [
          ...prev,
          {
            id: addon.id,
            title: addon.title || addon.name,
            name: addon.title || addon.name,
            price: parseFloat(addon.price || 0),
            addon_price: parseFloat(addon.price || 0),
            inventory_id: addon.inventory_id || null,
            qty: addon.qty || null,
          },
        ];
      }
    });
  };

  const toggleRemovable = (invId) =>
    setExcludedIds((prev) =>
      prev.includes(invId)
        ? prev.filter((id) => id !== invId)
        : [...prev, invId]
    );

  const basePrice = selectedVariant
    ? parseFloat(selectedVariant.price)
    : parseFloat(price || 0);
  const addonsTotal = selectedAddons.reduce(
    (sum, a) => sum + parseFloat(a.addon_price || 0),
    0
  );
  const upsellsTotal = selectedUpsells.reduce(
    (sum, u) => sum + parseFloat(u.selectedPrice || u.price || 0),
    0
  );
  const singleUnitTotal = basePrice + (isDeal ? 0 : addonsTotal) + upsellsTotal;
  const grandTotal = singleUnitTotal * quantity;

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  return {
    quantity,
    setQuantity,
    increaseQuantity,
    decreaseQuantity,
    selectedVariant,
    setSelectedVariant,
    selectedAddons,
    setSelectedAddons,
    toggleProductAddon,
    selectedUpsells,
    setSelectedUpsells,
    toggleMappedAddon,
    excludedIds,
    setExcludedIds,
    toggleRemovable,
    basePrice,
    addonsTotal,
    upsellsTotal,
    singleUnitTotal,
    grandTotal,
  };
}
