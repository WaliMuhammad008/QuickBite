import React, { useState, useEffect, useCallback } from "react";
import {
  FaBoxOpen,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaCreditCard,
  FaPhoneAlt,
  FaChevronDown,
  FaChevronUp,
  FaCheckSquare,
  FaRegSquare,
  FaExclamationTriangle,
} from "react-icons/fa";

// ──── SLA Timer Hook ────
function useSlaTimer(orders) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [orders?.length]);

  const getElapsed = useCallback(
    (createdAt) => {
      if (!createdAt) return { seconds: 0, display: "—", tier: "green" };
      const diffMs = now - new Date(createdAt).getTime();
      const totalSec = Math.max(0, Math.floor(diffMs / 1000));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      const display = `${m}m ${s.toString().padStart(2, "0")}s`;
      const tier = m >= 10 ? "red" : m >= 5 ? "amber" : "green";
      return { seconds: totalSec, display, tier };
    },
    [now]
  );

  return getElapsed;
}

// ──── SLA Badge Component ────
function SlaBadge({ elapsed }) {
  const tierStyles = {
    green:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
    amber:
      "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold",
    red: "bg-rose-500 text-white font-black animate-pulse shadow-md border border-rose-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] ${tierStyles[elapsed.tier]}`}
    >
      <FaClock className="text-[9px]" />
      <span>Waiting: {elapsed.display}</span>
    </span>
  );
}

// ──── Bag Checklist Component ────
function BagChecklist({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [checked, setChecked] = useState({});

  if (!items || items.length === 0) return null;

  const toggleItem = (idx) => {
    setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const allChecked = items.length > 0 && items.every((_, i) => checked[i]);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border-none cursor-pointer ${
          allChecked
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "bg-stone-100 dark:bg-neutral-800/60 text-stone-600 dark:text-neutral-400"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <FaBoxOpen className="text-[10px]" />
          <span>
            Bag Checklist ({Object.values(checked).filter(Boolean).length}/
            {items.length})
          </span>
        </span>
        {isOpen ? (
          <FaChevronUp className="text-[9px]" />
        ) : (
          <FaChevronDown className="text-[9px]" />
        )}
      </button>

      {isOpen && (
        <div className="mt-1.5 space-y-1 pl-1 max-h-36 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => toggleItem(idx)}
              className={`flex items-start gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-[11px] ${
                checked[idx]
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10 line-through opacity-70"
                  : "bg-stone-50 dark:bg-neutral-900/50 hover:bg-stone-100 dark:hover:bg-neutral-800"
              }`}
            >
              {checked[idx] ? (
                <FaCheckSquare className="text-emerald-500 shrink-0 mt-0.5 text-xs" />
              ) : (
                <FaRegSquare className="text-stone-400 dark:text-neutral-600 shrink-0 mt-0.5 text-xs" />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-bold text-stone-800 dark:text-neutral-200 truncate block">
                  {item.name || item.title || "Item"}
                  {item.qty && item.qty > 1 ? ` × ${item.qty}` : ""}
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  {item.size && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-neutral-700 text-stone-600 dark:text-neutral-300 font-mono">
                      {item.size}
                    </span>
                  )}
                  {item.note && (
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 italic truncate max-w-[120px]">
                      "{item.note}"
                    </span>
                  )}
                  {item.spice_level && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-mono">
                      🌶 {item.spice_level}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──── Main Component ────
export default function ReadyOrdersList({ orders = [], selectedId, onSelect }) {
  const getElapsed = useSlaTimer(orders);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-3.5 sm:p-4 h-full flex flex-col shadow-xs transition-colors overflow-hidden">
      {/* Header Accent Styling */}
      <div className="text-amber-600 dark:text-amber-400 border-b-2 border-amber-500/30 pb-2 mb-3 flex items-center justify-between shrink-0 font-['Oswald',sans-serif]">
        <h3 className="m-0 text-sm sm:text-base font-black uppercase flex items-center gap-2 tracking-wide">
          <FaBoxOpen className="text-amber-500 text-xs" />
          <span>Ready Orders</span>
        </h3>
        <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
          {orders.length}
        </span>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 overscroll-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800">
        {orders.length > 0 ? (
          orders.map((order, index) => {
            const isSelected = selectedId === order.id;
            const elapsed = getElapsed(order.createdAt);

            return (
              <div
                key={order.id}
                onClick={() => onSelect(order)}
                className={`bg-stone-50 dark:bg-neutral-950/80 border rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected
                    ? "border-amber-500 ring-2 ring-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm"
                    : elapsed.tier === "red"
                    ? "border-rose-400 dark:border-rose-500/60 shadow-rose-500/10 shadow-sm"
                    : "border-stone-200 dark:border-neutral-800 hover:border-amber-500/40 shadow-xs"
                }`}
              >
                {/* Row 1: FCFS Rank + Order ID + SLA Timer */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25 font-mono">
                      #{index + 1}
                    </span>
                    <span className="font-mono font-black text-sm text-stone-900 dark:text-white">
                      #{order.id}
                    </span>
                  </div>
                  <SlaBadge elapsed={elapsed} />
                </div>

                {/* Row 2: Customer Name */}
                <h4 className="m-0 text-sm font-bold text-stone-900 dark:text-neutral-100 truncate">
                  {order.customer}
                </h4>

                {/* Row 3: Phone */}
                {order.phone && order.phone !== "N/A" && (
                  <a
                    href={`tel:${order.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 text-xs text-sky-600 dark:text-sky-400 flex items-center gap-1.5 no-underline hover:underline font-semibold"
                  >
                    <FaPhoneAlt className="text-[9px]" />
                    <span>{order.phone}</span>
                  </a>
                )}

                {/* Row 4: Address */}
                <p className="m-0 mt-1 text-xs text-stone-500 dark:text-neutral-400 flex items-center gap-1.5 truncate">
                  <FaMapMarkerAlt className="text-amber-500 shrink-0 text-[11px]" />
                  <span className="truncate">{order.address}</span>
                </p>

                {/* Row 5: Payment Badge + COD Collect Amount */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  {order.isCOD ? (
                    <>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <FaMoneyBillWave className="text-[9px]" />
                        <span>Cash on Delivery</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                        <FaExclamationTriangle className="text-[8px]" />
                        <span>
                          Collect: Rs.{" "}
                          {order.totalAmount?.toLocaleString() || order.total}
                        </span>
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <FaCreditCard className="text-[9px]" />
                      <span>Paid Online</span>
                    </span>
                  )}
                </div>

                {/* Row 6: Items & Total */}
                <div className="flex justify-between items-center border-t border-dashed border-stone-200 dark:border-neutral-800 pt-2 mt-2.5 text-xs font-bold">
                  <span className="text-stone-500 dark:text-neutral-400">
                    {order.items}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                    {order.total}
                  </span>
                </div>

                {/* Row 7: Bag Checklist */}
                <BagChecklist items={order.rawItems} />
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-stone-400 dark:text-neutral-500 font-semibold select-none">
            No ready delivery orders.
          </div>
        )}
      </div>
    </div>
  );
}