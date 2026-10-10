'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDishesStore } from "@/store/dishesStore";
import { useAuthStore } from "@/store/authStore";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useOrdersStore } from "@/store/ordersStore";
import { ErrorMessage, Spinner } from "@/components/ui/States";
import useSWR from "swr";
import { fetcher } from "@/lib/dishes";
import { useAdminModifications } from "@/store/dishesStore";
import { useMemo } from "react";
import { logoutAction } from "@/app/actions/auth";

export default function AdminDashboardPage() {
  const { data: baseDishes, error, isLoading } = useSWR('/menu-data.json', fetcher);
  const mods = useAdminModifications();
  const dishes = useMemo(() => {
    if (!baseDishes) return [];
    let active = baseDishes.filter((d) => !mods.removed.includes(d.id));
    active = active.map((d) => (mods.updated[d.id] ? { ...d, ...mods.updated[d.id] } : d));
    return [...active, ...mods.added];
  }, [baseDishes, mods]);

  const signOutAdmin = useAdminAuthStore((state) => state.signOut);
  const signOutUser = useAuthStore((state) => state.signOut);
  const orders = useOrdersStore((state) => state.orders);
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);

  const router = useRouter();

  const logout = async () => {
    await logoutAction(true);
    signOutUser();
    signOutAdmin();
    router.replace("/login");
  };

  const categories = dishes
    ? new Set(dishes.map((dish) => dish.category)).size
    : 0;
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const newOrders = orders.filter((order) => order.status === "New").length;

  return (
    <>
      <div className="admin-heading" style={{ marginBottom: "30px" }}>
        <div>
          <p className="eyebrow">Addis Eats / private area</p>
          <h1>Dashboard</h1>
          <p>
            Manage the menu, incoming orders, customer details, and service
            status from one place.
          </p>
        </div>
        <button className="button button-light" onClick={logout}>
          Sign out
        </button>
      </div>
      {isLoading && <Spinner label="Loading dashboard" />}
      {error && <ErrorMessage onRetry={() => window.location.reload()} />}
      {!isLoading && !error && (
        <>
          <section className="admin-stats">
            <div>
              <span>Orders</span>
              <strong>{orders.length}</strong>
            </div>
            <div>
              <span>New orders</span>
              <strong>{newOrders}</strong>
            </div>
            <div>
              <span>Revenue</span>
              <strong>
                {revenue} <small>ETB</small>
              </strong>
            </div>
          </section>
          <section className="admin-panel orders-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">Customer activity</p>
                <h2>Incoming orders</h2>
              </div>
              <span className="admin-live-status">● Live in this browser</span>
            </div>
            {orders.length === 0 ? (
              <p className="admin-empty">
                No orders yet. Completed customer checkouts will appear here.
              </p>
            ) : (
              <div className="admin-orders">
                {orders.map((order) => (
                  <article className="admin-order" key={order.id}>
                    <div className="admin-order-heading">
                      <div>
                        <strong>{order.id}</strong>
                        <span>
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <select
                        value={order.status}
                        onChange={(event) =>
                          updateOrderStatus(order.id, event.target.value)
                        }
                        aria-label={`Update status for ${order.id}`}
                      >
                        <option>New</option>
                        <option>Preparing</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                    <div className="admin-order-details">
                      <div>
                        <span>Customer</span>
                        <strong>{order.customer.name}</strong>
                        <small>{order.customer.phone}</small>
                      </div>
                      <div>
                        <span>Deliver to</span>
                        <strong>{order.customer.address}</strong>
                        {order.customer.note && (
                          <small>Note: {order.customer.note}</small>
                        )}
                      </div>
                      <div>
                        <span>Order total</span>
                        <strong>{order.total} ETB</strong>
                        <small>
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          items
                        </small>
                      </div>
                    </div>
                    <div className="admin-order-items">
                      {order.items.map((item) => (
                        <span key={item.dish.id}>
                          {item.quantity} × {item.dish.name}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">Current menu</p>
                <h2>Dish catalogue</h2>
              </div>
              <Link className="button button-dark" href="/menu">
                View storefront <span>↗</span>
              </Link>
            </div>
            <div className="admin-table">
              {dishes.map((dish) => (
                <div className="admin-row" key={dish.id}>
                  <div
                    className="admin-row-image"
                    style={{ backgroundImage: `url(${dish.image})` }}
                  />
                  <div>
                    <strong>{dish.name}</strong>
                    <span>{dish.category}</span>
                  </div>
                  <b>{dish.price} ETB</b>
                  <Link
                    href={`/menu/${dish.id}`}
                    aria-label={`View ${dish.name}`}
                  >
                    ↗
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
