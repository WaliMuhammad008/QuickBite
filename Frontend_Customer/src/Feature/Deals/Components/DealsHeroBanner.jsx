import React from "react";
import heroPizzaImg from "../../../assets/deals-hero-pizza.png";

export default function DealsHeroBanner() {
  return (
    <section className="relative overflow-hidden pt-8 pb-8 sm:pt-12 sm:pb-14 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
      {/* Glow Accent */}
      <div className="absolute top-0 right-1/4 w-[350px] sm:w-[450px] h-[250px] sm:h-[300px] bg-amber-400/15 dark:bg-amber-400/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between text-center lg:text-left gap-6 sm:gap-8">
          {/* Left Column: Bold, Minimalist Typography */}
          <div className="flex-1 flex flex-col items-center lg:items-start max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2">
              <span>EXCLUSIVE VALUE COMBOS &bull; SAVINGS GUARANTEED</span>
            </div>
            <h1 className="font-['Oswald',sans-serif] font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-neutral-950 dark:text-white uppercase leading-[1.08] m-0">
              CRAVE MORE,{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                SAVE MORE
              </span>
            </h1>

           
          </div>

          {/* Right Column: Unified 3D Floating Hero Showcase */}
          <div className="overflow-visible relative flex items-center justify-center shrink-0">
            <div className="relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 flex items-center justify-center group cursor-pointer select-none overflow-visible">
              <div className="absolute inset-0 bg-radial from-amber-400/25 via-amber-500/10 to-transparent rounded-full blur-2xl group-hover:scale-115 transition-transform duration-700 ease-out pointer-events-none" />

              <img
                src={heroPizzaImg}
                alt="Special BigBite Deals Pizza"
                className="relative z-10 w-full h-full object-contain transition-all duration-500 ease-out transform 
                           group-hover:-translate-y-4 group-hover:rotate-[-3deg] group-hover:scale-105 
                           drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] group-hover:drop-shadow-[0_30px_45px_rgba(245,158,11,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
