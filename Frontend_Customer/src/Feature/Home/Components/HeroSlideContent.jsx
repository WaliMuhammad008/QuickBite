import React from "react";
import { FaArrowRight } from "react-icons/fa";

export default function HeroSlideContent({ slide, onExploreClick }) {
  if (!slide.title && !slide.subtitle) return null;

  return (
    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 md:p-12 lg:p-16 z-10 max-w-3xl">
      {slide.title && (
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-['Oswald',sans-serif] uppercase tracking-tight text-white leading-none drop-shadow-lg m-0 animate-fade-in">
          {slide.title}
        </h1>
      )}
      {slide.subtitle && (
        <p className="text-xs sm:text-base md:text-lg text-neutral-200 font-medium mt-1.5 sm:mt-2.5 max-w-xl drop-shadow-md leading-relaxed">
          {slide.subtitle}
        </p>
      )}
      {(slide.link_url || slide.link) && (
        <div className="mt-3 sm:mt-5">
          <button
            type="button"
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black uppercase text-xs tracking-wider shadow-lg hover:shadow-amber-500/25 transition-all duration-300 active:scale-95 border-none cursor-pointer"
          >
            <span>EXPLORE NOW</span>
            <FaArrowRight className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}
