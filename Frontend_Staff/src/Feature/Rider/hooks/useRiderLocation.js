import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { riderSocket } from "./useRiderSocket";

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

export function useRiderLocation({
  riderId,
  isOnline,
  selectedOrder,
  currentOrder,
  orderStatus,
  setOrderStatus,
}) {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const targetOrder = selectedOrder || currentOrder;

  // 1. Initial State explicitly locked to Lahore
  const [riderLocation, setRiderLocation] = useState({
    lat: 31.5204,
    lng: 74.3587,
  });
  const [distance, setDistance] = useState(null);
  const [isArrived, setIsArrived] = useState(false);
  const [aiData, setAiData] = useState({ eta: "...", roadDistance: "..." });
  const [routePath, setRoutePath] = useState([]);
  const [viewState, setViewState] = useState({
    longitude: 74.3587,
    latitude: 31.5204,
    zoom: 15,
    pitch: 45,
  });

  const lastLocationSendTime = useRef(0);
  const lastLocationSent = useRef({ lat: 0, lng: 0 });
  const isDevSimulating = useRef(false);

  // 2. Fetch Mapbox Directions AI Polyline
  const fetchMapboxAI = useCallback(
    async (startLat, startLng, endLat, endLng) => {
      if (!MAPBOX_TOKEN) return;
      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
        );
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          setAiData({
            eta: Math.round(route.duration / 60) + " mins",
            roadDistance: (route.distance / 1000).toFixed(1) + " km",
          });
          setRoutePath(route.geometry.coordinates);
        }
      } catch (error) {
        console.error("Mapbox Directions API Error:", error);
      }
    },
    [MAPBOX_TOKEN]
  );

  const watchIdRef = useRef(null);

  // 3. Throttled Geolocation Watcher
  useEffect(() => {
    if (isOnline && riderId) {
      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            if (isDevSimulating.current) return;
            if (orderStatus === "arrived" || orderStatus === "photo_captured")
              return;

            const { latitude, longitude } = pos.coords;
            // Ignore non-Pakistan coordinates
            if (
              latitude < 23 ||
              latitude > 37 ||
              longitude < 60 ||
              longitude > 78
            ) {
              return;
            }

            setRiderLocation({ lat: latitude, lng: longitude });
            setViewState((prev) => ({
              ...prev,
              latitude,
              longitude,
            }));

            const now = Date.now();
            const movedDist = calculateDistance(
              lastLocationSent.current.lat,
              lastLocationSent.current.lng,
              latitude,
              longitude
            );

            if (now - lastLocationSendTime.current > 5000 || movedDist > 10) {
              lastLocationSendTime.current = now;
              lastLocationSent.current = { lat: latitude, lng: longitude };

              fetch(
                `${import.meta.env.VITE_API_BASE}/update_rider_location.php`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: riderId,
                    lat: latitude,
                    lng: longitude,
                  }),
                }
              ).catch(() => {});

              riderSocket.emit("rider_location_update", {
                riderId,
                lat: latitude,
                lng: longitude,
              });
            }

            if (targetOrder && targetOrder.targetLat && targetOrder.targetLng) {
              const dist = calculateDistance(
                latitude,
                longitude,
                targetOrder.targetLat,
                targetOrder.targetLng
              );
              setDistance(Math.round(dist));
              if (dist < 50 && !isArrived) {
                setIsArrived(true);
                if (setOrderStatus) setOrderStatus("arrived");
                toast("🎯 GEOFENCE: You have arrived at customer location!", {
                  icon: "📍",
                });
              }
            }
          },
          (err) => console.error("Geolocation Watch Error:", err),
          { enableHighAccuracy: true }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setDistance(null);
      setIsArrived(false);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOnline, targetOrder, isArrived, orderStatus, riderId, setOrderStatus]);

  // Recalculate route and distance whenever targetOrder changes
  useEffect(() => {
    if (targetOrder && targetOrder.targetLat && targetOrder.targetLng) {
      fetchMapboxAI(
        riderLocation.lat,
        riderLocation.lng,
        targetOrder.targetLat,
        targetOrder.targetLng
      );
      const dist = calculateDistance(
        riderLocation.lat,
        riderLocation.lng,
        targetOrder.targetLat,
        targetOrder.targetLng
      );
      setDistance(Math.round(dist));
    } else {
      setRoutePath([]);
      setAiData({ eta: "...", roadDistance: "..." });
      setDistance(null);
    }
  }, [targetOrder?.id, targetOrder?.targetLat, targetOrder?.targetLng, fetchMapboxAI]);

  // 4. Manual Coordinate Setter (for Dev Simulator)
  const setManualRiderLocation = useCallback(
    ({ lat, lng, heading = 0 }) => {
      isDevSimulating.current = true;
      const latitude = typeof lat === "string" ? parseFloat(lat) : lat;
      const longitude = typeof lng === "string" ? parseFloat(lng) : lng;
      const parsedHeading = typeof heading === "string" ? parseFloat(heading) : (heading || 0);
      if (isNaN(latitude) || isNaN(longitude)) return;

      setRiderLocation({ lat: latitude, lng: longitude, heading: parsedHeading });
      setViewState((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));

      if (riderId) {
        fetch(`${import.meta.env.VITE_API_BASE}/update_rider_location.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: riderId,
            lat: latitude,
            lng: longitude,
            heading: parsedHeading,
          }),
        }).catch(() => {});

        riderSocket.emit("rider_location_update", {
          riderId,
          rider_id: riderId,
          order_id: targetOrder?.id || null,
          lat: latitude,
          lng: longitude,
          latitude,
          longitude,
          heading: parsedHeading,
        });
      }

      if (targetOrder && targetOrder.targetLat && targetOrder.targetLng) {
        fetchMapboxAI(
          latitude,
          longitude,
          targetOrder.targetLat,
          targetOrder.targetLng
        );
        const dist = calculateDistance(
          latitude,
          longitude,
          targetOrder.targetLat,
          targetOrder.targetLng
        );
        setDistance(Math.round(dist));
        if (dist < 50 && !isArrived) {
          setIsArrived(true);
          if (setOrderStatus) setOrderStatus("arrived");
          toast("🎯 GEOFENCE: You have arrived at customer location!", {
            icon: "📍",
          });
        }
      }
    },
    [riderId, targetOrder, isArrived, fetchMapboxAI, setOrderStatus]
  );

  return {
    riderLocation,
    setRiderLocation,
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
  };
}
