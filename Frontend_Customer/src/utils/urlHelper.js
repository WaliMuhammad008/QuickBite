/**
 * urlHelper.js – Customer Portal
 * Dynamic URL resolution utilities for zero-hardcoded-URL architecture.
 */

/**
 * Returns the Customer app base URL dynamically.
 * Priority: VITE_CUSTOMER_URL env → window.location.origin
 */
export function getCustomerAppUrl() {
  if (import.meta.env.VITE_CUSTOMER_URL) {
    return import.meta.env.VITE_CUSTOMER_URL.replace(/\/+$/, "");
  }
  return window.location.origin;
}

/**
 * Returns the Staff app base URL dynamically.
 * Priority: VITE_STAFF_URL env → port-swap from current origin (5173 ↔ 5174)
 */
export function getStaffAppUrl() {
  if (import.meta.env.VITE_STAFF_URL) {
    return import.meta.env.VITE_STAFF_URL.replace(/\/+$/, "");
  }
  const origin = window.location.origin;
  // If running on dev port 5173, swap to 5174 for staff
  if (origin.includes(":5173")) {
    return origin.replace(":5173", ":5174");
  }
  return origin; // production or same-host
}

/**
 * Builds a shareable customer order tracking URL.
 * @param {string|number} orderId
 * @param {string} phone – Customer phone (optional, used for auth verification)
 * @returns {string}
 */
export function getTrackingUrl(orderId, phone = "") {
  const base = getCustomerAppUrl();
  const params = new URLSearchParams({ orderId: String(orderId) });
  if (phone) params.set("phone", phone);
  return `${base}/track-order?${params.toString()}`;
}

/**
 * Normalizes a Pakistani phone number for WhatsApp API.
 * Input examples: "03001234567", "3001234567", "+923001234567", "923001234567"
 * Output: "923001234567"
 * @param {string} phone
 * @returns {string}
 */
export function formatWhatsAppPhone(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/[^0-9]/g, "");

  // Already international format with country code
  if (digits.startsWith("92") && digits.length >= 12) {
    return digits;
  }
  // Starts with 0 (e.g. 03001234567)
  if (digits.startsWith("0") && digits.length >= 11) {
    return "92" + digits.slice(1);
  }
  // Starts with 3 (e.g. 3001234567 — missing leading 0)
  if (digits.startsWith("3") && digits.length >= 10) {
    return "92" + digits;
  }
  return digits;
}

/**
 * Returns the Socket.IO server base URL dynamically.
 * Priority: VITE_SOCKET_URL env → http://${window.location.hostname}:3001 (if mobile/network IP) → http://localhost:3001
 * @returns {string}
 */
export function getSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.replace(/\/+$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window.location &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return `http://${window.location.hostname}:3001`;
  }
  return "http://localhost:3001";
}

/**
 * Returns unified, production-ready Socket.IO client configuration options.
 * Handles Railway edge proxy websocket upgrades cleanly with fallback to long-polling.
 * @returns {Object}
 */
export function getSocketOptions() {
  return {
    transports: ["polling", "websocket"],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    withCredentials: false,
    autoConnect: true,
  };
}
