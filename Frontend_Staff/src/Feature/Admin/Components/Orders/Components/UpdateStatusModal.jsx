import React, { useState, useEffect } from "react";
import {
  FaFire,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaSyncAlt,
  FaCheck,
  FaMotorcycle,
  FaBan,
} from "react-icons/fa";

const ALL_STATUSES = [
  {
    key: "pending",
    label: "Pending",
    desc: "Order received, awaiting kitchen confirmation.",
    icon: FaClock,
    color: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
  },
  {
    key: "cooking",
    label: "Preparing / Cooking",
    desc: "Kitchen is preparing and cooking this order.",
    icon: FaFire,
    color: "text-orange-400",
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
  },
  {
    key: "ready",
    label: "Ready for Dispatch / Serving",
    desc: "Order is cooked, packed and ready.",
    icon: FaCheck,
    color: "text-blue-400",
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
  },
  {
    key: "dispatched",
    label: "Dispatched with Rider",
    desc: "Rider is out for delivery with this order.",
    icon: FaMotorcycle,
    color: "text-purple-400",
    border: "border-purple-500/40",
    bg: "bg-purple-500/10",
  },
  {
    key: "delivered",
    label: "Delivered / Completed",
    desc: "Order has been fulfilled and delivered to customer.",
    icon: FaCheckCircle,
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
  },
  {
    key: "cancelled",
    label: "Cancelled / Declined",
    desc: "Order has been cancelled or rejected.",
    icon: FaBan,
    color: "text-red-400",
    border: "border-red-500/40",
    bg: "bg-red-500/10",
  },
];

const UpdateStatusModal = ({ order, onClose, onSave }) => {
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (order) {
      const s = (order.status || "").toLowerCase();
      if (s === "preparing") setNewStatus("cooking");
      else if (s === "completed") setNewStatus("delivered");
      else if (s === "declined") setNewStatus("cancelled");
      else setNewStatus(s);
    }
  }, [order]);

  if (!order) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh] text-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 text-center border-b border-zinc-200 dark:border-zinc-800 relative bg-zinc-50/50 dark:bg-zinc-800/30">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-all absolute top-3 right-3 active:scale-90"
            onClick={onClose}
          >
            <FaTimes className="text-xs" />
          </button>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-lg mx-auto mb-2 border border-amber-500/20 shadow-sm">
            <FaSyncAlt />
          </div>
          <h3 className="m-0 text-base sm:text-lg font-black text-zinc-900 dark:text-white uppercase font-['Oswald',sans-serif]">
            Update Order Status
          </h3>
          <p className="m-0 mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
            Order <strong className="text-amber-600 dark:text-amber-400">{order.id}</strong> •{" "}
            {order.customerName}
          </p>
        </div>

        {/* Status Selection Cards */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1">
          {ALL_STATUSES.map((item) => {
            const isSelected = newStatus === item.key;
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                onClick={() => setNewStatus(item.key)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? `${item.border} ${item.bg} scale-[1.01] shadow-md`
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`text-base ${item.color} shrink-0`}>
                  <Icon />
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-black uppercase tracking-wide ${
                      isSelected ? item.color : "text-zinc-900 dark:text-white"
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                    {item.desc}
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? item.border : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-200 dark:border-zinc-800 flex gap-2.5">
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 border-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
            onClick={() => onSave(order.id, newStatus)}
          >
            <FaCheckCircle className="text-xs" />
            <span>Apply Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
