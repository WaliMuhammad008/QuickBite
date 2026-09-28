import React from "react";
import { FaChartBar } from "react-icons/fa";

const SalesChart = ({ chartData, filter, setFilter }) => {
  return (
    <div className="bg-white dark:bg-[#161616] rounded-2xl p-5 border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col h-[380px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <FaChartBar className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Sales Overview
          </h3>
        </div>

        <select
          className="bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 outline-none cursor-pointer focus:border-amber-500 transition-colors"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option className="bg-white dark:bg-[#171717] text-slate-800 dark:text-white" value="daily">Today</option>
          <option className="bg-white dark:bg-[#171717] text-slate-800 dark:text-white" value="weekly">This Week</option>
          <option className="bg-white dark:bg-[#171717] text-slate-800 dark:text-white" value="monthly">This Month</option>
          <option className="bg-white dark:bg-[#171717] text-slate-800 dark:text-white" value="yearly">This Year</option>
          <option className="bg-white dark:bg-[#171717] text-slate-800 dark:text-white" value="all">All Time</option>
          <option className="bg-white dark:bg-[#171717] text-slate-800 dark:text-white" value="custom">Custom Range</option>
        </select>
      </div>

      {/* Bar Chart Canvas */}
      <div className="flex-1 flex items-end justify-between pb-3 gap-2 sm:gap-4 px-2">
        {chartData.map((data, idx) => (
          <div
            key={idx}
            className="flex-1 h-full flex flex-col justify-end items-center relative cursor-pointer group"
          >
            {/* Tooltip on hover */}
            <div className="absolute -top-9 bg-slate-900 dark:bg-neutral-900 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[11px] font-black opacity-0 transition-all duration-200 pointer-events-none whitespace-nowrap translate-y-2 shadow-xl group-hover:opacity-100 group-hover:translate-y-0 z-20">
              {data.amount}
            </div>

            {/* Bar Fill */}
            <div className="w-full max-w-[40px] bg-slate-100 dark:bg-white/5 rounded-t-xl h-full flex items-end overflow-hidden p-0.5 border border-slate-200/60 dark:border-white/5">
              <div
                className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all duration-700 ease-out origin-bottom group-hover:brightness-125 shadow-sm shadow-amber-500/20"
                style={{ height: `${Math.max(8, data.value)}%` }}
              />
            </div>

            {/* Label */}
            <span className="mt-3 text-[11px] text-slate-600 dark:text-neutral-400 font-bold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              {data.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesChart;
