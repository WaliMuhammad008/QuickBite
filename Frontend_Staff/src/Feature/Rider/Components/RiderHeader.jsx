import React, { useState } from "react";
import { FaFire, FaSignOutAlt, FaSun, FaMoon, FaExclamationTriangle } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../../../Context/ThemeContext";

export default function RiderHeader({ onLogout, riderName }) {
  const { theme, toggleTheme } = useTheme();
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
    onLogout();
  };

  return (
    <>
      <header className="h-14 px-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-stone-200 dark:border-neutral-800 flex justify-between items-center z-40 transition-colors shadow-xs">
        {/* Brand & Rider Name (Left) */}
        <div className="flex items-center gap-2.5">
          {storeLogo ? (
            <img
              src={storeLogo}
              alt="Rider Brand Logo"
              className="h-7 w-auto max-w-[110px] object-contain"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="bg-amber-500 text-neutral-950 p-1 rounded-md text-xs flex">
                <FaFire />
              </div>
              <h1 className="font-['Oswald',sans-serif] font-black text-lg text-stone-900 dark:text-white m-0 uppercase tracking-wide">
                Big<span className="text-amber-500">Bite</span>
              </h1>
            </div>
          )}

          <div className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-stone-700 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-wider">
            {riderName || "RIDER"}
          </div>
        </div>

        {/* Right Actions: Theme Toggle & Logout */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 dark:hover:text-amber-400 transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <FaSun className="text-amber-400 text-xs" />
            ) : (
              <FaMoon className="text-xs" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center shadow-xs"
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt className="text-xs" />
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-6 max-w-xs w-full shadow-2xl text-center transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-3.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xl shadow-xs">
              <FaExclamationTriangle />
            </div>
            <h3 className="text-lg font-bold font-['Oswald',sans-serif] text-stone-900 dark:text-white mb-1.5 uppercase tracking-wide">
              End Rider Shift?
            </h3>
            <p className="text-xs text-stone-600 dark:text-neutral-400 mb-5">
              Are you sure you want to end your shift and log out?
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 font-semibold text-xs border border-stone-300 dark:border-neutral-700 transition-all cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all border-none cursor-pointer active:scale-95"
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