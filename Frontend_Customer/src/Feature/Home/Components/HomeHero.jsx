import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";
import HeroSlideContent from "./HeroSlideContent";
import HeroSliderControls from "./HeroSliderControls";
import HeroOrbitFallback from "./HeroOrbitFallback";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

export default function HomeHero({ slides = [], heroCategories = [], onBannerClick }) {
  const navigate = useNavigate();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [, setSwiperReady] = useState(false);

  // If no dynamic slides from Admin, render 3D Rotating Orbit Stage
  if (!Array.isArray(slides) || slides.length === 0) {
    return <HeroOrbitFallback categories={heroCategories} />;
  }

  // 1. ADMIN HERO SLIDERS ACTIVE (Dynamic Interactive Carousel)
  return (
    <div className="relative w-full max-w-full overflow-hidden select-none bg-neutral-950 group/hero pt-0 mt-0">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          bulletClass:
            "hero-bullet inline-block w-2.5 h-2.5 rounded-full bg-white/40 cursor-pointer mx-1.5 transition-all duration-300",
          bulletActiveClass:
            "!w-8 !rounded-full !bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]",
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onInit={() => setSwiperReady(true)}
        loop={slides.length > 1}
        className="w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[580px]"
      >
        {slides.map((slide, idx) => {
          const slideImg = optimizeCloudinaryImage(
            slide.image_url || slide.image,
            1920
          );

          const handleClick = () => {
            if (slide.link_url || slide.link) {
              if (onBannerClick) {
                onBannerClick(slide.link_url || slide.link, slide);
              } else {
                navigate(slide.link_url || slide.link);
              }
            } else if (onBannerClick) {
              onBannerClick(slide);
            }
          };

          return (
            <SwiperSlide
              key={slide.id || idx}
              className="relative w-full h-full overflow-hidden"
            >
              <div
                onClick={handleClick}
                className="w-full h-full relative cursor-pointer group"
              >
                {/* Background Slide Image */}
                <img
                  src={slideImg}
                  alt={slide.title || `Hero Slide ${idx + 1}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                {/* Caption Content */}
                <HeroSlideContent slide={slide} onExploreClick={handleClick} />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <HeroSliderControls prevRef={prevRef} nextRef={nextRef} />
      )}
    </div>
  );
}
