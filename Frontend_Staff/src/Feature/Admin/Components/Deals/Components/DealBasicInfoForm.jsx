import React from "react";
import { FaTag, FaCalendarAlt } from "react-icons/fa";
import DealImageUploader from "./DealImageUploader";
import DealPricingControls from "./DealPricingControls";

export default function DealBasicInfoForm({
  dealForm = {},
  setDealForm,
  discountPercent = 0,
  dealPrice = 0,
  origPrice = 0,
  fileInputRef,
  handleLogoChange,
  logoPreview = "",
  isPermanent = true,
  setIsPermanent,
  startTime = "12:00",
  setStartTime,
  endTime = "16:00",
  setEndTime,
  dayLimit = "",
  setDayLimit,
  isFeaturedBanner = false,
  setIsFeaturedBanner,
  promoFileInputRef,
  handlePromoBannerChange,
  promoBannerPreview = "",
  bannerOrder = 0,
  setBannerOrder,
}) {
  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <FaTag className="text-amber-500 text-sm" />
        <h3 className="m-0 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
          1. General Information & Pricing
        </h3>
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
          Deal Title *
        </label>
        <input
          type="text"
          value={dealForm.title}
          onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
          placeholder="e.g. Midnight Feast Combo, Family Mega Saver"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
        />
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
          Description (Optional)
        </label>
        <textarea
          rows={2}
          value={dealForm.description}
          onChange={(e) =>
            setDealForm({ ...dealForm, description: e.target.value })
          }
          placeholder="Details, included servings, drinks, dipping sauces..."
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs resize-none focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Pricing & Ribbon Badge */}
      <DealPricingControls
        dealForm={dealForm}
        setDealForm={setDealForm}
        discountPercent={discountPercent}
        dealPrice={dealPrice}
        origPrice={origPrice}
      />

      {/* Image & Wide Promo Banner Uploads */}
      <DealImageUploader
        fileInputRef={fileInputRef}
        handleLogoChange={handleLogoChange}
        logoPreview={logoPreview}
        isFeaturedBanner={isFeaturedBanner}
        setIsFeaturedBanner={setIsFeaturedBanner}
        promoFileInputRef={promoFileInputRef}
        handlePromoBannerChange={handlePromoBannerChange}
        promoBannerPreview={promoBannerPreview}
        bannerOrder={bannerOrder}
        setBannerOrder={setBannerOrder}
      />

      {/* Timing Schedule */}
      <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] space-y-2.5">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={isPermanent}
            onChange={(e) => setIsPermanent(e.target.checked)}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
          <span>Permanent Deal (Active 24/7)</span>
        </label>

        {!isPermanent && (
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200 dark:border-white/5">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Deal Duration / Day Limit (Optional) */}
      <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <FaCalendarAlt className="text-amber-500" />
            <span>Deal Duration Limit (Optional)</span>
          </label>
          {dayLimit > 0 && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Active for {dayLimit} {parseInt(dayLimit) === 1 ? "day" : "days"}
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-500 dark:text-neutral-400 m-0">
          Set how many days this deal will stay active (e.g. 2, 3, 7 days). When the time completes, the deal will automatically deactivate. Leave empty for no time limit.
        </p>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 focus-within:border-amber-500">
            <input
              type="number"
              min="1"
              step="1"
              value={dayLimit || ""}
              onChange={(e) =>
                setDayLimit(
                  e.target.value === ""
                    ? ""
                    : Math.max(1, parseInt(e.target.value) || 0)
                )
              }
              placeholder="e.g. 2, 3, 5 (Number of days)"
              className="w-full py-2 bg-transparent text-slate-900 dark:text-white font-bold text-xs outline-none"
            />
            <span className="text-xs font-semibold text-slate-400 dark:text-neutral-500 ml-1">
              Days
            </span>
          </div>

          {dayLimit > 0 && (
            <button
              type="button"
              onClick={() => setDayLimit("")}
              className="px-3 py-2 text-[10px] font-bold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 cursor-pointer transition-colors"
            >
              No Limit
            </button>
          )}
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold mr-1">
            Quick Select:
          </span>
          {[1, 2, 3, 4, 5, 7, 10, 14, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setDayLimit(days)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                parseInt(dayLimit) === days
                  ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-sm"
                  : "bg-white dark:bg-white/5 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-white/5 hover:border-amber-500/40"
              }`}
            >
              {days} {days === 1 ? "Day" : "Days"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
