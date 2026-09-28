// ─── CLIENT-SIDE CACHED REVERSE GEOCODING HYDRATOR ───
const hydrationCache = new Map();

export const resolveCoordinatesToAddress = async (lat, lng, mapboxToken = "") => {
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  if (isNaN(numLat) || isNaN(numLng)) return null;

  const cacheKey = `${numLat.toFixed(5)},${numLng.toFixed(5)}`;
  if (hydrationCache.has(cacheKey)) {
    return hydrationCache.get(cacheKey);
  }

  let street = "";
  let area = "";
  let city = "Lahore";
  let fullAddress = "";

  // 1. Query OpenStreetMap Nominatim Reverse API
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${numLat}&lon=${numLng}&format=json&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      headers: { "Accept-Language": "en" },
    });
    const data = await res.json();
    if (data?.address) {
      const addr = data.address;
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

      if (road && !["lahore", "pakistan", "punjab"].includes(road.toLowerCase())) {
        street = road;
      }
      if (locality && !["lahore", "pakistan", "punjab"].includes(locality.toLowerCase())) {
        area = locality;
      }
      if (addr.city) city = addr.city;
      fullAddress = data.display_name || "";
    }
  } catch (err) {
    console.warn("Nominatim hydration notice:", err);
  }

  // 2. Fallback to Mapbox Places API
  if ((!street || !area) && mapboxToken) {
    try {
      const mbUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${numLng},${numLat}.json?access_token=${mapboxToken}&country=PK&limit=1`;
      const mbRes = await fetch(mbUrl);
      const mbData = await mbRes.json();
      if (mbData?.features?.length > 0) {
        const feat = mbData.features[0];
        if (!fullAddress) fullAddress = feat.place_name;
        const parts = feat.place_name.split(",").map((p) => p.trim());
        if (!area && parts[0] && !["lahore", "pakistan", "punjab"].includes(parts[0].toLowerCase())) {
          area = parts[0];
        }
        if (!street && parts[1] && !["lahore", "pakistan", "punjab"].includes(parts[1].toLowerCase())) {
          street = parts[1];
        }
      }
    } catch (mbErr) {
      console.warn("Mapbox hydration notice:", mbErr);
    }
  }

  const result = {
    street: street || "Main Road",
    area: area || "Lahore",
    city: city || "Lahore",
    fullAddress: fullAddress || `${street || "Main Road"}, ${area || "Lahore"}`,
  };

  hydrationCache.set(cacheKey, result);
  return result;
};
