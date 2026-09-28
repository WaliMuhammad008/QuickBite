import React, { useState, useEffect } from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaExternalLinkAlt, FaStore, FaDirections, FaInfoCircle } from "react-icons/fa";
import { resolveCoordinatesToAddress } from "../../../utils/geoHydrator";

export default function OrderTrackerRiderCard({
  order,
  restaurantPhone,
  storeSettings = {},
  isTakeaway = false,
}) {
  const [hydratedAddress, setHydratedAddress] = useState(null);

  // For delivery: customer destination coordinates
  const customerLat = order?.customer_lat || order?.latitude || order?.target_lat;
  const customerLng = order?.customer_lng || order?.longitude || order?.target_lng;

  // For takeaway: restaurant pickup coordinates
  const storeLat = storeSettings?.store_lat || storeSettings?.restaurant_lat || customerLat;
  const storeLng = storeSettings?.store_lng || storeSettings?.restaurant_lng || customerLng;
  const storeAddress = storeSettings?.store_address || storeSettings?.restaurant_address || order?.customer_address || "Store Outlet Counter";

  useEffect(() => {
    if (!isTakeaway && customerLat && customerLng) {
      resolveCoordinatesToAddress(customerLat, customerLng, import.meta.env.VITE_MAPBOX_TOKEN).then(
        (res) => {
          if (res) setHydratedAddress(res);
        }
      );
    }
  }, [customerLat, customerLng, isTakeaway]);

  const house = order?.house_info || order?.house_no || "";
  const displayAddress =
    hydratedAddress && house
      ? `${house}, ${hydratedAddress.street}, ${hydratedAddress.area}`
      : order?.customer_address || (hydratedAddress ? `${hydratedAddress.street}, ${hydratedAddress.area}` : "Delivery Location");

  return (
    <div className="md:col-span-5 space-y-4">
      <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3.5">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            {isTakeaway ? (
              <FaStore className="text-amber-500 text-base" />
            ) : (
              <FaMapMarkerAlt className="text-amber-500 text-base" />
            )}
            <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0">
              {isTakeaway ? "Pickup Point" : "Delivery Coordinates"}
            </h3>
          </div>

          {isTakeaway ? (
            storeLat && storeLng ? (
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-amber-500/20">
                <FaStore className="text-[9px]" /> COUNTER PICKUP
              </span>
            ) : null
          ) : (
            customerLat && customerLng && (
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-500/20">
                <FaMapMarkerAlt className="text-[9px]" /> GPS PINNED
              </span>
            )
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-neutral-400 uppercase font-semibold">Recipient:</span>
            <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm m-0 mt-0.5">
              {order.customer_name || "Guest Customer"}
            </p>
          </div>

          <div>
            <span className="text-neutral-400 uppercase font-semibold">Contact:</span>
            <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm m-0 mt-0.5">
              {order.customer_mobile || "N/A"}
            </p>
          </div>

          <div>
            <span className="text-neutral-400 uppercase font-semibold">Fulfillment Type:</span>
            <p className="font-bold text-amber-500 dark:text-amber-400 uppercase text-xs sm:text-sm m-0 mt-0.5">
              {isTakeaway ? "Takeaway (Store Counter Pickup)" : (order.order_type || "Delivery")}
            </p>
          </div>

          {/* Location Details: Takeaway vs Delivery */}
          {isTakeaway ? (
            <div className="pt-1 border-t border-gray-100 dark:border-neutral-800/80 space-y-2">
              <div>
                <span className="text-neutral-400 uppercase font-semibold">Pickup Location:</span>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 m-0 mt-0.5 leading-relaxed">
                  {storeAddress}
                </p>
              </div>

              {storeLat && storeLng && (
                <div>
                  <span className="text-neutral-400 uppercase font-semibold block mb-0.5">Restaurant GPS Coordinates:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 font-mono text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      {parseFloat(storeLat).toFixed(4)}, {parseFloat(storeLng).toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${storeLat},${storeLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-neutral-950 text-[11px] font-bold font-['Oswald',sans-serif] uppercase tracking-wider transition-all no-underline shadow-xs active:scale-95"
                    >
                      <FaDirections className="text-xs" />
                      <span>Get Directions</span>
                      <FaExternalLinkAlt className="text-[8px]" />
                    </a>
                  </div>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2 leading-relaxed">
                <FaInfoCircle className="text-amber-500 shrink-0 mt-0.5" />
                <span>Show Order #{order.id} at the counter to receive your fresh meal.</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-neutral-400 uppercase font-semibold">Delivery Destination:</span>
              <p className="font-medium text-neutral-700 dark:text-neutral-300 m-0 mt-0.5 leading-relaxed">
                {displayAddress}
              </p>
              {customerLat && customerLng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${customerLat},${customerLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 mt-1 font-mono no-underline"
                >
                  <span>{parseFloat(customerLat).toFixed(4)}, {parseFloat(customerLng).toFixed(4)}</span>
                  <FaExternalLinkAlt className="text-[9px]" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Need Help Helpline Card */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
        <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 font-['Oswald',sans-serif]">
          Need Help With Your Order?
        </span>
        <a
          href={`tel:${restaurantPhone}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all no-underline shadow-xs active:scale-95"
        >
          <FaPhoneAlt className="text-[10px]" />
          <span>Call Support ({restaurantPhone})</span>
        </a>
      </div>
    </div>
  );
}
