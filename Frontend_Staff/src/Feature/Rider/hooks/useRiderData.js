import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRiderSocket } from "./useRiderSocket";
import { useRiderLocation, calculateDistance } from "./useRiderLocation";
import { useRiderMutations } from "./useRiderMutations";
import { resolveAddressCoordinates } from "../utils/geocode";
import { resolveCoordinatesToAddress } from "../../../utils/geoHydrator";
import useWakeLock from "../../../Hooks/useWakeLock";

export function useRiderData() {
  const queryClient = useQueryClient();

  // 1. RIDER AUTH SESSION
  const [riderSession, setRiderSession] = useState(() => {
    const saved =
      sessionStorage.getItem("staff_user") ||
      sessionStorage.getItem("staff_session") ||
      sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // 2. DUTY STATUS (Persisted in localStorage across F5 refreshes)
  const [isOnline, setIsOnline] = useState(() => {
    const local = localStorage.getItem("rider_duty_status");
    if (local === "online") return true;
    if (local === "offline") return false;
    return (
      riderSession?.status === "Available" ||
      riderSession?.shift_status === "Available"
    );
  });

  // Keep screen awake while on duty
  useWakeLock(isOnline);

  // Sync duty status to backend on mount if online
  const initialSyncRef = useRef(false);
  useEffect(() => {
    if (isOnline && riderSession?.id && !initialSyncRef.current) {
      initialSyncRef.current = true;
      fetch(`${import.meta.env.VITE_API_BASE}/update_rider_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: riderSession.id,
          status: "Available",
          lat: 31.5204,
          lng: 74.3587,
        }),
      }).catch(() => {});
    }
  }, [isOnline, riderSession?.id]);

  // 3. MULTI-ORDER BATCHING STATE (Persisted in localStorage for F5 survival)
  const [activeOrders, setActiveOrders] = useState(() => {
    if (!riderSession?.id) return [];
    try {
      const saved = localStorage.getItem(`active_orders_${riderSession.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync activeOrders to localStorage
  useEffect(() => {
    if (riderSession?.id) {
      localStorage.setItem(
        `active_orders_${riderSession.id}`,
        JSON.stringify(activeOrders)
      );
    }
  }, [activeOrders, riderSession?.id]);

  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    return activeOrders[0]?.id || null;
  });

  const [incomingOrderDetails, setIncomingOrderDetails] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("heading_to_customer");
  const [deliveryPhoto, setDeliveryPhoto] = useState(null);

  // 4. STATS & HISTORY
  const [stats, setStats] = useState({
    deliveries: 0,
    earnings: 0,
    cashInHand: 0,
    onlineCollected: 0,
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (riderSession?.id) {
      const savedHistory = localStorage.getItem(`history_${riderSession.id}`);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        // Deduplicate by order ID (strip existing duplicates from prior sessions)
        const seen = new Set();
        const deduped = parsed.filter((item) => {
          const key = String(item.id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setHistory(deduped);
        // Persist cleaned list back if duplicates were removed
        if (deduped.length !== parsed.length) {
          localStorage.setItem(`history_${riderSession.id}`, JSON.stringify(deduped));
        }
      }
    }
  }, [riderSession?.id]);

  // 5. SUB-HOOK: SOCKET MANAGEMENT
  useRiderSocket({ riderId: riderSession?.id, queryClient });

  // 6. PROXIMITY-BASED ROUTING (Distance vs FCFS)
  // Distance from rider location to each order's dropoff, sorted Nearest First
  const proximityOrders = useMemo(() => {
    if (!activeOrders || activeOrders.length === 0) return [];
    return [...activeOrders]
      .map((ord) => {
        let distMeters = 0;
        const targetLat = ord.targetLat || ord.customer_lat || ord.latitude;
        const targetLng = ord.targetLng || ord.customer_lng || ord.longitude;
        if (targetLat && targetLng) {
          // Default rider coords to Lahore center if GPS not yet resolved
          const riderLat = 31.5204;
          const riderLng = 74.3587;
          distMeters = Math.round(
            calculateDistance(riderLat, riderLng, targetLat, targetLng)
          );
        }
        return {
          ...ord,
          distanceMeters: distMeters,
          distanceKm: (distMeters / 1000).toFixed(1) + " km",
        };
      })
      .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
  }, [activeOrders]);

  // Active navigation stop (selected order, falling back to nearest stop)
  const selectedOrder = useMemo(() => {
    if (proximityOrders.length === 0) return null;
    if (selectedOrderId) {
      const found = proximityOrders.find(
        (o) => String(o.id) === String(selectedOrderId)
      );
      if (found) return found;
    }
    return proximityOrders[0];
  }, [proximityOrders, selectedOrderId]);

  // 7. SUB-HOOK: LOCATION & MAPBOX NAVIGATION
  const {
    riderLocation,
    setManualRiderLocation,
    distance,
    setDistance,
    isArrived,
    setIsArrived,
    aiData,
    setAiData,
    routePath,
    setRoutePath,
    viewState,
    setViewState,
    fetchMapboxAI,
    MAPBOX_TOKEN,
  } = useRiderLocation({
    riderId: riderSession?.id,
    isOnline,
    selectedOrder,
    currentOrder: selectedOrder,
    orderStatus,
    setOrderStatus,
  });

  // Re-calculate dynamic proximity distance with live GPS coords
  const liveProximityOrders = useMemo(() => {
    if (!proximityOrders || proximityOrders.length === 0) return [];
    if (!riderLocation) return proximityOrders;

    return [...proximityOrders]
      .map((ord) => {
        const targetLat = ord.targetLat || ord.customer_lat || ord.latitude;
        const targetLng = ord.targetLng || ord.customer_lng || ord.longitude;
        const distMeters =
          targetLat && targetLng
            ? Math.round(
                calculateDistance(
                  riderLocation.lat,
                  riderLocation.lng,
                  targetLat,
                  targetLng
                )
              )
            : ord.distanceMeters;

        return {
          ...ord,
          distanceMeters: distMeters,
          distanceKm: (distMeters / 1000).toFixed(1) + " km",
        };
      })
      .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
  }, [proximityOrders, riderLocation]);

  // 8. REACT QUERY: ASSIGNED ORDER POLLING & RE-HYDRATION
  const { data: assignedOrderData } = useQuery({
    queryKey: ["rider_assigned_order", riderSession?.id],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_assigned_order.php?rider_id=${
          riderSession.id
        }`
      );
      return await res.json();
    },
    enabled: Boolean(isOnline && riderSession?.id),
    refetchInterval: 10000,
    staleTime: 3000,
  });

  // Hydrate all orders returned from backend
  useEffect(() => {
    if (
      assignedOrderData &&
      assignedOrderData.success &&
      (assignedOrderData.orders || assignedOrderData.order)
    ) {
      const backendOrders = assignedOrderData.orders || [
        assignedOrderData.order,
      ];

      const validOrders = backendOrders.filter(
        (o) =>
          o &&
          o.status &&
          !["delivered", "cancelled", "declined", "failed"].includes(
            o.status.toLowerCase()
          )
      );

      if (validOrders.length === 0) {
        if (activeOrders.length > 0) setActiveOrders([]);
        return;
      }

      // Helper to process single order
      const processOrder = async (o) => {
        const addr =
          o.customer_address ||
          o.address ||
          o.full_address ||
          "No Address Provided";
        let rawTargetLat = parseFloat(
          o.customer_lat || o.latitude || o.target_lat || o.lat
        );
        let rawTargetLng = parseFloat(
          o.customer_lng || o.longitude || o.target_lng || o.lng
        );

        let finalAddr = addr;
        if (
          rawTargetLat >= 23 &&
          rawTargetLat <= 37 &&
          rawTargetLng >= 60 &&
          rawTargetLng <= 78 &&
          Math.abs(rawTargetLat - 31.5102) > 0.0001
        ) {
          // valid coordinates present
        } else {
          // Geocode fallback
          try {
            const resolved = await resolveAddressCoordinates(
              addr,
              "",
              "",
              MAPBOX_TOKEN
            );
            rawTargetLat = resolved.lat;
            rawTargetLng = resolved.lng;
          } catch {
            rawTargetLat = 31.5204;
            rawTargetLng = 74.3587;
          }
        }

        if (
          !finalAddr ||
          finalAddr === "No Address Provided" ||
          finalAddr === "Walk-in"
        ) {
          try {
            const hydrated = await resolveCoordinatesToAddress(
              rawTargetLat,
              rawTargetLng,
              MAPBOX_TOKEN
            );
            if (hydrated) {
              const house = o.house_info || o.house_no || "";
              finalAddr = house
                ? `${house}, ${hydrated.street}, ${hydrated.area}`
                : hydrated.fullAddress;
            }
          } catch {}
        }

        const cartItems = Array.isArray(o.cart) ? o.cart : [];
        const itemsSummary = cartItems.length > 0
          ? cartItems.map((item) => `${item.qty || 1}x ${item.title || item.name || 'Item'}`).join(", ")
          : (typeof o.items === "string" ? o.items : "Food Items");

        return {
          id: o.id,
          customer: o.customer_name || o.customer || o.name || "Customer",
          phone: o.customer_mobile || o.mobile || o.phone || o.contact || "N/A",
          address: finalAddr,
          items: cartItems.length > 0 ? `${cartItems.length} Items` : "1 Item",
          itemsSummary: itemsSummary,
          cart: cartItems,
          total: `Rs ${parseFloat(o.total || 0).toLocaleString()}`,
          rawTotal: parseFloat(o.total || 0),
          paymentType: o.payment_method || o.paymentMethod || "Cash on Delivery",
          payment_method: o.payment_method || o.paymentMethod || "Cash on Delivery",
          time: o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just Now",
          targetLat: rawTargetLat,
          targetLng: rawTargetLng,
          customer_lat: rawTargetLat,
          customer_lng: rawTargetLng,
          status: o.status,
          notes: o.notes || o.special_instructions || "",
          house_no: o.house_no || o.house_info || "",
          street: o.street || "",
          area: o.area || "",
          delivery_fee: parseFloat(o.delivery_fee || 0),
          discount_amount: parseFloat(o.discount_amount || 0),
          rider_tip: parseFloat(o.rider_tip || 0),
          rawOrder: o,
        };
      };

      Promise.all(validOrders.map(processOrder)).then((hydratedList) => {
        const currentSavedIds = new Set(
          activeOrders.map((o) => String(o.id))
        );

        // Orders that were already accepted or present in local state
        const alreadyAccepted = hydratedList.filter((o) =>
          currentSavedIds.has(String(o.id))
        );

        // Newly assigned orders from dispatcher
        const brandNewOrders = hydratedList.filter(
          (o) => !currentSavedIds.has(String(o.id))
        );

        if (alreadyAccepted.length > 0 && brandNewOrders.length === 0) {
          // Re-hydration from refresh / state update: update active orders directly
          setActiveOrders(alreadyAccepted);
        } else if (brandNewOrders.length > 0) {
          // Check if status is already in transit ('Out for Delivery', 'On The Way')
          const inTransit = brandNewOrders.filter((o) =>
            ["out for delivery", "on the way"].includes(
              (o.status || "").toLowerCase()
            )
          );

          if (inTransit.length > 0) {
            // Auto-merge into activeOrders directly
            setActiveOrders((prev) => {
              const existingIds = new Set(prev.map((o) => String(o.id)));
              const freshOrders = hydratedList.filter(
                (o) => !existingIds.has(String(o.id))
              );
              const updatedList = [...prev, ...freshOrders];
              if (riderSession?.id) {
                localStorage.setItem(
                  `active_orders_${riderSession.id}`,
                  JSON.stringify(updatedList)
                );
              }
              return updatedList;
            });
          } else {
            // New dispatch offer(s): pass the entire array of new orders to support multi-stop batch offer!
            setIncomingOrderDetails((currentIncoming) => {
              if (currentIncoming) {
                const currentArr = Array.isArray(currentIncoming)
                  ? currentIncoming
                  : [currentIncoming];
                const currentIds = currentArr
                  .map((o) => String(o.id))
                  .sort()
                  .join(",");
                const newIds = brandNewOrders
                  .map((o) => String(o.id))
                  .sort()
                  .join(",");
                if (currentIds === newIds) return currentIncoming; // Keep existing modal timer intact
              }
              return brandNewOrders.length > 1
                ? brandNewOrders
                : brandNewOrders[0];
            });
          }
        } else {
          setActiveOrders(hydratedList);
          if (riderSession?.id) {
            localStorage.setItem(
              `active_orders_${riderSession.id}`,
              JSON.stringify(hydratedList)
            );
          }
        }
      });
    }
  }, [assignedOrderData, MAPBOX_TOKEN]);

  // 9. SUB-HOOK: MUTATIONS
  const {
    handleToggleStatus,
    isTogglingStatus,
    acceptOrder,
    completeDelivery,
    isCompletingDelivery,
    declineOrder,
  } = useRiderMutations({
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
  });

  // 10. PHOTO OF DELIVERY HANDLER
  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeliveryPhoto(reader.result);
        setOrderStatus("photo_captured");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return {
    riderSession,
    setRiderSession,
    isOnline,
    handleToggleStatus,
    isTogglingStatus,
    activeOrders,
    setActiveOrders,
    proximityOrders: liveProximityOrders,
    selectedOrder,
    selectedOrderId: selectedOrder?.id || selectedOrderId,
    setSelectedOrderId,
    currentOrder: selectedOrder, // Backward compatibility alias
    incomingOrderDetails,
    acceptOrder,
    declineOrder,
    completeDelivery,
    isCompletingDelivery,
    stats,
    history,
    isChatOpen,
    setIsChatOpen,
    orderStatus,
    deliveryPhoto,
    setDeliveryPhoto,
    handlePhotoUpload,
    riderLocation,
    setManualRiderLocation,
    distance,
    isArrived,
    aiData,
    routePath,
    viewState,
    setViewState,
    MAPBOX_TOKEN,
  };
}
