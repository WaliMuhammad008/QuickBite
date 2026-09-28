import React from "react";
import { FaWallet, FaBullseye, FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

export default function ShiftSummary({ stats }) {
  const target = 10;
  const progress = Math.min((stats.deliveries / target) * 100, 100);

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-stone-900 dark:text-white text-base font-black uppercase tracking-wide font-['Oswald',sans-serif] m-0">
        Shift Summary
      </h3>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-3 rounded-2xl text-center shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="text-stone-500 dark:text-neutral-400 text-[10px] font-bold flex items-center justify-center gap-1 uppercase tracking-wider">
            <FaMoneyBillWave className="text-amber-500" />
            <span>Cash</span>
          </div>
          <div className="text-stone-900 dark:text-white text-lg sm:text-xl mt-1 font-['Oswald',sans-serif] font-black">
            Rs. {stats.cashInHand.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-3 rounded-2xl text-center shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="text-stone-500 dark:text-neutral-400 text-[10px] font-bold flex items-center justify-center gap-1 uppercase tracking-wider">
            <FaCreditCard className="text-blue-500" />
            <span>Online</span>
          </div>
          <div className="text-stone-900 dark:text-white text-lg sm:text-xl mt-1 font-['Oswald',sans-serif] font-black">
            Rs. {stats.onlineCollected.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-3 rounded-2xl text-center shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="text-stone-500 dark:text-neutral-400 text-[10px] font-bold flex items-center justify-center gap-1 uppercase tracking-wider">
            <FaWallet className="text-emerald-500" />
            <span>Earned</span>
          </div>
          <div className="text-stone-900 dark:text-white text-lg sm:text-xl mt-1 font-['Oswald',sans-serif] font-black">
            Rs. {stats.earnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Daily Bonus Target Card */}
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-4 rounded-2xl shadow-xs">
        <div className="flex justify-between items-center text-xs font-bold text-stone-800 dark:text-neutral-200 uppercase mb-2">
          <span className="flex items-center gap-1.5">
            <FaBullseye className="text-amber-500" />
            <span>Daily Bonus Target</span>
          </span>
          <span className="font-mono text-amber-600 dark:text-amber-400">
            {stats.deliveries} / {target}
          </span>
        </div>

        <div className="w-full bg-stone-100 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden my-2 border border-stone-200/60 dark:border-neutral-700/60">
          <div
            className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-stone-500 dark:text-neutral-400 text-[11px] font-medium text-center mt-1.5">
          {target - stats.deliveries > 0
            ? `Complete ${target - stats.deliveries} more deliveries for Rs. 500 bonus!`
            : "🎉 Daily bonus target achieved!"}
        </div>
      </div>
    </div>
  );
}