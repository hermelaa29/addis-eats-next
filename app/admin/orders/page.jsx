'use client';

import { useEffect, useRef } from "react";
import { useOrdersStore } from "@/store/ordersStore";
import { useToastStore } from "@/store/toastStore";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import gsap from "gsap";

export default function AdminOrdersPage() {
  const orders = useOrdersStore((state) => state.orders);
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);
  const removeOrder = useOrdersStore((state) => state.removeOrder);
  const showToast = useToastStore((state) => state.showToast);
  const pageRef = useRef(null);

  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".admin-panel-heading > *, .admin-empty", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
      gsap.from(".admin-order", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
      });
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

  return (
    <section className="admin-panel" ref={pageRef}>
      <div className="admin-panel-heading">
        <div>
          <p className="eyebrow">Order management</p>
          <h2>Active Orders</h2>
        </div>
        <span className="admin-stats-badge">{orders.length} total</span>
      </div>
      {orders.length === 0 ? (
        <p className="admin-empty">No orders to manage yet.</p>
      ) : (
        <div className="admin-orders">
          {orders.map((order) => (
            <article className="admin-order premium-card" key={order.id}>
              <div className="admin-order-heading">
                <div>
                  <strong>{order.id}</strong>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                  <span className="customer-info">
                    {order.customer.name} · {order.customer.phone}
                  </span>
                </div>
                <button
                  className="button button-light delete-btn"
                  type="button"
                  onClick={() => handleDelete(order.id)}
                >
                  Delete
                </button>
              </div>
              <div className="admin-order-details">
                <div>
                  <span>Items</span>
                  <strong>
                    {order.items
                      .map(
                        ({ dish, quantity }) => `${quantity} × ${dish.name}`
                      )
                      .join(", ")}
                  </strong>
                </div>
                <div>
                  <span>Deliver To</span>
                  <strong>{order.customer.address}</strong>
                </div>
                <div style={{ minWidth: "180px" }}>
                  <span>Status</span>
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      handleStatusChange(order.id, value)
                    }
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
          ))}
        </div>
      )}
    </section>
  );
}
