import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMotorcycle, FaCommentDots, FaLayerGroup, FaRoute } from "react-icons/fa";
import { useStaffAuth } from "../../Context/AuthContext";
import { useRiderData } from "./hooks/useRiderData";

import NetworkStatus from "./Components/NetworkStatus";
import RiderHeader from "./Components/RiderHeader";
import StatusToggle from "./Components/StatusToggle";
import IncomingOrderModal from "./Components/IncomingOrderModal";
import ChatDrawer from "./Components/ChatDrawer";
import MapView from "./Components/MapView";
import DeliveryActions from "./Components/DeliveryActions";
import ActiveOrderCard from "./Components/ActiveOrderCard";
import BatchOrdersView from "./Components/BatchOrdersView";
import RiderOrderDetailModal from "./Components/RiderOrderDetailModal";
import ShiftSummary from "./Components/ShiftSummary";
import DeliveryHistory from "./Components/DeliveryHistory";
import BottomStats from "./Components/BottomStats";
import RiderGpsSimulator from "./Components/RiderGpsSimulator";

export default function RiderPortal() {
  const navigate = useNavigate();
  const { logout } = useStaffAuth();
  const {
    riderSession,
    isOnline,
    handleToggleStatus,
    isTogglingStatus,
    activeOrders,
    proximityOrders,
    selectedOrder,
    selectedOrderId,
    setSelectedOrderId,
    currentOrder,
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
  } = useRiderData();

  const [activeTab, setActiveTab] = useState("batch"); // "batch" | "map"
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailStopNumber, setDetailStopNumber] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenDetails = (order, stopNum) => {
    setDetailOrder(order);
    setDetailStopNumber(stopNum || 1);
    setIsDetailModalOpen(true);
  };

  const handleNavigateToOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setActiveTab("map");
  };

  const handleLogout = async () => {
    if (isOnline) {
      handleToggleStatus();
    }
    logout();
    navigate("/login", { replace: true, state: {} });
  };

  if (!riderSession) return null;

  const hasActiveDeliveries = isOnline && (activeOrders.length > 0 || selectedOrder);
  const targetOrder = selectedOrder || currentOrder;
  const currentStopIndex = proximityOrders.findIndex(
    (o) => String(o.id) === String(targetOrder?.id)
  );

  return (
    <div className="flex justify-center bg-stone-100 dark:bg-neutral-950 min-h-screen text-stone-900 dark:text-neutral-100 font-sans transition-colors">
      {/* Mobile Frame Container (Max 480px) */}
      <div className="w-full max-w-[480px] bg-white dark:bg-neutral-900 border-x border-stone-200 dark:border-neutral-800 flex flex-col relative overflow-hidden h-screen shadow-xl">
        {/* 1. Network Status Banner */}
        <NetworkStatus />

        {/* 2. Top Navigation Bar */}
        <RiderHeader
          riderName={riderSession.name}
          onLogout={handleLogout}
        />

        {/* 3. On-Duty Status Switcher */}
        <StatusToggle
          isOnline={isOnline}
          onToggle={handleToggleStatus}
          isToggling={isTogglingStatus}
        />

        {/* 4. Main Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 overscroll-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-0">
          {/* OFFLINE EMPTY STATE */}
          {!isOnline && (
            <div className="h-[55vh] flex flex-col items-center justify-center text-center text-stone-400 dark:text-neutral-500">
              <FaMotorcycle className="text-5xl opacity-30 mb-3 text-stone-400" />
              <h2 className="text-xl font-bold font-['Oswald',sans-serif] uppercase tracking-wide text-stone-700 dark:text-neutral-300 m-0 mb-1">
                You are Offline
              </h2>
              <p className="text-xs max-w-xs m-0">
                Toggle your duty status to Online to start receiving delivery orders.
              </p>
            </div>
          )}

          {/* ONLINE & SEARCHING STATE */}
          {isOnline && !hasActiveDeliveries && (
            <div className="space-y-4">
              <div className="py-8 flex flex-col items-center justify-center text-center bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xs">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-2xl mb-3 animate-pulse border border-emerald-500/30">
                  <FaMotorcycle />
                </div>
                <h2 className="text-lg font-bold font-['Oswald',sans-serif] uppercase tracking-wide text-stone-900 dark:text-white m-0 mb-1">
                  Searching for Orders...
                </h2>
                <p className="text-xs text-stone-500 dark:text-neutral-400 m-0">
                  Listening for dispatch assignments in your area
                </p>
              </div>

              {/* Shift Summary & Delivery Logs */}
              <ShiftSummary stats={stats} />
              <DeliveryHistory history={history} />
            </div>
          )}

          {/* ACTIVE MULTI-STOP DELIVERY VIEW */}
          {hasActiveDeliveries && targetOrder && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Top View Toggle: Batch Orders vs Map Navigation */}
              <div className="flex bg-stone-100 dark:bg-neutral-800/80 border border-stone-200 dark:border-neutral-700/60 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("batch")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black font-['Oswald',sans-serif] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                    activeTab === "batch"
                      ? "bg-amber-500 text-neutral-950 shadow-xs"
                      : "text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  <FaLayerGroup className="text-xs" />
                  <span>Batch Orders ({proximityOrders.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("map")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black font-['Oswald',sans-serif] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                    activeTab === "map"
                      ? "bg-amber-500 text-neutral-950 shadow-xs"
                      : "text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  <FaRoute className="text-xs" />
                  <span>Map & Route</span>
                </button>
              </div>

              {/* TAB 1: BATCH ORDERS CARDS VIEW */}
              {activeTab === "batch" && (
                <BatchOrdersView
                  orders={proximityOrders}
                  selectedOrderId={selectedOrderId}
                  onSelectOrder={handleNavigateToOrder}
                  onOpenDetails={handleOpenDetails}
                  onComplete={(id) => completeDelivery(id)}
                  onCancel={(id) => declineOrder(id)}
                  isCompleting={isCompletingDelivery}
                />
              )}

              {/* TAB 2: MAP & NAVIGATION VIEW */}
              {activeTab === "map" && (
                <div className="space-y-4">
                  {/* Multi-Stop Batch Navigation Switcher Bar */}
                  {proximityOrders.length > 1 && (
                    <div className="bg-stone-50 dark:bg-neutral-950/90 border border-stone-200 dark:border-neutral-800 p-2.5 rounded-2xl shadow-xs">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[11px] font-black uppercase tracking-wider font-['Oswald',sans-serif] text-stone-700 dark:text-neutral-300">
                          Active Stops ({proximityOrders.length})
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                          Click stop to route
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {proximityOrders.map((ord, idx) => {
                          const isSelected = String(ord.id) === String(targetOrder.id);
                          const isNearest = idx === 0;

                          return (
                            <button
                              key={ord.id}
                              type="button"
                              onClick={() => setSelectedOrderId(ord.id)}
                              className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                                isSelected
                                  ? "bg-amber-500 text-neutral-950 border-amber-600 shadow-sm ring-2 ring-amber-500/40"
                                  : "bg-white dark:bg-neutral-900 text-stone-800 dark:text-neutral-200 border-stone-200 dark:border-neutral-800 hover:border-amber-400"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-black font-['Oswald',sans-serif]">
                                <span>
                                  STOP {idx + 1} {isNearest ? "• NEAREST" : ""}
                                </span>
                                <span className="font-mono text-[9px]">
                                  {ord.distanceKm || "..."}
                                </span>
                              </div>
                              <div className="text-xs font-bold truncate mt-0.5">
                                #{ord.id} - {ord.customer}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Map View & Chat Overlay Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="absolute top-3 right-3 z-30 bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform border-none cursor-pointer text-sm"
                      title="Chat with customer"
                    >
                      <FaCommentDots />
                    </button>
                    <MapView
                      viewState={viewState}
                      setViewState={setViewState}
                      routePath={routePath}
                      riderLocation={riderLocation}
                      currentOrder={targetOrder}
                      activeOrders={proximityOrders}
                      selectedOrder={targetOrder}
                      onSelectOrder={setSelectedOrderId}
                      MAPBOX_TOKEN={MAPBOX_TOKEN}
                    />
                  </div>

                  {/* Delivery Actions (AI ETA & Proof of Delivery) */}
                  <DeliveryActions
                    isArrived={isArrived}
                    aiData={aiData}
                    distance={distance}
                    orderStatus={orderStatus}
                    handlePhotoUpload={handlePhotoUpload}
                    deliveryPhoto={deliveryPhoto}
                    completeDelivery={() => completeDelivery(targetOrder.id)}
                  />

                  {/* Active Order Card for Focused Stop */}
                  <ActiveOrderCard
                    key={targetOrder.id}
                    order={targetOrder}
                    stopNumber={currentStopIndex !== -1 ? currentStopIndex + 1 : 1}
                    totalStops={proximityOrders.length || 1}
                    onComplete={(id) => completeDelivery(id)}
                    onCancel={(id) => declineOrder(id)}
                    isCompleting={isCompletingDelivery}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        {/* 5. Sticky Bottom Stats Bar */}
        <BottomStats stats={stats} />

        {/* 6. Modals & Drawers */}
        {incomingOrderDetails && (
          <IncomingOrderModal
            order={incomingOrderDetails}
            onAccept={acceptOrder}
            onDecline={declineOrder}
          />
        )}

        {targetOrder && isChatOpen && (
          <ChatDrawer
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            customerName={targetOrder.customer}
          />
        )}

        {/* 7. Order Details Modal */}
        <RiderOrderDetailModal
          order={detailOrder}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          stopNumber={detailStopNumber}
          totalStops={proximityOrders.length}
          onNavigate={handleNavigateToOrder}
          onComplete={(id) => completeDelivery(id)}
          onCancel={(id) => declineOrder(id)}
          isCompleting={isCompletingDelivery}
        />
      </div>

      {/* 7. Developer GPS Simulator Widget (Easily Removable) */}
      <RiderGpsSimulator
        currentLocation={riderLocation}
        destination={
          targetOrder
            ? {
                lat:
                  targetOrder.targetLat ||
                  targetOrder.customer_lat ||
                  31.4826,
                lng:
                  targetOrder.targetLng ||
                  targetOrder.customer_lng ||
                  74.3256,
              }
            : { lat: 31.4826, lng: 74.3256 }
        }
        activeOrderId={targetOrder?.id}
        riderId={riderSession?.id}
        mapboxToken={MAPBOX_TOKEN}
        onLocationUpdate={setManualRiderLocation}
      />
    </div>
  );
}
