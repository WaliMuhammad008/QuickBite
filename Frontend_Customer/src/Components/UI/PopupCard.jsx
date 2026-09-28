import React from "react";
import { FaStar } from "react-icons/fa";
import { getCategoryIcon } from "./PopupCard/comboHelpers";
import { usePopupCard } from "./PopupCard/hooks/usePopupCard";

// Atomic Subcomponents
import PopupImageGallery from "./PopupCard/Components/PopupImageGallery";
import ItemVariantList from "./PopupCard/Components/ItemVariantList";
import ItemSpiceSelector from "./PopupCard/Components/ItemSpiceSelector";
import DealComboMatrix from "./PopupCard/Components/DealComboMatrix";
import ProductCustomAddonsList from "./PopupCard/Components/ProductCustomAddonsList";
import ItemAddonsPicker from "./PopupCard/Components/ItemAddonsPicker";
import ItemRemovables from "./PopupCard/Components/ItemRemovables";
import ItemQuantityFooter from "./PopupCard/Components/ItemQuantityFooter";

const PopupCard = ({ image, title, description, price, item, closePopup }) => {
  const cardState = usePopupCard({
    item,
    price,
    title,
    image,
    description,
    closePopup,
  });

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={cardState.handleCloseModal}
    >
      <div
        className="relative w-full max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] lg:h-[82vh] lg:max-h-[640px] xl:max-h-[720px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col lg:flex-row-reverse shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ 1. RIGHT COLUMN (Desktop Visual & Purchase Area) / TOP BANNER (Mobile) ═══ */}
        <div className="relative w-full lg:w-[320px] xl:w-[400px] bg-gradient-to-b from-gray-100 to-white dark:from-neutral-800/80 dark:to-neutral-900 flex flex-col justify-between p-4 sm:p-5 lg:p-5 xl:p-6 overflow-hidden shrink-0 lg:border-l lg:border-gray-200/80 dark:lg:border-neutral-800">
          <PopupImageGallery
            finalImage={cardState.finalImage}
            title={title}
            itemName={item?.name}
            handleCloseModal={cardState.handleCloseModal}
          />

          {/* Desktop Purchase Action Block */}
          <ItemQuantityFooter
            mode="desktop"
            quantity={cardState.quantity}
            increaseQuantity={cardState.increaseQuantity}
            decreaseQuantity={cardState.decreaseQuantity}
            grandTotal={cardState.grandTotal}
            handleAddToCart={cardState.handleAddToCart}
            isOutOfStock={cardState.isOutOfStock}
          />
        </div>

        {/* ═══ 2. LEFT COLUMN (Desktop Scrollable Details) / BODY (Mobile) ═══ */}
        <div className="flex-1 overflow-y-auto flex flex-col justify-between [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="p-4 sm:p-6 space-y-4">
            {/* Header Title */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 font-['Oswald',sans-serif]">
                  {cardState.isDeal
                    ? item?.badge_tag || item?.tag
                      ? `🔥 ${item?.badge_tag || item?.tag}`
                      : "🔥 EXCLUSIVE DEAL"
                    : "Customize Your Order"}
                </span>
                {(() => {
                  const reviewCount = Number(item?.total_reviews || item?.review_count || item?.reviews_count || 0);
                  const avgRating = Number(item?.avg_rating || item?.rating || 0);
                  const hasReviews = reviewCount > 0 && avgRating > 0;

                  if (!hasReviews) return null;

                  return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-400/15 text-amber-500 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/30">
                      <FaStar className="text-[9px] text-amber-400" />
                      <span>{avgRating.toFixed(1)}</span>
                      <span className="text-neutral-400 font-normal">({reviewCount})</span>
                    </span>
                  );
                })()}
                {cardState.isDeal && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Value Pack
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-gray-900 dark:text-white m-0 mt-0.5">
                {title ||
                  item?.name ||
                  (cardState.isDeal
                    ? "Combo Deal"
                    : "Product Customization")}
              </h3>
              {cardState.rawDesc && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed m-0">
                  {cardState.rawDesc}
                </p>
              )}
            </div>

            {/* 1. Combo Deal Accordions (Deals Only) */}
            <DealComboMatrix
              isDeal={cardState.isDeal}
              comboItems={cardState.comboItems}
              openSections={cardState.openSections}
              toggleSection={cardState.toggleSection}
              hasPizzaInCombo={cardState.hasPizzaInCombo}
              selectedPizza={cardState.selectedPizza}
              setSelectedPizza={cardState.setSelectedPizza}
              hasFriesInCombo={cardState.hasFriesInCombo}
              selectedFries={cardState.selectedFries}
              setSelectedFries={cardState.setSelectedFries}
              hasDrinkInCombo={cardState.hasDrinkInCombo}
              selectedDrink={cardState.selectedDrink}
              setSelectedDrink={cardState.setSelectedDrink}
              dynamicSelections={cardState.dynamicSelections}
              setDynamicSelection={cardState.setDynamicSelection}
            />

            {/* 2. Choose Size / Portion (Regular Products) */}
            <ItemVariantList
              isDeal={cardState.isDeal}
              fullItem={cardState.fullItem}
              selectedVariant={cardState.selectedVariant}
              setSelectedVariant={cardState.setSelectedVariant}
            />

            {/* 3. Choose Spice Level (1-Tap Chips) */}
            <ItemSpiceSelector
              isDeal={cardState.isDeal}
              hasSpiceOption={cardState.hasSpiceOption}
              selectedSpice={cardState.selectedSpice}
              setSelectedSpice={cardState.setSelectedSpice}
            />

            {/* 4. Remove Ingredients / Free Modifiers */}
            <ItemRemovables
              isDeal={cardState.isDeal}
              optionalIngredients={cardState.optionalIngredients}
              openSections={cardState.openSections}
              toggleSection={cardState.toggleSection}
              excludedIds={cardState.excludedIds}
              toggleRemovable={cardState.toggleRemovable}
            />

            {/* 5. Product-Specific Custom Add-ons */}
            <ProductCustomAddonsList
              productAddons={cardState.productCustomAddons}
              selectedProductAddons={cardState.selectedProductAddons}
              toggleProductAddon={cardState.toggleProductAddon}
            />

            {/* 6. Dynamic Mapped Addon Groups (Drinks, Dips, Sides) */}
            <ItemAddonsPicker
              mappedAddonGroups={cardState.mappedAddonGroups}
              openSections={cardState.openSections}
              toggleSection={cardState.toggleSection}
              selectedUpsells={cardState.selectedUpsells}
              toggleMappedAddon={cardState.toggleMappedAddon}
              getCategoryIcon={getCategoryIcon}
            />

            {/* 7. Special Cooking Instructions Input */}
            <ItemQuantityFooter
              mode="note_only"
              specialNote={cardState.specialNote}
              setSpecialNote={cardState.setSpecialNote}
            />
          </div>

          {/* ═══ 3. MOBILE STICKY BOTTOM CHECKOUT ACTION BAR ═══ */}
          <ItemQuantityFooter
            mode="mobile"
            quantity={cardState.quantity}
            increaseQuantity={cardState.increaseQuantity}
            decreaseQuantity={cardState.decreaseQuantity}
            grandTotal={cardState.grandTotal}
            handleAddToCart={cardState.handleAddToCart}
            isOutOfStock={cardState.isOutOfStock}
          />
        </div>
      </div>
    </div>
  );
};

export default PopupCard;