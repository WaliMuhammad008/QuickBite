import React from "react";
import {
  LuBike,
  LuShoppingBag,
  LuUtensilsCrossed,
  LuStore,
  LuClock,
} from "react-icons/lu";
import AddressInputFields from "./AddressInputFields";
import CheckoutMapPicker from "./CheckoutMapPicker";
import SavedAddressSelector from "../../../../Components/Checkout/SavedAddressSelector";

export default function DeliveryAddressForm({
  orderType = "delivery",
  setOrderType,
  isQrScanned = false,
  session = {},
  baseDeliveryFee = 150,
  houseNo = "",
  setHouseNo,
  street = "",
  setStreet,
  area = "",
  setArea,
  tableNumber = "",
  setTableNumber,
  availableTables = [],
  errors = {},
  setErrors,
  onUseCurrentLocation,
  isDetectingGps = false,
  hasExactGps = false,
  mapCoords = { lat: 31.5204, lng: 74.3587 },
  onCoordinatesChange,
  deliveryDistanceKm = 0,
  maxDeliveryRadiusKm = 10,
  isOutOfDeliveryRadius = false,
}) {
  const isDineIn = isQrScanned || orderType === "dine_in";

  // ── 🍽️ SCENARIO 1: QR DINE-IN SESSION (LOCKED MODE) ──
  if (isDineIn) {
    return (
      <div className="bg-white dark:bg-neutral-900/90 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-md">
              <LuUtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Oswald',sans-serif] font-black text-lg sm:text-xl uppercase tracking-wide text-neutral-900 dark:text-white m-0">
                Dine-In 
              </h3>
            </div>
          </div>
          <span className="text-[10px] sm:text-xs font-mono font-bold bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full uppercase">
            {tableNumber || "1"}
          </span>
        </div>
      </div>
    );
  }

  // ── 🌐 SCENARIO 2: NORMAL ONLINE CUSTOMER (DELIVERY VS TAKEAWAY ONLY) ──
  return (
    <>
      {/* 1. Order Type Selection (Strictly 2 Tabs: Delivery & Takeaway) */}
      <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2 mb-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          1. Order Type
        </h3>

        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {[
            {
              id: "delivery",
              label: "Delivery",
              icon: <LuBike className="w-5 h-5 text-amber-500" />,
              sub: `+Rs ${baseDeliveryFee}`,
            },
            {
              id: "takeaway",
              label: "Takeaway",
              icon: <LuShoppingBag className="w-5 h-5 text-amber-500" />,
              sub: "Free Pickup",
            },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setOrderType(opt.id)}
              className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 sm:gap-2 ${
                orderType === opt.id
                  ? "bg-amber-400/10 dark:bg-amber-400/15 border-amber-500 text-neutral-950 dark:text-white font-bold ring-2 ring-amber-400/30 shadow-xs"
                  : "bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-amber-400"
              }`}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shadow-xs">
                {opt.icon}
              </div>
              <span className="font-['Oswald',sans-serif] text-sm sm:text-base uppercase tracking-wide truncate w-full">
                {opt.label}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 truncate w-full">
                {opt.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Address Details & Interactive Map (Delivery) */}
      {orderType === "delivery" && (
        <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              2. Delivery Address 
            </h3>
            <span className="text-[10px] sm:text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1  rounded-full font-bold">
              MAP PIN ENABLED
            </span>
          </div>

          {/* Interactive Mapbox Pin Picker */}
          <CheckoutMapPicker
            coordinates={mapCoords}
            onCoordinatesChange={onCoordinatesChange}
            isDetectingGps={isDetectingGps}
            onLocateMe={onUseCurrentLocation}
            hasExactGps={hasExactGps}
          />

          {/* 📏 Live Delivery Radius & Distance Status Indicator */}
          {deliveryDistanceKm > 0 && (
            <div
              className={`p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold border transition-all animate-fade-in ${
                isOutOfDeliveryRadius
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              <div className="flex items-center gap-2">
                
                <span>
                  Distance to restaurant:{" "}
                  <strong className="font-mono text-zinc-900 dark:text-white underline decoration-amber-500/50">
                    {deliveryDistanceKm.toFixed(1)} km
                  </strong>
                </span>
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full self-start sm:self-auto border ${
                  isOutOfDeliveryRadius
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}
              >
                {isOutOfDeliveryRadius
                  ? `Exceeds ${maxDeliveryRadiusKm} km limit`
                  : `Within ${maxDeliveryRadiusKm} km coverage`}
              </span>
            </div>
          )}

          {/* Saved Addresses 1-Click Picker */}
          <SavedAddressSelector
            onSelectAddress={(addr) => {
              if (addr.house_no) setHouseNo(addr.house_no);
              else if (addr.address_line) setHouseNo(addr.address_line);
              if (addr.street) setStreet(addr.street);
              if (addr.area) setArea(addr.area);
              const targetLat = addr.latitude ?? addr.lat;
              const targetLng = addr.longitude ?? addr.lng;
              if (targetLat && targetLng && onCoordinatesChange) {
                onCoordinatesChange({ lat: parseFloat(targetLat), lng: parseFloat(targetLng) });
              }
            }}
          />

          {/* Address Text Inputs */}
          <AddressInputFields
            houseNo={houseNo}
            setHouseNo={setHouseNo}
            street={street}
            setStreet={setStreet}
            area={area}
            setArea={setArea}
            errors={errors}
            setErrors={setErrors}
            onUseCurrentLocation={onUseCurrentLocation}
            isDetectingGps={isDetectingGps}
            hasExactGps={hasExactGps}
          />
        </div>
      )}

      {/* 2. Store Pickup Details (Takeaway) */}
      {orderType === "takeaway" && (
        <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              2. Pickup Details
            </h3>
            <span className="text-[10px] sm:text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full uppercase">
              Free Pickup
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-neutral-700/60 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <LuStore className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white m-0">
                 BigBite Restaurant 
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 m-0">
                  Abdali Chowk ,Sant Nagar, Lahore
                </p>
              </div>
            </div>

           
          </div>
        </div>
      )}
    </>
  );
}
