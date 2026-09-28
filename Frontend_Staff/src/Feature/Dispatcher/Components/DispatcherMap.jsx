// import React, { useRef, useMemo } from "react";
// import Map, { Marker } from "react-map-gl";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import "mapbox-gl/dist/mapbox-gl.css";

// export default function DispatcherMap({
//   riders = [],
//   MAPBOX_TOKEN,
//   viewState,
//   setViewState,
// }) {
//   const mapRef = useRef(null);

//   // Filter only active online/on-duty riders (Available, Busy, On Delivery) with valid coordinates
//   const activeGpsRiders = useMemo(() => {
//     return (riders || []).filter((r) => {
//       const status = String(r?.status || "").toLowerCase().trim();
//       const hasCoords =
//         r?.location &&
//         typeof r.location.lng === "number" &&
//         typeof r.location.lat === "number" &&
//         !isNaN(r.location.lng) &&
//         !isNaN(r.location.lat);
//       return status !== "offline" && hasCoords;
//     });
//   }, [riders]);

//   const handleMapLoad = (e) => {
//     if (e && e.target) {
//       e.target.resize();
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
//       {/* High-Contrast Card Header Bar */}
//       <div className="bg-stone-50 dark:bg-neutral-900/90 border-b border-stone-200 dark:border-neutral-800 px-4 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wider flex justify-between items-center">
//         <h3 className="m-0 font-['Oswald',sans-serif] uppercase flex items-center gap-2 text-stone-900 dark:text-neutral-100 font-bold">
//           <FaMapMarkerAlt className="text-amber-500 text-xs" />
//           <span>Real-time Rider Fleet Tracking</span>
//         </h3>
//         <span className="font-mono text-[11px] font-bold text-stone-600 dark:text-neutral-400">
//           {activeGpsRiders.length} Active GPS Units
//         </span>
//       </div>

//       {/* Mapbox Canvas - Permanent High-Visibility Streets Light Style */}
//       <div className="h-64 sm:h-80 w-full relative">
//         <Map
//           ref={mapRef}
//           {...viewState}
//           onMove={(evt) => setViewState(evt.viewState)}
//           mapStyle="mapbox://styles/mapbox/streets-v12"
//           mapboxAccessToken={MAPBOX_TOKEN}
//           style={{ width: "100%", height: "100%", position: "absolute" }}
//           onLoad={handleMapLoad}
//           attributionControl={false}
//         >
//           {activeGpsRiders.map((rider) => {
//             const isAvailable = String(rider.status).toLowerCase() === "available";

//             return (
//               <Marker
//                 key={rider.id}
//                 longitude={rider.location.lng}
//                 latitude={rider.location.lat}
//                 anchor="bottom"
//               >
//                 <div className="flex flex-col items-center cursor-pointer group">
//                   <div
//                     className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border-2 shadow-md flex items-center justify-center p-1.5 transition-transform group-hover:scale-110 ${
//                       isAvailable ? "border-emerald-500" : "border-amber-500"
//                     }`}
//                   >
//                     <img
//                       src="https://cdn-icons-png.flaticon.com/512/3198/3198336.png"
//                       className="w-full h-full object-contain"
//                       alt="Rider Marker"
//                     />
//                   </div>
//                   <div className="bg-stone-900/95 text-white px-2 py-0.5 rounded-md text-[10px] font-bold mt-1 shadow-xs border border-white/10 whitespace-nowrap font-mono flex items-center gap-1">
//                     <span
//                       className={`w-1.5 h-1.5 rounded-full ${
//                         isAvailable ? "bg-emerald-400" : "bg-amber-400"
//                       }`}
//                     />
//                     <span>{rider.name}</span>
//                   </div>
//                 </div>
//               </Marker>
//             );
//           })}
//         </Map>
//       </div>
//     </div>
//   );
// }