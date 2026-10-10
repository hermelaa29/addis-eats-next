# Addis Eats Pro - Next.js Migration

This repository contains the Next.js migration of the Addis Eats application, originally built with React and Vite.

## Recent Updates (Days 41-45)

- **Data Fetching (Day 41)**: Client-side data fetching is now powered by SWR, providing automatic revalidation and caching. Server components fetch initial data directly from the filesystem (`lib/server-dishes.js`) and pass it down as `fallbackData`. A debounced search mechanism is implemented for the menu filter.
- **Auth & Security (Day 42)**: Authentication has transitioned from local mock state to Next.js Server Actions with secure, `HttpOnly` cookies. Route protection is enforced via `proxy.js` (Next.js 16 Edge Middleware), preventing unauthorized access to the `/admin` area.
- **Performance (Day 43)**: `next/image` is used in key components (e.g. `DishCard.jsx`) to automatically optimize image sizes and formats. `next/font/google` is integrated in the root layout to prevent layout shifts (CLS) and external render-blocking font requests. Initial JavaScript load has been reduced by separating Server and Client components.
- **Metadata & SEO (Day 44)**: Comprehensive metadata, Open Graph tags, canonical URLs, JSON-LD structured data (for products), dynamically generated `/sitemap.xml`, and `/robots.txt` have been configured.

## Running the App

```bash
npm install
npm run dev
```

To build for production:

```bash
npm run build
npm start
```
