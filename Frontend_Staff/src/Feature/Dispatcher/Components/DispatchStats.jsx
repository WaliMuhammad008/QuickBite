import React from "react";
import {
  FaClock,
  FaMotorcycle,
  FaRoute,
  FaCheckCircle,
} from "react-icons/fa";

export default function DispatchStats({
  readyCount = 0,
  freeRiders = 0,
  avgDeliveryTime = 24,
  completedToday = 0,
}) {
  const statCards = [
    {
      title: "Pending Dispatch",
      value: readyCount,
      unit: "Orders",
      icon: <FaClock className="text-lg" />,
      badgeClass: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      valueColor: "text-amber-500 dark:text-amber-400",
    },
    {
      title: "Available Riders",
      value: freeRiders,
      unit: "Free",
      icon: <FaMotorcycle className="text-lg" />,
      badgeClass: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      valueColor: "text-emerald-500 dark:text-emerald-400",
    },
    {
      title: "Avg. Delivery Time",
      value: avgDeliveryTime,
      unit: "Mins",
      icon: <FaRoute className="text-lg" />,
      badgeClass: "bg-sky-500/10 text-sky-500 border border-sky-500/20",
      valueColor: "text-sky-500 dark:text-sky-400",
    },
    {
      title: "Completed Today",
      value: completedToday,
      unit: "Delivered",
      icon: <FaCheckCircle className="text-lg" />,
      badgeClass: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
      valueColor: "text-purple-500 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3 max-w-full">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:border-stone-300 dark:hover:border-neutral-700 transition-all flex items-center gap-3.5"
        >
          {/* Accent Themed Icon Badge */}
          <div
            className={`p-3 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${card.badgeClass}`}
          >
            {card.icon}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-stone-500 dark:text-neutral-400 uppercase font-bold tracking-wider truncate block">
              {card.title}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-2xl font-bold font-['Oswald',sans-serif] tracking-wide ${card.valueColor}`}
              >
                {card.value}
              </span>
              <span className="text-xs font-semibold text-stone-500 dark:text-neutral-400">
                {card.unit}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
