/**
 * Awkward-Data-Resistant CSV Export Utility
 * Conforms to RFC 4180 with robust escaping for:
 * - Commas, semicolons, quotes, carriage returns, and newlines in text fields
 * - Unicode scripts (Amharic characters, diacritics, symbols, emojis)
 * - UTF-8 Byte Order Mark (BOM: \uFEFF) to ensure Microsoft Excel & Apple Numbers render correctly
 * - CSV Injection / Formula Injection defense (sanitizing cells starting with '=', '+', '-', '@', tab)
 * - Safe fallback for null, undefined, arrays, and complex nested objects
 */

import { formatCurrency, formatDateTime } from "./formatters";

/**
 * Escapes an individual cell value according to RFC 4180 standards
 * and guards against CSV injection.
 * @param {any} value
 * @returns {string}
 */
export function escapeCSVCell(value) {
  if (value === null || value === undefined) {
    return '""';
  }

  // Convert numbers or booleans directly
  if (typeof value === "number") {
    if (isNaN(value)) return '""';
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  // Convert objects or arrays to readable strings
  let str = typeof value === "object" ? JSON.stringify(value) : String(value);

  // Normalize Windows/Mac line breaks to \n
  str = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // CSV Formula Injection Prevention:
  // If cell starts with formula triggers (=, +, -, @, \t), prepend a single quote (')
  // to treat it as plain text in spreadsheet applications.
  if (/^[=+\-@\t]/.test(str)) {
    str = `'${str}`;
  }

  // RFC 4180: If the string contains comma, quote, or newline, escape double quotes
  // by doubling them (""") and wrap the whole cell in double quotes.
  // We wrap all string cells in double quotes for maximum robustness against awkward data.
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Generate CSV rows from an array of order objects.
 * Handles messy customer notes, items with commas, empty values, etc.
 * @param {Array} orders
 * @returns {string}
 */
export function generateOrdersCSV(orders) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return "\uFEFFOrder ID,Date,Status,Customer Name,Phone,Address,Note,Items Summary,Item Count,Total (ETB)\n";
  }

  const headers = [
    "Order ID",
    "Date & Time",
    "Status",
    "Customer Name",
    "Phone Number",
    "Delivery Address",
    "Customer Note",
    "Items Ordered",
    "Total Items",
    "Total (ETB)",
  ];

  const headerRow = headers.map(escapeCSVCell).join(",");

  const dataRows = orders.map((order) => {
    const customer = order.customer || {};
    const items = Array.isArray(order.items) ? order.items : [];

    // Format items as: "2 × Kitfo Special; 1 × Beyaynetu Platter"
    const itemsSummary = items
      .map((item) => {
        const name = item.dish?.name || item.name || "Item";
        const qty = item.quantity || 1;
        const price = item.dish?.price || item.price || 0;
        return `${qty} × ${name} (${price} ETB)`;
      })
      .join("; ");

    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const row = [
      order.id || "N/A",
      formatDateTime(order.createdAt),
      order.status || "New",
      customer.name || "Anonymous",
      customer.phone || "—",
      customer.address || "—",
      customer.note || "None",
      itemsSummary || "No items",
      totalQuantity,
      order.total ?? 0,
    ];

    return row.map(escapeCSVCell).join(",");
  });

  // Prepend UTF-8 BOM (\uFEFF) so Excel respects UTF-8 encoding (especially for Amharic or emojis)
  return "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
}

/**
 * Trigger an instant browser download of the orders CSV file.
 * @param {Array} orders
 * @param {string} filename
 */
export function downloadOrdersCSV(orders, filename) {
  const defaultFilename = `addis-eats-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  const targetFilename = filename || defaultFilename;

  const csvContent = generateOrdersCSV(orders);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  if (typeof window !== "undefined") {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", targetFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
