import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function HeroSliderControls({ prevRef, nextRef }) {
  return (
    <>
      <button
        ref={prevRef}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-amber-400 text-white hover:text-neutral-950 backdrop-blur-md border border-white/20 hover:border-amber-400 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/hero:opacity-100 active:scale-90 cursor-pointer shadow-lg"
      >
        <FaChevronLeft className="text-xs sm:text-sm" />
      </button>
      <button
        ref={nextRef}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-amber-400 text-white hover:text-neutral-950 backdrop-blur-md border border-white/20 hover:border-amber-400 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/hero:opacity-100 active:scale-90 cursor-pointer shadow-lg"
      >
        <FaChevronRight className="text-xs sm:text-sm" />
      </button>
    </>
  );
}
