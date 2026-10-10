'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useToastStore } from "@/store/toastStore";

export function Layout({ children }) {
  // Hydration-safe: start with 0 on server, update after mount
  const [mounted, setMounted] = useState(false);

  const itemCount = useCartStore((state) => state.getItemCount());
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const admin = useAdminAuthStore((state) => state.admin);
  const favoriteCount = useFavoritesStore((state) => state.getFavoriteCount());
  const toastMessage = useToastStore((state) => state.message);

  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();

  // Set mounted and read localStorage only on client
  useEffect(() => {
    setMounted(true);
    setDarkMode(localStorage.getItem("addis-eats-theme") === "dark");
  }, []);

  // Scroll listener for navbar blur
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const toggleTheme = () =>
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem("addis-eats-theme", next ? "dark" : "light");
      return next;
    });

  const isActive = (href, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Use 0 before mount to match server render, real values after
  const displayItemCount = mounted ? itemCount : 0;
  const displayFavCount = mounted ? favoriteCount : 0;

  return (
    <div className={`app-shell ${darkMode ? "theme-dark" : "theme-light"}`}>
      <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
        <Link className="brand" href="/" onClick={closeMenu}>
          <span className="brand-dot">✦</span>
          <span>
            Addis <i>Eats</i>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-panel desktop-nav">
          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/" className={isActive("/", true) ? "active" : ""}>
              Our story
            </Link>
            <Link href="/menu" className={isActive("/menu") ? "active" : ""}>
              Menu
            </Link>
            {mounted && user && (
              <Link
                href="/favorites"
                className={isActive("/favorites") ? "active" : ""}
              >
                Favorites{" "}
                {displayFavCount > 0 && (
                  <span className="nav-count">{displayFavCount}</span>
                )}
              </Link>
            )}
            {mounted && user && (
              <Link
                href="/orders"
                className={isActive("/orders") ? "active" : ""}
              >
                Orders
              </Link>
            )}
            {mounted && admin && (
              <Link
                href="/admin"
                className={isActive("/admin") ? "active" : ""}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
            aria-pressed={darkMode}
          >
            <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
            <span>{darkMode ? "Light" : "Dark"}</span>
          </button>

          {mounted && user ? (
            <button className="text-button" onClick={signOut}>
              Sign out
            </button>
          ) : (
            <Link className="text-button" href="/login" onClick={closeMenu}>
              Sign in
            </Link>
          )}

          <Link
            className="cart-link"
            href="/cart"
            aria-label={`Cart with ${displayItemCount} items`}
            onClick={closeMenu}
          >
            Bag <span>{displayItemCount}</span>
          </Link>
        </div>

        {/* Hamburger */}
        <button
          type="button"
          className={`hamburger ${menuOpen ? "is-open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div className={`mobile-menu-overlay ${menuOpen ? "is-open" : ""}`}>
        <div className="mobile-menu-bg" onClick={closeMenu} />
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <Link className="brand" href="/" onClick={closeMenu}>
              <span className="brand-dot">✦</span>
              <span>
                Addis <i>Eats</i>
              </span>
            </Link>
            <button
              type="button"
              className="mobile-menu-close"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              ✕
            </button>
          </div>

          <nav className="mobile-menu-links" aria-label="Mobile navigation">
            <Link href="/" onClick={closeMenu} className={isActive("/", true) ? "active" : ""}>
              <span className="mobile-link-number">01</span>
              <span className="mobile-link-text">Our Story</span>
            </Link>
            <Link href="/menu" onClick={closeMenu} className={isActive("/menu") ? "active" : ""}>
              <span className="mobile-link-number">02</span>
              <span className="mobile-link-text">Menu</span>
            </Link>
            {mounted && user && (
              <Link href="/favorites" onClick={closeMenu} className={isActive("/favorites") ? "active" : ""}>
                <span className="mobile-link-number">03</span>
                <span className="mobile-link-text">Favorites</span>
                {displayFavCount > 0 && (
                  <span className="mobile-link-badge">{displayFavCount}</span>
                )}
              </Link>
            )}
            <Link href="/cart" onClick={closeMenu} className={isActive("/cart") ? "active" : ""}>
              <span className="mobile-link-number">04</span>
              <span className="mobile-link-text">Cart</span>
              {displayItemCount > 0 && (
                <span className="mobile-link-badge">{displayItemCount}</span>
              )}
            </Link>
            {mounted && user && (
              <Link href="/orders" onClick={closeMenu} className={isActive("/orders") ? "active" : ""}>
                <span className="mobile-link-number">05</span>
                <span className="mobile-link-text">Orders</span>
              </Link>
            )}
            {mounted && admin && (
              <Link href="/admin" onClick={closeMenu} className={isActive("/admin") ? "active" : ""}>
                <span className="mobile-link-number">06</span>
                <span className="mobile-link-text">Dashboard</span>
              </Link>
            )}
          </nav>

          <div className="mobile-menu-footer">
            <div className="mobile-menu-actions">
              <button
                className="mobile-menu-action-btn"
                type="button"
                onClick={toggleTheme}
              >
                <span>{darkMode ? "☀" : "☾"}</span>
                {darkMode ? "Light mode" : "Dark mode"}
              </button>
              {mounted && user ? (
                <button
                  className="mobile-menu-action-btn"
                  onClick={() => { signOut(); closeMenu(); }}
                >
                  Sign out
                </button>
              ) : (
                <Link
                  className="mobile-menu-action-btn"
                  href="/login"
                  onClick={closeMenu}
                >
                  Sign in →
                </Link>
              )}
            </div>
            <p className="mobile-menu-tagline">
              Thoughtful Ethiopian dishes,
              <br />
              delivered across Addis.
            </p>
          </div>
        </div>
      </div>

      {children}

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-about">
            <Link className="brand" href="/">
              <span className="brand-dot">✦</span>
              <span>
                Addis <i>Eats</i>
              </span>
            </Link>
            <p>
              Thoughtful Ethiopian dishes, made with local ingredients and
              delivered across Addis with care. Food with a story.
            </p>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/menu">Full Menu</Link></li>
              <li><Link href="/favorites">Favorites</Link></li>
              <li><Link href="/orders">Order History</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li><Link href="/login">Sign in</Link></li>
              <li><Link href="/cart">My Cart</Link></li>
              <li><Link href="/checkout">Checkout</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/">Our Story</Link></li>
              <li><Link href="/">Contact</Link></li>
              <li><Link href="/">Careers</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Addis Eats. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link href="/">Privacy</Link>
            <Link href="/">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Global Toast Notification */}
      <div className={`global-toast ${toastMessage ? "is-visible" : ""}`}>
        <span className="toast-icon">✓</span>
        <span className="toast-message">{toastMessage}</span>
      </div>
    </div>
  );
}
