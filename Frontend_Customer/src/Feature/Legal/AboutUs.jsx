import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaUtensils, FaHeart, FaTruck, FaShieldAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { API_BASE } from "../../config/api";

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch dynamic settings from backend
  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  // Dynamic Content with graceful fallbacks
  const heroBadge = settings.about_hero_badge || "OUR STORY & PASSION";
  const heroTitle = settings.about_hero_title || "ABOUT BIGBITE";
  const heroSubtitle = settings.about_hero_subtitle || "Crafting mouth-watering burgers, loaded fries, cheesy pizzas, and crispy fried chicken with uncompromised quality.";

  const journeyTitle = settings.about_journey_title || "Our Journey";
  const journeyText = settings.about_journey_text || settings.about_us || "At BigBite, we believe in serving fresh, hot, and delicious food to our community. Started with a passion for culinary excellence, we have grown into a beloved destination known for premium quality ingredients, handcrafted recipes, and unforgettable tastes. Every burger, pizza, and crispy chicken platter is freshly prepared on order to ensure unmatched quality and satisfaction.";

  const card1Title = settings.about_card1_title || "100% Fresh";
  const card1Desc = settings.about_card1_desc || "Handcrafted recipes made with fresh chicken, artisanal buns, and signature sauces.";

  const card2Title = settings.about_card2_title || "Hot & Fast Delivery";
  const card2Desc = settings.about_card2_desc || "Specialized thermal packaging ensures every meal arrives piping hot at your doorstep.";

  const card3Title = settings.about_card3_title || "Hygiene Assured";
  const card3Desc = settings.about_card3_desc || "Prepared under strict international safety, cleanliness, and food standards.";

  const missionTitle = settings.about_mission_title || "Our Mission";
  const missionText = settings.about_mission_text || settings.about_us_mission || "To provide a delightful dining experience with fast delivery, excellent customer service, and food that brings a smile with every single bite.";

  const storePhone = settings.contact_phone || settings.restaurant_phone || "+92 300 1234567";
  const storeEmail = settings.admin_email || settings.restaurant_email || "support@bigbite.com";
  const storeAddress = settings.store_address || settings.restaurant_address || "123 Food Street, Main Market";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-neutral-800 dark:text-neutral-200 transition-colors duration-300 pb-20">
      {/* ═════════════════════════════════════════════════════════
          1. DYNAMIC HERO BANNER HEADER
      ═════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-18 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
        <div className="absolute top-0 right-1/4 w-[400px] h-[250px] bg-amber-400/15 dark:bg-amber-400/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-3.5 sm:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
            <FaHeart className="text-[10px] text-amber-500" />
            <span>{heroBadge}</span>
          </div>

          <h1 className="font-['Oswald',sans-serif] font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-neutral-950 dark:text-white uppercase leading-tight m-0">
            {heroTitle.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {heroTitle.split(" ").slice(-1).join(" ")}
            </span>
          </h1>

          <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-base max-w-xl mx-auto mt-2.5 font-medium leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          2. DYNAMIC MAIN CONTENT CARD
      ═════════════════════════════════════════════════════════ */}
      <main className="max-w-5xl mx-auto px-3.5 sm:px-8 -mt-6">
        <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-sm backdrop-blur-md space-y-6 sm:space-y-8">
          {/* Section 1: Journey */}
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-1.5 h-5 sm:h-6 bg-amber-500 rounded-full" />
              <h2 className="font-['Oswald',sans-serif] text-xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-wide m-0">
                {journeyTitle}
              </h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-base leading-relaxed whitespace-pre-line m-0">
              {journeyText}
            </p>
          </div>

          {/* Section 2: 3 Dynamic Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {/* Pillar 1 */}
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-neutral-800/60 border border-amber-200/50 dark:border-neutral-800">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center mb-3">
                <FaUtensils className="text-xs sm:text-sm" />
              </div>
              <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg text-gray-900 dark:text-white uppercase m-0 mb-1">
                {card1Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 m-0 leading-relaxed">
                {card1Desc}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-neutral-800/60 border border-amber-200/50 dark:border-neutral-800">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center mb-3">
                <FaTruck className="text-xs sm:text-sm" />
              </div>
              <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg text-gray-900 dark:text-white uppercase m-0 mb-1">
                {card2Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 m-0 leading-relaxed">
                {card2Desc}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-neutral-800/60 border border-amber-200/50 dark:border-neutral-800 sm:col-span-2 md:col-span-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center mb-3">
                <FaShieldAlt className="text-xs sm:text-sm" />
              </div>
              <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg text-gray-900 dark:text-white uppercase m-0 mb-1">
                {card3Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 m-0 leading-relaxed">
                {card3Desc}
              </p>
            </div>
          </div>

          {/* Section 3: Mission */}
          <div className="pt-2">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-1.5 h-5 sm:h-6 bg-amber-500 rounded-full" />
              <h2 className="font-['Oswald',sans-serif] text-xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-wide m-0">
                {missionTitle}
              </h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-base leading-relaxed whitespace-pre-line m-0">
              {missionText}
            </p>
          </div>

          {/* Section 4: Live Store Contact Information */}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <FaPhoneAlt className="text-amber-500 shrink-0" />
              <span>{storePhone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <FaEnvelope className="text-amber-500 shrink-0" />
              <span>{storeEmail}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <FaMapMarkerAlt className="text-amber-500 shrink-0" />
              <span>{storeAddress}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;
