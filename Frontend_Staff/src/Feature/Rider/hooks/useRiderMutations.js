import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { riderSocket } from "./useRiderSocket";
import { calculateDistance } from "./useRiderLocation";

export function useRiderMutations({
  riderSession,
  isOnline,
  setIsOnline,
  riderLocation,
  activeOrders,
  setActiveOrders,
  selectedOrder,
  setSelectedOrderId,
  incomingOrderDetails,
  setIncomingOrderDetails,
  setDistance,
  setIsArrived,
  setRoutePath,
  setAiData,
  setDeliveryPhoto,
  setOrderStatus,
  fetchMapboxAI,
  history,
  setHistory,
  setStats,
  queryClient,
}) {
  // 1. TOGGLE DUTY STATUS MUTATION
  const toggleDutyStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      if (!riderSession?.id) return;
      await fetch(`${import.meta.env.VITE_API_BASE}/update_rider_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: riderSession.id,
          status: newStatus ? "Available" : "Offline",
          lat: riderLocation?.lat || 31.5204,
          lng: riderLocation?.lng || 74.3587,
        }),
      });
    },
    onSuccess: (_, newStatus) => {
      setIsOnline(newStatus);
      localStorage.setItem("rider_duty_status", newStatus ? "online" : "offline");
      riderSocket.emit("rider_status_update");
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] });
        queryClient.invalidateQueries({ queryKey: ["rider_assigned_order", riderSession?.id] });
      }
      toast.success(newStatus ? "You are now ONLINE!" : "You are now OFFLINE.");
    },
    onError: () => {
      toast.error("Failed to update duty status.");
    },
  });

  const handleToggleStatus = useCallback(() => {
    toggleDutyStatusMutation.mutate(!isOnline);
  }, [isOnline, toggleDutyStatusMutation]);

  // 2. ACCEPT ORDER (Supports single order or array of batched orders)
  const acceptOrder = useCallback(
    async (batchOrSingle) => {
      const ordersToAdd = Array.isArray(batchOrSingle)
        ? batchOrSingle
        : batchOrSingle
        ? [batchOrSingle]
        : incomingOrderDetails
        ? Array.isArray(incomingOrderDetails)
          ? incomingOrderDetails
          : [incomingOrderDetails]
        : [];

      if (ordersToAdd.length === 0) return;

      const primaryTarget = ordersToAdd[0];
      const customerPhone = primaryTarget.phone;

      setActiveOrders((prev) => {
        const existingIds = new Set(prev.map((o) => String(o.id)));
        const merged = [
          ...prev,
          ...ordersToAdd.filter((o) => !existingIds.has(String(o.id))),
        ];
        if (riderSession?.id) {
          localStorage.setItem(
            `active_orders_${riderSession.id}`,
            JSON.stringify(merged)
          );
        }
        return merged;
      });

      setSelectedOrderId(primaryTarget.id);
      setIncomingOrderDetails(null);
      setIsArrived(false);
      setDeliveryPhoto(null);
      setOrderStatus("heading_to_customer");
      setAiData({ eta: "...", roadDistance: "..." });
      setRoutePath([]);

      if (
        riderLocation &&
        primaryTarget.targetLat &&
        primaryTarget.targetLng
      ) {
        const dist = calculateDistance(
          riderLocation.lat,
          riderLocation.lng,
          primaryTarget.targetLat,
          primaryTarget.targetLng
        );
        setDistance(Math.round(dist));
        fetchMapboxAI(
          riderLocation.lat,
          riderLocation.lng,
          primaryTarget.targetLat,
          primaryTarget.targetLng
        );
      }

      try {
        const orderIds = ordersToAdd.map((o) => o.id);
        await fetch(`${import.meta.env.VITE_API_BASE}/accept_order.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rider_id: riderSession.id,
            order_ids: orderIds,
          }),
        });

        riderSocket.emit("rider_status_update");
        riderSocket.emit("order_status_updated");
        riderSocket.emit("refresh_kitchen");
        riderSocket.emit("refresh_rider");
        riderSocket.emit("refresh_orders");
      } catch (err) {
        console.warn("Could not update rider status on accept:", err);
      }
    },
    [
      incomingOrderDetails,
      riderLocation,
      riderSession,
      setActiveOrders,
      setSelectedOrderId,
      setIncomingOrderDetails,
      setIsArrived,
      setDeliveryPhoto,
      setOrderStatus,
      setAiData,
      setRoutePath,
      setDistance,
      fetchMapboxAI,
    ]
  );

  // 3. COMPLETE DELIVERY MUTATION (Supports multi-stop by orderId)
  const completeDeliveryMutation = useMutation({
    mutationFn: async (targetOrderId) => {
      const orderToComplete =
        activeOrders.find((o) => String(o.id) === String(targetOrderId)) ||
        selectedOrder ||
        activeOrders[0];

      if (!orderToComplete) throw new Error("No active order found to complete.");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/complete_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderToComplete.id,
            rider_id: riderSession.id,
            payment_method:
              orderToComplete.paymentType ||
              orderToComplete.payment_method ||
              "COD",
          }),
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to complete delivery");
      }
      return { data, completedOrder: orderToComplete };
    },
    onSuccess: ({ completedOrder }) => {
      riderSocket.emit("order_delivered");
      riderSocket.emit("order_status_updated");
      riderSocket.emit("rider_status_update");
      riderSocket.emit("refresh_kitchen");

      const isCash =
        completedOrder?.paymentType === "Cash on Delivery" ||
        completedOrder?.paymentType === "COD" ||
        completedOrder?.payment_method === "Cash on Delivery" ||
        completedOrder?.payment_method === "COD";
      const orderAmount =
        parseFloat(
          String(completedOrder?.total || "0").replace(/[^0-9.]/g, "") || "0"
        ) || 0;

      const newDelivery = {
        id: completedOrder.id,
        customer: completedOrder.customer,
        earnings: 150,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setHistory((prev) => {
        const alreadyExists = prev.some((item) => String(item.id) === String(newDelivery.id));
        if (alreadyExists) return prev;
        const updatedHistory = [newDelivery, ...prev];
        if (riderSession?.id) {
          localStorage.setItem(
            `history_${riderSession.id}`,
            JSON.stringify(updatedHistory)
          );
        }
        return updatedHistory;
      });
      // localStorage persistence is now handled inside the setHistory updater above

      setStats((prev) => ({
        deliveries: prev.deliveries + 1,
        earnings: prev.earnings + 150,
        cashInHand: isCash ? prev.cashInHand + orderAmount : prev.cashInHand,
        onlineCollected: !isCash
          ? prev.onlineCollected + orderAmount
          : prev.onlineCollected,
      }));

      // Multi-stop removal: remove only completed order from active queue
      setActiveOrders((prev) => {
        const remaining = prev.filter(
          (o) => String(o.id) !== String(completedOrder.id)
        );
        if (riderSession?.id) {
          localStorage.setItem(
            `active_orders_${riderSession.id}`,
            JSON.stringify(remaining)
          );
        }
        if (remaining.length > 0) {
          setSelectedOrderId(remaining[0].id);
        } else {
          setSelectedOrderId(null);
          setDistance(null);
          setIsArrived(false);
          setRoutePath([]);
          setDeliveryPhoto(null);
          setOrderStatus("heading_to_customer");
        }
        return remaining;
      });

      if (queryClient) {
        queryClient.invalidateQueries({
          queryKey: ["rider_assigned_order", riderSession?.id],
        });
      }

      toast.success(`Stop #${completedOrder.id} delivered!`);
    },
    onError: (err) => {
      toast.error(err.message || "Could not complete delivery.");
    },
  });

  // 4. DECLINE / CANCEL ORDER MUTATION
  const declineOrderMutation = useMutation({
    mutationFn: async (orderIdOrArray) => {
      const orderIds = Array.isArray(orderIdOrArray) ? orderIdOrArray : [orderIdOrArray];
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/decline_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_ids: orderIds,
            order_id: orderIds[0],
            rider_id: riderSession.id,
          }),
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to cancel");
      return { data, orderIds };
    },
    onSuccess: ({ orderIds }) => {
      riderSocket.emit("rider_status_update");
      riderSocket.emit("refresh_kitchen");
      riderSocket.emit("order_status_updated");
      riderSocket.emit("refresh_orders");
      riderSocket.emit("refresh_rider");
      riderSocket.emit("refresh_rider_list");

      const idSet = new Set(orderIds.map((id) => String(id)));

      setActiveOrders((prev) => {
        const remaining = prev.filter((o) => !idSet.has(String(o.id)));
        if (riderSession?.id) {
          localStorage.setItem(
            `active_orders_${riderSession.id}`,
            JSON.stringify(remaining)
          );
        }
        if (remaining.length > 0) {
          setSelectedOrderId(remaining[0].id);
        } else {
          setSelectedOrderId(null);
          setDistance(null);
          setIsArrived(false);
          setRoutePath([]);
          setDeliveryPhoto(null);
          setOrderStatus("heading_to_customer");
        }
        return remaining;
      });

      setIncomingOrderDetails((prev) => {
        if (!prev) return null;
        if (Array.isArray(prev)) {
          const rem = prev.filter((o) => !idSet.has(String(o.id)));
          return rem.length > 0 ? rem : null;
        }
        return idSet.has(String(prev.id)) ? null : prev;
      });

      if (queryClient) {
        queryClient.invalidateQueries({
          queryKey: ["rider_assigned_order", riderSession?.id],
        });
      }

      toast.success(
        orderIds.length > 1
          ? "Orders returned to dispatcher queue."
          : "Order returned to dispatcher queue."
      );
    },
    onError: (err) => {
      toast.error(err.message || "Could not decline order.");
    },
  });

  const declineOrder = useCallback(
    (idOrArray) => {
      if (idOrArray) {
        declineOrderMutation.mutate(idOrArray);
      }
      setIncomingOrderDetails(null);
    },
    [declineOrderMutation, setIncomingOrderDetails]
  );

  return {
    handleToggleStatus,
    isTogglingStatus: toggleDutyStatusMutation.isPending,
    acceptOrder,
    completeDelivery: (orderId) =>
      completeDeliveryMutation.mutate(orderId || selectedOrder?.id),
    isCompletingDelivery: completeDeliveryMutation.isPending,
    declineOrder,
  };
}
