'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { logoutAction } from "@/app/actions/auth";
import { useOrdersStore } from "@/store/ordersStore";
import { downloadOrdersCSV } from "@/lib/csvExport";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  ExternalLink,
  LogOut,
  Menu,
  X,
  FileSpreadsheet,
  TrendingUp,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { admin, signOut } = useAdminAuthStore();
  const orders = useOrdersStore((state) => state.orders);
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    await logoutAction(true);
    signOut();
    router.push("/login");
  };

  useEffect(() => {
    if (mounted && !admin && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [mounted, admin, router, pathname]);

  if (!mounted) return null;
  if (!admin && pathname !== "/admin/login") return null;

  // Unauthenticated login page doesn't need sidebar
  if (!admin || pathname === "/admin/login") {
    return <>{children}</>;
  }

  const isActive = (href, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleExportCSV = () => {
    downloadOrdersCSV(orders, `addis-eats-admin-orders-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="admin-shell">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1050,
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* LEFT-SIDE SIDEBAR */}
      <aside
        className={`admin-sidebar ${mobileSidebarOpen ? "is-open" : ""}`}
        aria-label="Admin control sidebar"
      >
        {/* Sidebar Brand Header */}
        <div className="admin-sidebar-header">
          <Link href="/admin" className="brand" onClick={() => setMobileSidebarOpen(false)}>
            <span className="brand-dot">✦</span>
            <span>
              Addis <i>Admin</i>
            </span>
          </Link>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin User Badge */}
        <div className="admin-profile-badge">
          <div className="admin-avatar">
            <span>🛡️</span>
          </div>
          <div className="admin-profile-info">
            <strong>Control Room</strong>
            <span>
              <span className="live-dot" /> Online Operator
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="admin-sidebar-nav" aria-label="Sidebar Navigation">
          <div className="admin-nav-group-label">Core Management</div>
          <Link
            href="/admin"
            className={`admin-nav-item ${isActive("/admin", true) ? "active" : ""}`}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/menu"
            className={`admin-nav-item ${isActive("/admin/menu") ? "active" : ""}`}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <UtensilsCrossed size={18} />
            <span>Menu Catalogue</span>
          </Link>

          <Link
            href="/admin/orders"
            className={`admin-nav-item ${isActive("/admin/orders") ? "active" : ""}`}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <ShoppingBag size={18} />
            <span>Orders & Dispatch</span>
            {orders.length > 0 && (
              <span className="admin-nav-badge">{orders.length}</span>
            )}
          </Link>

          <div className="admin-nav-group-label" style={{ marginTop: "24px" }}>
            Tools & Quick Actions
          </div>

          <button
            type="button"
            className="admin-nav-item admin-nav-action"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet size={18} />
            <span>Export Orders (CSV)</span>
          </button>

          <Link
            href="/menu"
            className="admin-nav-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={18} />
            <span>Live Storefront ↗</span>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <button
            type="button"
            onClick={handleSignOut}
            className="admin-signout-btn"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
          <div className="admin-sidebar-meta">
            <span>Addis Eats Pro v2.4</span>
            <span style={{ color: "var(--gold)" }}>● Live System</span>
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT WRAPPER */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="admin-breadcrumb">
              <span style={{ color: "var(--muted)" }}>Admin</span>
              <span style={{ color: "var(--line)" }}>/</span>
              <strong>
                {pathname === "/admin"
                  ? "Dashboard & Analytics"
                  : pathname === "/admin/menu"
                  ? "Menu Management"
                  : pathname === "/admin/orders"
                  ? "Orders & Dispatch"
                  : "Overview"}
              </strong>
            </div>
          </div>

          <div className="admin-topbar-right">
            <button
              type="button"
              onClick={handleExportCSV}
              className="button button-light admin-export-btn"
            >
              <FileSpreadsheet size={15} />
              <span>Export CSV</span>
            </button>
            <Link
              href="/menu"
              className="button button-dark admin-store-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View Storefront</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="admin-body">
          {children}
        </div>
      </div>
    </div>
  );
}
