import React, { useState, useEffect, useRef, useCallback } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  FaCrosshairs,
  FaSpinner,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";
import { LAHORE_LOCALITY_COORDINATES } from "../../../../utils/geocode";

export default function CheckoutMapPicker({
  coordinates = { lat: 31.5204, lng: 74.3587 },
  onCoordinatesChange,
  isDetectingGps = false,
  onLocateMe,
  hasExactGps = false,
}) {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const mapRef = useRef(null);

  const [viewState, setViewState] = useState({
    latitude: coordinates?.lat || 31.5204,
    longitude: coordinates?.lng || 74.3587,
    zoom: 14,
  });

  const [markerPos, setMarkerPos] = useState({
    lat: coordinates?.lat || 31.5204,
    lng: coordinates?.lng || 74.3587,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [reverseAddress, setReverseAddress] = useState("");

  // Sync marker when external coordinates change
  useEffect(() => {
    if (coordinates?.lat && coordinates?.lng) {
      setMarkerPos({ lat: coordinates.lat, lng: coordinates.lng });
      setViewState((prev) => ({
        ...prev,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      }));
    }
  }, [coordinates?.lat, coordinates?.lng]);

  // High-precision Reverse Geocoding (Nominatim with addressdetails + Mapbox)
  const performReverseGeocode = useCallback(
    async (lat, lng) => {
      let detectedStreet = "";
      let detectedArea = "";
      let placeName = "";

      // 1. Proximity Match against Known Lahore Localities Dictionary
      for (const [, coords] of Object.entries(LAHORE_LOCALITY_COORDINATES)) {
        const dLat = Math.abs(coords.lat - lat);
        const dLng = Math.abs(coords.lng - lng);
        if (dLat < 0.008 && dLng < 0.008) {
          detectedArea = coords.name;
          break;
        }
      }

      // 2. OpenStreetMap Nominatim with addressdetails=1
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
        const nomRes = await fetch(nominatimUrl, {
          headers: { "Accept-Language": "en" },
        });
        const nomData = await nomRes.json();
        if (nomData?.address) {
          const addr = nomData.address;
          const road =
            addr.road ||
            addr.pedestrian ||
            addr.residential ||
            addr.highway ||
            addr.street ||
            "";
          const locality =
            addr.neighbourhood ||
            addr.suburb ||
            addr.city_district ||
            addr.quarter ||
            addr.village ||
            "";

          if (
            road &&
            !["lahore", "pakistan", "punjab"].includes(road.toLowerCase())
          ) {
            detectedStreet = road;
          }
          if (
            locality &&
            !["lahore", "pakistan", "punjab"].includes(locality.toLowerCase())
          ) {
            if (!detectedArea) detectedArea = locality;
          }
          placeName = nomData.display_name;
        }
      } catch (nomErr) {
        console.warn("Nominatim reverse geocode notice:", nomErr);
      }

      // 3. Mapbox Places Fallback for missing street or area
      if ((!detectedStreet || !detectedArea) && MAPBOX_TOKEN) {
        try {
          const mbUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=PK&limit=1`;
          const mbRes = await fetch(mbUrl);
          const mbData = await mbRes.json();
          if (mbData?.features?.length > 0) {
            const feat = mbData.features[0];
            if (!placeName) placeName = feat.place_name;
            const parts = feat.place_name.split(",").map((p) => p.trim());
            if (
              !detectedArea &&
              parts[0] &&
              !["lahore", "pakistan", "punjab"].includes(parts[0].toLowerCase())
            ) {
              detectedArea = parts[0];
            }
            if (
              !detectedStreet &&
              parts[1] &&
              !["lahore", "pakistan", "punjab"].includes(parts[1].toLowerCase())
            ) {
              detectedStreet = parts[1];
            }
          }
        } catch (mbErr) {
          console.warn("Mapbox reverse geocode notice:", mbErr);
        }
      }

      if (!detectedArea) detectedArea = "Lahore";
      const displayStr = detectedStreet
        ? `${detectedStreet}, ${detectedArea}`
        : `${detectedArea}, Lahore`;
      setReverseAddress(displayStr);

      return {
        street: detectedStreet,
        area: detectedArea,
        placeName: displayStr,
      };
    },
    [MAPBOX_TOKEN]
  );

  const handleDragEnd = async (e) => {
    const { lng, lat } = e.lngLat;
    setMarkerPos({ lat, lng });
    const result = await performReverseGeocode(lat, lng);
    if (onCoordinatesChange) {
      onCoordinatesChange({
        lat,
        lng,
        street: result.street,
        area: result.area,
        placeName: result.placeName,
      });
    }
  };

  const handleMapClick = async (e) => {
    const { lng, lat } = e.lngLat;
    setMarkerPos({ lat, lng });
    const result = await performReverseGeocode(lat, lng);
    if (onCoordinatesChange) {
      onCoordinatesChange({
        lat,
        lng,
        street: result.street,
        area: result.area,
        placeName: result.placeName,
      });
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    setIsSearching(true);

    // 1. Local Dictionary Match
    for (const [key, coords] of Object.entries(LAHORE_LOCALITY_COORDINATES)) {
      if (query.includes(key) || key.includes(query)) {
        setMarkerPos({ lat: coords.lat, lng: coords.lng });
        setViewState((prev) => ({
          ...prev,
          latitude: coords.lat,
          longitude: coords.lng,
          zoom: 15.5,
        }));
        const result = await performReverseGeocode(coords.lat, coords.lng);
        if (onCoordinatesChange) {
          onCoordinatesChange({
            lat: coords.lat,
            lng: coords.lng,
            street: result.street,
            area: coords.name,
            placeName: `${coords.name}, Lahore`,
          });
        }
        setSearchQuery("");
        setIsSearching(false);
        return;
      }
    }

    // 2. OpenStreetMap Nominatim Fallback
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query + ", Lahore, Pakistan"
      )}&format=json&limit=1&countrycodes=pk`;
      const nomRes = await fetch(nominatimUrl, {
        headers: { "Accept-Language": "en" },
      });
      const nomData = await nomRes.json();
      if (Array.isArray(nomData) && nomData.length > 0) {
        const lat = parseFloat(nomData[0].lat);
        const lng = parseFloat(nomData[0].lon);
        if (lat >= 23 && lat <= 37 && lng >= 60 && lng <= 78) {
          setMarkerPos({ lat, lng });
          setViewState((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            zoom: 15.5,
          }));
          const result = await performReverseGeocode(lat, lng);
          if (onCoordinatesChange) {
            onCoordinatesChange({
              lat,
              lng,
              street: result.street,
              area: result.area,
              placeName: nomData[0].display_name,
            });
          }
          setSearchQuery("");
          setIsSearching(false);
          return;
        }
      }
    } catch (nomErr) {
      console.warn("Nominatim search failed, trying Mapbox:", nomErr);
    }

    // 3. Mapbox Places API Fallback
    if (MAPBOX_TOKEN) {
      try {
        const q = `${query}, Lahore, Pakistan`;
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            q
          )}.json?access_token=${MAPBOX_TOKEN}&country=PK&limit=1`
        );
        const data = await res.json();
        if (data?.features?.length > 0) {
          const [lng, lat] = data.features[0].center;
          setMarkerPos({ lat, lng });
          setViewState((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            zoom: 15.5,
          }));
          const result = await performReverseGeocode(lat, lng);
          if (onCoordinatesChange) {
            onCoordinatesChange({
              lat,
              lng,
              street: result.street,
              area: result.area,
              placeName: data.features[0].place_name,
            });
          }
          setSearchQuery("");
        }
      } catch (err) {
        console.warn("Map search query failed:", err);
      }
    }

    setIsSearching(false);
  };

  return (
    <div className="space-y-2.5">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 relative flex items-center"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search area (e.g. Shadipura, Daroghawala, Bund Road, Gulberg)..."
            className="w-full pl-9 pr-20 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-md text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
          <FaSearch className="absolute left-3 text-neutral-400 text-xs" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[12px] uppercase rounded-lg border-none cursor-pointer transition-colors"
          >
            {isSearching ? "Finding..." : "Jump"}
          </button>
        </form>

        <button
          type="button"
          onClick={onLocateMe}
          disabled={isDetectingGps}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all border-none shadow-xs disabled:opacity-50 shrink-0"
          title="Detect and center map on my live GPS location"
        >
          {isDetectingGps ? (
            <>
              <FaSpinner className="animate-spin text-xs" />
              <span>Locating...</span>
            </>
          ) : hasExactGps ? (
            <>
              <FaCheckCircle className="text-xs text-emerald-800" />
              <span>GPS Centered</span>
            </>
          ) : (
            <>
              <FaCrosshairs className="text-xs" />
              <span>Locate Me</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Map Container */}
      <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-sm bg-neutral-100 dark:bg-neutral-800">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />

          {/* Draggable Customer Delivery Drop Pin */}
          <Marker
            longitude={markerPos.lng}
            latitude={markerPos.lat}
            anchor="bottom"
            draggable
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110">
              <div className="bg-neutral-950 text-white font-['Oswald',sans-serif] text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider border border-amber-400 mb-1 flex items-center gap-1 whitespace-nowrap">
                <span>📍 Drop-off Pin</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border-2 border-red-500 dark:border-red-400 shadow-xl flex items-center justify-center p-1.5 animate-bounce">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2776/2776067.png"
                  className="w-full h-full object-contain"
                  alt="Customer Delivery Marker"
                />
              </div>
            </div>
          </Marker>
        </Map>

        {/* Pin Helper Badge */}
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-neutral-950/80 backdrop-blur-xs text-zinc-900 dark:text-white text-[10px] font-medium px-2.5 py-1 rounded-lg border border-gray-200 dark:border-neutral-700 pointer-events-none shadow-sm">
          👆 Click or drag the marker to your doorstep
        </div>
      </div>

      {/* Lat / Lng & Resolved Address readout */}
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 px-1">
        <span className="truncate max-w-[70%]">
          {reverseAddress ? `📍 ${reverseAddress}` : "🎯 Selected Delivery Spot"}
        </span>
        <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">
          {markerPos.lat.toFixed(4)}, {markerPos.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
