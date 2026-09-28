import React, { useEffect, useState, useRef, useMemo } from "react";
import { FaBell, FaCheck, FaTimes, FaLayerGroup, FaMapMarkerAlt } from "react-icons/fa";

export default function IncomingOrderModal({ order, onAccept, onDecline }) {
  const orders = useMemo(() => {
    if (!order) return [];
    return Array.isArray(order) ? order : [order];
  }, [order]);

  const isBatch = orders.length > 1;
  const firstOrder = orders[0];
  const [timeLeft, setTimeLeft] = useState(30);
  const onDeclineRef = useRef(onDecline);
  onDeclineRef.current = onDecline;

  const ordersKey = useMemo(() => {
    return orders.map((o) => o.id).join("-");
  }, [orders]);

  useEffect(() => {
    if (orders.length === 0) return;
    setTimeLeft(30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onDeclineRef.current) {
            onDeclineRef.current(isBatch ? orders.map((o) => o.id) : firstOrder?.id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ordersKey, isBatch, firstOrder?.id, orders]);

  if (orders.length === 0) return null;

  const totalAmount = orders.reduce((sum, o) => {
    const num = parseFloat(String(o.total || "0").replace(/[^0-9.]/g, "") || "0");
    return sum + num;
  }, 0);

  const handleAccept = () => {
    if (onAccept) {
      onAccept(isBatch ? orders : firstOrder);
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline(isBatch ? orders.map((o) => o.id) : firstOrder?.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl w-full max-w-sm text-center text-stone-900 dark:text-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Animated Icon */}
        <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-amber-500/30 animate-bounce shadow-xs">
          {isBatch ? <FaLayerGroup /> : <FaBell />}
        </div>

        <h2 className="text-xl font-bold font-['Oswald',sans-serif] m-0 mb-1 uppercase tracking-wide">
          {isBatch ? `New Batched Assignment (${orders.length} Stops)` : "New Dispatch Offer!"}
        </h2>

        <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold mb-3 uppercase bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-stone-700 dark:text-neutral-300">
          {isBatch ? `MULTI-STOP BATCH • ${orders.length} DELIVERIES` : firstOrder?.paymentType || "COD"}
        </div>

        {/* Total Batch Amount Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-600 dark:text-neutral-300 uppercase tracking-wider">
            {isBatch ? "Total Batch Value" : "Total to Collect"}
          </span>
          <span className="text-lg font-black font-['Oswald',sans-serif] text-emerald-600 dark:text-emerald-400">
            {isBatch ? `Rs ${totalAmount.toLocaleString()}` : firstOrder?.total || "Rs 0"}
          </span>
        </div>

        {/* Order Details: Batched List or Single Card */}
        {isBatch ? (
          <div className="max-h-48 overflow-y-auto space-y-2 mb-4 pr-1 text-left text-xs overscroll-contain">
            {orders.map((ord, idx) => (
              <div
                key={ord.id || idx}
                className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-2.5 rounded-xl space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-black text-[11px] font-['Oswald',sans-serif] text-stone-900 dark:text-white">
                    Stop #{idx + 1}: Order #{ord.id}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    {ord.total}
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 dark:text-neutral-400 truncate">
                  <strong className="text-stone-800 dark:text-neutral-200">{ord.customer}</strong> ({ord.items || "1 item"})
                </div>
                <div className="text-[10px] text-stone-500 dark:text-neutral-400 flex items-center gap-1 truncate">
                  <FaMapMarkerAlt className="text-red-500 shrink-0 text-[10px]" />
                  <span className="truncate">{ord.address || "Customer Location"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3.5 rounded-xl text-left text-xs space-y-1.5 mb-4">
            <p className="m-0 text-stone-600 dark:text-neutral-400">
              <strong className="text-stone-900 dark:text-white">Order:</strong> #{firstOrder?.id} ({firstOrder?.items || "1 item"})
            </p>
            <p className="m-0 text-stone-600 dark:text-neutral-400">
              <strong className="text-stone-900 dark:text-white">Customer:</strong> {firstOrder?.customer || "Customer"}
            </p>
            <p className="m-0 text-stone-600 dark:text-neutral-400 truncate">
              <strong className="text-stone-900 dark:text-white">Dropoff:</strong> {firstOrder?.address || "Customer Location"}
            </p>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="text-amber-500 text-3xl font-black mb-5 font-mono">
          00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 min-h-[44px] bg-stone-100 hover:bg-stone-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 border border-stone-300 dark:border-neutral-700 p-3 rounded-xl font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <FaTimes />
            <span>Decline</span>
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 min-h-[44px] bg-emerald-500 hover:bg-emerald-600 text-white border-none p-3 rounded-xl font-black text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ring-2 ring-emerald-500/40"
          >
            <FaCheck />
            <span>{isBatch ? `Accept Batch (${orders.length})` : "Accept Order"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}