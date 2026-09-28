/**
 * storeTiming.js
 * Comprehensive timing and operational logic for QuickiBite
 */

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const str = String(timeStr).trim().toLowerCase();
  const isPM = str.includes("pm");
  const isAM = str.includes("am");

  const clean = str.replace(/am|pm/g, "").trim();
  const parts = clean.split(":");
  let hours = parseInt(parts[0] || "0", 10);
  const minutes = parseInt(parts[1] || "0", 10);

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + (isNaN(minutes) ? 0 : minutes);
}

export function formatMinutesToTime(minutes) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatTimeString(timeStr) {
  if (!timeStr) return "";
  const minutes = parseTimeToMinutes(timeStr);
  return formatMinutesToTime(minutes);
}

export function checkIsWithinOperatingHours(openStr, closeStr) {
  if (!openStr || !closeStr) return true;

  const openMinutes = parseTimeToMinutes(openStr);
  const closeMinutes = parseTimeToMinutes(closeStr);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Same day hours (e.g. 10:00 AM to 11:00 PM)
  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  // Overnight hours spanning midnight (e.g. 10:00 AM to 04:00 AM next day)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  // 24 hours if open and close are identical
  return true;
}

export function evaluateStoreStatus(settings = {}) {
  const openTimeRaw = settings.restaurant_open_time || "10:00";
  const closeTimeRaw = settings.restaurant_close_time || "04:00";

  // Check accept_orders toggle from settings
  const acceptOrdersRaw = settings.accept_orders;
  const isAcceptingOrders =
    acceptOrdersRaw !== "false" &&
    acceptOrdersRaw !== "0" &&
    acceptOrdersRaw !== false &&
    acceptOrdersRaw !== 0;

  // Check current time against operational hours
  const isWithinHours = checkIsWithinOperatingHours(openTimeRaw, closeTimeRaw);

  const openTimeFormatted = formatTimeString(openTimeRaw);
  const closeTimeFormatted = formatTimeString(closeTimeRaw);

  const isOpen = isAcceptingOrders && isWithinHours;

  let closedReason = null;
  let closedTitle = "Restaurant is Currently Closed";
  let closedMessage = "We are currently closed for online orders.";

  if (!isAcceptingOrders) {
    closedReason = "toggle";
    closedTitle = "Online Ordering Temporarily Paused";
    closedMessage =
      "We are currently not accepting online orders at the moment. Please check back soon!";
  } else if (!isWithinHours) {
    closedReason = "hours";
    closedTitle = "Restaurant is Temporarily Closed";
    closedMessage = `We are currently closed. Our opening hours are ${openTimeFormatted} to ${closeTimeFormatted}. Please visit us during our operating hours!`;
  }

  return {
    isOpen,
    isAcceptingOrders,
    isWithinHours,
    openTimeRaw,
    closeTimeRaw,
    openTimeFormatted,
    closeTimeFormatted,
    closedReason,
    closedTitle,
    closedMessage,
  };
}
