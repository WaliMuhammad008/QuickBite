import React from "react";
import { FaList, FaClock, FaFire, FaCheckCircle } from "react-icons/fa";

const OrderFilterBar = ({ filterStatus, setFilterStatus }) => {
  const filters = [
    { id: "all", label: "All Orders", icon: <FaList /> },
    { id: "pending", label: "Pending", icon: <FaClock /> },
    { id: "cooking", label: "Cooking", icon: <FaFire /> },
    { id: "delivered", label: "Delivered", icon: <FaCheckCircle /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar w-full mb-5 animate-slide-up">
      <div className="inline-flex gap-1.5 bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] p-1.5 rounded-2xl shadow-sm">
        {filters.map((filter) => {
          const isActive = filterStatus === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              className={`flex items-center gap-2 border-none py-2 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all uppercase tracking-wider whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-amber-400/90 dark:bg-amber-500 text-neutral-950 shadow-sm scale-[1.01]"
                  : "bg-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
              onClick={() => setFilterStatus(filter.id)}
            >
              <span className="text-xs">{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderFilterBar;
