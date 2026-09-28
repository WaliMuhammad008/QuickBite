import React, { useState } from "react";
import DispatchHeader from "./Components/DispatchHeader";
import DispatchStats from "./Components/DispatchStats";
import AutoPilotControlBar from "./Components/AutoPilotControlBar";
// import DispatcherMap from "./Components/DispatcherMap";
import ReadyOrdersList from "./Components/ReadyOrdersList";
import ActiveRidersList from "./Components/ActiveRidersList";
import ActiveDeliveries from "./Components/ActiveDeliveries";
import AssignmentBar from "./Components/AssignmentBar";
import { useDispatcherData } from "./hooks/useDispatcherData";

export default function DispatchPortal() {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const [mobileTab, setMobileTab] = useState("orders"); // "orders" | "riders" | "trips"

  const {
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
    isAssigning,
    refetchAll,
    isRefreshing,
  } = useDispatcherData();

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-neutral-950 text-stone-900 dark:text-neutral-100 font-sans transition-colors flex flex-col">
      {/* 1. Dispatch Top Navigation Bar */}
      <DispatchHeader onRefresh={refetchAll} isRefreshing={isRefreshing} />

      {/* 2. Key Metrics Stats Grid (2x2 Mobile, 4x1 Desktop) */}
      <DispatchStats
        readyCount={readyOrders.length}
        freeRiders={freeRidersCount}
        avgDeliveryTime={24}
        completedToday={completedCount}
      />

      {/* 3. Real-Time Rider GPS Map */}
      {/* <div className="px-3.5 sm:px-6 lg:px-8 py-2">
        <DispatcherMap
          riders={riders}
          MAPBOX_TOKEN={MAPBOX_TOKEN}
          viewState={mapViewState}
          setViewState={setMapViewState}
        />
      </div> */}

      {/* 4. Auto-Pilot & Smart Batching Controls */}
      <AutoPilotControlBar
        batchRadius={batchRadius}
        setBatchRadius={setBatchRadius}
        isAutoPilotOn={isAutoPilotOn}
        setIsAutoPilotOn={setIsAutoPilotOn}
        autoPilotMinutes={autoPilotMinutes}
        setAutoPilotMinutes={setAutoPilotMinutes}
        timerDisplay={timerDisplay}
        onSmartBatch={handleSmartBatching}
      />

      {/* 5. Mobile Stage Tab Switcher (< 768px) */}
      <div className="md:hidden px-3.5 py-2.5">
        <div className="bg-stone-200/80 dark:bg-neutral-900 p-1 rounded-xl flex items-center gap-1 shadow-inner border border-stone-200/80 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setMobileTab("orders")}
            className={`py-2 rounded-lg flex-1 flex items-center justify-center gap-1.5 font-['Oswald',sans-serif] text-xs uppercase tracking-wide transition-all border-none cursor-pointer ${
              mobileTab === "orders"
                ? "bg-amber-500 text-neutral-950 font-black shadow-xs"
                : "bg-transparent text-stone-600 dark:text-neutral-400 font-bold"
            }`}
          >
            <span>Orders</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-neutral-950/20 text-neutral-950 dark:bg-neutral-800 dark:text-neutral-200">
              {readyOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("riders")}
            className={`py-2 rounded-lg flex-1 flex items-center justify-center gap-1.5 font-['Oswald',sans-serif] text-xs uppercase tracking-wide transition-all border-none cursor-pointer ${
              mobileTab === "riders"
                ? "bg-emerald-500 text-white font-black shadow-xs"
                : "bg-transparent text-stone-600 dark:text-neutral-400 font-bold"
            }`}
          >
            <span>Riders</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-white/20 text-white dark:bg-neutral-800 dark:text-neutral-200">
              {riders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("trips")}
            className={`py-2 rounded-lg flex-1 flex items-center justify-center gap-1.5 font-['Oswald',sans-serif] text-xs uppercase tracking-wide transition-all border-none cursor-pointer ${
              mobileTab === "trips"
                ? "bg-blue-500 text-white font-black shadow-xs"
                : "bg-transparent text-stone-600 dark:text-neutral-400 font-bold"
            }`}
          >
            <span>Trips</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-white/20 text-white dark:bg-neutral-800 dark:text-neutral-200">
              {activeTrips.length}
            </span>
          </button>
        </div>
      </div>

      {/* 6. 3-Column Kanban Board (Desktop/Tablet) or Single-View (Mobile) */}
      <main className="flex-1 px-3.5 sm:px-6 lg:px-8 pb-8">
        {/* Desktop & Tablet 3-Column View (>= 768px) */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-6 h-[560px]">
          <ReadyOrdersList
            orders={readyOrders}
            selectedId={selectedOrder?.id}
            onSelect={setSelectedOrder}
          />
          <ActiveRidersList
            riders={riders}
            selectedId={selectedRider?.id}
            onSelect={setSelectedRider}
          />
          <ActiveDeliveries
            activeTrips={activeTrips}
            onComplete={handleCompleteTrip}
          />
        </div>

        {/* Mobile Single Tab View (< 768px) */}
        <div className="md:hidden h-[500px]">
          {mobileTab === "orders" && (
            <ReadyOrdersList
              orders={readyOrders}
              selectedId={selectedOrder?.id}
              onSelect={setSelectedOrder}
            />
          )}
          {mobileTab === "riders" && (
            <ActiveRidersList
              riders={riders}
              selectedId={selectedRider?.id}
              onSelect={setSelectedRider}
            />
          )}
          {mobileTab === "trips" && (
            <ActiveDeliveries
              activeTrips={activeTrips}
              onComplete={handleCompleteTrip}
            />
          )}
        </div>
      </main>

      {/* 7. Bottom Floating Assignment Bar */}
      <AssignmentBar
        order={selectedOrder}
        rider={selectedRider}
        onConfirm={handleAssign}
        onCancel={() => {
          setSelectedOrder(null);
          setSelectedRider(null);
        }}
      />
    </div>
  );
}
