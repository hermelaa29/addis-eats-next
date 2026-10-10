# Authentication & Security Strategy

This document outlines the authentication and security implementations for Addis Eats.

## Overview
Authentication is handled via Next.js Server Actions setting secure, HttpOnly cookies. This ensures that session state cannot be accessed by client-side JavaScript, mitigating XSS risks.

## Components

### 1. Server Actions (`app/actions/auth.js`)
- `loginAction`: Verifies credentials and sets `admin_session` or `user_session` as an HttpOnly, secure (in production), SameSite=Lax cookie.
- `logoutAction`: Clears the session cookie.
- `verifyAdminSession`: Called within sensitive server operations to validate the request context.

### 2. Route Protection (`middleware.js`)
- Next.js Edge Middleware intercepts requests to `/admin/*`.
- It acts as an early access filter. If the `admin_session` cookie is missing or invalid, the user is redirected to `/admin/login`.
- It preserves the intended destination via `returnTo` search parameters.

### 3. Client State (`store/adminAuthStore.js`)
- The UI maintains a synchronized copy of the auth state using Zustand.
- This allows client components to immediately reflect the logged-in state without a network round-trip, while relying on the server/middleware for actual authorization enforcement.

## Security Guarantees
- **No Open Redirects**: The `returnTo` parameter is validated against safe internal paths.
- **Defense in Depth**: Middleware provides early routing protection, but actual Server Actions enforce `verifyAdminSession` at execution time.
- **Cross-User Data Exposure**: While this mock uses a static `valid_admin` token, in a real application, the token would be a signed JWT tied to user-specific records.
