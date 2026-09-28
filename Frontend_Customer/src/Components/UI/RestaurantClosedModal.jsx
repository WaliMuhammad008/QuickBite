import React from "react";
import { FaClock, FaTimes, FaUtensils, FaStoreSlash, FaDoorClosed } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function RestaurantClosedModal({
  isOpen,
  onClose,
  storeStatus = {},
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const {
    closedTitle = "Restaurant is Temporarily Closed",
    closedMessage = "We are currently closed for online orders.",
    openTimeFormatted = "10:00 AM",
    closeTimeFormatted = "04:00 AM",
    closedReason = "hours",
  } = storeStatus;

  const handleBrowseMenu = () => {
    onClose();
    // If user was on /checkout, redirect them back to menu or homepage
    if (location.pathname.toLowerCase().includes("/checkout")) {
      navigate("/menu", { replace: true });
    }
  };

  return (
    <div className="fixed inset-0 z-[99999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#141418] border border-amber-500/30 dark:border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-black/60 overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleBrowseMenu}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-none cursor-pointer"
          aria-label="Close Notice"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Big Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
          {closedReason === "toggle" ? (
            <FaStoreSlash className="text-2xl sm:text-3xl animate-pulse" />
          ) : (
            <FaClock className="text-2xl sm:text-3xl animate-pulse" />
          )}
        </div>

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
          <FaDoorClosed className="text-[11px]" />
          <span>
            {closedReason === "toggle"
              ? "Orders Temporarily Paused"
              : `Operating Hours: ${openTimeFormatted} – ${closeTimeFormatted}`}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-['Oswald',sans-serif] font-black text-xl sm:text-2xl uppercase tracking-tight text-neutral-950 dark:text-white m-0 mb-2.5">
          {closedTitle}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto mb-6">
          {closedMessage}
        </p>

        {/* Schedule Info Box */}
        {closedReason === "hours" && (
          <div className="mb-6 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <FaClock className="text-xs" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Daily Timing
                </span>
                <span className="text-xs font-black text-neutral-900 dark:text-white font-mono">
                  {openTimeFormatted} to {closeTimeFormatted}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              Kitchen Closed
            </span>
          </div>
        )}

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleBrowseMenu}
          className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98] border-none cursor-pointer flex items-center justify-center gap-2"
        >
          <FaUtensils className="text-xs" />
          <span>Explore Delicious Menu</span>
        </button>

        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-3 m-0">
          You can browse items, but checkout will resume during open hours.
        </p>
      </div>
    </div>
  );
}
