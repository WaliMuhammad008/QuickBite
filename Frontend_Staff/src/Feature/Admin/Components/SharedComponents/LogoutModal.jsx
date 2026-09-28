import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-[99999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center relative animate-slide-up text-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Icon */}
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-red-500/20 shadow-lg shadow-red-500/10">
          <FaSignOutAlt className="ml-1" />
        </div>

        {/* Text */}
        <h3 className="text-lg sm:text-xl font-black uppercase font-['Oswald',sans-serif] tracking-wide text-zinc-900 dark:text-white mb-2">
          Ready to Leave?
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
          Are you sure you want to log out of the admin panel? You will need to
          enter your credentials again to access the dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/25 active:scale-95 border-none cursor-pointer transition-all"
            onClick={onConfirm}
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;

