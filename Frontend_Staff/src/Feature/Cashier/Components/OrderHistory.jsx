import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { staffSocket } from "../../../utils/socket";
import { apiFetch } from "../../../utils/apiHelper";
import {
  FaMoneyBillWave,
  FaMotorcycle,
  FaCheckDouble,
  FaChevronDown,
  FaSpinner,
  FaCheck,
  FaSyncAlt,
} from "react-icons/fa";

// Atomic Subcomponents
import HistoryFilterBar from "./History/HistoryFilterBar";
import OrderHistoryTable from "./History/OrderHistoryTable";
import RiderReconciliationModal from "./History/RiderReconciliationModal";

const PAGE_SIZE = 30;

// Helper to format raw order objects consistently
const formatOrder = (o) => {
  const rawItems =
    Array.isArray(o.items) && o.items.length > 0
      ? o.items
      : typeof o.cart === "string"
      ? JSON.parse(o.cart || "[]")
      : o.cart || [];

  const parsedItems = Array.isArray(rawItems)
    ? rawItems.map((it) => {
        let parsedAddons =
          it.selected_addons ||
          it.selectedAddons ||
          it.addons ||
          it.selected_addons_json ||
          [];
        if (typeof parsedAddons === "string") {
          try {
            parsedAddons = JSON.parse(parsedAddons);
          } catch {
            parsedAddons = [];
          }
        }
        if (!Array.isArray(parsedAddons)) parsedAddons = [];

        return {
          ...it,
          name: it.title || it.name || "Item",
          title: it.title || it.name || "Item",
          qty: parseInt(it.qty || it.quantity || 1, 10),
          price: parseFloat(it.price || 0),
          base_price: it.base_price !== undefined ? parseFloat(it.base_price) : undefined,
          selected_addons: parsedAddons,
          selectedAddons: parsedAddons,
          addons: parsedAddons,
          selected_addons_json: parsedAddons,
          spice_level: it.spice_level || "",
          note: it.note || "",
        };
      })
    : [];

  const resolvedType =
    o.order_mode ||
    o.order_type ||
    (o.table_number?.toLowerCase().includes("takeaway")
      ? "Takeaway"
      : o.table_number?.toLowerCase().includes("delivery")
      ? "Delivery"
      : "Dine-In");

  const resolvedCustomer =
    o.customer_name ||
    o.customer ||
    o.guest_name ||
    "Walk-In Customer";

  return {
    ...o,
    id: o.id,
    customer_name: resolvedCustomer,
    customerName: resolvedCustomer,
    customer_mobile: o.customer_mobile || "",
    customer_address: o.customer_address || "",
    table_no: o.table_number || "",
    table_number: o.table_number || "",
    table: o.table_number || "",
    order_type: resolvedType,
    order_mode: resolvedType,
    type: resolvedType,
    subtotal: parseFloat(o.subtotal || 0),
    tax_amount: parseFloat(o.tax_amount || 0),
    delivery_fee: parseFloat(o.delivery_fee || 0),
    rider_tip: parseFloat(o.rider_tip || 0),
    discount_amount: parseFloat(o.discount_amount || 0),
    coupon_code: o.coupon_code || "",
    total_amount: parseFloat(o.total || o.total_amount || 0),
    total: parseFloat(o.total || o.total_amount || 0),
    payment_status: o.payment_status || "Pending",
    payment_method: o.payment_method || "Cash",
    rider_id: o.rider_id || null,
    rider_name: o.rider_name || "",
    rider_phone: o.rider_phone || "",
    time: o.time || o.created_at || "Just now",
    date: o.date || "",
    created_at: o.time || o.created_at || "Just now",
    items: parsedItems,
    cart: parsedItems,
  };
};

