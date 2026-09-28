import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { apiFetch } from "../../../../../utils/apiHelper";
import { staffSocket } from "../../../../../utils/socket";

export function useMenuManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("items");

  // Real-time socket sync: update menu across all tabs & devices immediately
  useEffect(() => {
    const handleSync = () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    };

    staffSocket.on("refresh_menu", handleSync);
    staffSocket.on("refresh_kitchen", handleSync);

    return () => {
      staffSocket.off("refresh_menu", handleSync);
      staffSocket.off("refresh_kitchen", handleSync);
    };
  }, [queryClient]);

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenuForRecipe, setSelectedMenuForRecipe] = useState(null);

  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedItemForAddons, setSelectedItemForAddons] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    id: null,
    type: "",
    title: "",
    message: "",
  });

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const defaultMenuForm = {
    name: "",
    description: "",
    category: "",
    img: "",
    promo_banner_image: "",
    is_featured_banner: false,
    banner_order: 0,
    isAvailable: true,
    isTopDeal: false,
    isBestSeller: false,
    has_spice_option: true,
    variants: [{ size: "Regular", price: "" }],
    slider_placements: [],
  };
  const [menuForm, setMenuForm] = useState(defaultMenuForm);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const defaultCategoryForm = { name: "", img: "", show_on_hero: false };
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dovuegkwa";
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

  const { data: menuItems = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php?admin=1`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_categories.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const response = await apiFetch("inventory_api.php");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: customSliders = [] } = useQuery({
    queryKey: ["homepage_sliders"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_homepage_data.php`);
      const result = await response.json();
      if (result.success && result.data && result.data.sections) {
        return result.data.sections.filter(
          (s) =>
            s.section_type === "product_slider" &&
            s.content_data &&
            s.content_data.startsWith("custom:")
        );
      }
      return [];
    },
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const uploadToCloudinary = async (file) => {
    if (!file || typeof file === "string") return file;
    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.error) {
        showToast("Cloudinary Error: " + data.error.message, "error");
        return null;
      }
      return data.secure_url;
    } catch (err) {
      showToast("Failed to process or upload image.", "error");
      return null;
    }
  };

  const handleOpenAddons = (item) => {
    setSelectedItemForAddons(item);
    setIsAddonModalOpen(true);
  };

  const handleSaveMenu = async () => {
    const hasValidVariants =
      menuForm.variants &&
      menuForm.variants.length > 0 &&
      menuForm.variants[0].price !== "";

    if (!menuForm.name || !hasValidVariants) {
      return showToast(
        "Please fill the required details (Name and Price).",
        "error"
      );
    }

    setIsSavingItem(true);
    try {
      const finalImgUrl = await uploadToCloudinary(menuForm.img);
      if (!finalImgUrl && menuForm.img instanceof File) {
        return showToast("Image upload failed!", "error");
      }

      let finalPromoBannerUrl = menuForm.promo_banner_image;
      if (menuForm.promo_banner_image instanceof File) {
        finalPromoBannerUrl = await uploadToCloudinary(
          menuForm.promo_banner_image
        );
      }

      const payload = {
        ...menuForm,
        has_spice_option: menuForm.has_spice_option !== false && menuForm.has_spice_option !== 0 ? 1 : 0,
        img: finalImgUrl || "",
        promo_banner_image: finalPromoBannerUrl || "",
        is_featured_banner: menuForm.is_featured_banner ? 1 : 0,
        banner_order: parseInt(menuForm.banner_order || 0),
        auth_token: sessionStorage.getItem("auth_token"),
      };
      const endpoint = editingItem ? "update_menu.php" : "add_menu.php";
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(
          editingItem ? { ...payload, id: editingItem.id } : payload
        ),
      });

      const result = await response.json();
      if (result.success) {
        staffSocket.emit("refresh_kitchen");
        staffSocket.emit("refresh_menu");
        showToast(
          editingItem
            ? "Item updated successfully!"
            : "Item added successfully!",
          "success"
        );
        queryClient.invalidateQueries({ queryKey: ["menu"] });
        setIsMenuModalOpen(false);
      } else showToast("Error: " + result.message, "error");
    } catch (error) {
      showToast("Server connection failed.", "error");
    } finally {
      setIsSavingItem(false);
    }
  };

  const triggerDeleteMenu = (id) => {
    setConfirmDialog({
      show: true,
      id: id,
      type: "menu",
      title: "Delete Menu Item?",
      message:
        "Are you sure you want to remove this item? This action cannot be undone.",
    });
  };

  const executeDeleteMenu = async (id) => {
    try {
      const response = await apiFetch("delete_menu.php", {
        method: "POST",
        body: JSON.stringify({
          id: id,
          auth_token: sessionStorage.getItem("auth_token"),
        }),
      });
      const result = await response.json();
      if (result.success) {
        staffSocket.emit("refresh_kitchen");
        staffSocket.emit("refresh_menu");
        queryClient.setQueryData(["menu"], (old) =>
          old ? old.filter((item) => item.id !== id) : []
        );
        queryClient.invalidateQueries({ queryKey: ["menu"] });
        showToast("Item deleted successfully!", "success");
      } else {
        showToast("Failed to delete item: " + (result.message || ""), "error");
      }
    } catch (error) {
      showToast("Server connection failed.", "error");
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name || !categoryForm.img)
      return showToast("Please fill all category details!", "error");

    try {
      const finalImgUrl = categoryForm.img
        ? await uploadToCloudinary(categoryForm.img)
        : "";

      if (!finalImgUrl && categoryForm.img instanceof File) {
        return showToast("Image upload failed!", "error");
      }

      const payload = {
        name: categoryForm.name,
        img: finalImgUrl || categoryForm.img,
        show_on_hero: categoryForm.show_on_hero ? 1 : 0,
        auth_token: sessionStorage.getItem("auth_token"),
      };
      const endpoint = editingCategory ? "update_category.php" : "add_category.php";
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(
          editingCategory ? { ...payload, id: editingCategory.id } : payload
        ),
      });

      const result = await response.json();
      if (result.success) {
        staffSocket.emit("refresh_kitchen");
        staffSocket.emit("refresh_menu");
        showToast(
          editingCategory
            ? "Category updated successfully!"
            : "Category saved successfully!",
          "success"
        );
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsCategoryModalOpen(false);
      } else showToast("Error: " + result.message, "error");
    } catch (error) {
      showToast("Server connection failed.", "error");
    }
  };

  const triggerDeleteCategory = (id) => {
    setConfirmDialog({
      show: true,
      id: id,
      type: "category",
      title: "Delete Category & All Items?",
      message:
        "Deleting this category will permanently delete all menu items belonging to it. Are you sure you want to proceed?",
    });
  };

  const executeDeleteCategory = async (id) => {
    try {
      const response = await apiFetch("delete_category.php", {
        method: "POST",
        body: JSON.stringify({
          id: id,
          auth_token: sessionStorage.getItem("auth_token"),
        }),
      });
      const result = await response.json();
      if (result.success) {
        staffSocket.emit("refresh_kitchen");
        staffSocket.emit("refresh_menu");
        queryClient.setQueryData(["categories"], (old) =>
          old ? old.filter((item) => item.id !== id) : []
        );
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["menu"] });
        queryClient.invalidateQueries({ queryKey: ["menu_items"] });
        showToast(
          result.message || "Category and associated items deleted successfully!",
          "success"
        );
      } else {
        showToast("Failed to delete category: " + (result.message || ""), "error");
      }
    } catch (error) {
      showToast("Server connection failed.", "error");
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === "menu") executeDeleteMenu(confirmDialog.id);
    else executeDeleteCategory(confirmDialog.id);
    setConfirmDialog({ ...confirmDialog, show: false });
  };

  const handleEditItem = (item) => {
    setEditingItem(item);

    const initialSliderPlacements = customSliders
      .filter((slider) => {
        const idsStr = slider.content_data.split(":")[1];
        if (!idsStr) return false;
        const ids = idsStr.split(",").map((id) => parseInt(id));
        return ids.includes(parseInt(item.id));
      })
      .map((slider) => slider.id);

    setMenuForm({
      ...item,
      promo_banner_image: item.promo_banner_image || "",
      is_featured_banner:
        item.is_featured_banner == 1 || item.is_featured_banner === true,
      banner_order: parseInt(item.banner_order || 0),
      isAvailable: item.isAvailable == 1,
      isTopDeal: item.isTopDeal == 1,
      isBestSeller: item.isBestSeller == 1,
      has_spice_option: item.has_spice_option !== 0 && item.has_spice_option !== false,
      variants:
        Array.isArray(item.variants) && item.variants.length > 0
          ? item.variants.map((v) => ({ ...v, inStock: v.inStock != 0 }))
          : [{ size: "Regular", price: "", inStock: true }],
      slider_placements: initialSliderPlacements,
    });
    setIsMenuModalOpen(true);
  };

  return {
    activeTab,
    setActiveTab,
    isRecipeModalOpen,
    setIsRecipeModalOpen,
    selectedMenuForRecipe,
    setSelectedMenuForRecipe,
    isAddonModalOpen,
    setIsAddonModalOpen,
    selectedItemForAddons,
    toast,
    confirmDialog,
    setConfirmDialog,
    isMenuModalOpen,
    setIsMenuModalOpen,
    editingItem,
    setEditingItem,
    defaultMenuForm,
    menuForm,
    setMenuForm,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingCategory,
    setEditingCategory,
    defaultCategoryForm,
    categoryForm,
    setCategoryForm,
    menuItems,
    categories,
    inventoryItems,
    customSliders,
    handleOpenAddons,
    handleSaveMenu,
    triggerDeleteMenu,
    handleSaveCategory,
    triggerDeleteCategory,
    handleConfirmAction,
    handleEditItem,
    isSavingItem,
  };
}
