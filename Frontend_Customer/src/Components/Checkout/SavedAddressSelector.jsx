import React from "react";
import { FaHome, FaBriefcase, FaMapPin, FaPlus } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

export default function SavedAddressSelector({ onSelectAddress }) {
  const { isAuthenticated, savedAddresses, openAuthModal } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaMapPin className="text-amber-500 text-sm" />
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Sign in to auto-fill saved delivery addresses
          </span>
        </div>
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline uppercase tracking-wider bg-transparent border-none cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!savedAddresses || savedAddresses.length === 0) {
    return null;
  }

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "home":
        return <FaHome className="text-amber-500" />;
      case "work":
      case "office":
        return <FaBriefcase className="text-blue-500" />;
      default:
        return <FaMapPin className="text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-2 mb-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
          Select From Saved Addresses
        </span>
        <span className="text-[11px] text-amber-500 font-semibold">
          {savedAddresses.length} saved
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {savedAddresses.map((addr) => {
          const displayLabel = addr.label || addr.address_type || "Address";
          const displayDetails = [addr.house_no, addr.street, addr.area].filter(Boolean).join(", ") || addr.address_line || addr.landmark || "";
          return (
            <button
              key={addr.id}
              type="button"
              onClick={() => onSelectAddress(addr)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/60 hover:border-amber-500 dark:hover:border-amber-400 text-left transition-all cursor-pointer flex items-start gap-2.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                {getIcon(displayLabel)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white capitalize truncate">
                    {displayLabel}
                  </span>
                  {addr.is_default == 1 && (
                    <span className="text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                  {displayDetails}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
