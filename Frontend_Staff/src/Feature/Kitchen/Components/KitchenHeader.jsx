import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  FaFire,
  FaClock,
  FaUtensils,
  FaShoppingBag,
  FaMotorcycle,
  FaList,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaChevronDown,
  FaBell,
  FaSync,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useTheme } from "../../../Context/ThemeContext";
import { useStaffAuth } from "../../../Context/AuthContext";
import { playKitchenChime } from "../hooks/useKitchenOrders";
import { apiFetch } from "../../../utils/apiHelper";

const FILTER_TABS = [
  { label: "ALL", value: "ALL", icon: FaList },
  { label: "DINE-IN", value: "DINE-IN", icon: FaUtensils },
  { label: "TAKEAWAY", value: "TAKEAWAY", icon: FaShoppingBag },
  { label: "DELIVERY", value: "DELIVERY", icon: FaMotorcycle },
];

export default function KitchenHeader({
  activeFilter,
  setActiveFilter,
  isRefetching = false,
  onRefresh,
}) {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useStaffAuth();

  // Fetch Settings from React Query
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await apiFetch("get_settings.php");
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  const storeLogo = settingsData?.store_logo || "";

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSecureLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to end your kitchen session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#78716c",
      confirmButtonText: "Yes, Logout",
      background: theme === "dark" ? "#18181b" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#1c1917",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login", { replace: true, state: {} });
      }
    });
  };

  const normalizedActive = (activeFilter || "ALL").toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-stone-200 dark:border-neutral-800 px-3.5 py-2 flex items-center justify-between gap-3 shadow-xs transition-colors duration-200">
      {/* Left: Brand Logo + Desktop/Tablet Live Badge */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          {storeLogo ? (
            <img
              src={storeLogo}
              alt="Kitchen Brand Logo"
              className="h-7 w-auto max-w-[120px] object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <>
              <div className="bg-amber-500 text-neutral-950 p-1.5 rounded-lg text-sm sm:text-base flex items-center justify-center shadow-xs">
                <FaFire />
              </div>
              <h1 className="font-['Oswald',sans-serif] font-black text-base sm:text-xl text-stone-900 dark:text-white m-0 tracking-wider uppercase">
                Big<span className="text-amber-500">Bite</span>
              </h1>
            </>
          )}
        </div>

        {/* Live KDS Pulse Badge (Visible on Tablet/Desktop, Hidden on Mobile) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase select-none">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden lg:inline">KITCHEN DISPLAY</span>
          <span className="lg:hidden">LIVE</span>
        </div>
      </div>

      {/* Center: Desktop Segmented Filter Rail (>= 768px) */}
      <div className="hidden md:flex items-center p-1 bg-stone-100 dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shrink-0">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = normalizedActive === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wide uppercase transition-all border-none flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-neutral-950 font-extrabold shadow-xs"
                  : "text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white font-semibold bg-transparent"
              }`}
            >
              <Icon className="text-[10px]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls: Desktop Clock + Mobile Filter Dropdown + Theme + Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Digital Clock Badge (Visible on Tablet/Desktop >= 768px, Hidden on Mobile) */}
        <div className="hidden md:flex font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800 text-stone-800 dark:text-neutral-200 items-center gap-1.5 shadow-xs">
          <FaClock className="text-amber-500 text-xs" />
          <span>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>

        {/* Compact Order Filter Dropdown on Mobile (< 768px) */}
        <div className="md:hidden relative">
          <select
            value={normalizedActive}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="h-7.5 px-2.5 pr-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-stone-800 dark:text-neutral-200 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            aria-label="Order Filter"
          >
            {FILTER_TABS.map((tab) => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-stone-500 dark:text-neutral-400 pointer-events-none" />
        </div>

        {/* On-Demand Refresh / Sync Button */}
        <button
          type="button"
          onClick={() => {
            if (onRefresh) {
              onRefresh();
              toast.success("Kitchen board refreshed!");
            }
          }}
          disabled={isRefetching}
          className="h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-stone-200 dark:border-neutral-700 text-stone-700 dark:text-neutral-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs disabled:opacity-60"
          title="Manual Live Sync"
          aria-label="Refresh Kitchen Orders"
        >
          <FaSync
            className={`text-xs ${
              isRefetching ? "animate-spin text-amber-500" : ""
            }`}
          />
          <span className="hidden xl:inline text-[11px]">Sync</span>
        </button>

        {/* Test Audio Chime & Unlock Button */}
        <button
          type="button"
          onClick={() => {
            playKitchenChime();
            toast.success("🔔 Audio Chime Verified & Active!");
          }}
          className="h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
          title="Test Kitchen Audio Chime & Unlock Sound"
          aria-label="Test Sound"
        >
          <FaBell className="text-xs" />
          <span className="hidden xl:inline text-[11px]">Chime</span>
        </button>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-7.5 h-7.5 sm:w-8 sm:h-8 p-1.5 rounded-lg sm:rounded-xl bg-stone-100 dark:bg-neutral-800 sm:dark:bg-neutral-950 border border-stone-200 dark:border-neutral-700 sm:dark:border-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 dark:hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <FaSun className="text-amber-400 text-xs sm:text-sm" /> : <FaMoon className="text-xs sm:text-sm" />}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleSecureLogout}
          className="flex items-center justify-center gap-1.5 h-7.5 sm:h-8 px-2 sm:px-3.5 rounded-lg sm:rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer active:scale-95"
          title="Logout"
          aria-label="Logout"
        >
          <FaSignOutAlt className="text-xs" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
