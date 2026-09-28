import React from "react";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";

const HomeBanners = ({ banners, onBannerClick, title }) => {
  const bannerList = Array.isArray(banners) ? banners : [];

  if (bannerList.length === 0) {
    return null;
  }

  const gridClass =
    bannerList.length === 1
      ? "grid-cols-1"
      : bannerList.length === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2";

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
          <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide m-0">
            {title}
          </h2>
        </div>
      )}
      <div className={`grid ${gridClass} gap-6`}>
        {bannerList.map((banner, idx) => {
          const bannerSrc = optimizeCloudinaryImage(
            banner.promo_banner_image || banner.image || banner.img || banner.image_url,
            1200
          );

          if (!bannerSrc) return null;

          return (
            <div
              key={banner.id || idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onBannerClick) {
                  onBannerClick(banner);
                }
              }}
              className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] cursor-pointer border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#141414] text-zinc-900 dark:text-white"
            >
              <img
                src={bannerSrc}
                alt={banner.title || banner.name || `Promo Banner ${idx + 1}`}
                className={`w-full h-auto object-cover ${
                  bannerList.length === 1
                    ? "aspect-[2.5/1] sm:aspect-[3/1] max-h-[360px]"
                    : "aspect-[2.3/1] max-h-[320px]"
                } group-hover:scale-105 transition-transform duration-500 pointer-events-none`}
              />

              {/* Gradient Overlay for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-75 group-hover:opacity-90 transition-opacity pointer-events-none" />

              {banner.badge_tag && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-orange-500 text-white shadow-md">
                    {banner.badge_tag}
                  </span>
                </div>
              )}

              {(banner.title || banner.name) && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="font-['Oswald',sans-serif] font-black text-xl sm:text-2xl text-white uppercase tracking-wide drop-shadow-md m-0">
                    {banner.title || banner.name}
                  </h3>
                  {banner.price && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-black text-amber-400 text-base sm:text-lg">
                        Rs. {parseFloat(banner.price).toLocaleString()}
                      </span>
                      {banner.original_price && (
                        <span className="text-zinc-300 dark:text-neutral-400 text-xs line-through">
                          Rs. {parseFloat(banner.original_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HomeBanners;
