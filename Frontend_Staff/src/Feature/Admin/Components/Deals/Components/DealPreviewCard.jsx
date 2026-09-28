import React from "react";
import {
  FaTag,
  FaPercent,
  FaClock,
  FaLayerGroup,
  FaEye,
  FaImage,
} from "react-icons/fa";

export default function DealPreviewCard({
  logoPreview = "",
  dealForm = {},
  discountPercent = 0,
  dealPrice = 0,
  origPrice = 0,
  isPermanent = true,
  startTime = "12:00",
  endTime = "16:00",
  dayLimit = "",
  includedItems = [],
}) {
  return (
    <div className="lg:col-span-5 sticky top-6 self-start space-y-4">
      <div className="flex items-center gap-2 px-1">
        <FaEye className="text-amber-500 text-xs" />
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-neutral-400">
          Live Customer Portal Preview
        </span>
      </div>

      {/* Live Preview Card */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-3xl border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white overflow-hidden shadow-2xl flex flex-col justify-between">
        <div>
          {/* Media Banner */}
          <div className="relative h-52 bg-slate-100 dark:bg-black/60 flex items-center justify-center p-3">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-slate-400 dark:text-neutral-600">
                <FaImage className="text-4xl mx-auto mb-2 opacity-50" />
                <span className="text-xs font-bold">No Image Uploaded</span>
              </div>
            )}

            {/* Ribbon Tag */}
            <div className="absolute top-3.5 left-3.5 bg-amber-100/80 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider px-3 py-0.5 !rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
              <FaTag className="text-[10px]" />
              <span>{dealForm.badge_tag || "HOT DEAL"}</span>
            </div>

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute bottom-3.5 left-3.5 bg-emerald-500 text-neutral-950 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 !rounded-full shadow-md flex items-center gap-1">
                <FaPercent className="text-[9px]" />
                <span>{discountPercent}% OFF</span>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4">
            <div>
              <h4 className="m-0 text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide font-['Oswald',sans-serif]">
                {dealForm.title || "Your Deal Title"}
              </h4>
              <p className="m-0 mt-1 text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
                {dealForm.description ||
                  "Deal description and servings will appear here."}
              </p>
            </div>

            {/* Price & Schedule */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  Rs. {dealPrice > 0 ? dealPrice.toLocaleString() : "0"}
                </span>
                {origPrice > 0 && (
                  <span className="text-xs text-slate-400 dark:text-neutral-500 line-through">
                    Rs. {origPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {dayLimit > 0 && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    ⏳ {dayLimit} {parseInt(dayLimit) === 1 ? "Day" : "Days"} Limit
                  </span>
                )}
                <div className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                  <FaClock className="text-amber-500 dark:text-amber-400 text-[10px]" />
                  <span>{isPermanent ? "24/7" : `${startTime} - ${endTime}`}</span>
                </div>
              </div>
            </div>

            {/* Bundled Items Preview */}
            <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="text-[10px] uppercase font-extrabold text-slate-600 dark:text-neutral-400 flex items-center gap-1">
                <FaLayerGroup className="text-amber-500 dark:text-amber-400 text-[10px]" />
                <span>
                  Includes {includedItems.filter((i) => i.item_title.trim()).length} Items:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {includedItems.filter((i) => i.item_title.trim()).length > 0 ? (
                  includedItems
                    .filter((i) => i.item_title.trim())
                    .map((it, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-200 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-neutral-300 px-2 py-0.5 rounded-lg flex items-center gap-1.5"
                      >
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {it.quantity}x
                        </span>
                        <span className="truncate max-w-[140px]">
                          {it.item_title}
                        </span>
                        {it.size && it.size !== "Regular" && (
                          <span className="text-[9px] font-black text-slate-600 dark:text-neutral-300 bg-slate-300 dark:bg-white/10 px-1 py-0.2 rounded">
                            {it.size}
                          </span>
                        )}
                        {(it.is_customizable || it.flavor_mode === "choice") && (
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-black bg-amber-500/15 px-1 rounded">
                            Choice
                          </span>
                        )}
                      </span>
                    ))
                ) : (
                  <span className="text-xs text-slate-400 dark:text-neutral-500 italic">
                    No bundled items configured yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
