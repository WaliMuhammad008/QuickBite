import React, { useState, useMemo } from "react";
import {
  FaStar,
  FaCheckCircle,
  FaQuoteLeft,
  FaThumbsUp,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaUtensils,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HomeReviewsSection({
  title = "WHAT OUR FOODIES SAY",
  
  reviews = [],
  summary = { total_reviews: 0, average_rating: 5.0 },
  filterMode = "all", // "all" | "featured" | "top_rated"
}) {
  const [activeFilter, setActiveFilter] = useState("all");

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // Avatar color generator based on name
  const getAvatarGradient = (name = "") => {
    const gradients = [
      "from-amber-500 to-orange-600",
      "from-rose-500 to-red-600",
      "from-emerald-500 to-teal-600",
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-600",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return gradients[sum % gradients.length];
  };

  // Filter reviews
  const filteredReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    
    // Filter by section setting first
    let list = [...reviews];
    if (filterMode === "featured") {
      list = list.filter((r) => Number(r.is_featured) === 1);
    } else if (filterMode === "top_rated") {
      list = list.filter((r) => Number(r.rating) >= 4);
    }

    // Secondary UI filter
    if (activeFilter === "featured") {
      list = list.filter((r) => Number(r.is_featured) === 1);
    } else if (activeFilter === "5star") {
      list = list.filter((r) => Number(r.rating) === 5);
    }

    // Only show reviews that have text or tags
    return list.filter(
      (r) => (r.review_text && r.review_text.trim().length > 0) || (r.tags && r.tags.length > 0)
    );
  }, [reviews, filterMode, activeFilter]);

  const avgScore = Number(summary?.average_rating || 4.9).toFixed(1);
  const totalCount = summary?.total_reviews || reviews.length || 100;

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="w-full relative overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Container */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
         

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-zinc-900 dark:text-white m-0">
            {title}
          </h2>

         
        </div>

        {/* Rating Summary Bar */}
        <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#16161a]/90 backdrop-blur-md border border-zinc-200 dark:border-neutral-800 shadow-xl shadow-black/5 dark:shadow-black/20 shrink-0">
          {/* Big Score */}
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-black font-['Oswald',sans-serif] text-zinc-900 dark:text-white tracking-tight">
              {avgScore}
            </span>
            <div className="space-y-0.5">
              <div className="flex text-amber-400 text-xs sm:text-sm">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider block text-center">
                Out of 5.0
              </span>
            </div>
          </div>

          

         
        </div>
      </div>

      {/* Filter Tabs & Navigation Controls */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeFilter === "all"
                ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20"
                : "bg-white dark:bg-[#16161a] text-zinc-600 dark:text-neutral-400 border-zinc-200 dark:border-neutral-800 hover:border-amber-500/50"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("featured")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeFilter === "featured"
                ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20"
                : "bg-white dark:bg-[#16161a] text-zinc-600 dark:text-neutral-400 border-zinc-200 dark:border-neutral-800 hover:border-amber-500/50"
            }`}
          >
            <FaHeart className="text-[10px]" />
            <span>Featured Picks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("5star")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeFilter === "5star"
                ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20"
                : "bg-white dark:bg-[#16161a] text-zinc-600 dark:text-neutral-400 border-zinc-200 dark:border-neutral-800 hover:border-amber-500/50"
            }`}
          >
            <FaStar className="text-[10px] text-amber-400" />
            <span>5 Stars Only</span>
          </button>
        </div>

        {/* Carousel Prev / Next Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            className="reviews-prev-btn w-9 h-9 rounded-xl bg-white dark:bg-[#16161a] border border-zinc-200 dark:border-neutral-800 hover:border-amber-500 text-zinc-700 dark:text-neutral-300 hover:text-amber-500 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
            aria-label="Previous review"
          >
            <FaChevronLeft className="text-xs" />
          </button>
          <button
            type="button"
            className="reviews-next-btn w-9 h-9 rounded-xl bg-white dark:bg-[#16161a] border border-zinc-200 dark:border-neutral-800 hover:border-amber-500 text-zinc-700 dark:text-neutral-300 hover:text-amber-500 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
            aria-label="Next review"
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>

      {/* Swiper Slider */}
      {filteredReviews.length === 0 ? (
        <div className="p-8 text-center bg-white/50 dark:bg-[#141417]/50 rounded-2xl border border-dashed border-zinc-300 dark:border-neutral-800">
          <p className="text-xs text-zinc-500 dark:text-neutral-400 m-0">
            No reviews matching this filter. Showing all verified reviews instead.
          </p>
        </div>
      ) : (
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          navigation={{
            prevEl: ".reviews-prev-btn",
            nextEl: ".reviews-next-btn",
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 3.5, spaceBetween: 24 },
          }}
          className="reviews-swiper !pb-12"
        >
          {filteredReviews.map((rev) => {
            const tagsList = rev.tags
              ? rev.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : [];
            const initial = (rev.customer_name || "Foodie").charAt(0).toUpperCase();
            const ratingScore = Number(rev.rating || 5);

            return (
              <SwiperSlide key={rev.id} className="h-auto">
                <div className="h-full flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#151518]/90 backdrop-blur-md border border-zinc-200/90 dark:border-neutral-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/40 shadow-xl shadow-zinc-200/50 dark:shadow-black/40 transition-all duration-300 hover:-translate-y-1.5 group relative">
                  {/* Top Quote Icon Backdrop */}
                  <FaQuoteLeft className="absolute top-5 right-5 text-4xl text-zinc-100 dark:text-neutral-800/40 pointer-events-none group-hover:text-amber-500/10 transition-colors" />

                  <div>
                    {/* Customer Header */}
                    <div className="flex items-center gap-3 mb-4">
                      {/* Avatar */}
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                          rev.customer_name
                        )} flex items-center justify-center text-white font-['Oswald',sans-serif] font-black text-base shadow-md shadow-black/10 shrink-0`}
                      >
                        {initial}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black font-sans text-zinc-900 dark:text-white truncate m-0">
                            {rev.customer_name || "Verified Customer"}
                          </h4>
                          {Number(rev.is_featured) === 1 && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                              ⭐ Featured
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <FaCheckCircle className="text-[9px]" />
                            <span>Verified Buyer</span>
                          </span>
                          <span className="text-zinc-300 dark:text-neutral-700 text-xs">•</span>
                          <span className="text-[10px] text-zinc-400 dark:text-neutral-500">
                            {formatDate(rev.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < ratingScore ? "text-amber-400" : "text-zinc-300 dark:text-neutral-700"}
                        />
                      ))}
                      <span className="text-xs font-black text-zinc-700 dark:text-neutral-300 ml-1.5 font-mono">
                        {ratingScore}.0
                      </span>
                    </div>

                    {/* Review Comment */}
                    {rev.review_text ? (
                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-neutral-300 line-clamp-4 leading-relaxed m-0 font-sans italic">
                        "{rev.review_text}"
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-400 dark:text-neutral-500 italic m-0">
                        Rated {ratingScore} out of 5 stars for taste, quality, and service!
                      </p>
                    )}
                  </div>

                  {/* Bottom Tags / Highlights */}
                  {tagsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-zinc-100 dark:border-neutral-800/80">
                      {tagsList.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-neutral-900 border border-zinc-200/80 dark:border-neutral-800 text-zinc-600 dark:text-neutral-400 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <FaThumbsUp className="text-[8px] text-amber-500" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </section>
  );
}
