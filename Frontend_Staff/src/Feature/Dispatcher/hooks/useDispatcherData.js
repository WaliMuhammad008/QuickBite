import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiFetch } from "../../../utils/apiHelper";
import { staffSocket as socket } from "../../../utils/socket";

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const toRad = (v) => (v * Math.PI) / 180;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export function useDispatcherData() {
  const queryClient = useQueryClient();

  // Selection & UI States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);
  const [batchRadius, setBatchRadius] = useState(2000);
  const [isAutoPilotOn, setIsAutoPilotOn] = useState(false);
  const [autoPilotMinutes, setAutoPilotMinutes] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState("");
  const [manualBatchedOrders, setManualBatchedOrders] = useState(null);

  const [mapViewState, setMapViewState] = useState({
    longitude: 74.3587,
    latitude: 31.5204, // Default Lahore
    zoom: 11.5,
    pitch: 0,
  });

  // 1. FETCH ORDERS via React Query
  const {
    data: rawOrders = [],
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["dispatcher_orders"],
    queryFn: async () => {
      const orderRes = await apiFetch("get_orders.php?type=all&order_by=fcfs&sort=asc");
      const orderData = await orderRes.json();
      return Array.isArray(orderData) ? orderData : orderData.data || [];
    },
    refetchInterval: 10000,
    staleTime: 0,
  });

  // 2. FETCH STAFF via React Query
  const {
    data: rawStaff = [],
    isLoading: isStaffLoading,
    isFetching: isStaffFetching,
    refetch: refetchStaff,
  } = useQuery({
    queryKey: ["dispatcher_staff"],
    queryFn: async () => {
      const staffRes = await apiFetch("get_staff.php");
      const staffJson = await staffRes.json();
      return staffJson.success && Array.isArray(staffJson.data)
        ? staffJson.data
        : [];
    },
    refetchInterval: 15000,
    staleTime: 0,
  });

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Manual Instant Refresh for all 3: Ready Orders, Active Deliveries, and Riders
  const refetchAll = useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      await Promise.all([
        refetchOrders(),
        refetchStaff(),
        queryClient.invalidateQueries({ queryKey: ["dispatcher_orders"] }),
        queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["staff"] }),
      ]);
      toast.success("Live data refreshed!", { id: "dispatch-sync" });
    } catch (err) {
      console.error("Failed to sync dispatcher data:", err);
      toast.error("Failed to sync live data", { id: "dispatch-sync" });
    } finally {
      setIsManualRefreshing(false);
    }
  }, [refetchOrders, refetchStaff, queryClient]);

  // 3. SINGLETON SOCKET LISTENERS (Zero Memory Leaks)
  useEffect(() => {
    const handleJoin = () => {
      socket.emit("join_room", "dispatcher");
    };

    const invalidateQueries = () => {
      queryClient.invalidateQueries({ queryKey: ["dispatcher_orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    };

    // Real-time rider GPS tracking handler
    const handleRiderLocation = (data) => {
      if (!data?.riderId) return;
      queryClient.setQueryData(["dispatcher_staff"], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((s) => {
          if (String(s.id) === String(data.riderId)) {
            return {
              ...s,
              current_lat: data.lat,
              current_lng: data.lng,
              lat: data.lat,
              lng: data.lng,
            };
          }
          return s;
        });
      });
    };

    if (socket.connected) {
      handleJoin();
    } else {
      socket.on("connect", handleJoin);
    }

    socket.on("refresh_kitchen", invalidateQueries);
    socket.on("refresh_rider", invalidateQueries);
    socket.on("refresh_rider_list", invalidateQueries);
    socket.on("new_order_placed", invalidateQueries);
    socket.on("order_status_updated", invalidateQueries);
    socket.on("order_status_changed", invalidateQueries);
    socket.on("refresh_orders", invalidateQueries);
    socket.on("rider_location_broadcast", handleRiderLocation);

    return () => {
      socket.off("connect", handleJoin);
      socket.off("refresh_kitchen", invalidateQueries);
      socket.off("refresh_rider", invalidateQueries);
      socket.off("refresh_rider_list", invalidateQueries);
      socket.off("new_order_placed", invalidateQueries);
      socket.off("order_status_updated", invalidateQueries);
      socket.off("order_status_changed", invalidateQueries);
      socket.off("refresh_orders", invalidateQueries);
      socket.off("rider_location_broadcast", handleRiderLocation);
    };
  }, [queryClient]);

  // 4. MEMOIZED DERIVED DATA SELECTORS
  const rawReadyOrders = useMemo(() => {
    if (!Array.isArray(rawOrders)) return [];
    return rawOrders
      .filter((o) => {
        const type = String(o.order_type || o.type || "").toLowerCase().trim();
        const status = String(o.status || "").toLowerCase().trim();
        return (
          type.includes("delivery") &&
          (status === "ready" || status === "ready to serve")
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB; // FCFS: oldest first
      })
      .map((o) => {
        let rawItems = [];
        try {
          rawItems =
            typeof o.items === "string" ? JSON.parse(o.items) : o.items || [];
        } catch (e) { /* ignore parse errors */ }

        const paymentRaw = String(o.payment_method || o.payment || "COD").trim();
        const isCOD = paymentRaw.toUpperCase().includes("COD") || paymentRaw.toUpperCase().includes("CASH");
        const totalAmount = parseFloat(o.total) || 0;

        return {
          id: o.id,
          customer: o.customer_name || o.customer || o.name || "Unknown Customer",
          phone: o.customer_mobile || o.phone || "N/A",
          address: o.customer_address || o.address || "No Address Provided",
          targetLat:
            parseFloat(o.customer_lat || o.latitude || o.lat) || 31.5102,
          targetLng:
            parseFloat(o.customer_lng || o.longitude || o.lng) || 74.3440,
          rawItems: rawItems,
          items: `${rawItems?.length || 0} Items`,
          total: `Rs ${totalAmount.toLocaleString()}`,
          totalAmount: totalAmount,
          createdAt: o.created_at || null,
          time: o.created_at
            ? new Date(o.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just Now",
          paymentMethod: isCOD ? "COD" : "Online",
          payment: isCOD ? "COD" : "Online",
          isCOD: isCOD,
          isUrgent: false,
        };
      });
  }, [rawOrders]);

  // If manual batching is applied, use it; otherwise use rawReadyOrders
  const readyOrders = useMemo(() => {
    return manualBatchedOrders !== null ? manualBatchedOrders : rawReadyOrders;
  }, [manualBatchedOrders, rawReadyOrders]);

  const activeTrips = useMemo(() => {
    if (!Array.isArray(rawOrders)) return [];
    return rawOrders
      .filter((o) => {
        const status = String(o.status || "").toLowerCase().trim();
        const type = String(o.order_type || o.type || "").toLowerCase().trim();
        const isDelivery = type.includes("delivery");
        return (
          isDelivery &&
          (status === "dispatched" ||
            status === "out for delivery" ||
            status === "on the way") &&
          status !== "delivered" &&
          status !== "completed" &&
          status !== "cancelled"
        );
      })
      .map((o) => {
        let rawItems = [];
        try {
          rawItems =
            typeof o.items === "string" ? JSON.parse(o.items) : o.items || [];
        } catch (e) {}

        return {
          id: o.id,
          customer: o.customer_name || o.customer || o.name || "Unknown Customer",
          address: o.customer_address || o.address || "No Address",
          items: `${rawItems?.length || 0} Items`,
          total: `Rs ${o.total}`,
          time: o.created_at
            ? new Date(o.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just Now",
          payment: "COD",
          assignedRider: {
            id: o.rider_id,
            name: o.rider_name || `Rider #${o.rider_id}`,
          },
        };
      });
  }, [rawOrders]);

  const completedCount = useMemo(() => {
    if (!Array.isArray(rawOrders)) return 0;
    return rawOrders.filter((o) => {
      const type = String(o.order_type || o.type || "").toLowerCase().trim();
      const status = String(o.status || "").toLowerCase().trim();
      return (
        type.includes("delivery") &&
        (status === "delivered" || status === "completed")
      );
    }).length;
  }, [rawOrders]);

  const riders = useMemo(() => {
    if (!Array.isArray(rawStaff)) return [];
    const riderStaff = rawStaff.filter((s) => {
      const role = s.role ? s.role.toLowerCase() : "";
      const designation = s.designation ? s.designation.toLowerCase() : "";
      return role === "rider" || designation === "rider";
    });

    return riderStaff.map((r) => {
      const activeOrders = parseInt(r.active_orders_count) || 0;
      const shiftStatus = (r.shift_status || r.status || "Offline").trim();
      const isOffline = shiftStatus.toLowerCase() === "offline" || (r.status || "").toLowerCase() === "inactive";
      const canAccept = !isOffline && activeOrders < 3;

      return {
        id: r.id,
        name: r.name || "Unknown Rider",
        status: shiftStatus,
        activeOrders: activeOrders,
        canAccept: canAccept,
        isOffline: isOffline,
        location: {
          lat: parseFloat(r.lat) || 31.5204 + (Math.random() - 0.5) * 0.03,
          lng: parseFloat(r.lng) || 74.3587 + (Math.random() - 0.5) * 0.03,
        },
        trips: parseInt(r.trips_completed) || 0,
        rating: 4.8,
        vehicle: r.vehicle || "Bike",
        phone: r.phone || "N/A",
        accuracy: "98%",
      };
    });
  }, [rawStaff]);

  const freeRidersCount = useMemo(() => {
    return riders.filter((r) => r.canAccept).length;
  }, [riders]);

  // 5. ASSIGN RIDER MUTATION (Clean Singleton Socket Emit & Single Atomic HTTP Call)
  const assignMutation = useMutation({
    mutationFn: async ({ orderId, riderId, batchDetails }) => {
      const rawIds =
        batchDetails && Array.isArray(batchDetails) && batchDetails.length > 0
          ? batchDetails.map((b) => b.id)
          : [orderId];

      const ordersToAssign = rawIds
        .map((id) =>
          typeof id === "string" && id.startsWith("BATCH-")
            ? id.replace("BATCH-", "")
            : id
        )
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id) && id > 0);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/assign_rider.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_ids: ordersToAssign,
            order_id: ordersToAssign[0],
            id: ordersToAssign[0],
            rider_id: riderId,
            status: "Dispatched",
          }),
        }
      );
      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.message || "Assignment failed.");
      }
      return { resData, ordersToAssign, riderId };
    },
    onSuccess: (result, variables) => {
      const riderId = variables?.riderId;
      const orderIds = result?.ordersToAssign || [];

      // Single atomic socket emit with full assignment batch details
      socket.emit("trigger_rider_assignment", {
        rider_id: riderId,
        order_ids: orderIds,
      });
      socket.emit("rider_status_update");
      socket.emit("refresh_kitchen");
      socket.emit("order_status_updated");

      queryClient.invalidateQueries({ queryKey: ["dispatcher_orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });

      if (orderIds.length > 1) {
        toast.success(`Batch of ${orderIds.length} orders assigned to rider!`);
      } else {
        toast.success("Rider assigned successfully!");
      }
    },
    onError: (err) => {
      console.error("Assignment error:", err);
      toast.error(err.message || "Failed to assign rider.");
      // Re-fetch to get latest state after a capacity rejection
      queryClient.invalidateQueries({ queryKey: ["dispatcher_orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] });
    },
  });

  const handleAssign = useCallback(() => {
    if (!selectedOrder || !selectedRider) return;

    assignMutation.mutate({
      orderId: selectedOrder.id,
      riderId: selectedRider.id,
      batchDetails: selectedOrder.batchDetails,
    });

    setSelectedOrder(null);
    setSelectedRider(null);
    setManualBatchedOrders(null);
  }, [selectedOrder, selectedRider, assignMutation]);

  // 6. MARK DELIVERED MUTATION (Fixes stuck order in Active Trips)
  const markDeliveredMutation = useMutation({
    mutationFn: async ({ orderId, riderId }) => {
      // 1. Update order status to 'Delivered' in DB
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_order_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: orderId,
            order_id: orderId,
            status: "Delivered",
          }),
        }
      );
      const resJson = await res.json();

      // 2. Free rider status back to 'Available' in DB
      if (riderId) {
        await fetch(
          `${import.meta.env.VITE_API_BASE}/update_rider_status.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: riderId, status: "Available" }),
          }
        );
      }

      return resJson;
    },
    onSuccess: (_, variables) => {
      // Invalidate both orders and staff caches for immediate UI refresh
      queryClient.invalidateQueries({ queryKey: ["dispatcher_orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatcher_staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });

      // Broadcast real-time socket signals
      socket.emit("order_status_updated");
      socket.emit("rider_status_update");
      socket.emit("refresh_kitchen");
      socket.emit("refresh_rider");
      socket.emit("refresh_rider_list");

      toast.success(`Order #${variables.orderId} marked as delivered!`);
    },
    onError: (err) => {
      console.error("Delivery completion error:", err);
      toast.error("Failed to complete delivery.");
    },
  });

  const handleCompleteTrip = useCallback(
    (tripId, riderId) => {
      markDeliveredMutation.mutate({ orderId: tripId, riderId });
    },
    [markDeliveredMutation]
  );

  // 7. SMART MANUAL BATCHING
  const handleSmartBatching = useCallback(() => {
    if (readyOrders.length < 2) {
      toast.error("Need at least 2 orders to create a batch!");
      return;
    }
    const batchedList = [];
    const usedIds = new Set();

    readyOrders.forEach((order, index) => {
      if (usedIds.has(order.id)) return;
      const matches = readyOrders.filter(
        (o, i) =>
          i > index &&
          !usedIds.has(o.id) &&
          calculateDistance(
            order.targetLat,
            order.targetLng,
            o.targetLat,
            o.targetLng
          ) <= batchRadius
      );

      if (matches.length > 0) {
        const batchOrders = [order, ...matches];
        batchOrders.forEach((o) => usedIds.add(o.id));
        batchedList.push({
          id: `BATCH-${order.id}`,
          customer: `📦 Batch of ${batchOrders.length} Orders`,
          address: `Area: ${order.address}`,
          items: "Multiple Items (Check Rider App)",
          total: "Mixed",
          time: "Just Batched",
          payment: "Mixed",
          isUrgent: true,
          targetLat: order.targetLat,
          targetLng: order.targetLng,
          batchDetails: batchOrders,
        });
      } else {
        batchedList.push(order);
        usedIds.add(order.id);
      }
    });

    setManualBatchedOrders(batchedList);
    toast.success(
      `Manual Batching Complete! Radius Set: ${(batchRadius / 1000).toFixed(1)} KM`
    );
  }, [readyOrders, batchRadius]);

  // 8. AUTO-PILOT INTERVAL ENGINE
  useEffect(() => {
    let interval;
    if (isAutoPilotOn) {
      interval = setInterval(() => {
        if (readyOrders.length === 0) {
          setIsAutoPilotOn(false);
          toast.success("Queue cleared! All orders dispatched.");
          return;
        }

        const freeRiders = riders.filter((r) => r.status === "Available");
        if (freeRiders.length === 0) {
          setIsAutoPilotOn(false);
          toast.error("All riders busy! Auto-Pilot paused.");
          return;
        }

        const targetOrder = readyOrders[0];
        const bestRider = [...freeRiders].sort((a, b) => a.trips - b.trips)[0];

        assignMutation.mutate({
          orderId: targetOrder.id,
          riderId: bestRider.id,
          batchDetails: targetOrder.batchDetails,
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoPilotOn, readyOrders, riders, assignMutation]);

  // 9. TIMED AUTO-PILOT COUNTDOWN
  useEffect(() => {
    if (!isAutoPilotOn || autoPilotMinutes === 0) {
      setTimerDisplay("");
      return;
    }
    let timeLeft = autoPilotMinutes * 60;
    const updateDisplay = (time) => {
      const m = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
      const s = (time % 60).toString().padStart(2, "0");
      setTimerDisplay(`${m}:${s}`);
    };
    updateDisplay(timeLeft);

    const countdownInterval = setInterval(() => {
      timeLeft -= 1;
      updateDisplay(timeLeft);
      if (timeLeft <= 0) {
        setIsAutoPilotOn(false);
        toast("⏳ Auto-Pilot time expired. Switched to manual.");
        clearInterval(countdownInterval);
      }
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, [isAutoPilotOn, autoPilotMinutes]);

  return {
    readyOrders,
    activeTrips,
    completedCount,
    riders,
    freeRidersCount,
    selectedOrder,
    setSelectedOrder,
    selectedRider,
    setSelectedRider,
    batchRadius,
    setBatchRadius,
    isAutoPilotOn,
    setIsAutoPilotOn,
    autoPilotMinutes,
    setAutoPilotMinutes,
    timerDisplay,
    mapViewState,
    setMapViewState,
    handleAssign,
    handleCompleteTrip,
    handleSmartBatching,
    isAssigning: assignMutation.isPending,
    isCompletingTrip: markDeliveredMutation.isPending,
    isLoading: isOrdersLoading || isStaffLoading,
    refetchAll,
    isRefreshing: isManualRefreshing || isOrdersFetching || isStaffFetching,
  };
}
