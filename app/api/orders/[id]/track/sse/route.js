export const dynamic = "force-dynamic";

/**
 * Server-Sent Events (SSE) Route for Live Order Tracking
 * Streams real-time updates for courier coordinates, speed, ETA, and delivery milestones.
 */
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const orderId = resolvedParams?.id || "AE-DEMO";

  // Coordinates across Addis Ababa:
  // Kitchen: Bole Medhanialem (9.0015, 38.7842)
  // Destination: Kazanchis / Central Addis (9.0195, 38.7632)
  const trajectory = [
    {
      status: "Preparing",
      courier: {
        name: "Dawit Haile",
        phone: "+251 91 145 6789",
        vehicle: "TVS Apache 160 (Plate 3-A2941)",
        lat: 9.0015,
        lng: 38.7842,
        speedKmh: 0,
      },
      etaMinutes: 28,
      distanceMeters: 3100,
      stepIndex: 1,
      stepTitle: "Chef is preparing your meal",
      stepNote: "Dishes are being packed in thermal containers to keep them fresh and piping hot.",
    },
    {
      status: "Preparing",
      courier: {
        name: "Dawit Haile",
        phone: "+251 91 145 6789",
        vehicle: "TVS Apache 160 (Plate 3-A2941)",
        lat: 9.002,
        lng: 38.7838,
        speedKmh: 12,
      },
      etaMinutes: 24,
      distanceMeters: 2950,
      stepIndex: 2,
      stepTitle: "Courier arrived at restaurant",
      stepNote: "Dawit has verified the seal on your order package.",
    },
    {
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
    },
    {
      status: "Delivering",
      courier: {
        name: "Dawit Haile",
        phone: "+251 91 145 6789",
        vehicle: "TVS Apache 160 (Plate 3-A2941)",
        lat: 9.0125,
        lng: 38.7695,
        speedKmh: 30,
      },
      etaMinutes: 11,
      distanceMeters: 1400,
      stepIndex: 3,
      stepTitle: "Passing Olympia / Meskel area",
      stepNote: "Entering your sector. Estimated arrival in ~10 minutes.",
    },
    {
      status: "Delivering",
      courier: {
        name: "Dawit Haile",
        phone: "+251 91 145 6789",
        vehicle: "TVS Apache 160 (Plate 3-A2941)",
        lat: 9.0175,
        lng: 38.765,
        speedKmh: 18,
      },
      etaMinutes: 4,
      distanceMeters: 450,
      stepIndex: 3,
      stepTitle: "Courier is nearby (< 500m)",
      stepNote: "Dawit is on your street. Please have payment or reception ready.",
    },
    {
      status: "Delivering",
      courier: {
        name: "Dawit Haile",
        phone: "+251 91 145 6789",
        vehicle: "TVS Apache 160 (Plate 3-A2941)",
        lat: 9.0195,
        lng: 38.7632,
        speedKmh: 0,
      },
      etaMinutes: 1,
      distanceMeters: 40,
      stepIndex: 3,
      stepTitle: "Arrived at your location",
      stepNote: "Courier is waiting outside your gate/entrance.",
    },
    {
      status: "Delivered",
      courier: {
        name: "Dawit Haile",
        phone: "+251 91 145 6789",
        vehicle: "TVS Apache 160 (Plate 3-A2941)",
        lat: 9.0195,
        lng: 38.7632,
        speedKmh: 0,
      },
      etaMinutes: 0,
      distanceMeters: 0,
      stepIndex: 4,
      stepTitle: "Order Delivered!",
      stepNote: "Handover complete. Thank you for ordering with Addis Eats. Melkam Megeb!",
    },
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let step = 0;

      const sendEvent = (eventData) => {
        const payload = `data: ${JSON.stringify(eventData)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // Send initial snapshot immediately
      sendEvent({
        orderId,
        connected: true,
        timestamp: new Date().toISOString(),
        ...trajectory[0],
      });

      // Interval timer to stream next steps
      const intervalId = setInterval(() => {
        step += 1;
        if (step < trajectory.length) {
          sendEvent({
            orderId,
            timestamp: new Date().toISOString(),
            ...trajectory[step],
          });
        } else {
          // Send final keep-alive ping and complete
          sendEvent({
            orderId,
            timestamp: new Date().toISOString(),
            ...trajectory[trajectory.length - 1],
            isComplete: true,
          });
          clearInterval(intervalId);
          controller.close();
        }
      }, 3500); // Progress update every 3.5 seconds

      // Cleanup on client abort
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
