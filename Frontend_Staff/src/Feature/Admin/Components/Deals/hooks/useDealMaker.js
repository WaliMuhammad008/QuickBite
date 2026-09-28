import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useDealFormValidation } from "./useDealFormValidation";

export const AVAILABLE_ADDON_CATEGORIES = [
  { id: "drinks", name: "Cold Drinks", desc: "Coca-Cola, 7Up, Sprite, Mountain Dew, etc." },
  { id: "Potato Corner", name: "Potato Corner (Fries)", desc: "Plain Salted, Masala, Garlic Mayo, Loaded Fries" },
  { id: "Sauses", name: "Sauces & Dips", desc: "Garlic Mayo, Creamy Mayo, Chilli, Ketchup" },
  { id: "Grilled Wings", name: "Grilled & Hot Wings", desc: "Grilled Wings, Peri Peri Wings" },
  { id: "Fried Chicken", name: "Fried Chicken", desc: "Fried Chicken Pieces & Hot Wings" },
  { id: "Wraps", name: "Wraps & Rolls", desc: "Tortilla Wrap, Paratha Rolls" },
];

export function useDealMaker({ editDeal, onSuccess }) {
  const [dealForm, setDealForm] = useState({
    title: "",
    description: "",
    price: "",
    original_price: "",
    badge_tag: "HOT DEAL",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Promo Banner State
  const [isFeaturedBanner, setIsFeaturedBanner] = useState(false);
  const [promoBannerFile, setPromoBannerFile] = useState(null);
  const [promoBannerPreview, setPromoBannerPreview] = useState("");
  const [bannerOrder, setBannerOrder] = useState(0);
  const promoFileInputRef = useRef(null);

  const [isPermanent, setIsPermanent] = useState(true);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("16:00");
  const [dayLimit, setDayLimit] = useState("");

  // Dynamic Included Items & Choices Repeater State
  const [includedItems, setIncludedItems] = useState([
    {
      menu_item_id: 0,
      category: "",
      item_title: "",
      size: "Regular",
      flavor_name: "",
      flavor_mode: "fixed",
      quantity: 1,
      is_customizable: false,
      choice_group_name: "",
      options_str: "",
    },
  ]);

  const [selectedAddonCategories, setSelectedAddonCategories] = useState([
    "drinks",
    "Potato Corner",
    "Sauses",
    "Grilled Wings",
  ]);

  const { uploadToCloudinary, validateDealForm, buildDealPayload } = useDealFormValidation();

  const toggleAddonCategory = (catId) => {
    setSelectedAddonCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  // Fetch Menu items for quick auto-fill suggestions
  const { data: menuData = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_menu.php`
      );
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    },
  });

  const menuItems = menuData.filter((item) => item.isAvailable);

  // Initialize or Populate Form on Edit
  useEffect(() => {
    if (editDeal) {
      setDealForm({
        title: editDeal.title || "",
        description: editDeal.description || "",
        price: editDeal.price || "",
        original_price: editDeal.original_price || "",
        badge_tag: editDeal.badge_tag || editDeal.tag || "HOT DEAL",
      });
      setLogoPreview(editDeal.img || "");
      setPromoBannerPreview(editDeal.promo_banner_image || "");
      setIsFeaturedBanner(
        editDeal.is_featured_banner == 1 || editDeal.is_featured_banner === true
      );
      setBannerOrder(editDeal.banner_order || 0);
      setIsPermanent(
        editDeal.is_permanent == 1 || editDeal.is_permanent === true
      );
      if (editDeal.start_time)
        setStartTime(editDeal.start_time.substring(0, 5));
      if (editDeal.end_time) setEndTime(editDeal.end_time.substring(0, 5));
      setDayLimit(editDeal.day_limit ? parseInt(editDeal.day_limit) : "");

      if (
        editDeal.items &&
        Array.isArray(editDeal.items) &&
        editDeal.items.length > 0
      ) {
        setIncludedItems(
          editDeal.items.map((it) => ({
            menu_item_id: it.menu_item_id || 0,
            category: it.category || "",
            item_title: it.item_title || "",
            size: it.size || "Regular",
            flavor_name: it.flavor_name || "",
            flavor_mode: it.flavor_mode || (it.is_customizable ? "choice" : "fixed"),
            quantity: it.quantity || 1,
            is_customizable:
              it.is_customizable == 1 || it.is_customizable === true || it.flavor_mode === "choice",
            choice_group_name: it.choice_group_name || "",
            options_str:
              it.options_str ||
              (it.options ? it.options.map((o) => typeof o === "string" ? o : o.option_name || o.name).join(", ") : ""),
          }))
        );
      }

      if (editDeal.addon_categories) {
        const cats = Array.isArray(editDeal.addon_categories)
          ? editDeal.addon_categories
          : editDeal.addon_categories
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
        setSelectedAddonCategories(cats);
      } else {
        setSelectedAddonCategories(["drinks", "Potato Corner", "Sauses", "Grilled Wings"]);
      }
    } else {
      setDealForm({
        title: "",
        description: "",
        price: "",
        original_price: "",
        badge_tag: "HOT DEAL",
      });
      setLogoFile(null);
      setLogoPreview("");
      setPromoBannerFile(null);
      setPromoBannerPreview("");
      setIsFeaturedBanner(false);
      setBannerOrder(0);
      setIsPermanent(true);
      setStartTime("12:00");
      setEndTime("16:00");
      setDayLimit("");
      setSelectedAddonCategories(["drinks", "Potato Corner", "Sauses", "Grilled Wings"]);
      setIncludedItems([
        {
          menu_item_id: 0,
          category: "",
          item_title: "",
          size: "Regular",
          flavor_name: "",
          flavor_mode: "fixed",
          quantity: 1,
          is_customizable: false,
          choice_group_name: "",
          options_str: "",
        },
      ]);
    }
  }, [editDeal]);

  // Image Upload Handlers
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePromoBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPromoBannerFile(file);
      setPromoBannerPreview(URL.createObjectURL(file));
    }
  };

  // Repeater Management
  const handleAddItemRow = () => {
    setIncludedItems([
      ...includedItems,
      {
        menu_item_id: 0,
        category: "",
        item_title: "",
        size: "Regular",
        flavor_name: "",
        flavor_mode: "fixed",
        quantity: 1,
        is_customizable: false,
        choice_group_name: "",
        options_str: "",
      },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    const updated = includedItems.filter((_, i) => i !== index);
    setIncludedItems(
      updated.length > 0
        ? updated
        : [
            {
              menu_item_id: 0,
              category: "",
              item_title: "",
              size: "Regular",
              flavor_name: "",
              flavor_mode: "fixed",
              quantity: 1,
              is_customizable: false,
              choice_group_name: "",
              options_str: "",
            },
          ]
    );
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...includedItems];
    updated[index][field] = value;
    setIncludedItems(updated);
  };

  const handleUpdateItemRow = (index, updates) => {
    const updated = [...includedItems];
    updated[index] = { ...updated[index], ...updates };
    setIncludedItems(updated);
  };

  const handleQuickSelectMenu = (index, menuItemId) => {
    const selected = menuItems.find((m) => m.id == menuItemId);
    if (!selected) return;

    const updated = [...includedItems];
    const defaultSize = selected.variants && selected.variants.length > 0 ? selected.variants[0].size : 'Regular';
    updated[index] = {
      ...updated[index],
      menu_item_id: selected.id,
      category: selected.category || "",
      flavor_name: selected.name || selected.title,
      flavor_mode: "fixed",
      size: defaultSize,
      item_title: selected.name || selected.title,
    };
    setIncludedItems(updated);
  };

  // Save / Update Deal Submission
  const handleSaveDeal = async () => {
    const validItems = validateDealForm(dealForm, includedItems);
    if (!validItems) return;

    setIsSaving(true);
    try {
      let finalImgUrl = logoPreview;
      if (logoFile) {
        finalImgUrl = await uploadToCloudinary(logoFile);
      }

      let finalPromoUrl = promoBannerPreview;
      if (promoBannerFile) {
        finalPromoUrl = await uploadToCloudinary(promoBannerFile);
      }

      const payload = buildDealPayload({
        editDeal,
        dealForm,
        finalImgUrl,
        isPermanent,
        startTime,
        endTime,
        dayLimit,
        isFeaturedBanner,
        finalPromoUrl,
        bannerOrder,
        selectedAddonCategories,
        validItems,
      });

      const endpoint = editDeal ? "update_deal.php" : "save_deal.php";
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (response.ok && result.success) {
        Swal.fire({
          icon: "success",
          title: "Deal Published!",
          text: editDeal
            ? "Deal has been updated."
            : "New deal bundle added to live menu.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.message || "Failed to save deal");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Network Error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const dealPrice = parseFloat(dealForm.price) || 0;
  const origPrice = parseFloat(dealForm.original_price) || 0;
  const discountPercent =
    origPrice > dealPrice
      ? Math.round(((origPrice - dealPrice) / origPrice) * 100)
      : 0;

  return {
    dealForm,
    setDealForm,
    logoPreview,
    promoBannerPreview,
    isFeaturedBanner,
    setIsFeaturedBanner,
    bannerOrder,
    setBannerOrder,
    isPermanent,
    setIsPermanent,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    dayLimit,
    setDayLimit,
    includedItems,
    handleAddItemRow,
    handleRemoveItemRow,
    handleItemChange,
    handleUpdateItemRow,
    handleQuickSelectMenu,
    menuItems,
    availableAddonCategories: AVAILABLE_ADDON_CATEGORIES,
    selectedAddonCategories,
    toggleAddonCategory,
    handleLogoChange,
    handlePromoBannerChange,
    fileInputRef,
    promoFileInputRef,
    handleSaveDeal,
    isSaving,
    dealPrice,
    origPrice,
    discountPercent,
  };
}
