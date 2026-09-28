import React, { useState, useEffect, useRef, useCallback } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  FaStore,
  FaSearch,
  FaCrosshairs,
  FaSpinner,
  FaMapMarkerAlt,
  FaCheck,
} from "react-icons/fa";

export default function RestaurantLocationPicker({
  storeLat,
  storeLng,
  storeAddress,
  onLocationChange,
}) {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const mapRef = useRef(null);

  const initialLat = parseFloat(storeLat) || 31.5204;
  const initialLng = parseFloat(storeLng) || 74.3587;

  const [coords, setCoords] = useState({
    lat: initialLat,
    lng: initialLng,
  });

  const [viewState, setViewState] = useState({
    latitude: initialLat,
    longitude: initialLng,
    zoom: 15,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState("");
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Sync if external props change
  useEffect(() => {
    const pLat = parseFloat(storeLat);
    const pLng = parseFloat(storeLng);
    if (!isNaN(pLat) && !isNaN(pLng) && (pLat !== coords.lat || pLng !== coords.lng)) {
      setCoords({ lat: pLat, lng: pLng });
      setViewState((prev) => ({
        ...prev,
        latitude: pLat,
        longitude: pLng,
      }));
    }
  }, [storeLat, storeLng]);

  // High precision reverse geocode using Nominatim & Mapbox
  const performReverseGeocode = useCallback(
    async (lat, lng) => {
      setIsReverseGeocoding(true);
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
        const res = await fetch(nominatimUrl, {
          headers: { "Accept-Language": "en" },
        });
        const data = await res.json();
        if (data?.display_name) {
          const addr = data.address || {};
          const parts = [
            addr.building || addr.amenity || addr.shop,
            addr.road || addr.street,
            addr.suburb || addr.neighbourhood || addr.city_district,
            addr.city || addr.town || "Lahore",
          ].filter(Boolean);

          const fullText = parts.length > 0 ? parts.join(", ") : data.display_name;
          setDetectedAddress(fullText);
          return fullText;
        }
      } catch (err) {
        console.warn("Reverse geocode warning:", err);
      } finally {
        setIsReverseGeocoding(false);
      }
      return "";
    },
    []
  );

  const handleUpdateCoordinates = (newLat, newLng, syncAddress = true) => {
    const formattedLat = parseFloat(Number(newLat).toFixed(7));
    const formattedLng = parseFloat(Number(newLng).toFixed(7));

    setCoords({ lat: formattedLat, lng: formattedLng });
    setViewState((prev) => ({
      ...prev,
      latitude: formattedLat,
      longitude: formattedLng,
    }));

    if (syncAddress) {
      performReverseGeocode(formattedLat, formattedLng).then((addr) => {
        onLocationChange({
          lat: formattedLat.toString(),
          lng: formattedLng.toString(),
          address: addr || storeAddress,
        });
      });
    } else {
      onLocationChange({
        lat: formattedLat.toString(),
        lng: formattedLng.toString(),
      });
    }
  };

  // Drag Marker End
  const handleMarkerDragEnd = (e) => {
    if (e.lngLat) {
      handleUpdateCoordinates(e.lngLat.lat, e.lngLat.lng, true);
    }
  };

  // Click on Map
  const handleMapClick = (e) => {
    if (e.lngLat) {
      handleUpdateCoordinates(e.lngLat.lat, e.lngLat.lng, true);
    }
  };

  // Search Address Geocoding
  const handleSearchAddress = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // 1. Mapbox Geocoding (if token available)
      if (MAPBOX_TOKEN) {
        const mbUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery.trim()
        )}.json?access_token=${MAPBOX_TOKEN}&country=pk&limit=1`;
        const res = await fetch(mbUrl);
        const data = await res.json();
        if (data?.features?.length > 0) {
          const [lng, lat] = data.features[0].center;
          handleUpdateCoordinates(lat, lng, false);
          onLocationChange({
            lat: lat.toFixed(7),
            lng: lng.toFixed(7),
            address: data.features[0].place_name,
          });
          setDetectedAddress(data.features[0].place_name);
          setIsSearching(false);
          return;
        }
      }

      // 2. OpenStreetMap Nominatim Geocoding fallback
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchQuery.trim()
      )}&format=json&limit=1&countrycodes=pk`;
      const res = await fetch(nomUrl, {
        headers: { "Accept-Language": "en" },
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        handleUpdateCoordinates(lat, lng, false);
        onLocationChange({
          lat: lat.toFixed(7),
          lng: lng.toFixed(7),
          address: data[0].display_name,
        });
        setDetectedAddress(data[0].display_name);
      }
    } catch (err) {
      console.error("Geocoding search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Current Device GPS Locator
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleUpdateCoordinates(lat, lng, true);
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn("GPS detection error:", err);
        alert("Could not access your location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3.5 bg-slate-50 dark:bg-[#111111] p-4 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch justify-between">
        <form onSubmit={handleSearchAddress} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or area on map (e.g. Gulberg, Lahore)..."
            className="w-full pl-9 pr-20 py-2 bg-white dark:bg-black/60 border border-slate-300 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium shadow-inner"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-[11px] rounded-lg border-none cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isSearching ? <FaSpinner className="animate-spin" /> : "Search"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isDetectingGps}
          className="px-3 py-2 bg-white dark:bg-black/60 border border-slate-300 dark:border-white/15 hover:border-amber-500 text-slate-700 dark:text-neutral-200 hover:text-amber-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0 shadow-xs"
          title="Detect Current Restaurant Location via GPS"
        >
          {isDetectingGps ? (
            <FaSpinner className="animate-spin text-amber-500" />
          ) : (
            <FaCrosshairs className="text-amber-500" />
          )}
          <span>Locate GPS</span>
        </button>
      </div>

      {/* Mapbox Canvas */}
      <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          cursor="crosshair"
        >
          <NavigationControl position="bottom-right" />

          {/* Restaurant Marker Pin */}
          <Marker
            latitude={coords.lat}
            longitude={coords.lng}
            anchor="bottom"
            draggable
            onDragEnd={handleMarkerDragEnd}
          >
            <div className="flex flex-col items-center group cursor-grab active:cursor-grabbing transform -translate-y-1 transition-transform">
              <div className="px-2 py-0.5 rounded-md bg-neutral-950 text-amber-400 text-[10px] font-black uppercase tracking-wider shadow-lg whitespace-nowrap mb-1 flex items-center gap-1 border border-amber-400/40">
                <FaStore className="text-[9px]" />
                <span>Store HQ</span>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xl border-2 border-white ring-2 ring-amber-500/50">
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping absolute -bottom-1" />
              </div>
            </div>
          </Marker>
        </Map>

        {/* Map Helper Hint Overlay */}
        <div className="absolute top-2.5 left-2.5 bg-neutral-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-[11px] text-white font-medium pointer-events-none shadow-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Click anywhere or drag marker to set Restaurant Location</span>
        </div>
      </div>

      {/* Coordinate Display & Manual Adjustment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-[10px] font-extrabold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Store Latitude (GPS Lat)
          </label>
          <input
            type="number"
            step="any"
            value={coords.lat}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) handleUpdateCoordinates(val, coords.lng, false);
            }}
            className="w-full px-3 py-2 bg-white dark:bg-black/60 border border-slate-300 dark:border-white/15 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Store Longitude (GPS Lng)
          </label>
          <input
            type="number"
            step="any"
            value={coords.lng}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) handleUpdateCoordinates(coords.lat, val, false);
            }}
            className="w-full px-3 py-2 bg-white dark:bg-black/60 border border-slate-300 dark:border-white/15 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Reverse Geocoded Address Alert / Option to Apply */}
      {detectedAddress && detectedAddress !== storeAddress && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex-1 min-w-0">
            <span className="font-bold text-amber-600 dark:text-amber-400 block text-[11px] uppercase tracking-wider">
              Detected Address from Pin:
            </span>
            <p className="truncate text-slate-700 dark:text-neutral-300 text-xs m-0">
              {detectedAddress}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onLocationChange({
                lat: coords.lat.toString(),
                lng: coords.lng.toString(),
                address: detectedAddress,
              });
            }}
            className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-[11px] rounded-lg border-none cursor-pointer flex items-center gap-1 shrink-0 transition-all active:scale-95"
          >
            <FaCheck className="text-[10px]" />
            <span>Apply as Address</span>
          </button>
        </div>
      )}
    </div>
  );
}
