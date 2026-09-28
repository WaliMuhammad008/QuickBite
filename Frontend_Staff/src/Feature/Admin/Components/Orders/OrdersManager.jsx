import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

// Components Import
import OrderFilterBar from "./Components/OrderFilterBar";
import OrdersTable from "./Components/OrdersTable";
import UpdateStatusModal from "./Components/UpdateStatusModal";
import OrderReceiptModal from "./Components/OrderReceiptModal";
import ServerPaginationControls from "../SharedComponents/ServerPaginationControls";
import { apiFetch } from "../../../../utils/apiHelper";
import { staffSocket } from "../../../../utils/socket";

const PAGE_SIZE = 30;

// Helper to parse individual database order
const parseOrder = (dbOrder) => {
  let itemsArray = [];
  if (dbOrder.items) {
    if (typeof dbOrder.items === "string") {
      try {
        itemsArray = JSON.parse(dbOrder.items);
      } catch (e) {}
    } else if (Array.isArray(dbOrder.items)) {
      itemsArray = dbOrder.items;
    }
  } else if (dbOrder.cart) {
    if (typeof dbOrder.cart === "string") {
      try {
        itemsArray = JSON.parse(dbOrder.cart);
      } catch (e) {}
    } else if (Array.isArray(dbOrder.cart)) {
      itemsArray = dbOrder.cart;
    }
  }

  const parsedItems = Array.isArray(itemsArray)
    ? itemsArray.map((i) => {
        let parsedAddons =
          i.selected_addons ||
          i.selectedAddons ||
          i.addons ||
          i.selected_addons_json ||
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
          ...i,
          name: i ? i.title || i.name || "" : "",
          title: i ? i.title || i.name || "" : "",
          qty: i ? parseInt(i.qty || i.quantity || 1, 10) : 1,
          price: i ? parseFloat(i.price || 0) : 0,
          base_price:
            i && i.base_price !== undefined ? parseFloat(i.base_price) : undefined,
          size: i?.size || "",
          note: i?.note || "",
          spice_level: i?.spice_level || "",
          selected_addons: parsedAddons,
          selectedAddons: parsedAddons,
          addons: parsedAddons,
          selected_addons_json: parsedAddons,
        };
      })
    : [];

  const rawType = dbOrder.order_type || dbOrder.order_mode || "DELIVERY";
  const formattedType = rawType.replace("_", " ").toUpperCase();

  return {
    ...dbOrder,
    id: `#${dbOrder.id}`,
    rawId: dbOrder.id,
    order_id: dbOrder.id,
    customerName: dbOrder.customer_name || dbOrder.customer || "Walk-in Customer",
    customer_name: dbOrder.customer_name || dbOrder.customer || "Walk-in Customer",
    customer_mobile: dbOrder.customer_mobile || "",
    customer_address: dbOrder.customer_address || "",
    table_number: dbOrder.table_number || "",
    type: formattedType,
    order_type: formattedType,
    order_mode: formattedType,
    payment_method: dbOrder.payment_method || "Cash",
    payment_status: dbOrder.payment_status || "Pending",
    transaction_id: dbOrder.transaction_id || "",
    subtotal: parseFloat(dbOrder.subtotal || 0),
    tax_amount: parseFloat(dbOrder.tax_amount || 0),
    delivery_fee: parseFloat(dbOrder.delivery_fee || 0),
    rider_tip: parseFloat(dbOrder.rider_tip || 0),
    discount_amount: parseFloat(dbOrder.discount_amount || 0),
    coupon_code: dbOrder.coupon_code || "",
    total: parseFloat(dbOrder.total || 0),
    status: (dbOrder.status || "").toLowerCase(),
    time: dbOrder.time,
    date: dbOrder.date,
    created_at: dbOrder.created_at || dbOrder.time,
    items: parsedItems,
    cart: parsedItems,
  };
};

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrderToEdit, setSelectedOrderToEdit] = useState(null);
  const [selectedOrderToView, setSelectedOrderToView] = useState(null);

  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Fetch paginated batch of orders from server
  const fetchOrdersBatch = useCallback(async (offset = 0, isAppend = false) => {
    if (isAppend) {
      setIsLoadingMore(true);
    } else if (ordersRef.current.length === 0) {
      setIsInitialLoading(true);
    }

    try {
      const response = await apiFetch(
        `get_orders.php?type=all&limit=${PAGE_SIZE}&offset=${offset}&format=paginated`
      );
      const data = await response.json();

      if (data && data.success) {
        const formatted = (data.orders || []).map(parseOrder);
        const serverTotal = data.total || 0;
        setTotalCount(serverTotal);

        if (isAppend) {
          setOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.rawId));
            const newUnique = formatted.filter((o) => !existingIds.has(o.rawId));
            const merged = [...prev, ...newUnique];
            setHasMore(merged.length < serverTotal);
            return merged;
          });
        } else {
          setOrders(formatted);
          setHasMore(formatted.length < serverTotal);
        }
      } else if (Array.isArray(data)) {
        const formatted = data.map(parseOrder);
        setOrders(formatted);
        setTotalCount(formatted.length);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Background refresh to keep currently loaded orders updated
  const refreshCurrentOrders = useCallback(async () => {
    try {
      const currentLimit = Math.max(PAGE_SIZE, ordersRef.current.length || PAGE_SIZE);
      const response = await apiFetch(
        `get_orders.php?type=all&limit=${currentLimit}&offset=0&format=paginated`
      );
      const data = await response.json();

      if (data && data.success) {
        const formatted = (data.orders || []).map(parseOrder);
        const serverTotal = data.total || 0;
        setOrders(formatted);
        setTotalCount(serverTotal);
        setHasMore(formatted.length < serverTotal);
      }
    } catch (err) {
      console.warn("Orders background sync error:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrdersBatch(0, false);
  }, [fetchOrdersBatch]);

  // Real-time socket sync and periodic background polling (fallback 60s)
  useEffect(() => {
    staffSocket.on("refresh_kitchen", refreshCurrentOrders);
    staffSocket.on("refresh_orders", refreshCurrentOrders);
    staffSocket.on("new_order_placed", refreshCurrentOrders);
    staffSocket.on("order_status_updated", refreshCurrentOrders);
    staffSocket.on("order_status_changed", refreshCurrentOrders);
    staffSocket.on("payment_status_updated", refreshCurrentOrders);

    const timer = setInterval(() => {
      refreshCurrentOrders();
    }, 60000);

    return () => {
      staffSocket.off("refresh_kitchen", refreshCurrentOrders);
      staffSocket.off("refresh_orders", refreshCurrentOrders);
      staffSocket.off("new_order_placed", refreshCurrentOrders);
      staffSocket.off("order_status_updated", refreshCurrentOrders);
      staffSocket.off("order_status_changed", refreshCurrentOrders);
      staffSocket.off("payment_status_updated", refreshCurrentOrders);
      clearInterval(timer);
    };
  }, [refreshCurrentOrders]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchOrdersBatch(orders.length, true);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

  const handleSaveStatus = async (orderId, newStatus) => {
    const numericId = orderId.toString().replace("#", "");
    const backendStatus =
      newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    // Optimistic Update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setSelectedOrderToEdit(null);

    try {
      const response = await apiFetch("update_order_status.php", {
        method: "POST",
        body: JSON.stringify({ id: numericId, status: backendStatus }),
      });

      if (response.ok) {
        toast.success(`Order ${orderId} Status Updated!`, {
          style: { background: "#333", color: "#fff" },
        });
        refreshCurrentOrders();
      } else {
        toast.error("Failed to update status in Database!");
        refreshCurrentOrders();
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      refreshCurrentOrders();
    }
  };

  return (
    <div className="bg-transparent p-0 border-none w-full animate-slide-up pb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
        <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
          Orders Management
        </h2>
      </div>

      <OrderFilterBar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <OrdersTable
        orders={filteredOrders}
        isLoading={isInitialLoading && orders.length === 0}
        onEditClick={(order) => setSelectedOrderToEdit(order)}
        onViewClick={(order) => setSelectedOrderToView(order)}
      />

      {/* Server-side Pagination & Load More Controls */}
      {orders.length > 0 && (
        <ServerPaginationControls
          loadedCount={orders.length}
          totalCount={totalCount}
          filteredCount={filterStatus !== "all" ? filteredOrders.length : null}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          itemLabel="orders"
        />
      )}

      <UpdateStatusModal
        order={selectedOrderToEdit}
        onClose={() => setSelectedOrderToEdit(null)}
        onSave={handleSaveStatus}
      />

      <OrderReceiptModal
        isOpen={selectedOrderToView !== null}
        order={selectedOrderToView}
        onClose={() => setSelectedOrderToView(null)}
      />
    </div>
  );
};

export default OrdersManager;
