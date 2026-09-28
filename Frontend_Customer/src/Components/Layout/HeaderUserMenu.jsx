import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaSignOutAlt, FaMapMarkerAlt, FaReceipt, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

export default function HeaderUserMenu() {
  const { customer, isAuthenticated, logout, openAuthModal, openProfileDrawer } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => openAuthModal("login")}
        className="relative group w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border border-zinc-200/80 dark:border-neutral-800 bg-zinc-100 dark:bg-neutral-900/80 overflow-hidden flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer shadow-xs"
        title="Sign In / Register"
        aria-label="Customer Sign In"
      >
        <span className="absolute inset-0 w-full h-full bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></span>
        <FaUser className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-700 dark:text-zinc-300 group-hover:text-black transition-colors duration-300" />
      </button>
    );
  }

  // Get initials for avatar
  const initials = customer.full_name
    ? customer.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "QB";

  const firstName = customer.full_name ? customer.full_name.split(" ")[0] : "Customer";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-neutral-800 flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs hover:border-amber-500/50"
        aria-label="Customer Profile Menu"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center shadow-xs overflow-hidden">
          {customer.avatar_url || customer.avatar ? (
            <img
              src={customer.avatar_url || customer.avatar}
              alt={customer.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <span className="hidden sm:inline-block text-xs font-bold text-zinc-900 dark:text-white max-w-[80px] truncate">
          {firstName}
        </span>
        <FaChevronDown className="text-[10px] text-gray-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[110] animate-in fade-in slide-in-from-top-2 duration-150 text-zinc-900 dark:text-white">
          {/* Customer Header */}
          <div
            onClick={() => {
              setDropdownOpen(false);
              openProfileDrawer("orders");
            }}
            className="px-3 py-2.5 border-b border-zinc-100 dark:border-white/5 mb-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
              {customer.full_name}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-gray-400 truncate">
              {customer.phone || customer.email}
            </p>
          </div>

          {/* Menu Items */}
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              openProfileDrawer("orders");
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-left border-none bg-transparent"
          >
            <FaReceipt className="text-amber-500 text-sm" />
            <span>My Orders & Reorder</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              openProfileDrawer("addresses");
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-left border-none bg-transparent"
          >
            <FaMapMarkerAlt className="text-amber-500 text-sm" />
            <span>Saved Addresses</span>
          </button>

          <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer text-left border-none bg-transparent"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
