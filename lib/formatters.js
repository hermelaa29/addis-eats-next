/**
 * Shared Formatting Module for Addis Eats
 * Centralizes all value formatting across the application:
 * currency, dates, times, order status, courier coordinates, distances, and contact numbers.
 */

/**
 * Format monetary amounts in Ethiopian Birr (ETB).
 * @param {number|string} amount
 * @param {Object} options
 * @returns {string} e.g. "285 ETB" or "1,250.00 ETB"
 */
export function formatCurrency(amount, { showDecimals = false, suffix = "ETB" } = {}) {
  const numeric = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(numeric) || amount === null || amount === undefined) {
    return `0 ${suffix}`.trim();
  }

  const formatted = new Intl.NumberFormat("en-ET", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(numeric);

  return suffix ? `${formatted} ${suffix}` : formatted;
}

/**
 * Format a date string or timestamp into a readable date.
 * @param {string|Date|number} date
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string} e.g. "Oct 14, 2026"
 */
export function formatDate(date, options = {}) {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    const defaults = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Intl.DateTimeFormat("en-ET", { ...defaults, ...options }).format(d);
  } catch {
    return "—";
  }
}

/**
 * Format a time from a date string or timestamp.
 * @param {string|Date|number} date
 * @returns {string} e.g. "07:15 PM"
 */
export function formatTime(date) {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-ET", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "—";
  }
}

/**
 * Format both date and time into a single cohesive string.
 * @param {string|Date|number} date
 * @returns {string} e.g. "Oct 14, 2026 · 07:15 PM"
 */
export function formatDateTime(date) {
  if (!date) return "—";
  const formattedDate = formatDate(date);
  const formattedTime = formatTime(date);
  if (formattedDate === "—") return "—";
  return `${formattedDate} · ${formattedTime}`;
}

/**
 * Format relative time (e.g. "just now", "12 mins ago", "2 hours ago").
 * @param {string|Date|number} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return "—";
  try {
    const d = new Date(date);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 45) return "Just now";
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `${mins} min${mins === 1 ? "" : "s"} ago`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${hours} hr${hours === 1 ? "" : "s"} ago`;
    }
    const days = Math.floor(diffSec / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } catch {
    return "—";
  }
}

/**
 * Map of order status configurations
 */
export const ORDER_STATUS_CONFIG = {
  New: {
    label: "Order Placed",
    stepIndex: 1,
    color: "#c99235",
    bgColor: "rgba(201, 146, 53, 0.12)",
    badgeClass: "status-new",
    description: "Your order has been received by Addis Eats Kitchen.",
  },
  Preparing: {
    label: "Kitchen Preparing",
    stepIndex: 2,
    color: "#d97706",
    bgColor: "rgba(217, 119, 6, 0.12)",
    badgeClass: "status-preparing",
    description: "Chef is seasoning and packaging your fresh dishes.",
  },
  Delivering: {
    label: "Out for Delivery",
    stepIndex: 3,
    color: "#2563eb",
    bgColor: "rgba(37, 99, 235, 0.12)",
    badgeClass: "status-delivering",
    description: "Courier has picked up your food and is on the way.",
  },
  "On the way": {
    label: "Out for Delivery",
    stepIndex: 3,
    color: "#2563eb",
    bgColor: "rgba(37, 99, 235, 0.12)",
    badgeClass: "status-delivering",
    description: "Courier has picked up your food and is on the way.",
  },
  Delivered: {
    label: "Delivered",
    stepIndex: 4,
    color: "#16a34a",
    bgColor: "rgba(22, 163, 74, 0.12)",
    badgeClass: "status-delivered",
    description: "Arrived at your doorstep. Enjoy your meal!",
  },
  Completed: {
    label: "Delivered",
    stepIndex: 4,
    color: "#16a34a",
    bgColor: "rgba(22, 163, 74, 0.12)",
    badgeClass: "status-delivered",
    description: "Arrived at your doorstep. Enjoy your meal!",
  },
  Cancelled: {
    label: "Cancelled",
    stepIndex: 0,
    color: "#dc2626",
    bgColor: "rgba(220, 38, 38, 0.12)",
    badgeClass: "status-cancelled",
    description: "This order was cancelled.",
  },
};

/**
 * Format order status into a metadata object.
 * @param {string} status
 * @returns {Object}
 */
export function formatOrderStatus(status) {
  const normalized = status ? status.trim() : "New";
  return (
    ORDER_STATUS_CONFIG[normalized] || {
      label: normalized,
      stepIndex: 1,
      color: "#887968",
      bgColor: "rgba(136, 121, 104, 0.12)",
      badgeClass: "status-default",
      description: "Order status updated.",
    }
  );
}

/**
 * Format distance in meters or kilometers.
 * @param {number} meters
 * @returns {string} e.g. "450 m" or "2.3 km"
 */
export function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) return "—";
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration in minutes into a friendly string.
 * @param {number} minutes
 * @returns {string} e.g. "12 mins" or "1 hr 15 mins"
 */
export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return "—";
  const mins = Math.max(0, Math.round(minutes));
  if (mins < 60) {
    return `${mins} min${mins === 1 ? "" : "s"}`;
  }
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs} hr ${remainingMins} min` : `${hrs} hr`;
}

/**
 * Format estimated arrival time.
 * @param {number} minutesFromNow
 * @returns {string} e.g. "Around 7:45 PM"
 */
export function formatEta(minutesFromNow) {
  if (minutesFromNow === null || minutesFromNow === undefined || isNaN(minutesFromNow)) {
    return "Calculating...";
  }
  const etaDate = new Date(Date.now() + Math.max(0, minutesFromNow) * 60000);
  return `Around ${formatTime(etaDate)}`;
}

/**
 * Format phone numbers into standard Ethiopian format (+251 9X XXX XXXX).
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
  if (!phone) return "—";
  const cleaned = phone.toString().replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+251")) {
    const rest = cleaned.slice(4);
    if (rest.length === 9) {
      return `+251 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
    }
    return `+251 ${rest}`;
  }
  if (cleaned.startsWith("09") && cleaned.length === 10) {
    return `+251 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.startsWith("9") && cleaned.length === 9) {
    return `+251 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Format GPS latitude and longitude coordinates.
 * @param {number} lat
 * @param {number} lng
 * @returns {string} e.g. "9.0012° N, 38.7845° E"
 */
export function formatCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return "—";
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Format ordered items array into a concise readable string.
 * @param {Array} items
 * @returns {string} e.g. "2× Kitfo Special, 1× Beyaynetu Platter"
 */
export function formatItemSummary(items) {
  if (!Array.isArray(items) || items.length === 0) return "No items";
  return items
    .map((item) => {
      const name = item.dish?.name || item.name || "Item";
      const qty = item.quantity || 1;
      return `${qty}× ${name}`;
    })
    .join(", ");
}

/**
 * Format address with fallback.
 * @param {string} address
 * @param {string} fallback
 * @returns {string}
 */
export function formatAddress(address, fallback = "Addis Ababa, Ethiopia") {
  if (!address || typeof address !== "string" || !address.trim()) {
    return fallback;
  }
  return address.trim();
}
