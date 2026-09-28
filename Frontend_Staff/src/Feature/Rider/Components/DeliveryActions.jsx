import React from "react";
import { FaBrain, FaRoute, FaCamera, FaCheckCircle } from "react-icons/fa";

export default function DeliveryActions({
  isArrived,
  aiData,
  distance,
  orderStatus,
  handlePhotoUpload,
  deliveryPhoto,
  completeDelivery,
}) {
  return (
    <div
      className={`bg-white dark:bg-neutral-900 border rounded-2xl p-4 mb-4 shadow-xs transition-all ${
        isArrived
          ? "border-emerald-500 ring-2 ring-emerald-500/30"
          : "border-stone-200 dark:border-neutral-800"
      }`}
    >
      {/* Metrics Row: AI Traffic ETA & Road Distance */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3 rounded-xl text-center">
          <div className="text-[10px] font-bold flex items-center justify-center gap-1.5 uppercase text-purple-600 dark:text-purple-400">
            <FaBrain className="text-[11px]" />
            <span>AI Traffic ETA</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white mt-1 font-['Oswald',sans-serif]">
            {isArrived ? "Arrived" : aiData.eta}
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 p-3 rounded-xl text-center">
          <div className="text-[10px] font-bold flex items-center justify-center gap-1.5 uppercase text-sky-600 dark:text-sky-400">
            <FaRoute className="text-[11px]" />
            <span>Road Distance</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white mt-1 font-['Oswald',sans-serif]">
            {isArrived ? "0 km" : aiData.roadDistance}
          </div>
        </div>
      </div>

      {/* Geofence Distance Indicator */}
      <div className="text-[11px] font-mono font-bold text-stone-500 dark:text-neutral-400 text-center mb-3 uppercase">
        Geofence Distance: {distance !== null ? `${distance}m` : "..."}
      </div>

      {/* Arrived: Proof of Delivery Capture */}
      {orderStatus === "arrived" && (
        <label className="min-h-[44px] px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-center rounded-xl cursor-pointer font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
          <FaCamera className="text-sm" />
          <span>Take Proof of Delivery</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </label>
      )}

      {/* Photo Captured: Complete Delivery Confirmation */}
      {orderStatus === "photo_captured" && (
        <div className="text-center pt-1">
          {deliveryPhoto && (
            <img
              src={deliveryPhoto}
              alt="Proof of Delivery"
              className="w-24 h-24 rounded-xl object-cover mx-auto mb-3 p-1 bg-stone-100 dark:bg-neutral-800 border border-stone-300 dark:border-neutral-700 shadow-xs"
            />
          )}
          <button
            type="button"
            onClick={completeDelivery}
            className="w-full min-h-[44px] p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider cursor-pointer flex justify-center items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <FaCheckCircle className="text-sm" />
            <span>Confirm Delivery</span>
          </button>
        </div>
      )}
    </div>
  );
}