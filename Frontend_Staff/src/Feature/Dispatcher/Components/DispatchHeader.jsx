import React, { useState } from "react";
import {
  FaFire,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../Context/ThemeContext";
import { useStaffAuth } from "../../../Context/AuthContext";

export default function DispatchHeader({ onRefresh, isRefreshing = false }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useStaffAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch Settings from React Query
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_settings.php`
      );
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  const storeLogo = settingsData?.store_logo || "";

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login", { replace: true, state: {} });
  };

  return (
    <>
      <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 z-40 transition-colors shadow-xs">
        {/* Left: Store Logo + Divider + Portal Badge Grouping */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            {storeLogo ? (
              <img
                src={storeLogo}
                alt="Dispatch Brand Logo"
                className="h-8 sm:h-9 w-auto max-w-[130px] object-contain transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <>
                <div className="bg-amber-500 text-neutral-950 p-1.5 rounded-lg text-base flex items-center justify-center shadow-xs">
                  <FaFire />
                </div>
                <h1 className="font-['Oswald',sans-serif] font-black text-xl text-stone-900 dark:text-white m-0 tracking-wider uppercase">
                  Big<span className="text-amber-500">Bite</span>
                </h1>
              </>
            )}
          </div>

          {/* Divider Line */}
          <div className="h-5 w-px bg-stone-300 dark:bg-neutral-800 hidden sm:block" />

          {/* Portal Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-neutral-800 bg-stone-100/90 dark:bg-neutral-800/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider font-['Oswald',sans-serif] text-stone-800 dark:text-neutral-100 uppercase">
              Dispatcher Portal
            </span>
          </div>
        </div>

        {/* Right Controls: Sync Live Data, Theme Toggle & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sync Live Button (Refreshes Orders, Active Trips & Riders) */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 px-3 rounded-xl bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-xs disabled:opacity-60"
              title="Sync Live Orders & Riders"
              aria-label="Sync Live Orders & Riders"
            >
              <FaSyncAlt className={`text-xs text-amber-500 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline font-mono">{isRefreshing ? "Syncing..." : "Sync Live"}</span>
            </button>
          )}

          {/* Glassmorphic Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 dark:hover:text-amber-400 transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <FaSun className="text-amber-400 text-xs sm:text-sm" />
            ) : (
              <FaMoon className="text-xs sm:text-sm" />
            )}
          </button>

          {/* High-Contrast Logout Button */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-xs"
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt className="text-xs" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal with Full Light & Dark Theme Parity */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Circle */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl shadow-xs">
              <FaExclamationTriangle />
            </div>

            {/* Modal Heading & Description */}
            <h3 className="text-xl font-bold font-['Oswald',sans-serif] text-stone-900 dark:text-white mb-2 uppercase tracking-wide">
              End Dispatch Session?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-neutral-400 mb-6">
              Are you sure you want to log out of the Dispatcher Portal?
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="bg-stone-100 hover:bg-stone-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 font-semibold py-2.5 px-5 rounded-xl text-xs border border-stone-300 dark:border-neutral-700 transition-all cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-red-500/20 transition-all border-none cursor-pointer active:scale-95"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
