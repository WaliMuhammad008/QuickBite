import React from "react";
import {
  FaTrash,
  FaClock,
  FaEdit,
  FaLayerGroup,
  FaTag,
  FaPercent,
  FaHourglassHalf,
} from "react-icons/fa";
import { resolveImageUrl } from "../../../../../utils/imageOptimizer";

export default function DealCardItem({
  deal,
  onEdit,
  handleToggleStatus,
  handleDelete,
}) {
  const isActive = deal.is_active == 1 || deal.is_active === true;
  const isPermanent = deal.is_permanent == 1 || deal.is_permanent === true;
  const items = deal.items || [];
  const dealPrice = parseFloat(deal.price) || 0;
  const origPrice = parseFloat(deal.original_price) || 0;
  const discountPercent =
    origPrice > dealPrice
      ? Math.round(((origPrice - dealPrice) / origPrice) * 100)
      : 0;

  const getExpiryStatus = () => {
    if (!deal.day_limit || !deal.expires_at) return null;
    const now = new Date().getTime();
    const expiry = new Date(deal.expires_at).getTime();
    const diff = expiry - now;

    if (diff <= 0 || deal.is_expired) {
      return {
        label: "Expired",
        colorClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        isExpired: true,
      };
    }

    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    let timeText = "";
    if (daysLeft > 0) {
      timeText = `${daysLeft}d ${hoursLeft}h left`;
    } else {
      timeText = `${hoursLeft}h left`;
    }

    return {
      label: `${timeText} (${deal.day_limit}d limit)`,
      colorClass:
        "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      isExpired: false,
    };
  };

  const expiryInfo = getExpiryStatus();

  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white overflow-hidden shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-all group">
      <div>
        {/* Card Media Banner */}
        <div className="relative h-44 sm:h-48 bg-slate-100 dark:bg-black/40 overflow-hidden flex items-center justify-center p-3">
          <img
            src={resolveImageUrl(deal.img, 400)}
            alt={deal.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x300?text=Deal+Image";
            }}
          />

          {/* Floating Badge Tag */}
          <div className="absolute top-3 left-3 bg-amber-100/80 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider px-3 py-0.5 !rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
            <FaTag className="text-[10px]" />
            <span>{deal.badge_tag || deal.tag || "HOT DEAL"}</span>
          </div>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute bottom-3 left-3 bg-emerald-500 text-neutral-950 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 !rounded-full shadow-md flex items-center gap-1">
              <FaPercent className="text-[9px]" />
              <span>{discountPercent}% OFF</span>
            </div>
          )}

          {/* Status Pill Toggle */}
          <button
            type="button"
            onClick={() => handleToggleStatus(deal.id, deal.is_active)}
            className={`absolute top-3 right-3 text-xs font-bold uppercase tracking-wider px-3 py-1 !rounded-full border cursor-pointer transition-all shadow-md active:scale-90 ${
              isActive
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
            }`}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 space-y-3">
          <div>
            {expiryInfo && (
              <div
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border mb-1.5 ${expiryInfo.colorClass}`}
              >
                <FaHourglassHalf className="text-[9px]" />
                <span>{expiryInfo.label}</span>
              </div>
            )}
            <h4 className="m-0 text-base font-black text-slate-900 dark:text-white uppercase tracking-wide font-['Oswald',sans-serif]">
              {deal.title}
            </h4>
            {deal.description && (
              <p className="m-0 mt-1 text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
                {deal.description}
              </p>
            )}
          </div>

          {/* Price & Schedule */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                Rs. {dealPrice.toLocaleString()}
              </span>
              {origPrice > 0 && (
                <span className="text-xs text-slate-400 dark:text-neutral-500 line-through font-mono">
                  Rs. {origPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5">
              <FaClock className="text-amber-500 dark:text-amber-400 text-[10px]" />
              <span>
                {isPermanent
                  ? "24/7"
                  : `${deal.start_time?.substring(0, 5) || "00:00"} - ${
                      deal.end_time?.substring(0, 5) || "23:59"
                    }`}
              </span>
            </div>
          </div>

          {/* Bundled Items Overview */}
          {items.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
              <div className="text-[10px] uppercase font-extrabold text-slate-600 dark:text-neutral-400 flex items-center gap-1 tracking-wider">
                <FaLayerGroup className="text-amber-500 dark:text-amber-400 text-[10px]" />
                <span>Includes {items.length} Bundled Items:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((it, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200 px-2 py-0.5 rounded-lg flex items-center gap-1"
                  >
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {it.quantity}x
                    </span>
                    <span className="truncate max-w-[130px]">
                      {it.item_title}
                    </span>
                    {it.is_customizable && (
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-black bg-amber-500/15 px-1 rounded">
                        Choice
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-3 sm:px-5 sm:py-3.5 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(deal)}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-amber-500 hover:text-neutral-950 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
        >
          <FaEdit className="text-xs" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={() => handleDelete(deal.id, deal.title)}
          className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
        >
          <FaTrash className="text-xs" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
