import React from "react";
import { FaChevronRight, FaMapMarkerAlt, FaUser, FaSignOutAlt, FaReceipt } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

export default function HeaderMobileDrawer({
  mobileMenuOpen,
  setMobileMenuOpen,
  navItems,
  isNavActive,
  navigate,
}) {
  const { customer, isAuthenticated, logout, openAuthModal, openProfileDrawer } = useAuth();

  if (!mobileMenuOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-2xl border-b border-zinc-200 dark:border-white/10 p-4 sm:p-5 shadow-2xl space-y-3 animate-in slide-in-from-top-3 duration-200 z-[100]">
      {/* Customer Quick Status Card */}
      <div className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
        {isAuthenticated ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  Hi, {customer?.full_name || "Foodie"}! 👋
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-gray-400">
                  {customer?.phone || customer?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-500/10 px-2.5 py-1.5 rounded-lg border-none cursor-pointer"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openProfileDrawer("orders");
                }}
                className="py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 border-none cursor-pointer"
              >
                <FaReceipt className="text-[10px]" />
                <span>My Orders</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openProfileDrawer("addresses");
                }}
                className="py-1.5 px-2.5 rounded-lg bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 border-none cursor-pointer"
              >
                <FaMapMarkerAlt className="text-[10px]" />
                <span>Addresses</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Unlock saved addresses & deals
            </span>
            <button
              type="button"
              onClick={() => {
                openAuthModal("login");
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold bg-amber-500 text-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs border-none cursor-pointer"
            >
              <FaUser className="text-[10px]" /> Sign In
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {navItems.map((nav) => {
          const active = isNavActive(nav.to);
          return (
            <button
              key={nav.to}
              type="button"
              onClick={() => {
                navigate(nav.to);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-['Oswald',sans-serif] font-bold text-base tracking-wide border cursor-pointer transition-all ${
                active
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-500 dark:bg-amber-400/15 dark:border-amber-400/40 dark:text-amber-400 shadow-sm font-bold"
                  : "bg-zinc-100/70 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-800 dark:text-neutral-200 border-zinc-200/80 dark:border-white/5 hover:border-orange-500/30"
              }`}
            >
              <span className="uppercase">{nav.label}</span>
              <FaChevronRight
                className={`text-xs ${
                  active
                    ? "text-orange-500 dark:text-amber-400"
                    : "text-zinc-400 dark:text-neutral-500"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Quick Helpline Support Button inside Drawer */}
      <div className="pt-2 border-t border-zinc-200 dark:border-white/10">
        <button
          type="button"
          onClick={() => {
            navigate("/track-order");
            setMobileMenuOpen(false);
          }}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border-none cursor-pointer"
        >
          <FaMapMarkerAlt className="text-xs" />
          <span>Live Order Tracking</span>
        </button>
      </div>
    </div>
  );
}
