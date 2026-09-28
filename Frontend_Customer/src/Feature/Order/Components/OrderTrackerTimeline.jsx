import React, { useState, useEffect } from "react";
import { FaSync, FaTimesCircle, FaClock, FaExclamationTriangle, FaBan } from "react-icons/fa";
import Swal from "sweetalert2";
import { API_BASE } from "../../../config/api";

export default function OrderTrackerTimeline({
  order,
  searchId,
  currentStep,
  steps,
  isRefreshing,
  fetchOrderDetails,
}) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  const status = (order?.status || "pending").toLowerCase();
  const isPending = status === "pending";
  const isCancelled = status === "cancelled" || status === "cancelled_with_wastage" || status === "declined";

  // Fulfillment mode detection (Dine-In, Takeaway, Delivery)
  const rawMode = (
    order?.order_mode ||
    order?.order_type ||
    order?.type ||
    ""
  ).toLowerCase().trim();
  const isDineIn = rawMode.includes("dine") || Boolean(order?.table_number);

  // Payment method and status evaluation
  const rawMethod = (order?.payment_method || "").toLowerCase().trim();
  const rawPaymentStatus = (order?.payment_status || "").toLowerCase().trim();

  // Explicit digital online gateways
  const isOnlineMethod =
    rawMethod.includes("card") ||
    rawMethod.includes("jazz") ||
    rawMethod.includes("easy") ||
    rawMethod.includes("wallet") ||
    rawMethod.includes("online") ||
    rawMethod.includes("stripe");

  // Strict check on payment status so 'unpaid' NEVER matches 'paid'!
  const isStrictlyPaidOnline =
    (rawPaymentStatus === "paid" ||
      rawPaymentStatus === "completed" ||
      rawPaymentStatus.startsWith("paid online")) &&
    !rawMethod.includes("cash") &&
    !rawMethod.includes("cod");

  const isOnlinePayment = isOnlineMethod || isStrictlyPaidOnline;

  // Cash payment: Cash on Delivery or Cash on Pickup / Cash
  const isCashPayment =
    !isOnlinePayment &&
    (rawMethod.includes("cash") ||
      rawMethod.includes("cod") ||
      rawMethod.includes("cop") ||
      rawMethod === "");

  // Cancel order bar ONLY shows for cash payment on Delivery or Takeaway
  // Strictly hidden for:
  // 1. Online Payment (JazzCash, EasyPaisa, Card, Stripe, etc.)
  // 2. Dine-In (Table service orders)
  // 3. Already cancelled or declined orders
  const canShowCancelBar = !isCancelled && !isDineIn && isCashPayment;

  // Calculate 120s cancellation countdown from order.created_at
  useEffect(() => {
    if (!order?.created_at || !isPending) {
      setTimeLeft(0);
      return;
    }

    const calcTimeLeft = () => {
      const createdTime = new Date(order.created_at).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - createdTime) / 1000);
      const remaining = Math.max(0, 120 - elapsed);
      setTimeLeft(remaining);
    };

    calcTimeLeft();
    const timer = setInterval(calcTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [order?.created_at, isPending]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCancelOrder = async () => {
    if (!isPending || timeLeft <= 0 || !canShowCancelBar) return;

    const result = await Swal.fire({
      title: "Cancel Your Order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel Order",
      cancelButtonText: "Keep Order",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      setIsCancelling(true);
      try {
        const response = await fetch(
          `${API_BASE}/cancel_order.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: order.id,
              reason: "Customer cancelled within 2-minute window",
            }),
          }
        );
        const data = await response.json();

        if (data.success) {
          Swal.fire(
            "Cancelled",
            "Your order has been cancelled.",
            "success"
          );
          fetchOrderDetails(searchId, true);
        } else {
          Swal.fire("Could Not Cancel", data.message, "error");
          fetchOrderDetails(searchId, true);
        }
      } catch (err) {
        Swal.fire("Error", "Server connection failed.", "error");
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Tracking Reference
          </span>
          <h2 className="font-['Oswald',sans-serif] font-black text-xl sm:text-2xl uppercase text-neutral-900 dark:text-white m-0 mt-0.5">
            Order #{order.id}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {order.table_number && (
            <div className="px-3 py-1 rounded-full font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400">
              Table #{order.table_number}
            </div>
          )}

          <div
            className={`px-3 py-1 rounded-full font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider border ${
              isCancelled
                ? "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400"
                : "bg-amber-400/15 border-amber-400/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            Status: {order.status || "Pending"}
          </div>

          <button
            type="button"
            onClick={() => fetchOrderDetails(searchId, true)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-amber-500 transition-all border-none cursor-pointer"
            title="Refresh Status"
            aria-label="Refresh Status"
          >
            <FaSync
              className={`text-xs ${
                isRefreshing ? "animate-spin text-amber-500" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Cancel Window & Status Alert Banner: ONLY shown for cash payment orders */}
      {canShowCancelBar && (
        <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200 dark:border-neutral-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {isPending && timeLeft > 0 ? (
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <FaClock className="text-sm animate-pulse" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <FaExclamationTriangle className="text-sm" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                {isPending && timeLeft > 0 ? (
                  <>
                    <span>2-Min Cancellation Window:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-black">
                      {formatTimer(timeLeft)}
                    </span>
                  </>
                ) : (
                  <span>Kitchen Status Locked</span>
                )}
              </div>
              
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={!isPending || timeLeft <= 0 || isCancelling}
              onClick={handleCancelOrder}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isPending && timeLeft > 0
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-95 border-none"
                  : "bg-zinc-200 dark:bg-neutral-800 text-zinc-400 dark:text-neutral-500 cursor-not-allowed border-none opacity-60"
              }`}
            >
              <FaTimesCircle className="text-xs" />
              <span>{isCancelling ? "Cancelling..." : "Cancel Order"}</span>
            </button>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3">
          <FaBan className="text-lg shrink-0" />
          <div className="text-xs font-bold">
            This order is cancelled. No further preparation or delivery will occur.
          </div>
        </div>
      )}

      {/* Step Timeline Graphic: Vertical on Mobile (<640px), Horizontal on Desktop (sm+) */}
      <div className="pt-6 sm:pt-8 pb-3">
        {/* Mobile Vertical Stepper (< 640px) */}
        <div className="sm:hidden space-y-4 relative pl-2">
          <div className="absolute left-[26px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-neutral-800 pointer-events-none" />
          {steps.map((step) => {
            const isCompleted = currentStep >= step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                className={`flex items-start gap-3.5 relative z-10 transition-all ${
                  isCompleted ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all shrink-0 shadow-xs ${
                    isCurrent
                      ? "bg-amber-400 text-neutral-950 ring-4 ring-amber-400/25 shadow-md scale-105"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-neutral-800 text-neutral-400 border border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  {step.icon}
                </div>

                <div className="flex-1 pt-0.5">
                  <h4 className="font-['Oswald',sans-serif] font-bold text-sm uppercase text-neutral-900 dark:text-white m-0">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 m-0 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Horizontal Stepper (>= 640px) */}
        <div
          className={`hidden sm:grid gap-4 md:gap-6 relative ${
            steps.length === 3
              ? "sm:grid-cols-3 max-w-2xl mx-auto"
              : "sm:grid-cols-4"
          }`}
        >
          {steps.map((step) => {
            const isCompleted = currentStep >= step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                className={`flex flex-col items-center text-center gap-2.5 transition-all ${
                  isCompleted ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-base md:text-lg transition-all shrink-0 ${
                    isCurrent
                      ? "bg-amber-400 text-neutral-950 ring-4 ring-amber-400/25 shadow-lg scale-110"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {step.icon}
                </div>

                <div>
                  <h4 className="font-['Oswald',sans-serif] font-bold text-sm md:text-base uppercase text-neutral-900 dark:text-white m-0">
                    {step.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 m-0 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
