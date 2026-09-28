import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import burgerImg from "../../../assets/products/doublepatty-removebg-preview.png";
import pizzaImg from "../../../assets/deals-hero-pizza.png";
import broastImg from "../../../assets/products/injectedbroast-removebg-preview.png";
import wrapImg from "../../../assets/products/tortillawrap.png";
import wingsImg from "../../../assets/products/grilledwings1-removebg-preview.png";
import friesImg from "../../../assets/products/loadedfries-removebg-preview.png";
import drinksImg from "../../../assets/products/coke.png";
import friedChickenImg from "../../../assets/products/friedchicken1-removebg-preview.png";

const HERO_FOODS = [
  { id: "burger", name: "Gourmet Burger", category: "burger", image: burgerImg },
  { id: "pizza", name: "Cheesy Pizza", category: "pizza", image: pizzaImg },
  { id: "broast", name: "Crispy Broast", category: "broast", image: broastImg },
  { id: "wrap", name: "Tortilla Wrap", category: "wraps", image: wrapImg },
  { id: "wings", name: "Grilled Wings", category: "grilled-wings", image: wingsImg },
  { id: "fries", name: "Loaded Fries", category: "potato-corner", image: friesImg },
  { id: "drinks", name: "Cold Drink", category: "drinks", image: drinksImg },
  { id: "fried-chicken", name: "Fried Chicken", category: "fried-chicken", image: friedChickenImg },
];

