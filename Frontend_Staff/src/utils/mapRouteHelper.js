/**
 * Mapbox Directions API & Spherical Bearing Helper
 * Provides turn-by-turn road geometry, distance, duration, and dynamic heading calculation.
 */

/**
 * Calculate the forward azimuth / compass bearing between two coordinates in degrees (0° - 360°).
 * @param {Array<number>} startCoord - [lng1, lat1]
 * @param {Array<number>} endCoord - [lng2, lat2]
 * @returns {number} Bearing in degrees from 0 to 360
 */
export function calculateBearing(startCoord, endCoord) {
  if (!startCoord || !endCoord || startCoord.length < 2 || endCoord.length < 2) {
    return 0;
  }

  const [lng1, lat1] = startCoord;
  const [lng2, lat2] = endCoord;

  // If points are identical, return 0
  if (Math.abs(lng1 - lng2) < 0.000001 && Math.abs(lat1 - lat2) < 0.000001) {
    return 0;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lng2 - lng1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  const bearing = (toDeg(theta) + 360) % 360;

  return Math.round(bearing * 10) / 10;
}

/**
 * Fetch real driving route between two points using Mapbox Directions API.
 * @param {Array<number>} startCoords - [lng, lat]
 * @param {Array<number>} endCoords - [lng, lat]
 * @param {string} mapboxToken - Mapbox public access token
 * @returns {Promise<{
 *   coordinates: Array<Array<number>>,
 *   distanceKm: string,
 *   durationMins: number,
 *   geometry: Object,
 *   waypoints: Array<Object>
 * }>}
 */
export async function fetchDrivingRoute(startCoords, endCoords, mapboxToken) {
  if (!startCoords || !endCoords || !mapboxToken) {
    throw new Error("Missing start coordinates, end coordinates, or Mapbox token.");
  }

  const startLng = parseFloat(startCoords[0]);
  const startLat = parseFloat(startCoords[1]);
  const endLng = parseFloat(endCoords[0]);
  const endLat = parseFloat(endCoords[1]);

  if (isNaN(startLng) || isNaN(startLat) || isNaN(endLng) || isNaN(endLat)) {
    throw new Error("Invalid coordinate values provided for driving route.");
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full&steps=true&access_token=${mapboxToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Mapbox Directions API failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error("No driving route found between specified points.");
  }

  const route = data.routes[0];
  const coordinates = route.geometry?.coordinates || [];

  return {
    coordinates,
    distanceKm: (route.distance / 1000).toFixed(2),
    durationMins: Math.ceil(route.duration / 60),
    geometry: route.geometry,
    waypoints: data.waypoints || [],
  };
}

/**
 * Pre-computes road points with segment bearings for smooth road traversal.
 * Each point has { lng, lat, heading }
 * @param {Array<Array<number>>} coordinates - [[lng, lat], ...]
 * @returns {Array<{ lng: number, lat: number, heading: number }>}
 */
export function buildRoadStepsWithBearings(coordinates) {
  if (!coordinates || coordinates.length === 0) return [];
  if (coordinates.length === 1) {
    return [{ lng: coordinates[0][0], lat: coordinates[0][1], heading: 0 }];
  }

  const steps = [];

  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    let heading = 0;

    if (i < coordinates.length - 1) {
      const next = coordinates[i + 1];
      heading = calculateBearing(current, next);
    } else {
      // Use previous segment's heading for the final destination point
      heading = steps.length > 0 ? steps[steps.length - 1].heading : 0;
    }

    steps.push({
      lng: current[0],
      lat: current[1],
      heading,
    });
  }

  return steps;
}
