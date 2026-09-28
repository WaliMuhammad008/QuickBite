import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import { resolveImageUrl } from "../../../utils/imageOptimizer";
import { API_BASE } from "../../../config/api";

const FoodDoodlesBackground = () => (
  <div className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400 overflow-hidden z-0">
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 280 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Decorative Splash Circles & Halos */}
      <circle cx="140" cy="170" r="95" fill="white" fillOpacity="0.18" />
      <circle cx="140" cy="170" r="60" fill="white" fillOpacity="0.12" />

      {/* Pizza Slice Doodle (Top Left) */}
      <g opacity="0.25" transform="translate(20, 35) rotate(-15) scale(0.68)">
        <path
          d="M20 5 L45 55 L-5 55 Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-950"
        />
        <circle cx="18" cy="28" r="3" fill="currentColor" className="text-neutral-950" />
        <circle cx="28" cy="42" r="3.5" fill="currentColor" className="text-neutral-950" />
        <circle cx="8" cy="45" r="2.5" fill="currentColor" className="text-neutral-950" />
        <path d="M-5 55 Q20 62 45 55" stroke="currentColor" strokeWidth="3" className="text-neutral-950" />
      </g>

      {/* Burger Doodle (Top Right) */}
      <g opacity="0.25" transform="translate(220, 35) rotate(18) scale(0.65)">
        <path d="M5 25 A 20 18 0 0 1 45 25 Z" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-neutral-950" />
        <line x1="3" y1="29" x2="47" y2="29" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-neutral-950" />
        <path d="M5 33 Q 15 37 25 33 Q 35 37 45 33" stroke="currentColor" strokeWidth="2" fill="none" className="text-neutral-950" />
        <rect x="7" y="38" width="36" height="8" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-neutral-950" />
        <circle cx="18" cy="16" r="1.5" fill="currentColor" className="text-neutral-950" />
        <circle cx="26" cy="12" r="1.5" fill="currentColor" className="text-neutral-950" />
        <circle cx="34" cy="17" r="1.5" fill="currentColor" className="text-neutral-950" />
      </g>

      {/* French Fries Doodle (Mid Left) */}
      <g opacity="0.22" transform="translate(15, 210) rotate(-10) scale(0.58)">
        <path d="M10 25 L15 65 L45 65 L50 25 Z" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-neutral-950" />
        <rect x="16" y="5" width="5" height="22" rx="1.5" stroke="currentColor" strokeWidth="2" className="text-neutral-950" />
        <rect x="24" y="0" width="5.5" height="27" rx="1.5" stroke="currentColor" strokeWidth="2" className="text-neutral-950" />
        <rect x="33" y="7" width="5" height="20" rx="1.5" stroke="currentColor" strokeWidth="2" className="text-neutral-950" />
        <rect x="41" y="12" width="5" height="15" rx="1.5" stroke="currentColor" strokeWidth="2" className="text-neutral-950" />
      </g>

      {/* Drink / Soda Cup Doodle (Mid Right) */}
      <g opacity="0.22" transform="translate(225, 215) rotate(12) scale(0.58)">
        <path d="M10 15 L18 65 L42 65 L50 15 Z" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-neutral-950" />
        <line x1="5" y1="15" x2="55" y2="15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-neutral-950" />
        <path d="M30 15 L35 0 L45 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-neutral-950" />
      </g>
    </svg>
  </div>
);

const ExploreMenu = ({ 
  title = "EXPLORE MENU", 
  tagline = "CRISPY, EVERY BITE TASTE",
  subtitle = "VIEW ALL" 
}) => {
  const navigate = useNavigate();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [, setSwiperReady] = useState(false);

  // Fetch Categories
  const { data: categories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/get_categories.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const handleCategoryClick = (catName) => {
    const name = typeof catName === "object" ? catName?.name : catName;
    navigate("/menu", { state: { category: name } });
  };

  return (
    <section className="w-full max-w-7xl mx-auto py-6 sm:py-10 px-3 sm:px-6 lg:px-8 select-none bg-transparent">
      {/* Header Container */}
      <div className="flex justify-between items-end gap-3 mb-5 sm:mb-8 px-1">
        <div>
          <span className="text-amber-500 font-bold text-xs sm:text-sm uppercase tracking-wider font-['Oswald',sans-serif] block mb-1">
            {tagline}
          </span>
          <h2 className="text-gray-900 dark:text-white font-black text-2xl sm:text-3xl lg:text-4xl font-['Oswald',sans-serif] uppercase tracking-wide m-0">
            {title}
          </h2>
        </div>

        {/* Top-Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="text-gray-700 hover:text-amber-500 dark:text-gray-200 dark:hover:text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors duration-200 cursor-pointer font-['Oswald',sans-serif] inline-flex items-center gap-1 bg-transparent border-none"
          >
            {subtitle} <FaArrowRight className="text-[10px] sm:text-xs" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button
              ref={prevRef}
              type="button"
              aria-label="Previous Category"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-200 dark:border-neutral-700 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <button
              ref={nextRef}
              type="button"
              aria-label="Next Category"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-200 dark:border-neutral-700 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Autoplay Horizontal Carousel */}
      <div className="relative w-full px-1">
        {isCatLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length > 0 ? (
          <Swiper
            modules={[Navigation, FreeMode, Mousewheel, Autoplay]}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            onInit={() => setSwiperReady(true)}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={14}
            slidesPerView={"auto"}
            grabCursor={true}
            simulateTouch={true}
            touchRatio={1.2}
            freeMode={{
              enabled: true,
              sticky: false,
              momentumRatio: 0.85,
            }}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: true,
              sensitivity: 1,
            }}
            className="category-swiper !py-2 !overflow-visible md:!overflow-hidden cursor-grab active:cursor-grabbing"
          >
            {categories.map((cat) => (
              <SwiperSlide
                key={cat.id}
                className="!w-[145px] min-[400px]:!w-[165px] sm:!w-[195px] md:!w-[230px] h-auto flex flex-col"
              >
                <div
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group relative w-full h-[200px] sm:h-[260px] md:h-[290px] rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-between cursor-pointer transition-all duration-300 ease-out bg-white text-gray-900 border border-gray-200/80 shadow-xs dark:bg-neutral-900 dark:text-white dark:border-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-neutral-950 dark:hover:text-neutral-950 hover:border-amber-400 hover:shadow-lg hover:-translate-y-1.5 overflow-hidden"
                >
                  <FoodDoodlesBackground />

                  {/* Food Image Cutout Container */}
                  <div className="w-full h-28 sm:h-36 md:h-44 flex items-center justify-center p-1 sm:p-2 relative my-auto z-10">
                    <img
                      src={resolveImageUrl(cat.img, 400)}
                      alt={cat.name}
                      className="object-contain max-h-24 sm:max-h-32 md:max-h-36 w-auto drop-shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 pointer-events-none"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/300x300?text=Food";
                      }}
                    />
                  </div>

                  {/* Category Title */}
                  <div className="w-full text-center z-10 pb-1">
                    <h4 className="m-0 font-['Oswald',sans-serif] text-sm sm:text-base md:text-lg font-extrabold tracking-wide uppercase text-gray-900 dark:text-white group-hover:text-neutral-950 dark:group-hover:text-neutral-950 transition-colors duration-300 leading-tight">
                      {cat.name}
                    </h4>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No food categories found.
          </p>
        )}
      </div>
    </section>
  );
};

export default ExploreMenu;
