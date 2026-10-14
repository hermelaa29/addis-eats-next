'use client';

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useToastStore } from "@/store/toastStore";
import { useRequireAuth } from "@/lib/useRequireAuth";
import useSWR from "swr";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
  formatAddress,
} from "@/lib/formatters";
import { downloadOrdersCSV } from "@/lib/csvExport";

gsap.registerPlugin(ScrollTrigger);

export default function OrdersPage() {
  const { isReady } = useRequireAuth("/orders");
  const initialOrders = useOrdersStore((state) => state.orders);

  const { data: orders = [] } = useSWR(
    'orders-live',
    () => {
      if (typeof window !== "undefined") {
        const parsed = JSON.parse(localStorage.getItem("addis-eats-orders"));
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    },
    {
      fallbackData: initialOrders,
      revalidateOnFocus: false,
    }
  );

  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);
  const pageRef = useRef(null);

  useEffect(() => {
    if (!isReady || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".page-intro > *", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, pageRef);
    return () => ctx.revert();
  }, [isReady]);

  useEffect(() => {
    if (!isReady || orders.length === 0 || !pageRef.current) return;
    const ctx = gsap.context(() => {
      const articles = document.querySelectorAll(".admin-order");
      articles.forEach((article) => {
        gsap.from(article, {
          scrollTrigger: {
            trigger: article,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.1,
        });
      });
    }, pageRef);
    return () => ctx.revert();
  }, [isReady, orders.length]);

  if (!isReady) return null;

  const reorder = (order) => {
    order.items.forEach(({ dish, quantity }) => {
      Array.from({ length: quantity }).forEach(() => addItem(dish));
    });
    showToast("Added previous order to cart");
  };

  const handleExportCSV = () => {
    downloadOrdersCSV(orders, `addis-eats-my-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast("Order history exported as CSV");
  };

  const activeOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Completed" && o.status !== "Cancelled"
  );
  const pastOrders = orders.filter(
    (o) => o.status === "Delivered" || o.status === "Completed" || o.status === "Cancelled"
  );

  return (
    <main className="page" ref={pageRef}>
      <div className="page-intro" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="eyebrow">Your table, remembered</p>
          <h1>Order history.</h1>
          <p>Find a favourite order, track delivery in real time, or export your records.</p>
        </div>

        {orders.length > 0 && (
          <div>
            <button
              type="button"
              className="button button-light"
              onClick={handleExportCSV}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>📥</span> Export History (CSV)
            </button>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="state state-empty">
          <h2>No past orders yet</h2>
          <p>Your completed orders will appear here.</p>
          <Link className="button button-dark" href="/menu">
            Browse the menu
          </Link>
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 0 4px rgba(22, 163, 74, 0.2)" }} />
                <h2 style={{ margin: 0 }}>Active Deliveries</h2>
              </div>
              <div className="admin-orders">
                {activeOrders.map((order) => {
                  const statusMeta = formatOrderStatus(order.status);
                  return (
                    <article
                      className="admin-order"
                      key={order.id}
                      style={{
                        borderLeft: `4px solid ${statusMeta.color}`,
                        background: "var(--soft)",
                        boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div className="admin-order-heading">
                        <div>
                          <strong>{order.id}</strong>
                          <span>{formatDateTime(order.createdAt)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "99px",
                              fontSize: "11px",
                              fontFamily: "var(--mono)",
                              fontWeight: "700",
                              background: statusMeta.bgColor,
                              color: statusMeta.color,
                            }}
                          >
                            {statusMeta.label}
                          </span>
                          <Link
                            href={`/orders/${encodeURIComponent(order.id)}/track`}
                            className="button button-dark"
                            style={{ padding: "8px 14px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <span>🛵</span> Track Live <span>↗</span>
                          </Link>
                        </div>
                      </div>

                      <div className="admin-order-details">
                        <div>
                          <span>Items</span>
                          <strong>
                            {order.items
                              .map(({ dish, quantity }) => `${quantity} × ${dish.name}`)
                              .join(", ")}
                          </strong>
                        </div>
                        <div>
                          <span>Deliver to</span>
                          <strong>{formatAddress(order.customer?.address)}</strong>
                        </div>
                        <div>
                          <span>Total</span>
                          <strong>{formatCurrency(order.total)}</strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {pastOrders.length > 0 && (
            <div>
              <h2 style={{ marginBottom: "1.5rem" }}>Past Orders</h2>
              <div className="admin-orders">
                {pastOrders.map((order) => {
                  const statusMeta = formatOrderStatus(order.status);
                  return (
                    <article className="admin-order" key={order.id}>
                      <div className="admin-order-heading">
                        <div>
                          <strong>{order.id}</strong>
                          <span>{formatDateTime(order.createdAt)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "99px",
                              fontSize: "11px",
                              fontFamily: "var(--mono)",
                              background: statusMeta.bgColor,
                              color: statusMeta.color,
                            }}
                          >
                            {statusMeta.label}
                          </span>
                          <Link
                            href={`/orders/${encodeURIComponent(order.id)}/track`}
                            className="button button-light"
                            style={{ padding: "6px 12px", fontSize: "11px" }}
                          >
                            View Map
                          </Link>
                        </div>
                      </div>

                      <div className="admin-order-details">
                        <div>
                          <span>Items</span>
                          <strong>
                            {order.items
                              .map(({ dish, quantity }) => `${quantity} × ${dish.name}`)
                              .join(", ")}
                          </strong>
                        </div>
                        <div>
                          <span>Deliver to</span>
                          <strong>{formatAddress(order.customer?.address)}</strong>
                        </div>
                        <div>
                          <span>Total</span>
                          <strong>{formatCurrency(order.total)}</strong>
                        </div>
                      </div>

                      <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
                        <button
                          className="button button-dark"
                          type="button"
                          onClick={() => reorder(order)}
                          style={{ padding: "8px 16px", fontSize: "12px" }}
                        >
                          Reorder <span>+</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
