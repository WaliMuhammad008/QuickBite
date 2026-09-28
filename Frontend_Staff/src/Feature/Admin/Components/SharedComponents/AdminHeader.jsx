import React, { useState, useEffect, useRef } from "react";
import {
  FaSun,
  FaMoon,
  FaClock,
  FaBell,
  FaUtensils,
  FaMotorcycle,
  FaTimesCircle,
  FaFire,
  FaCheck,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaArrowRight,
  FaBoxes,
} from "react-icons/fa";
import { HiBars3BottomLeft } from "react-icons/hi2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../../../Context/ThemeContext";
import { staffSocket } from "../../../../utils/socket";

const TAB_DESCRIPTIONS = {
  dashboard: "Real-time metrics, order volumes, and financial summary",
  orders: "Live kitchen, cashier, and delivery pipeline monitoring",
  menu: "Product catalog, pricing, variants, and addon modifiers",
  deals: "Promotional combos, bundle deals, and dynamic banners",
  inventory: "Raw ingredient tracking, stock alerts, and wastage loss audits",
  staff: "Employee, attendance logs, and payroll management",
  analytics: "Sales trends, top performing items, and customer metrics",
  profit: "Item-level cost breakdown, gross profits, and profit margins",
  tables: "Dine-in floor plan, active occupancy, and printable QR codes",
  homepage_builder: "Customer portal hero slider, banners, and layout controls",
  settings: "Restaurant profile, operational timings, delivery rules, and legal terms",
};

const AdminHeader = ({ activeTab, setActiveTab, setIsSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time socket sync for notifications
  useEffect(() => {
    const handleNotifSync = () => {
      queryClient.invalidateQueries({ queryKey: ["staff_notifications"] });
    };
    staffSocket.on("refresh_kitchen", handleNotifSync);
    staffSocket.on("refresh_orders", handleNotifSync);
    return () => {
      staffSocket.off("refresh_kitchen", handleNotifSync);
      staffSocket.off("refresh_orders", handleNotifSync);
    };
  }, [queryClient]);

  // Poll staff notifications every 60 seconds (idle fallback)
  const { data: notifData = {} } = useQuery({
    queryKey: ["staff_notifications"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/admin_wastage_manager.php?action=get_notifications`
        );
        const data = await res.json();
        return data.success ? data : { unread_count: 0, notifications: [] };
      } catch (e) {
        return { unread_count: 0, notifications: [] };
      }
    },
    refetchInterval: 60000,
  });

  const unreadCount = notifData.unread_count || 0;
  const notifications = notifData.notifications || [];

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/admin_wastage_manager.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_notifications_read" }),
      });
      queryClient.invalidateQueries({ queryKey: ["staff_notifications"] });
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const getNotifIcon = (notif) => {
    if (notif.type === "stock_alert") {
      return notif.severity === "critical" ? (
        <FaExclamationTriangle className="text-rose-500 text-xs animate-pulse" />
      ) : (
        <FaExclamationCircle className="text-amber-500 text-xs" />
      );
    }
    switch (notif.type) {
      case "remake":
        return <FaUtensils className="text-amber-500 text-xs" />;
      case "delivery_failed":
        return <FaMotorcycle className="text-rose-500 text-xs" />;
      case "cancellation":
        return <FaTimesCircle className="text-blue-500 text-xs" />;
      case "wastage":
        return <FaFire className="text-purple-500 text-xs" />;
      default:
        return <FaBell className="text-amber-500 text-xs" />;
    }
  };

  const titleFormatted = (activeTab || "Dashboard")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className="w-full px-4 sm:px-6 lg:px-8 py-3.5 bg-[var(--admin-panel,#171717)]/95 backdrop-blur-md border-b border-[var(--admin-border,rgba(255,255,255,0.06))] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 shrink-0 z-20">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white flex items-center justify-center border border-slate-200 dark:border-white/10 cursor-pointer transition-all shrink-0 active:scale-95"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Navigation"
        >
          <HiBars3BottomLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full shrink-0" />
            <h1 className="m-0 text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide font-['Oswald',sans-serif] uppercase truncate">
              {titleFormatted}
            </h1>
          </div>
          <p className="hidden md:block text-[11px] text-slate-500 dark:text-neutral-400 m-0 mt-0.5 truncate font-sans">
            {TAB_DESCRIPTIONS[activeTab] || "Manage and configure your system"}
          </p>
        </div>
      </div>

      {/* Right: Live Status Pill, Notifications & Theme Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Live Store Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider">Store Online</span>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-[var(--admin-muted,#9ca3af)] text-xs font-mono font-semibold">
          <FaClock className="text-amber-500 dark:text-amber-400 text-[11px]" />
          <span>{currentTime}</span>
        </div>

        {/* ═══ LIVE NOTIFICATIONS BELL & DROPDOWN ═══ */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-xs active:scale-95"
            title="Real-Time Staff Alerts"
            aria-label="Staff Notifications"
          >
            <FaBell className="text-xs sm:text-sm text-amber-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center px-1 shadow-md animate-bounce">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
              <div className="p-3.5 bg-zinc-50 dark:bg-neutral-950/80 border-b border-zinc-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaBell className="text-amber-500 text-xs" />
                  <span className="text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider text-zinc-900 dark:text-white">
                    Live Operational Alerts
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
                  >
                    <FaCheck className="text-[9px]" /> Mark All Read
                  </button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-100 dark:divide-neutral-800">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    No recent staff alerts or notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 transition-colors flex items-start gap-2.5 ${
                        notif.type === "stock_alert" && notif.severity === "critical"
                          ? "bg-rose-500/5 dark:bg-rose-500/10"
                          : notif.type === "stock_alert" && notif.severity === "warning"
                          ? "bg-amber-500/5 dark:bg-amber-500/10"
                          : notif.is_read == 0
                          ? "bg-amber-500/5 dark:bg-amber-500/10"
                          : "hover:bg-zinc-50 dark:hover:bg-neutral-800/40"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === "stock_alert" && notif.severity === "critical"
                          ? "bg-rose-100 dark:bg-rose-900/40"
                          : notif.type === "stock_alert" && notif.severity === "warning"
                          ? "bg-amber-100 dark:bg-amber-900/40"
                          : "bg-zinc-100 dark:bg-neutral-800"
                      }`}>
                        {getNotifIcon(notif)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {notif.type === "stock_alert" && (
                              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ${
                                notif.severity === "critical"
                                  ? "bg-rose-500 text-white"
                                  : "bg-amber-500 text-white"
                              }`}>
                                {notif.severity === "critical" ? "Critical" : "Low"}
                              </span>
                            )}
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white m-0 truncate">
                              {notif.title}
                            </h4>
                          </div>
                          <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                            {new Date(notif.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 m-0 mt-0.5 leading-snug break-words">
                          {notif.message}
                        </p>
                        {notif.type === "stock_alert" && setActiveTab && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("inventory");
                              setIsNotifOpen(false);
                            }}
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline bg-transparent border-none cursor-pointer p-0"
                          >
                            <FaBoxes className="text-[9px]" /> View in Inventory <FaArrowRight className="text-[8px]" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-[var(--admin-text,#fff)] border border-slate-200 dark:border-[var(--admin-border,rgba(255,255,255,0.08))] flex items-center justify-center cursor-pointer transition-all shadow-sm group"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <FaSun className="theme-toggle-icon text-amber-400 text-xs sm:text-sm group-hover:rotate-45 group-active:scale-125" />
          ) : (
            <FaMoon className="theme-toggle-icon text-neutral-700 text-xs sm:text-sm group-hover:-rotate-12 group-active:scale-125" />
          )}
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
