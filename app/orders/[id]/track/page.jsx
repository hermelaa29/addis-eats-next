import { Suspense } from "react";
import TrackingClient from "./TrackingClient";
import { Spinner } from "@/components/ui/States";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || "Live Order";
  return {
    title: `Track Order ${id} | Addis Eats`,
    description: `Real-time satellite GPS tracking and live courier dispatch feed for order ${id}.`,
  };
}

export default async function OrderTrackPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || "AE-LIVE";

  // Server-rendered initial seed
  // Provides instant layout hydration and initial map coordinates before SSE connection kicks in
  const initialSeed = {
    orderId: id,
    status: "Delivering",
    courier: {
      name: "Dawit Haile",
      phone: "+251 91 145 6789",
      vehicle: "TVS Apache 160 (Plate 3-A2941)",
      lat: 9.0068,
      lng: 38.7765,
      speedKmh: 34,
    },
    etaMinutes: 18,
    distanceMeters: 2200,
    stepIndex: 3,
    stepTitle: "On the way along Bole Road",
    stepNote: "Cruising towards your neighborhood. Traffic is flowing smoothly.",
    customerAddress: "Kazanchis, Addis Ababa",
    customerName: "Valued Customer",
    customerPhone: "+251 91 123 4567",
    total: 475,
    timestamp: new Date().toISOString(),
  };

  return (
    <Suspense
      fallback={
        <main className="page" style={{ padding: "60px 20px", textAlign: "center" }}>
          <Spinner label="Seeding real-time tracking radar..." />
        </main>
      }
    >
      <TrackingClient orderId={id} initialSeed={initialSeed} />
    </Suspense>
  );
}
