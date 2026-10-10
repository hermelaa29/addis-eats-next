# Addis Eats - Next.js Food Delivery Application

Addis Eats is a modern, high-performance web application built with Next.js 14+ that allows users to browse and order authentic Ethiopian food. This project was migrated from a standard React/Vite app to take full advantage of Next.js App Router features including Server Components, Edge Middleware, and advanced SEO optimization.

## 🌟 Key Features & Why We Use Them

### 1. SWR (Stale-While-Revalidate)
**Why we use it:** To provide lightning-fast, highly responsive user experiences while keeping data synchronized.
- **How it works:** SWR serves cached data immediately, fetches updated data in the background, and then seamlessly updates the UI. We pair this with Next.js Server Components, which fetch initial data on the server and pass it as `fallbackData` to SWR. This ensures the user sees the menu instantly on page load, while SWR takes over on the client for live filtering and real-time updates without reloading the page.

### 2. 3-Layer Security
**Why we use it:** To guarantee that sensitive admin areas and data cannot be accessed by unauthorized users, utilizing Next.js's secure architecture.
- **Layer 1: Edge Middleware (`proxy.js`)**: Runs on the Edge network before a request even reaches the server. It checks for a secure `admin_token` cookie. If an unauthenticated user tries to visit `/admin`, they are instantly redirected to `/unauthorized` or `/login`.
- **Layer 2: Server Actions (`app/actions/auth.js`)**: Authentication happens entirely on the server. We use Next.js Server Actions to process login credentials, meaning API keys and logic are never exposed to the client. The session is stored in an `HttpOnly` cookie, making it immune to Cross-Site Scripting (XSS) attacks.
- **Layer 3: Client-Side Route Protection (`lib/useRequireAuth.js`)**: A custom React hook that prevents UI flickering. If a user logs out while on an admin page, the client-side state instantly pushes them out, providing a smooth user experience alongside the hard server-side protection.

### 3. File & Asset Optimization
**Why we use it:** To achieve a perfect Lighthouse score, minimize bandwidth usage, and provide a fast experience even on slow 3G networks.
- **Images:** We use Next.js `<Image>` component (`next/image`) in `DishCard.jsx` and other areas. This automatically converts heavy images to modern formats like WebP, resizes them based on the user's device screen, and lazy-loads them only when they scroll into view.
- **Fonts:** We use `next/font/google` in `layout.jsx`. Fonts are downloaded at build time and hosted alongside the app. This eliminates external network requests to Google Fonts and completely removes Cumulative Layout Shift (CLS).
- **Code Splitting:** By separating Server Components (UI that doesn't need interactivity) from Client Components (interactive elements marked with `"use client"`), we drastically reduce the amount of JavaScript sent to the browser.

### 4. Advanced SEO (Search Engine Optimization)
**Why we use it:** To ensure Addis Eats ranks #1 on Google and looks beautiful when shared on social media (Telegram, Twitter, Facebook).
- **Dynamic Metadata & OpenGraph:** `app/layout.jsx` and `app/menu/[slug]/page.jsx` generate dynamic `<title>`, `<meta name="description">`, OpenGraph (`og:image`), and Twitter Card tags. This allows rich previews when sharing specific dish URLs.
- **JSON-LD Structured Data:** In `app/menu/[slug]/page.jsx`, we inject schema.org `<script type="application/ld+json">` tags. This tells Google exactly what the product is, its price, and availability, enabling Rich Snippets in search results.
- **Sitemap & Robots:** Dynamically generated `sitemap.xml` and `robots.txt` automatically index new menu items while hiding private admin routes from search engines.

---

## 📂 File Structure & Usage Guide

### Root Directory
- **`next.config.mjs`**: The Next.js configuration file (handles build settings, remote image domains like Unsplash).
- **`proxy.js`**: Next.js Edge Middleware. Secures the `/admin` routes by checking cookies before requests complete.
- **`package.json`**: Lists dependencies (Zustand, SWR, GSAP, etc.) and run scripts.

### `app/` (App Router)
This folder contains the routing and server-side logic of the application.
- **`layout.jsx`**: The root HTML shell. Defines global fonts, layout wrappers, and baseline SEO metadata.
- **`page.jsx` & `HomeClient.jsx`**: The Homepage. `page.jsx` fetches data securely on the server and passes it to the interactive `HomeClient.jsx`.
- **`menu/`**: 
  - **`page.jsx` & `MenuClient.jsx`**: The menu listing page. Includes dedicated SEO tags and search filtering.
  - **`[slug]/page.jsx` & `DishDetailClient.jsx`**: Dynamic dish detail pages. Generates specific OpenGraph tags and JSON-LD structured data for the exact dish being viewed.
- **`admin/`**: Protected routes for restaurant staff to manage orders and menu items.
- **`cart/`, `checkout/`, `favorites/`, `orders/`**: Client-side pages for the user's shopping experience.
- **`actions/auth.js`**: Secure Next.js Server Actions for handling login and cookie-based authentication securely on the server.
- **`sitemap.js` & `robots.js`**: Programmatically generates XML sitemaps and indexing rules for SEO.

### `components/`
- **`DishCard.jsx`**: The reusable UI component for displaying a menu item. Implements `next/image` for heavy optimization.
- **`Layout.jsx`**: The global navigation bar and footer layout wrapper.
- **`ui/`**: Reusable low-level UI components (Select dropdowns, Loading spinners).

### `lib/` (Utilities)
- **`server-dishes.js`**: Server-side logic to safely read `menu-data.json` directly from the filesystem (bypassing network requests).
- **`useFetch.js`**: A custom hook wrapping SWR for standardized client-side data fetching and caching.
- **`useRequireAuth.js`**: A client-side hook to protect routes and redirect unauthenticated users.

### `store/` (State Management)
- We use **Zustand** for lightweight, global state management across the app.
- **`cartStore.js`**: Manages the user's shopping cart (add/remove items, total price).
- **`favoritesStore.js`**: Keeps track of the user's liked dishes.
- **`authStore.js` & `adminAuthStore.js`**: Manages the UI state of the logged-in user (syncs with the secure cookies).

### `public/`
- **`menu-data.json`**: Our "database". A JSON file containing all the menu items, prices, and image URLs.

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

To build for production:

```bash
npm run build
npm start
```
