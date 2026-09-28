import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useCart } from "../../Context/CartContext";
import { FaShoppingBag, FaFire, FaCrown, FaStar } from "react-icons/fa";
import PopupCard from "./PopupCard";
import DealCard from "./DealCard";
import { resolveImageUrl } from "../../utils/imageOptimizer";

const ProductCard = ({
  image,
  title,
  description,
  price,
  item,
  isTopDeal,
  isBestSeller,
}) => {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  // If this item is explicitly a combo deal, render the specialized DealCard
  if (item?.is_deal === true) {
    return <DealCard deal={item} />;
  }

  const finalTitle = title || item?.name || item?.title || "Delicious Item";
  const finalDesc =
    description ||
    item?.desc ||
    item?.description ||
    item?.items_description ||
    "Spicy, crunchy, and freshly prepared for you.";
  const finalPrice = price || item?.price || 0;
  const originalPrice = item?.original_price || item?.originalPrice || null;
  const customTag = item?.tag || null;

  // Dynamic Out-of-Stock check based strictly on inStock inventory flag
  const isOutOfStock =
    item?.inStock === false ||
    item?.inStock === 0 ||
    item?.inStock === "0" ||
    (Array.isArray(item?.variants) &&
      item.variants.length > 0 &&
      item.variants.every(
        (v) =>
          v.inStock === false ||
          v.in_stock === false ||
          v.in_stock === 0 ||
          v.in_stock === "0"
      ));

  // Resolve raw image across all backend API fields
  const rawImage =
    image ||
    item?.image ||
    item?.img ||
    item?.image_url ||
    item?.photo ||
    item?.img_url ||
    item?.image_path ||
    "";

  const finalImage = resolveImageUrl(rawImage, 600);

  const openPopup = (e) => {
    if (e) e.stopPropagation();
    if (isOutOfStock) return;
    setIsOpen(true);
  };

  const closePopup = (e) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      <div
        className={`group relative w-full bg-white dark:bg-neutral-900/90 border rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 xl:p-4 flex flex-col justify-between transition-all duration-300 shadow-md select-none ${
          isOutOfStock
            ? "opacity-60 grayscale contrast-125 border-neutral-300 dark:border-neutral-800 pointer-events-none cursor-not-allowed"
            : "border-gray-200/80 dark:border-white/10 hover:border-amber-500/40 cursor-pointer"
        }`}
        onClick={openPopup}
      >
        {/* 📸 IMAGE CONTAINER WITH BOTTOM-TO-TOP RICH AMBER FILL */}
        <div className="w-full h-28 min-[400px]:h-32 sm:h-40 md:h-38 xl:h-44 flex items-center justify-center overflow-hidden my-1 relative rounded-lg sm:rounded-xl bg-gray-50 dark:bg-neutral-800/60 transition-colors duration-300 group-hover:bg-amber-400/10 dark:group-hover:bg-amber-400/5">
          {/* Animated Bottom-to-Top Amber Background Layer */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-amber-400 dark:bg-amber-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0 pointer-events-none rounded-lg sm:rounded-xl" />
          )}

          {/* Out of Stock Blackout Overlay & Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 rounded-lg sm:rounded-xl pointer-events-none">
              <span className="bg-neutral-950/90 text-white border border-white/20 text-[10px] sm:text-xs font-black uppercase tracking-wider font-['Oswald',sans-serif] px-3 py-1 rounded-full shadow-2xl">
                Out of Stock
              </span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-wrap gap-1 items-center pointer-events-none">
            {customTag ? (
              <span className="inline-flex items-center gap-1 backdrop-blur-md bg-red-600/95 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs border border-white/20 tracking-wide uppercase">
                <FaFire className="text-[8px] text-amber-300" /> {customTag}
              </span>
            ) : isTopDeal ? (
              <span className="inline-flex items-center gap-1 backdrop-blur-md bg-red-600/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs border border-white/20 tracking-wide uppercase">
                <FaFire className="text-[8px] text-amber-300" /> Deal
              </span>
            ) : null}
            {isBestSeller && !customTag && (
              <span className="inline-flex items-center gap-1 backdrop-blur-md bg-black/60 text-amber-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs border border-amber-400/30 tracking-wide uppercase">
                <FaCrown className="text-[8px] text-amber-400" /> Best
              </span>
            )}
          </div>

          {/* Food Cutout Image */}
          <img
            src={finalImage}
            alt={finalTitle}
            loading="lazy"
            decoding="async"
            className="relative z-10 w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105 p-1"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=Delicious+Food";
            }}
          />
        </div>

        {/* 📝 TITLE & DYNAMIC RATING */}
        <div>
          <h5
            className={`text-xs sm:text-base font-bold font-['Oswald',sans-serif] tracking-wide uppercase line-clamp-1 mt-1 text-left transition-colors m-0 ${
              isOutOfStock ? "text-neutral-500 dark:text-neutral-400" : "text-gray-900 dark:text-white group-hover:text-amber-500"
            }`}
            title={finalTitle}
          >
            {finalTitle}
          </h5>

          {/* Social Proof Rating - 100% Dynamic */}
          {(() => {
            const reviewCount = Number(item?.total_reviews || item?.review_count || item?.reviews_count || 0);
            const avgRating = Number(item?.avg_rating || item?.rating || 0);
            const hasReviews = reviewCount > 0 && avgRating > 0;

            if (!hasReviews) return null;

            return (
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mt-1 w-fit">
                <span className="text-amber-500 text-xs">★</span>
                <span>{avgRating.toFixed(1)}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">({reviewCount})</span>
              </div>
            );
          })()}
        </div>

        {/* 💰 BOTTOM BAR (PRICE & ACTION) */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 dark:border-white/5">
          {/* Price */}
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-tight font-['Oswald',sans-serif] ${
              isOutOfStock ? "text-neutral-400 dark:text-neutral-500" : "text-amber-500 dark:text-amber-400"
            }`}>
              Rs
            </span>
            <span className={`text-xs sm:text-sm md:text-base font-bold font-['Oswald',sans-serif] ${
              isOutOfStock ? "text-neutral-400 dark:text-neutral-500" : "text-amber-500 dark:text-amber-400"
            }`}>
              {finalPrice}
            </span>
            {originalPrice && parseFloat(originalPrice) > parseFloat(finalPrice) && (
              <span className="text-[9px] sm:text-xs text-gray-400 dark:text-neutral-500 line-through font-semibold font-['Oswald',sans-serif] ml-0.5">
                {Math.round(originalPrice)}
              </span>
            )}
          </div>

          {/* Add Button */}
          <button
            type="button"
            disabled={isOutOfStock}
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-bold shadow-sm border-none transition-all ${
              isOutOfStock
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60"
                : "bg-amber-500 hover:bg-amber-400 text-black active:scale-95 cursor-pointer"
            }`}
            onClick={(e) => {
              if (isOutOfStock) {
                e.stopPropagation();
                return;
              }
              openPopup(e);
            }}
            aria-label={isOutOfStock ? "Out of Stock" : "Add to cart"}
          >
            <FaShoppingBag className="text-[10px] sm:text-xs" />
          </button>
        </div>
      </div>

      {/* 🚀 PORTAL TO PREVENT MODAL CLIPPING */}
      {isOpen &&
        !isOutOfStock &&
        ReactDOM.createPortal(
          <PopupCard
            item={item}
            image={finalImage}
            title={finalTitle}
            description={finalDesc}
            price={finalPrice}
            isDeal={false}
            closePopup={closePopup}
          />,
          document.body
        )}
    </>
  );
};

export default ProductCard;