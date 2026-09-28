import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

export function useDealFormValidation() {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dovuegkwa";
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

  const uploadToCloudinary = async (file) => {
    let fileToUpload = file;
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      fileToUpload = await imageCompression(file, options);
    } catch (err) {
      console.warn("Compression warning:", err);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Image upload failed");
    return data.secure_url;
  };

  const validateDealForm = (dealForm, includedItems) => {
    if (!dealForm.title.trim()) {
      Swal.fire("Validation Error", "Please provide a deal title.", "warning");
      return false;
    }
    const priceNum = Number(dealForm.price);
    if (!dealForm.price || isNaN(priceNum) || priceNum <= 0) {
      Swal.fire("Validation Error", "Please provide a valid deal price.", "warning");
      return false;
    }

    const origPriceNum = Number(dealForm.original_price);
    if (dealForm.original_price && !isNaN(origPriceNum) && origPriceNum > 0 && origPriceNum <= priceNum) {
      Swal.fire(
        "Validation Error",
        "Original price must be strictly higher than the discounted deal price.",
        "warning"
      );
      return false;
    }

    const validItems = includedItems.filter(
      (it) => it.item_title.trim() !== "" && (parseInt(it.quantity) || 0) >= 1
    );
    if (validItems.length === 0) {
      Swal.fire(
        "Validation Error",
        "Please add at least 1 bundled item with a quantity of 1 or more.",
        "warning"
      );
      return false;
    }

    return validItems;
  };

  const buildDealPayload = ({
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
  }) => {
    return {
      id: editDeal ? editDeal.id : undefined,
      title: dealForm.title.trim(),
      description: dealForm.description.trim(),
      price: parseFloat(dealForm.price),
      original_price: dealForm.original_price
        ? parseFloat(dealForm.original_price)
        : null,
      badge_tag: dealForm.badge_tag.trim(),
      img: finalImgUrl,
      is_permanent: isPermanent ? 1 : 0,
      start_time: isPermanent ? null : startTime,
      end_time: isPermanent ? null : endTime,
      day_limit: dayLimit && parseInt(dayLimit) > 0 ? parseInt(dayLimit) : null,
      is_featured_banner: isFeaturedBanner ? 1 : 0,
      promo_banner_image: isFeaturedBanner ? finalPromoUrl : null,
      banner_order: isFeaturedBanner ? parseInt(bannerOrder) || 0 : 0,
      addon_categories: selectedAddonCategories.join(","),
      items: validItems.map((it) => ({
        menu_item_id: it.menu_item_id ? parseInt(it.menu_item_id) : 0,
        category: it.category ? it.category.trim() : null,
        item_title: it.item_title.trim(),
        size: it.size ? it.size.trim() : 'Regular',
        flavor_name: it.flavor_name ? it.flavor_name.trim() : null,
        flavor_mode: it.flavor_mode ? it.flavor_mode.trim() : (it.is_customizable ? 'choice' : 'fixed'),
        quantity: parseInt(it.quantity) || 1,
        is_customizable: (it.flavor_mode === 'choice' || it.is_customizable) ? 1 : 0,
        choice_group_name: (it.flavor_mode === 'choice' || it.is_customizable) && it.choice_group_name ? it.choice_group_name.trim() : null,
        options_str: (it.flavor_mode === 'choice' || it.is_customizable) && it.options_str ? it.options_str.trim() : null,
      })),
    };
  };

  return {
    uploadToCloudinary,
    validateDealForm,
    buildDealPayload,
  };
}
