import React, { useMemo } from "react";
import {
  FaUtensils,
  FaPlus,
  FaTrash,
  FaPizzaSlice,
  FaCheckCircle,
  FaSlidersH,
  FaTag,
} from "react-icons/fa";

export default function DealSelectedItemsTable({
  includedItems = [],
  handleAddItemRow,
  handleRemoveItemRow,
  handleItemChange,
  handleUpdateItemRow,
  handleQuickSelectMenu,
  menuItems = [],
}) {
  // Extract unique categories from menuItems
  const availableCategories = useMemo(() => {
    const cats = new Set();
    menuItems.forEach((m) => {
      if (m.category && m.category.trim()) {
        cats.add(m.category.trim());
      }
    });
    return Array.from(cats);
  }, [menuItems]);

  // Helper to format default title
  const generateTitle = (qty, size, flavorOrName, cat, mode) => {
    const qStr = qty > 1 ? `${qty}x ` : "";
    const sStr = size && size !== "Regular" ? `${size} ` : "";
    if (mode === "choice") {
      const cName = cat || "Item";
      return `${qStr}${sStr}${cName} (Customer Choice)`.trim();
    }
    const fName = flavorOrName || cat || "Food Item";
    return `${qStr}${sStr}${fName}`.trim();
  };

  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FaUtensils className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
            2. Bundled Food Items ({includedItems.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={handleAddItemRow}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none shadow-sm transition-all active:scale-95"
        >
          <FaPlus className="text-[10px]" />
          <span>Add Food Slot</span>
        </button>
      </div>

      {/* Items Repeater */}
      <div className="space-y-4">
        {includedItems.map((item, idx) => {
          const mode = item.flavor_mode || (item.is_customizable ? "choice" : "fixed");
          const selectedCategory = item.category || "";
          
          // Products filtered by selected category
          const categoryProducts = menuItems.filter(
            (m) => !selectedCategory || m.category?.toLowerCase() === selectedCategory.toLowerCase()
          );

          // Find current linked product
          const currentProduct = menuItems.find(
            (m) => m.id == item.menu_item_id || (item.flavor_name && m.name?.toLowerCase() === item.flavor_name?.toLowerCase())
          );

          // Available sizes for this product/category
          const productVariants = currentProduct?.variants || [];
          const availableSizes = productVariants.length > 0 
            ? productVariants.map(v => v.size) 
            : ["Small", "Medium", "Large", "Regular"];

          // Change handler with updater support
          const updateRow = (updates) => {
            if (handleUpdateItemRow) {
              handleUpdateItemRow(idx, updates);
            } else {
              Object.entries(updates).forEach(([k, v]) => handleItemChange(idx, k, v));
            }
          };

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3 hover:border-amber-500/30 transition-all shadow-xs"
            >
              {/* Row Header: Slot Number + Mode Toggle + Remove */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-black flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300 font-['Oswald',sans-serif]">
                    Bundled Item Slot
                  </span>
                </div>

                {/* Mode Selector (Fixed Flavor vs Customer Choice) */}
                <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-black/40 p-1 rounded-xl border border-slate-300/60 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      const newTitle = generateTitle(
                        item.quantity,
                        item.size,
                        item.flavor_name || currentProduct?.name,
                        item.category,
                        "fixed"
                      );
                      updateRow({
                        flavor_mode: "fixed",
                        is_customizable: false,
                        item_title: newTitle || item.item_title,
                      });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border-none cursor-pointer ${
                      mode === "fixed"
                        ? "bg-amber-500 text-neutral-950 shadow-xs"
                        : "bg-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Fixed Flavor
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Gather category product names for choice options
                      const catProducts = menuItems.filter(
                        (m) => !selectedCategory || m.category?.toLowerCase() === selectedCategory.toLowerCase()
                      );
                      const optNames = catProducts.map((p) => p.name).filter(Boolean);
                      const optStr = optNames.length > 0 ? optNames.join(", ") : "Chicken Tikka, Fajita, Peri Peri";
                      const groupTitle = selectedCategory ? `Choose ${selectedCategory} Flavor` : "Choose Flavor";
                      const newTitle = generateTitle(
                        item.quantity,
                        item.size,
                        null,
                        item.category,
                        "choice"
                      );

                      updateRow({
                        flavor_mode: "choice",
                        is_customizable: true,
                        choice_group_name: item.choice_group_name || groupTitle,
                        options_str: item.options_str || optStr,
                        item_title: newTitle || item.item_title,
                      });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border-none cursor-pointer ${
                      mode === "choice"
                        ? "bg-amber-500 text-neutral-950 shadow-xs"
                        : "bg-transparent text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Customer's Choice
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveItemRow(idx)}
                  className="w-7 h-7 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                  title="Remove Item Slot"
                >
                  <FaTrash className="text-[10px]" />
                </button>
              </div>

              {/* Main Selection Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* 1. Category Selector */}
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={item.category || ""}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const catProducts = menuItems.filter(
                        (m) => !newCat || m.category?.toLowerCase() === newCat.toLowerCase()
                      );
                      const firstProduct = catProducts[0];
                      const firstVariant = firstProduct?.variants?.[0]?.size || "Regular";
                      
                      const newTitle = generateTitle(
                        item.quantity,
                        firstVariant,
                        mode === "fixed" ? firstProduct?.name : null,
                        newCat,
                        mode
                      );

                      updateRow({
                        category: newCat,
                        menu_item_id: mode === "fixed" && firstProduct ? firstProduct.id : 0,
                        flavor_name: mode === "fixed" && firstProduct ? firstProduct.name : "",
                        size: firstVariant,
                        item_title: newTitle,
                        choice_group_name: mode === "choice" ? `Choose ${newCat} Flavor` : item.choice_group_name,
                        options_str: mode === "choice" && catProducts.length > 0 
                          ? catProducts.map(p => p.name).join(", ") 
                          : item.options_str
                      });
                    }}
                    className="w-full p-2 bg-white dark:bg-black/40 text-slate-900 dark:text-neutral-200 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option className="bg-white dark:bg-[#171717]" value="">
                      -- All Categories --
                    </option>
                    {availableCategories.map((c) => (
                      <option className="bg-white dark:bg-[#171717]" key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Product / Flavor Selector */}
                <div className="sm:col-span-4">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                    {mode === "fixed" ? "Product / Flavor *" : "Flavor Selection"}
                  </label>
                  {mode === "fixed" ? (
                    <select
                      value={item.menu_item_id || ""}
                      onChange={(e) => {
                        const mId = e.target.value;
                        const prod = menuItems.find((m) => m.id == mId);
                        if (!prod) return;

                        const chosenSize = prod.variants && prod.variants.length > 0 ? prod.variants[0].size : (item.size || "Regular");
                        const newTitle = generateTitle(
                          item.quantity,
                          chosenSize,
                          prod.name,
                          prod.category,
                          "fixed"
                        );

                        updateRow({
                          menu_item_id: prod.id,
                          category: prod.category || item.category,
                          flavor_name: prod.name,
                          size: chosenSize,
                          item_title: newTitle,
                        });
                      }}
                      className="w-full p-2 bg-white dark:bg-black/40 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option className="bg-white dark:bg-[#171717]" value="">
                        -- Pick Flavor / Product --
                      </option>
                      {categoryProducts.map((p) => (
                        <option className="bg-white dark:bg-[#171717]" key={p.id} value={p.id}>
                          {p.name} {p.category ? `(${p.category})` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <FaCheckCircle className="text-[11px]" />
                      <span>Customer Chooses at Order</span>
                    </div>
                  )}
                </div>

                {/* 3. Size Variant Selector */}
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                    Size Variant *
                  </label>
                  <select
                    value={item.size || "Regular"}
                    onChange={(e) => {
                      const newSize = e.target.value;
                      const newTitle = generateTitle(
                        item.quantity,
                        newSize,
                        item.flavor_name || currentProduct?.name,
                        item.category,
                        mode
                      );
                      updateRow({
                        size: newSize,
                        item_title: newTitle,
                      });
                    }}
                    className="w-full p-2 bg-white dark:bg-black/40 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {availableSizes.map((s) => (
                      <option className="bg-white dark:bg-[#171717]" key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Quantity Counter */}
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1 text-center">
                    Qty *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={(e) => {
                      const newQty = Math.max(1, parseInt(e.target.value) || 1);
                      const newTitle = generateTitle(
                        newQty,
                        item.size,
                        item.flavor_name || currentProduct?.name,
                        item.category,
                        mode
                      );
                      updateRow({
                        quantity: newQty,
                        item_title: newTitle,
                      });
                    }}
                    className="w-full p-2 bg-white dark:bg-black/40 text-amber-600 dark:text-amber-400 text-center font-black rounded-xl border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Formatted Item Title Display & Override */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-neutral-400">
                    Display Title in Deal Description
                  </label>
                  <span className="text-[9px] text-slate-400 dark:text-neutral-500 italic">
                    (Auto-formatted, can be customized)
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 2x Small Peri Peri Pizza"
                  value={item.item_title || ""}
                  onChange={(e) => updateRow({ item_title: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-black/30 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Customer Choice Configurator (Only when mode === 'choice') */}
              {mode === "choice" && (
                <div className="mt-2 p-3 bg-white dark:bg-black/30 rounded-xl border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    <FaSlidersH className="text-[10px]" />
                    <span>Customer Flavor Options for this Slot</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-500 dark:text-neutral-400 block mb-1">
                        Choice Group Heading
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Choose Pizza Flavor"
                        value={item.choice_group_name || ""}
                        onChange={(e) => updateRow({ choice_group_name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-500 dark:text-neutral-400 block mb-1">
                        Allowed Flavors (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chicken Tikka, Fajita, Peri Peri, Supreme"
                        value={item.options_str || ""}
                        onChange={(e) => updateRow({ options_str: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
