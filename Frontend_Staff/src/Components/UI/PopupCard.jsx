import React, { useState, useEffect } from "react";
import { useCart } from "../../Context/CartContext";
import {
  FaShoppingCart,
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheckSquare,
} from "react-icons/fa";

const PopupCard = ({ image, title, description, price, item, closePopup }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [optionalIngredients, setOptionalIngredients] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [addonsList, setAddonsList] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isFetchingExtras, setIsFetchingExtras] = useState(false);

  useEffect(() => {
    if (item?.variants && item.variants.length > 0) {
      const firstAvailableVariant =
        item.variants.find((v) => v.inStock !== false && v.inStock !== 0) ||
        item.variants[0];
      setSelectedVariant(firstAvailableVariant);
    }
  }, [item]);

  useEffect(() => {
    if (item && selectedVariant) {
      const fetchExtras = async () => {
        setIsFetchingExtras(true);
        try {
          const recipeRes = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_recipe.php?menu_item_id=${item.id}&variant_name=${selectedVariant.size}`,
          );
          const recipeData = await recipeRes.json();
          if (recipeRes.ok && recipeData.status === "success") {
            const removables = recipeData.ingredients.filter(
              (ing) => ing.is_removable == 1,
            );
            setOptionalIngredients(removables);
          } else {
            setOptionalIngredients([]);
          }

          const addonsRes = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_addons.php?menu_item_id=${item.id}`,
          );
          const addonsData = await addonsRes.json();
          if (
            addonsRes.ok &&
            addonsData.status === "success" &&
            addonsData.addons
          ) {
            setAddonsList(addonsData.addons);
          } else {
            setAddonsList([]);
          }
        } catch (error) {
          console.error("Error fetching details:", error);
          setOptionalIngredients([]);
          setAddonsList([]);
        } finally {
          setIsFetchingExtras(false);
        }
      };
      fetchExtras();
    }
  }, [item, selectedVariant]);

  const toggleRemovable = (invId) =>
    setExcludedIds((prev) =>
      prev.includes(invId)
        ? prev.filter((id) => id !== invId)
        : [...prev, invId],
    );

  const toggleAddon = (addon) =>
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon],
    );

  const currentPrice = selectedVariant
    ? parseInt(selectedVariant.price)
    : parseInt(price);
  const addonsTotal = selectedAddons.reduce(
    (sum, addon) => sum + parseFloat(addon.addon_price),
    0,
  );
  const finalTotal = (currentPrice + addonsTotal) * quantity;

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    const excludedNames = excludedIds
      .map((id) => {
        const ing = optionalIngredients.find((i) => i.inventory_id === id);
        return ing ? ing.ingredient_name : null;
      })
      .filter(Boolean)
      .join(", ");

    let finalNote = specialNote;
    if (excludedNames) {
      finalNote = specialNote
        ? `Without: ${excludedNames} | ${specialNote}`
        : `Without: ${excludedNames}`;
    }

    addToCart({
      ...item,
      menuItemId: item.id,
      price: currentPrice,
      size: selectedVariant ? selectedVariant.size : "Regular",
      note: finalNote,
      excluded_ingredients: excludedIds,
      qty: quantity,
      id: selectedVariant ? `${item.id}-${selectedVariant.size}` : item.id,
    });

    selectedAddons.forEach((addon) => {
      addToCart({
        id: `addon-${addon.id}-${item.id}`,
        title: addon.addon_name,
        price: parseFloat(addon.addon_price),
        size: "Extra",
        note: `For ${title || item.name || "Item"}`,
        is_addon: true,
        addon_data: {
          inventory_id: addon.inventory_id,
          qty: addon.qty_to_deduct,
        },
        qty: quantity,
      });
    });

    closePopup();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.8)] backdrop-blur-[5px] z-[10000] flex items-center justify-center p-[15px] animate-[fadeIn_0.3s_ease] max-md:items-center max-md:p-[10px]" onClick={closePopup}>
      <div
        className="bg-[var(--panel-bg,#1a1a1a)] border border-[var(--border-color,#333)] rounded-[20px] w-full max-w-[400px] max-h-[85vh] overflow-y-auto shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative flex flex-col max-md:w-[92%] max-md:max-w-[350px] max-[380px]:max-w-[310px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-[#0a0a0a] [&::-webkit-scrollbar-track]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-[10px] hover:[&::-webkit-scrollbar-thumb]:bg-[#ef4444]"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative" }}
      >
        <button className="absolute top-[15px] right-[15px] bg-[rgba(0,0,0,0.6)] text-white border-none w-[34px] h-[34px] rounded-full flex justify-center items-center cursor-pointer z-[100] transition-all duration-300 backdrop-blur-[4px] hover:bg-[var(--brand-red,#ef4444)] hover:scale-110" onClick={closePopup}>
          <FaTimes size={16} />
        </button>

        <div className="w-full h-[220px] bg-white max-md:h-[160px] max-[380px]:h-[150px]">
          <img
            src={image || "https://placehold.co/600x400?text=No+Image"}
            alt={title}
            className="w-full h-full object-cover rounded-t-[20px]"
          />
        </div>

        <div className="p-[20px] flex flex-col gap-[18px] max-md:p-[15px] max-md:gap-[12px]">
          <div>
            <div className="flex justify-between items-start mb-[8px]">
              <h2 className="text-[var(--text-main,#fff)] m-0 text-[22px] font-extrabold leading-[1.2] font-['Oswald',sans-serif] max-md:text-[18px]">{title}</h2>
              <span className="text-[var(--brand-red,#ef4444)] font-extrabold text-[18px] whitespace-nowrap ml-[10px] max-md:text-[16px]">Rs {currentPrice}</span>
            </div>
            <p className="text-[var(--text-muted,#ccc)] text-[13px] m-0 max-md:text-[12px] max-md:mb-[5px]">{description}</p>
          </div>

          {/* SIZES */}
          {item?.variants && item.variants.length > 1 && (
            <div className="my-[15px]">
              <h4 className="text-[var(--text-main,#fff)] text-[14px] mb-[10px] font-bold max-md:text-[13px] max-md:mb-[8px]">Select Size</h4>
              <div className="flex flex-wrap gap-[10px]">
                {item.variants.map((variant, index) => {
                  const isActive =
                    selectedVariant && selectedVariant.size === variant.size;

                  const isOutOfStock =
                    variant.inStock === false ||
                    variant.inStock === 0 ||
                    variant.inStock === "0";

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!isOutOfStock) setSelectedVariant(variant);
                      }}
                      disabled={isOutOfStock}
                      className={`px-[16px] py-[8px] rounded-[8px] font-bold text-[13px] cursor-pointer transition-all duration-200 border max-md:px-[12px] max-md:py-[6px] max-md:text-[12px] max-md:rounded-[6px] ${isActive ? "bg-[var(--brand-red,#ef4444)] text-[var(--btn-text,#fff)] border-[var(--brand-red,#ef4444)]" : "bg-transparent text-[var(--text-muted,#aaa)] border-[var(--border-color,#444)]"}`}
                      style={
                        isOutOfStock
                          ? {
                            opacity: 0.5,
                            cursor: "not-allowed",
                            textDecoration: "line-through",
                            backgroundColor: "#f3f4f6",
                            color: "#9ca3af",
                            borderColor: "#e5e7eb",
                          }
                          : {}
                      }
                    >
                      {variant.size} <br />{" "}
                      <span className="text-[11px] opacity-80 font-normal">
                        {isOutOfStock ? "Sold Out" : `Rs ${variant.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DYNAMIC OPTIONAL INGREDIENTS */}
          {optionalIngredients.length > 0 && (
            <div className="my-[15px]">
              <h4 className="text-[var(--text-main,#fff)] text-[14px] mb-[10px] font-bold max-md:text-[13px] max-md:mb-[8px]">
                Ingredients (Uncheck to remove)
              </h4>
              <div className="grid grid-cols-2 gap-[10px] max-md:grid-cols-1 max-md:gap-[8px]">
                {isFetchingExtras ? (
                  <span className="loading-text">Loading...</span>
                ) : (
                  optionalIngredients.map((ing, index) => {
                    const isExcluded = excludedIds.includes(ing.inventory_id);
                    return (
                      <label
                        key={`ing-${index}`}
                        className={`flex items-center gap-[8px] px-[12px] py-[10px] rounded-[8px] border border-[#e2e8f0] text-[13px] cursor-pointer transition-all duration-200 font-medium max-md:px-[10px] max-md:py-[8px] max-md:text-[12px] ${isExcluded ? "text-[#94a3b8] line-through bg-[#f1f5f9] opacity-70" : "bg-[#f8f9fa] text-[#333]"}`}
                      >
                        <input
                          type="checkbox"
                          checked={!isExcluded}
                          onChange={() => toggleRemovable(ing.inventory_id)}
                          className="cursor-pointer"
                        />
                        {ing.ingredient_name}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC PAID ADD-ONS */}
          {addonsList.length > 0 && (
            <div className="my-[15px]">
              <h4 className="text-[var(--text-main,#fff)] text-[14px] mb-[10px] font-bold max-md:text-[13px] max-md:mb-[8px]">Extra Add-ons</h4>
              <div className="flex flex-wrap gap-[10px]">
                {addonsList.map((addon) => {
                  const isSelected = selectedAddons.find(
                    (a) => a.id === addon.id,
                  );
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`flex items-center justify-center gap-[6px] px-[14px] py-[10px] rounded-[8px] border border-[#e2e8f0] text-[13px] font-semibold cursor-pointer transition-all duration-200 max-md:px-[12px] max-md:py-[6px] max-md:text-[12px] max-md:rounded-[6px] ${isSelected ? "bg-[rgba(239,68,68,0.1)] border-[var(--brand-red,#ef4444)] text-[var(--brand-red,#ef4444)]" : "bg-white text-[#333]"}`}
                    >
                      {isSelected ? <FaCheckSquare /> : <FaPlus />}{" "}
                      {addon.addon_name}{" "}
                      <span className={`text-[12px] ${isSelected ? "text-[var(--brand-red,#ef4444)]" : "text-[var(--brand-red,#ef4444)]"}`}>
                        (+Rs {addon.addon_price})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="my-[15px]">
            <h4 className="text-[var(--text-main,#fff)] text-[14px] mb-[10px] font-bold max-md:text-[13px] max-md:mb-[8px]">
              Special Instructions (Optional)
            </h4>
            <textarea
              className="w-full bg-[var(--bg-body,#111)] text-[var(--text-main,#fff)] border border-[var(--border-color,#333)] rounded-[10px] p-[12px] text-[13px] outline-none resize-none transition-all duration-300 focus:border-[var(--brand-yellow,#555)]"
              placeholder="e.g. Cut in half, extra crispy..."
              rows="2"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
            ></textarea>
          </div>

          <div>
            <div className="flex justify-between items-center mb-[15px] max-md:my-[10px]">
              <div className="flex items-center bg-[var(--bg-body,#222)] border border-[var(--border-color,#333)] rounded-[30px] px-[12px] py-[6px] gap-[15px] max-md:px-[10px] max-md:py-[4px] max-md:gap-[10px]">
                <button className="bg-transparent border-none text-[var(--text-main,#fff)] cursor-pointer flex items-center p-[5px]" onClick={decreaseQuantity}>
                  <FaMinus size={10} />
                </button>
                <span className="text-[var(--text-main,#fff)] font-bold text-[15px] min-w-[15px] text-center max-md:text-[14px]">{quantity}</span>
                <button className="bg-transparent border-none text-[var(--text-main,#fff)] cursor-pointer flex items-center p-[5px]" onClick={increaseQuantity}>
                  <FaPlus size={10} />
                </button>
              </div>

              <div className="text-right">
                <div className="text-[var(--text-muted,#aaa)] text-[10px] uppercase tracking-[0.5px] mb-[2px]">Total</div>
                <div className="text-[var(--text-main,#fff)] text-[20px] font-black max-md:text-[18px]">Rs {finalTotal}</div>
              </div>
            </div>

            <button
              className="w-full bg-[var(--brand-red,#ef4444)] text-[var(--btn-text,#fff)] border-none rounded-[12px] p-[15px] font-extrabold text-[15px] tracking-[1px] cursor-pointer flex justify-center items-center gap-[10px] shadow-[var(--shadow-glow)] transition-all duration-200 active:scale-95 max-md:p-[12px] max-md:text-[14px] max-md:rounded-[10px]"
              onClick={handleAddToCart}
              disabled={
                selectedVariant &&
                (selectedVariant.inStock === false ||
                  selectedVariant.inStock === 0 ||
                  selectedVariant.inStock === "0")
              }
              style={
                selectedVariant &&
                  (selectedVariant.inStock === false ||
                    selectedVariant.inStock === 0 ||
                    selectedVariant.inStock === "0")
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : {}
              }
            >
              <FaShoppingCart size={16} /> ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupCard;