import React, { useState } from "react";
import KitchenHeader from "./Components/KitchenHeader";
import KitchenColumn from "./Components/KitchenColumn";
import PrintModal from "./Components/PrintModal";
import { useKitchenOrders } from "./hooks/useKitchenOrders";

export default function KitchenDashboard() {
  const {
    newOrders,
    prepOrders,
    readyOrders,
    activeFilter,
    setActiveFilter,
    updateStatus,
    printOrder,
    setPrintOrder,
    isRefetching,
    refetch,
  } = useKitchenOrders();

  // Mobile Active Stage Tab ("pending" | "preparing" | "ready")
  const [mobileStage, setMobileStage] = useState("pending");

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-100 dark:bg-neutral-950 text-stone-900 dark:text-neutral-100 transition-colors duration-200 select-none">
      {/* 1. Ultra-Clean Single-Tier KDS Header */}
      <KitchenHeader
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        isRefetching={isRefetching}
        onRefresh={refetch}
      />

      {/* 2. Sleek iOS-Style Mobile Stage Segmented Rail (< 768px) */}
      <div className="md:hidden shrink-0 mx-3 my-2">
        <div className="bg-stone-200/70 dark:bg-neutral-900 p-1 rounded-xl flex items-center gap-1 shadow-inner border border-stone-200/80 dark:border-neutral-800">
          {/* Tab 1: New */}
          <button
            type="button"
            onClick={() => setMobileStage("pending")}
            className={`py-2 rounded-lg flex-1 flex items-center justify-center gap-1.5 font-['Oswald',sans-serif] text-xs uppercase tracking-wide transition-all border-none cursor-pointer ${
              mobileStage === "pending"
                ? "bg-amber-500 text-neutral-950 font-black shadow-xs"
                : "bg-transparent text-stone-600 dark:text-neutral-400 font-bold hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <span>New</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                mobileStage === "pending"
                  ? "bg-neutral-950/20 text-neutral-950"
                  : "bg-stone-300/80 dark:bg-neutral-800 text-stone-800 dark:text-neutral-200"
              }`}
            >
              {newOrders.length}
            </span>
          </button>

          {/* Tab 2: Prep */}
          <button
            type="button"
            onClick={() => setMobileStage("preparing")}
            className={`py-2 rounded-lg flex-1 flex items-center justify-center gap-1.5 font-['Oswald',sans-serif] text-xs uppercase tracking-wide transition-all border-none cursor-pointer ${
              mobileStage === "preparing"
                ? "bg-orange-500 text-white font-black shadow-xs"
                : "bg-transparent text-stone-600 dark:text-neutral-400 font-bold hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <span>Prep</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                mobileStage === "preparing"
                  ? "bg-white/25 text-white"
                  : "bg-stone-300/80 dark:bg-neutral-800 text-stone-800 dark:text-neutral-200"
              }`}
            >
              {prepOrders.length}
            </span>
          </button>

          {/* Tab 3: Ready */}
          <button
            type="button"
            onClick={() => setMobileStage("ready")}
            className={`py-2 rounded-lg flex-1 flex items-center justify-center gap-1.5 font-['Oswald',sans-serif] text-xs uppercase tracking-wide transition-all border-none cursor-pointer ${
              mobileStage === "ready"
                ? "bg-emerald-500 text-white font-black shadow-xs"
                : "bg-transparent text-stone-600 dark:text-neutral-400 font-bold hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <span>Ready</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                mobileStage === "ready"
                  ? "bg-white/25 text-white"
                  : "bg-stone-300/80 dark:bg-neutral-800 text-stone-800 dark:text-neutral-200"
              }`}
            >
              {readyOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Kanban Stage Columns Container */}
      <main className="flex-1 px-3 pb-3 sm:p-4 lg:p-6 overflow-hidden min-h-0">
        {/* Desktop & Tablet 3-Column Grid View (>= 768px) */}
        <div className="hidden md:grid md:grid-cols-3 gap-3.5 lg:gap-6 h-full min-h-0">
          {/* Column 1: New Orders (Pending) */}
          <div className="h-full min-h-0 flex flex-col">
            <KitchenColumn
              title="New Orders"
              count={newOrders.length}
              orders={newOrders}
              stage="pending"
              accent="amber"
              emptyText="No new pending orders"
              onStatusChange={updateStatus}
              onPrint={setPrintOrder}
            />
          </div>

          {/* Column 2: Preparing & Cooking */}
          <div className="h-full min-h-0 flex flex-col">
            <KitchenColumn
              title="Preparing & Cooking"
              count={prepOrders.length}
              orders={prepOrders}
              stage="preparing"
              accent="orange"
              emptyText="No orders currently in prep"
              onStatusChange={updateStatus}
              onPrint={setPrintOrder}
            />
          </div>

          {/* Column 3: Ready to Serve / Dispatch */}
          <div className="h-full min-h-0 flex flex-col">
            <KitchenColumn
              title="Ready to Serve"
              count={readyOrders.length}
              orders={readyOrders}
              stage="ready"
              accent="emerald"
              emptyText="No orders waiting for pickup"
              onStatusChange={updateStatus}
              onPrint={setPrintOrder}
            />
          </div>
        </div>

        {/* Mobile Single-Column Active Stage View (< 768px) */}
        <div className="md:hidden h-full min-h-0 flex flex-col">
          {mobileStage === "pending" && (
            <KitchenColumn
              title="New Orders"
              count={newOrders.length}
              orders={newOrders}
              stage="pending"
              accent="amber"
              emptyText="No new pending orders"
              onStatusChange={updateStatus}
              onPrint={setPrintOrder}
            />
          )}

          {mobileStage === "preparing" && (
            <KitchenColumn
              title="Preparing & Cooking"
              count={prepOrders.length}
              orders={prepOrders}
              stage="preparing"
              accent="orange"
              emptyText="No orders currently in prep"
              onStatusChange={updateStatus}
              onPrint={setPrintOrder}
            />
          )}

          {mobileStage === "ready" && (
            <KitchenColumn
              title="Ready to Serve"
              count={readyOrders.length}
              orders={readyOrders}
              stage="ready"
              accent="emerald"
              emptyText="No orders waiting for pickup"
              onStatusChange={updateStatus}
              onPrint={setPrintOrder}
            />
          )}
        </div>
      </main>

      {/* 4. Kitchen Order Ticket (KOT) Print Modal */}
      {printOrder && (
        <PrintModal
          printOrder={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
}
