import React from "react";
import { FaPercent } from "react-icons/fa";

export default function DealPricingControls({
  dealForm = {},
  setDealForm,
  discountPercent = 0,
  dealPrice = 0,
  origPrice = 0,
}) {
  return (
    <div className="space-y-4">
      {/* Pricing Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
            Deal Price (Rs.) *
          </label>
          <div className="flex items-center bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 rounded-xl px-3 focus-within:border-amber-500">
            <span className="text-xs font-black text-amber-500 dark:text-amber-400 mr-1.5">
              Rs.
            </span>
            <input
              type="number"
              min="0"
              value={dealForm.price}
              onChange={(e) => setDealForm({ ...dealForm, price: e.target.value })}
              placeholder="999"
              className="w-full py-2.5 bg-transparent text-slate-900 dark:text-white font-black text-xs outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
            Original Price (Strikethrough)
          </label>
          <div className="flex items-center bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 rounded-xl px-3 focus-within:border-amber-500">
            <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 mr-1.5">
              Rs.
            </span>
            <input
              type="number"
              min="0"
              value={dealForm.original_price}
              onChange={(e) =>
                setDealForm({ ...dealForm, original_price: e.target.value })
              }
              placeholder="1300"
              className="w-full py-2.5 bg-transparent text-slate-600 dark:text-neutral-400 font-semibold text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {discountPercent > 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <FaPercent className="text-[10px]" />
          <span>
            Customer saves {discountPercent}% (Rs.{" "}
            {(origPrice - dealPrice).toLocaleString()} Discount)
          </span>
        </div>
      )}

      {/* Badge Ribbon Tag */}
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
          Badge Ribbon Tag
        </label>
        <input
          type="text"
          value={dealForm.badge_tag}
          onChange={(e) =>
            setDealForm({ ...dealForm, badge_tag: e.target.value })
          }
          placeholder="e.g. HOT DEAL, MEGA SAVER"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none focus:border-amber-500 mb-2"
        />
        <div className="flex flex-wrap gap-1.5">
          {["HOT DEAL", "POPULAR", "MEGA SAVER", "VALUE PACK", "FAMILY DEAL"].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setDealForm({ ...dealForm, badge_tag: tag })}
                className={`text-[10px] font-bold px-3 py-1 !rounded-full border cursor-pointer transition-all ${
                  dealForm.badge_tag === tag
                    ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-sm"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-white/5 hover:border-amber-500/40"
                }`}
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
