import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaCheckCircle,
  FaUtensils,
  FaMotorcycle,
  FaShoppingBag,
  FaBoxOpen,
  FaShieldAlt,
  FaLock,
  FaPhoneAlt,
  FaArrowRight,
  FaConciergeBell,
  FaStore,
} from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";
import OrderTrackerHeader from "./Components/OrderTrackerHeader";
import OrderTrackerTimeline from "./Components/OrderTrackerTimeline";
import OrderTrackerReceiptSummary from "./Components/OrderTrackerReceiptSummary";
import OrderTrackerRiderCard from "./Components/OrderTrackerRiderCard";
import { API_BASE } from "../../config/api";
import { getSocketUrl, getSocketOptions } from "../../utils/urlHelper";
import { io } from "socket.io-client";

const OrderTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { customer } = useAuth();

  const stateOrderId = location.state?.orderId || location.state?.id || "";
  const statePhone = location.state?.phone || location.state?.mobile || "";

  const queryOrderId = searchParams.get("orderId") || searchParams.get("id") || "";
  const queryPhone = searchParams.get("phone") || searchParams.get("mobile") || "";
  const storedActiveId = localStorage.getItem("activeOrderId") || "";
  const storedActivePhone = localStorage.getItem("activeOrderPhone") || "";
  const userPhone = customer?.phone || customer?.mobile || "";

  const initialOrderId = stateOrderId || queryOrderId || storedActiveId;
  const initialPhone = statePhone || queryPhone || storedActivePhone || userPhone;

  const [searchId, setSearchId] = useState(initialOrderId);
  const [searchPhone, setSearchPhone] = useState(initialPhone);
  const [inputSearchId, setInputSearchId] = useState(initialOrderId);
  const [inputSearchPhone, setInputSearchPhone] = useState(initialPhone);

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Fetch store contact details for helpline
  const { data: storeSettings = {} } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/get_settings.php`);
        const result = await response.json();
        return result && result.success ? result.data : {};
      } catch (err) {
        console.warn("Could not fetch store settings in OrderTracker, using defaults:", err);
        return {};
      }
    },
    staleTime: 60000,
  });

  const restaurantPhone =
    storeSettings.contact_phone || storeSettings.restaurant_phone || "+92 300 1234567";

  // Fetch live order status from backend with 2-factor ownership verification
  const fetchOrderDetails = async (id, isManual = false, phoneToVerify = null) => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    if (isManual) setIsRefreshing(true);

    const activePhone = phoneToVerify !== null ? phoneToVerify : searchPhone;

    try {
      const response = await fetch(`${API_BASE}/get_order_details.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          phone: activePhone ? activePhone.trim() : "",
          customer_id: customer?.id || 0,
        }),
      });
      const data = await response.json();

      if (response.ok && data.success && data.order) {
        setOrder(data.order);
        setAuthError(null);
      } else if (response.status === 403 || data.is_unauthorized) {
        // Ownership verification required
        setOrder(null);
        setAuthError(
          data.message ||
          `Verification required: Please enter the phone number associated with Order #${id}.`
        );
      } else {
        // Order not found or error
        setOrder(null);
        setAuthError(null);
      }
    } catch (err) {
      console.error("Order tracking error:", err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If URL has query parameters, extract and clean the address bar URL immediately
  useEffect(() => {
    if (queryOrderId || queryPhone) {
      if (queryOrderId) {
        setSearchId(queryOrderId);
        setInputSearchId(queryOrderId);
        localStorage.setItem("activeOrderId", queryOrderId);
      }
      if (queryPhone) {
        setSearchPhone(queryPhone);
        setInputSearchPhone(queryPhone);
        localStorage.setItem("activeOrderPhone", queryPhone);
      }
      // Remove query parameters from address bar to protect sensitive data
      navigate("/track-order", {
        replace: true,
        state: { orderId: queryOrderId || initialOrderId, phone: queryPhone || initialPhone },
      });
    }
  }, [queryOrderId, queryPhone, navigate]);

  // Autofill logged-in user phone if phone field is currently blank
  useEffect(() => {
    if (userPhone && !searchPhone && !inputSearchPhone) {
      setSearchPhone(userPhone);
      setInputSearchPhone(userPhone);
    }
  }, [userPhone]);

  // Initial load and live real-time status updates via Socket.IO
  useEffect(() => {
    if (searchId) {
      fetchOrderDetails(searchId, false, searchPhone);

      // Connect to Socket.io for instantaneous real-time status updates
      let cancelled = false;
      let activeSocket = null;
      try {
        const opts = { ...getSocketOptions(), autoConnect: true };
        activeSocket = io(getSocketUrl(), opts);

        const handleRealtimeUpdate = (data) => {
          if (cancelled) return;
          if (!data || !data.order_id || String(data.order_id) === String(searchId)) {
            fetchOrderDetails(searchId, false, searchPhone);
          }
        };

        activeSocket.on("order_status_updated", handleRealtimeUpdate);
        activeSocket.on("refresh_kitchen", handleRealtimeUpdate);
        activeSocket.on("order_delivered", handleRealtimeUpdate);
      } catch (err) {
        console.warn("Socket tracker notice:", err);
      }

      // Relaxed auto-poll safety net
      const interval = setInterval(() => {
        if (!authError) {
          fetchOrderDetails(searchId, false, searchPhone);
        }
      }, 10000);

      return () => {
        cancelled = true;
        if (activeSocket) {
          activeSocket.off("order_status_updated");
          activeSocket.off("refresh_kitchen");
          activeSocket.off("order_delivered");

          // StrictMode safe disconnect:
          // If already connected, disconnect immediately.
          // If still in handshake, wait until connection establishes or errors
          // before disconnecting to avoid 'WebSocket is closed before connection is established'
          if (activeSocket.connected) {
            activeSocket.disconnect();
          } else {
            activeSocket.once("connect", () => {
              activeSocket.disconnect();
            });
            activeSocket.once("connect_error", () => {
              activeSocket.disconnect();
            });
          }
        }
        clearInterval(interval);
      };
    } else {
      setIsLoading(false);
    }
  }, [searchId, searchPhone, customer?.id]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmedId = inputSearchId.trim();
    const trimmedPhone = inputSearchPhone.trim();

    if (trimmedId) {
      setSearchId(trimmedId);
      setSearchPhone(trimmedPhone);
      setAuthError(null);
      setIsLoading(true);

      if (trimmedPhone) {
        localStorage.setItem("activeOrderPhone", trimmedPhone);
      }
      localStorage.setItem("activeOrderId", trimmedId);

      // Keep address bar clean without leaking order ID or phone
      navigate("/track-order", {
        replace: true,
        state: { orderId: trimmedId, phone: trimmedPhone },
      });

      fetchOrderDetails(trimmedId, true, trimmedPhone);
    }
  };

  // Fulfillment Mode Detection
  const rawMode = (
    order?.order_mode ||
    order?.order_type ||
    order?.type ||
    "delivery"
  ).toLowerCase();

  const isDineIn = rawMode.includes("dine");
  const isTakeaway = rawMode.includes("takeaway") || rawMode.includes("pickup");
  const isDelivery = !isDineIn && !isTakeaway;

  // 1. Dine-In Steps (3 Steps: Confirmed -> Preparing in Kitchen -> Ready & Served)
  const getDineInStepIndex = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("decline") || s.includes("cancel")) return -1;
    if (s.includes("ready") || s.includes("served") || s.includes("completed") || s.includes("delivered")) return 3;
    if (s.includes("prepar") || s.includes("cook") || s.includes("kitchen")) return 2;
    return 1;
  };

  const dineInSteps = [
    { num: 1, title: "Order Confirmed", icon: <FaCheckCircle />, desc: "Received by kitchen" },
    { num: 2, title: "Preparing in Kitchen", icon: <FaUtensils />, desc: "Freshly cooked to order" },
    {
      num: 3,
      title: "Order Ready & Served",
      icon: <FaConciergeBell />,
      desc: order?.table_number ? `Served hot at Table #${order.table_number}` : "Served directly to your table",
    },
  ];

  // 2. Takeaway Steps (4 Steps: Confirmed -> Preparing in Kitchen -> Ready for Pickup -> Picked Up)
  const getTakeawayStepIndex = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("decline") || s.includes("cancel")) return -1;
    if (s.includes("delivered") || s.includes("completed") || s.includes("picked") || s.includes("collected")) return 4;
    if (s.includes("ready") || s.includes("pickup") || s.includes("counter")) return 3;
    if (s.includes("prepar") || s.includes("cook") || s.includes("kitchen")) return 2;
    return 1;
  };

  const takeawaySteps = [
    { num: 1, title: "Order Confirmed", icon: <FaCheckCircle />, desc: "Received by kitchen" },
    { num: 2, title: "Preparing in Kitchen", icon: <FaUtensils />, desc: "Freshly cooked to order" },
    { num: 3, title: "Ready for Pickup", icon: <FaStore />, desc: "Waiting at store counter" },
    { num: 4, title: "Picked Up", icon: <FaShoppingBag />, desc: "Order collected from store counter" },
  ];

  // 3. Delivery Steps (4 Steps: Confirmed -> Preparing in Kitchen -> Out for Delivery -> Delivered)
  const getDeliveryStepIndex = (status = "") => {
    const s = (status || "").toLowerCase().trim();
    if (s.includes("decline") || s.includes("cancel")) return -1;
    if (s.includes("delivered") || s.includes("completed")) return 4;
    if (
      s.includes("out") ||
      s.includes("delivery") ||
      s.includes("transit") ||
      s.includes("en route") ||
      s.includes("enroute") ||
      s.includes("dispatch") ||
      s.includes("way") ||
      s.includes("rider") ||
      s.includes("assign") ||
      s.includes("ready")
    ) return 3;
    if (s.includes("prepar") || s.includes("cook") || s.includes("kitchen")) return 2;
    return 1;
  };

  const deliverySteps = [
    { num: 1, title: "Order Confirmed", icon: <FaCheckCircle />, desc: "Received by kitchen" },
    { num: 2, title: "Preparing in Kitchen", icon: <FaUtensils />, desc: "Freshly cooked to order" },
    { num: 3, title: "Out for Delivery", icon: <FaMotorcycle />, desc: "Rider en route to you" },
    { num: 4, title: "Delivered & Enjoy!", icon: <FaShoppingBag />, desc: "Order completed" },
  ];

  const steps = isDineIn ? dineInSteps : isTakeaway ? takeawaySteps : deliverySteps;
  const currentStep = order
    ? (isDineIn
      ? getDineInStepIndex(order.status)
      : isTakeaway
        ? getTakeawayStepIndex(order.status)
        : getDeliveryStepIndex(order.status))
    : 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white transition-colors duration-300 pb-20">
      {/* 1. Page Header & Quick Search */}
      <OrderTrackerHeader
        inputSearchId={inputSearchId}
        setInputSearchId={setInputSearchId}
        inputSearchPhone={inputSearchPhone}
        setInputSearchPhone={setInputSearchPhone}
        handleSearchSubmit={handleSearchSubmit}
      />

      {/* 2. Main Tracker Canvas */}
      <main className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-['Oswald',sans-serif] font-bold text-sm uppercase tracking-wider text-neutral-500">
              Connecting to Kitchen Dispatch...
            </span>
          </div>
        ) : authError ? (
          /* 2-Factor Ownership Verification Required State */
          <div className="bg-white dark:bg-neutral-900/90 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center max-w-lg mx-auto shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-inner">
              <FaLock className="text-2xl" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <FaShieldAlt className="text-xs" />
              <span>Ownership Verification</span>
            </div>
            <h3 className="font-['Oswald',sans-serif] font-black text-xl sm:text-2xl uppercase text-neutral-900 dark:text-white mb-2">
              Verify Your Phone Number
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              {authError}
            </p>

            {/* Inline verification input */}
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="tel"
                  value={inputSearchPhone}
                  onChange={(e) => setInputSearchPhone(e.target.value)}
                  placeholder="Enter order phone (e.g. 03001234567)"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-amber-400/50 dark:border-amber-500/40 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono font-bold"
                />
                <FaPhoneAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 text-xs pointer-events-none" />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Verify & View Live Order</span>
                <FaArrowRight className="text-xs" />
              </button>
            </form>
          </div>
        ) : !order ? (
          /* Empty / Not Found State */
          <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <FaBoxOpen className="text-2xl" />
            </div>
            <h3 className="font-['Oswald',sans-serif] font-black text-xl uppercase text-neutral-900 dark:text-white mb-1">
              No Active Order Found
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
              {searchId
                ? `We couldn't find an order with ID #${searchId}. Please verify your order number and try again.`
                : "Enter your Order ID and mobile number above or browse our menu to place your first hot order."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/menu")}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 border-none cursor-pointer"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          /* Active Live Order Display */
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Timeline Pipeline Card */}
            <OrderTrackerTimeline
              order={order}
              searchId={searchId}
              currentStep={currentStep}
              steps={steps}
              isRefreshing={isRefreshing}
              fetchOrderDetails={() => fetchOrderDetails(searchId, true, searchPhone)}
            />

            {/* Order Details & Receipt Summary */}
            {isDineIn ? (
              /* Dine-In Mode: Delivery section completely hidden, centered Receipt */
              <div className="max-w-3xl mx-auto w-full">
                <OrderTrackerReceiptSummary order={order} isDineIn={true} />
              </div>
            ) : (
              /* Delivery & Takeaway Modes: Side-by-side Receipt and Destination/Pickup Card */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
                <OrderTrackerReceiptSummary order={order} isDineIn={false} />
                <OrderTrackerRiderCard
                  order={order}
                  restaurantPhone={restaurantPhone}
                  storeSettings={storeSettings}
                  isTakeaway={isTakeaway}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTracker;