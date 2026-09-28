import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../../utils/apiHelper";

export function useAddonGroupsManager() {
  const [mappings, setMappings] = useState([]);
  const [productAddonsList, setProductAddonsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Mapping Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentMapping, setCurrentMapping] = useState({
    target_category: "",
    addons: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  // Product Custom Addons Modal State
  const [isProductAddonModalOpen, setIsProductAddonModalOpen] = useState(false);
  const [selectedProductForAddons, setSelectedProductForAddons] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mapsRes, prodAddonsRes, catRes, menuRes, invRes] = await Promise.all([
        apiFetch("admin_manage_addons.php?action=get_category_mappings"),
        apiFetch("admin_manage_addons.php?action=get_all_product_addons"),
        apiFetch("get_categories.php"),
        apiFetch("get_menu.php"),
        apiFetch("inventory_api.php"),
      ]);

      // Category Mappings
      const mapsData = await mapsRes.json().catch(() => null);
      if (mapsData && mapsData.success && Array.isArray(mapsData.data)) {
        setMappings(mapsData.data);
      } else if (Array.isArray(mapsData)) {
        setMappings(mapsData);
      } else if (mapsData && Array.isArray(mapsData.mappings)) {
        setMappings(mapsData.mappings);
      } else {
        setMappings([]);
      }

      // Product Custom Addons
      const prodData = await prodAddonsRes.json().catch(() => null);
      if (prodData && prodData.success && Array.isArray(prodData.data)) {
        setProductAddonsList(prodData.data);
      } else {
        setProductAddonsList([]);
      }

      // Categories
      const catData = await catRes.json().catch(() => null);
      if (Array.isArray(catData)) {
        setCategories(catData);
      } else if (catData && catData.data && Array.isArray(catData.data)) {
        setCategories(catData.data);
      } else {
        setCategories([]);
      }

      // Menu Items
      const mData = await menuRes.json().catch(() => null);
      if (Array.isArray(mData)) {
        setMenuItems(mData);
      } else if (mData && mData.data && Array.isArray(mData.data)) {
        setMenuItems(mData.data);
      } else {
        setMenuItems([]);
      }

      // Inventory Items
      const invData = await invRes.json().catch(() => null);
      if (Array.isArray(invData)) {
        setInventoryItems(invData);
      } else if (invData && Array.isArray(invData.data)) {
        setInventoryItems(invData.data);
      } else {
        setInventoryItems([]);
      }
    } catch (error) {
      console.error("Error fetching data in AddonGroupsManager:", error);
      setMappings([]);
      setProductAddonsList([]);
      setInventoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mapping = null) => {
    if (mapping) {
      setCurrentMapping({
        target_category: mapping.target_category || mapping.parent_category_name || "",
        addons: Array.isArray(mapping.addons) ? mapping.addons : [],
      });
      setIsEditing(true);
    } else {
      setCurrentMapping({
        target_category: "",
        addons: [],
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const openProductAddonModal = (product = null) => {
    if (product) {
      const pId = product.menu_item_id || product.id;
      const full = menuItems.find((m) => m.id === pId) || product;
      setSelectedProductForAddons(full);
    } else {
      setSelectedProductForAddons(null);
    }
    setIsProductAddonModalOpen(true);
  };

  const handleAddAddon = () => {
    setCurrentMapping({
      ...currentMapping,
      addons: [
        ...(currentMapping.addons || []),
        {
          addon_category: "",
          selection_type: "multiple_choice",
          is_required: false,
          custom_label: "",
        },
      ],
    });
  };

  const handleAddonChange = (index, field, value) => {
    const updated = [...(currentMapping.addons || [])];
    if (updated[index]) {
      updated[index][field] = value;
      setCurrentMapping({ ...currentMapping, addons: updated });
    }
  };

  const handleRemoveAddon = (index) => {
    const updated = (currentMapping.addons || []).filter((_, i) => i !== index);
    setCurrentMapping({ ...currentMapping, addons: updated });
  };

  const handleSave = async () => {
    if (!currentMapping.target_category) {
      Swal.fire("Error", "Please select a Target Category", "error");
      return;
    }

    const addons = currentMapping.addons || [];
    for (let i = 0; i < addons.length; i++) {
      if (!addons[i].addon_category) {
        Swal.fire("Error", "Please select an Addon Category for all rows", "error");
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await apiFetch("admin_manage_addons.php", {
        method: "POST",
        body: JSON.stringify({ action: "save_category_mapping", ...currentMapping }),
      });

      const data = await res.json().catch(() => null);

      if (data && (data.success || data.status === "success")) {
        Swal.fire("Saved", "Category Addons saved successfully", "success");
        setIsModalOpen(false);
        fetchData();
      } else {
        Swal.fire("Error", data?.message || "Failed to save category addons", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save category addons", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (target_category) => {
    if (
      await Swal.fire({
        title: "Are you sure?",
        text: `Delete all addon mappings for "${target_category}"?`,
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#ef4444",
      }).then((res) => res.isConfirmed)
    ) {
      try {
        const res = await apiFetch("admin_manage_addons.php", {
          method: "POST",
          body: JSON.stringify({
            action: "delete_category_mapping",
            target_category,
          }),
        });

        const data = await res.json().catch(() => null);

        if (data && (data.success || data.status === "success")) {
          Swal.fire("Deleted", "Mapping deleted successfully", "success");
          fetchData();
        } else {
          Swal.fire("Error", data?.message || "Failed to delete mapping", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete mapping", "error");
      }
    }
  };

  return {
    mappings,
    productAddonsList,
    categories,
    menuItems,
    inventoryItems,
    loading,
    isModalOpen,
    setIsModalOpen,
    isSaving,
    currentMapping,
    setCurrentMapping,
    isEditing,
    openModal,
    isProductAddonModalOpen,
    setIsProductAddonModalOpen,
    selectedProductForAddons,
    setSelectedProductForAddons,
    openProductAddonModal,
    handleAddAddon,
    handleAddonChange,
    handleRemoveAddon,
    handleSave,
    handleDelete,
    refreshData: fetchData,
  };
}
