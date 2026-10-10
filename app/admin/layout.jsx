'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuthStore";

import { logoutAction } from "@/app/actions/auth";

export default function AdminLayout({ children }) {
  const { admin, signOut } = useAdminAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await logoutAction(true);
    signOut();
    router.push("/login");
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !admin && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [mounted, admin, router, pathname]);

  if (!mounted) return null;
  if (!admin && pathname !== "/admin/login") return null;

  if (!admin) return <>{children}</>;

  const isActive = (href, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <main className="page admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Addis Eats / private area</p>
          <h1>Control room</h1>
        </div>
        <button
          className="button button-light"
          type="button"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
      <nav className="category-bar" aria-label="Admin navigation">
        <Link
          className={`category${isActive("/admin", true) ? " active" : ""}`}
          href="/admin"
        >
          Dashboard
        </Link>
        <Link
          className={`category${isActive("/admin/menu") ? " active" : ""}`}
          href="/admin/menu"
        >
          Menu
        </Link>
        <Link
          className={`category${isActive("/admin/orders") ? " active" : ""}`}
          href="/admin/orders"
        >
          Orders
        </Link>
        <Link className="category" href="/menu">
          Storefront
        </Link>
      </nav>
      {children}
    </main>
  );
}
