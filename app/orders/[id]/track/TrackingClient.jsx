'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDistance,
  formatDuration,
  formatEta,
  formatOrderStatus,
  formatPhoneNumber,
  formatAddress,
  formatItemSummary,
} from "@/lib/formatters";
import { downloadOrdersCSV } from "@/lib/csvExport";
import { useOrdersStore } from "@/store/ordersStore";

// Dynamically import Leaflet OrderMap to prevent SSR window issues
const OrderMap = dynamic(() => import("@/components/tracking/OrderMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "460px",
        borderRadius: "20px",
        background: "var(--soft)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        border: "1px solid var(--line)",
      }}
    >
      <div className="spinner" />
      <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>
        Loading satellite map of Addis Ababa...
      </span>
    </div>
  ),
});

export default function TrackingClient({ orderId, initialSeed }) {
  // Read local order if available to get full item details
  const storedOrders = useOrdersStore((state) => state.orders);
  const matchedOrder = storedOrders.find((o) => o.id === orderId);

  // Initialize state immediately from the server render seed!
  const [trackingData, setTrackingData] = useState(() => ({
    orderId,
    status: matchedOrder?.status || initialSeed.status || "Preparing",
    courier: initialSeed.courier || {
      name: "Dawit Haile",
      phone: "+251 91 145 6789",
      vehicle: "TVS Apache 160 (Plate 3-A2941)",
      lat: 9.0015,
      lng: 38.7842,
      speedKmh: 0,
    },
    etaMinutes: initialSeed.etaMinutes ?? 28,
    distanceMeters: initialSeed.distanceMeters ?? 3100,
    stepIndex: initialSeed.stepIndex ?? 2,
    stepTitle: initialSeed.stepTitle || "Order is in motion",
    stepNote: initialSeed.stepNote || "Live courier connection initializing...",
    connected: false,
    timestamp: initialSeed.timestamp || new Date().toISOString(),
  }));

  const [connectionStatus, setConnectionStatus] = useState("connecting"); // 'connecting' | 'live' | 'completed' | 'error'

  useEffect(() => {
    // Open Server-Sent Events stream
    const eventSource = new EventSource(`/api/orders/${encodeURIComponent(orderId)}/track/sse`);

    eventSource.onopen = () => {
      setConnectionStatus("live");
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setTrackingData((prev) => ({
          ...prev,
          ...payload,
          connected: true,
        }));
        if (payload.isComplete || payload.status === "Delivered") {
          setConnectionStatus("completed");
        }
      } catch (err) {
        console.error("SSE parsing error:", err);
      }
    };

    eventSource.onerror = () => {
      // If server finished or closed the stream
      if (trackingData.status === "Delivered") {
        setConnectionStatus("completed");
      } else {
        setConnectionStatus("live"); // EventSource auto-reconnects
      }
    };

    return () => {
      eventSource.close();
    };
  }, [orderId]);

  const orderDetails = matchedOrder || {
    id: orderId,
    createdAt: trackingData.timestamp,
    total: initialSeed.total || 475,
    customer: {
      name: initialSeed.customerName || "Customer",
      phone: initialSeed.customerPhone || "0911223344",
      address: initialSeed.customerAddress || "Kazanchis, Addis Ababa",
    },
    items: initialSeed.items || [
      { quantity: 1, dish: { name: "Beyaynetu Platter", price: 285 } },
      { quantity: 1, dish: { name: "Firfir Morning Bowl", price: 190 } },
    ],
  };

  const statusMeta = formatOrderStatus(trackingData.status);

  const steps = [
    { title: "Order Placed", desc: "Received at Kitchen", index: 1 },
    { title: "Preparing", desc: "Cooking fresh in Bole", index: 2 },
    { title: "Out for Delivery", desc: "Courier on route", index: 3 },
    { title: "Delivered", desc: "Enjoy your food", index: 4 },
  ];

  const handleExportThisOrder = () => {
    downloadOrdersCSV([orderDetails], `order-${orderId}-tracking.csv`);
  };

  return (
    <main className="page" style={{ maxWidth: "1160px", margin: "0 auto", paddingBottom: "80px" }}>
      {/* Top Breadcrumb & Live Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/orders" className="button button-light" style={{ padding: "8px 14px", fontSize: "12px" }}>
            ← Back to Orders
          </Link>
          <span style={{ color: "var(--muted)", fontSize: "13px" }}>/ Tracking</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={handleExportThisOrder}
            className="button button-light"
            style={{ padding: "8px 14px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span>📄</span> Export Order (CSV)
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "99px",
              background: connectionStatus === "live" ? "rgba(22, 163, 74, 0.12)" : "rgba(201, 146, 53, 0.12)",
              border: `1px solid ${connectionStatus === "live" ? "rgba(22, 163, 74, 0.3)" : "rgba(201, 146, 53, 0.3)"}`,
              fontFamily: "var(--mono)",
              fontSize: "11px",
              fontWeight: "600",
              color: connectionStatus === "live" ? "#15803d" : "#b45309",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: connectionStatus === "live" ? "#16a34a" : "#d97706",
                boxShadow: `0 0 0 3px ${connectionStatus === "live" ? "rgba(22, 163, 74, 0.25)" : "rgba(217, 119, 6, 0.25)"}`,
              }}
            />
            {connectionStatus === "live"
              ? "LIVE SSE CONNECTION ACTIVE"
              : connectionStatus === "completed"
              ? "ORDER COMPLETED"
              : "CONNECTING SSE FEED..."}
          </div>
        </div>
      </div>

      {/* Hero Tracking Header */}
      <div
        style={{
          background: "var(--soft)",
          border: "1px solid var(--line)",
          borderRadius: "24px",
          padding: "32px",
          marginBottom: "28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p className="eyebrow" style={{ margin: "0 0 6px 0" }}>Live Dispatch Feed</p>
            <h1 style={{ font: "400 40px var(--serif)", margin: "0 0 8px 0", color: "var(--ink)" }}>
              Order {orderId}
            </h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "14px" }}>
              Placed {formatDateTime(orderDetails.createdAt)} · Delivering to <b>{formatAddress(orderDetails.customer?.address)}</b>
            </p>
          </div>

          {/* Current Status Pill */}
          <div
            style={{
              background: statusMeta.bgColor,
              border: `1px solid ${statusMeta.color}`,
              borderRadius: "16px",
              padding: "12px 20px",
              textAlign: "right",
            }}
          >
            <span style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", textTransform: "uppercase", color: statusMeta.color, letterSpacing: "0.08em" }}>
              Current Milestone
            </span>
            <strong style={{ display: "block", font: "400 24px var(--serif)", color: statusMeta.color, marginTop: "2px" }}>
              {statusMeta.label}
            </strong>
          </div>
        </div>

        {/* Real-time Status Note Box */}
        <div
          style={{
            marginTop: "24px",
            background: "rgba(255, 255, 255, 0.8)",
            border: "1px solid var(--line)",
            borderRadius: "14px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--gold)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            ✦
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "14px", color: "var(--ink)", fontWeight: "600" }}>
              {trackingData.stepTitle || statusMeta.label}
            </strong>
            <span style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.4" }}>
              {trackingData.stepNote || statusMeta.description}
            </span>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          {steps.map((step) => {
            const isCompleted = trackingData.stepIndex > step.index;
            const isCurrent = trackingData.stepIndex === step.index;
            return (
              <div
                key={step.index}
                style={{
                  position: "relative",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: isCurrent ? "var(--paper)" : isCompleted ? "rgba(22, 163, 74, 0.08)" : "rgba(0,0,0,0.02)",
                  border: `1px solid ${isCurrent ? "var(--gold)" : isCompleted ? "rgba(22, 163, 74, 0.3)" : "var(--line)"}`,
                  boxShadow: isCurrent ? "0 8px 20px rgba(201, 146, 53, 0.12)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontFamily: "var(--mono)",
                      background: isCompleted ? "#16a34a" : isCurrent ? "var(--gold)" : "var(--line)",
                      color: isCompleted || isCurrent ? "#fff" : "var(--muted)",
                      fontWeight: "700",
                    }}
                  >
                    {isCompleted ? "✓" : step.index}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: isCurrent ? "var(--ink)" : "var(--muted)" }}>
                    {step.title}
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)", display: "block", paddingLeft: "30px" }}>
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "18px", padding: "20px" }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase" }}>
            Estimated Arrival
          </span>
          <strong style={{ display: "block", font: "400 28px var(--serif)", color: "var(--ink)", marginTop: "4px" }}>
            {formatDuration(trackingData.etaMinutes)}
          </strong>
          <small style={{ color: "var(--gold-dark)", fontSize: "12px" }}>
            {formatEta(trackingData.etaMinutes)}
          </small>
        </div>

        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "18px", padding: "20px" }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase" }}>
            Distance Remaining
          </span>
          <strong style={{ display: "block", font: "400 28px var(--serif)", color: "var(--ink)", marginTop: "4px" }}>
            {formatDistance(trackingData.distanceMeters)}
          </strong>
          <small style={{ color: "var(--muted)", fontSize: "12px" }}>
            Addis Ababa route
          </small>
        </div>

        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "18px", padding: "20px" }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase" }}>
            Courier Speed
          </span>
          <strong style={{ display: "block", font: "400 28px var(--serif)", color: "var(--ink)", marginTop: "4px" }}>
            {trackingData.courier?.speedKmh || 0} <span style={{ fontSize: "16px", fontFamily: "var(--mono)" }}>km/h</span>
          </strong>
          <small style={{ color: "#16a34a", fontSize: "12px" }}>
            ● Telemetry Live
          </small>
        </div>

        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "18px", padding: "20px" }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase" }}>
            Total Amount
          </span>
          <strong style={{ display: "block", font: "400 28px var(--serif)", color: "var(--ink)", marginTop: "4px" }}>
            {formatCurrency(orderDetails.total)}
          </strong>
          <small style={{ color: "var(--muted)", fontSize: "12px" }}>
            Payment upon arrival
          </small>
        </div>
      </div>

      {/* Main Map & Courier Details Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "28px", alignItems: "start" }}>
        {/* Leaflet Map Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Interactive Route</p>
              <h2 style={{ font: "400 26px var(--serif)", margin: "2px 0 0 0" }}>Live Map Navigation</h2>
            </div>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Updated {formatDateTime(trackingData.timestamp)}
            </span>
          </div>

          <OrderMap
            restaurantLocation={{ lat: 9.0015, lng: 38.7842, name: "Addis Eats Bole Kitchen" }}
            deliveryLocation={{
              lat: 9.0195,
              lng: 38.7632,
              address: formatAddress(orderDetails.customer?.address),
            }}
            courierLocation={trackingData.courier}
            status={trackingData.status}
            etaMinutes={trackingData.etaMinutes}
            distanceMeters={trackingData.distanceMeters}
          />
        </div>

        {/* Right Column: Courier Card & Order Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Courier Card */}
          <div
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
            }}
          >
            <p className="eyebrow" style={{ margin: "0 0 12px 0" }}>Your Courier</p>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--soft-gold)",
                  color: "var(--gold-dark)",
                  fontSize: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--gold)",
                  flexShrink: 0,
                }}
              >
                🛵
              </div>
              <div>
                <strong style={{ display: "block", font: "400 20px var(--serif)", color: "var(--ink)" }}>
                  {trackingData.courier?.name || "Dawit Haile"}
                </strong>
                <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                  ⭐ 4.95 Rating · 1,420 deliveries
                </span>
                <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--gold-dark)" }}>
                  {trackingData.courier?.vehicle}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <a
                href={`tel:${trackingData.courier?.phone}`}
                className="button button-dark"
                style={{ flex: 1, padding: "10px", fontSize: "13px", justifyContent: "center" }}
              >
                📞 Call {formatPhoneNumber(trackingData.courier?.phone)}
              </a>
            </div>
          </div>

          {/* Delivery Destination Summary */}
          <div
            style={{
              background: "var(--soft)",
              border: "1px solid var(--line)",
              borderRadius: "20px",
              padding: "24px",
            }}
          >
            <p className="eyebrow" style={{ margin: "0 0 8px 0" }}>Delivery Information</p>
            <div style={{ marginBottom: "14px" }}>
              <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                Deliver To
              </span>
              <strong style={{ display: "block", fontSize: "15px", color: "var(--ink)", marginTop: "2px" }}>
                {orderDetails.customer?.name}
              </strong>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                {formatPhoneNumber(orderDetails.customer?.phone)}
              </span>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                Address
              </span>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--ink)" }}>
                {formatAddress(orderDetails.customer?.address)}
              </p>
              {orderDetails.customer?.note && (
                <small style={{ display: "block", marginTop: "4px", color: "var(--gold-dark)", fontStyle: "italic" }}>
                  Note: "{orderDetails.customer?.note}"
                </small>
              )}
            </div>

            <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "16px 0" }} />

            <div>
              <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                Items Ordered
              </span>
              <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {orderDetails.items?.map((item, idx) => {
                  const dishName = item.dish?.name || item.name || "Special Dish";
                  const price = item.dish?.price || item.price || 0;
                  return (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span>{item.quantity} × {dishName}</span>
                      <strong style={{ fontFamily: "var(--mono)" }}>{formatCurrency(price * item.quantity)}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
