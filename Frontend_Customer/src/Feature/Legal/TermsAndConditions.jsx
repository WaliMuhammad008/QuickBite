import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaFileContract, FaCheckCircle, FaMoneyCheckAlt, FaMotorcycle } from "react-icons/fa";
import { API_BASE } from "../../config/api";

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch dynamic settings from backend
  const { data: settings = {} } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  // Dynamic Content with graceful fallbacks
  const heroBadge = settings.terms_hero_badge || "TERMS OF SERVICE";
  const heroTitle = settings.terms_hero_title || "TERMS & CONDITIONS";
  const heroSubtitle = settings.terms_hero_subtitle || "Please review the terms and ordering guidelines governing your BigBite culinary experience.";

  const agreementTitle = settings.terms_agreement_title || "Ordering & Service Agreement";
  const agreementText = settings.terms_agreement_text || settings.terms_and_conditions || "By placing an order with BigBite through our website or mobile application, you agree to our standard terms of service. Orders are prepared immediately upon confirmation. Delivery times are estimated based on preparation time and local traffic conditions. For order cancellations or modifications, please contact our helpline immediately before kitchen preparation commences.";

  const card1Title = settings.terms_card1_title || "Order Confirmation";
  const card1Desc = settings.terms_card1_desc || "Orders are verified in real-time. Please ensure contact details and delivery addresses are accurate.";

  const card2Title = settings.terms_card2_title || "Payment Terms";
  const card2Desc = settings.terms_card2_desc || "We accept Cash on Delivery as well as digital sandbox payment options. Exact change is appreciated.";

  const card3Title = settings.terms_card3_title || "Delivery Schedule";
  const card3Desc = settings.terms_card3_desc || "Riders strive to deliver within the estimated window. Extreme weather or peak traffic may cause slight variations.";

  const refundTitle = settings.terms_refund_title || "Cancellation & Refund Guidelines";
  const refundText = settings.terms_refund_text || "Because all food items are prepared fresh to order, cancellations must be requested within 5 minutes of order placement. In the rare event of missing or incorrect items, please contact our support team with your order ID for an immediate replacement or store credit.";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-neutral-800 dark:text-neutral-200 transition-colors duration-300 pb-20">
      {/* ═════════════════════════════════════════════════════════
          1. DYNAMIC HERO HEADER
      ═════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-18 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
        <div className="absolute top-0 right-1/4 w-[400px] h-[250px] bg-amber-400/15 dark:bg-amber-400/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-3.5 sm:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
            <FaFileContract className="text-[10px] text-amber-500" />
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
          {/* Section 1: Agreement */}
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-1.5 h-5 sm:h-6 bg-amber-500 rounded-full" />
              <h2 className="font-['Oswald',sans-serif] text-xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-wide m-0">
                {agreementTitle}
              </h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-base leading-relaxed whitespace-pre-line m-0">
              {agreementText}
            </p>
          </div>

          {/* Section 2: 3 Dynamic Policy Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {/* Card 1 */}
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-neutral-800/60 border border-amber-200/50 dark:border-neutral-800">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center mb-3">
                <FaCheckCircle className="text-xs sm:text-sm" />
              </div>
              <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg text-gray-900 dark:text-white uppercase m-0 mb-1">
                {card1Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 m-0 leading-relaxed">
                {card1Desc}
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-neutral-800/60 border border-amber-200/50 dark:border-neutral-800">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center mb-3">
                <FaMoneyCheckAlt className="text-xs sm:text-sm" />
              </div>
              <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg text-gray-900 dark:text-white uppercase m-0 mb-1">
                {card2Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 m-0 leading-relaxed">
                {card2Desc}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-neutral-800/60 border border-amber-200/50 dark:border-neutral-800 sm:col-span-2 md:col-span-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center mb-3">
                <FaMotorcycle className="text-xs sm:text-sm" />
              </div>
              <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg text-gray-900 dark:text-white uppercase m-0 mb-1">
                {card3Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 m-0 leading-relaxed">
                {card3Desc}
              </p>
            </div>
          </div>

          {/* Section 3: Refund Guidelines */}
          <div className="pt-2">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-1.5 h-5 sm:h-6 bg-amber-500 rounded-full" />
              <h2 className="font-['Oswald',sans-serif] text-xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-wide m-0">
                {refundTitle}
              </h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-base leading-relaxed whitespace-pre-line m-0">
              {refundText}
            </p>
          </div>
        </div>

        {/* Quick Menu Action */}
        <div className="text-center mt-8 sm:mt-10">
          <Link
            to="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black uppercase text-xs sm:text-sm tracking-wider shadow-lg hover:shadow-amber-500/25 transition-all duration-300 active:scale-95 no-underline"
          >
            <span>Explore Menu</span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TermsAndConditions;
