import React from "react";
import { FaDollarSign, FaShoppingBag, FaUtensils, FaUsers } from "react-icons/fa";

export default function DashboardKpiCards({
  profitData = { revenue: 0, gross_profit: 0 },
  totalOrdersCount = 0,
  menuItemsCount = 0,
  totalCustomers = 0,
  setActiveTab,
}) {
  const statsData = [
    {
      title: "Today's Profit",
      value: `Rs. ${profitData.gross_profit.toLocaleString()}`,
      icon: <FaDollarSign />,
      change: `Revenue: Rs. ${profitData.revenue.toLocaleString()}`,
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      tabName: "profit",
    },
    {
      title: "Total Orders",
      value: totalOrdersCount.toLocaleString(),
      icon: <FaShoppingBag />,
      change: "All-time volume",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      tabName: "orders",
    },
    {
      title: "Active Products",
      value: menuItemsCount,
      icon: <FaUtensils />,
      change: "Menu catalog",
      accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      tabName: "menu",
    },
    {
      title: "Unique Customers",
      value: totalCustomers.toLocaleString(),
      icon: <FaUsers />,
      change: "Direct buyers",
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      tabName: "staff",
    },
    
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="bg-[var(--panel-bg)] border border-[var(--border-subtle)] p-4 sm:p-5 rounded-2xl flex items-center gap-4 transition-all duration-200 hover:border-amber-500/40 hover:-translate-y-0.5 shadow-sm group cursor-pointer"
          onClick={() => setActiveTab(stat.tabName)}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 border ${stat.accent}`}
          >
            {stat.icon}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] block truncate">
              {stat.title}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] m-0 mt-0.5 font-mono truncate">
              {stat.value}
            </h3>
            <span className="text-[10px] text-[var(--text-secondary)] block font-semibold mt-0.5 truncate">
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
