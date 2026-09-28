import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaStore,
  FaCompass,
  FaRoute,
  FaChevronUp,
  FaChevronDown,
  FaSpinner,
  FaBolt,
  FaCheckCircle,
} from "react-icons/fa";
import { fetchDrivingRoute, buildRoadStepsWithBearings } from "../../../utils/mapRouteHelper";
import { staffSocket as riderSocket } from "../../../utils/socket";

export default function RiderGpsSimulator({
  currentLocation = { lat: 31.5204, lng: 74.3587 },
  destination = null,
  activeOrderId = null,
  riderId = null,
  mapboxToken = "",
  onLocationUpdate,
}) {
  const token = mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN;

  const { data: storeSettings = {} } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
        const json = await res.json();
        return json.success ? json.data : {};
      } catch {
        return {};
      }
    },
    staleTime: 60000,
  });

  const storeLat = parseFloat(storeSettings.store_lat || storeSettings.restaurant_lat) || 31.5204;
  const storeLng = parseFloat(storeSettings.store_lng || storeSettings.restaurant_lng) || 74.3587;

  const PRESETS = [
    { name: "Store (BigBite HQ)", lat: storeLat, lng: storeLng },
    { name: "Gulberg Main", lat: 31.5102, lng: 74.3440 },
    { name: "Model Town", lat: 31.4826, lng: 74.3256 },
    { name: "DHA Phase 5", lat: 31.4685, lng: 74.4020 },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [customLat, setCustomLat] = useState(currentLocation?.lat || storeLat);
  const [customLng, setCustomLng] = useState(currentLocation?.lng || storeLng);
  const [simOrderId, setSimOrderId] = useState(activeOrderId ? String(activeOrderId) : "");
  const [isSocketConnected, setIsSocketConnected] = useState(riderSocket ? riderSocket.connected : false);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [simSteps, setSimSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [routeMeta, setRouteMeta] = useState(null); // { distanceKm, durationMins }
  const [simSpeed, setSimSpeed] = useState(900); // ms per step (Default: 900ms)
  const intervalRef = useRef(null);

  useEffect(() => {
    if (activeOrderId) {
      setSimOrderId(String(activeOrderId));
    }
  }, [activeOrderId]);

  useEffect(() => {
    if (!riderSocket) return;
    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    setIsSocketConnected(riderSocket.connected);
    riderSocket.on("connect", onConnect);
    riderSocket.on("disconnect", onDisconnect);

    return () => {
      riderSocket.off("connect", onConnect);
      riderSocket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (currentLocation?.lat && currentLocation?.lng && !isSimulating) {
      setCustomLat(currentLocation.lat);
      setCustomLng(currentLocation.lng);
    }
  }, [currentLocation, isSimulating]);

  // Fallback linear steps generator in case Mapbox network call fails
  const generateFallbackSteps = (start, end, numSteps = 30) => {
    const coords = [];
    for (let i = 0; i <= numSteps; i++) {
      const fraction = i / numSteps;
      const lat = start.lat + (end.lat - start.lat) * fraction;
      const lng = start.lng + (end.lng - start.lng) * fraction;
      coords.push([parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))]);
    }
    return buildRoadStepsWithBearings(coords);
  };

  const handleStartSimulation = async () => {
    const targetDest = destination || { lat: 31.4826, lng: 74.3256 }; // Default Model Town
    const startLoc = {
      lat: parseFloat(customLat) || storeLat,
      lng: parseFloat(customLng) || storeLng,
    };

    setIsLoadingRoute(true);

    try {
      if (token) {
        const routeData = await fetchDrivingRoute(
          [startLoc.lng, startLoc.lat],
          [targetDest.lng, targetDest.lat],
          token
        );

        if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
          const roadSteps = buildRoadStepsWithBearings(routeData.coordinates);
          setSimSteps(roadSteps);
          setRouteMeta({
            distanceKm: routeData.distanceKm,
            durationMins: routeData.durationMins,
            totalPoints: roadSteps.length,
            isRoadSnapped: true,
          });
          setCurrentStepIndex(0);
          setIsSimulating(true);

          // Apply initial point immediately
          if (roadSteps[0] && onLocationUpdate) {
            onLocationUpdate(roadSteps[0]);
            emitSocketLocation(roadSteps[0]);
          }
          return;
        }
      }
      throw new Error("No token or route data");
    } catch (err) {
      console.warn("Mapbox Directions API fallback to interpolated path:", err);
      const fallbackSteps = generateFallbackSteps(startLoc, targetDest, 30);
      setSimSteps(fallbackSteps);
      setRouteMeta({
        distanceKm: "Estimated",
        durationMins: 15,
        totalPoints: fallbackSteps.length,
        isRoadSnapped: false,
      });
      setCurrentStepIndex(0);
      setIsSimulating(true);

      if (fallbackSteps[0] && onLocationUpdate) {
        onLocationUpdate(fallbackSteps[0]);
        emitSocketLocation(fallbackSteps[0]);
      }
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const emitSocketLocation = (pos) => {
    if (!pos) return;
    const orderIdToEmit = simOrderId ? (parseInt(simOrderId, 10) || simOrderId) : (activeOrderId || null);
    const payload = {
      order_id: orderIdToEmit,
      orderId: orderIdToEmit,
      rider_id: riderId || null,
      latitude: pos.lat,
      longitude: pos.lng,
      heading: pos.heading || 0,
      bearing: pos.heading || 0,
      lat: pos.lat,
      lng: pos.lng,
    };

    if (riderSocket) {
      riderSocket.emit("rider_location_update", payload);
    }
  };

  const handlePauseSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleResumeSimulation = () => {
    if (simSteps.length > 0 && currentStepIndex < simSteps.length - 1) {
      setIsSimulating(true);
    } else {
      handleStartSimulation();
    }
  };

  const handleResetToStore = () => {
    setIsSimulating(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentStepIndex(0);
    setSimSteps([]);
    setRouteMeta(null);
    setCustomLat(storeLat);
    setCustomLng(storeLng);

    const storePos = { lat: storeLat, lng: storeLng, heading: 0 };
    if (onLocationUpdate) {
      onLocationUpdate(storePos);
    }
    emitSocketLocation(storePos);
  };

  // Road-Snapped Simulation Loop
  useEffect(() => {
    if (isSimulating && simSteps.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= simSteps.length - 1) {
            setIsSimulating(false);
            clearInterval(intervalRef.current);
            return prev;
          }
          const nextIndex = prev + 1;
          const nextPos = simSteps[nextIndex];
          if (nextPos) {
            if (onLocationUpdate) {
              onLocationUpdate(nextPos);
            }
            emitSocketLocation(nextPos);
          }
          return nextIndex;
        });
      }, simSpeed);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSimulating, simSteps, simSpeed, onLocationUpdate, activeOrderId, riderId]);

  const handleApplyManual = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng) && onLocationUpdate) {
      const pos = { lat, lng, heading: 0 };
      onLocationUpdate(pos);
      emitSocketLocation(pos);
    }
  };

  const handleSelectPreset = (preset) => {
    setCustomLat(preset.lat);
    setCustomLng(preset.lng);
    const pos = { lat: preset.lat, lng: preset.lng, heading: 0 };
    if (onLocationUpdate) {
      onLocationUpdate(pos);
    }
    emitSocketLocation(pos);
  };

  const progress =
    simSteps.length > 1
      ? Math.round((currentStepIndex / (simSteps.length - 1)) * 100)
      : 0;

  const currentHeading = simSteps[currentStepIndex]?.heading || 0;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-[99999] flex flex-col items-end pointer-events-auto select-none">
      {/* Drawer Card */}
      {isOpen && (
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-2 border-amber-500 rounded-2xl p-4 w-76 sm:w-84 shadow-2xl mb-2.5 transition-all animate-in zoom-in-95 duration-150 text-stone-900 dark:text-white">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-neutral-800 mb-3">
            <div className="flex items-center gap-1.5 font-['Oswald',sans-serif] text-sm font-bold uppercase tracking-wider text-amber-500">
              <FaCompass className="text-amber-500 animate-spin-slow" />
              <span>Road-Snapped GPS Sim</span>
            </div>
            <button
              type="button"
              onClick={handleResetToStore}
              className="text-[10px] bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-amber-400 active:scale-95 flex items-center gap-1"
              title="Reset coordinates to Store HQ"
            >
              <FaStore className="text-[9px]" />
              <span>Reset HQ</span>
            </button>
          </div>
          {/* Connection Status & Target Order ID Header */}
          <div className="mb-2.5 p-2 rounded-xl bg-stone-100 dark:bg-neutral-800/80 border border-stone-200 dark:border-neutral-700/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSocketConnected ? "bg-emerald-500 animate-ping" : "bg-rose-500"}`} />
              <span className={`font-mono text-[10px] font-bold ${isSocketConnected ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                {isSocketConnected ? "Socket Live" : "Socket Disconnected"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-stone-500 dark:text-neutral-400 font-mono">Order #</span>
              <input
                type="text"
                placeholder="Broadcast"
                value={simOrderId}
                onChange={(e) => setSimOrderId(e.target.value)}
                className="w-20 px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-md bg-white dark:bg-neutral-900 border border-stone-300 dark:border-neutral-600 text-stone-900 dark:text-white text-center focus:outline-hidden focus:border-amber-500"
                title="Leave blank to broadcast to all, or type specific Order ID (e.g. 105)"
              />
            </div>
          </div>
          {routeMeta && (
            <div className="mb-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <FaRoute />
                <span>{routeMeta.isRoadSnapped ? "Mapbox Roads" : "Direct Path"}</span>
              </span>
              <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                {routeMeta.distanceKm} km • {routeMeta.durationMins} mins
              </span>
            </div>
          )}

          {/* Quick Presets */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[10px] font-bold text-stone-500 dark:text-neutral-400 uppercase tracking-wider block">
              Quick Lahore Presets:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="py-1.5 px-2 rounded-lg bg-stone-100 dark:bg-neutral-800 hover:bg-amber-500/15 dark:hover:bg-amber-500/20 text-stone-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 text-[11px] font-semibold border border-stone-200 dark:border-neutral-700 text-left truncate transition-colors cursor-pointer"
                  title={`${p.name} (${p.lat}, ${p.lng})`}
                >
                  📍 {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Lat / Lng Inputs */}
          <form onSubmit={handleApplyManual} className="space-y-2 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-stone-500 dark:text-neutral-400 block mb-0.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-mono rounded-lg bg-stone-50 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-stone-500 dark:text-neutral-400 block mb-0.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-mono rounded-lg bg-stone-50 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-800 dark:text-neutral-200 font-bold text-xs rounded-lg border border-stone-300 dark:border-neutral-700 cursor-pointer transition-colors"
            >
              Apply Coordinates
            </button>
          </form>

          {/* Road-Snapped Simulation Controls */}
          <div className="pt-2 border-t border-stone-200 dark:border-neutral-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold flex items-center gap-1 text-stone-700 dark:text-neutral-300">
                <FaRoute className="text-amber-500 text-[11px]" />
                <span>Road Traversal:</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-neutral-800 font-bold text-amber-500">
                  🧭 {Math.round(currentHeading)}°
                </span>
                <span className="font-mono text-[11px] font-bold text-amber-500">
                  {progress}% {progress === 100 ? "🎯 Arrived" : ""}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Speed Selector */}
            <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <FaBolt className="text-amber-500" /> Speed:
              </span>
              <div className="flex gap-1">
                {[
                  { label: "1x", speed: 1200 },
                  { label: "2x", speed: 700 },
                  { label: "4x", speed: 300 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSimSpeed(s.speed)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                      simSpeed === s.speed
                        ? "bg-amber-500 text-neutral-950 border-amber-500"
                        : "bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-neutral-400 border-stone-300 dark:border-neutral-700"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sim Buttons */}
            <div className="flex gap-1.5 pt-1">
              {!isSimulating ? (
                <button
                  type="button"
                  disabled={isLoadingRoute}
                  onClick={simSteps.length > 0 && currentStepIndex > 0 ? handleResumeSimulation : handleStartSimulation}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs uppercase font-['Oswald',sans-serif] tracking-wider rounded-xl cursor-pointer transition-all border-none flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  {isLoadingRoute ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Fetching Road...</span>
                    </>
                  ) : (
                    <>
                      <FaPlay className="text-[10px]" />
                      <span>{simSteps.length > 0 && currentStepIndex > 0 ? "Resume Road" : "Start Road Ride"}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseSimulation}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-black text-xs uppercase font-['Oswald',sans-serif] tracking-wider rounded-xl cursor-pointer transition-all border-none flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FaPause className="text-[10px]" />
                  <span>Pause Ride</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetToStore}
                className="px-3 py-2 bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-300 text-xs rounded-xl border border-stone-300 dark:border-neutral-700 cursor-pointer transition-colors"
                title="Reset to Store"
              >
                <FaRedo className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="py-2.5 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 cursor-pointer border-2 border-white dark:border-neutral-800 active:scale-95 transition-all ring-4 ring-amber-500/20"
      >
        <span>🛣️ ROAD GPS SIMULATOR</span>
        {isOpen ? <FaChevronDown className="text-xs" /> : <FaChevronUp className="text-xs" />}
      </button>
    </div>
  );
}
