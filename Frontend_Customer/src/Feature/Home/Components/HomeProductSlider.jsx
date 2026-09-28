import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../../Components/UI/ProductCard";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

const HomeProductSlider = ({ title, items, viewAllLink }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [, setSwiperReady] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative mb-8 group/slider select-none">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-red-600 rounded-full" />
          <h2 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-900 dark:text-white m-0">
            {title}
          </h2>
        </div>
        
        {/* Right Controls: View All + Slider Navigation */}
        <div className="flex items-center gap-4">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-500 hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer no-underline mr-1 font-['Oswald',sans-serif]"
            >
              <span>VIEW ALL</span>
              <span>&rarr;</span>
            </Link>
          )}

          {/* Navigation Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              ref={prevRef}
              aria-label="Previous Slide"
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-200 dark:border-neutral-700 flex items-center justify-center transition-all duration-300 hover:bg-red-600 hover:border-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:border-red-600 dark:hover:text-white hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer shadow-sm"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              ref={nextRef}
              aria-label="Next Slide"
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-200 dark:border-neutral-700 flex items-center justify-center transition-all duration-300 hover:bg-red-600 hover:border-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:border-red-600 dark:hover:text-white hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer shadow-sm"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Swiper Slider */}
      <div className="relative w-full px-1">
        <Swiper
          modules={[Navigation, FreeMode, Mousewheel]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          onInit={() => setSwiperReady(true)}
          spaceBetween={16}
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
          className="product-swiper !py-3 !overflow-visible md:!overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {items.map((item) => {
            const resolvedImg = item.img || item.image || item.image_url || item.photo || item.img_url || item.image_path;

            return (
              <SwiperSlide
                key={item.id}
                className="!w-[13.5rem] min-[400px]:!w-[14.5rem] md:!w-[16.5rem] lg:!w-[17.5rem] h-auto flex flex-col"
              >
                <ProductCard
                  id={item.id}
                  item={item}
                  title={item.name || item.title}
                  price={item.price}
                  desc={item.description || item.desc || item.items_description}
                  image={resolvedImg}
                  isBestSeller={item.isBestSeller}
                  isTopDeal={item.isTopDeal}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default HomeProductSlider;
