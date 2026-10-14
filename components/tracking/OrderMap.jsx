'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { formatCoordinates, formatDistance, formatDuration, formatOrderStatus } from "@/lib/formatters";

export default function OrderMap({
  restaurantLocation = { lat: 9.0015, lng: 38.7842, name: "Addis Eats Bole Kitchen" },
  deliveryLocation = { lat: 9.0195, lng: 38.7632, address: "Kazanchis, Addis Ababa" },
  courierLocation = { lat: 9.0068, lng: 38.7765, name: "Dawit Haile", speedKmh: 32 },
  status = "Delivering",
  etaMinutes = 18,
  distanceMeters = 2200,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      // Ensure container has not been disposed
      if (!isMounted || !mapContainerRef.current) return;

      // Base map centered between restaurant and destination
      const centerLat = (restaurantLocation.lat + deliveryLocation.lat) / 2;
      const centerLng = (restaurantLocation.lng + deliveryLocation.lng) / 2;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: true,
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Warm, elegant CartoDB Positron / OSM tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Custom SVG Icons
      const restaurantIcon = L.divIcon({
        className: "leaflet-kitchen-pin",
        html: `
          <div style="
            background: #95621c;
            color: #fff;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 4px 14px rgba(149, 98, 28, 0.4);
            border: 2px solid #fff;
          ">
            🍳
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const destinationIcon = L.divIcon({
        className: "leaflet-destination-pin",
        html: `
          <div style="
            background: #dc2626;
            color: #fff;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 14px rgba(220, 38, 38, 0.45);
            border: 3px solid #fff;
            animation: bounce 2s infinite ease-in-out;
          ">
            📍
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const courierIcon = L.divIcon({
        className: "leaflet-courier-pin",
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: rgba(37, 99, 235, 0.25);
              animation: courier-pulse 1.8s infinite ease-out;
            "></div>
            <div style="
              position: relative;
              background: #2563eb;
              color: #fff;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5);
              border: 3px solid #fff;
            ">
              🛵
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Add Kitchen Marker
      const restMarker = L.marker([restaurantLocation.lat, restaurantLocation.lng], {
        icon: restaurantIcon,
      }).addTo(map);
      restMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #95621c; display: block; font-size: 14px;">${restaurantLocation.name}</strong>
          <span style="font-size: 11px; color: #666;">Central Dispatch Kitchen</span>
        </div>
      `);

      // Add Destination Marker
      const destMarker = L.marker([deliveryLocation.lat, deliveryLocation.lng], {
        icon: destinationIcon,
      }).addTo(map);
      destMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #dc2626; display: block; font-size: 14px;">Delivery Address</strong>
          <span style="font-size: 12px; color: #333;">${deliveryLocation.address}</span>
        </div>
      `);

      // Add Courier Marker
      const courierMarker = L.marker([courierLocation.lat, courierLocation.lng], {
        icon: courierIcon,
      }).addTo(map);
      courierMarkerRef.current = courierMarker;

      // Add Polyline Route (Restaurant -> Courier -> Destination)
      const routePoints = [
        [restaurantLocation.lat, restaurantLocation.lng],
        [courierLocation.lat, courierLocation.lng],
        [deliveryLocation.lat, deliveryLocation.lng],
      ];

      const routeLine = L.polyline(routePoints, {
        color: "#c99235",
        weight: 4,
        opacity: 0.85,
        dashArray: "6, 8",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      routeLineRef.current = routeLine;

      // Fit bounds nicely with padding
      map.fitBounds(L.latLngBounds(routePoints), {
        padding: [60, 60],
        maxZoom: 15,
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update courier location smoothly when props change via SSE
  useEffect(() => {
    if (!mapInstanceRef.current || !courierMarkerRef.current) return;

    import("leaflet").then(({ default: L }) => {
      const newPos = [courierLocation.lat, courierLocation.lng];
      courierMarkerRef.current.setLatLng(newPos);

      // Update popup content with latest speed and coordinates
      const statusMeta = formatOrderStatus(status);
      courierMarkerRef.current.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 160px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <strong style="color: #2563eb; font-size: 14px;">${courierLocation.name || "Courier"}</strong>
            <span style="font-size: 10px; background: ${statusMeta.bgColor}; color: ${statusMeta.color}; padding: 2px 6px; border-radius: 99px; font-weight: 600;">
              ${statusMeta.label}
            </span>
          </div>
          <div style="font-size: 12px; color: #444; line-height: 1.4;">
            <div>Speed: <b>${courierLocation.speedKmh || 0} km/h</b></div>
            <div>Distance remaining: <b>${formatDistance(distanceMeters)}</b></div>
            <div>ETA: <b>${formatDuration(etaMinutes)}</b></div>
            <div style="color: #888; font-size: 10px; margin-top: 4px;">${formatCoordinates(courierLocation.lat, courierLocation.lng)}</div>
          </div>
        </div>
      `);

      // Update Route Polyline
      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs([
          [restaurantLocation.lat, restaurantLocation.lng],
          newPos,
          [deliveryLocation.lat, deliveryLocation.lng],
        ]);
      }
    });
  }, [courierLocation.lat, courierLocation.lng, courierLocation.speedKmh, status, etaMinutes, distanceMeters]);

  const handleCenterOnCourier = () => {
    if (mapInstanceRef.current && courierLocation.lat) {
      mapInstanceRef.current.setView([courierLocation.lat, courierLocation.lng], 15, {
        animate: true,
      });
      courierMarkerRef.current?.openPopup();
    }
  };

  const handleFitAll = () => {
    if (mapInstanceRef.current) {
      import("leaflet").then(({ default: L }) => {
        const bounds = L.latLngBounds([
          [restaurantLocation.lat, restaurantLocation.lng],
          [courierLocation.lat, courierLocation.lng],
          [deliveryLocation.lat, deliveryLocation.lng],
        ]);
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          animate: true,
        });
      });
    }
  };

  return (
    <div className="order-map-wrapper" style={{ position: "relative", width: "100%", height: "460px", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
      <style jsx global>{`
        @keyframes courier-pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .leaflet-container {
          width: 100%;
          height: 100%;
          background: #fdfaf5;
          font-family: inherit;
        }
      `}</style>

      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* Floating Map Controls */}
      <div style={{ position: "absolute", top: "16px", right: "16px", zIndex: 1000, display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={handleCenterOnCourier}
          style={{
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            borderRadius: "10px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <span>🛵</span> Focus Courier
        </button>
        <button
          type="button"
          onClick={handleFitAll}
          style={{
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            borderRadius: "10px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <span>🗺️</span> View Whole Route
        </button>
      </div>

      {/* Live Indicator overlay badge */}
      <div style={{
        position: "absolute",
        bottom: "16px",
        left: "16px",
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(8px)",
        borderRadius: "99px",
        padding: "6px 14px",
        fontSize: "11px",
        fontFamily: "var(--mono)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        border: "1px solid var(--line)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}>
        <span style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#16a34a",
          boxShadow: "0 0 0 4px rgba(22, 163, 74, 0.2)",
          display: "inline-block",
        }} />
        <span style={{ fontWeight: 600, color: "var(--ink)" }}>LIVE GPS TRACKING</span>
        <span style={{ color: "var(--muted)" }}>· {formatCoordinates(courierLocation.lat, courierLocation.lng)}</span>
      </div>
    </div>
  );
}
