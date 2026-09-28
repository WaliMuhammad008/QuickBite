import React, { useRef } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapView({
  viewState,
  setViewState,
  routePath = [],
  riderLocation,
  currentOrder,
  activeOrders = [],
  selectedOrder,
  onSelectOrder,
  MAPBOX_TOKEN,
}) {
  const mapRef = useRef(null);

  const handleMapLoad = (e) => {
    if (e && e.target) {
      e.target.resize();
    }
  };

  const stops = activeOrders.length > 0 ? activeOrders : currentOrder ? [currentOrder] : [];
  const activeSelectedId = selectedOrder?.id || currentOrder?.id;

  return (
    <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden mb-4 border border-stone-200 dark:border-neutral-800 shadow-xs relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        onLoad={handleMapLoad}
        attributionControl={false}
      >
        {/* Turn-by-Turn Route Polyline to Active Stop */}
        {routePath.length > 0 && (
          <Source
            id="route-source"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: routePath },
            }}
          >
            <Layer
              id="route-layer"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#F59E0B",
                "line-width": 5,
                "line-opacity": 0.9,
              }}
            />
          </Source>
        )}

        {/* Rider GPS Pin with Dynamic Bearing Rotation */}
        {riderLocation &&
          typeof riderLocation.lng === "number" &&
          typeof riderLocation.lat === "number" && (
            <Marker
              longitude={riderLocation.lng}
              latitude={riderLocation.lat}
              anchor="center"
            >
              <div
                className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border-2 border-amber-500 shadow-xl flex items-center justify-center p-1.5 transition-transform duration-300 ease-out hover:scale-110 relative"
                style={{
                  transform: `rotate(${riderLocation.heading || 0}deg)`,
                }}
                title={`Rider Heading: ${Math.round(riderLocation.heading || 0)}°`}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3198/3198336.png"
                  className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
                  alt="Rider Marker"
                />
              </div>
            </Marker>
          )}

        {/* All Customer Target Stop Pins */}
        {stops.map((ord, idx) => {
          const isSelected = String(ord.id) === String(activeSelectedId);
          const dropLng =
            typeof ord.targetLng === "number"
              ? ord.targetLng
              : typeof ord.customer_lng === "number"
              ? ord.customer_lng
              : parseFloat(ord.targetLng || ord.customer_lng || ord.longitude) || 74.3440;
          const dropLat =
            typeof ord.targetLat === "number"
              ? ord.targetLat
              : typeof ord.customer_lat === "number"
              ? ord.customer_lat
              : parseFloat(ord.targetLat || ord.customer_lat || ord.latitude) || 31.5102;

          return (
            <Marker
              key={ord.id || idx}
              longitude={dropLng}
              latitude={dropLat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent?.stopPropagation();
                if (onSelectOrder) onSelectOrder(ord.id);
              }}
            >
              <div
                className={`relative flex flex-col items-center cursor-pointer transition-transform ${
                  isSelected ? "scale-110 z-20" : "opacity-85 hover:opacity-100 z-10"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full bg-white flex items-center justify-center p-1.5 shadow-md border-2 ${
                    isSelected
                      ? "border-red-500 ring-4 ring-red-500/30 animate-bounce"
                      : "border-stone-500"
                  }`}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2776/2776067.png"
                    className="w-full h-full object-contain"
                    alt={`Stop #${idx + 1}`}
                  />
                </div>
                <span
                  className={`text-[10px] font-black font-['Oswald',sans-serif] px-1.5 py-0.2 rounded-md shadow-xs mt-0.5 whitespace-nowrap ${
                    isSelected
                      ? "bg-red-600 text-white"
                      : "bg-stone-800 text-stone-200"
                  }`}
                >
                  Stop {idx + 1}
                </span>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}