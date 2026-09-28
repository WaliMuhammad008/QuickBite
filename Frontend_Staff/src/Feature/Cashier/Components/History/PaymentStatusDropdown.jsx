import React, { useState, useRef, useEffect } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaChevronDown,
  FaSpinner,
  FaMoneyBillWave,
} from "react-icons/fa";

export default function PaymentStatusDropdown({
  order,
  onUpdateStatus,
  isUpdating = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const rawStatus = (order.payment_status || "Pending").toLowerCase();
  const normalizedStatus =
    rawStatus === "paid" || rawStatus === "completed"
      ? "Paid"
      : rawStatus === "refunded" || rawStatus === "failed"
      ? "Refunded"
      : "Pending";

  const isPaid = normalizedStatus === "Paid";
  const isPending = normalizedStatus === "Pending";
  const isRefunded = normalizedStatus === "Refunded";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = async (newStatus) => {
    setIsOpen(false);
    if (newStatus !== normalizedStatus && onUpdateStatus) {
      await onUpdateStatus(order.id, newStatus, order);
    }
  };

  const handleQuickPaid = async (e) => {
    e.stopPropagation();
    if (onUpdateStatus && !isUpdating) {
      await onUpdateStatus(order.id, "Paid", order);
    }
  };

  const statusConfig = {
    Paid: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/30",
      icon: FaCheckCircle,
      label: "Paid",
    },
    Pending: {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30",
      icon: FaClock,
      label: "Pending",
    },
    Refunded: {
      bg: "bg-rose-500/10 dark:bg-rose-500/15",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/30",
      icon: FaTimesCircle,
      label: "Refunded",
    },
  };

  const current = statusConfig[normalizedStatus] || statusConfig.Pending;
  const CurrentIcon = current.icon;

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={dropdownRef}>
      {/* Status Badge & Dropdown Trigger */}
      <button
        type="button"
        onClick={() => !isUpdating && setIsOpen((prev) => !prev)}
        disabled={isUpdating}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all duration-200 cursor-pointer shadow-xs ${
          current.bg
        } ${current.text} ${current.border} hover:shadow-sm active:scale-98 ${
          isUpdating ? "opacity-70 cursor-wait" : ""
        }`}
        title="Click to change payment status"
      >
        {isUpdating ? (
          <FaSpinner className="w-3 h-3 animate-spin" />
        ) : (
          <CurrentIcon className="w-3 h-3 shrink-0" />
        )}
        <span className="tracking-wide uppercase">{current.label}</span>
        <FaChevronDown
          className={`w-2 h-2 opacity-60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Quick 1-Click "Mark Paid" Button for Pending Orders */}
      {isPending && !isUpdating && (
        <button
          type="button"
          onClick={handleQuickPaid}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-neutral-950 shadow-xs hover:shadow-emerald-500/20 transition-all border-none cursor-pointer active:scale-95"
          title={`Mark Order #${order.id} as Paid`}
        >
          <FaMoneyBillWave className="w-2.5 h-2.5" />
          <span>Pay</span>
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
            Set Payment Status
          </div>

          {/* Option: Paid */}
          <button
            type="button"
            onClick={() => handleSelect("Paid")}
            className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border-none bg-transparent ${
              isPaid
                ? "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15"
                : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Paid (Completed)</span>
            </div>
            {isPaid && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          {/* Option: Pending */}
          <button
            type="button"
            onClick={() => handleSelect("Pending")}
            className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border-none bg-transparent ${
              isPending
                ? "text-amber-500 bg-amber-500/10 dark:bg-amber-500/15"
                : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaClock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending</span>
            </div>
            {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
          </button>

          {/* Option: Refunded */}
          <button
            type="button"
            onClick={() => handleSelect("Refunded")}
            className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border-none bg-transparent ${
              isRefunded
                ? "text-rose-500 bg-rose-500/10 dark:bg-rose-500/15"
                : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaTimesCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Refunded / Failed</span>
            </div>
            {isRefunded && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
          </button>
        </div>
      )}
    </div>
  );
}
