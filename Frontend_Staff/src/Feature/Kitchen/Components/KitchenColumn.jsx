import React from "react";
import KitchenCard from "./KitchenCard";

export default function KitchenColumn({
  title,
  count = 0,
  orders = [],
  stage = "pending", // "pending" | "preparing" | "ready"
  accent = "amber",  // "amber" | "orange" | "emerald"
  emptyText = "No orders in this stage",
  onStatusChange,
  onPrint,
}) {
  const accentConfigs = {
    amber: {
      headerGradient:
        "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/5 border-b-2 border-amber-500 text-stone-900 dark:text-amber-400",
      badgeClass: "bg-amber-500 text-neutral-950",
      btnText: "Start Prep",
      btnClass: "amber",
      targetStatus: "preparing",
    },
    orange: {
      headerGradient:
        "bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-orange-500/5 border-b-2 border-orange-500 text-stone-900 dark:text-orange-400",
      badgeClass: "bg-orange-500 text-white",
      btnText: "Mark Ready",
      btnClass: "orange",
      targetStatus: "ready",
    },
    emerald: {
      headerGradient:
        "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 border-b-2 border-emerald-500 text-stone-900 dark:text-emerald-400",
      badgeClass: "bg-emerald-500 text-white",
      btnText: "Complete Order",
      btnClass: "emerald",
      targetStatus: "completed",
    },
  };

  const config = accentConfigs[accent] || accentConfigs.amber;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-stone-50 dark:bg-neutral-900/90 border border-stone-200/80 dark:border-neutral-800 shadow-xs overflow-hidden min-h-0 transition-colors duration-200">
      {/* High-Intensity Vibrant Column Stage Header (Hidden on mobile since mobile stage rail shows it) */}
      <div
        className={`hidden md:flex px-3.5 sm:px-4 py-2.5 sm:py-3 shrink-0 items-center justify-between font-['Oswald',sans-serif] ${config.headerGradient}`}
      >
        <span className="text-sm sm:text-base font-black tracking-wide uppercase truncate mr-2">
          {title}
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs shrink-0 ${config.badgeClass}`}
        >
          {count}
        </span>
      </div>

      {/* Internal Card Scroll Area with Touch Momentum */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-2.5 sm:space-y-3.5 min-h-0 overscroll-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800 hover:[&::-webkit-scrollbar-thumb]:bg-amber-500/50">
        {orders.length > 0 ? (
          orders.map((order) => {
            const isDelivery = order.type?.toLowerCase().includes("delivery");
            const isReadyStage = stage === "ready";

            return (
              <KitchenCard
                key={order.id}
                order={order}
                isReady={isReadyStage}
                btnText={
                  isReadyStage && isDelivery
                    ? "Awaiting Rider"
                    : config.btnText
                }
                btnClass={
                  isReadyStage && isDelivery ? "gray" : config.btnClass
                }
                onNext={
                  isReadyStage && isDelivery
                    ? undefined
                    : () => onStatusChange(order.id, config.targetStatus)
                }
                onPrint={() => onPrint && onPrint(order)}
              />
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-stone-400 dark:text-neutral-500 font-semibold select-none">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}
