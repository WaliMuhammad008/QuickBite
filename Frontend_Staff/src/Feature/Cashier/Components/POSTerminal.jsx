import React, { useState } from "react";
import Swal from "sweetalert2";

// Custom Hooks
import usePosCart from "../hooks/usePosCart";
import usePosMenu from "../hooks/usePosMenu";

// Atomic Subcomponents
import PosSearchHeader from "./POS/PosSearchHeader";
import CategoryFilters from "./POS/CategoryFilters";
import CategoryView from "./POS/CategoryView";
import MenuGrid from "./POS/MenuGrid";
import PosCart from "./POS/PosCart";
import PosItemModal from "./POS/PosItemModal";

export default function POSTerminal({
  onPlaceOrder,
  terminalResetTrigger,
  isMobileCartOpen: externalIsMobileCartOpen,
  setIsMobileCartOpen: externalSetIsMobileCartOpen,
  onCartCountChange,
}) {
  const [internalIsMobileCartOpen, setInternalIsMobileCartOpen] = useState(false);
  const isMobileCartOpen =
    externalIsMobileCartOpen !== undefined
      ? externalIsMobileCartOpen
      : internalIsMobileCartOpen;
  const setIsMobileCartOpen =
    externalSetIsMobileCartOpen || setInternalIsMobileCartOpen;

  const [customizationItem, setCustomizationItem] = useState(null);

  // 1. Menu & Catalog Hook
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    gstRate,
    deliveryFee,
    menuItems,
    categories,
    filteredItems,
    isMenuLoading,
    isSearching,
    isDrilldown,
  } = usePosMenu({ terminalResetTrigger });

  // 2. Cart & Checkout Hook
  const cartHook = usePosCart({
    gstRate,
    deliveryFee,
    onPlaceOrder,
    setIsMobileCartOpen,
    onCartCountChange,
  });

  // 3. Catalog Item Click Handler
  const handleItemClick = (item, openModal = false) => {
    if (openModal || (item.variants && item.variants.length > 1)) {
      setCustomizationItem(item);
    } else {
      const variant =
        item.variants && item.variants.length > 0
          ? item.variants[0]
          : { size: "Regular", price: item.price, inStock: 1 };

      const isOutOfStock =
        variant.inStock === false ||
        variant.inStock === 0 ||
        variant.inStock === "0";

      if (isOutOfStock) {
        Swal.fire({
          icon: "warning",
          title: "Sold Out",
          text: "This item is currently out of stock.",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      cartHook.addItemToCart({
        id: item.id,
        title: item.title,
        name: item.title,
        size: variant.size,
        variant: variant.size,
        price: parseFloat(variant.price || 0),
        qty: 1,
        quantity: 1,
        note: "",
        excluded_ingredients: [],
        selected_addons: [],
      });
    }
  };

  return (
    <div
      className="flex flex-col lg:flex-row items-start gap-4 sm:gap-5 w-full p-3 sm:p-4 lg:p-6 min-h-screen relative font-sans text-zinc-900 dark:text-zinc-100 pb-24 lg:pb-6"
      style={{ transform: "none", perspective: "none" }}
    >
      {/* LEFT: MENU CATALOG & SEARCH SECTION */}
      <div className="flex-1 min-w-0 w-full space-y-4 overflow-y-auto">
        <PosSearchHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          itemCount={
            isSearching || isDrilldown
              ? filteredItems.length
              : menuItems.length
          }
        />

        {/* Category Controls Bar (Drilldown / Search Mode) */}
        {(isDrilldown || isSearching) && (
          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory || "All"}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              setSearchTerm("");
            }}
            onBackToCategories={() => {
              setSelectedCategory(null);
              setSearchTerm("");
            }}
          />
        )}

        {/* Dynamic Catalog View */}
        {!isDrilldown && !isSearching ? (
          <CategoryView
            categories={categories}
            menuItems={menuItems}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        ) : (
          <MenuGrid
            items={filteredItems}
            isLoading={isMenuLoading}
            onItemClick={handleItemClick}
            searchTerm={searchTerm}
            onClearSearch={() => {
              setSearchTerm("");
              setSelectedCategory(null);
            }}
          />
        )}
      </div>

      {/* RIGHT: POS CART SIDEBAR / DRAWER */}
      <PosCart
        {...cartHook}
        gstRate={gstRate}
        isMobileCartOpen={isMobileCartOpen}
        setIsMobileCartOpen={setIsMobileCartOpen}
      />

      {/* ITEM CUSTOMIZATION MODAL */}
      {customizationItem && (
        <PosItemModal
          isOpen={Boolean(customizationItem)}
          onClose={() => setCustomizationItem(null)}
          menuItem={customizationItem}
          onAddToCart={cartHook.addItemToCart}
        />
      )}
    </div>
  );
}
