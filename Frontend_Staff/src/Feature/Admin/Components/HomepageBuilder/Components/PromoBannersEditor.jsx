import React from 'react';
import { FaImage as IconImage } from 'react-icons/fa';

export default function PromoBannersEditor({
  masterBanners = { deals: [], products: [] },
  handleUpdateMasterBannerOrder,
  handleToggleMasterBanner,
}) {
  const allBanners = [...masterBanners.deals, ...masterBanners.products];
  const liveCount = allBanners.filter((b) => b.is_featured_banner).length;

  return (
    <div className="admin-card-surface bg-white dark:bg-[#121216] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <IconImage className="text-amber-500 text-sm" />
            <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              Homepage Promo Banners Master Control
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5">
            Activate food item & combo cards as wide bottom promotional banners on homepage.
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-black text-xs">
          {liveCount} Live on Home
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allBanners.map((item) => {
          const isLive = Boolean(item.is_featured_banner);
          const bannerImg = item.promo_banner_image || item.img;

          return (
            <div
              key={`${item.type}-${item.id}`}
              className={`admin-card-surface bg-white dark:bg-[#16161a] p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-slate-900 dark:text-white shadow-sm ${
                isLive ? 'border-amber-500/40 bg-amber-500/[0.03]' : 'border-slate-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex gap-3 items-center">
                <img
                  src={bannerImg}
                  alt={item.name || item.title}
                  className="w-16 h-12 object-cover rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-black shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/180x110?text=Banner';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-0.5 !rounded-full ${
                        item.type === 'deal'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                      Rs. {parseFloat(item.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <strong className="font-extrabold text-xs text-slate-900 dark:text-white block truncate">
                    {item.name || item.title}
                  </strong>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                  <span className="text-[10px] font-bold">Order:</span>
                  <input
                    type="number"
                    min="0"
                    defaultValue={item.banner_order || 0}
                    onBlur={(e) => handleUpdateMasterBannerOrder(item, item.type, e.target.value)}
                    className="w-12 p-1 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg text-center text-xs font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleMasterBanner(item, item.type)}
                  className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                    isLive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-neutral-500/15 text-slate-600 dark:text-neutral-400 border-slate-300 dark:border-neutral-500/30'
                  }`}
                >
                  {isLive ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
