import React from "react";
import { FaPlus, FaFire, FaUtensils } from "react-icons/fa";
import { resolveImageUrl } from "../../utils/imageOptimizer";

const CartCrossSellList = ({ upsellItems = [], onQuickAdd }) => {
  if (!upsellItems || upsellItems.length === 0) return null;

  return (
    <div className="w-full mt-4 pt-3.5 border-t border-zinc-200 dark:border-neutral-800">
      {/* Title */}
      <div className="flex items-center gap-1.5 mb-2.5">
       
        <h4 className="text-[11px] font-black tracking-wider text-zinc-600 dark:text-neutral-400 uppercase font-['Oswald',sans-serif] m-0">
          Frequently Bought Together
        </h4>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x [&::-webkit-scrollbar]:w-0">
        {upsellItems.map((item) => {
          const rawImg = item.image_url || item.img;
          const imgSrc = rawImg ? resolveImageUrl(rawImg) : null;

          return (
            <div
              key={item.id}
              className="snap-start shrink-0 w-36 sm:w-40 bg-zinc-50 dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-xl p-2.5 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-neutral-800 p-0.5 border border-zinc-200/60 dark:border-neutral-700/60 shrink-0"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <FaUtensils className="text-xs" />
                  </div>
                )}
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate m-0 leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-black font-['Oswald',sans-serif] mt-0.5 m-0">
                    Rs {parseFloat(item.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onQuickAdd && onQuickAdd(item)}
                className="w-full py-1.5 px-2 bg-white dark:bg-neutral-800 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-neutral-950 dark:hover:text-neutral-950 text-zinc-700 dark:text-zinc-300 font-black font-['Oswald',sans-serif] text-xs rounded-lg flex items-center justify-center gap-1 border border-zinc-200 dark:border-neutral-700 hover:border-amber-500 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <FaPlus className="text-[9px]" />
                <span>Add</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartCrossSellList;