export default function HeroOrbitFallback({ categories = [] }) {
  const navigate = useNavigate();

  // Dynamic food list from Admin categories (show_on_hero = 1) or static fallback
  const foodList = React.useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map((cat, idx) => ({
        id: cat.id || `cat-${idx}`,
        name: cat.name,
        category: cat.name,
        image: cat.img || burgerImg,
      }));
    }
    return HERO_FOODS;
  }, [categories]);

  const [activeFood, setActiveFood] = useState(foodList[0] || HERO_FOODS[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [orbitRadius, setOrbitRadius] = useState(115);

  // Sync activeFood whenever category list changes (e.g. admin toggles or image updates)
  useEffect(() => {
    if (foodList.length > 0) {
      setActiveFood((prev) => {
        const found = foodList.find((f) => f.id === prev?.id);
        return found || foodList[0];
      });
    }
  }, [foodList]);

  const companions = foodList.filter((f) => f.id !== activeFood?.id);

  // Dynamic responsive orbit radius calculation
  useEffect(() => {
    const updateRadius = () => {
      const w = window.innerWidth;
      if (w < 400) {
        setOrbitRadius(92);
      } else if (w < 640) {
        setOrbitRadius(110);
      } else if (w < 768) {
        setOrbitRadius(135);
      } else if (w < 1024) {
        setOrbitRadius(160);
      } else if (w < 1280) {
        setOrbitRadius(185);
      } else if (w < 1536) {
        setOrbitRadius(215);
      } else {
        setOrbitRadius(270);
      }
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  // Auto-cycle active food every 5 seconds
  useEffect(() => {
    if (isHovered || foodList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveFood((prev) => {
        const currentIndex = foodList.findIndex((f) => f.id === prev?.id);
        const nextIndex = (currentIndex + 1) % foodList.length;
        return foodList[nextIndex];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, foodList]);

  return (
    <>
      <style>{`
        @keyframes stageIn {
          0% {
            opacity: 0;
            transform: scale(0.68) rotate(4deg) translateY(18px);
          }
          65% {
            opacity: 1;
            transform: scale(1.04) rotate(-1.5deg) translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg) translateY(0);
          }
        }
        .stage-in {
          animation: stageIn 0.52s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitSpinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        .anim-orbit-spin {
          animation: orbitSpin 40s linear infinite;
        }
        .anim-orbit-spin:hover {
          animation-play-state: paused;
        }

        .anim-item-counter-spin {
          animation: orbitSpinReverse 40s linear infinite;
        }
        .anim-orbit-spin:hover .anim-item-counter-spin {
          animation-play-state: paused;
        }
      `}</style>

      {/* Full-width Hero Canvas */}
      <div className="w-full max-w-full min-h-[380px] sm:min-h-[440px] md:min-h-[460px] lg:min-h-[480px] xl:min-h-[520px] 2xl:min-h-[620px] px-3.5 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-6 xl:py-8 flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 dark:from-neutral-900 dark:via-[#141416] dark:to-neutral-950 border-b border-amber-200/50 dark:border-neutral-800 shadow-xs select-none relative overflow-hidden transition-colors duration-500">
        {/* Ambient glows */}
        <div className="absolute -top-20 right-20 w-[300px] sm:w-[380px] lg:w-[440px] h-[300px] sm:h-[380px] lg:h-[440px] rounded-full bg-radial from-amber-400/20 via-amber-500/10 to-transparent blur-[85px] pointer-events-none" />
        <div className="absolute -bottom-14 left-14 w-44 sm:w-56 lg:w-72 h-44 sm:h-56 lg:h-72 rounded-full bg-radial from-amber-400/15 to-transparent blur-[65px] pointer-events-none" />

        {/* Inner Centered Container */}
        <div className="w-full max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
          {/* Left Typography: "FLAVORS THAT" */}
          <div className="w-full md:w-auto shrink-0 text-center md:text-left select-none z-10 pl-0 md:pl-2 lg:pl-4 xl:pl-6 2xl:pl-8 mb-2 md:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black font-['Oswald',sans-serif] uppercase tracking-tight text-neutral-950 dark:text-white leading-none m-0">
              FLAVORS<br className="hidden md:inline" />
              <span className="md:hidden"> </span>THAT
            </h1>
          </div>

          {/* Center Orbit Stage */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] lg:w-[440px] lg:h-[440px] xl:w-[480px] xl:h-[480px] 2xl:w-[600px] 2xl:h-[600px] flex items-center justify-center overflow-visible select-none my-2 sm:my-4 md:my-0 mx-auto shrink-0"
          >
            <div className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-84 lg:h-84 xl:w-96 xl:h-96 2xl:w-112 2xl:h-112 rounded-full bg-amber-400/20 dark:bg-amber-500/12 blur-[80px] pointer-events-none transition-all duration-700" />

            {/* Active Center Stage */}
            <div
              key={activeFood.id}
              onClick={() =>
                navigate(
                  `/menu?category=${encodeURIComponent(
                    activeFood.category || activeFood.name
                  )}`
                )
              }
              className="relative z-20 w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 xl:w-68 xl:h-68 2xl:w-88 2xl:h-88 flex items-center justify-center p-2 group cursor-pointer stage-in pointer-events-auto"
            >
              <img
                src={activeFood.image}
                alt={activeFood.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = burgerImg;
                }}
                className="w-full h-full object-contain transition-all duration-500 ease-out transform group-hover:scale-105 group-hover:-translate-y-2 group-hover:rotate-[-2deg] drop-shadow-[0_20px_35px_rgba(245,158,11,0.3)] pointer-events-auto cursor-pointer"
              />
            </div>

            {/* Rotating Circular Orbit Container */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none overflow-visible">
              <div className="relative w-full h-full flex items-center justify-center anim-orbit-spin pointer-events-auto">
                {companions.map((item, idx) => {
                  const total = companions.length;
                  const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                  const x = Math.round(orbitRadius * Math.cos(angle));
                  const y = Math.round(orbitRadius * Math.sin(angle));

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setActiveFood(item)}
                      onClick={() =>
                        navigate(
                          `/menu?category=${encodeURIComponent(
                            item.category || item.name
                          )}`
                        )
                      }
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 select-none"
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                    >
                      <div className="anim-item-counter-spin">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = burgerImg;
                          }}
                          className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-18 2xl:h-18 object-contain drop-shadow-md transition-transform duration-200 hover:scale-125 opacity-90 hover:opacity-100"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Typography: "HIT DIFFERENT" */}
          <div className="w-full md:w-auto shrink-0 text-center md:text-right select-none z-10 pr-0 md:pr-2 lg:pr-4 xl:pr-6 2xl:pr-8 mt-2 md:mt-0">
            <h1 className="text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black font-['Oswald',sans-serif] uppercase tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent leading-none m-0">
              HIT<br className="hidden md:inline" />
              <span className="md:hidden"> </span>DIFFERENT
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}
