import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaClipboardList,
  FaUtensils,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaBoxOpen,
  FaTag,
  FaTicketAlt,
  FaUserTie,
  FaDesktop,
  FaQrcode,
  FaMoneyBillWave,
  FaUserShield,
  FaUsers,
  FaStar,
  FaExternalLinkAlt,
} from "react-icons/fa";

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
}) => {
  const [storeLogo, setStoreLogo] = useState("");
  const [userData, setUserData] = useState({ name: "Admin", role: "Manager" });

  // Fetch user info from session
  useEffect(() => {
    try {
      const rawUser =
        sessionStorage.getItem("staff_user") ||
        sessionStorage.getItem("staff_session") ||
        sessionStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        setUserData({
          name: parsed.name || parsed.username || "Administrator",
          role: parsed.role || "Admin",
        });
      }
    } catch (e) {
      console.error("Sidebar user parse error", e);
    }
  }, []);

  // Fetch Logo from settings
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_settings.php`
        );
        const result = await response.json();

        if (result.success && result.data.store_logo) {
          setStoreLogo(result.data.store_logo);
        }
      } catch (error) {
        console.error("Sidebar: Failed to load logo", error);
      }
    };
    fetchLogo();
  }, []);

  const handleViewStore = () => {
    const configuredUrl = import.meta.env.VITE_CUSTOMER_URL;
    if (configuredUrl) {
      window.open(configuredUrl, "_blank");
      return;
    }
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      const targetPort = window.location.port === "5173" ? "5174" : "5173";
      window.open(`http://${window.location.hostname}:${targetPort}`, "_blank");
    } else {
      window.open("/", "_blank");
    }
  };

  const menuSections = [
    {
      title: "Core Operations",
      items: [
        { id: "dashboard", icon: <FaHome />, label: "Overview" },
        { id: "orders", icon: <FaClipboardList />, label: "Live Orders" },
        { id: "menu", icon: <FaUtensils />, label: "Menu & Addons" },
        { id: "deals", icon: <FaTag />, label: "Combos & Deals" },
      ],
    },
    {
      title: "Management & HR",
      items: [
        { id: "customers", icon: <FaUsers />, label: "Customers CRM" },
        { id: "reviews", icon: <FaStar />, label: "Customer Reviews" },
        { id: "inventory", icon: <FaBoxOpen />, label: "Inventory" },
        { id: "staff", icon: <FaUserTie />, label: "Staff & HR" },
        { id: "tables", icon: <FaQrcode />, label: "Tables & QR" },
      ],
    },
    {
      title: "Finance & Store",
      items: [
        { id: "analytics", icon: <FaChartLine />, label: "Analytics" },
        { id: "profit", icon: <FaMoneyBillWave />, label: "Product Profits" },
        { id: "coupons", icon: <FaTicketAlt />, label: "Promo Codes" },
        { id: "homepage_builder", icon: <FaDesktop />, label: "Homepage Builder" },
        { id: "settings", icon: <FaCog />, label: "System Settings" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay (< lg) */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[1040] lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 block" : "opacity-0 pointer-events-none hidden"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main Sidebar Shell (Fixed Drawer on < lg, Static on lg+) */}
      <aside
        className={`w-64 lg:w-60 xl:w-64 2xl:w-72 bg-white dark:bg-[#161616] border-r border-slate-200 dark:border-white/[0.08] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 fixed inset-y-0 left-0 h-full z-[1050] select-none shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header with Admin Profile */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-2.5 shrink-0 bg-slate-50/80 dark:bg-white/[0.02]">
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt="Store Logo"
                className="max-h-9 max-w-[85px] sm:max-w-[95px] object-contain shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/20 shrink-0">
                BigBite
              </div>
            )}
          </div>

          {/* Admin User Info (Top next to Logo) */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-start pl-2.5 border-l border-slate-200 dark:border-white/10">
            <div className="min-w-0 text-left">
              <div className="text-md font-black text-slate-900 dark:text-white truncate leading-tight">
                {userData.name}
              </div>
              <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider leading-tight">
                {userData.role}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-5">
          {menuSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-neutral-500">
                {sec.title}
              </div>
              <ul className="list-none p-0 m-0 space-y-1">
                {sec.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border-none text-left relative ${
                          isActive
                            ? "bg-amber-400/90 dark:bg-amber-500 text-neutral-950 font-bold shadow-sm scale-[1.01]"
                            : "bg-transparent text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span
                          className={`text-sm shrink-0 transition-transform duration-200 ${
                            isActive ? "scale-110 text-neutral-950 font-black" : "text-slate-400 dark:text-neutral-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="tracking-wide flex-1 truncate">{item.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* View Store & Logout Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02] shrink-0 space-y-2">
          {/* View Customer Store Button */}
          <button
            type="button"
            onClick={handleViewStore}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-neutral-950 dark:hover:text-neutral-950 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 shadow-sm group"
          >
            <FaExternalLinkAlt className="text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span>View Store</span>
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 dark:text-red-400 hover:text-white border border-red-500/20 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            <FaSignOutAlt className="text-xs" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
