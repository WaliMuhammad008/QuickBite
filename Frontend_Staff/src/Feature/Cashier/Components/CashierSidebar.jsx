import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  FaCashRegister,
  FaHistory,
  FaChartPie,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaTimes,
} from "react-icons/fa";
import { useTheme } from "../../../Context/ThemeContext";
import { useStaffAuth } from "../../../Context/AuthContext";
import bigBiteLogo from "../../../assets/bigbite logo.png";

const CashierSidebar = ({
  activeTab,
  setActiveTab,
  onResetTerminal,
  onClose,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useStaffAuth();

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

  const handleSecureLogout = () => {
    Swal.fire({
      title: "End Shift?",
      text: "Are you sure you want to end your cashier session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Yes, Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login", { replace: true, state: {} });
      }
    });
  };

  const navItems = [
    { id: "terminal", label: "POS Terminal", icon: FaCashRegister },
    { id: "history", label: "History", icon: FaHistory },
    { id: "shift", label: "Sales Report", icon: FaChartPie },
  ];

  return (
    <aside className="w-56 xl:w-60 shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between p-3.5 xl:p-4 h-full select-none font-sans">
      <div>
        {/* Header Branding Section */}
        <div className="flex items-center justify-between px-2 py-2 mb-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={storeLogo || bigBiteLogo}
              alt="Logo"
              className="w-9 h-9 object-contain drop-shadow"
            />
            <div>
              <h2 className="text-sm font-black tracking-wider text-zinc-900 dark:text-white uppercase font-mono m-0">
                BIGBITE
              </h2>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-none cursor-pointer text-xs transition-colors"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Compact Nav Item Tabs */}
        <div className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all border-none ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold shadow-lg shadow-amber-500/25 scale-[1.02] text-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 bg-transparent text-xs font-medium"
                }`}
                onClick={() => {
                  if (item.id === "terminal" && activeTab === "terminal" && onResetTerminal) {
                    onResetTerminal();
                  } else {
                    setActiveTab(item.id);
                  }
                  if (onClose) onClose();
                }}
              >
                <Icon className="text-base shrink-0" />
                <span className="font-semibold tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls (Appearance on Desktop + Logout) */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col gap-2">
        {/* Appearance Toggle Pill - Desktop only, since mobile top navbar already contains theme toggle */}
        {!onClose && (
          <button
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium text-xs flex items-center justify-between border border-zinc-200/50 dark:border-zinc-800/50 cursor-pointer transition-all"
            onClick={toggleTheme}
          >
            <span>Appearance</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-amber-500 font-semibold capitalize">
                {theme}
              </span>
              {theme === "dark" ? (
                <FaSun className="text-xs text-amber-400" />
              ) : (
                <FaMoon className="text-xs text-zinc-600" />
              )}
            </div>
          </button>
        )}

        {/* End Shift / Logout Button */}
        <button
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold text-xs border border-rose-500/20 transition-all active:scale-95 cursor-pointer"
          onClick={handleSecureLogout}
        >
          <FaSignOutAlt className="text-xs" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default CashierSidebar;
