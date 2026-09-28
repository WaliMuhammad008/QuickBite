import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const SummaryCards = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3.5 sm:gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white dark:bg-[#161616] rounded-2xl p-3.5 sm:p-4 lg:p-4.5 flex flex-col justify-between gap-2.5 border border-slate-200 dark:border-white/[0.08] shadow-sm hover:border-amber-500/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-neutral-400 truncate">
              {metric.title}
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              {metric.icon}
            </div>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate font-sans">
              {metric.value}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold">
              <span
                className={`px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                  metric.isUp
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                {metric.isUp ? <FaArrowUp className="text-[8px]" /> : <FaArrowDown className="text-[8px]" />}
                <span>{metric.trend}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
