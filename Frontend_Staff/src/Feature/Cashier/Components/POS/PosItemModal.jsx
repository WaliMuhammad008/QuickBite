import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheck,
  FaUtensils,
  FaLayerGroup,
  FaWineBottle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import ItemVariantSelector from "./ItemVariantSelector";
import ItemIngredientToggles from "./ItemIngredientToggles";

export default function PosItemModal({ isOpen, onClose, menuItem, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState("");
  const [optionalIngredients, setOptionalIngredients] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [productAddons, setProductAddons] = useState([]);
  const [addonGroups, setAddonGroups] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [kitchenNote, setKitchenNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddonsLoading, setIsAddonsLoading] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  useEffect(() => {
    if (isOpen && menuItem) {
      setQuantity(1);
      setKitchenNote("");
      setExcludedIds([]);
      setSelectedAddons([]);
      setCollapsedGroups({});

      if (menuItem.variants && menuItem.variants.length > 0) {
        const firstAvailable = menuItem.variants.find(
          (v) => v.inStock !== false && v.inStock !== 0 && v.inStock !== "0"
        );
        setSelectedVariant(
          firstAvailable ? firstAvailable.size : menuItem.variants[0].size
        );
      } else {
        setSelectedVariant("Regular");
      }

      // Fetch dynamic item addons from backend
      const fetchAddons = async () => {
        setIsAddonsLoading(true);
        try {
          const catParam = menuItem.category && menuItem.category !== "Uncategorized" ? encodeURIComponent(menuItem.category) : "";
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_menu_addons.php?item_id=${menuItem.id}&category=${catParam}`
          );
          const json = await res.json();
          if (json.success) {
            setProductAddons(json.product_addons || []);
            setAddonGroups(json.addon_groups || []);
          } else {
            setProductAddons([]);
            setAddonGroups([]);
          }
        } catch (e) {
          console.error("Error fetching addons for POS item:", e);
          setProductAddons([]);
          setAddonGroups([]);
        } finally {
          setIsAddonsLoading(false);
        }
      };

      fetchAddons();
    }
  }, [isOpen, menuItem]);

  useEffect(() => {
    if (isOpen && menuItem && selectedVariant) {
      const fetchRecipeDetails = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_recipe.php?menu_item_id=${menuItem.id}&variant_name=${selectedVariant}`
          );
          const data = await response.json();

          if (response.ok && data.status === "success") {
            const removables = (data.ingredients || []).filter(
              (ing) => ing.is_removable == 1
            );
            setOptionalIngredients(removables);
          } else {
            setOptionalIngredients([]);
          }
        } catch (error) {
          console.error("Error fetching recipe for POS:", error);
          setOptionalIngredients([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecipeDetails();
    }
  }, [isOpen, menuItem, selectedVariant]);

  if (!isOpen || !menuItem) return null;

  const toggleIngredient = (inventoryId) => {
    if (excludedIds.includes(inventoryId)) {
      setExcludedIds(excludedIds.filter((id) => id !== inventoryId));
    } else {
      setExcludedIds([...excludedIds, inventoryId]);
    }
  };

  const getAddonUid = (addon) => {
    if (addon.uid) return addon.uid;
    if (addon.addon_type === "product_custom" || addon.is_product_addon) {
      return `custom_${addon.id}`;
    }
    return `item_${addon.id}`;
  };

  const toggleAddon = (addon) => {
    const addonUid = getAddonUid(addon);
    const isSelected = selectedAddons.some((a) => a.uid === addonUid);

    if (isSelected) {
      setSelectedAddons(selectedAddons.filter((a) => a.uid !== addonUid));
    } else {
      setSelectedAddons([
        ...selectedAddons,
        {
          id: addon.id,
          uid: addonUid,
          addon_type: addon.addon_type || (addon.is_product_addon ? "product_custom" : "upsell_item"),
          name: addon.name || addon.title,
          title: addon.title || addon.name,
          price: Number(addon.price || 0),
          inventory_id: addon.inventory_id || null,
          qty_to_deduct: addon.qty || addon.qty_to_deduct || 1,
          image: addon.image || addon.img || null,
        },
      ]);
    }
  };

  const toggleGroupCollapse = (groupKey) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  let basePrice = Number(menuItem.price || 0);
  if (menuItem.variants && menuItem.variants.length > 0) {
    const activeVar = menuItem.variants.find((v) => v.size === selectedVariant);
    if (activeVar) basePrice = Number(activeVar.price || 0);
  }

  const addonsTotal = selectedAddons.reduce(
    (sum, a) => sum + Number(a.price || 0),
    0
  );
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const cartItem = {
      id: menuItem.id,
      title: menuItem.name || menuItem.title,
      name: menuItem.name || menuItem.title,
      size: selectedVariant,
      variant: selectedVariant,
      base_price: basePrice,
      price: unitPrice,
      qty: quantity,
      quantity,
      note: kitchenNote.trim(),
      excluded_ingredients: excludedIds,
      selected_addons: selectedAddons,
    };

    onAddToCart(cartItem);
    onClose();
  };

  const isCurrentSelectionOutOfStock = () => {
    if (!menuItem.variants || menuItem.variants.length === 0) return false;
    const activeVar = menuItem.variants.find((v) => v.size === selectedVariant);
    return (
      activeVar &&
      (activeVar.inStock === false ||
        activeVar.inStock === 0 ||
        activeVar.inStock === "0")
    );
  };

  const formatImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    const base = import.meta.env.VITE_API_BASE.replace(/\/api$/, "");
    return `${base}/${img.replace(/^\//, "")}`;
  };

  // Render modern tile card for an addon
  const renderAddonCard = (addon) => {
    const addonUid = getAddonUid(addon);
    const isSelected = selectedAddons.some((a) => a.uid === addonUid);
    const rawImg = addon.image || addon.img;
    const imgUrl = formatImageUrl(rawImg);
    const title = addon.title || addon.name;
    const price = Number(addon.price || 0);
    const visualType = addon.visual_type || (addon.is_product_addon ? "custom" : "item");

    return (
      <button
        key={addonUid}
        type="button"
        onClick={() => toggleAddon(addon)}
        className={`group relative flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none ${
          isSelected
            ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 text-zinc-950 dark:text-white ring-2 ring-amber-500/30 shadow-md shadow-amber-500/5"
            : "bg-zinc-50/80 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-amber-400/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
        }`}
      >
        {/* Thumbnail Image or Fallback Visual */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-200/70 dark:bg-zinc-800 shrink-0 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}

          {/* Clean Fallback Icon */}
          <div
            className={`w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 ${
              imgUrl ? "hidden" : "flex"
            }`}
          >
            {visualType === "cheese" ? (
              <span className="text-xl">🧀</span>
            ) : visualType === "patty" ? (
              <span className="text-xl">🍗</span>
            ) : visualType === "sauce" ? (
              <span className="text-xl">🥣</span>
            ) : visualType === "topping" ? (
              <span className="text-xl">🥗</span>
            ) : visualType === "drink" ? (
              <FaWineBottle className="text-base text-amber-500/70" />
            ) : (
              <FaUtensils className="text-sm opacity-60" />
            )}
          </div>

          {/* Selection indicator pill */}
          {isSelected && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-[9px] font-black shadow-xs">
              <FaCheck />
            </span>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-bold m-0 text-zinc-900 dark:text-white truncate leading-tight">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block font-mono text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded-md">
              +Rs. {price.toLocaleString()}
            </span>
            {addon.category && (
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider truncate max-w-[70px]">
                {addon.category}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  const hasAddons = productAddons.length > 0 || addonGroups.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in"
      style={{ transform: "none", perspective: "none" }}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        style={{ transform: "none", perspective: "none" }}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            {menuItem.img && (
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-200/80 dark:border-zinc-700/80">
                <img
                  src={formatImageUrl(menuItem.img)}
                  alt={menuItem.name || menuItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 font-mono">
                POS Customization
              </span>
              <h3 className="m-0 text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug">
                {menuItem.name || menuItem.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. Size / Variant Options */}
          <ItemVariantSelector
            variants={menuItem.variants}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
          />

          {/* 2. Optional Removable Ingredients */}
          <ItemIngredientToggles
            optionalIngredients={optionalIngredients}
            excludedIds={excludedIds}
            toggleIngredient={toggleIngredient}
          />

          {/* 3. Modernized Add-ons Section */}
          {isAddonsLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : hasAddons ? (
            <div className="space-y-4">
              {/* Product-Specific Custom Add-ons */}
              {productAddons.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaLayerGroup className="text-amber-500 text-xs" />
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-mono">
                        Product Customizations
                      </label>
                    </div>
                    {selectedAddons.filter((a) => a.addon_type === "product_custom").length > 0 && (
                      <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {selectedAddons.filter((a) => a.addon_type === "product_custom").length} Selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {productAddons.map((addon) => renderAddonCard(addon))}
                  </div>
                </div>
              )}

              {/* Cross-Sell / Group Add-ons (Drinks, Sides, Dips) */}
              {addonGroups.map((group) => {
                const groupKey = `grp_${group.id}`;
                const isCollapsed = collapsedGroups[groupKey] ?? false;
                const items = group.items || [];
                if (items.length === 0) return null;

                const groupSelectedCount = selectedAddons.filter((a) =>
                  items.some((item) => getAddonUid(item) === a.uid)
                ).length;

                return (
                  <div
                    key={group.id}
                    className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-850/40 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroupCollapse(groupKey)}
                      className="w-full p-3 flex items-center justify-between text-left cursor-pointer border-none bg-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-900 dark:text-white m-0 font-['Oswald',sans-serif]">
                            {group.title}
                          </h4>
                          {groupSelectedCount > 0 && (
                            <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-500/15 px-2 py-0.2 rounded-full">
                              +{groupSelectedCount}
                            </span>
                          )}
                        </div>
                        {group.subtitle && (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                            {group.subtitle}
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-400 text-xs">
                        {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                      </div>
                    </button>

                    {!isCollapsed && (
                      <div className="p-3 pt-0 border-t border-zinc-200/40 dark:border-zinc-800/60">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
                          {items.map((addon) => renderAddonCard(addon))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* 4. Kitchen Note / Special Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 font-mono">
              Special Instructions / Kitchen Note
            </label>
            <input
              type="text"
              placeholder="e.g. Extra spicy, sauce on the side..."
              value={kitchenNote}
              onChange={(e) => setKitchenNote(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
            />
          </div>

          {/* 5. Quantity Controls & Subtotal Preview */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase font-mono block">
                Quantity
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Unit: Rs. {unitPrice.toFixed(2)}
                {addonsTotal > 0 && ` (Base: Rs. ${basePrice} + Addons: Rs. ${addonsTotal})`}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center border-none cursor-pointer transition-colors disabled:opacity-40"
              >
                <FaMinus className="text-[10px]" />
              </button>
              <span className="w-8 text-center text-sm font-bold font-mono text-zinc-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                <FaPlus className="text-[10px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <button
            type="button"
            disabled={isCurrentSelectionOutOfStock()}
            onClick={handleAddToCart}
            className={`w-full py-3.5 px-5 rounded-2xl font-['Oswald',sans-serif] font-bold text-sm uppercase tracking-wider transition-all border-none flex items-center justify-between ${
              isCurrentSelectionOutOfStock()
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-[0.99]"
            }`}
          >
            <span>
              {isCurrentSelectionOutOfStock()
                ? "Option Sold Out"
                : `Add to Cart ${selectedAddons.length > 0 ? `(${selectedAddons.length} Add-on${selectedAddons.length > 1 ? "s" : ""})` : ""}`}
            </span>
            {!isCurrentSelectionOutOfStock() && (
              <span className="font-mono text-base font-black">
                Rs. {totalPrice.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

