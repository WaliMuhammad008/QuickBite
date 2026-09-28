import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FaFire, FaShoppingBag, FaClock } from "react-icons/fa";
import PopupCard from "./PopupCard";
import { resolveImageUrl } from "../../utils/imageOptimizer";

const DealCard = ({ deal }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!deal) return null;

  const title = deal.title || deal.name || "Special Combo Deal";
  const dealPrice = parseFloat(deal.price || 0);
  const originalPrice = deal.original_price
    ? parseFloat(deal.original_price)
    : null;

  const savings =
    originalPrice && originalPrice > dealPrice ? originalPrice - dealPrice : 0;
  const savingsPct =
    originalPrice && originalPrice > dealPrice
      ? Math.round((savings / originalPrice) * 100)
      : 0;

  // Out-of-Stock check based strictly on inStock inventory flag
  const isOutOfStock =
    deal.inStock === false ||
    deal.inStock === 0 ||
    deal.inStock === "0";

  // Timing check: check if deal is time-bound and currently inactive
  const isPermanent = deal.is_permanent == 1 || deal.is_permanent === true;
  const isTimeInactive =
    !isPermanent &&
    (deal.is_time_active === false || deal.isTimeActive === false);

  const isUnavailable = isOutOfStock || isTimeInactive;

  const rawImage =
    deal.img || deal.image || deal.image_url || deal.photo || "";
  const finalImage = resolveImageUrl(rawImage, 600);

  const openPopup = (e) => {
    if (e) e.stopPropagation();
    if (isUnavailable) return;
    setIsOpen(true);
  };

  const closePopup = (e) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      <div
        onClick={openPopup}
        className={`group relative w-full bg-white dark:bg-neutral-900/90 border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between transition-all duration-300 shadow-md select-none ${
          isUnavailable
            ? "opacity-60 grayscale contrast-125 border-neutral-300 dark:border-neutral-800 pointer-events-none cursor-not-allowed"
            : "border-gray-200/80 dark:border-white/10 hover:border-amber-500/40 cursor-pointer"
        }`}
      >
        {/* 📸 IMAGE CONTAINER */}
        <div className="w-full h-28 min-[400px]:h-32 sm:h-40 md:h-44 flex items-center justify-center overflow-hidden my-1 relative rounded-lg sm:rounded-xl bg-gray-50 dark:bg-neutral-800/60 transition-colors duration-300 group-hover:bg-amber-400/10 dark:group-hover:bg-amber-400/5">
          {/* Animated Bottom-to-Top Amber Background Layer */}
          {!isUnavailable && (
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

          {/* Time Inactive Blackout Overlay & Badge */}
          {!isOutOfStock && isTimeInactive && (
            <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 rounded-lg sm:rounded-xl pointer-events-none text-center">
              <span className="bg-neutral-950/95 text-amber-400 border border-amber-500/40 text-[9px] sm:text-[10px] font-black uppercase tracking-wider font-['Oswald',sans-serif] px-2.5 py-1 rounded-full shadow-2xl flex items-center gap-1">
                <FaClock className="text-amber-400 text-[10px]" />
                {deal.time_window_text || "Scheduled Deal"}
              </span>
              <span className="text-[9px] text-white/90 font-bold mt-1 tracking-wide uppercase">
                Currently Closed
              </span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-wrap gap-1 items-center pointer-events-none">
            {isTimeInactive ? (
              <span className="inline-flex items-center gap-1 backdrop-blur-md bg-neutral-900/90 text-amber-300 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs border border-amber-400/30 tracking-wide uppercase">
                <FaClock className="text-[8px] text-amber-300" />
                {deal.time_window_text || "TIMED"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 backdrop-blur-md bg-red-600/95 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs border border-white/20 tracking-wide uppercase">
                <FaFire className="text-[8px] text-amber-300" />
                {deal.badge_tag || deal.tag || "DEAL"}
              </span>
            )}
          </div>

          {/* Food Cutout Image */}
          <img
            src={finalImage}
            alt={title}
            loading="lazy"
            decoding="async"
            className="relative z-10 w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105 p-1"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x300?text=Combo+Deal";
            }}
          />
        </div>

        {/* 📝 TITLE */}
        <h5
          className={`text-xs sm:text-base font-bold font-['Oswald',sans-serif] tracking-wide uppercase line-clamp-1 mt-1 text-left transition-colors m-0 ${
            isUnavailable ? "text-neutral-500 dark:text-neutral-400" : "text-gray-900 dark:text-white group-hover:text-amber-500"
          }`}
          title={title}
        >
          {title}
        </h5>

        {/* 💰 BOTTOM BAR (PRICE & ACTION) */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 dark:border-white/5">
          {/* Price */}
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-tight font-['Oswald',sans-serif] ${
              isUnavailable ? "text-neutral-400 dark:text-neutral-500" : "text-amber-500 dark:text-amber-400"
            }`}>
              Rs
            </span>
            <span className={`text-xs sm:text-sm md:text-base font-bold font-['Oswald',sans-serif] ${
              isUnavailable ? "text-neutral-400 dark:text-neutral-500" : "text-amber-500 dark:text-amber-400"
            }`}>
              {dealPrice}
            </span>
            {originalPrice && originalPrice > dealPrice && (
              <span className="text-[9px] sm:text-xs text-gray-400 dark:text-neutral-500 line-through font-semibold font-['Oswald',sans-serif] ml-0.5">
                {Math.round(originalPrice)}
              </span>
            )}
          </div>

          {/* Add Button */}
          <button
            type="button"
            disabled={isUnavailable}
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-bold shadow-sm border-none transition-all ${
              isUnavailable
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60"
                : "bg-amber-500 hover:bg-amber-400 text-black active:scale-95 cursor-pointer"
            }`}
            onClick={(e) => {
              if (isUnavailable) {
                e.stopPropagation();
                return;
              }
              openPopup(e);
            }}
            aria-label={isOutOfStock ? "Out of Stock" : isTimeInactive ? "Time Closed" : "Customize deal"}
          >
            {isTimeInactive ? (
              <FaClock className="text-[10px] sm:text-xs text-amber-500/70" />
            ) : (
              <FaShoppingBag className="text-[10px] sm:text-xs" />
            )}
          </button>
        </div>
      </div>

      {/* 🚀 MODAL PORTAL */}
      {isOpen &&
        !isUnavailable &&
        ReactDOM.createPortal(
          <PopupCard
            item={{
              ...deal,
              is_deal: true,
            }}
            image={finalImage}
            title={title}
            description={deal.description || deal.items_description}
            price={dealPrice}
            isDeal={true}
            closePopup={closePopup}
          />,
          document.body
        )}
    </>
  );
};

export default DealCard;
