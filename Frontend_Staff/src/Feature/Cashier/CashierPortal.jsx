import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaBars, FaSun, FaMoon, FaShoppingCart } from "react-icons/fa";
import { useTheme } from "../../Context/ThemeContext";
import { useStaffAuth } from "../../Context/AuthContext";
import bigBiteLogo from "../../assets/bigbite logo.png";

// Components
import CashierSidebar from "./Components/CashierSidebar";
import POSTerminal from "./Components/POSTerminal";
import OrderHistory from "./Components/OrderHistory";
import ShiftReport from "./Components/ShiftReport";
import CashierReceiptModal from "./Components/CashierReceiptModal";

const CashierPortal = () => {
  const navigate = useNavigate();
  const { logout } = useStaffAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Normalize tab names (supports aliases: 'pos', 'terminal', 'history', 'sales', 'shift')
  const normalizeTab = (tab) => {
    if (!tab) return null;
    const t = String(tab).toLowerCase().trim();
    if (t === "pos" || t === "terminal") return "terminal";
    if (t === "history") return "history";
    if (t === "sales" || t === "shift" || t === "report") return "shift";
    return null;
  };

  const getInitialTab = () => {
    // 1. URL search param has highest priority (?tab=sales, ?tab=history, ?tab=pos)
    const urlTab = normalizeTab(searchParams.get("tab"));
    if (urlTab) return urlTab;

    // 2. LocalStorage fallback
    const savedTab = normalizeTab(localStorage.getItem("cashier_active_tab"));
    if (savedTab) return savedTab;

    // 3. Default fallback to POS terminal
    return "terminal";
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  // Sync state to LocalStorage and URL search param
  const setActiveTab = (tabName) => {
    const validTab = normalizeTab(tabName) || "terminal";
    setActiveTabState(validTab);
    try {
      localStorage.setItem("cashier_active_tab", validTab);
    } catch (e) {
      console.warn("localStorage error:", e);
    }

    const publicTabParam =
      validTab === "terminal" ? "pos" : validTab === "shift" ? "sales" : "history";

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", publicTabParam);
        return next;
      },
      { replace: true }
    );
  };

  // Sync if URL search param changes or ensure current tab is reflected in URL
  useEffect(() => {
    const urlTab = normalizeTab(searchParams.get("tab"));
    if (urlTab && urlTab !== activeTab) {
      setActiveTabState(urlTab);
      try {
        localStorage.setItem("cashier_active_tab", urlTab);
      } catch (e) {}
    } else if (!urlTab) {
      const publicTabParam =
        activeTab === "terminal" ? "pos" : activeTab === "shift" ? "sales" : "history";
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("tab", publicTabParam);
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams]);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedOrderToView, setSelectedOrderToView] = useState(null);
  const [terminalResetTrigger, setTerminalResetTrigger] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

  // Fetch store logo for top mobile header
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

  // Shift Report local order state
  const [ordersData, setOrdersData] = useState([]);

  // Order placed trigger
  const handlePlaceNewOrder = (fullOrderData) => {
    setOrdersData([fullOrderData, ...ordersData]);
    setSelectedOrderToView(fullOrderData);
    setIsReceiptModalOpen(true);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to exit the POS?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login", { replace: true, state: {} });
      }
    });
  };

  // View Button Logic
  const handleViewClick = (order) => {
    setSelectedOrderToView(order);
    setIsReceiptModalOpen(true);
  };

  // Print Button Logic
  const handlePrintClick = (order) => {
    setSelectedOrderToView(order);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden relative [perspective:none] [transform:none]">
      {/* Sleek Glassmorphic Mobile Top Navbar (< lg) */}
      <header className="lg:hidden flex items-center justify-between px-3.5 py-2.5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 sticky top-0 z-30 shadow-xs shrink-0">
        {/* Left: Hamburger + Logo + Station Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-amber-500 hover:border-amber-500/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Open Navigation"
          >
            <FaBars className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt="Logo"
                className="h-7 w-7 object-contain drop-shadow"
              />
            ) : (
              <img
                src={bigBiteLogo}
                alt="Logo"
                className="h-7 w-7 object-contain drop-shadow"
              />
            )}
            <span className="text-xs font-black tracking-wider uppercase text-zinc-900 dark:text-white font-mono">
              CASHIER POS
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle + Cart Trigger */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 shadow-2xs"
            onClick={toggleTheme}
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? (
              <FaSun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <FaMoon className="w-3.5 h-3.5 text-zinc-700" />
            )}
          </button>

          {/* Cart Icon Button (Only shown on POS Terminal tab) */}
          {activeTab === "terminal" && (
            <button
              onClick={() => setIsMobileCartOpen(true)}
              className="relative p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center border-none cursor-pointer"
              aria-label="Open Cart"
            >
              <FaShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-black rounded-full flex items-center justify-center border border-white dark:border-zinc-900">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* 1. Desktop Fixed Sidebar (hidden lg:flex) */}
      <div className="hidden lg:flex shrink-0 h-full">
        <CashierSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onResetTerminal={() => setTerminalResetTrigger((prev) => prev + 1)}
        />
      </div>

      {/* 2. Mobile Drawer Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          isMobileSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* 3. Mobile Sliding Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 shadow-2xl lg:hidden transform transition-transform duration-300 ease-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <CashierSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onResetTerminal={() => setTerminalResetTrigger((prev) => prev + 1)}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full min-w-0 h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 [perspective:none] [transform:none] [transform-style:flat] [clip-path:none] [mask-image:none] [-webkit-mask-image:none]">
        {activeTab === "terminal" && (
          <POSTerminal
            onPlaceOrder={handlePlaceNewOrder}
            terminalResetTrigger={terminalResetTrigger}
            isMobileCartOpen={isMobileCartOpen}
            setIsMobileCartOpen={setIsMobileCartOpen}
            onCartCountChange={setCartItemCount}
          />
        )}
        {activeTab === "history" && (
          <div className="w-full [perspective:none] [transform:none] [transform-style:flat]">
            <OrderHistory
              onViewClick={handleViewClick}
              onPrintClick={handlePrintClick}
              onViewOrder={handleViewClick}
              onPrintReceipt={handlePrintClick}
            />
          </div>
        )}
        {activeTab === "shift" && <ShiftReport ordersData={ordersData} />}
      </main>

      {/* Receipt Modal */}
      <CashierReceiptModal
        isOpen={isReceiptModalOpen}
        order={selectedOrderToView}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};

export default CashierPortal;
