'use client';

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useOrdersStore } from "@/store/ordersStore";
import { useToastStore } from "@/store/toastStore";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import gsap from "gsap";
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
  formatAddress,
  formatPhoneNumber,
} from "@/lib/formatters";
import { downloadOrdersCSV } from "@/lib/csvExport";

export default function AdminOrdersPage() {
  const orders = useOrdersStore((state) => state.orders);
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);
  const removeOrder = useOrdersStore((state) => state.removeOrder);
  const showToast = useToastStore((state) => state.showToast);
  const pageRef = useRef(null);

  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      const headings = pageRef.current.querySelectorAll(".admin-panel-heading > *, .admin-empty");
      if (headings.length > 0) {
        gsap.from(headings, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        });
      }
      const orderCards = pageRef.current.querySelectorAll(".admin-order");
      if (orderCards.length > 0) {
        gsap.from(orderCards, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.2,
        });
      }
    }, pageRef);
    return () => ctx.revert();
  }, [orders.length]);

  const handleStatusChange = (id, value) => {
    updateOrderStatus(id, value);
    showToast(`Order status updated to ${value}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      removeOrder(id);
      showToast("Order deleted successfully");
    }
  };

  const handleExportCSV = () => {
    downloadOrdersCSV(orders, `addis-eats-orders-all-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast("Downloaded all orders CSV");
  };

  return (
    <section className="admin-panel" ref={pageRef}>
      <div className="admin-panel-heading" style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>Fleet & Dispatch Management</p>
          <h2 style={{ font: "400 32px var(--serif)", margin: "4px 0 0 0" }}>Active & Past Orders</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={handleExportCSV}
            className="button button-light"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span>📥</span> Export All CSV
          </button>
          <span className="admin-stats-badge">{orders.length} total orders</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="admin-empty">No orders to manage yet. Customer checkouts will appear here.</p>
      ) : (
        <div className="admin-orders">
          {orders.map((order) => {
            const statusMeta = formatOrderStatus(order.status);
            return (
              <article className="admin-order premium-card" key={order.id} style={{ borderLeft: `4px solid ${statusMeta.color}` }}>
                <div className="admin-order-heading">
                  <div>
                    <strong>{order.id}</strong>
                    <span>{formatDateTime(order.createdAt)}</span>
                    <span className="customer-info">
                      {order.customer?.name} · {formatPhoneNumber(order.customer?.phone)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Link
                      href={`/orders/${encodeURIComponent(order.id)}/track`}
                      className="button button-dark"
                      style={{ padding: "8px 14px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <span>🛵</span> Live Radar <span>↗</span>
                    </Link>
                    <button
                      className="button button-light delete-btn"
                      type="button"
                      onClick={() => handleDelete(order.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="admin-order-details">
                  <div>
                    <span>Items</span>
                    <strong>
                      {(order.items || [])
                        .map(({ dish, quantity, name }) => `${quantity} × ${dish?.name || name || "Item"}`)
                        .join(", ")}
                    </strong>
                  </div>
                  <div>
                    <span>Deliver To</span>
                    <strong>{formatAddress(order.customer?.address)}</strong>
                    {order.customer?.note && (
                      <small>Note: {order.customer.note}</small>
                    )}
                  </div>
                  <div>
                    <span>Order Value</span>
                    <strong>{formatCurrency(order.total)}</strong>
                    <small>Payment upon arrival</small>
                  </div>
                  <div style={{ minWidth: "170px" }}>
                    <span>Live Status</span>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Preparing">Preparing</SelectItem>
                        <SelectItem value="Delivering">Delivering</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
