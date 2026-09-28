// ─── INSTANT LAHORE LOCALITY COORDINATES DICTIONARY ───
export const LAHORE_LOCALITY_COORDINATES = {
  shadipura: { lat: 31.6012, lng: 74.3985, name: "Shadipura" },
  daroghawala: { lat: 31.5975, lng: 74.408, name: "Daroghawala" },
  baghbanpura: { lat: 31.5835, lng: 74.3812, name: "Baghbanpura" },
  mughalpura: { lat: 31.5645, lng: 74.372, name: "Mughalpura" },
  salamtpura: { lat: 31.595, lng: 74.415, name: "Salamatpura" },
  salamatpura: { lat: 31.595, lng: 74.415, name: "Salamatpura" },
  harbanspura: { lat: 31.575, lng: 74.41, name: "Harbanspura" },
  singhpura: { lat: 31.588, lng: 74.375, name: "Singhpura" },
  gulberg: { lat: 31.5102, lng: 74.344, name: "Gulberg" },
  dha: { lat: 31.4685, lng: 74.402, name: "DHA Phase 5" },
  defence: { lat: 31.4685, lng: 74.402, name: "DHA" },
  "model town": { lat: 31.4826, lng: 74.3256, name: "Model Town" },
  "johar town": { lat: 31.4697, lng: 74.2728, name: "Johar Town" },
  "faisal town": { lat: 31.485, lng: 74.305, name: "Faisal Town" },
  "garden town": { lat: 31.503, lng: 74.328, name: "Garden Town" },
  "iqbal town": { lat: 31.513, lng: 74.282, name: "Allama Iqbal Town" },
  "allama iqbal town": { lat: 31.513, lng: 74.282, name: "Allama Iqbal Town" },
  township: { lat: 31.455, lng: 74.312, name: "Township" },
  "wapda town": { lat: 31.436, lng: 74.269, name: "Wapda Town" },
  valencia: { lat: 31.408, lng: 74.26, name: "Valencia Town" },
  "bahria town": { lat: 31.365, lng: 74.18, name: "Bahria Town" },
  samanabad: { lat: 31.536, lng: 74.301, name: "Samanabad" },
  shadman: { lat: 31.538, lng: 74.331, name: "Shadman" },
  cantt: { lat: 31.545, lng: 74.38, name: "Lahore Cantt" },
  "cavalry ground": { lat: 31.509, lng: 74.378, name: "Cavalry Ground" },
  "garhi shahu": { lat: 31.56, lng: 74.347, name: "Garhi Shahu" },
  "gari shahu": { lat: 31.56, lng: 74.347, name: "Garhi Shahu" },
  anarkali: { lat: 31.57, lng: 74.312, name: "Anarkali" },
  "mall road": { lat: 31.558, lng: 74.325, name: "Mall Road" },
  shahdara: { lat: 31.621, lng: 74.283, name: "Shahdara" },
  "kot lakhpat": { lat: 31.46, lng: 74.34, name: "Kot Lakhpat" },
  "green town": { lat: 31.442, lng: 74.315, name: "Green Town" },
  walton: { lat: 31.488, lng: 74.368, name: "Walton" },
  dharampura: { lat: 31.557, lng: 74.363, name: "Dharampura" },
  mustafabad: { lat: 31.557, lng: 74.363, name: "Mustafabad" },
  sanda: { lat: 31.562, lng: 74.295, name: "Sanda" },
  islampura: { lat: 31.565, lng: 74.299, name: "Islampura" },
  "gulshan-e-ravi": { lat: 31.545, lng: 74.285, name: "Gulshan-e-Ravi" },
  sabzazar: { lat: 31.525, lng: 74.268, name: "Sabzazar" },
  tajpura: { lat: 31.578, lng: 74.402, name: "Tajpura" },
  "bund road": { lat: 31.595, lng: 74.34, name: "Bund Road" },
  "ring road": { lat: 31.58, lng: 74.4, name: "Ring Road Lahore" },
  "gt road": { lat: 31.585, lng: 74.385, name: "GT Road Lahore" },
};

// ─── QUERY SANITIZER ───
export const cleanAddressForGeocoding = (rawAddress) => {
  if (!rawAddress) return "";
  let text = rawAddress;
  text = text.replace(/house(\s*\/\s*apt)?\s*[:#\-]?/gi, " ");
  text = text.replace(/h\s*#\s*\d+[a-z]?/gi, " ");
  text = text.replace(/st(reet)?\s*[:#\-]?\s*\d+[a-z]?/gi, " ");
  text = text.replace(/street\s*[:#\-]?/gi, " ");
  text = text.replace(/area\s*[:#\-]?/gi, " ");
  text = text.replace(/flat(\s*no)?\s*[:#\-]?\s*\d+/gi, " ");
  text = text.replace(/apt(\s*no)?\s*[:#\-]?\s*\d+/gi, " ");
  text = text.replace(/near\s+/gi, " ");
  text = text.replace(/opp(osite)?\s+/gi, " ");

  text = text
    .split(/[\s,]+/)
    .filter((w) => {
      const lower = w.trim().toLowerCase();
      if (lower.length <= 2 && !["pk", "gt"].includes(lower)) return false;
      return true;
    })
    .join(" ");

  return text.replace(/\s+/g, " ").trim();
};

// ─── HYBRID GEOCODER ───
export const resolveAddressCoordinates = async (
  rawAddress,
  areaName = "",
  streetName = "",
  mapboxToken = ""
) => {
  const fullText = `${rawAddress || ""} ${streetName || ""} ${areaName || ""}`.toLowerCase();

  // Tier 1: Instant Match against Known Localities Dictionary
  for (const [key, coords] of Object.entries(LAHORE_LOCALITY_COORDINATES)) {
    if (fullText.includes(key)) {
      return { lat: coords.lat, lng: coords.lng, source: `Dictionary (${coords.name})` };
    }
  }

  const cleaned = cleanAddressForGeocoding(rawAddress || `${streetName} ${areaName}`);
  const cleanQuery = cleaned ? `${cleaned.replace(/lahore/gi, "").replace(/pakistan/gi, "").trim()}, Lahore, Pakistan` : "Lahore, Pakistan";

  // Tier 2: OpenStreetMap Nominatim API
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cleanQuery
    )}&format=json&limit=1&countrycodes=pk`;
    const nomRes = await fetch(nominatimUrl, {
      headers: { "Accept-Language": "en" },
    });
    const nomData = await nomRes.json();
    if (Array.isArray(nomData) && nomData.length > 0) {
      const lat = parseFloat(nomData[0].lat);
      const lng = parseFloat(nomData[0].lon);
      if (lat >= 23 && lat <= 37 && lng >= 60 && lng <= 78) {
        return { lat, lng, source: "Nominatim" };
      }
    }
  } catch (nomErr) {
    console.warn("Nominatim geocoding failed, trying Mapbox fallback:", nomErr);
  }

  // Tier 3: Mapbox Geocoding API Fallback
  if (mapboxToken) {
    try {
      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        cleanQuery
      )}.json?access_token=${mapboxToken}&country=PK&limit=1`;
      const mbRes = await fetch(mapboxUrl);
      const mbData = await mbRes.json();
      if (mbData?.features?.length > 0) {
        const [lng, lat] = mbData.features[0].center;
        if (typeof lat === "number" && typeof lng === "number") {
          return { lat, lng, source: "Mapbox" };
        }
      }
    } catch (mbErr) {
      console.warn("Mapbox geocoding query failed:", mbErr);
    }
  }

  return { lat: 31.5204, lng: 74.3587, source: "Store HQ Fallback" };
};
