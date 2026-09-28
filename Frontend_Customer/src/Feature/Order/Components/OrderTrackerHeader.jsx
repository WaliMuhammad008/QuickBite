import React from "react";
import { FaSearch, FaReceipt, FaPhoneAlt, FaShieldAlt } from "react-icons/fa";

export default function OrderTrackerHeader({
  inputSearchId,
  setInputSearchId,
  inputSearchPhone,
  setInputSearchPhone,
  handleSearchSubmit,
}) {
  return (
    <section className="relative overflow-hidden pt-6 pb-6 sm:pt-10 sm:pb-8 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center sm:text-left">
        

        <h1 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-neutral-950 dark:text-white m-0">
          TRACK YOUR{" "}
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            FEAST
          </span>
        </h1>
        <p className="mt-4 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
          Enter your Order ID and registered mobile number to  view live order status.
        </p>

        {/* Quick Search Form */}
        <form onSubmit={handleSearchSubmit} className="mt-4 sm:mt-5 max-w-xl">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm">
            {/* Order ID Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputSearchId}
                onChange={(e) => setInputSearchId(e.target.value)}
                placeholder="Order ID (e.g. 1042)"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-mono font-bold"
              />
              <FaReceipt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none" />
            </div>

            {/* Mobile Number Input */}
            <div className="relative flex-1">
              <input
                type="tel"
                value={inputSearchPhone}
                onChange={(e) => setInputSearchPhone(e.target.value)}
                placeholder="Mobile (e.g. 03001234567)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-mono font-bold"
              />
              <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none" />
            </div>

            {/* Track Button */}
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-xs shrink-0"
            >
              <FaSearch className="text-xs" />
              <span>Track</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
