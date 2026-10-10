# Data Fetching & State Strategy

This document outlines the data-fetching and state-management architecture for Addis Eats.

## Overview
Data fetching uses a hybrid approach:
- Initial data is fetched on the server during Server-Side Rendering (SSR).
- Client-side navigation and live updates are managed by SWR (`swr`).
- Application-wide user state (Cart, Favorites, Orders) is managed by Zustand with `localStorage` persistence.

## Implementations

### 1. Server-Side Fetching (`lib/dishes.js` & Server Components)
- `fetchDishesServer()` requests `/menu-data.json` at build time or during SSR with Next.js's native `fetch` cache.
- The data is passed down to Client Components as `fallbackData`.

### 2. SWR Integration (`MenuClient.jsx`, `HomeClient.jsx`)
- SWR handles client-side revalidation.
- `useSWR('/menu-data.json', fetcher, { fallbackData })` ensures the page is instantly interactive while keeping data fresh in the background.

### 3. Search & Debouncing
- The Menu search uses `use-debounce` to prevent excessive re-rendering and URL updates.
- Search state is synchronized with the URL query parameters (`?q=...`) to ensure shareable links and preserve state on navigation.

### 4. Admin Modifications (Mocked Live Updates)
- Admin edits (adding/updating/removing dishes) are saved to `localStorage` and dispatched via custom window events.
- A custom hook `useAdminModifications` subscribes to these events and instantly patches the base data returned by SWR.
- In a real backend scenario, SWR polling (`refreshInterval`) would be enabled on the admin dashboard to fetch live incoming orders. Currently, orders sync instantly across the same browser via Zustand.

## Previous Strategies
*(Consolidated from prior architecture notes)*
- **State Structure**: Local state is isolated to components; global state (cart/auth/admin) is managed strictly through Zustand slices to prevent unnecessary re-renders.
- **Boundaries**: Client boundaries (`'use client'`) are pushed as far down the tree as possible, though pages heavily reliant on GSAP animations require top-level client declarations.
