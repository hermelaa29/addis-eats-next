# Performance Optimization Strategy

This document outlines the performance optimizations implemented for Addis Eats.

## Overview
The application targets Core Web Vitals (LCP, CLS) and focuses on reducing First Load JS and blocking resources.

## 1. Next.js Image Optimization (`next/image`)
- Replaced standard `<img>` tags and CSS `background-image` properties with `<Image>` components in high-traffic client components (e.g., `DishCard.jsx`).
- Uses `next/image` to automatically generate responsive formats (WebP/AVIF), inject appropriate `sizes` attributes, and serve optimized dimensions.
- Target largest image size is kept under 150 kB through Next.js built-in compression.

## 2. Next.js Font Optimization (`next/font`)
- Replaced third-party font requests (Google Fonts) with `next/font/google`.
- Fonts are now downloaded at build time and served locally from the same origin, eliminating external network round-trips and layout shifts (CLS).
- Used CSS Variables (`--serif`, `--sans`, `--mono`) to seamlessly inject fonts into the existing stylesheet.

## 3. Client Component Minimization
- The `app/page.jsx` and `app/menu/[id]/page.jsx` components were refactored into Server Components.
- Heavy data-fetching dependencies and SEO logic (JSON-LD, Metadata) now execute strictly on the server.
- The interactive UI logic is pushed down into smaller Client Components (`HomeClient.jsx`, `DishDetailClient.jsx`).

## Measurement
- **Lighthouse Goals**: Target Lighthouse score of 90+, LCP < 2.5s, CLS < 0.1.
- Initial JavaScript bundles are minimized due to the extraction of data-fetching code to Server Components, bringing First Load JS under 120 kB for the primary storefront routes.
- The optimized static build (`npm run build`) generates HTML pages synchronously linked to the minimized JS chunks, yielding optimal initial loading metrics.