export default function OrderHistory({
  orders: propOrders,
  onPrintReceipt,
  onViewOrder,
  onPrintClick,
  onViewClick,
  onTogglePaymentStatus,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);

  // Server-side pagination states
  const [ordersList, setOrdersList] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const printHandler = onPrintReceipt || onPrintClick;
  const viewHandler = onViewOrder || onViewClick;

  const ordersListRef = useRef(ordersList);
  useEffect(() => {
    ordersListRef.current = ordersList;
  }, [ordersList]);

  // Fetch paginated batch of orders from server
  const fetchOrdersBatch = useCallback(async (offset = 0, isAppend = false) => {
    if (isAppend) {
      setIsLoadingMore(true);
    } else {
      if (ordersListRef.current.length === 0) {
        setIsInitialLoading(true);
      }
    }

    try {
      const response = await apiFetch(
        `get_orders.php?type=cashier&limit=${PAGE_SIZE}&offset=${offset}&format=paginated`
      );
      const data = await response.json();

      if (data && data.success) {
        const formatted = (data.orders || []).map(formatOrder);
        const serverTotal = data.total || 0;
        setTotalCount(serverTotal);

        if (isAppend) {
          setOrdersList((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const newUnique = formatted.filter((o) => !existingIds.has(o.id));
            const merged = [...prev, ...newUnique];
            setHasMore(merged.length < serverTotal);
            return merged;
          });
        } else {
          setOrdersList(formatted);
          setHasMore(formatted.length < serverTotal);
        }
      } else if (Array.isArray(data)) {
        const formatted = data.map(formatOrder);
        setOrdersList(formatted);
        setTotalCount(formatted.length);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching paginated orders:", err);
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Dedicated state for server-wide unreconciled COD delivery orders
  const [pendingCodOrdersList, setPendingCodOrdersList] = useState([]);

  // Fetch all pending COD orders from server (unrestricted by pagination)
  const fetchPendingCodOrders = useCallback(async () => {
    try {
      const response = await apiFetch("get_orders.php?type=pending_cod");
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data?.orders || []);
      setPendingCodOrdersList(list.map(formatOrder));
    } catch (err) {
      console.warn("Failed to fetch pending COD orders:", err);
    }
  }, []);

  // Background refresh to keep currently loaded orders synchronized
  const refreshCurrentOrders = useCallback(async () => {
    try {
      const currentLimit = Math.max(PAGE_SIZE, ordersListRef.current.length || PAGE_SIZE);
      const response = await apiFetch(
        `get_orders.php?type=cashier&limit=${currentLimit}&offset=0&format=paginated`
      );
      const data = await response.json();

      if (data && data.success) {
        const formatted = (data.orders || []).map(formatOrder);
        const serverTotal = data.total || 0;
        setOrdersList(formatted);
        setTotalCount(serverTotal);
        setHasMore(formatted.length < serverTotal);
      }
    } catch (err) {
      console.warn("Background refresh error:", err);
    }
    // Also keep pending COD orders synchronized
    fetchPendingCodOrders();
  }, [fetchPendingCodOrders]);

  const refreshSearch = useCallback(async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    try {
      const response = await apiFetch(
        `get_orders.php?type=cashier&search=${encodeURIComponent(trimmed)}&format=paginated`
      );
      const data = await response.json();
      if (data && data.success && Array.isArray(data.orders)) {
        setSearchResults(data.orders.map(formatOrder));
      }
    } catch (err) {
      console.error("Order history refresh search error:", err);
    }
  }, [searchTerm]);

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleManualRefresh = useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      await Promise.all([
        refreshCurrentOrders(),
        fetchOrdersBatch(0, false),
      ]);
      if (searchTerm.trim()) {
        await refreshSearch();
      }
    } catch (err) {
      console.warn("Manual refresh failed:", err);
    } finally {
      setIsManualRefreshing(false);
    }
  }, [refreshCurrentOrders, fetchOrdersBatch, searchTerm, refreshSearch]);

  // Server-side debounced search across all database records
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await apiFetch(
          `get_orders.php?type=cashier&search=${encodeURIComponent(trimmed)}&format=paginated`
        );
        const data = await response.json();
        if (data && data.success && Array.isArray(data.orders)) {
          setSearchResults(data.orders.map(formatOrder));
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Order history search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial load: fetch first 30 orders and pending COD
  useEffect(() => {
    fetchOrdersBatch(0, false);
    fetchPendingCodOrders();
  }, [fetchOrdersBatch, fetchPendingCodOrders]);

  // Real-time socket listener and periodic fallback refresh
  useEffect(() => {
    const socketEvents = [
      "new_order_placed",
      "order_status_updated",
      "order_status_changed",
      "order_delivered",
      "refresh_kitchen",
      "refresh_orders",
      "refresh_rider",
      "payment_status_updated"
    ];

    const onUpdate = () => {
      refreshCurrentOrders();
      if (searchTerm.trim()) refreshSearch();
    };

    socketEvents.forEach((evt) => staffSocket.on(evt, onUpdate));
    const interval = setInterval(onUpdate, 20000);

    return () => {
      socketEvents.forEach((evt) => staffSocket.off(evt, onUpdate));
      clearInterval(interval);
    };
  }, [refreshCurrentOrders, refreshSearch, searchTerm]);

  // Load next 30 orders
  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    fetchOrdersBatch(ordersList.length, true);
  };

  const orders = propOrders && propOrders.length > 0 ? propOrders : ordersList;
  const baseOrders = searchResults !== null ? searchResults : orders;
  const safeOrders = Array.isArray(baseOrders) ? baseOrders : [];

  // Merge server-wide pending COD orders with currently loaded safeOrders
  const reconciliationOrders = useMemo(() => {
    const map = new Map();
    // 1. Add server-wide pending COD orders
    pendingCodOrdersList.forEach((o) => map.set(o.id, o));

    // 2. Also check any currently loaded safeOrders in case of real-time local updates
    safeOrders.forEach((o) => {
      const isDelivery =
        o.order_type?.toLowerCase().includes("delivery") ||
        o.type?.toLowerCase().includes("delivery") ||
        o.order_mode?.toLowerCase().includes("delivery");
      const pMethod = (o.payment_method || "").toLowerCase();
      const isCod =
        pMethod === "cod" ||
        pMethod.includes("cod") ||
        pMethod.includes("delivery") ||
        pMethod.includes("cash") ||
        pMethod === "";
      const pStatus = (o.payment_status || "").toLowerCase();
      const isUnsettled = pStatus !== "paid" && pStatus !== "completed";
      const ordStatus = (o.status || "").toLowerCase();
      const isDelivered = ordStatus === "delivered" || ordStatus === "completed" || ordStatus === "dispatched";

      if (isDelivery && isCod && isUnsettled && isDelivered) {
        map.set(o.id, o);
      }
    });

    return Array.from(map.values());
  }, [pendingCodOrdersList, safeOrders]);

  // Calculate Rider COD pending totals from reconciliationOrders
  const codStats = useMemo(() => {
    let pendingAmount = 0;
    let pendingCount = 0;
    const riderSet = new Set();

    reconciliationOrders.forEach((order) => {
      pendingCount += 1;
      pendingAmount += parseFloat(order.total || order.total_amount || 0);
      if (order.rider_id) riderSet.add(order.rider_id);
    });

    return {
      pendingAmount,
      pendingCount,
      riderCount: riderSet.size,
    };
  }, [reconciliationOrders]);

  // Handle single order payment status update
  const handleUpdatePaymentStatus = async (orderId, newStatus, order) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_payment_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: orderId, status: newStatus }),
        }
      );

      const result = await response.json();

      if (result.success) {
        refreshCurrentOrders();
        fetchPendingCodOrders();
        if (searchTerm.trim()) refreshSearch();

        // Emit socket notification via shared staffSocket
        try {
          staffSocket.emit("payment_status_updated", { id: orderId, status: newStatus });
        } catch (socketErr) {
          console.warn("Socket broadcast failed:", socketErr);
        }

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: document.documentElement.classList.contains("dark") ? "#18181b" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f4f4f5" : "#18181b",
        });

        Toast.fire({
          icon: newStatus === "Paid" ? "success" : "info",
          title: `Order #${orderId} marked as ${newStatus}`,
        });

        if (onTogglePaymentStatus) {
          onTogglePaymentStatus(orderId, newStatus);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: result.message || "Could not update payment status.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Could not reach server to update payment status.",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle batch reconciliation for a rider
  const handleBatchReconcile = async (orderIds, status, riderName, totalAmount) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/batch_reconcile_orders.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_ids: orderIds,
            status: status || "Paid",
            rider_name: riderName,
            total_cash: totalAmount,
            total_amount: totalAmount,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        refreshCurrentOrders();
        fetchPendingCodOrders();
        if (searchTerm.trim()) refreshSearch();

        // Emit socket notification via shared staffSocket
        try {
          staffSocket.emit("payment_status_updated", { order_ids: orderIds, status: status || "Paid" });
        } catch (socketErr) {
          console.warn("Socket broadcast failed:", socketErr);
        }

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: document.documentElement.classList.contains("dark") ? "#18181b" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f4f4f5" : "#18181b",
        });

        Toast.fire({
          icon: "success",
          title: `Reconciled Rs. ${totalAmount.toFixed(2)} from ${riderName}!`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Reconciliation Failed",
          text: result.message || "Failed to reconcile orders.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Could not complete rider reconciliation.",
      });
    }
  };

  // Filter logic
  const filteredOrders = safeOrders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (order.id?.toString() || "").includes(term) ||
      (order.customer_name?.toLowerCase() || "").includes(term) ||
      (order.table_no?.toString() || "").includes(term) ||
      (order.rider_name?.toLowerCase() || "").includes(term);

    const matchesType =
      filterType === "ALL" ||
      order.order_type?.toUpperCase() === filterType ||
      (filterType === "DINE-IN" &&
        (order.order_type?.toUpperCase().includes("DINE") ||
          (!order.order_type?.toUpperCase().includes("TAKEAWAY") &&
            !order.order_type?.toUpperCase().includes("DELIVERY"))));

    const pStatus = (order.payment_status || "").toLowerCase();
    const isPaid = pStatus === "paid" || pStatus === "completed";

    const isDelivery =
      order.order_type?.toLowerCase().includes("delivery") ||
      order.type?.toLowerCase().includes("delivery") ||
      order.order_mode?.toLowerCase().includes("delivery");

    const pMethod = (order.payment_method || "").toLowerCase();
    const isCod =
      pMethod === "cod" ||
      pMethod.includes("delivery") ||
      pMethod === "cash" ||
      pMethod === "";

    let matchesPayment = true;
    if (paymentFilter === "PAID") {
      matchesPayment = isPaid;
    } else if (paymentFilter === "PENDING") {
      matchesPayment = !isPaid;
    } else if (paymentFilter === "COD_PENDING") {
      matchesPayment = isDelivery && isCod && !isPaid;
    }

    return matchesSearch && matchesType && matchesPayment;
  });

  const loadedCount = safeOrders.length;
  const displayTotal = totalCount || loadedCount;
  const progressPercent = displayTotal > 0 ? Math.min(100, Math.round((loadedCount / displayTotal) * 100)) : 100;

  return (
    <div className="w-full min-h-screen p-3 sm:p-5 space-y-4 max-w-[1400px] mx-auto bg-transparent font-sans">
      {/* 1. Title Header & Rider Reconciliation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block shrink-0" />
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-zinc-900 dark:text-white uppercase font-mono m-0">
            TRANSACTION HISTORY
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Instant On-Demand Sync Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isManualRefreshing || isInitialLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs active:scale-95 disabled:opacity-60"
            title="Sync Live Orders & Transactions"
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-amber-500 ${isManualRefreshing ? "animate-spin" : ""}`} />
            <span>{isManualRefreshing ? "Syncing..." : "Sync Live"}</span>
          </button>

          {/* Rider COD Reconciliation Trigger Button */}
          <button
            type="button"
            onClick={() => setIsReconciliationModalOpen(true)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border shadow-sm active:scale-95 ${
              codStats.pendingAmount > 0
                ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400 shadow-amber-500/20"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40"
            }`}
          >
            <FaMotorcycle className="w-4 h-4" />
            <span>Rider COD Reconciliation</span>
            {codStats.pendingCount > 0 && (
              <span className="min-w-[20px] h-5 px-1 rounded-full bg-zinc-950 text-amber-400 text-[10px] font-black inline-flex items-center justify-center font-mono ml-0.5">
                {codStats.pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Rider Pending COD Alert Banner (if pending cash exists) */}
      {codStats.pendingAmount > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
              <FaMoneyBillWave className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Rider Cash Collection Pending</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                  {codStats.pendingCount} delivery order{codStats.pendingCount > 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Total cash waiting with dispatch riders:{" "}
                <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                  Rs. {codStats.pendingAmount.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReconciliationModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all border-none cursor-pointer shadow-xs active:scale-95"
          >
            <FaCheckDouble className="w-3.5 h-3.5" />
            <span>Reconcile Cash</span>
          </button>
        </div>
      )}

      {/* 3. Filter Pills & Search Input */}
      <HistoryFilterBar
        filterType={filterType}
        setFilterType={setFilterType}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* 4. Responsive Transaction Table */}
      {isInitialLoading && safeOrders.length === 0 ? (
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
          <FaSpinner className="w-7 h-7 text-amber-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Loading transaction history...
          </span>
        </div>
      ) : (
        <OrderHistoryTable
          filteredOrders={filteredOrders}
          printHandler={printHandler}
          viewHandler={viewHandler}
          onUpdateStatus={handleUpdatePaymentStatus}
          updatingOrderId={updatingOrderId}
        />
      )}


      {/* Load More Button, progress bar — hidden during search */}
      {!searchTerm.trim() && (
        <>
        {/* Load More Button or All Loaded message */}
        <div className="w-full flex justify-center items-center pt-1">
          {hasMore ? (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="w-full sm:w-auto max-w-[260px] sm:max-w-none inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-8 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-sm shadow-amber-500/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border-none"
            >
              {isLoadingMore ? (
                <>
                  <FaSpinner className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More</span>
                </>
              )}
            </button>
          ) : (
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 text-xs font-bold">
              <FaCheck className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>All {displayTotal} orders loaded</span>
            </div>
          )}
        </div>
        {/* 5. Server-Side Pagination & "Load More" Controls */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center gap-3">
        {/* Progress & count info */}
        <div className="flex flex-col items-center gap-1.5 w-full text-center">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <span className="text-zinc-500 dark:text-zinc-400">Showing</span>
            <span className="font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] sm:text-xs">
              {filteredOrders.length !== loadedCount ? `${filteredOrders.length} (filtered) of ` : ""}
              {loadedCount}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">of</span>
            <span className="font-mono text-zinc-900 dark:text-zinc-100 font-black">{displayTotal}</span>
            <span className="text-zinc-500 dark:text-zinc-400">total orders</span>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs sm:max-w-sm h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
        </>
      )}

      {/* 6. Rider COD Reconciliation Modal */}
      <RiderReconciliationModal
        isOpen={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
        orders={reconciliationOrders}
        onUpdateStatus={handleUpdatePaymentStatus}
        onBatchReconcile={handleBatchReconcile}
      />
    </div>
  );
}
