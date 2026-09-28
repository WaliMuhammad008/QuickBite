import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { FaTimes, FaSpinner, FaUtensils, FaSearch } from "react-icons/fa";
import { apiFetch } from "../../../../../utils/apiHelper";
import AddonSubItemsTable from "./AddonSubItemsTable";

const AddonModal = ({
  isOpen,
  onClose,
  menuItem,
  menuItems = [],
  inventoryItems = [],
  onSaved,
}) => {
  const [selectedItem, setSelectedItem] = useState(menuItem || null);
  const [productSearch, setProductSearch] = useState("");
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync initial product selection only when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItem(menuItem || null);
      setProductSearch("");
    }
  }, [isOpen, menuItem]);

  // Quick filter for product dropdown
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return menuItems;
    const q = productSearch.toLowerCase().trim();
    return menuItems.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q)
    );
  }, [menuItems, productSearch]);

  useEffect(() => {
    if (isOpen && selectedItem?.id) {
      setLoading(true);
      apiFetch(
        `admin_manage_addons.php?action=get_product_addons&menu_item_id=${selectedItem.id}`
      )
        .then((res) => res.json())
        .then((resData) => {
          const list = resData.data || resData.addons || [];
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((a) => ({
              addon_name: a.title || a.addon_name || "",
              addon_price: a.price || a.addon_price || "",
              inventory_id: a.inventory_id || "",
              qty: a.qty_to_deduct || a.qty || "",
            }));
            setAddons(mapped);
          } else {
            setAddons([
              { addon_name: "", addon_price: "", inventory_id: "", qty: "" },
            ]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load addons", err);
          setLoading(false);
        });
    }
  }, [isOpen, selectedItem]);

  const handleAddRow = () => {
    setAddons([
      ...addons,
      { addon_name: "", addon_price: "", inventory_id: "", qty: "" },
    ]);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...addons];
    updated[index][field] = value;
    setAddons(updated);
  };

  const handleRemoveRow = (index) => {
    const updated = addons.filter((_, i) => i !== index);
    setAddons(
      updated.length > 0
        ? updated
        : [{ addon_name: "", addon_price: "", inventory_id: "", qty: "" }]
    );
  };

  const handleSave = async () => {
    if (!selectedItem?.id) {
      Swal.fire("Error", "Please select a product first", "error");
      return;
    }

    setIsSaving(true);

    const filteredAddons = addons
      .filter((a) => a.addon_name.trim() !== "")
      .map((a) => ({
        title: a.addon_name.trim(),
        addon_name: a.addon_name.trim(),
        price: a.addon_price !== "" ? Number(a.addon_price) : 0,
        addon_price: a.addon_price !== "" ? Number(a.addon_price) : 0,
        inventory_id: a.inventory_id ? Number(a.inventory_id) : null,
        qty_to_deduct: a.qty ? Number(a.qty) : null,
      }));

    const payload = {
      action: "save_product_addons",
      menu_item_id: selectedItem.id,
      addons: filteredAddons,
    };

    try {
      const res = await apiFetch("admin_manage_addons.php", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok && (result.success || result.status === "success")) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: `Custom add-ons for "${selectedItem.name}" updated successfully`,
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(result.message || "Failed to save addons");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message || "Network Error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg md:max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[88vh] flex flex-col animate-slide-up text-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
              <h3 className="m-0 text-base sm:text-lg md:text-xl font-black text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                Product Custom Add-ons & Modifiers
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 m-0">
              Configure product-level upgrades (e.g. Extra Cheese, Bacon, Special Sauces).
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            onClick={onClose}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Product Selector with Search Filter */}
        {menuItems.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shrink-0">
                <FaUtensils className="text-[10px]" /> Target Product:
              </label>
              {/* Quick Search Field */}
              <div className="relative">
                <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-7 pr-2 py-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 w-32 sm:w-36"
                />
              </div>
            </div>

            <select
              value={selectedItem?.id || ""}
              onChange={(e) => {
                const found = menuItems.find((m) => String(m.id) === String(e.target.value));
                if (found) setSelectedItem(found);
              }}
              className="w-full sm:w-auto flex-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:border-amber-500"
            >
              {filteredProducts.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.category || "General"}) - Rs {parseFloat(m.price || 0).toLocaleString()}
                </option>
              ))}
              {filteredProducts.length === 0 && (
                <option disabled value="">
                  No products match &quot;{productSearch}&quot;
                </option>
              )}
            </select>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          <AddonSubItemsTable
            addons={addons}
            inventoryItems={inventoryItems}
            loading={loading}
            handleAddRow={handleAddRow}
            handleFieldChange={handleFieldChange}
            handleRemoveRow={handleRemoveRow}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 border-none cursor-pointer transition-all flex items-center gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <FaSpinner className="animate-spin text-xs" />}
            <span>Save Add-ons</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddonModal;
